from __future__ import annotations

import unicodedata

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Arma, Delegacia, Departamento, Item, Lotacao, Movimento, Patrimonio, Policial


class Command(BaseCommand):
    help = "Preenche FKs relacionais a partir de campos legados de texto (depto, lotacao, patrimonio)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--apply",
            action="store_true",
            help="Aplica de fato as alteracoes. Sem essa flag, roda em dry-run.",
        )

    @staticmethod
    def _norm(value: str) -> str:
        text = (value or "").strip().lower()
        if not text:
            return ""
        text = unicodedata.normalize("NFKD", text)
        return "".join(char for char in text if not unicodedata.combining(char))

    def _get_or_create_departamento(self, nome, dept_cache, counters):
        chave = self._norm(nome)
        if not chave:
            return None
        if chave in dept_cache:
            return dept_cache[chave]
        dep = Departamento.objects.create(nome=nome.strip())
        dept_cache[chave] = dep
        counters["departamentos_criados"] += 1
        return dep

    def _get_or_create_delegacia(self, nome, departamento, cidade, deleg_cache, counters):
        chave_nome = self._norm(nome)
        if not chave_nome:
            return None
        dep_id = departamento.id if departamento else 0
        key = (dep_id, chave_nome)
        if key in deleg_cache:
            return deleg_cache[key]
        deleg = Delegacia.objects.create(
            nome=nome.strip(),
            cidade=(cidade or "").strip(),
            departamento=departamento,
        )
        deleg_cache[key] = deleg
        counters["delegacias_criadas"] += 1
        return deleg

    def _backfill_lotacoes(self, counters, dept_cache, deleg_cache):
        for lot in Lotacao.objects.select_related("departamento_ref", "delegacia_ref").all():
            alterou = False
            dep = lot.departamento_ref or self._get_or_create_departamento(lot.depto, dept_cache, counters)
            if dep and lot.departamento_ref_id != dep.id:
                lot.departamento_ref = dep
                alterou = True

            deleg = lot.delegacia_ref or self._get_or_create_delegacia(
                lot.nome, dep, lot.cidade, deleg_cache, counters
            )
            if deleg and lot.delegacia_ref_id != deleg.id:
                lot.delegacia_ref = deleg
                alterou = True

            if alterou:
                lot.save(update_fields=["departamento_ref", "delegacia_ref", "atualizado_em"])
                counters["lotacoes_atualizadas"] += 1

    def _backfill_policiais(self, counters, dept_cache, deleg_cache):
        for pol in Policial.objects.select_related("departamento_ref", "delegacia_ref").all():
            alterou = False
            dep = pol.departamento_ref or self._get_or_create_departamento(pol.depto, dept_cache, counters)
            if dep and pol.departamento_ref_id != dep.id:
                pol.departamento_ref = dep
                alterou = True

            deleg = pol.delegacia_ref
            if not deleg:
                deleg = self._get_or_create_delegacia(pol.lotacao, dep, "", deleg_cache, counters)
            if deleg and pol.delegacia_ref_id != deleg.id:
                pol.delegacia_ref = deleg
                alterou = True

            if alterou:
                pol.save(update_fields=["departamento_ref", "delegacia_ref", "atualizado_em"])
                counters["policiais_atualizados"] += 1

    def _ensure_patrimonio_for_item(self, item, counters):
        codigo_patrimonio = (item.patrimonio or "").strip()
        if not codigo_patrimonio:
            return None
        patrimonio, created = Patrimonio.objects.get_or_create(
            codigo=codigo_patrimonio,
            defaults={
                "descricao": item.descricao,
                "categoria": item.categoria,
            },
        )
        if created:
            counters["patrimonios_criados"] += 1
        return patrimonio

    def _upsert_arma_for_item(self, item, patrimonio, counters):
        arma, created = Arma.objects.get_or_create(
            item=item,
            defaults={
                "patrimonio": patrimonio,
                "marca": item.marca,
                "numero_serie": item.serie,
            },
        )
        if created:
            counters["armas_criadas"] += 1
            return

        alterou_arma = False
        if patrimonio and arma.patrimonio_id != patrimonio.id:
            arma.patrimonio = patrimonio
            alterou_arma = True
        if not arma.marca and item.marca:
            arma.marca = item.marca
            alterou_arma = True
        if not arma.numero_serie and item.serie:
            arma.numero_serie = item.serie
            alterou_arma = True
        if alterou_arma:
            arma.save(update_fields=["patrimonio", "marca", "numero_serie", "atualizado_em"])
            counters["armas_atualizadas"] += 1

    def _backfill_itens_armas_patrimonios(self, counters):
        for item in Item.objects.all():
            patrimonio = self._ensure_patrimonio_for_item(item, counters)
            categoria_norm = self._norm(item.categoria)
            if "arma" not in categoria_norm:
                continue

            self._upsert_arma_for_item(item, patrimonio, counters)

    @staticmethod
    def _resolve_movimento_patrimonio(mov, item):
        if mov.arma_id and mov.arma.patrimonio_id:
            return mov.arma.patrimonio
        if not item:
            return None
        arma_item = getattr(item, "arma_detalhe", None)
        if arma_item and arma_item.patrimonio_id:
            return arma_item.patrimonio
        return None

    def _enrich_movimento_from_item(self, mov, item):
        alterou = False
        if item and not mov.arma_id:
            arma_item = getattr(item, "arma_detalhe", None)
            if arma_item:
                mov.arma = arma_item
                alterou = True

        if not mov.patrimonio_ref_id:
            patrimonio_mov = self._resolve_movimento_patrimonio(mov, item)
            if patrimonio_mov:
                mov.patrimonio_ref = patrimonio_mov
                alterou = True
        return alterou

    @staticmethod
    def _enrich_movimento_from_policial(mov, pol):
        alterou = False
        if not pol:
            return alterou
        if not mov.departamento_ref_id and pol.departamento_ref_id:
            mov.departamento_ref = pol.departamento_ref
            alterou = True
        if not mov.delegacia_ref_id and pol.delegacia_ref_id:
            mov.delegacia_ref = pol.delegacia_ref
            alterou = True
        return alterou

    def _backfill_movimentos(self, counters):
        policiais_por_matricula = {
            p.matricula: p
            for p in Policial.objects.select_related("departamento_ref", "delegacia_ref").all()
            if p.matricula
        }

        for mov in Movimento.objects.select_related(
            "item", "arma", "patrimonio_ref", "departamento_ref", "delegacia_ref"
        ).all():
            alterou = False
            item = mov.item

            if self._enrich_movimento_from_item(mov, item):
                alterou = True

            pol = policiais_por_matricula.get((mov.matricula or "").strip())
            if self._enrich_movimento_from_policial(mov, pol):
                alterou = True

            if alterou:
                mov.save(
                    update_fields=[
                        "arma",
                        "patrimonio_ref",
                        "departamento_ref",
                        "delegacia_ref",
                        "atualizado_em",
                    ]
                )
                counters["movimentos_atualizados"] += 1

    def _print_summary(self, counters, dry_run):
        self.stdout.write("Resumo do backfill:")
        for chave, valor in counters.items():
            self.stdout.write(f"- {chave}: {valor}")

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry-run concluido. Rode com --apply para persistir."))
        else:
            self.stdout.write(self.style.SUCCESS("Backfill concluido com sucesso."))

    def handle(self, *args, **options):
        apply_changes = options["apply"]
        dry_run = not apply_changes

        self.stdout.write(self.style.WARNING("Modo dry-run: nenhuma alteracao sera persistida." if dry_run else "Aplicando alteracoes no banco."))

        counters = {
            "departamentos_criados": 0,
            "delegacias_criadas": 0,
            "patrimonios_criados": 0,
            "armas_criadas": 0,
            "lotacoes_atualizadas": 0,
            "policiais_atualizados": 0,
            "movimentos_atualizados": 0,
            "armas_atualizadas": 0,
        }

        with transaction.atomic():
            dept_cache = {}
            for dep in Departamento.objects.all():
                dept_cache[self._norm(dep.nome)] = dep

            deleg_cache = {}
            for d in Delegacia.objects.select_related("departamento").all():
                dep_id = d.departamento_id or 0
                deleg_cache[(dep_id, self._norm(d.nome))] = d

            self._backfill_lotacoes(counters, dept_cache, deleg_cache)
            self._backfill_policiais(counters, dept_cache, deleg_cache)
            self._backfill_itens_armas_patrimonios(counters)
            self._backfill_movimentos(counters)

            if dry_run:
                transaction.set_rollback(True)

        self._print_summary(counters, dry_run)

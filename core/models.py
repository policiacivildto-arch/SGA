import unicodedata

from django.db import models, transaction

ITEM_STATUS_DISPONIVEL = "Disponivel"
ITEM_STATUS_EM_CAUTELA = "Em Uso"
ITEM_STATUS_BAIXA_VALIDOS = {
    ITEM_STATUS_DISPONIVEL,
    ITEM_STATUS_EM_CAUTELA,
    "Apreendida",
    "Destruida",
    "Em Reparo",
    "Furtada",
    "Inservivel",
    "Perdida",
    "Recolhida",
    "Ressarcida",
    "Roubada",
}


class TimestampedModel(models.Model):
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Departamento(TimestampedModel):
    nome = models.CharField(max_length=180, unique=True)
    sigla = models.CharField(max_length=30, blank=True)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return self.sigla or self.nome


class Delegacia(TimestampedModel):
    nome = models.CharField(max_length=200)
    codigo = models.CharField(max_length=40, blank=True)
    cidade = models.CharField(max_length=120, blank=True)
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delegacias",
    )
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Lotacao(TimestampedModel):
    depto = models.CharField(max_length=120)
    nome = models.CharField(max_length=200)
    cidade = models.CharField(max_length=120)
    resp = models.CharField(max_length=180, blank=True)
    area_atuacao = models.CharField(max_length=255, blank=True)
    ais = models.CharField(max_length=40, blank=True)
    tel = models.CharField(max_length=40, blank=True)
    end = models.CharField(max_length=255, blank=True)
    departamento_ref = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lotacoes",
    )
    delegacia_ref = models.ForeignKey(
        Delegacia,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="lotacoes",
    )

    class Meta:
        ordering = ["depto", "nome"]

    def __str__(self):
        return f"{self.depto} - {self.nome}"


class Policial(TimestampedModel):
    matricula = models.CharField(max_length=40, unique=True)
    cpf = models.CharField(max_length=14, blank=True)
    nome = models.CharField(max_length=180)
    cargo = models.CharField(max_length=120, blank=True)
    depto = models.CharField(max_length=120)
    lotacao = models.CharField(max_length=200)
    tel = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    obs = models.TextField(blank=True)
    departamento_ref = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="policiais",
    )
    delegacia_ref = models.ForeignKey(
        Delegacia,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="policiais",
    )

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} ({self.matricula})"


class Fornecedor(TimestampedModel):
    nome = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=40, blank=True)
    contato = models.CharField(max_length=120, blank=True)
    tel = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    categoria = models.CharField(max_length=120, blank=True)
    end = models.CharField(max_length=255, blank=True)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Compra(TimestampedModel):
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="compras",
    )
    categoria = models.CharField(max_length=80)
    tipo = models.CharField(max_length=120, blank=True)
    calibre = models.CharField(max_length=60, blank=True)
    comprimento_cano = models.CharField(max_length=60, blank=True)
    quantidade_carregadores = models.PositiveIntegerField(default=0)
    capacidade = models.PositiveIntegerField(default=0)
    marca = models.CharField(max_length=120, blank=True)
    modelo = models.CharField(max_length=120, blank=True)
    nivel = models.CharField(max_length=40, blank=True)
    tamanho = models.CharField(max_length=40, blank=True)
    sexo = models.CharField(max_length=40, blank=True)
    cargo = models.CharField(max_length=120, blank=True)
    numero_nota_fiscal = models.CharField(max_length=80, blank=True)
    numero_empenho = models.CharField(max_length=80, blank=True)
    numero_tombo = models.CharField(max_length=80, blank=True)
    serie = models.CharField(max_length=120, blank=True)
    descricao = models.CharField(max_length=200)
    qtd_total = models.PositiveIntegerField(default=1)
    qtd_disp = models.PositiveIntegerField(default=1)
    qtd_min = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=40, default="Pendente")
    dt_aq = models.DateField(null=True, blank=True)
    valor_compra = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    dt_val = models.DateField(null=True, blank=True)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["-dt_aq", "-criado_em"]

    def __str__(self):
        return self.descricao


class Item(TimestampedModel):
    patrimonio = models.CharField(max_length=60, blank=True)
    descricao = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80)
    tamanho = models.CharField(max_length=40, blank=True)
    sexo = models.CharField(max_length=40, blank=True)
    cargo = models.CharField(max_length=120, blank=True)
    marca = models.CharField(max_length=120, blank=True)
    serie = models.CharField(max_length=120, blank=True)
    qtd_total = models.PositiveIntegerField(default=1)
    qtd_disp = models.PositiveIntegerField(default=1)
    qtd_min = models.PositiveIntegerField(default=1)
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="itens",
    )
    dt_aq = models.DateField(null=True, blank=True)
    dt_val = models.DateField(null=True, blank=True)
    valor_compra = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=40, default=ITEM_STATUS_DISPONIVEL)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["descricao"]

    def __str__(self):
        return self.descricao


class Patrimonio(TimestampedModel):
    codigo = models.CharField(max_length=80, unique=True)
    descricao = models.CharField(max_length=200, blank=True)
    categoria = models.CharField(max_length=80, blank=True)
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patrimonios",
    )
    delegacia = models.ForeignKey(
        Delegacia,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patrimonios",
    )
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ["codigo"]

    def __str__(self):
        return self.codigo


class UsuarioSistema(TimestampedModel):
    username = models.CharField(max_length=80, unique=True)
    nome = models.CharField(max_length=180)
    cargo = models.CharField(max_length=120, blank=True)
    policial = models.ForeignKey(
        Policial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios_sistema",
    )
    departamento = models.ForeignKey(
        Departamento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios",
    )
    delegacia = models.ForeignKey(
        Delegacia,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="usuarios",
    )
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Arma(TimestampedModel):
    item = models.OneToOneField(Item, on_delete=models.CASCADE, related_name="arma_detalhe")
    patrimonio = models.ForeignKey(
        Patrimonio,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="armas",
    )
    tipo = models.CharField(max_length=120, blank=True)
    marca = models.CharField(max_length=120, blank=True)
    modelo = models.CharField(max_length=120, blank=True)
    calibre = models.CharField(max_length=60, blank=True)
    comprimento_cano = models.CharField(max_length=60, blank=True)
    quantidade_carregadores = models.PositiveIntegerField(default=0)
    capacidade = models.PositiveIntegerField(default=0)
    numero_serie = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["marca", "modelo", "numero_serie"]

    def __str__(self):
        return f"{self.marca} {self.modelo}".strip() or self.item.descricao


class Servico(TimestampedModel):
    codigo = models.CharField(max_length=20, unique=True)
    tipo = models.CharField(max_length=120)
    armeiro = models.CharField(max_length=120)
    data_rec = models.DateField()
    data_dev = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=60)
    motivo = models.CharField(max_length=180, blank=True)    
    policial = models.ForeignKey(
        Policial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="servicos",
    )
    # Campos denormalizados para manter o histórico caso o policial seja alterado/removido
    matricula = models.CharField(max_length=40, blank=True)
    policial_nome = models.CharField(max_length=180, blank=True)
    depto = models.CharField(max_length=120, blank=True)
    lotacao = models.CharField(max_length=200, blank=True)
    modelo = models.CharField(max_length=120)
    serie = models.CharField(max_length=120)
    descricao = models.TextField(blank=True)
    pecas = models.TextField(blank=True)

    class Meta:
        ordering = ["-data_rec", "-criado_em"]    

    def __str__(self):
        return self.codigo

    @classmethod
    def get_next_code(cls):
        last = cls.objects.order_by("-codigo").first()
        next_num = 1
        if last and str(last.codigo).isdigit():
            next_num = int(last.codigo) + 1
        return str(next_num).zfill(4)

class Cautela(TimestampedModel):
    # Constantes para status
    STATUS_ATIVA = "Ativa"
    STATUS_DEVOLVIDO = "Devolvido"

    numero = models.CharField(max_length=30, unique=True)
    data_saida = models.DateField()
    data_prev = models.DateField(null=True, blank=True)
    data_dev = models.DateField(null=True, blank=True)
    policial = models.ForeignKey(
        Policial,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="cautelas",
    )
    # Campos denormalizados para manter o histórico
    matricula = models.CharField(max_length=40, blank=True)
    policial_nome = models.CharField(max_length=180, blank=True)
    depto = models.CharField(max_length=120, blank=True)
    lotacao = models.CharField(max_length=200, blank=True)

    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name="cautelas")

    # Campos denormalizados do item
    item_desc = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80)
    serie = models.CharField(max_length=120, blank=True)
    qtd = models.PositiveIntegerField(default=1)
    obs = models.TextField(blank=True)
    status = models.CharField(max_length=40, default="Ativa")
    condicao_dev = models.CharField(max_length=80, blank=True)
    motivo_recolhimento = models.CharField(max_length=180, blank=True)
    nup = models.CharField(max_length=80, blank=True)
    numero_io_bo = models.CharField(max_length=80, blank=True)
    obs_dev = models.TextField(blank=True)

    class Meta:
        ordering = ["-data_saida", "-criado_em"]

    def __str__(self):
        return self.numero

    @staticmethod
    def _normalize_text(value):
        text = (value or "").strip().lower()
        if not text:
            return ""
        text = unicodedata.normalize("NFKD", text)
        return "".join(ch for ch in text if not unicodedata.combining(ch))

    @classmethod
    def _requires_policial(cls, item):
        categoria_norm = cls._normalize_text(getattr(item, "categoria", ""))
        if categoria_norm != "armas":
            return True

        arma_detalhe = getattr(item, "arma_detalhe", None)
        tipo_norm = cls._normalize_text(getattr(arma_detalhe, "tipo", ""))
        if not tipo_norm:
            descricao_norm = cls._normalize_text(getattr(item, "descricao", ""))
            if "pistola" in descricao_norm or "revolver" in descricao_norm:
                return True
        return tipo_norm in {"pistola", "revolver"}

    @staticmethod
    def _resolve_lotacao_refs(depto, lotacao):
        depto_norm = (depto or "").strip()
        lotacao_norm = (lotacao or "").strip()
        if not depto_norm or not lotacao_norm:
            return None, None

        lotacao_obj = (
            Lotacao.objects.select_related("departamento_ref", "delegacia_ref")
            .filter(depto__iexact=depto_norm, nome__iexact=lotacao_norm)
            .first()
        )
        if not lotacao_obj:
            return None, None

        return lotacao_obj.departamento_ref, lotacao_obj.delegacia_ref

    @staticmethod
    def _sync_policial_lotacao(policial_obj, depto_informado, lotacao_informada):
        if not depto_informado or not lotacao_informada:
            return

        if policial_obj.depto == depto_informado and policial_obj.lotacao == lotacao_informada:
            return

        policial_obj.depto = depto_informado
        policial_obj.lotacao = lotacao_informada
        policial_obj.save(update_fields=["depto", "lotacao", "atualizado_em"])

    @classmethod
    def _prepare_vinculo_data(cls, data, policial_obj, requires_policial, depto_informado, lotacao_informada):
        if requires_policial:
            cls._sync_policial_lotacao(policial_obj, depto_informado, lotacao_informada)
            data["matricula"] = policial_obj.matricula
            data["policial_nome"] = policial_obj.nome
            data["depto"] = depto_informado or policial_obj.depto
            data["lotacao"] = lotacao_informada or policial_obj.lotacao
            return policial_obj.departamento_ref, policial_obj.delegacia_ref

        depto_final = depto_informado or (policial_obj.depto if policial_obj else "")
        lotacao_final = lotacao_informada or (policial_obj.lotacao if policial_obj else "")
        if not lotacao_final:
            raise ValueError("Lotacao e obrigatoria para cautela de armas por unidade.")

        data["policial"] = None
        data["matricula"] = ""
        data["policial_nome"] = f"UNIDADE: {lotacao_final}"
        data["depto"] = depto_final
        data["lotacao"] = lotacao_final
        return cls._resolve_lotacao_refs(depto_final, lotacao_final)


    @classmethod
    @transaction.atomic
    def registrar_cautela(cls, **data):
        item = data["item"]
        policial_obj = data.get("policial")
        requires_policial = cls._requires_policial(item)
        if requires_policial and not policial_obj:
            raise ValueError("Policial e obrigatorio para registrar a cautela.")

        qtd = data.get("qtd", 1)
        depto_informado = (data.get("depto") or "").strip()
        lotacao_informada = (data.get("lotacao") or "").strip()

        if qtd > item.qtd_disp:
            raise ValueError("Quantidade maior que o estoque disponível.")

        departamento_ref, delegacia_ref = cls._prepare_vinculo_data(
            data=data,
            policial_obj=policial_obj,
            requires_policial=requires_policial,
            depto_informado=depto_informado,
            lotacao_informada=lotacao_informada,
        )

        # Popula campos denormalizados a partir do item, se não forem providos
        data["item_desc"] = data.get("item_desc") or item.descricao
        data["categoria"] = data.get("categoria") or item.categoria
        data["serie"] = data.get("serie") or item.serie or item.patrimonio

        cautela = cls.objects.create(**data)

        # Atualiza o item
        item.qtd_disp -= cautela.qtd
        item.status = ITEM_STATUS_EM_CAUTELA
        item.save(update_fields=["qtd_disp", "status", "atualizado_em"])

        # Cria o movimento
        Movimento.objects.create(
            data=cautela.data_saida,
            tipo="Saida (Cautela)",
            item=item,
            arma=getattr(item, "arma_detalhe", None),
            patrimonio_ref=(getattr(item, "arma_detalhe", None).patrimonio if getattr(item, "arma_detalhe", None) else None),
            departamento_ref=departamento_ref,
            delegacia_ref=delegacia_ref,
            item_desc=cautela.item_desc,
            categoria=cautela.categoria,
            qtd=cautela.qtd,
            serie=cautela.serie,
            policial=cautela.policial_nome,
            matricula=cautela.matricula,
            lotacao=cautela.lotacao,
            num_cautela=cautela.numero,
            obs=cautela.obs,
        )
        return cautela

    def _resolver_status_baixa(self, condicao_dev, status_item, has_outra_cautela_ativa):
        if has_outra_cautela_ativa:
            return ITEM_STATUS_EM_CAUTELA

        status_informado = str(status_item or "").strip()
        if status_informado in ITEM_STATUS_BAIXA_VALIDOS:
            return status_informado

        motivo = str(condicao_dev or "").strip()
        if motivo in ITEM_STATUS_BAIXA_VALIDOS:
            return motivo

        motivo_norm = self._normalize_text(motivo)
        if motivo_norm in {"devolvido", "devolvida", "disponivel"}:
            return ITEM_STATUS_DISPONIVEL

        return ITEM_STATUS_DISPONIVEL

    @staticmethod
    def _normalize_serie(value):
        return str(value or "").replace(" ", "").upper()

    @classmethod
    def _validar_dados_baixa(cls, item, condicao_dev, motivo_recolhimento, nup, numero_io_bo, numero_serie_reparo):
        motivo = str(condicao_dev or "").strip()
        motivo_norm = cls._normalize_text(motivo)

        if motivo_norm == "recolhida" and not str(motivo_recolhimento or "").strip():
            raise ValueError("Informe o motivo quando a baixa for Recolhida.")

        if motivo_norm == "recolhida" and not str(nup or "").strip():
            raise ValueError("NUP e obrigatorio quando a baixa for Recolhida.")

        if motivo_norm == "apreendida" and not str(numero_io_bo or "").strip():
            raise ValueError("Numero do IO ou BO e obrigatorio para baixa por Apreendida.")

        if motivo_norm != "em reparo":
            return

        serie_item = cls._normalize_serie(getattr(item, "serie", ""))
        serie_informada = cls._normalize_serie(numero_serie_reparo)
        serie_final = serie_informada or serie_item

        if not serie_final:
            raise ValueError("Numero de serie e obrigatorio para baixa em reparo.")

        if not Servico.objects.filter(serie__iexact=serie_final).exists():
            raise ValueError(
                "Para baixa em reparo, cadastre primeiro um novo servico para este numero de serie."
            )

    @transaction.atomic
    def devolver_cautela(
        self,
        data_dev,
        condicao_dev,
        obs_dev,
        status_item=None,
        motivo_recolhimento="",
        nup="",
        numero_io_bo="",
        numero_serie_reparo="",
    ):
        if self.status != self.STATUS_ATIVA:
            raise ValueError("Apenas cautelas ativas podem ser devolvidas.")

        self._validar_dados_baixa(
            item=self.item,
            condicao_dev=condicao_dev,
            motivo_recolhimento=motivo_recolhimento,
            nup=nup,
            numero_io_bo=numero_io_bo,
            numero_serie_reparo=numero_serie_reparo,
        )

        # Atualiza o item
        item = self.item
        item.qtd_disp += self.qtd
        has_outra_cautela_ativa = item.cautelas.filter(status=self.STATUS_ATIVA).exclude(pk=self.pk).exists()
        item.status = self._resolver_status_baixa(condicao_dev, status_item, has_outra_cautela_ativa)
        item.save(update_fields=["qtd_disp", "status", "atualizado_em"])

        # Atualiza a cautela
        self.data_dev = data_dev
        self.status = self.STATUS_DEVOLVIDO
        self.condicao_dev = condicao_dev
        self.motivo_recolhimento = str(motivo_recolhimento or "").strip()
        self.nup = str(nup or "").strip()
        self.numero_io_bo = str(numero_io_bo or "").strip()
        self.obs_dev = obs_dev
        self.save(
            update_fields=[
                "data_dev",
                "status",
                "condicao_dev",
                "motivo_recolhimento",
                "nup",
                "numero_io_bo",
                "obs_dev",
                "atualizado_em",
            ]
        )

        # Cria o movimento de devolução
        departamento_ref = self.policial.departamento_ref if self.policial else None
        delegacia_ref = self.policial.delegacia_ref if self.policial else None
        if not departamento_ref and not delegacia_ref:
            departamento_ref, delegacia_ref = self._resolve_lotacao_refs(self.depto, self.lotacao)

        Movimento.objects.create(
            data=data_dev, tipo="Entrada (Devolucao)", item=item,
            arma=getattr(item, "arma_detalhe", None),
            patrimonio_ref=(getattr(item, "arma_detalhe", None).patrimonio if getattr(item, "arma_detalhe", None) else None),
            departamento_ref=departamento_ref,
            delegacia_ref=delegacia_ref,
            item_desc=self.item_desc,
            categoria=self.categoria, qtd=self.qtd, serie=self.serie, policial=self.policial_nome,
            matricula=self.matricula, lotacao=self.lotacao, num_cautela=self.numero, obs=obs_dev,
        )

    @transaction.atomic
    def cancelar_cautela(self):
        if self.status == self.STATUS_ATIVA:
            self.item.qtd_disp += self.qtd
            has_outra_cautela_ativa = self.item.cautelas.filter(status=self.STATUS_ATIVA).exclude(pk=self.pk).exists()
            if not has_outra_cautela_ativa:
                self.item.status = ITEM_STATUS_DISPONIVEL
            else:
                self.item.status = ITEM_STATUS_EM_CAUTELA
            self.item.save(update_fields=["qtd_disp", "status", "atualizado_em"])
        self.delete()

class Movimento(TimestampedModel):
    data = models.DateField()
    tipo = models.CharField(max_length=80)
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    arma = models.ForeignKey("Arma", on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    patrimonio_ref = models.ForeignKey("Patrimonio", on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    departamento_ref = models.ForeignKey("Departamento", on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    delegacia_ref = models.ForeignKey("Delegacia", on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    usuario_ref = models.ForeignKey("UsuarioSistema", on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    item_desc = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80)
    qtd = models.PositiveIntegerField(default=1)
    serie = models.CharField(max_length=120, blank=True)
    policial = models.CharField(max_length=180, blank=True)
    matricula = models.CharField(max_length=40, blank=True)
    lotacao = models.CharField(max_length=200, blank=True)
    num_cautela = models.CharField(max_length=30, blank=True)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["-data", "-criado_em"]

    def __str__(self):
        return f"{self.tipo} - {self.item_desc}"


class OpcaoMenu(TimestampedModel):
    grupo = models.CharField(max_length=120)
    valor = models.CharField(max_length=120)
    rotulo = models.CharField(max_length=180)
    ordem = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ["grupo", "ordem", "rotulo"]
        constraints = [
            models.UniqueConstraint(fields=["grupo", "valor"], name="uq_opcaomenu_grupo_valor"),
        ]

    def __str__(self):
        return f"{self.grupo}: {self.rotulo}"

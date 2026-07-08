from django.db import migrations, models
import django.db.models.deletion


def backfill_policial_fk(apps, schema_editor):
    policial_model = apps.get_model("core", "Policial")
    servico_model = apps.get_model("core", "Servico")
    cautela_model = apps.get_model("core", "Cautela")

    policiais_by_matricula = {p.matricula: p.id for p in policial_model.objects.all() if p.matricula}

    for servico in servico_model.objects.all():
        if servico.policial_id:
            continue
        policial_id = policiais_by_matricula.get(servico.matricula)
        if not policial_id:
            continue
        servico.policial_id = policial_id
        servico.save(update_fields=["policial"])

    for cautela in cautela_model.objects.all():
        if cautela.policial_id:
            continue
        policial_id = policiais_by_matricula.get(cautela.matricula)
        if not policial_id:
            continue
        cautela.policial_id = policial_id
        cautela.save(update_fields=["policial"])


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_relational_structure"),
    ]

    operations = [
        migrations.RenameField(
            model_name="servico",
            old_name="policial",
            new_name="policial_nome",
        ),
        migrations.RenameField(
            model_name="cautela",
            old_name="policial",
            new_name="policial_nome",
        ),
        migrations.AddField(
            model_name="servico",
            name="policial",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="servicos",
                to="core.policial",
            ),
        ),
        migrations.AddField(
            model_name="cautela",
            name="policial",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="cautelas",
                to="core.policial",
            ),
        ),
        migrations.RunPython(backfill_policial_fk, migrations.RunPython.noop),
    ]

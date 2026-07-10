from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0006_arma_capacidade_arma_comprimento_cano_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="item",
            name="cargo",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="item",
            name="sexo",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="item",
            name="tamanho",
            field=models.CharField(blank=True, max_length=40),
        ),
    ]

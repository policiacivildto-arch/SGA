from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0008_cautela_campos_baixa"),
    ]

    operations = [
        migrations.AddField(
            model_name="compra",
            name="numero_empenho",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="compra",
            name="numero_nota_fiscal",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="compra",
            name="numero_tombo",
            field=models.CharField(blank=True, max_length=80),
        ),
    ]

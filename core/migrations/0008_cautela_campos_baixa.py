from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0007_item_sexo_tamanho_cargo"),
    ]

    operations = [
        migrations.AddField(
            model_name="cautela",
            name="motivo_recolhimento",
            field=models.CharField(blank=True, max_length=180),
        ),
        migrations.AddField(
            model_name="cautela",
            name="nup",
            field=models.CharField(blank=True, max_length=80),
        ),
        migrations.AddField(
            model_name="cautela",
            name="numero_io_bo",
            field=models.CharField(blank=True, max_length=80),
        ),
    ]

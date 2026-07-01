from django.db import migrations, models
import django.db.models.deletion


CORE_DEPARTAMENTO = "core.departamento"
CORE_DELEGACIA = "core.delegacia"


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_item_valor_compra"),
    ]

    operations = [
        migrations.CreateModel(
            name="Departamento",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("atualizado_em", models.DateTimeField(auto_now=True)),
                ("nome", models.CharField(max_length=180, unique=True)),
                ("sigla", models.CharField(blank=True, max_length=30)),
                ("ativo", models.BooleanField(default=True)),
            ],
            options={"ordering": ["nome"]},
        ),
        migrations.CreateModel(
            name="Delegacia",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("atualizado_em", models.DateTimeField(auto_now=True)),
                ("nome", models.CharField(max_length=200)),
                ("codigo", models.CharField(blank=True, max_length=40)),
                ("cidade", models.CharField(blank=True, max_length=120)),
                ("ativo", models.BooleanField(default=True)),
                (
                    "departamento",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="delegacias",
                        to=CORE_DEPARTAMENTO,
                    ),
                ),
            ],
            options={"ordering": ["nome"]},
        ),
        migrations.CreateModel(
            name="Patrimonio",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("atualizado_em", models.DateTimeField(auto_now=True)),
                ("codigo", models.CharField(max_length=80, unique=True)),
                ("descricao", models.CharField(blank=True, max_length=200)),
                ("categoria", models.CharField(blank=True, max_length=80)),
                ("ativo", models.BooleanField(default=True)),
                (
                    "delegacia",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="patrimonios",
                        to=CORE_DELEGACIA,
                    ),
                ),
                (
                    "departamento",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="patrimonios",
                        to=CORE_DEPARTAMENTO,
                    ),
                ),
            ],
            options={"ordering": ["codigo"]},
        ),
        migrations.CreateModel(
            name="UsuarioSistema",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("atualizado_em", models.DateTimeField(auto_now=True)),
                ("username", models.CharField(max_length=80, unique=True)),
                ("nome", models.CharField(max_length=180)),
                ("cargo", models.CharField(blank=True, max_length=120)),
                ("ativo", models.BooleanField(default=True)),
                (
                    "delegacia",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="usuarios",
                        to=CORE_DELEGACIA,
                    ),
                ),
                (
                    "departamento",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="usuarios",
                        to=CORE_DEPARTAMENTO,
                    ),
                ),
                (
                    "policial",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="usuarios_sistema",
                        to="core.policial",
                    ),
                ),
            ],
            options={"ordering": ["nome"]},
        ),
        migrations.CreateModel(
            name="Arma",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("criado_em", models.DateTimeField(auto_now_add=True)),
                ("atualizado_em", models.DateTimeField(auto_now=True)),
                ("tipo", models.CharField(blank=True, max_length=120)),
                ("marca", models.CharField(blank=True, max_length=120)),
                ("modelo", models.CharField(blank=True, max_length=120)),
                ("calibre", models.CharField(blank=True, max_length=60)),
                ("numero_serie", models.CharField(blank=True, max_length=120)),
                (
                    "item",
                    models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="arma_detalhe", to="core.item"),
                ),
                (
                    "patrimonio",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="armas",
                        to="core.patrimonio",
                    ),
                ),
            ],
            options={"ordering": ["marca", "modelo", "numero_serie"]},
        ),
        migrations.AddField(
            model_name="lotacao",
            name="departamento_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="lotacoes", to=CORE_DEPARTAMENTO),
        ),
        migrations.AddField(
            model_name="lotacao",
            name="delegacia_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="lotacoes", to=CORE_DELEGACIA),
        ),
        migrations.AddField(
            model_name="policial",
            name="departamento_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="policiais", to=CORE_DEPARTAMENTO),
        ),
        migrations.AddField(
            model_name="policial",
            name="delegacia_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="policiais", to=CORE_DELEGACIA),
        ),
        migrations.AddField(
            model_name="movimento",
            name="arma",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="movimentos", to="core.arma"),
        ),
        migrations.AddField(
            model_name="movimento",
            name="patrimonio_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="movimentos", to="core.patrimonio"),
        ),
        migrations.AddField(
            model_name="movimento",
            name="departamento_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="movimentos", to=CORE_DEPARTAMENTO),
        ),
        migrations.AddField(
            model_name="movimento",
            name="delegacia_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="movimentos", to=CORE_DELEGACIA),
        ),
        migrations.AddField(
            model_name="movimento",
            name="usuario_ref",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="movimentos", to="core.usuariosistema"),
        ),
    ]

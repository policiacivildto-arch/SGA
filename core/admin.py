from io import StringIO

from django.contrib import admin, messages
from django.core.management import call_command

from .models import (
	Arma,
	Cautela,
	Delegacia,
	Departamento,
	Fornecedor,
	Item,
	Lotacao,
	Movimento,
	OpcaoMenu,
	Patrimonio,
	Policial,
	Servico,
	UsuarioSistema,
)


@admin.action(description="Executar backfill relacional (apply)")
def executar_backfill_relacional(modeladmin, request, queryset):
	del queryset
	output = StringIO()
	call_command("backfill_relational_refs", "--apply", stdout=output)
	modeladmin.message_user(request, "Backfill executado com sucesso.", level=messages.SUCCESS)
	modeladmin.message_user(request, output.getvalue(), level=messages.INFO)


@admin.register(OpcaoMenu)
class OpcaoMenuAdmin(admin.ModelAdmin):
	list_display = ("grupo", "valor", "rotulo", "ordem", "ativo")
	list_filter = ("grupo", "ativo")
	search_fields = ("grupo", "valor", "rotulo")
	actions = [executar_backfill_relacional]


admin.site.register(Lotacao)
admin.site.register(Policial)
admin.site.register(Fornecedor)
admin.site.register(Item)
admin.site.register(Servico)
admin.site.register(Cautela)
admin.site.register(Movimento)
admin.site.register(Departamento)
admin.site.register(Delegacia)
admin.site.register(UsuarioSistema)
admin.site.register(Patrimonio)
admin.site.register(Arma)

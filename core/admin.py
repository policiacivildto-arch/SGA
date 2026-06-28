from django.contrib import admin

from .models import Cautela, Fornecedor, Item, Lotacao, Movimento, OpcaoMenu, Policial, Servico

admin.site.register(Lotacao)
admin.site.register(Policial)
admin.site.register(Fornecedor)
admin.site.register(Item)
admin.site.register(Servico)
admin.site.register(Cautela)
admin.site.register(Movimento)
admin.site.register(OpcaoMenu)

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CautelaViewSet,
    FornecedorViewSet,
    ItemViewSet,
    LotacaoViewSet,
    MovimentoViewSet,
    OpcaoMenuViewSet,
    PolicialViewSet,
    ServicoViewSet,
)

router = DefaultRouter()
router.register("lotacoes", LotacaoViewSet, basename="lotacoes")
router.register("policiais", PolicialViewSet, basename="policiais")
router.register("fornecedores", FornecedorViewSet, basename="fornecedores")
router.register("itens", ItemViewSet, basename="itens")
router.register("servicos", ServicoViewSet, basename="servicos")
router.register("cautelas", CautelaViewSet, basename="cautelas")
router.register("movimentos", MovimentoViewSet, basename="movimentos")
router.register("opcoes-menu", OpcaoMenuViewSet, basename="opcoes-menu")

urlpatterns = [
    path("", include(router.urls)),
]

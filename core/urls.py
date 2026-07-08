from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ArmaViewSet,
    BackfillRelationalRefsView,
    DashboardEstoqueResumoView,
    CautelaViewSet,
    CompraViewSet,
    DelegaciaViewSet,
    DepartamentoViewSet,
    FornecedorViewSet,
    ItemViewSet,
    LotacaoViewSet,
    MovimentoViewSet,
    OpcaoMenuViewSet,
    PatrimonioViewSet,
    PolicialViewSet,
    ServicoViewSet,
    UsuarioSistemaViewSet,
)

router = DefaultRouter()
router.register("departamentos", DepartamentoViewSet, basename="departamentos")
router.register("delegacias", DelegaciaViewSet, basename="delegacias")
router.register("usuarios", UsuarioSistemaViewSet, basename="usuarios")
router.register("lotacoes", LotacaoViewSet, basename="lotacoes")
router.register("policiais", PolicialViewSet, basename="policiais")
router.register("fornecedores", FornecedorViewSet, basename="fornecedores")
router.register("compras", CompraViewSet, basename="compras")
router.register("itens", ItemViewSet, basename="itens")
router.register("armas", ArmaViewSet, basename="armas")
router.register("patrimonios", PatrimonioViewSet, basename="patrimonios")
router.register("servicos", ServicoViewSet, basename="servicos")
router.register("cautelas", CautelaViewSet, basename="cautelas")
router.register("movimentos", MovimentoViewSet, basename="movimentos")
router.register("opcoes-menu", OpcaoMenuViewSet, basename="opcoes-menu")

urlpatterns = [
    path("dashboard/estoque/", DashboardEstoqueResumoView.as_view(), name="dashboard-estoque"),
    path("admin/backfill-relacional/", BackfillRelationalRefsView.as_view(), name="backfill-relacional"),
    path("", include(router.urls)),
]

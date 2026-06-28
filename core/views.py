from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Cautela, Fornecedor, Item, Lotacao, Movimento, OpcaoMenu, Policial, Servico
from .serializers import (
    CautelaSerializer,
    FornecedorSerializer,
    ItemSerializer,
    LotacaoSerializer,
    MovimentoSerializer,
    OpcaoMenuSerializer,
    PolicialSerializer,
    ServicoSerializer,
)


class BaseViewSet(viewsets.ModelViewSet):
    filter_map = {}

    def get_queryset(self):
        qs = super().get_queryset()
        for query_param, model_field in self.filter_map.items():
            value = self.request.query_params.get(query_param)
            if value:
                qs = qs.filter(**{model_field: value})
        return qs


class LotacaoViewSet(BaseViewSet):
    queryset = Lotacao.objects.all()
    serializer_class = LotacaoSerializer
    search_fields = ["depto", "nome", "cidade", "resp"]
    ordering_fields = ["depto", "nome", "cidade", "criado_em"]
    filter_map = {"depto": "depto"}


class PolicialViewSet(BaseViewSet):
    queryset = Policial.objects.all()
    serializer_class = PolicialSerializer
    search_fields = ["matricula", "nome", "cargo", "depto", "lotacao"]
    ordering_fields = ["matricula", "nome", "depto", "lotacao", "criado_em"]
    filter_map = {"depto": "depto", "lotacao": "lotacao"}


class FornecedorViewSet(BaseViewSet):
    queryset = Fornecedor.objects.all()
    serializer_class = FornecedorSerializer
    search_fields = ["nome", "cnpj", "contato", "categoria"]
    ordering_fields = ["nome", "categoria", "criado_em"]


class ItemViewSet(BaseViewSet):
    queryset = Item.objects.select_related("fornecedor").all()
    serializer_class = ItemSerializer
    search_fields = ["patrimonio", "descricao", "categoria", "marca", "serie", "status"]
    ordering_fields = ["descricao", "categoria", "qtd_total", "qtd_disp", "criado_em"]
    filter_map = {"categoria": "categoria", "status": "status"}


class ServicoViewSet(BaseViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    search_fields = [
        "codigo",
        "tipo",
        "armeiro",
        "status",
        "matricula",
        "policial_nome",
        "depto",
        "lotacao",
        "modelo",
        "serie",
    ]
    ordering_fields = ["codigo", "data_rec", "status", "criado_em"]
    filter_map = {"status": "status", "tipo": "tipo", "armeiro": "armeiro"}

    @action(detail=False, methods=["get"], url_path="next-code")
    def next_code(self, request):
        # A lógica foi movida para um método de classe no modelo
        return Response({"codigo": Servico.get_next_code()})

    def perform_create(self, serializer):
        policial = serializer.validated_data.get("policial")
        if policial:
            serializer.save(
                matricula=policial.matricula,
                policial_nome=policial.nome,
                depto=policial.depto,
                lotacao=policial.lotacao,
            )
        else:
            serializer.save()

class CautelaViewSet(BaseViewSet):
    queryset = Cautela.objects.select_related("item").all()
    serializer_class = CautelaSerializer
    search_fields = [
        "numero",
        "matricula",
        "policial",
        "depto",
        "lotacao",
        "item_desc",
        "serie",
        "status",
    ]
    ordering_fields = ["numero", "data_saida", "status", "criado_em"]
    filter_map = {"status": "status", "categoria": "categoria", "lotacao": "lotacao"}

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            # A lógica de criação foi movida para um método de classe no modelo
            cautela = Cautela.registrar_cautela(**serializer.validated_data)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        # Retorna a cautela criada e serializada
        response_serializer = self.get_serializer(cautela)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # A lógica de cancelamento foi movida para um método de instância no modelo
        instance.cancelar_cautela()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], url_path="next-number")
    def next_number(self, request):
        from datetime import datetime

        year = str(datetime.now().year)
        last = Cautela.objects.filter(numero__startswith=f"CAU-{year}-").order_by("-numero").first()
        next_num = 1
        if last:
            try:
                next_num = int(last.numero.split("-")[-1]) + 1
            except (ValueError, IndexError):
                next_num = 1
        return Response({"numero": f"CAU-{year}-{str(next_num).zfill(4)}"})

    @action(detail=True, methods=["post"], url_path="devolver")
    def devolver(self, request, pk=None):
        cautela = self.get_object()
        data_dev = request.data.get("data_dev")
        condicao_dev = request.data.get("condicao_dev", "")
        obs_dev = request.data.get("obs_dev", "")

        if not data_dev:
            return Response({"detail": "data_dev e obrigatorio."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # A lógica de devolução foi movida para um método de instância no modelo
            cautela.devolver_cautela(
                data_dev=data_dev,
                condicao_dev=condicao_dev,
                obs_dev=obs_dev,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.get_serializer(cautela).data)


class MovimentoViewSet(BaseViewSet):
    queryset = Movimento.objects.select_related("item").all()
    serializer_class = MovimentoSerializer
    search_fields = [
        "tipo",
        "item_desc",
        "categoria",
        "serie",
        "policial",
        "matricula",
        "lotacao",
        "num_cautela",
        "obs",
    ]
    ordering_fields = ["data", "tipo", "criado_em"]
    filter_map = {"tipo": "tipo", "categoria": "categoria", "lotacao": "lotacao"}


class OpcaoMenuViewSet(BaseViewSet):
    queryset = OpcaoMenu.objects.all()
    serializer_class = OpcaoMenuSerializer
    search_fields = ["grupo", "valor", "rotulo"]
    ordering_fields = ["grupo", "ordem", "rotulo", "criado_em"]
    filter_map = {"ativo": "ativo"}

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("grupo"):
            grupos = self.request.query_params.get("grupo").split(",")
            qs = qs.filter(grupo__in=grupos)
        return qs

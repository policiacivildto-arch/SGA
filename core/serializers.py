from rest_framework import serializers

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

SRC_DEPARTAMENTO_NOME = "departamento.nome"
SRC_DELEGACIA_NOME = "delegacia.nome"
SRC_POLICIAL_NOME = "policial.nome"
SRC_ITEM_DESCRICAO = "item.descricao"
SRC_PATRIMONIO_CODIGO = "patrimonio.codigo"


class DepartamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Departamento
        fields = "__all__"


class DelegaciaSerializer(serializers.ModelSerializer):
    departamento_nome = serializers.CharField(source=SRC_DEPARTAMENTO_NOME, read_only=True)

    class Meta:
        model = Delegacia
        fields = "__all__"


class UsuarioSistemaSerializer(serializers.ModelSerializer):
    policial_nome = serializers.CharField(source=SRC_POLICIAL_NOME, read_only=True)
    departamento_nome = serializers.CharField(source=SRC_DEPARTAMENTO_NOME, read_only=True)
    delegacia_nome = serializers.CharField(source=SRC_DELEGACIA_NOME, read_only=True)

    class Meta:
        model = UsuarioSistema
        fields = "__all__"


class PatrimonioSerializer(serializers.ModelSerializer):
    departamento_nome = serializers.CharField(source=SRC_DEPARTAMENTO_NOME, read_only=True)
    delegacia_nome = serializers.CharField(source=SRC_DELEGACIA_NOME, read_only=True)

    class Meta:
        model = Patrimonio
        fields = "__all__"


class ArmaSerializer(serializers.ModelSerializer):
    item_descricao = serializers.CharField(source=SRC_ITEM_DESCRICAO, read_only=True)
    patrimonio_codigo = serializers.CharField(source=SRC_PATRIMONIO_CODIGO, read_only=True)

    class Meta:
        model = Arma
        fields = "__all__"


class LotacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lotacao
        fields = "__all__"


class PolicialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Policial
        fields = "__all__"


class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = "__all__"


class ItemSerializer(serializers.ModelSerializer):
    fornecedor_nome = serializers.CharField(source="fornecedor.nome", read_only=True)

    class Meta:
        model = Item
        fields = "__all__"


class ServicoSerializer(serializers.ModelSerializer):
    policial_id = serializers.PrimaryKeyRelatedField(
        queryset=Policial.objects.all(), source="policial", write_only=True, required=False, allow_null=True
    )
    policial_nome_display = serializers.CharField(source=SRC_POLICIAL_NOME, read_only=True)

    class Meta:
        model = Servico
        exclude = ("policial",)  # Exclui o campo de relação direta
        read_only_fields = (
            "matricula", "policial_nome", "depto", "lotacao"
        )


class CautelaSerializer(serializers.ModelSerializer):
    policial_id = serializers.PrimaryKeyRelatedField(
        queryset=Policial.objects.all(), source="policial", write_only=True
    )
    policial_nome_display = serializers.CharField(source=SRC_POLICIAL_NOME, read_only=True)
    item_descricao = serializers.CharField(source="item.descricao", read_only=True)

    class Meta:
        model = Cautela
        exclude = ("policial",)  # Exclui o campo de relação direta
        read_only_fields = (
            "matricula", "policial_nome", "depto", "lotacao",
            "item_desc", "categoria", "serie"
        )


class MovimentoSerializer(serializers.ModelSerializer):
    item_descricao = serializers.CharField(source=SRC_ITEM_DESCRICAO, read_only=True)
    arma_modelo = serializers.CharField(source="arma.modelo", read_only=True)
    patrimonio_codigo = serializers.CharField(source="patrimonio_ref.codigo", read_only=True)
    departamento_nome = serializers.CharField(source="departamento_ref.nome", read_only=True)
    delegacia_nome = serializers.CharField(source="delegacia_ref.nome", read_only=True)
    usuario_nome = serializers.CharField(source="usuario_ref.nome", read_only=True)

    class Meta:
        model = Movimento
        fields = "__all__"


class OpcaoMenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcaoMenu
        fields = "__all__"

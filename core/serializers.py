from rest_framework import serializers

from .models import Cautela, Fornecedor, Item, Lotacao, Movimento, OpcaoMenu, Policial, Servico


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
    policial_nome_display = serializers.CharField(source="policial.nome", read_only=True)

    class Meta:
        model = Servico
        exclude = ("policial",)  # Exclui o campo de relação direta
        read_only_fields = (
            "matricula", "policial_nome", "depto", "lotacao"
        )


class CautelaSerializer(serializers.ModelSerializer):
    item_descricao = serializers.CharField(source="item.descricao", read_only=True)

    class Meta:
        model = Cautela
        fields = "__all__"


class MovimentoSerializer(serializers.ModelSerializer):
    item_descricao = serializers.CharField(source="item.descricao", read_only=True)

    class Meta:
        model = Movimento
        fields = "__all__"


class OpcaoMenuSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpcaoMenu
        fields = "__all__"

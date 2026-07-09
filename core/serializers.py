from rest_framework import serializers

from .models import (
    Arma,
    Cautela,
    Compra,
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


def normalize_serie_text(value):
    return str(value or "").replace(" ", "").upper()


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

    def validate(self, attrs):
        if "numero_serie" in attrs:
            attrs["numero_serie"] = normalize_serie_text(attrs.get("numero_serie"))
        return attrs


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


class CompraSerializer(serializers.ModelSerializer):
    fornecedor_nome = serializers.CharField(source="fornecedor.nome", read_only=True)

    @staticmethod
    def _is_colete(categoria):
        categoria_norm = str(categoria or "").strip().lower()
        return categoria_norm in {"colete", "coletes"}

    def validate(self, attrs):
        if "serie" in attrs:
            attrs["serie"] = normalize_serie_text(attrs.get("serie"))

        categoria = attrs.get("categoria")
        if categoria is None and self.instance is not None:
            categoria = self.instance.categoria

        dt_val = attrs.get("dt_val")
        if dt_val is None and self.instance is not None:
            dt_val = self.instance.dt_val

        if self._is_colete(categoria) and not dt_val:
            raise serializers.ValidationError({"dt_val": "Data de validade e obrigatoria para compras de colete."})

        return attrs

    class Meta:
        model = Compra
        fields = "__all__"


class ItemSerializer(serializers.ModelSerializer):
    fornecedor_nome = serializers.CharField(source="fornecedor.nome", read_only=True)

    @staticmethod
    def _is_colete(categoria):
        categoria_norm = str(categoria or "").strip().lower()
        return categoria_norm in {"colete", "coletes"}

    def validate(self, attrs):
        if "serie" in attrs:
            attrs["serie"] = normalize_serie_text(attrs.get("serie"))

        categoria = attrs.get("categoria")
        if categoria is None and self.instance is not None:
            categoria = self.instance.categoria

        dt_val = attrs.get("dt_val")
        if dt_val is None and self.instance is not None:
            dt_val = self.instance.dt_val

        if self._is_colete(categoria) and not dt_val:
            raise serializers.ValidationError({"dt_val": "Data de validade e obrigatoria para itens da categoria colete."})

        return attrs

    class Meta:
        model = Item
        fields = "__all__"


class ServicoSerializer(serializers.ModelSerializer):
    policial_id = serializers.PrimaryKeyRelatedField(
        queryset=Policial.objects.all(), source="policial", write_only=True, required=False, allow_null=True
    )
    policial_nome_display = serializers.CharField(source=SRC_POLICIAL_NOME, read_only=True, allow_null=True)

    class Meta:
        model = Servico
        exclude = ("codigo",)
        read_only_fields = ("codigo",)

    def validate(self, attrs):
        if "serie" in attrs:
            attrs["serie"] = normalize_serie_text(attrs.get("serie"))
        return attrs


class CautelaSerializer(serializers.ModelSerializer):
    policial_id = serializers.PrimaryKeyRelatedField(
        queryset=Policial.objects.all(), source="policial", write_only=True, required=False, allow_null=True
    )
    policial_nome_display = serializers.CharField(source=SRC_POLICIAL_NOME, read_only=True)
    item_descricao = serializers.CharField(source="item.descricao", read_only=True)

    class Meta:
        model = Cautela
        exclude = ("policial",)  # Exclui o campo de relação direta
        read_only_fields = (
            "matricula", "policial_nome",
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

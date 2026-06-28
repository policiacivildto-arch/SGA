from django.db import models, transaction


class TimestampedModel(models.Model):
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Lotacao(TimestampedModel):
    depto = models.CharField(max_length=120)
    nome = models.CharField(max_length=200)
    cidade = models.CharField(max_length=120)
    resp = models.CharField(max_length=180, blank=True)
    tel = models.CharField(max_length=40, blank=True)
    end = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["depto", "nome"]

    def __str__(self):
        return f"{self.depto} - {self.nome}"


class Policial(TimestampedModel):
    matricula = models.CharField(max_length=40, unique=True)
    nome = models.CharField(max_length=180)
    cargo = models.CharField(max_length=120, blank=True)
    depto = models.CharField(max_length=120)
    lotacao = models.CharField(max_length=200)
    tel = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} ({self.matricula})"


class Fornecedor(TimestampedModel):
    nome = models.CharField(max_length=200)
    cnpj = models.CharField(max_length=40, blank=True)
    contato = models.CharField(max_length=120, blank=True)
    tel = models.CharField(max_length=40, blank=True)
    email = models.EmailField(blank=True)
    categoria = models.CharField(max_length=120, blank=True)
    end = models.CharField(max_length=255, blank=True)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class Item(TimestampedModel):
    patrimonio = models.CharField(max_length=60, blank=True)
    descricao = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80)
    marca = models.CharField(max_length=120, blank=True)
    serie = models.CharField(max_length=120, blank=True)
    qtd_total = models.PositiveIntegerField(default=1)
    qtd_disp = models.PositiveIntegerField(default=1)
    qtd_min = models.PositiveIntegerField(default=1)
    fornecedor = models.ForeignKey(
        Fornecedor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="itens",
    )
    dt_aq = models.DateField(null=True, blank=True)
    dt_val = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=40, default="Disponivel")
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["descricao"]

    def __str__(self):
        return self.descricao


class Servico(TimestampedModel):
    codigo = models.CharField(max_length=20, unique=True)
    tipo = models.CharField(max_length=120)
    armeiro = models.CharField(max_length=120)
    data_rec = models.DateField()
    data_dev = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=60)
    motivo = models.CharField(max_length=180, blank=True)    
    policial = models.ForeignKey(
        Policial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="servicos",
    )
    # Campos denormalizados para manter o histórico caso o policial seja alterado/removido
    matricula = models.CharField(max_length=40, blank=True)
    policial_nome = models.CharField(max_length=180, blank=True)
    depto = models.CharField(max_length=120, blank=True)
    lotacao = models.CharField(max_length=200, blank=True)
    modelo = models.CharField(max_length=120)
    serie = models.CharField(max_length=120)
    descricao = models.TextField(blank=True)
    pecas = models.TextField(blank=True)

    class Meta:
        ordering = ["-data_rec", "-criado_em"]    

    def __str__(self):
        return self.codigo

    @classmethod
    def get_next_code(cls):
        last = cls.objects.order_by("-codigo").first()
        next_num = 1
        if last and str(last.codigo).isdigit():
            next_num = int(last.codigo) + 1
        return str(next_num).zfill(4)

class Cautela(TimestampedModel):
    numero = models.CharField(max_length=30, unique=True)
    data_saida = models.DateField()
    data_prev = models.DateField(null=True, blank=True)
    data_dev = models.DateField(null=True, blank=True)
    matricula = models.CharField(max_length=40)
    policial = models.CharField(max_length=180)
    depto = models.CharField(max_length=120)
    lotacao = models.CharField(max_length=200)
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name="cautelas")
    item_desc = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80)
    serie = models.CharField(max_length=120, blank=True)
    qtd = models.PositiveIntegerField(default=1)
    obs = models.TextField(blank=True)
    status = models.CharField(max_length=40, default="Ativa")
    condicao_dev = models.CharField(max_length=80, blank=True)
    obs_dev = models.TextField(blank=True)

    class Meta:
        # Constantes para status
        STATUS_ATIVA = "Ativa"
        STATUS_DEVOLVIDO = "Devolvido"

        ordering = ["-data_saida", "-criado_em"]

    def __str__(self):
        return self.numero


    @classmethod
    @transaction.atomic
    def registrar_cautela(cls, **data):
        item = data["item"]
        qtd = data.get("qtd", 1)

        if qtd > item.qtd_disp:
            raise ValueError("Quantidade maior que o estoque disponível.")

        # Popula campos denormalizados a partir do item, se não forem providos
        data["item_desc"] = data.get("item_desc") or item.descricao
        data["categoria"] = data.get("categoria") or item.categoria
        data["serie"] = data.get("serie") or item.serie or item.patrimonio

        cautela = cls.objects.create(**data)

        # Atualiza o item
        item.qtd_disp -= cautela.qtd
        if item.qtd_disp == 0:
            item.status = "Em Cautela"
        item.save(update_fields=["qtd_disp", "status", "atualizado_em"])

        # Cria o movimento
        Movimento.objects.create(
            data=cautela.data_saida,
            tipo="Saida (Cautela)",
            item=item,
            item_desc=cautela.item_desc,
            categoria=cautela.categoria,
            qtd=cautela.qtd,
            serie=cautela.serie,
            policial=cautela.policial,
            matricula=cautela.matricula,
            lotacao=cautela.lotacao,
            num_cautela=cautela.numero,
            obs=cautela.obs,
        )
        return cautela

    @transaction.atomic
    def devolver_cautela(self, data_dev, condicao_dev, obs_dev):
        if self.status != self.STATUS_ATIVA:
            raise ValueError("Apenas cautelas ativas podem ser devolvidas.")

        # Atualiza o item
        item = self.item
        item.qtd_disp += self.qtd
        if item.status == "Em Cautela":
            item.status = "Disponivel"
        item.save(update_fields=["qtd_disp", "status", "atualizado_em"])

        # Atualiza a cautela
        self.data_dev = data_dev
        self.status = self.STATUS_DEVOLVIDO
        self.condicao_dev = condicao_dev
        self.obs_dev = obs_dev
        self.save(update_fields=["data_dev", "status", "condicao_dev", "obs_dev", "atualizado_em"])

        # Cria o movimento de devolução
        Movimento.objects.create(
            data=data_dev, tipo="Entrada (Devolucao)", item=item, item_desc=self.item_desc,
            categoria=self.categoria, qtd=self.qtd, serie=self.serie, policial=self.policial,
            matricula=self.matricula, lotacao=self.lotacao, num_cautela=self.numero, obs=obs_dev,
        )

    @transaction.atomic
    def cancelar_cautela(self):
        if self.status == self.STATUS_ATIVA:
            self.item.qtd_disp += self.qtd
            if self.item.status == "Em Cautela":
                self.item.status = "Disponivel"
            self.item.save(update_fields=["qtd_disp", "status", "atualizado_em"])
        self.delete()

class Movimento(TimestampedModel):
    data = models.DateField()
    tipo = models.CharField(max_length=80)
    item = models.ForeignKey(Item, on_delete=models.SET_NULL, null=True, blank=True, related_name="movimentos")
    item_desc = models.CharField(max_length=200)
    categoria = models.CharField(max_length=80)
    qtd = models.PositiveIntegerField(default=1)
    serie = models.CharField(max_length=120, blank=True)
    policial = models.CharField(max_length=180, blank=True)
    matricula = models.CharField(max_length=40, blank=True)
    lotacao = models.CharField(max_length=200, blank=True)
    num_cautela = models.CharField(max_length=30, blank=True)
    obs = models.TextField(blank=True)

    class Meta:
        ordering = ["-data", "-criado_em"]

    def __str__(self):
        return f"{self.tipo} - {self.item_desc}"


class OpcaoMenu(TimestampedModel):
    grupo = models.CharField(max_length=120)
    valor = models.CharField(max_length=120)
    rotulo = models.CharField(max_length=180)
    ordem = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)

    class Meta:
        ordering = ["grupo", "ordem", "rotulo"]
        constraints = [
            models.UniqueConstraint(fields=["grupo", "valor"], name="uq_opcaomenu_grupo_valor"),
        ]

    def __str__(self):
        return f"{self.grupo}: {self.rotulo}"

# Backend Django - SALT

Backend REST para o front SALT (Sistema de Controle de Armas e Estoque).

## Stack

- Django
- Django REST Framework
- SQLite (padrao)
- CORS habilitado para desenvolvimento

## Como rodar

1. Criar e ativar ambiente virtual.
2. Instalar dependencias:

```bash
pip install -r requirements.txt
```

3. Aplicar migracoes:

```bash
python manage.py makemigrations
python manage.py migrate
```

4. Criar usuario admin (opcional):

```bash
python manage.py createsuperuser
```

5. Subir servidor:

```bash
python manage.py runserver
```

API base: `http://127.0.0.1:8000/api/`
Admin: `http://127.0.0.1:8000/admin/`

## Endpoints

- `/api/lotacoes/`
- `/api/policiais/`
- `/api/fornecedores/`
- `/api/itens/`
- `/api/servicos/`
- `/api/cautelas/`
- `/api/movimentos/`

Acoes extras:

- `GET /api/servicos/next-code/`
- `GET /api/cautelas/next-number/`
- `POST /api/cautelas/{id}/devolver/`

## Filtros de consulta

Todos os endpoints aceitam:

- `search=` para busca textual
- `ordering=` para ordenacao

Filtros diretos por query string (dependendo do recurso):

- Servicos: `status`, `tipo`, `armeiro`
- Cautelas: `status`, `categoria`, `lotacao`
- Itens: `categoria`, `status`
- Policiais: `depto`, `lotacao`
- Lotacoes: `depto`
- Movimentos: `tipo`, `categoria`, `lotacao`

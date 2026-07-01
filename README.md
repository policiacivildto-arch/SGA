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

- `/api/departamentos/`
- `/api/delegacias/`
- `/api/usuarios/`
- `/api/lotacoes/`
- `/api/policiais/`
- `/api/fornecedores/`
- `/api/itens/`
- `/api/armas/`
- `/api/patrimonios/`
- `/api/servicos/`
- `/api/cautelas/`
- `/api/movimentos/`

Acoes extras:

- `GET /api/servicos/next-code/`
- `GET /api/cautelas/next-number/`
- `POST /api/cautelas/{id}/devolver/`
- `POST /api/admin/backfill-relacional/` (somente admin/staff autenticado)

## Backfill relacional

O backfill preenche referencias FK novas (departamento, delegacia, patrimonio e arma)
a partir dos campos legados de texto.

### Via comando Django

Dry-run (nao persiste):

```bash
python manage.py backfill_relational_refs
```

Aplicar alteracoes:

```bash
python manage.py backfill_relational_refs --apply
```

### Via endpoint protegido (admin/staff)

URL:

```text
POST /api/admin/backfill-relacional/
```

Corpo JSON para dry-run:

```json
{}
```

Corpo JSON para aplicar:

```json
{"apply": true}
```

Exemplo PowerShell:

```powershell
$cred = Get-Credential
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/admin/backfill-relacional/" -Authentication Basic -Credential $cred -ContentType "application/json" -Body '{"apply": true}'
```

### Via Django Admin

No Admin, em OpcaoMenu, use a acao em massa:

- `Executar backfill relacional (apply)`

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

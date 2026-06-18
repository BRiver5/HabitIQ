# HabitIQ Backend (FastAPI)

Anonymous, device-based REST API for the HabitIQ app. No signup/login: clients
generate a UUID on first launch and send it as the `X-Device-Id` header.

## Stack
- FastAPI + Uvicorn
- SQLAlchemy 2.0 ORM (SQLite for local dev, PostgreSQL in production)
- Alembic migrations
- Pydantic v2 schemas with auto-generated OpenAPI docs

> Recommended Python: 3.11–3.13. (Some native wheels may lag on very new
> Python releases.)

## Setup

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env   # adjust DATABASE_URL if needed
```

## Run

```bash
uvicorn app.main:app --reload
```

- API root: `http://localhost:8000/api/v1`
- Swagger docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

On startup the app auto-creates tables (dev convenience). For production use
Alembic:

```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

## Endpoints (`/api/v1`)

| Method | Path                       | Description                       |
|--------|----------------------------|-----------------------------------|
| GET    | `/habits`                  | List habits for the device        |
| POST   | `/habits`                  | Create / upsert a habit           |
| GET    | `/habits/{id}`             | Get a habit                       |
| PATCH  | `/habits/{id}`             | Update a habit                    |
| DELETE | `/habits/{id}`             | Delete a habit                    |
| POST   | `/habits/reorder`          | Reorder habits                    |
| GET    | `/habits/{id}/stats`       | Aggregated stats for a habit      |
| GET    | `/logs?habit_id=`          | List logs (optionally per habit)  |
| PUT    | `/logs`                    | Upsert a daily log                |
| DELETE | `/logs?habit_id=&log_date=`| Delete a daily log                |

All endpoints require the `X-Device-Id` header.

## Notes
The mobile app is offline-first (expo-sqlite). This backend mirrors that schema
so a future sync layer can push/pull changes silently when online.

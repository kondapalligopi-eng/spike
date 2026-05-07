#!/bin/bash
set -e

# Render provides DATABASE_URL as postgres:// — convert to asyncpg format
if [[ -n "${DATABASE_URL:-}" ]]; then
    DATABASE_URL="${DATABASE_URL/postgres:\/\//postgresql+asyncpg:\/\/}"
    DATABASE_URL="${DATABASE_URL/postgresql:\/\//postgresql+asyncpg:\/\/}"
    export DATABASE_URL
    echo "DATABASE_URL format: OK"
fi

echo "Running database migrations..."
alembic upgrade head
echo "Migrations complete."

echo "Ensuring tables exist (idempotent create_all fallback)..."
# alembic/versions is empty, so 'upgrade head' is a no-op. Until proper
# migrations exist, fall back to SQLAlchemy create_all so the schema
# matches the models. Skips existing tables.
python scripts/init_db.py || echo "[init_db] non-fatal failure — continuing"

echo "Bootstrapping admin user (idempotent)..."
# Run the script directly (not via -m) and never let a bootstrap failure
# kill the API — if the seed fails, log it and keep starting uvicorn.
python scripts/bootstrap_admin.py || echo "[bootstrap_admin] non-fatal failure — continuing"

echo "Starting FastAPI on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1

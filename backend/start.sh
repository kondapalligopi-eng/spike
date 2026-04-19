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

echo "Starting FastAPI on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --workers 1

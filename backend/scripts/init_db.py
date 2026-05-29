"""Idempotent schema bootstrap.

Two passes, both safe to run on every boot:

1. ``Base.metadata.create_all`` — creates any *new* tables defined in
   ``app.models`` that don't yet exist. Does NOT touch existing tables.

2. ``SCHEMA_PATCHES`` — a list of idempotent ``ALTER TABLE ... ADD COLUMN
   IF NOT EXISTS`` statements that bring already-existing tables in line
   with new columns added to the models. Because pass (1) never alters
   existing tables, this is how we ship column additions without proper
   Alembic migrations.

When you add a new column to an existing model, add a matching row to
``SCHEMA_PATCHES``. New tables don't need an entry — ``create_all`` covers
them. Removing or renaming columns is not safe here; do those manually.

This is the fallback because ``alembic/versions`` is currently empty. For
future schema changes that go beyond additive columns, generate a proper
migration:

    alembic revision --autogenerate -m "describe change"
    alembic upgrade head

Run via:  python scripts/init_db.py
"""
from __future__ import annotations

import asyncio
import os
import sys

_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_HERE)
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from sqlalchemy import text  # noqa: E402

from app.database import Base, engine  # noqa: E402
import app.models  # noqa: E402, F401  — registers all models on Base.metadata


# Each entry runs once per boot. Postgres 9.6+ supports ADD COLUMN IF NOT
# EXISTS so re-running is a no-op. Add new column patches here as the
# models evolve; do NOT use this for drops or renames.
SCHEMA_PATCHES: list[str] = [
    "ALTER TABLE grooming_salons ADD COLUMN IF NOT EXISTS hours VARCHAR(120)",
    "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS hours VARCHAR(120)",
    "ALTER TABLE hospitals ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
    "ALTER TABLE parks ADD COLUMN IF NOT EXISTS email VARCHAR(255)",
]


async def main() -> int:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        print("[init_db] Tables ensured (existing tables left untouched).")

        for stmt in SCHEMA_PATCHES:
            try:
                await conn.execute(text(stmt))
                print(f"[init_db] Schema patch OK: {stmt}")
            except Exception as exc:  # noqa: BLE001 — never block boot on a patch
                print(f"[init_db] Schema patch FAILED (non-fatal): {stmt} — {exc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

"""Idempotent schema bootstrap.

Calls Base.metadata.create_all so any tables defined in app.models that
don't exist get created. Safe to run on every boot — existing tables
are skipped.

This is a fallback for environments without proper Alembic migrations
(currently the case here — alembic/versions is empty). For future
schema changes, generate a proper migration via:

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

from app.database import Base, engine  # noqa: E402
import app.models  # noqa: E402, F401  — registers all models on Base.metadata


async def main() -> int:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[init_db] Tables ensured (existing tables left untouched).")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))

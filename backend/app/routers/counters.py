"""Public key/int counters — currently the site-wide "thumbs up" tally.

GET  /counters/{key}            → current value (0 if never touched)
POST /counters/{key}/increment  → +1, returns new value

Deliberately unauthenticated: it's a vanity/social-proof counter, not data.
The frontend uses a localStorage guard so one visitor only counts once; this
endpoint just trusts and tallies.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.core.dependencies import require_admin
from app.models.app_counter import AppCounter
from app.models.user import User

router = APIRouter(prefix="/counters", tags=["counters"])


async def _get(db: AsyncSession, key: str) -> AppCounter | None:
    result = await db.execute(select(AppCounter).where(AppCounter.key == key))
    return result.scalar_one_or_none()


@router.get(
    "",
    summary="All counters, highest first (admin — powers the click report)",
)
async def list_counters(
    prefix: str | None = Query(None, description="Only keys starting with this, e.g. hospital:"),
    limit: int = Query(500, ge=1, le=2000),
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[dict]:
    """Admin-only. The per-key values are harmless on their own, but together
    they describe which listings get traction — that is business data, not a
    vanity counter, so it is not public the way GET /{key} is."""
    stmt = select(AppCounter)
    if prefix:
        stmt = stmt.where(AppCounter.key.startswith(prefix))
    result = await db.execute(stmt.order_by(desc(AppCounter.value)).limit(limit))
    return [{"key": r.key, "value": r.value} for r in result.scalars().all()]


@router.get("/{key}")
async def get_counter(key: str, db: AsyncSession = Depends(get_db)) -> dict:
    row = await _get(db, key)
    return {"key": key, "value": row.value if row else 0}


@router.post("/{key}/increment")
async def increment_counter(key: str, db: AsyncSession = Depends(get_db)) -> dict:
    row = await _get(db, key)
    if row is None:
        row = AppCounter(key=key, value=1)
        db.add(row)
    else:
        row.value += 1
    await db.flush()
    await db.refresh(row)
    return {"key": key, "value": row.value}

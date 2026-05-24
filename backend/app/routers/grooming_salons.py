from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.grooming_salon import GroomingSalon
from app.models.user import User
from app.schemas.grooming_salon import GroomingSalonCreate, GroomingSalonRead

router = APIRouter(prefix="/grooming-salons", tags=["grooming_salons"])


@router.get(
    "",
    response_model=list[GroomingSalonRead],
    summary="List all grooming salons (newest first)",
)
async def list_grooming_salons(
    db: AsyncSession = Depends(get_db),
) -> list[GroomingSalonRead]:
    result = await db.execute(
        select(GroomingSalon).order_by(desc(GroomingSalon.created_at))
    )
    rows = result.scalars().all()
    return [GroomingSalonRead.model_validate(r) for r in rows]


@router.post(
    "",
    response_model=GroomingSalonRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new grooming salon (admin only)",
)
async def create_grooming_salon(
    payload: GroomingSalonCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> GroomingSalonRead:
    salon = GroomingSalon(
        name=payload.name.strip(),
        area=payload.area.strip(),
        city=payload.city.strip() or "Bengaluru",
        state=payload.state.strip() or "KA",
        address=payload.address.strip(),
        phone=payload.phone.strip(),
        rating_avg=payload.rating_avg,
        rating_count=payload.rating_count,
        tint=payload.tint.strip() or "from-amber-200 to-amber-400",
        hero_emoji=payload.hero_emoji.strip() or "✂️",
        hours=[h.model_dump() for h in payload.hours],
        open_today_until=(payload.open_today_until or "").strip() or None,
    )
    db.add(salon)
    await db.flush()
    await db.refresh(salon)
    return GroomingSalonRead.model_validate(salon)


@router.put(
    "/{salon_id}",
    response_model=GroomingSalonRead,
    summary="Update a grooming salon (admin only)",
)
async def update_grooming_salon(
    salon_id: uuid.UUID,
    payload: GroomingSalonCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> GroomingSalonRead:
    result = await db.execute(
        select(GroomingSalon).where(GroomingSalon.id == salon_id)
    )
    salon = result.scalar_one_or_none()
    if salon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Grooming salon not found"
        )
    salon.name = payload.name.strip()
    salon.area = payload.area.strip()
    salon.city = payload.city.strip() or "Bengaluru"
    salon.state = payload.state.strip() or "KA"
    salon.address = payload.address.strip()
    salon.phone = payload.phone.strip()
    salon.rating_avg = payload.rating_avg
    salon.rating_count = payload.rating_count
    salon.tint = payload.tint.strip() or "from-amber-200 to-amber-400"
    salon.hero_emoji = payload.hero_emoji.strip() or "✂️"
    await db.flush()
    await db.refresh(salon)
    return GroomingSalonRead.model_validate(salon)


@router.delete(
    "/{salon_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a grooming salon (admin only)",
)
async def delete_grooming_salon(
    salon_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Response:
    result = await db.execute(
        select(GroomingSalon).where(GroomingSalon.id == salon_id)
    )
    salon = result.scalar_one_or_none()
    if salon is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Grooming salon not found"
        )
    await db.delete(salon)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.park import Park
from app.models.user import User
from app.schemas.park import ParkCreate, ParkRead

router = APIRouter(prefix="/parks", tags=["parks"])


@router.get(
    "",
    response_model=list[ParkRead],
    summary="List all parks (newest first)",
)
async def list_parks(db: AsyncSession = Depends(get_db)) -> list[ParkRead]:
    result = await db.execute(select(Park).order_by(desc(Park.created_at)))
    rows = result.scalars().all()
    return [ParkRead.model_validate(r) for r in rows]


@router.post(
    "",
    response_model=ParkRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new park (admin only)",
)
async def create_park(
    payload: ParkCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> ParkRead:
    park = Park(
        name=payload.name.strip(),
        locality=payload.locality.strip(),
        rating=payload.rating,
        image_url=(payload.image_url or "").strip() or None,
        address=payload.address.strip(),
        hours=(payload.hours or "").strip() or None,
        cost=(payload.cost or "").strip() or None,
        off_leash=(payload.off_leash or "").strip() or None,
        features=(payload.features or "").strip() or None,
        phone=(payload.phone or "").strip() or None,
        email=(payload.email or "").strip() or None,
        website=(payload.website or "").strip() or None,
        highlights=[h.strip() for h in (payload.highlights or []) if h.strip()],
    )
    db.add(park)
    await db.flush()
    await db.refresh(park)
    return ParkRead.model_validate(park)


@router.put(
    "/{park_id}",
    response_model=ParkRead,
    summary="Update a park (admin only)",
)
async def update_park(
    park_id: uuid.UUID,
    payload: ParkCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> ParkRead:
    result = await db.execute(select(Park).where(Park.id == park_id))
    park = result.scalar_one_or_none()
    if park is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    park.name = payload.name.strip()
    park.locality = payload.locality.strip()
    park.rating = payload.rating
    park.image_url = (payload.image_url or "").strip() or None
    park.address = payload.address.strip()
    park.hours = (payload.hours or "").strip() or None
    park.cost = (payload.cost or "").strip() or None
    park.off_leash = (payload.off_leash or "").strip() or None
    park.features = (payload.features or "").strip() or None
    park.phone = (payload.phone or "").strip() or None
    park.website = (payload.website or "").strip() or None
    park.highlights = [h.strip() for h in (payload.highlights or []) if h.strip()]
    await db.flush()
    await db.refresh(park)
    return ParkRead.model_validate(park)


@router.delete(
    "/{park_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a park (admin only)",
)
async def delete_park(
    park_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Response:
    result = await db.execute(select(Park).where(Park.id == park_id))
    park = result.scalar_one_or_none()
    if park is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Park not found"
        )
    await db.delete(park)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

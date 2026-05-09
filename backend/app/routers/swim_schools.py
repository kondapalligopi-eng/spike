from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.swim_school import SwimSchool
from app.models.user import User
from app.schemas.swim_school import SwimSchoolCreate, SwimSchoolRead

router = APIRouter(prefix="/swim-schools", tags=["swim_schools"])


@router.get(
    "",
    response_model=list[SwimSchoolRead],
    summary="List all swim schools (newest first)",
)
async def list_swim_schools(
    db: AsyncSession = Depends(get_db),
) -> list[SwimSchoolRead]:
    result = await db.execute(select(SwimSchool).order_by(desc(SwimSchool.created_at)))
    rows = result.scalars().all()
    return [SwimSchoolRead.model_validate(r) for r in rows]


@router.post(
    "",
    response_model=SwimSchoolRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new swim school (admin only)",
)
async def create_swim_school(
    payload: SwimSchoolCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> SwimSchoolRead:
    school = SwimSchool(
        name=payload.name.strip(),
        locality=payload.locality.strip(),
        rating=payload.rating,
        image_url=(payload.image_url or "").strip() or None,
        address=payload.address.strip(),
        hours=(payload.hours or "").strip() or None,
        cost=(payload.cost or "").strip() or None,
        pool_type=(payload.pool_type or "").strip() or None,
        highlights=[h.strip() for h in (payload.highlights or []) if h.strip()],
    )
    db.add(school)
    await db.flush()
    await db.refresh(school)
    return SwimSchoolRead.model_validate(school)


@router.put(
    "/{school_id}",
    response_model=SwimSchoolRead,
    summary="Update a swim school (admin only)",
)
async def update_swim_school(
    school_id: uuid.UUID,
    payload: SwimSchoolCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> SwimSchoolRead:
    result = await db.execute(select(SwimSchool).where(SwimSchool.id == school_id))
    school = result.scalar_one_or_none()
    if school is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Swim school not found"
        )
    school.name = payload.name.strip()
    school.locality = payload.locality.strip()
    school.rating = payload.rating
    school.image_url = (payload.image_url or "").strip() or None
    school.address = payload.address.strip()
    school.hours = (payload.hours or "").strip() or None
    school.cost = (payload.cost or "").strip() or None
    school.pool_type = (payload.pool_type or "").strip() or None
    school.highlights = [h.strip() for h in (payload.highlights or []) if h.strip()]
    await db.flush()
    await db.refresh(school)
    return SwimSchoolRead.model_validate(school)


@router.delete(
    "/{school_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a swim school (admin only)",
)
async def delete_swim_school(
    school_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Response:
    result = await db.execute(select(SwimSchool).where(SwimSchool.id == school_id))
    school = result.scalar_one_or_none()
    if school is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Swim school not found"
        )
    await db.delete(school)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

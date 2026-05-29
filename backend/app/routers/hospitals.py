from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.hospital import Hospital
from app.models.user import User
from app.schemas.hospital import HospitalCreate, HospitalRead

router = APIRouter(prefix="/hospitals", tags=["hospitals"])


@router.get(
    "",
    response_model=list[HospitalRead],
    summary="List all admin-added hospitals (newest first)",
)
async def list_hospitals(
    db: AsyncSession = Depends(get_db),
) -> list[HospitalRead]:
    result = await db.execute(select(Hospital).order_by(desc(Hospital.created_at)))
    rows = result.scalars().all()
    return [HospitalRead.model_validate(r) for r in rows]


@router.post(
    "",
    response_model=HospitalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new hospital (admin only)",
)
async def create_hospital(
    payload: HospitalCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> HospitalRead:
    hospital = Hospital(
        name=payload.name.strip(),
        locality=payload.locality.strip(),
        address=payload.address.strip(),
        phone=payload.phone.strip(),
        specialties=(payload.specialties or "").strip() or None,
        rating=(payload.rating or "").strip() or None,
        website=(payload.website or "").strip() or None,
        hours=(payload.hours or "").strip() or None,
        email=(payload.email or "").strip() or None,
    )
    db.add(hospital)
    await db.flush()
    await db.refresh(hospital)
    return HospitalRead.model_validate(hospital)


@router.put(
    "/{hospital_id}",
    response_model=HospitalRead,
    summary="Update a hospital (admin only)",
)
async def update_hospital(
    hospital_id: uuid.UUID,
    payload: HospitalCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> HospitalRead:
    result = await db.execute(select(Hospital).where(Hospital.id == hospital_id))
    hospital = result.scalar_one_or_none()
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Hospital not found"
        )
    hospital.name = payload.name.strip()
    hospital.locality = payload.locality.strip()
    hospital.address = payload.address.strip()
    hospital.phone = payload.phone.strip()
    hospital.specialties = (payload.specialties or "").strip() or None
    hospital.rating = (payload.rating or "").strip() or None
    hospital.website = (payload.website or "").strip() or None
    await db.flush()
    await db.refresh(hospital)
    return HospitalRead.model_validate(hospital)


@router.delete(
    "/{hospital_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a hospital (admin only)",
)
async def delete_hospital(
    hospital_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Response:
    result = await db.execute(select(Hospital).where(Hospital.id == hospital_id))
    hospital = result.scalar_one_or_none()
    if hospital is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hospital not found",
        )
    await db.delete(hospital)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

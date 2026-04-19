from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.adoption import (
    AdoptionCreate,
    AdoptionListResponse,
    AdoptionResponse,
    AdoptionUpdate,
)
from app.services.adoption_service import AdoptionService

router = APIRouter(prefix="/adoptions", tags=["adoptions"])


@router.get(
    "",
    response_model=AdoptionListResponse,
    summary="List adoptions (own requests/received; admin sees all)",
)
async def list_adoptions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> AdoptionListResponse:
    return await AdoptionService.list_adoptions(
        db,
        user_id=current_user.id,
        is_admin=(current_user.role == UserRole.admin),
        page=page,
        limit=limit,
    )


@router.post(
    "",
    response_model=AdoptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit an adoption request for a dog",
)
async def create_adoption(
    payload: AdoptionCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> AdoptionResponse:
    adoption = await AdoptionService.create(db, payload, requester_id=current_user.id)
    return AdoptionResponse.model_validate(adoption)


@router.put(
    "/{adoption_id}",
    response_model=AdoptionResponse,
    summary="Update adoption status (dog owner or admin only)",
)
async def update_adoption(
    adoption_id: uuid.UUID,
    payload: AdoptionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> AdoptionResponse:
    adoption = await AdoptionService.get_by_id(db, adoption_id)
    if adoption is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Adoption request not found",
        )

    is_admin = current_user.role == UserRole.admin
    is_owner = adoption.owner_id == current_user.id
    is_requester = adoption.requester_id == current_user.id

    # Requester may only cancel their own pending request
    if not is_admin and not is_owner:
        if is_requester and payload.status.value == "cancelled":
            pass  # allowed
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the dog owner or an admin can update this adoption",
            )

    updated = await AdoptionService.update_status(db, adoption, payload)
    return AdoptionResponse.model_validate(updated)

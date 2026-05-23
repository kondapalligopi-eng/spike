from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.pet_food import PetFood
from app.models.user import User
from app.schemas.pet_food import PetFoodCreate, PetFoodRead

router = APIRouter(prefix="/pet-foods", tags=["pet-foods"])


def _apply_payload(item: PetFood, payload: PetFoodCreate) -> None:
    item.brand = payload.brand.strip()
    item.name = payload.name.strip()
    item.image_url = (payload.image_url or "").strip() or None
    item.emoji = (payload.emoji or "🥫").strip() or "🥫"
    item.rating = payload.rating
    item.reviews = payload.reviews
    item.price = payload.price
    item.per_unit = (payload.per_unit or "—").strip() or "—"
    item.list_price = payload.list_price
    item.sale_price = payload.sale_price
    item.save_pct = payload.save_pct
    item.sponsored = payload.sponsored
    item.deal = payload.deal
    item.lifestage = (payload.lifestage or "").strip() or None
    item.form = (payload.form or "").strip() or None


@router.get(
    "",
    response_model=list[PetFoodRead],
    summary="List all pet food products (newest first)",
)
async def list_pet_foods(db: AsyncSession = Depends(get_db)) -> list[PetFoodRead]:
    result = await db.execute(select(PetFood).order_by(desc(PetFood.created_at)))
    rows = result.scalars().all()
    return [PetFoodRead.model_validate(r) for r in rows]


@router.post(
    "",
    response_model=PetFoodRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a new pet food product (admin only)",
)
async def create_pet_food(
    payload: PetFoodCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> PetFoodRead:
    item = PetFood()
    _apply_payload(item, payload)
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return PetFoodRead.model_validate(item)


@router.put(
    "/{pet_food_id}",
    response_model=PetFoodRead,
    summary="Update a pet food product (admin only)",
)
async def update_pet_food(
    pet_food_id: uuid.UUID,
    payload: PetFoodCreate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> PetFoodRead:
    result = await db.execute(select(PetFood).where(PetFood.id == pet_food_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pet food not found"
        )
    _apply_payload(item, payload)
    await db.flush()
    await db.refresh(item)
    return PetFoodRead.model_validate(item)


@router.delete(
    "/{pet_food_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a pet food product (admin only)",
)
async def delete_pet_food(
    pet_food_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Response:
    result = await db.execute(select(PetFood).where(PetFood.id == pet_food_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Pet food not found"
        )
    await db.delete(item)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

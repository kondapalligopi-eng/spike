from __future__ import annotations

import math
import uuid
from typing import List

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.dog import Dog, DogSize, DogStatus
from app.schemas.dog import DogCreate, DogListResponse, DogResponse, DogUpdate


class DogService:
    @staticmethod
    async def get_by_id(db: AsyncSession, dog_id: uuid.UUID) -> Dog | None:
        result = await db.execute(
            select(Dog)
            .options(selectinload(Dog.owner))
            .where(Dog.id == dog_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_dogs(
        db: AsyncSession,
        breed: str | None = None,
        age_min: int | None = None,
        age_max: int | None = None,
        size: DogSize | None = None,
        status: DogStatus | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> DogListResponse:
        filters = []
        if breed:
            filters.append(func.lower(Dog.breed).contains(breed.lower()))
        if age_min is not None:
            filters.append(Dog.age_months >= age_min)
        if age_max is not None:
            filters.append(Dog.age_months <= age_max)
        if size is not None:
            filters.append(Dog.size == size)
        if status is not None:
            filters.append(Dog.status == status)

        where_clause = and_(*filters) if filters else True

        count_result = await db.execute(
            select(func.count(Dog.id)).where(where_clause)
        )
        total: int = count_result.scalar_one()

        offset = (page - 1) * limit
        dogs_result = await db.execute(
            select(Dog)
            .options(selectinload(Dog.owner))
            .where(where_clause)
            .order_by(Dog.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        dogs: List[Dog] = list(dogs_result.scalars().all())

        pages = max(1, math.ceil(total / limit)) if total else 1
        return DogListResponse(
            items=[DogResponse.model_validate(d) for d in dogs],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: DogCreate,
        owner_id: uuid.UUID,
    ) -> Dog:
        dog = Dog(
            name=payload.name,
            breed=payload.breed,
            age_months=payload.age_months,
            size=payload.size,
            gender=payload.gender,
            color=payload.color,
            description=payload.description,
            is_vaccinated=payload.is_vaccinated,
            is_neutered=payload.is_neutered,
            images=[],
            owner_id=owner_id,
        )
        db.add(dog)
        await db.flush()
        await db.refresh(dog)
        return dog

    @staticmethod
    async def update(
        db: AsyncSession,
        dog: Dog,
        payload: DogUpdate,
    ) -> Dog:
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(dog, field, value)
        db.add(dog)
        await db.flush()
        await db.refresh(dog)
        return dog

    @staticmethod
    async def add_image(db: AsyncSession, dog: Dog, url: str) -> Dog:
        current_images: List[str] = list(dog.images or [])
        current_images.append(url)
        dog.images = current_images
        db.add(dog)
        await db.flush()
        await db.refresh(dog)
        return dog

    @staticmethod
    async def delete(db: AsyncSession, dog: Dog) -> None:
        await db.delete(dog)
        await db.flush()

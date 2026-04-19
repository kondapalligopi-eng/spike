from __future__ import annotations

import math
import uuid
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.adoption import Adoption, AdoptionStatus
from app.models.dog import Dog, DogStatus
from app.schemas.adoption import (
    AdoptionCreate,
    AdoptionListResponse,
    AdoptionResponse,
    AdoptionUpdate,
)


class AdoptionService:
    @staticmethod
    async def get_by_id(
        db: AsyncSession, adoption_id: uuid.UUID
    ) -> Adoption | None:
        result = await db.execute(
            select(Adoption)
            .options(
                selectinload(Adoption.requester),
                selectinload(Adoption.owner),
            )
            .where(Adoption.id == adoption_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_adoptions(
        db: AsyncSession,
        user_id: uuid.UUID,
        is_admin: bool = False,
        page: int = 1,
        limit: int = 20,
    ) -> AdoptionListResponse:
        if is_admin:
            where_clause = True
        else:
            where_clause = or_(
                Adoption.requester_id == user_id,
                Adoption.owner_id == user_id,
            )

        count_result = await db.execute(
            select(func.count(Adoption.id)).where(where_clause)
        )
        total: int = count_result.scalar_one()

        offset = (page - 1) * limit
        adoptions_result = await db.execute(
            select(Adoption)
            .options(
                selectinload(Adoption.requester),
                selectinload(Adoption.owner),
            )
            .where(where_clause)
            .order_by(Adoption.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        adoptions: List[Adoption] = list(adoptions_result.scalars().all())

        pages = max(1, math.ceil(total / limit)) if total else 1
        return AdoptionListResponse(
            items=[AdoptionResponse.model_validate(a) for a in adoptions],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: AdoptionCreate,
        requester_id: uuid.UUID,
    ) -> Adoption:
        # Fetch the dog
        dog_result = await db.execute(
            select(Dog).where(Dog.id == payload.dog_id)
        )
        dog: Dog | None = dog_result.scalar_one_or_none()

        if dog is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dog not found",
            )
        if dog.status != DogStatus.available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Dog is not available for adoption",
            )
        if dog.owner_id == requester_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot request adoption of your own dog",
            )

        # Prevent duplicate pending requests from the same user
        existing_result = await db.execute(
            select(Adoption).where(
                and_(
                    Adoption.dog_id == payload.dog_id,
                    Adoption.requester_id == requester_id,
                    Adoption.status == AdoptionStatus.pending,
                )
            )
        )
        if existing_result.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have a pending adoption request for this dog",
            )

        adoption = Adoption(
            dog_id=payload.dog_id,
            requester_id=requester_id,
            owner_id=dog.owner_id,
            message=payload.message,
            status=AdoptionStatus.pending,
        )
        db.add(adoption)

        # Mark dog as pending
        dog.status = DogStatus.pending
        db.add(dog)

        await db.flush()
        await db.refresh(adoption)
        return adoption

    @staticmethod
    async def update_status(
        db: AsyncSession,
        adoption: Adoption,
        payload: AdoptionUpdate,
    ) -> Adoption:
        adoption.status = payload.status
        db.add(adoption)

        # Update dog status based on adoption outcome
        dog_result = await db.execute(
            select(Dog).where(Dog.id == adoption.dog_id)
        )
        dog: Dog | None = dog_result.scalar_one_or_none()

        if dog is not None:
            if payload.status == AdoptionStatus.approved:
                dog.status = DogStatus.adopted
                # Reject all other pending requests for this dog
                other_pending_result = await db.execute(
                    select(Adoption).where(
                        and_(
                            Adoption.dog_id == adoption.dog_id,
                            Adoption.id != adoption.id,
                            Adoption.status == AdoptionStatus.pending,
                        )
                    )
                )
                for other in other_pending_result.scalars().all():
                    other.status = AdoptionStatus.rejected
                    db.add(other)
            elif payload.status in (
                AdoptionStatus.rejected,
                AdoptionStatus.cancelled,
            ):
                # Only revert to available if no other pending requests exist
                other_pending_result = await db.execute(
                    select(func.count(Adoption.id)).where(
                        and_(
                            Adoption.dog_id == adoption.dog_id,
                            Adoption.id != adoption.id,
                            Adoption.status == AdoptionStatus.pending,
                        )
                    )
                )
                other_count: int = other_pending_result.scalar_one()
                if other_count == 0 and dog.status == DogStatus.pending:
                    dog.status = DogStatus.available
            db.add(dog)

        await db.flush()
        await db.refresh(adoption)
        return adoption

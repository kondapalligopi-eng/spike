from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate


class UserService:
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(
            select(User).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create(
        db: AsyncSession,
        payload: UserCreate,
        role: UserRole = UserRole.user,
    ) -> User:
        user = User(
            email=payload.email.lower().strip(),
            hashed_password=hash_password(payload.password),
            full_name=payload.full_name,
            phone=payload.phone,
            role=role,
            is_active=True,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def update(
        db: AsyncSession,
        user: User,
        payload: UserUpdate,
    ) -> User:
        update_data = payload.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        db.add(user)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def email_exists(db: AsyncSession, email: str) -> bool:
        result = await db.execute(
            select(User.id).where(User.email == email.lower().strip())
        )
        return result.scalar_one_or_none() is not None

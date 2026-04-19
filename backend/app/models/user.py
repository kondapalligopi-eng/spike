from __future__ import annotations

import enum
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDBase

if TYPE_CHECKING:
    from app.models.dog import Dog
    from app.models.adoption import Adoption


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class User(UUIDBase):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="userrole"), nullable=False, default=UserRole.user
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Relationships
    dogs: Mapped[List["Dog"]] = relationship(
        "Dog", back_populates="owner", cascade="all, delete-orphan"
    )
    adoption_requests: Mapped[List["Adoption"]] = relationship(
        "Adoption",
        foreign_keys="[Adoption.requester_id]",
        back_populates="requester",
    )
    adoption_owner_requests: Mapped[List["Adoption"]] = relationship(
        "Adoption",
        foreign_keys="[Adoption.owner_id]",
        back_populates="owner",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"

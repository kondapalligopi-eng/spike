from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDBase

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.adoption import Adoption


class DogSize(str, enum.Enum):
    small = "small"
    medium = "medium"
    large = "large"
    extra_large = "extra_large"


class DogGender(str, enum.Enum):
    male = "male"
    female = "female"


class DogStatus(str, enum.Enum):
    available = "available"
    adopted = "adopted"
    pending = "pending"


class Dog(UUIDBase):
    __tablename__ = "dogs"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    breed: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    age_months: Mapped[int] = mapped_column(Integer, nullable=False)
    size: Mapped[DogSize] = mapped_column(
        Enum(DogSize, name="dogsize"), nullable=False
    )
    gender: Mapped[DogGender] = mapped_column(
        Enum(DogGender, name="doggender"), nullable=False
    )
    color: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[DogStatus] = mapped_column(
        Enum(DogStatus, name="dogstatus"),
        nullable=False,
        default=DogStatus.available,
        index=True,
    )
    is_vaccinated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_neutered: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    images: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="dogs")
    adoptions: Mapped[List["Adoption"]] = relationship(
        "Adoption", back_populates="dog", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Dog id={self.id} name={self.name} breed={self.breed}>"

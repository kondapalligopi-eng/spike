from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDBase

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.dog import Dog


class AdoptionStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"


class Adoption(UUIDBase):
    __tablename__ = "adoptions"

    dog_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dogs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    requester_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status: Mapped[AdoptionStatus] = mapped_column(
        Enum(AdoptionStatus, name="adoptionstatus"),
        nullable=False,
        default=AdoptionStatus.pending,
        index=True,
    )
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")

    # Relationships
    dog: Mapped["Dog"] = relationship("Dog", back_populates="adoptions")
    requester: Mapped["User"] = relationship(
        "User",
        foreign_keys=[requester_id],
        back_populates="adoption_requests",
    )
    owner: Mapped["User"] = relationship(
        "User",
        foreign_keys=[owner_id],
        back_populates="adoption_owner_requests",
    )

    def __repr__(self) -> str:
        return f"<Adoption id={self.id} dog_id={self.dog_id} status={self.status}>"

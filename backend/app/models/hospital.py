from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDBase


class Hospital(UUIDBase):
    """Vet-hospital directory listings added by admins."""

    __tablename__ = "hospitals"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    locality: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    specialties: Mapped[str | None] = mapped_column(String(500), nullable=True)
    rating: Mapped[str | None] = mapped_column(String(8), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    hours: Mapped[str | None] = mapped_column(String(120), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    def __repr__(self) -> str:
        return f"<Hospital id={self.id} name={self.name}>"

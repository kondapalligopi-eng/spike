from __future__ import annotations

from sqlalchemy import Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDBase


class Park(UUIDBase):
    """Dog-friendly park directory listings."""

    __tablename__ = "parks"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    locality: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    hours: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cost: Mapped[str | None] = mapped_column(String(255), nullable=True)
    off_leash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    features: Mapped[str | None] = mapped_column(String(500), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    highlights: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    def __repr__(self) -> str:
        return f"<Park id={self.id} name={self.name}>"

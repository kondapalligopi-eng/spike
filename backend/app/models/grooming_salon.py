from __future__ import annotations

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDBase


class GroomingSalon(UUIDBase):
    """Pet grooming salon directory listings."""

    __tablename__ = "grooming_salons"

    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    area: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(255), nullable=False, default="Bengaluru")
    state: Mapped[str] = mapped_column(String(64), nullable=False, default="KA")
    address: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    rating_avg: Mapped[float] = mapped_column(Float, nullable=False, default=4.5)
    rating_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tint: Mapped[str] = mapped_column(
        String(120), nullable=False, default="from-amber-200 to-amber-400"
    )
    hero_emoji: Mapped[str] = mapped_column(String(20), nullable=False, default="✂️")
    hours: Mapped[str | None] = mapped_column(String(120), nullable=True)

    def __repr__(self) -> str:
        return f"<GroomingSalon id={self.id} name={self.name}>"

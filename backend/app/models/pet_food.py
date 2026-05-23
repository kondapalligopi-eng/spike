from __future__ import annotations

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDBase


class PetFood(UUIDBase):
    """Pet food / supplies product listings shown on /pet-supplies."""

    __tablename__ = "pet_foods"

    brand: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    emoji: Mapped[str] = mapped_column(String(16), nullable=False, default="🥫")
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=4.5)
    reviews: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    per_unit: Mapped[str] = mapped_column(String(40), nullable=False, default="—")
    list_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sale_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    save_pct: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sponsored: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    deal: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    lifestage: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)
    form: Mapped[str | None] = mapped_column(String(40), nullable=True, index=True)

    def __repr__(self) -> str:
        return f"<PetFood id={self.id} brand={self.brand}>"

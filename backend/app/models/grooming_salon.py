from __future__ import annotations

from sqlalchemy import JSON, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDBase


DEFAULT_HOURS: list[dict[str, str]] = [
    {"day": "Mon", "hours": "8am – 8pm"},
    {"day": "Tue", "hours": "8am – 8pm"},
    {"day": "Wed", "hours": "8am – 8pm"},
    {"day": "Thu", "hours": "8am – 8pm"},
    {"day": "Fri", "hours": "8am – 8pm"},
    {"day": "Sat", "hours": "8am – 9pm"},
    {"day": "Sun", "hours": "9am – 6pm"},
]


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
    # Stored as [{day: "Mon", hours: "8am – 8pm"}, ...] so the detail page
    # can render the per-day table the admin set instead of the hardcoded
    # fallback in the frontend.
    hours: Mapped[list[dict[str, str]]] = mapped_column(
        JSON, nullable=False, default=lambda: list(DEFAULT_HOURS)
    )
    open_today_until: Mapped[str | None] = mapped_column(String(40), nullable=True)

    def __repr__(self) -> str:
        return f"<GroomingSalon id={self.id} name={self.name}>"

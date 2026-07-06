from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import TimestampMixin


class AppCounter(Base, TimestampMixin):
    """A tiny key/int counter store — e.g. the site-wide "thumbs up" tally.

    Generic on purpose so other simple counters can reuse it without new tables.
    """

    __tablename__ = "app_counters"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    def __repr__(self) -> str:
        return f"<AppCounter key={self.key} value={self.value}>"

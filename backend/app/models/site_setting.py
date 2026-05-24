from __future__ import annotations

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import TimestampMixin
from app.database import Base


class SiteSetting(Base, TimestampMixin):
    """Site-wide on/off flags the admin controls from /admin.

    Currently used for "is this service live?" toggles — e.g. flipping
    pet_supplies_enabled to false makes /pet-supplies render a Coming Soon
    splash instead of the catalogue.

    Kept as a simple key/bool table so adding a new flag is just one row;
    no migration or schema change needed at the storage layer.
    """

    __tablename__ = "site_settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    def __repr__(self) -> str:
        return f"<SiteSetting key={self.key} enabled={self.enabled}>"

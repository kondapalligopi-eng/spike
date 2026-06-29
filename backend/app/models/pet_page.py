from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDBase

if TYPE_CHECKING:
    from app.models.user import User


class PetPage(UUIDBase):
    """A public, shareable profile/story page for a pet, created by its owner.

    Lives at hispike.in/pet/<slug>. `photos[0]` is the cover; `highlights` are
    keys from a curated trait list rendered as the public Highlights row.
    """

    __tablename__ = "pet_pages"

    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    photos: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    highlights: Mapped[List[str]] = mapped_column(JSON, nullable=False, default=list)
    memories: Mapped[str] = mapped_column(Text, nullable=False, default="")

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    owner: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<PetPage id={self.id} slug={self.slug}>"

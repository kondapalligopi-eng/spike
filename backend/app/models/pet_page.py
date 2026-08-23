from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import Boolean, ForeignKey, JSON, String, Text, false
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

    #: Opt-in to being listed publicly — the /pet-stories gallery and the login
    #: showcase both filter on this. A page is always reachable by its own link;
    #: this flag only governs whether HiSpike *advertises* it, which is a real
    #: privacy step up (a listed page is browsable by strangers and indexable by
    #: Google). Defaults off so listing is always something an owner chose.
    show_in_gallery: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=false()
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    owner: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<PetPage id={self.id} slug={self.slug}>"

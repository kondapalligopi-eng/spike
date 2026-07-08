from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDBase

if TYPE_CHECKING:
    from app.models.user import User


class EmailOtp(UUIDBase):
    """A single-use email login code (OTP).

    Only a SHA-256 hash of the numeric code is stored — the raw code travels
    only in the email — so a DB leak can't be used to log in. `attempts` caps
    brute-force guessing; `used_at` marks it consumed after a successful login.
    """

    __tablename__ = "email_otps"

    code_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    attempts: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user: Mapped["User"] = relationship("User")

    def __repr__(self) -> str:
        return f"<EmailOtp user_id={self.user_id} used={self.used_at is not None}>"

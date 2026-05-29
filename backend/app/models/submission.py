from __future__ import annotations

from sqlalchemy import JSON, Boolean, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import UUIDBase


class Submission(UUIDBase):
    """Public form submissions (feedback + 'list your …' requests).

    Replaces the old FormSubmit email integration, which silently dropped
    mail at GoDaddy's filter. Submissions land here and are reviewed in the
    admin dashboard instead — no email-deliverability dependency.

    `kind` tags which form it came from; `data` holds the raw label→value
    pairs that form submitted, so each form can carry its own field set
    without a column-per-field schema.
    """

    __tablename__ = "submissions"

    kind: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    data: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    handled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    def __repr__(self) -> str:
        return f"<Submission id={self.id} kind={self.kind} handled={self.handled}>"

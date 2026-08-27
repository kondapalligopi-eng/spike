from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

# Forms we accept. Anything outside this set is rejected so the public
# endpoint can't be used to store arbitrary tagged junk.
ALLOWED_KINDS = {"feedback", "hospital", "park", "swimming", "grooming"}


class SubmissionCreate(BaseModel):
    kind: str = Field(..., min_length=2, max_length=32)
    data: dict[str, Any] = Field(default_factory=dict)


class SubmissionUpdate(BaseModel):
    handled: bool
    #: Set true to email the submitter that their listing is now live.
    #: Deliberately a separate opt-in rather than firing on handled=True.
    notify_submitter: bool = False


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    kind: str
    data: dict[str, Any]
    handled: bool
    notified_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

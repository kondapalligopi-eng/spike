from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GroomingSalonBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    area: str = Field(..., min_length=2, max_length=255)
    city: str = Field("Bengaluru", max_length=255)
    state: str = Field("KA", max_length=64)
    address: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=4, max_length=40)
    rating_avg: float = Field(4.5, ge=0, le=5)
    rating_count: int = Field(0, ge=0)
    tint: str = Field("from-amber-200 to-amber-400", max_length=120)
    hero_emoji: str = Field("✂️", max_length=20)
    hours: str | None = Field(None, max_length=120)


class GroomingSalonCreate(GroomingSalonBase):
    pass


class GroomingSalonRead(GroomingSalonBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

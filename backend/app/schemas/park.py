from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ParkBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    locality: str = Field(..., min_length=2, max_length=255)
    rating: int = Field(4, ge=1, le=5)
    image_url: str | None = Field(None, max_length=500)
    address: str = Field(..., min_length=2)
    hours: str | None = Field(None, max_length=255)
    cost: str | None = Field(None, max_length=255)
    off_leash: str | None = Field(None, max_length=255)
    features: str | None = Field(None, max_length=500)
    phone: str | None = Field(None, max_length=40)
    website: str | None = Field(None, max_length=500)
    highlights: list[str] = Field(default_factory=list)


class ParkCreate(ParkBase):
    pass


class ParkRead(ParkBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

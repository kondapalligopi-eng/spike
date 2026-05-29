from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class HospitalBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    locality: str = Field(..., min_length=2, max_length=120)
    address: str = Field(..., min_length=2)
    phone: str = Field(..., min_length=4, max_length=40)
    specialties: str | None = Field(None, max_length=500)
    rating: str | None = Field(None, max_length=8)
    website: str | None = Field(None, max_length=500)
    hours: str | None = Field(None, max_length=120)
    email: str | None = Field(None, max_length=255)


class HospitalCreate(HospitalBase):
    pass


class HospitalRead(HospitalBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

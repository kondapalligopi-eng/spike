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


class HospitalListRead(HospitalBase):
    """The public list payload — deliberately narrower than HospitalRead.

    created_at/updated_at are rendered nowhere on the site, and publishing them
    hands anyone reading the network tab a precise picture of how fast the
    directory grows and how often it is refreshed. `id` stays: the admin table
    edits and deletes by it, and a random UUID leaks nothing about row counts
    the way a sequential key would.
    """

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID

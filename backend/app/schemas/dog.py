from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.models.dog import DogGender, DogSize, DogStatus
from app.schemas.user import UserPublicResponse


class DogCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    breed: str = Field(min_length=1, max_length=255)
    age_months: int = Field(ge=0, le=360)
    size: DogSize
    gender: DogGender
    color: str = Field(min_length=1, max_length=100)
    description: str = Field(default="", max_length=5000)
    is_vaccinated: bool = False
    is_neutered: bool = False


class DogUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    breed: str | None = Field(default=None, min_length=1, max_length=255)
    age_months: int | None = Field(default=None, ge=0, le=360)
    size: DogSize | None = None
    gender: DogGender | None = None
    color: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = Field(default=None, max_length=5000)
    status: DogStatus | None = None
    is_vaccinated: bool | None = None
    is_neutered: bool | None = None


class DogResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    name: str
    breed: str
    age_months: int
    size: DogSize
    gender: DogGender
    color: str
    description: str
    status: DogStatus
    is_vaccinated: bool
    is_neutered: bool
    images: List[str]
    owner_id: uuid.UUID
    owner: UserPublicResponse | None = None
    created_at: datetime
    updated_at: datetime


class DogListResponse(BaseModel):
    items: List[DogResponse]
    total: int
    page: int
    limit: int
    pages: int

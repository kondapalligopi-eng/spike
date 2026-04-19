from __future__ import annotations

import uuid
from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.models.adoption import AdoptionStatus
from app.schemas.user import UserPublicResponse


class AdoptionCreate(BaseModel):
    dog_id: uuid.UUID
    message: str = Field(default="", max_length=2000)


class AdoptionUpdate(BaseModel):
    status: AdoptionStatus


class AdoptionResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: uuid.UUID
    dog_id: uuid.UUID
    requester_id: uuid.UUID
    owner_id: uuid.UUID
    status: AdoptionStatus
    message: str
    requester: UserPublicResponse | None = None
    owner: UserPublicResponse | None = None
    created_at: datetime
    updated_at: datetime


class AdoptionListResponse(BaseModel):
    items: List[AdoptionResponse]
    total: int
    page: int
    limit: int
    pages: int

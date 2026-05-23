from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PetFoodBase(BaseModel):
    brand: str = Field(..., min_length=1, max_length=120)
    name: str = Field(..., min_length=2)
    image_url: str | None = Field(None, max_length=500)
    emoji: str = Field("🥫", max_length=16)
    rating: float = Field(4.5, ge=0, le=5)
    reviews: int = Field(0, ge=0)
    price: int = Field(..., ge=0)
    per_unit: str = Field("—", max_length=40)
    list_price: int | None = Field(None, ge=0)
    sale_price: int | None = Field(None, ge=0)
    save_pct: int | None = Field(None, ge=0, le=100)
    sponsored: bool = False
    deal: bool = False
    lifestage: str | None = Field(None, max_length=40)
    form: str | None = Field(None, max_length=40)


class PetFoodCreate(PetFoodBase):
    pass


class PetFoodRead(PetFoodBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

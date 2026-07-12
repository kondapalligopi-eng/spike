from __future__ import annotations

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Mirrors the frontend: lowercase letters/numbers separated by single dashes.
_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# Reserved so they never collide with sub-paths we may add under /petshop/.
RESERVED_SLUGS = {"new", "create", "edit", "me", "mine", "admin"}


# --- Products -----------------------------------------------------------------


class ShopProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=160)
    price: str | None = Field(default=None, max_length=40)
    description: str = Field("", max_length=2000)
    photo_url: str | None = Field(default=None, max_length=1024)


class ShopProductCreate(ShopProductBase):
    pass


class ShopProductRead(ShopProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shop_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# --- Updates ------------------------------------------------------------------


class ShopUpdateBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=160)
    body: str = Field("", max_length=2000)


class ShopUpdateCreate(ShopUpdateBase):
    pass


class ShopUpdateRead(ShopUpdateBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shop_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# --- Shop ---------------------------------------------------------------------


class PetShopBase(BaseModel):
    slug: str = Field(..., min_length=2, max_length=60)
    name: str = Field(..., min_length=1, max_length=120)
    logo_url: str | None = Field(default=None, max_length=1024)
    about: str = Field("", max_length=4000)
    area: str | None = Field(default=None, max_length=160)
    hours: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    whatsapp: str | None = Field(default=None, max_length=40)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, v: str) -> str:
        v = v.strip().lower()
        if not _SLUG_RE.match(v):
            raise ValueError("Link may contain only lowercase letters, numbers and dashes")
        if v in RESERVED_SLUGS:
            raise ValueError("That link is reserved — choose another")
        return v


class PetShopCreate(PetShopBase):
    pass


class PetShopSummary(PetShopBase):
    """Shop without its products/updates — for lists (recent, admin, mine)."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class PetShopRead(PetShopSummary):
    """Full shop with its products and updates — for the public page."""

    products: list[ShopProductRead] = Field(default_factory=list)
    updates: list[ShopUpdateRead] = Field(default_factory=list)

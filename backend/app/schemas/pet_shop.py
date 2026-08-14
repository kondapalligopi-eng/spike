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
    category: str | None = Field(default=None, max_length=60)


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
    badge: str | None = Field(default=None, max_length=24)


class ShopUpdateCreate(ShopUpdateBase):
    pass


class ShopUpdateRead(ShopUpdateBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shop_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# --- Gallery photos -----------------------------------------------------------


class ShopPhotoBase(BaseModel):
    photo_url: str = Field(..., min_length=1, max_length=1024)
    caption: str | None = Field(default=None, max_length=160)


class ShopPhotoCreate(ShopPhotoBase):
    pass


class ShopPhotoRead(ShopPhotoBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shop_id: uuid.UUID
    created_at: datetime
    updated_at: datetime


# --- Orders -------------------------------------------------------------------


class OrderItem(BaseModel):
    product_id: str = Field(..., max_length=64)
    name: str = Field(..., min_length=1, max_length=200)
    unit_price: float = Field(..., ge=0)
    qty: int = Field(..., ge=1, le=999)


class ShopOrderCreate(BaseModel):
    buyer_name: str = Field(..., min_length=1, max_length=120)
    buyer_phone: str = Field(..., min_length=3, max_length=40)
    buyer_email: str | None = Field(default=None, max_length=255)
    buyer_address: str = Field(..., min_length=1, max_length=1000)
    note: str = Field("", max_length=1000)
    items: list[OrderItem] = Field(..., min_length=1)


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(placed|paid|delivered|cancelled)$")


class ShopOrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    shop_id: uuid.UUID
    user_id: uuid.UUID | None = None
    buyer_name: str
    buyer_phone: str
    buyer_address: str
    note: str
    items: list[OrderItem]
    total: float
    status: str
    created_at: datetime
    updated_at: datetime


# --- Shop ---------------------------------------------------------------------


class PetShopBase(BaseModel):
    slug: str = Field(..., min_length=2, max_length=60)
    name: str = Field(..., min_length=1, max_length=120)
    logo_url: str | None = Field(default=None, max_length=1024)
    hero_url: str | None = Field(default=None, max_length=1024)
    about: str = Field("", max_length=4000)
    offer: str | None = Field(default=None, max_length=200)
    area: str | None = Field(default=None, max_length=160)
    hours: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    whatsapp: str | None = Field(default=None, max_length=40)
    free_delivery_over: str | None = Field(default=None, max_length=40)
    delivery_radius: str | None = Field(default=None, max_length=40)
    payment_url: str | None = Field(default=None, max_length=1024)
    upi_id: str | None = Field(default=None, max_length=100)

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
    photos: list[ShopPhotoRead] = Field(default_factory=list)

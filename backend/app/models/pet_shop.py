from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import UUIDBase

if TYPE_CHECKING:
    from app.models.user import User


class PetShop(UUIDBase):
    """An owner-created storefront page for a pet shop.

    Lives at hispike.in/petshop/<slug>. Like a Pet Story, it's created and
    managed by the signed-in owner (admins can moderate). Products and updates
    hang off it; customers reach the shop via WhatsApp/phone (no on-site
    checkout yet).
    """

    __tablename__ = "pet_shops"

    slug: Mapped[str] = mapped_column(String(80), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    logo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    about: Mapped[str] = mapped_column(Text, nullable=False, default="")
    area: Mapped[str | None] = mapped_column(String(160), nullable=True)
    hours: Mapped[str | None] = mapped_column(String(120), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(40), nullable=True)

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    owner: Mapped["User"] = relationship("User")
    products: Mapped[List["ShopProduct"]] = relationship(
        "ShopProduct",
        back_populates="shop",
        cascade="all, delete-orphan",
        order_by="ShopProduct.created_at",
    )
    updates: Mapped[List["ShopUpdate"]] = relationship(
        "ShopUpdate",
        back_populates="shop",
        cascade="all, delete-orphan",
        order_by="ShopUpdate.created_at.desc()",
    )

    def __repr__(self) -> str:
        return f"<PetShop id={self.id} slug={self.slug}>"


class ShopProduct(UUIDBase):
    """A single item a shop lists. `price` is a free-text label (e.g. "₹499",
    "From ₹1,299", "Ask for price") so shops aren't forced into one currency
    format while there's no checkout."""

    __tablename__ = "shop_products"

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    price: Mapped[str | None] = mapped_column(String(40), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    photo_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    shop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pet_shops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    shop: Mapped["PetShop"] = relationship("PetShop", back_populates="products")

    def __repr__(self) -> str:
        return f"<ShopProduct id={self.id} name={self.name}>"


class ShopUpdate(UUIDBase):
    """A shop's "what's new" post — the customer-facing updates feed."""

    __tablename__ = "shop_updates"

    title: Mapped[str] = mapped_column(String(160), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False, default="")

    shop_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pet_shops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    shop: Mapped["PetShop"] = relationship("PetShop", back_populates="updates")

    def __repr__(self) -> str:
        return f"<ShopUpdate id={self.id} title={self.title}>"

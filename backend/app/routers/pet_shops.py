from __future__ import annotations

import html
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from fastapi.responses import HTMLResponse
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_current_active_user, require_admin
from app.database import get_db
from app.models.pet_shop import PetShop, ShopProduct, ShopUpdate
from app.models.user import User, UserRole
from app.schemas.pet_shop import (
    PetShopCreate,
    PetShopRead,
    PetShopSummary,
    ShopProductCreate,
    ShopProductRead,
    ShopUpdateCreate,
    ShopUpdateRead,
)
from app.services.storage_service import storage

router = APIRouter(prefix="/pet-shops", tags=["pet-shops"])

SITE_URL = "https://hispike.in"
DEFAULT_OG_IMAGE = f"{SITE_URL}/logo.png"


def _og_html(*, title: str, description: str, image: str, url: str) -> str:
    t = html.escape(title)
    d = html.escape(description)
    img = html.escape(image, quote=True)
    u = html.escape(url, quote=True)
    return (
        "<!DOCTYPE html>\n"
        '<html lang="en"><head>\n'
        '<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        f"<title>{t}</title>\n"
        f'<meta name="description" content="{d}">\n'
        f'<link rel="canonical" href="{u}">\n'
        '<meta property="og:type" content="website">\n'
        '<meta property="og:site_name" content="HiSpike">\n'
        f'<meta property="og:title" content="{t}">\n'
        f'<meta property="og:description" content="{d}">\n'
        f'<meta property="og:image" content="{img}">\n'
        f'<meta property="og:url" content="{u}">\n'
        '<meta name="twitter:card" content="summary_large_image">\n'
        f'<meta name="twitter:title" content="{t}">\n'
        f'<meta name="twitter:description" content="{d}">\n'
        f'<meta name="twitter:image" content="{img}">\n'
        "</head><body>\n"
        f"<p>{t}</p>\n"
        f'<p><a href="{u}">View this shop on HiSpike</a></p>\n'
        "</body></html>"
    )


# --- helpers ------------------------------------------------------------------


async def _get_shop_or_404(db: AsyncSession, shop_id: uuid.UUID) -> PetShop:
    result = await db.execute(select(PetShop).where(PetShop.id == shop_id))
    shop = result.scalar_one_or_none()
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")
    return shop


async def _get_full_shop(db: AsyncSession, shop_id: uuid.UUID) -> PetShop:
    """Shop with products + updates eagerly loaded (async can't lazy-load)."""
    result = await db.execute(
        select(PetShop)
        .options(selectinload(PetShop.products), selectinload(PetShop.updates))
        .where(PetShop.id == shop_id)
    )
    shop = result.scalar_one_or_none()
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")
    return shop


def _require_owner_or_admin(shop: PetShop, user: User) -> None:
    if shop.owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own shop",
        )


async def _slug_taken(db: AsyncSession, slug: str, exclude_id: uuid.UUID | None = None) -> bool:
    stmt = select(PetShop.id).where(func.lower(PetShop.slug) == slug.lower())
    if exclude_id is not None:
        stmt = stmt.where(PetShop.id != exclude_id)
    result = await db.execute(stmt)
    return result.first() is not None


def _apply_shop_payload(shop: PetShop, payload: PetShopCreate) -> None:
    shop.slug = payload.slug
    shop.name = payload.name.strip()
    shop.logo_url = payload.logo_url
    shop.about = payload.about.strip()
    shop.area = payload.area.strip() if payload.area else None
    shop.hours = payload.hours.strip() if payload.hours else None
    shop.phone = payload.phone.strip() if payload.phone else None
    shop.whatsapp = payload.whatsapp.strip() if payload.whatsapp else None


async def _product_or_404(db: AsyncSession, product_id: uuid.UUID) -> ShopProduct:
    result = await db.execute(select(ShopProduct).where(ShopProduct.id == product_id))
    product = result.scalar_one_or_none()
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


async def _update_or_404(db: AsyncSession, update_id: uuid.UUID) -> ShopUpdate:
    result = await db.execute(select(ShopUpdate).where(ShopUpdate.id == update_id))
    upd = result.scalar_one_or_none()
    if upd is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update not found")
    return upd


# --- specific routes before "/{shop_id}" so they aren't captured --------------


@router.get(
    "",
    response_model=list[PetShopSummary],
    summary="List every shop (admin — for moderation)",
)
async def list_all_shops(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[PetShopSummary]:
    result = await db.execute(select(PetShop).order_by(desc(PetShop.created_at)))
    return [PetShopSummary.model_validate(r) for r in result.scalars().all()]


@router.get(
    "/recent",
    response_model=list[PetShopSummary],
    summary="Recent public shops (for showcases / directory teasers)",
)
async def recent_shops(
    limit: int = 8,
    db: AsyncSession = Depends(get_db),
) -> list[PetShopSummary]:
    limit = max(1, min(limit, 24))
    result = await db.execute(
        select(PetShop).order_by(desc(PetShop.created_at)).limit(limit)
    )
    return [PetShopSummary.model_validate(r) for r in result.scalars().all()]


@router.get(
    "/mine",
    response_model=list[PetShopSummary],
    summary="List the signed-in owner's shops",
)
async def list_my_shops(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[PetShopSummary]:
    result = await db.execute(
        select(PetShop)
        .where(PetShop.owner_id == current_user.id)
        .order_by(desc(PetShop.created_at))
    )
    return [PetShopSummary.model_validate(r) for r in result.scalars().all()]


@router.get(
    "/by-slug/{slug}",
    response_model=PetShopRead,
    summary="Get a public shop (with products + updates) by its slug",
)
async def get_shop_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> PetShopRead:
    result = await db.execute(
        select(PetShop)
        .options(selectinload(PetShop.products), selectinload(PetShop.updates))
        .where(func.lower(PetShop.slug) == slug.lower())
    )
    shop = result.scalar_one_or_none()
    if shop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shop not found")
    return PetShopRead.model_validate(shop)


@router.get(
    "/og/{slug}",
    response_class=HTMLResponse,
    include_in_schema=False,
    summary="Server-rendered OG/meta page for link-preview crawlers",
)
async def shop_og(slug: str, db: AsyncSession = Depends(get_db)) -> HTMLResponse:
    result = await db.execute(select(PetShop).where(func.lower(PetShop.slug) == slug.lower()))
    shop = result.scalar_one_or_none()
    shop_url = f"{SITE_URL}/petshop/{slug}"
    cache = {"Cache-Control": "public, max-age=300"}

    if shop is None:
        body = _og_html(
            title="HiSpike — Pet Shops",
            description="Discover local pet shops and their products on HiSpike.",
            image=DEFAULT_OG_IMAGE,
            url=shop_url,
        )
        return HTMLResponse(content=body, headers=cache)

    desc_txt = " ".join(shop.about.split())[:155]
    if not desc_txt:
        area = f" in {shop.area}" if shop.area else ""
        desc_txt = f"{shop.name}{area} — see products & updates on HiSpike."
    body = _og_html(
        title=f"{shop.name} — Pet Shop on HiSpike",
        description=desc_txt,
        image=shop.logo_url or DEFAULT_OG_IMAGE,
        url=shop_url,
    )
    return HTMLResponse(content=body, headers=cache)


@router.get(
    "/slug-available/{slug}",
    summary="Check whether a shop slug is free",
)
async def slug_available(
    slug: str,
    exclude_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db),
) -> dict[str, bool]:
    taken = await _slug_taken(db, slug, exclude_id)
    return {"available": not taken}


@router.post(
    "/photos",
    summary="Upload a shop logo or product photo; returns its hosted URL",
)
async def upload_shop_photo(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP, GIF; max 10 MB)"),
    current_user: User = Depends(get_current_active_user),
) -> dict[str, str]:
    url = await storage.upload_image(file, folder=f"petdogs/pet-shops/{current_user.id}")
    return {"url": url}


# --- Products (owner or admin) ------------------------------------------------


@router.post(
    "/{shop_id}/products",
    response_model=ShopProductRead,
    status_code=status.HTTP_201_CREATED,
    summary="Add a product to a shop",
)
async def add_product(
    shop_id: uuid.UUID,
    payload: ShopProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ShopProductRead:
    shop = await _get_shop_or_404(db, shop_id)
    _require_owner_or_admin(shop, current_user)
    product = ShopProduct(
        shop_id=shop.id,
        name=payload.name.strip(),
        price=payload.price.strip() if payload.price else None,
        description=payload.description.strip(),
        photo_url=payload.photo_url,
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return ShopProductRead.model_validate(product)


@router.put(
    "/products/{product_id}",
    response_model=ShopProductRead,
    summary="Update a product",
)
async def update_product(
    product_id: uuid.UUID,
    payload: ShopProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ShopProductRead:
    product = await _product_or_404(db, product_id)
    shop = await _get_shop_or_404(db, product.shop_id)
    _require_owner_or_admin(shop, current_user)
    product.name = payload.name.strip()
    product.price = payload.price.strip() if payload.price else None
    product.description = payload.description.strip()
    product.photo_url = payload.photo_url
    await db.flush()
    await db.refresh(product)
    return ShopProductRead.model_validate(product)


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
)
async def delete_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Response:
    product = await _product_or_404(db, product_id)
    shop = await _get_shop_or_404(db, product.shop_id)
    _require_owner_or_admin(shop, current_user)
    await db.delete(product)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Updates (owner or admin) -------------------------------------------------


@router.post(
    "/{shop_id}/updates",
    response_model=ShopUpdateRead,
    status_code=status.HTTP_201_CREATED,
    summary="Post an update to a shop's feed",
)
async def add_update(
    shop_id: uuid.UUID,
    payload: ShopUpdateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ShopUpdateRead:
    shop = await _get_shop_or_404(db, shop_id)
    _require_owner_or_admin(shop, current_user)
    upd = ShopUpdate(shop_id=shop.id, title=payload.title.strip(), body=payload.body.strip())
    db.add(upd)
    await db.flush()
    await db.refresh(upd)
    return ShopUpdateRead.model_validate(upd)


@router.delete(
    "/updates/{update_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete an update",
)
async def delete_update(
    update_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Response:
    upd = await _update_or_404(db, update_id)
    shop = await _get_shop_or_404(db, upd.shop_id)
    _require_owner_or_admin(shop, current_user)
    await db.delete(upd)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Shop CRUD ----------------------------------------------------------------


@router.post(
    "",
    response_model=PetShopRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a shop (owner only)",
)
async def create_shop(
    payload: PetShopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PetShopRead:
    if await _slug_taken(db, payload.slug):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That link is already taken — try another.",
        )
    shop = PetShop(owner_id=current_user.id)
    _apply_shop_payload(shop, payload)
    db.add(shop)
    await db.flush()
    return PetShopRead.model_validate(await _get_full_shop(db, shop.id))


@router.put(
    "/{shop_id}",
    response_model=PetShopRead,
    summary="Update a shop's details (owner or admin)",
)
async def update_shop(
    shop_id: uuid.UUID,
    payload: PetShopCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PetShopRead:
    shop = await _get_shop_or_404(db, shop_id)
    _require_owner_or_admin(shop, current_user)
    if await _slug_taken(db, payload.slug, exclude_id=shop_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That link is already taken — try another.",
        )
    _apply_shop_payload(shop, payload)
    await db.flush()
    return PetShopRead.model_validate(await _get_full_shop(db, shop.id))


@router.delete(
    "/{shop_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a shop (owner or admin)",
)
async def delete_shop(
    shop_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Response:
    shop = await _get_shop_or_404(db, shop_id)
    _require_owner_or_admin(shop, current_user)
    await db.delete(shop)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_active_user, require_admin
from app.database import get_db
from app.models.pet_page import PetPage
from app.models.user import User, UserRole
from app.schemas.pet_page import PetPageCreate, PetPageRead
from app.services.storage_service import storage

router = APIRouter(prefix="/pet-pages", tags=["pet-pages"])


async def _get_page_or_404(db: AsyncSession, page_id: uuid.UUID) -> PetPage:
    result = await db.execute(select(PetPage).where(PetPage.id == page_id))
    page = result.scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet page not found")
    return page


def _require_owner_or_admin(page: PetPage, user: User) -> None:
    if page.owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own pages",
        )


async def _slug_taken(db: AsyncSession, slug: str, exclude_id: uuid.UUID | None = None) -> bool:
    stmt = select(PetPage.id).where(func.lower(PetPage.slug) == slug.lower())
    if exclude_id is not None:
        stmt = stmt.where(PetPage.id != exclude_id)
    result = await db.execute(stmt)
    return result.first() is not None


def _apply_payload(page: PetPage, payload: PetPageCreate) -> None:
    page.slug = payload.slug
    page.name = payload.name.strip()
    page.photos = payload.photos
    page.highlights = payload.highlights
    page.memories = payload.memories.strip()


# --- specific routes declared before "/{page_id}" so they aren't captured ---


@router.get(
    "",
    response_model=list[PetPageRead],
    summary="List every pet page (admin — for moderation)",
)
async def list_all_pet_pages(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[PetPageRead]:
    result = await db.execute(select(PetPage).order_by(desc(PetPage.created_at)))
    return [PetPageRead.model_validate(r) for r in result.scalars().all()]


@router.get(
    "/mine",
    response_model=list[PetPageRead],
    summary="List the signed-in owner's pet pages",
)
async def list_my_pet_pages(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[PetPageRead]:
    result = await db.execute(
        select(PetPage)
        .where(PetPage.owner_id == current_user.id)
        .order_by(desc(PetPage.created_at))
    )
    return [PetPageRead.model_validate(r) for r in result.scalars().all()]


@router.get(
    "/by-slug/{slug}",
    response_model=PetPageRead,
    summary="Get a public pet page by its slug",
)
async def get_pet_page_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> PetPageRead:
    result = await db.execute(select(PetPage).where(func.lower(PetPage.slug) == slug.lower()))
    page = result.scalar_one_or_none()
    if page is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet page not found")
    return PetPageRead.model_validate(page)


@router.get(
    "/slug-available/{slug}",
    summary="Check whether a slug is free to use",
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
    summary="Upload a pet-page photo and return its hosted URL (owner only)",
)
async def upload_pet_page_photo(
    file: UploadFile = File(..., description="Image file (JPEG, PNG, WebP, GIF; max 10 MB)"),
    current_user: User = Depends(get_current_active_user),
) -> dict[str, str]:
    url = await storage.upload_image(file, folder=f"petdogs/pet-pages/{current_user.id}")
    return {"url": url}


@router.post(
    "",
    response_model=PetPageRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a pet page (owner only)",
)
async def create_pet_page(
    payload: PetPageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PetPageRead:
    if await _slug_taken(db, payload.slug):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That link is already taken — try another.",
        )
    page = PetPage(owner_id=current_user.id)
    _apply_payload(page, payload)
    db.add(page)
    await db.flush()
    await db.refresh(page)
    return PetPageRead.model_validate(page)


@router.put(
    "/{page_id}",
    response_model=PetPageRead,
    summary="Update a pet page (owner or admin)",
)
async def update_pet_page(
    page_id: uuid.UUID,
    payload: PetPageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> PetPageRead:
    page = await _get_page_or_404(db, page_id)
    _require_owner_or_admin(page, current_user)
    if await _slug_taken(db, payload.slug, exclude_id=page_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="That link is already taken — try another.",
        )
    _apply_payload(page, payload)
    await db.flush()
    await db.refresh(page)
    return PetPageRead.model_validate(page)


@router.delete(
    "/{page_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a pet page (owner or admin)",
)
async def delete_pet_page(
    page_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Response:
    page = await _get_page_or_404(db, page_id)
    _require_owner_or_admin(page, current_user)
    await db.delete(page)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

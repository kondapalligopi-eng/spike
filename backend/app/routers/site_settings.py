from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.site_setting import SiteSetting
from app.models.user import User
from app.schemas.site_setting import SiteSettingRead, SiteSettingUpdate

router = APIRouter(prefix="/site-settings", tags=["site_settings"])

# Flags we promise will exist on a GET, even if no row has been written yet.
# Anything missing from the DB falls back to True so a brand-new deploy with
# an empty table doesn't accidentally hide live services.
DEFAULT_FLAGS: dict[str, bool] = {
    "pet_supplies_enabled": True,
}


@router.get(
    "",
    response_model=list[SiteSettingRead],
    summary="List all site-wide visibility flags (public)",
)
async def list_site_settings(db: AsyncSession = Depends(get_db)) -> list[SiteSettingRead]:
    result = await db.execute(select(SiteSetting))
    rows = {r.key: r.enabled for r in result.scalars().all()}
    # Overlay DB values on top of defaults so every known flag is present.
    merged = {**DEFAULT_FLAGS, **rows}
    return [SiteSettingRead(key=k, enabled=v) for k, v in merged.items()]


@router.put(
    "/{key}",
    response_model=SiteSettingRead,
    summary="Update a site-wide visibility flag (admin only)",
)
async def upsert_site_setting(
    key: str,
    payload: SiteSettingUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> SiteSettingRead:
    result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
    row = result.scalar_one_or_none()
    if row is None:
        row = SiteSetting(key=key, enabled=payload.enabled)
        db.add(row)
    else:
        row.enabled = payload.enabled
    await db.flush()
    await db.refresh(row)
    return SiteSettingRead.model_validate(row)

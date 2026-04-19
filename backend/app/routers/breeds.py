from __future__ import annotations

from fastapi import APIRouter

from app.routers.dogs import BREEDS

router = APIRouter(prefix="/breeds", tags=["breeds"])


@router.get(
    "",
    response_model=list[str],
    summary="Get the full list of supported dog breeds for filter dropdowns",
)
async def list_breeds() -> list[str]:
    return sorted(BREEDS)

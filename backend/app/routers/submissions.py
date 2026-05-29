from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.submission import Submission
from app.models.user import User
from app.schemas.submission import (
    ALLOWED_KINDS,
    SubmissionCreate,
    SubmissionRead,
    SubmissionUpdate,
)

router = APIRouter(prefix="/submissions", tags=["submissions"])

# Cap stored field size so a public POST can't dump megabytes into the row.
_MAX_FIELDS = 30
_MAX_VALUE_LEN = 5000


@router.post(
    "",
    response_model=SubmissionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a public form (feedback / list-your-X) — no auth",
)
async def create_submission(
    payload: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
) -> SubmissionRead:
    kind = payload.kind.strip().lower()
    if kind not in ALLOWED_KINDS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown submission kind: {kind}",
        )
    # Defensive trim — coerce values to strings and cap counts/lengths so the
    # public endpoint can't be abused to store oversized payloads.
    cleaned: dict[str, str] = {}
    for i, (key, value) in enumerate(payload.data.items()):
        if i >= _MAX_FIELDS:
            break
        cleaned[str(key)[:120]] = str(value)[:_MAX_VALUE_LEN]

    row = Submission(kind=kind, data=cleaned, handled=False)
    db.add(row)
    await db.flush()
    await db.refresh(row)
    return SubmissionRead.model_validate(row)


@router.get(
    "",
    response_model=list[SubmissionRead],
    summary="List all submissions, newest first (admin only)",
)
async def list_submissions(
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> list[SubmissionRead]:
    result = await db.execute(select(Submission).order_by(desc(Submission.created_at)))
    return [SubmissionRead.model_validate(r) for r in result.scalars().all()]


@router.patch(
    "/{submission_id}",
    response_model=SubmissionRead,
    summary="Mark a submission handled/unhandled (admin only)",
)
async def update_submission(
    submission_id: uuid.UUID,
    payload: SubmissionUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> SubmissionRead:
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found"
        )
    row.handled = payload.handled
    await db.flush()
    await db.refresh(row)
    return SubmissionRead.model_validate(row)


@router.delete(
    "/{submission_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a submission (admin only)",
)
async def delete_submission(
    submission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _admin: User = Depends(require_admin),
) -> Response:
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Submission not found"
        )
    await db.delete(row)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

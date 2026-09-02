from __future__ import annotations

import uuid
from datetime import datetime, timezone
from html import escape
from urllib.parse import quote

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Response, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import require_admin
from app.database import get_db
from app.models.grooming_salon import GroomingSalon
from app.models.hospital import Hospital
from app.models.park import Park
from app.models.submission import Submission
from app.models.swim_school import SwimSchool
from app.models.user import User
from app.services import email_service, email_templates
from app.schemas.submission import (
    ALLOWED_KINDS,
    SubmissionCreate,
    SubmissionRead,
    SubmissionUpdate,
)

router = APIRouter(prefix="/submissions", tags=["submissions"])

SITE_URL = "https://hispike.in"

#: Where a live listing of each kind can be found. Feedback has no listing,
#: so it is absent and the notify action refuses for that kind.
_KIND_PATH = {
    "hospital": "/hospital",
    "park": "/park",
    "swimming": "/swimming",
    "grooming": "/grooming",
}

#: The columns each directory page searches, mirrored from the frontend so
#: this check approves exactly when the ?q= link would actually find the
#: listing. Keep in step with the filters in Hospital/Park/Swimming/Grooming.
_LISTING_MATCH = {
    "hospital": (Hospital, ("name", "locality", "specialties")),
    "park": (Park, ("name", "locality")),
    "swimming": (SwimSchool, ("name", "locality")),
    "grooming": (GroomingSalon, ("name", "area")),
}


async def _listing_exists(db: AsyncSession, kind: str, query: str) -> bool:
    """True when the ?q= link would land on at least one listing.

    Reproduces the page filter rather than comparing names: the admin often
    tidies a name while creating the listing ("Testing" -> "Testing Park"),
    and a substring match is what the page itself does, so an exact-name
    check would refuse sends that would in fact have worked.
    """
    model, columns = _LISTING_MATCH[kind]
    # Concatenate with + (renders as || on both Postgres and SQLite) rather
    # than concat_ws, which SQLite lacks. coalesce because optional columns
    # are nullable and NULL would poison the whole expression.
    haystack = func.coalesce(getattr(model, columns[0]), "")
    for col in columns[1:]:
        haystack = haystack + " " + func.coalesce(getattr(model, col), "")

    # Escape LIKE wildcards so a name containing % or _ cannot broaden the
    # match into a false positive.
    needle = query.lower().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    stmt = (
        select(model.id)
        .where(func.lower(haystack).like(f"%{needle}%", escape="\\"))
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none() is not None


#: Each form labels the name field differently.
_NAME_KEYS = ("Hospital name", "Park name", "Swim school name", "Salon name", "Name")


def _submitted_value(data: dict, *keys: str) -> str:
    """First non-placeholder value among `keys`.

    The forms write the literal string "(not provided)" for blank optional
    fields, so an empty check alone is not enough.
    """
    for k in keys:
        v = str(data.get(k, "") or "").strip()
        if v and v != "(not provided)":
            return v
    return ""


async def _send_live_email_safe(to: str, subject: str, html: str, text: str) -> None:
    """Never let a mail failure surface to the admin clicking the button."""
    try:
        await email_service.send_email(to, subject, html, text)
    except Exception as exc:  # noqa: BLE001
        print(f"[submissions] notify failed for {to}: {exc}")

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
    background_tasks: BackgroundTasks,
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

    if payload.notify_submitter:
        await _notify_submitter(row, background_tasks, db)

    await db.flush()
    await db.refresh(row)
    return SubmissionRead.model_validate(row)


async def _notify_submitter(
    row: Submission, background_tasks: BackgroundTasks, db: AsyncSession
) -> None:
    """Queue the "your listing is live" email, or explain why it cannot go.

    Raises rather than failing quietly: an admin who clicked the button needs
    to know it did not send, otherwise they assume the submitter was told.
    """
    if row.notified_at is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This submitter has already been notified.",
        )

    path = _KIND_PATH.get(row.kind)
    if path is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Nothing to announce for a '{row.kind}' submission.",
        )

    data = row.data or {}
    to = _submitted_value(data, "Email")
    if not to or "@" not in to:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No email address was given on this submission.",
        )

    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email is not configured on this server.",
        )

    name = _submitted_value(data, *_NAME_KEYS)
    if not name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This submission has no listing name to link to.",
        )

    # Do not promise someone their listing is live before it exists. Without
    # this the email goes out with a link to an empty page, which is a worse
    # first impression than no email at all.
    if not await _listing_exists(db, row.kind, name):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"No live {row.kind} listing matches '{name}' yet — "
                "create the listing first, then notify."
            ),
        )

    # Deep-links straight to their entry rather than the category page, using
    # the same ?q= the share links use.
    link = f"{SITE_URL}{path}?q={quote(name)}"

    subject = f"{name} is now live on HiSpike"
    text = (
        f"Hi,\n\n"
        f"Thanks for listing {name} with HiSpike — it is now live and people "
        f"searching in Bengaluru can find it.\n\n"
        f"See your listing: {link}\n\n"
        f"If anything needs correcting, just reply to this email and we will "
        f"sort it.\n\n"
        f"— The HiSpike team\n"
    )
    # Shares the branded shell (logo header, white card, footer) with the
    # login-code and password-reset mails, so this does not arrive looking
    # like it came from somewhere else.
    html = email_templates.listing_live_html(escape(name), escape(link))

    background_tasks.add_task(_send_live_email_safe, to, subject, html, text)
    row.notified_at = datetime.now(timezone.utc)


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

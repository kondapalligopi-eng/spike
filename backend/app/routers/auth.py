from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models.email_otp import EmailOtp
from app.models.password_reset_token import PasswordResetToken
from app.models.user import User, UserRole
from app.schemas.auth import (
    AccessToken,
    ForgotPasswordRequest,
    MessageResponse,
    RegisterOtpRequest,
    RequestOtpRequest,
    ResetPasswordRequest,
    Token,
    TokenRefresh,
    VerifyOtpRequest,
)
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services import email_service, email_templates
from app.services.user_service import UserService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


async def _send_reset_email_safe(to: str, subject: str, html: str, text: str) -> None:
    """Background email send — never raises (failures are logged, not surfaced)."""
    try:
        await email_service.send_email(to, subject, html, text)
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to send password-reset email to %s: %s", to, exc)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    if await UserService.email_exists(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    user = await UserService.create(db, payload)
    return UserResponse.model_validate(user)


@router.post(
    "/register-otp",
    response_model=MessageResponse,
    summary="Start a passwordless sign-up: create the account and email a login code",
)
async def register_otp(
    payload: RegisterOtpRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    if await UserService.email_exists(db, payload.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )
    if not email_service.is_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Email sign-up is unavailable right now. Please create an account with a password instead.",
        )

    # Passwordless account: store an unguessable random password so the row is
    # valid; the user signs in with email codes (or sets a password later via
    # the reset flow). The code emailed below verifies they own the address.
    user = User(
        email=payload.email.lower().strip(),
        hashed_password=hash_password(secrets.token_urlsafe(32)),
        full_name=payload.full_name,
        phone=payload.phone,
        role=UserRole.user,
        is_active=True,
    )
    db.add(user)
    await db.flush()

    now = datetime.now(timezone.utc)
    length = settings.OTP_LENGTH
    code = f"{secrets.randbelow(10 ** length):0{length}d}"
    minutes = settings.OTP_EXPIRE_MINUTES
    db.add(
        EmailOtp(
            user_id=user.id,
            code_hash=_hash_token(code),
            expires_at=now + timedelta(minutes=minutes),
        )
    )
    await db.flush()

    name = user.full_name or "there"
    subject = "Your HiSpike sign-up code"
    text = (
        f"Hi {name},\n\n"
        f"Welcome to HiSpike! Your sign-up code is {code}. It expires in {minutes} minutes.\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n— HiSpike"
    )
    html = (
        f"<p>Hi {name},</p>"
        "<p>Welcome to HiSpike! Your sign-up code is:</p>"
        f'<p style="font-size:30px;font-weight:800;letter-spacing:8px;margin:12px 0">{code}</p>'
        f"<p>It expires in {minutes} minutes.</p>"
        "<p>If you didn't request this, you can safely ignore this email.</p>"
        "<p>— HiSpike</p>"
    )
    background_tasks.add_task(_send_reset_email_safe, user.email, subject, html, text)

    return MessageResponse(message="We've emailed you a code to finish creating your account.")


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate and receive JWT tokens",
)
async def login(
    payload: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Token:
    user = await UserService.get_by_email(db, payload.email)
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(user.id, user.email, user.role.value)
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/request-otp",
    response_model=MessageResponse,
    summary="Email a one-time login code",
)
async def request_otp(
    payload: RequestOtpRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    # Same message whether or not the account exists — never reveal who's registered.
    generic = MessageResponse(
        message="If an account exists for that email, a login code has been sent."
    )

    user = await UserService.get_by_email(db, payload.email)
    if user is None or not user.is_active:
        return generic
    if not email_service.is_configured():
        logger.warning("OTP requested but email is not configured; no code sent.")
        return generic

    now = datetime.now(timezone.utc)

    # Resend cooldown: if a code was issued very recently, don't send another.
    latest_res = await db.execute(
        select(EmailOtp)
        .where(EmailOtp.user_id == user.id, EmailOtp.used_at.is_(None))
        .order_by(EmailOtp.created_at.desc())
        .limit(1)
    )
    latest = latest_res.scalar_one_or_none()
    if latest is not None:
        created = latest.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        if (now - created).total_seconds() < settings.OTP_RESEND_COOLDOWN_SECONDS:
            return generic

    # Invalidate any outstanding codes, then issue a fresh one.
    await db.execute(
        update(EmailOtp)
        .where(EmailOtp.user_id == user.id, EmailOtp.used_at.is_(None))
        .values(used_at=now)
        .execution_options(synchronize_session=False)
    )
    length = settings.OTP_LENGTH
    code = f"{secrets.randbelow(10 ** length):0{length}d}"
    minutes = settings.OTP_EXPIRE_MINUTES
    db.add(
        EmailOtp(
            user_id=user.id,
            code_hash=_hash_token(code),
            expires_at=now + timedelta(minutes=minutes),
        )
    )
    await db.flush()

    name = user.full_name or "there"
    subject = "Your HiSpike login code"
    text = (
        f"Hi {name},\n\n"
        f"Your HiSpike login code is {code}. It expires in {minutes} minutes.\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n— HiSpike"
    )
    html = (
        f"<p>Hi {name},</p>"
        "<p>Your HiSpike login code is:</p>"
        f'<p style="font-size:30px;font-weight:800;letter-spacing:8px;margin:12px 0">{code}</p>'
        f"<p>It expires in {minutes} minutes.</p>"
        "<p>If you didn't request this, you can safely ignore this email.</p>"
        "<p>— HiSpike</p>"
    )
    background_tasks.add_task(_send_reset_email_safe, user.email, subject, html, text)

    return generic


@router.post(
    "/verify-otp",
    response_model=Token,
    summary="Exchange an email login code for JWT tokens",
)
async def verify_otp(
    payload: VerifyOtpRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="That code is invalid or has expired. Please request a new one.",
    )

    user = await UserService.get_by_email(db, payload.email)
    if user is None or not user.is_active:
        raise invalid

    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(EmailOtp)
        .where(EmailOtp.user_id == user.id, EmailOtp.used_at.is_(None))
        .order_by(EmailOtp.created_at.desc())
        .limit(1)
    )
    otp = result.scalar_one_or_none()
    if otp is None:
        raise invalid

    expires_at = otp.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise invalid

    # Too many wrong guesses → burn the code so it can't be brute-forced.
    if otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        otp.used_at = now
        await db.commit()  # persist before the rollback that raising triggers
        raise invalid

    if _hash_token(payload.code) != otp.code_hash:
        otp.attempts += 1
        await db.commit()  # persist the attempt count (get_db rolls back on raise)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect code. Please try again.",
        )

    # Correct code → consume it and issue tokens (same as a password login).
    otp.used_at = now
    access_token = create_access_token(user.id, user.email, user.role.value)
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post(
    "/refresh",
    response_model=AccessToken,
    summary="Exchange a refresh token for a new access token",
)
async def refresh(
    payload: TokenRefresh,
    db: AsyncSession = Depends(get_db),
) -> AccessToken:
    try:
        token_data = decode_refresh_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    import uuid as _uuid

    user_id = _uuid.UUID(token_data["sub"])
    user = await UserService.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated",
        )

    access_token = create_access_token(user.id, user.email, user.role.value)
    return AccessToken(access_token=access_token)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password-reset link by email",
)
async def forgot_password(
    payload: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    # Always return the same message so we never reveal whether an account exists.
    generic = MessageResponse(
        message="If an account exists for that email, a reset link has been sent."
    )

    user = await UserService.get_by_email(db, payload.email)
    if user is None or not user.is_active:
        return generic

    if not email_service.is_configured():
        logger.warning("Password reset requested but SMTP is not configured; no email sent.")
        return generic

    raw_token = secrets.token_urlsafe(32)
    minutes = settings.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=_hash_token(raw_token),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=minutes),
        )
    )
    await db.flush()

    link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
    name = user.full_name or "there"
    subject = "Reset your HiSpike password"
    text = (
        f"Hi {name},\n\n"
        "We received a request to reset your HiSpike password. Open the link "
        f"below to choose a new one (valid for {minutes} minutes):\n\n{link}\n\n"
        "If you didn't request this, you can safely ignore this email.\n\n— HiSpike"
    )
    html = (
        f"<p>Hi {name},</p>"
        "<p>We received a request to reset your HiSpike password.</p>"
        f'<p><a href="{link}">Choose a new password</a> '
        f"(valid for {minutes} minutes).</p>"
        "<p>If you didn't request this, you can safely ignore this email.</p>"
        "<p>— HiSpike</p>"
    )
    # Send AFTER the response so a slow SMTP server never hangs the request.
    background_tasks.add_task(_send_reset_email_safe, user.email, subject, html, text)

    return generic


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Set a new password using a reset token",
)
async def reset_password(
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    invalid = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="This reset link is invalid or has expired. Please request a new one.",
    )

    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == _hash_token(payload.token)
        )
    )
    token = result.scalar_one_or_none()
    if token is None or token.used_at is not None:
        raise invalid

    now = datetime.now(timezone.utc)
    expires_at = token.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        raise invalid

    user = await UserService.get_by_id(db, token.user_id)
    if user is None or not user.is_active:
        raise invalid

    user.hashed_password = hash_password(payload.new_password)
    # Consume this token and invalidate any other outstanding ones for the user.
    await db.execute(
        update(PasswordResetToken)
        .where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None),
        )
        .values(used_at=now)
        .execution_options(synchronize_session=False)
    )

    return MessageResponse(message="Your password has been updated. You can now sign in.")

from __future__ import annotations

import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User, UserRole
from app.services.user_service import UserService

bearer_scheme = HTTPBearer(auto_error=False)

_CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise _CREDENTIALS_EXCEPTION

    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise _CREDENTIALS_EXCEPTION
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        raise _CREDENTIALS_EXCEPTION

    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise _CREDENTIALS_EXCEPTION
    return user


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """The signed-in user, or None — for endpoints that are public but show
    more to a logged-in caller.

    Never raises: a missing, expired or junk token means "anonymous", not 401.
    Anything that would make get_current_user reject the request is swallowed
    here on purpose, so a stale token in a browser can't break a public page.
    """
    if credentials is None:
        return None

    try:
        payload = decode_access_token(credentials.credentials)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            return None
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError):
        return None

    user = await UserService.get_by_id(db, user_id)
    if user is None or not user.is_active:
        return None
    return user


def is_admin(user: User | None) -> bool:
    """True only for an active admin. Accepts None so callers can pass an
    optional user straight through."""
    return user is not None and user.role == UserRole.admin


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )
    return current_user


async def require_admin(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return current_user

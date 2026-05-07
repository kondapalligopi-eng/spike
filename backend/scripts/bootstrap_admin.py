"""Idempotent admin bootstrap.

Reads ADMIN_EMAIL + ADMIN_PASSWORD from the environment and ensures a user
with that email exists with role=admin. Safe to run on every boot.

Behaviour:
- Both env vars unset → silent no-op (so non-prod environments don't fail)
- Email new → create user with role=admin, password from env
- Email exists, role != admin → promote to admin, refresh password from env
- Email exists, role == admin → refresh password from env (so rotating the
  ADMIN_PASSWORD env var actually rotates the credential)

Run via:  python -m scripts.bootstrap_admin
"""
from __future__ import annotations

import asyncio
import os
import sys

# Ensure the backend package root is on sys.path when invoked as a script.
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.dirname(_HERE)
if _BACKEND_ROOT not in sys.path:
    sys.path.insert(0, _BACKEND_ROOT)

from app.core.security import hash_password  # noqa: E402
from app.database import AsyncSessionLocal  # noqa: E402
from app.models.user import User, UserRole  # noqa: E402
from app.services.user_service import UserService  # noqa: E402


async def bootstrap() -> int:
    email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD", "")
    full_name = os.environ.get("ADMIN_FULL_NAME", "HiSpike Support")

    if not email or not password:
        print("[bootstrap_admin] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping.")
        return 0

    async with AsyncSessionLocal() as db:
        existing = await UserService.get_by_email(db, email)
        if existing is None:
            db.add(
                User(
                    email=email,
                    hashed_password=hash_password(password),
                    full_name=full_name,
                    role=UserRole.admin,
                    is_active=True,
                )
            )
            await db.commit()
            print(f"[bootstrap_admin] Created admin user {email}")
            return 0

        changes: list[str] = []
        if existing.role != UserRole.admin:
            existing.role = UserRole.admin
            changes.append("role->admin")
        if not existing.is_active:
            existing.is_active = True
            changes.append("re-activated")
        existing.hashed_password = hash_password(password)
        changes.append("password refreshed")
        db.add(existing)
        await db.commit()
        print(
            f"[bootstrap_admin] Updated existing user {email}: "
            + ", ".join(changes)
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(bootstrap()))

"""Provider-agnostic SMTP email sender.

Works with any SMTP provider (Resend, Brevo, SendGrid, Zoho, Gmail, …) — just
set the SMTP_* / EMAIL_FROM env vars. Until they're set, `is_configured()` is
False and callers can no-op gracefully (the password-reset flow does this so it
never reveals whether an account exists).
"""
from __future__ import annotations

import asyncio
import smtplib
import ssl
from email.message import EmailMessage

from app.config import settings


def is_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.EMAIL_FROM)


def _send_sync(to: str, subject: str, html: str, text: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    if settings.SMTP_USE_SSL:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_STARTTLS:
                server.starttls(context=ssl.create_default_context())
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)


async def send_email(to: str, subject: str, html: str, text: str) -> None:
    """Send an email. Raises RuntimeError if SMTP isn't configured; runs the
    blocking smtplib call in a thread so it doesn't block the event loop."""
    if not is_configured():
        raise RuntimeError("Email (SMTP) is not configured")
    await asyncio.to_thread(_send_sync, to, subject, html, text)

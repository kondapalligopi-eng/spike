"""Email sender with two backends:

1. Resend HTTP API (preferred) — set RESEND_API_KEY. HTTP is never blocked by
   the SMTP-port throttling some PaaS hosts (incl. Render) apply, so it's the
   reliable choice in production.
2. Generic SMTP — set SMTP_* / EMAIL_FROM. Works with any provider.

Until one is configured, `is_configured()` is False and callers no-op (the
password-reset flow relies on this so it never reveals whether an account
exists).
"""
from __future__ import annotations

import asyncio
import smtplib
import ssl
from email.message import EmailMessage

import httpx

from app.config import settings

RESEND_API_URL = "https://api.resend.com/emails"


def _use_resend_http() -> bool:
    return bool(settings.RESEND_API_KEY and settings.EMAIL_FROM)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.EMAIL_FROM)


def is_configured() -> bool:
    return _use_resend_http() or _smtp_configured()


async def _send_via_resend(to: str, subject: str, html: str, text: str) -> None:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            RESEND_API_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.EMAIL_FROM,
                "to": [to],
                "subject": subject,
                "html": html,
                "text": text,
            },
        )
    if resp.status_code >= 300:
        raise RuntimeError(f"Resend API error {resp.status_code}: {resp.text[:300]}")


def _send_via_smtp(to: str, subject: str, html: str, text: str) -> None:
    msg = EmailMessage()
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    # A timeout so a stalled connection fails fast (and gets logged) instead of
    # hanging the worker indefinitely.
    timeout = 20
    if settings.SMTP_USE_SSL:
        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(
            settings.SMTP_HOST, settings.SMTP_PORT, context=context, timeout=timeout
        ) as server:
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=timeout) as server:
            if settings.SMTP_STARTTLS:
                server.starttls(context=ssl.create_default_context())
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)


async def send_email(to: str, subject: str, html: str, text: str) -> None:
    """Send an email via Resend HTTP (if RESEND_API_KEY set) else SMTP.
    Raises on failure / when nothing is configured."""
    if _use_resend_http():
        await _send_via_resend(to, subject, html, text)
        return
    if not _smtp_configured():
        raise RuntimeError("Email is not configured")
    await asyncio.to_thread(_send_via_smtp, to, subject, html, text)

"""Branded HTML for HiSpike transactional emails.

Table-based, fully inline-styled markup (the only thing email clients render
reliably). Every message shares one shell — a logo header, a white content
card, and a footer with the registered address — so password-reset, login-code
and sign-up-code emails all look like they come from the same brand.
"""
from __future__ import annotations

from app.config import settings

# Hosted logo (emails can't use local files). Falls back to the public site.
_LOGO_URL = f"{settings.FRONTEND_URL.rstrip('/')}/logo.png"
_ADDRESS = (
    "WeWork Salarpuria Magnificia, 78 Old Madras Road, Mahadevapura, "
    "next to KR Puram, Bengaluru, Karnataka 560016"
)
_PRIMARY = "#2563eb"
_INK = "#1c1917"
_MUTED = "#6b7280"
_FAINT = "#9ca3af"
_BG = "#f4f4f5"


def _shell(body_html: str, preheader: str = "") -> str:
    """Wrap a body fragment in the shared header/footer chrome."""
    return f"""\
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:{_BG};font-family:Arial,Helvetica,sans-serif;color:{_INK};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;font-size:1px;color:{_BG};">{preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{_BG};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:22px 30px;border-radius:14px 14px 0 0;border-bottom:1px solid #f0f0f0;">
              <img src="{_LOGO_URL}" width="42" height="42" alt="HiSpike" style="vertical-align:middle;border:0;border-radius:50%;">
              <span style="font-size:20px;font-weight:800;color:{_INK};vertical-align:middle;margin-left:10px;letter-spacing:-0.3px;">HiSpike</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:26px 30px 34px;border-radius:0 0 14px 14px;">
              {body_html}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:22px 30px 8px;text-align:center;">
              <img src="{_LOGO_URL}" width="32" height="32" alt="HiSpike" style="border:0;border-radius:50%;opacity:.85;">
              <p style="margin:10px 0 0;font-size:12px;line-height:1.7;color:{_FAINT};">
                This email was sent from HiSpike<br>{_ADDRESS}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _greeting(name: str) -> str:
    return f'<p style="margin:0 0 16px;font-size:16px;color:{_INK};">Hi {name},</p>'


def _fine_print() -> str:
    return (
        f'<p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:{_FAINT};">'
        "If you didn't request this, you can safely ignore this email.</p>"
    )


def _code_block(code: str) -> str:
    return (
        '<div style="text-align:center;margin:22px 0;">'
        f'<span style="display:inline-block;font-size:34px;font-weight:800;letter-spacing:10px;'
        f'color:{_INK};background:{_BG};border-radius:12px;padding:16px 26px;">{code}</span>'
        "</div>"
    )


def reset_password_html(name: str, link: str, minutes: int) -> str:
    body = (
        _greeting(name)
        + f'<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:{_MUTED};">'
        "We received a request to reset your HiSpike password. "
        f"Tap the button below to choose a new one — this link is valid for {minutes} minutes.</p>"
        f'<div style="margin:24px 0;">'
        f'<a href="{link}" style="background:{_PRIMARY};color:#ffffff;text-decoration:none;'
        'font-weight:700;font-size:15px;padding:13px 28px;border-radius:999px;display:inline-block;">'
        "Choose a new password</a></div>"
        f'<p style="margin:0;font-size:13px;line-height:1.6;color:{_FAINT};">'
        f'Or paste this link into your browser:<br><span style="color:{_PRIMARY};word-break:break-all;">{link}</span></p>'
        + _fine_print()
    )
    return _shell(body, preheader="Reset your HiSpike password")


def login_code_html(name: str, code: str, minutes: int) -> str:
    body = (
        _greeting(name)
        + f'<p style="margin:0;font-size:15px;line-height:1.6;color:{_MUTED};">Your HiSpike login code is:</p>'
        + _code_block(code)
        + f'<p style="margin:0;text-align:center;font-size:14px;color:{_MUTED};">It expires in {minutes} minutes.</p>'
        + _fine_print()
    )
    return _shell(body, preheader=f"Your HiSpike login code: {code}")


def signup_code_html(name: str, code: str, minutes: int) -> str:
    body = (
        _greeting(name)
        + f'<p style="margin:0;font-size:15px;line-height:1.6;color:{_MUTED};">'
        "Welcome to HiSpike! Use this code to finish creating your account:</p>"
        + _code_block(code)
        + f'<p style="margin:0;text-align:center;font-size:14px;color:{_MUTED};">It expires in {minutes} minutes.</p>'
        + _fine_print()
    )
    return _shell(body, preheader=f"Your HiSpike sign-up code: {code}")

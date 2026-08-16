"""Tests for the per-IP rate limiter.

conftest disables rate limiting for the suite at large, so these cases turn it
back on around themselves. Each test uses its own X-Forwarded-For address:
the middleware instance lives for the lifetime of the app import, so distinct
IPs are what keep one test's counters out of another's bucket.
"""
from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.config import settings
from app.core.ratelimit import RULES, match_rule


@pytest.fixture
def rate_limiting_on():
    settings.RATE_LIMIT_ENABLED = True
    yield
    settings.RATE_LIMIT_ENABLED = False


# ---------------------------------------------------------------------------
# Rule matching
# ---------------------------------------------------------------------------


def test_register_otp_does_not_inherit_the_register_bucket():
    """/auth/register is a string prefix of /auth/register-otp.

    They have very different limits (10/hour vs 5/10min), so prefix matching
    would quietly put the mail-sending endpoint on the laxer budget.
    """
    register = match_rule("/api/v1/auth/register")
    register_otp = match_rule("/api/v1/auth/register-otp")

    assert register is not None and register_otp is not None
    assert register.path == "/api/v1/auth/register"
    assert register_otp.path == "/api/v1/auth/register-otp"
    assert register.limit != register_otp.limit


def test_unmatched_paths_are_not_limited():
    # Uptime monitors poll /health far harder than any rule would permit.
    assert match_rule("/health") is None
    assert match_rule("/docs") is None


def test_every_rule_is_reachable():
    """An earlier rule must never shadow a later one."""
    for rule in RULES:
        assert match_rule(rule.path) is rule, f"{rule.path} is shadowed"


def test_catch_all_covers_the_directory_endpoints():
    rule = match_rule("/api/v1/hospitals")
    assert rule is not None
    assert rule.path == "/api/v1/"


# ---------------------------------------------------------------------------
# Enforcement
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_mail_endpoint_blocks_after_its_limit(
    client: AsyncClient, rate_limiting_on
):
    """forgot-password allows 5 per 10 minutes, then 429s with Retry-After."""
    headers = {"X-Forwarded-For": "203.0.113.10"}
    body = {"email": "nobody@example.com"}

    for attempt in range(5):
        resp = await client.post("/api/v1/auth/forgot-password", json=body, headers=headers)
        assert resp.status_code != 429, f"throttled early on attempt {attempt + 1}"

    blocked = await client.post("/api/v1/auth/forgot-password", json=body, headers=headers)
    assert blocked.status_code == 429
    assert int(blocked.headers["Retry-After"]) > 0
    assert "detail" in blocked.json()


@pytest.mark.asyncio
async def test_limits_are_per_ip(client: AsyncClient, rate_limiting_on):
    body = {"email": "nobody@example.com"}
    exhausted = {"X-Forwarded-For": "203.0.113.20"}

    for _ in range(5):
        await client.post("/api/v1/auth/forgot-password", json=body, headers=exhausted)
    assert (
        await client.post("/api/v1/auth/forgot-password", json=body, headers=exhausted)
    ).status_code == 429

    # A different visitor must be unaffected by that IP's spending.
    other = {"X-Forwarded-For": "203.0.113.21"}
    resp = await client.post("/api/v1/auth/forgot-password", json=body, headers=other)
    assert resp.status_code != 429


@pytest.mark.asyncio
async def test_cloudflare_header_wins_over_forwarded_for(
    client: AsyncClient, rate_limiting_on
):
    """CF-Connecting-IP is the trustworthy one; X-Forwarded-For is spoofable.

    An attacker rotating X-Forwarded-For must not escape their bucket when
    Cloudflare has already identified them.
    """
    body = {"email": "nobody@example.com"}

    for i in range(5):
        await client.post(
            "/api/v1/auth/forgot-password",
            json=body,
            headers={"CF-Connecting-IP": "203.0.113.30", "X-Forwarded-For": f"198.51.100.{i}"},
        )

    blocked = await client.post(
        "/api/v1/auth/forgot-password",
        json=body,
        headers={"CF-Connecting-IP": "203.0.113.30", "X-Forwarded-For": "198.51.100.99"},
    )
    assert blocked.status_code == 429


@pytest.mark.asyncio
async def test_health_is_never_limited(client: AsyncClient, rate_limiting_on):
    headers = {"X-Forwarded-For": "203.0.113.40"}
    for _ in range(30):
        resp = await client.get("/health", headers=headers)
        assert resp.status_code == 200

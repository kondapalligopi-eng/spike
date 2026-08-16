"""Per-IP request throttling for the public API.

Without this, /auth/login, /auth/verify-otp and /auth/reset-password accept
unlimited attempts — passwords, 6-digit login codes and reset tokens are all
brute-forceable at whatever rate the network allows. The endpoints that send
mail are worse still: an attacker with a loop can drain the transactional-mail
quota and get the sending domain flagged as a spam source.

State lives in this process. start.sh runs uvicorn with `--workers 1`, so the
counters are exact today. If the service is ever scaled out — more uvicorn
workers, or more than one Render instance — each copy keeps its own window and
the effective limit multiplies by the number of copies. Move the store to Redis
before scaling out.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Deque, NamedTuple

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings


class Rule(NamedTuple):
    """`limit` requests allowed per `window` seconds, per client IP."""

    path: str
    limit: int
    window: int
    message: str
    #: Exact path match. The two catch-all rules at the end use prefix matching
    #: instead; everything else is exact so that adding a new endpoint whose
    #: path extends an existing one (/auth/register vs /auth/register-otp)
    #: cannot silently inherit the wrong bucket.
    exact: bool = True


_MAIL_ABUSE = "Too many requests. Please wait a few minutes before trying again."
_GUESS_ABUSE = "Too many attempts. Please wait a few minutes before trying again."

# Ordered; the first match wins.
RULES: tuple[Rule, ...] = (
    # --- Endpoints that send email -----------------------------------------
    # Abuse here costs real money and reputation, and there is no legitimate
    # reason for one address to need more than a handful of codes in ten
    # minutes. auth.py already enforces a per-account resend cooldown; this is
    # the per-IP counterpart, which is what stops someone cycling addresses.
    Rule("/api/v1/auth/forgot-password", 5, 600, _MAIL_ABUSE),
    Rule("/api/v1/auth/request-otp", 5, 600, _MAIL_ABUSE),
    Rule("/api/v1/auth/register-otp", 5, 600, _MAIL_ABUSE),
    # --- Credential, code and token guessing -------------------------------
    # 20 per 5 minutes still lets a real person fumble their password a dozen
    # times in a row, but caps an attacker near 240/hour. A 6-digit OTP has a
    # million possibilities, so at that rate an exhaustive search runs for
    # centuries — and the code expires in ten minutes.
    Rule("/api/v1/auth/login", 20, 300, _GUESS_ABUSE),
    Rule("/api/v1/auth/verify-otp", 20, 300, _GUESS_ABUSE),
    Rule("/api/v1/auth/reset-password", 20, 300, _GUESS_ABUSE),
    # --- Account farming ---------------------------------------------------
    Rule("/api/v1/auth/register", 10, 3600, _GUESS_ABUSE),
    # --- Everything else under /auth (notably /refresh) --------------------
    # Generous: several tabs open on a slow connection legitimately refresh
    # in bursts, and a refresh token is already a bearer credential.
    Rule("/api/v1/auth/", 60, 300, _GUESS_ABUSE, False),
    # --- All other API traffic ---------------------------------------------
    # A person browsing the directory makes a handful of calls a minute. This
    # ceiling is invisible to them and costs a bulk puller its speed.
    Rule("/api/v1/", 240, 60, "Too many requests. Please slow down.", False),
)

#: How often to discard buckets nobody has touched recently, so a flood of
#: one-off IPs cannot grow the dict without bound.
_SWEEP_INTERVAL_S = 300.0
_LONGEST_WINDOW_S = max(rule.window for rule in RULES)


def client_ip(request: Request) -> str:
    """Best-effort originating IP.

    Render terminates TLS at its own edge and Cloudflare sits in front of that,
    so `request.client.host` is a proxy rather than the caller — keying on it
    would drop every visitor into a single shared bucket and throttle the whole
    site at once. Cloudflare sets CF-Connecting-IP and strips any client-supplied
    copy of it, which makes it the trustworthy option; X-Forwarded-For is the
    fallback, and its first entry is the original client.

    Both headers are forgeable by anyone who reaches the Render URL directly and
    bypasses Cloudflare, which would let an attacker rotate their apparent IP
    freely. Restricting the Render service to Cloudflare's published IP ranges
    is what closes that hole; until then this is a strong deterrent rather than
    a hard guarantee.
    """
    forwarded_by_cloudflare = request.headers.get("cf-connecting-ip")
    if forwarded_by_cloudflare:
        return forwarded_by_cloudflare.strip()

    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        first_hop = forwarded.split(",")[0].strip()
        if first_hop:
            return first_hop

    client = request.client
    return client.host if client is not None else "unknown"


def match_rule(path: str) -> Rule | None:
    for rule in RULES:
        matched = path == rule.path if rule.exact else path.startswith(rule.path)
        if matched:
            return rule
    return None


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding-window limiter keyed on (client IP, rule)."""

    def __init__(self, app: object) -> None:
        super().__init__(app)  # type: ignore[arg-type]
        self._hits: dict[tuple[str, str], Deque[float]] = defaultdict(deque)
        self._last_sweep = 0.0

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Read the flag per request rather than capturing it at construction so
        # the test suite can switch it off after the app has been imported.
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)

        # Preflights are issued by the browser, not the caller, and carry no
        # credentials — charging them would spend a real user's budget on CORS.
        if request.method == "OPTIONS":
            return await call_next(request)

        rule = match_rule(request.url.path)
        if rule is None:
            # /health and the docs routes fall through here: uptime monitors
            # poll the former far harder than any rule would allow.
            return await call_next(request)

        now = time.monotonic()
        bucket = self._hits[(client_ip(request), rule.path)]

        cutoff = now - rule.window
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()

        if len(bucket) >= rule.limit:
            # bucket[0] is the oldest hit still counted; once it ages out of the
            # window there is room for one more request.
            retry_after = max(1, int(bucket[0] + rule.window - now) + 1)
            return JSONResponse(
                status_code=429,
                content={"detail": rule.message},
                headers={"Retry-After": str(retry_after)},
            )

        bucket.append(now)
        self._sweep(now)
        return await call_next(request)

    def _sweep(self, now: float) -> None:
        if now - self._last_sweep < _SWEEP_INTERVAL_S:
            return
        self._last_sweep = now
        cutoff = now - _LONGEST_WINDOW_S
        stale = [
            key
            for key, hits in self._hits.items()
            if not hits or hits[-1] <= cutoff
        ]
        for key in stale:
            del self._hits[key]

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import auth, users, dogs, adoptions, breeds, hospitals, parks, swim_schools, grooming_salons, pet_foods, pet_pages, site_settings, submissions, counters


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: nothing extra needed — SQLAlchemy engine is created lazily.
    # In production you would warm up connection pools or run health probes here.
    yield
    # Shutdown: dispose the connection pool cleanly.
    from app.database import engine
    await engine.dispose()


app = FastAPI(
    title="Pet Dogs API",
    description=(
        "A production-ready REST API for a pet dog adoption platform. "
        "Supports dog listings, user authentication, and adoption requests."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = exc.errors()
    details = [
        {
            "field": " -> ".join(str(loc) for loc in err.get("loc", [])),
            "message": err.get("msg", ""),
            "type": err.get("type", ""),
        }
        for err in errors
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": details},
        headers=_cors_headers_for(request),
    )


def _cors_headers_for(request: Request) -> dict[str, str]:
    # CORSMiddleware-generated headers don't always reach responses produced
    # by exception handlers (they short-circuit the normal middleware path).
    # Without these headers the browser blocks the 500 response and the
    # frontend sees "Network Error" instead of the real detail — making
    # debugging much harder. Mirror the allowed-origin check here so error
    # responses are visible to the frontend on whitelisted origins.
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ORIGINS:
        return {
            "access-control-allow-origin": origin,
            "access-control-allow-credentials": "true",
            "vary": "Origin",
        }
    return {}


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    # Do not leak internals in production
    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred"},
            headers=_cors_headers_for(request),
        )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)},
        headers=_cors_headers_for(request),
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.api_route(
    "/health",
    methods=["GET", "HEAD"],
    tags=["health"],
    summary="Service health check",
)
async def health_check() -> dict[str, str]:
    # HEAD is supported so default-HEAD monitors (UptimeRobot, etc.) get a
    # 200 instead of a 405. FastAPI auto-strips the body on HEAD responses.
    return {"status": "ok", "environment": settings.ENVIRONMENT}


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(dogs.router, prefix=API_PREFIX)
app.include_router(adoptions.router, prefix=API_PREFIX)
app.include_router(breeds.router, prefix=API_PREFIX)
app.include_router(hospitals.router, prefix=API_PREFIX)
app.include_router(parks.router, prefix=API_PREFIX)
app.include_router(swim_schools.router, prefix=API_PREFIX)
app.include_router(grooming_salons.router, prefix=API_PREFIX)
app.include_router(pet_foods.router, prefix=API_PREFIX)
app.include_router(pet_pages.router, prefix=API_PREFIX)
app.include_router(site_settings.router, prefix=API_PREFIX)
app.include_router(submissions.router, prefix=API_PREFIX)

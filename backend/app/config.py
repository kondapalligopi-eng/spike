from __future__ import annotations

from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/petdogs"

    # JWT
    SECRET_KEY: str = "change-me-in-production-must-be-at-least-32-characters-long"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Email. Preferred: Resend HTTP API — set RESEND_API_KEY (HTTP isn't blocked
    # by SMTP-port throttling on some hosts). Otherwise generic SMTP below.
    RESEND_API_KEY: str = ""

    # Email (SMTP) — provider-agnostic fallback. Leave blank to disable email
    # features (password reset just no-ops + logs until configured).
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_STARTTLS: bool = True
    SMTP_USE_SSL: bool = False
    EMAIL_FROM: str = ""  # e.g. "HiSpike <support@hispike.in>"

    # Public site URL — used to build links inside emails.
    FRONTEND_URL: str = "https://hispike.in"

    # Password-reset token lifetime.
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://hispike.in",
        "https://www.hispike.in",
    ]

    # Environment
    ENVIRONMENT: str = "development"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: object) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v  # type: ignore[return-value]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()

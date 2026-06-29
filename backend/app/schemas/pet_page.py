from __future__ import annotations

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_PHOTOS = 5
MAX_MEMORY_WORDS = 500

# Mirrors the frontend: lowercase letters/numbers separated by single dashes.
_SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# Reserved so they never collide with sub-paths we may add under /pet/.
RESERVED_SLUGS = {"new", "create", "edit", "me", "mine", "admin"}

# Keep in sync with PET_HIGHLIGHTS on the frontend.
ALLOWED_HIGHLIGHTS = {
    "vaccinated",
    "neutered",
    "house_trained",
    "good_with_kids",
    "good_with_dogs",
    "good_with_cats",
    "loves_walks",
    "loves_swimming",
    "microchipped",
    "friendly",
    "trained",
    "cuddly",
}


class PetPageBase(BaseModel):
    slug: str = Field(..., min_length=2, max_length=60)
    name: str = Field(..., min_length=1, max_length=120)
    photos: list[str] = Field(default_factory=list, max_length=MAX_PHOTOS)
    highlights: list[str] = Field(default_factory=list)
    memories: str = Field("", max_length=8000)

    @field_validator("slug")
    @classmethod
    def _validate_slug(cls, v: str) -> str:
        v = v.strip().lower()
        if not _SLUG_RE.match(v):
            raise ValueError("Link may contain only lowercase letters, numbers and dashes")
        if v in RESERVED_SLUGS:
            raise ValueError("That link is reserved — choose another")
        return v

    @field_validator("highlights")
    @classmethod
    def _validate_highlights(cls, v: list[str]) -> list[str]:
        # Drop unknown keys, de-dupe, preserve order.
        cleaned: list[str] = []
        for key in v:
            if key in ALLOWED_HIGHLIGHTS and key not in cleaned:
                cleaned.append(key)
        return cleaned

    @field_validator("memories")
    @classmethod
    def _cap_words(cls, v: str) -> str:
        if len(v.split()) > MAX_MEMORY_WORDS:
            raise ValueError(f"Story must be {MAX_MEMORY_WORDS} words or fewer")
        return v


class PetPageCreate(PetPageBase):
    pass


class PetPageRead(PetPageBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

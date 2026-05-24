from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class SiteSettingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    key: str
    enabled: bool


class SiteSettingUpdate(BaseModel):
    enabled: bool = Field(...)

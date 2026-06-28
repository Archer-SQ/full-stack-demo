from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AppSettingRead(BaseModel):
    id: int
    code: str
    name: str
    description: str
    enabled: bool
    config: dict[str, Any]
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppSettingUpdate(BaseModel):
    enabled: bool | None = None
    config: dict[str, Any] | None = None

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatMessageBase(BaseModel):
    role: str
    content: str


class ChatMessageCreate(ChatMessageBase):
    pass


class ChatMessageRead(ChatMessageBase):
    id: int
    session_id: int
    answer_data: dict[str, Any] | None = None
    elapsed_ms: int | None = None
    token_count: int | None = None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


class ChatSessionCreate(BaseModel):
    title: str


class ChatSessionRead(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[ChatMessageRead] = Field(default_factory=list)

    model_config = {"from_attributes": True}

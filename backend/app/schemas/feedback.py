from datetime import datetime

from pydantic import BaseModel, Field


class FeedbackBase(BaseModel):
    user_name: str
    question: str
    ai_answer: str
    message_id: int | None = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackRead(FeedbackBase):
    id: int
    status: str
    remark: str | None = None
    created_at: datetime
    handled_at: datetime | None = None

    model_config = {"from_attributes": True}


class FeedbackUpdate(BaseModel):
    status: str | None = None
    remark: str | None = None


class FeedbackListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[FeedbackRead] = Field(default_factory=list)

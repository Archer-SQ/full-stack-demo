from datetime import datetime

from pydantic import BaseModel


class FeedbackBasic(BaseModel):
    user_name: str
    question: str
    ai_answer: str
    message_id: int | None = None


class FeedbackCreate(FeedbackBasic):
    pass


class FeedbackRead(FeedbackBasic):
    id: int
    status: str
    remark: str | None = None
    created_at: datetime
    handled_at: datetime | None = None

    model_config = {"from_attributes": True}


class FeedbackUpdate(BaseModel):
    status: str | None = None
    remark: str | None = None

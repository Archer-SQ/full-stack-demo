from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models import Feedback
from app.schemas.feedback import (
    FeedbackCreate,
    FeedbackListResponse,
    FeedbackRead,
    FeedbackUpdate,
)

router = APIRouter(prefix="/api/feedbacks", tags=["feedbacks"])


@router.post("", response_model=FeedbackRead)
def create_feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    feedback = Feedback(**payload.model_dump())
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


@router.get("", response_model=FeedbackListResponse)
def list_feedbacks(
    question: str | None = None,
    user: str | None = None,
    status: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Feedback)

    if question:
        query = query.filter(Feedback.question.ilike(f"%{question}%"))

    if user:
        query = query.filter(Feedback.user_name.ilike(f"%{user}%"))

    if status:
        query = query.filter(Feedback.status == status)

    total = query.count()
    items = (
        query.order_by(Feedback.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": items,
    }


@router.get("/{feedback_id}", response_model=FeedbackRead)
def get_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()

    if feedback is None:
        raise HTTPException(status_code=404, detail="feedback not found")

    return feedback


@router.patch("/{feedback_id}", response_model=FeedbackRead)
def patch_feedback(
    feedback_id: int,
    payload: FeedbackUpdate,
    db: Session = Depends(get_db),
):
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if payload.status is not None:
        feedback.status = payload.status
        if payload.status == "resolved":
            feedback.handled_at = datetime.now(timezone.utc)
        elif payload.status == "pending":
            feedback.handled_at = None

    if payload.remark is not None:
        feedback.remark = payload.remark

    db.commit()
    db.refresh(feedback)

    return feedback

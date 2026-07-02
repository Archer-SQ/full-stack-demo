from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models import ChatMessage, ChatSession
from app.schemas.chat import ChatMessageCreate, ChatSessionCreate, ChatSessionRead
from app.services.mock_ai import generate_mock_answer

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _get_session_with_messages(db: Session, session_id: int) -> ChatSession | None:
    return (
        db.query(ChatSession)
        .options(selectinload(ChatSession.messages))
        .filter(ChatSession.id == session_id)
        .first()
    )


def _build_session_title(content: str, default: str) -> str:
    title = " ".join(content.strip().split())
    return (title or default)[:200]


@router.post("", response_model=ChatSessionRead)
def create_session(payload: ChatSessionCreate, db: Session = Depends(get_db)):
    session = ChatSession(title=payload.title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("", response_model=list[ChatSessionRead])
def list_sessions(db: Session = Depends(get_db)):
    return (
        db.query(ChatSession)
        .options(selectinload(ChatSession.messages))
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


@router.get("/{session_id}", response_model=ChatSessionRead)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = _get_session_with_messages(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return session


@router.post("/{session_id}/messages", response_model=ChatSessionRead)
def send_message(
    session_id: int,
    payload: ChatMessageCreate,
    db: Session = Depends(get_db),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")

    if payload.role != "user":
        raise HTTPException(status_code=400, detail="only user messages can be sent")

    # 判断一下，没有消息才用第一条user的内容去更新标题
    existing_first_user_message = (
        db.query(ChatMessage.id).filter(ChatMessage.session_id == session.id).first()
    )

    if existing_first_user_message is None:
        session.title = _build_session_title(payload.content, session.title)

    user_message = ChatMessage(
        session_id=session.id,
        role="user",
        content=payload.content,
    )

    mock_result = generate_mock_answer(payload.content)
    assistant_message = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=mock_result["content"],
        answer_data=mock_result["answer_data"],
        elapsed_ms=mock_result["elapsed_ms"],
        token_count=mock_result["token_count"],
    )

    session.updated_at = datetime.now(timezone.utc)

    db.add_all([user_message, assistant_message])
    db.commit()

    updated_session = _get_session_with_messages(db, session.id)
    if updated_session is None:
        raise HTTPException(status_code=404, detail="session not found")
    return updated_session

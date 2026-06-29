from fastapi import FastAPI

from app.db.session import check_database_connection
from app.routers import settings, feedbacks, chat

app = FastAPI(title="Full Stack Demo API")

app.include_router(settings.router)
app.include_router(feedbacks.router)
app.include_router(chat.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/health/db")
def database_health_check():
    check_database_connection()
    return {"database": "ok"}

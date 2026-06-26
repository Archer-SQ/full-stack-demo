from fastapi import FastAPI

from app.db.session import check_database_connection

app = FastAPI(title="Full Stack Demo API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/health/db")
def database_health_check():
    check_database_connection()
    return {"database": "ok"}
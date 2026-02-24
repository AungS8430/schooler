"""Health check and base routes."""

from fastapi import APIRouter
from sqlmodel import Session, select

from app.database import engine

router = APIRouter(tags=["health"])


@router.get("/", tags=["health"])
async def health_check():
    """Public health check endpoint."""
    return {"status": "ok"}


@router.get("/getDBHealthCheck")
async def get_db_health_check():
    """Check if database is reachable and responding."""
    try:
        with Session(engine) as session:
            # Execute a minimal query to verify connectivity
            result = session.exec(select(1)).first()

        if result is None:
            return {"status": "unhealthy", "detail": "no result from database"}
        return {"status": "healthy", "detail": "ok"}
    except Exception as e:
        return {"status": "unhealthy", "detail": str(e)}

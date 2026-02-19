"""Health check and base routes."""
from fastapi import APIRouter, HTTPException, status
from sqlmodel import Session, select

from app.api import JWTDep, SessionDep, ensure_jwt_and_get_sub
from app.database import engine

router = APIRouter(tags=["health"])


@router.get("/")
async def bounce_jwt(jwt: JWTDep):
    """Echo back JWT token for verification."""
    if jwt is None or not isinstance(jwt, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT: authentication required",
        )
    return jwt


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


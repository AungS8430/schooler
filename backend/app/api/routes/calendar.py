"""Calendar and academic event routes."""

from typing import Optional

from fastapi import APIRouter, HTTPException, status
from sqlmodel import Session

from app.api import JWTDep, SessionDep, ensure_jwt_and_get_sub
from app.database import get_session
from app.domain.schoolScheduler import (
    get_academic_info,
    get_class,
    get_events,
    get_events_all,
)
from app.models import User
from app.schemas.types import Room

router = APIRouter(prefix="/calendar", tags=["calendar"])


@router.get("/academic")
def get_school_academic_calendar(
    jwt: JWTDep,
):
    """Get the school-wide academic calendar with all events."""
    ensure_jwt_and_get_sub(jwt)
    return get_academic_info(get_events_all()).convert()


@router.get("/personal")
def get_personal_calendar(
    jwt: JWTDep,
    session: SessionDep,
    class_: Optional[str] = None,
):
    """Get the user's personal calendar based on their class assignment."""
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if not class_:
        if user is None:
            class_ = "C2R1"
        else:
            class_ = "C2R1" if user.class_ is None else user.class_
    f_class = get_class(class_)
    return get_academic_info(
        get_events(Room(f_class["year"], f_class["department"], class_))
    ).convert()

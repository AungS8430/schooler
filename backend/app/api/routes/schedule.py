"""Timetable and schedule routes."""

from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, status

from app.api import JWTDep, SessionDep, ensure_jwt_and_get_sub
from app.domain.schoolScheduler import (
    fixed_week_schedule,
    get_class,
    get_slots,
    week_schedule,
)
from app.models import User
from app.schemas.types import Room

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/slots")
def get_slots_endpoint():
    """Get all available time slots for the school."""
    return {"slots": get_slots()}


@router.get("/timetable")
def get_school_timetable(
    jwt: JWTDep,
    session: SessionDep,
    class_: Optional[str] = None,
):
    """Get the timetable for a specific class."""
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    if not class_:
        if user is None:
            class_ = "C2R1"
        else:
            class_ = "C2R1" if user.class_ is None else user.class_
    f_class = get_class(class_)
    return {
        "timetable": fixed_week_schedule(
            Room(f_class["year"], f_class["department"], class_)
        )
    }


@router.get("/timetable/dated")
def get_dated_timetable(
    jwt: JWTDep,
    session: SessionDep,
    when: Optional[str] = None,
    class_: Optional[str] = None,
):
    """Get the timetable for a specific date."""
    if when is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date query parameter is required",
        )
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    if not class_:
        if user is None:
            class_ = "C2R1"
        else:
            class_ = "C2R1" if user.class_ is None else user.class_
    f_class = get_class(class_)
    return {
        "timetable": week_schedule(
            Room(f_class["year"], f_class["department"], class_),
            date.fromisoformat(when),
        )
    }

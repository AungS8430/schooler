"""People/personnel management routes."""
from typing import Optional

from fastapi import APIRouter
from sqlmodel import Session, select

from app.api import JWTDep, SessionDep, ensure_jwt_and_get_sub
from app.models import User
from app.schemas.types import CLASSES_LOOKUP, GRADE_LOOKUP

router = APIRouter(prefix="/people", tags=["people"])


@router.get("")
def get_people(
    jwt: JWTDep,
    session: SessionDep,
    grade: Optional[int] = None,
    department: Optional[str] = None,
    class_: Optional[str] = None,
    search: Optional[str] = None,
):
    """Get list of people filtered by grade, department, and/or class."""
    ensure_jwt_and_get_sub(jwt)
    executed_query = (
        select(User)
        .where(User.year == grade if grade is not None else True)
        .where(User.department == department if department is not None else True)
        .where(User.class_ == class_ if class_ is not None else True)
        .where((User.name.ilike(f"%{search}%") | User.personnelID.ilike(f"%{search}%")) if search is not None else True)
    )
    users = session.exec(executed_query).all()
    users_data = [x.model_dump() for x in users]
    return {"users": users_data}


@router.get("/grades")
def get_grades(jwt: JWTDep):
    """Get available grade levels."""
    ensure_jwt_and_get_sub(jwt)
    return {"grades": GRADE_LOOKUP}


@router.get("/classes")
def get_classes(
    jwt: JWTDep,
    grade: Optional[int] = None,
    department: Optional[str] = None,
):
    """Get available classes filtered by grade and/or department."""
    ensure_jwt_and_get_sub(jwt)
    if department is None and grade is None:
        classes = [
            class_item
            for grade_classes in CLASSES_LOOKUP.values()
            for dep, classes_list in grade_classes.items()
            for class_item in classes_list
        ]
    elif department is None:
        classes = [
            class_item
            for dep, classes_list in CLASSES_LOOKUP.get(grade, {}).items()
            for class_item in classes_list
        ]
    elif grade is None:
        classes = []
        for grade_classes in CLASSES_LOOKUP.values():
            for dep in grade_classes.keys():
                if dep == department:
                    classes.extend(grade_classes[dep])
    else:
        classes = [
            class_item
            for dep, classes_list in CLASSES_LOOKUP.get(grade, {}).items()
            if dep == department
            for class_item in classes_list
        ]
    return {"classes": classes}


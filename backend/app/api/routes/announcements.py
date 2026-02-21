"""Announcement management routes."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.api import JWTDep, SessionDep, ensure_jwt_and_get_sub
from app.domain.cardAnno.anno import (
    delete_announcement,
    edit_announcement,
    fetch_user_announcements,
    get_announcement_by_ID,
    post_announcement,
)
from app.domain.user.auth import get_user_perms
from app.models import Announcement
from app.schemas.types import AnnouncementCreate, AnnouncementUpdate

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("")
def read_announcements(
    jwt: JWTDep,
    session: SessionDep,
    query: Optional[str] = None,
):
    """Fetch announcements visible to the user."""
    ensure_jwt_and_get_sub(jwt)
    announcement_ids = fetch_user_announcements(session, query)
    return {"announcement_ids": announcement_ids}


@router.get("/{announcement_id}")
def read_announcement(
    announcement_id: int,
    jwt: JWTDep,
    session: SessionDep,
):
    """Get a specific announcement by ID."""
    ensure_jwt_and_get_sub(jwt)
    announcement = get_announcement_by_ID(session, announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    return {"announcement": announcement}


@router.post("")
def create_announcement(
    announcement_data: AnnouncementCreate,
    jwt: JWTDep,
    session: SessionDep,
):
    """Create a new announcement (admin/teacher only)."""
    user_id = ensure_jwt_and_get_sub(jwt)
    permissions = get_user_perms(session, user_id)
    if permissions is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to create announcements",
        )
    if not permissions.get("role") or permissions.get("role") not in [
        "admin",
        "teacher",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to create announcements",
        )
    new_announcement = post_announcement(
        session=session,
        title=announcement_data.title,
        description=announcement_data.description,
        content=announcement_data.content,
        thumbnail=announcement_data.thumbnail,
        author_id=user_id,
        date=datetime.now().isoformat(),
        priority=announcement_data.priority,
    )
    return {"announcement": new_announcement}


@router.delete("/{announcement_id}")
def remove_announcement(
    announcement_id: int,
    jwt: JWTDep,
    session: SessionDep,
):
    """Delete an announcement (author only)."""
    user_id = ensure_jwt_and_get_sub(jwt)
    delete_announcement(session, announcement_id, user_id)
    return {"detail": "Announcement deleted successfully."}


@router.patch("/{announcement_id}")
def update_announcement(
    announcement_id: int,
    announcement_data: AnnouncementUpdate,
    jwt: JWTDep,
    session: SessionDep,
):
    """Update an announcement (author only)."""
    user_id = ensure_jwt_and_get_sub(jwt)

    announcement = session.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    if announcement.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to edit this announcement",
        )

    updated_announcement = edit_announcement(
        session=session,
        announcement_id=announcement_id,
        title=announcement_data.title,
        description=announcement_data.description,
        content=announcement_data.content,
        thumbnail=announcement_data.thumbnail,
        user_id=user_id,
        priority=announcement_data.priority,
    )
    if not updated_announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    return {"announcement": updated_announcement}


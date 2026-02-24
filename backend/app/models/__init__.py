"""User and authentication models."""

from datetime import datetime
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel

from app.schemas.types import RoleEnum


class User(SQLModel, table=True):
    """User model with OAuth and announcement relationships."""

    id: str = Field(primary_key=True)
    email: str = Field(index=True)
    personnelID: Optional[str] = None
    tags: Optional[str] = None
    role: Optional[RoleEnum] = None
    year: Optional[int] = None
    department: Optional[str] = None
    class_: Optional[str] = None
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    accounts: List["OAuthAccount"] = Relationship(back_populates="user")
    announcements: List["Announcement"] = Relationship(back_populates="author")


class OAuthAccount(SQLModel, table=True):
    """OAuth account model for third-party authentication."""

    id: str = Field(primary_key=True)
    provider: str
    provider_account_id: str
    access_token_enc: Optional[str] = None
    refresh_token_enc: Optional[str] = None
    expires_at: Optional[int] = None
    scope: Optional[str] = None

    user_id: str = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="accounts")


class Announcement(SQLModel, table=True):
    """Announcement model for school news and updates."""

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    content: Optional[str]
    thumbnail: Optional[str] = None
    author_id: str = Field(foreign_key="user.id")
    author: "User" = Relationship(back_populates="announcements")
    date: str
    priority: int

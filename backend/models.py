from sqlmodel import Field, SQLModel, Relationship
from typing import Optional, List
from datetime import datetime
from custom_types import RoleEnum


class OAuthAccount(SQLModel, table=True):
    id: str = Field(primary_key=True)
    provider: str
    provider_account_id: str
    access_token_enc: Optional[str] = None
    refresh_token_enc: Optional[str] = None
    expires_at: Optional[int] = None
    scope: Optional[str] = None

    user_id: str = Field(foreign_key="user.id")
    user: "User" = Relationship(back_populates="accounts")

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(index=True)
    personnelID: Optional[str] = None
    tags: Optional[str] = None
    role: Optional[RoleEnum] = None
    department: Optional[str] = None
    class_: Optional[str] = None
    name: Optional[str] = None
    image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    accounts: List[OAuthAccount] = Relationship(back_populates="user")
    announcements: List["Announcement"] = Relationship(back_populates="author")

class Announcement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    content: Optional[str]
    thumbnail: Optional[str] = None
    author_id: str = Field(foreign_key="user.id")
    author: "User" = Relationship(back_populates="announcements")
    date: str
    priority: int



import random
from typing import Optional

from sqlmodel import Field, SQLModel


class Announcement(SQLModel, table=True):
    id: int = Field(default=random.randint(1, 1000000), primary_key=True)
    title: str
    description: str
    thumbnail: Optional[str] = None
    authorName: str
    authorImage: Optional[str] = None
    date: str
    target: str
    priority: int

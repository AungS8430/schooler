from dataclasses import dataclass
from datetime import date, timedelta
from enum import Enum
from typing import Optional

from pydantic import BaseModel
from pathlib import Path
import json
from functools import cache

@cache
def load_info():
    file_path = Path(__file__).parent.parent.parent / "volumes" / "info.json"
    with open(file_path) as file:
        out = json.loads(file.read())
    return out


class OAuthUpsertIn(BaseModel):
    provider: str
    provider_account_id: str
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    tokens: Optional[dict] = None


class RoleEnum(str, Enum):
    ADMIN = "Admin"
    TEACHER = "Teacher"
    STUDENT = "Student"


TIME_LOOKUP = {1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"}

info = load_info()
DEPARTMENT = info["departments"]
GRADE_LOOKUP = info["grades"]
CLASSES_LOOKUP = info["classes"]

class OverrideType(Enum):
    CLASS = "class"
    HOLIDAY = "holiday"
    EXAM = "exam"
    EVENT = "event"
    OTHER = "other"
    BREAK = "break"


@dataclass
class TimeScheduleTS:
    id: str
    title: str
    slotIds: list[str]
    location: str | None = None
    endsEarly: bool = False
    overlapsBreak: bool = False
    isBreak: bool = False
    isLunch: bool = False


@dataclass
class Room:
    year: int
    department: str
    class_: str

    def toTag(self) -> list[str]:
        return [f"year{self.year}", self.department, f"class-{self.class_}"]


def room_from_tag(tags: list[str]) -> Room:
    outRoom = Room(0, "None", "class-C2R1")
    for tag in tags:
        if tag[:4] == "year":
            outRoom.year = int(tag[4:])
            continue
        if tag in DEPARTMENT:
            outRoom.department = tag
            continue
        if tag[:6] == "class-":
            outRoom.class_ = tag[6:]
    return outRoom


@dataclass
class Event:
    id: int
    type: OverrideType
    title: str
    date: date
    duration: int
    description: Optional[str] = None

    def convert(self) -> dict:
        return {
            "id": self.id,
            "type": self.type.value,
            "title": self.title,
            "start": (self.date).isoformat(),
            "end": (self.date + timedelta(days=self.duration - 1)).isoformat(),
            "description": self.description,
        }


@dataclass
class Calendar:
    events: list[dict]
    start: str
    end: str

    def convert(self) -> dict:
        return {
            "events": self.events,
            "start": self.start,
            "end": self.end,
        }


@dataclass
class AnnouncementReturn:
    id: Optional[int]
    title: str
    description: str
    content: Optional[str]
    thumbnail: Optional[str]
    author_id: str
    authorName: Optional[str]
    authorImage: Optional[str]
    date: str
    priority: int


class AnnouncementCreate(BaseModel):
    title: str
    description: str
    content: Optional[str] = None
    thumbnail: Optional[str] = None
    priority: int


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    thumbnail: Optional[str] = None
    priority: Optional[int] = None

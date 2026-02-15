from dataclasses import dataclass
from enum import Enum
from typing import Optional
from pydantic import BaseModel

class OAuthUpsertIn(BaseModel):
    provider: str
    provider_account_id: str
    email: str
    name: Optional[str] = None
    image: Optional[str] = None
    tokens: Optional[dict] = None

class RoleEnum(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

TIME_LOOKUP = {1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"}

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
    slotIDs: list[str]
    location: str | None = None
    endsEarly: bool = False
    overlapsBreak: bool = False
    isBreak: bool = False
    isLunch: bool = False

DEPARTMENT = ["computer", "mechatronic", "electrical"]

@dataclass
class Room:
    year: int
    department: str
    room: int

    def toTag(self) -> list[str]:
        return [f"year{self.year}", self.department, f"room{self.room}"]

def room_from_tag(tags: list[str]) -> Room:
    outRoom = Room(0, "None", 0)
    for tag in tags:
        if tag[:4] == "year":
            outRoom.year = int(tag[4:])
            continue
        if tag in DEPARTMENT:
            outRoom.department = tag
            continue
        if tag[:4] == "room":
            outRoom.room = int(tag[4:])
    return outRoom

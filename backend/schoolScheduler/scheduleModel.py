from dataclasses import dataclass
from enum import Enum

TIME_LOOKUP = {1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"}


class OverrideType(Enum):
    CLASS = "class"
    HOLIDAY = "holiday"
    EXAM = "exam"
    EVENT = "event"
    OTHER = "other"
    BREAK = "break"


@dataclass
class TimescheuleTS:
    id: str
    title: str
    slotIDs: list[str]
    location: str | None = None
    endsEarly: bool = False
    overlapsBreak: bool = False
    isBreak: bool = False
    isLunch: bool = False

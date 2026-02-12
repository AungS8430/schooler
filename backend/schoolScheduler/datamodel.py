from dataclasses import dataclass
from datetime import datetime

TIME_LOOKUP = {1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"}


@dataclass
class Room:
    year: int
    department: str
    room: int


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

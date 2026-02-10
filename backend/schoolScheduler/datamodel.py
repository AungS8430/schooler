from dataclasses import dataclass
from datetime import datetime

TIME_LOOKUP = {1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday"}


@dataclass
class Room:
    year: int
    department: str
    room: int


@dataclass
class Timeslot:
    begin: int
    subject: str
    duration: int
    location: str


@dataclass
class Timeschedule:
    date: datetime
    schedule: list[Timeslot]

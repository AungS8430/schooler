from dataclasses import dataclass

DEPARTMENT = ["computer", "mechatronic", "electrical"]


@dataclass
class Room:
    year: int
    department: str
    room: int

    def toTag(self) -> list[str]:
        return [f"year{self.year}", self.department, f"room{self.room}"]


def fromTag(tags: list[str]) -> Room:
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

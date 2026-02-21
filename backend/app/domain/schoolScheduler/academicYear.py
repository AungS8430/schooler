from app.domain.common import check_tag_strong
from app.schemas.types import Calendar, Event, OverrideType, Room
from app.domain.schoolScheduler import loader


def get_events(room: Room) -> list[Event]:
    rawEvents = loader.load_event()
    out: list[Event] = []
    for idx, event in enumerate(rawEvents):
        for target in event.get("actions", []):
            if not check_tag_strong(target["for"], room.toTag()):
                continue
        out.append(
            Event(
                id=idx,
                date=event["date"],
                duration=event.get("duration", 1),
                title=event["event"],
                description=event.get("description", ""),
                type=OverrideType(event.get("type", "other")),
            )
        )
    return out


def get_events_all() -> list[Event]:
    rawEvents = loader.load_event()
    out: list[Event] = []
    for idx, event in enumerate(rawEvents):
        out.append(
            Event(
                id=idx,
                date=event["date"],
                duration=event.get("duration", 1),
                title=event["event"],
                description=event.get("description", ""),
                type=OverrideType(event.get("type", "other")),
            )
        )
    return out


def convert(events: list[Event]) -> list[dict]:
    return [event.convert() for event in events]


def get_academic_info(events: list[Event]) -> Calendar:
    return Calendar(
        events=convert(events),
        start=loader.load_academic_info()["academicYear"]["start"],
        end=loader.load_academic_info()["academicYear"]["end"],
    )

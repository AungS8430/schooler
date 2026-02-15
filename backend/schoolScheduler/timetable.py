from copy import deepcopy
from dataclasses import asdict
from datetime import date, timedelta
from typing import Any

from common import check_tag_strong, model
from schoolScheduler.loader import load_event, load_schedule, load_special
from custom_types import TimeScheduleTS, TIME_LOOKUP

def convert_timetable(
    rawTimetable: tuple[list[dict[str, Any]], list[str]],
    hasSHR: bool | None = None,
    hasLunch: bool | None = None,
) -> tuple[list[dict[str, Any]], list[str]]:
    dayTimetable = rawTimetable[0]
    if len(rawTimetable[1]) != 0:
        hasSHR = False
        hasLunch = False
    if hasSHR is None:
        hasSHR = True
    if hasLunch is None:
        hasLunch = True
    for timetable in dayTimetable:
        if timetable["id"] == "shr":
            hasSHR = True
        if timetable["id"] == "lunch":
            hasLunch = True
    dayTimetable.sort(key=lambda x: x["timeslot"])
    output: list[TimeScheduleTS] = []
    if hasSHR:
        output.append(TimeScheduleTS("shr", "SHR", ["s1"]))
    passLunch = False
    lastTimeslot = 1
    for timetable in dayTimetable:
        timeslot = timetable["timeslot"]
        if hasLunch and timeslot > 4 and not passLunch:
            passLunch = True
            output.append(
                TimeScheduleTS("lunch", "Lunch", ["s6"], isLunch=True)
            )
        if timetable["id"] == "shr" or timetable["id"] == "lunch":
            continue
        id = timetable.get("id", "")
        title = timetable.get("subject", "")
        duration = timetable.get("duration", 1)
        location = timetable.get("where", "")
        output.append(
            TimeScheduleTS(
                id=id,
                title=title,
                slotIDs=[
                    f"s{x + 1 if not passLunch else x + 2}"
                    for x in range(timeslot, timeslot + duration)
                ],
                location=location,
                overlapsBreak=True if duration >= 3 else False,
            )
        )
        if timeslot - lastTimeslot > 0:
            output[-2].endsEarly = True
        lastTimeslot = timeslot + duration
    outFinal = [asdict(x) for x in output]
    return outFinal, rawTimetable[1]


def get_special(
    selectedRoom: dict[str, list[dict]], action: str
) -> tuple[list[dict], str]:
    if action[0:6] == "class-" and action[6:] in TIME_LOOKUP.values():
        return selectedRoom[action[6:]], "Normal"
    for special in load_special():
        if special["class name"] == action:
            return special["schedule"], special["class name"]
    return [], "Error"


def build_by_date(room: model.Room, when: date) -> tuple[list[dict[str, Any]], list]:
    events = load_event()
    schedule = load_schedule()
    selectedRoom = schedule[f"year{room.year}"][room.department][f"room{room.room}"][
        TIME_LOOKUP[when.isoweekday()]
    ]
    out: list = deepcopy(selectedRoom)
    actionDid = []
    for event in events:
        if not event["date"] <= when <= event["date"] + timedelta(event["duration"]):
            continue
        actions = event["actions"]
        for action in actions:
            if not check_tag_strong(action["for"], room.toTag()):
                continue
            tem = get_special(
                schedule[f"year{room.year}"][room.department][f"room{room.room}"],
                action["with"],
            )
            actionDid.append((action["action"], tem[1]))
            match action["action"]:
                case "replace":
                    out = tem[0]
                case "add":
                    out.extend(out[0])
                case _:
                    pass
    return out, actionDid


def date_to_start_of_week(when: date) -> date:
    return when - timedelta(days=when.weekday())


def week_schedule(
    room: model.Room, when: date
) -> tuple[dict[int, list[dict[str, Any]]], dict[int, list]]:
    startDate = date_to_start_of_week(when)
    output = {}
    outAction = {}
    for diff in range(5):
        eachDay = timedelta(days=diff) + startDate
        tem = convert_timetable(build_by_date(room, eachDay))
        output[diff + 1] = tem[0]
        outAction[diff + 1] = tem[1]
    return output, outAction


def fixed_week_schedule(
    room: model.Room,
) -> tuple[dict[int, list[dict[str, Any]]], dict[int, list]]:
    return week_schedule(room, date(1970, 1, 1))

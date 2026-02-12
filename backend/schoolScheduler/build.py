import json
from copy import deepcopy
from dataclasses import asdict
from datetime import datetime, timedelta
from functools import cache
from typing import Any

from schoolScheduler import datamodel


def converter(
    rawTimetable: tuple[list[dict[str, Any]], list[str]],
    hasSHR: bool | None = None,
    hasLunch: bool | None = None,
) -> list[dict[str, Any]]:
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
    output: list[datamodel.TimescheuleTS] = []
    if hasSHR:
        output.append(datamodel.TimescheuleTS("shr", "SHR", ["s1"]))
    passLunch = False
    lastTimeslot = 1
    for timetable in dayTimetable:
        timeslot = timetable["timeslot"]
        if hasLunch and timeslot > 4 and not passLunch:
            passLunch = True
            output.append(
                datamodel.TimescheuleTS("lunch", "Lunch", ["s6"], isLunch=True)
            )
        if timetable["id"] == "shr" or timetable["id"] == "lunch":
            continue
        title = timetable["subject"]
        duration = timetable["duration"]
        id = timetable["id"]
        location = timetable["where"]
        output.append(
            datamodel.TimescheuleTS(
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
    return outFinal


@cache
def loadSchedule():
    with open("schoolScheduler/volumes/class.json") as file:
        out = json.loads(file.read())
    return out


@cache
def loadSpecial() -> list[dict[str, Any]]:
    with open("schoolScheduler/volumes/special.json") as file:
        out = json.loads(file.read())
    return out


@cache
def loadEvent():
    with open("schoolScheduler/volumes/override.json") as file:
        out = json.loads(file.read())
        for event in out:
            event["date"] = datetime.strptime(event["date"], "%Y-%m-%d")
    return out


def checkRoom(room: datamodel.Room, cases: str):
    if cases == "all-classes":
        return True
    if cases == f"year{room.year}-de_{room.department}-room{room.room}":
        return True
    return False


def getSpecial(
    selectedRoom: dict[str, list[dict]], action: str
) -> tuple[list[dict], str]:
    if action[0:6] == "class-" and action[6:] in datamodel.TIME_LOOKUP.values():
        return selectedRoom[action[6:]], "Normal"
    for special in loadSpecial():
        if special["class name"] == action:
            return special["schedule"], special["class name"]
    return [], "Error"


def buildByDate(
    room: datamodel.Room, date: datetime
) -> tuple[list[dict[str, Any]], list]:
    events = loadEvent()
    schedule = loadSchedule()
    selectedRoom = schedule[f"year{room.year}"][room.department][f"room{room.room}"][
        datamodel.TIME_LOOKUP[date.isoweekday()]
    ]
    out: list = deepcopy(selectedRoom)
    actionDid = []
    for event in events:
        if not event["date"] <= date <= event["date"] + timedelta(event["duration"]):
            continue
        actions = event["actions"]
        for action in actions:
            if not checkRoom(room, action["for"]):
                continue
            tem = getSpecial(
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

import json
from copy import deepcopy
from datetime import datetime, timedelta
from functools import cache

from schoolScheduler import datamodel


def build():
    pass


@cache
def loadSchedule():
    with open("schoolScheduler/volumes/class.json") as file:
        out = json.loads(file.read())
    return out


@cache
def loadSpecial() -> list[dict[str, list[dict]]]:
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


def getSpecial(selectedRoom: dict[str, list[dict]], action: str) -> list[dict]:
    if action[0:6] == "class-":
        return selectedRoom[action[6:]]
    for special in loadSpecial():
        if special["class name"] == action:
            return special["schedule"]
    return []


def buildByDate(room: datamodel.Room, date: datetime):
    events = loadEvent()
    schedule = loadSchedule()
    selectedRoom = schedule[f"year{room.year}"][room.department][f"room{room.room}"][
        datamodel.TIME_LOOKUP[date.isoweekday()]
    ]
    out: list = deepcopy(selectedRoom)
    for event in events:
        if not event["date"] <= date <= event["date"] + timedelta(event["duration"]):
            continue
        actions = event["actions"]
        for action in actions:
            match action["action"]:
                case "replace":
                    if not checkRoom(room, action["for"]):
                        continue
                    out = getSpecial(
                        schedule[f"year{room.year}"][room.department][
                            f"room{room.room}"
                        ],
                        action["with"],
                    )
                case "add":
                    out.extend(
                        getSpecial(
                            schedule[f"year{room.year}"][room.department][
                                f"room{room.room}"
                            ],
                            action["with"],
                        )
                    )
                case _:
                    pass
    return out

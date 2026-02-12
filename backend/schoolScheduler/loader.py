import json
from datetime import date
from functools import cache
from typing import Any


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
            event["date"] = date.strptime(event["date"], "%Y-%m-%d")
    return out

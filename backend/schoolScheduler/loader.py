import json
from datetime import date
from functools import cache
from typing import Any
from pathlib import Path


@cache
def load_schedule():
    file_path = Path(__file__).parent / "volumes" / "timetables.json"
    with open(file_path) as file:
        out = json.loads(file.read())
    return out

@cache
def load_slots():
    file_path = Path(__file__).parent / "volumes" / "slots.json"
    with open(file_path) as file:
        out = json.loads(file.read())
    return out


@cache
def load_special() -> list[dict[str, Any]]:
    with open("schoolScheduler/volumes/special.json") as file:
        out = json.loads(file.read())
    return out


@cache
def load_event():
    with open("schoolScheduler/volumes/override.json") as file:
        out = json.loads(file.read())
        for event in out:
            event["date"] = date.strptime(event["date"], "%Y-%m-%d")
    return out


@cache
def load_academic_info():
    with open("schoolScheduler/volumes/academicInfo.json") as file:
        out = json.loads(file.read())
    return out

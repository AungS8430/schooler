from pathlib import Path
import json
from functools import cache

@cache
def load_resources():
    file_path = Path(__file__).parent.parent.parent.parent / "volumes" / "resources.json"
    with open(file_path) as file:
        out = json.loads(file.read())
    return out
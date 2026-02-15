import json


def check_tag_strong(sources: list[list[str]], target: list[str]) -> bool:
    output = False
    temTarget = set(target)
    for source in sources:
        temSource = set(source)
        output = output or temSource > temTarget
        if "all-classes" in temSource:
            output = True
    return output


def check_tag_weak(source: list[str], target: list[str]) -> bool:
    output = False
    temTarget = set(target)
    temSource = set(source)
    output = output or temSource > temTarget
    if "all-classes" in temSource:
        output = True
    return output


def str_to_tags(source: str | None) -> list[str]:
    if source is None:
        return []
    return json.loads(source)


def tags_to_str(source: list[str]) -> str:
    return json.dumps(source)


def format_str_tags(source: str | None) -> str:
    if source is None:
        return ""
    temstr = source.split()
    return tags_to_str(temstr)

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


def str_to_tags(source: str) -> list[str]:
    return source.split(",")


def tags_to_str(source: list[str]) -> str:
    tem = source.pop()
    for x in source:
        tem = f"{tem},{x}"
    return tem


def format_str_tags(source: str) -> str:
    temstr = source.split()
    return tags_to_str(temstr)

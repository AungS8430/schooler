def check_tag_Strong(sources: list[list[str]], target: list[str]) -> bool:
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

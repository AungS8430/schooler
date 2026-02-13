def checkTagStrong(sources: list[list[str]], target: list[str]) -> bool:
    output = False
    temTarget = set(target)
    for source in sources:
        temSource = set(source)
        output = output or temSource > temTarget
        if "all-classes" in temSource:
            output = True
    return output


def checkTagWeak(source: list[str], target: list[str]) -> bool:
    output = False
    temTarget = set(target)
    temSource = set(source)
    output = output or temSource > temTarget
    if "all-classes" in temSource:
        output = True
    return output

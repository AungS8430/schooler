def checkTag(sources: list[list[str]], target: list[str]) -> bool:
    output = False
    temTarget = set(target)
    for source in sources:
        temSource = set(source)
        output = output or temSource > temTarget
        if temSource.pop() == "all-classes":
            output = True
    return output

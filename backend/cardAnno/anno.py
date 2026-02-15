from sqlmodel import Session, or_, select

from models import Announcement
from common import check_tag_weak, format_str_tags, str_to_tags


def fetch_user_announcements(session: Session, user_target: list[str]) -> list[int]:

    statement = (
        select(Announcement)
        .where(or_(check_tag_weak(str_to_tags(Announcement.target), user_target)))
        .order_by(Announcement.priority.desc())  # pyright: ignore[reportAttributeAccessIssue]
    )
    announcements = session.exec(statement).all()
    announcement_ids = [announcement.id for announcement in announcements]
    return announcement_ids


def post_announcement(
    session: Session,
    title: str,
    description: str,
    thumbnail: str | None,
    authorName: str,
    authorImage: str | None,
    date: str,
    target: str,
    priority: int,
) -> Announcement:
    new_announcement = Announcement(
        title=title,
        description=description,
        thumbnail=thumbnail,
        authorName=authorName,
        authorImage=authorImage,
        date=date,
        target=format_str_tags(target),
        priority=priority,
    )
    session.add(new_announcement)
    session.commit()
    session.refresh(new_announcement)
    return new_announcement


def delete_announcement(session: Session, announcement_id: int) -> None:
    announcement = session.get(Announcement, announcement_id)
    if announcement:
        session.delete(announcement)
        session.commit()


def edit_announcement(
    session: Session,
    announcement_id: int,
    title: str | None = None,
    description: str | None = None,
    thumbnail: str | None = None,
    authorName: str | None = None,
    authorImage: str | None = None,
    date: str | None = None,
    target: str | None = None,
    priority: int | None = None,
) -> Announcement | None:
    announcement = session.get(Announcement, announcement_id)
    if announcement:
        if title is not None:
            announcement.title = title
        if description is not None:
            announcement.description = description
        if thumbnail is not None:
            announcement.thumbnail = thumbnail
        if authorName is not None:
            announcement.authorName = authorName
        if authorImage is not None:
            announcement.authorImage = authorImage
        if date is not None:
            announcement.date = date
        if target is not None:
            announcement.target = format_str_tags(target)
        if priority is not None:
            announcement.priority = priority
        session.add(announcement)
        session.commit()
        session.refresh(announcement)
        return announcement
    return None


def get_announcement_by_ID(
    session: Session,
    announcement_id: int,
) -> Announcement | None:
    announcement = session.get(Announcement, announcement_id)
    return announcement

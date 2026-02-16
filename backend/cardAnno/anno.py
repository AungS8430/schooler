from sqlmodel import Session, or_, select

from models import Announcement, User
from custom_types import AnnouncementReturn
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
    author_id: str,
    date: str,
    target: str,
    priority: int,
) -> AnnouncementReturn:
    new_announcement = Announcement(
        title=title,
        description=description,
        thumbnail=thumbnail,
        author_id=author_id,
        date=date,
        target=format_str_tags(target),
        priority=priority,
    )
    session.add(new_announcement)
    session.commit()
    session.refresh(new_announcement)
    user = session.get(User, author_id)
    if not user:
        raise ValueError("Author not found.")
    return AnnouncementReturn(
        id=new_announcement.id,
        title=new_announcement.title,
        description=new_announcement.description,
        thumbnail=new_announcement.thumbnail,
        author_id=new_announcement.author_id,
        authorName=user.name,
        authorImage=user.image,
        date=new_announcement.date,
        target=new_announcement.target,
        priority=new_announcement.priority,
    )


def delete_announcement(session: Session, announcement_id: int, user_id: str) -> None:
    announcement = session.get(Announcement, announcement_id)
    if announcement:
        if announcement.author_id != user_id:
            raise PermissionError("You do not have permission to delete this announcement.")
        session.delete(announcement)
        session.commit()


def edit_announcement(
    session: Session,
    announcement_id: int,
    user_id: str,
    title: str | None = None,
    description: str | None = None,
    thumbnail: str | None = None,
    date: str | None = None,
    target: str | None = None,
    priority: int | None = None,
) -> AnnouncementReturn | None:
    announcement = session.get(Announcement, announcement_id)
    if announcement:
        if announcement.author_id != user_id:
            raise PermissionError("You do not have permission to edit this announcement.")
        if title is not None:
            announcement.title = title
        if description is not None:
            announcement.description = description
        if thumbnail is not None:
            announcement.thumbnail = thumbnail
        if date is not None:
            announcement.date = date
        if target is not None:
            announcement.target = format_str_tags(target)
        if priority is not None:
            announcement.priority = priority
        session.add(announcement)
        session.commit()
        session.refresh(announcement)
        user = session.get(User, announcement.author_id)
        if not user:
            raise ValueError("Author not found.")
        return AnnouncementReturn(
            id=announcement.id,
            title=announcement.title,
            description=announcement.description,
            thumbnail=announcement.thumbnail,
            author_id=announcement.author_id,
            authorName=user.name,
            authorImage=user.image,
            date=announcement.date,
            target=announcement.target,
            priority=announcement.priority,
        )
    return None


def get_announcement_by_ID(
    session: Session,
    announcement_id: int,
) -> AnnouncementReturn | None:
    announcement = session.get(Announcement, announcement_id)
    user = session.get(User, announcement.author_id) if announcement else None
    if announcement and user:
        return AnnouncementReturn(
            id=announcement.id,
            title=announcement.title,
            description=announcement.description,
            thumbnail=announcement.thumbnail,
            author_id=announcement.author_id,
            authorName=user.name,
            authorImage=user.image,
            date=announcement.date,
            target=announcement.target,
            priority=announcement.priority,
        )
    return None
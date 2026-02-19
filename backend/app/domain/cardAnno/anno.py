from sqlmodel import Session, select

from app.schemas.types import AnnouncementReturn
from app.models import Announcement, User


def fetch_user_announcements(
    session: Session, query: str | None = None
) -> list[int | None]:
    if query is not None:
        query = query.strip()

    statement = (
        select(Announcement).order_by(Announcement.date.desc())  # pyright: ignore[reportAttributeAccessIssue]
    )
    announcements = session.exec(statement).all()
    filtered = [
        announcement
        for announcement in announcements
        if (
            query is None
            or query.lower() in announcement.title.lower()
            or query.lower() in announcement.description.lower()
        )
    ]
    announcement_ids = [announcement.id for announcement in filtered]
    return announcement_ids


def post_announcement(
    session: Session,
    title: str,
    description: str,
    content: str | None,
    thumbnail: str | None,
    author_id: str,
    date: str,
    priority: int,
) -> AnnouncementReturn:
    new_announcement = Announcement(
        title=title,
        description=description,
        content=content,
        thumbnail=thumbnail,
        author_id=author_id,
        date=date,
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
        content=new_announcement.content,
        thumbnail=new_announcement.thumbnail,
        author_id=new_announcement.author_id,
        authorName=user.name,
        authorImage=user.image,
        date=new_announcement.date,
        priority=new_announcement.priority,
    )


def delete_announcement(session: Session, announcement_id: int, user_id: str) -> None:
    announcement = session.get(Announcement, announcement_id)
    if announcement:
        if announcement.author_id != user_id:
            raise PermissionError(
                "You do not have permission to delete this announcement."
            )
        session.delete(announcement)
        session.commit()


def edit_announcement(
    session: Session,
    announcement_id: int,
    user_id: str,
    title: str | None = None,
    description: str | None = None,
    content: str | None = None,
    thumbnail: str | None = None,
    priority: int | None = None,
) -> AnnouncementReturn | None:
    announcement = session.get(Announcement, announcement_id)
    if announcement:
        if announcement.author_id != user_id:
            raise PermissionError(
                "You do not have permission to edit this announcement."
            )
        if title is not None:
            announcement.title = title
        if description is not None:
            announcement.description = description
        if content is not None:
            announcement.content = content
        if thumbnail is not None:
            announcement.thumbnail = thumbnail
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
            content=announcement.content,
            thumbnail=announcement.thumbnail,
            author_id=announcement.author_id,
            authorName=user.name,
            authorImage=user.image,
            date=announcement.date,
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
            content=announcement.content,
            thumbnail=announcement.thumbnail,
            author_id=announcement.author_id,
            authorName=user.name,
            authorImage=user.image,
            date=announcement.date,
            priority=announcement.priority,
        )
    return None

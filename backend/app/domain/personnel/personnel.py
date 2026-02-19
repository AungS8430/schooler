from sqlmodel import Session, select

from app.domain.common import check_tag_weak, tags_to_str
from app.domain.common.matching import str_to_tags
from app.schemas.types import RoleEnum
from app.models import User


def fetch_all_personnel(session: Session) -> list[User]:
    statement = select(User)
    personnel_list = session.exec(statement).all()
    return [personnel for personnel in personnel_list]


def fetch_personnel_by_personnelID(session: Session, personnel_id: str) -> User | None:
    statement = select(User).where(User.personnelID == personnel_id)
    personnel = session.exec(statement).first()
    return personnel


def edit_personnel(
    session: Session,
    personnel_id: str,
    name: str | None = None,
    role: str | None = None,
    tags: list[str] | None = None,
) -> User | None:
    personnel = fetch_personnel_by_personnelID(session, personnel_id)
    if personnel:
        if name is not None:
            personnel.name = name
        if role is not None:
            personnel.role = RoleEnum(role)
        if tags is not None:
            personnel.tags = tags_to_str(tags)
        session.add(personnel)
        session.commit()
        session.refresh(personnel)
    return personnel


def fetch_by_tags(session: Session, tags: list[str]) -> list[User]:
    statement = select(User).where(check_tag_weak(str_to_tags(User.tags), tags))
    personnel_list = session.exec(statement).all()
    return [personnel for personnel in personnel_list]


def check_permission_to_edit(
    personnel: User,
) -> bool:
    if personnel.role == RoleEnum.TEACHER:
        return True
    if personnel.role == RoleEnum.ADMIN:
        return True
    if RoleEnum.ADMIN in str_to_tags(personnel.tags):
        return True
    return False


def get_personnel_tags(session: Session, personnel_id: str) -> list[str] | None:
    personnel = fetch_personnel_by_personnelID(session, personnel_id)
    if personnel:
        return str_to_tags(personnel.tags)
    return None

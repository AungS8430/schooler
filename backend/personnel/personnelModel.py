import random

from sqlmodel import Enum, Field, SQLModel


class RoleEnum(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class Personnel(SQLModel, table=True):
    id: int = Field(default=random.randint(0, 1000000), primary_key=True)
    personnelID: str
    name: str
    role: RoleEnum
    tags: str

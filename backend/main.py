import logging
from contextlib import asynccontextmanager
from datetime import date, datetime
from os import getenv
from typing import Annotated, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi_nextauth_jwt import NextAuthJWT
from sqlmodel import Session, SQLModel, create_engine, select

from cardAnno.anno import (
    delete_announcement,
    edit_announcement,
    fetch_user_announcements,
    get_announcement_by_ID,
    post_announcement,
)
from custom_types import (
    CLASSES_LOOKUP,
    GRADE_LOOKUP,
    AnnouncementCreate,
    OAuthUpsertIn,
    Room,
)
from models import Announcement, User
from schoolScheduler import (
    fixed_week_schedule,
    get_academic_info,
    get_events,
    get_events_all,
    week_schedule,
)
from user.auth import OAuthAccountConflict, get_user_perms, upsert_user_from_oauth

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

# load env if it is not in docker
ISDOCKER = getenv("ISDOCKER", "False")
if ISDOCKER == "False":
    logger.info("-> Currently running outside docker container.")
    logger.info("-> Loading env file.")
    load_dotenv("./.env")


# get env var
JWT_SECRET = getenv("SECRET")
if JWT_SECRET is None:
    raise Exception("JWT secret does not exist.")
DB_USER = getenv("DB_USER")
if DB_USER is None:
    raise Exception("DB_USER Not found.")
DB_PASS = getenv("DB_PASS")
if DB_PASS is None:
    raise Exception("DB_PASS Not found.")
DB_HOST = getenv("DB_HOST")
if DB_HOST is None:
    raise Exception("DB_HOST Not found.")
DB_PORT = getenv("DB_PORT")
if DB_PORT is None:
    raise Exception("DB_PORT Not found.")
DB_NAME = getenv("DB_NAME")
if DB_NAME is None:
    raise Exception("DB_NAME Not found.")
INTERNAL_API_SECRET = getenv("INTERNAL_API_SECRET")
if INTERNAL_API_SECRET is None:
    logger.warning("INTERNAL_API_SECRET Not found.")


# config Database
DB_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
# Only set sqlite-specific connect args when using a SQLite database URL
connect_args = {}
if DB_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# init Database
engine = create_engine(DB_URL, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


# on server start up and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    logger.info("-> Start up server.")
    yield
    logger.info("-> Shutting down server.")


# init fastapi
app = FastAPI(lifespan=lifespan)


# config CORS
origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# load JWT
JWT = NextAuthJWT(secret=JWT_SECRET)


def ensure_jwt_and_get_sub(jwt: Optional[dict]) -> str:
    """
    Helper to make explicit checks for the jwt object and the 'sub' claim.
    This avoids static-analyzer warnings about calling dict methods on None.
    """
    if jwt is None or not isinstance(jwt, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT: authentication required",
        )
    user_id = jwt.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT: missing sub claim",
        )
    return user_id


@app.get("/")
async def bounce_jwt(jwt: Annotated[Optional[dict], Depends(JWT)]):
    # Explicitly check jwt isn't None so static analysis knows jwt is a dict below.
    if jwt is None or not isinstance(jwt, dict):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT: authentication required",
        )
    return jwt


@app.get("/getDBHealthCheck")
async def getDBHealthCheck():
    """
    Simple database health check. Executes a trivial query against the configured database
    and reports whether the DB is reachable and responding.
    """
    try:
        with Session(engine) as session:
            # execute a minimal query to verify connectivity
            result = session.exec(select(1)).first()

        if result is None:
            return {"status": "unhealthy", "detail": "no result from database"}
        return {"status": "healthy", "detail": "ok"}
    except Exception as e:
        # Return the error detail to help debugging (suitable for internal use)
        return {"status": "unhealthy", "detail": str(e)}


@app.post("/internal/oauth/upsert", status_code=status.HTTP_200_OK)
def oauth_upsert(
    payload: OAuthUpsertIn,
    x_internal_secret: Optional[str] = Header(None),
    session: Session = Depends(get_session),
):
    """
    Internal endpoint called server-side (NextAuth signIn callback) to upsert a User and OAuthAccount.

    Protected by X-Internal-Secret header. Returns 409 Conflict if the provider account is already
    linked to a different user.
    """
    if not INTERNAL_API_SECRET or x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    try:
        user = upsert_user_from_oauth(
            session=session,
            provider=payload.provider,
            provider_account_id=payload.provider_account_id,
            email=payload.email,
            name=payload.name,
            image=payload.image,
            tokens=payload.tokens,
        )
    except OAuthAccountConflict as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))

    return {"id": user.id, "email": user.email}


@app.get("/permissions")
def read_permissions(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    # Make the presence of the jwt explicit for the analyzer
    user_id = ensure_jwt_and_get_sub(jwt)
    permissions = get_user_perms(session, user_id)
    return {"permissions": permissions}


@app.get("/announcements")
def read_announcements(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
    query: Optional[str] = None,
):
    user_id = ensure_jwt_and_get_sub(jwt)
    announcement_ids = fetch_user_announcements(session, query)
    return {"announcement_ids": announcement_ids}


@app.get("/announcements/{announcement_id}")
def read_announcement(
    announcement_id: int,
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    announcement = get_announcement_by_ID(session, announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    return {"announcement": announcement}


@app.post("/announcements")
def create_announcement(
    announcement_data: AnnouncementCreate,
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    permissions = get_user_perms(session, user_id)
    if not permissions.get("role") or permissions.get("role") not in [
        "admin",
        "teacher",
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to create announcements",
        )
    new_announcement = post_announcement(
        session=session,
        title=announcement_data.title,
        description=announcement_data.description,
        content=announcement_data.content,
        thumbnail=announcement_data.thumbnail,
        author_id=user_id,
        date=datetime.now().isoformat(),
        priority=announcement_data.priority,
    )
    return {"announcement": new_announcement}


@app.delete("/announcements/{announcement_id}")
def remove_announcement(
    announcement_id: int,
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    delete_announcement(session, announcement_id, user_id)
    return {"detail": "Announcement deleted successfully."}


@app.patch("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    jwt: Annotated[Optional[dict], Depends(JWT)],
    title: str | None = None,
    description: str | None = None,
    content: str | None = None,
    thumbnail: str | None = None,
    date: str | None = None,
    priority: int | None = None,
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    announcement = session.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    if announcement.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to edit this announcement",
        )

    updated_announcement = edit_announcement(
        session=session,
        announcement_id=announcement_id,
        title=title,
        description=description,
        content=content,
        thumbnail=thumbnail,
        user_id=user_id,
        date=date,
        priority=priority,
    )
    if not updated_announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found"
        )
    return {"announcement": updated_announcement}


@app.get("/school-academic-calendar")
def get_school_academic_calendar():
    return get_academic_info(get_events_all()).convert()


@app.get("/get-personal-calendar")
def get_personal_calendar(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    # If the user record exists but fields are None, fall back to sensible defaults
    if user.year is None or user.department is None or user.class_ is None:
        year = 1
        department = "computer"
        class_ = 1
    else:
        year = user.year
        department = user.department
        class_ = int(user.class_)
    room = Room(year, department, class_)
    return get_academic_info(get_events(room)).convert()


@app.get("/school-timetable")
def get_school_timetable(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    # If the user record doesn't exist or fields are None, fall back to sensible defaults
    if user is None:
        year = 1
        department = "computer"
        class_ = 1
    else:
        year = 1 if user.year is None else user.year
        department = "computer" if user.department is None else user.department
        class_ = 1 if user.class_ is None else int(user.class_)
    room = Room(year, department, class_)
    return fixed_week_schedule(room)


@app.get("/dated-timetable")
def get_dated_timetable(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
    when: Optional[str] = None,
):
    if when is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Date query parameter is required",
        )
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    # If the user record doesn't exist or fields are None, fall back to sensible defaults
    if user is None:
        year = 1
        department = "computer"
        class_ = 1
    else:
        year = 1 if user.year is None else user.year
        department = "computer" if user.department is None else user.department
        class_ = 1 if user.class_ is None else int(user.class_)
    room = Room(year, department, class_)
    return week_schedule(room, date.fromisoformat(when))


@app.get("/grades")
def get_grades(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = ensure_jwt_and_get_sub(jwt)
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    if user is None:
        year = 1
    else:
        year = 1 if user.year is None else user.year
    grade = f"{GRADE_LOOKUP[year]}"
    return {"grades": grade}


@app.get("/classes")
def get_classes(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    grade: int = 1,
    department: Optional[str] = None,
):
    if not 0 < grade < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid grade"
        )
    user_id = ensure_jwt_and_get_sub(jwt)
    if department is None:
        year = 1
        return {"department": CLASSES_LOOKUP[year]}
    return {"classes": CLASSES_LOOKUP[grade][department]}


@app.get("/people")
def get_people(
    jwt: Annotated[Optional[dict], Depends(JWT)],
    session: Session = Depends(get_session),
    grade: Optional[int] = None,
    department: Optional[str] = None,
    class_: Optional[int] = None,
):
    user_id = ensure_jwt_and_get_sub(jwt)
    exected_query = (
        select(User)
        .where(User.year == grade if grade is not None else True)
        .where(User.department == department if department is not None else True)
        .where(User.class_ == class_ if class_ is not None else True)
    )
    users = session.exec(exected_query).all()
    users = [x.model_dump_json() for x in users]
    return {"users": users}


@app.get("/resources")
def get_resources():
    return {
        "id": 1,
        "title": "Example Resource",
        "author": "Jeffery Doe",
        "url": "https://drive.google.com/drive/u",
        "categorites": ["default", "default"],
    }

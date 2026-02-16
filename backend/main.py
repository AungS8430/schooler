import logging
from contextlib import asynccontextmanager
from os import getenv
from typing import Annotated, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi_nextauth_jwt import NextAuthJWT
from sqlmodel import Field, Session, SQLModel, create_engine, select

from custom_types import OAuthUpsertIn

from user.auth import upsert_user_from_oauth, get_user_perms, OAuthAccountConflict
from cardAnno.anno import (
    delete_announcement,
    fetch_user_announcements,
    post_announcement,
    edit_announcement,
    get_announcement_by_ID
)
from models import Announcement

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
origins = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# load JWT
JWT = NextAuthJWT(secret=JWT_SECRET)


@app.get("/")
async def bounce_jwt(jwt: Annotated[dict, Depends(JWT)]):
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
def read_permissions(jwt: Annotated[dict, Depends(JWT)], session: Session = Depends(get_session)):
    user_id = jwt.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT: missing sub claim")

    permissions = get_user_perms(session, user_id)
    return {"permissions": permissions}


@app.get("/announcements")
def read_announcements(jwt: Annotated[dict, Depends(JWT)], session: Session = Depends(get_session)):
    user_id = jwt.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT: missing sub claim")

    permissions = get_user_perms(session, user_id).get("permissions")
    announcement_ids = fetch_user_announcements(session, ["all-users", permissions.get("class"), permissions.get("department")])
    return {"announcement_ids": announcement_ids}

@app.get("/announcements/{announcement_id}")
def read_announcement(announcement_id: int, jwt: Annotated[dict, Depends(JWT)], session: Session = Depends(get_session)):
    user_id = jwt.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT: missing sub claim")
    announcement = get_announcement_by_ID(session, announcement_id)
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if not any(tag in ["all-users", get_user_perms(session, user_id).get("permissions").get("class"), get_user_perms(session, user_id).get("permissions").get("department")] for tag in announcement.target.split(",")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: You do not have access to this announcement")
    return {"announcement": announcement}


@app.post("/announcements")
def create_announcement(
    title: str,
    description: str,
    thumbnail: str | None,
    date: str,
    target: str,
    priority: int,
    jwt: Annotated[dict, Depends(JWT)],
    session: Session = Depends(get_session),
):
    user_id = jwt.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT: missing sub claim")
    permissions = get_user_perms(session, user_id).get("permissions")
    if not permissions.get("role") or permissions.get("role") not in ["admin", "teacher"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: You do not have permission to create announcements")
    new_announcement = post_announcement(
        session=session,
        title=title,
        description=description,
        thumbnail=thumbnail,
        author_id=user_id,
        date=date,
        target=target,
        priority=priority,
    )
    return {"announcement": new_announcement}


@app.delete("/announcements/{announcement_id}")
def remove_announcement(
    announcement_id: int,
    session: Session = Depends(get_session),
):

    delete_announcement(session, announcement_id)
    return {"detail": "Announcement deleted successfully."}

@app.patch("/announcements/{announcement_id}")
def update_announcement(
    announcement_id: int,
    jwt: Annotated[dict, Depends(JWT)],
    title: str | None = None,
    description: str | None = None,
    thumbnail: str | None = None,
    date: str | None = None,
    target: str | None = None,
    priority: int | None = None,
    session: Session = Depends(get_session),
):
    user_id = jwt.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT: missing sub claim")

    announcement = session.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if announcement.author_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden: You do not have permission to edit this announcement")

    updated_announcement = edit_announcement(
        session=session,
        announcement_id=announcement_id,
        title=title,
        description=description,
        thumbnail=thumbnail,
        user_id=user_id,
        date=date,
        target=target,
        priority=priority,
    )
    if not updated_announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    return {"announcement": updated_announcement}
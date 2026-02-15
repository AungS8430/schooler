import logging
from contextlib import asynccontextmanager
from os import getenv
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_nextauth_jwt import NextAuthJWT
from sqlmodel import Field, Session, SQLModel, create_engine, select

from cardAnno import (
    Announcement,
    delete_announcement,
    fetch_user_announcements,
    post_announcement,
)

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


@app.get("/announcements")
def read_announcements(session: Session = Depends(get_session)):

    announcement_ids = fetch_user_announcements(session, ["all-users"])
    return {"announcement_ids": announcement_ids}


@app.post("/postAnnouncement")
def create_announcement(
    title: str,
    description: str,
    thumbnail: str | None,
    authorName: str,
    authorImage: str | None,
    date: str,
    target: str,
    priority: int,
    session: Session = Depends(get_session),
):

    new_announcement = post_announcement(
        session=session,
        title=title,
        description=description,
        thumbnail=thumbnail,
        authorName=authorName,
        authorImage=authorImage,
        date=date,
        target=target,
        priority=priority,
    )
    return {"announcement": new_announcement}


@app.delete("/deleteAnnouncement/{announcement_id}")
def remove_announcement(
    announcement_id: int,
    session: Session = Depends(get_session),
):

    delete_announcement(session, announcement_id)
    return {"detail": "Announcement deleted successfully."}

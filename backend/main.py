from contextlib import asynccontextmanager
from os import getenv
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi_nextauth_jwt import NextAuthJWT
from sqlmodel import Field, Session, SQLModel, create_engine, select

# load .env
load_dotenv()


# get env var
JWT_SECRET = getenv("secret")
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
    print("start-up")
    yield
    print("close-down")


# init fastapi
app = FastAPI(lifespan=lifespan)


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

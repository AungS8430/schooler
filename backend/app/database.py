"""Database initialization and session management."""
import logging
from typing import Generator

from sqlalchemy.orm import Session
from sqlmodel import SQLModel, create_engine, Session as SQLSession

from app.config import CONNECT_ARGS, DB_URL

logger = logging.getLogger("uvicorn.error")

# Initialize database engine
engine = create_engine(DB_URL, connect_args=CONNECT_ARGS)


def create_db_and_tables():
    """Create all database tables on startup."""
    SQLModel.metadata.create_all(engine)
    logger.info("Database tables created/verified.")


def get_session() -> Generator[SQLSession, None, None]:
    """Dependency to provide database session to routes."""
    with SQLSession(engine) as session:
        yield session



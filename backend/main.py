"""FastAPI application initialization and configuration."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes as health_routes
from app.api.routes import (
    announcements,
    auth,
    calendar,
    people,
    resources,
    schedule,
)
from app.config import CORS_ORIGINS, logger
from app.database import create_db_and_tables


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    create_db_and_tables()
    logger.info("-> Start up server.")
    yield
    logger.info("-> Shutting down server.")


# Initialize FastAPI application
app = FastAPI(
    title="Schooler API",
    description="School management and scheduling API",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(health_routes.router)
app.include_router(auth.router)
app.include_router(announcements.router)
app.include_router(calendar.router)
app.include_router(schedule.router)
app.include_router(people.router)
app.include_router(resources.router)

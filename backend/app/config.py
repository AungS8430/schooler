"""Application configuration and environment variables."""

import logging
from os import getenv

from dotenv import load_dotenv

logger = logging.getLogger("uvicorn.error")
logger.setLevel(logging.INFO)

# Load env if not in docker
ISDOCKER = getenv("ISDOCKER", "False")
if ISDOCKER == "False":
    logger.info("-> Currently running outside docker container.")
    logger.info("-> Loading env file.")
    load_dotenv("./.env")


# Get required env vars
def get_env_var(name: str, required: bool = True) -> str:
    """Get environment variable with validation."""
    value = getenv(name)
    if value is None and required:
        raise Exception(f"{name} environment variable not found.")
    return value or ""


# JWT Configuration
JWT_SECRET = get_env_var("SECRET", required=True)

# Database Configuration
DB_USER = get_env_var("DB_USER", required=True)
DB_PASS = get_env_var("DB_PASS", required=True)
DB_HOST = get_env_var("DB_HOST", required=True)
DB_PORT = get_env_var("DB_PORT", required=True)
DB_NAME = get_env_var("DB_NAME", required=True)

DB_URL = f"postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Optional configs
INTERNAL_API_SECRET = getenv("INTERNAL_API_SECRET")
if INTERNAL_API_SECRET is None:
    logger.warning("INTERNAL_API_SECRET Not found.")

# CORS Configuration
CORS_ORIGINS = getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Database connection args
CONNECT_ARGS = {}
if DB_URL.startswith("sqlite"):
    CONNECT_ARGS = {"check_same_thread": False}

# Encryption
ENCRYPTION_KEY = getenv("ENCRYPTION_KEY")

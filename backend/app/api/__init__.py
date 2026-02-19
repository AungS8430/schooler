"""API route dependencies for JWT and session injection."""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Header, status
from fastapi_nextauth_jwt import NextAuthJWT

from app.config import JWT_SECRET
from app.database import get_session
from sqlmodel import Session

# Initialize JWT handler
JWT = NextAuthJWT(secret=JWT_SECRET)

# Type aliases
JWTDep = Annotated[Optional[dict], Depends(JWT)]
SessionDep = Annotated[Session, Depends(get_session)]


def ensure_jwt_and_get_sub(jwt: Optional[dict]) -> str:
    """
    Helper to validate JWT object and extract the 'sub' claim.
    Raises HTTPException if JWT is invalid or missing sub claim.
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


def verify_internal_secret(x_internal_secret: Optional[str], expected_secret: Optional[str]) -> None:
    """Verify internal API secret for protected endpoints."""
    if not expected_secret or x_internal_secret != expected_secret:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


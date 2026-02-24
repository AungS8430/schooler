"""Authentication and user management routes."""

from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlmodel import Session

from app.api import JWTDep, SessionDep, ensure_jwt_and_get_sub, verify_internal_secret
from app.config import INTERNAL_API_SECRET
from app.database import get_session
from app.domain.user.auth import (
    OAuthAccountConflict,
    get_user_perms,
    upsert_user_from_oauth,
)
from app.schemas.types import OAuthUpsertIn

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/oauth/upsert", status_code=status.HTTP_200_OK)
def oauth_upsert(
    payload: OAuthUpsertIn,
    x_internal_secret: Optional[str] = Header(None),
    session: Session = Depends(get_session),
):
    """
    Upsert a User and OAuthAccount (called by NextAuth signIn callback).
    Protected by X-Internal-Secret header. Returns 409 Conflict if the provider account
    is already linked to a different user.
    """
    verify_internal_secret(x_internal_secret, INTERNAL_API_SECRET)

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


@router.get("/permissions")
def read_permissions(
    jwt: JWTDep,
    session: SessionDep,
):
    """Get user permissions based on their role and attributes."""
    user_id = ensure_jwt_and_get_sub(jwt)
    permissions = get_user_perms(session, user_id)
    return {"permissions": permissions}

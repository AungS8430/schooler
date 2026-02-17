import uuid
from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from models import OAuthAccount, User
from user.security import encrypt_token


class OAuthAccountConflict(Exception):
    pass


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    result = session.exec(select(User).where(User.email == email))
    return result.first()


def upsert_user_from_oauth(
    session: Session,
    provider: str,
    provider_account_id: str,
    email: str,
    name: Optional[str] = None,
    image: Optional[str] = None,
    tokens: Optional[dict] = None,
) -> User:
    existing_acc = session.exec(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == provider_account_id,
        )
    ).first()

    if existing_acc:
        user = session.get(User, existing_acc.user_id) if existing_acc.user_id else None
        if user is None:
            raise OAuthAccountConflict(
                "OAuth account linked to non-existent user, data integrity issue"
            )
        if tokens:
            existing_acc.access_token_enc = encrypt_token(tokens.get("access_token"))
            existing_acc.refresh_token_enc = encrypt_token(tokens.get("refresh_token"))
            existing_acc.expires_at = tokens.get("expires_at")
            existing_acc.scope = tokens.get("scope")
            session.add(existing_acc)
            session.commit()
            session.refresh(existing_acc)
        return user

    email_norm = (email or "").strip().lower()
    user = session.exec(select(User).where(User.email == email_norm)).first()

    if not user:
        user = User(id=str(uuid.uuid4()), email=email_norm, name=name, image=image)
        session.add(user)
        session.flush()
    else:
        user.name = name or user.name
        user.image = image or user.image
        session.add(user)

    acc_after = session.exec(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == provider_account_id,
        )
    ).first()

    if acc_after:
        if acc_after.user_id != user.id:
            raise OAuthAccountConflict(
                "OAuth account already linked to a different user"
            )
        if tokens:
            acc_after.access_token_enc = encrypt_token(tokens.get("access_token"))
            acc_after.refresh_token_enc = encrypt_token(tokens.get("refresh_token"))
            acc_after.expires_at = tokens.get("expires_at")
            acc_after.scope = tokens.get("scope")
            session.add(acc_after)
            session.commit()
        return user

    account = OAuthAccount(
        id=str(uuid.uuid4()),
        provider=provider,
        provider_account_id=provider_account_id,
        user_id=user.id,
        access_token_enc=encrypt_token(tokens.get("access_token")) if tokens else None,
        refresh_token_enc=encrypt_token(tokens.get("refresh_token"))
        if tokens
        else None,
        expires_at=tokens.get("expires_at") if tokens else None,
        scope=tokens.get("scope") if tokens else None,
    )
    session.add(account)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        acc_raced = session.exec(
            select(OAuthAccount).where(
                OAuthAccount.provider == provider,
                OAuthAccount.provider_account_id == provider_account_id,
            )
        ).first()
        if not acc_raced:
            # Unexpected: re-raise
            raise
        if acc_raced.user_id != user.id:
            raise OAuthAccountConflict(
                "OAuth account already linked to a different user"
            )
        if tokens:
            acc_raced.access_token_enc = encrypt_token(tokens.get("access_token"))
            acc_raced.refresh_token_enc = encrypt_token(tokens.get("refresh_token"))
            acc_raced.expires_at = tokens.get("expires_at")
            acc_raced.scope = tokens.get("scope")
            session.add(acc_raced)
            session.commit()
        return user

    session.refresh(user)
    return user


def get_user_perms(session: Session, user_id: str) -> Optional[dict]:
    user = session.get(User, user_id)
    if user:
        return {
            "role": getattr(user, "role", None),
            "class": getattr(user, "class_", None),
            "department": getattr(user, "department", None),
        }
    return None

from sqlmodel import select, Session
from typing import Optional
from models import User, OAuthAccount
from user.security import encrypt_token
import uuid

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
    # Find by provider account
    q = session.exec(
        select(User).join(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == provider_account_id,
            OAuthAccount.user_id == provider_account_id
            )
    )
    user = q.first()

    if not user:
        q2 = session.exec(select(User).where(User.email == email))
        user = q2.first()

    if not user:
        user = User(
            id=provider_account_id,
            email=email,
            name=name,
            image=image
        )
        session.add(user)
        session.flush()
    else:
        user.name = name or user.name
        user.image = image or user.image

    q_acc = session.exec(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_account_id == provider_account_id,
            OAuthAccount.user_id == user.id,
        )
    )
    account = q_acc.first()
    if not account:
        account = OAuthAccount(
            id=str(uuid.uuid4()),
            provider=provider,
            provider_account_id=provider_account_id,
            user_id=user.id,
        )
        session.add(account)

    if tokens:
        account.access_token_enc = encrypt_token(tokens.get("access_token"))
        account.refresh_token_enc = encrypt_token(tokens.get("refresh_token"))
        account.expires_at = tokens.get("expires_at")
        account.scope = tokens.get("scope")

    session.commit()
    session.refresh(user)
    return user
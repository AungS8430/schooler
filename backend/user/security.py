import os
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken

ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

fernet = Fernet(ENCRYPTION_KEY.encode()) if ENCRYPTION_KEY else None


def encrypt_token(plain: Optional[str]) -> Optional[str]:
    if not plain or not fernet:
        return None
    return fernet.encrypt(plain.encode()).decode()


def decrypt_token(enc: Optional[str]) -> Optional[str]:
    if not enc or not fernet:
        return None
    try:
        return fernet.decrypt(enc.encode()).decode()
    except InvalidToken:
        return None
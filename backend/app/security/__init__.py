"""Token encryption and decryption utilities."""
from typing import Optional

from app.config import ENCRYPTION_KEY

# Initialize Fernet cipher
try:
    from cryptography.fernet import Fernet, InvalidToken

    fernet = Fernet(ENCRYPTION_KEY.encode()) if ENCRYPTION_KEY else None
except Exception:
    fernet = None


def encrypt_token(plain: Optional[str]) -> Optional[str]:
    """Encrypt a plain text token."""
    if not plain or not fernet:
        return None
    return fernet.encrypt(plain.encode()).decode()


def decrypt_token(enc: Optional[str]) -> Optional[str]:
    """Decrypt an encrypted token."""
    if not enc or not fernet:
        return None
    try:
        return fernet.decrypt(enc.encode()).decode()
    except InvalidToken:
        return None


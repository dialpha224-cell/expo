"""
AfroCrown - Helper Utilities
============================
Common helper functions used across the application
"""

import secrets
import string
import qrcode
from io import BytesIO
import base64
from passlib.context import CryptContext
from datetime import datetime, timezone

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def generate_temp_password(length: int = 10) -> str:
    """Generate a temporary password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_setup_token() -> str:
    """Generate a secure token for password setup"""
    return secrets.token_urlsafe(32)


def generate_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix"""
    unique_part = secrets.token_hex(6)
    if prefix:
        return f"{prefix}_{unique_part}"
    return unique_part


def generate_qr_code(data: str) -> str:
    """Generate a QR code as a base64 data URL"""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_base64}"


def get_current_timestamp() -> datetime:
    """Get current UTC timestamp"""
    return datetime.now(timezone.utc)


def format_date(date_obj: datetime) -> str:
    """Format datetime to ISO string"""
    return date_obj.isoformat()

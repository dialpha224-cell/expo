# AfroCrown Backend Utilities
import secrets
import string
from passlib.context import CryptContext
import qrcode
from io import BytesIO
import base64

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

def generate_qr_code(data: str) -> str:
    """Generate a QR code and return as base64 string"""
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode()

def generate_unique_id(prefix: str = "") -> str:
    """Generate a unique ID with optional prefix"""
    import uuid
    unique_part = uuid.uuid4().hex[:12]
    return f"{prefix}_{unique_part}" if prefix else unique_part

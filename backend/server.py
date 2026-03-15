from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Query, UploadFile, File
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import time
import base64
import httpx
import qrcode
from io import BytesIO
import secrets
import string
from passlib.context import CryptContext
import asyncio
import resend
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def generate_temp_password(length: int = 10) -> str:
    """Generate a temporary password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def generate_setup_token() -> str:
    """Generate a secure token for password setup"""
    return secrets.token_urlsafe(32)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend config
resend.api_key = os.getenv("RESEND_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "onboarding@resend.dev")

# Cloudinary config
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

# Create the main app
app = FastAPI(title="AfroCrown API")

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Start the reminder scheduler on app startup"""
    scheduler.add_job(
        check_appointment_reminders,
        IntervalTrigger(minutes=5),
        id='appointment_reminders',
        replace_existing=True
    )
    scheduler.start()
    logger.info("Appointment reminder scheduler started")

@app.on_event("shutdown")
async def shutdown_event():
    """Stop the scheduler on app shutdown"""
    scheduler.shutdown()
    logger.info("Appointment reminder scheduler stopped")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# =============================================================================
# EMAIL FUNCTIONS
# =============================================================================

async def send_welcome_email(email: str, name: str, setup_token: str, app_url: str):
    """Send welcome email with password setup link"""
    setup_link = f"{app_url}/setup-password?token={setup_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #818cf8; margin: 0;">✂️ AfroCrown</h1>
            </div>
            
            <h2 style="color: #ffffff; margin-bottom: 20px;">Bienvenue {name} !</h2>
            
            <p style="color: #94a3b8; line-height: 1.6;">
                Votre compte AfroCrown a été créé. Pour commencer à utiliser la plateforme, 
                veuillez créer votre mot de passe en cliquant sur le bouton ci-dessous.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{setup_link}" 
                   style="background-color: #6366f1; color: white; padding: 14px 28px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold;
                          display: inline-block;">
                    Créer mon mot de passe
                </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                Ce lien est valide pendant 24 heures. Si vous n'avez pas demandé ce compte, 
                vous pouvez ignorer cet email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #334155; margin: 30px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center;">
                © 2024 AfroCrown - La Référence de la Coiffure Afro
            </p>
        </div>
    </body>
    </html>
    """
    
    params = {
        "from": SENDER_EMAIL,
        "to": [email],
        "subject": "Bienvenue sur AfroCrown - Créez votre mot de passe",
        "html": html_content
    }
    
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Welcome email sent to {email}")
        return result
    except Exception as e:
        logger.error(f"Failed to send welcome email to {email}: {str(e)}")
        raise

# =============================================================================
# PUSH NOTIFICATION SERVICE
# =============================================================================

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

async def send_push_notification(expo_push_tokens: List[str], title: str, body: str, data: dict = None) -> bool:
    """Send push notification via Expo Push Service"""
    if not expo_push_tokens:
        return False
    
    payload = {
        "to": expo_push_tokens,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {},
        "badge": 1,
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                EXPO_PUSH_URL,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30.0,
            )
            
            if response.status_code == 200:
                logger.info(f"Push notification sent to {len(expo_push_tokens)} devices")
                return True
            else:
                logger.error(f"Failed to send push notification: {response.text}")
                return False
    except Exception as e:
        logger.error(f"Error sending push notification: {str(e)}")
        return False

async def send_appointment_reminder(appointment_id: str, hours_before: int):
    """Send appointment reminder notification"""
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        return False
    
    # Get user's push token
    user = await db.users.find_one({"user_id": appointment.get("user_id")}, {"_id": 0})
    if not user or not user.get("expo_push_token"):
        # Try sending email instead
        if user and user.get("email"):
            await send_reminder_email(user["email"], user.get("name", "Client"), appointment, hours_before)
        return False
    
    # Get salon and haircut info
    salon = await db.salons.find_one({"salon_id": appointment.get("salon_id")}, {"_id": 0})
    haircut = await db.haircuts.find_one({"haircut_id": appointment.get("haircut_id")}, {"_id": 0})
    
    salon_name = salon.get("name") if salon else "AfroCrown"
    haircut_name = haircut.get("name") if haircut else "votre coupe"
    
    if hours_before == 24:
        title = "Rappel RDV demain"
        body = f"N'oubliez pas votre RDV demain a {appointment.get('time_slot')} chez {salon_name} pour {haircut_name}"
    else:
        title = "Rappel RDV dans 1h"
        body = f"Votre RDV est dans 1 heure chez {salon_name}. Preparez-vous!"
    
    return await send_push_notification(
        [user["expo_push_token"]],
        title,
        body,
        {"appointment_id": appointment_id, "type": "appointment_reminder"}
    )

async def send_reminder_email(email: str, name: str, appointment: dict, hours_before: int):
    """Send reminder email when push notification is not available"""
    salon = await db.salons.find_one({"salon_id": appointment.get("salon_id")}, {"_id": 0})
    salon_name = salon.get("name") if salon else "AfroCrown"
    
    if hours_before == 24:
        subject = "Rappel: Votre RDV demain chez AfroCrown"
        time_text = "demain"
    else:
        subject = "Rappel: Votre RDV dans 1 heure"
        time_text = "dans 1 heure"
    
    html_content = f"""
    <div style="font-family: Arial; background-color: #0f172a; color: #e2e8f0; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; padding: 40px;">
            <h1 style="color: #818cf8;">✂️ Rappel de RDV</h1>
            <p>Bonjour {name},</p>
            <p>Votre rendez-vous est prevu <strong>{time_text}</strong> chez <strong>{salon_name}</strong>.</p>
            <p><strong>Date:</strong> {appointment.get('date')}<br>
            <strong>Heure:</strong> {appointment.get('time_slot')}</p>
            <p>A bientot!</p>
        </div>
    </div>
    """
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [email],
            "subject": subject,
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Reminder email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send reminder email: {e}")

async def check_appointment_reminders():
    """Check for appointments that need reminders - runs every 5 minutes"""
    now = datetime.now(timezone.utc)
    
    # Get all pending/confirmed appointments
    appointments = await db.appointments.find({
        "status": {"$in": ["pending", "confirmed"]},
        "reminder_24h_sent": {"$ne": True}
    }, {"_id": 0}).to_list(500)
    
    for apt in appointments:
        try:
            # Parse appointment date and time
            apt_date_str = apt.get("date")
            apt_time_str = apt.get("time_slot", "10:00")
            
            if not apt_date_str:
                continue
                
            apt_datetime = datetime.strptime(f"{apt_date_str} {apt_time_str}", "%Y-%m-%d %H:%M")
            apt_datetime = apt_datetime.replace(tzinfo=timezone.utc)
            
            time_until = apt_datetime - now
            hours_until = time_until.total_seconds() / 3600
            
            # 24h reminder (between 23 and 25 hours before)
            if 23 <= hours_until <= 25 and not apt.get("reminder_24h_sent"):
                await send_appointment_reminder(apt["appointment_id"], 24)
                await db.appointments.update_one(
                    {"appointment_id": apt["appointment_id"]},
                    {"$set": {"reminder_24h_sent": True}}
                )
                logger.info(f"24h reminder sent for appointment {apt['appointment_id']}")
            
            # 1h reminder (between 0.5 and 1.5 hours before)
            elif 0.5 <= hours_until <= 1.5 and not apt.get("reminder_1h_sent"):
                await send_appointment_reminder(apt["appointment_id"], 1)
                await db.appointments.update_one(
                    {"appointment_id": apt["appointment_id"]},
                    {"$set": {"reminder_1h_sent": True}}
                )
                logger.info(f"1h reminder sent for appointment {apt['appointment_id']}")
                
        except Exception as e:
            logger.error(f"Error processing reminder for {apt.get('appointment_id')}: {e}")

# Initialize scheduler
scheduler = AsyncIOScheduler()

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class UserBase(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: str = "client"  # client, salon_owner, founder
    salon_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreateByAdmin(BaseModel):
    name: str
    email: str
    role: str = "client"  # client, salon_owner
    salon_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class SalonCreate(BaseModel):
    name: str
    address: str
    phone: str
    description: Optional[str] = None
    opening_hours: Optional[Dict[str, str]] = None

class SalonResponse(BaseModel):
    salon_id: str
    name: str
    address: str
    phone: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    opening_hours: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    is_active: bool = True
    created_at: datetime

class BarberCreate(BaseModel):
    name: str
    specialties: List[str] = []
    bio: Optional[str] = None
    image_url: Optional[str] = None

class BarberResponse(BaseModel):
    barber_id: str
    salon_id: str
    name: str
    specialties: List[str] = []
    specialty: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    photo_url: Optional[str] = None
    experience_years: Optional[int] = None
    rating: float = 0.0
    total_reviews: int = 0
    is_active: bool = True
    created_at: datetime

class HaircutCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int = 30
    category: str = "classic"
    image_url: Optional[str] = None

class HaircutResponse(BaseModel):
    haircut_id: str
    salon_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int
    category: str = "classic"
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime

class AppointmentCreate(BaseModel):
    salon_id: str
    barber_id: str
    haircut_id: str
    appointment_date: str
    appointment_time: str
    client_notes: Optional[str] = None
    client_photos: List[str] = []

class AppointmentResponse(BaseModel):
    appointment_id: str
    salon_id: str
    barber_id: str
    haircut_id: str
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    appointment_date: str
    appointment_time: str
    status: str = "pending"  # pending, confirmed, completed, cancelled
    payment_method: str = "cash"  # cash, stripe
    payment_status: str = "pending"
    total_price: float = 0.0
    client_notes: Optional[str] = None
    client_photos: List[str] = []
    created_at: datetime

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str = "hair_care"
    stock: int = 0
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    product_id: str
    salon_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int
    image_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime

class TrimConnectEntryCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    video_url: Optional[str] = None

class TrimConnectEntryResponse(BaseModel):
    entry_id: str
    barber_id: str
    barber_name: str
    salon_id: Optional[str] = None
    salon_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    image_url: str
    video_url: Optional[str] = None
    votes: int = 0
    status: str = "pending"  # pending, approved, finalist, winner
    contest_edition: str
    created_at: datetime

class VoteCreate(BaseModel):
    entry_id: str

class CheckoutRequest(BaseModel):
    appointment_id: Optional[str] = None
    product_ids: Optional[List[str]] = None
    origin_url: str

# =============================================================================
# AUTH HELPERS
# =============================================================================

async def get_current_user(request: Request) -> Optional[UserBase]:
    """Extract user from session token in cookie or Authorization header"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session:
        return None
    
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if user:
        if isinstance(user.get("created_at"), str):
            user["created_at"] = datetime.fromisoformat(user["created_at"])
        return UserBase(**user)
    return None

async def require_auth(request: Request) -> UserBase:
    """Require authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

async def require_founder(request: Request) -> UserBase:
    """Require founder role"""
    user = await require_auth(request)
    if user.role != "founder":
        raise HTTPException(status_code=403, detail="Founder access required")
    return user

async def require_salon_owner(request: Request) -> UserBase:
    """Require salon owner role"""
    user = await require_auth(request)
    if user.role not in ["salon_owner", "founder"]:
        raise HTTPException(status_code=403, detail="Salon owner access required")
    return user

# =============================================================================
# AUTH ROUTES
# =============================================================================

@api_router.post("/auth/session")
async def create_session(request: Request):
    """Exchange session_id from Emergent Auth for session token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as client_http:
        response = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        auth_data = response.json()
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
        role = existing_user.get("role", "client")
        salon_id = existing_user.get("salon_id")
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        role = "client"
        salon_id = None
        new_user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role": role,
            "salon_id": salon_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    # Create session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one(session_doc)
    
    response = JSONResponse(content={
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "role": role,
        "salon_id": salon_id
    })
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture,
        "role": user.role,
        "salon_id": user.salon_id
    }

@api_router.post("/auth/logout")
async def logout(request: Request):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response

@api_router.post("/auth/login")
async def login_with_password(credentials: UserLogin):
    """Login with email and password"""
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Check if user has a password set
    if not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Ce compte utilise la connexion Google. Utilisez le bouton 'Connexion avec Google'.")
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Create session
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.insert_one(session_doc)
    
    response = JSONResponse(content={
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "picture": user.get("picture"),
        "role": user["role"],
        "salon_id": user.get("salon_id"),
        "must_change_password": user.get("must_change_password", False)
    })
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.post("/auth/change-password")
async def change_password(password_data: PasswordChange, user: UserBase = Depends(require_auth)):
    """Change user password"""
    db_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    
    # If user has a password, verify current password
    if db_user.get("password_hash"):
        if not verify_password(password_data.current_password, db_user["password_hash"]):
            raise HTTPException(status_code=400, detail="Mot de passe actuel incorrect")
    
    # Hash and save new password
    new_hash = hash_password(password_data.new_password)
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"password_hash": new_hash, "must_change_password": False}}
    )
    
    return {"message": "Mot de passe modifie avec succes"}

# =============================================================================
# PUSH NOTIFICATIONS ENDPOINTS
# =============================================================================

class PushTokenRegister(BaseModel):
    expo_push_token: str

@api_router.post("/notifications/register-token")
async def register_push_token(data: PushTokenRegister, user: UserBase = Depends(require_auth)):
    """Register Expo push token for user"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"expo_push_token": data.expo_push_token}}
    )
    return {"message": "Token enregistre avec succes"}

@api_router.delete("/notifications/unregister-token")
async def unregister_push_token(user: UserBase = Depends(require_auth)):
    """Unregister push token (on logout)"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$unset": {"expo_push_token": ""}}
    )
    return {"message": "Token supprime"}

@api_router.post("/notifications/test")
async def test_push_notification(user: UserBase = Depends(require_auth)):
    """Send test push notification to current user"""
    db_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    
    if not db_user.get("expo_push_token"):
        raise HTTPException(status_code=400, detail="Aucun token push enregistre")
    
    success = await send_push_notification(
        [db_user["expo_push_token"]],
        "Test Notification",
        "Ceci est un test de notification AfroCrown!",
        {"type": "test"}
    )
    
    if success:
        return {"message": "Notification envoyee"}
    else:
        raise HTTPException(status_code=500, detail="Echec de l'envoi")

# =============================================================================
# PASSWORD SETUP (for email link)
# =============================================================================

class PasswordSetup(BaseModel):
    token: str
    password: str

@api_router.get("/auth/verify-setup-token/{token}")
async def verify_setup_token(token: str):
    """Verify if a setup token is valid"""
    user = await db.users.find_one({"setup_token": token}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=400, detail="Lien invalide ou expire")
    
    # Check if token is expired
    expires_at = user.get("setup_token_expires")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Ce lien a expire. Contactez l'administrateur.")
    
    return {
        "valid": True,
        "name": user.get("name"),
        "email": user.get("email")
    }

@api_router.post("/auth/setup-password")
async def setup_password(data: PasswordSetup):
    """Set password for new user via email link"""
    user = await db.users.find_one({"setup_token": data.token}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=400, detail="Lien invalide ou expire")
    
    # Check if token is expired
    expires_at = user.get("setup_token_expires")
    if expires_at:
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Ce lien a expire. Contactez l'administrateur.")
    
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caracteres")
    
    # Hash and save password
    password_hash = hash_password(data.password)
    await db.users.update_one(
        {"setup_token": data.token},
        {
            "$set": {
                "password_hash": password_hash,
                "is_active": True,
                "setup_token": None,
                "setup_token_expires": None
            }
        }
    )
    
    # Create session for auto-login
    session_token = secrets.token_urlsafe(32)
    session_expires = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": session_expires.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.insert_one(session_doc)
    
    response = JSONResponse(content={
        "message": "Mot de passe cree avec succes",
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "salon_id": user.get("salon_id")
    })
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

# =============================================================================
# FOUNDER ROUTES - User Management
# =============================================================================

@api_router.put("/founder/users/{user_id}/role")
async def update_user_role(user_id: str, request: Request, founder: UserBase = Depends(require_founder)):
    """Update user role (founder only)"""
    body = await request.json()
    new_role = body.get("role")
    salon_id = body.get("salon_id")
    
    if new_role not in ["client", "salon_owner", "founder"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    update_data = {"role": new_role}
    if salon_id:
        update_data["salon_id"] = salon_id
    
    result = await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "Role updated"}

@api_router.get("/founder/users")
async def list_all_users(founder: UserBase = Depends(require_founder)):
    """List all users (founder only)"""
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

@api_router.post("/founder/users")
async def create_user_by_admin(user_data: UserCreateByAdmin, request: Request, founder: UserBase = Depends(require_founder)):
    """Create a new user (founder only) - sends welcome email with setup link"""
    # Check if email already exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Un utilisateur avec cet email existe deja")
    
    # Generate setup token (no password yet - user will create it)
    setup_token = generate_setup_token()
    token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
    
    # Create user without password
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    new_user = {
        "user_id": user_id,
        "email": user_data.email.lower(),
        "name": user_data.name,
        "picture": None,
        "role": user_data.role,
        "salon_id": user_data.salon_id,
        "password_hash": None,  # No password yet
        "setup_token": setup_token,
        "setup_token_expires": token_expires.isoformat(),
        "is_active": False,  # Not active until password is set
        "created_by": founder.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(new_user)
    
    # Get app URL from request
    origin = request.headers.get("origin", "https://salon-dashboard-48.preview.emergentagent.com")
    
    # Send welcome email
    email_sent = False
    try:
        await send_welcome_email(user_data.email.lower(), user_data.name, setup_token, origin)
        email_sent = True
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
    
    return {
        "user_id": user_id,
        "name": user_data.name,
        "email": user_data.email.lower(),
        "role": user_data.role,
        "email_sent": email_sent,
        "message": "Utilisateur cree. Un email a ete envoye pour creer le mot de passe." if email_sent else "Utilisateur cree mais l'email n'a pas pu etre envoye."
    }

@api_router.delete("/founder/users/{user_id}")
async def delete_user(user_id: str, founder: UserBase = Depends(require_founder)):
    """Delete a user (founder only)"""
    # Don't allow deleting yourself
    if user_id == founder.user_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    
    result = await db.users.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouve")
    
    # Also delete user sessions
    await db.user_sessions.delete_many({"user_id": user_id})
    
    return {"message": "Utilisateur supprime"}

@api_router.get("/founder/stats")
async def get_global_stats(founder: UserBase = Depends(require_founder)):
    """Get global platform statistics"""
    total_salons = await db.salons.count_documents({"is_active": True})
    total_barbers = await db.barbers.count_documents({"is_active": True})
    total_clients = await db.users.count_documents({"role": "client"})
    total_appointments = await db.appointments.count_documents({})
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    
    # Revenue calculation
    completed_appointments = await db.appointments.find(
        {"payment_status": "paid"},
        {"_id": 0, "total_price": 1}
    ).to_list(10000)
    total_revenue = sum(a.get("total_price", 0) for a in completed_appointments)
    
    # TrimConnect stats
    total_entries = await db.trimconnect_entries.count_documents({})
    total_votes = await db.votes.count_documents({})
    
    return {
        "total_salons": total_salons,
        "total_barbers": total_barbers,
        "total_clients": total_clients,
        "total_appointments": total_appointments,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "trimconnect": {
            "total_entries": total_entries,
            "total_votes": total_votes
        }
    }

@api_router.get("/founder/appointments")
async def get_all_appointments(
    founder: UserBase = Depends(require_founder),
    status: Optional[str] = None,
    salon_id: Optional[str] = None,
    limit: int = 100
):
    """Get all appointments (founder only)"""
    query = {}
    if status:
        query["status"] = status
    if salon_id:
        query["salon_id"] = salon_id
    
    appointments = await db.appointments.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with salon, barber, client, and haircut info
    enriched = []
    for apt in appointments:
        # Get salon info
        salon = await db.salons.find_one({"salon_id": apt.get("salon_id")}, {"_id": 0, "name": 1})
        # Get barber info
        barber = await db.barbers.find_one({"barber_id": apt.get("barber_id")}, {"_id": 0, "name": 1})
        # Get client info
        client = await db.users.find_one({"user_id": apt.get("user_id")}, {"_id": 0, "name": 1, "email": 1})
        # Get haircut info
        haircut = await db.haircuts.find_one({"haircut_id": apt.get("haircut_id")}, {"_id": 0, "name": 1, "price": 1})
        
        enriched.append({
            **apt,
            "salon_name": salon.get("name") if salon else "N/A",
            "barber_name": barber.get("name") if barber else "N/A",
            "client_name": client.get("name") if client else "N/A",
            "client_email": client.get("email") if client else "N/A",
            "haircut_name": haircut.get("name") if haircut else "N/A",
            "haircut_price": haircut.get("price") if haircut else 0
        })
    
    return enriched

@api_router.put("/founder/appointments/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    request: Request,
    founder: UserBase = Depends(require_founder)
):
    """Update appointment status (founder only)"""
    body = await request.json()
    new_status = body.get("status")
    
    if new_status not in ["pending", "confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Statut invalide")
    
    result = await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": new_status}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reservation non trouvee")
    
    return {"message": "Statut mis a jour"}

# =============================================================================
# SALON ROUTES
# =============================================================================

@api_router.post("/salons", response_model=SalonResponse)
async def create_salon(salon: SalonCreate, user: UserBase = Depends(require_founder)):
    """Create a new salon (founder only)"""
    salon_id = f"salon_{uuid.uuid4().hex[:12]}"
    salon_doc = {
        "salon_id": salon_id,
        "name": salon.name,
        "address": salon.address,
        "phone": salon.phone,
        "description": salon.description,
        "owner_id": None,
        "opening_hours": salon.opening_hours or {},
        "image_url": None,
        "rating": 0.0,
        "total_reviews": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.salons.insert_one(salon_doc)
    salon_doc["created_at"] = datetime.fromisoformat(salon_doc["created_at"])
    return SalonResponse(**{k: v for k, v in salon_doc.items() if k != "_id"})

@api_router.get("/salons", response_model=List[SalonResponse])
async def list_salons():
    """List all active salons"""
    salons = await db.salons.find({"is_active": True}, {"_id": 0}).to_list(1000)
    for s in salons:
        if isinstance(s.get("created_at"), str):
            s["created_at"] = datetime.fromisoformat(s["created_at"])
    return [SalonResponse(**s) for s in salons]

@api_router.get("/salons/{salon_id}", response_model=SalonResponse)
async def get_salon(salon_id: str):
    """Get salon details"""
    salon = await db.salons.find_one({"salon_id": salon_id}, {"_id": 0})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    if isinstance(salon.get("created_at"), str):
        salon["created_at"] = datetime.fromisoformat(salon["created_at"])
    return SalonResponse(**salon)

@api_router.put("/salons/{salon_id}")
async def update_salon(salon_id: str, request: Request, user: UserBase = Depends(require_salon_owner)):
    """Update salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    body = await request.json()
    allowed_fields = ["name", "address", "phone", "description", "opening_hours", "image_url"]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    result = await db.salons.update_one({"salon_id": salon_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Salon not found")
    return {"message": "Salon updated"}

@api_router.put("/salons/{salon_id}/owner")
async def assign_salon_owner(salon_id: str, request: Request, founder: UserBase = Depends(require_founder)):
    """Assign owner to salon (founder only)"""
    body = await request.json()
    owner_id = body.get("owner_id")
    
    # Update salon
    await db.salons.update_one({"salon_id": salon_id}, {"$set": {"owner_id": owner_id}})
    
    # Update user role
    await db.users.update_one(
        {"user_id": owner_id},
        {"$set": {"role": "salon_owner", "salon_id": salon_id}}
    )
    
    return {"message": "Owner assigned"}

# =============================================================================
# BARBER ROUTES
# =============================================================================

@api_router.post("/salons/{salon_id}/barbers", response_model=BarberResponse)
async def create_barber(salon_id: str, barber: BarberCreate, user: UserBase = Depends(require_salon_owner)):
    """Create barber for salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    barber_id = f"barber_{uuid.uuid4().hex[:12]}"
    barber_doc = {
        "barber_id": barber_id,
        "salon_id": salon_id,
        "name": barber.name,
        "specialties": barber.specialties,
        "bio": barber.bio,
        "image_url": barber.image_url,
        "rating": 0.0,
        "total_reviews": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.barbers.insert_one(barber_doc)
    barber_doc["created_at"] = datetime.fromisoformat(barber_doc["created_at"])
    return BarberResponse(**{k: v for k, v in barber_doc.items() if k != "_id"})

@api_router.get("/salons/{salon_id}/barbers", response_model=List[BarberResponse])
async def list_barbers(salon_id: str):
    """List barbers for salon"""
    barbers = await db.barbers.find({"salon_id": salon_id, "is_active": True}, {"_id": 0}).to_list(100)
    for b in barbers:
        if isinstance(b.get("created_at"), str):
            b["created_at"] = datetime.fromisoformat(b["created_at"])
    return [BarberResponse(**b) for b in barbers]

@api_router.put("/barbers/{barber_id}")
async def update_barber(barber_id: str, request: Request, user: UserBase = Depends(require_salon_owner)):
    """Update barber"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    if user.role != "founder" and user.salon_id != barber["salon_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    body = await request.json()
    allowed_fields = ["name", "specialties", "bio", "image_url", "is_active"]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    await db.barbers.update_one({"barber_id": barber_id}, {"$set": update_data})
    return {"message": "Barber updated"}

# =============================================================================
# HAIRCUT ROUTES
# =============================================================================

@api_router.post("/salons/{salon_id}/haircuts", response_model=HaircutResponse)
async def create_haircut(salon_id: str, haircut: HaircutCreate, user: UserBase = Depends(require_salon_owner)):
    """Create haircut for salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    haircut_id = f"haircut_{uuid.uuid4().hex[:12]}"
    haircut_doc = {
        "haircut_id": haircut_id,
        "salon_id": salon_id,
        "name": haircut.name,
        "description": haircut.description,
        "price": haircut.price,
        "duration_minutes": haircut.duration_minutes,
        "category": haircut.category,
        "image_url": haircut.image_url,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.haircuts.insert_one(haircut_doc)
    haircut_doc["created_at"] = datetime.fromisoformat(haircut_doc["created_at"])
    return HaircutResponse(**{k: v for k, v in haircut_doc.items() if k != "_id"})

@api_router.get("/salons/{salon_id}/haircuts", response_model=List[HaircutResponse])
async def list_haircuts(salon_id: str):
    """List haircuts for salon (includes global haircuts)"""
    # Get salon-specific haircuts OR global haircuts (no salon_id)
    haircuts = await db.haircuts.find({
        "$or": [
            {"salon_id": salon_id, "is_active": True},
            {"salon_id": {"$exists": False}, "is_active": True},
            {"salon_id": None, "is_active": True}
        ]
    }, {"_id": 0}).to_list(100)
    for h in haircuts:
        if isinstance(h.get("created_at"), str):
            h["created_at"] = datetime.fromisoformat(h["created_at"])
    return [HaircutResponse(**h) for h in haircuts]

@api_router.get("/haircuts")
async def list_all_haircuts():
    """List all haircuts across all salons"""
    haircuts = await db.haircuts.find({"is_active": True}, {"_id": 0}).to_list(1000)
    for h in haircuts:
        if isinstance(h.get("created_at"), str):
            h["created_at"] = datetime.fromisoformat(h["created_at"])
    return haircuts

# =============================================================================
# APPOINTMENT ROUTES
# =============================================================================

@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, request: Request):
    """Create appointment (can be guest or authenticated)"""
    user = await get_current_user(request)
    
    # Get haircut price
    haircut = await db.haircuts.find_one({"haircut_id": appointment.haircut_id}, {"_id": 0})
    if not haircut:
        raise HTTPException(status_code=404, detail="Haircut not found")
    
    appointment_id = f"appt_{uuid.uuid4().hex[:12]}"
    appointment_doc = {
        "appointment_id": appointment_id,
        "salon_id": appointment.salon_id,
        "barber_id": appointment.barber_id,
        "haircut_id": appointment.haircut_id,
        "client_id": user.user_id if user else None,
        "client_name": user.name if user else None,
        "client_email": user.email if user else None,
        "appointment_date": appointment.appointment_date,
        "appointment_time": appointment.appointment_time,
        "status": "pending",
        "payment_method": "cash",
        "payment_status": "pending",
        "total_price": haircut["price"],
        "client_notes": appointment.client_notes,
        "client_photos": appointment.client_photos,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(appointment_doc)
    appointment_doc["created_at"] = datetime.fromisoformat(appointment_doc["created_at"])
    return AppointmentResponse(**{k: v for k, v in appointment_doc.items() if k != "_id"})

@api_router.get("/appointments")
async def list_appointments(request: Request, user: UserBase = Depends(require_auth)):
    """List appointments for current user or salon"""
    if user.role in ["salon_owner", "founder"]:
        if user.salon_id:
            appointments = await db.appointments.find({"salon_id": user.salon_id}, {"_id": 0}).to_list(1000)
        else:
            appointments = await db.appointments.find({}, {"_id": 0}).to_list(1000)
    else:
        appointments = await db.appointments.find({"client_id": user.user_id}, {"_id": 0}).to_list(100)
    
    for a in appointments:
        if isinstance(a.get("created_at"), str):
            a["created_at"] = datetime.fromisoformat(a["created_at"])
    return appointments

@api_router.get("/salons/{salon_id}/appointments")
async def list_salon_appointments(salon_id: str, user: UserBase = Depends(require_salon_owner)):
    """List appointments for salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    appointments = await db.appointments.find({"salon_id": salon_id}, {"_id": 0}).to_list(1000)
    for a in appointments:
        if isinstance(a.get("created_at"), str):
            a["created_at"] = datetime.fromisoformat(a["created_at"])
    return appointments

@api_router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, request: Request, user: UserBase = Depends(require_salon_owner)):
    """Update appointment status"""
    body = await request.json()
    new_status = body.get("status")
    
    if new_status not in ["pending", "confirmed", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if user.role != "founder" and user.salon_id != appointment["salon_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {"status": new_status}
    if new_status == "completed":
        update_data["payment_status"] = "paid"
    
    await db.appointments.update_one({"appointment_id": appointment_id}, {"$set": update_data})
    return {"message": "Status updated"}

@api_router.get("/appointments/{appointment_id}")
async def get_appointment_details(appointment_id: str):
    """Get appointment details with QR code"""
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Get related data
    salon = await db.salons.find_one({"salon_id": appointment["salon_id"]}, {"_id": 0})
    barber = await db.barbers.find_one({"barber_id": appointment["barber_id"]}, {"_id": 0})
    haircut = await db.haircuts.find_one({"haircut_id": appointment["haircut_id"]}, {"_id": 0})
    
    # Generate QR code
    qr_data = f"AFROCROWN|{appointment_id}|{appointment['appointment_date']}|{appointment['appointment_time']}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = BytesIO()
    qr_img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return {
        "appointment": appointment,
        "salon": salon,
        "barber": barber,
        "haircut": haircut,
        "qr_code": f"data:image/png;base64,{qr_base64}"
    }

@api_router.post("/appointments/{appointment_id}/scan")
async def scan_appointment_qr(appointment_id: str, user: UserBase = Depends(require_salon_owner)):
    """Scan QR code to confirm client arrival"""
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if user.role != "founder" and user.salon_id != appointment["salon_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update status to confirmed
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {"status": "confirmed", "checked_in_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": "Client checked in", "appointment_id": appointment_id}

# =============================================================================
# PRODUCT ROUTES (MARKETPLACE)
# =============================================================================

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, user: UserBase = Depends(require_salon_owner)):
    """Create product"""
    product_id = f"prod_{uuid.uuid4().hex[:12]}"
    product_doc = {
        "product_id": product_id,
        "salon_id": user.salon_id if user.role == "salon_owner" else None,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "stock": product.stock,
        "image_url": product.image_url,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.products.insert_one(product_doc)
    product_doc["created_at"] = datetime.fromisoformat(product_doc["created_at"])
    return ProductResponse(**{k: v for k, v in product_doc.items() if k != "_id"})

@api_router.get("/products", response_model=List[ProductResponse])
async def list_products(category: Optional[str] = None):
    """List all products"""
    query = {"is_active": True}
    if category:
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    for p in products:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    return [ProductResponse(**p) for p in products]

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get product details"""
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get("created_at"), str):
        product["created_at"] = datetime.fromisoformat(product["created_at"])
    return ProductResponse(**product)

# =============================================================================
# TRIMCONNECT BARBER BATTLE ROUTES
# =============================================================================

def get_current_contest_edition():
    """Get current contest edition (biannual)"""
    now = datetime.now(timezone.utc)
    half = "H1" if now.month <= 6 else "H2"
    return f"{now.year}-{half}"

@api_router.post("/trimconnect/entries", response_model=TrimConnectEntryResponse)
async def create_trimconnect_entry(entry: TrimConnectEntryCreate, user: UserBase = Depends(require_auth)):
    """Create TrimConnect entry"""
    # Check if user is a barber or has a salon
    barber = await db.barbers.find_one({"salon_id": user.salon_id}, {"_id": 0}) if user.salon_id else None
    
    entry_id = f"tc_{uuid.uuid4().hex[:12]}"
    entry_doc = {
        "entry_id": entry_id,
        "barber_id": barber["barber_id"] if barber else user.user_id,
        "barber_name": barber["name"] if barber else user.name,
        "salon_id": user.salon_id,
        "salon_name": None,
        "title": entry.title,
        "description": entry.description,
        "image_url": entry.image_url,
        "video_url": entry.video_url,
        "votes": 0,
        "status": "pending",
        "contest_edition": get_current_contest_edition(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    if user.salon_id:
        salon = await db.salons.find_one({"salon_id": user.salon_id}, {"_id": 0})
        if salon:
            entry_doc["salon_name"] = salon["name"]
    
    await db.trimconnect_entries.insert_one(entry_doc)
    entry_doc["created_at"] = datetime.fromisoformat(entry_doc["created_at"])
    return TrimConnectEntryResponse(**{k: v for k, v in entry_doc.items() if k != "_id"})

@api_router.get("/trimconnect/entries", response_model=List[TrimConnectEntryResponse])
async def list_trimconnect_entries(status: Optional[str] = None, edition: Optional[str] = None):
    """List TrimConnect entries"""
    query = {}
    if status:
        query["status"] = status
    if edition:
        query["contest_edition"] = edition
    else:
        query["contest_edition"] = get_current_contest_edition()
    
    entries = await db.trimconnect_entries.find(query, {"_id": 0}).to_list(1000)
    for e in entries:
        if isinstance(e.get("created_at"), str):
            e["created_at"] = datetime.fromisoformat(e["created_at"])
    return [TrimConnectEntryResponse(**e) for e in entries]

@api_router.post("/trimconnect/vote")
async def vote_for_entry(vote: VoteCreate, user: UserBase = Depends(require_auth)):
    """Vote for a TrimConnect entry"""
    edition = get_current_contest_edition()
    
    # Check if already voted for this entry
    existing_vote = await db.votes.find_one({
        "user_id": user.user_id,
        "entry_id": vote.entry_id,
        "contest_edition": edition
    })
    
    if existing_vote:
        raise HTTPException(status_code=400, detail="Already voted for this entry")
    
    # Create vote
    vote_doc = {
        "vote_id": f"vote_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "entry_id": vote.entry_id,
        "contest_edition": edition,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.votes.insert_one(vote_doc)
    
    # Update entry votes count
    await db.trimconnect_entries.update_one(
        {"entry_id": vote.entry_id},
        {"$inc": {"votes": 1}}
    )
    
    return {"message": "Vote recorded"}

@api_router.get("/trimconnect/leaderboard")
async def get_leaderboard(edition: Optional[str] = None):
    """Get TrimConnect leaderboard"""
    query = {"contest_edition": edition or get_current_contest_edition()}
    entries = await db.trimconnect_entries.find(query, {"_id": 0}).sort("votes", -1).to_list(50)
    for e in entries:
        if isinstance(e.get("created_at"), str):
            e["created_at"] = datetime.fromisoformat(e["created_at"])
    return entries

@api_router.put("/trimconnect/entries/{entry_id}/status")
async def update_entry_status(entry_id: str, request: Request, founder: UserBase = Depends(require_founder)):
    """Update entry status (founder only)"""
    body = await request.json()
    new_status = body.get("status")
    
    if new_status not in ["pending", "approved", "finalist", "winner"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    await db.trimconnect_entries.update_one({"entry_id": entry_id}, {"$set": {"status": new_status}})
    return {"message": "Status updated"}

@api_router.get("/trimconnect/hall-of-fame")
async def get_hall_of_fame():
    """Get past winners"""
    winners = await db.trimconnect_entries.find({"status": "winner"}, {"_id": 0}).sort("contest_edition", -1).to_list(100)
    for w in winners:
        if isinstance(w.get("created_at"), str):
            w["created_at"] = datetime.fromisoformat(w["created_at"])
    return winners

# =============================================================================
# CLOUDINARY ROUTES
# =============================================================================

@api_router.get("/cloudinary/signature")
async def get_cloudinary_signature(
    resource_type: str = Query("image", enum=["image", "video"]),
    folder: str = "afrocrown"
):
    """Generate Cloudinary upload signature"""
    ALLOWED_FOLDERS = ("afrocrown/", "users/", "salons/", "products/", "trimconnect/")
    if not any(folder.startswith(f) for f in ALLOWED_FOLDERS):
        folder = f"afrocrown/{folder}"
    
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "folder": folder,
        "resource_type": resource_type
    }
    
    signature = cloudinary.utils.api_sign_request(
        params,
        os.getenv("CLOUDINARY_API_SECRET")
    )
    
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "folder": folder,
        "resource_type": resource_type
    }

# =============================================================================
# AI SIMULATION ROUTES
# =============================================================================

@api_router.post("/ai/simulate-haircut")
async def simulate_haircut(request: Request, user: UserBase = Depends(require_auth)):
    """Simulate haircut using AI image generation"""
    body = await request.json()
    base_image_url = body.get("image_url")
    image_base64_input = body.get("image_base64")
    haircut_style = body.get("haircut_style", "modern fade haircut")
    
    try:
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        api_key = os.getenv("EMERGENT_LLM_KEY")
        image_gen = OpenAIImageGeneration(api_key=api_key)
        
        # Build detailed prompt based on style
        style_prompts = {
            "fade": "clean fade haircut with sharp lines and precise edges",
            "dreadlocks": "well-maintained dreadlocks hairstyle, neat and styled",
            "braids": "neat braided hairstyle with clean parts and intricate patterns",
            "afro": "full natural afro hairstyle, well-shaped and voluminous",
            "waves": "360 waves pattern hairstyle with defined waves",
            "buzz": "clean buzz cut with defined hairline and sharp edges"
        }
        
        style_description = style_prompts.get(haircut_style, haircut_style)
        prompt = f"Professional barber photo portrait of a handsome young African man with a {style_description}. Clean, sharp lines, well-groomed afro texture hair. Studio lighting, high quality portrait, front facing, neutral background."
        
        logger.info(f"Generating AI simulation with prompt: {prompt[:100]}...")
        
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if images and len(images) > 0:
            result_base64 = base64.b64encode(images[0]).decode('utf-8')
            
            # Upload to Cloudinary for permanent URL
            generated_url = None
            try:
                upload_result = cloudinary.uploader.upload(
                    f"data:image/png;base64,{result_base64}",
                    folder="afrocrown/simulations"
                )
                generated_url = upload_result.get("secure_url")
                logger.info(f"Image uploaded to Cloudinary: {generated_url}")
            except Exception as upload_err:
                logger.error(f"Cloudinary upload failed: {upload_err}")
            
            return {
                "image_base64": result_base64,
                "generated_image_url": generated_url,
                "style": haircut_style
            }
        else:
            raise HTTPException(status_code=500, detail="No image generated")
            
    except Exception as e:
        logger.error(f"AI simulation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI simulation failed: {str(e)}")

# =============================================================================
# STRIPE PAYMENT ROUTES
# =============================================================================

@api_router.post("/payments/checkout")
async def create_checkout_session(checkout: CheckoutRequest, request: Request):
    """Create Stripe checkout session"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
    
    api_key = os.getenv("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)
    
    # Calculate total amount
    total_amount = 0.0
    metadata = {"source": "afrocrown"}
    
    if checkout.appointment_id:
        appointment = await db.appointments.find_one({"appointment_id": checkout.appointment_id}, {"_id": 0})
        if appointment:
            total_amount += appointment.get("total_price", 0)
            metadata["appointment_id"] = checkout.appointment_id
    
    if checkout.product_ids:
        for pid in checkout.product_ids:
            product = await db.products.find_one({"product_id": pid}, {"_id": 0})
            if product:
                total_amount += product.get("price", 0)
        metadata["product_ids"] = ",".join(checkout.product_ids)
    
    if total_amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")
    
    success_url = f"{checkout.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout.origin_url}/payment/cancel"
    
    checkout_request = CheckoutSessionRequest(
        amount=float(total_amount),
        currency="eur",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create payment transaction record
    transaction_doc = {
        "transaction_id": f"txn_{uuid.uuid4().hex[:12]}",
        "session_id": session.session_id,
        "amount": total_amount,
        "currency": "eur",
        "metadata": metadata,
        "payment_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str):
    """Get payment status"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.getenv("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction
    if status.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid"}}
        )
        
        # Update appointment if applicable
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if transaction and transaction.get("metadata", {}).get("appointment_id"):
            await db.appointments.update_one(
                {"appointment_id": transaction["metadata"]["appointment_id"]},
                {"$set": {"payment_status": "paid", "payment_method": "stripe"}}
            )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    api_key = os.getenv("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        if webhook_response.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {"payment_status": "paid"}}
            )
        
        return {"received": True}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        return {"received": False, "error": str(e)}

# =============================================================================
# SALON STATISTICS ROUTES
# =============================================================================

@api_router.get("/salons/{salon_id}/stats")
async def get_salon_stats(salon_id: str, user: UserBase = Depends(require_salon_owner)):
    """Get salon statistics"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    total_barbers = await db.barbers.count_documents({"salon_id": salon_id, "is_active": True})
    total_appointments = await db.appointments.count_documents({"salon_id": salon_id})
    completed_appointments = await db.appointments.count_documents({"salon_id": salon_id, "status": "completed"})
    pending_appointments = await db.appointments.count_documents({"salon_id": salon_id, "status": "pending"})
    
    # Revenue
    paid_appointments = await db.appointments.find(
        {"salon_id": salon_id, "payment_status": "paid"},
        {"_id": 0, "total_price": 1}
    ).to_list(10000)
    total_revenue = sum(a.get("total_price", 0) for a in paid_appointments)
    
    # Popular haircuts
    haircuts = await db.haircuts.find({"salon_id": salon_id}, {"_id": 0}).to_list(100)
    
    return {
        "total_barbers": total_barbers,
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "pending_appointments": pending_appointments,
        "total_revenue": total_revenue,
        "haircuts_count": len(haircuts)
    }

# =============================================================================
# HEALTH CHECK
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "AfroCrown API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include router and add middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

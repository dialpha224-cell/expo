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
# IN-APP NOTIFICATIONS HELPER
# =============================================================================

async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    data: dict = None
) -> str:
    """Create an in-app notification for a user"""
    notification_id = f"notif_{uuid.uuid4().hex[:12]}"
    notification_doc = {
        "notification_id": notification_id,
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "data": data or {},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification_doc)
    logger.info(f"Notification created for user {user_id}: {title}")
    return notification_id

async def notify_salon_owner_new_appointment(appointment_doc: dict):
    """Notify salon owner about a new appointment"""
    # Get salon to find owner
    salon = await db.salons.find_one({"salon_id": appointment_doc.get("salon_id")}, {"_id": 0})
    if not salon or not salon.get("owner_id"):
        # If no specific owner, notify founder
        founder = await db.users.find_one({"role": "founder"}, {"_id": 0})
        if founder:
            owner_id = founder["user_id"]
        else:
            return
    else:
        owner_id = salon["owner_id"]
    
    # Get barber and haircut info for the message
    barber = await db.barbers.find_one({"barber_id": appointment_doc.get("barber_id")}, {"_id": 0})
    haircut = await db.haircuts.find_one({"haircut_id": appointment_doc.get("haircut_id")}, {"_id": 0})
    
    barber_name = barber.get("name", "Un coiffeur") if barber else "Un coiffeur"
    haircut_name = haircut.get("name", "une coupe") if haircut else "une coupe"
    client_name = appointment_doc.get("client_name", "Un client")
    
    await create_notification(
        user_id=owner_id,
        notification_type="new_appointment",
        title="Nouveau rendez-vous !",
        message=f"{client_name} a reserve {haircut_name} avec {barber_name} le {appointment_doc.get('appointment_date')} a {appointment_doc.get('appointment_time')}",
        data={
            "appointment_id": appointment_doc.get("appointment_id"),
            "salon_id": appointment_doc.get("salon_id"),
            "type": "appointment"
        }
    )

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
    country: Optional[str] = None
    city: Optional[str] = None
    image_url: Optional[str] = None

class SalonResponse(BaseModel):
    salon_id: str
    name: str
    address: str
    phone: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    opening_hours: Optional[Dict[str, Any]] = None
    image_url: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    rating: float = 0.0
    total_reviews: int = 0
    is_active: bool = True
    is_approved: bool = True  # False until admin approves
    created_at: datetime

class BarberCreate(BaseModel):
    name: str
    email: Optional[str] = None
    specialties: List[str] = []
    expertise: Optional[str] = None  # Expertise spécifique (type de coupes)
    bio: Optional[str] = None
    image_url: Optional[str] = None
    photo_url: Optional[str] = None  # Photo du coiffeur
    role: str = "employee"  # owner, employee, volunteer, intern
    phone: Optional[str] = None
    phone_visible: bool = True  # Visibilité du téléphone par le propriétaire
    phone_hidden_by_admin: bool = False  # Si True, personne ne peut voir le téléphone

class BarberUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    specialties: Optional[List[str]] = None
    expertise: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    photo_url: Optional[str] = None
    role: Optional[str] = None
    phone: Optional[str] = None
    phone_visible: Optional[bool] = None
    phone_hidden_by_admin: Optional[bool] = None  # Only admin can set this

class BarberResponse(BaseModel):
    barber_id: str
    salon_id: str
    name: str
    email: Optional[str] = None
    specialties: List[str] = []
    specialty: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    photo_url: Optional[str] = None
    experience_years: Optional[int] = None
    rating: float = 0.0
    total_reviews: int = 0
    is_active: bool = True
    is_available: bool = True
    role: str = "employee"
    phone: Optional[str] = None
    availability_schedule: Optional[Dict[str, Any]] = None
    unavailable_reason: Optional[str] = None
    redirect_to_barber_id: Optional[str] = None
    created_at: datetime

class BarberAvailabilityUpdate(BaseModel):
    is_available: bool
    unavailable_reason: Optional[str] = None
    redirect_to_barber_id: Optional[str] = None

class BarberScheduleUpdate(BaseModel):
    availability_schedule: Dict[str, Any]  # {"monday": {"start": "09:00", "end": "18:00"}, ...}

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

# Salon-specific pricing
class SalonPriceCreate(BaseModel):
    haircut_id: str
    price: float
    is_available: bool = True

class SalonPriceResponse(BaseModel):
    salon_id: str
    haircut_id: str
    haircut_name: Optional[str] = None
    base_price: float  # Prix de base (global)
    salon_price: float  # Prix du salon
    duration_minutes: int
    category: str
    is_available: bool = True

class SalonPricingUpdate(BaseModel):
    prices: List[SalonPriceCreate]

# Salon Promotions
class PromotionCreate(BaseModel):
    haircut_id: Optional[str] = None  # None = applies to all haircuts
    name: str
    discount_type: str = "percentage"  # percentage or fixed
    discount_value: float  # 20 for 20% or 5 for 5 EUR
    start_date: str
    end_date: str
    days_of_week: List[str] = []  # ["monday", "tuesday"] - empty = all days
    description: Optional[str] = None

class PromotionResponse(BaseModel):
    promotion_id: str
    salon_id: str
    haircut_id: Optional[str] = None
    haircut_name: Optional[str] = None
    name: str
    discount_type: str
    discount_value: float
    start_date: str
    end_date: str
    days_of_week: List[str] = []
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime

# Profile Photo Update
class ProfilePhotoUpdate(BaseModel):
    picture: str  # Cloudinary URL

# Salon Update by Admin
class SalonUpdateByAdmin(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

# Tendances du moment - Soumissions des salons
class TrendSubmission(BaseModel):
    image_url: str  # URL de l'image (depuis la galerie du salon)
    haircut_name: str  # Nom de la coupe
    barber_name: str  # Coiffeur qui a réalisé la coupe
    message: Optional[str] = None  # Message à la communauté
    client_consent: bool = True  # Accord du client

class TrendResponse(BaseModel):
    trend_id: str
    salon_id: str
    salon_name: str
    barber_name: Optional[str] = None
    haircut_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    message: Optional[str] = None
    image_url: str
    is_approved: bool = False
    is_featured: bool = False
    likes: int = 0
    created_at: datetime

# Salon Photo Gallery
class SalonPhotoUpload(BaseModel):
    image_url: str
    description: Optional[str] = None

class SalonPhotoResponse(BaseModel):
    photo_id: str
    salon_id: str
    image_url: str
    description: Optional[str] = None
    created_at: datetime

class AppointmentCreate(BaseModel):
    salon_id: str
    barber_id: str
    haircut_id: str
    appointment_date: str
    appointment_time: str
    client_notes: Optional[str] = None
    client_photos: List[str] = []
    is_premium: bool = False  # Premium reservation with drinks/snacks

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
    base_price: float = 0.0
    premium_fee: float = 0.0
    is_premium: bool = False
    client_notes: Optional[str] = None
    client_photos: List[str] = []
    created_at: datetime

# Premium Service Models (drinks/snacks offered by salon)
class PremiumServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "drink"  # drink, snack
    image_url: Optional[str] = None

class PremiumServiceResponse(BaseModel):
    service_id: str
    salon_id: str
    name: str
    description: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    is_active: bool = True

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

# Notification Models
class NotificationCreate(BaseModel):
    type: str  # new_appointment, appointment_cancelled, appointment_confirmed, etc.
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None

class NotificationResponse(BaseModel):
    notification_id: str
    user_id: str
    type: str
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None
    is_read: bool = False
    created_at: datetime

# Review Models
class ReviewCreate(BaseModel):
    appointment_id: str
    salon_rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    barber_rating: int = Field(..., ge=1, le=5)  # 1-5 stars
    platform_rating: Optional[int] = Field(None, ge=1, le=5)  # Optional platform rating
    salon_comment: Optional[str] = None
    barber_comment: Optional[str] = None
    platform_comment: Optional[str] = None

class ReviewResponse(BaseModel):
    review_id: str
    appointment_id: str
    user_id: str
    user_name: str
    user_picture: Optional[str] = None
    salon_id: str
    salon_name: Optional[str] = None
    barber_id: str
    barber_name: Optional[str] = None
    haircut_name: Optional[str] = None
    salon_rating: int
    barber_rating: int
    platform_rating: Optional[int] = None
    salon_comment: Optional[str] = None
    barber_comment: Optional[str] = None
    platform_comment: Optional[str] = None
    created_at: datetime

# =============================================================================
# MONTHLY CUTS (COUPES DU MOIS) MODELS
# =============================================================================

class MonthlyCutCreate(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    haircut_id: Optional[str] = None

class MonthlyCutResponse(BaseModel):
    cut_id: str
    salon_id: str
    salon_name: str
    barber_id: Optional[str] = None
    barber_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    image_url: str
    haircut_id: Optional[str] = None
    haircut_name: Optional[str] = None
    month: str  # "2025-03"
    likes: int = 0
    is_featured: bool = False
    created_at: datetime

# =============================================================================
# LOYALTY PROGRAM MODELS
# =============================================================================

class LoyaltyCardResponse(BaseModel):
    card_id: str
    user_id: str
    salon_id: str
    salon_name: str
    stamps: int = 0
    max_stamps: int = 10
    rewards_earned: int = 0
    qr_code: str  # QR code data URL
    created_at: datetime
    updated_at: datetime

class LoyaltyRewardConfig(BaseModel):
    reward_type: str = "free_haircut"  # free_haircut, free_product, discount
    reward_description: str = "Coupe gratuite"
    max_stamps: int = 10

class LoyaltyScanRequest(BaseModel):
    qr_code_data: str  # User's QR code data

class LoyaltyRewardResponse(BaseModel):
    reward_id: str
    user_id: str
    salon_id: str
    reward_type: str
    reward_description: str
    is_redeemed: bool = False
    redeemed_at: Optional[datetime] = None
    created_at: datetime

# =============================================================================
# SALON LOCATION MODELS
# =============================================================================

class SalonLocationUpdate(BaseModel):
    country: str
    city: str
    address: str
    postal_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class SalonSearchQuery(BaseModel):
    country: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_km: float = 10.0

class SalonRegistrationOwner(BaseModel):
    name: str
    email: str
    password: str
    phone: Optional[str] = None

class SalonRegistrationSalon(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    city: str
    country: str
    phone: Optional[str] = None
    services: List[str] = []

class SalonRegistrationRequest(BaseModel):
    owner: SalonRegistrationOwner
    salon: SalonRegistrationSalon

# =============================================================================
# ENHANCED LOYALTY & GAMIFICATION MODELS
# =============================================================================

# Client notification preferences (anti-spam)
class NotificationPreferences(BaseModel):
    email_marketing: bool = True
    email_reminders: bool = True
    push_promotions: bool = True
    push_reminders: bool = True
    sms_enabled: bool = False
    max_messages_per_week: int = 3  # Smart throttling
    quiet_hours_start: str = "22:00"
    quiet_hours_end: str = "08:00"

# VIP Status tiers
class VIPTier(BaseModel):
    tier: str  # bronze, silver, gold, platinum
    min_points: int
    benefits: List[str]
    discount_percent: float

# Salon badges/achievements
class SalonBadge(BaseModel):
    badge_id: str
    name: str
    description: str
    icon: str  # emoji or icon name
    criteria_type: str  # bookings, revenue, rating, retention
    criteria_value: int
    tier: str  # bronze, silver, gold

# Client points transaction
class PointsTransaction(BaseModel):
    transaction_id: str
    user_id: str
    salon_id: Optional[str] = None
    points: int  # positive = earned, negative = spent
    reason: str  # booking, referral, review, redemption
    created_at: datetime

# Referral program
class ReferralCode(BaseModel):
    code: str
    user_id: str
    uses: int = 0
    max_uses: Optional[int] = None
    reward_points: int = 100
    created_at: datetime

# Urgent booking request
class UrgentBookingRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0
    haircut_type: Optional[str] = None

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

# User Registration Model
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

@api_router.post("/auth/register")
async def register_user(user_data: UserRegister):
    """Register a new user with email and password"""
    # Check if email already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Validate password
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Le mot de passe doit faire au moins 6 caractères")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = hash_password(user_data.password)
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": "client",
        "password_hash": password_hash,
        "must_change_password": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create session
    session_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    response = JSONResponse(content={
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": "client",
        "salon_id": None,
        "must_change_password": False
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
# IN-APP NOTIFICATIONS ENDPOINTS
# =============================================================================

@api_router.get("/notifications")
async def get_notifications(
    user: UserBase = Depends(require_auth),
    unread_only: bool = False,
    limit: int = 50
):
    """Get notifications for current user"""
    query = {"user_id": user.user_id}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(
        query, 
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Get unread count
    unread_count = await db.notifications.count_documents({
        "user_id": user.user_id,
        "is_read": False
    })
    
    for n in notifications:
        if isinstance(n.get("created_at"), str):
            n["created_at"] = datetime.fromisoformat(n["created_at"])
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@api_router.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user: UserBase = Depends(require_auth)):
    """Mark a notification as read"""
    result = await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": user.user_id},
        {"$set": {"is_read": True}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvee")
    
    return {"message": "Notification marquee comme lue"}

@api_router.put("/notifications/read-all")
async def mark_all_notifications_read(user: UserBase = Depends(require_auth)):
    """Mark all notifications as read for current user"""
    await db.notifications.update_many(
        {"user_id": user.user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Toutes les notifications marquees comme lues"}

@api_router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, user: UserBase = Depends(require_auth)):
    """Delete a notification"""
    result = await db.notifications.delete_one({
        "notification_id": notification_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification non trouvee")
    
    return {"message": "Notification supprimee"}

# =============================================================================
# REVIEWS ENDPOINTS
# =============================================================================

@api_router.post("/reviews", response_model=ReviewResponse)
async def create_review(review: ReviewCreate, user: UserBase = Depends(require_auth)):
    """Create a review for a completed appointment"""
    # Get the appointment
    appointment = await db.appointments.find_one({"appointment_id": review.appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouve")
    
    # Check if user is the client of this appointment
    if appointment.get("client_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Vous ne pouvez noter que vos propres rendez-vous")
    
    # Check if appointment is completed
    if appointment.get("status") != "completed":
        raise HTTPException(status_code=400, detail="Vous ne pouvez noter qu'un rendez-vous termine")
    
    # Check if already reviewed
    existing_review = await db.reviews.find_one({"appointment_id": review.appointment_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Vous avez deja laisse un avis pour ce rendez-vous")
    
    # Get related data for the review
    salon = await db.salons.find_one({"salon_id": appointment.get("salon_id")}, {"_id": 0})
    barber = await db.barbers.find_one({"barber_id": appointment.get("barber_id")}, {"_id": 0})
    haircut = await db.haircuts.find_one({"haircut_id": appointment.get("haircut_id")}, {"_id": 0})
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "appointment_id": review.appointment_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "user_picture": user.picture,
        "salon_id": appointment.get("salon_id"),
        "salon_name": salon.get("name") if salon else None,
        "barber_id": appointment.get("barber_id"),
        "barber_name": barber.get("name") if barber else None,
        "haircut_name": haircut.get("name") if haircut else None,
        "salon_rating": review.salon_rating,
        "barber_rating": review.barber_rating,
        "platform_rating": review.platform_rating,
        "salon_comment": review.salon_comment,
        "barber_comment": review.barber_comment,
        "platform_comment": review.platform_comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_doc)
    
    # Update salon average rating
    await update_salon_rating(appointment.get("salon_id"))
    
    # Update barber average rating
    await update_barber_rating(appointment.get("barber_id"))
    
    # Mark appointment as reviewed
    await db.appointments.update_one(
        {"appointment_id": review.appointment_id},
        {"$set": {"is_reviewed": True}}
    )
    
    # Notify salon owner about the new review
    try:
        await notify_salon_owner_new_review(review_doc)
    except Exception as e:
        logger.error(f"Failed to send review notification: {e}")
    
    review_doc["created_at"] = datetime.fromisoformat(review_doc["created_at"])
    return ReviewResponse(**{k: v for k, v in review_doc.items() if k != "_id"})

async def update_salon_rating(salon_id: str):
    """Update salon's average rating based on all reviews"""
    pipeline = [
        {"$match": {"salon_id": salon_id}},
        {"$group": {
            "_id": "$salon_id",
            "avg_rating": {"$avg": "$salon_rating"},
            "total_reviews": {"$sum": 1}
        }}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        await db.salons.update_one(
            {"salon_id": salon_id},
            {"$set": {
                "rating": round(result[0]["avg_rating"], 1),
                "total_reviews": result[0]["total_reviews"]
            }}
        )

async def update_barber_rating(barber_id: str):
    """Update barber's average rating based on all reviews"""
    pipeline = [
        {"$match": {"barber_id": barber_id}},
        {"$group": {
            "_id": "$barber_id",
            "avg_rating": {"$avg": "$barber_rating"},
            "total_reviews": {"$sum": 1}
        }}
    ]
    result = await db.reviews.aggregate(pipeline).to_list(1)
    if result:
        await db.barbers.update_one(
            {"barber_id": barber_id},
            {"$set": {
                "rating": round(result[0]["avg_rating"], 1),
                "total_reviews": result[0]["total_reviews"]
            }}
        )

async def notify_salon_owner_new_review(review_doc: dict):
    """Notify salon owner about a new review"""
    salon = await db.salons.find_one({"salon_id": review_doc.get("salon_id")}, {"_id": 0})
    if not salon:
        return
    
    owner_id = salon.get("owner_id")
    if not owner_id:
        # Notify founder if no owner
        founder = await db.users.find_one({"role": "founder"}, {"_id": 0})
        if founder:
            owner_id = founder["user_id"]
        else:
            return
    
    stars = "★" * review_doc.get("salon_rating", 0) + "☆" * (5 - review_doc.get("salon_rating", 0))
    
    await create_notification(
        user_id=owner_id,
        notification_type="new_review",
        title="Nouvel avis client !",
        message=f"{review_doc.get('user_name')} a laisse un avis {stars} pour votre salon",
        data={
            "review_id": review_doc.get("review_id"),
            "salon_id": review_doc.get("salon_id"),
            "type": "review"
        }
    )

@api_router.get("/reviews/salon/{salon_id}")
async def get_salon_reviews(salon_id: str, limit: int = 50):
    """Get all reviews for a salon"""
    reviews = await db.reviews.find(
        {"salon_id": salon_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for r in reviews:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    
    # Calculate stats
    total = len(reviews)
    avg_salon = sum(r.get("salon_rating", 0) for r in reviews) / total if total > 0 else 0
    avg_barber = sum(r.get("barber_rating", 0) for r in reviews) / total if total > 0 else 0
    
    # Distribution of ratings
    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for r in reviews:
        rating = r.get("salon_rating", 0)
        if rating in distribution:
            distribution[rating] += 1
    
    return {
        "reviews": reviews,
        "stats": {
            "total_reviews": total,
            "average_salon_rating": round(avg_salon, 1),
            "average_barber_rating": round(avg_barber, 1),
            "rating_distribution": distribution
        }
    }

@api_router.get("/reviews/barber/{barber_id}")
async def get_barber_reviews(barber_id: str, limit: int = 50):
    """Get all reviews for a barber"""
    reviews = await db.reviews.find(
        {"barber_id": barber_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for r in reviews:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    
    total = len(reviews)
    avg_rating = sum(r.get("barber_rating", 0) for r in reviews) / total if total > 0 else 0
    
    return {
        "reviews": reviews,
        "stats": {
            "total_reviews": total,
            "average_rating": round(avg_rating, 1)
        }
    }

@api_router.get("/reviews/appointment/{appointment_id}")
async def get_appointment_review(appointment_id: str):
    """Get review for a specific appointment"""
    review = await db.reviews.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not review:
        raise HTTPException(status_code=404, detail="Aucun avis pour ce rendez-vous")
    
    if isinstance(review.get("created_at"), str):
        review["created_at"] = datetime.fromisoformat(review["created_at"])
    
    return review

@api_router.get("/reviews/platform")
async def get_platform_reviews(limit: int = 50):
    """Get platform reviews (for AfroCrown feedback)"""
    reviews = await db.reviews.find(
        {"platform_rating": {"$exists": True, "$ne": None}},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    for r in reviews:
        if isinstance(r.get("created_at"), str):
            r["created_at"] = datetime.fromisoformat(r["created_at"])
    
    total = len(reviews)
    avg_rating = sum(r.get("platform_rating", 0) for r in reviews) / total if total > 0 else 0
    
    return {
        "reviews": reviews,
        "stats": {
            "total_reviews": total,
            "average_rating": round(avg_rating, 1)
        }
    }

@api_router.get("/reviews/my-pending")
async def get_pending_reviews(user: UserBase = Depends(require_auth)):
    """Get appointments that need a review from the current user"""
    # Get completed appointments without reviews
    appointments = await db.appointments.find({
        "client_id": user.user_id,
        "status": "completed",
        "is_reviewed": {"$ne": True}
    }, {"_id": 0}).to_list(100)
    
    # Enrich with salon, barber, haircut info
    enriched = []
    for apt in appointments:
        salon = await db.salons.find_one({"salon_id": apt.get("salon_id")}, {"_id": 0, "name": 1})
        barber = await db.barbers.find_one({"barber_id": apt.get("barber_id")}, {"_id": 0, "name": 1})
        haircut = await db.haircuts.find_one({"haircut_id": apt.get("haircut_id")}, {"_id": 0, "name": 1})
        
        enriched.append({
            **apt,
            "salon_name": salon.get("name") if salon else "N/A",
            "barber_name": barber.get("name") if barber else "N/A",
            "haircut_name": haircut.get("name") if haircut else "N/A"
        })
    
    return enriched

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

@api_router.get("/founder/salons/pending")
async def get_pending_salons(founder: UserBase = Depends(require_founder)):
    """Get list of salons pending approval"""
    salons = await db.salons.find({"is_approved": False}, {"_id": 0}).to_list(100)
    for s in salons:
        if isinstance(s.get("created_at"), str):
            s["created_at"] = datetime.fromisoformat(s["created_at"])
        # Get owner info
        if s.get("owner_id"):
            owner = await db.users.find_one({"user_id": s["owner_id"]}, {"_id": 0, "name": 1, "email": 1, "phone": 1})
            s["owner"] = owner
    return salons

@api_router.put("/founder/salons/{salon_id}/approve")
async def approve_salon(salon_id: str, founder: UserBase = Depends(require_founder)):
    """Approve a pending salon"""
    result = await db.salons.update_one(
        {"salon_id": salon_id},
        {"$set": {"is_approved": True, "is_active": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Salon non trouvé")
    return {"message": "Salon approuvé et maintenant visible"}

@api_router.put("/founder/salons/{salon_id}/reject")
async def reject_salon(salon_id: str, founder: UserBase = Depends(require_founder)):
    """Reject a pending salon (deletes it)"""
    salon = await db.salons.find_one({"salon_id": salon_id})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon non trouvé")
    
    # Delete salon and owner account
    await db.salons.delete_one({"salon_id": salon_id})
    if salon.get("owner_id"):
        await db.users.delete_one({"user_id": salon["owner_id"]})
    
    return {"message": "Salon rejeté et supprimé"}

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
# CLIENT ARRIVAL NOTIFICATION
# =============================================================================

class ArrivalNotification(BaseModel):
    arrival_type: str  # "late" or "early"
    minutes: int = Field(..., ge=1, le=120)

@api_router.put("/appointments/{appointment_id}/arrival")
async def notify_arrival(
    appointment_id: str,
    notification: ArrivalNotification,
    user: UserBase = Depends(require_auth)
):
    """Client notifies salon about late/early arrival"""
    # Verify appointment belongs to user
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouve")
    
    if appointment.get("client_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Ce n'est pas votre rendez-vous")
    
    if appointment.get("status") not in ["pending", "confirmed"]:
        raise HTTPException(status_code=400, detail="Ce rendez-vous ne peut plus etre modifie")
    
    # Update appointment with arrival info
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {
            "arrival_status": notification.arrival_type,
            "arrival_minutes": notification.minutes,
            "arrival_notified_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Notify salon owner
    salon = await db.salons.find_one({"salon_id": appointment.get("salon_id")}, {"_id": 0})
    if salon:
        owner_id = salon.get("owner_id")
        if not owner_id:
            founder = await db.users.find_one({"role": "founder"}, {"_id": 0})
            if founder:
                owner_id = founder["user_id"]
        
        if owner_id:
            status_text = "en retard" if notification.arrival_type == "late" else "en avance"
            await create_notification(
                user_id=owner_id,
                notification_type="arrival_update",
                title=f"Client {status_text}",
                message=f"{user.name} sera {status_text} de {notification.minutes} min pour son RDV de {appointment.get('appointment_time')}",
                data={
                    "appointment_id": appointment_id,
                    "salon_id": appointment.get("salon_id"),
                    "type": "arrival"
                }
            )
    
    return {"message": f"Le salon a ete prevenu de votre {'retard' if notification.arrival_type == 'late' else 'avance'}"}

# =============================================================================
# SALON ROUTES
# =============================================================================

@api_router.post("/salons/register")
async def register_salon(request: SalonRegistrationRequest):
    """Register a new salon with owner account (requires admin approval)"""
    # Check if email already exists
    existing = await db.users.find_one({"email": request.owner.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Create owner account
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    password_hash = pwd_context.hash(request.owner.password)
    
    user_doc = {
        "user_id": user_id,
        "email": request.owner.email,
        "name": request.owner.name,
        "phone": request.owner.phone,
        "picture": None,
        "role": "salon_owner",
        "salon_id": None,  # Will be set after salon creation
        "password_hash": password_hash,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Create salon (not approved yet)
    salon_id = f"salon_{uuid.uuid4().hex[:12]}"
    salon_doc = {
        "salon_id": salon_id,
        "name": request.salon.name,
        "description": request.salon.description,
        "address": request.salon.address or "",
        "city": request.salon.city,
        "country": request.salon.country,
        "phone": request.salon.phone or "",
        "owner_id": user_id,
        "opening_hours": {},
        "image_url": None,
        "rating": 0.0,
        "total_reviews": 0,
        "is_active": False,  # Not active until approved
        "is_approved": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Update user with salon_id
    user_doc["salon_id"] = salon_id
    
    # Insert both
    await db.users.insert_one(user_doc)
    await db.salons.insert_one(salon_doc)
    
    return {"message": "Demande d'inscription envoyée. Votre salon sera visible après validation par un administrateur.", "salon_id": salon_id}

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
        "image_url": salon.image_url,
        "country": salon.country,
        "city": salon.city,
        "rating": 0.0,
        "total_reviews": 0,
        "is_active": True,
        "is_approved": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.salons.insert_one(salon_doc)
    salon_doc["created_at"] = datetime.fromisoformat(salon_doc["created_at"])
    return SalonResponse(**{k: v for k, v in salon_doc.items() if k != "_id"})

@api_router.get("/salons", response_model=List[SalonResponse])
async def list_salons(country: Optional[str] = None, city: Optional[str] = None):
    """List all active and approved salons, optionally filtered by country/city"""
    query = {"is_active": True, "$or": [{"is_approved": True}, {"is_approved": {"$exists": False}}]}
    
    # Filter by country if provided
    if country:
        query["country"] = {"$regex": f"^{country}$", "$options": "i"}
    
    # Filter by city if provided
    if city:
        query["city"] = {"$regex": f"^{city}$", "$options": "i"}
    
    salons = await db.salons.find(query, {"_id": 0}).to_list(1000)
    for s in salons:
        if isinstance(s.get("created_at"), str):
            s["created_at"] = datetime.fromisoformat(s["created_at"])
        # Set default is_approved for old salons
        if "is_approved" not in s:
            s["is_approved"] = True
    return [SalonResponse(**s) for s in salons]

# =============================================================================
# SALON SEARCH & LOCATION ROUTES (MUST BE BEFORE /salons/{salon_id})
# =============================================================================

@api_router.get("/salons/locations/countries")
async def get_salon_countries():
    """Get list of countries with salons"""
    countries = await db.salons.distinct("country", {"country": {"$ne": None, "$exists": True}})
    return sorted([c for c in countries if c])

@api_router.get("/salons/locations/cities")
async def get_salon_cities(country: Optional[str] = None):
    """Get list of cities with salons, optionally filtered by country"""
    query = {"city": {"$ne": None, "$exists": True}}
    if country:
        query["country"] = country
    
    cities = await db.salons.distinct("city", query)
    return sorted([c for c in cities if c])

@api_router.get("/salons/search")
async def search_salons(
    country: Optional[str] = None,
    city: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    radius_km: float = 10.0,
    limit: int = 50
):
    """Search salons by location"""
    import math
    
    query = {}
    
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    salons = await db.salons.find(query, {"_id": 0}).to_list(limit)
    
    # If coordinates provided, sort by distance
    if latitude and longitude:
        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth's radius in km
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            return R * c
        
        for salon in salons:
            loc = salon.get("location", {})
            if loc and loc.get("coordinates"):
                salon_lon, salon_lat = loc["coordinates"]
                salon["distance_km"] = round(haversine_distance(latitude, longitude, salon_lat, salon_lon), 2)
            else:
                salon["distance_km"] = 9999
        
        # Filter by radius and sort by distance
        salons = [s for s in salons if s.get("distance_km", 9999) <= radius_km]
        salons.sort(key=lambda x: x.get("distance_km", 9999))
    
    return salons

@api_router.get("/salons/nearby")
async def get_nearby_salons(latitude: float, longitude: float, radius_km: float = 10.0, limit: int = 20):
    """Get salons near a location"""
    return await search_salons(latitude=latitude, longitude=longitude, radius_km=radius_km, limit=limit)

# =============================================================================
# SALON DETAIL ROUTES (Dynamic routes AFTER static routes)
# =============================================================================

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
# SALON LIVE SCREEN ENDPOINT
# =============================================================================

@api_router.get("/salons/{salon_id}/live-screen")
async def get_salon_live_screen(salon_id: str, date: Optional[str] = None):
    """Get live appointment data for salon display screen (public endpoint)"""
    # Use today if no date provided
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Get salon info
    salon = await db.salons.find_one({"salon_id": salon_id}, {"_id": 0})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon non trouve")
    
    # Get today's appointments
    appointments = await db.appointments.find({
        "salon_id": salon_id,
        "appointment_date": date
    }, {"_id": 0}).sort("appointment_time", 1).to_list(100)
    
    # Get barbers for this salon
    barbers = {b["barber_id"]: b async for b in db.barbers.find({"salon_id": salon_id}, {"_id": 0})}
    
    # Get haircuts
    haircuts = {h["haircut_id"]: h async for h in db.haircuts.find({}, {"_id": 0})}
    
    # Enrich appointments with status colors
    enriched_appointments = []
    current_time = datetime.now(timezone.utc).strftime("%H:%M")
    
    for apt in appointments:
        barber = barbers.get(apt.get("barber_id"), {})
        haircut = haircuts.get(apt.get("haircut_id"), {})
        
        # Determine display status
        display_status = "on_time"  # green
        if apt.get("status") == "cancelled":
            display_status = "cancelled"  # strikethrough
        elif apt.get("arrival_status") == "late":
            display_status = "late"  # red
        elif apt.get("arrival_status") == "early":
            display_status = "early"  # green (early is good)
        elif apt.get("status") == "completed":
            display_status = "completed"  # grey
        
        enriched_appointments.append({
            "appointment_id": apt.get("appointment_id"),
            "time": apt.get("appointment_time"),
            "client_name": apt.get("client_name") or "Client",
            "barber_name": barber.get("name", "N/A"),
            "barber_id": apt.get("barber_id"),
            "haircut_name": haircut.get("name", "N/A"),
            "duration": haircut.get("duration_minutes", 30),
            "status": apt.get("status"),
            "display_status": display_status,
            "arrival_status": apt.get("arrival_status"),
            "arrival_minutes": apt.get("arrival_minutes"),
            "is_cancelled": apt.get("status") == "cancelled"
        })
    
    # Get available barbers
    available_barbers = [
        {"barber_id": b["barber_id"], "name": b["name"], "is_available": b.get("is_available", True)}
        for b in barbers.values() if b.get("is_active", True)
    ]
    
    return {
        "salon": {
            "name": salon.get("name"),
            "address": salon.get("address")
        },
        "date": date,
        "current_time": current_time,
        "appointments": enriched_appointments,
        "barbers": available_barbers,
        "stats": {
            "total": len(enriched_appointments),
            "on_time": sum(1 for a in enriched_appointments if a["display_status"] == "on_time"),
            "late": sum(1 for a in enriched_appointments if a["display_status"] == "late"),
            "cancelled": sum(1 for a in enriched_appointments if a["display_status"] == "cancelled"),
            "completed": sum(1 for a in enriched_appointments if a["display_status"] == "completed")
        }
    }

# =============================================================================
# PREMIUM SERVICES (Drinks & Snacks for Premium Reservations)
# =============================================================================

@api_router.post("/salons/{salon_id}/premium-services", response_model=PremiumServiceResponse)
async def create_premium_service(
    salon_id: str,
    service: PremiumServiceCreate,
    user: UserBase = Depends(require_salon_owner)
):
    """Add a premium service (drink/snack) to a salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    service_id = f"premium_{uuid.uuid4().hex[:12]}"
    service_doc = {
        "service_id": service_id,
        "salon_id": salon_id,
        "name": service.name,
        "description": service.description,
        "category": service.category,
        "image_url": service.image_url,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.premium_services.insert_one(service_doc)
    return PremiumServiceResponse(**{k: v for k, v in service_doc.items() if k != "_id" and k != "created_at"})

@api_router.get("/salons/{salon_id}/premium-services")
async def get_premium_services(salon_id: str, active_only: bool = True):
    """Get premium services for a salon"""
    query = {"salon_id": salon_id}
    if active_only:
        query["is_active"] = True
    
    services = await db.premium_services.find(query, {"_id": 0}).to_list(100)
    
    # Group by category
    drinks = [s for s in services if s.get("category") == "drink"]
    snacks = [s for s in services if s.get("category") == "snack"]
    
    return {
        "services": services,
        "drinks": drinks,
        "snacks": snacks,
        "has_premium": len(services) > 0
    }

@api_router.put("/salons/{salon_id}/premium-services/{service_id}")
async def update_premium_service(
    salon_id: str,
    service_id: str,
    request: Request,
    user: UserBase = Depends(require_salon_owner)
):
    """Update a premium service"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    body = await request.json()
    allowed_fields = ["name", "description", "category", "image_url", "is_active"]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    await db.premium_services.update_one(
        {"service_id": service_id, "salon_id": salon_id},
        {"$set": update_data}
    )
    return {"message": "Service mis a jour"}

@api_router.delete("/salons/{salon_id}/premium-services/{service_id}")
async def delete_premium_service(
    salon_id: str,
    service_id: str,
    user: UserBase = Depends(require_salon_owner)
):
    """Delete a premium service"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    await db.premium_services.delete_one({"service_id": service_id, "salon_id": salon_id})
    return {"message": "Service supprime"}

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
        "email": barber.email,
        "phone": barber.phone,
        "phone_visible": barber.phone_visible,
        "phone_hidden_by_admin": False,
        "specialties": barber.specialties,
        "specialty": barber.specialties[0] if barber.specialties else None,
        "expertise": barber.expertise,
        "bio": barber.bio,
        "image_url": barber.image_url or barber.photo_url,
        "photo_url": barber.photo_url or barber.image_url,
        "experience_years": 0,
        "rating": 0.0,
        "total_reviews": 0,
        "is_active": True,
        "is_available": True,
        "role": barber.role,
        "availability_schedule": {
            "monday": {"start": "09:00", "end": "18:00", "active": True},
            "tuesday": {"start": "09:00", "end": "18:00", "active": True},
            "wednesday": {"start": "09:00", "end": "18:00", "active": True},
            "thursday": {"start": "09:00", "end": "18:00", "active": True},
            "friday": {"start": "09:00", "end": "18:00", "active": True},
            "saturday": {"start": "09:00", "end": "17:00", "active": True},
            "sunday": {"start": "00:00", "end": "00:00", "active": False}
        },
        "unavailable_reason": None,
        "redirect_to_barber_id": None,
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
    allowed_fields = ["name", "email", "phone", "phone_visible", "specialties", "expertise", "bio", "image_url", "photo_url", "is_active", "role", "experience_years"]
    
    # Only admin can set phone_hidden_by_admin
    if user.role == "founder":
        allowed_fields.append("phone_hidden_by_admin")
    
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    await db.barbers.update_one({"barber_id": barber_id}, {"$set": update_data})
    return {"message": "Barber updated"}

@api_router.delete("/barbers/{barber_id}")
async def delete_barber(barber_id: str, user: UserBase = Depends(require_salon_owner)):
    """Delete (deactivate) barber"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Coiffeur non trouve")
    
    if user.role != "founder" and user.salon_id != barber["salon_id"]:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    await db.barbers.update_one({"barber_id": barber_id}, {"$set": {"is_active": False}})
    return {"message": "Coiffeur supprime"}

@api_router.put("/barbers/{barber_id}/availability")
async def update_barber_availability(
    barber_id: str, 
    availability: BarberAvailabilityUpdate, 
    user: UserBase = Depends(require_auth)
):
    """Update barber availability (salon owner or barber themselves)"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Coiffeur non trouve")
    
    # Check permission: founder, salon owner, or the barber themselves
    is_owner = user.role == "founder" or (user.role == "salon_owner" and user.salon_id == barber["salon_id"])
    is_self = barber.get("email") == user.email
    
    if not is_owner and not is_self:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    update_data = {
        "is_available": availability.is_available,
        "unavailable_reason": availability.unavailable_reason if not availability.is_available else None,
        "redirect_to_barber_id": availability.redirect_to_barber_id if not availability.is_available else None
    }
    
    await db.barbers.update_one({"barber_id": barber_id}, {"$set": update_data})
    
    # Notify salon owner if barber sets themselves unavailable
    if not availability.is_available and is_self and not is_owner:
        salon = await db.salons.find_one({"salon_id": barber["salon_id"]}, {"_id": 0})
        if salon and salon.get("owner_id"):
            await create_notification(
                user_id=salon["owner_id"],
                notification_type="barber_unavailable",
                title="Coiffeur indisponible",
                message=f"{barber.get('name')} s'est mis indisponible. Raison: {availability.unavailable_reason or 'Non specifiee'}",
                data={"barber_id": barber_id, "salon_id": barber["salon_id"]}
            )
    
    return {"message": "Disponibilite mise a jour"}

@api_router.put("/barbers/{barber_id}/schedule")
async def update_barber_schedule(
    barber_id: str, 
    schedule: BarberScheduleUpdate, 
    user: UserBase = Depends(require_salon_owner)
):
    """Update barber's weekly schedule (salon owner only)"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Coiffeur non trouve")
    
    if user.role != "founder" and user.salon_id != barber["salon_id"]:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    await db.barbers.update_one(
        {"barber_id": barber_id}, 
        {"$set": {"availability_schedule": schedule.availability_schedule}}
    )
    return {"message": "Horaires mis a jour"}

@api_router.get("/barbers/{barber_id}")
async def get_barber(barber_id: str):
    """Get barber details"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Coiffeur non trouve")
    
    if isinstance(barber.get("created_at"), str):
        barber["created_at"] = datetime.fromisoformat(barber["created_at"])
    
    return BarberResponse(**barber)

@api_router.get("/salons/{salon_id}/available-barbers")
async def get_available_barbers(salon_id: str):
    """Get only available barbers for a salon"""
    barbers = await db.barbers.find({
        "salon_id": salon_id, 
        "is_active": True,
        "is_available": True
    }, {"_id": 0}).to_list(100)
    
    for b in barbers:
        if isinstance(b.get("created_at"), str):
            b["created_at"] = datetime.fromisoformat(b["created_at"])
    
    return [BarberResponse(**b) for b in barbers]

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
# SALON CUSTOM PRICING
# =============================================================================

@api_router.get("/salons/{salon_id}/pricing")
async def get_salon_pricing(salon_id: str):
    """Get all haircuts with salon-specific prices"""
    # Get global/base haircuts
    base_haircuts = await db.haircuts.find({
        "$or": [
            {"salon_id": {"$exists": False}, "is_active": True},
            {"salon_id": None, "is_active": True}
        ]
    }, {"_id": 0}).to_list(100)
    
    # Get salon's custom prices
    custom_prices = await db.salon_prices.find({"salon_id": salon_id}, {"_id": 0}).to_list(100)
    custom_prices_map = {cp["haircut_id"]: cp for cp in custom_prices}
    
    # Merge base haircuts with custom prices
    pricing = []
    for haircut in base_haircuts:
        haircut_id = haircut["haircut_id"]
        custom = custom_prices_map.get(haircut_id, {})
        
        pricing.append({
            "haircut_id": haircut_id,
            "name": haircut["name"],
            "description": haircut.get("description"),
            "category": haircut.get("category", "classic"),
            "duration_minutes": haircut.get("duration_minutes", 30),
            "image_url": haircut.get("image_url"),
            "base_price": haircut["price"],
            "salon_price": custom.get("price", haircut["price"]),
            "is_available": custom.get("is_available", True),
            "has_custom_price": haircut_id in custom_prices_map
        })
    
    # Get salon's own haircuts
    salon_haircuts = await db.haircuts.find({
        "salon_id": salon_id, "is_active": True
    }, {"_id": 0}).to_list(100)
    
    for haircut in salon_haircuts:
        pricing.append({
            "haircut_id": haircut["haircut_id"],
            "name": haircut["name"],
            "description": haircut.get("description"),
            "category": haircut.get("category", "classic"),
            "duration_minutes": haircut.get("duration_minutes", 30),
            "image_url": haircut.get("image_url"),
            "base_price": haircut["price"],
            "salon_price": haircut["price"],
            "is_available": True,
            "has_custom_price": False,
            "is_salon_specific": True
        })
    
    return {
        "salon_id": salon_id,
        "pricing": pricing
    }

@api_router.put("/salons/{salon_id}/pricing")
async def update_salon_pricing(
    salon_id: str, 
    pricing_update: SalonPricingUpdate,
    user: UserBase = Depends(require_salon_owner)
):
    """Update salon-specific prices for haircuts"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    # Update or insert each price
    for price_item in pricing_update.prices:
        await db.salon_prices.update_one(
            {"salon_id": salon_id, "haircut_id": price_item.haircut_id},
            {"$set": {
                "salon_id": salon_id,
                "haircut_id": price_item.haircut_id,
                "price": price_item.price,
                "is_available": price_item.is_available,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    
    return {"message": f"{len(pricing_update.prices)} prix mis a jour"}

@api_router.put("/salons/{salon_id}/pricing/{haircut_id}")
async def update_single_haircut_price(
    salon_id: str,
    haircut_id: str,
    request: Request,
    user: UserBase = Depends(require_salon_owner)
):
    """Update price for a single haircut in a salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    body = await request.json()
    price = body.get("price")
    is_available = body.get("is_available", True)
    
    if price is None or price < 0:
        raise HTTPException(status_code=400, detail="Prix invalide")
    
    await db.salon_prices.update_one(
        {"salon_id": salon_id, "haircut_id": haircut_id},
        {"$set": {
            "salon_id": salon_id,
            "haircut_id": haircut_id,
            "price": price,
            "is_available": is_available,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    
    return {"message": "Prix mis a jour"}

@api_router.delete("/salons/{salon_id}/pricing/{haircut_id}")
async def reset_haircut_price(
    salon_id: str,
    haircut_id: str,
    user: UserBase = Depends(require_salon_owner)
):
    """Reset haircut price to base price (remove custom price)"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    await db.salon_prices.delete_one({"salon_id": salon_id, "haircut_id": haircut_id})
    return {"message": "Prix reinitialise au prix de base"}

@api_router.get("/salons/{salon_id}/haircuts-with-pricing")
async def get_haircuts_with_salon_pricing(salon_id: str):
    """Get haircuts with salon-specific prices for booking"""
    # Get pricing info
    pricing_response = await get_salon_pricing(salon_id)
    
    # Filter to only available haircuts
    available = [
        {
            "haircut_id": p["haircut_id"],
            "name": p["name"],
            "description": p.get("description"),
            "price": p["salon_price"],  # Use salon price
            "duration_minutes": p["duration_minutes"],
            "category": p["category"],
            "image_url": p.get("image_url")
        }
        for p in pricing_response["pricing"]
        if p["is_available"]
    ]
    
    return available

# =============================================================================
# SALON PROMOTIONS
# =============================================================================

@api_router.post("/salons/{salon_id}/promotions", response_model=PromotionResponse)
async def create_promotion(
    salon_id: str,
    promotion: PromotionCreate,
    user: UserBase = Depends(require_salon_owner)
):
    """Create a promotion for a salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    # Get haircut name if specified
    haircut_name = None
    if promotion.haircut_id:
        haircut = await db.haircuts.find_one({"haircut_id": promotion.haircut_id}, {"_id": 0})
        if haircut:
            haircut_name = haircut.get("name")
    
    promotion_id = f"promo_{uuid.uuid4().hex[:12]}"
    promotion_doc = {
        "promotion_id": promotion_id,
        "salon_id": salon_id,
        "haircut_id": promotion.haircut_id,
        "haircut_name": haircut_name,
        "name": promotion.name,
        "discount_type": promotion.discount_type,
        "discount_value": promotion.discount_value,
        "start_date": promotion.start_date,
        "end_date": promotion.end_date,
        "days_of_week": promotion.days_of_week,
        "description": promotion.description,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.promotions.insert_one(promotion_doc)
    promotion_doc["created_at"] = datetime.fromisoformat(promotion_doc["created_at"])
    return PromotionResponse(**{k: v for k, v in promotion_doc.items() if k != "_id"})

@api_router.get("/salons/{salon_id}/promotions")
async def get_salon_promotions(salon_id: str, active_only: bool = True):
    """Get promotions for a salon"""
    query = {"salon_id": salon_id}
    if active_only:
        query["is_active"] = True
        # Filter by date
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        query["start_date"] = {"$lte": today}
        query["end_date"] = {"$gte": today}
    
    promotions = await db.promotions.find(query, {"_id": 0}).to_list(100)
    
    for p in promotions:
        if isinstance(p.get("created_at"), str):
            p["created_at"] = datetime.fromisoformat(p["created_at"])
    
    return promotions

@api_router.put("/salons/{salon_id}/promotions/{promotion_id}")
async def update_promotion(
    salon_id: str,
    promotion_id: str,
    request: Request,
    user: UserBase = Depends(require_salon_owner)
):
    """Update a promotion"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    body = await request.json()
    allowed_fields = ["name", "discount_type", "discount_value", "start_date", "end_date", "days_of_week", "description", "is_active"]
    update_data = {k: v for k, v in body.items() if k in allowed_fields}
    
    await db.promotions.update_one(
        {"promotion_id": promotion_id, "salon_id": salon_id},
        {"$set": update_data}
    )
    return {"message": "Promotion mise a jour"}

@api_router.delete("/salons/{salon_id}/promotions/{promotion_id}")
async def delete_promotion(
    salon_id: str,
    promotion_id: str,
    user: UserBase = Depends(require_salon_owner)
):
    """Delete a promotion"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    await db.promotions.delete_one({"promotion_id": promotion_id, "salon_id": salon_id})
    return {"message": "Promotion supprimee"}

# Helper function to calculate promotional price
async def get_promotional_price(salon_id: str, haircut_id: str, base_price: float, date: str = None) -> dict:
    """Calculate price with any applicable promotion"""
    if not date:
        date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    day_of_week = datetime.strptime(date, "%Y-%m-%d").strftime("%A").lower()
    
    # Find applicable promotions
    promotions = await db.promotions.find({
        "salon_id": salon_id,
        "is_active": True,
        "start_date": {"$lte": date},
        "end_date": {"$gte": date},
        "$or": [
            {"haircut_id": haircut_id},
            {"haircut_id": None}  # Applies to all
        ]
    }, {"_id": 0}).to_list(10)
    
    best_discount = 0
    applied_promotion = None
    
    for promo in promotions:
        # Check if day is applicable
        if promo.get("days_of_week") and day_of_week not in promo["days_of_week"]:
            continue
        
        # Calculate discount
        if promo["discount_type"] == "percentage":
            discount = base_price * (promo["discount_value"] / 100)
        else:
            discount = promo["discount_value"]
        
        if discount > best_discount:
            best_discount = discount
            applied_promotion = promo
    
    final_price = max(0, base_price - best_discount)
    
    return {
        "original_price": base_price,
        "final_price": round(final_price, 2),
        "discount": round(best_discount, 2),
        "promotion": applied_promotion
    }

# =============================================================================
# PHOTO UPLOAD ENDPOINTS
# =============================================================================

@api_router.put("/users/me/photo")
async def update_user_photo(photo: ProfilePhotoUpdate, user: UserBase = Depends(require_auth)):
    """Update current user's profile photo"""
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"picture": photo.picture}}
    )
    return {"message": "Photo de profil mise a jour", "picture": photo.picture}

@api_router.put("/barbers/{barber_id}/photo")
async def update_barber_photo(
    barber_id: str,
    request: Request,
    user: UserBase = Depends(require_auth)
):
    """Update barber's photo (salon owner or barber themselves)"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Coiffeur non trouve")
    
    # Check permission
    is_owner = user.role in ["founder", "salon_owner"] and (user.role == "founder" or user.salon_id == barber["salon_id"])
    is_self = barber.get("email") == user.email
    
    if not is_owner and not is_self:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    body = await request.json()
    photo_url = body.get("photo_url")
    
    if not photo_url:
        raise HTTPException(status_code=400, detail="URL de photo requise")
    
    await db.barbers.update_one(
        {"barber_id": barber_id},
        {"$set": {"photo_url": photo_url, "image_url": photo_url}}
    )
    return {"message": "Photo mise a jour", "photo_url": photo_url}

@api_router.put("/salons/{salon_id}/haircuts/{haircut_id}/photo")
async def update_haircut_photo(
    salon_id: str,
    haircut_id: str,
    request: Request,
    user: UserBase = Depends(require_salon_owner)
):
    """Update haircut photo for a specific salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Acces refuse")
    
    body = await request.json()
    photo_url = body.get("photo_url")
    
    if not photo_url:
        raise HTTPException(status_code=400, detail="URL de photo requise")
    
    # Check if it's a salon-specific haircut
    haircut = await db.haircuts.find_one({"haircut_id": haircut_id, "salon_id": salon_id}, {"_id": 0})
    
    if haircut:
        # Update salon-specific haircut
        await db.haircuts.update_one(
            {"haircut_id": haircut_id, "salon_id": salon_id},
            {"$set": {"image_url": photo_url}}
        )
    else:
        # Store salon-specific photo in salon_prices
        await db.salon_prices.update_one(
            {"salon_id": salon_id, "haircut_id": haircut_id},
            {"$set": {"photo_url": photo_url}},
            upsert=True
        )
    
    return {"message": "Photo de coupe mise a jour", "photo_url": photo_url}

# =============================================================================
# APPOINTMENT ROUTES
# =============================================================================

@api_router.post("/appointments", response_model=AppointmentResponse)
async def create_appointment(appointment: AppointmentCreate, request: Request):
    """Create appointment (can be guest or authenticated)"""
    user = await get_current_user(request)
    
    # Get haircut base info
    haircut = await db.haircuts.find_one({"haircut_id": appointment.haircut_id}, {"_id": 0})
    if not haircut:
        raise HTTPException(status_code=404, detail="Haircut not found")
    
    # Check for salon-specific price
    salon_price = await db.salon_prices.find_one({
        "salon_id": appointment.salon_id, 
        "haircut_id": appointment.haircut_id
    }, {"_id": 0})
    
    # Use salon price if exists, otherwise use base price
    base_price = salon_price["price"] if salon_price else haircut["price"]
    
    # Calculate premium fee if premium reservation (+20%)
    premium_fee = 0.0
    if appointment.is_premium:
        # Check if salon offers premium services
        premium_services = await db.premium_services.find({
            "salon_id": appointment.salon_id, 
            "is_active": True
        }, {"_id": 0}).to_list(10)
        
        if not premium_services:
            raise HTTPException(
                status_code=400, 
                detail="Ce salon ne propose pas de reservation premium"
            )
        
        premium_fee = round(base_price * 0.20, 2)  # +20%
    
    final_price = base_price + premium_fee
    
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
        "base_price": base_price,
        "premium_fee": premium_fee,
        "total_price": final_price,
        "is_premium": appointment.is_premium,
        "client_notes": appointment.client_notes,
        "client_photos": appointment.client_photos,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.appointments.insert_one(appointment_doc)
    
    # Send in-app notification to salon owner
    try:
        await notify_salon_owner_new_appointment(appointment_doc)
    except Exception as e:
        logger.error(f"Failed to send notification for appointment: {e}")
    
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
        
        # Comprehensive style mapping for 30+ Afro hairstyles
        style_prompts = {
            # Fades & Dégradés
            "Taper Fade + Barbe": "professional taper fade haircut with full groomed beard, clean edges, precise lineup",
            "Low Fade + Barbe Courte": "low fade haircut with light stubble beard, sharp temple fade",
            "Skin Fade + Barbe Design": "skin fade haircut with designer beard lines, artistic patterns",
            "Drop Fade + Barbe": "drop fade haircut with full beard, curved fade line behind ear",
            "Burst Fade + Barbe": "burst fade haircut around ears with textured top and neat beard",
            "Temple Fade + Curly Top": "temple fade with natural curly afro top, defined curls",
            "Mid Fade + Boucles": "medium fade with curly textured hair on top, bouncy curls",
            
            # Afro styles
            "High Top + Bouc": "classic high top flat top fade with goatee, 90s style",
            "Afro Naturelle + Barbe": "big natural afro hairstyle with full beard, voluminous",
            "Flat Top + Barbe": "classic flat top haircut with geometric shape and neat beard",
            
            # Waves
            "360 Waves + Barbe": "perfect 360 waves pattern haircut with groomed beard, durag waves",
            
            # Shorts
            "Buzz Cut + Barbe Épaisse": "clean buzz cut with thick full beard, military style",
            "Crâne Rasé + Barbe Pleine": "bald shaved head with luxurious full beard",
            
            # Braids & Tresses
            "Cornrows + Barbe": "neat cornrow braids with clean beard, scalp showing",
            "Tresses Fulani + Barbe": "Fulani braids with beads and accessories, tribal style",
            "Box Braids + Barbe": "medium box braids with neat beard",
            
            # Locks
            "Dreads Courts + Barbe": "short dreadlocks with thick beard, starter locs",
            "Dreads Longs + Barbe": "long flowing dreadlocks with groomed beard",
            "Freeform Locs + Barbe": "freeform natural dreadlocks with rugged beard",
            
            # Natural
            "Two Strand Twists + Barbe": "two strand twist hairstyle with trimmed beard",
            "Twist Out + Barbe": "twist out defined curls with neat beard",
            "Finger Coils + Barbe": "defined finger coils natural hair with beard",
            "Taper Naturel + Barbe Fine": "natural hair taper cut with thin beard",
            
            # Trendy
            "Edgar Cut + Barbe": "edgar cut with straight fringe line and light beard",
            "Texture Crop + Barbe": "textured crop haircut with shadow beard",
            "Mohawk Fade + Barbe": "mohawk fade hairstyle with full beard, punk style",
            "Frohawk + Bouc": "frohawk natural mohawk with goatee",
            
            # Classic
            "Raie sur le Côté + Barbe": "classic side part haircut with groomed beard",
            "Comb Over + Barbe": "sleek comb over hairstyle with well-maintained beard",
            
            # Long
            "Man Bun + Barbe": "man bun hairstyle with full thick beard, tied back"
        }
        
        # Get style description or use the provided style name
        style_description = style_prompts.get(haircut_style, haircut_style)
        
        prompt = f"""Professional barber shop portrait photo of a handsome young African man with perfect {style_description}. 
The hairstyle is precisely executed with clean sharp lines and expert technique. 
High-end barbershop quality, studio lighting, front facing portrait, neutral gray background.
Photorealistic, detailed hair texture, professional grooming, magazine quality."""
        
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
# ADVANCED ANALYTICS ENDPOINTS
# =============================================================================

@api_router.get("/analytics/salon/{salon_id}")
async def get_salon_analytics(
    salon_id: str,
    days: int = 7,
    user: UserBase = Depends(require_salon_owner)
):
    """Get detailed analytics for a salon with time series data"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Limit to 6 months max
    if days > 180:
        days = 180
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_date_str = start_date.isoformat()
    
    # Get all appointments in range
    appointments = await db.appointments.find({
        "salon_id": salon_id,
        "created_at": {"$gte": start_date_str}
    }, {"_id": 0}).to_list(10000)
    
    # Build daily breakdown
    daily_data = {}
    for i in range(days):
        day = (datetime.now(timezone.utc) - timedelta(days=days-1-i)).strftime("%Y-%m-%d")
        daily_data[day] = {"date": day, "bookings": 0, "revenue": 0, "completed": 0, "cancelled": 0}
    
    # Aggregate by day
    for apt in appointments:
        apt_date = apt.get("created_at", "")[:10]
        if apt_date in daily_data:
            daily_data[apt_date]["bookings"] += 1
            if apt.get("status") == "completed":
                daily_data[apt_date]["completed"] += 1
                daily_data[apt_date]["revenue"] += apt.get("total_price", 0)
            elif apt.get("status") == "cancelled":
                daily_data[apt_date]["cancelled"] += 1
    
    # Top barbers
    barber_stats = {}
    for apt in appointments:
        bid = apt.get("barber_id")
        if bid:
            if bid not in barber_stats:
                barber_stats[bid] = {"barber_id": bid, "bookings": 0, "revenue": 0, "name": apt.get("barber_name", "Inconnu")}
            barber_stats[bid]["bookings"] += 1
            if apt.get("status") == "completed":
                barber_stats[bid]["revenue"] += apt.get("total_price", 0)
    
    top_barbers = sorted(barber_stats.values(), key=lambda x: x["bookings"], reverse=True)[:5]
    
    # Top haircuts
    haircut_stats = {}
    for apt in appointments:
        hid = apt.get("haircut_id")
        if hid:
            if hid not in haircut_stats:
                haircut_stats[hid] = {"haircut_id": hid, "count": 0, "name": apt.get("haircut_name", "Inconnu")}
            haircut_stats[hid]["count"] += 1
    
    top_haircuts = sorted(haircut_stats.values(), key=lambda x: x["count"], reverse=True)[:5]
    
    # Time slots popularity (by hour)
    hour_stats = {str(h).zfill(2): 0 for h in range(8, 21)}
    for apt in appointments:
        time_slot = apt.get("time_slot", "")
        if time_slot:
            hour = time_slot[:2]
            if hour in hour_stats:
                hour_stats[hour] += 1
    
    # Summary stats
    total_bookings = len(appointments)
    total_revenue = sum(a.get("total_price", 0) for a in appointments if a.get("status") == "completed")
    completed = sum(1 for a in appointments if a.get("status") == "completed")
    cancelled = sum(1 for a in appointments if a.get("status") == "cancelled")
    avg_booking_value = total_revenue / completed if completed > 0 else 0
    
    return {
        "period_days": days,
        "summary": {
            "total_bookings": total_bookings,
            "total_revenue": round(total_revenue, 2),
            "completed": completed,
            "cancelled": cancelled,
            "completion_rate": round((completed / total_bookings * 100) if total_bookings > 0 else 0, 1),
            "avg_booking_value": round(avg_booking_value, 2)
        },
        "daily_data": list(daily_data.values()),
        "top_barbers": top_barbers,
        "top_haircuts": top_haircuts,
        "hourly_distribution": [{"hour": f"{h}:00", "count": hour_stats[h]} for h in hour_stats]
    }

@api_router.get("/analytics/founder")
async def get_founder_analytics(
    days: int = 7,
    founder: UserBase = Depends(require_founder)
):
    """Get global platform analytics for founder"""
    # Limit to 6 months max
    if days > 180:
        days = 180
    
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    start_date_str = start_date.isoformat()
    
    # Get all appointments in range
    appointments = await db.appointments.find({
        "created_at": {"$gte": start_date_str}
    }, {"_id": 0}).to_list(50000)
    
    # Build daily breakdown
    daily_data = {}
    for i in range(days):
        day = (datetime.now(timezone.utc) - timedelta(days=days-1-i)).strftime("%Y-%m-%d")
        daily_data[day] = {"date": day, "bookings": 0, "revenue": 0, "new_users": 0}
    
    # Aggregate bookings by day
    for apt in appointments:
        apt_date = apt.get("created_at", "")[:10]
        if apt_date in daily_data:
            daily_data[apt_date]["bookings"] += 1
            if apt.get("status") == "completed":
                daily_data[apt_date]["revenue"] += apt.get("total_price", 0)
    
    # Count new users per day
    users = await db.users.find({
        "created_at": {"$gte": start_date_str}
    }, {"_id": 0, "created_at": 1}).to_list(10000)
    
    for user in users:
        user_date = user.get("created_at", "")[:10]
        if user_date in daily_data:
            daily_data[user_date]["new_users"] += 1
    
    # Top 10 salons by bookings
    salon_stats = {}
    for apt in appointments:
        sid = apt.get("salon_id")
        if sid:
            if sid not in salon_stats:
                salon_stats[sid] = {"salon_id": sid, "bookings": 0, "revenue": 0, "name": apt.get("salon_name", "Inconnu")}
            salon_stats[sid]["bookings"] += 1
            if apt.get("status") == "completed":
                salon_stats[sid]["revenue"] += apt.get("total_price", 0)
    
    top_salons = sorted(salon_stats.values(), key=lambda x: x["bookings"], reverse=True)[:10]
    
    # Country distribution
    salons = await db.salons.find({"is_active": True}, {"_id": 0, "country": 1}).to_list(1000)
    country_stats = {}
    for s in salons:
        country = s.get("country", "Inconnu")
        country_stats[country] = country_stats.get(country, 0) + 1
    
    country_distribution = [{"country": k, "count": v} for k, v in sorted(country_stats.items(), key=lambda x: x[1], reverse=True)]
    
    # Summary stats
    total_bookings = len(appointments)
    total_revenue = sum(a.get("total_price", 0) for a in appointments if a.get("status") == "completed")
    total_new_users = len(users)
    total_salons = await db.salons.count_documents({"is_active": True})
    
    return {
        "period_days": days,
        "summary": {
            "total_bookings": total_bookings,
            "total_revenue": round(total_revenue, 2),
            "new_users": total_new_users,
            "active_salons": total_salons,
            "avg_bookings_per_day": round(total_bookings / days, 1) if days > 0 else 0
        },
        "daily_data": list(daily_data.values()),
        "top_salons": top_salons,
        "country_distribution": country_distribution
    }

# =============================================================================
# MONTHLY CUTS (COUPES DU MOIS) ROUTES
# =============================================================================

@api_router.post("/salons/{salon_id}/monthly-cuts")
async def create_monthly_cut(salon_id: str, cut: MonthlyCutCreate, user: UserBase = Depends(require_salon_owner)):
    """Create a monthly cut showcase for the salon"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    salon = await db.salons.find_one({"salon_id": salon_id}, {"_id": 0})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    
    cut_id = f"cut_{uuid.uuid4().hex[:12]}"
    cut_doc = {
        "cut_id": cut_id,
        "salon_id": salon_id,
        "salon_name": salon.get("name"),
        "title": cut.title,
        "description": cut.description,
        "image_url": cut.image_url,
        "haircut_id": cut.haircut_id,
        "month": current_month,
        "likes": 0,
        "is_featured": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Get haircut name if provided
    if cut.haircut_id:
        haircut = await db.haircuts.find_one({"haircut_id": cut.haircut_id}, {"_id": 0})
        if haircut:
            cut_doc["haircut_name"] = haircut.get("name")
    
    await db.monthly_cuts.insert_one(cut_doc)
    if "_id" in cut_doc:
        del cut_doc["_id"]
    
    return cut_doc

@api_router.get("/salons/{salon_id}/monthly-cuts")
async def get_salon_monthly_cuts(salon_id: str, month: Optional[str] = None):
    """Get monthly cuts for a specific salon"""
    query = {"salon_id": salon_id}
    if month:
        query["month"] = month
    
    cuts = await db.monthly_cuts.find(query, {"_id": 0}).sort("created_at", -1).to_list(50)
    return cuts

@api_router.get("/monthly-cuts/featured")
async def get_featured_monthly_cuts(limit: int = 20):
    """Get featured monthly cuts for the landing page carousel"""
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    
    # Get cuts from current and last month
    cuts = await db.monthly_cuts.find(
        {"month": {"$gte": (datetime.now(timezone.utc) - timedelta(days=60)).strftime("%Y-%m")}},
        {"_id": 0}
    ).sort([("likes", -1), ("created_at", -1)]).to_list(limit)
    
    return cuts

@api_router.post("/monthly-cuts/{cut_id}/like")
async def like_monthly_cut(cut_id: str):
    """Like a monthly cut"""
    result = await db.monthly_cuts.update_one(
        {"cut_id": cut_id},
        {"$inc": {"likes": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cut not found")
    return {"success": True}

@api_router.delete("/monthly-cuts/{cut_id}")
async def delete_monthly_cut(cut_id: str, user: UserBase = Depends(require_salon_owner)):
    """Delete a monthly cut"""
    cut = await db.monthly_cuts.find_one({"cut_id": cut_id}, {"_id": 0})
    if not cut:
        raise HTTPException(status_code=404, detail="Cut not found")
    
    if user.role != "founder" and user.salon_id != cut.get("salon_id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.monthly_cuts.delete_one({"cut_id": cut_id})
    return {"success": True}

# =============================================================================
# LOYALTY PROGRAM ROUTES
# =============================================================================

def generate_loyalty_qr(user_id: str, salon_id: str, card_id: str) -> str:
    """Generate QR code for loyalty card"""
    qr_data = f"AFROCROWN_LOYALTY:{card_id}:{user_id}:{salon_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#6366f1", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return f"data:image/png;base64,{base64.b64encode(buffer.getvalue()).decode()}"

@api_router.get("/loyalty/my-cards")
async def get_my_loyalty_cards(user: UserBase = Depends(require_auth)):
    """Get all loyalty cards for the current user"""
    cards = await db.loyalty_cards.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    
    # Enrich with salon names
    for card in cards:
        salon = await db.salons.find_one({"salon_id": card.get("salon_id")}, {"_id": 0, "name": 1})
        card["salon_name"] = salon.get("name") if salon else "Unknown"
    
    return cards

@api_router.get("/loyalty/card/{salon_id}")
async def get_or_create_loyalty_card(salon_id: str, user: UserBase = Depends(require_auth)):
    """Get or create a loyalty card for a salon"""
    # Check if card exists
    card = await db.loyalty_cards.find_one(
        {"user_id": user.user_id, "salon_id": salon_id},
        {"_id": 0}
    )
    
    if not card:
        # Get salon config
        salon = await db.salons.find_one({"salon_id": salon_id}, {"_id": 0})
        if not salon:
            raise HTTPException(status_code=404, detail="Salon not found")
        
        loyalty_config = await db.salon_loyalty_config.find_one({"salon_id": salon_id}, {"_id": 0})
        max_stamps = loyalty_config.get("max_stamps", 10) if loyalty_config else 10
        
        card_id = f"loyalty_{uuid.uuid4().hex[:12]}"
        qr_code = generate_loyalty_qr(user.user_id, salon_id, card_id)
        
        card = {
            "card_id": card_id,
            "user_id": user.user_id,
            "salon_id": salon_id,
            "salon_name": salon.get("name"),
            "stamps": 0,
            "max_stamps": max_stamps,
            "rewards_earned": 0,
            "qr_code": qr_code,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.loyalty_cards.insert_one(card)
        if "_id" in card:
            del card["_id"]
    
    return card

@api_router.post("/loyalty/scan")
async def scan_loyalty_card(scan: LoyaltyScanRequest, user: UserBase = Depends(require_salon_owner)):
    """Salon scans a client's loyalty QR code to add a stamp"""
    # Parse QR code
    try:
        parts = scan.qr_code_data.split(":")
        if len(parts) != 4 or parts[0] != "AFROCROWN_LOYALTY":
            raise ValueError("Invalid QR format")
        card_id, client_user_id, salon_id = parts[1], parts[2], parts[3]
    except:
        raise HTTPException(status_code=400, detail="Invalid QR code")
    
    # Verify salon ownership
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="This QR code is for a different salon")
    
    # Get the card
    card = await db.loyalty_cards.find_one({"card_id": card_id}, {"_id": 0})
    if not card:
        raise HTTPException(status_code=404, detail="Loyalty card not found")
    
    # Get salon config
    loyalty_config = await db.salon_loyalty_config.find_one({"salon_id": salon_id}, {"_id": 0})
    max_stamps = loyalty_config.get("max_stamps", 10) if loyalty_config else 10
    reward_type = loyalty_config.get("reward_type", "free_haircut") if loyalty_config else "free_haircut"
    reward_description = loyalty_config.get("reward_description", "Coupe gratuite") if loyalty_config else "Coupe gratuite"
    
    new_stamps = card.get("stamps", 0) + 1
    reward_earned = False
    
    if new_stamps >= max_stamps:
        # Create reward
        reward_id = f"reward_{uuid.uuid4().hex[:12]}"
        reward_doc = {
            "reward_id": reward_id,
            "user_id": client_user_id,
            "salon_id": salon_id,
            "card_id": card_id,
            "reward_type": reward_type,
            "reward_description": reward_description,
            "is_redeemed": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.loyalty_rewards.insert_one(reward_doc)
        
        # Reset stamps and increment rewards earned
        new_stamps = 0
        reward_earned = True
        
        await db.loyalty_cards.update_one(
            {"card_id": card_id},
            {
                "$set": {"stamps": new_stamps, "updated_at": datetime.now(timezone.utc).isoformat()},
                "$inc": {"rewards_earned": 1}
            }
        )
        
        # Notify client
        await create_notification(
            client_user_id,
            "loyalty_reward",
            "Récompense fidélité gagnée !",
            f"Félicitations ! Vous avez gagné: {reward_description}",
            {"salon_id": salon_id, "reward_id": reward_id}
        )
    else:
        await db.loyalty_cards.update_one(
            {"card_id": card_id},
            {"$set": {"stamps": new_stamps, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    # Get client info
    client = await db.users.find_one({"user_id": client_user_id}, {"_id": 0, "name": 1, "email": 1})
    
    return {
        "success": True,
        "client_name": client.get("name") if client else "Client",
        "stamps": new_stamps,
        "max_stamps": max_stamps,
        "reward_earned": reward_earned,
        "reward_description": reward_description if reward_earned else None
    }

@api_router.get("/salons/{salon_id}/loyalty-config")
async def get_salon_loyalty_config(salon_id: str):
    """Get loyalty program configuration for a salon"""
    config = await db.salon_loyalty_config.find_one({"salon_id": salon_id}, {"_id": 0})
    if not config:
        return {
            "salon_id": salon_id,
            "max_stamps": 10,
            "reward_type": "free_haircut",
            "reward_description": "Coupe gratuite",
            "is_active": True
        }
    return config

@api_router.put("/salons/{salon_id}/loyalty-config")
async def update_salon_loyalty_config(salon_id: str, config: LoyaltyRewardConfig, user: UserBase = Depends(require_salon_owner)):
    """Update loyalty program configuration"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    config_doc = {
        "salon_id": salon_id,
        "max_stamps": config.max_stamps,
        "reward_type": config.reward_type,
        "reward_description": config.reward_description,
        "is_active": True,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.salon_loyalty_config.update_one(
        {"salon_id": salon_id},
        {"$set": config_doc},
        upsert=True
    )
    
    return config_doc

@api_router.get("/loyalty/rewards")
async def get_my_rewards(user: UserBase = Depends(require_auth)):
    """Get all rewards for the current user"""
    rewards = await db.loyalty_rewards.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    
    # Enrich with salon names
    for reward in rewards:
        salon = await db.salons.find_one({"salon_id": reward.get("salon_id")}, {"_id": 0, "name": 1})
        reward["salon_name"] = salon.get("name") if salon else "Unknown"
    
    return rewards

@api_router.post("/loyalty/redeem/{reward_id}")
async def redeem_reward(reward_id: str, user: UserBase = Depends(require_salon_owner)):
    """Salon redeems a client's reward"""
    reward = await db.loyalty_rewards.find_one({"reward_id": reward_id}, {"_id": 0})
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")
    
    if reward.get("is_redeemed"):
        raise HTTPException(status_code=400, detail="Reward already redeemed")
    
    if user.role != "founder" and user.salon_id != reward.get("salon_id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.loyalty_rewards.update_one(
        {"reward_id": reward_id},
        {"$set": {"is_redeemed": True, "redeemed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Reward redeemed successfully"}

# =============================================================================
# ENHANCED GAMIFICATION & ENGAGEMENT ROUTES
# =============================================================================

# VIP Tiers configuration
VIP_TIERS = [
    {"tier": "bronze", "min_points": 0, "discount_percent": 0, "benefits": ["Accès programme fidélité"]},
    {"tier": "silver", "min_points": 500, "discount_percent": 5, "benefits": ["5% réduction", "Réservation prioritaire"]},
    {"tier": "gold", "min_points": 1500, "discount_percent": 10, "benefits": ["10% réduction", "Coupe gratuite/an", "Accès VIP TrimConnect"]},
    {"tier": "platinum", "min_points": 5000, "discount_percent": 15, "benefits": ["15% réduction", "2 coupes gratuites/an", "Badge exclusif", "Support prioritaire"]}
]

# Salon badges configuration
SALON_BADGES = [
    {"badge_id": "starter", "name": "Nouveau Partenaire", "icon": "🌱", "criteria_type": "bookings", "criteria_value": 1, "tier": "bronze"},
    {"badge_id": "rising_star", "name": "Étoile Montante", "icon": "⭐", "criteria_type": "bookings", "criteria_value": 50, "tier": "bronze"},
    {"badge_id": "popular", "name": "Salon Populaire", "icon": "🔥", "criteria_type": "bookings", "criteria_value": 200, "tier": "silver"},
    {"badge_id": "top_rated", "name": "Excellence", "icon": "🏆", "criteria_type": "rating", "criteria_value": 45, "tier": "silver"},  # 4.5+ rating
    {"badge_id": "revenue_master", "name": "Maître des Revenus", "icon": "💎", "criteria_type": "revenue", "criteria_value": 10000, "tier": "gold"},
    {"badge_id": "loyal_base", "name": "Fidélité Exemplaire", "icon": "❤️", "criteria_type": "retention", "criteria_value": 70, "tier": "gold"},  # 70%+ retention
    {"badge_id": "elite", "name": "Salon Élite", "icon": "👑", "criteria_type": "bookings", "criteria_value": 1000, "tier": "platinum"},
]

@api_router.get("/client/profile/enhanced")
async def get_enhanced_client_profile(user: UserBase = Depends(require_auth)):
    """Get enhanced client profile with VIP status, points, and badges"""
    
    # Get or create client profile
    profile = await db.client_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    if not profile:
        profile = {
            "user_id": user.user_id,
            "total_points": 0,
            "lifetime_points": 0,
            "vip_tier": "bronze",
            "total_bookings": 0,
            "referral_code": f"AFRO{user.user_id[:8].upper()}",
            "referrals_count": 0,
            "notification_preferences": {
                "email_marketing": True,
                "email_reminders": True,
                "push_promotions": True,
                "push_reminders": True,
                "max_messages_per_week": 3,
                "quiet_hours_start": "22:00",
                "quiet_hours_end": "08:00"
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.client_profiles.insert_one(profile)
    
    # Calculate VIP tier
    lifetime_points = profile.get("lifetime_points", 0)
    vip_tier = "bronze"
    for tier in reversed(VIP_TIERS):
        if lifetime_points >= tier["min_points"]:
            vip_tier = tier["tier"]
            break
    
    # Get current tier benefits
    tier_info = next((t for t in VIP_TIERS if t["tier"] == vip_tier), VIP_TIERS[0])
    next_tier = None
    for i, t in enumerate(VIP_TIERS):
        if t["tier"] == vip_tier and i < len(VIP_TIERS) - 1:
            next_tier = VIP_TIERS[i + 1]
            break
    
    return {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "total_points": profile.get("total_points", 0),
        "lifetime_points": lifetime_points,
        "vip_tier": vip_tier,
        "tier_benefits": tier_info["benefits"],
        "discount_percent": tier_info["discount_percent"],
        "next_tier": next_tier["tier"] if next_tier else None,
        "points_to_next_tier": (next_tier["min_points"] - lifetime_points) if next_tier else 0,
        "total_bookings": profile.get("total_bookings", 0),
        "referral_code": profile.get("referral_code"),
        "referrals_count": profile.get("referrals_count", 0),
        "notification_preferences": profile.get("notification_preferences", {})
    }

@api_router.put("/client/notification-preferences")
async def update_notification_preferences(preferences: NotificationPreferences, user: UserBase = Depends(require_auth)):
    """Update client notification preferences (anti-spam settings)"""
    await db.client_profiles.update_one(
        {"user_id": user.user_id},
        {"$set": {"notification_preferences": preferences.dict()}},
        upsert=True
    )
    return {"success": True, "message": "Préférences mises à jour"}

@api_router.post("/client/referral/apply")
async def apply_referral_code(code: str, user: UserBase = Depends(require_auth)):
    """Apply a referral code to earn points"""
    # Find referrer
    referrer_profile = await db.client_profiles.find_one({"referral_code": code.upper()}, {"_id": 0})
    if not referrer_profile:
        raise HTTPException(status_code=404, detail="Code de parrainage invalide")
    
    if referrer_profile["user_id"] == user.user_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas utiliser votre propre code")
    
    # Check if already used referral
    existing = await db.referral_uses.find_one({"user_id": user.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Vous avez déjà utilisé un code de parrainage")
    
    # Award points to both
    reward_points = 100
    now = datetime.now(timezone.utc).isoformat()
    
    # Record referral use
    await db.referral_uses.insert_one({
        "user_id": user.user_id,
        "referrer_id": referrer_profile["user_id"],
        "code": code.upper(),
        "created_at": now
    })
    
    # Award points to new user
    await db.client_profiles.update_one(
        {"user_id": user.user_id},
        {"$inc": {"total_points": reward_points, "lifetime_points": reward_points}},
        upsert=True
    )
    
    # Award points to referrer
    await db.client_profiles.update_one(
        {"user_id": referrer_profile["user_id"]},
        {"$inc": {"total_points": reward_points, "lifetime_points": reward_points, "referrals_count": 1}}
    )
    
    return {"success": True, "points_earned": reward_points, "message": f"Vous avez gagné {reward_points} points!"}

@api_router.get("/client/points-history")
async def get_points_history(user: UserBase = Depends(require_auth), limit: int = 20):
    """Get client's points transaction history"""
    transactions = await db.points_transactions.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return transactions

@api_router.get("/salon/{salon_id}/badges")
async def get_salon_badges(salon_id: str):
    """Get badges earned by a salon"""
    salon = await db.salons.find_one({"salon_id": salon_id}, {"_id": 0})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon non trouvé")
    
    # Calculate salon stats
    total_bookings = await db.appointments.count_documents({"salon_id": salon_id})
    completed_bookings = await db.appointments.count_documents({"salon_id": salon_id, "status": "completed"})
    
    # Calculate revenue
    revenue_agg = await db.appointments.aggregate([
        {"$match": {"salon_id": salon_id, "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]).to_list(1)
    total_revenue = revenue_agg[0]["total"] if revenue_agg else 0
    
    # Get rating
    avg_rating = salon.get("rating", 0) * 10  # Convert to scale for comparison
    
    # Calculate retention (returning clients)
    retention_rate = 0
    if completed_bookings > 0:
        unique_clients = await db.appointments.distinct("client_id", {"salon_id": salon_id, "status": "completed"})
        repeat_clients = 0
        for client_id in unique_clients:
            count = await db.appointments.count_documents({"salon_id": salon_id, "client_id": client_id, "status": "completed"})
            if count > 1:
                repeat_clients += 1
        retention_rate = int((repeat_clients / len(unique_clients)) * 100) if unique_clients else 0
    
    # Determine earned badges
    earned_badges = []
    for badge in SALON_BADGES:
        earned = False
        if badge["criteria_type"] == "bookings" and total_bookings >= badge["criteria_value"]:
            earned = True
        elif badge["criteria_type"] == "revenue" and total_revenue >= badge["criteria_value"]:
            earned = True
        elif badge["criteria_type"] == "rating" and avg_rating >= badge["criteria_value"]:
            earned = True
        elif badge["criteria_type"] == "retention" and retention_rate >= badge["criteria_value"]:
            earned = True
        
        if earned:
            earned_badges.append({
                "badge_id": badge["badge_id"],
                "name": badge["name"],
                "icon": badge["icon"],
                "tier": badge["tier"],
                "earned": True
            })
    
    # Add unearned badges for progress
    all_badges = []
    for badge in SALON_BADGES:
        is_earned = any(b["badge_id"] == badge["badge_id"] for b in earned_badges)
        all_badges.append({
            "badge_id": badge["badge_id"],
            "name": badge["name"],
            "icon": badge["icon"],
            "tier": badge["tier"],
            "criteria_type": badge["criteria_type"],
            "criteria_value": badge["criteria_value"],
            "earned": is_earned
        })
    
    return {
        "salon_id": salon_id,
        "stats": {
            "total_bookings": total_bookings,
            "total_revenue": total_revenue,
            "rating": salon.get("rating", 0),
            "retention_rate": retention_rate
        },
        "earned_badges": earned_badges,
        "all_badges": all_badges
    }

@api_router.post("/salon/{salon_id}/alert-settings")
async def update_salon_alerts(
    salon_id: str,
    booking_milestone: int = 100,
    revenue_milestone: int = 5000,
    user: UserBase = Depends(require_salon_owner)
):
    """Configure salon performance alerts"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.salon_alert_settings.update_one(
        {"salon_id": salon_id},
        {"$set": {
            "booking_milestone": booking_milestone,
            "revenue_milestone": revenue_milestone,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }},
        upsert=True
    )
    return {"success": True}

@api_router.get("/bookings/urgent")
async def find_urgent_bookings(
    latitude: float,
    longitude: float,
    radius_km: float = 5.0,
    user: UserBase = Depends(require_auth)
):
    """Find salons with availability within 2 hours for urgent bookings"""
    now = datetime.now(timezone.utc)
    two_hours_later = now + timedelta(hours=2)
    today = now.strftime("%Y-%m-%d")
    
    # Find nearby active salons
    salons = await db.salons.find({
        "is_active": True,
        "is_approved": True,
        "country": {"$exists": True}
    }, {"_id": 0}).to_list(500)
    
    available_salons = []
    
    for salon in salons:
        salon_id = salon["salon_id"]
        
        # Get salon's barbers
        barbers = await db.barbers.find({
            "salon_id": salon_id,
            "is_active": True,
            "is_available": True
        }, {"_id": 0}).to_list(50)
        
        if not barbers:
            continue
        
        # Check for available slots in next 2 hours
        # Generate time slots
        available_slots = []
        current_hour = now.hour
        current_minute = (now.minute // 30 + 1) * 30  # Round up to next 30 min
        
        if current_minute >= 60:
            current_hour += 1
            current_minute = 0
        
        for h in range(current_hour, min(current_hour + 3, 21)):
            for m in [0, 30]:
                if h == current_hour and m < current_minute:
                    continue
                time_slot = f"{h:02d}:{m:02d}"
                
                # Check if any barber is free
                for barber in barbers:
                    existing = await db.appointments.find_one({
                        "salon_id": salon_id,
                        "barber_id": barber["barber_id"],
                        "appointment_date": today,
                        "time_slot": time_slot,
                        "status": {"$nin": ["cancelled"]}
                    })
                    if not existing:
                        available_slots.append({
                            "time": time_slot,
                            "barber_id": barber["barber_id"],
                            "barber_name": barber["name"]
                        })
                        break
        
        if available_slots:
            available_salons.append({
                "salon_id": salon_id,
                "name": salon["name"],
                "address": salon.get("address", ""),
                "city": salon.get("city", ""),
                "rating": salon.get("rating", 0),
                "available_slots": available_slots[:3]  # Limit to 3 slots
            })
    
    return {
        "count": len(available_salons),
        "salons": available_salons[:10]  # Limit to 10 salons
    }

@api_router.get("/client/inactive-reminder")
async def check_inactive_clients(user: UserBase = Depends(require_salon_owner)):
    """Get list of inactive clients for the salon (haven't visited in 4+ weeks)"""
    salon_id = user.salon_id
    if not salon_id:
        raise HTTPException(status_code=400, detail="Salon non assigné")
    
    four_weeks_ago = (datetime.now(timezone.utc) - timedelta(weeks=4)).isoformat()
    
    # Find clients who booked but haven't returned
    pipeline = [
        {"$match": {"salon_id": salon_id, "status": "completed"}},
        {"$sort": {"created_at": -1}},
        {"$group": {
            "_id": "$client_id",
            "last_visit": {"$first": "$appointment_date"},
            "client_name": {"$first": "$client_name"},
            "client_email": {"$first": "$client_email"},
            "total_visits": {"$sum": 1}
        }},
        {"$match": {"last_visit": {"$lt": four_weeks_ago[:10]}}},
        {"$limit": 50}
    ]
    
    inactive_clients = await db.appointments.aggregate(pipeline).to_list(50)
    
    return {
        "count": len(inactive_clients),
        "clients": inactive_clients
    }

@api_router.post("/client/{client_id}/send-reminder")
async def send_client_reminder(
    client_id: str,
    message_type: str = "comeback",  # comeback, promotion, new_service
    user: UserBase = Depends(require_salon_owner)
):
    """Send a reminder to an inactive client (with throttling)"""
    salon_id = user.salon_id
    if not salon_id:
        raise HTTPException(status_code=400, detail="Salon non assigné")
    
    # Check throttling - max 1 reminder per client per week
    one_week_ago = (datetime.now(timezone.utc) - timedelta(weeks=1)).isoformat()
    recent_reminder = await db.client_reminders.find_one({
        "client_id": client_id,
        "salon_id": salon_id,
        "created_at": {"$gte": one_week_ago}
    })
    
    if recent_reminder:
        raise HTTPException(status_code=429, detail="Un rappel a déjà été envoyé cette semaine")
    
    # Get client notification preferences
    client_profile = await db.client_profiles.find_one({"user_id": client_id}, {"_id": 0})
    prefs = client_profile.get("notification_preferences", {}) if client_profile else {}
    
    # Check if client accepts marketing
    if not prefs.get("email_marketing", True):
        raise HTTPException(status_code=400, detail="Ce client a désactivé les messages marketing")
    
    # Check weekly limit for this client
    messages_this_week = await db.client_reminders.count_documents({
        "client_id": client_id,
        "created_at": {"$gte": one_week_ago}
    })
    max_messages = prefs.get("max_messages_per_week", 3)
    
    if messages_this_week >= max_messages:
        raise HTTPException(status_code=429, detail=f"Limite de {max_messages} messages/semaine atteinte pour ce client")
    
    # Record the reminder (actual sending would be via email service)
    await db.client_reminders.insert_one({
        "reminder_id": f"rem_{uuid.uuid4().hex[:12]}",
        "client_id": client_id,
        "salon_id": salon_id,
        "message_type": message_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Rappel programmé"}

# =============================================================================
# SALON LOCATION & SEARCH ROUTES
# =============================================================================

@api_router.put("/salons/{salon_id}/location")
async def update_salon_location(salon_id: str, location: SalonLocationUpdate, user: UserBase = Depends(require_salon_owner)):
    """Update salon location details"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {
        "country": location.country,
        "city": location.city,
        "address": location.address,
        "postal_code": location.postal_code,
        "location": {
            "type": "Point",
            "coordinates": [location.longitude or 0, location.latitude or 0]
        } if location.latitude and location.longitude else None
    }
    
    # Remove None values
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    await db.salons.update_one(
        {"salon_id": salon_id},
        {"$set": update_data}
    )
    
    return {"success": True}

# =============================================================================
# BARBER CLIENT REASSIGNMENT
# =============================================================================

class ReassignClientRequest(BaseModel):
    new_barber_id: str
    reason: Optional[str] = None

@api_router.post("/appointments/{appointment_id}/reassign")
async def reassign_appointment(appointment_id: str, reassign: ReassignClientRequest, user: UserBase = Depends(require_salon_owner)):
    """Reassign an appointment to a different barber"""
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if user.role != "founder" and user.salon_id != appointment.get("salon_id"):
        raise HTTPException(status_code=403, detail="Access denied")
    
    new_barber = await db.barbers.find_one({"barber_id": reassign.new_barber_id}, {"_id": 0})
    if not new_barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    if not new_barber.get("is_available", True):
        raise HTTPException(status_code=400, detail="Ce coiffeur n'est pas disponible")
    
    old_barber_id = appointment.get("barber_id")
    old_barber = await db.barbers.find_one({"barber_id": old_barber_id}, {"_id": 0, "name": 1})
    
    await db.appointments.update_one(
        {"appointment_id": appointment_id},
        {"$set": {
            "barber_id": reassign.new_barber_id,
            "barber_name": new_barber.get("name"),
            "reassigned_from": old_barber_id,
            "reassign_reason": reassign.reason,
            "reassigned_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if appointment.get("user_id"):
        await create_notification(
            appointment["user_id"],
            "appointment_reassigned",
            "Changement de coiffeur",
            f"Votre RDV a ete reassigne de {old_barber.get('name', 'Unknown')} a {new_barber.get('name')}",
            {"appointment_id": appointment_id, "reason": reassign.reason}
        )
    
    return {"success": True, "new_barber": new_barber.get("name")}

@api_router.get("/barbers/{barber_id}/available-colleagues")
async def get_available_colleagues(barber_id: str, user: UserBase = Depends(require_salon_owner)):
    """Get available barbers in the same salon for reassignment"""
    barber = await db.barbers.find_one({"barber_id": barber_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    
    colleagues = await db.barbers.find({
        "salon_id": barber.get("salon_id"),
        "barber_id": {"$ne": barber_id},
        "is_available": True
    }, {"_id": 0}).to_list(50)
    
    return colleagues

# =============================================================================
# QR CODE APPOINTMENT CONFIRMATION
# =============================================================================

@api_router.post("/appointments/scan-qr")
async def scan_appointment_qr(qr_data: dict, user: UserBase = Depends(require_salon_owner)):
    """Scan a client's appointment QR code to confirm arrival/completion"""
    qr_code = qr_data.get("qr_code", "")
    action = qr_data.get("action", "confirm")
    
    if not qr_code.startswith("AFROCROWN:"):
        raise HTTPException(status_code=400, detail="QR code invalide")
    
    appointment_id = qr_code.replace("AFROCROWN:", "")
    
    appointment = await db.appointments.find_one({"appointment_id": appointment_id}, {"_id": 0})
    if not appointment:
        raise HTTPException(status_code=404, detail="Rendez-vous non trouve")
    
    if user.role != "founder" and user.salon_id != appointment.get("salon_id"):
        raise HTTPException(status_code=403, detail="Ce RDV appartient a un autre salon")
    
    client = await db.users.find_one({"user_id": appointment.get("user_id")}, {"_id": 0, "name": 1, "email": 1, "profile_photo_url": 1})
    
    update_data = {"qr_scanned_at": datetime.now(timezone.utc).isoformat()}
    
    if action == "confirm":
        update_data["arrival_status"] = "arrived"
        update_data["status"] = "confirmed"
        message = "Client arrive et confirme"
    elif action == "start":
        update_data["status"] = "in_progress"
        update_data["started_at"] = datetime.now(timezone.utc).isoformat()
        message = "Coupe commencee"
    elif action == "complete":
        update_data["status"] = "completed"
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        message = "Coupe terminee"
        if appointment.get("user_id"):
            await create_notification(
                appointment["user_id"],
                "review_request",
                "Donnez votre avis !",
                f"Votre coupe est terminee. Partagez votre experience !",
                {"appointment_id": appointment_id}
            )
    else:
        raise HTTPException(status_code=400, detail="Action invalide")
    
    await db.appointments.update_one({"appointment_id": appointment_id}, {"$set": update_data})
    
    return {
        "success": True,
        "message": message,
        "appointment": {
            "appointment_id": appointment_id,
            "client_name": client.get("name") if client else appointment.get("client_name"),
            "client_photo": client.get("profile_photo_url") if client else None,
            "haircut_name": appointment.get("haircut_name"),
            "barber_name": appointment.get("barber_name"),
            "status": update_data.get("status", appointment.get("status")),
            "date": appointment.get("date"),
            "time": appointment.get("time")
        }
    }

# =============================================================================
# SALON WEBSITE IMPORT
# =============================================================================

class SalonWebsiteImportRequest(BaseModel):
    website_url: str
    import_services: bool = True
    import_barbers: bool = True
    import_gallery: bool = True

@api_router.post("/salons/{salon_id}/import-website")
async def import_salon_website(salon_id: str, import_req: SalonWebsiteImportRequest, user: UserBase = Depends(require_salon_owner)):
    """Import data from an existing salon website"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    salon = await db.salons.find_one({"salon_id": salon_id}, {"_id": 0})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon not found")
    
    import_id = f"import_{uuid.uuid4().hex[:12]}"
    
    # Try to scrape the website
    scraped_data = {}
    try:
        import httpx
        from bs4 import BeautifulSoup
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(import_req.website_url, follow_redirects=True)
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Extract title
                title = soup.find('title')
                scraped_data['title'] = title.text.strip() if title else None
                
                # Extract description
                meta_desc = soup.find('meta', {'name': 'description'})
                scraped_data['description'] = meta_desc.get('content', '').strip() if meta_desc else None
                
                # Extract phone numbers
                import re
                phone_pattern = r'[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}'
                phones = re.findall(phone_pattern, response.text)
                scraped_data['phones'] = list(set([p.strip() for p in phones if len(p) > 8]))[:3]
                
                # Extract emails
                email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
                emails = re.findall(email_pattern, response.text)
                scraped_data['emails'] = list(set(emails))[:3]
                
                # Extract images
                images = []
                for img in soup.find_all('img', src=True)[:20]:
                    src = img['src']
                    if src.startswith('http') and not 'logo' in src.lower() and not 'icon' in src.lower():
                        images.append(src)
                scraped_data['images'] = images[:10]
                
                # Extract prices (basic pattern)
                price_pattern = r'(\d{1,3}(?:[.,]\d{2})?)\s*(?:€|EUR|euros?)'
                prices = re.findall(price_pattern, response.text, re.IGNORECASE)
                scraped_data['prices'] = [float(p.replace(',', '.')) for p in prices[:10]]
                
                # Extract service-like text
                services = []
                for heading in soup.find_all(['h2', 'h3', 'h4']):
                    text = heading.text.strip().lower()
                    if any(word in text for word in ['coupe', 'coiffure', 'barbe', 'soin', 'service', 'tarif', 'prix']):
                        services.append(heading.text.strip())
                scraped_data['services'] = services[:15]
                
                scraped_data['status'] = 'completed'
                logger.info(f"Website scraping completed for {import_req.website_url}")
    except Exception as scrape_err:
        logger.error(f"Website scraping error: {scrape_err}")
        scraped_data['status'] = 'failed'
        scraped_data['error'] = str(scrape_err)
    
    import_doc = {
        "import_id": import_id,
        "salon_id": salon_id,
        "website_url": import_req.website_url,
        "import_services": import_req.import_services,
        "import_barbers": import_req.import_barbers,
        "import_gallery": import_req.import_gallery,
        "scraped_data": scraped_data,
        "status": scraped_data.get('status', 'pending'),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.salon_imports.insert_one(import_doc)
    await db.salons.update_one({"salon_id": salon_id}, {"$set": {"external_website": import_req.website_url}})
    
    # If scraping succeeded, update salon with extracted data
    if scraped_data.get('status') == 'completed':
        update_fields = {}
        if scraped_data.get('description') and not salon.get('description'):
            update_fields['description'] = scraped_data['description']
        if scraped_data.get('phones') and not salon.get('phone'):
            update_fields['phone'] = scraped_data['phones'][0]
        
        if update_fields:
            await db.salons.update_one({"salon_id": salon_id}, {"$set": update_fields})
        
        # Create haircuts from extracted prices if services import is enabled
        if import_req.import_services and scraped_data.get('services'):
            for i, service in enumerate(scraped_data['services'][:8]):
                price = scraped_data['prices'][i] if i < len(scraped_data.get('prices', [])) else 20
                haircut_id = f"haircut_{uuid.uuid4().hex[:12]}"
                await db.haircuts.update_one(
                    {"salon_id": salon_id, "name": service},
                    {"$setOnInsert": {
                        "haircut_id": haircut_id,
                        "salon_id": salon_id,
                        "name": service,
                        "price": price,
                        "duration": 30,
                        "is_active": True,
                        "imported": True,
                        "created_at": datetime.now(timezone.utc).isoformat()
                    }},
                    upsert=True
                )
    
    return {
        "success": True,
        "import_id": import_id,
        "status": scraped_data.get('status', 'pending'),
        "message": "Import termine !" if scraped_data.get('status') == 'completed' else "Import en cours de traitement.",
        "extracted": {
            "services_found": len(scraped_data.get('services', [])),
            "images_found": len(scraped_data.get('images', [])),
            "prices_found": len(scraped_data.get('prices', []))
        } if scraped_data.get('status') == 'completed' else None
    }

# =============================================================================
# TRIMCONNECT VOTING
# =============================================================================

@api_router.post("/trimconnect/{entry_id}/vote")
async def vote_trimconnect_entry(entry_id: str, user: UserBase = Depends(require_auth)):
    """Vote for a TrimConnect entry"""
    entry = await db.trimconnect_entries.find_one({"entry_id": entry_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    existing_vote = await db.trimconnect_votes.find_one({"entry_id": entry_id, "user_id": user.user_id})
    if existing_vote:
        raise HTTPException(status_code=400, detail="Vous avez deja vote pour cette participation")
    
    contest_id = entry.get("contest_id", "current")
    user_votes_count = await db.trimconnect_votes.count_documents({"user_id": user.user_id, "contest_id": contest_id})
    
    if user_votes_count >= 3:
        raise HTTPException(status_code=400, detail="Maximum 3 votes par concours")
    
    vote_id = f"vote_{uuid.uuid4().hex[:12]}"
    await db.trimconnect_votes.insert_one({
        "vote_id": vote_id,
        "entry_id": entry_id,
        "user_id": user.user_id,
        "contest_id": contest_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    await db.trimconnect_entries.update_one({"entry_id": entry_id}, {"$inc": {"votes": 1}})
    
    return {"success": True, "message": "Vote enregistre !"}

@api_router.delete("/trimconnect/{entry_id}/vote")
async def remove_trimconnect_vote(entry_id: str, user: UserBase = Depends(require_auth)):
    """Remove a vote"""
    result = await db.trimconnect_votes.delete_one({"entry_id": entry_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vote non trouve")
    await db.trimconnect_entries.update_one({"entry_id": entry_id}, {"$inc": {"votes": -1}})
    return {"success": True}

@api_router.get("/trimconnect/my-votes")
async def get_my_trimconnect_votes(user: UserBase = Depends(require_auth)):
    """Get entries the user has voted for"""
    votes = await db.trimconnect_votes.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return [v["entry_id"] for v in votes]

@api_router.get("/trimconnect/public-gallery")
async def get_trimconnect_public_gallery(contest_id: Optional[str] = None, limit: int = 50):
    """Get public gallery for voting"""
    query = {"is_approved": True}
    if contest_id:
        query["contest_id"] = contest_id
    
    entries = await db.trimconnect_entries.find(query, {"_id": 0}).sort([("votes", -1), ("created_at", -1)]).to_list(limit)
    
    for entry in entries:
        if entry.get("salon_id"):
            salon = await db.salons.find_one({"salon_id": entry["salon_id"]}, {"_id": 0, "name": 1})
            entry["salon_name"] = salon.get("name") if salon else None
        if entry.get("barber_id"):
            barber = await db.barbers.find_one({"barber_id": entry["barber_id"]}, {"_id": 0, "name": 1, "profile_photo_url": 1})
            entry["barber_name"] = barber.get("name") if barber else None
            entry["barber_photo"] = barber.get("profile_photo_url") if barber else None
    
    return entries

# =============================================================================
# TACTILE SCREENS
# =============================================================================

@api_router.get("/shop/tactile-screens")
async def get_tactile_screens():
    """Get available tactile screens"""
    return [
        {"product_id": "screen_basic", "name": "Ecran Basic 15\"", "price": 299.00, "features": ["Affichage RDV", "Simulation IA"], "image_url": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400"},
        {"product_id": "screen_pro", "name": "Ecran Pro 22\"", "price": 499.00, "features": ["Affichage RDV", "Simulation IA HD", "WiFi"], "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400"},
        {"product_id": "screen_premium", "name": "Ecran Premium 32\" 4K", "price": 899.00, "features": ["4K", "Borne sur pied", "Paiement CB"], "image_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400"}
    ]

@api_router.post("/shop/tactile-screens/order")
async def order_tactile_screen(order: dict, user: UserBase = Depends(require_salon_owner)):
    """Order a tactile screen"""
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    product_id = order.get("product_id")
    quantity = order.get("quantity", 1)
    
    # Get product info
    screens = {
        "screen_basic": {"name": "Ecran Basic 15\"", "price": 299.00},
        "screen_pro": {"name": "Ecran Pro 22\"", "price": 499.00},
        "screen_premium": {"name": "Ecran Premium 32\" 4K", "price": 899.00}
    }
    
    product = screens.get(product_id, {"name": "Ecran", "price": 0})
    total = product["price"] * quantity
    
    order_doc = {
        "order_id": order_id,
        "user_id": user.user_id,
        "salon_id": user.salon_id,
        "product_id": product_id,
        "product_name": product["name"],
        "quantity": quantity,
        "total_price": total,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.screen_orders.insert_one(order_doc)
    
    # Get user and salon info for email
    user_info = await db.users.find_one({"user_id": user.user_id}, {"_id": 0, "email": 1, "name": 1})
    salon_info = await db.salons.find_one({"salon_id": user.salon_id}, {"_id": 0, "name": 1, "address": 1})
    
    # Send confirmation email
    if user_info and user_info.get("email"):
        try:
            resend_key = os.getenv("RESEND_API_KEY")
            if resend_key:
                import resend
                resend.api_key = resend_key
                
                email_html = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="margin: 0;">AfroCrown</h1>
                        <p style="margin: 10px 0 0; opacity: 0.9;">Confirmation de commande</p>
                    </div>
                    <div style="background: #1e293b; color: #e2e8f0; padding: 30px; border-radius: 0 0 12px 12px;">
                        <p>Bonjour {user_info.get('name', 'Cher client')},</p>
                        <p>Nous avons bien recu votre commande d'ecran tactile.</p>
                        
                        <div style="background: #334155; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #a5b4fc; margin-top: 0;">Details de la commande</h3>
                            <p><strong>Numero:</strong> {order_id}</p>
                            <p><strong>Produit:</strong> {product['name']}</p>
                            <p><strong>Quantite:</strong> {quantity}</p>
                            <p><strong>Total:</strong> {total} EUR</p>
                            <p><strong>Salon:</strong> {salon_info.get('name', '-') if salon_info else '-'}</p>
                        </div>
                        
                        <p>Notre equipe vous contactera sous 24h pour confirmer les details de livraison et d'installation.</p>
                        
                        <p style="margin-top: 30px;">Merci de votre confiance!</p>
                        <p>L'equipe AfroCrown</p>
                    </div>
                </div>
                """
                
                resend.Emails.send({
                    "from": "AfroCrown <onboarding@resend.dev>",
                    "to": user_info["email"],
                    "subject": f"Confirmation commande ecran #{order_id}",
                    "html": email_html
                })
                logger.info(f"Order confirmation email sent to {user_info['email']}")
        except Exception as email_err:
            logger.error(f"Failed to send order email: {email_err}")
    
    return {"success": True, "order_id": order_id, "message": "Commande enregistree. Vous recevrez un email de confirmation."}

# =============================================================================
# TENDANCES DU MOMENT (TRENDS)
# =============================================================================

# Salon Photo Gallery Endpoints
@api_router.get("/salons/{salon_id}/photos")
async def get_salon_photos(salon_id: str):
    """Get all photos from a salon's gallery"""
    photos = await db.salon_photos.find({"salon_id": salon_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return photos

@api_router.post("/salons/{salon_id}/photos")
async def upload_salon_photo(salon_id: str, photo: SalonPhotoUpload, user: UserBase = Depends(require_salon_owner)):
    """Upload a photo to salon's gallery (max 10 per month)"""
    # Verify user owns this salon
    if user.salon_id != salon_id and user.role != "founder":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Check monthly limit (10 photos per month)
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    monthly_count = await db.salon_photos.count_documents({
        "salon_id": salon_id,
        "created_at": {"$gte": start_of_month.isoformat()}
    })
    
    if monthly_count >= 10:
        raise HTTPException(status_code=400, detail="Limite de 10 photos par mois atteinte")
    
    photo_id = f"photo_{uuid.uuid4().hex[:12]}"
    photo_doc = {
        "photo_id": photo_id,
        "salon_id": salon_id,
        "image_url": photo.image_url,
        "description": photo.description,
        "uploaded_by": user.user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.salon_photos.insert_one(photo_doc)
    return {"success": True, "photo_id": photo_id, "image_url": photo.image_url}

@api_router.delete("/salons/{salon_id}/photos/{photo_id}")
async def delete_salon_photo(salon_id: str, photo_id: str, user: UserBase = Depends(require_salon_owner)):
    """Delete a photo from salon's gallery"""
    if user.salon_id != salon_id and user.role != "founder":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    result = await db.salon_photos.delete_one({"photo_id": photo_id, "salon_id": salon_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Photo non trouvée")
    
    return {"success": True}

# Trends Endpoints
@api_router.post("/trends")
async def submit_trend(trend: TrendSubmission, user: UserBase = Depends(require_salon_owner)):
    """Submit a trend/realization for potential featuring"""
    # Verify client consent
    if not trend.client_consent:
        raise HTTPException(status_code=400, detail="L'accord du client est requis")
    
    # Get salon info
    salon = await db.salons.find_one({"salon_id": user.salon_id}, {"_id": 0})
    if not salon:
        raise HTTPException(status_code=404, detail="Salon non trouvé")
    
    trend_id = f"trend_{uuid.uuid4().hex[:12]}"
    trend_doc = {
        "trend_id": trend_id,
        "salon_id": user.salon_id,
        "salon_name": salon.get("name"),
        "owner_id": user.user_id,
        "owner_name": user.name,
        "barber_name": trend.barber_name,
        "haircut_name": trend.haircut_name,
        "title": trend.haircut_name,  # Use haircut name as title
        "description": f"Réalisé par {trend.barber_name}",
        "message": trend.message,
        "image_url": trend.image_url,
        "client_consent": trend.client_consent,
        "is_approved": False,
        "is_featured": False,
        "likes": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.trends.insert_one(trend_doc)
    return {"success": True, "trend_id": trend_id, "message": "Votre création a été soumise et sera visible après validation !"}

@api_router.get("/trends")
async def get_trends(limit: int = 20, featured_only: bool = False):
    """Get approved trends (random selection)"""
    query = {"is_approved": True}
    if featured_only:
        query["is_featured"] = True
    
    all_trends = await db.trends.find(query, {"_id": 0}).to_list(100)
    
    import random
    random.shuffle(all_trends)
    
    return all_trends[:limit]

@api_router.get("/trends/all")
async def get_all_trends_admin(user: UserBase = Depends(require_founder)):
    """Get all trends for admin review"""
    trends = await db.trends.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return trends

@api_router.put("/trends/{trend_id}/approve")
async def approve_trend(trend_id: str, user: UserBase = Depends(require_founder)):
    """Approve a trend (admin only)"""
    result = await db.trends.update_one({"trend_id": trend_id}, {"$set": {"is_approved": True}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tendance non trouvée")
    return {"success": True}

@api_router.put("/trends/{trend_id}/feature")
async def feature_trend(trend_id: str, featured: bool = True, user: UserBase = Depends(require_founder)):
    """Feature a trend (admin only)"""
    await db.trends.update_one({"trend_id": trend_id}, {"$set": {"is_featured": featured, "is_approved": True}})
    return {"success": True}

@api_router.delete("/trends/{trend_id}")
async def delete_trend(trend_id: str, user: UserBase = Depends(require_auth)):
    """Delete a trend"""
    trend = await db.trends.find_one({"trend_id": trend_id}, {"_id": 0})
    if not trend:
        raise HTTPException(status_code=404, detail="Tendance non trouvée")
    
    if user.role != "founder" and trend.get("owner_id") != user.user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    await db.trends.delete_one({"trend_id": trend_id})
    return {"success": True}

@api_router.post("/trends/{trend_id}/like")
async def like_trend(trend_id: str, user: UserBase = Depends(require_auth)):
    """Like a trend"""
    existing = await db.trend_likes.find_one({"trend_id": trend_id, "user_id": user.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Déjà aimé")
    
    await db.trend_likes.insert_one({"trend_id": trend_id, "user_id": user.user_id, "created_at": datetime.now(timezone.utc).isoformat()})
    await db.trends.update_one({"trend_id": trend_id}, {"$inc": {"likes": 1}})
    return {"success": True}

@api_router.delete("/trends/{trend_id}/like")
async def unlike_trend(trend_id: str, user: UserBase = Depends(require_auth)):
    """Unlike a trend"""
    result = await db.trend_likes.delete_one({"trend_id": trend_id, "user_id": user.user_id})
    if result.deleted_count > 0:
        await db.trends.update_one({"trend_id": trend_id}, {"$inc": {"likes": -1}})
    return {"success": True}

@api_router.get("/trends/my-likes")
async def get_my_trend_likes(user: UserBase = Depends(require_auth)):
    """Get trends user liked"""
    likes = await db.trend_likes.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return [l["trend_id"] for l in likes]

# =============================================================================
# ADMIN - SALON & BARBER MANAGEMENT
# =============================================================================

@api_router.put("/admin/salons/{salon_id}")
async def admin_update_salon(salon_id: str, update: SalonUpdateByAdmin, user: UserBase = Depends(require_founder)):
    """Admin can update any salon"""
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucune donnée")
    
    result = await db.salons.update_one({"salon_id": salon_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Salon non trouvé")
    return {"success": True}

@api_router.put("/admin/barbers/{barber_id}/phone-visibility")
async def admin_set_phone_visibility(barber_id: str, hidden: bool, user: UserBase = Depends(require_founder)):
    """Admin hide/show barber phone (overrides owner)"""
    result = await db.barbers.update_one({"barber_id": barber_id}, {"$set": {"phone_hidden_by_admin": hidden}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Coiffeur non trouvé")
    return {"success": True}

@api_router.put("/salons/{salon_id}/barbers/{barber_id}/phone-visibility")
async def owner_set_phone_visibility(salon_id: str, barber_id: str, visible: bool, user: UserBase = Depends(require_salon_owner)):
    """Owner set barber phone visibility (if not hidden by admin)"""
    if user.role != "founder" and user.salon_id != salon_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    barber = await db.barbers.find_one({"barber_id": barber_id, "salon_id": salon_id}, {"_id": 0})
    if not barber:
        raise HTTPException(status_code=404, detail="Coiffeur non trouvé")
    
    if barber.get("phone_hidden_by_admin"):
        raise HTTPException(status_code=403, detail="Masqué par l'admin")
    
    await db.barbers.update_one({"barber_id": barber_id}, {"$set": {"phone_visible": visible}})
    return {"success": True}

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

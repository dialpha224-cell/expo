"""
AfroCrown - Pydantic Models / Schemas
=====================================
All data models for API requests and responses
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone


# =============================================================================
# USER MODELS
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


class PasswordSetup(BaseModel):
    token: str
    password: str


# =============================================================================
# SALON MODELS
# =============================================================================

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


# =============================================================================
# BARBER MODELS
# =============================================================================

class BarberCreate(BaseModel):
    name: str
    email: Optional[str] = None
    specialties: List[str] = []
    bio: Optional[str] = None
    image_url: Optional[str] = None
    role: str = "employee"  # owner, employee, volunteer, intern
    phone: Optional[str] = None


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
    availability_schedule: Dict[str, Any]


# =============================================================================
# HAIRCUT MODELS
# =============================================================================

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


# =============================================================================
# SALON PRICING MODELS
# =============================================================================

class SalonPriceCreate(BaseModel):
    haircut_id: str
    price: float
    is_available: bool = True


class SalonPriceResponse(BaseModel):
    salon_id: str
    haircut_id: str
    haircut_name: Optional[str] = None
    base_price: float
    salon_price: float
    duration_minutes: int
    category: str
    is_available: bool = True


class SalonPricingUpdate(BaseModel):
    prices: List[SalonPriceCreate]


# =============================================================================
# PROMOTION MODELS
# =============================================================================

class PromotionCreate(BaseModel):
    haircut_id: Optional[str] = None
    name: str
    discount_type: str = "percentage"
    discount_value: float
    start_date: str
    end_date: str
    days_of_week: List[str] = []
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


# =============================================================================
# APPOINTMENT MODELS
# =============================================================================

class AppointmentCreate(BaseModel):
    salon_id: str
    barber_id: str
    haircut_id: str
    appointment_date: str
    appointment_time: str
    client_notes: Optional[str] = None
    client_photos: List[str] = []
    is_premium: bool = False


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
    status: str = "pending"
    payment_method: str = "cash"
    payment_status: str = "pending"
    total_price: float = 0.0
    base_price: float = 0.0
    premium_fee: float = 0.0
    is_premium: bool = False
    client_notes: Optional[str] = None
    client_photos: List[str] = []
    created_at: datetime


# =============================================================================
# PREMIUM SERVICE MODELS
# =============================================================================

class PremiumServiceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "drink"
    image_url: Optional[str] = None


class PremiumServiceResponse(BaseModel):
    service_id: str
    salon_id: str
    name: str
    description: Optional[str] = None
    category: str
    image_url: Optional[str] = None
    is_active: bool = True


# =============================================================================
# PRODUCT MODELS
# =============================================================================

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


# =============================================================================
# TRIMCONNECT MODELS
# =============================================================================

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
    status: str = "pending"
    contest_edition: str
    created_at: datetime


class VoteCreate(BaseModel):
    entry_id: str


# =============================================================================
# CHECKOUT MODELS
# =============================================================================

class CheckoutRequest(BaseModel):
    appointment_id: Optional[str] = None
    product_ids: Optional[List[str]] = None
    origin_url: str


# =============================================================================
# NOTIFICATION MODELS
# =============================================================================

class NotificationCreate(BaseModel):
    type: str
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


class PushTokenRegister(BaseModel):
    expo_push_token: str


# =============================================================================
# REVIEW MODELS
# =============================================================================

class ReviewCreate(BaseModel):
    appointment_id: str
    salon_rating: int = Field(..., ge=1, le=5)
    barber_rating: int = Field(..., ge=1, le=5)
    platform_rating: Optional[int] = Field(None, ge=1, le=5)
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
# MONTHLY CUTS MODELS
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
    month: str
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
    qr_code: str
    created_at: datetime
    updated_at: datetime


class LoyaltyRewardConfig(BaseModel):
    reward_type: str = "free_haircut"
    reward_description: str = "Coupe gratuite"
    max_stamps: int = 10


class LoyaltyScanRequest(BaseModel):
    qr_code_data: str


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
# PROFILE MODELS
# =============================================================================

class ProfilePhotoUpdate(BaseModel):
    picture: str


# =============================================================================
# OTHER MODELS
# =============================================================================

class ArrivalNotification(BaseModel):
    client_name: str
    appointment_id: str


class ReassignClientRequest(BaseModel):
    appointment_id: str
    new_barber_id: str
    reason: Optional[str] = None


class SalonWebsiteImportRequest(BaseModel):
    website_url: str

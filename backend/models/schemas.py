# AfroCrown Backend Models
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# =============================================================================
# USER MODELS
# =============================================================================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "client"

class UserCreate(UserBase):
    password: Optional[str] = None

class UserResponse(UserBase):
    user_id: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    salon_id: Optional[str] = None
    created_at: Optional[datetime] = None

class EmailLoginRequest(BaseModel):
    email: EmailStr
    password: str

class PasswordSetupRequest(BaseModel):
    token: str
    new_password: str

# =============================================================================
# SALON MODELS
# =============================================================================

class OpeningHours(BaseModel):
    monday: str = "09:00-19:00"
    tuesday: str = "09:00-19:00"
    wednesday: str = "09:00-19:00"
    thursday: str = "09:00-19:00"
    friday: str = "09:00-19:00"
    saturday: str = "10:00-18:00"
    sunday: str = "Closed"

class LocationModel(BaseModel):
    type: str = "Point"
    coordinates: List[float] = [0.0, 0.0]

class SalonBase(BaseModel):
    name: str
    address: str
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class SalonCreate(SalonBase):
    pass

class SalonResponse(SalonBase):
    salon_id: str
    owner_id: Optional[str] = None
    opening_hours: Optional[OpeningHours] = None
    location: Optional[LocationModel] = None
    rating: Optional[float] = None
    review_count: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None

class SalonUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    opening_hours: Optional[OpeningHours] = None

# =============================================================================
# BARBER MODELS
# =============================================================================

class BarberBase(BaseModel):
    name: str
    specialty: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    experience_years: int = 0

class BarberCreate(BarberBase):
    salon_id: str
    user_id: Optional[str] = None

class BarberResponse(BarberBase):
    barber_id: str
    salon_id: str
    user_id: Optional[str] = None
    rating: Optional[float] = None
    review_count: int = 0
    is_active: bool = True

class BarberUpdate(BaseModel):
    name: Optional[str] = None
    specialty: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    experience_years: Optional[int] = None
    is_active: Optional[bool] = None

# =============================================================================
# HAIRCUT MODELS
# =============================================================================

class HaircutBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    duration_minutes: int = 30
    image_url: Optional[str] = None
    category: Optional[str] = None

class HaircutCreate(HaircutBase):
    salon_id: str

class HaircutResponse(HaircutBase):
    haircut_id: str
    salon_id: str
    is_active: bool = True

class HaircutUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration_minutes: Optional[int] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_active: Optional[bool] = None

# =============================================================================
# APPOINTMENT MODELS
# =============================================================================

class AppointmentBase(BaseModel):
    salon_id: str
    barber_id: str
    haircut_id: str
    date: str
    time: str
    is_premium: bool = False
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    client_id: str

class AppointmentResponse(AppointmentBase):
    appointment_id: str
    client_id: str
    status: str = "pending"
    total_price: float = 0
    created_at: Optional[datetime] = None
    salon_name: Optional[str] = None
    barber_name: Optional[str] = None
    haircut_name: Optional[str] = None
    client_name: Optional[str] = None
    client_email: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    notes: Optional[str] = None

# =============================================================================
# REVIEW MODELS
# =============================================================================

class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    salon_id: str
    barber_id: Optional[str] = None

class ReviewResponse(ReviewBase):
    review_id: str
    salon_id: str
    barber_id: Optional[str] = None
    client_id: str
    client_name: Optional[str] = None
    client_picture: Optional[str] = None
    created_at: Optional[datetime] = None

# =============================================================================
# NOTIFICATION MODELS
# =============================================================================

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "info"

class NotificationResponse(NotificationBase):
    notification_id: str
    user_id: str
    is_read: bool = False
    created_at: Optional[datetime] = None
    link: Optional[str] = None

# =============================================================================
# LOYALTY MODELS
# =============================================================================

class LoyaltyConfigBase(BaseModel):
    stamps_required: int = 10
    reward_description: str = "Une coupe gratuite"

class LoyaltyConfigResponse(LoyaltyConfigBase):
    salon_id: str
    is_active: bool = True

class LoyaltyCardResponse(BaseModel):
    card_id: str
    client_id: str
    salon_id: str
    stamps: int = 0
    completed_cards: int = 0
    last_stamp_date: Optional[datetime] = None

# =============================================================================
# TRIMCONNECT MODELS
# =============================================================================

class TrimConnectEntryBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    video_url: Optional[str] = None

class TrimConnectEntryCreate(TrimConnectEntryBase):
    barber_id: str
    salon_id: str

class TrimConnectEntryResponse(TrimConnectEntryBase):
    entry_id: str
    barber_id: str
    salon_id: str
    barber_name: Optional[str] = None
    salon_name: Optional[str] = None
    votes: int = 0
    created_at: Optional[datetime] = None
    is_winner: bool = False
    rank: Optional[int] = None

# =============================================================================
# PRODUCT MODELS
# =============================================================================

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    image_url: Optional[str] = None
    stock: int = 0

class ProductResponse(ProductBase):
    product_id: str
    is_active: bool = True

# =============================================================================
# MONTHLY CUTS MODELS
# =============================================================================

class MonthlyCutBase(BaseModel):
    photo_url: str
    description: Optional[str] = None
    haircut_id: Optional[str] = None

class MonthlyCutResponse(MonthlyCutBase):
    cut_id: str
    salon_id: str
    salon_name: Optional[str] = None
    likes: int = 0
    month: str
    year: int

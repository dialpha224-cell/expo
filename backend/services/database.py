"""
AfroCrown - Database Service
============================
MongoDB connection and database utilities
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collections
users_collection = db.users
sessions_collection = db.sessions
salons_collection = db.salons
barbers_collection = db.barbers
haircuts_collection = db.haircuts
appointments_collection = db.appointments
products_collection = db.products
notifications_collection = db.notifications
reviews_collection = db.reviews
trimconnect_entries_collection = db.trimconnect_entries
votes_collection = db.votes
monthly_cuts_collection = db.monthly_cuts
loyalty_cards_collection = db.loyalty_cards
loyalty_rewards_collection = db.loyalty_rewards
promotions_collection = db.promotions
premium_services_collection = db.premium_services
salon_prices_collection = db.salon_prices
push_tokens_collection = db.push_tokens


def get_database():
    """Get the database instance"""
    return db


def get_client():
    """Get the MongoDB client"""
    return client

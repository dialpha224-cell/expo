import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
import uuid

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")  # Use correct DB name

# Tendances avec images et phrases percutantes style Pinterest
TRENDS_DATA = [
    {
        "title": "Taper Fade Clean",
        "message": "La précision, c'est l'élégance. 🔥",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/5a74bd03d51115436d28479c2be767eaf3a6ecf2eebdc673c11baea9501e31f9.png",
        "salon_name": "Salon Elite Paris"
    },
    {
        "title": "360 Waves Perfect",
        "message": "Les waves qui font tourner les têtes 🌊",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/43162635dc0d00a032ccda23f09c1c00a668c10147ce7e6c81257d9eec8794f2.png",
        "salon_name": "Afro Style Brussels"
    },
    {
        "title": "High Top Fresh",
        "message": "Sois toi-même, sois unique. ✨",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/40b52420728e44958ec43d1b43c6ebf627fc4f62d851326ce2ea13f5cfa65142.png",
        "salon_name": "Crown Cuts Amsterdam"
    },
    {
        "title": "Low Fade Barbe",
        "message": "Le détail fait la différence. 💎",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b2f6f5d11cb075a185e06d5743a8eb1999dff8876d3eedebf66986f45a5ee0c1.png",
        "salon_name": "Barber King Lyon"
    },
    {
        "title": "Afro Naturel",
        "message": "Assume ta couronne. 👑",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/f7191e3c2abff0ea8910c590ea46a5526f72a83c50bce88d8b26e2198f7bb711.png",
        "salon_name": "Natural Hair Studio"
    },
    {
        "title": "Buzz Cut Sharp",
        "message": "Simple. Net. Efficace. ⚡",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/44d43007533a0f29551419ff5e7dcb0286bb49094bebd58a0b2009d05bc71c46.png",
        "salon_name": "Sharp Cuts Berlin"
    },
    {
        "title": "Skin Fade Design",
        "message": "L'art sur ta tête. 🎨",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/1cc5a0d53b27b2dccd59175fa06c52b6a17bec24b892989b5f4ca0b4a75adf06.png",
        "salon_name": "Design Barbers Madrid"
    },
    {
        "title": "Cornrows Style",
        "message": "La tradition rencontre le style. 🔱",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/bdb3eac0e84fbe1461b2c24dfce96ad900165677102caf19a4687da360ecccd2.png",
        "salon_name": "Heritage Braids London"
    },
    {
        "title": "Tresses Fulani",
        "message": "Nos racines, notre fierté. 🌍",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/2368e2dec7ce77152ed9d3f7340f46b92f6adb7cf7e8f2402de3de8b88e53583.png",
        "salon_name": "Roots & Culture Salon"
    },
    {
        "title": "Dreads Courts",
        "message": "Liberté absolue. 🦁",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/b8413b9853ad7a25153d000160a63fe913900717d137f217c971e09706df05c5.png",
        "salon_name": "Dread Masters Geneva"
    },
    {
        "title": "Mohawk Bold",
        "message": "Ose être différent. 🔥",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/72803f33fd1066f9034aec361385b429e29f83d94c89a76334e0a5be3fb8ddf5.png",
        "salon_name": "Bold Cuts NYC"
    },
    {
        "title": "Drop Fade Perfect",
        "message": "La coupe qui fait la diff. 💯",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/51a0fd6b16b029dc9e0f74fd5ca1e1803cc1e283e6da74013ea6422556d356aa.png",
        "salon_name": "Perfect Fade Studio"
    },
    {
        "title": "Burst Fade Style",
        "message": "Le style qui explose. 💥",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/45d97352c35d9d92b46fe8755375b45b5e49aca3da1bd42e313319e91f3ad554.png",
        "salon_name": "Burst Barbers Milan"
    },
    {
        "title": "Flat Top Classic",
        "message": "Le classique ne meurt jamais. 🖤",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/973777cd63edf86e0b12f75c56145f6a9224582ecb6a00d1bc3a493b46c5f4c5.png",
        "salon_name": "Classic Barber Shop"
    },
    {
        "title": "Crâne Rasé",
        "message": "La confiance pure. 💪",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/6c5cde2836906732a1c431c826b5070ea52279f9c734979ec5e4558c6017d6b7.png",
        "salon_name": "Clean Cut Academy"
    },
    {
        "title": "Twists Fresh",
        "message": "Texture et attitude. ✌️",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ea04d4455635e9a34c3d458ec2f3dcc6d6a63cd05c694f09965be4a90c825758.png",
        "salon_name": "Twist & Shout Salon"
    },
    {
        "title": "Temple Fade Curly",
        "message": "Les boucles parfaites. 〰️",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/df2794ebe0d795d4053f8a6260b7051d9feb4d49f24aa9195a43c6b1d2f245dc.png",
        "salon_name": "Curly Kings Salon"
    },
    {
        "title": "Edgar Cut Trend",
        "message": "La tendance du moment. 📈",
        "image_url": "https://static.prod-images.emergentagent.com/jobs/203a8c76-f88a-4348-b201-f9f8c0298fc2/images/ba8aa82c90b19714624ca5adc0ca003f37ef746be37acef21ac46157e07c467e.png",
        "salon_name": "Trend Setters Barbers"
    },
]

async def seed_trends():
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"Using DB: {DB_NAME}")
    
    # Clear existing trends
    await db.trends.delete_many({})
    
    trends_to_insert = []
    for i, trend in enumerate(TRENDS_DATA):
        trend_doc = {
            "trend_id": f"trend_{uuid.uuid4().hex[:12]}",
            "salon_id": f"demo_salon_{i}",
            "salon_name": trend["salon_name"],
            "owner_id": "demo_owner",
            "owner_name": "AfroCrown Team",
            "title": trend["title"],
            "description": None,
            "message": trend["message"],
            "image_url": trend["image_url"],
            "is_approved": True,
            "is_featured": i < 6,
            "likes": 50 + (i * 7) % 150,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        trends_to_insert.append(trend_doc)
    
    await db.trends.insert_many(trends_to_insert)
    print(f"✅ {len(trends_to_insert)} tendances ajoutées!")
    
    # Verify
    count = await db.trends.count_documents({"is_approved": True})
    print(f"Verified: {count} approved trends in DB")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_trends())

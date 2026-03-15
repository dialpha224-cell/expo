"""
Test suite for AfroCrown Promotions and Photo Upload Features

Tests cover:
1. Promotions CRUD - Create, Read, Update, Delete promotions for salons
2. Photo Upload - User, Barber, and Haircut photo updates
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

# Use REACT_APP_BACKEND_URL from .env
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test salon ID from previous testing
TEST_SALON_ID = "salon_934a31f6ee31"


class TestPromotionsPublicEndpoint:
    """Test public promotions endpoint (no auth required for GET)"""
    
    def test_get_promotions_active_only(self):
        """Test GET /api/salons/{salon_id}/promotions with active_only=true"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/salons/{TEST_SALON_ID}/promotions - Active promotions: {len(data)}")
        
    def test_get_promotions_all(self):
        """Test GET /api/salons/{salon_id}/promotions?active_only=false"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions?active_only=false")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/salons/{TEST_SALON_ID}/promotions?active_only=false - All promotions: {len(data)}")
        
    def test_get_promotions_invalid_salon(self):
        """Test GET promotions for non-existent salon"""
        response = requests.get(f"{BASE_URL}/api/salons/invalid_salon_id/promotions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 0
        print("✓ GET promotions for invalid salon returns empty list")


class TestPromotionsRequiresAuth:
    """Test that promotion creation/update/delete requires authentication"""
    
    def test_create_promotion_requires_auth(self):
        """Test POST /api/salons/{salon_id}/promotions requires authentication"""
        today = datetime.now().strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        payload = {
            "name": "TEST Test Promotion",
            "discount_type": "percentage",
            "discount_value": 20,
            "start_date": today,
            "end_date": end_date,
            "days_of_week": [],
            "description": "Test promotion"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions",
            json=payload
        )
        # Should return 401 unauthorized without auth
        assert response.status_code == 401
        print("✓ POST /api/salons/{salon_id}/promotions correctly requires auth (401)")
        
    def test_update_promotion_requires_auth(self):
        """Test PUT /api/salons/{salon_id}/promotions/{promotion_id} requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions/promo_test123",
            json={"is_active": False}
        )
        assert response.status_code == 401
        print("✓ PUT /api/salons/{salon_id}/promotions/{id} correctly requires auth (401)")
        
    def test_delete_promotion_requires_auth(self):
        """Test DELETE /api/salons/{salon_id}/promotions/{promotion_id} requires authentication"""
        response = requests.delete(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions/promo_test123"
        )
        assert response.status_code == 401
        print("✓ DELETE /api/salons/{salon_id}/promotions/{id} correctly requires auth (401)")


class TestPhotoUploadRequiresAuth:
    """Test that photo upload endpoints require authentication"""
    
    def test_update_user_photo_requires_auth(self):
        """Test PUT /api/users/me/photo requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/users/me/photo",
            json={"picture": "https://example.com/photo.jpg"}
        )
        assert response.status_code == 401
        print("✓ PUT /api/users/me/photo correctly requires auth (401)")
        
    def test_update_barber_photo_requires_auth(self):
        """Test PUT /api/barbers/{barber_id}/photo requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/barbers/barber_test123/photo",
            json={"photo_url": "https://example.com/photo.jpg"}
        )
        assert response.status_code == 401
        print("✓ PUT /api/barbers/{barber_id}/photo correctly requires auth (401)")
        
    def test_update_haircut_photo_requires_auth(self):
        """Test PUT /api/salons/{salon_id}/haircuts/{haircut_id}/photo requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts/haircut_test123/photo",
            json={"photo_url": "https://example.com/photo.jpg"}
        )
        assert response.status_code == 401
        print("✓ PUT /api/salons/{salon_id}/haircuts/{haircut_id}/photo correctly requires auth (401)")


class TestPromotionResponseStructure:
    """Test the structure of promotion responses"""
    
    def test_promotion_fields(self):
        """Verify promotion response contains expected fields"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions?active_only=false")
        assert response.status_code == 200
        data = response.json()
        
        # If there are promotions, check the structure
        if len(data) > 0:
            promo = data[0]
            expected_fields = [
                "promotion_id", "salon_id", "name", "discount_type", 
                "discount_value", "start_date", "end_date", "is_active"
            ]
            for field in expected_fields:
                assert field in promo, f"Missing field: {field}"
            
            # Validate discount_type is valid
            assert promo["discount_type"] in ["percentage", "fixed"], f"Invalid discount_type: {promo['discount_type']}"
            
            # Validate discount_value is positive
            assert promo["discount_value"] > 0, "discount_value should be positive"
            
            print(f"✓ Promotion response structure is correct. Fields: {list(promo.keys())}")
        else:
            print("⚠ No promotions found to verify structure - will test with authenticated user")


class TestCloudinarySignature:
    """Test Cloudinary signature endpoint for photo uploads"""
    
    def test_cloudinary_signature_endpoint_exists(self):
        """Test that cloudinary signature endpoint exists"""
        response = requests.get(f"{BASE_URL}/api/cloudinary/signature")
        # Should either return 200 with signature or 401 if auth required
        assert response.status_code in [200, 401]
        print(f"✓ GET /api/cloudinary/signature endpoint exists (status: {response.status_code})")


class TestHaircutsWithPromotionalPricing:
    """Test haircuts endpoint with promotional pricing"""
    
    def test_get_haircuts_with_pricing(self):
        """Test GET /api/salons/{salon_id}/haircuts-with-pricing"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts-with-pricing")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            haircut = data[0]
            # Verify basic fields
            assert "haircut_id" in haircut
            assert "name" in haircut
            assert "price" in haircut
            print(f"✓ GET /api/salons/{TEST_SALON_ID}/haircuts-with-pricing - {len(data)} haircuts")
        else:
            print("⚠ No haircuts found for salon")


class TestSalonBarbersEndpoint:
    """Test salon barbers endpoint for photo-related functionality"""
    
    def test_get_salon_barbers(self):
        """Test GET /api/salons/{salon_id}/barbers"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            barber = data[0]
            assert "barber_id" in barber
            assert "name" in barber
            # Photo fields should exist (may be null)
            print(f"✓ GET /api/salons/{TEST_SALON_ID}/barbers - {len(data)} barbers found")
            print(f"  Sample barber: {barber.get('name')}, photo_url: {barber.get('photo_url') or barber.get('image_url') or 'None'}")
        else:
            print("⚠ No barbers found for salon")


# Run tests when executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

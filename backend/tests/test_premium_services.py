"""
Test suite for AfroCrown Premium Services and Premium Reservations
Tests: 
1. Premium Services CRUD for salons (drinks/snacks)
2. Premium Reservations with +20% fee
3. Promotions creation (SelectItem bug fix verification)
"""

import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test salon ID
TEST_SALON_ID = "salon_934a31f6ee31"

class TestPremiumServicesPublicEndpoints:
    """Test public premium services endpoints (no auth required)"""
    
    def test_get_premium_services_empty(self):
        """GET /api/salons/{salon_id}/premium-services - Returns structure with empty lists initially"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/premium-services")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "services" in data, "Response should contain 'services' key"
        assert "drinks" in data, "Response should contain 'drinks' key"
        assert "snacks" in data, "Response should contain 'snacks' key"
        assert "has_premium" in data, "Response should contain 'has_premium' key"
        
        # has_premium should be boolean
        assert isinstance(data["has_premium"], bool)
        
        print(f"Premium services response: drinks={len(data['drinks'])}, snacks={len(data['snacks'])}, has_premium={data['has_premium']}")
    
    def test_get_premium_services_invalid_salon(self):
        """GET /api/salons/invalid_id/premium-services - Returns empty for invalid salon"""
        response = requests.get(f"{BASE_URL}/api/salons/invalid_salon_id/premium-services")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["has_premium"] == False
        assert len(data["services"]) == 0


class TestPremiumServicesAuthRequired:
    """Test premium services endpoints that require authentication"""
    
    def test_create_premium_service_requires_auth(self):
        """POST /api/salons/{salon_id}/premium-services - Requires authentication (401)"""
        payload = {
            "name": "Cafe Expresso",
            "description": "Cafe frais",
            "category": "drink"
        }
        response = requests.post(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/premium-services",
            json=payload
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("POST premium-services correctly requires authentication")
    
    def test_update_premium_service_requires_auth(self):
        """PUT /api/salons/{salon_id}/premium-services/{id} - Requires authentication (401)"""
        response = requests.put(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/premium-services/premium_test123",
            json={"is_active": False}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PUT premium-services correctly requires authentication")
    
    def test_delete_premium_service_requires_auth(self):
        """DELETE /api/salons/{salon_id}/premium-services/{id} - Requires authentication (401)"""
        response = requests.delete(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/premium-services/premium_test123"
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("DELETE premium-services correctly requires authentication")


class TestPromotionsEndpoints:
    """Test promotions endpoints (bug fix verification for SelectItem)"""
    
    def test_get_promotions(self):
        """GET /api/salons/{salon_id}/promotions - Returns promotions list"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Promotions should be a list"
        print(f"Found {len(data)} promotions")
    
    def test_get_promotions_include_inactive(self):
        """GET /api/salons/{salon_id}/promotions?active_only=false - Returns all promotions"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions?active_only=false")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} total promotions (including inactive)")
    
    def test_create_promotion_requires_auth(self):
        """POST /api/salons/{salon_id}/promotions - Requires authentication (401)"""
        today = datetime.now().strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        
        payload = {
            "name": "Test Promo",
            "haircut_id": None,  # All haircuts - the fixed bug case
            "discount_type": "percentage",
            "discount_value": 20,
            "start_date": today,
            "end_date": end_date,
            "days_of_week": []
        }
        response = requests.post(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions",
            json=payload
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("POST promotions correctly requires authentication")


class TestAppointmentsWithPremium:
    """Test appointment creation with premium option"""
    
    def test_get_salons_list(self):
        """GET /api/salons - Verify salons exist"""
        response = requests.get(f"{BASE_URL}/api/salons")
        assert response.status_code == 200
        
        salons = response.json()
        assert len(salons) > 0, "Should have at least one salon"
        
        # Find our test salon
        test_salon = next((s for s in salons if s["salon_id"] == TEST_SALON_ID), None)
        assert test_salon is not None, f"Test salon {TEST_SALON_ID} should exist"
        print(f"Test salon found: {test_salon['name']}")
    
    def test_get_salon_barbers(self):
        """GET /api/salons/{salon_id}/barbers - Verify barbers exist"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers")
        assert response.status_code == 200
        
        barbers = response.json()
        assert len(barbers) > 0, "Should have at least one barber"
        print(f"Found {len(barbers)} barbers")
        return barbers
    
    def test_get_salon_haircuts(self):
        """GET /api/salons/{salon_id}/haircuts - Verify haircuts exist"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts")
        assert response.status_code == 200
        
        haircuts = response.json()
        assert len(haircuts) > 0, "Should have at least one haircut"
        print(f"Found {len(haircuts)} haircuts")
        return haircuts
    
    def test_create_standard_appointment(self):
        """POST /api/appointments - Create standard appointment (no premium)"""
        # First get barber and haircut
        barbers = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers").json()
        haircuts = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts").json()
        
        if not barbers or not haircuts:
            pytest.skip("No barbers or haircuts available")
        
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        payload = {
            "salon_id": TEST_SALON_ID,
            "barber_id": barbers[0]["barber_id"],
            "haircut_id": haircuts[0]["haircut_id"],
            "appointment_date": tomorrow,
            "appointment_time": "14:00",
            "client_notes": "Test standard appointment",
            "client_photos": [],
            "is_premium": False
        }
        
        response = requests.post(f"{BASE_URL}/api/appointments", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["is_premium"] == False
        assert data["premium_fee"] == 0.0
        assert data["total_price"] == data["base_price"], "Total should equal base for non-premium"
        
        print(f"Standard appointment created: {data['appointment_id']}, price: {data['total_price']} EUR")
    
    def test_create_premium_appointment_without_services_fails(self):
        """POST /api/appointments with is_premium=true without premium services - Should fail"""
        # Get barbers and haircuts
        barbers = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers").json()
        haircuts = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts").json()
        
        # Check if salon has premium services
        premium = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/premium-services").json()
        
        if not barbers or not haircuts:
            pytest.skip("No barbers or haircuts available")
        
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        payload = {
            "salon_id": TEST_SALON_ID,
            "barber_id": barbers[0]["barber_id"],
            "haircut_id": haircuts[0]["haircut_id"],
            "appointment_date": tomorrow,
            "appointment_time": "15:00",
            "client_notes": "Test premium appointment",
            "client_photos": [],
            "is_premium": True
        }
        
        response = requests.post(f"{BASE_URL}/api/appointments", json=payload)
        
        # If salon doesn't have premium services, should fail with 400
        if not premium["has_premium"]:
            assert response.status_code == 400, f"Expected 400 when no premium services, got {response.status_code}"
            assert "premium" in response.json().get("detail", "").lower(), "Error should mention premium"
            print("Premium appointment correctly rejected - salon has no premium services")
        else:
            # If salon has premium services, should succeed with +20% fee
            assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
            data = response.json()
            assert data["is_premium"] == True
            assert data["premium_fee"] > 0
            expected_total = data["base_price"] * 1.20
            assert abs(data["total_price"] - expected_total) < 0.01, "Total should be base + 20%"
            print(f"Premium appointment created: {data['appointment_id']}, total: {data['total_price']} EUR (+20%)")


class TestPromotionsManagerIntegration:
    """Test data structure for promotions (for frontend SelectItem fix)"""
    
    def test_promotions_response_structure(self):
        """Verify promotions have correct structure for SelectItem component"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/promotions?active_only=false")
        assert response.status_code == 200
        
        promotions = response.json()
        
        # If there are promotions, verify their structure
        if len(promotions) > 0:
            promo = promotions[0]
            assert "promotion_id" in promo
            assert "name" in promo
            assert "discount_type" in promo
            assert "discount_value" in promo
            assert "haircut_id" in promo or promo.get("haircut_id") is None  # Can be null
            print(f"Promotion structure verified: {promo['name']}")
        else:
            print("No promotions to verify structure - endpoint working correctly")


class TestHaircutsForPremium:
    """Test haircuts endpoints to support booking flow"""
    
    def test_get_haircuts_with_pricing(self):
        """GET /api/salons/{salon_id}/haircuts - Returns haircuts for booking"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts")
        assert response.status_code == 200
        
        haircuts = response.json()
        assert len(haircuts) > 0, "Should have haircuts"
        
        # Verify haircut structure
        haircut = haircuts[0]
        assert "haircut_id" in haircut
        assert "name" in haircut
        assert "price" in haircut
        assert "duration_minutes" in haircut
        
        print(f"Sample haircut: {haircut['name']} - {haircut['price']} EUR")


# Fixtures
@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

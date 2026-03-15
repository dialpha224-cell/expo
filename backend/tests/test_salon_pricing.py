"""
Test suite for AfroCrown Salon Pricing Feature
Tests the custom pricing system where each salon can set their own prices for haircuts.

Endpoints tested:
- GET /api/salons/{salon_id}/pricing - Get all haircuts with base and salon prices
- PUT /api/salons/{salon_id}/pricing/{haircut_id} - Update price for a haircut
- DELETE /api/salons/{salon_id}/pricing/{haircut_id} - Reset to base price
- GET /api/salons/{salon_id}/haircuts-with-pricing - Get haircuts for booking with salon prices
- POST /api/appointments - Verify appointment uses salon price
"""

import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test salon from seed data
TEST_SALON_ID = "salon_934a31f6ee31"


class TestSalonPricingPublicEndpoints:
    """Tests for public pricing endpoints (no auth required)"""
    
    def test_get_salon_pricing_success(self):
        """Test GET /api/salons/{salon_id}/pricing returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "salon_id" in data, "Response should contain salon_id"
        assert "pricing" in data, "Response should contain pricing array"
        assert data["salon_id"] == TEST_SALON_ID, f"Expected salon_id {TEST_SALON_ID}"
        
        # Verify pricing is a list
        pricing = data["pricing"]
        assert isinstance(pricing, list), "pricing should be a list"
        assert len(pricing) > 0, "pricing should have haircuts"
        
        print(f"SUCCESS: Got {len(pricing)} haircuts in pricing list")
        
    def test_get_salon_pricing_structure(self):
        """Test that each haircut in pricing has required fields"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        
        assert response.status_code == 200
        
        data = response.json()
        pricing = data["pricing"]
        
        required_fields = ["haircut_id", "name", "base_price", "salon_price", "duration_minutes", "category", "is_available"]
        
        for haircut in pricing[:3]:  # Check first 3
            for field in required_fields:
                assert field in haircut, f"Haircut missing field: {field}"
            
            # Validate data types
            assert isinstance(haircut["haircut_id"], str), "haircut_id should be string"
            assert isinstance(haircut["name"], str), "name should be string"
            assert isinstance(haircut["base_price"], (int, float)), "base_price should be number"
            assert isinstance(haircut["salon_price"], (int, float)), "salon_price should be number"
            assert isinstance(haircut["duration_minutes"], int), "duration_minutes should be int"
            assert isinstance(haircut["is_available"], bool), "is_available should be bool"
            
            print(f"  - {haircut['name']}: base={haircut['base_price']}EUR, salon={haircut['salon_price']}EUR")
        
        print(f"SUCCESS: All haircuts have correct structure")
        
    def test_get_salon_pricing_invalid_salon(self):
        """Test pricing endpoint with invalid salon still works (returns empty pricing)"""
        response = requests.get(f"{BASE_URL}/api/salons/invalid_salon_xyz/pricing")
        
        # Should return 200 with empty pricing (since base haircuts are global)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "pricing" in data
        # Base haircuts should still be returned since they're global
        print(f"SUCCESS: Invalid salon returns pricing with {len(data['pricing'])} base haircuts")
    
    def test_get_haircuts_with_pricing_for_booking(self):
        """Test GET /api/salons/{salon_id}/haircuts-with-pricing for booking"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts-with-pricing")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have available haircuts"
        
        # Check structure for booking
        for haircut in data[:3]:
            assert "haircut_id" in haircut
            assert "name" in haircut
            assert "price" in haircut  # Should be salon_price, not base_price
            assert "duration_minutes" in haircut
            
            print(f"  - {haircut['name']}: {haircut['price']}EUR ({haircut['duration_minutes']}min)")
        
        print(f"SUCCESS: Got {len(data)} available haircuts for booking")


class TestSalonPricingAuthenticatedEndpoints:
    """Tests for authenticated pricing endpoints"""
    
    def test_update_single_price_requires_auth(self):
        """Test PUT /api/salons/{salon_id}/pricing/{haircut_id} requires authentication"""
        # Get a haircut_id first
        pricing_response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        pricing = pricing_response.json().get("pricing", [])
        
        if not pricing:
            pytest.skip("No haircuts available to test")
        
        haircut_id = pricing[0]["haircut_id"]
        
        # Try to update without auth
        response = requests.put(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing/{haircut_id}",
            json={"price": 99.99, "is_available": True}
        )
        
        assert response.status_code == 401, f"Expected 401 (unauthorized), got {response.status_code}"
        print("SUCCESS: PUT pricing requires authentication (401)")
        
    def test_delete_price_requires_auth(self):
        """Test DELETE /api/salons/{salon_id}/pricing/{haircut_id} requires authentication"""
        # Get a haircut_id first
        pricing_response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        pricing = pricing_response.json().get("pricing", [])
        
        if not pricing:
            pytest.skip("No haircuts available to test")
        
        haircut_id = pricing[0]["haircut_id"]
        
        # Try to delete without auth
        response = requests.delete(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing/{haircut_id}"
        )
        
        assert response.status_code == 401, f"Expected 401 (unauthorized), got {response.status_code}"
        print("SUCCESS: DELETE pricing requires authentication (401)")
        
    def test_bulk_update_pricing_requires_auth(self):
        """Test PUT /api/salons/{salon_id}/pricing (bulk) requires authentication"""
        response = requests.put(
            f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing",
            json={"prices": [{"haircut_id": "test", "price": 10.0, "is_available": True}]}
        )
        
        assert response.status_code == 401, f"Expected 401 (unauthorized), got {response.status_code}"
        print("SUCCESS: Bulk PUT pricing requires authentication (401)")


class TestAppointmentWithSalonPricing:
    """Tests to verify appointments use salon pricing"""
    
    def test_appointment_creation_price_structure(self):
        """Verify appointment endpoint exists and check if pricing is applied"""
        # First get a valid haircut and barber for the salon
        pricing_response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        pricing = pricing_response.json().get("pricing", [])
        
        if not pricing:
            pytest.skip("No haircuts available")
        
        # Get barbers
        barbers_response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers")
        barbers = barbers_response.json()
        
        if not barbers:
            pytest.skip("No barbers available")
        
        # Store for verification
        haircut = pricing[0]
        barber = barbers[0]
        
        print(f"Haircut: {haircut['name']} - base: {haircut['base_price']}EUR, salon: {haircut['salon_price']}EUR")
        print(f"Barber: {barber['name']}")
        
        # Create appointment (guest - no auth)
        appointment_data = {
            "salon_id": TEST_SALON_ID,
            "barber_id": barber["barber_id"],
            "haircut_id": haircut["haircut_id"],
            "appointment_date": "2026-02-15",
            "appointment_time": "14:00",
            "client_notes": "Test appointment for pricing verification"
        }
        
        response = requests.post(f"{BASE_URL}/api/appointments", json=appointment_data)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created_appointment = response.json()
        assert "appointment_id" in created_appointment, "Should have appointment_id"
        assert "total_price" in created_appointment, "Should have total_price"
        
        # Verify the price matches salon price (not base price)
        expected_price = haircut["salon_price"]
        actual_price = created_appointment["total_price"]
        
        assert actual_price == expected_price, f"Expected price {expected_price}, got {actual_price}"
        
        print(f"SUCCESS: Appointment created with salon price: {actual_price}EUR")
        print(f"  Appointment ID: {created_appointment['appointment_id']}")


class TestSalonPricingHaircutCount:
    """Test to verify the expected number of haircuts"""
    
    def test_expected_haircut_count(self):
        """Verify there are approximately 10 haircuts available as mentioned"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        
        assert response.status_code == 200
        
        data = response.json()
        pricing = data["pricing"]
        
        # Should have around 10 haircuts as mentioned in the request
        assert len(pricing) >= 5, f"Expected at least 5 haircuts, got {len(pricing)}"
        
        print(f"SUCCESS: Found {len(pricing)} haircuts")
        for h in pricing:
            custom_marker = "*" if h.get("has_custom_price") else ""
            salon_specific = "(salon-specific)" if h.get("is_salon_specific") else ""
            print(f"  - {h['name']}: {h['salon_price']}EUR{custom_marker} {salon_specific}")


class TestSalonPricingDataIntegrity:
    """Test data integrity of pricing system"""
    
    def test_price_values_are_valid(self):
        """Verify all prices are positive numbers"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        
        assert response.status_code == 200
        
        data = response.json()
        pricing = data["pricing"]
        
        for haircut in pricing:
            base = haircut["base_price"]
            salon = haircut["salon_price"]
            
            assert base >= 0, f"Base price should be >= 0, got {base}"
            assert salon >= 0, f"Salon price should be >= 0, got {salon}"
            assert haircut["duration_minutes"] > 0, "Duration should be > 0"
            
        print(f"SUCCESS: All {len(pricing)} haircuts have valid price values")
    
    def test_haircuts_with_pricing_matches_pricing_endpoint(self):
        """Verify haircuts-with-pricing returns same prices as pricing endpoint"""
        # Get full pricing
        pricing_response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/pricing")
        full_pricing = {h["haircut_id"]: h for h in pricing_response.json()["pricing"]}
        
        # Get booking pricing
        booking_response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts-with-pricing")
        booking_pricing = booking_response.json()
        
        # Verify prices match
        for booking_haircut in booking_pricing:
            haircut_id = booking_haircut["haircut_id"]
            if haircut_id in full_pricing:
                expected_price = full_pricing[haircut_id]["salon_price"]
                actual_price = booking_haircut["price"]
                assert expected_price == actual_price, f"Price mismatch for {haircut_id}: expected {expected_price}, got {actual_price}"
        
        print(f"SUCCESS: Booking prices match salon pricing ({len(booking_pricing)} haircuts)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

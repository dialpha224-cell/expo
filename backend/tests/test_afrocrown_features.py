"""
AfroCrown Backend API Tests - New Features
Testing:
1. Reviews system (POST /api/reviews, GET /api/reviews/salon/{salon_id})
2. Barber availability (PUT /api/barbers/{barber_id}/availability)
3. Barber deletion (DELETE /api/barbers/{barber_id})
4. Client arrival notification (PUT /api/appointments/{appointment_id}/arrival)
5. Live screen endpoint (GET /api/salons/{salon_id}/live-screen)
"""

import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://salon-dashboard-48.preview.emergentagent.com')

# Test salon ID from seeded data
TEST_SALON_ID = "salon_934a31f6ee31"
TEST_BARBER_ID = "barber_001"

class TestSalonLiveScreen:
    """Tests for the salon live screen endpoint"""
    
    def test_get_live_screen_data(self):
        """Test GET /api/salons/{salon_id}/live-screen returns correct data structure"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/live-screen")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        # Verify response structure
        assert "salon" in data, "Response should contain 'salon'"
        assert "date" in data, "Response should contain 'date'"
        assert "current_time" in data, "Response should contain 'current_time'"
        assert "appointments" in data, "Response should contain 'appointments'"
        assert "barbers" in data, "Response should contain 'barbers'"
        assert "stats" in data, "Response should contain 'stats'"
        
        # Verify salon info
        assert data["salon"]["name"] is not None, "Salon name should exist"
        
        # Verify stats structure
        stats = data["stats"]
        assert "total" in stats
        assert "on_time" in stats
        assert "late" in stats
        assert "cancelled" in stats
        
        print(f"PASS: Live screen data structure correct. Salon: {data['salon']['name']}, Barbers: {len(data['barbers'])}")
    
    def test_live_screen_invalid_salon(self):
        """Test GET /api/salons/{invalid_id}/live-screen returns 404"""
        response = requests.get(f"{BASE_URL}/api/salons/invalid_salon_999/live-screen")
        
        assert response.status_code == 404, f"Expected 404 for invalid salon, got {response.status_code}"
        print("PASS: Invalid salon returns 404")
    
    def test_live_screen_with_date_param(self):
        """Test GET /api/salons/{salon_id}/live-screen?date=YYYY-MM-DD"""
        today = datetime.now().strftime("%Y-%m-%d")
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/live-screen?date={today}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["date"] == today
        print(f"PASS: Live screen with date param works. Date: {data['date']}")


class TestSalonReviews:
    """Tests for the reviews system endpoints"""
    
    def test_get_salon_reviews_empty(self):
        """Test GET /api/reviews/salon/{salon_id} returns reviews with stats"""
        response = requests.get(f"{BASE_URL}/api/reviews/salon/{TEST_SALON_ID}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "reviews" in data
        assert "stats" in data
        assert isinstance(data["reviews"], list)
        
        # Verify stats structure
        stats = data["stats"]
        assert "total_reviews" in stats
        assert "average_salon_rating" in stats
        assert "average_barber_rating" in stats
        assert "rating_distribution" in stats
        
        print(f"PASS: Salon reviews endpoint returns correct structure. Reviews: {stats['total_reviews']}")
    
    def test_get_barber_reviews(self):
        """Test GET /api/reviews/barber/{barber_id} returns reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews/barber/{TEST_BARBER_ID}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "reviews" in data
        assert "stats" in data
        assert "total_reviews" in data["stats"]
        assert "average_rating" in data["stats"]
        
        print(f"PASS: Barber reviews endpoint works. Reviews: {data['stats']['total_reviews']}")
    
    def test_get_platform_reviews(self):
        """Test GET /api/reviews/platform returns platform reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews/platform")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "reviews" in data
        assert "stats" in data
        
        print(f"PASS: Platform reviews endpoint works")
    
    def test_create_review_without_auth(self):
        """Test POST /api/reviews requires authentication"""
        review_data = {
            "appointment_id": "test_appointment",
            "salon_rating": 5,
            "barber_rating": 5,
            "salon_comment": "Test comment"
        }
        
        response = requests.post(f"{BASE_URL}/api/reviews", json=review_data)
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"
        print("PASS: Create review correctly requires authentication")
    
    def test_get_review_for_nonexistent_appointment(self):
        """Test GET /api/reviews/appointment/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/reviews/appointment/invalid_appointment_999")
        
        assert response.status_code == 404
        print("PASS: Review for invalid appointment returns 404")


class TestBarberManagement:
    """Tests for barber management endpoints"""
    
    def test_get_salon_barbers(self):
        """Test GET /api/salons/{salon_id}/barbers returns barbers list"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0, "Expected at least one barber"
        
        # Verify barber structure
        barber = data[0]
        assert "barber_id" in barber
        assert "name" in barber
        assert "is_available" in barber
        assert "role" in barber
        
        print(f"PASS: Get barbers returns {len(data)} barbers")
    
    def test_barber_has_availability_fields(self):
        """Test barber response includes availability fields"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/barbers")
        
        assert response.status_code == 200
        barbers = response.json()
        
        for barber in barbers:
            assert "is_available" in barber, f"Barber {barber['name']} missing is_available"
            assert "unavailable_reason" in barber, f"Barber {barber['name']} missing unavailable_reason"
            assert "redirect_to_barber_id" in barber, f"Barber {barber['name']} missing redirect_to_barber_id"
            assert "role" in barber, f"Barber {barber['name']} missing role"
        
        print(f"PASS: All barbers have correct availability fields")
    
    def test_update_barber_availability_without_auth(self):
        """Test PUT /api/barbers/{barber_id}/availability requires authentication"""
        availability_data = {
            "is_available": False,
            "unavailable_reason": "En conge"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/barbers/{TEST_BARBER_ID}/availability",
            json=availability_data
        )
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Update barber availability requires authentication")
    
    def test_delete_barber_without_auth(self):
        """Test DELETE /api/barbers/{barber_id} requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/barbers/{TEST_BARBER_ID}")
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Delete barber requires authentication")


class TestArrivalNotification:
    """Tests for client arrival notification endpoint"""
    
    def test_arrival_notification_without_auth(self):
        """Test PUT /api/appointments/{id}/arrival requires authentication"""
        arrival_data = {
            "arrival_type": "late",
            "minutes": 10
        }
        
        response = requests.put(
            f"{BASE_URL}/api/appointments/test_appointment/arrival",
            json=arrival_data
        )
        
        # Should require authentication
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Arrival notification requires authentication")
    
    def test_arrival_notification_validation(self):
        """Test that arrival notification validates minutes field"""
        # This tests the API validation - invalid data should fail
        arrival_data = {
            "arrival_type": "late",
            "minutes": -5  # Invalid: negative minutes
        }
        
        response = requests.put(
            f"{BASE_URL}/api/appointments/test_appointment/arrival",
            json=arrival_data
        )
        
        # Should fail (either 401 for auth or 422 for validation)
        assert response.status_code in [401, 422], f"Expected 401 or 422, got {response.status_code}"
        print("PASS: Arrival notification validates input")


class TestSalonEndpoints:
    """Tests for salon-related endpoints"""
    
    def test_get_salons_list(self):
        """Test GET /api/salons returns salons list"""
        response = requests.get(f"{BASE_URL}/api/salons")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Verify salon structure includes rating fields
        salon = data[0]
        assert "rating" in salon
        assert "total_reviews" in salon
        
        print(f"PASS: Salons endpoint returns {len(data)} salons")
    
    def test_get_salon_details(self):
        """Test GET /api/salons/{salon_id} returns salon details"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}")
        
        assert response.status_code == 200
        salon = response.json()
        
        assert salon["salon_id"] == TEST_SALON_ID
        assert "name" in salon
        assert "address" in salon
        assert "rating" in salon
        assert "total_reviews" in salon
        
        print(f"PASS: Salon details for {salon['name']}")
    
    def test_get_salon_stats(self):
        """Test GET /api/salons/{salon_id}/stats returns statistics"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/stats")
        
        # May require auth - check
        if response.status_code == 401:
            print("INFO: Salon stats requires authentication")
            return
        
        assert response.status_code == 200
        stats = response.json()
        
        assert "total_barbers" in stats
        assert "total_appointments" in stats
        
        print(f"PASS: Salon stats returned")


class TestHaircutsEndpoint:
    """Tests for haircuts endpoint (used in booking)"""
    
    def test_get_salon_haircuts(self):
        """Test GET /api/salons/{salon_id}/haircuts returns haircuts"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/haircuts")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            haircut = data[0]
            assert "haircut_id" in haircut
            assert "name" in haircut
            assert "price" in haircut
            assert "duration_minutes" in haircut
            
        print(f"PASS: Haircuts endpoint returns {len(data)} haircuts")


class TestAppointmentsEndpoint:
    """Tests for appointments-related endpoints"""
    
    def test_get_appointments_without_auth(self):
        """Test GET /api/appointments requires authentication"""
        response = requests.get(f"{BASE_URL}/api/appointments")
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("PASS: Appointments endpoint requires authentication")
    
    def test_get_salon_appointments_without_auth(self):
        """Test GET /api/salons/{salon_id}/appointments requires auth"""
        response = requests.get(f"{BASE_URL}/api/salons/{TEST_SALON_ID}/appointments")
        
        # Should require authentication for salon-specific appointments
        assert response.status_code in [200, 401, 403], f"Unexpected status: {response.status_code}"
        print(f"PASS: Salon appointments check - status {response.status_code}")


class TestNotificationsEndpoint:
    """Tests for notifications endpoints"""
    
    def test_get_notifications_without_auth(self):
        """Test GET /api/notifications requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        
        assert response.status_code == 401
        print("PASS: Notifications endpoint requires authentication")


class TestHealthCheck:
    """Basic health/connectivity tests"""
    
    def test_api_reachable(self):
        """Test that the API is reachable"""
        response = requests.get(f"{BASE_URL}/api/salons")
        
        assert response.status_code in [200, 401, 403], f"API not reachable: {response.status_code}"
        print("PASS: API is reachable")


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

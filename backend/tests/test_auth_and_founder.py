"""
Tests for AfroCrown Authentication and Founder Role functionality
- Tests auth/me endpoint
- Tests founder role detection
- Tests protected routes
"""
import pytest
import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    # Fallback for testing
    BASE_URL = "https://salon-dashboard-48.preview.emergentagent.com"


class TestHealthEndpoint:
    """Health check tests - run first to verify API is up"""
    
    def test_health_endpoint(self):
        """Test API health check"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print(f"✓ Health endpoint working: {data}")


class TestAuthEndpoints:
    """Authentication endpoint tests"""
    
    def test_auth_me_unauthenticated(self):
        """Test /api/auth/me returns 401 when not authenticated"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ /api/auth/me correctly returns 401 for unauthenticated users")
    
    def test_auth_me_with_invalid_token(self):
        """Test /api/auth/me returns 401 with invalid token"""
        headers = {"Authorization": "Bearer invalid_token_12345"}
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 401
        print("✓ /api/auth/me correctly rejects invalid tokens")
    
    def test_auth_login_missing_credentials(self):
        """Test /api/auth/login with missing credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={})
        # Should return 422 (validation error) or 401
        assert response.status_code in [401, 422]
        print(f"✓ /api/auth/login correctly handles missing credentials: {response.status_code}")
    
    def test_auth_login_invalid_credentials(self):
        """Test /api/auth/login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ /api/auth/login correctly rejects invalid credentials")


class TestPublicEndpoints:
    """Public API endpoints that don't require auth"""
    
    def test_salons_list(self):
        """Test /api/salons returns salon list"""
        response = requests.get(f"{BASE_URL}/api/salons")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/salons returns {len(data)} salons")
    
    def test_products_list(self):
        """Test /api/products returns product list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/products returns {len(data)} products")
    
    def test_haircuts_list(self):
        """Test /api/haircuts returns haircut list"""
        response = requests.get(f"{BASE_URL}/api/haircuts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/haircuts returns {len(data)} haircuts")
    
    def test_trimconnect_entries(self):
        """Test /api/trimconnect/entries returns entry list"""
        response = requests.get(f"{BASE_URL}/api/trimconnect/entries")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/trimconnect/entries returns {len(data)} entries")
    
    def test_trimconnect_leaderboard(self):
        """Test /api/trimconnect/leaderboard returns leaderboard"""
        response = requests.get(f"{BASE_URL}/api/trimconnect/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ /api/trimconnect/leaderboard returns {len(data)} entries")


class TestProtectedEndpoints:
    """Protected endpoint tests - should return 401 without auth"""
    
    def test_founder_users_requires_auth(self):
        """Test /api/founder/users requires founder auth"""
        response = requests.get(f"{BASE_URL}/api/founder/users")
        assert response.status_code == 401
        print("✓ /api/founder/users correctly requires authentication")
    
    def test_founder_stats_requires_auth(self):
        """Test /api/founder/stats requires founder auth"""
        response = requests.get(f"{BASE_URL}/api/founder/stats")
        assert response.status_code == 401
        print("✓ /api/founder/stats correctly requires authentication")
    
    def test_appointments_requires_auth(self):
        """Test /api/appointments requires auth"""
        response = requests.get(f"{BASE_URL}/api/appointments")
        assert response.status_code == 401
        print("✓ /api/appointments correctly requires authentication")


class TestSalonEndpoints:
    """Salon-specific endpoint tests"""
    
    def test_get_salon_by_id(self):
        """Test getting salon by ID"""
        # First get list of salons
        salons_response = requests.get(f"{BASE_URL}/api/salons")
        assert salons_response.status_code == 200
        salons = salons_response.json()
        
        if len(salons) > 0:
            salon_id = salons[0].get("salon_id")
            response = requests.get(f"{BASE_URL}/api/salons/{salon_id}")
            assert response.status_code == 200
            data = response.json()
            assert data.get("salon_id") == salon_id
            print(f"✓ Get salon by ID working: {data.get('name')}")
        else:
            pytest.skip("No salons available to test")
    
    def test_get_salon_barbers(self):
        """Test getting barbers for a salon"""
        salons_response = requests.get(f"{BASE_URL}/api/salons")
        assert salons_response.status_code == 200
        salons = salons_response.json()
        
        if len(salons) > 0:
            salon_id = salons[0].get("salon_id")
            response = requests.get(f"{BASE_URL}/api/salons/{salon_id}/barbers")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Get salon barbers working: {len(data)} barbers")
        else:
            pytest.skip("No salons available to test")
    
    def test_get_salon_haircuts(self):
        """Test getting haircuts for a salon"""
        salons_response = requests.get(f"{BASE_URL}/api/salons")
        assert salons_response.status_code == 200
        salons = salons_response.json()
        
        if len(salons) > 0:
            salon_id = salons[0].get("salon_id")
            response = requests.get(f"{BASE_URL}/api/salons/{salon_id}/haircuts")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            print(f"✓ Get salon haircuts working: {len(data)} haircuts")
        else:
            pytest.skip("No salons available to test")


class TestProductFiltering:
    """Product filtering tests"""
    
    def test_products_filter_by_category(self):
        """Test filtering products by category"""
        categories = ["hair_care", "styling", "tools", "accessories"]
        
        for category in categories:
            response = requests.get(f"{BASE_URL}/api/products?category={category}")
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)
            # All returned products should have the specified category
            for product in data:
                assert product.get("category") == category
            print(f"✓ Product filtering for '{category}': {len(data)} products")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

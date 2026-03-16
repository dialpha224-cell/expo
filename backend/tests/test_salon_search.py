"""
Test Salon Search & Location API Endpoints
These tests verify the salon search functionality including:
- GET /api/salons/locations/countries - List countries with salons
- GET /api/salons/locations/cities - List cities, optionally filtered by country
- GET /api/salons/search - Search salons by country/city
- GET /api/salons - List all salons
- GET /api/salons/{salon_id} - Get salon details
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSalonLocationAPIs:
    """Test salon location and search endpoints"""
    
    def test_get_countries_returns_list(self):
        """GET /api/salons/locations/countries should return list of countries"""
        response = requests.get(f"{BASE_URL}/api/salons/locations/countries")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/salons/locations/countries - returned {len(data)} countries: {data}")
        
        # Should include France based on seed data
        if data:
            assert "France" in data, f"Expected 'France' in countries list: {data}"
            print("✓ France found in countries list")

    def test_get_cities_for_country(self):
        """GET /api/salons/locations/cities?country=France should return cities"""
        response = requests.get(f"{BASE_URL}/api/salons/locations/cities?country=France")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/salons/locations/cities?country=France - returned {len(data)} cities: {data}")
        
        # Should include Paris and Lyon based on seed data
        if data:
            assert "Paris" in data or "Lyon" in data, f"Expected 'Paris' or 'Lyon' in cities: {data}"
            print("✓ Paris or Lyon found in cities for France")

    def test_get_all_cities_without_filter(self):
        """GET /api/salons/locations/cities without filter should return all cities"""
        response = requests.get(f"{BASE_URL}/api/salons/locations/cities")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/salons/locations/cities (no filter) - returned {len(data)} cities: {data}")

    def test_search_salons_by_city(self):
        """GET /api/salons/search?city=Paris should return salons in Paris"""
        response = requests.get(f"{BASE_URL}/api/salons/search?city=Paris")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/salons/search?city=Paris - returned {len(data)} salons")
        
        # Verify salon structure if results found
        if data:
            salon = data[0]
            assert "salon_id" in salon, "Salon should have salon_id"
            assert "name" in salon, "Salon should have name"
            print(f"  First salon: {salon.get('name')} ({salon.get('city', 'N/A')})")

    def test_search_salons_by_country(self):
        """GET /api/salons/search?country=France should return salons in France"""
        response = requests.get(f"{BASE_URL}/api/salons/search?country=France")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        print(f"✓ GET /api/salons/search?country=France - returned {len(data)} salons")

    def test_search_salons_no_results(self):
        """GET /api/salons/search?city=NonExistentCity should return empty list"""
        response = requests.get(f"{BASE_URL}/api/salons/search?city=NonExistentCity12345")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) == 0, f"Expected empty list for non-existent city, got {len(data)} results"
        print("✓ GET /api/salons/search?city=NonExistentCity - returned empty list as expected")


class TestSalonListAndDetailAPIs:
    """Test salon listing and detail endpoints"""
    
    def test_list_all_salons(self):
        """GET /api/salons should return list of all salons"""
        response = requests.get(f"{BASE_URL}/api/salons")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)}"
        assert len(data) > 0, "Expected at least one salon in the list"
        print(f"✓ GET /api/salons - returned {len(data)} salons")
        
        # Verify salon structure
        salon = data[0]
        required_fields = ["salon_id", "name", "address"]
        for field in required_fields:
            assert field in salon, f"Salon should have {field}"
        print(f"  First salon: {salon.get('name')}")
        
        return data[0]["salon_id"]  # Return for use in other tests

    def test_get_salon_details(self):
        """GET /api/salons/{salon_id} should return salon details"""
        # First get a salon ID from the list
        list_response = requests.get(f"{BASE_URL}/api/salons")
        assert list_response.status_code == 200
        salons = list_response.json()
        assert len(salons) > 0, "Need at least one salon to test details"
        
        salon_id = salons[0]["salon_id"]
        
        # Get salon details
        response = requests.get(f"{BASE_URL}/api/salons/{salon_id}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "salon_id" in data, "Response should have salon_id"
        assert data["salon_id"] == salon_id, "Salon ID should match"
        print(f"✓ GET /api/salons/{salon_id} - returned salon: {data.get('name')}")

    def test_get_salon_not_found(self):
        """GET /api/salons/{invalid_id} should return 404"""
        response = requests.get(f"{BASE_URL}/api/salons/nonexistent_salon_123")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        print("✓ GET /api/salons/nonexistent_salon_123 - returned 404 as expected")


class TestRoutingNotIntercepted:
    """Verify static routes are not intercepted by dynamic {salon_id} route"""
    
    def test_locations_countries_not_intercepted(self):
        """Verify /api/salons/locations/countries is NOT treated as salon_id='locations'"""
        response = requests.get(f"{BASE_URL}/api/salons/locations/countries")
        # Should return 200 with list, NOT 404 (which would happen if treated as salon_id)
        assert response.status_code == 200, f"Route intercepted! Got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)} - route may be intercepted"
        print("✓ /api/salons/locations/countries NOT intercepted by dynamic route")

    def test_locations_cities_not_intercepted(self):
        """Verify /api/salons/locations/cities is NOT treated as salon_id='locations'"""
        response = requests.get(f"{BASE_URL}/api/salons/locations/cities")
        assert response.status_code == 200, f"Route intercepted! Got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)} - route may be intercepted"
        print("✓ /api/salons/locations/cities NOT intercepted by dynamic route")

    def test_search_not_intercepted(self):
        """Verify /api/salons/search is NOT treated as salon_id='search'"""
        response = requests.get(f"{BASE_URL}/api/salons/search")
        assert response.status_code == 200, f"Route intercepted! Got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), f"Expected list, got {type(data)} - route may be intercepted"
        print("✓ /api/salons/search NOT intercepted by dynamic route")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

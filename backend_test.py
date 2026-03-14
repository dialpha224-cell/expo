import requests
import sys
from datetime import datetime

class AfroCrownAPITester:
    def __init__(self, base_url="https://salon-dashboard-48.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.salon_data = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    json_response = response.json()
                    print(f"   Response: {json_response}")
                    return True, json_response
                except:
                    return True, {"message": "Non-JSON response"}
            else:
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200] if response.text else "No response"
                })
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                return False, {"error": response.text[:200]}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            print(f"❌ FAILED - Error: {str(e)}")
            return False, {"error": str(e)}

    def test_health_endpoints(self):
        """Test health and root endpoints"""
        print("\n=== TESTING HEALTH ENDPOINTS ===")
        self.run_test("API Health Check", "GET", "health", 200)
        self.run_test("API Root", "GET", "", 200)
        
    def test_public_endpoints(self):
        """Test public endpoints that don't require authentication"""
        print("\n=== TESTING PUBLIC ENDPOINTS ===")
        
        # Test salons list - should return 2 salons (Afro Barber MLK, Baggio Barber Shop)
        success, salons = self.run_test("Salons List", "GET", "salons", 200)
        if success and isinstance(salons, list):
            print(f"   Found {len(salons)} salons")
            if len(salons) != 2:
                print(f"   ⚠️  Expected 2 salons, got {len(salons)}")
            self.salon_data = salons
        
        # Test products list - should return 8 products
        success, products = self.run_test("Products List", "GET", "products", 200)
        if success and isinstance(products, list):
            print(f"   Found {len(products)} products")
            if len(products) != 8:
                print(f"   ⚠️  Expected 8 products, got {len(products)}")
        
        # Test haircuts list - should return 7 haircuts
        success, haircuts = self.run_test("Haircuts List", "GET", "haircuts", 200)
        if success and isinstance(haircuts, list):
            print(f"   Found {len(haircuts)} haircuts")
            if len(haircuts) != 7:
                print(f"   ⚠️  Expected 7 haircuts, got {len(haircuts)}")
        
        # Test TrimConnect entries
        self.run_test("TrimConnect Entries", "GET", "trimconnect/entries", 200)
        
        # Test TrimConnect leaderboard
        self.run_test("TrimConnect Leaderboard", "GET", "trimconnect/leaderboard", 200)
        
        # Test Hall of Fame
        self.run_test("TrimConnect Hall of Fame", "GET", "trimconnect/hall-of-fame", 200)

    def test_salon_specific_endpoints(self):
        """Test salon-specific endpoints for the 2 demo salons"""
        print("\n=== TESTING SALON-SPECIFIC ENDPOINTS ===")
        
        if not self.salon_data:
            print("   ⚠️  No salon data available, skipping salon-specific tests")
            return
            
        for salon in self.salon_data:
            salon_id = salon.get('salon_id')
            salon_name = salon.get('name', 'Unknown')
            print(f"   Testing salon: {salon_name} (ID: {salon_id})")
            
            # Test barbers for this salon
            success, barbers = self.run_test(f"Barbers for {salon_name}", "GET", f"salons/{salon_id}/barbers", 200)
            if success and isinstance(barbers, list):
                print(f"     Found {len(barbers)} barbers")
            
            # Test haircuts for this salon
            success, haircuts = self.run_test(f"Haircuts for {salon_name}", "GET", f"salons/{salon_id}/haircuts", 200)
            if success and isinstance(haircuts, list):
                print(f"     Found {len(haircuts)} haircuts")

    def test_category_filtering(self):
        """Test product category filtering"""
        print("\n=== TESTING CATEGORY FILTERING ===")
        categories = ["hair_care", "styling", "tools", "accessories"]
        
        for category in categories:
            self.run_test(f"Products - {category} category", "GET", f"products?category={category}", 200)

    def test_auth_protected_endpoints(self):
        """Test endpoints that require authentication - should return 401"""
        print("\n=== TESTING AUTH PROTECTED ENDPOINTS ===")
        
        # Test auth/me without token
        self.run_test("Auth Me (No Token)", "GET", "auth/me", 401)
        
        # Test protected endpoints
        protected_endpoints = [
            ("Create TrimConnect Entry", "POST", "trimconnect/entries", {"title": "Test", "image_url": "test.jpg"}),
            ("Vote for Entry", "POST", "trimconnect/vote", {"entry_id": "test_id"}),
            ("Create Product", "POST", "products", {"name": "Test Product", "price": 10.0}),
            ("Get Appointments", "GET", "appointments", None),
        ]
        
        for name, method, endpoint, data in protected_endpoints:
            self.run_test(f"{name} (No Auth)", method, endpoint, 401, data)

    def test_founder_protected_endpoints(self):
        """Test endpoints that require founder role - should return 401 for no auth"""
        print("\n=== TESTING FOUNDER PROTECTED ENDPOINTS ===")
        
        founder_endpoints = [
            ("Create Salon", "POST", "salons", {"name": "Test Salon", "address": "Test Address", "phone": "123456"}),
            ("Get All Users", "GET", "founder/users", None),
            ("Get Global Stats", "GET", "founder/stats", None),
        ]
        
        for name, method, endpoint, data in founder_endpoints:
            self.run_test(f"{name} (No Auth)", method, endpoint, 401, data)

    def test_invalid_endpoints(self):
        """Test invalid endpoints - should return 404"""
        print("\n=== TESTING INVALID ENDPOINTS ===")
        
        invalid_endpoints = [
            "nonexistent",
            "invalid/path",
            "salons/invalid_id",
            "products/invalid_id"
        ]
        
        for endpoint in invalid_endpoints:
            self.run_test(f"Invalid Endpoint: {endpoint}", "GET", endpoint, 404)

def main():
    """Main test runner"""
    print("🚀 Starting AfroCrown API Testing...")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Initialize tester
    tester = AfroCrownAPITester()
    
    # Run test suites
    try:
        tester.test_health_endpoints()
        tester.test_public_endpoints() 
        tester.test_salon_specific_endpoints()
        tester.test_category_filtering()
        tester.test_auth_protected_endpoints()
        tester.test_founder_protected_endpoints()
        tester.test_invalid_endpoints()
        
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {str(e)}")
        return 1

    # Print results summary
    print(f"\n{'='*50}")
    print("📊 TEST RESULTS SUMMARY")
    print(f"{'='*50}")
    print(f"✅ Tests Passed: {tester.tests_passed}")
    print(f"❌ Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"📈 Total Tests: {tester.tests_run}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📊 Success Rate: {success_rate:.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS DETAILS:")
        for i, failed in enumerate(tester.failed_tests, 1):
            print(f"  {i}. {failed.get('test', 'Unknown')}")
            if 'endpoint' in failed:
                print(f"     Endpoint: {failed['endpoint']}")
            if 'expected' in failed and 'actual' in failed:
                print(f"     Expected: {failed['expected']}, Got: {failed['actual']}")
            if 'error' in failed:
                print(f"     Error: {failed['error']}")
            if 'response' in failed:
                print(f"     Response: {failed['response']}")
            print()
    
    print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Return exit code
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
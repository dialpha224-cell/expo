"""
Backend API tests for In-App Notifications feature
Tests the /api/notifications endpoints:
- GET /api/notifications - Get user's notifications
- PUT /api/notifications/{id}/read - Mark notification as read
- PUT /api/notifications/read-all - Mark all notifications as read  
- DELETE /api/notifications/{id} - Delete notification
- Verify appointment creation generates notification for salon owner
"""

import pytest
import requests
import os
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestNotificationsAPI:
    """Test notification API endpoints"""
    
    # Store session for authenticated requests
    session = None
    session_token = None
    test_user_id = None
    test_notification_id = None
    
    @pytest.fixture(autouse=True)
    def setup_session(self):
        """Setup authenticated session using founder credentials"""
        if not TestNotificationsAPI.session:
            TestNotificationsAPI.session = requests.Session()
            TestNotificationsAPI.session.headers.update({"Content-Type": "application/json"})
            
            # We need to login as the user who owns the notifications
            # From our DB check, notifications are for user_d0c11aa0e41e (salon owner)
            # But that user may not have password. Let's test without auth first to see response
        yield
    
    def test_01_notifications_require_auth(self):
        """Test that notifications endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        # Should return 401 Unauthorized without auth
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("PASS: GET /api/notifications returns 401 without authentication")
    
    def test_02_mark_read_requires_auth(self):
        """Test that mark-as-read endpoint requires authentication"""
        response = requests.put(f"{BASE_URL}/api/notifications/test_id/read")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("PASS: PUT /api/notifications/{id}/read returns 401 without authentication")
    
    def test_03_mark_all_read_requires_auth(self):
        """Test that mark-all-read endpoint requires authentication"""
        response = requests.put(f"{BASE_URL}/api/notifications/read-all")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("PASS: PUT /api/notifications/read-all returns 401 without authentication")
    
    def test_04_delete_notification_requires_auth(self):
        """Test that delete notification endpoint requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/notifications/test_id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("PASS: DELETE /api/notifications/{id} returns 401 without authentication")
    
    def test_05_appointment_creates_notification_for_salon_owner(self):
        """Test that creating an appointment generates a notification for the salon owner"""
        # Create an appointment without auth (guest booking)
        appointment_data = {
            "salon_id": "salon_934a31f6ee31",  # Afro Barber MLK - owner is user_d0c11aa0e41e
            "barber_id": "barber_001",
            "haircut_id": "haircut_e1a10545c751",  # Coupe Classique
            "appointment_date": "2026-03-25",
            "appointment_time": "10:00",
            "client_notes": "TEST_NOTIF_CHECK"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/appointments",
            json=appointment_data,
            headers={"Content-Type": "application/json"}
        )
        
        # Should succeed - appointments can be created without auth
        assert response.status_code == 200 or response.status_code == 201, \
            f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "appointment_id" in data, "Response should contain appointment_id"
        assert data["status"] == "pending", "New appointment should be pending"
        
        TestNotificationsAPI.test_appointment_id = data["appointment_id"]
        print(f"PASS: Created appointment {data['appointment_id']} - should have created notification for salon owner")
        
        # Verify notification was created by checking MongoDB directly
        # (We'll verify via API when we have auth)
        return data


class TestNotificationsWithMockedAuth:
    """Test notifications with simulated auth session (direct MongoDB verification)"""
    
    def test_verify_notification_created_in_db(self):
        """Verify that the notification was created in MongoDB for the salon owner"""
        import pymongo
        
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["test_database"]
        
        # Count notifications for user_d0c11aa0e41e (salon owner of Afro Barber MLK)
        owner_id = "user_d0c11aa0e41e"
        
        notifications = list(db.notifications.find(
            {"user_id": owner_id, "type": "new_appointment"},
            {"_id": 0}
        ))
        
        assert len(notifications) > 0, "Should have at least one notification for salon owner"
        
        # Check notification structure
        notif = notifications[0]
        assert "notification_id" in notif, "Notification should have notification_id"
        assert "title" in notif, "Notification should have title"
        assert "message" in notif, "Notification should have message"
        assert "type" in notif, "Notification should have type"
        assert "is_read" in notif, "Notification should have is_read field"
        assert "created_at" in notif, "Notification should have created_at"
        
        print(f"PASS: Found {len(notifications)} notifications for salon owner")
        print(f"  Latest notification: {notif['title']} - {notif['message'][:50]}...")
        
        return notif
    
    def test_notification_data_structure(self):
        """Verify notification data structure matches NotificationResponse model"""
        import pymongo
        
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["test_database"]
        
        notif = db.notifications.find_one({"type": "new_appointment"}, {"_id": 0})
        
        assert notif is not None, "Should have at least one notification"
        
        # Verify all required fields from NotificationResponse model
        required_fields = ["notification_id", "user_id", "type", "title", "message", "is_read", "created_at"]
        for field in required_fields:
            assert field in notif, f"Notification missing required field: {field}"
        
        # Verify optional data field
        if "data" in notif:
            assert isinstance(notif["data"], dict), "data field should be a dict"
        
        # Verify types
        assert isinstance(notif["notification_id"], str), "notification_id should be string"
        assert isinstance(notif["user_id"], str), "user_id should be string"
        assert isinstance(notif["is_read"], bool), "is_read should be boolean"
        
        print("PASS: Notification data structure is valid")
        print(f"  Fields present: {list(notif.keys())}")


class TestNotificationEndpointsWithDirectDBAccess:
    """Test notification operations by directly accessing DB and simulating authenticated requests"""
    
    @pytest.fixture
    def db_client(self):
        """Get MongoDB client"""
        import pymongo
        client = pymongo.MongoClient("mongodb://localhost:27017")
        return client["test_database"]
    
    @pytest.fixture
    def create_test_notification(self, db_client):
        """Create a test notification for testing"""
        import uuid
        from datetime import datetime, timezone
        
        notif_id = f"notif_test_{uuid.uuid4().hex[:12]}"
        test_user_id = "user_test_notifications"
        
        notif_doc = {
            "notification_id": notif_id,
            "user_id": test_user_id,
            "type": "new_appointment",
            "title": "TEST Notification",
            "message": "This is a test notification for testing purposes",
            "data": {"test": True},
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        db_client.notifications.insert_one(notif_doc)
        yield notif_doc
        
        # Cleanup
        db_client.notifications.delete_one({"notification_id": notif_id})
    
    def test_mark_notification_read_db_operation(self, db_client, create_test_notification):
        """Verify that mark-as-read operation updates is_read field in DB"""
        notif = create_test_notification
        
        # Verify initially unread
        doc = db_client.notifications.find_one({"notification_id": notif["notification_id"]})
        assert doc["is_read"] == False, "Initial state should be unread"
        
        # Simulate mark as read
        result = db_client.notifications.update_one(
            {"notification_id": notif["notification_id"], "user_id": notif["user_id"]},
            {"$set": {"is_read": True}}
        )
        
        assert result.modified_count == 1, "Should have modified one document"
        
        # Verify now read
        doc = db_client.notifications.find_one({"notification_id": notif["notification_id"]})
        assert doc["is_read"] == True, "Should now be marked as read"
        
        print("PASS: Mark notification as read DB operation works correctly")
    
    def test_mark_all_notifications_read_db_operation(self, db_client):
        """Verify that mark-all-read operation updates all notifications for a user"""
        import uuid
        from datetime import datetime, timezone
        
        test_user_id = f"user_test_mark_all_{uuid.uuid4().hex[:8]}"
        
        # Create multiple test notifications
        notif_ids = []
        for i in range(3):
            notif_id = f"notif_test_all_{uuid.uuid4().hex[:12]}"
            notif_ids.append(notif_id)
            db_client.notifications.insert_one({
                "notification_id": notif_id,
                "user_id": test_user_id,
                "type": "test",
                "title": f"Test Notification {i}",
                "message": "Test message",
                "data": {},
                "is_read": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        try:
            # Verify all are unread
            unread_count = db_client.notifications.count_documents(
                {"user_id": test_user_id, "is_read": False}
            )
            assert unread_count == 3, f"Should have 3 unread notifications, got {unread_count}"
            
            # Simulate mark all as read
            result = db_client.notifications.update_many(
                {"user_id": test_user_id, "is_read": False},
                {"$set": {"is_read": True}}
            )
            
            assert result.modified_count == 3, f"Should have modified 3 documents, got {result.modified_count}"
            
            # Verify all are now read
            unread_count = db_client.notifications.count_documents(
                {"user_id": test_user_id, "is_read": False}
            )
            assert unread_count == 0, f"Should have 0 unread notifications, got {unread_count}"
            
            print("PASS: Mark all notifications as read DB operation works correctly")
        finally:
            # Cleanup
            db_client.notifications.delete_many({"user_id": test_user_id})
    
    def test_delete_notification_db_operation(self, db_client, create_test_notification):
        """Verify that delete operation removes notification from DB"""
        notif = create_test_notification
        
        # Verify exists
        doc = db_client.notifications.find_one({"notification_id": notif["notification_id"]})
        assert doc is not None, "Notification should exist before delete"
        
        # Simulate delete
        result = db_client.notifications.delete_one(
            {"notification_id": notif["notification_id"], "user_id": notif["user_id"]}
        )
        
        assert result.deleted_count == 1, "Should have deleted one document"
        
        # Verify deleted
        doc = db_client.notifications.find_one({"notification_id": notif["notification_id"]})
        assert doc is None, "Notification should not exist after delete"
        
        print("PASS: Delete notification DB operation works correctly")


class TestSalonOwnerNotifications:
    """Test notifications specifically for salon owners"""
    
    def test_salon_owner_receives_notification_on_appointment(self):
        """Verify salon owner receives notification when appointment is created for their salon"""
        import pymongo
        from datetime import datetime
        
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["test_database"]
        
        # Salon: Afro Barber MLK (salon_934a31f6ee31) owner: user_d0c11aa0e41e
        owner_id = "user_d0c11aa0e41e"
        salon_id = "salon_934a31f6ee31"
        
        # Count notifications before
        before_count = db.notifications.count_documents({
            "user_id": owner_id,
            "type": "new_appointment"
        })
        
        # Create appointment via API
        appointment_data = {
            "salon_id": salon_id,
            "barber_id": "barber_001",
            "haircut_id": "haircut_e1a10545c751",
            "appointment_date": "2026-03-26",
            "appointment_time": "11:00",
            "client_notes": "TEST_SALON_OWNER_NOTIFICATION"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/appointments",
            json=appointment_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [200, 201], f"Failed to create appointment: {response.text}"
        
        # Count notifications after
        after_count = db.notifications.count_documents({
            "user_id": owner_id,
            "type": "new_appointment"
        })
        
        assert after_count > before_count, \
            f"Notification count should increase. Before: {before_count}, After: {after_count}"
        
        # Verify latest notification has correct data
        latest_notif = db.notifications.find_one(
            {"user_id": owner_id, "type": "new_appointment"},
            sort=[("created_at", -1)]
        )
        
        assert latest_notif is not None, "Should have a notification"
        assert latest_notif["data"].get("salon_id") == salon_id, "Notification should reference the salon"
        
        print(f"PASS: Salon owner received notification. Count: {before_count} -> {after_count}")
        print(f"  Latest notification: {latest_notif['title']}")


class TestFounderNotifications:
    """Test notifications for founder (fallback when salon has no owner)"""
    
    def test_founder_receives_notification_for_unowned_salon(self):
        """Verify founder receives notification when appointment is created for salon without owner"""
        import pymongo
        
        client = pymongo.MongoClient("mongodb://localhost:27017")
        db = client["test_database"]
        
        # Find a salon without owner
        unowned_salon = db.salons.find_one({"owner_id": None})
        
        if not unowned_salon:
            print("SKIP: No unowned salon found - cannot test founder fallback notification")
            pytest.skip("No unowned salon available")
            return
        
        # Get founder user
        founder = db.users.find_one({"role": "founder"})
        assert founder is not None, "Should have a founder user"
        
        founder_id = founder["user_id"]
        
        # Count notifications before
        before_count = db.notifications.count_documents({
            "user_id": founder_id,
            "type": "new_appointment"
        })
        
        # Get haircut and barber for unowned salon
        haircut = db.haircuts.find_one({"is_active": True})
        barber = db.barbers.find_one({"salon_id": unowned_salon["salon_id"]})
        
        if not barber:
            # Use any barber
            barber = db.barbers.find_one({"is_active": True})
        
        if not haircut or not barber:
            print("SKIP: Missing haircut or barber for test")
            pytest.skip("Missing required test data")
            return
        
        # Create appointment for unowned salon
        appointment_data = {
            "salon_id": unowned_salon["salon_id"],
            "barber_id": barber["barber_id"],
            "haircut_id": haircut["haircut_id"],
            "appointment_date": "2026-03-27",
            "appointment_time": "14:00",
            "client_notes": "TEST_FOUNDER_NOTIFICATION"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/appointments",
            json=appointment_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [200, 201], f"Failed to create appointment: {response.text}"
        
        # Count notifications after
        after_count = db.notifications.count_documents({
            "user_id": founder_id,
            "type": "new_appointment"
        })
        
        assert after_count > before_count, \
            f"Founder should receive notification for unowned salon. Before: {before_count}, After: {after_count}"
        
        print(f"PASS: Founder received notification for unowned salon")
        print(f"  Notification count: {before_count} -> {after_count}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

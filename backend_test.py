#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Ecoleaf Cloud Application
Tests all authentication, file management, notes, texts, user profile, settings, storage stats, and analytics endpoints
"""

import requests
import sys
import json
import os
import tempfile
from datetime import datetime

class EcoleafCloudAPITester:
    def __init__(self):
        # Get backend URL from frontend .env file
        try:
            with open('/app/frontend/.env', 'r') as f:
                for line in f:
                    if line.startswith('REACT_APP_BACKEND_URL='):
                        backend_url = line.split('=', 1)[1].strip()
                        self.base_url = f"{backend_url}/api"
                        break
                else:
                    raise Exception("REACT_APP_BACKEND_URL not found in frontend/.env")
        except Exception as e:
            print(f"❌ Error reading backend URL: {e}")
            self.base_url = "http://localhost:8001/api"  # fallback
        
        print(f"🔗 Using backend URL: {self.base_url}")
        
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.uploaded_file_id = None
        self.created_note_id = None
        self.created_text_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details and not success:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        
        # Default headers
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        # Merge with provided headers
        if headers:
            default_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            default_headers.pop('Content-Type', None)

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=default_headers)
                else:
                    response = requests.post(url, json=data, headers=default_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            if not success:
                details = f"Expected {expected_status}, got {response.status_code}. Response: {json.dumps(response_data, indent=2)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test(name, success, details)
            
            return success, response_data

        except Exception as e:
            error_details = f"Exception: {str(e)}"
            self.log_test(name, False, error_details)
            return False, {}

    # ===== SERVER HEALTH =====
    def test_server_health(self):
        """Test if server is running"""
        return self.run_test("Server Health Check", "GET", "", 200)

    # ===== AUTHENTICATION TESTS =====
    def test_register_new_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"ecoleaf_user_{timestamp}@example.com"
        test_password = "EcoleafPass123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={"email": test_email, "password": test_password}
        )
        
        if success:
            self.test_email = test_email
            self.test_password = test_password
        
        return success

    def test_login_valid_user(self):
        """Test login with valid credentials"""
        if not hasattr(self, 'test_email'):
            return False
            
        success, response = self.run_test(
            "Valid User Login",
            "POST",
            "auth/login",
            200,
            data={"email": self.test_email, "password": self.test_password}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            if 'user' in response and 'id' in response['user']:
                self.user_id = response['user']['id']
        
        return success

    def test_login_invalid_email(self):
        """Test login with non-existent email"""
        return self.run_test(
            "Invalid Email Login",
            "POST",
            "auth/login",
            404,
            data={"email": "nonexistent@example.com", "password": "TestPass123!"}
        )[0]

    def test_phone_login_missing_fields(self):
        """Test phone login with missing fields"""
        return self.run_test(
            "Phone Login Missing Fields",
            "POST",
            "auth/phone-login",
            400,
            data={"idToken": "dummy_token"}
        )[0]

    # ===== USER PROFILE TESTS =====
    def test_get_user_profile(self):
        """Test getting user profile"""
        if not self.token:
            return False
            
        return self.run_test(
            "Get User Profile",
            "GET",
            "user/profile",
            200
        )[0]

    def test_update_user_profile(self):
        """Test updating user profile"""
        if not self.token:
            return False
            
        return self.run_test(
            "Update User Profile",
            "PUT",
            "user/profile",
            200,
            data={"displayName": "Ecoleaf Test User"}
        )[0]

    # ===== USER SETTINGS TESTS (NEW) =====
    def test_update_user_settings_theme(self):
        """Test updating user theme setting"""
        if not self.token:
            return False
            
        return self.run_test(
            "Update User Settings - Theme",
            "PUT",
            "user/settings",
            200,
            data={"theme": "dark"}
        )[0]

    def test_update_user_settings_layout(self):
        """Test updating user layout preference"""
        if not self.token:
            return False
            
        return self.run_test(
            "Update User Settings - Layout",
            "PUT",
            "user/settings",
            200,
            data={"layoutPreference": "list"}
        )[0]

    def test_update_user_settings_sidebar(self):
        """Test updating sidebar collapsed setting"""
        if not self.token:
            return False
            
        return self.run_test(
            "Update User Settings - Sidebar",
            "PUT",
            "user/settings",
            200,
            data={"sidebarCollapsed": True}
        )[0]

    def test_update_user_settings_analytics(self):
        """Test updating analytics auto refresh setting"""
        if not self.token:
            return False
            
        return self.run_test(
            "Update User Settings - Analytics",
            "PUT",
            "user/settings",
            200,
            data={"analyticsAutoRefresh": False}
        )[0]

    def test_update_user_settings_multiple(self):
        """Test updating multiple user settings at once"""
        if not self.token:
            return False
            
        return self.run_test(
            "Update User Settings - Multiple",
            "PUT",
            "user/settings",
            200,
            data={
                "theme": "light",
                "layoutPreference": "grid",
                "sidebarCollapsed": False,
                "analyticsAutoRefresh": True
            }
        )[0]

    def test_verify_settings_in_profile(self):
        """Test that settings are returned in user profile"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Verify Settings in Profile",
            "GET",
            "user/profile",
            200
        )
        
        if success and 'user' in response and 'settings' in response['user']:
            settings = response['user']['settings']
            has_required_settings = all(key in settings for key in ['theme', 'layoutPreference', 'sidebarCollapsed', 'analyticsAutoRefresh'])
            if not has_required_settings:
                self.log_test("Verify Settings in Profile", False, "Missing required settings in profile response")
                return False
        
        return success

    # ===== FILE MANAGEMENT TESTS =====
    def test_file_upload_valid(self):
        """Test valid file upload"""
        if not self.token:
            return False
            
        # Create a temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("Ecoleaf Cloud test file content for upload testing")
            temp_file_path = f.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('ecoleaf_test.txt', f, 'text/plain')}
                
                success, response = self.run_test(
                    "Valid File Upload",
                    "POST",
                    "files/upload",
                    200,
                    files=files
                )
                
                if success and 'file' in response and 'id' in response['file']:
                    self.uploaded_file_id = response['file']['id']
                
                return success
        finally:
            os.unlink(temp_file_path)

    def test_file_list(self):
        """Test file listing"""
        if not self.token:
            return False
            
        return self.run_test(
            "File List",
            "GET",
            "files",
            200
        )[0]

    def test_file_download(self):
        """Test file download (NEW ENDPOINT)"""
        if not self.token or not self.uploaded_file_id:
            return False
            
        # Test the download endpoint
        url = f"{self.base_url}/files/download/{self.uploaded_file_id}"
        headers = {'Authorization': f'Bearer {self.token}'}
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                # Check if we got file content
                content_length = len(response.content)
                content_type = response.headers.get('content-type', '')
                details = f"Downloaded {content_length} bytes, Content-Type: {content_type}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text}"
            
            self.log_test("File Download", success, details)
            return success
            
        except Exception as e:
            self.log_test("File Download", False, f"Exception: {str(e)}")
            return False

    def test_file_delete(self):
        """Test file deletion"""
        if not self.token or not self.uploaded_file_id:
            return False
            
        return self.run_test(
            "File Delete",
            "DELETE",
            f"files/{self.uploaded_file_id}",
            200
        )[0]

    # ===== NOTES TESTS =====
    def test_create_note(self):
        """Test creating a note"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Create Note",
            "POST",
            "notes",
            200,
            data={
                "title": "Ecoleaf Test Note",
                "content": "This is a test note for the Ecoleaf Cloud application testing suite."
            }
        )
        
        if success and 'note' in response and 'id' in response['note']:
            self.created_note_id = response['note']['id']
        
        return success

    def test_get_notes(self):
        """Test getting all notes"""
        if not self.token:
            return False
            
        return self.run_test(
            "Get Notes",
            "GET",
            "notes",
            200
        )[0]

    def test_get_single_note(self):
        """Test getting a single note"""
        if not self.token or not self.created_note_id:
            return False
            
        return self.run_test(
            "Get Single Note",
            "GET",
            f"notes/{self.created_note_id}",
            200
        )[0]

    def test_update_note(self):
        """Test updating a note"""
        if not self.token or not self.created_note_id:
            return False
            
        return self.run_test(
            "Update Note",
            "PUT",
            f"notes/{self.created_note_id}",
            200,
            data={
                "title": "Updated Ecoleaf Test Note",
                "content": "This note has been updated during testing."
            }
        )[0]

    def test_delete_note(self):
        """Test deleting a note"""
        if not self.token or not self.created_note_id:
            return False
            
        return self.run_test(
            "Delete Note",
            "DELETE",
            f"notes/{self.created_note_id}",
            200
        )[0]

    # ===== TEXT STORAGE TESTS =====
    def test_create_text(self):
        """Test creating a text"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Create Text",
            "POST",
            "texts",
            200,
            data={
                "title": "Ecoleaf Test Text",
                "content": "This is a test text snippet for the Ecoleaf Cloud application."
            }
        )
        
        if success and 'text' in response and 'id' in response['text']:
            self.created_text_id = response['text']['id']
        
        return success

    def test_get_texts(self):
        """Test getting all texts"""
        if not self.token:
            return False
            
        return self.run_test(
            "Get Texts",
            "GET",
            "texts",
            200
        )[0]

    def test_edit_text(self):
        """Test editing a text (NEW ENDPOINT)"""
        if not self.token or not self.created_text_id:
            return False
            
        return self.run_test(
            "Edit Text",
            "PUT",
            f"texts/{self.created_text_id}",
            200,
            data={
                "title": "Updated Ecoleaf Test Text",
                "content": "This text has been edited using the new PUT endpoint."
            }
        )[0]

    def test_verify_text_edit(self):
        """Test that text edit persisted by getting texts"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Verify Text Edit Persistence",
            "GET",
            "texts",
            200
        )
        
        if success and 'texts' in response:
            # Find our edited text
            for text in response['texts']:
                if text.get('_id') == self.created_text_id:
                    if text.get('title') == "Updated Ecoleaf Test Text":
                        return True
            self.log_test("Verify Text Edit Persistence", False, "Text edit did not persist")
            return False
        
        return success

    def test_delete_text(self):
        """Test deleting a text"""
        if not self.token or not self.created_text_id:
            return False
            
        return self.run_test(
            "Delete Text",
            "DELETE",
            f"texts/{self.created_text_id}",
            200
        )[0]

    # ===== STORAGE STATS TESTS (NEW) =====
    def test_storage_stats(self):
        """Test getting storage statistics"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Get Storage Stats",
            "GET",
            "storage/stats",
            200
        )
        
        if success:
            # Verify required fields are present
            required_fields = ['storageUsed', 'storageRemaining', 'storageLimit', 'percentageUsed', 
                             'fileCount', 'notesCount', 'textsCount', 'storageByType']
            
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Get Storage Stats", False, f"Missing fields: {missing_fields}")
                return False
            
            # Verify storage limit is 10GB
            if response.get('storageLimit') != 10 * 1024 * 1024 * 1024:
                self.log_test("Get Storage Stats", False, f"Storage limit should be 10GB, got {response.get('storageLimit')}")
                return False
            
            # Verify storageByType has required categories
            storage_by_type = response.get('storageByType', {})
            required_types = ['image', 'video', 'audio', 'pdf', 'others']
            missing_types = [t for t in required_types if t not in storage_by_type]
            if missing_types:
                self.log_test("Get Storage Stats", False, f"Missing storage types: {missing_types}")
                return False
        
        return success

    # ===== ANALYTICS TESTS (NEW) =====
    def test_analytics(self):
        """Test getting analytics data"""
        if not self.token:
            return False
            
        success, response = self.run_test(
            "Get Analytics",
            "GET",
            "analytics",
            200
        )
        
        if success:
            # Verify required fields are present
            required_fields = ['totalFiles', 'totalStorage', 'notesCount', 'textsCount', 
                             'fileTypeDistribution', 'uploadTrends']
            
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                self.log_test("Get Analytics", False, f"Missing fields: {missing_fields}")
                return False
            
            # Verify uploadTrends is an array with 30 days
            upload_trends = response.get('uploadTrends', [])
            if not isinstance(upload_trends, list) or len(upload_trends) != 30:
                self.log_test("Get Analytics", False, f"uploadTrends should be array of 30 items, got {len(upload_trends)}")
                return False
            
            # Verify each trend item has date and count
            for i, trend in enumerate(upload_trends):
                if not isinstance(trend, dict) or 'date' not in trend or 'count' not in trend:
                    self.log_test("Get Analytics", False, f"uploadTrends[{i}] missing date or count")
                    return False
        
        return success

    # ===== REGRESSION TESTS =====
    def test_auth_regression(self):
        """Test that existing auth endpoints still work"""
        # Test duplicate registration
        success1 = self.run_test(
            "Auth Regression - Duplicate Registration",
            "POST",
            "auth/register",
            400,
            data={"email": self.test_email, "password": "AnotherPass123!"}
        )[0]
        
        # Test wrong password
        success2 = self.run_test(
            "Auth Regression - Wrong Password",
            "POST",
            "auth/login",
            401,
            data={"email": self.test_email, "password": "WrongPassword123!"}
        )[0]
        
        return success1 and success2

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Ecoleaf Cloud API Tests")
        print("=" * 60)
        
        # Server health
        if not self.test_server_health():
            print("❌ Server is not responding. Aborting tests.")
            return 1
        
        # Authentication setup
        if not self.test_register_new_user():
            print("❌ User registration failed. Aborting tests.")
            return 1
            
        if not self.test_login_valid_user():
            print("❌ User login failed. Aborting tests.")
            return 1
        
        print(f"✅ Authentication successful. Token acquired.")
        
        # Authentication tests
        self.test_login_invalid_email()
        self.test_phone_login_missing_fields()
        
        # User profile tests
        self.test_get_user_profile()
        self.test_update_user_profile()
        
        # NEW: User settings tests
        self.test_update_user_settings_theme()
        self.test_update_user_settings_layout()
        self.test_update_user_settings_sidebar()
        self.test_update_user_settings_analytics()
        self.test_update_user_settings_multiple()
        self.test_verify_settings_in_profile()
        
        # File management tests
        self.test_file_upload_valid()
        self.test_file_list()
        # NEW: File download test
        self.test_file_download()
        self.test_file_delete()
        
        # Notes tests
        self.test_create_note()
        self.test_get_notes()
        self.test_get_single_note()
        self.test_update_note()
        self.test_delete_note()
        
        # Text storage tests
        self.test_create_text()
        self.test_get_texts()
        # NEW: Text edit test
        self.test_edit_text()
        self.test_verify_text_edit()
        self.test_delete_text()
        
        # NEW: Storage stats tests
        self.test_storage_stats()
        
        # NEW: Analytics tests
        self.test_analytics()
        
        # Regression tests
        self.test_auth_regression()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

def main():
    tester = EcoleafCloudAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
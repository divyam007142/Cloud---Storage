#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Secure Auth Application
Tests all authentication and file management endpoints
"""

import requests
import sys
import json
import os
import tempfile
from datetime import datetime

class SecureAuthAPITester:
    def __init__(self, base_url="https://securecloud-hub-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

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
        if details:
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
        print(f"    URL: {url}")
        print(f"    Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=default_headers)
                else:
                    response = requests.post(url, json=data, headers=default_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers)

            success = response.status_code == expected_status
            
            try:
                response_data = response.json()
            except:
                response_data = {"raw_response": response.text}

            details = f"Status: {response.status_code}, Response: {json.dumps(response_data, indent=2)}"
            
            self.log_test(name, success, details)
            
            return success, response_data

        except Exception as e:
            error_details = f"Exception: {str(e)}"
            self.log_test(name, False, error_details)
            return False, {}

    def test_server_health(self):
        """Test if server is running"""
        return self.run_test("Server Health Check", "GET", "", 200)

    def test_register_new_user(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@example.com"
        test_password = "TestPass123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            201,
            data={"email": test_email, "password": test_password}
        )
        
        if success:
            self.test_email = test_email
            self.test_password = test_password
        
        return success

    def test_register_duplicate_user(self):
        """Test registration with existing email"""
        if not hasattr(self, 'test_email'):
            return False
            
        return self.run_test(
            "Duplicate User Registration",
            "POST",
            "auth/register",
            400,
            data={"email": self.test_email, "password": "AnotherPass123!"}
        )[0]

    def test_register_invalid_email(self):
        """Test registration with invalid email"""
        return self.run_test(
            "Invalid Email Registration",
            "POST",
            "auth/register",
            400,
            data={"email": "invalid-email", "password": "TestPass123!"}
        )[0]

    def test_register_short_password(self):
        """Test registration with short password"""
        return self.run_test(
            "Short Password Registration",
            "POST",
            "auth/register",
            400,
            data={"email": "test@example.com", "password": "123"}
        )[0]

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

    def test_login_wrong_password(self):
        """Test login with wrong password"""
        if not hasattr(self, 'test_email'):
            return False
            
        return self.run_test(
            "Wrong Password Login",
            "POST",
            "auth/login",
            401,
            data={"email": self.test_email, "password": "WrongPassword123!"}
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

    def test_file_upload_no_auth(self):
        """Test file upload without authentication"""
        # Create a temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("Test file content")
            temp_file_path = f.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test.txt', f, 'text/plain')}
                # Temporarily remove token
                original_token = self.token
                self.token = None
                
                success = self.run_test(
                    "File Upload No Auth",
                    "POST",
                    "files/upload",
                    401,
                    files=files
                )[0]
                
                # Restore token
                self.token = original_token
                return success
        finally:
            os.unlink(temp_file_path)

    def test_file_upload_valid(self):
        """Test valid file upload"""
        if not self.token:
            return False
            
        # Create a temporary test file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("Test file content for upload")
            temp_file_path = f.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('test_upload.txt', f, 'text/plain')}
                
                success, response = self.run_test(
                    "Valid File Upload",
                    "POST",
                    "files/upload",
                    201,
                    files=files
                )
                
                if success and 'file' in response and 'id' in response['file']:
                    self.uploaded_file_id = response['file']['id']
                
                return success
        finally:
            os.unlink(temp_file_path)

    def test_file_upload_executable(self):
        """Test upload of executable file (should be blocked)"""
        if not self.token:
            return False
            
        # Create a temporary executable file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.exe', delete=False) as f:
            f.write("Fake executable content")
            temp_file_path = f.name
        
        try:
            with open(temp_file_path, 'rb') as f:
                files = {'file': ('malicious.exe', f, 'application/octet-stream')}
                
                return self.run_test(
                    "Executable File Upload (Should Block)",
                    "POST",
                    "files/upload",
                    400,
                    files=files
                )[0]
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

    def test_file_list_no_auth(self):
        """Test file listing without authentication"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success = self.run_test(
            "File List No Auth",
            "GET",
            "files",
            401
        )[0]
        
        # Restore token
        self.token = original_token
        return success

    def test_file_delete(self):
        """Test file deletion"""
        if not self.token or not hasattr(self, 'uploaded_file_id'):
            return False
            
        return self.run_test(
            "File Delete",
            "DELETE",
            f"files/{self.uploaded_file_id}",
            200
        )[0]

    def test_file_delete_nonexistent(self):
        """Test deletion of non-existent file"""
        if not self.token:
            return False
            
        fake_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format
        return self.run_test(
            "Delete Non-existent File",
            "DELETE",
            f"files/{fake_id}",
            404
        )[0]

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Secure Auth API Tests")
        print("=" * 50)
        
        # Server health
        self.test_server_health()
        
        # Registration tests
        self.test_register_new_user()
        self.test_register_duplicate_user()
        self.test_register_invalid_email()
        self.test_register_short_password()
        
        # Login tests
        self.test_login_valid_user()
        self.test_login_invalid_email()
        self.test_login_wrong_password()
        
        # Phone auth tests
        self.test_phone_login_missing_fields()
        
        # File management tests
        self.test_file_upload_no_auth()
        self.test_file_upload_valid()
        self.test_file_upload_executable()
        self.test_file_list()
        self.test_file_list_no_auth()
        self.test_file_delete()
        self.test_file_delete_nonexistent()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed. Check details above.")
            return 1

def main():
    tester = SecureAuthAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
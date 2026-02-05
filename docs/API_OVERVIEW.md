# Ecoleaf Cloud - API Overview

This document provides a high-level overview of the Ecoleaf Cloud API. For complete API documentation, visit the interactive docs at `http://localhost:8001/docs` when running the backend.

## Base URL

**Development:** `http://localhost:8001`  
**Production:** `https://api.ecoleafcloud.com` (example)

## Authentication

All protected endpoints require a JWT (JSON Web Token) in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Getting a Token

**Register:** `POST /api/auth/register`  
**Login:** `POST /api/auth/login`  
**Phone Login:** `POST /api/auth/phone-login`

Tokens expire after 7 days.

---

## API Endpoints

### Authentication Endpoints

#### 1. Register with Email

**Endpoint:** `POST /api/auth/register`  
**Authentication:** Not required  
**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "success": true
}
```

**Errors:**
- `400` - User already exists
- `422` - Validation error (email format, password length)

---

#### 2. Login with Email

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not required  
**Description:** Login and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "displayName": "John",
    "authProvider": "email"
  }
}
```

**Errors:**
- `404` - User not found
- `401` - Invalid password

---

#### 3. Phone Number Login

**Endpoint:** `POST /api/auth/phone-login`  
**Authentication:** Not required  
**Description:** Login/register using Firebase phone OTP

**Request Body:**
```json
{
  "idToken": "firebase_id_token_from_client",
  "phoneNumber": "+1234567890"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "phoneNumber": "+1234567890",
    "authProvider": "phone"
  }
}
```

**Note:** If user doesn't exist, account is created automatically.

---

### File Management Endpoints

#### 4. Upload File

**Endpoint:** `POST /api/files/upload`  
**Authentication:** Required  
**Description:** Upload a new file (max 50MB)

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field

**Example (curl):**
```bash
curl -X POST "http://localhost:8001/api/files/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf"
```

**Response (200):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "file-uuid",
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 1048576,
    "fileUrl": "/uploads/file-xxx.pdf",
    "uploadedAt": "2025-02-05T10:30:00Z"
  }
}
```

**Errors:**
- `400` - File too large or blocked extension
- `401` - Unauthorized

---

#### 5. Get All Files

**Endpoint:** `GET /api/files`  
**Authentication:** Required  
**Description:** Get all files for authenticated user

**Response (200):**
```json
{
  "files": [
    {
      "_id": "file-uuid",
      "userId": "user-uuid",
      "fileName": "file-xxx.pdf",
      "originalName": "document.pdf",
      "fileType": "application/pdf",
      "fileSize": 1048576,
      "fileUrl": "/uploads/file-xxx.pdf",
      "uploadedAt": "2025-02-05T10:30:00Z"
    }
  ]
}
```

---

#### 6. Download File

**Endpoint:** `GET /api/files/download/{file_id}`  
**Authentication:** Required  
**Description:** Download a specific file

**Response:** File binary data with appropriate headers

**Errors:**
- `404` - File not found
- `401` - Unauthorized

---

#### 7. Delete File

**Endpoint:** `DELETE /api/files/{file_id}`  
**Authentication:** Required  
**Description:** Delete a file

**Response (200):**
```json
{
  "message": "File deleted successfully"
}
```

**Errors:**
- `404` - File not found
- `401` - Unauthorized

---

### Storage & Analytics Endpoints

#### 8. Get Storage Statistics

**Endpoint:** `GET /api/storage/stats`  
**Authentication:** Required  
**Description:** Get storage usage statistics

**Response (200):**
```json
{
  "storageUsed": 5368709120,
  "storageLimit": 10737418240,
  "storageRemaining": 5368709120,
  "percentageUsed": 50.0,
  "fileCount": 42,
  "notesCount": 15,
  "textsCount": 8,
  "storageByType": {
    "Images": 2147483648,
    "PDFs": 1073741824,
    "Documents": 1073741824,
    "Other": 1073741824
  }
}
```

---

#### 9. Get Analytics Data

**Endpoint:** `GET /api/analytics`  
**Authentication:** Required  
**Description:** Get usage analytics and charts data

**Response (200):**
```json
{
  "totalFiles": 42,
  "totalStorage": 5368709120,
  "notesCount": 15,
  "textsCount": 8,
  "fileTypeDistribution": {
    "Images": 20,
    "PDFs": 10,
    "Documents": 8,
    "Other": 4
  },
  "uploadTrends": [
    {
      "date": "2025-02-01",
      "count": 5,
      "size": 268435456
    },
    {
      "date": "2025-02-02",
      "count": 3,
      "size": 134217728
    }
  ]
}
```

---

### Notes Endpoints

#### 10. Create Note

**Endpoint:** `POST /api/notes`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Meeting Notes",
  "content": "Discussed project timeline and deliverables..."
}
```

**Response (200):**
```json
{
  "message": "Note created successfully",
  "note": {
    "id": "note-uuid",
    "title": "Meeting Notes",
    "content": "Discussed...",
    "createdAt": "2025-02-05T10:30:00Z",
    "updatedAt": "2025-02-05T10:30:00Z"
  }
}
```

---

#### 11. Get All Notes

**Endpoint:** `GET /api/notes`  
**Authentication:** Required

**Response (200):**
```json
{
  "notes": [
    {
      "_id": "note-uuid",
      "userId": "user-uuid",
      "title": "Meeting Notes",
      "content": "Discussed...",
      "createdAt": "2025-02-05T10:30:00Z",
      "updatedAt": "2025-02-05T10:30:00Z"
    }
  ]
}
```

---

#### 12. Get Single Note

**Endpoint:** `GET /api/notes/{note_id}`  
**Authentication:** Required

---

#### 13. Update Note

**Endpoint:** `PUT /api/notes/{note_id}`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

---

#### 14. Delete Note

**Endpoint:** `DELETE /api/notes/{note_id}`  
**Authentication:** Required

---

### Text Storage Endpoints

#### 15. Save Text

**Endpoint:** `POST /api/texts`  
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Python Script",
  "content": "def hello():\n    print('Hello World')"
}
```

---

#### 16. Get All Texts

**Endpoint:** `GET /api/texts`  
**Authentication:** Required

---

#### 17. Delete Text

**Endpoint:** `DELETE /api/texts/{text_id}`  
**Authentication:** Required

---

### User Profile Endpoints

#### 18. Get User Profile

**Endpoint:** `GET /api/user/profile`  
**Authentication:** Required

**Response (200):**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "phoneNumber": null,
    "displayName": "John Doe",
    "authProvider": "email"
  }
}
```

---

#### 19. Update Profile

**Endpoint:** `PUT /api/user/profile`  
**Authentication:** Required

**Request Body:**
```json
{
  "displayName": "John Doe"
}
```

---

### Settings Endpoints

#### 20. Get Settings

**Endpoint:** `GET /api/settings`  
**Authentication:** Required

**Response (200):**
```json
{
  "settings": {
    "theme": "light",
    "displayName": "John Doe",
    "layoutPreference": "grid"
  }
}
```

---

#### 21. Update Settings

**Endpoint:** `PUT /api/settings`  
**Authentication:** Required

**Request Body:**
```json
{
  "theme": "dark",
  "displayName": "John",
  "layoutPreference": "list"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "detail": "Error message here"
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing token)
- `404` - Not Found
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error

---

## Rate Limiting

**Current Status:** No rate limiting implemented  
**Planned:** 100 requests per minute per user

---

## Data Models

### User Model
```json
{
  "_id": "string (UUID)",
  "email": "string (optional)",
  "phoneNumber": "string (optional)",
  "passwordHash": "string (hashed)",
  "displayName": "string (optional)",
  "authProvider": "email | phone",
  "settings": {
    "theme": "light | dark",
    "layoutPreference": "grid | list"
  },
  "createdAt": "ISO 8601 datetime",
  "lastLogin": "ISO 8601 datetime"
}
```

### File Model
```json
{
  "_id": "string (UUID)",
  "userId": "string (UUID)",
  "fileName": "string",
  "originalName": "string",
  "fileType": "string (MIME type)",
  "fileSize": "integer (bytes)",
  "fileUrl": "string (path)",
  "uploadedAt": "ISO 8601 datetime"
}
```

### Note Model
```json
{
  "_id": "string (UUID)",
  "userId": "string (UUID)",
  "title": "string",
  "content": "string",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Text Model
```json
{
  "_id": "string (UUID)",
  "userId": "string (UUID)",
  "title": "string",
  "content": "string",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

## Interactive API Documentation

For complete, interactive API documentation with the ability to test endpoints:

**Swagger UI:** http://localhost:8001/docs  
**ReDoc:** http://localhost:8001/redoc

---

## SDK / Client Libraries

**Coming Soon:**
- JavaScript/TypeScript SDK
- Python SDK
- Mobile SDKs (iOS, Android)

---

## Webhooks

**Coming Soon:**
- File uploaded event
- Storage quota exceeded
- Note created/updated

---

## API Versioning

**Current Version:** v1 (no version prefix)  
**Future:** `/api/v2/...`

---

## Support

API Support: api-support@ecoleafcloud.com  
Documentation Issues: docs@ecoleafcloud.com

---

**Last Updated:** February 2025

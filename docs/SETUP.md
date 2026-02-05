# Ecoleaf Cloud - Detailed Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [MongoDB Setup](#mongodb-setup)
4. [Firebase Configuration](#firebase-configuration)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

#### 1. Node.js and Yarn
- **Node.js**: Version 18.0.0 or higher
  ```bash
  # Check version
  node --version
  
  # Download from: https://nodejs.org/
  ```

- **Yarn**: Version 1.22.x
  ```bash
  # Install yarn globally
  npm install -g yarn
  
  # Check version
  yarn --version
  ```

#### 2. Python
- **Python**: Version 3.11 or higher
  ```bash
  # Check version
  python --version
  # or
  python3 --version
  ```

- **pip**: Package installer for Python
  ```bash
  # Check version
  pip --version
  ```

#### 3. MongoDB
- **MongoDB**: Version 4.4 or higher

**Installation Options:**

**Option A: MongoDB Community Edition (Local)**
```bash
# Ubuntu/Debian
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb

# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download installer from: https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

#### 4. Git
```bash
# Check version
git --version

# Install if needed:
# Ubuntu/Debian: sudo apt-get install git
# macOS: brew install git
# Windows: https://git-scm.com/download/win
```

---

## Local Development Setup

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-username/ecoleaf-cloud.git

# Navigate to project directory
cd ecoleaf-cloud
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

**Backend Dependencies:**
- FastAPI - Web framework
- Uvicorn - ASGI server
- Motor - Async MongoDB driver
- Pydantic - Data validation
- PyJWT - JWT handling
- bcrypt - Password hashing
- Python-multipart - File upload support
- Firebase Admin SDK - Phone authentication

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies using Yarn
yarn install

# This may take 2-5 minutes depending on internet speed

# Verify installation
yarn list --depth=0
```

**Frontend Dependencies:**
- React 19 - UI library
- React Router DOM - Routing
- Tailwind CSS - Styling
- shadcn/ui - UI components
- Recharts - Charts
- Axios - HTTP client
- Firebase - Phone auth
- Lucide React - Icons

---

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongodb

# Check MongoDB is running
sudo systemctl status mongodb

# Connect to MongoDB shell
mongo

# Create database (it will be created automatically on first insert)
use secureAuthDB

# Create a test user (optional)
db.users.insertOne({
  email: "test@example.com",
  password: "hashed_password_here"
})

# Exit MongoDB shell
exit
```

**MongoDB Connection String:**
```
mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free tier

2. **Create Cluster**
   - Click "Build a Database"
   - Select "Shared" (Free tier)
   - Choose cloud provider and region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Add new database user
   - Set username and password (remember these!)
   - Grant "Read and write to any database" permissions

4. **Allow Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Select "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

**MongoDB Atlas Connection String:**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/secureAuthDB?retryWrites=true&w=majority
```

---

## Firebase Configuration

Firebase is used for phone number authentication (OTP).

### Step 1: Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "ecoleaf-cloud")
4. Disable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Phone Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get Started"
3. Go to "Sign-in method" tab
4. Click "Phone" provider
5. Toggle to "Enable"
6. Click "Save"

### Step 3: Get Web App Config

**For Frontend (Client-side):**

1. In Firebase Console, click gear icon → "Project settings"
2. Scroll down to "Your apps"
3. Click web icon (</>)
4. Register app with nickname (e.g., "Ecoleaf Web")
5. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ecoleaf-cloud.firebaseapp.com",
  projectId: "ecoleaf-cloud",
  storageBucket: "ecoleaf-cloud.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Step 4: Get Admin SDK Credentials

**For Backend (Server-side):**

1. In Firebase Console → Project settings → "Service accounts"
2. Click "Generate new private key"
3. Download JSON file
4. Open the JSON file and extract these values:
   - `project_id`
   - `private_key_id`
   - `private_key`
   - `client_email`
   - `client_id`

---

## Environment Variables

### Backend Environment Variables

Create `backend/.env` file:

```bash
cd backend
touch .env
```

**Add the following content:**

```env
# MongoDB Connection
# For local MongoDB:
MONGO_URL=mongodb://localhost:27017
# OR for MongoDB Atlas:
# MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/secureAuthDB

MONGODB_URI=mongodb://localhost:27017

# JWT Secret Key
# IMPORTANT: Change this in production!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-long-and-random

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourActualPrivateKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
```

**Important Notes:**
- Replace all placeholder values with your actual credentials
- For `FIREBASE_PRIVATE_KEY`, keep the `\n` characters as-is
- Use double quotes around the private key
- Keep `.env` file secure and never commit to git

### Frontend Environment Variables

Create `frontend/.env` file:

```bash
cd frontend
touch .env
```

**Add the following content:**

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Firebase Client Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=ecoleaf-cloud.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ecoleaf-cloud
REACT_APP_FIREBASE_STORAGE_BUCKET=ecoleaf-cloud.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

**Important Notes:**
- Replace all values with your Firebase web app config
- These values are safe to expose in frontend (they're public)
- Never expose Firebase Admin SDK credentials in frontend

---

## Running the Application

### Step 1: Start MongoDB

**Local MongoDB:**
```bash
sudo systemctl start mongodb
# OR
mongod --dbpath /path/to/data
```

**MongoDB Atlas:**
- No action needed, it's already running in cloud

### Step 2: Start Backend Server

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

# Start FastAPI server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# You should see:
# INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
# INFO:     Started reloader process
# INFO:     Started server process
# INFO:     Waiting for application startup.
# INFO:     Application startup complete.
```

**Backend is now running at:**
- API: http://localhost:8001
- API Docs: http://localhost:8001/docs
- OpenAPI Spec: http://localhost:8001/openapi.json

### Step 3: Start Frontend Development Server

**Open a new terminal window/tab:**

```bash
# Navigate to frontend directory
cd frontend

# Start React development server
yarn start

# You should see:
# Compiled successfully!
# You can now view frontend in the browser.
# Local: http://localhost:3000
# On Your Network: http://192.168.x.x:3000
```

**Frontend is now running at:**
- http://localhost:3000

### Step 4: Access Application

1. Open browser
2. Go to http://localhost:3000
3. You should see the Ecoleaf Cloud login page
4. Create an account or login

---

## Troubleshooting

### Common Issues

#### Issue 1: MongoDB Connection Failed

**Error:**
```
ServerSelectionTimeoutError: connection to MongoDB failed
```

**Solution:**
1. Check if MongoDB is running:
   ```bash
   sudo systemctl status mongodb
   # or
   mongosh
   ```
2. Verify `MONGO_URL` in `backend/.env`
3. For MongoDB Atlas, check:
   - Network access allows your IP
   - Username/password are correct
   - Connection string format is correct

#### Issue 2: Port Already in Use

**Error:**
```
Address already in use
```

**Solution:**
```bash
# Find process using port 8001
sudo lsof -i :8001
# or
netstat -ano | findstr :8001  # Windows

# Kill the process
sudo kill -9 <PID>
# or use different port
uvicorn server:app --host 0.0.0.0 --port 8002 --reload
```

#### Issue 3: Firebase Authentication Error

**Error:**
```
Firebase: Error (auth/api-key-not-valid)
```

**Solution:**
1. Double-check all Firebase config values in `frontend/.env`
2. Ensure phone authentication is enabled in Firebase Console
3. Clear browser cache and reload
4. Check Firebase project quota limits

#### Issue 4: Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

**Error:**
```
Module not found: Can't resolve 'axios'
```

**Solution:**
```bash
cd frontend
yarn install
```

#### Issue 5: CORS Error

**Error:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Ensure backend is running on correct port (8001)
2. Check `REACT_APP_BACKEND_URL` in `frontend/.env` matches backend URL
3. Backend has CORS middleware configured (already done in server.py)

#### Issue 6: File Upload Fails

**Error:**
```
File size exceeds 50MB limit
```

**Solution:**
- Reduce file size, or
- Increase `MAX_FILE_SIZE` in `backend/server.py`:
  ```python
  MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
  ```

#### Issue 7: JWT Token Expired

**Error:**
```
Token expired or invalid
```

**Solution:**
1. Logout and login again
2. Clear browser localStorage:
   ```javascript
   // In browser console
   localStorage.clear()
   ```
3. Refresh page

---

## Production Deployment

### Backend Deployment

**Environment Variables to Set:**
- `MONGO_URL` - Production MongoDB connection string
- `JWT_SECRET` - Strong random secret key
- `FIREBASE_*` - Production Firebase credentials

**Deploy to Railway/Heroku/DigitalOcean:**
```bash
# Example for Railway
railway init
railway up
```

### Frontend Deployment

**Build for production:**
```bash
cd frontend
yarn build
```

**Deploy to Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Deploy to Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## Support

If you encounter any issues not covered here:

1. Check the [GitHub Issues](https://github.com/your-username/ecoleaf-cloud/issues)
2. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, Python version)
3. Email: support@ecoleafcloud.com

---

**Happy Coding! 🚀**

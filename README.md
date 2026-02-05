# Ecoleaf Cloud - Secure Cloud Storage Platform

![Ecoleaf Cloud Logo](./frontend/public/ecoleaf-logo.png)

## 🌟 Overview

**Ecoleaf Cloud** is a modern, production-ready cloud storage web application that provides users with a secure platform to store files, manage notes, and organize text snippets. Built with cutting-edge technologies, it delivers a premium user experience comparable to industry leaders like Google Drive and Dropbox.

## ✨ Features

### 🔐 Authentication
- **Email/Password Login** - Secure authentication with JWT tokens
- **Email/Password Registration** - Easy account creation
- **Phone OTP Authentication** - Firebase-powered phone number verification
- **Session Management** - Secure token-based authentication with localStorage

### 📁 File Management
- **Upload Files** - Support for files up to 50MB with progress tracking
- **Grid & List Views** - Toggle between different file viewing modes
- **File Previews** - 
  - Image preview with modal
  - PDF embedded viewer
  - File type icons (Images, Videos, Audio, PDFs, Documents)
- **File Actions** - Download, preview, and delete files
- **Smart Organization** - Files sorted by upload date with metadata

### ☁️ Storage Management
- **Storage Quota System** - 10GB default storage limit (configurable)
- **Real-time Usage Tracking** - Visual progress bars and percentage indicators
- **Storage Breakdown** - Categorized by file types (Images, Videos, PDFs, etc.)
- **Usage Statistics** - Detailed breakdown of files, notes, and texts

### 📊 Analytics Dashboard
- **Usage Statistics** - Total files, storage used, notes count, texts count
- **File Type Distribution** - Interactive pie chart showing file categories
- **Upload Trends** - Smooth area chart displaying upload activity over 30 days
- **Upload Activity** - Bar chart showing daily file uploads
- **Real-time Data** - All charts powered by actual database data

### 📝 Notes Management
- **Create Notes** - Rich text note editor
- **Organize Notes** - View, edit, and delete notes
- **Card Layout** - Modern card-based display with preview
- **Timestamps** - Track creation and update times

### 📄 Text Storage
- **Save Text Snippets** - Store code, long text, or any content
- **Copy to Clipboard** - One-click copy functionality
- **Syntax Display** - Monospace font for code snippets
- **Search & Manage** - Easy text snippet management

### ⚙️ Settings
- **Profile Management** - Update display name and view account info
- **Display Preferences** - Customize how your name appears
- **Account Actions** - Secure logout functionality

### 🎨 Premium UI/UX
- **Modern Dashboard** - Clean, professional SaaS-style interface
- **Responsive Design** - Desktop-first with mobile optimization
- **Glassmorphic Effects** - Beautiful gradient backgrounds
- **Smooth Animations** - Micro-interactions and hover effects
- **Custom Branding** - Ecoleaf Cloud logo and color scheme

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components
- **Recharts** - Modern charting library
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **CRACO** - Create React App Configuration Override

### Backend
- **Python 3.11** - Modern Python runtime
- **FastAPI** - High-performance async web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Python Multipart** - File upload handling
- **CORS Middleware** - Cross-origin resource sharing

### Database
- **MongoDB** - NoSQL document database
- Collections:
  - `users` - User accounts and authentication
  - `files` - File metadata and references
  - `notes` - User notes
  - `texts` - Text snippets

### Authentication
- **Firebase Admin SDK** - Phone OTP authentication
- **JWT** - Secure token-based auth with 7-day expiry
- **bcrypt** - Password hashing with salt

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.11
- **MongoDB** (running locally or remote)
- **Yarn** package manager
- **Firebase Project** (for phone authentication)

## 🚀 Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd ecoleaf-cloud
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Backend Environment Variables** (`backend/.env`):

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
MONGODB_URI=mongodb://localhost:27017

# JWT Secret Key (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
```

**Frontend Environment Variables** (`frontend/.env`):

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001

# Firebase Config (for phone authentication)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Start Services

**Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd frontend
yarn start
```

**MongoDB:**
```bash
mongod --dbpath /path/to/data
```

### 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs

## 📂 Project Structure

```
ecoleaf-cloud/
├── backend/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User model schema
│   │   └── File.js          # File model schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── files.js         # File management routes
│   ├── uploads/             # Uploaded files directory
│   ├── server.py            # Main FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
│
├── frontend/
│   ├── public/
│   │   ├── index.html       # HTML template
│   │   ├── ecoleaf-logo.png # App logo
│   │   └── favicon.ico      # Favicon
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── AuthPage.js  # Login/Register page
│   │   │   ├── Dashboard.js # Main dashboard
│   │   │   └── Settings.js  # Settings page
│   │   ├── context/
│   │   │   └── AuthContext.js # Authentication context
│   │   ├── config/
│   │   │   └── firebase.js  # Firebase configuration
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json         # Frontend dependencies
│   ├── tailwind.config.js   # Tailwind configuration
│   └── .env                 # Frontend environment variables
│
├── docs/
│   ├── SETUP.md             # Detailed setup guide
│   ├── DASHBOARD_GUIDE.md   # Dashboard features guide
│   └── API_OVERVIEW.md      # API documentation
│
├── screenshots/             # Application screenshots
├── README.md                # This file
└── LICENSE                  # MIT License
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/phone-login` - Login/register with phone number

### File Management
- `POST /api/files/upload` - Upload new file
- `GET /api/files` - Get all user files
- `GET /api/files/download/:id` - Download specific file
- `DELETE /api/files/:id` - Delete file

### Storage & Analytics
- `GET /api/storage/stats` - Get storage usage statistics
- `GET /api/analytics` - Get analytics data (charts, trends)

### Notes
- `POST /api/notes` - Create new note
- `GET /api/notes` - Get all user notes
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Text Storage
- `POST /api/texts` - Save new text snippet
- `GET /api/texts` - Get all user texts
- `DELETE /api/texts/:id` - Delete text

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile (display name)

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings (theme, layout)

## 🎨 Screenshots

*(Screenshots will be added in the `/screenshots` directory)*

### Dashboard Overview
![Dashboard](./screenshots/dashboard.png)

### File Management
![Files](./screenshots/files.png)

### Storage Analytics
![Analytics](./screenshots/analytics.png)

### Login Page
![Login](./screenshots/login.png)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt for password storage
- **File Type Validation** - Blocked executable files (.exe, .bat, .sh, etc.)
- **File Size Limits** - Maximum 50MB per file
- **CORS Protection** - Configured CORS middleware
- **Input Validation** - Pydantic models for API input validation
- **XSS Protection** - React's built-in XSS protection

## 🌐 Environment Configuration

### Storage Quota Configuration

The default storage quota is 10GB per user. To change this, modify the `storage_limit` in `backend/server.py`:

```python
# In /api/storage/stats endpoint
storage_limit = 10 * 1024 * 1024 * 1024  # 10GB
# Change to your desired limit, e.g., 5GB:
storage_limit = 5 * 1024 * 1024 * 1024  # 5GB
```

### File Upload Limits

Maximum file size is 50MB. To change this, modify `MAX_FILE_SIZE` in `backend/server.py`:

```python
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
# Change to your desired limit, e.g., 100MB:
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
yarn test
```

## 🚢 Deployment

### Backend Deployment (Example: Railway/Heroku)

1. Set environment variables on hosting platform
2. Update `MONGO_URL` to production MongoDB URL
3. Change `JWT_SECRET` to a strong production key
4. Configure Firebase Admin SDK credentials

### Frontend Deployment (Example: Vercel/Netlify)

1. Build production bundle:
   ```bash
   cd frontend
   yarn build
   ```

2. Set `REACT_APP_BACKEND_URL` to production API URL

3. Deploy `build` folder

## 📝 Future Roadmap

- [ ] File sharing with public links
- [ ] Collaborative features (shared folders)
- [ ] File versioning
- [ ] Advanced search functionality
- [ ] Mobile app (React Native)
- [ ] Real-time synchronization
- [ ] Dark mode toggle
- [ ] Two-factor authentication (2FA)
- [ ] File encryption at rest
- [ ] Bulk file operations
- [ ] Admin dashboard
- [ ] Usage notifications

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Recharts](https://recharts.org/) - Chart library
- [Firebase](https://firebase.google.com/) - Phone authentication
- [Lucide](https://lucide.dev/) - Icon library

## 📞 Support

For support, email support@ecoleafcloud.com or open an issue in the repository.

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with ❤️ by the Ecoleaf Cloud Team**

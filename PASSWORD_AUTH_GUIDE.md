# Password Authentication & Job Search Application Guide

## Overview

Your DevApply application now has complete password-based authentication and a seamless job search workflow. Users can now register with a secure password, login, upload their resume, and start automating their job applications from a single entry point.

## Features

### 1. Secure Password Authentication
- ✅ **Password Hashing**: Uses bcrypt for secure password storage
- ✅ **Password Validation**: Minimum 6 characters required
- ✅ **Password Confirmation**: Prevents typos during registration
- ✅ **Show/Hide Password**: Toggle to view passwords during entry
- ✅ **Secure Session Management**: API keys stored in localStorage

### 2. User Registration Flow
1. User enters **Full Name, Email, Password, and Confirm Password**
2. Password is hashed server-side using bcrypt
3. User account is created with unique API key
4. User is guided to upload resume
5. Once complete, user access the job search dashboard

### 3. User Login Flow
1. User enters **Email and Password**
2. Backend verifies credentials against hashed password
3. Returns API key for authenticated requests
4. User directly accesses job search dashboard

### 4. Single Entry Point Access
- **Access**: http://localhost:3000
- **One URL** for the entire application
- **Seamless Navigation**: Register → Upload Resume → Job Search Dashboard
- **Persistent Sessions**: Users stay logged in after refresh

## Application Flow

```
┌─────────────────┐
│  http://localhost:3000
└────────┬────────┘
         │
    ┌────▼────┐
    │ Auth    │
    │ Check   │
    └────┬────┘
         │
    ┌────▼──────────────────┐
    │ User Logged In?        │
    │ (Check localStorage)   │
    └────┬──────────────────┘
         │
    ┌────▼──────┐  No   ┌──────────────────┐
    │ Yes?       ├──────►│ Login/Register   │
    └────┬──────┘       └────┬─────────────┘
         │ Yes               │
    ┌────▼──────┐       ┌────▼──────┐
    │ Dashboard │       │ New User?  │
    │           │       └────┬───────┘
    │ - Search  │            │
    │ - Apply   │       ┌────▼──────┐
    │ - Track   │       │ Register   │ (Create account with password)
    └───────────┘       └────┬───────┘
                             │
                        ┌────▼──────┐
                        │ Upload     │ (Upload resume)
                        │ Resume     │
                        └────┬───────┘
                             │
                        ┌────▼──────┐
                        │ Dashboard  │
                        └────────────┘
```

## API Endpoints

### Register
```http
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "api_key": "uuid-string",
  "user_id": 1,
  "name": "John Doe"
}
```

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response:
{
  "api_key": "uuid-string",
  "user_id": 1,
  "name": "John Doe"
}
```

## Database Schema Changes

The User table now includes:
- `password_hash`: Bcrypt hashed password (replaces plain text)
- All other fields remain the same

### Migration (if using existing database)
```sql
ALTER TABLE "user" ADD COLUMN password_hash VARCHAR NOT NULL;
```

## Frontend Components Updated

### 1. LoginForm.jsx
- Added password field
- Added password visibility toggle
- Password validation
- Better error messages

### 2. RegisterForm.jsx
- Added password and confirm password fields
- Password visibility toggles for both fields
- Password match validation
- Minimum 6 character validation
- Form-to-form switching

### 3. App.jsx
- Enhanced session management
- Stores user name in localStorage
- Shows user greeting on dashboard
- Improved navigation between auth pages

### 4. API Service (api.js)
- Updated loginUser() to accept email and password
- Updated registerUser() to accept password
- Maintained backward compatibility with other endpoints

## Frontend Styling

New CSS classes added:
- `.password-input-wrapper`: Password input with toggle button
- `.password-toggle`: Show/hide password button
- `.switch-form`: Link to switch between login and register
- `.link-btn`: Styled button links
- `.user-greeting`: User name display in header

## Security Features

✅ **Backend**
- Bcrypt hashing with salt (automatic via passlib)
- Password validation (minimum 6 characters)
- No plaintext password storage
- Secure API key generation

✅ **Frontend**
- Password confirmation on registration
- Show/hide toggle for password visibility
- localStorage for session management (not cookies)
- CORS protection enabled
- API key not exposed in URLs

## Running the Application

### Start Services
```bash
docker-compose up -d
```

### Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### View Logs
```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

## Testing the Authentication

### Test Registration
1. Open http://localhost:3000
2. Click "Register here"
3. Enter details:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Confirm: password123
4. Click "Create Account"
5. Upload a resume
6. Access job search dashboard

### Test Login
1. Open http://localhost:3000
2. Enter credentials:
   - Email: john@example.com
   - Password: password123
3. Click "Login"
4. Access dashboard

### Test Session Persistence
1. Login with credentials
2. Refresh the page (F5)
3. You should still be logged in!

## Troubleshooting

### Login Returns "Invalid email or password"
- Ensure you're using the correct email and password
- Password is case-sensitive
- Check that account was registered successfully

### "Password must be at least 6 characters"
- Use a password with minimum 6 characters
- Example: `password123`

### Session Lost After Refresh
- Check if cookies are enabled
- Check browser's localStorage (Dev Tools → Application → Local Storage)
- Try clearing cache and logging in again

### Docker Build Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check for errors
docker-compose logs backend
docker-compose logs frontend
```

## Environment Variables

Add to `.env` file:
```
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
TELEGRAM_BOT_TOKEN=your_token
DATABASE_URL=sqlite:///./test.db
```

## Next Steps

1. **Deploy to Production**
   - Use PostgreSQL instead of SQLite
   - Enable HTTPS
   - Set secure session timeouts
   - Configure email notifications

2. **Add More Features**
   - Email verification
   - Password reset functionality
   - 2FA (Two-Factor Authentication)
   - User preferences management

3. **Integrate Job Boards**
   - LinkedIn integration
   - Indeed automation
   - Naukri automation
   - Custom job board connectors

## Support

For issues or questions:
1. Check the backend logs: `docker-compose logs backend`
2. Check the frontend console (Browser Dev Tools)
3. Review API documentation: http://localhost:8000/docs

---

**Your application is now ready for users to securely register, login, and automate their job search! 🚀**

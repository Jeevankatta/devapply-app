# DevApply - Deployment Guide for Render (Free)

## Overview
This guide will help you deploy your DevApply application **online for free** so multiple users can access it with a single link!

**What you'll get:**
- Public URL like: `https://devapply-frontend.onrender.com`
- Users can login and set job preferences
- Background job scraping runs automatically
- Free tier with 750 compute hours/month (more than enough)

---

## Prerequisites
- GitHub account (free)
- Render account (free) - https://render.com
- Your DevApply code in a GitHub repository

---

## Step 1: Prepare GitHub Repository

### 1.1 Create a GitHub Account (if you don't have one)
- Go to https://github.com
- Sign up for free
- Verify your email

### 1.2 Create a New Repository
1. Go to https://github.com/new
2. Name it: `devapply-app`
3. Description: "Job application automation tool"
4. Choose **Public** (required for free Render deployment)
5. Click **Create Repository**

### 1.3 Push Your Code to GitHub
Open PowerShell in your project folder and run:

```powershell
cd c:\Users\Dell\Downloads\devapply_backend

git init
git add .
git commit -m "Initial commit: DevApply application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/devapply-app.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 2: Create PostgreSQL Database on Render

### 2.1 Sign Up for Render
1. Go to https://render.com
2. Click **Sign Up**
3. Choose **Sign up with GitHub**
4. Authorize Render to access your GitHub
5. Complete your profile

### 2.2 Create PostgreSQL Database
1. Go to https://dashboard.render.com/
2. Click **+ New +** → **PostgreSQL**
3. Fill in:
   - **Name**: `devapply-db`
   - **Database**: `devapply_db`
   - **User**: `devapply_user`
   - **Region**: Choose closest to your users (US-East recommended)
   - **PostgreSQL Version**: 15
   - **Plan**: Free
4. Click **Create Database**
5. **Wait 2-3 minutes** for database to be ready
6. Click on your database to see the connection string

### 2.3 Save Database Credentials
Copy these values - you'll need them:
- **Hostname**
- **Port**
- **Database**
- **Username**
- **Password**

---

## Step 3: Deploy Backend on Render

### 3.1 Create New Web Service
1. Go to https://dashboard.render.com/
2. Click **+ New +** → **Web Service**
3. Connect your GitHub repository:
   - Paste your repository URL: `https://github.com/YOUR_USERNAME/devapply-app`
   - Click **Connect**

### 3.2 Configure Backend Service
4. Fill in the form:
   - **Name**: `devapply-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### 3.3 Add Environment Variables
Scroll down to **Environment** section and add:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | (Generate a random string, min 32 chars) |
| `DATABASE_URL` | `postgresql://devapply_user:YOUR_PASSWORD@YOUR_HOSTNAME:5432/devapply_db` |
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | (You'll get this after deploying frontend) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Your Gmail app password |
| `TELEGRAM_BOT_TOKEN` | (Optional - leave empty if not using) |

**For DATABASE_URL**, replace:
- `YOUR_PASSWORD` with your database password
- `YOUR_HOSTNAME` with your database hostname (from Render dashboard)

5. Click **Create Web Service**

### 3.4 Wait for Deployment
The backend will build and deploy. Check the logs:
- Green "Connected" = Success ✓
- Backend URL will be like: `https://devapply-backend.onrender.com`

---

## Step 4: Deploy Frontend on Render

### 4.1 Create Frontend Web Service
1. Go to https://dashboard.render.com/
2. Click **+ New +** → **Web Service**
3. Connect your GitHub repository again
4. Fill in the form:
   - **Name**: `devapply-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Runtime**: `Node 18`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm run preview -- --host 0.0.0.0`
   - **Plan**: Free

### 4.2 Add Environment Variables
Add one environment variable:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://devapply-backend.onrender.com` |

(Use your actual backend URL from Step 3.4)

5. Click **Create Web Service**

### 4.3 Wait for Deployment
Frontend will build and deploy. You'll get a URL like:
- `https://devapply-frontend.onrender.com`

---

## Step 5: Update Backend Configuration

### 5.1 Add Frontend URL to Backend
1. Go to https://dashboard.render.com/
2. Click on `devapply-backend` service
3. Go to **Environment** tab
4. Find `FRONTEND_URL` and update it with your frontend URL:
   ```
   https://devapply-frontend.onrender.com
   ```
5. Click **Save Changes** (service will redeploy)

---

## Step 6: Initialize Database

### 6.1 Run Database Migrations
1. Open your backend service logs
2. Look for initialization messages
3. The database should auto-initialize on first run

### 6.2 Test Your App
1. Go to: `https://devapply-frontend.onrender.com`
2. You should see the login page
3. Register a new account
4. Login with your credentials

---

## Step 7: Configure Job Scheduler (Background Tasks)

The job scraper runs automatically in the background:
- Jobs are scraped every **6 hours** by default
- Runs without internet interruption (stored locally)
- Scheduler keeps running even if you're offline

### 7.1 Check Scheduler Status
Call this in your browser (replace with your URL):
```
https://devapply-backend.onrender.com/scheduler/status
```

### 7.2 Trigger Jobs Manually (Optional)
Call this endpoint to scrape jobs immediately:
```
https://devapply-backend.onrender.com/scheduler/run-now
```

---

## Step 8: Share Your App Link

Give this link to your friends/colleagues:
```
https://devapply-frontend.onrender.com
```

They can:
1. Register with email/password
2. Upload resume (optional)
3. Set job preferences (roles, experience level, etc.)
4. View scraped jobs
5. Apply to jobs automatically

---

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity (takes ~30 seconds to wake up)
- 750 compute hours/month (free tier)
- 5GB storage included

### To Keep Services Running 24/7
Upgrade to Paid Plan: $7/month per service

### Troubleshooting

**Error: Database connection refused**
- Check DATABASE_URL is correct
- Make sure database is running (green status in Render dashboard)
- Wait for database to initialize (2-3 minutes)

**Error: Jobs not scraping**
- Check scheduler logs in backend service
- Verify scraper credentials (SMTP_USER, SMTP_PASS)
- Check if backend service is running

**Frontend shows blank page**
- Check browser console (F12) for errors
- Verify VITE_API_URL is set correctly
- Check CORS is enabled in backend

---

## Next Steps

### Optional: Custom Domain
1. Go to your frontend service
2. Click **Settings** → **Custom Domain**
3. Add your domain (e.g., `myapp.com`)
4. Follow DNS setup instructions

### Optional: Email Notifications
Update SMTP credentials in backend environment variables:
- `SMTP_USER`: Your email
- `SMTP_PASS`: Gmail app-specific password

### Optional: Telegram Notifications
Set `TELEGRAM_BOT_TOKEN` if you want Telegram alerts

---

## Support

If you get stuck:
1. Check Render logs: Dashboard → Your Service → Logs tab
2. Check browser console: F12 in browser
3. Most common issues are:
   - Wrong environment variables
   - Database not initialized
   - Service needs to wake up (first load is slow)

---

**Your app is now live! 🎉**

Share the link with others and they can start using it immediately!

# DevApply Deployment - Complete Setup Guide

## 📚 Documentation Files

1. **[QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md)** - Start here! 5-minute setup
2. **[DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md)** - Detailed step-by-step guide
3. **[USER_GUIDE.md](USER_GUIDE.md)** - Give this to your users

---

## 🚀 What This Application Does

**DevApply** is a smart job application tool that:

- 📝 Scrapes jobs from multiple platforms (Indeed, LinkedIn, Naukri, Foundit)
- 🤖 Auto-applies to jobs matching user preferences
- 👥 Multi-user support with secure login
- 📱 Works online and offline
- ⏰ Runs scheduled jobs in background (every 6 hours)
- 📧 Email and Telegram notifications (optional)

---

## 🎯 Deployment Goal

Make your application accessible online with a **single link** so multiple users can:
1. Register and login
2. Set job preferences
3. Upload resume
4. Auto-apply to matching jobs
5. Track applications

---

## ⚡ Quick Deployment Path

### Option A: Cloud Deployment (Recommended)
**Time: 30 minutes | Cost: Free | Accessibility: Public link**

1. Create GitHub account (if needed)
2. Push code to GitHub
3. Sign up for Render (free)
4. Create PostgreSQL database (free)
5. Deploy backend and frontend
6. Get public link to share

**Pros:**
- ✅ No local setup needed
- ✅ Users click link and start using
- ✅ Always available
- ✅ Works offline (jobs stored)
- ✅ Free tier available

**Cons:**
- ❌ Requires free accounts on GitHub + Render
- ❌ Services pause if inactive (wake up in 30s)

**Follow:** [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md)

### Option B: Local Network (Alternative)
**Time: 15 minutes | Cost: Free | Accessibility: Local IP only**

Run on your machine and other users on your network access via local IP:
```
http://192.168.1.100:3000
```

**Pros:**
- ✅ Simple setup
- ✅ No internet required
- ✅ Faster for local network

**Cons:**
- ❌ Only works on same network
- ❌ Your machine must stay on
- ❌ Others need your IP address

---

## 📋 What You Need

### For Cloud Deployment (Render)
- GitHub account (free): https://github.com/signup
- Render account (free): https://render.com
- Email for notifications (Gmail recommended)
- ~30 minutes

### For Local Deployment
- Python 3.11+
- Node.js 18+
- PostgreSQL (or SQLite)
- ~15 minutes

---

## 🔐 Security Setup

### 1. Secret Key
Generate a secure secret key:
```
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Use this for `SECRET_KEY` environment variable

### 2. Email Setup (Gmail)
1. Enable 2-Factor Authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate app-specific password
4. Use this in `SMTP_PASS` (not your actual Gmail password)

### 3. Database
For cloud: Use PostgreSQL (included in Render)
For local: Use SQLite (included in project)

---

## 🛠 Troubleshooting Deployment

### Backend Won't Start
**Error:** `ModuleNotFoundError`
- ✓ Check `requirements.txt` has all dependencies
- ✓ Check Python version is 3.11+
- ✓ Check `pip install -r requirements.txt` ran successfully

**Error:** `Connection refused on port 8000`
- ✓ Port 8000 might be in use
- ✓ Change port in docker-compose or startup command

### Frontend Won't Load
**Error:** `Cannot find module`
- ✓ Check `npm install` ran in frontend directory
- ✓ Delete `node_modules` and `package-lock.json`, reinstall

**Error:** `API calls failing`
- ✓ Check `VITE_API_URL` is set correctly
- ✓ Check backend is running and accessible
- ✓ Check CORS is enabled in backend

### Database Connection Error
**Error:** `SQLALCHEMY_DATABASE_URL not set`
- ✓ Check `.env` file exists
- ✓ Check `DATABASE_URL` is set
- ✓ Check database is running

### Jobs Not Scraping
**Error:** "Scheduler not running"
- ✓ Check backend logs for scheduler errors
- ✓ Verify SMTP credentials if email notifications enabled
- ✓ Check user has set preferences

---

## 📊 File Structure

```
devapply_backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── db.py                # Database setup
│   ├── models.py            # SQLModel models
│   ├── scheduler.py         # Job scraper
│   └── scrapers/            # Job scraper modules
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/      # React components
│   └── vite.config.js
├── docker-compose.yml       # Docker setup
├── requirements.txt         # Python dependencies
├── DEPLOYMENT_RENDER.md     # Render guide
└── QUICKSTART_DEPLOY.md     # Quick guide
```

---

## 🔄 After Deployment

### 1. Test Your App
- Visit the frontend URL
- Register a test account
- Login
- Set preferences
- Upload resume
- Check jobs appear

### 2. Monitor
- Check Render dashboard regularly
- Look for errors in logs
- Monitor database usage

### 3. Maintenance
- Update scrapers if job site structures change
- Monitor email quota
- Check disk space on database

### 4. Scaling
If you get many users:
- Upgrade from free tier ($7/month per service)
- Get paid PostgreSQL plan
- Add more resources as needed

---

## 📖 Learn More

### FastAPI
- Docs: https://fastapi.tiangolo.com/
- Deployment: https://fastapi.tiangolo.com/deployment/

### React/Vite
- Docs: https://vitejs.dev/
- React: https://react.dev/

### Render
- Docs: https://render.com/docs
- Status: https://status.render.com/

---

## 🎉 You're Ready!

Choose your deployment option:
- **Cloud (Recommended):** [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md)
- **Quick Start:** [QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md)

Then share your link with others!

---

## 📞 Need Help?

Check the troubleshooting section above or review the detailed guides.

**Common issues resolved in 5 minutes!**

---

**Deployment Date:** 2026-01-17  
**Version:** 1.0.0  
**Status:** Ready to Deploy 🚀

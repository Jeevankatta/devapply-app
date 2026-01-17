# DevApply - Quick Start Guide

## 🚀 Deploy in 30 Minutes (Free)

### Quick Summary
- ✅ Online deployment (no local setup needed for users)
- ✅ Users login and set job preferences
- ✅ Automatic job scraping in background
- ✅ Works offline (jobs stored in database)
- ✅ Free tier ($0/month)

---

## 📋 Prerequisites
- GitHub account (free): https://github.com
- Render account (free): https://render.com

---

## 🎯 5-Minute Steps

### Step 1: Push to GitHub
```powershell
cd c:\Users\Dell\Downloads\devapply_backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/devapply-app.git
git push -u origin main
```

### Step 2: Create Database
1. Go to https://render.com (sign in with GitHub)
2. Click **+ New** → **PostgreSQL**
3. Name: `devapply-db`, Plan: **Free**
4. Click **Create Database**
5. Copy connection string

### Step 3: Deploy Backend
1. Click **+ New** → **Web Service**
2. Connect GitHub repository
3. **Name**: `devapply-backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Add Environment Variables**:
   ```
   SECRET_KEY=your-random-32-char-string-here
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ENVIRONMENT=production
   FRONTEND_URL=(leave empty for now)
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-gmail-app-password
   ```
7. Click **Create Web Service**
8. Wait for deployment ✓

### Step 4: Deploy Frontend
1. Click **+ New** → **Web Service**
2. **Name**: `devapply-frontend`
3. **Build Command**: `cd frontend && npm install && npm run build`
4. **Start Command**: `cd frontend && npm run preview -- --host 0.0.0.0`
5. **Add Environment Variable**:
   ```
   VITE_API_URL=https://devapply-backend.onrender.com
   ```
6. Click **Create Web Service**
7. Wait for deployment ✓

### Step 5: Update Backend
1. Go to `devapply-backend` service
2. Update `FRONTEND_URL`:
   ```
   https://devapply-frontend.onrender.com
   ```
3. Save (auto-redeploy)

---

## ✅ Done!

Your app is now live at:
```
https://devapply-frontend.onrender.com
```

Share this link with others! They can:
- Register with email/password
- Upload resume
- Set job preferences
- View and apply to jobs

---

## 📝 For Users

**Registration Flow:**
1. Visit: `https://devapply-frontend.onrender.com`
2. Click "Register"
3. Enter name, email, password
4. Login
5. Upload resume (optional)
6. Set job preferences
7. Jobs auto-scrape every 6 hours

---

## 🔧 Configuration

### Email Notifications (Optional)
Set `SMTP_USER` and `SMTP_PASS` to your Gmail credentials

### Telegram Alerts (Optional)
Set `TELEGRAM_BOT_TOKEN` in environment

### Custom Domain
Add custom domain in frontend service settings

---

## 📊 Monitor Your App

Check status dashboard: https://dashboard.render.com/

- Green = Running ✓
- Yellow = Building
- Red = Error (check logs)

---

## 💰 Costs
- **Free tier**: $0/month
  - 750 compute hours (plenty for small/medium usage)
  - 5GB storage
  - Services pause after 15 mins inactivity (wake up in ~30s)

- **Upgrade to Always-On**: $7/month per service

---

## Need Help?

See detailed guide: [DEPLOYMENT_RENDER.md](DEPLOYMENT_RENDER.md)

Common issues:
- ❌ "Database connection error" → Check DATABASE_URL format
- ❌ "CORS error" → Wait a few minutes for backend redeploy
- ❌ "Blank page" → Check browser console (F12) for errors
- ❌ "Jobs not scraping" → Verify SMTP_USER/SMTP_PASS are correct

---

**Deployment complete! 🎉**

# Environment Variables Setup Guide

This guide explains all environment variables used in DevApply for both local development and cloud deployment.

---

## 📍 Where to Set Environment Variables

### 🖥️ Local Development
1. Create `.env` file in project root
2. Add variables from `.env.example`
3. FastAPI loads from `.env` automatically

### ☁️ Cloud (Render)
1. Go to service settings
2. Click "Environment" tab
3. Add each variable as a separate entry
4. Click "Save" (auto-deploys)

---

## 🔑 Required Variables

### `SECRET_KEY` ⚠️ IMPORTANT
**Purpose:** Used to sign JWT authentication tokens

**Generate new:**
```powershell
# Windows
[Convert]::ToBase64String([byte[]] (1..32 | % { Get-Random -Max 256 }))

# Or use this Python command
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or simple random string (min 32 chars)
aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV
```

**Example:** `your-super-secret-key-min-32-characters`

**Default:** If not set, uses demo key (NOT SECURE!)

---

### `DATABASE_URL` 🗄️ CRITICAL
**Purpose:** Database connection string

**For Cloud (PostgreSQL):**
```
postgresql://username:password@hostname:5432/database_name
```

**For Local (SQLite):**
```
sqlite:///./test.db
```

**From Render PostgreSQL:**
1. Create PostgreSQL in Render
2. Click database to view details
3. Copy connection string
4. Replace password and hostname

**Example:** 
```
postgresql://devapply_user:abc123xyz@aws-us-east-1.c.psycopg2.com:5432/devapply_db
```

---

### `ENVIRONMENT` 🔧 Important
**Purpose:** Tells app if it's development or production

**Options:**
- `development` - Local testing (debug on, CORS open)
- `production` - Cloud/live (debug off, CORS restricted)

**Set to:** `production` on Render

---

### `FRONTEND_URL` 🌐 Important
**Purpose:** Tells backend where frontend is hosted (for CORS)

**Local:**
```
http://localhost:3000
```

**Cloud (Render):**
```
https://devapply-frontend.onrender.com
```

---

## 📧 Email Configuration (Optional but Recommended)

### `SMTP_USER`
**Purpose:** Email address for sending notifications

**Value:** Your Gmail address
```
your-email@gmail.com
```

### `SMTP_PASS`
**Purpose:** Gmail app-specific password (NOT your regular password!)

**How to generate:**
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (custom name)"
3. Enter "DevApply"
4. Google generates 16-character password
5. Copy and use that (not your Gmail password!)

**Example:** `abcd efgh ijkl mnop` (with spaces, copy as-is)

---

## 📱 Telegram Configuration (Optional)

### `TELEGRAM_BOT_TOKEN`
**Purpose:** Enable Telegram notifications for job alerts

**How to get:**
1. Open Telegram
2. Search for `@botfather`
3. Send `/start`
4. Send `/newbot`
5. Follow instructions
6. Copy bot token

**Example:** `1234567890:ABCDEfghijKLMnopqrst`

**Note:** Leave empty if not using

---

## 🎯 Algorithm & Expiration

### `JWT_ALGORITHM`
**Purpose:** Algorithm for signing tokens

**Default:** `HS256` (recommended)

**Don't change unless needed**

### `JWT_EXPIRATION_HOURS`
**Purpose:** How long login sessions last

**Default:** `24` (24 hours)

**Options:** 
- `24` - 1 day (recommended)
- `168` - 1 week
- `720` - 30 days

---

## 📊 Complete .env File Example

```env
# Core
ENVIRONMENT=production
SECRET_KEY=your-super-secret-key-min-32-characters-change-this

# Database
DATABASE_URL=postgresql://username:password@hostname:5432/devapply_db

# Frontend
FRONTEND_URL=https://devapply-frontend.onrender.com

# Email
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Optional
TELEGRAM_BOT_TOKEN=your-bot-token-here

# JWT
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
```

---

## ⚠️ Security Best Practices

### DO ✅
- [ ] Use strong, random SECRET_KEY
- [ ] Use app-specific password (not Gmail password)
- [ ] Set ENVIRONMENT=production on cloud
- [ ] Keep .env file private (add to .gitignore)
- [ ] Rotate SECRET_KEY regularly
- [ ] Use HTTPS only (Render auto-provides)
- [ ] Use PostgreSQL in production (not SQLite)

### DON'T ❌
- [ ] Commit .env to GitHub
- [ ] Use demo/default values in production
- [ ] Share SECRET_KEY or passwords
- [ ] Use your real Gmail password
- [ ] Leave debug mode on
- [ ] Use HTTP in production

---

## 🔄 Environment-Specific Settings

### Development (.env)
```env
ENVIRONMENT=development
DATABASE_URL=sqlite:///./test.db
SECRET_KEY=dev-key-just-for-testing
FRONTEND_URL=http://localhost:3000
```

### Production (Render)
```env
ENVIRONMENT=production
DATABASE_URL=postgresql://...
SECRET_KEY=generated-random-key-min-32-chars
FRONTEND_URL=https://yourapp.onrender.com
```

---

## 🆘 Troubleshooting

### Error: "SQLALCHEMY_DATABASE_URL is not set"
**Fix:** Add `DATABASE_URL` to environment variables

### Error: "Invalid token"
**Fix:** Check `SECRET_KEY` matches across services

### Error: "CORS origin not allowed"
**Fix:** Update `FRONTEND_URL` to match your frontend URL

### Error: "Email failed to send"
**Fix:** Check `SMTP_USER` and `SMTP_PASS` are correct

### Error: "No module named 'app'"
**Fix:** Restart backend service after env changes

---

## 📋 Setup Checklist

For local development:
- [ ] Create .env file
- [ ] Set all required variables
- [ ] Add .env to .gitignore
- [ ] Test app locally

For Render deployment:
- [ ] Generate new SECRET_KEY
- [ ] Get PostgreSQL connection string
- [ ] Create app-specific Gmail password
- [ ] Add all variables to Render dashboard
- [ ] Test after deployment
- [ ] Monitor logs for errors

---

## 🔒 Securing Your Variables

### On Your Computer (Local)
```
❌ Don't commit .env
✅ Add .env to .gitignore
✅ Keep .env private
✅ Don't share with others
```

### On Render (Cloud)
```
✅ Use Render's environment dashboard
✅ Render encrypts values
✅ Only you can see values
✅ Auto-injected into app at runtime
```

---

## 📞 Support

If variables aren't working:
1. Check for typos (case-sensitive!)
2. Verify values are set
3. Restart service after changes
4. Check logs for error messages
5. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for more help

---

**Variables Set Correctly? ✅**

Your app is ready to deploy!

👉 Continue with: [QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md)

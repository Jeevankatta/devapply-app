
from fastapi import FastAPI, UploadFile, File, HTTPException, Response, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .db import init_db, get_session
from .models import User, Preference, Job, Application
from .scheduler import start, scheduler, run_all
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

import uuid, os
from pathlib import Path
from typing import List

# Load environment variables from .env file
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Get environment
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

app = FastAPI(title="DevApply API")

# Enable CORS for React frontend - support multiple environments
cors_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4173",
    FRONTEND_URL,
]

if ENVIRONMENT == "production":
    # In production, add deployed frontend URL
    cors_origins.extend([
        "https://devapply-frontend.onrender.com",
        "https://*.onrender.com"
    ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Request/Response models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class RegisterResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str

# JWT Token functions
def create_access_token(user_id: int, email: str, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    if expires_delta is None:
        expires_delta = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": str(user_id), "email": email, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(authorization: str = Header(None)) -> dict:
    """Verify JWT token from Authorization header and return payload"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
        
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"user_id": int(user_id), "email": payload.get("email")}
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@app.on_event("startup")
def startup():
    init_db()
    start()

@app.post("/register", response_model=RegisterResponse)
def register(request: RegisterRequest):
    try:
        # Validate password
        if len(request.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
        # bcrypt limitation: maximum 72 bytes
        if len(request.password.encode('utf-8')) > 72:
            raise HTTPException(status_code=400, detail="Password cannot be longer than 72 characters")
        
        password_hash = User.hash_password(request.password)
        
        with get_session() as s:
            # Check if email already exists
            existing_user = s.query(User).filter(User.email == request.email).first()
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")
            
            u = User(name=request.name, email=request.email, password_hash=password_hash, api_key=str(uuid.uuid4()))
            s.add(u)
            s.flush()  # Flush to get the ID without committing yet
            
            # Get user_id while still in session
            user_id = u.id
            
            p = Preference(user_id=user_id)
            s.add(p)
            s.commit()  # Commit both user and preference together
        
        # Create JWT token
        access_token = create_access_token(user_id, request.email)
        
        return RegisterResponse(access_token=access_token, token_type="bearer", user_id=user_id, name=request.name)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Login with email and password to retrieve JWT token"""
    try:
        with get_session() as s:
            user = s.query(User).filter(User.email == request.email).first()
            if not user:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            if not user.verify_password(request.password):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            
            # Create JWT token
            access_token = create_access_token(user.id, user.email)
            
            return LoginResponse(
                access_token=access_token,
                token_type="bearer",
                user_id=user.id,
                name=user.name
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@app.get("/users")
def get_all_users():
    """Get all registered users (for admin/testing purposes)"""
    try:
        with get_session() as s:
            users = s.query(User).all()
            return {
                "total": len(users),
                "users": [
                    {
                        "id": u.id,
                        "name": u.name,
                        "email": u.email,
                        "has_resume": u.resume_path is not None,
                        "telegram_chat_id": u.telegram_chat_id
                    }
                    for u in users
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@app.post("/upload_resume")
def upload_resume(file: UploadFile = File(...), authorization: str = Header(None)):
    try:
        # Verify JWT token
        token_data = verify_token(authorization)
        user_id = token_data["user_id"]
        
        with get_session() as s:
            user = s.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found")
            
            # Validate file type
            allowed_types = ["application/pdf", "application/msword", 
                           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
            if file.content_type not in allowed_types:
                raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and Word documents are allowed.")
            
            # Validate file size (max 5MB)
            file_content = file.file.read()
            if len(file_content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="File size exceeds 5MB limit")
            
            dest = UPLOAD_DIR / f"{user.id}_{file.filename}"
            with open(dest, "wb") as f:
                f.write(file_content)
            
            user.resume_path = str(dest)
            s.add(user)
            s.commit()
        
        return {"ok": True, "message": "Resume uploaded successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/health")
def health():
    return {"status":"ok"}

# Scheduler control endpoints
@app.get("/scheduler/status")
def get_scheduler_status():
    """Get scheduler status"""
    return {
        "running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run_time": str(job.next_run_time) if job.next_run_time else None
            }
            for job in scheduler.get_jobs()
        ]
    }

@app.post("/scheduler/stop")
def stop_scheduler():
    """Stop the scheduler"""
    if scheduler.running:
        scheduler.shutdown()
        return {"message": "Scheduler stopped", "status": "stopped"}
    return {"message": "Scheduler is already stopped", "status": "stopped"}

@app.post("/scheduler/start")
def start_scheduler():
    """Start the scheduler"""
    if not scheduler.running:
        scheduler.start()
        return {"message": "Scheduler started", "status": "running"}
    return {"message": "Scheduler is already running", "status": "running"}

@app.post("/scheduler/run-now")
def run_scheduler_now():
    """Manually trigger job scraping for all users"""
    try:
        run_all()
        return {"message": "Job scraping completed", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running scheduler: {str(e)}")

# Job viewing endpoints
@app.get("/jobs")
def get_jobs(limit: int = 50, authorization: str = Header(None)):
    """Get jobs for a user"""
    token_data = verify_token(authorization)
    user_id = token_data["user_id"]
    
    with get_session() as s:
        user = s.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        applications = s.query(Application).filter(
            Application.user_id == user.id
        ).order_by(Application.applied_on.desc()).limit(limit).all()
        
        result = []
        for app in applications:
            job = s.query(Job).filter(Job.id == app.job_id).first()
            if job:
                result.append({
                    "id": job.id,
                    "platform": job.platform,
                    "title": job.title,
                    "company": job.company,
                    "link": job.link,
                    "status": app.status,
                    "applied_on": str(app.applied_on) if app.applied_on else None
                })
        
        return {"jobs": result, "total": len(result)}

@app.get("/stats")
def get_stats(authorization: str = Header(None)):
    """Get user statistics"""
    token_data = verify_token(authorization)
    user_id = token_data["user_id"]
    
    with get_session() as s:
        user = s.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        total_jobs = s.query(Application).filter(Application.user_id == user.id).count()
        saved_jobs = s.query(Application).filter(
            Application.user_id == user.id,
            Application.status == "Saved"
        ).count()
        
        pref = s.query(Preference).filter(Preference.user_id == user.id).first()
        
        return {
            "total_jobs": total_jobs,
            "saved_jobs": saved_jobs,
            "keywords": pref.keywords if pref else "DevOps",
            "location": pref.location if pref else "Bangalore",
            "daily_limit": pref.daily_limit if pref else 50
        }

@app.get("/favicon.ico")
def favicon():
    """Handle favicon requests to prevent 404 errors"""
    return Response(status_code=204)

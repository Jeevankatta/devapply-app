
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import date
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
    password_hash: str
    api_key: str
    telegram_chat_id: Optional[str] = None
    resume_path: Optional[str] = None
    
    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password_hash)
    
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

class Preference(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    keywords: str = "DevOps"
    location: str = "Bangalore"
    daily_limit: int = 50

class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    platform: str
    title: str
    company: str
    link: str

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    job_id: int
    status: str
    applied_on: Optional[date] = None

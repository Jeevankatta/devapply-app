
from sqlmodel import SQLModel, create_engine, Session
from pathlib import Path

DB_FILE = Path(__file__).resolve().parents[1] / "devapply.db"
engine = create_engine(f"sqlite:///{DB_FILE}", connect_args={"check_same_thread": False})

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    return Session(engine)

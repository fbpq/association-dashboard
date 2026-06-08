from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, func
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(20), default="viewer", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    position = Column(String(200), nullable=True)
    avatar = Column(Text, nullable=True)      # base64 encoded image
    phone = Column(String(30), nullable=True)
    email = Column(String(200), nullable=True)
    department = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

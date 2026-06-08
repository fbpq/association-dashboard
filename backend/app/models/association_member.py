from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.session import Base


class AssociationMember(Base):
    __tablename__ = "association_members"

    id = Column(Integer, primary_key=True, index=True)
    association_name = Column(String(200), nullable=False, index=True)
    role = Column(String(30), nullable=False)   # secretary | vice_secretary | inspector | member1 | member2 | alternate
    role_label = Column(String(50), nullable=False)
    full_name = Column(String(100), nullable=False)
    national_id = Column(String(20), nullable=True)
    phone = Column(String(30), nullable=True)
    email = Column(String(200), nullable=True)
    major = Column(String(100), nullable=True)
    semester = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

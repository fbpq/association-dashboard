from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ARRAY, func, ForeignKey
from app.db.session import Base


class Association(Base):
    __tablename__ = "associations"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(String(200), nullable=False, index=True)
    secretary_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    activity_status = Column(String(20), nullable=False, default="نامشخص")
    logo_status = Column(String(20), nullable=False, default="نامشخص")
    header_status = Column(String(20), nullable=False, default="نامشخص")
    student_email = Column(String(200), nullable=True)
    roadmap_session = Column(String(100), nullable=True)
    channel_bale = Column(String(50), nullable=True)
    channel_rubika = Column(String(50), nullable=True)
    channel_igap = Column(String(50), nullable=True)
    channel_ita = Column(String(50), nullable=True)
    content_production = Column(String(50), nullable=True)
    form_competition = Column(String(100), nullable=True)
    form_workshop = Column(String(100), nullable=True)
    status = Column(String(50), nullable=True)
    site_activity_registered = Column(String(50), nullable=True)
    roadmap = Column(String(100), nullable=True)
    new_license_session = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    needs_follow_up = Column(Boolean, default=False, nullable=False, index=True)
    missing_fields = Column(Text, nullable=True)  # JSON array stored as text

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

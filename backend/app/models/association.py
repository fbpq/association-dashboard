from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func, ForeignKey
from app.db.session import Base


class Association(Base):
    __tablename__ = "associations"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True)

    name = Column(Text, nullable=False, index=True)
    secretary_name = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    activity_status = Column(Text, nullable=False, default="نامشخص")
    logo_status = Column(Text, nullable=False, default="نامشخص")
    header_status = Column(Text, nullable=False, default="نامشخص")
    student_email = Column(Text, nullable=True)
    roadmap_session = Column(Text, nullable=True)
    channel_bale = Column(Text, nullable=True)
    channel_rubika = Column(Text, nullable=True)
    channel_igap = Column(Text, nullable=True)
    channel_ita = Column(Text, nullable=True)
    content_production = Column(Text, nullable=True)
    form_competition = Column(Text, nullable=True)
    form_workshop = Column(Text, nullable=True)
    status = Column(Text, nullable=True)
    site_activity_registered = Column(Text, nullable=True)
    roadmap = Column(Text, nullable=True)
    new_license_session = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    description = Column(Text, nullable=True)

    needs_follow_up = Column(Boolean, default=False, nullable=False, index=True)
    missing_fields = Column(Text, nullable=True)  # JSON array stored as text

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, func
from app.db.session import Base


class AssociationActivity(Base):
    __tablename__ = "association_activities"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True)

    association_name = Column(String(200), nullable=False, index=True)
    activity_type = Column(String(50), nullable=False, index=True)  # canonical type
    title = Column(String(300), nullable=True)
    event_date = Column(String(50), nullable=True)   # stored as Persian date string
    semester = Column(String(30), nullable=True)
    academic_year = Column(String(20), nullable=True)
    month = Column(Integer, nullable=True)   # 1-12 Gregorian month for filtering
    year = Column(Integer, nullable=True)    # Gregorian year for filtering
    participants_count = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=True, default="برگزار شد")
    needs_follow_up = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

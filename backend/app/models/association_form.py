from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, func, ForeignKey
from app.db.session import Base


class AssociationForm(Base):
    __tablename__ = "association_forms"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True)

    association_name = Column(String(200), nullable=False, index=True)
    workshop_title = Column(String(300), nullable=True)
    competition_title = Column(String(300), nullable=True)
    event_date = Column(String(50), nullable=True)
    status = Column(String(100), nullable=True)

    sig_secretary = Column(String(20), nullable=True)
    sig_advisor = Column(String(20), nullable=True)
    sig_inspector = Column(String(20), nullable=True)
    sig_dean = Column(String(20), nullable=True)
    sig_head_associations = Column(String(20), nullable=True)
    sig_director_general = Column(String(20), nullable=True)

    description = Column(Text, nullable=True)
    description2 = Column(Text, nullable=True)

    form_type = Column(String(20), nullable=False, default="نامشخص")
    is_complete = Column(Boolean, default=False, nullable=False)
    has_missing_signature = Column(Boolean, default=False, nullable=False)
    is_cancelled = Column(Boolean, default=False, nullable=False)
    needs_follow_up = Column(Boolean, default=False, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

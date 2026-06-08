from sqlalchemy import Column, Integer, String, BigInteger, DateTime, Text, func
from app.db.session import Base


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False, unique=True)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(20), nullable=False, default="unknown")  # associations | forms | unknown
    file_size = Column(BigInteger, nullable=False)
    uploaded_by = Column(String(100), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending | processing | success | error
    parsed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    record_count = Column(Integer, nullable=True)
    warnings_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

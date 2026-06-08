from sqlalchemy import Column, Integer, String, Text, DateTime, func, ForeignKey
from app.db.session import Base


class UploadLog(Base):
    __tablename__ = "upload_logs"

    id = Column(Integer, primary_key=True, index=True)
    upload_id = Column(Integer, ForeignKey("uploaded_files.id", ondelete="CASCADE"), nullable=False, index=True)
    level = Column(String(10), nullable=False, default="info")  # info | warning | error
    message = Column(Text, nullable=False)
    row_number = Column(Integer, nullable=True)
    column_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

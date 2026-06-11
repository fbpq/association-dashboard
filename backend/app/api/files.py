import uuid
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.models.uploaded_file import UploadedFile
from app.models.upload_log import UploadLog
from app.api.auth import get_current_user
from app.core.config import settings
from app.services.parser_service import process_upload

router = APIRouter()

ALLOWED_EXTENSIONS = {'.xlsx', '.xls'}
MAX_FILE_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


class FileOut(BaseModel):
    id: int
    original_filename: str
    stored_filename: str
    file_type: str
    file_size: int
    uploaded_by: str
    status: str
    parsed_at: Optional[datetime]
    created_at: datetime
    error_message: Optional[str]
    record_count: Optional[int]
    warnings_count: Optional[int]

    class Config:
        from_attributes = True


class LogOut(BaseModel):
    id: int
    upload_id: int
    level: str
    message: str
    row_number: Optional[int]
    column_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("", response_model=list[FileOut])
def list_files(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(UploadedFile).order_by(UploadedFile.created_at.desc()).all()


@router.get("/latest")
def get_latest_files(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    assoc = db.query(UploadedFile).filter(
        UploadedFile.file_type == 'associations',
        UploadedFile.status == 'success',
    ).order_by(UploadedFile.created_at.desc()).first()
    forms = db.query(UploadedFile).filter(
        UploadedFile.file_type == 'forms',
        UploadedFile.status == 'success',
    ).order_by(UploadedFile.created_at.desc()).first()
    return {"associations": assoc, "forms": forms}


@router.post("/upload", response_model=FileOut, status_code=status.HTTP_201_CREATED)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    file_type: str = Form(default="unknown"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate extension
    ext = Path(file.filename or '').suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail="فقط فایل‌های Excel (.xlsx, .xls) مجاز هستند.")

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_BYTES:
        raise HTTPException(400, detail=f"حجم فایل از {settings.MAX_FILE_SIZE_MB} مگابایت بیشتر است.")

    # Store file
    upload_dir = settings.get_upload_path()
    stored_name = f"{file_type}_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = upload_dir / stored_name
    file_path.write_bytes(content)

    # Create DB record
    upload_record = UploadedFile(
        original_filename=file.filename or stored_name,
        stored_filename=stored_name,
        file_path=str(file_path),
        file_type=file_type,
        file_size=len(content),
        uploaded_by=current_user.full_name,
        status="pending",
    )
    db.add(upload_record)
    db.commit()
    db.refresh(upload_record)

    # Process in background with a fresh DB session (request session closes after response)
    upload_id = upload_record.id
    def _bg():
        from app.db.session import SessionLocal as _SL
        _db = _SL()
        try:
            rec = _db.query(UploadedFile).filter(UploadedFile.id == upload_id).first()
            if rec:
                process_upload(_db, rec)
        finally:
            _db.close()
    background_tasks.add_task(_bg)
    return upload_record


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(file_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    upload = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not upload:
        raise HTTPException(404, detail="فایل یافت نشد.")
    # Remove physical file
    try:
        Path(upload.file_path).unlink(missing_ok=True)
    except Exception:
        pass
    db.delete(upload)
    db.commit()


@router.post("/{file_id}/parse", response_model=FileOut)
def reparse_file(file_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    upload = db.query(UploadedFile).filter(UploadedFile.id == file_id).first()
    if not upload:
        raise HTTPException(404, detail="فایل یافت نشد.")
    if not Path(upload.file_path).exists():
        raise HTTPException(400, detail="فایل فیزیکی روی سرور یافت نشد.")
    # Remove old parsed data
    from app.models.association import Association
    from app.models.association_form import AssociationForm
    db.query(Association).filter(Association.upload_id == upload.id).delete()
    db.query(AssociationForm).filter(AssociationForm.upload_id == upload.id).delete()
    db.query(UploadLog).filter(UploadLog.upload_id == upload.id).delete()
    db.flush()
    process_upload(db, upload)
    db.refresh(upload)
    return upload


@router.get("/{file_id}/logs", response_model=list[LogOut])
def get_logs(file_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(UploadLog).filter(UploadLog.upload_id == file_id).order_by(UploadLog.id).all()

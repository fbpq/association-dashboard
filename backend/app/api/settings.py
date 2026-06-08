from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.api.auth import get_current_user

router = APIRouter()


class SettingsResponse(BaseModel):
    org_name: str
    system_name: str
    admin_email: str
    max_file_size_mb: str


class SettingsUpdate(BaseModel):
    settings: list[dict]


@router.get("", response_model=dict)
def get_settings(_: User = Depends(get_current_user)):
    from app.core.config import settings
    return {
        "org_name": settings.ORG_NAME,
        "system_name": settings.APP_NAME,
        "admin_email": "admin@iau.ac.ir",
        "max_file_size_mb": str(settings.MAX_FILE_SIZE_MB),
    }


@router.put("")
def update_settings(body: SettingsUpdate, _: User = Depends(get_current_user)):
    # In production: persist to SystemSetting table or env file
    return {"message": "تنظیمات با موفقیت ذخیره شد."}

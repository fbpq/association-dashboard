from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.core.security import verify_password, hash_password
from app.api.auth import get_current_user

router = APIRouter()


class ProfileOut(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    is_active: bool
    position: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    avatar: Optional[str] = None   # base64 or empty string to remove
    phone: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


def _fmt(u: User) -> dict:
    return {
        "id": u.id,
        "username": u.username,
        "full_name": u.full_name,
        "role": u.role,
        "is_active": u.is_active,
        "position": u.position,
        "avatar": u.avatar,
        "phone": u.phone,
        "email": u.email,
        "department": u.department,
        "bio": u.bio,
    }


@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return _fmt(current_user)


@router.put("", response_model=ProfileOut)
def update_profile(
    data: UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.position is not None:
        current_user.position = data.position
    if data.avatar is not None:
        current_user.avatar = data.avatar if data.avatar else None
    if data.phone is not None:
        current_user.phone = data.phone
    if data.email is not None:
        current_user.email = data.email
    if data.department is not None:
        current_user.department = data.department
    if data.bio is not None:
        current_user.bio = data.bio
    db.commit()
    db.refresh(current_user)
    return _fmt(current_user)


@router.post("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="رمز عبور فعلی اشتباه است")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="رمز عبور جدید باید حداقل ۶ کاراکتر باشد")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "رمز عبور با موفقیت تغییر کرد"}

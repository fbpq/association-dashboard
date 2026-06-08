from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.models.association import Association
from app.models.association_member import AssociationMember
from app.api.auth import get_current_user
from app.api.dashboard import _get_latest_upload_ids

router = APIRouter()

ROLE_LABELS = {
    "secretary":      "دبیر",
    "vice_secretary": "نایب دبیر",
    "inspector":      "بازرس",
    "member1":        "عضو اول",
    "member2":        "عضو دوم",
    "alternate":      "عضو علی‌البدل",
}


class MemberOut(BaseModel):
    id: int
    association_id: int   # echoed back for frontend compatibility
    role: str
    role_label: str
    full_name: str
    national_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    major: Optional[str] = None
    semester: Optional[str] = None


class CreateMemberRequest(BaseModel):
    role: str
    full_name: str
    national_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    major: Optional[str] = None
    semester: Optional[str] = None


class UpdateMemberRequest(BaseModel):
    role: Optional[str] = None
    full_name: Optional[str] = None
    national_id: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    major: Optional[str] = None
    semester: Optional[str] = None


def _get_assoc_name(assoc_id: int, db: Session) -> str:
    assoc_upload_id, _ = _get_latest_upload_ids(db)
    q = db.query(Association).filter(Association.id == assoc_id)
    if assoc_upload_id:
        q = q.filter(Association.upload_id == assoc_upload_id)
    assoc = q.first()
    if not assoc:
        # Try without upload filter (fallback)
        assoc = db.query(Association).filter(Association.id == assoc_id).first()
    if not assoc:
        raise HTTPException(status_code=404, detail="انجمن یافت نشد")
    return assoc.name


def _fmt(m: AssociationMember, assoc_id: int) -> dict:
    return {
        "id": m.id,
        "association_id": assoc_id,
        "role": m.role,
        "role_label": ROLE_LABELS.get(m.role, m.role),
        "full_name": m.full_name,
        "national_id": m.national_id,
        "phone": m.phone,
        "email": m.email,
        "major": m.major,
        "semester": m.semester,
    }


@router.get("/{assoc_id}/members", response_model=list[MemberOut])
def get_members(assoc_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    assoc_name = _get_assoc_name(assoc_id, db)
    members = db.query(AssociationMember).filter(
        AssociationMember.association_name == assoc_name
    ).order_by(AssociationMember.id).all()
    return [_fmt(m, assoc_id) for m in members]


@router.post("/{assoc_id}/members", response_model=MemberOut, status_code=status.HTTP_201_CREATED)
def add_member(
    assoc_id: int,
    data: CreateMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "assistant"):
        raise HTTPException(status_code=403, detail="دسترسی کافی ندارید")
    assoc_name = _get_assoc_name(assoc_id, db)
    member = AssociationMember(
        association_name=assoc_name,
        role=data.role,
        role_label=ROLE_LABELS.get(data.role, data.role),
        full_name=data.full_name,
        national_id=data.national_id,
        phone=data.phone,
        email=data.email,
        major=data.major,
        semester=data.semester,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return _fmt(member, assoc_id)


@router.patch("/{assoc_id}/members/{member_id}", response_model=MemberOut)
def update_member(
    assoc_id: int,
    member_id: int,
    data: UpdateMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "assistant"):
        raise HTTPException(status_code=403, detail="دسترسی کافی ندارید")
    member = db.query(AssociationMember).filter(AssociationMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="عضو یافت نشد")
    if data.role is not None:
        member.role = data.role
        member.role_label = ROLE_LABELS.get(data.role, data.role)
    if data.full_name is not None:
        member.full_name = data.full_name
    if data.national_id is not None:
        member.national_id = data.national_id
    if data.phone is not None:
        member.phone = data.phone
    if data.email is not None:
        member.email = data.email
    if data.major is not None:
        member.major = data.major
    if data.semester is not None:
        member.semester = data.semester
    db.commit()
    db.refresh(member)
    return _fmt(member, assoc_id)


@router.delete("/{assoc_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    assoc_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ("admin", "assistant"):
        raise HTTPException(status_code=403, detail="دسترسی کافی ندارید")
    member = db.query(AssociationMember).filter(AssociationMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="عضو یافت نشد")
    db.delete(member)
    db.commit()

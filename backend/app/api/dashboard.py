import json
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.db.session import get_db
from app.models.user import User
from app.models.association import Association
from app.models.association_form import AssociationForm
from app.models.uploaded_file import UploadedFile
from app.api.auth import get_current_user

router = APIRouter()


class KPIResponse(BaseModel):
    total_associations: int
    active_associations: int
    semi_active_associations: int
    low_activity_associations: int
    unknown_activity_associations: int
    has_logo: int
    no_logo: int
    has_header: int
    no_header: int
    has_email: int
    no_email: int
    needs_follow_up_associations: int
    total_forms: int
    workshops: int
    competitions: int
    complete_forms: int
    incomplete_forms: int
    no_date_forms: int
    cancelled_forms: int
    needs_follow_up_forms: int
    last_upload_date: Optional[str]
    last_processed_date: Optional[str]


def _get_latest_upload_ids(db: Session) -> tuple[Optional[int], Optional[int]]:
    """Return (latest_assoc_upload_id, latest_forms_upload_id)."""
    assoc_upload = db.query(UploadedFile).filter(
        UploadedFile.file_type == 'associations',
        UploadedFile.status == 'success',
    ).order_by(UploadedFile.parsed_at.desc()).first()

    forms_upload = db.query(UploadedFile).filter(
        UploadedFile.file_type == 'forms',
        UploadedFile.status == 'success',
    ).order_by(UploadedFile.parsed_at.desc()).first()

    return (assoc_upload.id if assoc_upload else None), (forms_upload.id if forms_upload else None)


@router.get("/summary", response_model=KPIResponse)
def get_summary(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    assoc_id, forms_id = _get_latest_upload_ids(db)

    def aq():
        q = db.query(Association)
        if assoc_id:
            q = q.filter(Association.upload_id == assoc_id)
        return q

    def fq():
        q = db.query(AssociationForm)
        if forms_id:
            q = q.filter(AssociationForm.upload_id == forms_id)
        return q

    last_upload = db.query(UploadedFile).filter(
        UploadedFile.status == 'success'
    ).order_by(UploadedFile.parsed_at.desc()).first()

    return KPIResponse(
        total_associations=aq().count(),
        active_associations=aq().filter(Association.activity_status == 'فعال').count(),
        semi_active_associations=aq().filter(Association.activity_status == 'نیمه‌فعال').count(),
        low_activity_associations=aq().filter(Association.activity_status == 'کم‌فعالیت').count(),
        unknown_activity_associations=aq().filter(Association.activity_status == 'نامشخص').count(),
        has_logo=aq().filter(Association.logo_status == 'دارد').count(),
        no_logo=aq().filter(Association.logo_status.in_(['ندارد', 'نامشخص'])).count(),
        has_header=aq().filter(Association.header_status == 'دارد').count(),
        no_header=aq().filter(Association.header_status.in_(['ندارد', 'نامشخص'])).count(),
        has_email=aq().filter(Association.student_email.isnot(None)).count(),
        no_email=aq().filter(Association.student_email.is_(None)).count(),
        needs_follow_up_associations=aq().filter(Association.needs_follow_up == True).count(),
        total_forms=fq().count(),
        workshops=fq().filter(AssociationForm.form_type == 'کارگاه').count(),
        competitions=fq().filter(AssociationForm.form_type == 'مسابقه').count(),
        complete_forms=fq().filter(AssociationForm.is_complete == True).count(),
        incomplete_forms=fq().filter(AssociationForm.is_complete == False).count(),
        no_date_forms=fq().filter(AssociationForm.event_date.is_(None)).count(),
        cancelled_forms=fq().filter(AssociationForm.is_cancelled == True).count(),
        needs_follow_up_forms=fq().filter(AssociationForm.needs_follow_up == True).count(),
        last_upload_date=last_upload.created_at.isoformat() if last_upload else None,
        last_processed_date=last_upload.parsed_at.isoformat() if last_upload and last_upload.parsed_at else None,
    )


@router.get("/associations")
def get_associations(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    activity_status: Optional[str] = None,
    logo_status: Optional[str] = None,
    needs_follow_up: Optional[bool] = None,
    has_email: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    assoc_id, _ = _get_latest_upload_ids(db)
    q = db.query(Association)
    if assoc_id:
        q = q.filter(Association.upload_id == assoc_id)
    if search:
        q = q.filter(Association.name.ilike(f'%{search}%') | Association.secretary_name.ilike(f'%{search}%'))
    if activity_status:
        q = q.filter(Association.activity_status == activity_status)
    if logo_status:
        q = q.filter(Association.logo_status == logo_status)
    if needs_follow_up is not None:
        q = q.filter(Association.needs_follow_up == needs_follow_up)
    if has_email is not None:
        if has_email:
            q = q.filter(Association.student_email.isnot(None))
        else:
            q = q.filter(Association.student_email.is_(None))

    total = q.count()
    items = q.order_by(Association.name).offset((page - 1) * per_page).limit(per_page).all()

    # Deserialize missing_fields
    result = []
    for a in items:
        d = {c.name: getattr(a, c.name) for c in a.__table__.columns}
        d['missing_fields'] = json.loads(a.missing_fields or '[]')
        d['created_at'] = a.created_at.isoformat() if a.created_at else None
        result.append(d)

    return {"items": result, "total": total, "page": page, "per_page": per_page, "total_pages": -(-total // per_page)}


@router.get("/forms")
def get_forms(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    form_type: Optional[str] = None,
    is_complete: Optional[bool] = None,
    needs_follow_up: Optional[bool] = None,
    has_missing_signature: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    _, forms_id = _get_latest_upload_ids(db)
    q = db.query(AssociationForm)
    if forms_id:
        q = q.filter(AssociationForm.upload_id == forms_id)
    if search:
        q = q.filter(
            AssociationForm.association_name.ilike(f'%{search}%') |
            AssociationForm.workshop_title.ilike(f'%{search}%') |
            AssociationForm.competition_title.ilike(f'%{search}%')
        )
    if form_type:
        q = q.filter(AssociationForm.form_type == form_type)
    if is_complete is not None:
        q = q.filter(AssociationForm.is_complete == is_complete)
    if needs_follow_up is not None:
        q = q.filter(AssociationForm.needs_follow_up == needs_follow_up)
    if has_missing_signature is not None:
        q = q.filter(AssociationForm.has_missing_signature == has_missing_signature)

    total = q.count()
    items = q.order_by(AssociationForm.association_name).offset((page - 1) * per_page).limit(per_page).all()

    result = []
    for f in items:
        d = {c.name: getattr(f, c.name) for c in f.__table__.columns}
        d['created_at'] = f.created_at.isoformat() if f.created_at else None
        result.append(d)

    return {"items": result, "total": total, "page": page, "per_page": per_page, "total_pages": -(-total // per_page)}


@router.get("/follow-ups")
def get_follow_ups(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    assoc_id, forms_id = _get_latest_upload_ids(db)

    aq = db.query(Association).filter(Association.needs_follow_up == True)
    if assoc_id:
        aq = aq.filter(Association.upload_id == assoc_id)

    fq = db.query(AssociationForm).filter(AssociationForm.needs_follow_up == True)
    if forms_id:
        fq = fq.filter(AssociationForm.upload_id == forms_id)

    assocs = []
    for a in aq.all():
        d = {c.name: getattr(a, c.name) for c in a.__table__.columns}
        d['missing_fields'] = json.loads(a.missing_fields or '[]')
        d['created_at'] = a.created_at.isoformat() if a.created_at else None
        assocs.append(d)

    forms_list = []
    for f in fq.all():
        d = {c.name: getattr(f, c.name) for c in f.__table__.columns}
        d['created_at'] = f.created_at.isoformat() if f.created_at else None
        forms_list.append(d)

    return {"associations": assocs, "forms": forms_list}


@router.get("/charts")
def get_charts(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    assoc_id, forms_id = _get_latest_upload_ids(db)

    def aq():
        q = db.query(Association)
        if assoc_id:
            q = q.filter(Association.upload_id == assoc_id)
        return q

    def fq():
        q = db.query(AssociationForm)
        if forms_id:
            q = q.filter(AssociationForm.upload_id == forms_id)
        return q

    activity_data = [
        {"name": s, "value": aq().filter(Association.activity_status == s).count(), "color": c}
        for s, c in [("فعال", "#059669"), ("نیمه‌فعال", "#D97706"), ("کم‌فعالیت", "#DC2626"), ("نامشخص", "#94A3B8")]
    ]

    logo_data = [
        {"name": s, "value": aq().filter(Association.logo_status == s).count(), "color": c}
        for s, c in [("دارد", "#059669"), ("ناقص", "#D97706"), ("ندارد", "#DC2626"), ("نامشخص", "#94A3B8")]
    ]

    form_type_data = [
        {"name": s, "value": fq().filter(AssociationForm.form_type == s).count(), "color": c}
        for s, c in [("کارگاه", "#2563EB"), ("مسابقه", "#7C3AED"), ("نامشخص", "#94A3B8")]
    ]

    sig_data = [
        {"name": "امضای کامل", "value": fq().filter(AssociationForm.is_complete == True).count(), "color": "#059669"},
        {"name": "نقص امضا",   "value": fq().filter(AssociationForm.has_missing_signature == True).count(), "color": "#DC2626"},
        {"name": "لغو شده",    "value": fq().filter(AssociationForm.is_cancelled == True).count(), "color": "#94A3B8"},
    ]

    channel_data = [
        {"name": n, "value": aq().filter(getattr(Association, f) == 'دارد').count(), "color": c}
        for n, f, c in [
            ("بله",    "channel_bale",   "#2563EB"),
            ("روبیکا", "channel_rubika", "#7C3AED"),
            ("ایگپ",   "channel_igap",   "#0891B2"),
            ("ایتا",   "channel_ita",    "#059669"),
        ]
    ]

    return {
        "activity_status_chart":   [d for d in activity_data if d["value"] > 0],
        "logo_status_chart":       [d for d in logo_data if d["value"] > 0],
        "form_type_chart":         [d for d in form_type_data if d["value"] > 0],
        "signature_status_chart":  [d for d in sig_data if d["value"] > 0],
        "associations_by_channel": [d for d in channel_data if d["value"] > 0],
    }

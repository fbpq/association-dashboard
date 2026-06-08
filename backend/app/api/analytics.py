"""
Analytics API: Deep analysis using Pandas + NumPy.
Returns rich statistical summaries for the AnalyticsPage.
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.association import Association
from app.models.association_form import AssociationForm
from app.models.association_activity import AssociationActivity
from app.models.uploaded_file import UploadedFile
from app.api.auth import get_current_user
from app.api.dashboard import _get_latest_upload_ids

router = APIRouter()

ACTIVITY_LABELS = {
    "بازدید_علمی":          "بازدید علمی",
    "نشریه":                "نشریه",
    "سخنرانی_علمی":         "سخنرانی علمی",
    "همکاری_علمی":          "همکاری و مشارکت علمی",
    "کارگاه":               "برگزاری کارگاه",
    "نمایشگاه":             "برگزاری نمایشگاه",
    "دوره_کمک_آموزشی":      "دوره‌های کمک آموزشی",
    "همایش_علمی":           "برگزاری همایش علمی",
    "کرسی_اندیشه_ورزی":     "کرسی اندیشه‌ورزی",
    "مسابقه_علمی":          "مسابقه علمی",
}

ACTIVITY_COLORS = [
    "#2174b8", "#7fa343", "#f59e0b", "#8b5cf6", "#ec4899",
    "#06b6d4", "#f97316", "#10b981", "#6366f1", "#ef4444",
]


def _get_activity_uid(db: Session) -> Optional[int]:
    upload = db.query(UploadedFile).filter(
        UploadedFile.file_type == "activities",
        UploadedFile.status == "success",
    ).order_by(UploadedFile.parsed_at.desc()).first()
    return upload.id if upload else None


@router.get("/full")
def full_analytics(
    months: Optional[int] = Query(None, description="Filter last N months (1 or 3)"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    try:
        import pandas as pd
        import numpy as np
    except ImportError:
        return {"error": "pandas/numpy not available"}

    assoc_uid, forms_uid = _get_latest_upload_ids(db)
    act_uid = _get_activity_uid(db)

    # ── Fetch all data ────────────────────────────────────────────────────────
    assocs = db.query(Association)
    if assoc_uid:
        assocs = assocs.filter(Association.upload_id == assoc_uid)
    assocs = assocs.all()

    forms = db.query(AssociationForm)
    if forms_uid:
        forms = forms.filter(AssociationForm.upload_id == forms_uid)
    forms = forms.all()

    acts = db.query(AssociationActivity)
    if act_uid:
        acts = acts.filter(AssociationActivity.upload_id == act_uid)
    if months:
        from datetime import datetime, timedelta
        cutoff_year = (datetime.now() - timedelta(days=months * 30)).year
        acts = acts.filter(AssociationActivity.year >= cutoff_year)
    acts = acts.all()

    # ── Associations DataFrame ────────────────────────────────────────────────
    if assocs:
        df_assoc = pd.DataFrame([{
            "name": a.name,
            "activity_status": a.activity_status,
            "logo_status": a.logo_status,
            "has_email": bool(a.student_email),
        } for a in assocs])
    else:
        df_assoc = pd.DataFrame(columns=["name", "activity_status", "logo_status", "has_email"])

    # ── Forms DataFrame ───────────────────────────────────────────────────────
    if forms:
        df_forms = pd.DataFrame([{
            "association_name": f.association_name,
            "form_type": f.form_type,
            "is_complete": f.is_complete,
            "is_cancelled": f.is_cancelled,
            "needs_follow_up": f.needs_follow_up,
        } for f in forms])
    else:
        df_forms = pd.DataFrame(columns=["association_name", "form_type", "is_complete", "is_cancelled", "needs_follow_up"])

    # ── Activities DataFrame ──────────────────────────────────────────────────
    if acts:
        df_act = pd.DataFrame([{
            "association_name": a.association_name,
            "activity_type": a.activity_type,
            "month": a.month,
            "year": a.year,
            "participants_count": a.participants_count or 0,
            "status": a.status,
        } for a in acts])
    else:
        df_act = pd.DataFrame(columns=["association_name", "activity_type", "month", "year", "participants_count", "status"])

    # ── Analysis ──────────────────────────────────────────────────────────────
    result = {}

    # 1. Association status distribution
    result["assoc_status"] = (
        df_assoc.groupby("activity_status").size().reset_index(name="count")
        .rename(columns={"activity_status": "name"})
        .to_dict("records") if not df_assoc.empty else []
    )

    # 2. Logo/header status
    result["logo_status"] = (
        df_assoc.groupby("logo_status").size().reset_index(name="count")
        .rename(columns={"logo_status": "name"})
        .to_dict("records") if not df_assoc.empty else []
    )

    # 3. Activity type distribution
    if not df_act.empty:
        type_counts = df_act.groupby("activity_type").size().reset_index(name="count")
        result["activity_by_type"] = [
            {
                "type": row["activity_type"],
                "label": ACTIVITY_LABELS.get(row["activity_type"], row["activity_type"]),
                "count": int(row["count"]),
                "color": ACTIVITY_COLORS[i % len(ACTIVITY_COLORS)],
            }
            for i, row in type_counts.iterrows()
        ]
    else:
        result["activity_by_type"] = []

    # 4. Monthly activity trend
    if not df_act.empty and "month" in df_act.columns:
        monthly = df_act[df_act["month"].notna() & df_act["year"].notna()]
        if not monthly.empty:
            trend = monthly.groupby(["year", "month"]).size().reset_index(name="count")
            result["monthly_trend"] = [
                {
                    "label": f"{int(row['year'])}/{str(int(row['month'])).zfill(2)}",
                    "count": int(row["count"]),
                }
                for _, row in trend.iterrows()
            ]
        else:
            result["monthly_trend"] = []
    else:
        result["monthly_trend"] = []

    # 5. Top associations by activity count
    if not df_act.empty:
        top = df_act.groupby("association_name").size().reset_index(name="count") \
                    .sort_values("count", ascending=False).head(10)
        result["top_associations"] = top.to_dict("records")
    else:
        result["top_associations"] = []

    # 6. Participants stats
    if not df_act.empty and df_act["participants_count"].sum() > 0:
        pc = df_act["participants_count"]
        result["participants_stats"] = {
            "total": int(pc.sum()),
            "mean": round(float(pc.mean()), 1),
            "median": round(float(pc.median()), 1),
            "max": int(pc.max()),
            "min": int(pc.min()),
        }
    else:
        result["participants_stats"] = {"total": 0, "mean": 0, "median": 0, "max": 0, "min": 0}

    # 7. Forms analysis
    if not df_forms.empty:
        result["forms_summary"] = {
            "total": len(df_forms),
            "complete": int(df_forms["is_complete"].sum()),
            "cancelled": int(df_forms["is_cancelled"].sum()),
            "needs_follow_up": int(df_forms["needs_follow_up"].sum()),
            "completion_rate": round(float(df_forms["is_complete"].mean()) * 100, 1),
        }
        by_type = df_forms.groupby("form_type").size().reset_index(name="count")
        result["forms_by_type"] = by_type.to_dict("records")
    else:
        result["forms_summary"] = {"total": 0, "complete": 0, "cancelled": 0, "needs_follow_up": 0, "completion_rate": 0}
        result["forms_by_type"] = []

    # 8. Correlation: associations with most activities vs. form completion
    if not df_act.empty and not df_forms.empty:
        act_count = df_act.groupby("association_name").size().reset_index(name="act_count")
        form_count = df_forms.groupby("association_name").agg(
            form_count=("form_type", "count"),
            complete_count=("is_complete", "sum"),
        ).reset_index()
        merged = act_count.merge(form_count, on="association_name", how="outer").fillna(0)
        if len(merged) >= 2:
            corr = float(np.corrcoef(merged["act_count"], merged["form_count"])[0, 1])
            result["activity_form_correlation"] = round(corr, 3) if not np.isnan(corr) else 0
        else:
            result["activity_form_correlation"] = 0
    else:
        result["activity_form_correlation"] = 0

    # 9. Summary KPIs
    result["summary"] = {
        "total_associations": len(assocs),
        "active_associations": int(df_assoc[df_assoc["activity_status"] == "فعال"].shape[0]) if not df_assoc.empty else 0,
        "total_activities": len(acts),
        "total_forms": len(forms),
        "unique_active_associations": int(df_act["association_name"].nunique()) if not df_act.empty else 0,
        "avg_activities_per_assoc": round(len(acts) / max(df_act["association_name"].nunique(), 1), 1) if not df_act.empty else 0,
        "period_months": months,
    }

    return result

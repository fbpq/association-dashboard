from fastapi import APIRouter
from app.api import auth, files, dashboard, export, settings, users, profile, associations, activities, analytics

api_router = APIRouter()

api_router.include_router(auth.router,         prefix="/auth",         tags=["احراز هویت"])
api_router.include_router(files.router,        prefix="/files",        tags=["فایل‌ها"])
api_router.include_router(dashboard.router,    prefix="/dashboard",    tags=["داشبورد"])
api_router.include_router(export.router,       prefix="/export",       tags=["خروجی‌ها"])
api_router.include_router(settings.router,     prefix="/settings",     tags=["تنظیمات"])
api_router.include_router(users.router,        prefix="/users",        tags=["مدیریت کاربران"])
api_router.include_router(profile.router,      prefix="/profile",      tags=["پروفایل"])
api_router.include_router(associations.router, prefix="/associations", tags=["اعضای انجمن‌ها"])
api_router.include_router(activities.router,   prefix="/activities",   tags=["فعالیت‌های انجمن‌ها"])
api_router.include_router(analytics.router,    prefix="/analytics",    tags=["آنالیتیکس"])

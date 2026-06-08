from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import text

from app.core.config import settings
from app.api.router import api_router
from app.db.session import engine, Base

# Import all models so create_all picks them up
from app.models import user, association, association_form, uploaded_file, upload_log  # noqa: F401
from app.models import association_member, association_activity  # noqa: F401

# Create all tables on startup (new tables are created; existing tables are NOT altered)
Base.metadata.create_all(bind=engine)


def _migrate():
    """Safely add new columns to existing tables without dropping data."""
    new_columns = [
        ("users", "position",   "VARCHAR(200)"),
        ("users", "avatar",     "TEXT"),
        ("users", "phone",      "VARCHAR(30)"),
        ("users", "email",      "VARCHAR(200)"),
        ("users", "department", "VARCHAR(100)"),
        ("users", "bio",        "TEXT"),
    ]
    with engine.connect() as conn:
        for table, col, col_type in new_columns:
            try:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_type}"))
                conn.commit()
            except Exception:
                conn.rollback()


_migrate()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API
app.include_router(api_router, prefix="/api")


@app.on_event("startup")
async def seed_admin():
    """Create default admin user if none exists."""
    from app.db.session import SessionLocal
    from app.models.user import User
    from app.core.security import hash_password

    db = SessionLocal()
    try:
        exists = db.query(User).filter(User.username == settings.ADMIN_USERNAME).first()
        if not exists:
            admin = User(
                username=settings.ADMIN_USERNAME,
                hashed_password=hash_password(settings.ADMIN_PASSWORD),
                full_name=settings.ADMIN_FULLNAME,
                role="admin",
                is_active=True,
                position="مدیر کل سامانه انجمن‌ها",
            )
            db.add(admin)
            db.commit()
            print(f"✓ Admin user '{settings.ADMIN_USERNAME}' created.")
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


# Serve React frontend in production (when built)
frontend_build = Path(__file__).parent.parent.parent / "frontend" / "dist"
if frontend_build.exists():
    app.mount("/", StaticFiles(directory=str(frontend_build), html=True), name="static")

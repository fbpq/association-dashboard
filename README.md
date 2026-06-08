# سامانه هوشمند مدیریت انجمن‌ها

**باشگاه پژوهشگران جوان و نخبگان — دانشگاه آزاد اسلامی**

سامانه آنلاین مدیریت داده‌های انجمن‌های دانشجویی با قابلیت آپلود اکسل، داشبورد تحلیلی، گزارش‌گیری و مدیریت پیگیری‌ها.

---

## معماری پروژه

```
association-dashboard/
├── frontend/          # React + TypeScript + Tailwind CSS (Vite)
│   ├── src/
│   │   ├── components/    # کامپوننت‌های قابل استفاده مجدد
│   │   │   ├── ui/        # Button, Card, Badge, Input, Modal, Pagination
│   │   │   ├── layout/    # Sidebar, Header, DashboardLayout
│   │   │   ├── charts/    # PieChartCard, BarChartCard (Recharts)
│   │   │   └── dashboard/ # KPICard
│   │   ├── pages/         # تمام صفحات (Login, Dashboard, Upload, ...)
│   │   ├── services/      # API calls + Mock data
│   │   ├── context/       # AuthContext, ToastContext
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # helpers, Persian formatters
│   └── Dockerfile
├── backend/           # Python FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/       # auth, files, dashboard, export, settings
│   │   ├── models/    # SQLAlchemy models
│   │   ├── services/  # parser_service (Excel parsing logic)
│   │   ├── utils/     # persian.py (normalization)
│   │   └── core/      # config, security (JWT)
│   └── Dockerfile
├── nginx/             # Reverse Proxy config
├── docker-compose.yml
└── .env.example
```

---

## نصب و راه‌اندازی محلی (بدون Docker)

### پیش‌نیازها
- Node.js 20+
- Python 3.11+
- PostgreSQL 16 (اختیاری — در حالت Mock نیازی نیست)

### فرانت‌اند (حالت نمایشی با Mock Data)

```bash
cd frontend
npm install
npm run dev
```

مرورگر را روی `http://localhost:3000` باز کنید.

**اطلاعات ورود نمایشی:**
- نام کاربری: `admin`
- رمز عبور: `admin1234`

### بک‌اند (FastAPI)

```bash
cd backend

# ایجاد محیط مجازی
python -m venv venv
source venv/bin/activate  # یا venv\Scripts\activate در ویندوز

# نصب وابستگی‌ها
pip install -r requirements.txt

# تنظیم متغیرهای محیطی
cp ../.env.example .env
# فایل .env را ویرایش کنید

# اجرای سرور
uvicorn app.main:app --reload --port 8000
```

مستندات API: `http://localhost:8000/api/docs`

---

## دیپلوی با Docker روی Ubuntu

```bash
# ۱. کلون پروژه
git clone <repo-url> association-dashboard
cd association-dashboard

# ۲. تنظیم متغیرهای محیطی
cp .env.example .env
# مقادیر را در .env ویرایش کنید (SECRET_KEY, DB_PASSWORD, ADMIN_PASSWORD)

# ۳. ساخت و اجرا
docker compose up -d --build

# ۴. بررسی وضعیت سرویس‌ها
docker compose ps

# ۵. مشاهده لاگ‌ها
docker compose logs -f backend
```

سامانه روی پورت 80 در دسترس خواهد بود.

### SSL با Certbot

```bash
# نصب Certbot
sudo apt install certbot python3-certbot-nginx

# دریافت گواهینامه
sudo certbot --nginx -d your-domain.com
```

---

## اتصال به بک‌اند واقعی

فایل `frontend/src/services/api.ts` را باز کنید و مقدار `MOCK_MODE` را تغییر دهید:

```typescript
// قبل (حالت نمایشی)
const MOCK_MODE = true;

// بعد (اتصال به بک‌اند)
const MOCK_MODE = false;
```

سپس فرانت‌اند را دوباره build کنید:

```bash
cd frontend
npm run build
```

---

## APIهای بک‌اند

| متد | مسیر | توضیح |
|-----|------|-------|
| POST | /api/auth/login | ورود |
| GET | /api/auth/me | اطلاعات کاربر |
| POST | /api/files/upload | آپلود فایل اکسل |
| GET | /api/files | لیست فایل‌ها |
| DELETE | /api/files/{id} | حذف فایل |
| POST | /api/files/{id}/parse | پردازش مجدد |
| GET | /api/dashboard/summary | KPIها |
| GET | /api/dashboard/charts | داده نمودارها |
| GET | /api/dashboard/associations | جدول انجمن‌ها |
| GET | /api/dashboard/forms | جدول فرم‌ها |
| GET | /api/dashboard/follow-ups | موارد پیگیری |
| GET | /api/export/associations.xlsx | خروجی اکسل انجمن‌ها |
| GET | /api/export/forms.xlsx | خروجی اکسل فرم‌ها |
| GET | /api/export/full-report.xlsx | گزارش جامع |
| GET | /api/export/dashboard.pdf | گزارش PDF |
| GET | /api/settings | دریافت تنظیمات |
| PUT | /api/settings | ذخیره تنظیمات |

---

## بکاپ‌گیری

```bash
# بکاپ دیتابیس
docker exec association_db pg_dump -U postgres association_db > backup_$(date +%Y%m%d).sql

# بکاپ فایل‌های آپلودی
docker run --rm -v uploads_data:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

---

## قابلیت‌های RTL و فارسی

- `dir="rtl"` در تمام المان‌های HTML
- فونت Vazirmatn برای نمایش بهینه فارسی
- جداول و نمودارها با پشتیبانی کامل RTL
- Recharts با تنظیمات RTL
- نرمال‌سازی کاراکترهای عربی (ي→ی، ك→ک)
- فرمت عدد فارسی (۱، ۲، ۳...)
- تاریخ فارسی با Intl.DateTimeFormat

---

## لوگو

فایل لوگو را در این مسیر قرار دهید:

```
frontend/src/assets/logo.png
```

سپس در کامپوننت‌های `Sidebar.tsx` و `LoginPage.tsx` جایگزین placeholder کنید:

```tsx
import logoSrc from '@/assets/logo.png';
<img src={logoSrc} alt="لوگوی سامانه" className="h-10 w-auto" />
```

رنگ‌های برند را از لوگو استخراج کرده و در `tailwind.config.js` آپدیت کنید:

```js
primary: {
  700: '#EXTRACTED_BLUE_FROM_LOGO',
  ...
},
success: {
  600: '#EXTRACTED_GREEN_FROM_LOGO',
  ...
},
```

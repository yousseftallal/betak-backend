# إعداد مشروع Be-Tak Admin Dashboard

## الخطوات المطلوبة

### 1. تثبيت Dependencies
```bash
cd C:\Users\Moustafa\Desktop\BeTak
npm install
```

### 2. إنشاء قاعدة البيانات في PostgreSQL

#### الطريقة الأولى: عبر pgAdmin
1. افتح pgAdmin
2. كليك يمين على "Databases"
3. اختر Create → Database
4. اسم القاعدة: `betak`
5. اضغط Save

#### الطريقة الثانية: عبر PowerShell
```bash
psql -U postgres
CREATE DATABASE betak;
\q
```

### 3. تحديث كلمة المرور في ملف .env

افتح ملف `.env` وغيّر السطر:
```
DB_PASSWORD=postgres
```

ضع كلمة مرور PostgreSQL الخاصة بك.

### 4. تشغيل Migrations (إنشاء الجداول)
```bash
npm run migrate
```

### 5. تشغيل Seeders (إضافة البيانات الأولية)
```bash
npm run seed:all
```

هذا الأمر سيقوم بـ:
- إنشاء 5 أدوار (Super Admin, Admin, Moderator, Analyst, User)
- إنشاء 24 صلاحية موزعة على 7 categories
- إنشاء حساب Super Admin الأولي

### 6. تشغيل السيرفر
```bash
npm run dev
```

### 7. الوصول للنظام

- **Dashboard**: http://localhost:3000/admin
- **API**: http://localhost:3000/api/v1/admin
- **Health Check**: http://localhost:3000/health

**بيانات تسجيل الدخول (Super Admin):**
- Email: `superadmin@betak.com`
- Password: `SuperAdmin123!`

⚠️ **مهم**: غيّر كلمة المرور بعد أول تسجيل دخول!

---

## الملفات والمجلدات المُنشأة

```
BeTak/
├── src/
│   ├── config/
│   │   ├── database.js     # إعدادات PostgreSQL
│   │   ├── jwt.js          # JWT helpers
│   │   └── redis.js        # Redis cache
│   ├── database/
│   │   ├── models/         # ١١ موديل (Admin, User, Video, etc.)
│   │   ├── seeders/        # ٣ seeders
│   │   ├── migrate.js      # نص Migration
│   │   └── seed.js         # نص Seeding الكامل
│   ├── app.js              # Express application
│   └── server.js           # Server entry point
├── package.json
├── .env
├── .env.example
└── README.md
```

---

## الموديلات المُنشأة (11 موديل)

✅ **Admin System Module**
- `Role` - الأدوار (5 roles)
- `Permission` - الصلاحيات (24 permissions)
- `RolePermission` - ربط الأدوار بالصلاحيات
- `Admin` - حسابات الإداريين
- `AdminSession` - جلسات JWT

✅ **Platform Models**
- `User` - مستخدمي المنصة
- `Video` - فيديوهات المنصة

✅ **Reports & Moderation**
- `Report` - البلاغات (على users أو videos)

✅ **Logging & Analytics**
- `AdminActivityLog` - سجل تحركات الإداريين
- `AnalyticsSnapshot` - إحصائيات مُجمّعة مسبقاً

✅ **Settings**
- `SystemSettings` - إعدادات النظام (key-value)

---

## الصلاحيات (24 Permission)

تم إنشاء 24 صلاحية موزعة على 7 categories:

### 👥 Users (5)
- `users:read`, `users:suspend`, `users:ban`, `users:restore`, `users:notes`

### 🎥 Videos (5)
- `videos:read`, `videos:hide`, `videos:delete`, `videos:restore`, `videos:edit`

### 📋 Reports (4)
- `reports:read`, `reports:review`, `reports:dismiss`, `reports:assign`

### 📊 Analytics (2)
- `analytics:read`, `analytics:export`

### 📜 Logs (2)
- `logs:read`, `logs:export`

### ⚙️ Settings (2)
- `settings:read`, `settings:write`

### 👨‍💼 Admins (4)
- `admins:read`, `admins:create`, `admins:edit`, `admins:delete`

---

## توزيع الصلاحيات على الأدوار

| الصلاحية | Super Admin | Admin | Moderator | Analyst |
|---------|-------------|-------|-----------|---------|
| جميع الصلاحيات | ✅ | ❌ | ❌ | ❌ |
| user ban | ✅ | ❌ | ❌ | ❌ |
| user suspend | ✅ | ✅ | ✅ | ❌ |
| video delete | ✅ | ✅ | ❌ | ❌ |
| video hide | ✅ | ✅ | ✅ | ❌ |
| analytics | ✅ | ✅ | ✅ | ✅ |
| settings | ✅ | ❌ | ❌ | ❌ |

---

## استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
```
❌ Unable to connect to the database
```
**الحل:**
- تأكد أن PostgreSQL يعمل
- تأكد من كلمة المرور في `.env`
- تأكد من إنشاء قاعدة البيانات `betak`

### خطأ في تثبيت bcryptjs
```
Error: Cannot find module 'bcryptjs'
```
**الحل:**
```bash
npm install bcryptjs --save
```

### Redis connection failed
```
⚠️ Redis connection failed
```
**ملاحظة:** Redis اختياري. النظام يعمل بدونه لكن التخزين المؤقت (Caching) لن يكون فعّال.

---

## الخطوات التالية (Phase 3)

بعد إتمام الإعداد:
1. ✅ إنشاء Authentication Controller
2. ✅ إنشاء Dashboard UI
3. ✅ إنشاء API Endpoints للـ 7 modules
4. ✅ إنشاء Middleware (auth, permissions)

---

**جاهز للبدء! 🚀**

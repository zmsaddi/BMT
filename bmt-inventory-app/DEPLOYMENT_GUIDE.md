# 🚀 دليل النشر الكامل - BMT Inventory Viewer

## المرحلة 1: إعداد Google Sheets API (15 دقيقة)

### الخطوة 1.1: إنشاء مشروع Google Cloud

1. اذهب إلى: https://console.cloud.google.com
2. اضغط على "Select a project" (أعلى اليسار)
3. اضغط "NEW PROJECT"
4. **Project name**: `BMT Inventory API`
5. اضغط "CREATE"
6. انتظر 30 ثانية حتى يُنشأ المشروع
7. تأكد أن المشروع الجديد محدد (في الأعلى)

### الخطوة 1.2: تفعيل Google Sheets API

1. من القائمة الجانبية: **APIs & Services** → **Library**
2. في صندوق البحث، اكتب: `Google Sheets API`
3. اضغط على **Google Sheets API**
4. اضغط **ENABLE**
5. انتظر حتى يتم التفعيل

### الخطوة 1.3: إنشاء Service Account

1. من القائمة الجانبية: **APIs & Services** → **Credentials**
2. اضغط **CREATE CREDENTIALS** (أعلى الصفحة)
3. اختر: **Service account**

4. **ملء التفاصيل**:
   - **Service account name**: `bmt-inventory-viewer`
   - **Service account ID**: (سيُملأ تلقائياً)
   - **Description**: `Read-only access to BMT inventory spreadsheet`

5. اضغط **CREATE AND CONTINUE**

6. **Grant this service account access**:
   - **Role**: اختر **Viewer**
   - اضغط **CONTINUE**

7. **Grant users access** (اتركه فارغ):
   - اضغط **DONE**

### الخطوة 1.4: تحميل المفتاح (JSON Key)

1. في صفحة **Credentials**، تحت **Service Accounts**:
   - ستجد: `bmt-inventory-viewer@...iam.gserviceaccount.com`

2. اضغط على الإيميل

3. اذهب إلى تبويب **KEYS**

4. اضغط **ADD KEY** → **Create new key**

5. اختر نوع المفتاح: **JSON**

6. اضغط **CREATE**

7. ✅ سيتم تحميل ملف JSON على جهازك
   - اسم الملف مثل: `bmt-inventory-api-123456.json`
   - **احتفظ به في مكان آمن!**

### الخطوة 1.5: مشاركة Google Sheet مع Service Account

1. **افتح ملف JSON** اللي حملته

2. **ابحث عن السطر**:
   ```json
   "client_email": "bmt-inventory-viewer@...iam.gserviceaccount.com"
   ```

3. **انسخ الإيميل** (كامل)

4. **اذهب إلى Google Sheet** الخاص بك (ملف Inventory_bmt)

5. **اضغط زر "Share"** (أعلى اليمين)

6. **الصق الإيميل** في صندوق المشاركة

7. **الصلاحية**: غيّرها إلى **Viewer** (مشاهد فقط)

8. **❌ أزل علامة** "Notify people" (لا حاجة لإرسال إيميل)

9. **اضغط "Send"**

10. ✅ **تم!** الآن الـ Service Account يقدر يقرأ البيانات

### الخطوة 1.6: استخراج المعلومات من JSON

**افتح ملف JSON** وانسخ المعلومات التالية:

#### 1. Spreadsheet ID:
من رابط Google Sheet:
```
https://docs.google.com/spreadsheets/d/[COPY_THIS_PART]/edit
```

#### 2. Service Account Email:
من JSON، السطر:
```json
"client_email": "bmt-inventory-viewer@...iam.gserviceaccount.com"
```

#### 3. Private Key:
من JSON، السطر:
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

⚠️ **مهم**: انسخ المفتاح كامل، مع `\n` (علامات السطر الجديد)

---

## المرحلة 2: رفع الكود إلى GitHub (5 دقائق)

### الخطوة 2.1: تثبيت Git (إذا لم يكن مثبت)

**Windows:**
- حمّل من: https://git-scm.com/download/win
- ثبّت بالإعدادات الافتراضية

### الخطوة 2.2: تجهيز الريبو على GitHub

1. اذهب إلى: https://github.com/zmsaddi/BMT

2. **إذا الريبو موجود وفارغ**:
   - ✅ جاهز! انتقل للخطوة التالية

3. **إذا الريبو غير موجود**:
   - اذهب إلى: https://github.com/new
   - **Repository name**: `BMT`
   - **Public** أو **Private** (اختر حسب الحاجة)
   - **❌ لا تضيف** README أو .gitignore (عندنا جاهزين)
   - اضغط **Create repository**

### الخطوة 2.3: رفع الكود

**افتح Command Prompt / Terminal** في مجلد المشروع:

```bash
cd "d:\BMT EXCEL\bmt-inventory-app"
```

**تهيئة Git:**
```bash
git init
git add .
git commit -m "Initial commit - BMT Inventory Viewer"
```

**ربط مع GitHub:**
```bash
git remote add origin https://github.com/zmsaddi/BMT.git
git branch -M main
git push -u origin main
```

**إذا طلب منك اسم مستخدم وكلمة سر**:
- **Username**: اسم مستخدم GitHub
- **Password**: **استخدم Personal Access Token** (ليس كلمة السر!)

**كيف تحصل على Personal Access Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. اختر: `repo` (full control)
4. انسخ التوكن واستخدمه بدلاً من كلمة السر

✅ **تم رفع الكود إلى GitHub!**

---

## المرحلة 3: النشر على Vercel (5 دقائق)

### الخطوة 3.1: إنشاء حساب Vercel

1. اذهب إلى: https://vercel.com/signup
2. اختر **Continue with GitHub**
3. سجّل دخول بحساب GitHub
4. ✅ سيتم ربط الحسابات تلقائياً

### الخطوة 3.2: استيراد المشروع

1. في Vercel Dashboard، اضغط **Add New...** → **Project**

2. **Import Git Repository**:
   - ابحث عن: `BMT`
   - اضغط **Import**

3. **Configure Project**:
   - **Project Name**: `bmt-inventory` (أو أي اسم تريده)
   - **Framework Preset**: Next.js (سيكتشف تلقائياً)
   - **Root Directory**: `./` (اتركه كما هو)

4. **⚠️ لا تضغط Deploy بعد!** → اذهب للخطوة التالية أولاً

### الخطوة 3.3: إضافة Environment Variables

في صفحة Configure Project، اذهب إلى قسم **Environment Variables**:

#### 1. GOOGLE_SHEETS_SPREADSHEET_ID
- **Name**: `GOOGLE_SHEETS_SPREADSHEET_ID`
- **Value**: [الصق الـ Spreadsheet ID]
- اضغط **Add**

#### 2. GOOGLE_SERVICE_ACCOUNT_EMAIL
- **Name**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **Value**: [الصق الإيميل من JSON]
- اضغط **Add**

#### 3. GOOGLE_PRIVATE_KEY
- **Name**: `GOOGLE_PRIVATE_KEY`
- **Value**: [الصق Private Key من JSON - مع علامات `\n`]
- ⚠️ **مهم جداً**: تأكد أن المفتاح بين علامات تنصيص مزدوجة `"..."`
- مثال:
  ```
  "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n"
  ```
- اضغط **Add**

#### 4. CACHE_DURATION (اختياري)
- **Name**: `CACHE_DURATION`
- **Value**: `300`
- اضغط **Add**

### الخطوة 3.4: النشر (Deploy)

1. ✅ تأكد أن جميع الـ Environment Variables مضافة (3 أو 4 متغيرات)

2. اضغط **Deploy**

3. **انتظر 2-3 دقائق**:
   - سترى شاشة "Building..."
   - ثم "Deploying..."
   - ثم ✅ "Congratulations!"

4. ✅ **تم النشر!**

### الخطوة 3.5: الحصول على الرابط

بعد النشر:
- سترى رابط التطبيق، مثل:
  ```
  https://bmt-inventory.vercel.app
  ```

✅ **شارك هذا الرابط مع المشاهدين (Viewers)!**

---

## المرحلة 4: الاختبار والتأكد (5 دقائق)

### 1. افتح الرابط
```
https://your-app.vercel.app
```

### 2. تحقق من:
- ✅ البيانات تظهر من Google Sheet
- ✅ الفلاتر تعمل
- ✅ البحث يعمل
- ✅ التحديث (Refresh) يعمل

### 3. إذا ظهرت أخطاء:

#### **خطأ: "Failed to fetch inventory"**
- **السبب**: مشكلة في الـ Environment Variables
- **الحل**:
  1. Vercel Dashboard → Project Settings → Environment Variables
  2. تأكد أن جميع المتغيرات صحيحة
  3. أعد Deploy: Settings → Deployments → Redeploy

#### **خطأ: "Permission denied"**
- **السبب**: Service Account غير مشارك في Sheet
- **الحل**:
  1. افتح Google Sheet
  2. اضغط Share
  3. تأكد أن الإيميل موجود مع صلاحية Viewer

#### **خطأ: "Invalid credentials"**
- **السبب**: Private Key خاطئ
- **الحل**:
  1. افتح ملف JSON مرة أخرى
  2. انسخ Private Key كامل (مع `\n`)
  3. حدّث Environment Variable في Vercel
  4. أعد Deploy

---

## 🎉 تهانينا! التطبيق جاهز!

### الرابط النهائي:
```
https://your-app.vercel.app
```

### الاستخدام:
- ✅ المشاهدون (Viewers) يفتحون الرابط مباشرة
- ✅ لا يحتاجون تسجيل دخول
- ✅ البيانات تتحدث تلقائياً كل 5 دقائق
- ✅ يمكنهم الفلترة والبحث براحتهم

### التحديثات المستقبلية:
عند تعديل الكود:
```bash
git add .
git commit -m "Update: description"
git push
```
Vercel سيعيد النشر تلقائياً! 🚀

---

## 📞 المساعدة

إذا واجهت أي مشكلة:
1. تحقق من [README.md](README.md)
2. راجع Environment Variables في Vercel
3. تحقق من مشاركة Google Sheet مع Service Account
4. راجع Logs في Vercel Dashboard

---

## ✅ Checklist النهائي

- [ ] Google Cloud Project منشأ
- [ ] Google Sheets API مفعّل
- [ ] Service Account منشأ
- [ ] JSON Key محمّل
- [ ] Google Sheet مشارك مع Service Account
- [ ] الكود مرفوع على GitHub
- [ ] Vercel متصل بـ GitHub
- [ ] Environment Variables مضافة في Vercel
- [ ] التطبيق منشور ويعمل
- [ ] البيانات تظهر بشكل صحيح
- [ ] الفلاتر تعمل
- [ ] الرابط مشارك مع الفريق

🎯 **جميع الخطوات مكتملة؟ رائع! التطبيق جاهز للاستخدام! 🚀**

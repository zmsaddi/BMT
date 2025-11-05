# 🚀 دليل البدء السريع

## ✅ التطبيق جاهز! الآن تحتاج فقط:

### 1️⃣ معلومات Google Sheet:

**من رابط Google Sheet الخاص بك:**
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

**انسخ الـ `SPREADSHEET_ID`** (الجزء الطويل بين `/d/` و `/edit`)

---

### 2️⃣ إعداد Google Cloud (مرة واحدة فقط):

#### **5 خطوات بسيطة:**

1. **إنشاء مشروع**:
   - https://console.cloud.google.com
   - NEW PROJECT → اسم: `BMT Inventory API`

2. **تفعيل API**:
   - APIs & Services → Library
   - ابحث عن: `Google Sheets API`
   - اضغط ENABLE

3. **إنشاء Service Account**:
   - APIs & Services → Credentials
   - CREATE CREDENTIALS → Service account
   - اسم: `bmt-inventory-viewer`
   - Role: Viewer
   - DONE

4. **تحميل المفتاح**:
   - اضغط على Service Account
   - KEYS → ADD KEY → Create new key
   - JSON → CREATE
   - **احفظ الملف!**

5. **مشاركة Sheet**:
   - افتح ملف JSON
   - انسخ الإيميل من `client_email`
   - في Google Sheet → Share
   - الصق الإيميل، صلاحية: Viewer
   - Send

---

### 3️⃣ رفع الكود على GitHub:

```bash
cd "d:\BMT EXCEL\bmt-inventory-app"

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/zmsaddi/BMT.git
git branch -M main
git push -u origin main
```

---

### 4️⃣ نشر على Vercel:

1. **https://vercel.com** → Continue with GitHub

2. **Import Project**:
   - اختر ريبو `BMT`
   - Import

3. **أضف Environment Variables**:

   | Name | Value |
   |------|-------|
   | `GOOGLE_SHEETS_SPREADSHEET_ID` | [ID من رابط Sheet] |
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | [الإيميل من JSON] |
   | `GOOGLE_PRIVATE_KEY` | [المفتاح من JSON - كامل مع `\n`] |

4. **Deploy** → انتظر 2-3 دقائق

5. ✅ **جاهز!** احصل على الرابط وشاركه!

---

## 🎯 ملاحظات مهمة:

### Private Key:
- انسخه **كامل** من JSON
- يبدأ بـ: `"-----BEGIN PRIVATE KEY-----\n`
- ينتهي بـ: `\n-----END PRIVATE KEY-----\n"`
- **مع علامات التنصيص وعلامات `\n`**

### Spreadsheet ID:
- من الرابط فقط
- **لا تنسخ الرابط كامل**
- فقط الجزء بين `/d/` و `/edit`

---

## ✅ انتهى!

الرابط سيكون:
```
https://bmt-inventory.vercel.app
```

شاركه مع الفريق! 🎉

---

## 🔧 لو حصل خطأ:

### "Failed to fetch inventory"
→ تحقق من Environment Variables في Vercel

### "Permission denied"
→ تأكد أن Service Account مشارك في Sheet

### "Invalid credentials"
→ Private Key خاطئ، انسخه مرة ثانية من JSON

---

## 📋 Checklist:

- [ ] Google Cloud Project منشأ
- [ ] Google Sheets API مفعّل
- [ ] Service Account منشأ + Key محمّل
- [ ] Sheet مشارك مع Service Account
- [ ] GitHub Repo جاهز
- [ ] Vercel متصل + Environment Variables مضافة
- [ ] التطبيق منشور ويعمل

✅ **كل شيء تمام؟ رائع! 🚀**

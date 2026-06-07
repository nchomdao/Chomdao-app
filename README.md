# Chomdao — ระบบจัดการหอพัก 🏠

ระบบจัดการหอพักออนไลน์สำหรับ **ชมดาว เพลส** และ **ชมดาว รีสอร์ท** รองรับการจดมิเตอร์น้ำ-ไฟ ออกบิล ติดตามการชำระเงิน อ่านสลิปอัตโนมัติ และติดตั้งเป็นแอปบนมือถือได้ (PWA)

> ทั้งระบบอยู่ในไฟล์เดียว `index.html` (HTML + CSS + JS) เก็บข้อมูลบน **Firebase Firestore** แบบ real-time

## ✨ ฟีเจอร์หลัก

- **จัดการห้องพัก** — เพิ่ม/แก้ไข/ลบห้อง, เพิ่มผู้เช่า, ย้ายออก, แยกตามหอพัก/ชั้น
- **จดมิเตอร์น้ำ-ไฟ** — บันทึกเลขมิเตอร์ คำนวณค่าน้ำ/ไฟอัตโนมัติ รองรับมิเตอร์วนรอบ (9999→0)
- **ค่าใช้จ่าย/บิล** — สร้างบิลรายเดือน, เพิ่มรายการพิเศษ (ค่าจอดรถ/เน็ต/ส่วนกลาง ฯลฯ), สลับสถานะชำระ
- **ค้างชำระอัตโนมัติ** — บิลที่ยัง "รอชำระ" เกินวันที่ 15 ของเดือนถัดไป → เปลี่ยนเป็น "ค้างชำระ" ให้เอง
- **พิมพ์ใบแจ้งหนี้** — PDF สำหรับพิมพ์ (A4 จับคู่ 2 บิล/หน้า) พร้อมแปลงจำนวนเงินเป็นตัวอักษรไทย
- **สรุปรายรับ** — กราฟรายรับ 5 เดือนย้อนหลัง, ยอดค้างชำระ, อัตราเช่า
- **Firebase Sync** — ข้อมูลซิงค์ real-time ทุกอุปกรณ์ (คอม ↔ มือถือ) อัตโนมัติ
- **อ่านสลิปอัตโนมัติ (Make.com)** — ลูกค้าส่งสลิปทาง LINE → ระบบจับคู่บิล → เปลี่ยนสถานะเป็น "ชำระแล้ว" → ตอบกลับลูกค้า
- **PWA** — ติดตั้งลงจอโฮม เปิดเต็มจอเหมือนแอป native
- **รองรับมือถือ** — Responsive ใช้งานได้ทั้ง PC และมือถือ

## 🏗️ สถาปัตยกรรม

```
มือถือ/คอม ──▶ index.html (PWA) ──▶ Firebase Firestore (real-time)
                                          ▲
LINE (สลิป) ──▶ Make.com (อ่านสลิป) ──────┘ (อัปเดตสถานะชำระ)
```

- **Frontend:** index.html ไฟล์เดียว (ไม่มี build step)
- **Backend:** Firebase Firestore — login แบบ anonymous อัตโนมัติ
- **Automation:** Make.com เข้าถึง Firestore ผ่าน Google Cloud OAuth (admin)

### Firestore Collections

| Collection | Document ID | เก็บอะไร |
|---|---|---|
| `rooms` | รหัสห้อง เช่น `P101` | ข้อมูลห้อง + ผู้เช่า |
| `bills` | `ห้อง_เดือน` เช่น `P101_2569-06` | บิลรายเดือน (มี field `total` ให้ Make จับคู่) |
| `meters` | `ห้อง_เดือน_ชนิด` เช่น `P101_2569-06_elec` | เลขมิเตอร์ (prev/curr) |
| `buildings` | คีย์หอพัก เช่น `place` | ข้อมูลหอพัก |

## 📁 โครงสร้างไฟล์

```
chomdao-apartment/
├── index.html                ← แอปทั้งหมด (Firebase + PWA)
├── manifest.webmanifest      ← ข้อมูล PWA (ชื่อ/ไอคอน/เปิดเต็มจอ)
├── sw.js                     ← service worker (ติดตั้งเป็นแอป + เปิดได้ตอนเน็ตหลุด)
├── dormitory-logo-square.png ← ไอคอน iOS / maskable (พื้นเต็มขอบ)
├── dormitory-logo-hq.png     ← ไอคอนทั่วไป
├── dormitory-logo.svg        ← ไอคอน Android (svg)
├── firestore-rules.txt       ← กฎความปลอดภัย Firestore (อ้างอิง)
├── chomdao-apps-script.js    ← (เก่า) Google Apps Script สมัยใช้ Sheets — ไม่ได้ใช้แล้ว
├── migrate.html              ← (เก่า) เครื่องมือย้าย localStorage → Firebase — ใช้ครั้งเดียวจบ
├── index-firebase.html       ← (เก่า) Firebase รุ่นแรก — เลิกใช้ ใช้ index.html แทน
└── README.md
```

> ตอน deploy ลากขึ้น GitHub เฉพาะไฟล์ที่ใช้งานจริง (index.html, manifest, sw.js, ไอคอน) ก็พอ
> ไฟล์ติด **(เก่า)** เก็บไว้อ้างอิง ไม่ต้องอัปขึ้นเว็บก็ได้

## 📲 ติดตั้งเป็นแอปบนมือถือ (PWA)

> ⚠️ ใช้ได้เฉพาะเมื่อเปิดผ่าน **HTTPS** (เช่น GitHub Pages) — เปิดไฟล์ตรงๆ จะติดตั้งไม่ได้

- **iPhone (Safari):** เปิดเว็บ → ปุ่มแชร์ (□↑) → **เพิ่มไปยังหน้าจอโฮม**
- **Android (Chrome):** เปิดเว็บ → เมนู ⋮ → **ติดตั้งแอป**

ได้ไอคอน "Chomdao" บนจอโฮม กดเปิดเต็มจอ ไม่มีแถบ URL

## 🚀 Deploy (GitHub Pages)

1. push/อัปโหลดไฟล์ไปที่ GitHub repo
2. **Settings → Pages** → Source: **Deploy from a branch** → `main` → `/ (root)`
3. รอ 1-2 นาที แล้วเข้าใช้งานที่ `https://<username>.github.io/<repo>/`

## ⚙️ การตั้งค่า Firebase

1. สร้างโปรเจกต์ที่ [Firebase Console](https://console.firebase.google.com) (โปรเจกต์ปัจจุบัน: `chomdao-d8374`)
2. เปิดใช้ **Firestore Database** และ **Authentication → Anonymous**
3. ตั้ง Firestore Rules ตามไฟล์ `firestore-rules.txt`
4. คัดลอก `firebaseConfig` มาวางในตัวแปร `firebaseConfig` ใน `index.html`

## 🤖 การอ่านสลิปอัตโนมัติ (Make.com)

Flow ใน Make.com:

```
LINE Watch Events → Download Attachment (สลิป) → HTTP (อ่านสลิป/OCR) → Parse JSON
→ Firestore: List Documents → Array aggregator → Router
   ├─ ตรงห้องเดียว → Firestore: Update (status = ชำระแล้ว) → LINE ตอบกลับ
   └─ ไม่ตรง/หลายห้อง → LINE แจ้งให้ตรวจสอบเอง
```

**เงื่อนไขจับคู่บิล (filter):** `total = ยอดในสลิป` **และ** `status ≠ ชำระแล้ว`
ระบบจะเซ็ต "ชำระแล้ว" อัตโนมัติเฉพาะเมื่อเจอบิลตรงเงื่อนไข **เพียงห้องเดียว** เท่านั้น (ถ้ายอดซ้ำหลายห้องจะส่งให้ตรวจเอง)

## 💡 อัตราค่าน้ำ/ไฟ

| หอพัก | ค่าไฟ (บาท/ยูนิต) | ค่าน้ำ (บาท/ยูนิต) |
|---|---|---|
| Chomdaoplace (P) | 8 | 28 |
| Chomdaoresort R01-R12 | 7 | 25 |
| Chomdaoresort R13-R16 | 6 | 25 |

## 🔑 รหัสผ่านเข้าแอป

ตั้งไว้ในตัวแปร `APP_PASSWORD` ใน `index.html` (จำได้ด้วย localStorage หลังใส่ครั้งแรก)

## 📝 หมายเหตุ / ข้อจำกัด

- **ระบบ 12 เดือนหมุนวน** — แอปแสดงเฉพาะ 12 เดือนล่าสุด แต่ข้อมูลเก่ากว่านั้น **ยังคงอยู่ใน Firestore** (ฟังก์ชัน `cleanOldData()` มีอยู่แต่ยังไม่ได้เปิดใช้) ถ้าต้องการลบให้ทำเองใน Firebase Console
- **ความปลอดภัย** — แอป login แบบ anonymous + รหัสผ่านฝั่ง client เป็นการกันระดับพื้นฐาน เหมาะกับการใช้งานภายใน

## 🔧 Changelog

### v2.0.0 — Firebase + PWA + อ่านสลิปอัตโนมัติ
- ย้าย backend จาก localStorage/Google Sheets → **Firebase Firestore** (real-time ทุกอุปกรณ์)
- เพิ่ม **PWA** — ติดตั้งลงจอโฮม เปิดเต็มจอ พร้อมไอคอน
- เพิ่ม **รหัสผ่านเข้าแอป** + login Firebase แบบ anonymous
- เพิ่มการ **อ่านสลิปอัตโนมัติผ่าน Make.com** (LINE → จับคู่บิล → เปลี่ยนสถานะ → ตอบลูกค้า)
- เพิ่มฟิลด์ `total` ในบิล (สำหรับจับคู่สลิป) และรองรับ **มิเตอร์วนรอบ**
- เพิ่มการเช็ก **ค้างชำระอัตโนมัติ** (เกินวันที่ 15)

### v1.2.0 — แก้ไขครบทุกปัญหา (ยุค localStorage/Sheets)
- มิเตอร์เดือนเก่า → เดือนใหม่ + คำนวณถูกต้อง (`prevMonthAny()`)
- Sync ข้ามอุปกรณ์ผ่าน Google Sheets
- ปุ่มบันทึกบนมือถือ (sticky ล่างจอ)
- ระบบ 12 เดือนหมุนวน (rolling window)

### v1.1.0 — แก้ไขข้อมูลค่าน้ำไฟหายหลังเปลี่ยนหน้า
- แก้ข้อมูลมิเตอร์หายเมื่อ navigate กลับมา
- Auto-sync มิเตอร์ทุกครั้งที่พิมพ์ (debounce)

## 📝 License

Private project — Chomdao Apartment Management

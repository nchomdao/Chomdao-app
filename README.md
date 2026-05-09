# Chomdao — ระบบจัดการหอพัก 🏠

ระบบจัดการหอพักออนไลน์สำหรับ **ชมดาว เพลส** และ **ชมดาว รีสอร์ท** รองรับการจดมิเตอร์น้ำ-ไฟ ออกบิล และติดตามการชำระเงิน

## ✨ ฟีเจอร์หลัก

- **จัดการห้องพัก** — เพิ่ม/แก้ไข/ลบห้อง, เพิ่มผู้เช่า, ย้ายออก
- **จดมิเตอร์น้ำ-ไฟ** — บันทึกเลขมิเตอร์ คำนวณค่าน้ำ/ไฟอัตโนมัติ
- **ค่าใช้จ่าย/บิล** — สร้างบิลรายเดือน, เพิ่มรายการพิเศษ, สลับสถานะชำระ
- **พิมพ์ใบแจ้งหนี้** — PDF สำหรับพิมพ์ (A4 ครึ่งหน้า 2 ใบ)
- **สรุปรายรับ** — กราฟรายรับ 5 เดือนย้อนหลัง, อัตราเช่า
- **Google Sheets Sync** — ข้อมูลซิงค์กับ Google Sheets แบบ real-time
- **รองรับมือถือ** — Responsive design ใช้งานได้ทั้ง PC และมือถือ

## 🚀 วิธีใช้งาน

### GitHub Pages (แนะนำ)

1. Fork หรือ push repo นี้ไปที่ GitHub
2. ไปที่ **Settings → Pages**
3. เลือก Source เป็น **Deploy from a branch** → `main` → `/ (root)`
4. รอ 1-2 นาที แล้วเข้าใช้งานที่ `https://<username>.github.io/chomdao-apartment/`

### เปิดไฟล์โดยตรง

เปิด `index.html` ด้วย browser ได้เลย (ข้อมูลเก็บใน localStorage)

## 📁 โครงสร้างไฟล์

```
chomdao-apartment/
├── index.html    ← แอปทั้งหมดอยู่ในไฟล์เดียว (HTML + CSS + JS)
└── README.md
```

## ⚙️ การตั้งค่า Google Sheets Sync

ระบบเชื่อมต่อ Google Sheets ผ่าน Google Apps Script:

1. สร้าง Google Sheet ใหม่
2. ไปที่ **Extensions → Apps Script**
3. วาง Apps Script code แล้ว Deploy เป็น Web App
4. นำ URL มาใส่ในตัวแปร `API_URL` ใน `index.html`

## 💡 อัตราค่าน้ำ/ไฟ

| หอพัก | ค่าไฟ (บาท/ยูนิต) | ค่าน้ำ (บาท/ยูนิต) |
|---|---|---|
| Chomdaoplace (P) | 8 | 28 |
| Chomdaoresort R01-R12 | 7 | 25 |
| Chomdaoresort R13-R16 | 6 | 25 |

## 🔧 Changelog

### v1.1.0 — แก้ไขข้อมูลค่าน้ำไฟหายหลังเปลี่ยนหน้า

- **แก้ไข:** ข้อมูลมิเตอร์หายเมื่อ navigate กลับมาหน้าจดมิเตอร์ — เปลี่ยนจาก "เขียนทับ" เป็น "merge" ข้อมูล local กับ Sheet
- **แก้ไข:** สถานะบิลไม่อัพเดทที่หน้าห้องพักหลังกดชำระ
- **เพิ่ม:** Auto-sync มิเตอร์ไป Sheet ทุกครั้งที่พิมพ์ (debounce 3 วินาที)
- **เพิ่ม:** แจ้งเตือนเมื่อ sync ล้มเหลว

## 📝 License

Private project — Chomdao Apartment Management

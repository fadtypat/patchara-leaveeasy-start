# ตั้งค่า Firebase / Firestore — LeaveEasy

## ขั้นที่ 1 — สร้างโปรเจกต์ Firebase
สร้างโปรเจกต์ที่ https://console.firebase.google.com (โปรเจกต์นี้ใช้ `leaveeasy-patchara-c84bb`)

## ขั้นที่ 2 — เปิด Firestore Database
Firebase Console → เมนู Build → Firestore Database → Create database
- เลือกโหมด **Native** (ไม่ใช่ Datastore mode)
- เริ่มด้วย **test mode** ไปก่อน (เปิดอ่าน/เขียนได้ 30 วัน) — เรื่องความปลอดภัยจริงจะทำในสัปดาห์ที่ 8

## ขั้นที่ 3 — ใส่ค่า config
ไฟล์ `js/firebase-init.js` ใส่ `firebaseConfig` ของโปรเจกต์ไว้แล้ว ไม่ต้องแก้อะไรเพิ่ม
(ค่า `apiKey` ของ Firebase web app ไม่ใช่ความลับ ไม่ต้องกังวลเรื่องคอมมิตขึ้น GitHub)

## ขั้นที่ 4 — ใส่ข้อมูลตัวอย่างลง Firestore
1. เปิดโปรเจกต์ผ่าน local server: `npm install` แล้ว `npm run dev`
2. เปิด `http://localhost:3000/seed.html`
3. กดปุ่ม **"ใส่ข้อมูลตัวอย่างลง Firestore"** — กดซ้ำได้อย่างปลอดภัย เขียนทับข้อมูลเดิม ไม่สร้างซ้ำซ้อน

## ขั้นที่ 5 — ตรวจว่าเชื่อมสำเร็จ
1. เปิด `http://localhost:3000/leave-requests.html` — ควรเห็นตารางใบลา 5 ใบ
2. เข้า Firebase Console → Firestore → แก้ค่า `status` ของใบลาใดใบหนึ่งโดยตรง
3. รีเฟรชหน้ารายการใบลา — ป้ายสถานะต้องเปลี่ยนตาม ถ้าเปลี่ยนตาม แปลว่าอ่านจากฐานข้อมูลจริงแล้ว

> ⚠️ หน้านี้ต้องเปิดผ่าน `http://localhost:3000/...` เท่านั้น เปิดแบบ double-click ไฟล์ (`file://`) จะไม่ทำงาน
> เพราะใช้ ES module — ส่วนหน้าอื่นที่ยังไม่ต่อ Firestore ยังเปิดแบบ `file://` ได้ตามปกติ

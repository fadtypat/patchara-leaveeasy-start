// ─────────────────────────────────────────────────────────────
// js/util.js — ตัวช่วยเล็ก ๆ ที่ทุกหน้าเรียกใช้
// ─────────────────────────────────────────────────────────────

// แปลงข้อความของผู้ใช้ให้ปลอดภัยก่อนเอาไปวางในหน้าเว็บ
// ถ้าไม่ทำ ข้อความที่มีเครื่องหมาย < > จะทำให้หน้าเว็บเพี้ยนได้
function esc(ข้อความ) {
  return String(ข้อความ == null ? "" : ข้อความ)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ป้ายสถานะสี — รอพิจารณา=เหลือง อนุมัติ=เขียว ไม่อนุมัติ=แดง
function ป้ายสถานะ(สถานะ) {
  return '<span class="badge badge-' + esc(สถานะ) + '">' + esc(สถานะ) + "</span>";
}

// เวลาปัจจุบันในรูปแบบเดียวกับข้อมูลตัวอย่าง เช่น "2026-09-01 09:15"
// เก็บเป็นข้อความเพื่อให้เรียงลำดับและอ่านง่ายโดยไม่ต้องแปลงชนิดข้อมูล
function เวลาตอนนี้() {
  var d = new Date();
  var สองหลัก = function (n) { return String(n).padStart(2, "0"); };
  return d.getFullYear() + "-" + สองหลัก(d.getMonth() + 1) + "-" + สองหลัก(d.getDate()) +
         " " + สองหลัก(d.getHours()) + ":" + สองหลัก(d.getMinutes());
}

// อ่านค่าที่ต่อท้าย URL เช่น leave-request-detail.html?id=lr001
function ค่าจากURL(ชื่อ) {
  return new URLSearchParams(location.search).get(ชื่อ) || "";
}

// แปล error code ของ Firebase Authentication เป็นข้อความไทยให้ผู้ใช้อ่านเข้าใจ
function ข้อความผิดพลาดAuth(err) {
  var แผนที่ = {
    "auth/email-already-in-use": "อีเมลนี้ถูกใช้สมัครแล้ว",
    "auth/weak-password": "รหัสผ่านสั้นเกินไป ต้องมีอย่างน้อย 6 ตัวอักษร",
    "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/wrong-password": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/user-not-found": "ไม่พบบัญชีผู้ใช้นี้ในระบบ"
  };
  return แผนที่[err && err.code] || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

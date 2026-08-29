// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างจาก js/data.js ลง Firestore จริง
// ใช้ id เดิม (u001, lt001, lr001 ...) เป็นชื่อเอกสาร ด้วย setDoc
// จึงกดปุ่มซ้ำได้อย่างปลอดภัย (เขียนทับที่เดิม ไม่สร้างซ้ำซ้อน)
// ยังไม่ใส่ subcollection approvals ในรอบนี้
// ─────────────────────────────────────────────────────────────

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

var ปุ่ม = document.getElementById("ปุ่มใส่ข้อมูล");
var กล่องผล = document.getElementById("ผลลัพธ์");

ปุ่ม.addEventListener("click", function () {
  ใส่ข้อมูลตัวอย่าง().catch(function (err) {
    แสดงผล("❌ ใส่ข้อมูลไม่สำเร็จ: " + err.message, true);
    console.error(err);
  });
});

async function ใส่ข้อมูลตัวอย่าง() {
  ปุ่ม.disabled = true;
  แสดงผล("กำลังใส่ข้อมูล…");

  var db = window.db;

  for (var u of window.LEAVE_DATA.users) {
    await setDoc(doc(db, "users", u.id), {
      name: u.name,
      email: u.email,
      role: u.role
    });
  }

  for (var lt of window.LEAVE_DATA.leaveTypes) {
    await setDoc(doc(db, "leaveTypes", lt.id), {
      name: lt.name
    });
  }

  for (var lr of window.LEAVE_DATA.leaveRequests) {
    await setDoc(doc(db, "leaveRequests", lr.id), {
      title: lr.title,
      reason: lr.reason,
      startDate: lr.startDate,
      endDate: lr.endDate,
      status: lr.status,
      requesterId: lr.requesterId,
      requesterName: lr.requesterName,
      approverId: lr.approverId,
      approverName: lr.approverName,
      leaveTypeId: lr.leaveTypeId,
      leaveTypeName: lr.leaveTypeName,
      createdAt: lr.createdAt
    });
  }

  var จำนวน = {
    users: window.LEAVE_DATA.users.length,
    leaveTypes: window.LEAVE_DATA.leaveTypes.length,
    leaveRequests: window.LEAVE_DATA.leaveRequests.length
  };

  แสดงผล(
    "✅ เขียนแล้ว — users " + จำนวน.users +
    ", leaveTypes " + จำนวน.leaveTypes +
    ", leaveRequests " + จำนวน.leaveRequests
  );
  ปุ่ม.disabled = false;
}

function แสดงผล(ข้อความ, เป็นข้อผิดพลาด) {
  กล่องผล.textContent = ข้อความ;
  กล่องผล.style.color = เป็นข้อผิดพลาด ? "crimson" : "inherit";
}

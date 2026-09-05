// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: กดบันทึกแล้วเขียนใบลาใหม่ลง Firestore จริง (ผ่าน window.addToCollection)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มใบลา");
  var ช่องประเภท = document.getElementById("leaveTypeId");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มบันทึก = document.getElementById("ปุ่มบันทึก");

  // เติมรายการเลื่อนลงด้วยประเภทการลาที่มีอยู่
  window.LEAVE_DATA.leaveTypes.forEach(function (ประเภท) {
    var ตัวเลือก = document.createElement("option");
    ตัวเลือก.value = ประเภท.id;
    ตัวเลือก.textContent = ประเภท.name;
    ช่องประเภท.appendChild(ตัวเลือก);
  });

  ฟอร์ม.addEventListener("submit", async function (e) {
    e.preventDefault();

    var ค่า = {
      title: document.getElementById("title").value.trim(),
      reason: document.getElementById("reason").value.trim(),
      leaveTypeId: ช่องประเภท.value,
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value
    };

    // ตรวจว่ากรอกครบก่อนบันทึก
    if (!ค่า.title || !ค่า.reason || !ค่า.leaveTypeId || !ค่า.startDate || !ค่า.endDate) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดบันทึก");
      return;
    }
    if (ค่า.endDate < ค่า.startDate) {
      เตือน("วันที่สิ้นสุดต้องไม่มาก่อนวันที่เริ่มลา");
      return;
    }

    var ประเภท = window.LEAVE_DATA.leaveTypes.find(function (t) { return t.id === ค่า.leaveTypeId; });

    // ยังไม่มีล็อกอิน จึงสมมติว่าผู้ขอลาคือ สมชาย ใจดี (แก้เมื่อมีระบบล็อกอิน)
    // ไม่ใส่ id เอง — Firestore สร้างชื่อไฟล์ (Document ID) ให้อัตโนมัติ
    var ใบใหม่ = {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: "u001", requesterName: "สมชาย ใจดี",
      approverId: "",      approverName: "",
      leaveTypeId: ประเภท.id, leaveTypeName: ประเภท.name,
      startDate: ค่า.startDate,
      endDate: ค่า.endDate,
      createdAt: เวลาตอนนี้()
    };

    ปุ่มบันทึก.disabled = true;
    try {
      await window.addToCollection("leaveRequests", ใบใหม่);
      location.href = "leave-requests.html";
    } catch (err) {
      console.error(err);
      showConfigWarning("บันทึกใบลาลง Firestore ไม่สำเร็จ");
      ปุ่มบันทึก.disabled = false;
    }
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();

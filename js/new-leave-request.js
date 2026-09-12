// ─────────────────────────────────────────────────────────────
// js/new-leave-request.js — หน้าที่ 2 ยื่นใบลาใหม่
// สัปดาห์ที่ 7: กดบันทึกแล้วเขียนใบลาใหม่ลง Firestore จริง (ผ่าน window.addToCollection)
// สัปดาห์ที่ 8: ปุ่มให้ AI ช่วยจัดประเภทการลา (US-09) ผ่าน OpenRouter — ดู js/openrouter-config.example.js
// ─────────────────────────────────────────────────────────────

(async function () {
  var ผู้ใช้ = await window.requireLogin();

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

  // US-09: ปุ่มให้ AI ช่วยจัดประเภทการลาจากข้อความในช่องเหตุผล
  var ปุ่มAI = document.getElementById("ปุ่มAIจัดประเภท");
  var กล่องผลลัพธ์AI = document.getElementById("ผลลัพธ์AI");

  ปุ่มAI.addEventListener("click", async function () {
    var เหตุผล = document.getElementById("reason").value.trim();
    if (!เหตุผล) {
      แสดงผลAI("กรุณากรอกเหตุผลการลาก่อน แล้วค่อยกดให้ AI จัดประเภท", "alert-warn");
      return;
    }

    var config = window.OPENROUTER_CONFIG;
    if (!config || !config.apiKey) {
      แสดงผลAI("ไม่พบ js/openrouter-config.js — จัดประเภทให้ไม่ได้ กรุณาเลือกเอง", "alert-warn");
      return;
    }

    var รายการประเภท = window.LEAVE_DATA.leaveTypes.map(function (t) {
      return { id: t.id, name: t.name };
    });

    ปุ่มAI.disabled = true;
    ปุ่มAI.textContent = "กำลังจัดประเภท...";
    แสดงผลAI("กำลังให้ AI พิจารณา...", "alert-ai");

    var ตัวควบคุม = new AbortController();
    var หมดเวลา = setTimeout(function () { ตัวควบคุม.abort(); }, 15000);

    try {
      var คำสั่ง = "เลือกประเภทการลาที่เหมาะกับเหตุผลนี้ที่สุด จากรายการประเภทที่ให้ไปเท่านั้น " +
        "ตอบกลับเป็น JSON รูปแบบ {\"leaveTypeId\": \"<id ที่เลือก>\"} เท่านั้น ห้ามมีข้อความอื่นปน " +
        "ถ้าไม่มีประเภทไหนเหมาะสมเลยให้ตอบ {\"leaveTypeId\": null}\n\n" +
        "รายการประเภทการลา: " + JSON.stringify(รายการประเภท) + "\n" +
        "เหตุผลการลา: " + เหตุผล;

      var ผลลัพธ์ = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: ตัวควบคุม.signal,
        headers: {
          "Authorization": "Bearer " + config.apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: "user", content: คำสั่ง }],
          response_format: { type: "json_object" }
        })
      });

      var ข้อมูล = await ผลลัพธ์.json();
      if (!ผลลัพธ์.ok) {
        throw new Error((ข้อมูล.error && ข้อมูล.error.message) || ผลลัพธ์.statusText);
      }

      var เนื้อหา = ข้อมูล.choices && ข้อมูล.choices[0] && ข้อมูล.choices[0].message && ข้อมูล.choices[0].message.content;
      var เลือกId = null;
      try {
        เลือกId = JSON.parse(เนื้อหา).leaveTypeId;
      } catch (e) {
        เลือกId = null;
      }

      // บังคับให้ผลที่ได้ต้องเป็นประเภทที่มีอยู่จริงในระบบเท่านั้น
      var ประเภทที่ตรง = window.LEAVE_DATA.leaveTypes.find(function (t) { return t.id === เลือกId; });

      if (ประเภทที่ตรง) {
        ช่องประเภท.value = ประเภทที่ตรง.id;
        แสดงผลAI("ข้อเสนอจาก AI — โปรดตรวจสอบก่อนยืนยัน: \"" + esc(ประเภทที่ตรง.name) + "\"", "alert-ai");
      } else {
        แสดงผลAI("AI จัดประเภทให้ไม่ได้ กรุณาเลือกเอง", "alert-warn");
      }
    } catch (err) {
      console.error(err);
      var ข้อความ = err.name === "AbortError"
        ? "AI ใช้เวลานานเกินไป — กรุณาเลือกประเภทเอง"
        : "เรียก AI ไม่สำเร็จ — กรุณาเลือกประเภทเอง";
      แสดงผลAI(ข้อความ, "alert-warn");
    } finally {
      clearTimeout(หมดเวลา);
      ปุ่มAI.disabled = false;
      ปุ่มAI.textContent = "ให้ AI ช่วยจัดประเภทการลา";
    }
  });

  function แสดงผลAI(ข้อความ, คลาส) {
    กล่องผลลัพธ์AI.textContent = ข้อความ;
    กล่องผลลัพธ์AI.className = "alert " + คลาส;
  }

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

    // ไม่ใส่ id เอง — Firestore สร้างชื่อไฟล์ (Document ID) ให้อัตโนมัติ
    var ใบใหม่ = {
      title: ค่า.title,
      reason: ค่า.reason,
      status: "รอพิจารณา",                       // ใบใหม่เริ่มที่ รอพิจารณา เสมอ
      requesterId: ผู้ใช้.uid, requesterName: ผู้ใช้.displayName,
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

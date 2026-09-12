// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// อ่านใบลา/เปลี่ยนสถานะ/ลบ จาก Firestore จริง · ความเห็นยังอยู่แค่ในหน่วยความจำ
// US-10: ปุ่มให้ AI สรุปใบลา (ผ่าน OpenRouter) — เขียนผลลง Firestore ที่ช่อง aiSuggestion
// ─────────────────────────────────────────────────────────────

(async function () {
  var ผู้ใช้ = await window.requireLogin();
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");
  var กล่องจำนวนรวม = document.getElementById("จำนวนรวม");

  var ใบลาทั้งหมด;
  try {
    ใบลาทั้งหมด = await window.getCollection("leaveRequests");
  } catch (err) {
    console.error(err);
    showConfigWarning("อ่านข้อมูลใบลาจาก Firestore ไม่สำเร็จ");
    return;
  }

  กล่องจำนวนรวม.textContent = "มีใบลาทั้งหมดในระบบ " + ใบลาทั้งหมด.length + " ใบ";

  var ใบ = ใบลาทั้งหมด.find(function (x) { return x.id === รหัสใบลา; });

  if (!ใบ) {
    กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
    return;
  }

  // พนักงานเปิดใบของคนอื่นไม่ได้ (ดู ACL.md)
  if (ผู้ใช้.role === "employee" && ใบ.requesterId !== ผู้ใช้.uid) {
    กล่องใบลา.innerHTML = "<p>คุณไม่มีสิทธิ์ดูใบลานี้</p>";
    return;
  }

  var ความเห็น = window.LEAVE_DATA.approvals.filter(function (c) { return c.requestId === ใบ.id; });

  วาดใบลา();
  วาดความเห็น();
  กล่องความเห็น.classList.remove("hidden");

  document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    if (ใบ.aiSuggestion) {
      แถว.push(["สรุปโดย AI", esc(ใบ.aiSuggestion)]);
    }

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // ปุ่มขึ้นตามสิทธิ์ของบทบาท (ดู ACL.md) — อนุมัติ/ไม่อนุมัติ: หัวหน้า/ฝ่ายบุคคลเท่านั้น
    // ลบ: เจ้าของใบเอง หรือฝ่ายบุคคล (ลบของคนอื่นได้ทุกใบ) — ทั้งสองอย่างต้องยังอยู่ที่ รอพิจารณา
    var อนุมัติได้ = (ผู้ใช้.role === "manager" || ผู้ใช้.role === "hr") && ใบ.status === "รอพิจารณา";
    var ลบได้ = ใบ.status === "รอพิจารณา" && (ผู้ใช้.role === "hr" || ใบ.requesterId === ผู้ใช้.uid);

    // US-10: ปุ่มให้ AI ช่วยสรุปใบลาให้หัวหน้า/ฝ่ายบุคคลอ่านก่อนกดอนุมัติ — สิทธิ์เดียวกับปุ่มอนุมัติ
    if (อนุมัติได้) {
      html +=
        '<div class="btn-row">' +
        '<button type="button" class="btn-ghost" id="ปุ่มAIสรุป">ให้ AI ช่วยสรุปใบลา</button>' +
        "</div>" +
        '<div id="ผลลัพธ์AIสรุป" class="alert alert-ai hidden"></div>' +
        '<div class="btn-row hidden" id="แถวบันทึกAIสรุป">' +
        '<button type="button" class="btn-ok" id="ปุ่มบันทึกAIสรุป">บันทึกสรุปนี้</button>' +
        "</div>";
    }

    if (อนุมัติได้ || ลบได้) {
      html += '<div class="btn-row">';
      if (อนุมัติได้) {
        html +=
          '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
          '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>';
      }
      if (ลบได้) {
        html += '<button type="button" class="btn-danger" id="ปุ่มลบ">ลบใบลา</button>';
      }
      html += "</div>";
    } else if (ใบ.status === "รอพิจารณา") {
      html += '<p class="hint">รอหัวหน้าหรือฝ่ายบุคคลพิจารณา</p>';
    } else {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
    }

    กล่องใบลา.innerHTML = html;

    if (อนุมัติได้) {
      document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
      document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
      document.getElementById("ปุ่มAIสรุป").addEventListener("click", สรุปด้วยAI);
      document.getElementById("ปุ่มบันทึกAIสรุป").addEventListener("click", บันทึกAIสรุป);
    }
    if (ลบได้) {
      document.getElementById("ปุ่มลบ").addEventListener("click", ลบใบลา);
    }
  }

  // ── US-10: ให้ AI อ่านใบลาแล้วเขียนสรุปสั้น ๆ ให้หัวหน้าอ่านก่อนตัดสินใจ ──
  // ขั้น 1 อ่านใบลา (ใช้ ใบ ที่โหลดไว้แล้ว) → ขั้น 2 ให้ AI เขียนสรุป (ยังไม่บันทึก)
  // → ผู้ใช้ตรวจสรุปก่อน แล้วค่อยกด "บันทึกสรุปนี้" (ขั้น 3 เขียนกลับ Firestore)
  var สรุปที่รอบันทึก = null;

  async function สรุปด้วยAI() {
    var ปุ่มAIสรุป = document.getElementById("ปุ่มAIสรุป");
    var แถวบันทึก = document.getElementById("แถวบันทึกAIสรุป");

    var config = window.OPENROUTER_CONFIG;
    if (!config || !config.apiKey) {
      แสดงผลAIสรุป("ไม่พบ js/openrouter-config.js — สรุปให้ไม่ได้", "alert-warn");
      return;
    }

    ปุ่มAIสรุป.disabled = true;
    ปุ่มAIสรุป.textContent = "กำลังสรุป...";
    แถวบันทึก.classList.add("hidden");
    แสดงผลAIสรุป("กำลังให้ AI อ่านใบลาแล้วสรุป...", "alert-ai");

    var ตัวควบคุม = new AbortController();
    var หมดเวลา = setTimeout(function () { ตัวควบคุม.abort(); }, 15000);

    // อยู่นอก try ให้ catch ด้านล่างเรียกใช้ตอนบันทึก log ของการเรียกที่ล้มเหลวได้ด้วย
    var คำสั่ง = "อ่านใบขอลานี้แล้วเขียนสรุปสั้น ๆ 1-2 ประโยคภาษาไทย ให้หัวหน้าอ่านก่อนตัดสินใจอนุมัติ " +
      "ตอบกลับเป็น JSON รูปแบบ {\"summary\": \"<ข้อความสรุป>\"} เท่านั้น ห้ามมีข้อความอื่นปน\n\n" +
      "หัวข้อ: " + ใบ.title + "\n" +
      "ประเภทการลา: " + ใบ.leaveTypeName + "\n" +
      "ช่วงวันที่ลา: " + ใบ.startDate + " ถึง " + ใบ.endDate + "\n" +
      "ผู้ขอลา: " + ใบ.requesterName + "\n" +
      "เหตุผลการลา: " + ใบ.reason;

    try {
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
      await บันทึกAiLog(คำสั่ง, เนื้อหา || "(ไม่มีคำตอบกลับมา)");

      var สรุป = null;
      try {
        สรุป = JSON.parse(เนื้อหา).summary;
      } catch (e) {
        สรุป = null;
      }

      if (สรุป && typeof สรุป === "string" && สรุป.trim()) {
        สรุปที่รอบันทึก = สรุป.trim();
        แสดงผลAIสรุป("ข้อเสนอจาก AI — โปรดตรวจสอบก่อนบันทึก: \"" + esc(สรุปที่รอบันทึก) + "\"", "alert-ai");
        แถวบันทึก.classList.remove("hidden");
      } else {
        แสดงผลAIสรุป("AI สรุปให้ไม่สำเร็จ กรุณาลองใหม่", "alert-warn");
      }
    } catch (err) {
      console.error(err);
      var ข้อความ = err.name === "AbortError"
        ? "AI ใช้เวลานานเกินไป — กรุณาลองใหม่"
        : "เรียก AI ไม่สำเร็จ — กรุณาลองใหม่";
      แสดงผลAIสรุป(ข้อความ, "alert-warn");
      await บันทึกAiLog(คำสั่ง, "ข้อผิดพลาด: " + (err && err.message ? err.message : String(err)));
    } finally {
      clearTimeout(หมดเวลา);
      ปุ่มAIสรุป.disabled = false;
      ปุ่มAIสรุป.textContent = "ให้ AI ช่วยสรุปใบลา";
    }
  }

  // ── ขั้น 3: เขียนสรุปที่ตรวจแล้วกลับลง Firestore (แก้เฉพาะช่อง aiSuggestion) ──
  async function บันทึกAIสรุป() {
    if (!สรุปที่รอบันทึก) return;

    var ปุ่มบันทึก = document.getElementById("ปุ่มบันทึกAIสรุป");
    ปุ่มบันทึก.disabled = true;

    try {
      await window.updateInCollection("leaveRequests", ใบ.id, { aiSuggestion: สรุปที่รอบันทึก });
      ใบ.aiSuggestion = สรุปที่รอบันทึก;
      สรุปที่รอบันทึก = null;
      วาดใบลา();
    } catch (err) {
      console.error(err);
      showConfigWarning("บันทึกสรุป AI ลง Firestore ไม่สำเร็จ");
      ปุ่มบันทึก.disabled = false;
    }
  }

  function แสดงผลAIสรุป(ข้อความ, คลาส) {
    var กล่อง = document.getElementById("ผลลัพธ์AIสรุป");
    กล่อง.textContent = ข้อความ;
    กล่อง.className = "alert " + คลาส;
  }

  // ── บันทึก log ทุกครั้งที่เรียก AI ไม่ว่าจะสำเร็จหรือไม่ ──
  // เก็บไว้ในโฟลเดอร์ย่อย leaveRequests/{id}/aiLog แยกจากช่อง aiSuggestion ที่เป็นผลสรุปล่าสุดที่คนยืนยันแล้ว
  // เขียนไม่สำเร็จก็แค่ log ไว้ดู ไม่ให้กระทบขั้นตอนหลักของผู้ใช้
  async function บันทึกAiLog(input, output) {
    try {
      await window.addToSubcollection("leaveRequests", ใบ.id, "aiLog", {
        input: input,
        output: output,
        createdAt: เวลาตอนนี้()
      });
    } catch (err) {
      console.error("บันทึก aiLog ไม่สำเร็จ", err);
    }
  }

  // ── เปลี่ยนสถานะ — เขียนกลับ Firestore จริง แก้เฉพาะช่อง status ──
  async function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }

    var ปุ่มอนุมัติ = document.getElementById("ปุ่มอนุมัติ");
    var ปุ่มไม่อนุมัติ = document.getElementById("ปุ่มไม่อนุมัติ");
    ปุ่มอนุมัติ.disabled = true;
    ปุ่มไม่อนุมัติ.disabled = true;

    try {
      await window.updateInCollection("leaveRequests", ใบ.id, { status: สถานะใหม่ });
      ใบ.status = สถานะใหม่;   // แก้เฉพาะช่อง status เท่านั้น
      วาดใบลา();
    } catch (err) {
      console.error(err);
      showConfigWarning("บันทึกสถานะลง Firestore ไม่สำเร็จ");
      ปุ่มอนุมัติ.disabled = false;
      ปุ่มไม่อนุมัติ.disabled = false;
    }
  }

  // ── ลบใบลา — ต้องยืนยันก่อนทุกครั้ง ──
  async function ลบใบลา() {
    if (!confirm('ยืนยันการลบใบลา "' + ใบ.title + '" หรือไม่')) return;

    // ปุ่มอนุมัติ/ไม่อนุมัติอาจไม่มีอยู่จริง (เช่น พนักงานลบใบของตัวเอง) จึงต้องเช็คก่อนปิดปุ่ม
    var ปุ่มทั้งหมด = ["ปุ่มอนุมัติ", "ปุ่มไม่อนุมัติ", "ปุ่มลบ"]
      .map(function (id) { return document.getElementById(id); })
      .filter(function (ปุ่ม) { return ปุ่ม; });
    ปุ่มทั้งหมด.forEach(function (ปุ่ม) { ปุ่ม.disabled = true; });

    try {
      await window.deleteFromCollection("leaveRequests", ใบ.id);
      location.href = "leave-requests.html";
    } catch (err) {
      console.error(err);
      showConfigWarning("ลบใบลาไม่สำเร็จ");
      ปุ่มทั้งหมด.forEach(function (ปุ่ม) { ปุ่ม.disabled = false; });
    }
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── ส่งความเห็นใหม่ ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    ความเห็น.push({
      id: "ap-ใหม่-" + Date.now(),
      requestId: ใบ.id,
      authorId: ผู้ใช้.uid, authorName: ผู้ใช้.displayName,
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    });
    ช่อง.value = "";
    วาดความเห็น();
  }
})();

const ปุ่มทดสอบ = document.getElementById("ปุ่มทดสอบ");
const กล่องคำตอบ = document.getElementById("กล่องคำตอบ");

ปุ่มทดสอบ.addEventListener("click", async () => {
  const config = window.OPENROUTER_CONFIG;
  if (!config || !config.apiKey) {
    กล่องคำตอบ.textContent = "ไม่พบ js/openrouter-config.js — คัดลอกจาก openrouter-config.example.js แล้วใส่คีย์ก่อน";
    return;
  }

  ปุ่มทดสอบ.disabled = true;
  กล่องคำตอบ.textContent = "กำลังส่งข้อความ...";

  try {
    const ผลลัพธ์ = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: "สวัสดี" }],
      }),
    });

    const ข้อมูล = await ผลลัพธ์.json();

    if (!ผลลัพธ์.ok) {
      กล่องคำตอบ.textContent = `เกิดข้อผิดพลาด: ${ข้อมูล.error?.message || ผลลัพธ์.statusText}`;
      return;
    }

    กล่องคำตอบ.textContent = ข้อมูล.choices?.[0]?.message?.content ?? "ไม่มีคำตอบกลับมา";
  } catch (err) {
    กล่องคำตอบ.textContent = `เชื่อมต่อไม่สำเร็จ: ${err.message}`;
  } finally {
    ปุ่มทดสอบ.disabled = false;
  }
});

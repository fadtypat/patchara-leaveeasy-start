// ─────────────────────────────────────────────────────────────
// js/signup.js — หน้าสมัครสมาชิก
// สมัครแล้วสร้างบัญชี Firebase Auth + ไฟล์โปรไฟล์ในโฟลเดอร์ users (role เริ่มต้น employee)
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มสมัคร");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มสมัคร = document.getElementById("ปุ่มสมัคร");

  ฟอร์ม.addEventListener("submit", async function (e) {
    e.preventDefault();

    var ชื่อ = document.getElementById("name").value.trim();
    var อีเมล = document.getElementById("email").value.trim();
    var รหัสผ่าน = document.getElementById("password").value;

    if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
      เตือน("กรอกไม่ครบ — ต้องกรอกทุกช่องก่อนกดสมัครสมาชิก");
      return;
    }

    ปุ่มสมัคร.disabled = true;
    try {
      await window.signUp(ชื่อ, อีเมล, รหัสผ่าน);
      location.replace("leave-requests.html");
    } catch (err) {
      console.error(err);
      เตือน(ข้อความผิดพลาดAuth(err));
      ปุ่มสมัคร.disabled = false;
    }
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();

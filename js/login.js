// ─────────────────────────────────────────────────────────────
// js/login.js — หน้าเข้าสู่ระบบ
// ─────────────────────────────────────────────────────────────

(function () {
  var ฟอร์ม = document.getElementById("ฟอร์มเข้าสู่ระบบ");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่มเข้าสู่ระบบ = document.getElementById("ปุ่มเข้าสู่ระบบ");

  ฟอร์ม.addEventListener("submit", async function (e) {
    e.preventDefault();

    var อีเมล = document.getElementById("email").value.trim();
    var รหัสผ่าน = document.getElementById("password").value;

    if (!อีเมล || !รหัสผ่าน) {
      เตือน("กรอกไม่ครบ — ต้องกรอกอีเมลและรหัสผ่านก่อนกดเข้าสู่ระบบ");
      return;
    }

    ปุ่มเข้าสู่ระบบ.disabled = true;
    try {
      await window.logIn(อีเมล, รหัสผ่าน);
      location.replace("leave-requests.html");
    } catch (err) {
      console.error(err);
      เตือน(ข้อความผิดพลาดAuth(err));
      ปุ่มเข้าสู่ระบบ.disabled = false;
    }
  });

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }
})();

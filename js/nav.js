// ─────────────────────────────────────────────────────────────
// js/nav.js — แถบเมนูด้านบนที่ใช้ร่วมกันทุกหน้า
// แก้เมนูที่ไฟล์นี้ที่เดียว ทุกหน้าเปลี่ยนตามพร้อมกัน
//
// วิธีใช้: ทุกหน้ามี <div id="nav"></div> ไว้บนสุดของ body
// ─────────────────────────────────────────────────────────────

(function () {
  var เมนู = [
    { href: "index.html",             ชื่อ: "หน้าแรก" },
    { href: "leave-requests.html",    ชื่อ: "รายการใบลา" },
    { href: "new-leave-request.html", ชื่อ: "ยื่นใบลาใหม่" },
    { href: "leave-types.html",       ชื่อ: "ประเภทการลา" }
  ];

  // ชื่อไฟล์ของหน้าที่กำลังเปิดอยู่ เอาไว้ขีดเส้นใต้เมนูที่ตรงกัน
  var หน้าปัจจุบัน = location.pathname.split("/").pop() || "index.html";

  var html = '<div class="navbar"><span class="brand">🔧 LeaveEasy</span>';
  เมนู.forEach(function (m) {
    var active = m.href === หน้าปัจจุบัน ? ' class="active"' : "";
    var id = m.href === "leave-types.html" ? ' id="navLeaveTypes"' : "";
    html += '<a href="' + m.href + '"' + id + active + ">" + m.ชื่อ + "</a>";
  });
  // ช่องว่างสำหรับแสดงชื่อคนที่ล็อกอินอยู่ (เติมค่าในสัปดาห์ที่ 7)
  html += '<span class="nav-user" id="navUser"></span></div>';

  var ที่วาง = document.getElementById("nav");
  if (ที่วาง) ที่วาง.innerHTML = html;
})();

// แสดงชื่อผู้ใช้ที่ล็อกอินอยู่ + ปุ่มออกจากระบบ (เติมค่าในสัปดาห์ที่ 7)
window.auth.onAuthStateChanged(function (user) {
  var ที่วางชื่อ = document.getElementById("navUser");
  if (!ที่วางชื่อ) return;
  ที่วางชื่อ.innerHTML = "";
  if (!user) return;

  var ป้ายชื่อ = document.createElement("span");
  ป้ายชื่อ.textContent = "👤 " + (user.displayName || user.email);

  var ปุ่มออก = document.createElement("button");
  ปุ่มออก.type = "button";
  ปุ่มออก.className = "btn-ghost";
  ปุ่มออก.textContent = "ออกจากระบบ";
  ปุ่มออก.addEventListener("click", async function () {
    await window.logOut();
    location.replace("login.html");
  });

  ที่วางชื่อ.appendChild(ป้ายชื่อ);
  ที่วางชื่อ.appendChild(ปุ่มออก);

  // ซ่อนเมนู "ประเภทการลา" ถ้าไม่ใช่ฝ่ายบุคคล (ดู ACL.md)
  window.getDocFromCollection("users", user.uid).then(function (โปรไฟล์) {
    var role = โปรไฟล์ ? โปรไฟล์.role : "employee";
    var ลิงก์ประเภท = document.getElementById("navLeaveTypes");
    if (ลิงก์ประเภท) ลิงก์ประเภท.classList.toggle("hidden", role !== "hr");
  });
});

// แถบเตือนสีเหลือง ใช้ตอนที่ยังไม่ได้ตั้งค่า Firebase
function showConfigWarning(ข้อความ) {
  var กล่อง = document.createElement("div");
  กล่อง.className = "alert alert-warn";
  กล่อง.innerHTML =
    "⚠️ <strong>ยังไม่ได้ตั้งค่า Firebase</strong> — " +
    (ข้อความ || "หน้านี้จึงยังไม่ได้อ่านข้อมูลจากฐานข้อมูลจริง") +
    "<br>วิธีตั้งค่าอยู่ในไฟล์ SETUP.md ขั้นที่ 4";
  var ที่วาง = document.querySelector(".container") || document.body;
  ที่วาง.insertBefore(กล่อง, ที่วาง.firstChild);
}

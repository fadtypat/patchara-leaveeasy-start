// ─────────────────────────────────────────────────────────────
// js/firebase-init.js — จุดเชื่อมต่อ Firebase ที่เดียวของทั้งโปรเจกต์
// ไฟล์นี้เป็น ES module (type="module") โหลด SDK จาก CDN ตรงๆ
// ไม่ต้องมี build step เพราะโปรเจกต์นี้เป็น HTML/JS ธรรมดา
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// ค่าจาก Firebase Console ของโปรเจกต์ leaveeasy-patchara-c84bb
// apiKey ของ Firebase web app ไม่ใช่ความลับ ความปลอดภัยจริงมาจาก Firestore Security Rules
const firebaseConfig = {
  apiKey: "AIzaSyARF5XmZz44czrpoSRWt4JMKcUm5XtnOZg",
  authDomain: "leaveeasy-patchara-c84bb.firebaseapp.com",
  projectId: "leaveeasy-patchara-c84bb",
  storageBucket: "leaveeasy-patchara-c84bb.firebasestorage.app",
  messagingSenderId: "858266977549",
  appId: "1:858266977549:web:0c1a6fc3654eb802359c44"
};

const app = initializeApp(firebaseConfig);

// เก็บไว้บน window ให้ไฟล์ non-module อื่น ๆ (seed.js, leave-requests.js ฯลฯ) เรียกใช้ร่วมกันได้
window.db = getFirestore(app);

// อ่านทั้ง collection แล้วคืนเป็น array ธรรมดา ใช้แทน window.LEAVE_DATA.xxx เดิมได้เลย
window.getCollection = async function (name) {
  var snap = await getDocs(collection(window.db, name));
  return snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });
};

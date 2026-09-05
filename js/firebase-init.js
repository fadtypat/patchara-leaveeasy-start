// ─────────────────────────────────────────────────────────────
// js/firebase-init.js — จุดเชื่อมต่อ Firebase ที่เดียวของทั้งโปรเจกต์
// ไฟล์นี้เป็น ES module (type="module") โหลด SDK จาก CDN ตรงๆ
// ไม่ต้องมี build step เพราะโปรเจกต์นี้เป็น HTML/JS ธรรมดา
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// เพิ่มไฟล์ใหม่ลงโฟลเดอร์ (collection) — Firestore สร้างชื่อไฟล์ (Document ID) ให้อัตโนมัติ
// คืนค่าเป็นชื่อไฟล์ที่สร้างขึ้น
window.addToCollection = async function (name, data) {
  var ref = await addDoc(collection(window.db, name), data);
  return ref.id;
};

// แก้เฉพาะ field ที่ส่งมาใน fields ของไฟล์เดิม ไม่แตะ field อื่นในไฟล์นั้น
window.updateInCollection = async function (name, id, fields) {
  await updateDoc(doc(window.db, name, id), fields);
};

// ลบไฟล์ออกจากโฟลเดอร์ (collection)
window.deleteFromCollection = async function (name, id) {
  await deleteDoc(doc(window.db, name, id));
};

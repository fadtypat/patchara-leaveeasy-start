// ─────────────────────────────────────────────────────────────
// js/firebase-init.js — จุดเชื่อมต่อ Firebase ที่เดียวของทั้งโปรเจกต์
// ไฟล์นี้เป็น ES module (type="module") โหลด SDK จาก CDN ตรงๆ
// ไม่ต้องมี build step เพราะโปรเจกต์นี้เป็น HTML/JS ธรรมดา
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

// ── Firebase Authentication ──
window.auth = getAuth(app);

// สมัครสมาชิก: สร้างบัญชี Auth + ตั้งชื่อที่แสดง + สร้างไฟล์โปรไฟล์ในโฟลเดอร์ users
window.signUp = async function (name, email, password) {
  var ผลลัพธ์ = await createUserWithEmailAndPassword(window.auth, email, password);
  await updateProfile(ผลลัพธ์.user, { displayName: name });
  await setDoc(doc(window.db, "users", ผลลัพธ์.user.uid), { name: name, email: email, role: "employee" });
  return ผลลัพธ์.user;
};

window.logIn = async function (email, password) {
  var ผลลัพธ์ = await signInWithEmailAndPassword(window.auth, email, password);
  return ผลลัพธ์.user;
};

window.logOut = async function () {
  await signOut(window.auth);
};

// resolve เมื่อรู้ว่าล็อกอินอยู่ · ถ้าไม่ได้ล็อกอิน เด้งไปหน้า login แล้วไม่ resolve ต่อ
window.requireLogin = function () {
  return new Promise(function (resolve) {
    var เลิกฟัง = onAuthStateChanged(window.auth, function (user) {
      เลิกฟัง(); // ฟังแค่ครั้งแรกพอ กันไม่ให้ทำงานซ้ำเมื่อสถานะเปลี่ยนภายหลัง (เช่นตอน logOut)
      if (user) {
        resolve(user);
      } else {
        location.replace("login.html");
      }
    });
  });
};

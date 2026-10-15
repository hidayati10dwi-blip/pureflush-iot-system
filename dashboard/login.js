'use strict';
/* LOGIN — hanya mengurus halaman masuk. Dashboard ada di main.html.
   Jabatan ditentukan dari akun (tidak ada dropdown, sesuai desain). */
const SK = 'pureflush_user';
const LK = 'pureflush_logins';
const $ = q => document.querySelector(q);

// DEMO: username bebas, password wajib 'admin123'. Kata sandi tertulis di kode, jadi bukan keamanan sungguhan.
const PASSWORD = 'admin123';
const ROLE = 'Administrator';

// Sudah login? langsung ke dashboard.
try { if (sessionStorage.getItem(SK) || localStorage.getItem(SK)) location.replace('main.html'); } catch (e) { /* abaikan */ }

$('#eye').addEventListener('click', () => {
  const p = $('#pw'), show = p.type === 'password';
  p.type = show ? 'text' : 'password';
  $('#eye').setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
});

$('#lf').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#u').value.trim().toLowerCase(), pw = $('#pw').value;
  if (!name || !pw) { $('#er').textContent = 'Lengkapi username dan password.'; return; }
  if (pw !== PASSWORD) { $('#er').textContent = 'Password salah.'; return; }
  const acc = { role: ROLE };

  const sesi = JSON.stringify({ name, role: acc.role });
  try {
    // "Ingat saya" dicentang: tetap masuk walau browser ditutup. Jika tidak: sesi hilang saat tab ditutup.
    const remember = $('#rm').checked;
    (remember ? localStorage : sessionStorage).setItem(SK, sesi);
    (remember ? sessionStorage : localStorage).removeItem(SK);
  } catch (x) { $('#er').textContent = 'Browser memblokir penyimpanan sesi. Buka lewat Chrome atau Live Server.'; return; }

  try {   // riwayat masuk (dibaca main.js, halaman Riwayat Masuk)
    const a = JSON.parse(localStorage.getItem(LK)) || [];
    a.unshift({ t: new Date().toISOString(), ev: 'Masuk', name, role: acc.role });
    localStorage.setItem(LK, JSON.stringify(a.slice(0, 300)));
  } catch (x) { /* abaikan */ }
  location.href = 'main.html';
});
'use strict';
/* =========================================================
   PureFlush — MAIN (dashboard). Dibuka dari login.html.
   Alur: Dashboard > Detail Bilik > Konfirmasi > Notifikasi.
   Data = SIMULASI (belum ada alat).
   ========================================================= */
const KEY = 'pureflush_v4', SK = 'pureflush_user';
const SAMPLE = [48, 28, 50, 25, 30, 43, 12];   // contoh frekuensi siram Senin..Minggu (sama dengan desain Figma)
const LBL = { kosong: 'Kosong', dipakai: 'Dipakai', cek: 'Perlu Dicek' };
const SENS = { kosong: 'Tidak Mendeteksi Pengguna', dipakai: 'Pengguna Terdeteksi', cek: 'Perlu Pemeriksaan' };
const MN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MODES = { jam: '7 jam terakhir', hari: 'minggu ini', bulan: '6 bulan terakhir' };
const TT = { jam: 'Per Jam', hari: 'Harian', bulan: 'Bulanan' };
const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const $ = q => document.querySelector(q);
const pad = n => String(n).padStart(2, '0');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const now = (d = new Date()) => pad(d.getHours()) + '.' + pad(d.getMinutes());
const minAgo = m => now(new Date(Date.now() - m * 60000));
const ago = k => { const d = new Date(); d.setDate(d.getDate() - k); return d; };
const dkey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

/* ---------- ikon ---------- */
const P = {
  drop: '<path d="M12 2.5c3.5 4.4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.6 6-11z"/>',
  grid: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  door: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M12 3v18M9 12h.01"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  wifi: '<path d="M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0"/><circle cx="12" cy="19" r="1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
};
const ic = (n, s = 18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

/* ---------- data bilik (simulasi) ---------- */
const R = {   // nilai awal sama dengan desain Figma
  1: { s: 'kosong', last: '13.10', dur: 18, call: 0 },
  2: { s: 'dipakai', last: '13.40', dur: 5, call: 0 },
  3: { s: 'kosong', last: '13.25', dur: 20, call: 0 },
  4: { s: 'cek', last: '12.48', dur: 35, call: 0 }
};
const cnt = k => Object.values(R).filter(r => r.s === k).length;
const durTxt = r => r.s === 'dipakai' ? r.dur + ' menit (Berjalan)' : r.dur + ' menit' + (r.dur >= 30 ? ' (Overtime)' : r.dur >= 15 ? ' (lama)' : '');

/* ---------- penyimpanan per hari (localStorage) ---------- */
let DB, cm = 'hari', rd = dkey(new Date()), flt = 0, view = 'dash', cur = 1, sim = true, onOk = null, dirty = false;
function saveDB() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* penuh/diblokir: abaikan */ } }
function rec(k) { return DB.days[k] || (DB.days[k] = { hrs: {}, tot: 0, siram: 0, call: 0, cek: 0, log: [], s: 0 }); }
function seedDB() {
  DB = { start: dkey(new Date()), days: {} };
  const W = []; for (let h = 7; h <= 21; h++) W.push((h * 13) % 5 + 1);
  const WS = W.reduce((a, b) => a + b, 0);
  const fill = (r, T) => {            // bagi total T ke jam 07-21, jumlahnya persis T
    let sum = 0;
    for (let h = 7; h <= 21; h++) { const v = Math.floor(T * W[h - 7] / WS); r.hrs[h] = v; sum += v; }
    r.hrs[12] += T - sum; r.tot = T;
  };
  for (let k = 1; k <= 200; k++) {
    const d = ago(k), r = rec(dkey(d)); r.s = 1;
    fill(r, SAMPLE[(d.getDay() + 6) % 7]);
    r.siram = k % 4; r.call = k % 2; r.cek = k % 3;
  }
  const t = rec(dkey(new Date())); t.s = 1; fill(t, SAMPLE[(new Date().getDay() + 6) % 7]);
  saveDB();
}
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(KEY)); } catch (e) { DB = null; }
  if (!DB || !DB.days) seedDB();
  rec(dkey(new Date()));
}
function addUse() { const d = new Date(), r = rec(dkey(d)); r.hrs[d.getHours()] = (r.hrs[d.getHours()] || 0) + 1; r.tot++; saveDB(); }
function log(i, text, type) {
  const r = rec(dkey(new Date()));
  r.log.unshift([now(), 'Bilik ' + pad(i), text]);
  if (type === 'siram') r.siram++;
  if (type === 'call') r.call++;
  if (type === 'cek') r.cek++;
  r.log = r.log.slice(0, 300); saveDB();
}
function getBars() {
  const n = new Date();
  let out;
  if (cm === 'jam') {
    const r = rec(dkey(n)), h = n.getHours();
    out = Array.from({ length: 7 }, (_, i) => { const hr = h - 6 + i; return [pad((hr + 24) % 24) + '.00', hr >= 0 ? (r.hrs[hr] || 0) : 0]; });
    out.now = 6;
  } else if (cm === 'hari') {            // minggu ini: Senin - Minggu (hari yang belum tiba = 0)
    const dow = (n.getDay() + 6) % 7;
    out = Array.from({ length: 7 }, (_, i) => { const d = ago(dow - i), r = DB.days[dkey(d)]; return [DAYS[d.getDay()], i <= dow ? (r ? r.tot : 0) : SAMPLE[i]]; });   // hari yang belum tiba: angka contoh
    out.now = dow;
  } else {
    out = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(n.getFullYear(), n.getMonth() - 5 + i, 1), p = d.getFullYear() + '-' + pad(d.getMonth() + 1);
      let t = 0; for (const k in DB.days) if (k.startsWith(p)) t += DB.days[k].tot;
      return [MN[d.getMonth()], t];
    });
    out.now = 5;
  }
  return out;
}

/* ---------- sesi (hanya demo) ---------- */
const user = () => { for (const st of [sessionStorage, localStorage]) { try { const v = st.getItem(SK); if (v) return JSON.parse(v); } catch (e) { /* abaikan */ } } return null; };

/* ---------- izin per jabatan (ubah di sini) ---------- */
const PERM = {
  'Petugas Kebersihan': { siram: 1 },
  'Pengelola Gedung': { call: 1, riwayat: 1 },
  'Administrator': { siram: 1, call: 1, riwayat: 1, reset: 1 }
};
const can = a => !!(PERM[(user() || {}).role] || {})[a];
const DENY = { siram: 'Siram manual hanya untuk Petugas Kebersihan dan Administrator.', call: 'Memanggil petugas hanya untuk Pengelola Gedung dan Administrator.', riwayat: 'Riwayat masuk hanya untuk Pengelola Gedung dan Administrator.', reset: 'Hapus data hanya untuk Administrator.' };
const who = () => (user() || {}).name || '-';

/* ---------- riwayat masuk/keluar (localStorage, dipakai bersama login.js) ---------- */
const LK = 'pureflush_logins';
function getLogins() { try { return JSON.parse(localStorage.getItem(LK)) || []; } catch (e) { return []; } }
function addLogin(ev) {
  const u = user(); if (!u) return;
  const a = getLogins(); a.unshift({ t: new Date().toISOString(), ev, name: u.name, role: u.role });
  try { localStorage.setItem(LK, JSON.stringify(a.slice(0, 300))); } catch (e) { /* abaikan */ }
}

/* ---------- tampilan ---------- */
function shell(inner) {
  const u = user(), a = view === 'detail' ? 'mon' : view;
  const nav = [['dash', '🏠', 'Dashboard'], ['mon', '🚻', 'Monitoring Bilik'], ['lap', '📊', 'Laporan Sanitasi']];
  return `<div class="app"><aside>
    <div class="logo"><div class="wm"><span>Pure</span><span class="f">Flush</span></div><div class="tag">Smart Toilet Monitoring System</div></div>
    <h4>Menu Utama</h4>
    <nav class="nav" aria-label="Menu utama">${nav.map(([v, i, t]) => `<button data-a="nav" data-v="${v}" ${a === v ? 'aria-current="page"' : ''}><span class="em" aria-hidden="true">${i}</span>${t}</button>`).join('')}</nav>
    <div class="who"><b>${esc(u.name)}</b><span>${esc(u.role)}</span>
      ${can('riwayat') ? `<button data-a="nav" data-v="riw" ${a === 'riw' ? 'aria-current="page"' : ''}>${ic('user', 15)}Riwayat Masuk</button>` : ''}
      <button data-a="out">${ic('out', 15)}Keluar</button></div>
  </aside><main id="main">${inner}</main></div>`;
}

const topbar = t => `<div class="top"><h1>${t}</h1></div>`;

function roomCard(i, more) {
  const r = R[i];
  return `<button class="rc rc-${r.s}" data-a="room" data-v="${i}" aria-label="Bilik ${pad(i)}, ${LBL[r.s]}">
    <div class="rt"><span class="em" aria-hidden="true">🚽</span><b>BILIK ${pad(i)}</b></div>
    <div class="m"><span class="dot d-${r.s}"></span>Status: ${r.call ? 'Petugas menuju bilik' : LBL[r.s]}</div>
    <div class="m"><span class="em" aria-hidden="true">🕐</span>${r.s === 'dipakai' ? 'Mulai digunakan' : 'Terakhir digunakan'}: ${r.last}</div>
    ${more ? `<div class="m">Durasi: ${durTxt(r)}</div><div class="m">Sensor: ${SENS[r.s]}</div>` : ''}
    <span class="dl">[Detail →]</span></button>`;
}

function chart(full) {
  const bars = getBars(), W = 700, H = 300, L = 44, T = 14, B = 34, Rr = 6, pw = W - L - Rr, ph = H - T - B;
  const tot = bars.reduce((a, b) => a + b[1], 0), top = bars.reduce((a, b) => b[1] > a[1] ? b : a);
  const STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000], st = STEPS.find(x => top[1] / x <= 5) || 1000;
  const max = st * Math.max(4, Math.ceil(top[1] / st)), step = pw / bars.length, bw = step * .57;
  let g = '';
  for (let v = 0; v <= max; v += st) { const y = T + ph - ph * v / max; g += `<text class="ax y" x="${L - 12}" y="${y + 5}" text-anchor="end">${v}</text>`; }
  bars.forEach(([h, v], i) => {
    const x = L + step * i + (step - bw) / 2, bh = ph * v / max, y = T + ph - bh;
    g += `<rect class="bv" x="${x}" y="${y}" width="${bw}" height="${bh}"><title>${h}: ${v}</title></rect><text class="ax" x="${x + bw / 2}" y="${H - 12}" text-anchor="middle">${h}</text>`;
  });
  const tabs = [['jam', 'Per jam'], ['hari', 'Harian'], ['bulan', 'Bulanan']];
  return (full ? `<div class="filter">${tabs.map(([k, t]) => `<button data-a="cm" data-v="${k}" class="${cm === k ? 'on' : ''}">${t}</button>`).join('')}</div>` : '')
  + `<div class="ct"><svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="#1a9be0" aria-hidden="true">${P.drop.replace('<path ', '<path fill="#1a9be0" ')}</svg> Grafik Frekuensi Siram ${TT[cm]}</div>
  <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang frekuensi siram ${TT[cm].toLowerCase()}">${g}</svg>`
  + (full ? `<div class="sum"><div><b>${tot}</b>Total siram, ${MODES[cm]}</div><div><b>${top[0]}</b>Tersibuk (${top[1]}x)</div><div><b>${top[1]}</b>Siram pada periode tersibuk</div></div>
  <div class="note">Angka sebelum ${DB.start} adalah contoh. Hari minggu ini yang belum tiba juga memakai angka contoh. Data sejak tanggal itu tersimpan di browser ini.</div>` : '');
}

function dash() {
  return topbar('Dashboard Monitoring')
    + `<div class="sumrow">
      <div class="sumc s1"><span class="em big" aria-hidden="true">🚽</span><div><div class="lb">KOSONG</div><b>${pad(cnt('kosong'))}</b></div></div>
      <div class="sumc s2"><span class="em big" aria-hidden="true">🚻</span><div><div class="lb">DIPAKAI</div><b>${pad(cnt('dipakai'))}</b></div></div>
      <div class="sumc s3"><span class="em big" aria-hidden="true">⚠️</span><div><div class="lb">PERBAIKAN</div><b>${pad(cnt('cek'))}</b></div></div></div>
    <h2 class="sec">Status Bilik</h2><div class="rooms">${[1, 2, 3, 4].map(i => roomCard(i)).join('')}</div>
    <h2 class="sec">Laporan Sanitasi</h2><div class="chartbox">${chart(false)}</div>`;
}

const mon = () => topbar('Monitoring Bilik') + `<div class="rooms">${[1, 2, 3, 4].map(i => roomCard(i, true)).join('')}</div>`;

function detail() {
  const r = R[cur];
  let btn = '';
  if (r.call) btn = `<button class="dbtn" disabled>PETUGAS MENUJU BILIK…</button>`;
  else if (r.s === 'kosong') btn = can('siram') ? `<button class="dbtn" data-a="siram">SIRAM MANUAL <span class="em" aria-hidden="true">🔄</span></button>` : `<div class="deny">${DENY.siram}</div>`;
  else if (r.s === 'cek') btn = can('call') ? `<button class="dbtn" data-a="call">PANGGIL PETUGAS <span class="em" aria-hidden="true">🔄</span></button>` : `<div class="deny">${DENY.call}</div>`;
  const row = (k, v) => `<div class="drow"><span>${k}</span><span>= ${v}</span></div>`;
  return `<div class="dpage">
    <button class="dback" data-a="nav" data-v="dash">← Kembali</button>
    <h1 class="dtitle">INFORMASI DETAIL BILIK ${cur}</h1>
    <div class="dcard">
      <div class="dinfo">
        ${row('Penggunaan Terakhir', r.last + ' WIB')}
        ${row('Durasi Terakhir', durTxt(r))}
        ${row('Status Sensor', SENS[r.s])}
        ${row('Status Bilik', LBL[r.s])}
      </div>
      <div class="dact">${btn}</div>
    </div>
    <div class="dicons" aria-hidden="true"><span>${ic('drop', 20)}</span><span>${ic('shield', 20)}</span><span>${ic('wifi', 20)}</span></div>
  </div>`;
}

function riw() {
  const a = getLogins(), fmt = t => new Date(t).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  return topbar('Riwayat Masuk')
    + `<div class="sum"><div><b>${a.filter(x => x.ev === 'Masuk').length}</b>Total masuk</div><div><b>${new Set(a.map(x => x.name)).size}</b>Pengguna berbeda</div><div><b>${a[0] ? esc(a[0].name) : '-'}</b>Aktivitas terakhir</div></div>
    <h2 class="sec">Daftar aktivitas</h2><div class="panel tw">${a.length
      ? `<table><tr><th>Waktu</th><th>Nama</th><th>Jabatan</th><th>Aktivitas</th></tr>${a.slice(0, 100).map(x => `<tr><td>${fmt(x.t)}</td><td>${esc(x.name)}</td><td>${esc(x.role)}</td><td>${esc(x.ev)}</td></tr>`).join('')}</table>`
      : '<p style="margin:0;color:var(--mut)">Belum ada riwayat.</p>'}
    <div class="note">Tersimpan di browser ini. <button class="back" data-a="clrlog">Hapus semua riwayat masuk</button></div></div>`;
}

function lap() {
  const r = rec(rd), rows = r.log.filter(l => !flt || l[1] === 'Bilik ' + pad(flt)), days = Array.from({ length: 7 }, (_, i) => dkey(ago(i)));
  return topbar('Laporan Sanitasi')
    + `<div class="panel">${chart(true)}</div><h2 class="sec">Laporan per hari</h2>
    <div class="filter"><button data-a="rd" data-v="-1" aria-label="Hari sebelumnya">←</button><input type="date" id="rd" value="${rd}" max="${dkey(new Date())}" aria-label="Pilih tanggal"><button data-a="rd" data-v="1" aria-label="Hari berikutnya">→</button><button data-a="rd" data-v="0">Hari ini</button></div>
    <div class="sum four"><div><b>${r.tot}</b>Total siram</div><div><b>${r.siram}</b>Siram manual</div><div><b>${r.call}</b>Panggil petugas</div><div><b>${r.cek}</b>Perlu dicek</div></div>
    <h2 class="sec">Rincian aktivitas</h2>
    <div class="filter">${[0, 1, 2, 3, 4].map(n => `<button data-a="f" data-v="${n}" class="${flt === n ? 'on' : ''}">${n ? 'Bilik ' + pad(n) : 'Semua'}</button>`).join('')}</div>
    <div class="panel tw">${rows.length ? `<table><tr><th>Waktu</th><th>Bilik</th><th>Aktivitas</th></tr>${rows.slice(0, 60).map(l => `<tr><td>${l[0]}</td><td>${l[1]}</td><td>${esc(l[2])}</td></tr>`).join('')}</table>`
      : `<p style="margin:0;color:var(--mut)">${r.s ? 'Rincian log tidak tersedia, ini hanya data contoh.' : 'Belum ada aktivitas pada tanggal ini.'}</p>`}</div>
    <h2 class="sec">Rekap 7 hari terakhir</h2>
    <div class="panel tw"><table><tr><th>Tanggal</th><th>Total siram</th><th>Siram manual</th><th>Perlu dicek</th></tr>
    ${days.map(k => { const d = rec(k); return `<tr data-a="day" data-v="${k}" style="${k === rd ? 'font-weight:700' : ''}"><td>${k}${d.s ? ' *' : ''}</td><td>${d.tot}</td><td>${d.siram}</td><td>${d.cek}</td></tr>`; }).join('')}</table>
    <div class="note">* data contoh. Klik baris untuk melihat rincian hari itu.</div></div>
    ${can('reset') ? '<div class="note"><button class="back" data-a="reset">Hapus semua data tersimpan</button></div>' : ''}`;
}

function render(keep) {
  const y = window.scrollY;
  $('#root').innerHTML = view === 'detail' ? detail() : shell(view === 'mon' ? mon() : view === 'lap' ? lap() : view === 'riw' && can('riwayat') ? riw() : dash());
  dirty = false;
  window.scrollTo(0, keep ? y : 0);
}

/* ---------- modal & notifikasi ---------- */
function ask(title, text, ok, fn) {
  $('#mt').textContent = title; $('#mp').textContent = text;
  $('#mb').innerHTML = `<button class="mb" data-m="x">Batal</button><button class="mb pri" data-m="ok">${esc(ok)}</button>`;
  onOk = fn; $('#ov').classList.add('on'); $('#mb .pri').focus();
}
const closeModal = () => { $('#ov').classList.remove('on'); onOk = null; };
let tt;
function toast(msg, warn) {
  const t = $('#toast'); t.className = 'on' + (warn ? ' warn' : ''); t.innerHTML = `<span class="em" aria-hidden="true">${warn ? '⚠️' : '✅'}</span>` + esc(msg);
  clearTimeout(tt); tt = setTimeout(() => { t.className = ''; }, 3200);
}

/* ---------- simulasi ---------- */
function tick() {
  if (!sim || !user()) return;
  for (const i of [1, 2, 3, 4]) {
    const r = R[i], q = Math.random();
    if (r.call > 0) {
      if (--r.call === 0) { r.s = 'kosong'; r.dur = 0; log(i, 'Petugas selesai mengecek'); toast('Bilik ' + pad(i) + ' selesai dicek'); }
      dirty = true; continue;
    }
    if (r.s === 'dipakai') {
      r.dur++; dirty = true;
      if (q < .3) { r.s = 'kosong'; r.last = now(); addUse(); log(i, 'Selesai dipakai (' + r.dur + ' menit), siram otomatis'); }
    } else if (r.s === 'kosong') {
      if (q < .15) { r.s = 'dipakai'; r.dur = 1; r.last = now(); log(i, 'Mulai dipakai'); dirty = true; }
      else if (q > .97) { r.s = 'cek'; log(i, 'Sensor: perlu pemeriksaan', 'cek'); toast('Bilik ' + pad(i) + ' perlu dicek', true); dirty = true; }
    }
  }
  if (dirty && view !== 'lap' && user()) render(true);
}

/* ---------- event ---------- */
document.addEventListener('click', e => {
  const m = e.target.closest('[data-m]');
  if (m) { const f = m.dataset.m === 'ok' ? onOk : null; closeModal(); if (f) f(); return; }
  if (e.target.id === 'ov') { closeModal(); return; }
  const t = e.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a, v = t.dataset.v;
  if (a === 'nav') { if (v === 'riw' && !can('riwayat')) { toast(DENY.riwayat, true); return; } view = v; render(); }
  else if (a === 'room') { cur = +v; view = 'detail'; render(); }
  else if (a === 'cm') { cm = v; render(true); }
  else if (a === 'f') { flt = +v; render(true); }
  else if (a === 'day') { rd = v; render(true); }
  else if (a === 'rd') {
    if (+v === 0) rd = dkey(new Date());
    else { const d = new Date(rd + 'T12:00:00'); d.setDate(d.getDate() + +v); if (d <= new Date()) rd = dkey(d); }
    render(true);
  }
  else if (a === 'siram') {
    if (!can('siram')) { toast(DENY.siram, true); return; }
    const i = cur; ask('Konfirmasi Siram', 'Apakah Anda yakin ingin menyiram Bilik ' + pad(i) + ' secara manual?', 'Ya, Siram', () => {
      log(i, 'Siram manual oleh ' + who(), 'siram'); addUse(); toast('Bilik ' + pad(i) + ' berhasil disiram'); render(true);
    });
  }
  else if (a === 'call') {
    if (!can('call')) { toast(DENY.call, true); return; }
    const i = cur; ask('Konfirmasi Panggilan', 'Apakah Anda yakin ingin memanggil petugas kebersihan untuk Bilik ' + pad(i) + '?', 'Ya, Panggil', () => {
      R[i].call = 3; log(i, 'Petugas dipanggil oleh ' + who(), 'call'); toast('Petugas berhasil dipanggil'); render(true);
    });
  }
  else if (a === 'out') { addLogin('Keluar'); try { sessionStorage.removeItem(SK); localStorage.removeItem(SK); } catch (x) { /* abaikan */ } location.replace('login.html'); }
  else if (a === 'clrlog') { if (confirm('Hapus semua riwayat masuk?')) { try { localStorage.removeItem(LK); } catch (x) { /* abaikan */ } render(true); } }
  else if (a === 'reset') { if (!can('reset')) { toast(DENY.reset, true); return; } if (confirm('Hapus semua data tersimpan?')) { try { localStorage.removeItem(KEY);}catch(x){ /* abaikan */ } location.reload(); } }
});
document.addEventListener('change', e => { if (e.target.id === 'rd' && e.target.value) { rd = e.target.value; render(true); } });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

if (!user()) { location.replace('login.html'); }   // belum login -> kembali ke halaman login
else {
  loadDB(); render(); setInterval(tick, 4000);
  // jam real time di kanan atas (diperbarui tiap detik, tanpa merender ulang halaman)
  const clk = document.createElement('div'); clk.id = 'clk'; clk.className = 'clk'; clk.setAttribute('aria-label', 'Waktu sekarang'); document.body.appendChild(clk);
  const HR = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'], BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const upd = () => { const d = new Date(); clk.innerHTML = `<span>${HR[d.getDay()]}, ${d.getDate()} ${BL[d.getMonth()]} ${d.getFullYear()}</span><b>${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())} WIB</b>`; };
  upd(); setInterval(upd, 1000);
}
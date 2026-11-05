'use strict';

/* ========== FIREBASE SDK IMPORTS & CONFIG ========== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCFSuCFUXf0tuhCpUJQFdPu3Tn_kRxAnLc",
  authDomain: "amanage-app.firebaseapp.com",
  projectId: "amanage-app",
  storageBucket: "amanage-app.firebasestorage.app",
  messagingSenderId: "49538441202",
  appId: "1:49538441202:web:9af3883167ab006deb156b",
  measurementId: "G-Q8LR37R1Q4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Mengaktifkan Offline Persistence agar data langsung bisa disimpan offline & otomatis sync saat online
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

/* ========== HAPUS LOADER AWAL ========== */
function hideLoader() {
  const loader = $('#appLoader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => loader.remove(), 400);
  }
}

/* ========== KONSTANTA & TEMA ========== */
const K_LANG = 'amanage_lang', K_THEME = 'amanage_theme';
const LANGS = { id:{ name:'Bahasa Indonesia', loc:'id-ID', cur:'IDR' }, en:{ name:'English', loc:'en-US', cur:'USD' } };
let LANG = 'id';
try { const l = localStorage.getItem(K_LANG); if (LANGS[l]) LANG = l; } catch (e) {}
const LOC = () => LANGS[LANG].loc;

/* Inisialisasi Tema */
let currentTheme = 'light';
try {
  const savedTheme = localStorage.getItem(K_THEME);
  if (savedTheme) currentTheme = savedTheme;
} catch(e){}

function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(K_THEME, theme); } catch(e){}
  const icon = $('#themeIcon');
  if (icon) {
    icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
    icons();
  }
}

const PAIRS = [
['Beranda','Home'],['Dasbor','Dashboard'],['Transaksi','Transactions'],['Anggaran','Budget'],['Kurs Mata Uang','Currency Exchange'],['Laporan','Reports'],['Akun','Account'],['Profil Pengguna','User Profile'],['Pengaturan','Settings'],['Keluar','Logout'],
['Tambah Transaksi','Add Transaction'],['Mulai Investasi','Start Investing'],
['Kelola Uangmu Lebih Cerdas!','Manage Your Money Smarter!'],['Pantau pemasukan, kendalikan pengeluaran, dan capai tujuan keuanganmu.','Track your income, control your expenses, and achieve your financial goals.'],
['Pemasukan vs Pengeluaran','Income vs Expenses'],['Harian','Daily'],['Mingguan','Weekly'],['Bulanan','Monthly'],['Tahunan','Yearly'],
['Pengeluaran per Kategori','Expenses by Category'],['Saldo Bulanan','Monthly Balance'],['Transaksi Terbaru','Recent Transactions'],['Lihat semua','See all'],
['Semua jenis','All types'],['Semua kategori','All categories'],['Anggaran Bulanan','Monthly Budget'],['Simpan','Save'],['Anggaran per Kategori','Budget by Category'],['Riwayat Peringatan','Alert History'],
['Refresh kurs','Refresh rates'],['USD → IDR, 30 hari terakhir','USD → IDR, last 30 days'],['Konverter','Converter'],['Tukar','Swap'],
['Nama pengguna','Username'],['Bahasa aplikasi','App language'],['Mata uang utama','Main currency'],['Batas anggaran bulanan','Monthly budget limit'],
['Aktifkan notifikasi pengeluaran boros','Enable overspending notifications'],['Simpan pengaturan','Save settings'],['Reset data aplikasi','Reset app data'],
['Ubah Transaksi','Edit Transaction'],['Jenis','Type'],['Kategori','Category'],['Nama transaksi','Transaction name'],['Nominal','Amount'],['Mata uang','Currency'],['Tanggal','Date'],['Catatan','Note'],['Simpan transaksi','Save transaction'],
['Cari transaksi…','Search transactions…'],['Perkecil sidebar','Collapse sidebar'],['Notifikasi','Notifications'],['Dari tanggal','From date'],['Sampai tanggal','To date'],['Anggaran bulanan','Monthly budget'],['Jumlah','Amount'],['Tutup','Close'],['Ubah','Edit'],['Hapus','Delete'],
['Total Saldo','Total Balance'],['Total Pemasukan','Total Income'],['Total Pengeluaran','Total Expenses'],['Tabungan Bulanan','Monthly Savings'],['Total Tabungan','Total Savings'],['vs periode sebelumnya','vs previous period'],
['terpakai','used'],['Sisa','Left'],['Terpakai','Spent'],['dari','of'],['Kategori terbesar','Top category'],['Batas','Limit'],['Batas belum diatur','Limit not set'],
['Belum ada data','No data yet'],['Belum ada peringatan.','No alerts yet.'],['Hapus riwayat','Clear history'],['Pengeluaran Anda masih aman.','Your spending is still safe.'],
['Perhatian! Pengeluaran Anda mulai meningkat.','Heads up! Your spending is starting to rise.'],['Peringatan! Anggaran bulanan hampir habis.','Warning! Your monthly budget is almost used up.'],['Peringatan Boros! Anda telah melewati batas anggaran.','Overspending Alert! You have exceeded your budget limit.'],
['Belum ada transaksi. Tekan tombol tambah transaksi untuk mulai.','No transactions yet. Press the add transaction button to get started.'],['Tidak ada transaksi yang cocok dengan filter.','No transactions match the filters.'],
['Kurs tanggal','Rates as of'],['Sumber: Frankfurter (kurs harian, bukan real-time).','Source: Frankfurter (daily rates, not real-time).'],['Memakai kurs bawaan; belum ada data dari API.','Using default rates; no API data yet.'],
['Memuat kurs terbaru…','Loading latest rates…'],['Gagal mengambil kurs dari API. Menampilkan kurs tersimpan terakhir.','Failed to fetch rates from the API. Showing the last saved rates.'],['Perubahan 30 hari','30-day change'],
['Penyimpanan penuh atau diblokir browser','Storage is full or blocked by the browser'],['Transaksi dihapus','Transaction deleted'],['Nama transaksi wajib diisi','Transaction name is required'],['Nominal harus lebih dari 0','Amount must be greater than 0'],['Tanggal wajib diisi','Date is required'],
['Transaksi diperbarui','Transaction updated'],['Transaksi ditambahkan','Transaction added'],['Anggaran tidak valid','Invalid budget'],['Anggaran disimpan','Budget saved'],['Gagal memuat kurs','Failed to load rates'],
['Tidak ada data pada periode ini','No data for this period'],['Laporan CSV diunduh','CSV report downloaded'],['Batas anggaran tidak valid','Invalid budget limit'],['Pengaturan disimpan','Settings saved'],
['Hapus transaksi ini?','Delete this transaction?'],['Semua data akan dihapus permanen. Lanjutkan?','All data will be permanently deleted. Continue?'],['Keluar dari AMANAGE? Data tetap tersimpan di cloud.','Log out of AMANAGE? Your data stays in the cloud.'],
['Masuk','Login'],['Daftar','Register'],['Buat akun','Create account'],['Nama','Name'],['Kata sandi','Password'],['Ulangi kata sandi','Confirm password'],['Ingat saya','Remember me'],
['Email tidak valid','Invalid email address'],['Kata sandi minimal 6 karakter','Password must be at least 6 characters'],['Nama wajib diisi','Name is required'],['Konfirmasi kata sandi tidak sama','Passwords do not match'],
['Email sudah terdaftar','Email is already registered'],['Email atau kata sandi salah','Incorrect email or password'],['Akun berhasil dibuat','Account created'],['Anda telah keluar. Sampai jumpa!','You have been logged out. See you!'],
['Akun dan data disimpan di cloud secara aman.','Accounts and data are securely stored in the cloud.'],
['Gaji','Salary'],['Bisnis','Business'],['Investasi','Investment'],['Freelance','Freelance'],['Pemasukan Lain','Other Income'],['Makanan','Food'],['Transportasi','Transportation'],['Belanja','Shopping'],['Pendidikan','Education'],['Tagihan','Bills'],['Hiburan','Entertainment'],['Kesehatan','Health'],['Pengeluaran Lain','Other Expenses'],
['Rupiah Indonesia','Indonesian Rupiah'],['Dolar AS','US Dollar'],['Dolar Singapura','Singapore Dollar'],['Ringgit Malaysia','Malaysian Ringgit'],['Yen Jepang','Japanese Yen'],['Poundsterling Inggris','British Pound'],['Dolar Australia','Australian Dollar'],['Yuan Tiongkok','Chinese Yuan'],
['Cicilan / Utang','Debt'],['Dana Darurat','Emergency Fund'],['Berbagi / Zakat','Giving'],
['Tempat belanja','Where you shopped'],['Belum ditandai','Not tagged'],['UMKM / Usaha Lokal','Local MSME / Local Business'],['Korporasi Besar / Impor','Large Corporation / Imported'],
['UMKM / Lokal','MSME / Local'],['Korporasi / Impor','Corporate / Imported'],
['Penghasilan tidak tetap (freelance/harian)','Irregular income (freelance/daily)'],['Porsi berbagi dari surplus (%)','Sharing share of surplus (%)'],
['Skor Dampak Lokal','Local Impact Score'],['Kontribusi ekonomi lokal · SDG 8','Local economic contribution · SDG 8'],['Belanja lokal bulan ini','Local spending this month'],['Belanja korporasi/impor','Corporate/imported spending'],
['Luar biasa! Belanja Anda banyak mengalir ke UMKM dan ikut menggerakkan ekonomi serta pekerjaan layak di sekitar Anda.','Wonderful! Much of your spending flows to local MSMEs, helping power the economy and decent jobs around you.'],
['Bagus! Sebagian belanja sudah menopang usaha lokal. Coba naikkan porsinya sedikit demi sedikit.','Nice! Part of your spending already supports local businesses. Try raising the share step by step.'],
['Belanja Anda masih banyak ke korporasi besar/impor. Coba pilih satu kebutuhan rutin bulan ini dari UMKM terdekat.','Most of your spending still goes to large/imported brands. Try buying one regular need from a nearby MSME this month.'],
['Tandai pengeluaran Anda (UMKM/Lokal atau Korporasi/Impor) untuk melihat Skor Dampak Lokal bulan ini.','Tag your expenses (MSME/Local or Corporate/Imported) to see this month\'s Local Impact Score.'],
['Dana Darurat & Berbagi','Emergency Buffer & Sharing'],['Jaring pengaman sosial · SDG 10','Social safety net · SDG 10'],['Dana darurat','Emergency fund'],['Tabungan pribadi / lainnya','Personal savings / other'],
['Target: {0} bulan pengeluaran rutin','Target: {0} months of regular expenses'],['Catat','Record'],
['Belum ada data bulan sebelumnya. Catat pemasukan & pengeluaran minimal satu bulan agar saran alokasi muncul.','No data from previous months yet. Record income & expenses for at least one month to get allocation advice.'],
['Pendapatan bulan ini {0} melampaui rata-rata {1} sebesar {2}. Saran alokasi surplus:','This month\'s income {0} exceeds your average {1} by {2}. Suggested surplus allocation:'],
['Pendapatan bulan ini belum melampaui rata-rata ({0}). Tetap sisihkan sedikit: {1} (5%) ke dana darurat.','This month\'s income has not passed your average ({0}). Still set aside a little: {1} (5%) to the emergency fund.'],
['Belum ada pemasukan bulan ini.','No income recorded this month.'],
['Referensi: 2,5% dari pemasukan bulan ini = {0} (zakat penghasilan bila mencapai nisab). Konsultasikan ke lembaga zakat resmi.','Reference: 2.5% of this month\'s income = {0} (income zakat if above nisab). Consult an official zakat institution.'],
['Sudah dibagikan bulan ini: {0}','Already shared this month: {0}'],
['Sistem peringatan dini utang & konsumsi','Early warning for debt & spending'],['Aman','Safe'],['Waspada','Caution'],['Bahaya','Danger'],
['Cicilan/utang vs pendapatan','Debt payments vs income'],['Konsumtif vs pendapatan','Consumptive vs income'],['{0}% (batas aman {1}%)','{0}% (safe limit {1}%)'],
['Belum ada pemasukan tercatat bulan ini; rasio dihitung dari rata-rata pendapatan bila ada.','No income recorded this month; ratios use your average income when available.'],
['Cicilan/utang menyerap {0}% pendapatan (batas aman ±{1}%, sekitar {2}). Hentikan utang baru dan prioritaskan melunasi yang bunganya tertinggi.','Debt payments take {0}% of income (safe limit ±{1}%, about {2}). Stop new debt and pay off the highest-interest one first.'],
['Jangan tutup cicilan dengan utang baru. Pastikan pinjaman berizin OJK (kontak OJK 157).','Do not cover installments with new debt. Make sure lenders are OJK-licensed (OJK contact 157).'],
['Belanja konsumtif (Belanja + Hiburan) {0}% pendapatan. Turunkan ke ≤{1}%: kurangi sekitar {2} bulan ini.','Consumptive spending (Shopping + Entertainment) is {0}% of income. Bring it to ≤{1}%: cut about {2} this month.'],
['Terapkan aturan tunggu 48 jam untuk pembelian non-esensial.','Use a 48-hour waiting rule for non-essential purchases.'],['Tinjau dan hentikan langganan yang jarang dipakai.','Review and cancel rarely used subscriptions.'],
['Rasio utang dan belanja konsumtif masih sehat. Pertahankan!','Debt and consumptive ratios are healthy. Keep it up!'],
['{0}: rasio utang/konsumsi melewati batas aman. Lihat rekomendasi di kartu Debt Guard.','{0}: debt/spending ratio is above the safe limit. See the Debt Guard card for recommendations.']
];
const DICT = Object.create(null);
PAIRS.forEach(p => p.forEach(x => { if (!(x in DICT)) DICT[x] = p; }));
const tr = x => { const p = DICT[x]; return p ? p[LANG === 'id' ? 0 : 1] : x; };
const trf = (k, ...a) => tr(k).replace(/\{(\d)\}/g, (_, i) => a[i]);

const CUR = { IDR:'Indonesian Rupiah', USD:'US Dollar', EUR:'Euro', SGD:'Singapore Dollar', MYR:'Malaysian Ringgit', JPY:'Japanese Yen', GBP:'British Pound', AUD:'Australian Dollar', CNY:'Chinese Yuan' };
const CATS = {
  income: ['Salary','Business','Investment','Freelance','Other Income'],
  expense: ['Food','Transportation','Shopping','Education','Bills','Entertainment','Health','Debt','Emergency Fund','Giving','Other Expenses']
};
const CAT_ICONS = {
  Salary: 'briefcase', Business: 'store', Investment: 'trending-up', Freelance: 'laptop', 'Other Income': 'plus-circle',
  Food: 'utensils', Transportation: 'car', Shopping: 'shopping-bag', Education: 'graduation-cap', Bills: 'receipt',
  Entertainment: 'film', Health: 'heart-pulse', Debt: 'credit-card', 'Emergency Fund': 'shield', Giving: 'gift', 'Other Expenses': 'more-horizontal'
};

const NAV = [
  ['dashboard','Dashboard','layout-dashboard'],
  ['transactions','Transactions','arrow-left-right'],
  ['budget','Budget','wallet'],
  ['currency','Currency Exchange','banknote'],
  ['reports','Reports','bar-chart-3'],
  ['account','Account','user'],
  ['settings','Settings','settings']
];

const MSG = ['','Perhatian! Pengeluaran Anda mulai meningkat.','Peringatan! Anggaran bulanan hampir habis.','Peringatan Boros! Anda telah melewati batas anggaran.'];
const PALETTE = ['#3b6cff','#34d399','#fbbf24','#f87171','#a78bfa','#22d3ee','#fb923c','#94a3b8','#e879f9','#facc15','#4ade80'];
const FALLBACK_RATES = { USD:1, IDR:16300, EUR:0.92, SGD:1.35, MYR:4.5, JPY:150, GBP:0.79, AUD:1.52, CNY:7.2 };

/* ========== UTIL ========== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const pct = (a, b) => b ? ((a - b) / Math.abs(b)) * 100 : (a ? 100 : 0);
const short = v => new Intl.NumberFormat('en', { notation:'compact' }).format(v);
const colorFor = p => p >= 100 ? '#ef4444' : p >= 90 ? '#fb923c' : p >= 70 ? '#fbbf24' : '#3b6cff';
const icons = () => window.lucide && lucide.createIcons();
function fmt(v, c = S.settings.cur) {
  return new Intl.NumberFormat(c === 'IDR' ? 'id-ID' : LOC(), { style:'currency', currency:c, maximumFractionDigits: ['IDR','JPY'].includes(c) ? 0 : 2 }).format(v);
}
function toast(m, t = 'ok') {
  const e = document.createElement('div');
  e.className = 'toast ' + t; e.textContent = tr(m);
  $('#toasts').append(e); setTimeout(() => e.remove(), 3800);
}

/* ========== STATE & FIRESTORE STORAGE ========== */
const DEF = { tx:[], settings:{ name:'Alex', cur:'IDR', budget:5000000, alerts:true, irregular:false, give:30 }, rates:FALLBACK_RATES, ratesDate:'', hist:[], catBudget:{}, alertLog:[], alertKey:'' };
let S = null, USER = null;
let chartTargetCur = 'IDR';

async function load() {
  try {
    const docRef = doc(db, "users", USER.id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const d = docSnap.data();
      return { ...structuredClone(DEF), ...d, settings:{ ...DEF.settings, ...d.settings }, rates:{ ...FALLBACK_RATES, ...d.rates } };
    }
  } catch (e) {
    console.error("Gagal memuat dari cloud:", e);
  }
  return { ...structuredClone(DEF), settings:{ ...DEF.settings, name: USER.name, cur: LANGS[LANG].cur } };
}

async function save() {
  if (!USER) return;
  try {
    await setDoc(doc(db, "users", USER.id), S, { merge: true });
  } catch (e) {
    toast('Gagal menyimpan ke cloud database', 'err');
  }
}

/* ========== PERHITUNGAN ========== */
const conv = (a, from, to = S.settings.cur) => a / S.rates[from] * S.rates[to];
const sum = (type, from, to) => S.tx.filter(t => t.type === type && t.date >= from && t.date <= to).reduce((s, t) => s + conv(t.amount, t.cur), 0);
const net = to => sum('income', '0000', to) - sum('expense', '0000', to);
const mr = o => { const n = new Date(); return { from: iso(new Date(n.getFullYear(), n.getMonth() + o, 1)), to: iso(new Date(n.getFullYear(), n.getMonth() + o + 1, 0)) }; };
function catTotals(from, to) {
  const o = {};
  S.tx.filter(t => t.type === 'expense' && t.date >= from && t.date <= to).forEach(t => o[t.category] = (o[t.category] || 0) + conv(t.amount, t.cur));
  return o;
}
function buckets(p) {
  const n = new Date(), out = [], count = p === 'daily' ? 6 : p === 'weekly' ? 7 : p === 'monthly' ? 5 : 4;
  for (let i = count; i >= 0; i--) {
    let a, b, l;
    if (p === 'daily' || p === 'weekly') {
      const span = p === 'daily' ? 1 : 7;
      b = new Date(n); b.setDate(n.getDate() - i * span);
      a = new Date(b); a.setDate(b.getDate() - span + 1);
      l = iso(b).slice(5);
    } else if (p === 'monthly') {
      a = new Date(n.getFullYear(), n.getMonth() - i, 1); b = new Date(n.getFullYear(), n.getMonth() - i + 1, 0);
      l = a.toLocaleString(LOC(), { month:'short' });
    } else {
      a = new Date(n.getFullYear() - i, 0, 1); b = new Date(n.getFullYear() - i, 11, 31); l = String(a.getFullYear());
    }
    out.push({ l, from: iso(a), to: iso(b) });
  }
  return out;
}

/* ========== SMART SPENDING ALERT ========== */
function level() {
  const m = mr(0), spent = sum('expense', m.from, m.to) - catSum(['Emergency Fund'], m.from, m.to), b = S.settings.budget, p = b ? spent / b * 100 : 0;
  return { spent, p, l: p >= 100 ? 3 : p >= 90 ? 2 : p >= 70 ? 1 : 0, b };
}
function checkAlert() {
  const { l } = level(), k = mr(0).from + ':' + l;
  if (k === S.alertKey) return;
  S.alertKey = k;
  if (l && S.settings.alerts) {
    S.alertLog.unshift({ t: new Date().toISOString(), l, m: MSG[l] });
    S.alertLog = S.alertLog.slice(0, 30);
    toast(MSG[l], l > 1 ? 'err' : 'warn');
  }
  save();
}
function alertHTML() {
  const { spent, p, l, b } = level(), col = colorFor(p);
  const m = mr(0), top = Object.entries(catTotals(m.from, m.to)).sort((a, b) => b[1] - a[1])[0];
  return `<h3 class="mb-2">Smart Spending Alert</h3>
    <p class="text-sm mb-3" style="color:${l ? col : 'var(--ok)'}">${tr(MSG[l] || 'Pengeluaran Anda masih aman.')}</p>
    <div class="bar" style="--c:${col}"><i style="width:${Math.min(p, 100)}%"></i></div>
    <div class="flex justify-between text-sm mt-3"><span>${p.toFixed(0)}% ${tr('terpakai')}</span><span>${tr('Sisa')} ${fmt(Math.max(b - spent, 0))}</span></div>
    <p class="mut text-xs mt-2">${tr('Terpakai')} ${fmt(spent)} ${tr('dari')} ${fmt(b)}</p>
    <p class="mut text-xs mt-1">${tr('Kategori terbesar')}: ${top ? esc(tr(top[0])) + ' (' + fmt(top[1]) + ')' : '-'}</p>`;
}
function logHTML() {
  if (!S.alertLog.length) return `<p class="empty">${tr('Belum ada peringatan.')}</p>`;
  return S.alertLog.map(a => `<div class="row"><span class="dotc ${a.l > 1 ? 'r' : ''}" style="${a.l === 1 ? 'background:#fef3c7;color:#92400e' : ''}"><i data-lucide="bell"></i></span><div class="flex-1"><p class="text-sm">${tr(a.m)}</p><p class="mut text-xs">${new Date(a.t).toLocaleString(LOC())}</p></div></div>`).join('');
}
function renderBell() {
  $('#dot').classList.toggle('hidden', level().l === 0 && risk().l === 0);
  $('#bellPanel').innerHTML = `<div class="flex justify-between items-center mb-2"><h3>${tr('Notifikasi')}</h3><button class="link" id="clearLog">${tr('Hapus riwayat')}</button></div><div class="max-h-72 overflow-auto">${logHTML()}</div>`;
  $('#clearLog').onclick = () => { S.alertLog = []; save(); refresh(); };
}

/* ========== CHART ========== */
const charts = {};
const chart = (id, cfg) => { const el = document.getElementById(id); if (!el) return; charts[id]?.destroy(); charts[id] = new Chart(el, cfg); };
const opt = (x = {}) => ({ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ labels:{ boxWidth:10 } } }, scales:{ x:{ grid:{ display:false } }, y:{ grid:{ color:'rgba(0,0,0,.06)' }, ticks:{ callback:short } } }, ...x });
function drawBar(id, bk) {
  chart(id, { type:'bar', data:{ labels: bk.map(b => b.l), datasets:[
    { label:tr('Income'), data: bk.map(b => sum('income', b.from, b.to)), backgroundColor:'#3b6cff', borderRadius:4 },
    { label:tr('Expenses'), data: bk.map(b => sum('expense', b.from, b.to)), backgroundColor:'#f87171', borderRadius:4 } ] }, options: opt() });
}
function drawCat(id, from, to) {
  const e = Object.entries(catTotals(from, to)), has = e.length > 0;
  chart(id, { type:'doughnut', data:{ labels: has ? e.map(x => tr(x[0])) : [tr('Belum ada data')], datasets:[{ data: has ? e.map(x => x[1]) : [1], backgroundColor: has ? PALETTE : ['#ccc'], borderWidth:2, borderColor:'#000' }] },
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10 } }, tooltip:{ enabled: has } } } });
}

/* ========== RENDER HALAMAN ========== */
const F = { q:'', type:'all', cat:'all', date:'' };
let page = 'dashboard', sec = 'dashboard';
let pageHistory = [];

function renderStats() {
  const m = mr(0), p = mr(-1);
  const inc = sum('income', m.from, m.to), pi = sum('income', p.from, p.to), ex = sum('expense', m.from, m.to), pe = sum('expense', p.from, p.to);
  const bal = net('9999'), pb = net(p.to);
  const items = [['Total Balance', bal, pct(bal, pb), 'wallet', '#3b6cff', 1], ['Total Income', inc, pct(inc, pi), 'trending-up', '#34d399', 1],
    ['Total Expenses', ex, pct(ex, pe), 'trending-down', '#f87171', -1], ['Monthly Savings', inc - ex, pct(inc - ex, pi - pe), 'piggy-bank', '#a78bfa', 1]];
  $('#stats').innerHTML = items.map(([t, v, ch, ic, col, dir]) => `<div class="card stat" style="--c:${col}">
    <div class="flex justify-between items-center mb-3"><span class="sic"><i data-lucide="${ic}"></i></span>
    <span class="chip ${ch * dir >= 0 ? 'up' : 'down'}"><i data-lucide="${ch >= 0 ? 'arrow-up-right' : 'arrow-down-right'}"></i>${Math.abs(ch).toFixed(1)}%</span></div>
    <p class="mut text-sm">${tr(t)}</p><p class="big">${fmt(v)}</p></div>`).join('');
}
function txRow(t, actions) {
  const inc = t.type === 'income';
  return `<div class="row"><span class="dotc ${inc ? 'g' : 'r'}"><i data-lucide="${inc ? 'arrow-down-left' : 'arrow-up-right'}"></i></span>
    <div class="flex-1 min-w-[130px]"><p class="font-bold">${esc(t.title)}</p><p class="mut text-xs">${esc(tr(t.category))} · ${t.date}${t.note ? ' · ' + esc(t.note) : ''}</p></div>
    <span class="tag ${inc ? 'g' : 'r'}">${tr(inc ? 'Income' : 'Expense')}</span>${t.origin ? `<span class="tag ${t.origin === 'local' ? 'g' : 'b'}">${tr(t.origin === 'local' ? 'UMKM / Lokal' : 'Korporasi / Impor')}</span>` : ''}
    <div class="text-right"><p class="${inc ? 'gt' : 'rt'} font-bold">${inc ? '+' : '-'}${fmt(t.amount, t.cur)}</p>${t.cur !== S.settings.cur ? `<p class="mut text-xs">≈ ${fmt(conv(t.amount, t.cur))}</p>` : ''}</div>
    ${actions ? `<div class="flex gap-1"><button class="icb sm" data-e="${t.id}" aria-label="${tr('Edit')}"><i data-lucide="pencil"></i></button><button class="icb sm" data-d="${t.id}" aria-label="${tr('Hapus')}"><i data-lucide="trash-2"></i></button></div>` : ''}</div>`;
}
const sorted = () => [...S.tx].sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

function renderDashNav() {
  const box = $('#dashNavBox');
  if (!box) return;
  const items = [
    ['add_transaction', 'Tambah Transaksi', 'plus-circle'],
    ['start_invest', 'Mulai Investasi', 'trending-up'],
    ...NAV.filter(n => !['dashboard', 'account', 'settings'].includes(n[0]))
  ];
  box.innerHTML = items.map(([id, label, ic]) => `
    <button class="dash-nav-btn ${page === id ? 'on' : ''}" data-p="${id}">
      <span class="ic"><i data-lucide="${ic}"></i></span>
      <span class="lbl">${tr(label)}</span>
    </button>
  `).join('');

  $$('.dash-nav-btn').forEach(b => {
    b.onclick = () => {
      if (b.dataset.p === 'add_transaction') {
        openModal();
      } else if (b.dataset.p === 'start_invest') {
        window.open('https://bibit.id/', '_blank');
      } else {
        go(b.dataset.p);
      }
    };
  });
}

function renderDashboard() {
  renderDashNav();
  renderStats();
  $('#impactCard').innerHTML = impactHTML(); 
  $('#safetyCard').innerHTML = safetyHTML(); 
  $('#debtCard').innerHTML = debtHTML(); 
  applyRisk();
  
  const bk = buckets('monthly');
  chart('cBal', { type:'line', data:{ labels: bk.map(b => b.l), datasets:[{ data: bk.map(b => net(b.to)), borderColor:'#3b6cff', backgroundColor:'rgba(59,108,255,.2)', fill:true, tension:.2, pointRadius:4, borderWidth:3 }] }, options: opt({ plugins:{ legend:{ display:false } } }) });
}
function renderTx() {
  $('#txTitle').textContent = tr('Transactions');
  $('#fType').value = F.type;
  const cats = ['all', ...CATS.income, ...CATS.expense];
  $('#fCat').innerHTML = cats.map(c => `<option value="${c}">${c === 'all' ? tr('Semua kategori') : tr(c)}</option>`).join('');
  $('#fCat').value = F.cat; $('#fDate').value = F.date;
  const list = sorted().filter(t => (F.type === 'all' || t.type === F.type) && (F.cat === 'all' || t.category === F.cat) && (!F.date || t.date === F.date)
    && (!F.q || (t.title + t.category + tr(t.category) + t.note).toLowerCase().includes(F.q)));
  $('#txList').innerHTML = list.length ? list.map(t => txRow(t, true)).join('') : `<p class="empty">${tr('Tidak ada transaksi yang cocok dengan filter.')}</p>`;
}
function renderBudget() {
  $('#bMonthly').value = S.settings.budget;
  $('#bSummary').innerHTML = alertHTML();
  const m = mr(0), by = catTotals(m.from, m.to);
  $('#bCats').innerHTML = CATS.expense.map(c => {
    const lim = S.catBudget[c] || 0, sp = by[c] || 0, p = lim ? sp / lim * 100 : 0;
    return `<div class="mb-4"><div class="flex justify-between items-center gap-2 text-sm mb-1"><span>${tr(c)}</span><span class="mut">${fmt(sp)} / <input data-cb="${c}" type="number" min="0" value="${lim || ''}" placeholder="${tr('Batas')}" class="in mini-in"></span></div>
      <div class="bar" style="--c:${colorFor(p)}"><i style="width:${Math.min(p, 100)}%"></i></div>
      <p class="text-xs mut mt-1">${lim ? `${tr('Sisa')} ${fmt(Math.max(lim - sp, 0))} · ${p.toFixed(0)}% ${tr('terpakai')}` : tr('Batas belum diatur')}</p></div>`;
  }).join('');
  $('#bLog').innerHTML = logHTML();
}
function renderFx() {
  const r = S.rates, ch = S.hist.length > 1 ? pct(S.hist.at(-1).v, S.hist[0].v) : 0;
  $('#fxMeta').textContent = S.ratesDate ? `${tr('Kurs tanggal')} ${S.ratesDate}. ${tr('Sumber: Frankfurter (kurs harian, bukan real-time).')}` : tr('Memakai kurs bawaan; belum ada data dari API.');
  $('#fxCards').innerHTML = [
    ...[['1 USD', r.IDR], ['10 USD', r.IDR * 10], ['100 USD', r.IDR * 100]].map(([a, v]) => `<div class="card"><p class="mut text-sm">${a}</p><p class="big">${fmt(v, 'IDR')}</p></div>`),
    `<div class="card"><p class="mut text-sm">${tr('Perubahan 30 hari')}</p><p class="big ${ch >= 0 ? 'gt' : 'rt'}">${ch >= 0 ? '+' : ''}${ch.toFixed(2)}%</p></div>`
  ].join('');

  $('#chartTitle').textContent = `USD → ${chartTargetCur}, 30 hari terakhir`;
  if ($('#chartCur')) $('#chartCur').value = chartTargetCur;

  if (S.hist.length) chart('cFx', { type:'line', data:{ labels: S.hist.map(h => h.d.slice(5)), datasets:[{ data: S.hist.map(h => h.v), borderColor:'#3b6cff', backgroundColor:'rgba(59,108,255,.15)', fill:true, tension:.2, pointRadius:0, borderWidth:2 }] },
    options: opt({ plugins:{ legend:{ display:false } }, scales:{ x:{ grid:{ display:false } }, y:{ grid:{ color:'rgba(0,0,0,.06)' } } } }) });
  convert();
}
function convert() {
  const a = parseFloat($('#cvAmt').value) || 0, f = $('#cvFrom').value, t = $('#cvTo').value;
  $('#cvOut').textContent = fmt(conv(a, f, t), t);
  $('#cvRate').textContent = `1 ${f} = ${conv(1, f, t).toLocaleString('en', { maximumFractionDigits: 6 })} ${t}`;
}
function renderReports() {
  const bk = buckets($('#rPeriod').value), c = bk.at(-1), pv = bk.at(-2);
  const inc = sum('income', c.from, c.to), ex = sum('expense', c.from, c.to), pi = sum('income', pv.from, pv.to), pe = sum('expense', pv.from, pv.to);
  $('#rStats').innerHTML = [['Total Income', inc, pct(inc, pi), 1], ['Total Expenses', ex, pct(ex, pe), -1], ['Total Savings', inc - ex, pct(inc - ex, pi - pe), 1]]
    .map(([t, v, ch, d]) => `<div class="card"><p class="mut text-sm">${tr(t)}</p><p class="big">${fmt(v)}</p><p class="text-xs ${ch * d >= 0 ? 'gt' : 'rt'}">${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% ${tr('vs periode sebelumnya')}</p></div>`).join('');
  drawBar('rBar', bk); drawCat('rCat', c.from, c.to);
}
function renderAccount() {
  if (!USER) return;
  const name = S.settings.name || USER.name;
  $('#accName').textContent = name;
  $('#accEmail').textContent = USER.email;
  const a = $('#accAvatar');
  a.textContent = name.charAt(0).toUpperCase();
  
  $('#accLogoutBtn').onclick = () => {
    if (confirm(tr('Keluar dari AMANAGE? Data tetap tersimpan di cloud.'))) logout();
  };
}
function renderSettings() {
  const s = S.settings;
  $('#sLang').value = LANG; $('#sIrr').checked = !!s.irregular; $('#sGive').value = s.give; $('#sName').value = s.name || USER.name; $('#sCur').value = s.cur; $('#sBudget').value = s.budget; $('#sAlerts').checked = s.alerts;
}
function renderAvatar() {
  const a = $('#avatar'), s = S.settings, name = s.name || USER?.name || 'A';
  a.textContent = name.charAt(0).toUpperCase();
}
function render(s = sec) {
  ({ 
    dashboard: renderDashboard, 
    transactions: renderTx, 
    budget: renderBudget, 
    currency: renderFx, 
    reports: renderReports, 
    account: renderAccount,
    settings: renderSettings 
  })[s]();
  icons();
}
function refresh() { checkAlert(); renderBell(); renderAvatar(); render(); icons(); }

/* ========== NAVIGASI ========== */
function go(p, isBack = false) {
  if (p === 'logout') {
    if (confirm(tr('Keluar dari AMANAGE? Data tetap tersimpan di cloud.'))) logout(); return;
  }
  
  if (!isBack && page !== p) {
    pageHistory.push(page);
  }

  if (p === 'transactions') F.type = 'all';
  page = p; sec = p;
  $$('.page').forEach(e => e.classList.toggle('on', e.id === 'p-' + sec));
  $$('.nav-b').forEach(b => b.classList.toggle('on', b.dataset.p === p));
  $('#crumb').textContent = tr(NAV.find(n => n[0] === p)?.[1] || 'Account');
  $('#sidebar').classList.remove('open');
  
  const backBtn = $('#backBtn');
  if (backBtn) {
    backBtn.classList.toggle('hidden', pageHistory.length === 0 || p === 'dashboard');
  }

  render(sec);
}

/* ========== MODAL TRANSAKSI & KELIPATAN NOMINAL DINAMIS ========== */
function updateQuickAmounts(cur) {
  const isK = ['IDR', 'KRW', 'JPY', 'VND'].includes(cur);
  const mul = isK ? 1000 : 1;
  const unit = isK ? ' rb' : '';

  $$('#quickAmounts .chip-amt').forEach(b => {
    const base = parseFloat(b.dataset.base);
    const calcVal = base * mul;
    b.dataset.val = calcVal;
    b.textContent = base + unit;
  });
}

function fillCats(sel) {
  const type = $('#m-type').value;
  const cats = CATS[type];
  const grid = $('#m-catGrid');
  grid.innerHTML = cats.map(c => `
    <button type="button" class="cat-card ${c === (sel || cats[0]) ? 'on' : ''}" data-cat="${c}">
      <i data-lucide="${CAT_ICONS[c] || 'folder'}"></i>
      <span>${tr(c)}</span>
    </button>
  `).join('');
  
  $$('.cat-card').forEach(b => {
    b.onclick = () => {
      $$('.cat-card').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      $('#m-cat').value = b.dataset.cat;
      
      const currentTitle = $('#m-title').value.trim();
      const allTranslatedCats = Object.keys(CAT_ICONS).map(c => tr(c));
      
      if (!currentTitle || allTranslatedCats.includes(currentTitle)) {
        $('#m-title').value = tr(b.dataset.cat);
      }
      toggleOrigin();
    };
  });
  
  const active = grid.querySelector('.cat-card.on') || grid.querySelector('.cat-card');
  if (active) {
    $('#m-cat').value = active.dataset.cat;
    if (!$('#m-title').value.trim()) {
      $('#m-title').value = tr(active.dataset.cat);
    }
    toggleOrigin();
  }
  icons();
}

function openModal(id, pre) {
  const t = S.tx.find(x => x.id === id) || { type: 'expense', date: iso(new Date()), cur: S.settings.cur, ...pre };
  $('#m-id').value = t.id || '';
  
  const type = t.type || 'expense';
  $('#m-type').value = type;
  $$('#mTypeSeg button').forEach(b => b.classList.toggle('on', b.dataset.val === type));
  
  fillCats(t.category);
  $('#m-title').value = t.title || '';
  $('#m-date').value = t.date;
  updateDateDisplay(t.date);
  $('#m-amount').value = t.amount || '';
  
  const cur = t.cur || S.settings.cur;
  $('#m-cur').value = cur;
  $('#mCurrencySymbol').textContent = cur === 'IDR' ? 'Rp' : cur === 'USD' ? '$' : cur;
  
  updateQuickAmounts(cur);

  $('#m-origin').value = t.origin || '';
  toggleOrigin();

  const isInc = type === 'income';
  const isEmg = t.category === 'Emergency Fund';
  $('#mTitle').textContent = tr(id ? 'Edit Transaction' : (isEmg ? 'Tambah Dana Darurat' : (isInc ? 'Catat pemasukan' : 'Catat pengeluaran')));
  $('#mSubtitle').textContent = tr('Tiga ketukan, selesai.');
  $('#mSubmitBtn').textContent = tr(isEmg ? '✓ Simpan dana darurat' : (isInc ? '✓ Simpan pemasukan' : '✓ Simpan pengeluaran'));

  $('#modal').classList.add('show');
  $('#m-amount').focus();
  icons();
}

const closeModal = () => $('#modal').classList.remove('show');

function updateDateDisplay(dateStr) {
  const d = new Date(dateStr);
  const today = iso(new Date());
  const disp = dateStr === today ? 'Hari ini · ' + d.toLocaleDateString(LOC(), { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : d.toLocaleDateString(LOC(), { weekday:'short', day:'numeric', month:'short', year:'numeric' });
  $('#mDateDisplay').textContent = disp;
}

/* ========== KURS DARI API & CHART HISTORIS ========== */
async function fetchChartHistory(targetCur) {
  chartTargetCur = targetCur;
  try {
    const from = iso(new Date(Date.now() - 30 * 864e5));
    const r = await fetch(`https://api.frankfurter.dev/v1/${from}..?base=USD&symbols=${targetCur}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const j = await r.json();
    if (S) {
      S.hist = Object.entries(j.rates).map(([d, v]) => ({ d, v: v[targetCur] }));
      renderFx();
    }
  } catch (e) {
    console.error("Gagal memuat histori chart", e);
  }
}

async function fetchRates() {
  const btn = $('#fxRefresh'); if (btn) btn.disabled = true;
  $('#fxMeta').textContent = tr('Memuat kurs terbaru…'); $('#fxErr').textContent = '';
  try {
    const sy = Object.keys(CUR).filter(c => c !== 'USD').join(',');
    const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=USD&symbols=${sy}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    if (!S) { if (btn) btn.disabled = false; return; }
    S.rates = { ...S.rates, USD:1, ...d.rates }; S.ratesDate = d.date;
    await fetchChartHistory(chartTargetCur);
    save();
  } catch (e) {
    $('#fxErr').textContent = tr('Gagal mengambil kurs dari API. Menampilkan kurs tersimpan terakhir.');
    toast('Gagal memuat kurs', 'err');
  }
  if (btn) btn.disabled = false; if (S) refresh();
}

/* ========== DAMPAK LOKAL, JARING PENGAMAN & DEBT GUARD ========== */
const CONS = ['Shopping', 'Entertainment'], NONCONS = ['Emergency Fund', 'Giving'];
const LIM = { debtWarn:30, debtBad:40, consWarn:35, consBad:50 };
const catSum = (cats, from, to) => S.tx.filter(t => t.type === 'expense' && cats.includes(t.category) && t.date >= from && t.date <= to).reduce((s, t) => s + conv(t.amount, t.cur), 0);
const avgIncome = () => { const v = [-1, -2, -3].map(o => mr(o)).map(r => sum('income', r.from, r.to)).filter(x => x > 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
function toggleOrigin() {
  const show = $('#m-type').value === 'expense' && !['Debt', 'Emergency Fund', 'Giving'].includes($('#m-cat').value);
  $('#m-originW').classList.toggle('gone', !show);
}

function impact() {
  const m = mr(0), q = o => S.tx.filter(t => t.type === 'expense' && t.origin === o && t.date >= m.from && t.date <= m.to).reduce((s, t) => s + conv(t.amount, t.cur), 0);
  const loc = q('local'), big = q('big'), tot = loc + big;
  return { loc, big, tot, rate: tot ? loc / tot * 100 : null };
}
function impactHTML() {
  const i = impact(), head = `<h3>${tr('Skor Dampak Lokal')}</h3><p class="mut text-xs mb-3">${tr('Kontribusi ekonomi lokal · SDG 8')}</p>`;
  if (i.rate === null) return head + `<p class="mut text-sm">${tr('Tandai pengeluaran Anda (UMKM/Lokal atau Korporasi/Impor) untuk melihat Skor Dampak Lokal bulan ini.')}</p>`;
  const tier = i.rate >= 60 ? 2 : i.rate >= 30 ? 1 : 0, col = ['#fbbf24', '#3b6cff', '#34d399'][tier];
  const msg = ['Belanja Anda masih banyak ke korporasi besar/impor. Coba pilih satu kebutuhan rutin bulan ini dari UMKM terdekat.', 'Bagus! Sebagian belanja sudah menopang usaha lokal. Coba naikkan porsinya sedikit demi sedikit.', 'Luar biasa! Belanja Anda banyak mengalir ke UMKM dan ikut menggerakkan ekonomi serta pekerjaan layak di sekitar Anda.'][tier];
  return head + `<div class="flex items-center gap-4"><div class="ring" style="--p:${i.rate.toFixed(0)};--c:${col}"><b>${i.rate.toFixed(0)}%</b></div>
    <div class="text-sm flex-1"><p class="flex items-center gap-1 font-bold" style="color:${col}">${tier === 2 ? '<i data-lucide="leaf" class="w-4 h-4"></i>' : ''}${tr(msg)}</p></div></div>
    <div class="flex justify-between text-xs mt-3"><span class="gt">${tr('Belanja lokal bulan ini')}: ${fmt(i.loc)}</span><span class="mut">${tr('Belanja korporasi/impor')}: ${fmt(i.big)}</span></div>`;
}

function safety() {
  const m = mr(0), cur = sum('income', m.from, m.to), avg = avgIncome(), irr = !!S.settings.irregular;
  const hist = [-1, -2, -3].map(o => mr(o)).map(r => ({ i: sum('income', r.from, r.to), e: sum('expense', r.from, r.to) - catSum(NONCONS, r.from, r.to) })).filter(x => x.i > 0);
  const avgExp = hist.length ? hist.reduce((a, x) => a + x.e, 0) / hist.length : sum('expense', m.from, m.to) - catSum(NONCONS, m.from, m.to);
  const months = irr ? 6 : 3, target = avgExp * months;
  const buffer = S.tx.filter(t => t.category === 'Emergency Fund').reduce((s, t) => s + conv(t.amount, t.cur), 0);
  const gap = Math.max(target - buffer, 0), given = catSum(['Giving'], m.from, m.to);
  const surplus = avg === null ? 0 : Math.max(cur - avg, 0);
  const toBuf = Math.min(gap, surplus * (irr ? .7 : .5)), rest = surplus - toBuf, share = rest * (S.settings.give / 100);
  return { cur, avg, months, target, buffer, given, surplus, toBuf, share, personal: rest - share };
}
function safetyHTML() {
  const d = safety(), row = (l, v, cat) => `<div class="flex justify-between items-center gap-2 text-sm py-1"><span>${tr(l)}</span><span class="flex items-center gap-2"><b>${fmt(v)}</b>${cat && v > 0 ? `<button class="link" data-alloc="${cat}" data-amt="${v}">${tr('Catat')}</button>` : ''}</span></div>`;
  let body;
  if (d.avg === null) body = `<p class="mut text-sm">${tr('Belum ada data bulan sebelumnya. Catat pemasukan & pengeluaran minimal satu bulan agar saran alokasi muncul.')}</p>`;
  else if (d.surplus > 0) body = `<p class="text-sm mb-2">${trf('Pendapatan bulan ini {0} melampaui rata-rata {1} sebesar {2}. Saran alokasi surplus:', fmt(d.cur), fmt(d.avg), fmt(d.surplus))}</p>`
    + row('Dana darurat', d.toBuf, 'Emergency Fund') + row('Berbagi / Zakat', d.share, 'Giving') + row('Tabungan pribadi / lainnya', d.personal);
  else if (d.cur > 0) body = `<p class="text-sm mb-2">${trf('Pendapatan bulan ini belum melampaui rata-rata ({0}). Tetap sisihkan sedikit: {1} (5%) ke dana darurat.', fmt(d.avg), fmt(d.cur * .05))} <button class="link" data-alloc="Emergency Fund" data-amt="${d.cur * .05}">${tr('Catat')}</button></p>`;
  else body = `<p class="mut text-sm">${tr('Belum ada pemasukan bulan ini.')}</p>`;
  return `<h3>${tr('Dana Darurat & Berbagi')}</h3><p class="mut text-xs mb-3">${tr('Jaring pengaman sosial · SDG 10')}</p>
    <div class="flex justify-between text-sm mb-1"><span>${tr('Dana darurat')}</span><span>${fmt(d.buffer)} / ${fmt(d.target)}</span></div>
    <div class="bar" style="--c:#34d399"><i style="width:${d.target ? Math.min(d.buffer / d.target * 100, 100) : 0}%"></i></div>
    <p class="mut text-xs mt-1 mb-3">${trf('Target: {0} bulan pengeluaran rutin', d.months)}</p>${body}
    <p class="mut text-xs mt-2">${trf('Sudah dibagikan bulan ini: {0}', fmt(d.given))}</p>
    ${d.cur > 0 ? `<p class="mut text-xs mt-1">${trf('Referensi: 2,5% dari pemasukan bulan ini = {0} (zakat penghasilan bila mencapai nisab). Konsultasikan ke lembaga zakat resmi.', fmt(d.cur * .025))}</p>` : ''}`;
}

function risk() {
  const m = mr(0), base = sum('income', m.from, m.to) || avgIncome() || 0;
  const debt = catSum(['Debt'], m.from, m.to), cons = catSum(CONS, m.from, m.to);
  const dr = base ? debt / base * 100 : (debt ? 100 : 0), cr = base ? cons / base * 100 : (cons ? 100 : 0);
  return { base, debt, cons, dr, cr, l: (dr >= LIM.debtBad || cr >= LIM.consBad) ? 2 : (dr >= LIM.debtWarn || cr >= LIM.consWarn) ? 1 : 0 };
}
function debtHTML() {
  const r = risk(), col = ['var(--ok)', '#fbbf24', 'var(--bad)'][r.l], recs = [];
  const meter = (l, v, warn, bad) => { const c = v >= bad ? 'var(--bad)' : v >= warn ? '#fbbf24' : 'var(--ok)'; return `<div class="mb-3"><div class="flex justify-between text-xs mb-1"><span>${tr(l)}</span><span style="color:${c}; font-weight:700">${trf('{0}% (batas aman {1}%)', v.toFixed(0), warn)}</span></div><div class="bar" style="--c:${c}"><i style="width:${Math.min(v, 100)}%"></i></div></div>`; };
  if (!r.base && (r.debt || r.cons)) recs.push(tr('Belum ada pemasukan tercatat bulan ini; rasio dihitung dari rata-rata pendapatan bila ada.'));
  if (r.dr >= LIM.debtWarn) {
    recs.push(trf('Cicilan/utang menyerap {0}% pendapatan (batas aman ±{1}%, sekitar {2}). Hentikan utang baru dan prioritaskan melunasi yang bunganya tertinggi.', r.dr.toFixed(0), LIM.debtWarn, fmt(r.base * LIM.debtWarn / 100)));
    recs.push(tr('Jangan tutup cicilan dengan utang baru. Pastikan pinjaman berizin OJK (kontak OJK 157).'));
  }
  if (r.cr >= LIM.consWarn) recs.push(trf('Belanja konsumtif (Belanja + Hiburan) {0}% pendapatan. Turunkan ke ≤{1}%: kurangi sekitar {2} bulan ini.', r.cr.toFixed(0), 30, fmt(Math.max(r.cons - r.base * .3, 0))));
  if (r.l) recs.push(tr('Terapkan aturan tunggu 48 jam untuk pembelian non-esensial.'), tr('Tinjau dan hentikan langganan yang jarang dipakai.'));
  else recs.push(tr('Rasio utang dan belanja konsumtif masih sehat. Pertahankan!'));
  return `<div class="flex justify-between items-center gap-2 mb-1"><h3>Involuntary Debt Guard</h3><span class="tag" style="border:2px solid var(--line);color:${col}">${tr(['Aman', 'Waspada', 'Bahaya'][r.l])}</span></div>
    <p class="mut text-xs mb-3">${tr('Sistem peringatan dini utang & konsumsi')}</p>
    ${meter('Cicilan/utang vs pendapatan', r.dr, LIM.debtWarn, LIM.debtBad)}${meter('Konsumtif vs pendapatan', r.cr, LIM.consWarn, LIM.consBad)}
    <ul class="text-sm grid gap-2 list-disc pl-5">${recs.map(x => `<li>${x}</li>`).join('')}</ul>`;
}
function applyRisk() {
  const r = risk(), p = $('#p-dashboard'), b = $('#riskBar');
  b.classList.toggle('gone', !r.l); b.classList.toggle('bad', r.l === 2);
  b.innerHTML = r.l ? `<i data-lucide="shield-alert" class="w-4 h-4"></i> ${trf('{0}: rasio utang/konsumsi melewati batas aman.', tr(r.l === 2 ? 'Bahaya' : 'Waspada'))}` : '';
}

/* ========== BAHASA ========== */
const TN = [], AT = [];
function tagDom() {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const m = n.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (m[2] && DICT[m[2]] && n.parentElement.tagName !== 'SCRIPT') TN.push({ n, k: m[2], a: m[1], z: m[3] });
  }
  $$('[placeholder],[aria-label]').forEach(el => ['placeholder', 'aria-label'].forEach(at => { const k = el.getAttribute(at); if (k && DICT[k]) AT.push({ el, at, k }); }));
}
function applyLang() {
  document.documentElement.lang = LANG;
  TN.forEach(({ n, k, a, z }) => n.nodeValue = a + tr(k) + z);
  AT.forEach(({ el, at, k }) => el.setAttribute(at, tr(k)));
  $$('#authLang button').forEach(b => b.classList.toggle('on', b.dataset.l === LANG));
  $('#today').textContent = new Date().toLocaleDateString(LOC(), { day:'numeric', month:'short', year:'numeric' });
  setAuthMode(authMode);
}
function fillCur() {
  ['#sCur', '#cvFrom', '#cvTo', '#chartCur'].forEach(q => {
    const e = $(q); if(!e) return;
    const v = e.value || (q === '#chartCur' ? chartTargetCur : '');
    e.innerHTML = Object.entries(CUR).filter(([c]) => c !== 'USD' || q !== '#chartCur').map(([c, n]) => `<option value="${c}">${c} – ${tr(n)}</option>`).join('');
    if (v) e.value = v;
  });
}
function buildNav() {
  const b = ([id, label, ic]) => `<button class="nav-b${S && id === page ? ' on' : ''}" data-p="${id}"><span class="ic"><i data-lucide="${ic}"></i></span><span class="lbl">${tr(label)}</span></button>`;
  $('#nav1').innerHTML = NAV.slice(0, 5).map(b).join(''); 
  $('#nav2').innerHTML = NAV.slice(5).map(b).join('');
  $$('.nav-b').forEach(x => x.onclick = () => go(x.dataset.p));
  icons();
}
function setLang(l) {
  if (!LANGS[l]) return;
  LANG = l; try { localStorage.setItem(K_LANG, l); } catch (e) {}
  applyLang(); fillCur(); buildNav();
  if (S) { $('#crumb').textContent = tr(NAV.find(n => n[0] === page)[1]); refresh(); }
}

/* ========== FIREBASE AUTHENTICATION ========== */
let authMode = 'login';

function setAuthMode(m) {
  authMode = m; const reg = m === 'register';
  ['#aNameW', '#aPw2W'].forEach(q => $(q).classList.toggle('gone', !reg));
  $$('[data-am]').forEach(b => b.classList.toggle('on', b.dataset.am === m));
  $('#aSubmit').textContent = tr(reg ? 'Buat akun' : 'Masuk');
  $('#aPw').autocomplete = reg ? 'new-password' : 'current-password';
  $('#aErr').textContent = '';
}

async function onAuth(e) {
  e.preventDefault();
  const err = m => { $('#aErr').textContent = tr(m); }, reg = authMode === 'register';
  const name = $('#aName').value.trim(), email = $('#aEmail').value.trim().toLowerCase(), pw = $('#aPw').value;
  if (reg && !name) return err('Nama wajib diisi');
  if (!/^\S+@\S+\.\S+$/.test(email)) return err('Email tidak valid');
  if (pw.length < 6) return err('Kata sandi minimal 6 karakter');

  try {
    if (reg) {
      if (pw !== $('#aPw2').value) return err('Konfirmasi kata sandi tidak sama');
      const userCred = await createUserWithEmailAndPassword(auth, email, pw);
      USER = { id: userCred.user.uid, name, email };
      S = await load();
      S.settings.name = name;
      await save();
      toast('Akun berhasil dibuat');
    } else {
      const userCred = await signInWithEmailAndPassword(auth, email, pw);
      USER = { id: userCred.user.uid, name: userCred.user.displayName || email.split('@')[0], email };
    }
    startApp();
  } catch (error) {
    err(error.message);
  }
}

async function startApp() {
  S = await load(); page = sec = 'dashboard';
  Object.assign(F, { q:'', type:'all', cat:'all', date:'' }); $('#q').value = '';
  $('#auth').classList.add('gone'); $('#shell').classList.remove('gone');
  const cvF = $('#cvFrom'), cvT = $('#cvTo');
  if(cvF) cvF.value = 'USD'; if(cvT) cvT.value = 'IDR';
  buildNav(); checkAlert(); renderBell(); renderAvatar(); go('dashboard'); icons(); fetchRates();
  hideLoader(); // Sembunyikan animasi loading setelah aplikasi siap
}

async function logout() {
  try {
    await signOut(auth);
  } catch (e) {}
  for (const k in charts) { charts[k].destroy(); delete charts[k]; }
  S = null; USER = null;
  $('#shell').classList.add('gone'); $('#auth').classList.remove('gone');
  $('#authForm').reset(); setAuthMode('login'); $('#sidebar').classList.remove('open');
  toast('Anda telah keluar. Sampai jumpa!');
}

/* ========== INISIALISASI & EVENT ========== */
function init() {
  applyTheme(currentTheme);
  tagDom();
  Chart.defaults.color = currentTheme === 'dark' ? '#9ca3af' : '#555555';
  Chart.defaults.font.family = 'Plus Jakarta Sans, system-ui, sans-serif';
  const cvF = $('#cvFrom'), cvT = $('#cvTo');
  if(cvF) cvF.value = 'USD'; if(cvT) cvT.value = 'IDR';

  $('#burger').onclick = () => $('#sidebar').classList.toggle('open');
  $('#collapse').onclick = () => $('#shell').classList.toggle('mini');
  $('#addBtn').onclick = () => { $('#sidebar').classList.remove('open'); openModal(); }; $('#mClose').onclick = closeModal;
  $('#modal').onclick = e => { if (e.target.id === 'modal') closeModal(); };

  const backBtn = $('#backBtn');
  if (backBtn) {
    backBtn.onclick = () => {
      if (pageHistory.length > 0) {
        const prevPage = pageHistory.pop();
        go(prevPage, true);
      }
    };
  }

  const avatarEl = $('#avatar');
  if (avatarEl) {
    avatarEl.style.cursor = 'pointer';
    avatarEl.onclick = () => go('settings');
  }

  $('#themeToggle').onclick = () => {
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    refresh();
  };

  const qEmergency = $('#quickAddEmergency');
  if (qEmergency) {
    qEmergency.onclick = () => openModal(null, { type: 'expense', category: 'Emergency Fund', title: tr('Dana Darurat') });
  }

  const btnStartInvest = $('#btnStartInvest');
  if (btnStartInvest) {
    btnStartInvest.onclick = () => {
      window.open('https://bibit.id/', '_blank');
    };
  }

  $$('#mTypeSeg button').forEach(b => {
    b.onclick = () => {
      $$('#mTypeSeg button').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      $('#m-type').value = b.dataset.val;
      fillCats();
      toggleOrigin();
      const isInc = b.dataset.val === 'income';
      $('#mTitle').textContent = tr(isInc ? 'Catat pemasukan' : 'Catat pengeluaran');
      $('#mSubmitBtn').textContent = tr(isInc ? '✓ Simpan pemasukan' : '✓ Simpan pengeluaran');
    };
  });

  $('#quickAmounts').onclick = e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    const add = parseFloat(btn.dataset.val) || 0;
    const cur = parseFloat($('#m-amount').value) || 0;
    $('#m-amount').value = cur + add;
  };

  const mCurEl = $('#m-cur');
  if (mCurEl) {
    mCurEl.onchange = e => {
      const c = e.target.value;
      $('#mCurrencySymbol').textContent = c === 'IDR' ? 'Rp' : c === 'USD' ? '$' : c;
      updateQuickAmounts(c);
    };
  }

  $('#m-date').onchange = e => updateDateDisplay(e.target.value);
  $('#mSubmitBtn').onclick = () => {
    const title = $('#m-title').value.trim() || tr($('#m-cat').value);
    const amount = parseFloat($('#m-amount').value);
    const date = $('#m-date').value;
    if (!(amount > 0)) return toast('Nominal harus lebih dari 0', 'err');
    if (!date) return toast('Tanggal wajib diisi', 'err');

    const o = {
      type: $('#m-type').value,
      title,
      category: $('#m-cat').value,
      date,
      amount,
      cur: $('#m-cur').value || S.settings.cur,
      note: '',
      origin: $('#m-originW').classList.contains('gone') ? '' : $('#m-origin').value
    };
    const id = $('#m-id').value;
    if (id) Object.assign(S.tx.find(t => t.id === id), o); else S.tx.push({ id: uid(), ...o });
    save(); closeModal(); toast(id ? 'Transaksi diperbarui' : 'Transaksi ditambahkan'); refresh();
  };

  $('#safetyCard').onclick = e => { const b = e.target.closest('[data-alloc]'); if (b) openModal(null, { type:'expense', category:b.dataset.alloc, title:tr(b.dataset.alloc === 'Giving' ? 'Berbagi / Zakat' : 'Dana Darurat'), amount:Math.round(+b.dataset.amt) || '' }); };
  $('#bell').onclick = e => { e.stopPropagation(); $('#bellPanel').classList.toggle('hidden'); };
  
  document.addEventListener('click', e => { 
    if (!e.target.closest('#bellPanel')) {
      $('#bellPanel').classList.add('hidden');
    }
    
    const sidebar = $('#sidebar');
    const burger = $('#burger');
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !burger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  $('#q').oninput = e => { F.q = e.target.value.trim().toLowerCase(); if (sec !== 'transactions') go('transactions'); else renderTx(), icons(); };
  $('#fType').onchange = e => { F.type = e.target.value; render(); };
  $('#fCat').onchange = e => { F.cat = e.target.value; render(); };
  $('#fDate').onchange = e => { F.date = e.target.value; render(); };
  $('#fReset').onclick = () => { Object.assign(F, { q:'', type:'all', cat:'all', date:'' }); $('#q').value = ''; render(); };
  $('#txList').onclick = e => {
    const ed = e.target.closest('[data-e]'), de = e.target.closest('[data-d]');
    if (ed) openModal(ed.dataset.e);
    if (de && confirm(tr('Hapus transaksi ini?'))) { S.tx = S.tx.filter(t => t.id !== de.dataset.d); save(); toast('Transaksi dihapus'); refresh(); }
  };

  const autoDistributeCatBudget = (totalBudget) => {
    const expenseCats = CATS.expense;
    if (!expenseCats.length) return;
    
    const weights = {
      'Food': 0.30,           
      'Bills': 0.20,          
      'Transportation': 0.15, 
      'Shopping': 0.10,       
      'Entertainment': 0.05,  
      'Health': 0.05,         
      'Education': 0.05,      
      'Emergency Fund': 0.05, 
      'Giving': 0.05          
    };

    S.catBudget = {};
    expenseCats.forEach(c => {
      const w = weights[c] || 0;
      S.catBudget[c] = Math.round(totalBudget * w);
    });
  };

  $('#bSave').onclick = () => {
    const b = parseFloat($('#bMonthly').value);
    if (!(b >= 0)) return toast('Anggaran tidak valid', 'err');
    S.settings.budget = b;
    autoDistributeCatBudget(b);
    save(); 
    toast('Anggaran disimpan dan disesuaikan per kategori'); 
    refresh();
  };

  const bAutoDist = $('#bAutoDistribute');
  if (bAutoDist) {
    bAutoDist.onclick = () => {
      const b = parseFloat($('#bMonthly').value) || S.settings.budget || 0;
      if (b <= 0) return toast('Atur anggaran bulanan terlebih dahulu', 'warn');
      S.settings.budget = b;
      autoDistributeCatBudget(b);
      save();
      toast('Anggaran per kategori berhasil disesuaikan');
      refresh();
    };
  }

  $('#bCats').onchange = e => {
    const c = e.target.dataset.cb; if (!c) return;
    S.catBudget[c] = Math.max(parseFloat(e.target.value) || 0, 0); save(); renderBudget(); icons();
  };

  const fxR = $('#fxRefresh'); if(fxR) fxR.onclick = fetchRates;
  const chartCurEl = $('#chartCur');
  if (chartCurEl) {
    chartCurEl.onchange = e => fetchChartHistory(e.target.value);
  }

  ['#cvAmt', '#cvFrom', '#cvTo'].forEach(s => { const el = $(s); if(el) el.oninput = convert; });
  const cvS = $('#cvSwap'); if(cvS) cvS.onclick = () => { const f = $('#cvFrom').value; $('#cvFrom').value = $('#cvTo').value; $('#cvTo').value = f; convert(); };

  $('#rPeriod').onchange = renderReports;
  $('#rExport').onclick = () => {
    const c = buckets($('#rPeriod').value).at(-1);
    const rows = S.tx.filter(t => t.date >= c.from && t.date <= c.to).sort((a, b) => a.date < b.date ? -1 : 1);
    if (!rows.length) return toast('Tidak ada data pada periode ini', 'warn');
    const q = v => `"${String(v).replace(/"/g, '""')}"`;
    const head = ['Date', 'Type', 'Title', 'Category', 'Amount', 'Currency', `Amount (${S.settings.cur})`, 'Note'].join(',');
    const csv = [head, ...rows.map(t => [t.date, t.type, q(t.title), t.category, t.amount, t.cur, conv(t.amount, t.cur).toFixed(2), q(t.note)].join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv;charset=utf-8' })); a.download = `amanage-${c.from}_${c.to}.csv`; a.click();
    toast('Laporan CSV diunduh');
  };

  $('#sSave').onclick = async () => {
    const n = $('#sName').value.trim(), b = parseFloat($('#sBudget').value);
    if (!n) return toast('Nama wajib diisi', 'err');
    if (!(b >= 0)) return toast('Batas anggaran tidak valid', 'err');
    
    if (USER) USER.name = n;
    Object.assign(S.settings, { name: n, budget: b, cur: $('#sCur').value, alerts: $('#sAlerts').checked, irregular: $('#sIrr').checked, give: Math.min(Math.max(parseFloat($('#sGive').value) || 0, 0), 100) });
    
    await save();
    const l = $('#sLang').value; 
    if (l !== LANG) setLang(l); 
    else refresh(); 
    
    toast('Pengaturan disimpan');
  };

  $('#sReset').onclick = () => {
    if (confirm(tr('Semua data akan dihapus permanen. Lanjutkan?'))) { 
      setDoc(doc(db, "users", USER.id), { tx: [], settings: DEF.settings }, { merge: false }).then(() => location.reload()); 
    }
  };

  $('#sLang').onchange = e => { $('#sCur').value = LANGS[e.target.value].cur; };
  $$('[data-am]').forEach(b => b.onclick = () => setAuthMode(b.dataset.am));
  $$('#authLang button').forEach(b => b.onclick = () => setLang(b.dataset.l));
  $('#authForm').onsubmit = onAuth;

  applyLang(); fillCur(); buildNav(); setAuthMode('login');

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      USER = { id: user.uid, name: user.displayName || user.email.split('@')[0], email: user.email };
      await startApp();

      // Polling auto-refresh kurs tiap 5 menit
      setInterval(() => {
        if (page === 'currency') fetchRates();
      }, 300000);
    } else {
      $('#auth').classList.remove('gone');
      hideLoader(); // Sembunyikan loader jika pengguna belum login (menampilkan halaman auth)
    }
  });

  icons();
}
document.addEventListener('DOMContentLoaded', init);
// Chomdao PWA service worker
// เป้าหมาย: ติดตั้งเป็นแอปได้ + เปิดได้แม้เน็ตหลุดชั่วคราว
// สำคัญ: ห้ามแตะ request ของ Firebase/Google (ต้อง real-time) — intercept เฉพาะไฟล์ของแอปเอง
const CACHE = 'chomdao-v1';
const ASSETS = [
  '.',
  './index.html',
  './manifest.webmanifest',
  './dormitory-logo-hq.png',
  './dormitory-logo.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // ปล่อยผ่าน request ข้ามโดเมน (Firebase, gstatic, fonts ฯลฯ) — ไม่ cache เพื่อให้ข้อมูลสดเสมอ
  if (url.origin !== location.origin) return;

  // หน้าแอป (navigate) → network-first กันโค้ดเก่าค้าง, เน็ตหลุดค่อย fallback cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then(r => r || caches.match('.')))
    );
    return;
  }

  // ไฟล์ static อื่น (ไอคอน, manifest) → cache-first
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});

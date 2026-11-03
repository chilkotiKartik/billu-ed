// Service worker: caches static files for fast loads and shows a friendly page when offline.
// Bump VERSION when this file changes in a way that needs old caches cleared.
const VERSION = 'edcat-v11';
const OFFLINE = '/offline.html';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.add(OFFLINE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/')) return;
  // Pages: network first. The app screen (/app) is kept so the built-in sheets still open with no internet.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r.ok && !r.redirected && u.pathname === '/app') { const copy = r.clone(); caches.open(VERSION).then((c) => c.put('/app', copy)); }
          return r;
        })
        .catch(async () => (await caches.match(u.pathname === '/app' ? '/app' : req)) || (await caches.match('/app')) || caches.match(OFFLINE))
    );
    return;
  }
  if (u.pathname.startsWith('/_next/static') || /\.(png|svg|webmanifest|woff2?)$/.test(u.pathname)) {
    e.respondWith(
      caches.open(VERSION).then(async (c) => {
        const hit = await c.match(req);
        const net = fetch(req).then((r) => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || net;
      })
    );
  }
});

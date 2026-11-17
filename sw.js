// Works without wifi: the whole show (pictures and songs are inside index.html) is saved after the first visit.
const C = 'fairuz-show-v1';
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('fairuz-show-') && k !== C).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin || !u.pathname.startsWith(new URL('./', location).pathname)) return;
  const key = r.mode === 'navigate' ? './' : r;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(key, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res && res.ok) c.put(key, res.clone()); return res; }).catch(() => hit);
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  }));
});

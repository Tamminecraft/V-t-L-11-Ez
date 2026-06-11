/* Service Worker – Vật Lý 11 Ez */
const CACHE = 'vlhub-v1';
const STATIC = [
  '/', '/index.html',
  '/vatlihub-enhance.css',
  '/vatlihub-ai-plus.css',
  '/vatlihub-ai-plus.js',
  '/manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Bỏ qua POST và API AI
  if (e.request.method !== 'GET') return;
  if (url.host.includes('pollinations.ai') || url.host.includes('googleapis.com')) return;

  // Network-first cho HTML, cache-first cho static
  if (e.request.mode === 'navigate' || (e.request.destination === 'document')) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('/')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached ||
      fetch(e.request).then(r => {
        if (r.ok && url.origin === self.location.origin) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return r;
      }).catch(()=> cached)
    )
  );
});

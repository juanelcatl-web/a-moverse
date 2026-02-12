const CACHE_NAME = 'amoverse-v2';
const ASSETS = [
  './',               // Esto guarda la ruta raíz
  './index.html',     // Este es el nombre real ahora
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

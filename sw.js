const CACHE_NAME = 'amoverse-v3';
const STATIC_ASSETS = [
  '/icono.png',
  '/manifest.json'
];

// Instalación: solo cacheamos assets estáticos mínimos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpia cachés viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network First para HTML, Cache First para imágenes/iconos
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // HTML: siempre pide al servidor primero
  if (event.request.headers.get('accept') &&
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Actualiza el caché con la versión nueva
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Iconos y assets estáticos: cache first
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Todo lo demás: network first
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

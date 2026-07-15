const CACHE_NAME = 'amoverse-v4';

// Solo cacheamos el icono — nada más
const STATIC_ASSETS = ['/icono.png'];

// Dominios externos que NUNCA interceptamos
const EXTERNAL_DOMAINS = [
  'cdn.tailwindcss.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'pagead2.googlesyndication.com',
  'www.googletagmanager.com',
  'www.gstatic.com',
  'firebase.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'www.google-analytics.com',
  'analytics.google.com',
  'toncenter.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Dejar pasar SIN interceptar todos los dominios externos
  if (EXTERNAL_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return; // fetch normal del navegador
  }

  // Solo interceptar recursos del propio dominio (amoverse.net)
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML propio: siempre network first
  if (event.request.headers.get('accept') &&
      event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Icono: cache first
  if (url.pathname === '/icono.png') {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
    return;
  }

  // Todo lo demás propio: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

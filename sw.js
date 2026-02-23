const CACHE_NAME = 'amoverse-v4-8-fixed';

self.addEventListener('install', event => {
    // Salta la espera y activa el nuevo SW al instante
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    // Toma el control de las pestañas abiertas inmediatamente
    event.waitUntil(clients.claim());
    // Limpia caches viejas
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(fetch(event.request));
});

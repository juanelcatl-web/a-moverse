const CACHE_NAME = 'amoverse-v4-8-fixed';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
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

// Cuando el usuario toca la notificación, enfoca la app
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            // Si la app ya está abierta en alguna pestaña, la enfoca
            for (const client of list) {
                if (client.url.includes('amoverse.net') && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no, abre una nueva
            if (clients.openWindow) return clients.openWindow('https://amoverse.net');
        })
    );
});

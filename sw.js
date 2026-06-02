// ═══════════════════════════════════════
//   My Body — Service Worker (PWA)
// ═══════════════════════════════════════

const CACHE_NAME = 'my-body-v7';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/storage.js',
    './js/ui.js',
    './js/charts.js',
    './js/app.js',
    './icons/icon-512.png',
    './manifest.json'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching core assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => {
                console.warn('[SW] Cache install failed:', err);
            })
    );
    self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET and external requests
    if (event.request.method !== 'GET') return;
    if (url.origin !== location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Clone and cache the fresh response
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Network failed — serve from cache
                return caches.match(event.request).then(cachedResponse => {
                    return cachedResponse || new Response('Offline', {
                        status: 503,
                        statusText: 'Offline'
                    });
                });
            })
    );
});

// ─── Notification Reminders ───
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
        const { title, body, delay } = event.data;
        setTimeout(() => {
            self.registration.showNotification(title, {
                body,
                icon: './icons/icon-512.png',
                badge: './icons/icon-512.png',
                tag: 'my-body-reminder',
                renotify: true,
                vibrate: [200, 100, 200],
                actions: [
                    { action: 'open', title: '📝 Внести дані' },
                    { action: 'dismiss', title: 'Пізніше' }
                ]
            });
        }, delay);
    }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clients => {
                for (const client of clients) {
                    if ('focus' in client) {
                        return client.focus();
                    }
                }
                return self.clients.openWindow('./index.html');
            })
    );
});

/**
 * Service Worker - Geek & Dragon
 * Cache intelligent pour performance optimale
 */

const CACHE_NAME = 'geekndragon-v1.0';
const STATIC_CACHE = [
    '/css/styles.css',
    '/css/vendor.bundle.min.css',
    '/js/app.bundle.min.js',
    '/js/vendor.bundle.min.js',
    '/media/branding/logo/logo-geek-dragon.webp'
];

// Installation et mise en cache des ressources critiques
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Stratégie Cache First pour les assets statiques
self.addEventListener('fetch', (event) => {
    if (event.request.destination === 'image' || 
        event.request.url.includes('.css') || 
        event.request.url.includes('.js')) {
        
        event.respondWith(
            caches.match(event.request)
                .then((response) => response || fetch(event.request))
        );
    }
});
/**
 * Service Worker pour la mise en cache des ressources
 * Améliore les performances et permet le fonctionnement hors ligne partiel
 */

const CACHE_NAME = 'geekndragon-v1.0';
const STATIC_CACHE = 'static-v1.0';
const DYNAMIC_CACHE = 'dynamic-v1.0';
const API_CACHE = 'api-v1.0';

// Ressources à mettre en cache immédiatement
const STATIC_ASSETS = [
    '/',
    '/css/styles.css',
    '/css/boutique-premium.css',
    '/js/app.js',
    '/js/performance-optimizer.js',
    '/images/geekndragon_logo.svg',
    '/images/favicon.png',
    // Polices critiques
    '/css/vendor.bundle.min.css',
    '/js/vendor.bundle.min.js'
];

// Ressources à mettre en cache lors de la première utilisation
const DYNAMIC_ASSETS = [
    '/boutique.php',
    '/product.php',
    '/api/products.php'
];

// Configuration des stratégies de cache par type de ressource
const CACHE_STRATEGIES = {
    images: 'cache-first',
    css: 'cache-first',
    js: 'cache-first',
    api: 'network-first',
    pages: 'network-first'
};

self.addEventListener('install', event => {
    console.log('Service Worker: Installation');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Service Worker: Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Activation');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('Service Worker: Suppression ancien cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Déterminer la stratégie de cache
    const strategy = getStrategyForRequest(request);
    
    event.respondWith(
        handleRequest(request, strategy)
    );
});

/**
 * Détermine la stratégie de cache selon le type de ressource
 */
function getStrategyForRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const extension = pathname.split('.').pop();
    
    // API requests
    if (pathname.startsWith('/api/')) {
        return CACHE_STRATEGIES.api;
    }
    
    // Images
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
        return CACHE_STRATEGIES.images;
    }
    
    // CSS
    if (extension === 'css') {
        return CACHE_STRATEGIES.css;
    }
    
    // JavaScript
    if (extension === 'js') {
        return CACHE_STRATEGIES.js;
    }
    
    // Pages PHP ou HTML
    if (['php', 'html', ''].includes(extension)) {
        return CACHE_STRATEGIES.pages;
    }
    
    return 'network-first';
}

/**
 * Gère la requête selon la stratégie définie
 */
async function handleRequest(request, strategy) {
    switch (strategy) {
        case 'cache-first':
            return cacheFirst(request);
        case 'network-first':
            return networkFirst(request);
        case 'stale-while-revalidate':
            return staleWhileRevalidate(request);
        default:
            return fetch(request);
    }
}

/**
 * Stratégie Cache First: cache d'abord, réseau en fallback
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const cache = await caches.open(getCacheNameForRequest(request));
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.warn('Service Worker: Erreur réseau', error);
        return new Response('Ressource non disponible hors ligne', { status: 503 });
    }
}

/**
 * Stratégie Network First: réseau d'abord, cache en fallback
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const cache = await caches.open(getCacheNameForRequest(request));
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        
        if (cached) {
            return cached;
        }
        
        // Page d'erreur personnalisée pour les pages principales
        if (request.url.includes('.php') || request.url.endsWith('/')) {
            return new Response(getOfflinePage(), {
                headers: { 'Content-Type': 'text/html' }
            });
        }
        
        return new Response('Ressource non disponible', { status: 503 });
    }
}

/**
 * Stratégie Stale While Revalidate: retourne le cache, met à jour en arrière-plan
 */
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);
    
    const fetchPromise = fetch(request)
        .then(response => {
            if (response.status === 200) {
                const cache = caches.open(getCacheNameForRequest(request));
                cache.then(c => c.put(request, response.clone()));
            }
            return response;
        })
        .catch(() => cached);
    
    return cached || fetchPromise;
}

/**
 * Détermine le nom du cache selon le type de requête
 */
function getCacheNameForRequest(request) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
        return API_CACHE;
    }
    
    if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
        return STATIC_CACHE;
    }
    
    return DYNAMIC_CACHE;
}

/**
 * Page hors ligne simple
 */
function getOfflinePage() {
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hors ligne - Geek & Dragon</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 2rem;
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }
                .container {
                    max-width: 500px;
                    margin: 0 auto;
                }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                p { font-size: 1.2rem; line-height: 1.6; }
                .retry-btn {
                    background: #fff;
                    color: #667eea;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 25px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    margin-top: 2rem;
                    transition: transform 0.2s;
                }
                .retry-btn:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🐉 Mode Hors Ligne</h1>
                <p>Vous n'êtes pas connecté à Internet, mais certaines pages sont disponibles en cache.</p>
                <p>Vérifiez votre connexion et réessayez.</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    Réessayer
                </button>
            </div>
        </body>
        </html>
    `;
}

// Écouter les messages du client principal
self.addEventListener('message', event => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Nettoyage périodique du cache
self.addEventListener('periodicsync', event => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCaches());
    }
});

/**
 * Nettoyage des anciennes entrées de cache
 */
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const dateHeader = response.headers.get('date');
            
            if (dateHeader) {
                const responseDate = new Date(dateHeader).getTime();
                if (responseDate < oneWeekAgo) {
                    await cache.delete(request);
                }
            }
        }
    }
}
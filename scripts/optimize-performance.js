/**
 * Optimisation Performance Snipcart - GeeknDragon
 * ================================================
 * 
 * Ce script optimise les performances de l'intégration Snipcart :
 * - Lazy loading des scripts
 * - Préchargement intelligent
 * - Optimisation du cache
 * - Minimisation des requêtes
 */

class SnipcartPerformanceOptimizer {
    constructor() {
        this.isInitialized = false;
        this.userInteracted = false;
        this.scriptsLoaded = false;
        this.preloadThreshold = 3000; // 3 secondes avant preload
        
        this.init();
    }

    /**
     * Initialisation de l'optimiseur
     */
    init() {
        // Attendre que le DOM soit prêt
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Configuration des optimisations
     */
    setup() {
        console.log('🚀 Optimisation Snipcart activée');

        // 1. Détection d'interaction utilisateur
        this.setupUserInteractionDetection();
        
        // 2. Préchargement intelligent
        this.setupIntelligentPreloading();
        
        // 3. Optimisation du cache
        this.setupCacheOptimization();
        
        // 4. Lazy loading des assets
        this.setupLazyLoading();
        
        // 5. Optimisation des événements
        this.setupEventOptimization();
    }

    /**
     * Détection d'interaction utilisateur
     */
    setupUserInteractionDetection() {
        const interactionEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        const handleFirstInteraction = () => {
            this.userInteracted = true;
            console.log('👤 Interaction utilisateur détectée');
            
            // Charger Snipcart après première interaction
            if (!this.scriptsLoaded) {
                setTimeout(() => this.loadSnipcartScripts(), 100);
            }
            
            // Supprimer les listeners après première interaction
            interactionEvents.forEach(event => {
                document.removeEventListener(event, handleFirstInteraction, { passive: true });
            });
        };

        // Ajouter les listeners d'interaction
        interactionEvents.forEach(event => {
            document.addEventListener(event, handleFirstInteraction, { passive: true });
        });

        // Fallback : charger après 3 secondes même sans interaction
        setTimeout(() => {
            if (!this.userInteracted) {
                console.log('⏱️ Chargement Snipcart après timeout');
                this.loadSnipcartScripts();
            }
        }, this.preloadThreshold);
    }

    /**
     * Chargement optimisé des scripts Snipcart
     */
    loadSnipcartScripts() {
        if (this.scriptsLoaded) return;
        
        this.scriptsLoaded = true;
        console.log('📦 Chargement des scripts Snipcart...');

        // Précharger le CSS d'abord (non bloquant)
        this.preloadSnipcartCSS();
        
        // Puis charger le JS principal
        setTimeout(() => this.loadSnipcartJS(), 50);
    }

    /**
     * Préchargement du CSS Snipcart
     */
    preloadSnipcartCSS() {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = 'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.css';
        link.as = 'style';
        link.onload = () => {
            // Convertir en stylesheet après préchargement
            link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
    }

    /**
     * Chargement du JS Snipcart
     */
    loadSnipcartJS() {
        const script = document.createElement('script');
        script.src = 'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('✅ Snipcart chargé avec succès');
            this.onSnipcartLoaded();
        };
        
        script.onerror = () => {
            console.error('❌ Erreur de chargement Snipcart');
            this.onSnipcartError();
        };
        
        document.head.appendChild(script);
    }

    /**
     * Callback après chargement Snipcart
     */
    onSnipcartLoaded() {
        // Initialiser nos customizations après chargement Snipcart
        if (window.geeknDragonCart) {
            window.geeknDragonCart.onSnipcartReady();
        }
        
        // Précharger les templates
        this.preloadTemplates();
        
        // Optimiser les événements Snipcart
        this.optimizeSnipcartEvents();
    }

    /**
     * Gestion d'erreur de chargement
     */
    onSnipcartError() {
        // Fallback : désactiver les boutons Snipcart
        const snipcartButtons = document.querySelectorAll('.snipcart-add-item, .gd-add-to-cart');
        snipcartButtons.forEach(button => {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.title = 'Service temporairement indisponible';
            button.onclick = (e) => {
                e.preventDefault();
                alert('Le service de commande est temporairement indisponible. Veuillez réessayer plus tard.');
            };
        });
    }

    /**
     * Préchargement intelligent
     */
    setupIntelligentPreloading() {
        // Précharger les images de produits visibles
        this.preloadVisibleProductImages();
        
        // Précharger les données critiques
        this.preloadCriticalData();
    }

    /**
     * Préchargement des images de produits visibles
     */
    preloadVisibleProductImages() {
        const productImages = document.querySelectorAll('.product-card img, .card-product img');
        
        // Utiliser Intersection Observer pour précharger intelligemment
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px', // Charger 50px avant d'être visible
            });

            productImages.forEach(img => {
                if (img.loading !== 'lazy') {
                    // Convertir en lazy loading si pas déjà fait
                    img.dataset.src = img.src;
                    img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="%23ddd"/></svg>';
                    img.classList.add('lazy');
                }
                imageObserver.observe(img);
            });
        }
    }

    /**
     * Préchargement des données critiques
     */
    preloadCriticalData() {
        // Précharger les données produits si pas déjà fait
        if (!window.geeknDragonProductsData) {
            fetch('/data/products.json')
                .then(response => response.json())
                .then(data => {
                    window.geeknDragonProductsData = data;
                    console.log('📦 Données produits préchargées');
                })
                .catch(error => {
                    console.warn('⚠️ Erreur préchargement produits:', error);
                });
        }
    }

    /**
     * Préchargement des templates
     */
    preloadTemplates() {
        if (!window.geeknDragonTemplatesPreloaded) {
            fetch('/templates/snipcart-templates.html')
                .then(response => response.text())
                .then(html => {
                    window.geeknDragonTemplatesPreloaded = true;
                    console.log('🎨 Templates préchargés');
                })
                .catch(error => {
                    console.warn('⚠️ Erreur préchargement templates:', error);
                });
        }
    }

    /**
     * Optimisation du cache
     */
    setupCacheOptimization() {
        // Cache Service Worker pour les assets statiques
        if ('serviceWorker' in navigator && 'caches' in window) {
            this.setupServiceWorkerCache();
        }
        
        // Cache localStorage pour les données dynamiques
        this.setupLocalStorageCache();
    }

    /**
     * Configuration du cache Service Worker
     */
    setupServiceWorkerCache() {
        // Enregistrer le service worker pour le cache
        const swScript = `
            const CACHE_NAME = 'geekndragon-snipcart-v1';
            const urlsToCache = [
                '/js/snipcart-integration.js',
                '/js/snipcart-products.js',
                '/css/cart-widget.css',
                '/templates/snipcart-templates.html',
                'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.css',
                'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.js'
            ];

            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(cache => cache.addAll(urlsToCache))
                );
            });

            self.addEventListener('fetch', event => {
                if (event.request.method !== 'GET') return;
                
                event.respondWith(
                    caches.match(event.request)
                        .then(response => {
                            return response || fetch(event.request);
                        })
                );
            });
        `;

        // Créer et enregistrer le service worker
        const blob = new Blob([swScript], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then(() => console.log('🔧 Service Worker enregistré'))
            .catch(error => console.warn('⚠️ Erreur Service Worker:', error));
    }

    /**
     * Cache localStorage
     */
    setupLocalStorageCache() {
        // Cache pour les données produits
        this.cacheManager = {
            set: (key, data, ttl = 3600000) => { // 1 heure par défaut
                const item = {
                    data: data,
                    expiry: Date.now() + ttl
                };
                try {
                    localStorage.setItem(`gd_cache_${key}`, JSON.stringify(item));
                } catch (e) {
                    console.warn('⚠️ Cache localStorage plein');
                }
            },
            
            get: (key) => {
                try {
                    const item = localStorage.getItem(`gd_cache_${key}`);
                    if (!item) return null;
                    
                    const parsed = JSON.parse(item);
                    if (Date.now() > parsed.expiry) {
                        localStorage.removeItem(`gd_cache_${key}`);
                        return null;
                    }
                    
                    return parsed.data;
                } catch (e) {
                    return null;
                }
            },
            
            clear: () => {
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('gd_cache_')) {
                        localStorage.removeItem(key);
                    }
                });
            }
        };

        window.geeknDragonCache = this.cacheManager;
    }

    /**
     * Lazy loading des assets
     */
    setupLazyLoading() {
        // Lazy loading des vidéos hero
        const heroVideos = document.querySelectorAll('[data-main]');
        heroVideos.forEach(video => {
            if ('IntersectionObserver' in window) {
                const videoObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadHeroVideo(entry.target);
                            videoObserver.unobserve(entry.target);
                        }
                    });
                });
                videoObserver.observe(video);
            }
        });

        // Lazy loading des scripts non critiques
        this.setupScriptLazyLoading();
    }

    /**
     * Chargement des vidéos hero
     */
    loadHeroVideo(element) {
        const mainVideo = element.dataset.main;
        if (mainVideo && window.heroVideoManager) {
            window.heroVideoManager.loadVideo(element);
        }
    }

    /**
     * Lazy loading des scripts
     */
    setupScriptLazyLoading() {
        // Scripts non critiques à charger après interaction
        const nonCriticalScripts = [
            '/js/audio-player.js',
            'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js'
        ];

        // Charger après première interaction
        const loadNonCriticalScripts = () => {
            nonCriticalScripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.defer = true;
                document.head.appendChild(script);
            });
        };

        if (this.userInteracted) {
            setTimeout(loadNonCriticalScripts, 1000);
        } else {
            document.addEventListener('snipcart.ready', loadNonCriticalScripts, { once: true });
        }
    }

    /**
     * Optimisation des événements
     */
    setupEventOptimization() {
        // Throttling des événements de scroll
        this.setupScrollThrottling();
        
        // Debouncing des événements de resize
        this.setupResizeDebouncing();
        
        // Optimisation des événements de panier
        this.setupCartEventOptimization();
    }

    /**
     * Throttling du scroll
     */
    setupScrollThrottling() {
        let ticking = false;
        
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Logique de scroll optimisée
                    this.handleOptimizedScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    /**
     * Logique de scroll optimisée
     */
    handleOptimizedScroll() {
        // Lazy loading des éléments qui deviennent visibles
        // Animation des éléments si nécessaire
        // Mise à jour de l'état de navigation
    }

    /**
     * Debouncing du resize
     */
    setupResizeDebouncing() {
        let resizeTimeout;
        
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleOptimizedResize();
            }, 250);
        };

        window.addEventListener('resize', handleResize);
    }

    /**
     * Logique de resize optimisée
     */
    handleOptimizedResize() {
        // Recalcul des layouts si nécessaire
        // Mise à jour des breakpoints
        // Réinitialisation des observateurs si requis
    }

    /**
     * Optimisation des événements Snipcart
     */
    optimizeSnipcartEvents() {
        if (!window.Snipcart) return;

        // Grouper les événements similaires
        let cartUpdateTimer;
        
        document.addEventListener('snipcart.item.added', () => {
            clearTimeout(cartUpdateTimer);
            cartUpdateTimer = setTimeout(() => {
                this.updateCartUI();
            }, 100);
        });

        document.addEventListener('snipcart.item.removed', () => {
            clearTimeout(cartUpdateTimer);
            cartUpdateTimer = setTimeout(() => {
                this.updateCartUI();
            }, 100);
        });
    }

    /**
     * Optimisation des événements de panier
     */
    setupCartEventOptimization() {
        // Batch les mises à jour du compteur de panier
        let cartCountUpdateTimer;
        
        const updateCartCount = () => {
            clearTimeout(cartCountUpdateTimer);
            cartCountUpdateTimer = setTimeout(() => {
                const cartCount = document.getElementById('gd-cart-count-widget');
                if (cartCount && window.Snipcart) {
                    const itemsCount = window.Snipcart.store.getState().cart.items.count;
                    cartCount.textContent = itemsCount;
                    cartCount.classList.toggle('visible', itemsCount > 0);
                }
            }, 50);
        };

        // Écouter les changements de panier
        document.addEventListener('snipcart.cart.items.count.changed', updateCartCount);
    }

    /**
     * Mise à jour optimisée de l'UI du panier
     */
    updateCartUI() {
        // Logique de mise à jour groupée
        if (window.geeknDragonCart) {
            window.geeknDragonCart.updateCartDisplay();
        }
    }

    /**
     * Métriques de performance
     */
    measurePerformance() {
        if ('performance' in window) {
            const metrics = {
                snipcartLoadTime: 0,
                firstInteractionTime: 0,
                totalScripts: document.scripts.length
            };

            // Mesurer le temps de chargement Snipcart
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.name.includes('snipcart')) {
                        metrics.snipcartLoadTime = entry.responseEnd - entry.requestStart;
                    }
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
            
            console.log('📊 Métriques performance:', metrics);
        }
    }
}

// Auto-initialisation
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.snipcartOptimizer = new SnipcartPerformanceOptimizer();
    });
}

// Export pour tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SnipcartPerformanceOptimizer;
}
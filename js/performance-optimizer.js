/**
 * Optimiseur de performance frontend
 * Lazy loading, compression d'images et optimisation des ressources
 */

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupResourceHints();
        this.setupCriticalCSS();
        this.setupServiceWorker();
    }

    /**
     * Configuration du lazy loading pour images et vidéos
     */
    setupLazyLoading() {
        // Observer pour le lazy loading
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observer toutes les images avec data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        // Observer pour les vidéos
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    this.loadVideo(video);
                    observer.unobserve(video);
                }
            });
        });

        document.querySelectorAll('video[data-src]').forEach(video => {
            videoObserver.observe(video);
        });
    }

    /**
     * Chargement optimisé d'une image
     */
    loadImage(img) {
        // Vérifier si l'API d'optimisation est disponible
        if (this.canOptimizeMedia()) {
            this.loadOptimizedImage(img);
        } else {
            this.loadStandardImage(img);
        }
    }

    /**
     * Chargement d'image optimisée via API
     */
    async loadOptimizedImage(img) {
        try {
            const originalSrc = img.dataset.src;
            const response = await fetch(`/api/media.php?action=html&file_path=${encodeURIComponent(originalSrc)}&attributes=${JSON.stringify({
                alt: img.alt,
                class: img.className,
                sizes: img.dataset.sizes || '(max-width: 768px) 100vw, 50vw'
            })}`);
            
            const data = await response.json();
            
            if (data.success && data.html) {
                // Remplacer l'image par la version optimisée
                const wrapper = document.createElement('div');
                wrapper.innerHTML = data.html;
                const optimizedImg = wrapper.firstElementChild;
                
                img.parentNode.replaceChild(optimizedImg, img);
            } else {
                this.loadStandardImage(img);
            }
        } catch (error) {
            console.warn('Erreur chargement image optimisée:', error);
            this.loadStandardImage(img);
        }
    }

    /**
     * Chargement d'image standard
     */
    loadStandardImage(img) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
        
        img.onload = () => {
            img.classList.add('fade-in');
        };
    }

    /**
     * Chargement optimisé d'une vidéo
     */
    loadVideo(video) {
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach(source => {
            source.src = source.dataset.src;
            source.removeAttribute('data-src');
        });
        
        if (video.dataset.src) {
            video.src = video.dataset.src;
        }
        
        video.load();
        video.classList.add('loaded');
    }

    /**
     * Configuration des hints de ressources
     */
    setupResourceHints() {
        // Préconnexion aux domaines externes
        this.addResourceHint('preconnect', 'https://fonts.googleapis.com');
        this.addResourceHint('preconnect', 'https://fonts.gstatic.com');
        
        // Préchargement des ressources critiques
        this.addResourceHint('preload', '/css/styles.css', 'style');
        this.addResourceHint('preload', '/js/app.js', 'script');
    }

    /**
     * Ajoute un hint de ressource
     */
    addResourceHint(rel, href, as = null) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        if (as) link.as = as;
        document.head.appendChild(link);
    }

    /**
     * Configuration du CSS critique
     */
    setupCriticalCSS() {
        // Chargement asynchrone du CSS non-critique
        const nonCriticalCSS = [
            '/css/boutique-premium.css',
            '/css/product-gallery.css'
        ];

        nonCriticalCSS.forEach(cssFile => {
            this.loadCSSAsync(cssFile);
        });
    }

    /**
     * Chargement asynchrone de CSS
     */
    loadCSSAsync(href) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.media = 'print';
        link.onload = () => {
            link.media = 'all';
        };
        document.head.appendChild(link);
    }

    /**
     * Configuration du Service Worker
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker enregistré:', registration.scope);
                })
                .catch(error => {
                    console.log('Erreur Service Worker:', error);
                });
        }
    }

    /**
     * Vérifie si l'API d'optimisation média est disponible
     */
    canOptimizeMedia() {
        return window.location.hostname !== 'localhost' || window.location.port === '';
    }

    /**
     * Optimisation du scroll pour les longues listes
     */
    setupVirtualScrolling(container, itemHeight = 100) {
        const items = Array.from(container.children);
        const totalHeight = items.length * itemHeight;
        const viewportHeight = container.clientHeight;
        const visibleItems = Math.ceil(viewportHeight / itemHeight) + 2;

        let scrollTop = 0;
        let startIndex = 0;

        const viewport = document.createElement('div');
        viewport.style.height = totalHeight + 'px';
        viewport.style.position = 'relative';

        container.addEventListener('scroll', () => {
            scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            this.updateVisibleItems(viewport, items, startIndex, visibleItems, itemHeight);
        });

        this.updateVisibleItems(viewport, items, startIndex, visibleItems, itemHeight);
        container.appendChild(viewport);
    }

    /**
     * Met à jour les éléments visibles dans le scroll virtuel
     */
    updateVisibleItems(viewport, items, startIndex, visibleItems, itemHeight) {
        viewport.innerHTML = '';
        const endIndex = Math.min(startIndex + visibleItems, items.length);

        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i].cloneNode(true);
            item.style.position = 'absolute';
            item.style.top = (i * itemHeight) + 'px';
            item.style.width = '100%';
            viewport.appendChild(item);
        }
    }

    /**
     * Compression d'images côté client
     */
    async compressImage(file, quality = 0.8, maxWidth = 1920) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                canvas.toBlob(resolve, 'image/jpeg', quality);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Mesure les performances de la page
     */
    measurePerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const metrics = {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
            };

            console.log('Métriques de performance:', metrics);
            
            // Envoyer les métriques à l'API si nécessaire
            this.sendPerformanceMetrics(metrics);
        }
    }

    /**
     * Envoie les métriques de performance à l'API
     */
    async sendPerformanceMetrics(metrics) {
        try {
            await fetch('/api/performance.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: window.location.pathname,
                    metrics: metrics,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.warn('Erreur envoi métriques:', error);
        }
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Mesurer les performances après chargement complet
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.performanceOptimizer.measurePerformance();
        }, 1000);
    });
});

// Export pour utilisation modulaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
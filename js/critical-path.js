/**
 * Critical Path Loader - Performance Maximale
 * Charge uniquement les ressources critiques au démarrage
 */
(function() {
    'use strict';
    
    // Détection des capacités du navigateur
    const hasIntersectionObserver = 'IntersectionObserver' in window;
    const hasRequestIdleCallback = 'requestIdleCallback' in window;
    const supportsWebP = (function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    })();

    // Chargement différé des scripts non-critiques
    function loadWhenIdle(src, callback) {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        
        if (callback) script.onload = callback;
        
        if (hasRequestIdleCallback) {
            requestIdleCallback(() => document.head.appendChild(script));
        } else {
            setTimeout(() => document.head.appendChild(script), 100);
        }
    }

    // Préchargement intelligent des images
    function preloadCriticalImages() {
        const criticalImages = [
            '/media/branding/logo/logo-geek-dragon.webp',
            '/media/branding/hero/hero-background.webp'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Chargement progressif
    function progressiveLoad() {
        // 1. Ressources critiques immédiatement
        loadWhenIdle('/js/lazy-loader.js');
        
        // 2. Ressources importantes après 200ms
        setTimeout(() => {
            loadWhenIdle('/js/conditional-loader.js');
        }, 200);
        
        // 3. Ressources non-critiques après interaction utilisateur
        let interactionLoaded = false;
        ['click', 'scroll', 'keydown', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, function loadOnInteraction() {
                if (interactionLoaded) return;
                interactionLoaded = true;
                
                document.removeEventListener(eventType, loadOnInteraction);
                
                // Charger les fonctionnalités secondaires
                loadWhenIdle('/js/app.js');
                
                // Activer les animations si supportées
                if (hasIntersectionObserver) {
                    loadWhenIdle('/js/boutique-premium.js');
                }
            });
        });
    }

    // Démarrage
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            preloadCriticalImages();
            progressiveLoad();
        });
    } else {
        preloadCriticalImages();
        progressiveLoad();
    }
})();
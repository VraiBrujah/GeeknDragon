// optimize-performance.js
// Script pour optimiser les performances globales du site

(function() {
  'use strict';

  // Configuration de performance
  const PERFORMANCE_CONFIG = {
    // Lazy loading intelligent
    lazyLoadMargin: '50px',
    // Débounce pour les événements scroll
    scrollDebounce: 100,
    // Préchargement des ressources critiques
    preloadCritical: true,
    // Nettoyage mémoire automatique
    memoryCleanup: true
  };

  // Optimisation du scroll avec debounce
  let scrollTimeout;
  let isScrolling = false;

  const optimizedScrollHandler = (callback) => {
    return function() {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          callback.apply(this, arguments);
          isScrolling = false;
        });
        isScrolling = true;
      }
    };
  };

  // Préchargement intelligent des ressources critiques
  const preloadCriticalResources = () => {
    if (!PERFORMANCE_CONFIG.preloadCritical) return;

    // Précharger les polices critiques
    const fontPreloads = [
      { href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&display=swap', as: 'style' },
    ];

    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font.href;
      link.as = font.as;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Précharger les images critiques du hero
    const heroImages = document.querySelectorAll('.hero-boutique img, .product-card:first-child img');
    heroImages.forEach(img => {
      if (img.src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });
  };

  // Optimisation de la mémoire
  const memoryOptimization = () => {
    if (!PERFORMANCE_CONFIG.memoryCleanup) return;

    // Nettoyer les event listeners orphelins
    const cleanupOrphanedListeners = () => {
      document.querySelectorAll('[data-cleanup]').forEach(element => {
        if (!element.isConnected) {
          element.removeEventListener('click', element._clickHandler);
          element.removeEventListener('scroll', element._scrollHandler);
        }
      });
    };

    // Nettoyer périodiquement
    setInterval(cleanupOrphanedListeners, 30000); // 30 secondes

    // Optimiser les images hors viewport
    const optimizeOffscreenImages = optimizedScrollHandler(() => {
      document.querySelectorAll('img[src]').forEach(img => {
        const rect = img.getBoundingClientRect();
        const isOffscreen = rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2;
        
        if (isOffscreen && !img.dataset.optimized) {
          // Marquer comme optimisée pour éviter de répéter
          img.dataset.optimized = 'true';
          
          // Réduire la qualité pour les images lointaines (si applicable)
          if (img.src.includes('.jpg')) {
            const lowQualitySrc = img.src.replace('.jpg', '_low.jpg');
            const testImg = new Image();
            testImg.onload = () => {
              img.dataset.originalSrc = img.src;
              img.src = lowQualitySrc;
            };
            testImg.onerror = () => {
              // Garde l'image originale si pas de version low quality
            };
            testImg.src = lowQualitySrc;
          }
        }
      });
    });

    window.addEventListener('scroll', optimizeOffscreenImages, { passive: true });
  };

  // Optimisation des animations CSS
  const optimizeAnimations = () => {
    // Réduire les animations sur les appareils lents
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.documentElement.style.setProperty('--boutique-transition', '0.15s ease');
      document.documentElement.style.setProperty('--boutique-transition-fast', '0.1s ease');
    }

    // Désactiver les animations en cas de préférence utilisateur
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Optimisation du JavaScript
  const optimizeJavaScript = () => {
    // Retarder l'exécution des scripts non critiques
    const deferredScripts = [
      '/js/boutique-premium.js',
      '/js/currency-converter.js'
    ];

    deferredScripts.forEach(src => {
      const script = document.querySelector(`script[src*="${src}"]`);
      if (script) {
        script.defer = true;
      }
    });

    // Optimiser les event listeners avec passive
    const optimizeEventListeners = () => {
      document.addEventListener('scroll', () => {}, { passive: true });
      document.addEventListener('touchstart', () => {}, { passive: true });
      document.addEventListener('touchmove', () => {}, { passive: true });
    };

    optimizeEventListeners();
  };

  // Monitoring de performance
  const performanceMonitoring = () => {
    if (!window.performance) return;

    // Mesurer le temps de chargement
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        
        console.log(`🚀 Performance Geek & Dragon:`);
        console.log(`   • Temps de chargement: ${loadTime}ms`);
        console.log(`   • DOM prêt: ${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`);
        
        // Envoyer les métriques (optionnel, pour analytics)
        if (loadTime > 3000) {
          console.warn('⚠️ Temps de chargement lent détecté');
        }
      }, 0);
    });

    // Observer les Core Web Vitals
    if ('web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  };

  // Initialisation des optimisations
  const initOptimizations = () => {
    // Optimisations immédiates
    optimizeAnimations();
    optimizeJavaScript();

    // Optimisations après DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        preloadCriticalResources();
        memoryOptimization();
        performanceMonitoring();
      });
    } else {
      preloadCriticalResources();
      memoryOptimization();
      performanceMonitoring();
    }

    console.log('✅ Optimisations de performance activées');
  };

  // Démarrer les optimisations
  initOptimizations();

})();
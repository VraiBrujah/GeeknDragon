/* ========================================================================
   OPTIMISATIONS DE PERFORMANCE
   ===================================================================== */

(() => {
  'use strict';

  // Préchargement intelligent des ressources critiques
  const preloadCriticalResources = () => {
    const criticalImages = [
      '/images/geekndragon_logo_blanc.png',
      '/images/bg_texture.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  };

  // Lazy loading amélioré avec Intersection Observer
  const setupAdvancedLazyLoading = () => {
    if ('loading' in HTMLImageElement.prototype) {
      // Le navigateur supporte le lazy loading natif
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
          }

          img.classList.remove('lazy-loading');
          img.classList.add('lazy-loaded');
          
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
      img.classList.add('lazy-loading');
      imageObserver.observe(img);
    });
  };

  // Optimisation des vidéos
  const optimizeVideos = () => {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
      // Précharge seulement les métadonnées
      video.preload = 'metadata';
      
      // Pause automatique quand la vidéo sort du viewport
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting && !video.paused) {
            video.pause();
          }
        });
      }, { threshold: 0.25 });
      
      videoObserver.observe(video);
    });
  };

  // Optimisation des polices
  const optimizeFonts = () => {
    // Précharge les polices critiques
    const fontPreloads = [
      { href: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap', as: 'style' },
      { href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap', as: 'style' }
    ];

    fontPreloads.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = font.as;
      link.href = font.href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  };

  // Nettoyage périodique de la mémoire
  const setupMemoryManagement = () => {
    let lastCleanup = Date.now();
    
    const cleanup = () => {
      const now = Date.now();
      
      // Nettoyage toutes les 5 minutes
      if (now - lastCleanup > 300000) {
        // Nettoie les event listeners orphelins
        window.GD?.cleanupOrphanedListeners?.();
        
        // Force le garbage collection si disponible
        if (window.gc && typeof window.gc === 'function') {
          window.gc();
        }
        
        lastCleanup = now;
      }
    };

    // Vérifie périodiquement
    setInterval(cleanup, 60000); // Toutes les minutes
  };

  // Monitoring des performances
  const setupPerformanceMonitoring = () => {
    if (!window.performance || !window.performance.observe) {
      return;
    }

    const observer = new PerformanceObserver(list => {
      list.getEntries().forEach(entry => {
        // Log des ressources lentes
        if (entry.duration > 1000) {
          console.warn(`[PERF] Ressource lente détectée: ${entry.name} (${entry.duration}ms)`);
        }
        
        // Log des Layout Shifts importants
        if (entry.entryType === 'layout-shift' && entry.value > 0.1) {
          console.warn(`[PERF] Layout shift important: ${entry.value}`);
        }
      });
    });

    // Surveille différents types de performances
    try {
      observer.observe({ entryTypes: ['navigation', 'resource', 'layout-shift'] });
    } catch (e) {
      // Fallback si certains types ne sont pas supportés
      console.debug('[PERF] Certaines métriques de performance ne sont pas disponibles');
    }
  };

  // Service Worker pour la mise en cache (optionnel)
  const registerServiceWorker = () => {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[SW] Service Worker enregistré:', registration);
        })
        .catch(error => {
          console.log('[SW] Échec d\'enregistrement du Service Worker:', error);
        });
    }
  };

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    preloadCriticalResources();
    setupAdvancedLazyLoading();
    optimizeVideos();
    optimizeFonts();
    setupMemoryManagement();
    
    if (window.location.hostname !== 'localhost') {
      setupPerformanceMonitoring();
      // registerServiceWorker(); // À activer en production
    }
  });

  // Expose les utilitaires
  window.GD = window.GD || {};
  window.GD.performance = {
    preloadCriticalResources,
    setupAdvancedLazyLoading,
    optimizeVideos
  };

})();
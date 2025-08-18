// Lazy loading amélioré avec Intersection Observer
(function() {
  'use strict';

  // Configuration
  const config = {
    rootMargin: '50px 0px', // Charger 50px avant l'entrée dans le viewport
    threshold: 0.01,
    loadDelay: 100 // Délai pour éviter le chargement lors du scroll rapide
  };

  // Map pour stocker les timeouts
  const loadTimeouts = new Map();

  // Créer l'observer
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        // Utiliser un timeout pour éviter le chargement lors du scroll rapide
        const timeout = setTimeout(() => {
          loadImage(img);
          observer.unobserve(img);
          loadTimeouts.delete(img);
        }, config.loadDelay);

        loadTimeouts.set(img, timeout);
      } else {
        // Annuler le chargement si l'image sort du viewport avant le délai
        if (loadTimeouts.has(entry.target)) {
          clearTimeout(loadTimeouts.get(entry.target));
          loadTimeouts.delete(entry.target);
        }
      }
    });
  }, config);

  // Fonction pour charger une image
  function loadImage(img) {
    // Pour les images avec data-src
    if (img.dataset.src) {
      // Précharger l'image
      const tempImg = new Image();
      tempImg.onload = function() {
        img.src = img.dataset.src;
        img.classList.add('lazy-loaded');
        delete img.dataset.src;

        // Si c'est une image de fond
        if (img.dataset.bg === 'true') {
          img.style.backgroundImage = `url(${img.src})`;
        }
      };
      tempImg.src = img.dataset.src;
    }

    // Pour les images avec srcset
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      delete img.dataset.srcset;
    }
  }

  // Observer pour les vidéos
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target;

      if (entry.isIntersecting) {
        // Charger la vidéo si elle entre dans le viewport
        if (!video.src && video.dataset.src) {
          video.src = video.dataset.src;
          video.load();
          delete video.dataset.src;
        }

        // Auto-play pour les vidéos en boucle muettes
        if (video.muted && video.loop && video.paused) {
          video.play().catch(() => {
            // Autoplay prevented - normal behavior
          });
        }
      } else {
        // Mettre en pause si hors viewport pour économiser les ressources
        if (!video.paused && video.muted && video.loop) {
          video.pause();
        }
      }
    });
  }, {
    rootMargin: '0px',
    threshold: 0.25 // La vidéo doit être visible à 25% pour démarrer
  });

  // Fonction pour initialiser le lazy loading
  function initLazyLoading() {
    // Images avec lazy loading natif du navigateur comme fallback
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      // Si le navigateur ne supporte pas loading="lazy"
      if (!('loading' in HTMLImageElement.prototype)) {
        imageObserver.observe(img);
      }
    });

    // Images avec data-src (pour un contrôle plus précis)
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    // Vidéos
    const videos = document.querySelectorAll('video[data-src], video:not([data-no-lazy])');
    videos.forEach(video => {
      video.preload = 'none'; // Ne pas précharger par défaut
      videoObserver.observe(video);
    });
  }

  // Optimisation des images de hero
  function optimizeHeroImages() {
    const heroImages = document.querySelectorAll('.hero-videos video, [data-hero-image]');
    heroImages.forEach(media => {
      if (media.tagName === 'VIDEO') {
        // Pour les vidéos hero, précharger seulement les métadonnées
        media.preload = 'metadata';

        // Charger progressivement après le chargement initial
        if (document.readyState === 'complete') {
          setTimeout(() => {
            media.preload = 'auto';
            media.load();
          }, 1000);
        }
      }
    });
  }

  // Optimisation des images de produits
  function optimizeProductImages() {
    const productImages = document.querySelectorAll('.card-product img, .product-media');
    productImages.forEach(img => {
      // Ajouter des dimensions si manquantes pour éviter le layout shift
      if (!img.width && img.naturalWidth) {
        img.width = img.naturalWidth;
      }
      if (!img.height && img.naturalHeight) {
        img.height = img.naturalHeight;
      }

      // Utiliser decoding async pour ne pas bloquer le thread principal
      img.decoding = 'async';
    });
  }

  // Préchargement intelligent des images critiques
  function preloadCriticalImages() {
    // Précharger le logo et les premières images visibles
    const criticalImages = [
      '/images/optimized-modern/webp/brand-geekndragon-main.webp',
      '/images/optimized-modern/webp/cartes-equipement.webp',
      '/images/optimized-modern/webp/coin-copper-10.webp',
      '/images/optimized-modern/webp/triptyque-fiche.webp'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }

  // Optimisations supplémentaires après le chargement complet
  window.addEventListener('load', () => {
    optimizeHeroImages();
    optimizeProductImages();
  });

  // Précharger les images critiques immédiatement
  preloadCriticalImages();

  // Nettoyer les timeouts lors du déchargement de la page
  window.addEventListener('beforeunload', () => {
    loadTimeouts.forEach(timeout => clearTimeout(timeout));
    loadTimeouts.clear();
  });
})();

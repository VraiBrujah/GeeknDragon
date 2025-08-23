// Lazy loading amélioré avec Intersection Observer
(function lazyLoadEnhanced() {
  // Configuration
  const config = {
    rootMargin: '50px 0px',
    threshold: 0.01,
    loadDelay: 100,
  };

  // Map pour stocker les timeouts
  const loadTimeouts = new Map();

  // Fonction pour charger une image
  function loadImage(img) {
    // Pour les images avec data-src
    if (img.dataset.src) {
      const tempImg = new Image();
      tempImg.onload = function handleImageLoad() {
        const imageElement = img;
        imageElement.src = imageElement.dataset.src;
        imageElement.classList.add('lazy-loaded');
        delete imageElement.dataset.src;

        if (imageElement.dataset.bg === 'true') {
          imageElement.style.backgroundImage = `url(${imageElement.src})`;
        }
      };
      tempImg.src = img.dataset.src;
    }

    if (img.dataset.srcset) {
      const imageElement = img;
      imageElement.srcset = imageElement.dataset.srcset;
      delete imageElement.dataset.srcset;
    }
  }

  // Créer l'observer après la définition de loadImage
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const timeout = setTimeout(() => {
          loadImage(img);
          observer.unobserve(img);
          loadTimeouts.delete(img);
        }, config.loadDelay);
        loadTimeouts.set(img, timeout);
      } else if (loadTimeouts.has(entry.target)) {
        clearTimeout(loadTimeouts.get(entry.target));
        loadTimeouts.delete(entry.target);
      }
    });
  }, config);

  // Observer pour les vidéos
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        if (!video.src && video.dataset.src) {
          const videoElement = video;
          videoElement.src = videoElement.dataset.src;
          videoElement.load();
          delete videoElement.dataset.src;
        }

        if (video.muted && video.loop && video.paused) {
          video.play().catch(() => {
            // Autoplay prevented - this is expected behavior
          });
        }
      } else if (!video.paused && video.muted && video.loop) {
        video.pause();
      }
    });
  }, {
    rootMargin: '0px',
    threshold: 0.25,
  });

  // Fonction pour initialiser le lazy loading
  function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach((img) => {
      if (!('loading' in HTMLImageElement.prototype)) {
        imageObserver.observe(img);
      }
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    const videos = document.querySelectorAll('video[data-src], video:not([data-no-lazy])');
    videos.forEach((video) => {
      const videoElement = video;
      videoElement.preload = 'none';
      videoObserver.observe(videoElement);
    });
  }

  // Optimisation des images de hero
  function optimizeHeroImages() {
    const heroImages = document.querySelectorAll('.hero-videos video, [data-hero-image]');
    heroImages.forEach((media) => {
      if (media.tagName === 'VIDEO') {
        const videoElement = media;
        videoElement.preload = 'metadata';

        if (document.readyState === 'complete') {
          setTimeout(() => {
            videoElement.preload = 'auto';
            videoElement.load();
          }, 1000);
        }
      }
    });
  }

  // Optimisation des images de produits
  function optimizeProductImages() {
    const productImages = document.querySelectorAll('.card-product img, .product-media');
    productImages.forEach((img) => {
      const imageElement = img;
      imageElement.loading = 'lazy';
      imageElement.decoding = 'async';
    });
  }

  // Initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initLazyLoading();
      optimizeHeroImages();
      optimizeProductImages();
    });
  } else {
    initLazyLoading();
    optimizeHeroImages();
    optimizeProductImages();
  }
}());

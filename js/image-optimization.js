// image-optimization.js
// Optimisation intelligente des images pour de meilleures performances

document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer pour le lazy loading avancé
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Préchargement avec priorité intelligente
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        
        // Optimisation: fade-in smooth après chargement
        img.addEventListener('load', () => {
          img.style.opacity = '1';
          img.style.filter = 'blur(0)';
        }, { once: true });
        
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px', // Précharger 50px avant d'être visible
    threshold: 0.1
  });

  // Observer toutes les images avec lazy loading
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    // Style initial pour les transitions
    img.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
    img.style.opacity = '0';
    img.style.filter = 'blur(5px)';
    
    // Observer l'image si elle n'est pas déjà chargée
    if (img.complete && img.naturalHeight !== 0) {
      img.style.opacity = '1';
      img.style.filter = 'blur(0)';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
        img.style.filter = 'blur(0)';
      }, { once: true });
    }
  });

  // Optimisation des vidéos produits
  document.querySelectorAll('video.product-media').forEach(video => {
    // Pause/lecture basée sur la visibilité
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });
    
    videoObserver.observe(video);
    
    // Optimisation mémoire: nettoyer l'observer quand l'élément est retiré
    video.addEventListener('remove', () => {
      videoObserver.unobserve(video);
    });
  });

  // Préchargement intelligent des images critiques
  const criticalImages = document.querySelectorAll('.hero-boutique img, .product-media:first-of-type');
  criticalImages.forEach(img => {
    if (img.loading !== 'eager') {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  });

  // Optimisation: réduire la qualité des images sur mobile
  if (window.innerWidth < 768) {
    document.querySelectorAll('img').forEach(img => {
      const src = img.src || img.dataset.src;
      if (src && src.includes('.jpg')) {
        // Tentative de charger une version mobile si disponible
        const mobileSrc = src.replace('.jpg', '_mobile.jpg');
        const testImg = new Image();
        testImg.onload = () => {
          img.src = mobileSrc;
        };
        testImg.src = mobileSrc;
      }
    });
  }

  // Gestion des erreurs d'images
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
      const img = e.target;
      // Image de fallback ou placeholder
      img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub24gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
      img.alt = 'Image non disponible';
    }
  }, true);

  // Performance: nettoyage mémoire pour les images hors écran
  let cleanupTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(cleanupTimeout);
    cleanupTimeout = setTimeout(() => {
      document.querySelectorAll('img').forEach(img => {
        const rect = img.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
        
        if (!isVisible && img.src) {
          // Garder seulement les images récemment visibles en cache
          img.dataset.originalSrc = img.src;
          // Ne pas vider src pour éviter les re-téléchargements constants
        }
      });
    }, 1000);
  });
});

// Préchargement intelligent pour les pages suivantes
const preloadCriticalResources = () => {
  // Précharger les images de la première carte produit visible
  const firstProductCard = document.querySelector('.product-card');
  if (firstProductCard) {
    const img = firstProductCard.querySelector('img');
    if (img && !img.complete) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    }
  }
};

// Démarrer le préchargement après le chargement initial
setTimeout(preloadCriticalResources, 1000);
// ========================================================================
// GALERIE PRODUIT MODERNE - E-COMMERCE
// Gestion avancée des images avec zoom, fullscreen et navigation
// ========================================================================

(function productGallery() {
  // Configuration
  const config = {
    zoomLevel: 2,
    transitionDuration: 300,
    swipeThreshold: 50,
    autoCloseDelay: 5000,
  };

  // État du module
  const state = {
    currentIndex: 0,
    images: [],
    isZoomed: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  };

  // Éléments DOM
  const elements = {};

  // Utilitaires
  function setupImageData() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    state.images = Array.from(thumbnails).map((thumb) => ({
      src: thumb.dataset.src || thumb.src,
      alt: thumb.alt || '',
      type: thumb.dataset.type || 'image',
    }));
  }

  function switchToImage(index) {
    if (index < 0 || index >= state.images.length) return;

    state.currentIndex = index;
    const image = state.images[index];

    if (elements.mainMedia) {
      elements.mainMedia.src = image.src;
      elements.mainMedia.alt = image.alt;
    }

    // Mettre à jour les thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
      if (i === index) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  function toggleZoom() {
    if (!elements.mainMedia) return;

    state.isZoomed = !state.isZoomed;
    elements.mainMedia.style.transform = state.isZoomed
      ? `scale(${config.zoomLevel})`
      : 'scale(1)';
  }

  function openFullscreen() {
    if (!elements.fullscreenModal) return;

    elements.fullscreenModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    if (elements.fullscreenMedia) {
      const currentImage = state.images[state.currentIndex];
      elements.fullscreenMedia.src = currentImage.src;
      elements.fullscreenMedia.alt = currentImage.alt;
    }
  }

  function closeFullscreen() {
    if (!elements.fullscreenModal) return;

    elements.fullscreenModal.style.display = 'none';
    document.body.style.overflow = '';
    state.isZoomed = false;
  }

  function navigateGallery(direction) {
    const newIndex = state.currentIndex + direction;
    if (newIndex >= 0 && newIndex < state.images.length) {
      switchToImage(newIndex);
    }
  }

  function bindEvents() {
    // Navigation des thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => switchToImage(index));
    });

    // Boutons de contrôle
    if (elements.zoomBtn) {
      elements.zoomBtn.addEventListener('click', toggleZoom);
    }

    if (elements.fullscreenBtn) {
      elements.fullscreenBtn.addEventListener('click', openFullscreen);
    }

    if (elements.closeBtn) {
      elements.closeBtn.addEventListener('click', closeFullscreen);
    }

    // Navigation
    if (elements.fsPrev) {
      elements.fsPrev.addEventListener('click', () => navigateGallery(-1));
    }

    if (elements.fsNext) {
      elements.fsNext.addEventListener('click', () => navigateGallery(1));
    }

    // Clavier
    document.addEventListener('keydown', (e) => {
      if (elements.fullscreenModal && elements.fullscreenModal.style.display === 'flex') {
        switch (e.key) {
          case 'Escape':
            closeFullscreen();
            break;
          case 'ArrowLeft':
            navigateGallery(-1);
            break;
          case 'ArrowRight':
            navigateGallery(1);
            break;
          default:
            break;
        }
      }
    });
  }

  function setupElements() {
    elements.mainMedia = document.getElementById('main-media');
    elements.thumbnails = document.querySelectorAll('.thumbnail');
    elements.fullscreenModal = document.getElementById('fullscreen-modal');
    elements.fullscreenMedia = document.getElementById('fullscreen-media');
    elements.zoomBtn = document.getElementById('zoom-btn');
    elements.fullscreenBtn = document.getElementById('fullscreen-btn');
    elements.closeBtn = document.getElementById('close-fullscreen');
    elements.fsPrev = document.getElementById('fs-prev');
    elements.fsNext = document.getElementById('fs-next');
  }

  // Initialisation
  function init() {
    if (!document.querySelector('.product-gallery-container')) return;

    setupElements();
    setupImageData();
    bindEvents();
  }

  // Lancement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());

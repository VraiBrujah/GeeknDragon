// ========================================================================
// SYSTÈME DE GALERIE UNIVERSELLE POUR TOUTES LES IMAGES
// Application automatique sur toutes les images produit du site
// ========================================================================

(function universalImageGallery() {
  // Configuration globale
  const config = {
    excludeSelectors: [
      '.logo',
      '.site-logo',
      '[data-no-gallery]',
      '.payment-icons img',
      '.social-icon',
      '.header img',
      'svg',
      '.actualites img',
      '.news img',
      '#actus img',
      '.testimonials img',
      '.team img',
      'img[src*="logo"]',
      'img[src*="favicon"]',
      'img[src*="icon"]',
      'img[src*=".svg"]',
      'img[alt*="Logo"]',
      'img[alt*="Icon"]',
    ],
    productSelectors: [
      '.product-media',
      '.card-product img',
      '[data-gallery]',
      '.gallery-image',
      '.product-image',
    ],
    zoomLevel: 2.5,
    transitionDuration: 300,
    swipeThreshold: 50,
  };

  // État global
  const state = {
    currentImageIndex: 0,
    galleryImages: [],
    isModalOpen: false,
    isZoomed: false,
  };

  // Éléments DOM
  let modal = null;
  let modalImg = null;
  let closeBtn = null;
  let prevBtn = null;
  let nextBtn = null;

  // Vérifier si une image doit être exclue
  function isExcluded(img) {
    return config.excludeSelectors.some((selector) => {
      try {
        return img.matches(selector) || img.closest(selector);
      } catch (e) {
        return false;
      }
    });
  }

  // Injecter les styles CSS
  function injectStyles() {
    if (document.getElementById('universal-gallery-styles')) return;

    const style = document.createElement('style');
    style.id = 'universal-gallery-styles';
    style.textContent = `
      .universal-gallery-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.9);
        animation: fadeIn 0.3s ease;
      }
      .gallery-content {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .gallery-main-image {
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        transition: transform 0.3s ease;
        cursor: zoom-in;
      }
      .gallery-main-image.zoomed {
        transform: scale(2.5);
        cursor: zoom-out;
      }
      .gallery-close {
        position: absolute;
        top: 20px;
        right: 30px;
        color: white;
        font-size: 30px;
        cursor: pointer;
        z-index: 10001;
      }
      .gallery-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        font-size: 30px;
        padding: 10px 15px;
        cursor: pointer;
        border-radius: 3px;
        transition: background 0.3s ease;
      }
      .gallery-nav:hover {
        background: rgba(255,255,255,0.4);
      }
      .gallery-prev { left: 20px; }
      .gallery-next { right: 20px; }
      .gallery-counter {
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        background: rgba(0,0,0,0.7);
        padding: 5px 15px;
        border-radius: 15px;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  // Mettre à jour la modal
  function updateModal() {
    const currentImage = state.galleryImages[state.currentImageIndex];
    if (currentImage && modalImg) {
      modalImg.src = currentImage.src;
      modalImg.alt = currentImage.alt || 'Image de galerie';

      const counter = modal.querySelector('.gallery-counter');
      if (counter) {
        counter.querySelector('.current').textContent = state.currentImageIndex + 1;
        counter.querySelector('.total').textContent = state.galleryImages.length;
      }

      prevBtn.style.display = state.currentImageIndex > 0 ? 'block' : 'none';
      nextBtn.style.display = state.currentImageIndex < state.galleryImages.length - 1 ? 'block' : 'none';
    }
  }

  // Navigation dans la galerie
  function navigateGallery(direction) {
    const newIndex = state.currentImageIndex + direction;
    if (newIndex >= 0 && newIndex < state.galleryImages.length) {
      state.currentImageIndex = newIndex;
      updateModal();
    }
  }

  // Basculer le zoom
  function toggleZoom() {
    state.isZoomed = !state.isZoomed;
    modalImg.classList.toggle('zoomed', state.isZoomed);
  }

  // Fermer la galerie
  function closeGallery() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      state.isModalOpen = false;
      state.isZoomed = false;
      if (modalImg) {
        modalImg.classList.remove('zoomed');
      }
    }
  }

  // Gestion du clavier
  function handleKeyboard(e) {
    if (!state.isModalOpen) return;

    switch (e.key) {
      case 'Escape':
        closeGallery();
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

  // Attacher les événements de la modal
  function attachModalEvents() {
    closeBtn.addEventListener('click', closeGallery);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGallery();
    });

    prevBtn.addEventListener('click', () => navigateGallery(-1));
    nextBtn.addEventListener('click', () => navigateGallery(1));
    modalImg.addEventListener('click', toggleZoom);
    document.addEventListener('keydown', handleKeyboard);
  }

  // Créer la modal
  function createModal() {
    if (modal) return;

    modal = document.createElement('div');
    modal.className = 'universal-gallery-modal';
    modal.innerHTML = `
      <div class="gallery-content">
        <span class="gallery-close">&times;</span>
        <img class="gallery-main-image" alt="Gallery image">
        <button class="gallery-nav gallery-prev">&#8249;</button>
        <button class="gallery-nav gallery-next">&#8250;</button>
        <div class="gallery-counter">
          <span class="current">1</span> / <span class="total">1</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modalImg = modal.querySelector('.gallery-main-image');
    closeBtn = modal.querySelector('.gallery-close');
    prevBtn = modal.querySelector('.gallery-prev');
    nextBtn = modal.querySelector('.gallery-next');

    injectStyles();
    attachModalEvents();
  }

  // Obtenir toutes les images de galerie
  function getAllGalleryImages() {
    const allImages = document.querySelectorAll('img');
    return Array.from(allImages).filter((img) => {
      if (isExcluded(img)) return false;

      return config.productSelectors.some((selector) => {
        try {
          return img.matches(selector) || img.closest(selector);
        } catch (e) {
          return false;
        }
      });
    });
  }

  // Ouvrir la galerie
  function openGallery(clickedImage) {
    createModal();

    state.galleryImages = getAllGalleryImages();
    state.currentImageIndex = state.galleryImages.indexOf(clickedImage);
    state.isModalOpen = true;
    state.isZoomed = false;

    if (state.currentImageIndex === -1) {
      state.currentImageIndex = 0;
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    updateModal();
  }

  // Initialiser le système de galerie
  function initUniversalGallery() {
    config.productSelectors.forEach((selector) => {
      const images = document.querySelectorAll(selector);
      images.forEach((img) => {
        if (!isExcluded(img) && !img.dataset.galleryEnabled) {
          const imageElement = img;
          imageElement.style.cursor = 'zoom-in';
          imageElement.addEventListener('click', () => openGallery(imageElement));
          imageElement.dataset.galleryEnabled = 'true';
        }
      });
    });
  }

  // Initialisation
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUniversalGallery);
  } else {
    initUniversalGallery();
  }

  // Observer pour les nouvelles images ajoutées dynamiquement
  const observer = new MutationObserver(() => {
    initUniversalGallery();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}());

// ========================================================================
// SYSTÈME DE GALERIE UNIVERSELLE POUR TOUTES LES IMAGES
// Application automatique sur toutes les images produit du site
// ========================================================================

(function() {
  'use strict';

  // Configuration globale
  const config = {
    // Sélecteurs à exclure
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
      'img[alt*="Icon"]'
    ],
    
    // Sélecteurs à inclure
    includeSelectors: [
      '.card-product img',
      '.product-card img',
      '.product-media',
      '.boutique img',
      '#produits img',
      '#boutique img',
      '.product-image',
      '.property-image',
      '.gallery-image',
      'img[data-gallery]',
      '.feature-card img'
    ],
    
    // Options de galerie
    galleryOptions: {
      zoomLevel: 2,
      animationDuration: 300,
      backdropOpacity: 0.95,
      enableZoom: true,
      enableFullscreen: true,
      enableNavigation: true,
      enableKeyboard: true,
      enableTouch: true
    }
  };

  // État global
  let currentImage = null;
  let currentIndex = 0;
  let galleryImages = [];
  let modalCreated = false;
  let modal, modalImg, modalCaption, prevBtn, nextBtn, zoomBtn, closeBtn;

  // ========================================================================
  // INITIALISATION
  // ========================================================================
  
  function init() {
    console.log('🎨 Initialisation de la galerie universelle...');
    
    // Créer la modal si elle n'existe pas
    if (!modalCreated) {
      createModal();
    }
    
    // Appliquer la galerie aux images
    applyGalleryToImages();
    
    // Observer pour les nouvelles images (contenu dynamique)
    observeNewImages();
    
    console.log('✅ Galerie universelle initialisée');
  }

  // ========================================================================
  // CRÉATION DE LA MODAL
  // ========================================================================
  
  function createModal() {
    // Container modal
    modal = document.createElement('div');
    modal.className = 'universal-gallery-modal';
    modal.innerHTML = `
      <div class="ugm-content">
        <button class="ugm-close" aria-label="Fermer">&times;</button>
        <button class="ugm-prev" aria-label="Image précédente">‹</button>
        <button class="ugm-next" aria-label="Image suivante">›</button>
        <button class="ugm-zoom" aria-label="Zoom">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
          </svg>
        </button>
        <div class="ugm-image-container">
          <img class="ugm-image" alt="">
        </div>
        <div class="ugm-caption"></div>
        <div class="ugm-counter"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Récupérer les éléments
    modalImg = modal.querySelector('.ugm-image');
    modalCaption = modal.querySelector('.ugm-caption');
    closeBtn = modal.querySelector('.ugm-close');
    prevBtn = modal.querySelector('.ugm-prev');
    nextBtn = modal.querySelector('.ugm-next');
    zoomBtn = modal.querySelector('.ugm-zoom');
    
    // Attacher les événements
    attachModalEvents();
    
    // Ajouter les styles CSS
    injectStyles();
    
    modalCreated = true;
  }

  // ========================================================================
  // INJECTION DES STYLES CSS
  // ========================================================================
  
  function injectStyles() {
    if (document.getElementById('universal-gallery-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'universal-gallery-styles';
    styles.innerHTML = `
      /* Modal Gallery */
      .universal-gallery-modal {
        display: none;
        position: fixed;
        z-index: 99999;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        animation: fadeIn 0.3s ease;
      }
      
      .universal-gallery-modal.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .ugm-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }
      
      .ugm-image-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
      }
      
      .ugm-image {
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        cursor: zoom-in;
        transition: transform 0.3s ease;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      }
      
      .ugm-image.zoomed {
        transform: scale(2);
        cursor: zoom-out;
      }
      
      .ugm-close, .ugm-prev, .ugm-next, .ugm-zoom {
        position: absolute;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }
      
      .ugm-close:hover, .ugm-prev:hover, .ugm-next:hover, .ugm-zoom:hover {
        background: rgba(139, 92, 246, 0.8);
        transform: scale(1.1);
      }
      
      .ugm-close {
        top: 20px;
        right: 20px;
        font-size: 32px;
      }
      
      .ugm-prev {
        left: 20px;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .ugm-next {
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .ugm-zoom {
        bottom: 20px;
        right: 20px;
      }
      
      .ugm-caption {
        text-align: center;
        color: white;
        padding: 15px;
        font-size: 16px;
        max-width: 600px;
        margin: 0 auto;
      }
      
      .ugm-counter {
        position: absolute;
        bottom: 20px;
        left: 20px;
        color: white;
        background: rgba(0, 0, 0, 0.7);
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
      }
      
      /* Images cliquables */
      .gallery-enabled {
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }
      
      .gallery-enabled:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }
      
      .gallery-enabled::after {
        content: '';
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
        background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' fill='white' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: center;
      }
      
      .gallery-enabled:hover::after {
        opacity: 1;
      }
      
      /* Animations */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideIn {
        from { transform: translateX(50px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .ugm-close, .ugm-prev, .ugm-next, .ugm-zoom {
          width: 36px;
          height: 36px;
          font-size: 20px;
        }
        
        .ugm-prev { left: 10px; }
        .ugm-next { right: 10px; }
        .ugm-close { top: 10px; right: 10px; }
        .ugm-zoom { bottom: 10px; right: 10px; }
        
        .ugm-caption { font-size: 14px; padding: 10px; }
        .ugm-counter { font-size: 12px; padding: 6px 12px; }
      }
    `;
    
    document.head.appendChild(styles);
  }

  // ========================================================================
  // APPLICATION DE LA GALERIE AUX IMAGES
  // ========================================================================
  
  function applyGalleryToImages() {
    // Récupérer toutes les images à inclure
    const includeImages = [];
    config.includeSelectors.forEach(selector => {
      const images = document.querySelectorAll(selector);
      images.forEach(img => {
        if (!isExcluded(img) && !img.classList.contains('gallery-enabled')) {
          includeImages.push(img);
        }
      });
    });
    
    // Appliquer la galerie
    includeImages.forEach((img, index) => {
      // Marquer comme activée
      img.classList.add('gallery-enabled');
      img.dataset.galleryIndex = index;
      
      // Ajouter l'événement click
      img.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openGallery(this, includeImages);
      });
    });
    
    console.log(`✅ Galerie appliquée à ${includeImages.length} images`);
  }

  // ========================================================================
  // VÉRIFICATION D'EXCLUSION
  // ========================================================================
  
  function isExcluded(img) {
    // Vérifier chaque sélecteur d'exclusion
    for (const selector of config.excludeSelectors) {
      if (img.matches(selector)) {
        return true;
      }
      // Vérifier aussi les parents
      if (img.closest(selector)) {
        return true;
      }
    }
    return false;
  }

  // ========================================================================
  // OUVERTURE DE LA GALERIE
  // ========================================================================
  
  function openGallery(img, allImages) {
    currentImage = img;
    galleryImages = allImages || [img];
    currentIndex = parseInt(img.dataset.galleryIndex) || 0;
    
    // Afficher l'image
    updateModal();
    
    // Activer la modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Mise à jour de la navigation
    updateNavigation();
  }

  // ========================================================================
  // MISE À JOUR DE LA MODAL
  // ========================================================================
  
  function updateModal() {
    const img = galleryImages[currentIndex];
    
    // Image
    modalImg.src = img.src;
    modalImg.alt = img.alt || '';
    modalImg.classList.remove('zoomed');
    
    // Caption
    const caption = img.alt || img.title || '';
    modalCaption.textContent = caption;
    modalCaption.style.display = caption ? 'block' : 'none';
    
    // Counter
    if (galleryImages.length > 1) {
      modal.querySelector('.ugm-counter').textContent = `${currentIndex + 1} / ${galleryImages.length}`;
      modal.querySelector('.ugm-counter').style.display = 'block';
    } else {
      modal.querySelector('.ugm-counter').style.display = 'none';
    }
    
    // Animation
    modalImg.style.animation = 'slideIn 0.3s ease';
    setTimeout(() => {
      modalImg.style.animation = '';
    }, 300);
  }

  // ========================================================================
  // MISE À JOUR DE LA NAVIGATION
  // ========================================================================
  
  function updateNavigation() {
    // Afficher/masquer les boutons
    prevBtn.style.display = galleryImages.length > 1 ? 'flex' : 'none';
    nextBtn.style.display = galleryImages.length > 1 ? 'flex' : 'none';
    
    // Désactiver si nécessaire
    prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
    nextBtn.style.opacity = currentIndex === galleryImages.length - 1 ? '0.5' : '1';
  }

  // ========================================================================
  // ÉVÉNEMENTS DE LA MODAL
  // ========================================================================
  
  function attachModalEvents() {
    // Fermeture
    closeBtn.addEventListener('click', closeGallery);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeGallery();
    });
    
    // Navigation
    prevBtn.addEventListener('click', () => navigateGallery(-1));
    nextBtn.addEventListener('click', () => navigateGallery(1));
    
    // Zoom
    zoomBtn.addEventListener('click', toggleZoom);
    modalImg.addEventListener('dblclick', toggleZoom);
    
    // Clavier
    document.addEventListener('keydown', handleKeyboard);
    
    // Touch/Swipe
    setupTouchEvents();
  }

  // ========================================================================
  // FERMETURE DE LA GALERIE
  // ========================================================================
  
  function closeGallery() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalImg.classList.remove('zoomed');
  }

  // ========================================================================
  // NAVIGATION
  // ========================================================================
  
  function navigateGallery(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < galleryImages.length) {
      currentIndex = newIndex;
      updateModal();
      updateNavigation();
    }
  }

  // ========================================================================
  // ZOOM
  // ========================================================================
  
  function toggleZoom() {
    modalImg.classList.toggle('zoomed');
  }

  // ========================================================================
  // GESTION CLAVIER
  // ========================================================================
  
  function handleKeyboard(e) {
    if (!modal.classList.contains('active')) return;
    
    switch(e.key) {
      case 'Escape':
        closeGallery();
        break;
      case 'ArrowLeft':
        navigateGallery(-1);
        break;
      case 'ArrowRight':
        navigateGallery(1);
        break;
      case ' ':
        e.preventDefault();
        toggleZoom();
        break;
    }
  }

  // ========================================================================
  // GESTION TACTILE
  // ========================================================================
  
  function setupTouchEvents() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    modalImg.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    modalImg.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe gauche - image suivante
          navigateGallery(1);
        } else {
          // Swipe droite - image précédente
          navigateGallery(-1);
        }
      }
    }
  }

  // ========================================================================
  // OBSERVER POUR CONTENU DYNAMIQUE
  // ========================================================================
  
  function observeNewImages() {
    const observer = new MutationObserver((mutations) => {
      let hasNewImages = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IMG' && !isExcluded(node)) {
              hasNewImages = true;
            }
            // Vérifier aussi les enfants
            const imgs = node.querySelectorAll('img');
            if (imgs.length > 0) {
              hasNewImages = true;
            }
          }
        });
      });
      
      if (hasNewImages) {
        // Réappliquer la galerie après un délai
        setTimeout(applyGalleryToImages, 100);
      }
    });
    
    // Observer le body pour les changements
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ========================================================================
  // INITIALISATION AU CHARGEMENT
  // ========================================================================
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Réinitialiser après le chargement complet (pour les images lazy)
  window.addEventListener('load', () => {
    setTimeout(applyGalleryToImages, 500);
  });

  // ========================================================================
  // API PUBLIQUE
  // ========================================================================
  
  window.UniversalGallery = {
    refresh: applyGalleryToImages,
    open: openGallery,
    close: closeGallery,
    config: config
  };

})();
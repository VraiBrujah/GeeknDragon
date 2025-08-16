// ========================================================================
// GALERIE PRODUIT MODERNE - E-COMMERCE
// Gestion avancée des images avec zoom, fullscreen et navigation
// ========================================================================

(function() {
  'use strict';

  // Configuration
  const config = {
    zoomLevel: 2,
    transitionDuration: 300,
    swipeThreshold: 50,
    autoCloseDelay: 5000
  };

  // Variables globales
  let currentIndex = 0;
  let images = [];
  let isZoomed = false;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let currentY = 0;

  // Éléments DOM
  let mainMedia, thumbnails, fullscreenModal, fullscreenMedia;
  let zoomBtn, fullscreenBtn, closeBtn;
  let thumbPrev, thumbNext, fsPrev, fsNext;

  // Initialisation
  function init() {
    if (!document.querySelector('.product-gallery-container')) return;

    // Récupération des éléments
    mainMedia = document.getElementById('main-media');
    thumbnails = document.querySelectorAll('.thumbnail');
    fullscreenModal = document.getElementById('fullscreen-modal');
    fullscreenMedia = document.getElementById('fullscreen-media');
    
    zoomBtn = document.getElementById('zoom-btn');
    fullscreenBtn = document.getElementById('fullscreen-btn');
    closeBtn = document.getElementById('close-fullscreen');
    
    thumbPrev = document.getElementById('thumb-prev');
    thumbNext = document.getElementById('thumb-next');
    fsPrev = document.getElementById('fs-prev');
    fsNext = document.getElementById('fs-next');

    if (!mainMedia) return;

    // Initialisation des données
    setupImageData();
    bindEvents();
    setupKeyboardNavigation();
    setupTouchGestures();
    
    console.log('✅ Galerie produit initialisée');
  }

  // Configuration des données d'images
  function setupImageData() {
    images = Array.from(thumbnails).map((thumb, index) => ({
      index,
      src: thumb.dataset.src,
      type: thumb.dataset.type,
      thumb: thumb
    }));
  }

  // Liaison des événements
  function bindEvents() {
    // Clic sur les thumbnails
    thumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => switchToImage(index));
    });

    // Boutons de contrôle
    if (zoomBtn) zoomBtn.addEventListener('click', toggleZoom);
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', openFullscreen);
    if (closeBtn) closeBtn.addEventListener('click', closeFullscreen);

    // Navigation thumbnails
    if (thumbPrev) thumbPrev.addEventListener('click', () => scrollThumbnails(-1));
    if (thumbNext) thumbNext.addEventListener('click', () => scrollThumbnails(1));

    // Navigation fullscreen
    if (fsPrev) fsPrev.addEventListener('click', () => navigateFullscreen(-1));
    if (fsNext) fsNext.addEventListener('click', () => navigateFullscreen(1));

    // Double-clic pour zoom
    if (mainMedia) {
      mainMedia.addEventListener('dblclick', toggleZoom);
      mainMedia.addEventListener('click', handleMainMediaClick);
    }

    // Fermeture modal par clic extérieur
    if (fullscreenModal) {
      fullscreenModal.addEventListener('click', (e) => {
        if (e.target === fullscreenModal) closeFullscreen();
      });
    }

    // Gestion du zoom par molette
    if (mainMedia) {
      mainMedia.addEventListener('wheel', handleWheelZoom, { passive: false });
    }
  }

  // Navigation clavier
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Si pas en fullscreen, ignorer
      if (fullscreenModal && fullscreenModal.classList.contains('hidden')) return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (isZoomed) {
            resetZoom();
          } else {
            closeFullscreen();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateFullscreen(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateFullscreen(1);
          break;
        case 'Space':
          e.preventDefault();
          toggleZoom();
          break;
      }
    });
  }

  // Gestes tactiles
  function setupTouchGestures() {
    if (!mainMedia) return;

    let touchStartX = 0;
    let touchStartY = 0;

    mainMedia.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    mainMedia.addEventListener('touchend', (e) => {
      if (!e.changedTouches[0]) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Swipe horizontal pour navigation
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > config.swipeThreshold) {
        if (deltaX > 0) {
          // Swipe droite - image précédente
          navigateImage(-1);
        } else {
          // Swipe gauche - image suivante
          navigateImage(1);
        }
      }
    }, { passive: true });
  }

  // Changer d'image
  function switchToImage(index) {
    if (index < 0 || index >= images.length) return;

    currentIndex = index;
    const imageData = images[index];

    // Mettre à jour l'image principale
    updateMainMedia(imageData);

    // Mettre à jour les thumbnails actifs
    updateActiveThumbnail(index);

    // Réinitialiser le zoom
    resetZoom();
  }

  // Mettre à jour le média principal
  function updateMainMedia(imageData) {
    if (!mainMedia) return;

    const isVideo = imageData.type === 'video';
    
    if (isVideo && mainMedia.tagName !== 'VIDEO') {
      // Remplacer img par video
      const newVideo = document.createElement('video');
      newVideo.id = 'main-media';
      newVideo.className = 'main-product-media';
      newVideo.controls = true;
      newVideo.muted = true;
      newVideo.playsInline = true;
      newVideo.dataset.type = 'video';
      newVideo.dataset.src = imageData.src;
      newVideo.src = imageData.src;
      
      mainMedia.parentNode.replaceChild(newVideo, mainMedia);
      mainMedia = newVideo;
      bindMainMediaEvents();
      
    } else if (!isVideo && mainMedia.tagName !== 'IMG') {
      // Remplacer video par img
      const newImg = document.createElement('img');
      newImg.id = 'main-media';
      newImg.className = 'main-product-media';
      newImg.dataset.type = 'image';
      newImg.dataset.src = imageData.src;
      newImg.src = imageData.src;
      newImg.alt = `Image ${currentIndex + 1}`;
      
      mainMedia.parentNode.replaceChild(newImg, mainMedia);
      mainMedia = newImg;
      bindMainMediaEvents();
      
    } else {
      // Même type, juste changer la source
      mainMedia.src = imageData.src;
      mainMedia.dataset.src = imageData.src;
    }

    // Mise à jour des badges
    updateMediaBadges(isVideo);
  }

  // Lier les événements au nouveau média
  function bindMainMediaEvents() {
    if (!mainMedia) return;
    
    mainMedia.addEventListener('dblclick', toggleZoom);
    mainMedia.addEventListener('click', handleMainMediaClick);
    mainMedia.addEventListener('wheel', handleWheelZoom, { passive: false });
  }

  // Mettre à jour les badges
  function updateMediaBadges(isVideo) {
    const badgesContainer = document.querySelector('.media-badges');
    if (!badgesContainer) return;

    badgesContainer.innerHTML = '';
    
    if (isVideo) {
      const videoBadge = document.createElement('span');
      videoBadge.className = 'badge badge-video';
      videoBadge.textContent = 'Vidéo';
      badgesContainer.appendChild(videoBadge);
    }
  }

  // Mettre à jour le thumbnail actif
  function updateActiveThumbnail(index) {
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  // Navigation entre images
  function navigateImage(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      switchToImage(newIndex);
    }
  }

  // Gestion du clic sur l'image principale
  function handleMainMediaClick(e) {
    if (isZoomed) {
      // Si zoomé, gérer le panning
      handleZoomPan(e);
    }
  }

  // Toggle zoom
  function toggleZoom() {
    if (mainMedia.tagName === 'VIDEO') return; // Pas de zoom sur vidéo
    
    if (isZoomed) {
      resetZoom();
    } else {
      applyZoom();
    }
  }

  // Appliquer le zoom
  function applyZoom() {
    if (!mainMedia || mainMedia.tagName === 'VIDEO') return;
    
    isZoomed = true;
    mainMedia.classList.add('zoomed');
    mainMedia.style.transform = `scale(${config.zoomLevel})`;
    
    // Changer le curseur
    mainMedia.style.cursor = 'grab';
    
    // Ajouter les événements de pan
    setupPanEvents();
  }

  // Réinitialiser le zoom
  function resetZoom() {
    if (!mainMedia) return;
    
    isZoomed = false;
    mainMedia.classList.remove('zoomed');
    mainMedia.style.transform = '';
    mainMedia.style.transformOrigin = 'center';
    mainMedia.style.cursor = 'pointer';
    
    // Retirer les événements de pan
    removePanEvents();
  }

  // Gestion du zoom par molette
  function handleWheelZoom(e) {
    if (mainMedia.tagName === 'VIDEO') return;
    
    e.preventDefault();
    
    if (e.deltaY < 0) {
      // Zoom in
      if (!isZoomed) applyZoom();
    } else {
      // Zoom out
      if (isZoomed) resetZoom();
    }
  }

  // Configuration des événements de pan
  function setupPanEvents() {
    mainMedia.addEventListener('mousedown', startPan);
    document.addEventListener('mousemove', doPan);
    document.addEventListener('mouseup', endPan);
  }

  // Retirer les événements de pan
  function removePanEvents() {
    mainMedia.removeEventListener('mousedown', startPan);
    document.removeEventListener('mousemove', doPan);
    document.removeEventListener('mouseup', endPan);
  }

  // Démarrer le pan
  function startPan(e) {
    if (!isZoomed) return;
    
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    mainMedia.style.cursor = 'grabbing';
    e.preventDefault();
  }

  // Effectuer le pan
  function doPan(e) {
    if (!isDragging || !isZoomed) return;
    
    e.preventDefault();
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    currentX += deltaX;
    currentY += deltaY;
    
    // Limiter le pan
    const maxPan = 100;
    currentX = Math.max(-maxPan, Math.min(maxPan, currentX));
    currentY = Math.max(-maxPan, Math.min(maxPan, currentY));
    
    mainMedia.style.transform = `scale(${config.zoomLevel}) translate(${currentX}px, ${currentY}px)`;
    
    startX = e.clientX;
    startY = e.clientY;
  }

  // Terminer le pan
  function endPan() {
    isDragging = false;
    if (mainMedia) {
      mainMedia.style.cursor = 'grab';
    }
  }

  // Gérer le panning par clic
  function handleZoomPan(e) {
    if (!isZoomed) return;
    
    const rect = mainMedia.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const offsetX = (x - centerX) / centerX * 50;
    const offsetY = (y - centerY) / centerY * 50;
    
    mainMedia.style.transformOrigin = `${50 + offsetX}% ${50 + offsetY}%`;
  }

  // Faire défiler les thumbnails
  function scrollThumbnails(direction) {
    const wrapper = document.getElementById('thumbnails-wrapper');
    if (!wrapper) return;
    
    const scrollAmount = 90; // largeur thumbnail + gap
    wrapper.scrollLeft += direction * scrollAmount;
  }

  // Ouvrir fullscreen
  function openFullscreen() {
    if (!fullscreenModal || !fullscreenMedia) return;
    
    fullscreenModal.classList.remove('hidden');
    updateFullscreenMedia();
    createFullscreenThumbnails();
    
    // Bloquer le scroll du body
    document.body.style.overflow = 'hidden';
  }

  // Fermer fullscreen
  function closeFullscreen() {
    if (!fullscreenModal) return;
    
    fullscreenModal.classList.add('hidden');
    resetZoom();
    
    // Restaurer le scroll du body
    document.body.style.overflow = '';
  }

  // Mettre à jour le média fullscreen
  function updateFullscreenMedia() {
    if (!fullscreenMedia) return;
    
    const currentImage = images[currentIndex];
    fullscreenMedia.src = currentImage.src;
    fullscreenMedia.alt = `Image ${currentIndex + 1}`;
  }

  // Navigation fullscreen
  function navigateFullscreen(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < images.length) {
      currentIndex = newIndex;
      updateFullscreenMedia();
      updateActiveThumbnail(currentIndex);
      updateFullscreenThumbnails();
    }
  }

  // Créer les thumbnails fullscreen
  function createFullscreenThumbnails() {
    const container = document.getElementById('fullscreen-thumbs');
    if (!container) return;
    
    container.innerHTML = '';
    
    images.forEach((img, index) => {
      const thumb = document.createElement('div');
      thumb.className = `thumbnail ${index === currentIndex ? 'active' : ''}`;
      thumb.dataset.index = index;
      
      if (img.type === 'video') {
        const video = document.createElement('video');
        video.src = img.src;
        video.className = 'thumbnail-media';
        video.muted = true;
        thumb.appendChild(video);
        
        const icon = document.createElement('div');
        icon.className = 'video-icon';
        icon.innerHTML = '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>';
        thumb.appendChild(icon);
      } else {
        const image = document.createElement('img');
        image.src = img.src;
        image.className = 'thumbnail-media';
        image.alt = `Thumbnail ${index + 1}`;
        thumb.appendChild(image);
      }
      
      thumb.addEventListener('click', () => {
        currentIndex = index;
        updateFullscreenMedia();
        updateActiveThumbnail(currentIndex);
        updateFullscreenThumbnails();
      });
      
      container.appendChild(thumb);
    });
  }

  // Mettre à jour les thumbnails fullscreen
  function updateFullscreenThumbnails() {
    const container = document.getElementById('fullscreen-thumbs');
    if (!container) return;
    
    const thumbs = container.querySelectorAll('.thumbnail');
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle('active', index === currentIndex);
    });
  }

  // Gestion du partage social
  function initSocialShare() {
    const shareButtons = document.querySelectorAll('.share-btn');
    if (!shareButtons.length) return;

    shareButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.dataset.share;
        handleShare(platform);
      });
    });
  }

  function handleShare(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const description = encodeURIComponent(
      document.querySelector('meta[name="description"]')?.content || ''
    );

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
      case 'copy':
        copyToClipboard(window.location.href);
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      // API moderne
      navigator.clipboard.writeText(text).then(() => {
        showCopyNotification();
      }).catch(() => {
        fallbackCopyTextToClipboard(text);
      });
    } else {
      // Fallback pour les navigateurs plus anciens
      fallbackCopyTextToClipboard(text);
    }
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      showCopyNotification();
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
    
    document.body.removeChild(textArea);
  }

  function showCopyNotification() {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = '✓ Lien copié !';
    
    document.body.appendChild(notification);
    
    // Afficher avec animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Masquer après 3 secondes
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Initialisation au chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initSocialShare();
    });
  } else {
    init();
    initSocialShare();
  }

  // Exposition pour debug
  window.ProductGallery = {
    switchToImage,
    toggleZoom,
    openFullscreen,
    closeFullscreen,
    navigateImage
  };

})();
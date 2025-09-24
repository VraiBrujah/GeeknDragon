/**
 * Version simplifiée et robuste de hero-videos.js
 * Évite les conflits avec les extensions navigateur
 */

(function() {
  'use strict';
  
  // Éviter l'exécution multiple
  if (window.__heroVideosSimpleInitialized) {
    return;
  }
  window.__heroVideosSimpleInitialized = true;

  // Gestionnaire d'erreur robuste
  const safePlay = (video) => {
    if (!video || video.readyState < 1) return;
    
    // Utiliser setTimeout pour éviter les conflits d'extension
    setTimeout(() => {
      try {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {}); // Ignorer silencieusement les erreurs
        }
      } catch (error) {
        // Ignorer silencieusement toutes les erreurs de lecture
      }
    }, 10);
  };

  const initHeroVideo = (container) => {
    const videos = container.dataset.videos;
    const mainVideo = container.dataset.main;
    
    let videoSrcs = [];
    
    // Parser les sources vidéo
    try {
      if (videos) {
        const parsed = JSON.parse(videos);
        if (Array.isArray(parsed)) {
          videoSrcs = parsed.filter(src => typeof src === 'string' && src.trim());
        }
      }
    } catch (e) {
      console.warn('Erreur parsing videos:', e);
    }
    
    // Ajouter la vidéo principale si elle existe
    if (mainVideo && mainVideo.trim()) {
      videoSrcs.unshift(mainVideo.trim());
    }
    
    if (videoSrcs.length === 0) {
      return;
    }
    
    // Créer une seule vidéo en boucle (approche la plus simple)
    const video = document.createElement('video');
    video.src = videoSrcs[0]; // Utiliser juste la première vidéo pour éviter la complexité
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.autoplay = true;
    video.preload = 'metadata';
    
    // Styles
    Object.assign(video.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      pointerEvents: 'none',
      zIndex: '-1'
    });
    
    // Gestion des erreurs simple
    video.onerror = () => {
      console.warn('Erreur chargement vidéo hero');
    };
    
    video.onloadeddata = () => {
      safePlay(video);
    };
    
    // Assurer la lecture continue
    video.onended = () => {
      video.currentTime = 0;
      safePlay(video);
    };
    
    // Relancer si nécessaire au retour de l'onglet
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && video.paused) {
        setTimeout(() => safePlay(video), 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibility);
    
    // Ajouter au container
    container.appendChild(video);
    
    // Démarrage différé pour éviter les conflits
    setTimeout(() => {
      if (video.paused && video.readyState >= 1) {
        safePlay(video);
      }
    }, 500);
  };

  // Initialiser au chargement du DOM
  const init = () => {
    const containers = document.querySelectorAll('.hero-videos');
    containers.forEach(container => {
      if (!container.hasAttribute('data-initialized')) {
        container.setAttribute('data-initialized', 'true');
        initHeroVideo(container);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
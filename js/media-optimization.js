/**
 * 🎬 OPTIMISATION MÉDIA AVANCÉE - GEEKNDRAGON
 * Compression, lazy loading et adaptive quality pour images/vidéos
 */

(function() {
  'use strict';

  class MediaOptimizer {
    constructor() {
      this.supportsWebP = false;
      this.supportsAVIF = false;
      this.connectionSpeed = 'unknown';
      this.deviceCapabilities = {};
      
      this.init();
    }

    async init() {
      // Détecter les formats supportés
      await this.detectImageFormats();
      
      // Analyser la connexion
      this.analyzeConnection();
      
      // Analyser les capacités de l'appareil
      this.analyzeDeviceCapabilities();
      
      // Optimiser les médias existants
      this.optimizeExistingMedia();
      
      // Observer les nouveaux médias
      this.setupMediaObserver();
      
      console.log('🎬 Optimisation média initialisée');
    }

    /**
     * Détecter les formats d'image supportés
     */
    async detectImageFormats() {
      // Test WebP
      this.supportsWebP = await this.testImageFormat('data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==');
      
      // Test AVIF (plus récent et plus efficace)
      this.supportsAVIF = await this.testImageFormat('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=');
      
      if (this.supportsAVIF) {
        console.log('✅ AVIF supporté - qualité optimale');
      } else if (this.supportsWebP) {
        console.log('✅ WebP supporté - bonne qualité');
      }
    }

    async testImageFormat(dataUri) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.width === 2 && img.height === 2);
        img.onerror = () => resolve(false);
        img.src = dataUri;
      });
    }

    /**
     * Analyser la vitesse de connexion
     */
    analyzeConnection() {
      if ('connection' in navigator) {
        const conn = navigator.connection;
        this.connectionSpeed = conn.effectiveType || 'unknown';
        
        // Ajuster la qualité selon la connexion
        if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
          this.connectionSpeed = 'slow';
        } else if (conn.effectiveType === '3g') {
          this.connectionSpeed = 'medium';
        } else {
          this.connectionSpeed = 'fast';
        }
      } else {
        // Estimation basée sur le temps de chargement
        this.estimateConnectionSpeed();
      }
    }

    estimateConnectionSpeed() {
      const startTime = performance.now();
      
      // Charger une petite image de test
      const testImage = new Image();
      testImage.onload = () => {
        const loadTime = performance.now() - startTime;
        
        if (loadTime > 1000) {
          this.connectionSpeed = 'slow';
        } else if (loadTime > 500) {
          this.connectionSpeed = 'medium';
        } else {
          this.connectionSpeed = 'fast';
        }
        
        console.log(`📶 Connexion estimée: ${this.connectionSpeed} (${Math.round(loadTime)}ms)`);
      };
      
      testImage.src = '/images/favicon.png?t=' + Date.now();
    }

    /**
     * Analyser les capacités de l'appareil
     */
    analyzeDeviceCapabilities() {
      this.deviceCapabilities = {
        // Écran
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1,
        
        // Performance
        hardwareConcurrency: navigator.hardwareConcurrency || 2,
        
        // Mémoire (si disponible)
        memory: navigator.deviceMemory || 'unknown',
        
        // Mobile
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        
        // Touch
        isTouch: 'ontouchstart' in window
      };
      
      // Déterminer le niveau de qualité recommandé
      this.qualityLevel = this.calculateOptimalQuality();
    }

    calculateOptimalQuality() {
      let score = 0;
      
      // Connexion
      if (this.connectionSpeed === 'fast') score += 3;
      else if (this.connectionSpeed === 'medium') score += 2;
      else score += 1;
      
      // Mémoire
      if (this.deviceCapabilities.memory >= 8) score += 3;
      else if (this.deviceCapabilities.memory >= 4) score += 2;
      else score += 1;
      
      // CPU
      if (this.deviceCapabilities.hardwareConcurrency >= 8) score += 2;
      else if (this.deviceCapabilities.hardwareConcurrency >= 4) score += 1;
      
      // Écran
      if (this.deviceCapabilities.pixelRatio >= 2) score += 1;
      
      // Retourner le niveau de qualité
      if (score >= 8) return 'high';
      if (score >= 5) return 'medium';
      return 'low';
    }

    /**
     * Optimiser les médias existants
     */
    optimizeExistingMedia() {
      // Images
      const images = document.querySelectorAll('img[src]:not([data-optimized])');
      images.forEach(img => this.optimizeImage(img));
      
      // Vidéos
      const videos = document.querySelectorAll('video[src]:not([data-optimized])');
      videos.forEach(video => this.optimizeVideo(video));
      
      // Images de fond CSS
      this.optimizeBackgroundImages();
    }

    /**
     * Optimiser une image
     */
    optimizeImage(img) {
      if (img.dataset.optimized) return;
      
      const originalSrc = img.src;
      const optimizedSrc = this.getOptimizedImageSrc(originalSrc);
      
      // Lazy loading intelligent
      if ('loading' in HTMLImageElement.prototype) {
        img.loading = 'lazy';
      } else {
        this.setupIntersectionObserver(img);
      }
      
      // Remplacer par la version optimisée
      if (optimizedSrc !== originalSrc) {
        img.src = optimizedSrc;
      }
      
      // Responsive images avec srcset
      this.addResponsiveSrcSet(img, originalSrc);
      
      img.dataset.optimized = 'true';
    }

    /**
     * Générer l'URL optimisée pour une image
     */
    getOptimizedImageSrc(src) {
      const url = new URL(src, window.location.origin);
      const params = new URLSearchParams();
      
      // Format optimal
      if (this.supportsAVIF) {
        params.set('format', 'avif');
      } else if (this.supportsWebP) {
        params.set('format', 'webp');
      }
      
      // Qualité selon la connexion
      const quality = this.getOptimalImageQuality();
      if (quality < 90) {
        params.set('quality', quality.toString());
      }
      
      // Compression progressive
      params.set('progressive', 'true');
      
      // Si on a des paramètres, les ajouter
      if (params.toString()) {
        url.search = params.toString();
      }
      
      return url.toString();
    }

    getOptimalImageQuality() {
      return {
        'high': 90,
        'medium': 75,
        'low': 60
      }[this.qualityLevel] || 75;
    }

    /**
     * Ajouter srcset responsive
     */
    addResponsiveSrcSet(img, originalSrc) {
      if (img.srcset) return; // Déjà défini
      
      const baseSrc = originalSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      const ext = this.supportsWebP ? 'webp' : 'jpg';
      
      const srcset = [
        `${baseSrc}_400w.${ext} 400w`,
        `${baseSrc}_800w.${ext} 800w`,
        `${baseSrc}_1200w.${ext} 1200w`,
        `${baseSrc}_1600w.${ext} 1600w`
      ].join(', ');
      
      img.srcset = srcset;
      img.sizes = '(max-width: 768px) 400px, (max-width: 1024px) 800px, 1200px';
    }

    /**
     * Optimiser une vidéo
     */
    optimizeVideo(video) {
      if (video.dataset.optimized) return;
      
      // Attributs de performance
      video.preload = this.connectionSpeed === 'fast' ? 'metadata' : 'none';
      video.muted = true; // Permet autoplay
      video.playsInline = true; // Mobile
      
      // Sources multiples selon la qualité
      this.addVideoSources(video);
      
      // Intersection Observer pour lecture automatique
      this.setupVideoIntersectionObserver(video);
      
      video.dataset.optimized = 'true';
    }

    addVideoSources(video) {
      const originalSrc = video.src;
      if (!originalSrc) return;
      
      // Créer un élément source pour chaque qualité
      const qualities = this.getVideoQualities();
      
      qualities.forEach(quality => {
        const source = document.createElement('source');
        source.src = this.getVideoSrcForQuality(originalSrc, quality);
        source.type = 'video/mp4';
        source.media = quality.media;
        
        video.appendChild(source);
      });
      
      // Supprimer l'attribut src original
      video.removeAttribute('src');
    }

    getVideoQualities() {
      const qualities = [
        { name: 'high', media: '(min-width: 1024px)' },
        { name: 'medium', media: '(min-width: 768px)' },
        { name: 'low', media: '(max-width: 767px)' }
      ];
      
      // Filtrer selon les capacités
      if (this.connectionSpeed === 'slow') {
        return qualities.filter(q => q.name === 'low');
      }
      
      return qualities;
    }

    getVideoSrcForQuality(src, quality) {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('quality', quality.name);
      return url.toString();
    }

    /**
     * Observer les nouvelles images/vidéos ajoutées dynamiquement
     */
    setupMediaObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element
              // Nouvelles images
              if (node.tagName === 'IMG') {
                this.optimizeImage(node);
              }
              
              // Nouvelles vidéos
              if (node.tagName === 'VIDEO') {
                this.optimizeVideo(node);
              }
              
              // Images dans les nouveaux éléments
              const images = node.querySelectorAll && node.querySelectorAll('img:not([data-optimized])');
              if (images) {
                images.forEach(img => this.optimizeImage(img));
              }
              
              const videos = node.querySelectorAll && node.querySelectorAll('video:not([data-optimized])');
              if (videos) {
                videos.forEach(video => this.optimizeVideo(video));
              }
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    /**
     * Intersection Observer pour lazy loading (fallback)
     */
    setupIntersectionObserver(img) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            const src = target.dataset.src || target.src;
            
            if (src && src !== target.src) {
              target.src = src;
            }
            
            observer.unobserve(target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.1
      });
      
      observer.observe(img);
    }

    /**
     * Intersection Observer pour vidéos
     */
    setupVideoIntersectionObserver(video) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Jouer la vidéo quand elle devient visible
            if (video.paused && this.connectionSpeed !== 'slow') {
              video.play().catch(() => {
                // Échec silencieux si autoplay bloqué
              });
            }
          } else {
            // Pause quand elle sort de la vue
            if (!video.paused) {
              video.pause();
            }
          }
        });
      }, {
        threshold: 0.5
      });
      
      observer.observe(video);
    }

    /**
     * Optimiser les images de fond CSS
     */
    optimizeBackgroundImages() {
      const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
      
      elementsWithBg.forEach(element => {
        const style = getComputedStyle(element);
        const bgImage = style.backgroundImage;
        
        if (bgImage && bgImage !== 'none') {
          const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
          if (urlMatch) {
            const originalUrl = urlMatch[1];
            const optimizedUrl = this.getOptimizedImageSrc(originalUrl);
            
            element.style.backgroundImage = `url('${optimizedUrl}')`;
          }
        }
      });
    }

    /**
     * API pour forcer la reoptimisation
     */
    reoptimize() {
      // Réanalyser les capacités
      this.analyzeConnection();
      this.analyzeDeviceCapabilities();
      
      // Reoptimiser tous les médias
      this.optimizeExistingMedia();
      
      console.log('🔄 Médias reoptimisés');
    }

    /**
     * Statistiques d'optimisation
     */
    getStats() {
      const optimizedImages = document.querySelectorAll('img[data-optimized]').length;
      const optimizedVideos = document.querySelectorAll('video[data-optimized]').length;
      
      return {
        formats: {
          avif: this.supportsAVIF,
          webp: this.supportsWebP
        },
        connection: this.connectionSpeed,
        quality: this.qualityLevel,
        device: this.deviceCapabilities,
        optimized: {
          images: optimizedImages,
          videos: optimizedVideos
        }
      };
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonMediaOptimizer = new MediaOptimizer();
    
    // Debug
    if (window.location.hostname === 'localhost') {
      window._debugMedia = window.GeeknDragonMediaOptimizer;
      console.log('🎬 Media Debug - Utilisez window._debugMedia');
    }
  });

})();
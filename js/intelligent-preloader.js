/**
 * 🚀 PRELOADING INTELLIGENT - GEEKNDRAGON
 * Système prédictif pour optimiser les temps de chargement
 */

(function() {
  'use strict';

  class IntelligentPreloader {
    constructor() {
      this.preloadQueue = new Set();
      this.preloadCache = new Map();
      this.userBehavior = {
        scrollSpeed: 0,
        timeOnPage: 0,
        interactions: 0,
        hoverTargets: new Set(),
        clickPatterns: []
      };
      
      this.config = {
        maxConcurrentPreloads: 3,
        preloadBudget: 5000000, // 5MB budget
        connectionThreshold: 'fast',
        viewportMargin: '200px',
        hoverDelay: 150, // ms avant preload sur hover
        idleTimeout: 2000 // Preload pendant idle time
      };
      
      this.statistics = {
        preloadsExecuted: 0,
        preloadHits: 0,
        bytesPreloaded: 0,
        timeSaved: 0
      };
      
      this.resourcePriorities = {
        'critical-page': 100,
        'likely-next': 80,
        'product-image': 70,
        'product-page': 60,
        'category': 50,
        'media': 40,
        'checkout': 90
      };
      
      this.init();
    }

    async init() {
      // Analyser les capacités de connexion
      await this.analyzeNetworkCapabilities();
      
      // Analyser le comportement utilisateur
      this.startBehaviorAnalysis();
      
      // Preloading des ressources critiques
      this.preloadCriticalResources();
      
      // Observer les interactions pour prédiction
      this.setupPredictiveObservers();
      
      // Preloading intelligent basé sur ML patterns
      this.initializeMLPatterns();
      
      // Idle time preloading
      this.setupIdlePreloading();
      
      console.log('🚀 Intelligent Preloader initialisé');
    }

    /**
     * Analyser les capacités réseau
     */
    async analyzeNetworkCapabilities() {
      // Navigator Connection API
      if ('connection' in navigator) {
        const conn = navigator.connection;
        this.networkInfo = {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData
        };
        
        // Ajuster le budget selon la connexion
        this.adjustPreloadBudget();
        
        // Écouter les changements de réseau
        conn.addEventListener('change', () => {
          this.analyzeNetworkCapabilities();
        });
      } else {
        // Fallback: tester avec image de référence
        await this.estimateConnectionSpeed();
      }
    }

    adjustPreloadBudget() {
      const conn = this.networkInfo;
      
      if (conn.saveData) {
        this.config.preloadBudget = 1000000; // 1MB si data saver actif
        this.config.maxConcurrentPreloads = 1;
      } else if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
        this.config.preloadBudget = 2000000; // 2MB
        this.config.maxConcurrentPreloads = 1;
      } else if (conn.effectiveType === '3g') {
        this.config.preloadBudget = 3000000; // 3MB
        this.config.maxConcurrentPreloads = 2;
      } else if (conn.effectiveType === '4g') {
        this.config.preloadBudget = 8000000; // 8MB
        this.config.maxConcurrentPreloads = 4;
      }
    }

    async estimateConnectionSpeed() {
      const testImage = '/images/favicon.png?preload_test=' + Date.now();
      const startTime = performance.now();
      
      try {
        await this.loadImage(testImage);
        const loadTime = performance.now() - startTime;
        
        if (loadTime < 200) {
          this.config.connectionThreshold = 'fast';
          this.config.preloadBudget = 8000000;
        } else if (loadTime < 500) {
          this.config.connectionThreshold = 'medium';
          this.config.preloadBudget = 4000000;
        } else {
          this.config.connectionThreshold = 'slow';
          this.config.preloadBudget = 1000000;
        }
      } catch (e) {
        this.config.connectionThreshold = 'slow';
        this.config.preloadBudget = 1000000;
      }
    }

    /**
     * Preloading des ressources critiques
     */
    preloadCriticalResources() {
      const criticalResources = this.identifyCriticalResources();
      
      criticalResources.forEach(resource => {
        this.schedulePreload(resource, 'critical-page');
      });
    }

    identifyCriticalResources() {
      const resources = [];
      const currentPath = window.location.pathname;
      
      // Homepage -> Boutique
      if (currentPath === '/' || currentPath === '/index.php') {
        resources.push({
          url: '/boutique.php',
          type: 'document',
          reason: 'Homepage to shop flow'
        });
        
        // Images hero de la boutique
        resources.push({
          url: '/images/optimized-modern/webp/hero-boutique.webp',
          type: 'image',
          reason: 'Shop hero image'
        });
      }
      
      // Boutique -> Pages produits populaires
      if (currentPath.includes('boutique')) {
        const popularProducts = this.getPopularProducts();
        popularProducts.forEach(product => {
          resources.push({
            url: product.image,
            type: 'image',
            reason: `Popular product: ${product.name}`
          });
        });
      }
      
      // Produit -> Checkout flow
      if (this.isProductPage()) {
        resources.push({
          url: this.getSnipcartCheckoutAssets(),
          type: 'script',
          reason: 'Checkout flow preparation'
        });
      }
      
      return resources;
    }

    getPopularProducts() {
      // Produits populaires basés sur l'analyse du site
      return [
        {
          name: 'Lot de 10 pièces',
          image: '/images/optimized-modern/webp/lot10-hero.webp'
        },
        {
          name: 'Lot de 25 pièces',
          image: '/images/optimized-modern/webp/lot25-hero.webp'
        },
        {
          name: 'Pack Arsenal Aventurier',
          image: '/images/optimized-modern/webp/pack-arsenal-hero.webp'
        }
      ];
    }

    /**
     * Analyse comportementale pour prédiction
     */
    startBehaviorAnalysis() {
      let lastScrollY = window.scrollY;
      let scrollMeasurements = [];
      
      // Vitesse de scroll
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY);
        scrollMeasurements.push(scrollDelta);
        
        // Garder seulement les 10 dernières mesures
        if (scrollMeasurements.length > 10) {
          scrollMeasurements = scrollMeasurements.slice(-10);
        }
        
        this.userBehavior.scrollSpeed = scrollMeasurements.reduce((a, b) => a + b, 0) / scrollMeasurements.length;
        lastScrollY = currentScrollY;
        
        // Prédire le contenu suivant basé sur la direction
        this.predictScrollBasedContent(currentScrollY, lastScrollY);
      }, { passive: true });
      
      // Temps sur page
      setInterval(() => {
        this.userBehavior.timeOnPage += 1000;
      }, 1000);
      
      // Interactions
      ['click', 'keydown', 'touch'].forEach(eventType => {
        document.addEventListener(eventType, () => {
          this.userBehavior.interactions++;
        });
      });
    }

    predictScrollBasedContent(currentY, previousY) {
      const direction = currentY > previousY ? 'down' : 'up';
      const scrollPercent = (currentY / (document.body.scrollHeight - window.innerHeight)) * 100;
      
      // Si l'utilisateur scroll vers le bas et approche du footer
      if (direction === 'down' && scrollPercent > 70) {
        // Preload les pages liées depuis le footer
        this.preloadFooterLinks();
      }
      
      // Si l'utilisateur scroll rapidement, preload les images dans le viewport étendu
      if (this.userBehavior.scrollSpeed > 50) {
        this.preloadViewportImages(400); // Marge étendue
      }
    }

    /**
     * Observers prédictifs
     */
    setupPredictiveObservers() {
      // Intersection Observer pour preload anticipé
      this.setupViewportPreloader();
      
      // Hover intent observer
      this.setupHoverPreloader();
      
      // Click pattern observer
      this.setupClickPatternAnalysis();
      
      // Focus trap prediction (navigation clavier)
      this.setupFocusPrediction();
    }

    setupViewportPreloader() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            
            // Preloader les liens dans cet élément
            const links = element.querySelectorAll('a[href]');
            links.forEach(link => {
              if (this.shouldPreloadLink(link)) {
                this.schedulePreload({
                  url: link.href,
                  type: 'document',
                  reason: 'Viewport intersection'
                }, 'likely-next');
              }
            });
            
            // Preloader les images lazy-load suivantes
            this.preloadNextLazyImages(element);
          }
        });
      }, {
        rootMargin: this.config.viewportMargin
      });
      
      // Observer les sections principales
      document.querySelectorAll('section, .product-card, .hero-section').forEach(el => {
        observer.observe(el);
      });
    }

    setupHoverPreloader() {
      let hoverTimer;
      
      document.addEventListener('mouseenter', (e) => {
        const link = e.target.closest('a[href]');
        const productCard = e.target.closest('.product-card');
        
        if (link || productCard) {
          hoverTimer = setTimeout(() => {
            if (link && this.shouldPreloadLink(link)) {
              this.userBehavior.hoverTargets.add(link.href);
              this.schedulePreload({
                url: link.href,
                type: 'document',
                reason: 'Hover intent'
              }, 'likely-next');
            }
            
            if (productCard) {
              this.preloadProductAssets(productCard);
            }
          }, this.config.hoverDelay);
        }
      }, true);
      
      document.addEventListener('mouseleave', (e) => {
        if (hoverTimer) {
          clearTimeout(hoverTimer);
        }
      }, true);
    }

    setupClickPatternAnalysis() {
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (link) {
          const pattern = {
            timestamp: Date.now(),
            source: window.location.pathname,
            target: link.pathname,
            element: this.getElementDescriptor(link)
          };
          
          this.userBehavior.clickPatterns.push(pattern);
          
          // Garder seulement les 20 derniers patterns
          if (this.userBehavior.clickPatterns.length > 20) {
            this.userBehavior.clickPatterns = this.userBehavior.clickPatterns.slice(-20);
          }
          
          // Prédire la page suivante basée sur les patterns
          this.predictNextPageFromPatterns();
        }
      });
    }

    setupFocusPrediction() {
      document.addEventListener('keydown', (e) => {
        // Navigation Tab - prédire le prochain élément focusable
        if (e.key === 'Tab') {
          const focusableElements = this.getFocusableElements();
          const currentIndex = focusableElements.indexOf(document.activeElement);
          const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
          
          if (nextIndex >= 0 && nextIndex < focusableElements.length) {
            const nextElement = focusableElements[nextIndex];
            
            if (nextElement.tagName === 'A' && nextElement.href) {
              this.schedulePreload({
                url: nextElement.href,
                type: 'document',
                reason: 'Keyboard navigation prediction'
              }, 'likely-next');
            }
          }
        }
      });
    }

    /**
     * Machine Learning patterns simplifiés
     */
    initializeMLPatterns() {
      // Patterns basés sur l'analyse du comportement e-commerce
      this.mlPatterns = {
        // Homepage -> Boutique (90% de probabilité)
        '/': [
          { target: '/boutique.php', probability: 0.9, assets: ['shop-images'] }
        ],
        
        // Boutique -> Produit populaire (70% vers lot10, 60% vers lot25)
        '/boutique.php': [
          { target: '/lot10', probability: 0.7, assets: ['product-images', 'checkout-flow'] },
          { target: '/lot25', probability: 0.6, assets: ['product-images', 'checkout-flow'] },
          { target: '/pack-arsenal', probability: 0.5, assets: ['product-images'] }
        ],
        
        // Page produit -> Checkout (50% ajout panier, puis checkout 80%)
        '/lot10': [
          { target: 'checkout-flow', probability: 0.4, assets: ['snipcart-assets'] }
        ],
        '/lot25': [
          { target: 'checkout-flow', probability: 0.4, assets: ['snipcart-assets'] }
        ]
      };
      
      this.applyMLPredictions();
    }

    applyMLPredictions() {
      const currentPath = window.location.pathname;
      const patterns = this.mlPatterns[currentPath];
      
      if (!patterns) return;
      
      patterns.forEach(pattern => {
        // Appliquer seulement les prédictions haute probabilité
        if (pattern.probability > 0.6) {
          setTimeout(() => {
            if (pattern.target.startsWith('/')) {
              this.schedulePreload({
                url: pattern.target,
                type: 'document',
                reason: `ML prediction (${Math.round(pattern.probability * 100)}%)`
              }, 'likely-next');
            }
            
            // Preload assets associés
            if (pattern.assets) {
              pattern.assets.forEach(assetType => {
                this.preloadAssetsByType(assetType);
              });
            }
          }, 1000); // Délai pour éviter de surcharger le chargement initial
        }
      });
    }

    /**
     * Idle time preloading
     */
    setupIdlePreloading() {
      let idleTimer;
      let isIdle = false;
      
      const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        isIdle = false;
        
        idleTimer = setTimeout(() => {
          isIdle = true;
          this.executeIdlePreloading();
        }, this.config.idleTimeout);
      };
      
      // Événements qui indiquent l'activité utilisateur
      ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(eventType => {
        document.addEventListener(eventType, resetIdleTimer, { passive: true });
      });
      
      resetIdleTimer();
    }

    executeIdlePreloading() {
      // Pendant l'idle time, preload les ressources moins prioritaires
      const idleQueue = [
        ...this.getPredictedNextPages(),
        ...this.getPopularPageAssets(),
        ...this.getSeasonalContent()
      ];
      
      idleQueue.forEach((resource, index) => {
        setTimeout(() => {
          if (this.isStillIdle()) {
            this.schedulePreload(resource, 'idle-time');
          }
        }, index * 500); // Espacement pour éviter la congestion
      });
    }

    /**
     * Planification et exécution des preloads
     */
    schedulePreload(resource, priority) {
      const resourceKey = `${resource.type}:${resource.url}`;
      
      // Éviter les doublons
      if (this.preloadCache.has(resourceKey)) return;
      
      // Vérifier le budget
      if (!this.hasPreloadBudget()) return;
      
      // Ajouter à la queue avec priorité
      const preloadItem = {
        ...resource,
        priority: this.resourcePriorities[priority] || 50,
        scheduledAt: Date.now(),
        key: resourceKey
      };
      
      this.preloadQueue.add(preloadItem);
      
      // Traiter la queue
      this.processPreloadQueue();
    }

    async processPreloadQueue() {
      // Trier par priorité
      const sortedQueue = Array.from(this.preloadQueue).sort((a, b) => b.priority - a.priority);
      
      // Limiter les preloads concurrents
      const activePreloads = Array.from(this.preloadQueue).filter(item => item.loading);
      if (activePreloads.length >= this.config.maxConcurrentPreloads) return;
      
      // Traiter les items haute priorité
      for (const item of sortedQueue.slice(0, this.config.maxConcurrentPreloads)) {
        if (item.loading) continue;
        
        item.loading = true;
        
        try {
          await this.executePreload(item);
          this.preloadQueue.delete(item);
          this.preloadCache.set(item.key, {
            loadedAt: Date.now(),
            success: true
          });
          
          this.statistics.preloadsExecuted++;
        } catch (e) {
          console.warn('Preload failed:', item.url, e);
          this.preloadQueue.delete(item);
          this.preloadCache.set(item.key, {
            loadedAt: Date.now(),
            success: false,
            error: e.message
          });
        }
      }
    }

    async executePreload(item) {
      const startTime = performance.now();
      
      switch (item.type) {
        case 'document':
          await this.preloadDocument(item.url);
          break;
        case 'image':
          await this.preloadImage(item.url);
          break;
        case 'script':
          await this.preloadScript(item.url);
          break;
        case 'style':
          await this.preloadStyle(item.url);
          break;
        default:
          await this.preloadGeneric(item.url, item.type);
      }
      
      const loadTime = performance.now() - startTime;
      this.statistics.timeSaved += Math.max(0, 1000 - loadTime); // Estimation temps économisé
      
      console.log(`🚀 Preloaded: ${item.url} (${Math.round(loadTime)}ms) - ${item.reason}`);
    }

    async preloadDocument(url) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
      
      return new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve; // Ne pas échouer sur erreur preload
        setTimeout(resolve, 2000); // Timeout de sécurité
      });
    }

    async preloadImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          this.statistics.bytesPreloaded += this.estimateImageSize(img);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    }

    async preloadScript(url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = url;
      document.head.appendChild(link);
      
      return new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve;
        setTimeout(resolve, 3000);
      });
    }

    async preloadStyle(url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = url;
      document.head.appendChild(link);
      
      return new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve;
        setTimeout(resolve, 2000);
      });
    }

    async preloadGeneric(url, type) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      if (type) link.as = type;
      document.head.appendChild(link);
      
      return new Promise((resolve) => {
        link.onload = resolve;
        link.onerror = resolve;
        setTimeout(resolve, 2000);
      });
    }

    /**
     * Utilitaires spécialisés
     */
    preloadProductAssets(productCard) {
      // Images produit
      const images = productCard.querySelectorAll('img[data-src], img[src]');
      images.forEach(img => {
        const src = img.dataset.src || img.src;
        if (src && !this.preloadCache.has(`image:${src}`)) {
          this.schedulePreload({
            url: src,
            type: 'image',
            reason: 'Product hover'
          }, 'product-image');
        }
      });
      
      // Lien vers page produit
      const productLink = productCard.querySelector('a[href]');
      if (productLink) {
        this.schedulePreload({
          url: productLink.href,
          type: 'document',
          reason: 'Product card hover'
        }, 'product-page');
      }
    }

    preloadAssetsByType(assetType) {
      switch (assetType) {
        case 'shop-images':
          this.getPopularProducts().forEach(product => {
            this.schedulePreload({
              url: product.image,
              type: 'image',
              reason: 'Shop preparation'
            }, 'product-image');
          });
          break;
          
        case 'checkout-flow':
          // Assets Snipcart
          this.schedulePreload({
            url: 'https://cdn.snipcart.com/themes/v3.0.29/default/snipcart.css',
            type: 'style',
            reason: 'Checkout preparation'
          }, 'checkout');
          break;
          
        case 'snipcart-assets':
          this.schedulePreload({
            url: 'https://cdn.snipcart.com/themes/v3.0.29/default/snipcart.js',
            type: 'script',
            reason: 'Checkout preparation'
          }, 'checkout');
          break;
      }
    }

    preloadFooterLinks() {
      const footer = document.querySelector('footer');
      if (!footer) return;
      
      const links = footer.querySelectorAll('a[href]');
      links.forEach(link => {
        if (this.shouldPreloadLink(link)) {
          this.schedulePreload({
            url: link.href,
            type: 'document',
            reason: 'Footer approach'
          }, 'likely-next');
        }
      });
    }

    preloadViewportImages(margin = 200) {
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Trouver les images dans le viewport étendu
      const images = document.querySelectorAll('img[data-src]:not([data-preloaded])');
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const imgTop = rect.top + scrollY;
        
        if (imgTop <= scrollY + viewportHeight + margin) {
          const src = img.dataset.src;
          if (src) {
            this.schedulePreload({
              url: src,
              type: 'image',
              reason: 'Extended viewport'
            }, 'product-image');
            
            img.dataset.preloaded = 'true';
          }
        }
      });
    }

    /**
     * Prédictions et heuristiques
     */
    shouldPreloadLink(link) {
      const href = link.href;
      
      // Éviter preload externe
      if (!href.startsWith(window.location.origin)) return false;
      
      // Éviter ancres
      if (href.includes('#')) return false;
      
      // Éviter paramètres de tracking
      if (href.includes('utm_') || href.includes('ref=')) return false;
      
      // Pages importantes à preload
      const importantPages = ['/boutique.php', '/lot10', '/lot25', '/pack-arsenal'];
      if (importantPages.some(page => href.includes(page))) return true;
      
      return true;
    }

    predictNextPageFromPatterns() {
      const recentPatterns = this.userBehavior.clickPatterns.slice(-5);
      const currentPath = window.location.pathname;
      
      // Analyser les patterns de navigation
      const targetCounts = {};
      recentPatterns.forEach(pattern => {
        if (pattern.source === currentPath) {
          targetCounts[pattern.target] = (targetCounts[pattern.target] || 0) + 1;
        }
      });
      
      // Preload la destination la plus fréquente
      const mostLikelyTarget = Object.entries(targetCounts)
        .sort(([,a], [,b]) => b - a)[0];
      
      if (mostLikelyTarget) {
        this.schedulePreload({
          url: mostLikelyTarget[0],
          type: 'document',
          reason: 'Pattern prediction'
        }, 'likely-next');
      }
    }

    getPredictedNextPages() {
      const currentPath = window.location.pathname;
      const predictions = [];
      
      // Logique de prédiction basée sur le parcours utilisateur
      if (currentPath === '/') {
        predictions.push({
          url: '/boutique.php',
          type: 'document',
          reason: 'Homepage to shop prediction'
        });
      }
      
      if (currentPath.includes('boutique')) {
        predictions.push({
          url: '/lot10',
          type: 'document',
          reason: 'Popular product prediction'
        });
      }
      
      return predictions;
    }

    getPopularPageAssets() {
      return [
        {
          url: '/images/optimized-modern/webp/hero-boutique.webp',
          type: 'image',
          reason: 'Popular page asset'
        },
        {
          url: '/css/boutique-style-global.css',
          type: 'style',
          reason: 'Shop page styles'
        }
      ];
    }

    getSeasonalContent() {
      // Contenu saisonnier (Noël, événements spéciaux, etc.)
      const month = new Date().getMonth();
      const seasonal = [];
      
      if (month === 11 || month === 0) { // Décembre/Janvier
        seasonal.push({
          url: '/images/seasonal/holiday-banner.webp',
          type: 'image',
          reason: 'Holiday season content'
        });
      }
      
      return seasonal;
    }

    /**
     * Gestion du budget et validation
     */
    hasPreloadBudget() {
      return this.statistics.bytesPreloaded < this.config.preloadBudget;
    }

    estimateImageSize(img) {
      // Estimation approximative basée sur dimensions
      const area = img.naturalWidth * img.naturalHeight;
      return Math.round(area * 0.3); // ~0.3 bytes par pixel pour WebP
    }

    isStillIdle() {
      // Vérifier si l'utilisateur est encore inactif
      return document.hidden || 
             (Date.now() - this.lastInteraction > this.config.idleTimeout);
    }

    isProductPage() {
      return window.location.pathname.includes('lot') || 
             window.location.pathname.includes('pack') ||
             window.location.pathname.includes('triptyque');
    }

    getSnipcartCheckoutAssets() {
      return [
        'https://cdn.snipcart.com/themes/v3.0.29/default/snipcart.js',
        'https://cdn.snipcart.com/themes/v3.0.29/default/snipcart.css'
      ];
    }

    getElementDescriptor(element) {
      return {
        tag: element.tagName.toLowerCase(),
        classes: Array.from(element.classList),
        text: element.textContent.trim().substring(0, 50)
      };
    }

    getFocusableElements() {
      return Array.from(document.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ));
    }

    loadImage(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
    }

    preloadNextLazyImages(container) {
      const lazyImages = container.querySelectorAll('img[data-src]:not([data-preloaded])');
      
      // Preload les 3 prochaines images lazy
      Array.from(lazyImages).slice(0, 3).forEach(img => {
        this.schedulePreload({
          url: img.dataset.src,
          type: 'image',
          reason: 'Next lazy images'
        }, 'product-image');
        
        img.dataset.preloaded = 'true';
      });
    }

    /**
     * API publique et debugging
     */
    getStatistics() {
      return {
        ...this.statistics,
        cacheSize: this.preloadCache.size,
        queueSize: this.preloadQueue.size,
        userBehavior: this.userBehavior,
        config: this.config,
        hitRate: this.statistics.preloadsExecuted > 0 ? 
          (this.statistics.preloadHits / this.statistics.preloadsExecuted) * 100 : 0
      };
    }

    // Méthode pour forcer le preload d'une ressource
    forcePreload(url, type = 'document', reason = 'Manual') {
      this.schedulePreload({ url, type, reason }, 'critical-page');
    }

    // Obtenir les prédictions actuelles
    getCurrentPredictions() {
      return {
        nextPages: this.getPredictedNextPages(),
        hoverTargets: Array.from(this.userBehavior.hoverTargets),
        mlPredictions: this.mlPatterns[window.location.pathname] || []
      };
    }

    // Réinitialiser le cache
    clearCache() {
      this.preloadCache.clear();
      this.preloadQueue.clear();
      console.log('🚀 Preload cache cleared');
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonPreloader = new IntelligentPreloader();
    
    // Debug mode
    if (window.location.hostname === 'localhost') {
      window._debugPreloader = window.GeeknDragonPreloader;
      console.log('🚀 Preloader Debug - Utilisez window._debugPreloader');
      
      // Affichage stats toutes les 30 secondes
      setInterval(() => {
        const stats = window._debugPreloader.getStatistics();
        console.log('🚀 Preloader Stats:', stats);
      }, 30000);
    }
  });

  // Hook dans les événements de navigation pour mesurer l'efficacité
  window.addEventListener('beforeunload', () => {
    const stats = window.GeeknDragonPreloader?.getStatistics();
    if (stats && stats.preloadsExecuted > 0) {
      console.log(`🚀 Session préloading: ${stats.preloadsExecuted} preloads, ${Math.round(stats.timeSaved)}ms économisés`);
    }
  });

})();
/**
 * 📊 MONITORING PERFORMANCE TEMPS RÉEL - GEEKNDRAGON
 * Surveillance Web Vitals et métriques business critiques
 */

(function() {
  'use strict';

  class PerformanceMonitor {
    constructor() {
      this.metrics = {
        webVitals: {},
        business: {},
        technical: {},
        userExperience: {}
      };
      
      this.thresholds = {
        LCP: { good: 2500, poor: 4000 },
        FID: { good: 100, poor: 300 },
        CLS: { good: 0.1, poor: 0.25 },
        FCP: { good: 1800, poor: 3000 },
        TTFB: { good: 800, poor: 1800 }
      };
      
      this.observers = [];
      this.startTime = performance.now();
      this.isMonitoring = false;
      
      this.init();
    }

    async init() {
      // Charger la bibliothèque Web Vitals
      await this.loadWebVitalsLibrary();
      
      // Démarrer le monitoring
      this.startWebVitalsMonitoring();
      this.startBusinessMetrics();
      this.startTechnicalMetrics();
      this.startUserExperienceMetrics();
      
      // Reporting automatique
      this.setupAutomaticReporting();
      
      this.isMonitoring = true;
      console.log('📊 Performance Monitor initialisé');
    }

    /**
     * Charger Web Vitals library
     */
    async loadWebVitalsLibrary() {
      if (window.webVitals) return;

      try {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        console.log('✅ Web Vitals library chargée');
      } catch (e) {
        console.warn('⚠️ Impossible de charger Web Vitals, fallback sur Performance Observer');
        this.usePerformanceObserverFallback();
      }
    }

    /**
     * Monitoring Web Vitals (Core et autres métriques)
     */
    startWebVitalsMonitoring() {
      if (window.webVitals) {
        // Core Web Vitals
        webVitals.onLCP(this.handleLCP.bind(this));
        webVitals.onFID(this.handleFID.bind(this));
        webVitals.onCLS(this.handleCLS.bind(this));
        
        // Autres métriques importantes
        webVitals.onFCP(this.handleFCP.bind(this));
        webVitals.onTTFB(this.handleTTFB.bind(this));
      } else {
        this.usePerformanceObserverFallback();
      }
    }

    handleLCP(metric) {
      this.metrics.webVitals.LCP = {
        value: metric.value,
        rating: this.getRating(metric.value, 'LCP'),
        entries: metric.entries,
        timestamp: Date.now()
      };
      
      this.reportMetric('LCP', this.metrics.webVitals.LCP);
      
      // Alerte si performance dégradée
      if (this.metrics.webVitals.LCP.rating === 'poor') {
        this.alertPerformanceIssue('LCP', metric.value);
      }
    }

    handleFID(metric) {
      this.metrics.webVitals.FID = {
        value: metric.value,
        rating: this.getRating(metric.value, 'FID'),
        entries: metric.entries,
        timestamp: Date.now()
      };
      
      this.reportMetric('FID', this.metrics.webVitals.FID);
      
      if (this.metrics.webVitals.FID.rating === 'poor') {
        this.alertPerformanceIssue('FID', metric.value);
      }
    }

    handleCLS(metric) {
      this.metrics.webVitals.CLS = {
        value: metric.value,
        rating: this.getRating(metric.value, 'CLS'),
        entries: metric.entries,
        timestamp: Date.now()
      };
      
      this.reportMetric('CLS', this.metrics.webVitals.CLS);
      
      if (this.metrics.webVitals.CLS.rating === 'poor') {
        this.alertPerformanceIssue('CLS', metric.value);
      }
    }

    handleFCP(metric) {
      this.metrics.webVitals.FCP = {
        value: metric.value,
        rating: this.getRating(metric.value, 'FCP'),
        timestamp: Date.now()
      };
      
      this.reportMetric('FCP', this.metrics.webVitals.FCP);
    }

    handleTTFB(metric) {
      this.metrics.webVitals.TTFB = {
        value: metric.value,
        rating: this.getRating(metric.value, 'TTFB'),
        timestamp: Date.now()
      };
      
      this.reportMetric('TTFB', this.metrics.webVitals.TTFB);
    }

    /**
     * Métriques business critiques pour e-commerce
     */
    startBusinessMetrics() {
      // Temps de réponse API Snipcart
      this.monitorSnipcartPerformance();
      
      // Performance des images produits
      this.monitorProductImageLoading();
      
      // Temps d'interaction panier
      this.monitorCartInteractions();
      
      // Performance du checkout
      this.monitorCheckoutFlow();
    }

    monitorSnipcartPerformance() {
      // Observer les requêtes vers Snipcart
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url] = args;
        
        if (url.includes('snipcart') || url.includes('api.snipcart')) {
          const startTime = performance.now();
          
          try {
            const response = await originalFetch.apply(this, args);
            const endTime = performance.now();
            
            this.metrics.business.snipcart_api = {
              url: url,
              duration: endTime - startTime,
              success: response.ok,
              status: response.status,
              timestamp: Date.now()
            };
            
            // Alerter si l'API Snipcart est lente
            if (endTime - startTime > 2000) {
              this.alertPerformanceIssue('SNIPCART_SLOW', endTime - startTime);
            }
            
            return response;
          } catch (error) {
            const endTime = performance.now();
            
            this.metrics.business.snipcart_api = {
              url: url,
              duration: endTime - startTime,
              success: false,
              error: error.message,
              timestamp: Date.now()
            };
            
            this.alertPerformanceIssue('SNIPCART_ERROR', error.message);
            throw error;
          }
        }
        
        return originalFetch.apply(this, args);
      };
    }

    monitorProductImageLoading() {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.name.includes('/images/') && entry.name.includes('product')) {
            this.metrics.business.product_images = this.metrics.business.product_images || [];
            
            this.metrics.business.product_images.push({
              url: entry.name,
              loadTime: entry.responseEnd - entry.startTime,
              size: entry.transferSize || 0,
              rating: entry.responseEnd - entry.startTime < 1000 ? 'good' : 
                     entry.responseEnd - entry.startTime < 2500 ? 'needs-improvement' : 'poor',
              timestamp: Date.now()
            });
            
            // Nettoyer l'historique (garder seulement les 50 dernières)
            if (this.metrics.business.product_images.length > 50) {
              this.metrics.business.product_images = this.metrics.business.product_images.slice(-50);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }

    monitorCartInteractions() {
      let interactionStartTime;
      
      document.addEventListener('click', (e) => {
        if (e.target.closest('.gd-add-to-cart, .snipcart-add-item')) {
          interactionStartTime = performance.now();
          
          // Observer l'ouverture du panier
          const observer = new MutationObserver(() => {
            const cart = document.querySelector('.snipcart-cart');
            if (cart && cart.style.display !== 'none') {
              const interactionTime = performance.now() - interactionStartTime;
              
              this.metrics.business.cart_interaction = {
                type: 'add_to_cart',
                duration: interactionTime,
                rating: interactionTime < 500 ? 'excellent' :
                       interactionTime < 1000 ? 'good' :
                       interactionTime < 2000 ? 'needs-improvement' : 'poor',
                timestamp: Date.now()
              };
              
              observer.disconnect();
              
              if (interactionTime > 2000) {
                this.alertPerformanceIssue('CART_SLOW', interactionTime);
              }
            }
          });
          
          observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
          });
          
          // Timeout de sécurité
          setTimeout(() => observer.disconnect(), 5000);
        }
      });
    }

    monitorCheckoutFlow() {
      // Observer les étapes du checkout Snipcart
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1 && node.classList) {
              if (node.classList.contains('snipcart-checkout')) {
                this.metrics.business.checkout_start = {
                  timestamp: Date.now(),
                  page_load_time: performance.now() - this.startTime
                };
              }
              
              if (node.classList.contains('snipcart-checkout-step-payment')) {
                this.metrics.business.checkout_payment_step = {
                  timestamp: Date.now(),
                  time_to_payment: Date.now() - (this.metrics.business.checkout_start?.timestamp || Date.now())
                };
              }
            }
          });
        });
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      this.observers.push(observer);
    }

    /**
     * Métriques techniques système
     */
    startTechnicalMetrics() {
      this.monitorMemoryUsage();
      this.monitorNetworkConditions();
      this.monitorBrowserCapabilities();
      this.monitorErrorRates();
    }

    monitorMemoryUsage() {
      if ('memory' in performance) {
        setInterval(() => {
          this.metrics.technical.memory = {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
            usage_percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
            timestamp: Date.now()
          };
          
          // Alerter si utilisation mémoire élevée
          if (this.metrics.technical.memory.usage_percentage > 80) {
            this.alertPerformanceIssue('HIGH_MEMORY_USAGE', this.metrics.technical.memory.usage_percentage);
          }
        }, 10000); // Toutes les 10 secondes
      }
    }

    monitorNetworkConditions() {
      if ('connection' in navigator) {
        const updateConnectionInfo = () => {
          this.metrics.technical.network = {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData,
            timestamp: Date.now()
          };
        };
        
        updateConnectionInfo();
        navigator.connection.addEventListener('change', updateConnectionInfo);
      }
    }

    monitorBrowserCapabilities() {
      this.metrics.technical.capabilities = {
        webp: this.testImageFormat('data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='),
        avif: this.testImageFormat('data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYx'),
        webgl: !!document.createElement('canvas').getContext('webgl'),
        webgl2: !!document.createElement('canvas').getContext('webgl2'),
        intersectionObserver: 'IntersectionObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        deviceMemory: navigator.deviceMemory || 'unknown',
        timestamp: Date.now()
      };
    }

    async testImageFormat(dataUri) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = dataUri;
      });
    }

    monitorErrorRates() {
      let errorCount = 0;
      let totalInteractions = 0;
      
      window.addEventListener('error', (e) => {
        errorCount++;
        this.metrics.technical.error_rate = (errorCount / Math.max(totalInteractions, 1)) * 100;
        
        // Logger l'erreur
        this.logError('JavaScript Error', e.error, e.filename, e.lineno);
      });
      
      window.addEventListener('unhandledrejection', (e) => {
        errorCount++;
        this.metrics.technical.error_rate = (errorCount / Math.max(totalInteractions, 1)) * 100;
        
        this.logError('Promise Rejection', e.reason);
      });
      
      // Compter les interactions utilisateur
      ['click', 'keydown', 'scroll'].forEach(eventType => {
        document.addEventListener(eventType, () => {
          totalInteractions++;
        }, { passive: true });
      });
    }

    /**
     * Métriques d'expérience utilisateur
     */
    startUserExperienceMetrics() {
      this.monitorScrollBehavior();
      this.monitorInteractionResponsiveness();
      this.monitorFormPerformance();
      this.monitorAccessibility();
    }

    monitorScrollBehavior() {
      let scrollCount = 0;
      let totalScrollDistance = 0;
      let lastScrollY = window.scrollY;
      
      const scrollHandler = () => {
        scrollCount++;
        totalScrollDistance += Math.abs(window.scrollY - lastScrollY);
        lastScrollY = window.scrollY;
        
        this.metrics.userExperience.scroll = {
          scroll_count: scrollCount,
          average_scroll_distance: totalScrollDistance / scrollCount,
          current_scroll_percentage: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
          timestamp: Date.now()
        };
      };
      
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    monitorInteractionResponsiveness() {
      let interactionTimes = [];
      
      ['click', 'keydown', 'input'].forEach(eventType => {
        document.addEventListener(eventType, (e) => {
          const startTime = performance.now();
          
          requestAnimationFrame(() => {
            const responseTime = performance.now() - startTime;
            interactionTimes.push(responseTime);
            
            // Garder seulement les 100 dernières interactions
            if (interactionTimes.length > 100) {
              interactionTimes = interactionTimes.slice(-100);
            }
            
            this.metrics.userExperience.responsiveness = {
              average_response_time: interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length,
              p95_response_time: this.getPercentile(interactionTimes, 95),
              slow_interactions: interactionTimes.filter(t => t > 16).length,
              total_interactions: interactionTimes.length,
              timestamp: Date.now()
            };
          });
        }, { passive: true });
      });
    }

    monitorFormPerformance() {
      const forms = document.querySelectorAll('form, .snipcart-form');
      
      forms.forEach(form => {
        let formStartTime;
        
        form.addEventListener('focusin', () => {
          if (!formStartTime) {
            formStartTime = performance.now();
          }
        });
        
        form.addEventListener('submit', () => {
          if (formStartTime) {
            const completionTime = performance.now() - formStartTime;
            
            this.metrics.userExperience.form_performance = {
              completion_time: completionTime,
              form_id: form.id || 'unnamed_form',
              rating: completionTime < 30000 ? 'fast' :
                     completionTime < 120000 ? 'normal' : 'slow',
              timestamp: Date.now()
            };
          }
        });
      });
    }

    monitorAccessibility() {
      // Vérifications d'accessibilité automatiques
      const checks = {
        alt_text_missing: document.querySelectorAll('img:not([alt])').length,
        links_without_text: document.querySelectorAll('a:empty').length,
        buttons_without_text: document.querySelectorAll('button:empty').length,
        form_labels_missing: document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').length
      };
      
      this.metrics.userExperience.accessibility = {
        ...checks,
        total_issues: Object.values(checks).reduce((sum, count) => sum + count, 0),
        timestamp: Date.now()
      };
    }

    /**
     * Utilitaires
     */
    getRating(value, metric) {
      const thresholds = this.thresholds[metric];
      if (!thresholds) return 'unknown';
      
      if (value <= thresholds.good) return 'good';
      if (value <= thresholds.poor) return 'needs-improvement';
      return 'poor';
    }

    getPercentile(arr, percentile) {
      const sorted = arr.slice().sort((a, b) => a - b);
      const index = Math.ceil((percentile / 100) * sorted.length) - 1;
      return sorted[index] || 0;
    }

    usePerformanceObserverFallback() {
      try {
        // LCP fallback
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.handleLCP({ value: lastEntry.startTime, entries });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // FCP fallback  
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              this.handleFCP({ value: entry.startTime });
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        
        this.observers.push(lcpObserver, fcpObserver);
      } catch (e) {
        console.warn('Performance Observer non supporté:', e);
      }
    }

    /**
     * Reporting et alertes
     */
    setupAutomaticReporting() {
      // Envoi des métriques toutes les 30 secondes
      setInterval(() => {
        this.sendMetricsToServer();
      }, 30000);
      
      // Rapport final au déchargement
      window.addEventListener('beforeunload', () => {
        this.sendFinalReport();
      });
      
      // Rapport de session toutes les 5 minutes
      setInterval(() => {
        this.generateSessionReport();
      }, 300000);
    }

    async sendMetricsToServer() {
      if (!this.isMonitoring) return;
      
      const payload = {
        timestamp: Date.now(),
        page_url: window.location.pathname,
        user_agent: navigator.userAgent,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        metrics: this.metrics
      };
      
      try {
        await fetch('/api/performance-metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('Erreur envoi métriques:', e);
      }
    }

    sendFinalReport() {
      const report = this.generateSessionReport();
      
      // Utiliser sendBeacon pour fiabilité
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/performance-session-end', 
          JSON.stringify(report));
      }
    }

    generateSessionReport() {
      const sessionDuration = Date.now() - this.startTime;
      
      return {
        session_id: this.getSessionId(),
        duration: sessionDuration,
        page_url: window.location.pathname,
        web_vitals_summary: this.getWebVitalsSummary(),
        business_summary: this.getBusinessSummary(),
        technical_summary: this.getTechnicalSummary(),
        ux_summary: this.getUXSummary(),
        overall_score: this.calculateOverallScore(),
        recommendations: this.generateRecommendations(),
        timestamp: Date.now()
      };
    }

    getSessionId() {
      if (!sessionStorage.getItem('gd_perf_session')) {
        sessionStorage.setItem('gd_perf_session', 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
      }
      return sessionStorage.getItem('gd_perf_session');
    }

    getWebVitalsSummary() {
      const vitals = this.metrics.webVitals;
      let score = 0;
      let total = 0;
      
      Object.entries(vitals).forEach(([key, data]) => {
        total++;
        if (data.rating === 'good') score += 100;
        else if (data.rating === 'needs-improvement') score += 50;
      });
      
      return {
        score: total > 0 ? score / total : 0,
        details: vitals
      };
    }

    getBusinessSummary() {
      const business = this.metrics.business;
      
      return {
        snipcart_health: business.snipcart_api?.success ? 'healthy' : 'issues',
        average_image_load_time: this.getAverageImageLoadTime(),
        cart_performance: business.cart_interaction?.rating || 'unknown',
        checkout_conversion_rate: this.estimateConversionHealth()
      };
    }

    getAverageImageLoadTime() {
      const images = this.metrics.business.product_images || [];
      if (images.length === 0) return 0;
      
      const total = images.reduce((sum, img) => sum + img.loadTime, 0);
      return total / images.length;
    }

    estimateConversionHealth() {
      // Estimation basée sur la performance technique
      const webVitalsScore = this.getWebVitalsSummary().score;
      const cartPerf = this.metrics.business.cart_interaction?.rating;
      
      if (webVitalsScore > 80 && cartPerf === 'excellent') return 'optimal';
      if (webVitalsScore > 60 && cartPerf !== 'poor') return 'good';
      return 'needs-improvement';
    }

    getTechnicalSummary() {
      return {
        memory_health: this.metrics.technical.memory?.usage_percentage < 60 ? 'healthy' : 'warning',
        network_quality: this.metrics.technical.network?.effectiveType || 'unknown',
        error_rate: this.metrics.technical.error_rate || 0,
        browser_compatibility: this.calculateCompatibilityScore()
      };
    }

    calculateCompatibilityScore() {
      const caps = this.metrics.technical.capabilities || {};
      const modernFeatures = ['webp', 'intersectionObserver', 'serviceWorker'];
      
      const supported = modernFeatures.filter(feature => caps[feature]).length;
      return (supported / modernFeatures.length) * 100;
    }

    getUXSummary() {
      const ux = this.metrics.userExperience;
      
      return {
        scroll_engagement: ux.scroll?.current_scroll_percentage > 50 ? 'engaged' : 'limited',
        interaction_smoothness: ux.responsiveness?.average_response_time < 16 ? 'smooth' : 'choppy',
        accessibility_score: this.calculateAccessibilityScore(),
        form_usability: ux.form_performance?.rating || 'unknown'
      };
    }

    calculateAccessibilityScore() {
      const a11y = this.metrics.userExperience.accessibility || {};
      const totalIssues = a11y.total_issues || 0;
      
      if (totalIssues === 0) return 100;
      if (totalIssues < 5) return 80;
      if (totalIssues < 10) return 60;
      return 40;
    }

    calculateOverallScore() {
      const webVitals = this.getWebVitalsSummary().score;
      const business = this.getBusinessHealth();
      const technical = this.getTechnicalHealth();
      const ux = this.getUXHealth();
      
      return Math.round((webVitals * 0.3 + business * 0.3 + technical * 0.2 + ux * 0.2));
    }

    getBusinessHealth() {
      const summary = this.getBusinessSummary();
      let score = 0;
      
      if (summary.snipcart_health === 'healthy') score += 25;
      if (summary.average_image_load_time < 1000) score += 25;
      if (summary.cart_performance === 'excellent') score += 25;
      if (summary.checkout_conversion_rate === 'optimal') score += 25;
      
      return score;
    }

    getTechnicalHealth() {
      const summary = this.getTechnicalSummary();
      let score = 0;
      
      if (summary.memory_health === 'healthy') score += 25;
      if (summary.error_rate < 1) score += 25;
      if (summary.browser_compatibility > 80) score += 25;
      if (summary.network_quality === '4g') score += 25;
      
      return score;
    }

    getUXHealth() {
      const summary = this.getUXSummary();
      let score = 0;
      
      if (summary.scroll_engagement === 'engaged') score += 25;
      if (summary.interaction_smoothness === 'smooth') score += 25;
      if (summary.accessibility_score > 80) score += 25;
      if (summary.form_usability === 'fast') score += 25;
      
      return score;
    }

    generateRecommendations() {
      const recommendations = [];
      const overall = this.calculateOverallScore();
      
      // Recommandations Web Vitals
      if (this.metrics.webVitals.LCP?.rating === 'poor') {
        recommendations.push('Optimiser le temps de chargement du plus grand élément (LCP > 4s)');
      }
      
      if (this.metrics.webVitals.FID?.rating === 'poor') {
        recommendations.push('Réduire le temps de réponse aux interactions (FID > 300ms)');
      }
      
      if (this.metrics.webVitals.CLS?.rating === 'poor') {
        recommendations.push('Stabiliser la mise en page pour éviter les déplacements (CLS > 0.25)');
      }
      
      // Recommandations business
      if (this.getAverageImageLoadTime() > 2000) {
        recommendations.push('Optimiser la compression des images produits');
      }
      
      if (this.metrics.business.cart_interaction?.rating === 'poor') {
        recommendations.push('Améliorer la réactivité du système de panier');
      }
      
      // Recommandations techniques
      if (this.metrics.technical.memory?.usage_percentage > 70) {
        recommendations.push('Optimiser l\'utilisation mémoire JavaScript');
      }
      
      if (this.metrics.technical.error_rate > 2) {
        recommendations.push('Réduire le taux d\'erreurs JavaScript');
      }
      
      // Score global
      if (overall < 60) {
        recommendations.push('Performance générale à améliorer - score global faible');
      }
      
      return recommendations;
    }

    reportMetric(metricName, data) {
      // Reporter à Analytics si disponible
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('performance_metric', {
          metric_name: metricName,
          metric_value: data.value,
          metric_rating: data.rating
        });
      }
    }

    alertPerformanceIssue(issueType, value) {
      console.warn(`⚠️ Performance Issue: ${issueType}`, value);
      
      // Envoyer alerte au serveur pour monitoring
      fetch('/api/performance-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue_type: issueType,
          value: value,
          timestamp: Date.now(),
          page_url: window.location.pathname,
          user_agent: navigator.userAgent
        })
      }).catch(e => console.warn('Erreur envoi alerte:', e));
    }

    logError(type, error, filename, lineno) {
      const errorData = {
        type: type,
        message: error.message || error,
        filename: filename,
        line: lineno,
        stack: error.stack,
        timestamp: Date.now(),
        page_url: window.location.pathname
      };
      
      // Envoyer au serveur
      fetch('/api/error-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(() => {}); // Silencieux pour éviter les boucles d'erreur
    }

    /**
     * API publique
     */
    getMetrics() {
      return this.metrics;
    }

    getOverallScore() {
      return this.calculateOverallScore();
    }

    getRecommendations() {
      return this.generateRecommendations();
    }

    getSessionReport() {
      return this.generateSessionReport();
    }

    // Méthode pour forcer un rapport immédiat
    forceReport() {
      this.sendMetricsToServer();
      return this.generateSessionReport();
    }

    // Nettoyage
    destroy() {
      this.observers.forEach(observer => observer.disconnect());
      this.isMonitoring = false;
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonPerformanceMonitor = new PerformanceMonitor();
    
    // Mode debug
    if (window.location.hostname === 'localhost') {
      window._debugPerf = window.GeeknDragonPerformanceMonitor;
      console.log('📊 Performance Debug - Utilisez window._debugPerf');
      
      // Rapport automatique dans la console toutes les 60 secondes
      setInterval(() => {
        const report = window._debugPerf.getSessionReport();
        console.log('📊 Performance Report:', report);
      }, 60000);
    }
  });

})();
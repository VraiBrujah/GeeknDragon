/**
 * 🧪 A/B TESTING CLIENT-SIDE - GEEKNDRAGON
 * Support côté client pour les tests multivariés
 */

(function() {
  'use strict';

  class ABTestingClient {
    constructor() {
      this.activeTests = {};
      this.conversionEvents = [];
      this.init();
    }

    init() {
      // Récupérer les variations depuis les attributs data
      this.loadTestVariations();
      
      // Attacher les event listeners pour tracking
      this.attachConversionTracking();
      
      // Reporting automatique
      this.setupAutomaticReporting();
      
      console.log('🧪 A/B Testing Client initialisé');
    }

    loadTestVariations() {
      // Charger depuis les meta tags ou attributs data-
      const testData = document.querySelector('meta[name="ab-tests"]');
      if (testData) {
        try {
          this.activeTests = JSON.parse(testData.content);
        } catch (e) {
          console.warn('Erreur parsing données A/B tests:', e);
        }
      }

      // Alternative: charger depuis attributs body
      const body = document.body;
      Object.keys(body.dataset).forEach(key => {
        if (key.startsWith('abTest')) {
          const testName = key.replace('abTest', '').toLowerCase();
          this.activeTests[testName] = body.dataset[key];
        }
      });
    }

    /**
     * Enregistrer une conversion manuellement
     */
    recordConversion(testName, conversionType = 'interaction', value = 0) {
      const conversion = {
        test_name: testName,
        variation: this.activeTests[testName] || 'control',
        conversion_type: conversionType,
        value: value,
        timestamp: Date.now(),
        page_url: window.location.pathname,
        referrer: document.referrer
      };

      this.conversionEvents.push(conversion);
      
      // Envoyer immédiatement pour les conversions importantes
      if (['purchase', 'add_to_cart', 'signup'].includes(conversionType)) {
        this.sendConversion(conversion);
      }

      // Analytics
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('ab_test_conversion', conversion);
      }
    }

    /**
     * Envoyer les conversions au serveur
     */
    async sendConversion(conversion) {
      try {
        await fetch('/api/ab-test/conversion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(conversion)
        });
      } catch (e) {
        console.warn('Erreur envoi conversion A/B:', e);
      }
    }

    /**
     * Tracking automatique des interactions clés
     */
    attachConversionTracking() {
      // Clics sur CTAs principaux
      document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-ab-track]');
        if (target) {
          const trackType = target.dataset.abTrack;
          const testName = target.dataset.abTest || 'cta_button';
          this.recordConversion(testName, trackType);
        }

        // Boutons d'achat
        if (e.target.closest('.gd-add-to-cart')) {
          this.recordConversion('cta_button', 'add_to_cart_click');
        }

        // Trust signals
        if (e.target.closest('.trust-badge, [data-quebec]')) {
          this.recordConversion('trust_signals', 'trust_signal_click');
        }
      });

      // Hover prolongé sur produits (engagement)
      let hoverTimeout;
      document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.product-card')) {
          hoverTimeout = setTimeout(() => {
            this.recordConversion('product_description', 'product_engagement');
          }, 3000); // 3 secondes de hover
        }
      }, true);

      document.addEventListener('mouseleave', (e) => {
        if (e.target.closest('.product-card')) {
          clearTimeout(hoverTimeout);
        }
      }, true);

      // Scroll depth pour headlines
      this.trackHeadlineEngagement();
    }

    /**
     * Tracking spécial pour l'engagement avec les headlines
     */
    trackHeadlineEngagement() {
      const hero = document.querySelector('.hero-text, .hero-title');
      if (!hero) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Enregistrer la vue de la headline
            this.recordConversion('hero_headline', 'headline_view');
            
            // Tracking du temps passé
            setTimeout(() => {
              if (entry.isIntersecting) {
                this.recordConversion('hero_headline', 'headline_engagement');
              }
            }, 5000);
            
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.7
      });

      observer.observe(hero);
    }

    /**
     * Application dynamique des variations CSS
     */
    applyDynamicStyles() {
      // Trust signals styling selon la variation
      const trustVariation = this.activeTests.trust_signals || 'control';
      this.applyTrustSignalsStyles(trustVariation);

      // Pricing styles
      const pricingVariation = this.activeTests.pricing_display || 'control';
      this.applyPricingStyles(pricingVariation);
    }

    applyTrustSignalsStyles(variation) {
      const styles = {
        'flim_prominent': {
          '.trust-badge[data-type="flim"]': 'transform: scale(1.1); border: 2px solid #fbbf24;',
          '.trust-badge[data-type="quebec"]': 'opacity: 0.8; transform: scale(0.95);'
        },
        'balanced': {
          '.trust-badge': 'transform: scale(1.05);'
        },
        'quebec_prominent': {
          '.trust-badge[data-type="quebec"]': 'transform: scale(1.1); border: 2px solid #3b82f6;',
          '.trust-badge[data-type="flim"]': 'opacity: 0.8; transform: scale(0.95);'
        }
      };

      const variationStyles = styles[variation];
      if (variationStyles) {
        this.injectDynamicCSS('trust-signals', variationStyles);
      }
    }

    applyPricingStyles(variation) {
      const styles = {
        'cad_emphasis': {
          '.product-price': 'font-weight: 700; color: #059669;'
        },
        'value_emphasis': {
          '.product-price': 'position: relative;',
          '.product-price::after': 'content: " (vs 300$ figurines)"; font-size: 0.8em; opacity: 0.7;'
        }
      };

      const variationStyles = styles[variation];
      if (variationStyles) {
        this.injectDynamicCSS('pricing', variationStyles);
      }
    }

    injectDynamicCSS(testName, rules) {
      const existingStyle = document.getElementById(`ab-test-${testName}`);
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement('style');
      style.id = `ab-test-${testName}`;
      
      let css = '';
      Object.entries(rules).forEach(([selector, rule]) => {
        css += `${selector} { ${rule} }\n`;
      });
      
      style.textContent = css;
      document.head.appendChild(style);
    }

    /**
     * Reporting automatique des conversions en batch
     */
    setupAutomaticReporting() {
      // Envoyer les conversions par batch toutes les 30 secondes
      setInterval(() => {
        if (this.conversionEvents.length > 0) {
          this.sendBatchConversions();
        }
      }, 30000);

      // Envoyer au déchargement de la page
      window.addEventListener('beforeunload', () => {
        if (this.conversionEvents.length > 0) {
          navigator.sendBeacon('/api/ab-test/batch-conversions', 
            JSON.stringify(this.conversionEvents));
        }
      });
    }

    async sendBatchConversions() {
      if (this.conversionEvents.length === 0) return;

      try {
        await fetch('/api/ab-test/batch-conversions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify(this.conversionEvents)
        });
        
        this.conversionEvents = []; // Clear après envoi réussi
      } catch (e) {
        console.warn('Erreur envoi batch conversions:', e);
      }
    }

    /**
     * API de debugging
     */
    getDebugInfo() {
      return {
        activeTests: this.activeTests,
        conversionEvents: this.conversionEvents,
        totalConversions: this.conversionEvents.length
      };
    }

    /**
     * Forcer une variation pour testing
     */
    forceVariation(testName, variation) {
      this.activeTests[testName] = variation;
      this.applyDynamicStyles();
      console.log(`🧪 Variation forcée: ${testName} = ${variation}`);
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonABTesting = new ABTestingClient();
    
    // Debug mode
    if (window.location.hostname === 'localhost') {
      window._debugAB = window.GeeknDragonABTesting;
      console.log('🧪 A/B Testing Debug - Utilisez window._debugAB');
    }
  });

  // Helper global pour enregistrer des conversions custom
  window.recordABConversion = function(testName, conversionType, value) {
    if (window.GeeknDragonABTesting) {
      window.GeeknDragonABTesting.recordConversion(testName, conversionType, value);
    }
  };

})();
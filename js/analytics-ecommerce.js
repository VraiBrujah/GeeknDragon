/**
 * 🎯 GOOGLE ANALYTICS 4 E-COMMERCE - GEEKNDRAGON
 * Tracking avancé avec événements personnalisés JDR
 */

(function() {
  'use strict';

  // Configuration Analytics
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXX'; // À remplacer par votre ID
  const DEBUG_MODE = window.location.hostname === 'localhost';
  
  // Enhanced E-commerce Events
  const EcommerceEvents = {
    // Événements produits
    VIEW_ITEM: 'view_item',
    ADD_TO_CART: 'add_to_cart',
    REMOVE_FROM_CART: 'remove_from_cart',
    VIEW_CART: 'view_cart',
    BEGIN_CHECKOUT: 'begin_checkout',
    PURCHASE: 'purchase',
    
    // Événements personnalisés JDR
    PRODUCT_HOVER: 'product_hover',
    QUANTITY_CHANGE: 'quantity_change',
    MULTIPLIER_SELECT: 'multiplier_select',
    LANGUAGE_SWITCH: 'language_switch',
    VIDEO_PLAY: 'video_play',
    TRUST_SIGNAL_CLICK: 'trust_signal_click'
  };

  // Mapping des produits pour GA4
  const ProductMapper = {
    mapProduct(productData) {
      return {
        item_id: productData.id || 'unknown',
        item_name: productData.name || 'Unknown Product',
        category: this.getCategory(productData.id),
        price: parseFloat(productData.price) || 0,
        currency: 'CAD',
        item_brand: 'Geek&Dragon',
        item_category2: this.getSubCategory(productData.id),
        item_variant: productData.variant || 'default',
        quantity: parseInt(productData.quantity) || 1
      };
    },

    getCategory(productId) {
      if (productId.startsWith('lot')) return 'Pièces Métalliques';
      if (productId.startsWith('pack')) return 'Cartes Équipement';
      if (productId.startsWith('triptyque')) return 'Triptyques';
      return 'Autres';
    },

    getSubCategory(productId) {
      const mapping = {
        'lot10': 'Starter Pack',
        'lot25': 'Collection Complète',
        'lot50-essence': 'Premium Double',
        'lot50-tresorerie': 'Premium Uniforme',
        'pack-182-arsenal-aventurier': 'Équipement Base',
        'pack-182-butins-ingenieries': 'Contenu Avancé',
        'pack-182-routes-services': 'Voyage & Services',
        'triptyque-aleatoire': 'Héros Mystère'
      };
      return mapping[productId] || 'Standard';
    }
  };

  // Gestionnaire d'événements Analytics
  class AnalyticsManager {
    constructor() {
      this.isInitialized = false;
      this.eventQueue = [];
      this.userProperties = {};
      this.sessionData = {
        session_start: Date.now(),
        page_views: 0,
        interactions: 0
      };
      
      this.init();
    }

    async init() {
      // Charger gtag.js de manière asynchrone
      await this.loadGoogleAnalytics();
      
      // Configuration GA4
      gtag('config', GA_MEASUREMENT_ID, {
        debug_mode: DEBUG_MODE,
        send_page_view: false, // On gère manuellement
        enhanced_ecommerce: true,
        custom_map: {
          custom_parameter_1: 'product_category_jdr',
          custom_parameter_2: 'user_language_pref',
          custom_parameter_3: 'quebec_customer'
        }
      });

      // Propriétés utilisateur personnalisées
      this.setUserProperties();
      
      // Traitement de la queue d'événements
      this.processEventQueue();
      
      // Event listeners pour interactions
      this.attachEventListeners();
      
      this.isInitialized = true;
      
      if (DEBUG_MODE) {
        console.log('🎯 Analytics E-commerce initialisé');
      }
    }

    async loadGoogleAnalytics() {
      return new Promise((resolve) => {
        // Éviter le double chargement
        if (window.gtag) {
          resolve();
          return;
        }

        // Charger gtag.js
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        script.onload = () => {
          // Initialiser gtag
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){dataLayer.push(arguments);};
          gtag('js', new Date());
          resolve();
        };
        document.head.appendChild(script);
      });
    }

    setUserProperties() {
      const language = document.documentElement.lang || 'fr';
      const isQuebecCustomer = this.detectQuebecUser();
      
      this.userProperties = {
        language_preference: language,
        quebec_customer: isQuebecCustomer,
        device_type: this.getDeviceType(),
        user_engagement: 'new_visitor'
      };

      gtag('set', 'user_properties', this.userProperties);
    }

    detectQuebecUser() {
      // Détecter si l'utilisateur est probablement du Québec
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      
      return timezone.includes('Montreal') || 
             timezone.includes('Toronto') || 
             language.startsWith('fr-CA');
    }

    getDeviceType() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }

    // Événements E-commerce

    trackPageView(pageName, pageTitle) {
      this.sessionData.page_views++;
      
      const eventData = {
        page_title: pageTitle || document.title,
        page_location: window.location.href,
        page_name: pageName,
        session_page_views: this.sessionData.page_views,
        language: document.documentElement.lang
      };

      this.trackEvent('page_view', eventData);
    }

    trackProductView(productData) {
      const item = ProductMapper.mapProduct(productData);
      
      this.trackEvent(EcommerceEvents.VIEW_ITEM, {
        currency: 'CAD',
        value: item.price,
        items: [item]
      });
    }

    trackAddToCart(productData) {
      const item = ProductMapper.mapProduct(productData);
      
      this.trackEvent(EcommerceEvents.ADD_TO_CART, {
        currency: 'CAD',
        value: item.price * item.quantity,
        items: [item]
      });

      // Événement personnalisé pour le son "cling"
      this.trackEvent('treasure_acquired', {
        product_id: item.item_id,
        product_category: item.category,
        value: item.price
      });
    }

    trackRemoveFromCart(productData) {
      const item = ProductMapper.mapProduct(productData);
      
      this.trackEvent(EcommerceEvents.REMOVE_FROM_CART, {
        currency: 'CAD',
        value: item.price * item.quantity,
        items: [item]
      });
    }

    trackPurchase(orderData) {
      const items = orderData.items.map(item => ProductMapper.mapProduct(item));
      
      this.trackEvent(EcommerceEvents.PURCHASE, {
        transaction_id: orderData.transaction_id,
        value: orderData.total,
        currency: 'CAD',
        shipping: orderData.shipping || 0,
        tax: orderData.tax || 0,
        items: items
      });

      // Conversion personnalisée
      this.trackEvent('quebec_artisan_purchase', {
        order_value: orderData.total,
        product_count: items.length,
        shipping_province: orderData.shipping_province || 'unknown'
      });
    }

    // Événements personnalisés JDR

    trackProductHover(productId) {
      this.trackEvent(EcommerceEvents.PRODUCT_HOVER, {
        product_id: productId,
        hover_timestamp: Date.now()
      });
    }

    trackQuantityChange(productId, oldQty, newQty) {
      this.trackEvent(EcommerceEvents.QUANTITY_CHANGE, {
        product_id: productId,
        old_quantity: oldQty,
        new_quantity: newQty,
        change_type: newQty > oldQty ? 'increase' : 'decrease'
      });
    }

    trackMultiplierSelect(productId, multiplier) {
      this.trackEvent(EcommerceEvents.MULTIPLIER_SELECT, {
        product_id: productId,
        multiplier_selected: multiplier,
        multiplier_type: multiplier === 'x1' ? 'standard' : 'engraved'
      });
    }

    trackVideoInteraction(videoId, action, progress = 0) {
      this.trackEvent(EcommerceEvents.VIDEO_PLAY, {
        video_id: videoId,
        video_action: action, // play, pause, complete
        video_progress: progress,
        video_type: 'product_demo'
      });
    }

    trackTrustSignalClick(signalType) {
      this.trackEvent(EcommerceEvents.TRUST_SIGNAL_CLICK, {
        trust_signal_type: signalType, // flim2025, quebec_made, fast_shipping
        click_timestamp: Date.now()
      });
    }

    trackLanguageSwitch(fromLang, toLang) {
      this.trackEvent(EcommerceEvents.LANGUAGE_SWITCH, {
        from_language: fromLang,
        to_language: toLang,
        switch_method: 'manual'
      });
    }

    // Utilitaires

    trackEvent(eventName, eventParams = {}) {
      if (!this.isInitialized) {
        this.eventQueue.push({eventName, eventParams});
        return;
      }

      this.sessionData.interactions++;
      
      // Ajouter des métadonnées de session
      const enhancedParams = {
        ...eventParams,
        session_interactions: this.sessionData.interactions,
        time_on_site: Date.now() - this.sessionData.session_start,
        device_type: this.userProperties.device_type
      };

      gtag('event', eventName, enhancedParams);
      
      if (DEBUG_MODE) {
        console.log(`📊 Event: ${eventName}`, enhancedParams);
      }
    }

    processEventQueue() {
      while (this.eventQueue.length > 0) {
        const {eventName, eventParams} = this.eventQueue.shift();
        this.trackEvent(eventName, eventParams);
      }
    }

    attachEventListeners() {
      // Hover sur produits
      document.addEventListener('mouseenter', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
          const productId = this.extractProductId(productCard);
          if (productId) {
            this.trackProductHover(productId);
          }
        }
      }, true);

      // Clics sur signaux de confiance
      document.addEventListener('click', (e) => {
        const trustElement = e.target.closest('[data-quebec], .trust-badge');
        if (trustElement) {
          const signalType = trustElement.dataset.trustType || 'quebec_made';
          this.trackTrustSignalClick(signalType);
        }
      });

      // Vidéos
      document.addEventListener('play', (e) => {
        if (e.target.tagName === 'VIDEO') {
          const videoId = e.target.id || 'unnamed_video';
          this.trackVideoInteraction(videoId, 'play');
        }
      }, true);

      // Scroll depth tracking
      this.trackScrollDepth();
    }

    trackScrollDepth() {
      let maxScroll = 0;
      const milestones = [25, 50, 75, 90];
      const triggered = new Set();

      window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );
        
        maxScroll = Math.max(maxScroll, scrollPercent);
        
        milestones.forEach(milestone => {
          if (scrollPercent >= milestone && !triggered.has(milestone)) {
            triggered.add(milestone);
            this.trackEvent('scroll_depth', {
              scroll_percentage: milestone,
              page_url: window.location.pathname
            });
          }
        });
      });
    }

    extractProductId(element) {
      // Extraction de l'ID produit depuis différents attributs possibles
      return element.dataset.productId || 
             element.querySelector('[data-product-id]')?.dataset.productId ||
             element.id?.replace('product-', '');
    }

    // API publique pour le site
    getStats() {
      return {
        session_duration: Date.now() - this.sessionData.session_start,
        page_views: this.sessionData.page_views,
        interactions: this.sessionData.interactions,
        user_properties: this.userProperties
      };
    }
  }

  // Initialisation globale
  window.GeeknDragonAnalytics = new AnalyticsManager();

  // Auto-track de la page actuelle
  document.addEventListener('DOMContentLoaded', () => {
    const pageName = document.body.dataset.page || 'unknown';
    window.GeeknDragonAnalytics.trackPageView(pageName);
  });

  if (DEBUG_MODE) {
    // Expose pour debugging
    window._debugAnalytics = window.GeeknDragonAnalytics;
    console.log('🎯 Analytics Debug Mode - Utilisez window._debugAnalytics');
  }

})();
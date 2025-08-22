/**
 * 🤖 SYSTÈME RECOMMANDATIONS PRODUITS CLIENT - GEEKNDRAGON
 * Interface utilisateur pour recommandations IA avec tracking avancé
 */

(function() {
  'use strict';

  class ProductRecommendationSystem {
    constructor() {
      this.recommendations = [];
      this.userContext = {};
      this.displayedRecommendations = new Set();
      this.interactionData = {
        views: [],
        clicks: [],
        hovers: [],
        dismissals: []
      };
      
      this.config = {
        maxDisplayed: 6,
        refreshInterval: 300000, // 5 minutes
        animationDelay: 100,
        trackingEnabled: true,
        autoRefresh: true
      };
      
      this.templates = this.initializeTemplates();
      this.init();
    }

    async init() {
      // Collecter le contexte utilisateur
      await this.gatherUserContext();
      
      // Charger recommandations initiales
      await this.loadInitialRecommendations();
      
      // Afficher les recommandations selon la page
      this.displayContextualRecommendations();
      
      // Tracker les interactions
      this.setupInteractionTracking();
      
      // Auto-refresh périodique
      if (this.config.autoRefresh) {
        this.setupAutoRefresh();
      }
      
      console.log('🤖 Product Recommendation System initialisé');
    }

    /**
     * Collecte du contexte utilisateur
     */
    async gatherUserContext() {
      this.userContext = {
        // Données de session
        session_id: this.getSessionId(),
        page_url: window.location.pathname,
        page_views: this.getPageViews(),
        time_on_site: this.getTimeOnSite(),
        
        // Comportement utilisateur
        scroll_depth: this.getScrollDepth(),
        interactions_count: this.getInteractionsCount(),
        cart_products: this.getCartProducts(),
        cart_value: this.getCartValue(),
        
        // Préférences détectées
        device_type: this.getDeviceType(),
        preferred_themes: this.getPreferredThemes(),
        price_sensitivity: this.getPriceSensitivity(),
        user_segment: this.detectUserSegment(),
        
        // Historique de navigation
        viewed_products: this.getViewedProducts(),
        previous_purchases: this.getPreviousPurchases(),
        
        // Données A/B Testing
        ab_tests: this.getABTestVariations(),
        
        // Données analytics
        referrer: document.referrer,
        timestamp: Date.now()
      };
    }

    /**
     * Chargement des recommandations depuis l'API
     */
    async loadInitialRecommendations() {
      const pageContext = this.getPageContext();
      
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            context: this.userContext,
            page_context: pageContext,
            current_product: this.getCurrentProductId(),
            max_results: this.config.maxDisplayed
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          this.recommendations = data.recommendations || [];
          this.userContext.user_profile = data.detected_profile || 'nouveau_joueur';
          
          console.log(`🤖 ${this.recommendations.length} recommandations chargées pour profil: ${this.userContext.user_profile}`);
        } else {
          console.warn('Erreur chargement recommandations:', response.status);
          this.loadFallbackRecommendations();
        }
      } catch (error) {
        console.warn('Erreur API recommandations:', error);
        this.loadFallbackRecommendations();
      }
    }

    /**
     * Affichage contextuel des recommandations
     */
    displayContextualRecommendations() {
      const pageContext = this.getPageContext();
      
      switch (pageContext) {
        case 'homepage':
          this.displayHomepageRecommendations();
          break;
        case 'product_page':
          this.displayProductPageRecommendations();
          break;
        case 'boutique':
          this.displayShopRecommendations();
          break;
        case 'cart':
          this.displayCartRecommendations();
          break;
        default:
          this.displayGenericRecommendations();
      }
    }

    /**
     * Recommandations homepage
     */
    displayHomepageRecommendations() {
      const container = document.querySelector('.hero-recommendations') || 
                       this.createRecommendationContainer('hero-recommendations', 'hero-section');
      
      if (!container) return;
      
      const topRecommendations = this.recommendations.slice(0, 3);
      
      container.innerHTML = `
        <div class="recommendations-header">
          <h3 class="text-2xl font-bold text-purple-800 mb-4">
            <i class="fas fa-magic mr-2"></i>
            Recommandé pour vous
          </h3>
          <p class="text-gray-600 mb-6">Sélection personnalisée basée sur votre profil de joueur</p>
        </div>
        <div class="recommendations-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          ${topRecommendations.map((rec, index) => this.renderRecommendationCard(rec, 'homepage', index)).join('')}
        </div>
      `;
      
      this.animateRecommendations(container);
      this.trackRecommendationViews(topRecommendations, 'homepage');
    }

    /**
     * Recommandations page produit
     */
    displayProductPageRecommendations() {
      // Section "Vous pourriez aussi aimer"
      const relatedContainer = this.createRecommendationContainer('related-products', '.product-details', 'afterend');
      
      const relatedRecs = this.recommendations.filter(r => 
        ['upsell', 'cross_sell', 'complementary'].includes(r.recommendation_type)
      );
      
      if (relatedRecs.length > 0 && relatedContainer) {
        relatedContainer.innerHTML = `
          <section class="related-products bg-gradient-to-r from-purple-50 to-blue-50 py-12 mt-12 rounded-xl">
            <div class="container mx-auto px-4">
              <h3 class="text-3xl font-bold text-center mb-8 text-purple-800">
                <i class="fas fa-sparkles mr-2"></i>
                Perfectionnez votre collection
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${relatedRecs.slice(0, 3).map((rec, index) => this.renderRecommendationCard(rec, 'product_page', index)).join('')}
              </div>
            </div>
          </section>
        `;
        
        this.animateRecommendations(relatedContainer);
        this.trackRecommendationViews(relatedRecs.slice(0, 3), 'product_page');
      }
      
      // Widget recommandation flottant
      this.displayFloatingRecommendation();
    }

    /**
     * Recommandations boutique
     */
    displayShopRecommendations() {
      const container = this.createRecommendationContainer('shop-recommendations', '.products-grid', 'beforebegin');
      
      if (!container) return;
      
      const personalizedRecs = this.recommendations.filter(r => r.confidence > 0.7).slice(0, 4);
      
      container.innerHTML = `
        <section class="shop-recommendations bg-white border-2 border-purple-200 rounded-xl p-6 mb-8 shadow-lg">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-purple-800">
                <i class="fas fa-user-crown mr-2"></i>
                Sélection personnalisée
              </h3>
              <p class="text-gray-600">Basée sur votre profil : <span class="font-semibold">${this.getProfileDisplayName()}</span></p>
            </div>
            <button class="refresh-recommendations text-purple-600 hover:text-purple-800 transition-colors">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${personalizedRecs.map((rec, index) => this.renderCompactRecommendationCard(rec, 'boutique', index)).join('')}
          </div>
        </section>
      `;
      
      // Event listener pour refresh
      container.querySelector('.refresh-recommendations')?.addEventListener('click', () => {
        this.refreshRecommendations('boutique');
      });
      
      this.animateRecommendations(container);
      this.trackRecommendationViews(personalizedRecs, 'boutique');
    }

    /**
     * Recommandations panier
     */
    displayCartRecommendations() {
      const container = this.createRecommendationContainer('cart-recommendations', '.cart-summary', 'afterend');
      
      if (!container) return;
      
      const cartRecs = this.recommendations.filter(r => 
        ['category_completion', 'value_threshold', 'impulse'].includes(r.recommendation_type)
      );
      
      container.innerHTML = `
        <div class="cart-recommendations bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <h3 class="text-xl font-bold text-yellow-800 mb-4">
            <i class="fas fa-lightbulb mr-2"></i>
            Complétez votre commande
          </h3>
          <div class="space-y-4">
            ${cartRecs.slice(0, 3).map((rec, index) => this.renderCartRecommendationCard(rec, index)).join('')}
          </div>
        </div>
      `;
      
      this.animateRecommendations(container);
      this.trackRecommendationViews(cartRecs.slice(0, 3), 'cart');
    }

    /**
     * Widget recommandation flottant
     */
    displayFloatingRecommendation() {
      if (document.querySelector('.floating-recommendation')) return;
      
      const topRec = this.recommendations.find(r => r.confidence > 0.8);
      if (!topRec) return;
      
      const widget = document.createElement('div');
      widget.className = 'floating-recommendation fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-xl shadow-2xl border-2 border-purple-200 p-4 transform translate-y-full transition-transform duration-500';
      widget.dataset.recommendationId = topRec.product.id;
      
      widget.innerHTML = `
        <div class="flex items-start space-x-3">
          <img src="/images/optimized-modern/webp/${topRec.product.id}-thumb.webp" 
               alt="${topRec.product.name}" 
               class="w-16 h-16 rounded-lg object-cover">
          <div class="flex-1">
            <p class="text-sm text-purple-600 font-semibold mb-1">Recommandé pour vous</p>
            <h4 class="text-sm font-bold text-gray-800 mb-1">${topRec.product.name}</h4>
            <p class="text-xs text-gray-600 mb-2">${topRec.reason}</p>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-purple-600">${topRec.product.price}$ CAD</span>
              <button class="add-floating-rec bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                Ajouter
              </button>
            </div>
          </div>
          <button class="close-floating text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(widget);
      
      // Animer l'apparition après 3 secondes
      setTimeout(() => {
        widget.style.transform = 'translateY(0)';
      }, 3000);
      
      // Event listeners
      widget.querySelector('.close-floating').addEventListener('click', () => {
        this.dismissFloatingRecommendation(widget, topRec);
      });
      
      widget.querySelector('.add-floating-rec').addEventListener('click', () => {
        this.addRecommendationToCart(topRec);
        this.dismissFloatingRecommendation(widget, topRec);
      });
      
      // Auto-dismiss après 15 secondes
      setTimeout(() => {
        if (document.body.contains(widget)) {
          this.dismissFloatingRecommendation(widget, topRec);
        }
      }, 15000);
    }

    /**
     * Templates de rendu
     */
    renderRecommendationCard(recommendation, context, index) {
      const product = recommendation.product;
      const confidence = Math.round(recommendation.confidence * 100);
      
      return `
        <div class="recommendation-card group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-purple-200 transform hover:-translate-y-2" 
             data-rec-id="${product.id}" 
             data-rec-type="${recommendation.recommendation_type}"
             data-rec-index="${index}"
             style="animation-delay: ${index * this.config.animationDelay}ms">
          
          <div class="relative overflow-hidden">
            <img src="/images/optimized-modern/webp/${product.id}-hero.webp" 
                 alt="${product.name}" 
                 class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500">
            
            <div class="absolute top-3 left-3">
              <span class="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                <i class="fas fa-robot mr-1"></i>
                ${confidence}% match
              </span>
            </div>
            
            ${recommendation.urgency ? `
              <div class="absolute top-3 right-3">
                <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                  <i class="fas fa-clock mr-1"></i>
                  Dernière chance
                </span>
              </div>
            ` : ''}
          </div>
          
          <div class="p-6">
            <h4 class="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
              ${product.name}
            </h4>
            
            <p class="text-sm text-gray-600 mb-3">
              <i class="fas fa-info-circle mr-1 text-purple-500"></i>
              ${recommendation.reason}
            </p>
            
            <div class="flex items-center justify-between mb-4">
              <span class="text-2xl font-bold text-purple-600">${product.price}$ CAD</span>
              ${recommendation.value_increase ? `
                <span class="text-xs text-green-600 font-semibold">
                  +${recommendation.value_increase}$ de valeur
                </span>
              ` : ''}
            </div>
            
            <div class="flex space-x-2">
              <button class="add-recommendation flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105">
                <i class="fas fa-shopping-cart mr-2"></i>
                Ajouter au panier
              </button>
              <button class="view-recommendation bg-gray-100 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                <i class="fas fa-eye"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    renderCompactRecommendationCard(recommendation, context, index) {
      const product = recommendation.product;
      
      return `
        <div class="compact-rec-card bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 border border-purple-100 hover:border-purple-300" 
             data-rec-id="${product.id}" 
             data-rec-type="${recommendation.recommendation_type}"
             data-rec-index="${index}">
          
          <div class="flex items-center space-x-3">
            <img src="/images/optimized-modern/webp/${product.id}-thumb.webp" 
                 alt="${product.name}" 
                 class="w-12 h-12 rounded-lg object-cover">
            <div class="flex-1">
              <h5 class="font-semibold text-sm text-gray-800 mb-1">${product.name}</h5>
              <p class="text-xs text-gray-600 mb-2">${recommendation.reason}</p>
              <div class="flex items-center justify-between">
                <span class="text-sm font-bold text-purple-600">${product.price}$ CAD</span>
                <button class="add-compact-rec bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    renderCartRecommendationCard(recommendation, index) {
      const product = recommendation.product;
      
      return `
        <div class="cart-rec-card flex items-center space-x-4 bg-white rounded-lg p-4 border border-yellow-200 hover:border-yellow-400 transition-colors" 
             data-rec-id="${product.id}" 
             data-rec-type="${recommendation.recommendation_type}"
             data-rec-index="${index}">
          
          <img src="/images/optimized-modern/webp/${product.id}-thumb.webp" 
               alt="${product.name}" 
               class="w-16 h-16 rounded-lg object-cover">
          
          <div class="flex-1">
            <h5 class="font-semibold text-gray-800 mb-1">${product.name}</h5>
            <p class="text-sm text-gray-600 mb-2">${recommendation.reason}</p>
            <span class="text-lg font-bold text-yellow-600">${product.price}$ CAD</span>
          </div>
          
          <button class="add-cart-rec bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
            <i class="fas fa-plus mr-1"></i>
            Ajouter
          </button>
        </div>
      `;
    }

    /**
     * Tracking des interactions
     */
    setupInteractionTracking() {
      // Tracking des clics sur recommandations
      document.addEventListener('click', (e) => {
        const recCard = e.target.closest('[data-rec-id]');
        if (!recCard) return;
        
        const recId = recCard.dataset.recId;
        const recType = recCard.dataset.recType;
        const recIndex = parseInt(recCard.dataset.recIndex);
        
        if (e.target.matches('.add-recommendation, .add-compact-rec, .add-cart-rec, .add-floating-rec')) {
          this.trackRecommendationClick(recId, recType, recIndex, 'add_to_cart');
          this.addRecommendationToCart(this.findRecommendationById(recId));
        } else if (e.target.matches('.view-recommendation')) {
          this.trackRecommendationClick(recId, recType, recIndex, 'view_product');
          this.viewRecommendationProduct(recId);
        }
      });
      
      // Tracking des hovers
      document.addEventListener('mouseenter', (e) => {
        const recCard = e.target.closest('[data-rec-id]');
        if (recCard && !recCard.dataset.hoverTracked) {
          recCard.dataset.hoverTracked = 'true';
          this.trackRecommendationHover(recCard.dataset.recId, recCard.dataset.recType);
        }
      }, true);
    }

    trackRecommendationViews(recommendations, context) {
      recommendations.forEach((rec, index) => {
        this.interactionData.views.push({
          product_id: rec.product.id,
          recommendation_type: rec.recommendation_type,
          context: context,
          position: index,
          confidence: rec.confidence,
          timestamp: Date.now()
        });
        
        this.displayedRecommendations.add(rec.product.id);
      });
      
      // Envoyer au serveur
      this.sendInteractionData('view');
    }

    trackRecommendationClick(productId, recType, index, action) {
      this.interactionData.clicks.push({
        product_id: productId,
        recommendation_type: recType,
        position: index,
        action: action,
        timestamp: Date.now()
      });
      
      this.sendInteractionData('click');
      
      // Analytics
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('recommendation_click', {
          product_id: productId,
          recommendation_type: recType,
          position: index,
          action: action
        });
      }
    }

    trackRecommendationHover(productId, recType) {
      this.interactionData.hovers.push({
        product_id: productId,
        recommendation_type: recType,
        timestamp: Date.now()
      });
    }

    /**
     * Actions sur recommandations
     */
    addRecommendationToCart(recommendation) {
      const product = recommendation.product;
      
      // Intégration Snipcart
      if (window.Snipcart) {
        window.Snipcart.api.items.add({
          id: product.id,
          name: product.name,
          price: product.price,
          url: window.location.href,
          description: `Recommandé: ${recommendation.reason}`
        });
      }
      
      // Feedback visuel
      this.showRecommendationFeedback(`✨ ${product.name} ajouté au panier !`, 'success');
      
      // Analytics
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackAddToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category,
          source: 'recommendation'
        });
      }
    }

    viewRecommendationProduct(productId) {
      // Redirection vers page produit
      const productUrl = this.getProductUrl(productId);
      window.open(productUrl, '_blank');
    }

    dismissFloatingRecommendation(widget, recommendation) {
      widget.style.transform = 'translateY(100%)';
      
      setTimeout(() => {
        if (document.body.contains(widget)) {
          document.body.removeChild(widget);
        }
      }, 500);
      
      // Tracker le dismiss
      this.interactionData.dismissals.push({
        product_id: recommendation.product.id,
        recommendation_type: recommendation.recommendation_type,
        timestamp: Date.now()
      });
    }

    /**
     * Utilitaires
     */
    createRecommendationContainer(className, selector, position = 'beforeend') {
      const existing = document.querySelector(`.${className}`);
      if (existing) return existing;
      
      const target = document.querySelector(selector);
      if (!target) return null;
      
      const container = document.createElement('div');
      container.className = className;
      
      if (position === 'afterend') {
        target.insertAdjacentElement('afterend', container);
      } else if (position === 'beforebegin') {
        target.insertAdjacentElement('beforebegin', container);
      } else {
        target.appendChild(container);
      }
      
      return container;
    }

    animateRecommendations(container) {
      const cards = container.querySelectorAll('.recommendation-card, .compact-rec-card, .cart-rec-card');
      
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * this.config.animationDelay);
      });
    }

    showRecommendationFeedback(message, type = 'info') {
      // Toast notification
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg text-white font-semibold transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
      }`;
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.transform = 'translateX(0)';
      }, 100);
      
      setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
          if (document.body.contains(toast)) {
            document.body.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }

    /**
     * Contexte et données utilisateur
     */
    getPageContext() {
      const path = window.location.pathname;
      
      if (path === '/' || path === '/index.php') return 'homepage';
      if (path.includes('boutique')) return 'boutique';
      if (path.includes('lot') || path.includes('pack') || path.includes('triptyque')) return 'product_page';
      if (path.includes('cart') || document.querySelector('.snipcart-cart')) return 'cart';
      
      return 'general';
    }

    getCurrentProductId() {
      const path = window.location.pathname;
      const productMatch = path.match(/\/(lot\d+|pack-[\w-]+|triptyque-[\w-]+)/);
      return productMatch ? productMatch[1] : null;
    }

    getSessionId() {
      return sessionStorage.getItem('gd_session_id') || 'anonymous_' + Date.now();
    }

    getPageViews() {
      const views = parseInt(sessionStorage.getItem('gd_page_views') || '0');
      sessionStorage.setItem('gd_page_views', (views + 1).toString());
      return views + 1;
    }

    getTimeOnSite() {
      const startTime = parseInt(sessionStorage.getItem('gd_session_start') || Date.now().toString());
      return Date.now() - startTime;
    }

    getScrollDepth() {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );
      return Math.min(100, Math.max(0, scrollPercent));
    }

    getInteractionsCount() {
      return parseInt(sessionStorage.getItem('gd_interactions') || '0');
    }

    getCartProducts() {
      // Intégration Snipcart
      if (window.Snipcart?.store?.getState) {
        const cart = window.Snipcart.store.getState().cart;
        return cart.items.items.map(item => item.id);
      }
      return [];
    }

    getCartValue() {
      if (window.Snipcart?.store?.getState) {
        const cart = window.Snipcart.store.getState().cart;
        return cart.subtotal;
      }
      return 0;
    }

    getDeviceType() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }

    getPreferredThemes() {
      // Analyser les pages vues pour détecter les thèmes préférés
      const viewedPages = JSON.parse(sessionStorage.getItem('gd_viewed_pages') || '[]');
      const themes = [];
      
      if (viewedPages.some(p => p.includes('lot'))) themes.push('aventure', 'combat');
      if (viewedPages.some(p => p.includes('pack'))) themes.push('équipement', 'exploration');
      if (viewedPages.some(p => p.includes('triptyque'))) themes.push('héros', 'mystère');
      
      return themes.length > 0 ? themes : ['aventure', 'exploration'];
    }

    getPriceSensitivity() {
      // Analyser le comportement pour détecter la sensibilité au prix
      const cartValue = this.getCartValue();
      const pageViews = this.getPageViews();
      
      if (cartValue === 0 && pageViews > 5) return 'high'; // Regarde beaucoup, n'achète pas
      if (cartValue > 200) return 'low'; // Achète cher
      return 'medium';
    }

    detectUserSegment() {
      const pageViews = this.getPageViews();
      const cartValue = this.getCartValue();
      const timeOnSite = this.getTimeOnSite();
      
      if (pageViews === 1 && cartValue === 0) return 'nouveau_visiteur';
      if (cartValue > 200 || timeOnSite > 600000) return 'collectionneur';
      if (cartValue > 100) return 'joueur_régulier';
      return 'nouveau_joueur';
    }

    getViewedProducts() {
      return JSON.parse(sessionStorage.getItem('gd_viewed_products') || '[]');
    }

    getPreviousPurchases() {
      // À connecter avec historique réel
      return JSON.parse(localStorage.getItem('gd_purchase_history') || '[]');
    }

    getABTestVariations() {
      if (window.GeeknDragonABTesting) {
        return window.GeeknDragonABTesting.activeTests;
      }
      return {};
    }

    getProfileDisplayName() {
      const profiles = {
        'nouveau_joueur': 'Nouveau Joueur',
        'joueur_régulier': 'Joueur Régulier',
        'maître_de_jeu': 'Maître de Jeu',
        'collectionneur': 'Collectionneur'
      };
      return profiles[this.userContext.user_profile] || 'Joueur';
    }

    getProductUrl(productId) {
      const urls = {
        'lot10': '/lot10.php',
        'lot25': '/lot25.php',
        'lot50-essence': '/lot50-essence.php',
        'lot50-tresorerie': '/lot50-tresorerie.php',
        'pack-182-arsenal-aventurier': '/pack-arsenal.php',
        'pack-182-butins-ingenieries': '/pack-butins.php',
        'pack-182-routes-services': '/pack-routes.php',
        'triptyque-aleatoire': '/triptyque.php'
      };
      return urls[productId] || '/boutique.php';
    }

    findRecommendationById(productId) {
      return this.recommendations.find(r => r.product.id === productId);
    }

    /**
     * Communication serveur
     */
    async sendInteractionData(type) {
      if (!this.config.trackingEnabled) return;
      
      try {
        await fetch('/api/recommendations/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            type: type,
            data: this.interactionData[type === 'view' ? 'views' : 'clicks'],
            context: this.userContext,
            timestamp: Date.now()
          })
        });
      } catch (error) {
        console.warn('Erreur envoi tracking recommandations:', error);
      }
    }

    async refreshRecommendations(context) {
      await this.gatherUserContext();
      await this.loadInitialRecommendations();
      this.displayContextualRecommendations();
    }

    setupAutoRefresh() {
      setInterval(() => {
        this.refreshRecommendations(this.getPageContext());
      }, this.config.refreshInterval);
    }

    /**
     * Fallback si API indisponible
     */
    loadFallbackRecommendations() {
      this.recommendations = [
        {
          product: { id: 'lot10', name: 'Lot de 10 pièces métalliques', price: 60 },
          reason: 'Choix populaire des nouveaux joueurs',
          confidence: 0.8,
          recommendation_type: 'popular'
        },
        {
          product: { id: 'triptyque-aleatoire', name: 'Triptyque Héros Aléatoire', price: 25 },
          reason: 'Parfait complément pour vos aventures',
          confidence: 0.7,
          recommendation_type: 'complementary'
        }
      ];
    }

    initializeTemplates() {
      return {
        // Templates réutilisables si nécessaire
      };
    }

    /**
     * API publique
     */
    getRecommendationStats() {
      return {
        total_displayed: this.displayedRecommendations.size,
        interaction_data: this.interactionData,
        user_context: this.userContext,
        recommendations_count: this.recommendations.length
      };
    }

    // Forcer refresh manuel
    forceRefresh() {
      this.refreshRecommendations(this.getPageContext());
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonRecommendations = new ProductRecommendationSystem();
    
    // Debug mode
    if (window.location.hostname === 'localhost') {
      window._debugRecs = window.GeeknDragonRecommendations;
      console.log('🤖 Recommendations Debug - Utilisez window._debugRecs');
    }
  });

})();
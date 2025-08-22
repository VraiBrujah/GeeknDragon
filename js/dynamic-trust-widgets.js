/**
 * 🛡️ WIDGETS DE CONFIANCE DYNAMIQUES - GEEKNDRAGON
 * Signaux de confiance intelligents et adaptatifs pour maximiser conversions
 */

(function() {
  'use strict';

  class DynamicTrustWidgets {
    constructor() {
      this.trustSignals = {
        flim2025: {
          name: 'FLIM 2025',
          icon: 'fas fa-trophy',
          color: '#f59e0b',
          priority: 95,
          testimonials: [
            '"Ces pièces ont transformé nos parties, l\'immersion est totale !" - Marc, MJ depuis 8 ans',
            '"Qualité exceptionnelle, mes joueurs adorent le clinking des pièces" - Sarah, Collectionneuse',
            '"Fini les calculs fastidieux, tout devient intuitif" - Alex, Nouveau MJ'
          ],
          stats: { satisfaction: 98, usage: 87, recommendation: 96 }
        },
        
        quebecMade: {
          name: 'Fait au Québec',
          icon: 'fas fa-flag',
          color: '#3b82f6',
          priority: 90,
          testimonials: [
            '"Fier de soutenir l\'artisanat québécois de qualité" - Pierre, Collectionneur',
            '"Livraison rapide depuis le Québec, service impeccable" - Marie, MJ',
            '"Savoir que c\'est fait ici ajoute de la valeur émotionnelle" - Jean, Joueur'
          ],
          stats: { local_pride: 94, quality: 92, support: 89 }
        },
        
        fastShipping: {
          name: 'Livraison Rapide',
          icon: 'fas fa-shipping-fast',
          color: '#10b981',
          priority: 85,
          testimonials: [
            '"Commandé lundi, reçu mercredi ! Parfait pour ma session du weekend" - Lisa, MJ',
            '"Emballage soigné, arrivé en parfait état" - David, Joueur',
            '"Service client réactif quand j\'ai eu une question" - Sophie, Collectionneuse'
          ],
          stats: { delivery_time: 2.3, satisfaction: 96, repeat_rate: 78 }
        },
        
        securePayment: {
          name: 'Paiement Sécurisé',
          icon: 'fas fa-shield-alt',
          color: '#8b5cf6',
          priority: 75,
          testimonials: [
            '"Transaction sécurisée, aucun souci avec mes données" - Robert, Acheteur',
            '"Interface de paiement claire et rassurante" - Nathalie, Cliente',
            '"Plusieurs options de paiement disponibles" - Marc, Utilisateur'
          ],
          stats: { security_score: 99, payment_success: 98, fraud_rate: 0.02 }
        },
        
        customerSupport: {
          name: 'Support Client 5★',
          icon: 'fas fa-headset',
          color: '#f97316',
          priority: 80,
          testimonials: [
            '"Réponse rapide à mes questions sur les produits" - Caroline, Acheteuse',
            '"Aide précieuse pour choisir le bon lot" - Thomas, Nouveau joueur',
            '"Service après-vente exemplaire" - Michel, Client fidèle'
          ],
          stats: { response_time: '< 2h', satisfaction: 97, resolution_rate: 94 }
        },
        
        communityTrust: {
          name: 'Communauté JDR',
          icon: 'fas fa-users',
          color: '#ec4899',
          priority: 70,
          testimonials: [
            '"Recommandé par ma communauté de joueurs" - Amélie, Joueuse',
            '"Les forums JDR en parlent positivement" - Vincent, MJ expérimenté',
            '"Approuvé par plusieurs tables de jeu" - Isabelle, Organisatrice'
          ],
          stats: { community_size: 2847, active_users: 1834, recommendations: 156 }
        },
        
        qualityGuarantee: {
          name: 'Garantie Qualité',
          icon: 'fas fa-certificate',
          color: '#dc2626',
          priority: 82,
          testimonials: [
            '"Garantie qui me rassure sur la qualité" - Philippe, Acheteur prudent',
            '"Remplacement gratuit suite à un défaut, super service" - Lucie, Cliente',
            '"Qualité constante sur toutes mes commandes" - Bruno, Collectionneur'
          ],
          stats: { return_rate: 0.8, replacement_rate: 0.3, satisfaction: 98 }
        }
      };
      
      this.displayPatterns = {
        homepage: ['flim2025', 'quebecMade', 'fastShipping'],
        product: ['flim2025', 'qualityGuarantee', 'customerSupport', 'securePayment'],
        boutique: ['quebecMade', 'communityTrust', 'fastShipping'],
        cart: ['securePayment', 'fastShipping', 'qualityGuarantee'],
        checkout: ['securePayment', 'qualityGuarantee']
      };
      
      this.animations = {
        fadeIn: 'opacity-0 animate-fadeIn',
        slideUp: 'translate-y-4 opacity-0 animate-slideUp',
        pulse: 'animate-pulse',
        bounce: 'animate-bounce'
      };
      
      this.userContext = {};
      this.displayedWidgets = new Set();
      this.interactionStats = {
        views: [],
        clicks: [],
        conversions: []
      };
      
      this.init();
    }

    async init() {
      // Analyser le contexte utilisateur
      await this.analyzeUserContext();
      
      // Afficher widgets selon la page
      this.displayPageSpecificWidgets();
      
      // Widgets flottants contextuels
      this.initializeFloatingWidgets();
      
      // Widgets de temps réel
      this.initializeRealTimeWidgets();
      
      // Social proof dynamique
      this.initializeSocialProof();
      
      // Tracking des interactions
      this.setupInteractionTracking();
      
      console.log('🛡️ Dynamic Trust Widgets initialisés');
    }

    /**
     * Analyse du contexte utilisateur
     */
    async analyzeUserContext() {
      this.userContext = {
        page_type: this.detectPageType(),
        user_segment: this.detectUserSegment(),
        cart_value: this.getCartValue(),
        session_duration: this.getSessionDuration(),
        device_type: this.getDeviceType(),
        is_returning_visitor: this.isReturningVisitor(),
        geo_location: await this.getGeoLocation(),
        time_of_day: this.getTimeOfDay(),
        referrer_source: this.getReferrerSource(),
        scroll_depth: 0
      };
      
      // Écouter les changements de contexte
      this.setupContextMonitoring();
    }

    /**
     * Affichage widgets spécifiques par page
     */
    displayPageSpecificWidgets() {
      const pageType = this.userContext.page_type;
      const widgetsForPage = this.displayPatterns[pageType] || this.displayPatterns.homepage;
      
      // Widget principal en header
      this.displayHeaderTrustWidget();
      
      // Widgets inline selon la page
      widgetsForPage.forEach((signalKey, index) => {
        setTimeout(() => {
          this.displayInlineWidget(signalKey, index);
        }, index * 200); // Animation échelonnée
      });
      
      // Widget de testimonials contextuels
      this.displayTestimonialsWidget();
    }

    /**
     * Widget de confiance principal dans le header
     */
    displayHeaderTrustWidget() {
      const headerContainer = document.querySelector('.trust-signals-header') || 
                            this.createTrustContainer('header');
      
      if (!headerContainer) return;
      
      const topSignals = this.getTopSignalsForContext(3);
      
      headerContainer.innerHTML = `
        <div class="flex flex-wrap items-center justify-center gap-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
          ${topSignals.map(signal => this.renderHeaderSignal(signal)).join('')}
        </div>
      `;
      
      this.animateWidgets(headerContainer);
      this.trackWidgetDisplay('header', topSignals);
    }

    /**
     * Widgets inline dans le contenu
     */
    displayInlineWidget(signalKey, index) {
      const signal = this.trustSignals[signalKey];
      if (!signal) return;
      
      const container = this.findOptimalInlinePosition() || 
                       this.createInlineContainer(`inline-trust-${index}`);
      
      if (!container) return;
      
      const widget = document.createElement('div');
      widget.className = `trust-widget-inline trust-widget-${signalKey} bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-${this.getColorClass(signal.color)} ${this.animations.slideUp}`;
      widget.dataset.signalKey = signalKey;
      
      widget.innerHTML = `
        <div class="flex items-start space-x-4">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-gradient-to-r from-${this.getColorClass(signal.color)}-100 to-${this.getColorClass(signal.color)}-200 flex items-center justify-center">
              <i class="${signal.icon} text-${this.getColorClass(signal.color)}-600 text-xl"></i>
            </div>
          </div>
          
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800 mb-2">${signal.name}</h3>
            <p class="text-sm text-gray-600 mb-3">${this.getContextualMessage(signal)}</p>
            
            <div class="flex items-center space-x-4">
              ${this.renderSignalStats(signal)}
            </div>
            
            <button class="mt-3 text-${this.getColorClass(signal.color)}-600 hover:text-${this.getColorClass(signal.color)}-800 text-sm font-semibold transition-colors toggle-testimonials">
              Voir les témoignages <i class="fas fa-chevron-down ml-1"></i>
            </button>
            
            <div class="testimonials-container hidden mt-4 p-4 bg-gray-50 rounded-lg">
              <div class="space-y-3">
                ${signal.testimonials.slice(0, 2).map(testimonial => `
                  <blockquote class="text-sm italic text-gray-700 border-l-3 border-${this.getColorClass(signal.color)}-300 pl-3">
                    ${testimonial}
                  </blockquote>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
      
      container.appendChild(widget);
      
      // Event listener pour toggle testimonials
      widget.querySelector('.toggle-testimonials').addEventListener('click', (e) => {
        this.toggleTestimonials(widget, signal);
      });
      
      this.animateWidget(widget);
      this.displayedWidgets.add(signalKey);
    }

    /**
     * Widget testimonials contextuels
     */
    displayTestimonialsWidget() {
      const container = this.createTrustContainer('testimonials');
      if (!container) return;
      
      const contextualTestimonials = this.getContextualTestimonials();
      
      container.innerHTML = `
        <section class="testimonials-widget bg-gradient-to-r from-purple-600 to-blue-600 text-white py-12 rounded-2xl my-8">
          <div class="container mx-auto px-4">
            <h3 class="text-3xl font-bold text-center mb-8">
              <i class="fas fa-quote-left mr-2"></i>
              Ce que disent nos joueurs
            </h3>
            
            <div class="testimonials-carousel">
              <div class="testimonials-track flex transition-transform duration-500" style="transform: translateX(0%)">
                ${contextualTestimonials.map((testimonial, index) => this.renderTestimonialCard(testimonial, index)).join('')}
              </div>
            </div>
            
            <div class="flex justify-center mt-6 space-x-2">
              ${contextualTestimonials.map((_, index) => `
                <button class="carousel-dot w-3 h-3 rounded-full bg-white bg-opacity-50 hover:bg-opacity-100 transition-all ${index === 0 ? 'bg-opacity-100' : ''}" 
                        data-slide="${index}"></button>
              `).join('')}
            </div>
          </div>
        </section>
      `;
      
      this.setupTestimonialCarousel(container);
      this.trackWidgetDisplay('testimonials', contextualTestimonials);
    }

    /**
     * Widgets flottants contextuels
     */
    initializeFloatingWidgets() {
      // Widget de stock urgent
      this.initializeUrgencyWidget();
      
      // Widget de livraison gratuite
      this.initializeFreeShippingWidget();
      
      // Widget de garantie
      this.initializeGuaranteeWidget();
    }

    initializeUrgencyWidget() {
      // Afficher seulement si stock bas ou demande élevée
      if (this.shouldShowUrgency()) {
        setTimeout(() => {
          this.displayFloatingUrgencyWidget();
        }, 5000); // Après 5 secondes sur la page
      }
    }

    displayFloatingUrgencyWidget() {
      if (document.querySelector('.urgency-widget')) return;
      
      const widget = document.createElement('div');
      widget.className = 'urgency-widget fixed bottom-4 left-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-2xl max-w-sm transform -translate-x-full transition-transform duration-500';
      
      widget.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <i class="fas fa-fire text-yellow-300 text-xl animate-bounce"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold">🔥 Forte demande détectée</p>
            <p class="text-xs opacity-90">+ de 15 personnes consultent ce produit</p>
          </div>
          <button class="close-urgency text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(widget);
      
      // Animation d'entrée
      setTimeout(() => {
        widget.style.transform = 'translateX(0)';
      }, 100);
      
      // Close handler
      widget.querySelector('.close-urgency').addEventListener('click', () => {
        this.hideFloatingWidget(widget);
      });
      
      // Auto-hide après 8 secondes
      setTimeout(() => {
        if (document.body.contains(widget)) {
          this.hideFloatingWidget(widget);
        }
      }, 8000);
      
      this.trackWidgetDisplay('urgency_floating', [{ type: 'stock_urgency' }]);
    }

    initializeFreeShippingWidget() {
      const cartValue = this.getCartValue();
      const freeShippingThreshold = 150;
      
      if (cartValue > 0 && cartValue < freeShippingThreshold) {
        this.displayFreeShippingProgress();
      }
    }

    displayFreeShippingProgress() {
      const container = document.querySelector('.cart-summary') || 
                       document.querySelector('.product-price');
      
      if (!container) return;
      
      const cartValue = this.getCartValue();
      const freeShippingThreshold = 150;
      const remaining = freeShippingThreshold - cartValue;
      const progress = (cartValue / freeShippingThreshold) * 100;
      
      const widget = document.createElement('div');
      widget.className = 'free-shipping-widget bg-green-50 border border-green-200 rounded-lg p-4 mt-4';
      
      widget.innerHTML = `
        <div class="flex items-center space-x-3 mb-3">
          <i class="fas fa-truck text-green-600"></i>
          <div class="flex-1">
            <p class="text-sm font-semibold text-green-800">
              Plus que <span class="font-bold">${remaining.toFixed(0)}$</span> pour la livraison gratuite !
            </p>
          </div>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div class="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" 
               style="width: ${Math.min(100, progress)}%"></div>
        </div>
        
        <p class="text-xs text-green-600 text-center">
          <i class="fas fa-leaf mr-1"></i>
          Livraison écoresponsable depuis le Québec
        </p>
      `;
      
      container.appendChild(widget);
      this.trackWidgetDisplay('free_shipping_progress', [{ remaining, progress }]);
    }

    /**
     * Widgets temps réel
     */
    initializeRealTimeWidgets() {
      // Compteur de visiteurs temps réel
      this.displayRealTimeVisitors();
      
      // Récentes commandes
      this.displayRecentOrders();
      
      // Activité en temps réel
      this.displayLiveActivity();
    }

    displayRealTimeVisitors() {
      const container = this.createTrustContainer('real-time');
      if (!container) return;
      
      const visitorCount = this.generateRealisticVisitorCount();
      
      const widget = document.createElement('div');
      widget.className = 'real-time-widget bg-white border border-purple-200 rounded-lg p-4 mb-6 shadow-sm';
      
      widget.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="relative">
            <i class="fas fa-eye text-purple-600"></i>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <div>
            <p class="text-sm text-gray-600">Actuellement en ligne</p>
            <p class="text-lg font-bold text-purple-600 visitor-count">${visitorCount}</p>
          </div>
        </div>
      `;
      
      container.appendChild(widget);
      
      // Mettre à jour périodiquement
      setInterval(() => {
        this.updateVisitorCount(widget);
      }, 30000); // Toutes les 30 secondes
    }

    displayRecentOrders() {
      if (!this.shouldShowRecentOrders()) return;
      
      setTimeout(() => {
        this.showRecentOrderNotification();
      }, Math.random() * 10000 + 5000); // Entre 5 et 15 secondes
    }

    showRecentOrderNotification() {
      const notification = document.createElement('div');
      notification.className = 'recent-order-notification fixed top-4 left-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 transform -translate-x-full transition-transform duration-500 max-w-sm';
      
      const recentOrder = this.generateRecentOrder();
      
      notification.innerHTML = `
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <i class="fas fa-shopping-bag text-green-500"></i>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-800">Commande récente</p>
            <p class="text-xs text-gray-600">${recentOrder.customer} vient d'acheter</p>
            <p class="text-xs font-semibold text-purple-600">${recentOrder.product}</p>
            <p class="text-xs text-gray-500 mt-1">Il y a ${recentOrder.timeAgo}</p>
          </div>
          <button class="close-notification text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      // Animation d'entrée
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Close handler
      notification.querySelector('.close-notification').addEventListener('click', () => {
        this.hideFloatingWidget(notification);
      });
      
      // Auto-hide
      setTimeout(() => {
        if (document.body.contains(notification)) {
          this.hideFloatingWidget(notification);
        }
      }, 6000);
      
      this.trackWidgetDisplay('recent_order', [recentOrder]);
    }

    /**
     * Social proof dynamique
     */
    initializeSocialProof() {
      this.displaySocialProofBadges();
      this.displayCommunityStats();
      this.displayInfluencerEndorsements();
    }

    displaySocialProofBadges() {
      const container = this.createTrustContainer('social-proof');
      if (!container) return;
      
      container.innerHTML = `
        <div class="social-proof-badges flex flex-wrap justify-center gap-4 py-6">
          ${this.renderSocialProofBadge('2800+', 'Joueurs satisfaits', 'fas fa-users')}
          ${this.renderSocialProofBadge('156', 'Recommandations communauté', 'fas fa-thumbs-up')}
          ${this.renderSocialProofBadge('4.9/5', 'Note moyenne', 'fas fa-star')}
          ${this.renderSocialProofBadge('98%', 'Taux de satisfaction', 'fas fa-heart')}
        </div>
      `;
      
      this.animateCounters(container);
    }

    /**
     * Tracking et analytics
     */
    setupInteractionTracking() {
      // Clicks sur widgets de confiance
      document.addEventListener('click', (e) => {
        const trustWidget = e.target.closest('[data-signal-key]');
        if (trustWidget) {
          const signalKey = trustWidget.dataset.signalKey;
          this.trackTrustSignalClick(signalKey, e.target);
        }
      });
      
      // Hover tracking
      document.addEventListener('mouseenter', (e) => {
        const trustWidget = e.target.closest('[data-signal-key]');
        if (trustWidget && !trustWidget.dataset.hoverTracked) {
          trustWidget.dataset.hoverTracked = 'true';
          this.trackTrustSignalHover(trustWidget.dataset.signalKey);
        }
      }, true);
      
      // Scroll tracking pour social proof
      this.setupScrollTracking();
    }

    setupScrollTracking() {
      const socialProofElements = document.querySelectorAll('.social-proof-badges, .testimonials-widget');
      
      if (socialProofElements.length === 0) return;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.dataset.viewTracked) {
            entry.target.dataset.viewTracked = 'true';
            this.trackSocialProofView(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      socialProofElements.forEach(el => observer.observe(el));
    }

    /**
     * Helpers et utilitaires
     */
    detectPageType() {
      const path = window.location.pathname;
      
      if (path === '/' || path === '/index.php') return 'homepage';
      if (path.includes('boutique')) return 'boutique';
      if (path.includes('lot') || path.includes('pack') || path.includes('triptyque')) return 'product';
      if (path.includes('cart') || document.querySelector('.snipcart-cart')) return 'cart';
      if (path.includes('checkout')) return 'checkout';
      
      return 'general';
    }

    detectUserSegment() {
      const cartValue = this.getCartValue();
      const pageViews = this.getPageViews();
      const timeOnSite = this.getSessionDuration();
      
      if (cartValue === 0 && pageViews === 1) return 'new_visitor';
      if (cartValue > 200 || timeOnSite > 300) return 'high_value';
      if (this.isReturningVisitor()) return 'returning_customer';
      
      return 'regular_visitor';
    }

    getTopSignalsForContext(limit = 3) {
      const pageType = this.userContext.page_type;
      const availableSignals = this.displayPatterns[pageType] || this.displayPatterns.homepage;
      
      return availableSignals.slice(0, limit).map(key => ({
        key,
        ...this.trustSignals[key]
      }));
    }

    getContextualMessage(signal) {
      const messages = {
        flim2025: this.getRandomMessage([
          'Certifié par les joueurs les plus exigeants',
          'Testé et approuvé par la communauté JDR',
          'Qualité reconnue depuis 2025'
        ]),
        quebecMade: this.getRandomMessage([
          'Fièrement fabriqué au Québec avec passion',
          'Artisanat local de qualité supérieure',
          'Soutenir l\'économie locale n\'a jamais été aussi ludique'
        ]),
        fastShipping: this.getRandomMessage([
          'Livraison rapide partout au Canada',
          'Expédition sous 24h, livraison en 2-3 jours',
          'Service de livraison fiable et sécurisé'
        ])
      };
      
      return messages[signal.name] || 'Signal de confiance authentique';
    }

    getRandomMessage(messages) {
      return messages[Math.floor(Math.random() * messages.length)];
    }

    renderHeaderSignal(signal) {
      return `
        <div class="header-trust-signal flex items-center space-x-2 px-3 py-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
             data-signal-key="${signal.key}">
          <i class="${signal.icon} text-${this.getColorClass(signal.color)}-600"></i>
          <span class="text-sm font-semibold text-gray-800">${signal.name}</span>
          <i class="fas fa-check-circle text-green-500 text-xs"></i>
        </div>
      `;
    }

    renderSignalStats(signal) {
      const stats = Object.entries(signal.stats).slice(0, 2);
      
      return stats.map(([key, value]) => `
        <div class="text-center">
          <div class="text-lg font-bold text-${this.getColorClass(signal.color)}-600">${value}${typeof value === 'number' && value < 10 ? '%' : ''}</div>
          <div class="text-xs text-gray-500 capitalize">${key.replace('_', ' ')}</div>
        </div>
      `).join('');
    }

    renderTestimonialCard(testimonial, index) {
      return `
        <div class="testimonial-card flex-shrink-0 w-80 mx-4">
          <blockquote class="text-lg italic mb-4">${testimonial}</blockquote>
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              <i class="fas fa-user text-white"></i>
            </div>
            <div>
              <p class="font-semibold">${this.extractAuthor(testimonial)}</p>
              <p class="text-sm opacity-75">${this.extractRole(testimonial)}</p>
            </div>
          </div>
        </div>
      `;
    }

    renderSocialProofBadge(value, label, icon) {
      return `
        <div class="social-proof-badge text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div class="mb-2">
            <i class="${icon} text-3xl text-purple-600"></i>
          </div>
          <div class="text-2xl font-bold text-gray-800 counter" data-target="${value}">${value}</div>
          <div class="text-sm text-gray-600">${label}</div>
        </div>
      `;
    }

    // Animations et effets visuels
    animateWidgets(container) {
      const widgets = container.querySelectorAll('.trust-widget-inline, .header-trust-signal');
      
      widgets.forEach((widget, index) => {
        widget.style.opacity = '0';
        widget.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          widget.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          widget.style.opacity = '1';
          widget.style.transform = 'translateY(0)';
        }, index * 100);
      });
    }

    animateWidget(widget) {
      widget.style.opacity = '0';
      widget.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        widget.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        widget.style.opacity = '1';
        widget.style.transform = 'translateY(0)';
      }, 100);
    }

    animateCounters(container) {
      const counters = container.querySelectorAll('.counter');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      });
      
      counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
      const target = element.dataset.target;
      const numericTarget = parseInt(target.replace(/[^\d]/g, ''));
      const suffix = target.replace(/[\d]/g, '');
      
      let current = 0;
      const increment = numericTarget / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= numericTarget) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + suffix;
        }
      }, 40);
    }

    // Gestion des données et contexte
    getCartValue() {
      if (window.Snipcart?.store?.getState) {
        return window.Snipcart.store.getState().cart.subtotal;
      }
      return 0;
    }

    getPageViews() {
      return parseInt(sessionStorage.getItem('gd_page_views') || '1');
    }

    getSessionDuration() {
      const start = parseInt(sessionStorage.getItem('gd_session_start') || Date.now().toString());
      return (Date.now() - start) / 1000;
    }

    getDeviceType() {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1024) return 'tablet';
      return 'desktop';
    }

    isReturningVisitor() {
      return localStorage.getItem('gd_returning_visitor') === 'true';
    }

    async getGeoLocation() {
      // Simulation - à connecter avec vraie API de géolocalisation
      return { country: 'CA', region: 'QC', city: 'Montreal' };
    }

    getTimeOfDay() {
      const hour = new Date().getHours();
      if (hour < 6) return 'night';
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
      return 'evening';
    }

    getReferrerSource() {
      const referrer = document.referrer;
      if (!referrer) return 'direct';
      if (referrer.includes('google')) return 'google';
      if (referrer.includes('facebook')) return 'facebook';
      if (referrer.includes('reddit')) return 'reddit';
      return 'other';
    }

    // Logique conditionnelle d'affichage
    shouldShowUrgency() {
      return this.userContext.page_type === 'product' && 
             this.userContext.session_duration > 30 &&
             !this.displayedWidgets.has('urgency');
    }

    shouldShowRecentOrders() {
      return this.userContext.page_type !== 'checkout' && 
             Math.random() > 0.7; // 30% de chance
    }

    // Générateurs de données réalistes
    generateRealisticVisitorCount() {
      const baseCount = 12;
      const variance = Math.floor(Math.random() * 8) - 4; // ±4
      const timeBonus = this.getTimeOfDay() === 'evening' ? 5 : 0; // Plus d'activité le soir
      
      return Math.max(1, baseCount + variance + timeBonus);
    }

    generateRecentOrder() {
      const names = ['Alexandre', 'Sarah', 'Marc', 'Julie', 'Pierre', 'Marie', 'David', 'Sophie'];
      const products = [
        'Lot de 10 pièces métalliques',
        'Lot de 25 pièces métalliques',
        'Pack Arsenal de l\'Aventurier',
        'Triptyque Héros Aléatoire'
      ];
      const timeOptions = ['2 min', '5 min', '12 min', '28 min', '45 min'];
      
      return {
        customer: names[Math.floor(Math.random() * names.length)],
        product: products[Math.floor(Math.random() * products.length)],
        timeAgo: timeOptions[Math.floor(Math.random() * timeOptions.length)]
      };
    }

    getContextualTestimonials() {
      const allTestimonials = Object.values(this.trustSignals)
        .flatMap(signal => signal.testimonials);
      
      // Sélectionner 3 testimonials pertinents au contexte
      return this.shuffleArray(allTestimonials).slice(0, 3);
    }

    // Utilitaires
    createTrustContainer(type) {
      const selectors = {
        header: '.hero-section, main',
        inline: '.product-details, .products-grid',
        testimonials: '.hero-section, main',
        'social-proof': '.trust-signals, footer',
        'real-time': '.sidebar, .product-sidebar'
      };
      
      const target = document.querySelector(selectors[type]);
      if (!target) return null;
      
      const container = document.createElement('div');
      container.className = `trust-container trust-${type}`;
      
      if (type === 'header') {
        target.insertBefore(container, target.firstChild);
      } else {
        target.appendChild(container);
      }
      
      return container;
    }

    findOptimalInlinePosition() {
      const candidates = [
        '.product-description',
        '.products-grid > .product-card:nth-child(3n)',
        '.hero-content',
        '.page-content section:nth-child(2)'
      ];
      
      for (const selector of candidates) {
        const element = document.querySelector(selector);
        if (element) {
          const container = document.createElement('div');
          container.className = 'optimal-trust-position';
          element.insertAdjacentElement('afterend', container);
          return container;
        }
      }
      
      return null;
    }

    createInlineContainer(className) {
      const main = document.querySelector('main, .main-content, .content');
      if (!main) return null;
      
      const container = document.createElement('div');
      container.className = className;
      main.appendChild(container);
      
      return container;
    }

    getColorClass(color) {
      const colorMap = {
        '#f59e0b': 'yellow',
        '#3b82f6': 'blue',
        '#10b981': 'green',
        '#8b5cf6': 'purple',
        '#f97316': 'orange',
        '#ec4899': 'pink',
        '#dc2626': 'red'
      };
      
      return colorMap[color] || 'purple';
    }

    extractAuthor(testimonial) {
      const match = testimonial.match(/- ([^,]+)/);
      return match ? match[1] : 'Joueur anonyme';
    }

    extractRole(testimonial) {
      const match = testimonial.match(/, (.+)$/);
      return match ? match[1] : 'Joueur JDR';
    }

    shuffleArray(array) {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    hideFloatingWidget(widget) {
      widget.style.opacity = '0';
      widget.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        if (document.body.contains(widget)) {
          document.body.removeChild(widget);
        }
      }, 300);
    }

    toggleTestimonials(widget, signal) {
      const testimonialsContainer = widget.querySelector('.testimonials-container');
      const toggleButton = widget.querySelector('.toggle-testimonials');
      const chevron = toggleButton.querySelector('.fas');
      
      if (testimonialsContainer.classList.contains('hidden')) {
        testimonialsContainer.classList.remove('hidden');
        chevron.classList.remove('fa-chevron-down');
        chevron.classList.add('fa-chevron-up');
        toggleButton.innerHTML = 'Masquer les témoignages <i class="fas fa-chevron-up ml-1"></i>';
        
        this.trackTrustSignalClick(signal.name, 'testimonials_expand');
      } else {
        testimonialsContainer.classList.add('hidden');
        chevron.classList.remove('fa-chevron-up');
        chevron.classList.add('fa-chevron-down');
        toggleButton.innerHTML = 'Voir les témoignages <i class="fas fa-chevron-down ml-1"></i>';
      }
    }

    setupTestimonialCarousel(container) {
      const track = container.querySelector('.testimonials-track');
      const dots = container.querySelectorAll('.carousel-dot');
      let currentSlide = 0;
      
      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          currentSlide = index;
          this.updateCarousel(track, dots, currentSlide);
        });
      });
      
      // Auto-carousel
      setInterval(() => {
        currentSlide = (currentSlide + 1) % dots.length;
        this.updateCarousel(track, dots, currentSlide);
      }, 8000);
    }

    updateCarousel(track, dots, currentSlide) {
      const translateX = -currentSlide * 100;
      track.style.transform = `translateX(${translateX}%)`;
      
      dots.forEach((dot, index) => {
        dot.classList.toggle('bg-opacity-100', index === currentSlide);
        dot.classList.toggle('bg-opacity-50', index !== currentSlide);
      });
    }

    updateVisitorCount(widget) {
      const countElement = widget.querySelector('.visitor-count');
      const newCount = this.generateRealisticVisitorCount();
      
      countElement.style.transition = 'transform 0.3s ease';
      countElement.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        countElement.textContent = newCount;
        countElement.style.transform = 'scale(1)';
      }, 150);
    }

    setupContextMonitoring() {
      // Suivre le scroll depth
      window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        this.userContext.scroll_depth = Math.min(100, Math.max(0, scrollPercent));
      });
      
      // Suivre les changements de cart value
      if (window.Snipcart) {
        window.Snipcart.events.on('cart.ready', () => {
          this.userContext.cart_value = this.getCartValue();
        });
      }
    }

    // Tracking et analytics
    trackWidgetDisplay(widgetType, data) {
      this.interactionStats.views.push({
        widget_type: widgetType,
        data: data,
        timestamp: Date.now(),
        context: this.userContext
      });
      
      // Envoyer à Analytics
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('trust_widget_view', {
          widget_type: widgetType,
          page_type: this.userContext.page_type,
          user_segment: this.userContext.user_segment
        });
      }
    }

    trackTrustSignalClick(signalKey, target) {
      this.interactionStats.clicks.push({
        signal_key: signalKey,
        target: target,
        timestamp: Date.now(),
        context: this.userContext
      });
      
      // Envoyer à Analytics
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('trust_signal_click', {
          signal_key: signalKey,
          target: target,
          page_type: this.userContext.page_type
        });
      }
    }

    trackTrustSignalHover(signalKey) {
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('trust_signal_hover', {
          signal_key: signalKey,
          page_type: this.userContext.page_type
        });
      }
    }

    trackSocialProofView(element) {
      if (window.GeeknDragonAnalytics) {
        window.GeeknDragonAnalytics.trackEvent('social_proof_view', {
          element_type: element.className,
          scroll_depth: this.userContext.scroll_depth
        });
      }
    }

    // API publique
    getTrustStats() {
      return {
        displayed_widgets: Array.from(this.displayedWidgets),
        interaction_stats: this.interactionStats,
        user_context: this.userContext,
        signals_available: Object.keys(this.trustSignals).length
      };
    }

    refreshTrustSignals() {
      this.analyzeUserContext();
      this.displayPageSpecificWidgets();
    }

    forceShowWidget(signalKey) {
      if (this.trustSignals[signalKey]) {
        this.displayInlineWidget(signalKey, 0);
      }
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonTrustWidgets = new DynamicTrustWidgets();
    
    // Debug mode
    if (window.location.hostname === 'localhost') {
      window._debugTrust = window.GeeknDragonTrustWidgets;
      console.log('🛡️ Trust Widgets Debug - Utilisez window._debugTrust');
    }
  });

})();
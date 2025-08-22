/**
 * 🛒 INTÉGRATION SNIPCART AMÉLIORÉE - GEEKNDRAGON
 * Gestion avancée des variations de produits et expérience utilisateur optimisée
 */

(function() {
  'use strict';

  class EnhancedSnipcartIntegration {
    constructor() {
      this.productConfigurations = new Map();
      this.cartAnalytics = {
        addToCartCount: 0,
        variationSelections: {},
        abandonedCarts: 0,
        checkoutInitiations: 0
      };
      
      this.config = {
        currency: 'CAD',
        locale: 'fr-CA',
        enableAnalytics: true,
        enableAbandonmentTracking: true,
        customizationPreview: true,
        smartDefaults: true
      };

      this.productVariations = {
        'lot10': {
          type: 'multiplier_selection',
          basePrice: 60.00,
          variations: [
            { id: 'x1', label: 'x1 (Unitaire - Brillant)', priceModifier: 0, default: true },
            { id: 'x10', label: 'x10 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x100', label: 'x100 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x1000', label: 'x1 000 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x10000', label: 'x10 000 (Gravé - Fini mat)', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'multiplicateur',
              type: 'dropdown',
              required: true,
              defaultValue: 'x1'
            }
          ]
        },
        
        'lot25': {
          type: 'fixed_bundle',
          basePrice: 145.00,
          description: 'Collection complète - 25 pièces uniques incluses',
          variations: []
        },
        
        'lot50_marchand': {
          type: 'multiplier_selection',
          basePrice: 275.00,
          variations: [
            { id: 'x1', label: 'x1 (Unitaire - Brillant)', priceModifier: 0 },
            { id: 'x10', label: 'x10 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x100', label: 'x100 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x1000', label: 'x1 000 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x10000', label: 'x10 000 (Gravé - Fini mat)', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'multiplicateur',
              type: 'dropdown',
              required: true,
              defaultValue: 'x1'
            }
          ]
        },

        'lot50_seigneur': {
          type: 'multiplier_selection',
          basePrice: 275.00,
          variations: [
            { id: 'x1', label: 'x1 (Unitaire - Brillant)', priceModifier: 0, default: true },
            { id: 'x10', label: 'x10 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x100', label: 'x100 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x1000', label: 'x1 000 (Gravé - Fini mat)', priceModifier: 0 },
            { id: 'x10000', label: 'x10 000 (Gravé - Fini mat)', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'multiplicateur',
              type: 'dropdown',
              required: true,
              defaultValue: 'x1'
            }
          ]
        },

        'pack_arsenal': {
          type: 'language_selection',
          basePrice: 49.99,
          variations: [
            { id: 'fr', label: 'Français', priceModifier: 0, default: true },
            { id: 'en', label: 'English', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'langue',
              type: 'dropdown',
              required: true,
              defaultValue: 'fr'
            }
          ]
        },

        'pack_butins': {
          type: 'language_selection',
          basePrice: 36.99,
          variations: [
            { id: 'fr', label: 'Français', priceModifier: 0, default: true },
            { id: 'en', label: 'English', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'langue',
              type: 'dropdown',
              required: true,
              defaultValue: 'fr'
            }
          ]
        },

        'pack_routes': {
          type: 'language_selection',
          basePrice: 34.99,
          variations: [
            { id: 'fr', label: 'Français', priceModifier: 0, default: true },
            { id: 'en', label: 'English', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'langue',
              type: 'dropdown',
              required: true,
              defaultValue: 'fr'
            }
          ]
        },

        'triptyque_mystere': {
          type: 'language_selection',
          basePrice: 59.99,
          variations: [
            { id: 'fr', label: 'Français', priceModifier: 0, default: true },
            { id: 'en', label: 'English', priceModifier: 0 }
          ],
          customFields: [
            {
              name: 'langue',
              type: 'dropdown',
              required: true,
              defaultValue: 'fr'
            },
            {
              name: 'note_special',
              type: 'textarea',
              required: false,
              placeholder: 'Demande spéciale pour votre tirage aléatoire (optionnel)'
            }
          ]
        }
      };

      this.init();
    }

    async init() {
      // Attendre que Snipcart soit disponible
      await this.waitForSnipcart();
      
      // Remplacer les boutons d'achat standard
      this.enhanceAddToCartButtons();
      
      // Configurer les événements Snipcart
      this.setupSnipcartEvents();
      
      // Analytics et tracking
      this.setupAnalytics();
      
      // Interface utilisateur améliorée
      this.setupUIEnhancements();
      
      // Validation des formulaires
      this.setupFormValidation();

      console.log('🛒 Enhanced Snipcart Integration initialisé');
    }

    async waitForSnipcart() {
      return new Promise((resolve) => {
        if (window.Snipcart && window.Snipcart.api) {
          resolve();
          return;
        }

        const checkSnipcart = () => {
          if (window.Snipcart && window.Snipcart.api) {
            resolve();
          } else {
            setTimeout(checkSnipcart, 100);
          }
        };

        checkSnipcart();
      });
    }

    enhanceAddToCartButtons() {
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.gd-add-to-cart');
        if (!button) return;

        e.preventDefault();
        e.stopPropagation();

        const productId = button.dataset.productId;
        const quantity = parseInt(button.dataset.quantity || '1', 10);

        this.showProductCustomizer(productId, quantity, button);
      });
    }

    showProductCustomizer(productId, quantity, triggerButton) {
      const config = this.productVariations[productId];
      
      if (!config || config.type === 'fixed_bundle') {
        // Produit sans variations - ajout direct
        this.addToCartDirect(productId, quantity);
        return;
      }

      // Créer le modal de personnalisation
      this.createCustomizerModal(productId, quantity, config, triggerButton);
    }

    createCustomizerModal(productId, quantity, config, triggerButton) {
      // Supprimer les modals existants
      const existingModal = document.querySelector('.gd-product-customizer');
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.className = 'gd-product-customizer';
      modal.innerHTML = this.generateCustomizerHTML(productId, quantity, config);

      document.body.appendChild(modal);
      
      // Animation d'entrée
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });

      // Setup des événements du modal
      this.setupCustomizerEvents(modal, productId, quantity, config, triggerButton);
    }

    generateCustomizerHTML(productId, quantity, config) {
      const productData = this.getProductData(productId);
      
      let variationsHTML = '';
      if (config.variations && config.variations.length > 0) {
        const variationType = config.type;
        
        if (variationType === 'multiplier_selection') {
          variationsHTML = `
            <div class="customizer-section">
              <h4 class="customizer-section-title">
                <span class="icon">⚖️</span>
                Choisissez votre multiplicateur
              </h4>
              <div class="multiplier-grid">
                ${config.variations.map(variation => `
                  <label class="multiplier-option ${variation.default ? 'selected' : ''}">
                    <input type="radio" name="multiplicateur" value="${variation.id}" 
                           ${variation.default ? 'checked' : ''}>
                    <div class="multiplier-card">
                      <div class="multiplier-label">${variation.label}</div>
                      <div class="multiplier-preview">
                        <img src="/images/optimized-modern/webp/${this.getPreviewImage(productId, variation.id)}.webp" 
                             alt="Aperçu ${variation.label}" loading="lazy">
                      </div>
                      <div class="multiplier-description">
                        ${this.getMultiplierDescription(variation.id)}
                      </div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        } else if (variationType === 'language_selection') {
          variationsHTML = `
            <div class="customizer-section">
              <h4 class="customizer-section-title">
                <span class="icon">🌍</span>
                Choisissez votre langue
              </h4>
              <div class="language-options">
                ${config.variations.map(variation => `
                  <label class="language-option ${variation.default ? 'selected' : ''}">
                    <input type="radio" name="langue" value="${variation.id}" 
                           ${variation.default ? 'checked' : ''}>
                    <div class="language-card">
                      <div class="language-flag">
                        ${variation.id === 'fr' ? '🇫🇷' : '🇬🇧'}
                      </div>
                      <div class="language-label">${variation.label}</div>
                    </div>
                  </label>
                `).join('')}
              </div>
            </div>
          `;
        }
      }

      // Champs personnalisés additionnels
      let customFieldsHTML = '';
      if (config.customFields) {
        const additionalFields = config.customFields.filter(field => 
          !['multiplicateur', 'langue'].includes(field.name)
        );

        if (additionalFields.length > 0) {
          customFieldsHTML = `
            <div class="customizer-section">
              <h4 class="customizer-section-title">
                <span class="icon">📝</span>
                Personnalisation additionnelle
              </h4>
              ${additionalFields.map(field => this.generateCustomFieldHTML(field)).join('')}
            </div>
          `;
        }
      }

      return `
        <div class="customizer-backdrop"></div>
        <div class="customizer-content">
          <div class="customizer-header">
            <div class="product-info">
              <img src="${productData.image}" alt="${productData.name}" class="product-thumbnail">
              <div class="product-details">
                <h3 class="product-name">${productData.name}</h3>
                <div class="product-price">${config.basePrice.toFixed(2)} $ CAD</div>
                <div class="quantity-display">Quantité: <strong>${quantity}</strong></div>
              </div>
            </div>
            <button class="customizer-close" aria-label="Fermer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div class="customizer-body">
            ${variationsHTML}
            ${customFieldsHTML}
          </div>
          
          <div class="customizer-footer">
            <div class="total-price">
              Total: <span class="price-amount">${(config.basePrice * quantity).toFixed(2)} $ CAD</span>
            </div>
            <div class="customizer-actions">
              <button class="btn-cancel">Annuler</button>
              <button class="btn-add-to-cart btn-primary">
                <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
                  <circle cx="9" cy="20" r="1"/>
                  <circle cx="20" cy="20" r="1"/>
                </svg>
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      `;
    }

    generateCustomFieldHTML(field) {
      switch (field.type) {
        case 'textarea':
          return `
            <div class="custom-field">
              <label for="field_${field.name}">${field.label || field.name}</label>
              <textarea id="field_${field.name}" name="${field.name}" 
                        placeholder="${field.placeholder || ''}"
                        ${field.required ? 'required' : ''}></textarea>
            </div>
          `;
        
        case 'dropdown':
          // Déjà géré dans les sections principales
          return '';
          
        default:
          return `
            <div class="custom-field">
              <label for="field_${field.name}">${field.label || field.name}</label>
              <input type="text" id="field_${field.name}" name="${field.name}" 
                     placeholder="${field.placeholder || ''}"
                     ${field.required ? 'required' : ''}>
            </div>
          `;
      }
    }

    setupCustomizerEvents(modal, productId, quantity, config, triggerButton) {
      // Fermeture du modal
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('customizer-backdrop') || 
            e.target.closest('.customizer-close') ||
            e.target.classList.contains('btn-cancel')) {
          this.closeCustomizer(modal);
        }
      });

      // Sélection des variations avec preview
      modal.addEventListener('change', (e) => {
        if (e.target.type === 'radio') {
          // Mise à jour visuelle de la sélection
          const container = e.target.closest('.multiplier-grid, .language-options');
          if (container) {
            container.querySelectorAll('.multiplier-option, .language-option').forEach(option => {
              option.classList.remove('selected');
            });
            e.target.closest('.multiplier-option, .language-option').classList.add('selected');
          }

          // Mise à jour du prix si nécessaire
          this.updateCustomizerPrice(modal, config, quantity);
        }
      });

      // Ajout au panier
      modal.querySelector('.btn-add-to-cart').addEventListener('click', () => {
        this.processCustomizedAddToCart(modal, productId, quantity, config);
      });

      // Navigation clavier
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeCustomizer(modal);
        }
      });
    }

    updateCustomizerPrice(modal, config, quantity) {
      const selectedVariations = this.getSelectedVariations(modal);
      let totalPrice = config.basePrice;

      // Appliquer les modificateurs de prix
      Object.entries(selectedVariations).forEach(([key, value]) => {
        const variation = config.variations.find(v => v.id === value);
        if (variation && variation.priceModifier) {
          totalPrice += variation.priceModifier;
        }
      });

      const finalPrice = totalPrice * quantity;
      modal.querySelector('.price-amount').textContent = `${finalPrice.toFixed(2)} $ CAD`;
    }

    getSelectedVariations(modal) {
      const variations = {};
      
      modal.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        variations[radio.name] = radio.value;
      });

      modal.querySelectorAll('input[type="text"], textarea').forEach(input => {
        if (input.value.trim()) {
          variations[input.name] = input.value.trim();
        }
      });

      return variations;
    }

    async processCustomizedAddToCart(modal, productId, quantity, config) {
      const button = modal.querySelector('.btn-add-to-cart');
      const originalText = button.innerHTML;

      // État de chargement
      button.innerHTML = `
        <svg class="loading-spinner" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
          <path d="M12,2 A10,10 0 0,1 22,12" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        Ajout en cours...
      `;
      button.disabled = true;

      try {
        const variations = this.getSelectedVariations(modal);
        const success = await this.addToCartWithVariations(productId, quantity, variations, config);

        if (success) {
          // Animation de succès
          button.innerHTML = `
            <svg class="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            Ajouté !
          `;
          button.classList.add('success');

          setTimeout(() => {
            this.closeCustomizer(modal);
            this.showAddToCartFeedback(productId, quantity);
          }, 1000);
        }
      } catch (error) {
        console.error('Erreur ajout au panier:', error);
        
        button.innerHTML = `
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Erreur - Réessayer
        `;
        button.classList.add('error');

        setTimeout(() => {
          button.innerHTML = originalText;
          button.disabled = false;
          button.classList.remove('error');
        }, 2000);
      }
    }

    async addToCartWithVariations(productId, quantity, variations, config) {
      const productData = this.getProductData(productId);
      
      // Construction des custom fields pour Snipcart
      const customFields = [];
      
      Object.entries(variations).forEach(([key, value]) => {
        if (value) {
          customFields.push({
            name: key,
            value: value
          });
        }
      });

      // Prix calculé avec variations
      let finalPrice = config.basePrice;
      Object.entries(variations).forEach(([key, value]) => {
        const variation = config.variations.find(v => v.id === value);
        if (variation && variation.priceModifier) {
          finalPrice += variation.priceModifier;
        }
      });

      // Générer un ID unique pour cette configuration
      const configHash = this.generateConfigurationHash(productId, variations);
      const snipcartProductId = `${productId}_${configHash}`;

      // Nom du produit avec variations
      let productName = productData.name;
      if (variations.multiplicateur && variations.multiplicateur !== 'x1') {
        productName += ` (${variations.multiplicateur})`;
      }
      if (variations.langue && variations.langue !== 'fr') {
        productName += ` - English`;
      }

      try {
        window.Snipcart.api.cart.items.add({
          id: snipcartProductId,
          name: productName,
          price: finalPrice,
          quantity: quantity,
          url: window.location.pathname,
          description: productData.description || '',
          image: productData.image,
          customFields: customFields.length > 0 ? customFields : undefined,
          categories: ['geek-dragon', productData.category || 'pieces'],
          metadata: {
            originalProductId: productId,
            variations: JSON.stringify(variations),
            configurationHash: configHash
          }
        });

        // Analytics
        this.trackAddToCart(productId, variations, finalPrice, quantity);

        return true;
      } catch (error) {
        console.error('Erreur Snipcart:', error);
        return false;
      }
    }

    addToCartDirect(productId, quantity) {
      const productData = this.getProductData(productId);
      const config = this.productVariations[productId] || { basePrice: productData.price };

      window.Snipcart.api.cart.items.add({
        id: productId,
        name: productData.name,
        price: config.basePrice,
        quantity: quantity,
        url: window.location.pathname,
        description: productData.description || '',
        image: productData.image,
        categories: ['geek-dragon', productData.category || 'pieces']
      });

      this.trackAddToCart(productId, {}, config.basePrice, quantity);
      this.showAddToCartFeedback(productId, quantity);
    }

    closeCustomizer(modal) {
      modal.classList.add('closing');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }

    showAddToCartFeedback(productId, quantity) {
      const productData = this.getProductData(productId);
      
      // Créer notification de succès
      const notification = document.createElement('div');
      notification.className = 'add-to-cart-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <div class="notification-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <div class="notification-text">
            <div class="notification-title">Produit ajouté !</div>
            <div class="notification-details">${quantity}x ${productData.name}</div>
          </div>
          <button class="notification-close" aria-label="Fermer">×</button>
        </div>
      `;

      document.body.appendChild(notification);

      // Animation d'apparition
      requestAnimationFrame(() => {
        notification.classList.add('show');
      });

      // Fermeture automatique et manuelle
      const closeNotification = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      };

      notification.querySelector('.notification-close').addEventListener('click', closeNotification);
      setTimeout(closeNotification, 4000);
    }

    setupSnipcartEvents() {
      document.addEventListener('snipcart.ready', () => {
        console.log('🛒 Snipcart ready - Configuration avancée active');

        // Personnalisation des textes
        window.Snipcart.api.session.setLanguage(this.config.locale);

        // Événements du panier
        window.Snipcart.events.on('cart.opened', () => {
          this.onCartOpened();
        });

        window.Snipcart.events.on('cart.closed', () => {
          this.onCartClosed();
        });

        window.Snipcart.events.on('item.added', (cartItem) => {
          this.onItemAdded(cartItem);
        });

        window.Snipcart.events.on('item.removed', (cartItem) => {
          this.onItemRemoved(cartItem);
        });

        window.Snipcart.events.on('checkout.step.completed', (step) => {
          this.onCheckoutStepCompleted(step);
        });
      });
    }

    setupAnalytics() {
      if (!this.config.enableAnalytics) return;

      // Integration avec Google Analytics si disponible
      if (typeof gtag !== 'undefined') {
        this.gtag = gtag;
      }

      // Tracking des abandons de panier
      if (this.config.enableAbandonmentTracking) {
        this.setupAbandonmentTracking();
      }
    }

    setupUIEnhancements() {
      // Animations CSS personnalisées
      this.injectCustomStyles();

      // Amélioration des contrôles de quantité
      this.enhanceQuantityControls();

      // Preview des produits au hover
      this.setupProductPreviews();
    }

    setupFormValidation() {
      // Validation en temps réel des champs personnalisés
      document.addEventListener('input', (e) => {
        if (e.target.closest('.gd-product-customizer')) {
          this.validateCustomField(e.target);
        }
      });
    }

    // Utilitaires
    getProductData(productId) {
      // Récupérer depuis le DOM ou données statiques
      const productCard = document.querySelector(`[data-product-id="${productId}"]`)?.closest('.product-card');
      
      if (productCard) {
        const img = productCard.querySelector('.product-media');
        return {
          name: productCard.querySelector('.product-title')?.textContent?.trim() || productId,
          price: parseFloat(productCard.querySelector('.product-price')?.textContent?.replace(/[^\d.]/g, '') || '0'),
          image: img?.src || img?.dataset?.src || '/images/placeholder.webp',
          description: productCard.querySelector('.product-description')?.textContent?.trim() || '',
          category: 'pieces'
        };
      }

      // Fallback
      return {
        name: productId,
        price: this.productVariations[productId]?.basePrice || 0,
        image: '/images/placeholder.webp',
        description: '',
        category: 'pieces'
      };
    }

    getPreviewImage(productId, variationId) {
      const imageMap = {
        'lot10': {
          'x1': 'Vagabon',
          'x10': 'Vagabonx10',
          'x100': 'coin-copper-100',
          'x1000': 'coin-copper-1000',
          'x10000': 'coin-copper-10000'
        },
        'lot25': {
          'x1': 'all252',
          'x10': 'all25x10',
          'x100': 'all25x100',
          'x1000': 'all25x1000', 
          'x10000': 'all25x10000'
        }
      };

      return imageMap[productId]?.[variationId] || 'coin-copper-10';
    }

    getMultiplierDescription(variationId) {
      const descriptions = {
        'x1': 'Finition brillante, sans gravure - aspect neuf',
        'x10': 'Gravure nette, finition mate - facilite les calculs x10',
        'x100': 'Gravure nette, finition mate - facilite les calculs x100',
        'x1000': 'Gravure nette, finition mate - facilite les calculs x1000',
        'x10000': 'Gravure nette, finition mate - facilite les calculs x10000'
      };

      return descriptions[variationId] || '';
    }

    generateConfigurationHash(productId, variations) {
      const configString = productId + JSON.stringify(variations);
      return btoa(configString).replace(/[^a-zA-Z0-9]/g, '').substr(0, 8);
    }

    trackAddToCart(productId, variations, price, quantity) {
      this.cartAnalytics.addToCartCount++;
      
      // Stocker les sélections de variations pour analyse
      Object.entries(variations).forEach(([key, value]) => {
        if (!this.cartAnalytics.variationSelections[key]) {
          this.cartAnalytics.variationSelections[key] = {};
        }
        this.cartAnalytics.variationSelections[key][value] = 
          (this.cartAnalytics.variationSelections[key][value] || 0) + 1;
      });

      // Google Analytics
      if (this.gtag) {
        this.gtag('event', 'add_to_cart', {
          currency: 'CAD',
          value: price * quantity,
          items: [{
            item_id: productId,
            item_name: this.getProductData(productId).name,
            category: 'JDR_Accessories',
            quantity: quantity,
            price: price
          }]
        });
      }
    }

    onCartOpened() {
      console.log('🛒 Panier ouvert');
      
      if (this.gtag) {
        this.gtag('event', 'view_cart', {
          currency: 'CAD',
          value: window.Snipcart.api.cart.get().subtotal
        });
      }
    }

    onCartClosed() {
      console.log('🛒 Panier fermé');
    }

    onItemAdded(cartItem) {
      console.log('🛒 Article ajouté:', cartItem);
    }

    onItemRemoved(cartItem) {
      console.log('🛒 Article supprimé:', cartItem);
    }

    onCheckoutStepCompleted(step) {
      console.log('🛒 Étape checkout complétée:', step);
      this.cartAnalytics.checkoutInitiations++;
    }

    setupAbandonmentTracking() {
      let cartOpenTime = null;
      
      window.Snipcart.events.on('cart.opened', () => {
        cartOpenTime = Date.now();
      });

      window.Snipcart.events.on('cart.closed', () => {
        if (cartOpenTime && Date.now() - cartOpenTime > 10000) { // 10 secondes minimum
          const items = window.Snipcart.api.cart.get().items;
          if (items.length > 0) {
            this.cartAnalytics.abandonedCarts++;
            console.log('🛒 Abandon panier détecté');
          }
        }
      });
    }

    injectCustomStyles() {
      const styles = `
        <style>
        /* Customizer Modal Styles */
        .gd-product-customizer {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .gd-product-customizer.active {
          opacity: 1;
          visibility: visible;
        }

        .gd-product-customizer.closing {
          opacity: 0;
          visibility: hidden;
        }

        .customizer-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(5px);
        }

        .customizer-content {
          background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          max-width: 600px;
          max-height: 90vh;
          width: 90%;
          position: relative;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          color: white;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }

        .gd-product-customizer.active .customizer-content {
          transform: scale(1);
        }

        .customizer-header {
          padding: 2rem;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .product-thumbnail {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
        }

        .product-price {
          color: #8b5cf6;
          font-size: 1.1rem;
          font-weight: 500;
        }

        .quantity-display {
          color: #94a3b8;
          font-size: 0.9rem;
        }

        .customizer-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .customizer-close:hover {
          background: rgba(139, 92, 246, 0.1);
          color: #8b5cf6;
        }

        .customizer-close svg {
          width: 24px;
          height: 24px;
        }

        .customizer-body {
          padding: 2rem;
          max-height: 60vh;
          overflow-y: auto;
        }

        .customizer-section {
          margin-bottom: 2rem;
        }

        .customizer-section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #f1f5f9;
        }

        .customizer-section-title .icon {
          font-size: 1.2rem;
        }

        .multiplier-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .multiplier-option {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .multiplier-card {
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 1rem;
          background: rgba(139, 92, 246, 0.05);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .multiplier-option:hover .multiplier-card,
        .multiplier-option.selected .multiplier-card {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          transform: translateY(-1px);
        }

        .multiplier-option input[type="radio"] {
          display: none;
        }

        .multiplier-label {
          font-weight: 500;
          min-width: 200px;
        }

        .multiplier-preview img {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .multiplier-description {
          color: #94a3b8;
          font-size: 0.85rem;
          flex: 1;
        }

        .language-options {
          display: flex;
          gap: 1rem;
        }

        .language-option {
          flex: 1;
          cursor: pointer;
        }

        .language-card {
          border: 2px solid rgba(139, 92, 246, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          background: rgba(139, 92, 246, 0.05);
          transition: all 0.2s ease;
        }

        .language-option:hover .language-card,
        .language-option.selected .language-card {
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.1);
          transform: translateY(-2px);
        }

        .language-option input[type="radio"] {
          display: none;
        }

        .language-flag {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .language-label {
          font-weight: 500;
        }

        .custom-field {
          margin-bottom: 1rem;
        }

        .custom-field label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #f1f5f9;
        }

        .custom-field input,
        .custom-field textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
          color: white;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .custom-field input:focus,
        .custom-field textarea:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .custom-field textarea {
          resize: vertical;
          min-height: 80px;
        }

        .customizer-footer {
          padding: 2rem;
          border-top: 1px solid rgba(139, 92, 246, 0.2);
          background: rgba(139, 92, 246, 0.05);
        }

        .total-price {
          text-align: center;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .price-amount {
          color: #8b5cf6;
        }

        .customizer-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .customizer-actions button {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }

        .btn-cancel {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .btn-cancel:hover {
          background: rgba(148, 163, 184, 0.2);
          color: white;
        }

        .btn-add-to-cart {
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          color: white;
        }

        .btn-add-to-cart:hover:not(:disabled) {
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          transform: translateY(-1px);
        }

        .btn-add-to-cart:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-add-to-cart.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .btn-add-to-cart.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        .btn-add-to-cart svg {
          width: 18px;
          height: 18px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Notification Styles */
        .add-to-cart-notification {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 9999;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          transform: translateX(100%);
          transition: transform 0.3s ease;
          max-width: 350px;
        }

        .add-to-cart-notification.show {
          transform: translateX(0);
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
        }

        .notification-icon svg {
          width: 24px;
          height: 24px;
        }

        .notification-title {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .notification-details {
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .notification-close {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.5rem;
          margin-left: auto;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .notification-close:hover {
          opacity: 1;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .customizer-content {
            width: 95%;
            max-height: 95vh;
          }

          .customizer-header,
          .customizer-body,
          .customizer-footer {
            padding: 1.5rem;
          }

          .product-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .language-options {
            flex-direction: column;
          }

          .multiplier-card {
            flex-direction: column;
            text-align: center;
          }

          .multiplier-label {
            min-width: auto;
          }

          .customizer-actions {
            flex-direction: column;
          }

          .add-to-cart-notification {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            max-width: none;
          }
        }
        </style>
      `;

      document.head.insertAdjacentHTML('beforeend', styles);
    }

    enhanceQuantityControls() {
      // Déjà implémenté dans le code existant
    }

    setupProductPreviews() {
      // Preview au hover des cartes produits
      document.addEventListener('mouseenter', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
          const video = productCard.querySelector('video[data-src]');
          if (video && !video.src) {
            video.src = video.dataset.src;
            video.play();
          }
        }
      }, true);
    }

    validateCustomField(field) {
      // Validation en temps réel
      const isValid = field.checkValidity();
      
      if (isValid) {
        field.style.borderColor = 'rgba(139, 92, 246, 0.3)';
      } else {
        field.style.borderColor = '#ef4444';
      }

      return isValid;
    }

    // API publique
    getAnalytics() {
      return this.cartAnalytics;
    }

    getConfiguration(productId) {
      return this.productVariations[productId];
    }

    updateConfiguration(productId, config) {
      this.productVariations[productId] = { ...this.productVariations[productId], ...config };
    }
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    window.GeeknDragonSnipcart = new EnhancedSnipcartIntegration();
    
    // Mode debug
    if (window.location.hostname === 'localhost') {
      window._debugSnipcart = window.GeeknDragonSnipcart;
      console.log('🛒 Snipcart Debug - Utilisez window._debugSnipcart');
    }
  });

})();
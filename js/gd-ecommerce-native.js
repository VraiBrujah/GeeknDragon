// ========================================================================
// GEEK & DRAGON - E-COMMERCE NATIF MODERNE
// Système Web-first, léger et performant
// Architecture en îlots avec hydratation partielle
// ========================================================================

/* eslint-disable no-use-before-define, no-param-reassign */
(function gdEcommerceNative() {
  // Configuration globale
  const CONFIG = {
    storageKey: 'gd_cart_v2',
    maxItems: 99,
    debounceDelay: 300,
    animationDuration: 200,
    currency: 'CAD',
    currencySymbol: '$',
    autoSave: true,
    analytics: false, // Respect RGPD
    debug: true, // Mode debug (production: false)
  };

  // Système de logging structuré
  const logger = {
    info: (message, data = null) => {
      if (CONFIG.debug) {
        // eslint-disable-next-line no-console
        console.log(`[GD-Cart] ${message}`, data || '');
      }
    },
    warn: (message, data = null) => {
      if (CONFIG.debug) {
        // eslint-disable-next-line no-console
        console.warn(`[GD-Cart] ${message}`, data || '');
      }
    },
    error: (message, error = null) => {
      // Toujours afficher les erreurs
      // eslint-disable-next-line no-console
      console.error(`[GD-Cart] ${message}`, error || '');
    },
  };

  // État global du système
  const state = {
    cart: {
      items: [],
      total: 0,
      count: 0,
      currency: CONFIG.currency,
    },
    ui: {
      accountModalOpen: false,
      cartModalOpen: false,
      currentAccountTab: 'profile',
    },
    initialized: false,
  };

  // Cache DOM pour les performances
  const elements = {
    accountToggle: null,
    cartToggle: null,
    accountToggleMobile: null,
    cartToggleMobile: null,
    cartBadge: null,
    cartBadgeMobile: null,
    accountModal: null,
    cartModal: null,
    body: document.body,
  };

  let eventsAttached = false;

  // ========================================================================
  // UTILITAIRES
  // ========================================================================

  /**
   * Utilitaire de debounce pour optimiser les performances
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Échappe les caractères HTML pour éviter XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Formate le prix selon la locale
   */
  function formatPrice(price, currency = CONFIG.currency) {
    return new Intl.NumberFormat('fr-CA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(price);
  }

  /**
   * Notifie les lecteurs d'écran
   */
  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    elements.body.appendChild(announcement);

    setTimeout(() => {
      elements.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Normalise et trie les variantes pour comparaison fiable
   */
  function normalizeVariants(variants = {}) {
    return Object.keys(variants)
      .sort()
      .reduce((acc, key) => {
        acc[key] = String(variants[key]).trim();
        return acc;
      }, {});
  }

  /**
   * Compare deux objets de variantes en ignorant l'ordre des clés
   */
  function variantsEqual(a = {}, b = {}) {
    const va = normalizeVariants(a);
    const vb = normalizeVariants(b);
    const keysA = Object.keys(va);
    const keysB = Object.keys(vb);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => va[k] === vb[k]);
  }

  /**
   * Fusionne les articles identiques (même id + variantes)
   */
  function mergeCartItems() {
    const merged = [];
    state.cart.items.forEach((item) => {
      const normVars = normalizeVariants(item.variants);
      const existingIndex = merged.findIndex(
        (i) => i.id === item.id && variantsEqual(i.variants, normVars),
      );
      if (existingIndex !== -1) {
        merged[existingIndex].quantity += item.quantity;
      } else {
        merged.push({ ...item, variants: normVars });
      }
    });
    state.cart.items = merged;
  }

  // ========================================================================
  // GESTION DU STOCKAGE LOCAL
  // ========================================================================

  /**
   * Charge le panier depuis le localStorage
   */
  function loadCart() {
    try {
      const savedCart = localStorage.getItem(CONFIG.storageKey);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        // Validation de la structure
        if (parsedCart && Array.isArray(parsedCart.items)) {
          state.cart = {
            ...state.cart,
            ...parsedCart,
          };
          calculateCartTotals();
          return true;
        }
      }
    } catch (error) {
      logger.warn('Erreur lors du chargement du panier:', error);
    }
    return false;
  }

  /**
   * Sauvegarde le panier dans le localStorage
   */
  const saveCart = debounce(() => {
    if (!CONFIG.autoSave) return;

    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.cart));
    } catch (error) {
      logger.warn('Erreur lors de la sauvegarde du panier:', error);
    }
  }, CONFIG.debounceDelay);

  // ========================================================================
  // GESTION DU PANIER
  // ========================================================================

  /**
   * Calcule les totaux du panier
  */
  function calculateCartTotals() {
    mergeCartItems();
    state.cart.count = state.cart.items.reduce((total, item) => total + item.quantity, 0);
    state.cart.total = state.cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0,
    );
  }

  /**
   * Ajoute un article au panier
   */
  function addToCart(productData) {
    // Validation des données
    if (!productData.id || !productData.name || !productData.price) {
      logger.warn('Données produit invalides:', productData);
      return false;
    }

    logger.info('🛒 Ajout au panier:', productData);
    logger.info('🏷️ Variantes détectées:', productData.variants);

    const normalizedVariants = normalizeVariants(productData.variants || {});
    const existingItemIndex = state.cart.items.findIndex(
      (item) => item.id === productData.id && variantsEqual(item.variants, normalizedVariants),
    );

    if (existingItemIndex !== -1) {
      // Article existant - mettre à jour la quantité
      state.cart.items[existingItemIndex].quantity += (productData.quantity || 1);
      logger.info('📈 Quantité mise à jour pour article existant');
    } else {
      // Nouvel article
      const newItem = {
        id: productData.id,
        name: escapeHtml(productData.name),
        price: parseFloat(productData.price),
        quantity: productData.quantity || 1,
        image: productData.image || '',
        url: productData.url || '',
        variants: normalizedVariants,
        addedAt: Date.now(),
      };

      state.cart.items.push(newItem);
      logger.info('✨ Nouvel article ajouté:', newItem);
    }

    calculateCartTotals();
    saveCart();
    updateCartDisplay();

    // Feedback utilisateur
    announceToScreenReader(`${productData.name} ajouté au panier`);
    animateCartButton();

    logger.info('🎯 État du panier après ajout:', state.cart);
    return true;
  }

  /**
   * Met à jour la quantité d'un article
   */
  function updateItemQuantity(itemId, variants, newQuantity) {
    const normVariants = normalizeVariants(variants);
    const itemIndex = state.cart.items.findIndex(
      (item) => item.id === itemId && variantsEqual(item.variants, normVariants),
    );

    if (itemIndex === -1) return false;

    if (newQuantity <= 0) {
      removeFromCart(itemId, normVariants);
    } else if (newQuantity <= CONFIG.maxItems) {
      state.cart.items[itemIndex].quantity = newQuantity;
      calculateCartTotals();
      saveCart();
      updateCartDisplay();
      updateCartModal().catch(logger.error);
    }

    return true;
  }

  /**
   * Supprime un article du panier
   */
  function removeFromCart(itemId, variants = {}) {
    const normVariants = normalizeVariants(variants);
    const itemIndex = state.cart.items.findIndex(
      (item) => item.id === itemId && variantsEqual(item.variants, normVariants),
    );

    if (itemIndex !== -1) {
      const removedItem = state.cart.items.splice(itemIndex, 1)[0];
      calculateCartTotals();
      saveCart();
      updateCartDisplay();
      updateCartModal().catch(logger.error);

      announceToScreenReader(`${removedItem.name} retiré du panier`);
      logger.info('Article retiré du panier:', removedItem.name);
    }
  }

  /**
   * Vide le panier
   */
  function clearCart() {
    state.cart.items = [];
    calculateCartTotals();
    saveCart();
    updateCartDisplay();
    updateCartModal().catch(logger.error);

    announceToScreenReader('Panier vidé');
    logger.info('Panier vidé');
  }

  /**
   * Met à jour une variante d'un article dans le panier
   */
  function updateVariant(itemId, itemIndex, variantKey, newValue) {
    if (itemIndex >= 0 && itemIndex < state.cart.items.length) {
      const item = state.cart.items[itemIndex];

      if (item.id === itemId) {
        // Mettre à jour la variante
        item.variants[variantKey] = newValue;
        item.variants = normalizeVariants(item.variants);

        const duplicateIndex = state.cart.items.findIndex((it, idx) => idx !== itemIndex
          && it.id === item.id && variantsEqual(it.variants, item.variants));
        if (duplicateIndex !== -1) {
          state.cart.items[duplicateIndex].quantity += item.quantity;
          state.cart.items.splice(itemIndex, 1);
        }

        calculateCartTotals();
        saveCart();
        updateCartDisplay();
        updateCartModal().catch(logger.error);

        announceToScreenReader(`${variantKey} mis à jour: ${newValue}`);
        logger.info(`Variante mise à jour pour ${item.name}: ${variantKey} = ${newValue}`);
      }
    }
  }

  // ========================================================================
  // INTERFACE UTILISATEUR
  // ========================================================================

  /**
   * Met à jour l'affichage du panier dans le header
   */
  function updateCartDisplay() {
    const badges = [elements.cartBadge, elements.cartBadgeMobile].filter(Boolean);

    badges.forEach((badge) => {
      badge.textContent = state.cart.count;
      badge.setAttribute('data-count', state.cart.count);
      badge.setAttribute('aria-label', `${state.cart.count} articles dans le panier`);

      if (state.cart.count > 0) {
        badge.style.transform = 'scale(1)';
      } else {
        badge.style.transform = 'scale(0)';
      }
    });
  }

  /**
   * Animation du bouton panier lors d'un ajout
   */
  function animateCartButton() {
    const buttons = [elements.cartToggle, elements.cartToggleMobile].filter(Boolean);

    buttons.forEach((button) => {
      button.style.transform = 'scale(1.1)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, CONFIG.animationDuration);
    });
  }

  /**
   * Crée le HTML pour les modales
   */
  function createModals() {
    // Modal Compte
    const accountModalHtml = `
      <div class="gd-modal-overlay" id="gd-account-modal" role="dialog" aria-labelledby="account-modal-title" aria-hidden="true">
        <div class="gd-modal">
          <div class="gd-modal-content">
            <div class="gd-modal-header">
              <h2 class="gd-modal-title" id="account-modal-title">⚔️ Compte Aventurier</h2>
              <button class="gd-modal-close" aria-label="Fermer" data-modal="account">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="gd-modal-body">
              <div class="gd-account-section">
                <div class="gd-account-welcome">
                  <h3>🏰 Bienvenue, Noble Aventurier !</h3>
                  <p>Gérez votre profil et vos quêtes dans cette section</p>
                </div>

                <div class="gd-account-tabs" role="tablist">
                  <button class="gd-account-tab active" role="tab" aria-selected="true" aria-controls="profile-panel" data-tab="profile">
                    🛡️ Profil
                  </button>
                  <button class="gd-account-tab" role="tab" aria-selected="false" aria-controls="orders-panel" data-tab="orders">
                    📜 Commandes
                  </button>
                  <button class="gd-account-tab" role="tab" aria-selected="false" aria-controls="settings-panel" data-tab="settings">
                    ⚙️ Paramètres
                  </button>
                </div>

                <div class="gd-account-content">
                  <div class="gd-tab-content active" id="profile-panel" role="tabpanel" aria-labelledby="profile-tab">
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-name">Nom d'Aventurier</label>
                      <input type="text" id="profile-name" class="gd-form-input" placeholder="Votre nom complet">
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-email">Adresse de Messagerie</label>
                      <input type="email" id="profile-email" class="gd-form-input" placeholder="votre@email.com">
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-class">Classe d'Aventurier</label>
                      <select id="profile-class" class="gd-form-select">
                        <option value="warrior">🗡️ Guerrier</option>
                        <option value="mage">🔮 Mage</option>
                        <option value="ranger">🏹 Rôdeur</option>
                        <option value="cleric">⚕️ Clerc</option>
                        <option value="rogue">🗡️ Voleur</option>
                      </select>
                    </div>
                    <button class="gd-btn gd-btn-primary gd-btn-full">💾 Sauvegarder le Profil</button>
                  </div>

                  <div class="gd-tab-content" id="orders-panel" role="tabpanel" aria-labelledby="orders-tab">
                    <div style="text-align: center; padding: 2rem; color: var(--gd-text-secondary);">
                      📜 Vos quêtes précédentes apparaîtront ici
                    </div>
                  </div>

                  <div class="gd-tab-content" id="settings-panel" role="tabpanel" aria-labelledby="settings-tab">
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="settings-notifications">Notifications par Corbeau</label>
                      <select id="settings-notifications" class="gd-form-select">
                        <option value="all">Toutes les notifications</option>
                        <option value="orders">Commandes uniquement</option>
                        <option value="none">Aucune notification</option>
                      </select>
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="settings-language">Langue Préférée</label>
                      <select id="settings-language" class="gd-form-select">
                        <option value="fr">Français</option>
                        <option value="en">Common (English)</option>
                      </select>
                    </div>
                    <button class="gd-btn gd-btn-secondary gd-btn-full">⚙️ Sauvegarder les Paramètres</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Modal Panier
    const cartModalHtml = `
      <div class="gd-modal-overlay" id="gd-cart-modal" role="dialog" aria-labelledby="cart-modal-title" aria-hidden="true">
        <div class="gd-modal">
          <div class="gd-modal-content">
            <div class="gd-modal-header">
              <h2 class="gd-modal-title" id="cart-modal-title">🛒 Sac d'Aventurier</h2>
              <button class="gd-modal-close" aria-label="Fermer" data-modal="cart">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="gd-modal-body">
              <div id="gd-cart-content" aria-live="polite">
                <!-- Le contenu sera généré dynamiquement -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Ajouter les modales au DOM
    elements.body.insertAdjacentHTML('beforeend', accountModalHtml);
    elements.body.insertAdjacentHTML('beforeend', cartModalHtml);

    // Référencer les modales
    elements.accountModal = document.getElementById('gd-account-modal');
    elements.cartModal = document.getElementById('gd-cart-modal');
  }

  /**
   * Met à jour le contenu de la modal panier
   */
  async function updateCartModal() {
    const cartContent = document.getElementById('gd-cart-content');
    if (!cartContent) return;

    if (state.cart.items.length === 0) {
      cartContent.innerHTML = `
        <div class="gd-cart-empty">
          <svg class="gd-cart-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <h3>🎒 Sac Vide</h3>
          <p>Votre sac d'aventurier est vide. Ajoutez des objets pour commencer votre quête !</p>
          <button class="gd-btn gd-btn-primary" onclick="GDEcommerce.closeCartModal()">
            🛒 Continuer les Achats
          </button>
        </div>
      `;
      return;
    }

    // Générer l'HTML pour chaque item avec les vraies options depuis products.json
    const itemsPromises = state.cart.items.map(async (item, index) => {
      logger.info(`🎨 Génération HTML pour article ${index}:`, item);
      logger.info('🏷️ Variantes de l\'article:', item.variants);

      const variantOptions = await getProductVariantOptions(item.id);
      logger.info('📋 Options disponibles depuis products.json:', variantOptions);

      // Créer des sélecteurs interactifs pour les variations basés sur products.json
      const variantsHtml = Object.keys(item.variants).length > 0
        ? (await Promise.all(Object.entries(item.variants).map(async ([key, value]) => {
          logger.info(`🔧 Traitement variante: ${key} = ${value}`);
          const normalizedKey = key.toLowerCase();
          if (['multiplicateur', 'multiplier'].includes(normalizedKey) && variantOptions.multipliers.length > 0) {
            const canonicalKey = 'Multiplicateur';
            const options = variantOptions.multipliers.map((mult) => {
              const opt = mult.trim();
              const isSelected = opt === value.trim();
              return `<option value="${escapeHtml(opt)}" ${isSelected ? 'selected' : ''}>${escapeHtml(opt)}</option>`;
            }).join('');
            const label = document.documentElement.lang === 'en' ? 'Multiplier' : 'Multiplicateur';
            return `
                <div class="gd-cart-variant-selector">
                  <label class="gd-variant-label">${escapeHtml(label)}:</label>
                  <select class="gd-variant-select" onchange="GDEcommerce.updateVariant('${escapeHtml(item.id)}', ${index}, '${canonicalKey}', this.value)">
                    ${options}
                  </select>
                </div>
              `;
          }
          if (['langue', 'language'].includes(normalizedKey) && variantOptions.languages.length > 0) {
            const canonicalKey = 'Langue';
            const options = variantOptions.languages.map((lang) => {
              const opt = lang.trim();
              const isSelected = opt === value.trim();
              return `<option value="${escapeHtml(opt)}" ${isSelected ? 'selected' : ''}>${escapeHtml(opt)}</option>`;
            }).join('');
            const label = document.documentElement.lang === 'en' ? 'Language' : 'Langue';
            return `
                <div class="gd-cart-variant-selector">
                  <label class="gd-variant-label">${escapeHtml(label)}:</label>
                  <select class="gd-variant-select" onchange="GDEcommerce.updateVariant('${escapeHtml(item.id)}', ${index}, '${canonicalKey}', this.value)">
                    ${options}
                  </select>
                </div>
              `;
          }
          // Affichage simple pour autres variantes
          return `
              <div class="gd-cart-variant-display">
                <span class="gd-variant-label">${escapeHtml(key)}:</span>
                <span class="gd-variant-value">${escapeHtml(value)}</span>
              </div>
            `;
        }))).join('')
        : '';

      return `
        <div class="gd-cart-item" data-id="${escapeHtml(item.id)}" data-item-index="${index}">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="gd-cart-item-image" loading="lazy">
          <div class="gd-cart-item-details">
            <div class="gd-cart-item-name">${item.name}</div>
            ${variantsHtml ? `<div class="gd-cart-item-variants">${variantsHtml}</div>` : ''}
            <div class="gd-cart-item-price">${formatPrice(item.price)}</div>
            <div class="gd-cart-item-controls">
              <div class="gd-qty-control">
                <button class="gd-qty-btn" onclick="GDEcommerce.updateQuantity('${escapeHtml(item.id)}', ${JSON.stringify(item.variants).replace(/"/g, '&quot;')}, ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''} aria-label="Diminuer la quantité">−</button>
                <span class="gd-qty-value">${item.quantity}</span>
                <button class="gd-qty-btn" onclick="GDEcommerce.updateQuantity('${escapeHtml(item.id)}', ${JSON.stringify(item.variants).replace(/"/g, '&quot;')}, ${item.quantity + 1})" ${item.quantity >= CONFIG.maxItems ? 'disabled' : ''} aria-label="Augmenter la quantité">+</button>
              </div>
            </div>
          </div>
          <button class="gd-cart-item-remove" onclick="GDEcommerce.removeItem('${escapeHtml(item.id)}', ${JSON.stringify(item.variants).replace(/"/g, '&quot;')})" title="Retirer l'objet" aria-label="Retirer ${escapeHtml(item.name)}">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      `;
    });

    const itemsHtml = (await Promise.all(itemsPromises)).join('');

    cartContent.innerHTML = `
      <div class="gd-cart-items">
        ${itemsHtml}
      </div>
      <div class="gd-cart-summary">
        <div class="gd-cart-summary-row">
          <span class="gd-cart-summary-label">Articles (${state.cart.count})</span>
          <span class="gd-cart-summary-value">${formatPrice(state.cart.total)}</span>
        </div>
        <div class="gd-cart-summary-row">
          <span class="gd-cart-summary-label">Livraison</span>
          <span class="gd-cart-summary-value">Calculée à l'étape suivante</span>
        </div>
        <div class="gd-cart-summary-row">
          <span class="gd-cart-summary-label gd-cart-total">Total</span>
          <span class="gd-cart-summary-value gd-cart-total">${formatPrice(state.cart.total)}</span>
        </div>
      </div>
      <div class="gd-cart-actions">
        <button class="gd-btn gd-btn-outline" onclick="GDEcommerce.closeCartModal()">
          🛒 Continuer les Achats
        </button>
        <button class="gd-btn gd-btn-primary gd-btn-full" onclick="GDEcommerce.showCheckout()">
          ⚔️ Finaliser la Commande
        </button>
      </div>
      <div class="gd-cart-secondary-actions">
        <button class="gd-btn gd-btn-danger" onclick="GDEcommerce.clearCart()">
          🧹 Vider le Sac
        </button>
      </div>
    `;
  }

  // ========================================================================
  // GESTION DES MODALES
  // ========================================================================

  /**
   * Ouvre une modal
   */
  async function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Ferme l'autre fenêtre si elle est ouverte
    if (modalId === 'gd-cart-modal' && state.ui.accountModalOpen) {
      closeModal('gd-account-modal');
    } else if (modalId === 'gd-account-modal' && state.ui.cartModalOpen) {
      closeModal('gd-cart-modal');
    }

    // Préparation de la modal
    if (modalId === 'gd-cart-modal') {
      await updateCartModal().catch(logger.error);
    }

    requestAnimationFrame(() => {
      // Gestion de l'accessibilité
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      elements.body.style.overflow = 'hidden';

      if (modalId === 'gd-cart-modal') {
        state.ui.cartModalOpen = true;
        [elements.cartToggle, elements.cartToggleMobile].forEach((btn) => {
          if (btn) btn.setAttribute('aria-expanded', 'true');
        });
      } else if (modalId === 'gd-account-modal') {
        state.ui.accountModalOpen = true;
        [elements.accountToggle, elements.accountToggleMobile].forEach((btn) => {
          if (btn) btn.setAttribute('aria-expanded', 'true');
        });
      }

      // Focus trap
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );

      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Gestionnaire pour la touche Échap
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeModal(modalId);
          document.removeEventListener('keydown', handleEscape);
        }
      };

      document.addEventListener('keydown', handleEscape);
    });
  }

  /**
   * Ferme une modal
   */
  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    elements.body.style.overflow = '';

    // Mise à jour de l'état
    if (modalId === 'gd-cart-modal') {
      state.ui.cartModalOpen = false;
      [elements.cartToggle, elements.cartToggleMobile].forEach((btn) => {
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    } else if (modalId === 'gd-account-modal') {
      state.ui.accountModalOpen = false;
      [elements.accountToggle, elements.accountToggleMobile].forEach((btn) => {
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    // Retourner le focus au bouton qui a ouvert la modal
    const triggerButton = modalId === 'gd-cart-modal'
      ? elements.cartToggle
      : elements.accountToggle;

    if (triggerButton) {
      triggerButton.focus();
    }
  }

  /**
   * Ferme toutes les modales
   */
  function closeAllModals() {
    closeModal('gd-account-modal');
    closeModal('gd-cart-modal');
  }

  // ========================================================================
  // GESTION DES ONGLETS COMPTE
  // ========================================================================

  /**
   * Change d'onglet dans la section compte
   */
  function switchAccountTab(tabName) {
    // Mise à jour des onglets
    const tabs = document.querySelectorAll('.gd-account-tab');
    const contents = document.querySelectorAll('.gd-tab-content');

    tabs.forEach((tab) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    contents.forEach((content) => {
      content.classList.remove('active');
    });

    // Activation du nouvel onglet
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`${tabName}-panel`);

    if (activeTab && activeContent) {
      activeTab.classList.add('active');
      activeTab.setAttribute('aria-selected', 'true');
      activeContent.classList.add('active');
      state.ui.currentAccountTab = tabName;
    }
  }

  // ========================================================================
  // INTÉGRATION AVEC LES BOUTONS EXISTANTS
  // ========================================================================

  /**
   * Extrait l'image du produit depuis la page
   */
  function extractProductImage(button) {
    // Chercher dans le conteneur parent
    const container = button.closest('.card, .product-card, .card-product');
    if (container) {
      const img = container.querySelector('img.product-media, .product-media img');
      if (img) return img.src;
    }

    // Image par défaut
    return '/images/optimized-modern/webp/brand-geekndragon-main.webp';
  }

  /**
   * Charge les données des produits depuis products.json
   */
  let productsData = null;
  async function loadProductsData() {
    if (!productsData) {
      try {
        const response = await fetch('/data/products.json');
        productsData = await response.json();
      } catch (error) {
        logger.warn('Erreur lors du chargement de products.json:', error);
        productsData = {};
      }
    }
    return productsData;
  }

  /**
   * Extrait les variantes du produit depuis les data attributes et sélecteurs
   */
  function extractProductVariants(button) {
    const variants = {};
    const productId = button.dataset.id;

    logger.info('🔍 Extraction des variantes pour:', productId);
    logger.info('📋 Données du bouton:', button.dataset);

    const normalizeVariantName = (name) => {
      const n = name.toLowerCase();
      if (n === 'multiplicateur' || n === 'multiplier') return 'Multiplicateur';
      if (n === 'langue' || n === 'language') return 'Langue';
      return name;
    };

    // Récupérer les variantes depuis les data attributes Snipcart
    for (let i = 1; i <= 3; i += 1) {
      // Chercher d'abord avec le format Snipcart standard
      let name = button.dataset[`custom${i}Name`];
      let value = button.dataset[`custom${i}Value`];

      // Si pas trouvé, chercher avec le format item-custom (notre format)
      if (!name) {
        name = button.dataset[`itemCustom${i}Name`];
      }
      if (!value) {
        value = button.dataset[`itemCustom${i}Value`];
      }

      // Si on a des options, prendre la première par défaut
      const options = button.dataset[`custom${i}Options`] || button.dataset[`itemCustom${i}Options`];
      if (name && options && !value) {
        const [firstOption] = options.split('|');
        if (firstOption) {
          value = firstOption;
          logger.info(`🔧 Utilisation de la première option par défaut: ${value}`);
        }
      }

      if (name && value) {
        const variantName = normalizeVariantName(name);
        variants[variantName] = value;
        logger.info(`✅ Variante trouvée: ${variantName} = ${value}`);
      }
    }

    // Récupérer les sélecteurs de variantes proches (si ils existent)
    const container = button.closest('.card, .product-panel, .product-info');
    if (container) {
      // Multiplicateurs depuis le sélecteur (si non en commentaire)
      const multiplierSelect = container.querySelector('select[id^="multiplier-"]');
      if (multiplierSelect && multiplierSelect.value) {
        const selectedText = multiplierSelect.options[multiplierSelect.selectedIndex].text;
        variants.Multiplicateur = selectedText.trim();
        logger.info(`✅ Multiplicateur depuis sélecteur: ${selectedText.trim()}`);
      }

      // Langues depuis le sélecteur
      const languageSelect = container.querySelector('select[data-type="language"]');
      if (languageSelect && languageSelect.selectedIndex > 0) {
        const selectedText = languageSelect.options[languageSelect.selectedIndex].text;
        variants.Langue = selectedText.trim();
        logger.info(`✅ Langue depuis sélecteur: ${selectedText.trim()}`);
      }
    }

    logger.info('🎯 Variantes extraites:', variants);
    return variants;
  }

  /**
   * Récupère les options disponibles pour un produit depuis products.json
   */
  async function getProductVariantOptions(productId) {
    const products = await loadProductsData();
    const product = products[productId];

    if (!product) return { multipliers: [], languages: [] };

    return {
      multipliers: product.multipliers || [],
      languages: product.languages || [],
    };
  }

  // ========================================================================
  // CHECKOUT ET PAIEMENT
  // ========================================================================

  // État du checkout
  const checkoutState = {
    step: 1, // 1: adresses, 2: livraison, 3: paiement
    addresses: {
      billing: { country: 'CA' },
      shipping: { country: 'CA' },
      sameAsbilling: true,
    },
    shipping: {
      method: null,
      cost: 0,
      rates: [],
    },
    taxes: {
      amount: 0,
      details: {},
    },
    payment: {
      method: null,
      processing: false,
    },
  };

  /**
   * Obtenir l'icône de notification selon le type
   */
  function getNotificationIcon(type) {
    switch (type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  }

  /**
   * Obtenir la couleur de notification selon le type
   */
  function getNotificationColor(type) {
    switch (type) {
      case 'error':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      default:
        return '#17a2b8';
    }
  }

  /**
   * Afficher une notification utilisateur
   */
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `gd-notification gd-notification-${type}`;
    notification.innerHTML = `
      <div class="gd-notification-content">
        <span class="gd-notification-icon">
          ${getNotificationIcon(type)}
        </span>
        <span class="gd-notification-message">${message}</span>
        <button class="gd-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Styles inline pour la notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${getNotificationColor(type)};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10001;
      min-width: 300px;
      max-width: 500px;
      animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  /**
   * Afficher le checkout intégré
   */
  function showCheckout() {
    if (state.cart.items.length === 0) {
      announceToScreenReader('Le panier est vide');
      return;
    }
    calculateCartTotals();

    // Fermer le modal de panier et ouvrir le checkout
    closeModal('gd-cart-modal');
    createCheckoutModal();
    checkoutState.step = 1;
    renderCheckoutStep();

    logger.info('Checkout initié avec:', state.cart);
  }

  /**
   * Créer le modal de checkout avec style DnD
   */
  function createCheckoutModal() {
    // Supprimer le modal existant s'il existe
    const existingModal = document.getElementById('gd-checkout-modal');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'gd-checkout-modal';
    modal.className = 'gd-modal gd-checkout-modal';
    modal.innerHTML = `
      <div class="gd-modal-overlay" onclick="GDEcommerce.closeCheckout()"></div>
      <div class="gd-modal-content gd-checkout-content">
        <div class="gd-checkout-header">
          <h2 class="gd-checkout-title">🏰 Finaliser votre Commande</h2>
          <button class="gd-modal-close" onclick="GDEcommerce.closeCheckout()" aria-label="Fermer">✕</button>
        </div>
        <div class="gd-checkout-progress">
          <div class="gd-progress-step ${checkoutState.step >= 1 ? 'active' : ''}" data-step="1">
            <span class="gd-progress-number">1</span>
            <span class="gd-progress-label">Adresses</span>
          </div>
          <div class="gd-progress-step ${checkoutState.step >= 2 ? 'active' : ''}" data-step="2">
            <span class="gd-progress-number">2</span>
            <span class="gd-progress-label">Livraison</span>
          </div>
          <div class="gd-progress-step ${checkoutState.step >= 3 ? 'active' : ''}" data-step="3">
            <span class="gd-progress-number">3</span>
            <span class="gd-progress-label">Paiement</span>
          </div>
        </div>
        <div class="gd-checkout-body">
          <div class="gd-checkout-main" id="gd-checkout-main">
            <!-- Contenu dynamique des étapes -->
          </div>
          <div class="gd-checkout-sidebar">
            <div class="gd-order-summary">
              <h3 class="gd-summary-title">📜 Résumé de la Commande</h3>
              <div id="gd-checkout-summary">
                <!-- Résumé dynamique -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Animation d'entrée
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
  }

  /**
   * Fermer le modal de checkout
   */
  function closeCheckout() {
    const modal = document.getElementById('gd-checkout-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
      }, CONFIG.animationDuration);
    }
  }

  /**
   * Rendre l'étape actuelle du checkout
   */
  function renderCheckoutStep() {
    const mainContent = document.getElementById('gd-checkout-main');
    const summaryContent = document.getElementById('gd-checkout-summary');

    if (!mainContent || !summaryContent) return;

    // Mettre à jour la progression
    updateCheckoutProgress();

    // Rendre le résumé de commande
    renderOrderSummary(summaryContent);

    // Rendre le contenu de l'étape
    switch (checkoutState.step) {
      case 1:
        renderAddressStep(mainContent);
        break;
      case 2:
        renderShippingStep(mainContent);
        break;
      case 3:
        renderPaymentStep(mainContent);
        break;
      default:
        break;
    }
  }

  /**
   * Mettre à jour la progression du checkout
   */
  function updateCheckoutProgress() {
    const steps = document.querySelectorAll('.gd-progress-step');
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      if (stepNumber <= checkoutState.step) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
      if (stepNumber < checkoutState.step) {
        step.classList.add('completed');
      } else {
        step.classList.remove('completed');
      }
    });
  }

  /**
   * Rendre le résumé de commande
   */
  function renderOrderSummary(container) {
    const subtotal = state.cart.total;
    const shipping = checkoutState.shipping.cost;
    const taxes = checkoutState.taxes.amount;
    const total = subtotal + shipping + taxes;

    const itemsHtml = state.cart.items.map((item) => {
      const variantsText = Object.entries(item.variants || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

      return `
        <div class="gd-summary-item">
          <div class="gd-summary-item-info">
            <span class="gd-summary-item-name">${escapeHtml(item.name)}</span>
            ${variantsText ? `<span class="gd-summary-item-variants">${escapeHtml(variantsText)}</span>` : ''}
            <span class="gd-summary-item-qty">× ${item.quantity}</span>
          </div>
          <span class="gd-summary-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="gd-summary-items">
        ${itemsHtml}
      </div>
      <div class="gd-summary-totals">
        <div class="gd-summary-row">
          <span>Sous-total</span>
          <span>${formatPrice(subtotal)}</span>
        </div>
        ${shipping > 0 ? `
          <div class="gd-summary-row">
            <span>Livraison</span>
            <span>${formatPrice(shipping)}</span>
          </div>
        ` : ''}
        ${taxes > 0 ? `
          <div class="gd-summary-row">
            <span>Taxes</span>
            <span>${formatPrice(taxes)}</span>
          </div>
        ` : ''}
        <div class="gd-summary-row gd-summary-total">
          <span>Total</span>
          <span>${formatPrice(total)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Rendre l'étape des adresses
   */
  function renderAddressStep(container) {
    container.innerHTML = `
      <div class="gd-checkout-step">
        <h3 class="gd-step-title">📍 Adresses de Facturation et Livraison</h3>
        
        <div class="gd-address-forms">
          <div class="gd-address-section">
            <h4 class="gd-address-title">🏠 Adresse de Facturation</h4>
            <form class="gd-address-form" id="billing-address-form">
              <div class="gd-form-row">
                <div class="gd-form-group">
                  <label for="billing-firstname">Prénom *</label>
                  <input type="text" id="billing-firstname" name="firstname" required 
                         value="${checkoutState.addresses.billing.firstname || ''}" 
                         placeholder="Votre prénom">
                </div>
                <div class="gd-form-group">
                  <label for="billing-lastname">Nom *</label>
                  <input type="text" id="billing-lastname" name="lastname" required 
                         value="${checkoutState.addresses.billing.lastname || ''}" 
                         placeholder="Votre nom">
                </div>
              </div>
              <div class="gd-form-group">
                <label for="billing-email">Courriel *</label>
                <input type="email" id="billing-email" name="email" required 
                       value="${checkoutState.addresses.billing.email || ''}" 
                       placeholder="votre@courriel.com">
              </div>
              <div class="gd-form-group">
                <label for="billing-phone">Téléphone</label>
                <input type="tel" id="billing-phone" name="phone" 
                       value="${checkoutState.addresses.billing.phone || ''}" 
                       placeholder="(555) 123-4567">
              </div>
              <div class="gd-form-group">
                <label for="billing-address1">Adresse *</label>
                <input type="text" id="billing-address1" name="address1" required 
                       value="${checkoutState.addresses.billing.address1 || ''}" 
                       placeholder="123 Rue Principale">
              </div>
              <div class="gd-form-group">
                <label for="billing-address2">Appartement/Suite</label>
                <input type="text" id="billing-address2" name="address2" 
                       value="${checkoutState.addresses.billing.address2 || ''}" 
                       placeholder="App. 4B">
              </div>
              <div class="gd-form-row">
                <div class="gd-form-group">
                  <label for="billing-city">Ville *</label>
                  <input type="text" id="billing-city" name="city" required 
                         value="${checkoutState.addresses.billing.city || ''}" 
                         placeholder="Montréal">
                </div>
                <div class="gd-form-group">
                  <label for="billing-province">Province *</label>
                  <select id="billing-province" name="province" required>
                    <option value="">Choisir...</option>
                    <option value="QC" ${checkoutState.addresses.billing.province === 'QC' ? 'selected' : ''}>Québec</option>
                    <option value="ON" ${checkoutState.addresses.billing.province === 'ON' ? 'selected' : ''}>Ontario</option>
                    <option value="BC" ${checkoutState.addresses.billing.province === 'BC' ? 'selected' : ''}>Colombie-Britannique</option>
                    <option value="AB" ${checkoutState.addresses.billing.province === 'AB' ? 'selected' : ''}>Alberta</option>
                    <option value="MB" ${checkoutState.addresses.billing.province === 'MB' ? 'selected' : ''}>Manitoba</option>
                    <option value="SK" ${checkoutState.addresses.billing.province === 'SK' ? 'selected' : ''}>Saskatchewan</option>
                    <option value="NS" ${checkoutState.addresses.billing.province === 'NS' ? 'selected' : ''}>Nouvelle-Écosse</option>
                    <option value="NB" ${checkoutState.addresses.billing.province === 'NB' ? 'selected' : ''}>Nouveau-Brunswick</option>
                    <option value="PE" ${checkoutState.addresses.billing.province === 'PE' ? 'selected' : ''}>Île-du-Prince-Édouard</option>
                    <option value="NL" ${checkoutState.addresses.billing.province === 'NL' ? 'selected' : ''}>Terre-Neuve-et-Labrador</option>
                    <option value="YT" ${checkoutState.addresses.billing.province === 'YT' ? 'selected' : ''}>Yukon</option>
                    <option value="NT" ${checkoutState.addresses.billing.province === 'NT' ? 'selected' : ''}>Territoires du Nord-Ouest</option>
                    <option value="NU" ${checkoutState.addresses.billing.province === 'NU' ? 'selected' : ''}>Nunavut</option>
                  </select>
                </div>
                <div class="gd-form-group">
                  <label for="billing-postalcode">Code Postal *</label>
                  <input type="text" id="billing-postalcode" name="postalcode" required 
                         value="${checkoutState.addresses.billing.postalcode || ''}" 
                         placeholder="H1A 1A1">
                </div>
              </div>
              <div class="gd-form-group">
                <label for="billing-country">Pays *</label>
                <select id="billing-country" name="country" required>
                  <option value="CA" ${checkoutState.addresses.billing.country === 'CA' ? 'selected' : ''}>Canada</option>
                  <option value="US" ${checkoutState.addresses.billing.country === 'US' ? 'selected' : ''}>États-Unis</option>
                </select>
              </div>
            </form>
          </div>

          <div class="gd-address-section">
            <div class="gd-address-header">
              <h4 class="gd-address-title">🚚 Adresse de Livraison</h4>
              <label class="gd-checkbox-wrapper">
                <input type="checkbox" id="same-as-billing" 
                       ${checkoutState.addresses.sameAsbilling ? 'checked' : ''}
                       onchange="GDEcommerce.toggleShippingAddress(this.checked)">
                <span class="gd-checkbox-label">Identique à l'adresse de facturation</span>
              </label>
            </div>
            
            <form class="gd-address-form ${checkoutState.addresses.sameAsbilling ? 'gd-form-disabled' : ''}" 
                  id="shipping-address-form">
              <div class="gd-form-row">
                <div class="gd-form-group">
                  <label for="shipping-firstname">Prénom *</label>
                  <input type="text" id="shipping-firstname" name="firstname" required 
                         value="${checkoutState.addresses.shipping.firstname || ''}" 
                         placeholder="Prénom du destinataire"
                         ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
                </div>
                <div class="gd-form-group">
                  <label for="shipping-lastname">Nom *</label>
                  <input type="text" id="shipping-lastname" name="lastname" required 
                         value="${checkoutState.addresses.shipping.lastname || ''}" 
                         placeholder="Nom du destinataire"
                         ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
                </div>
              </div>
              <div class="gd-form-group">
                <label for="shipping-address1">Adresse *</label>
                <input type="text" id="shipping-address1" name="address1" required 
                       value="${checkoutState.addresses.shipping.address1 || ''}" 
                       placeholder="123 Rue de Livraison"
                       ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
              </div>
              <div class="gd-form-group">
                <label for="shipping-address2">Appartement/Suite</label>
                <input type="text" id="shipping-address2" name="address2" 
                       value="${checkoutState.addresses.shipping.address2 || ''}" 
                       placeholder="App. 4B"
                       ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
              </div>
              <div class="gd-form-row">
                <div class="gd-form-group">
                  <label for="shipping-city">Ville *</label>
                  <input type="text" id="shipping-city" name="city" required 
                         value="${checkoutState.addresses.shipping.city || ''}" 
                         placeholder="Montréal"
                         ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
                </div>
                <div class="gd-form-group">
                  <label for="shipping-province">Province *</label>
                  <select id="shipping-province" name="province" required 
                          ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
                    <option value="">Choisir...</option>
                    <option value="QC" ${checkoutState.addresses.shipping.province === 'QC' ? 'selected' : ''}>Québec</option>
                    <option value="ON" ${checkoutState.addresses.shipping.province === 'ON' ? 'selected' : ''}>Ontario</option>
                    <option value="BC" ${checkoutState.addresses.shipping.province === 'BC' ? 'selected' : ''}>Colombie-Britannique</option>
                    <option value="AB" ${checkoutState.addresses.shipping.province === 'AB' ? 'selected' : ''}>Alberta</option>
                    <option value="MB" ${checkoutState.addresses.shipping.province === 'MB' ? 'selected' : ''}>Manitoba</option>
                    <option value="SK" ${checkoutState.addresses.shipping.province === 'SK' ? 'selected' : ''}>Saskatchewan</option>
                    <option value="NS" ${checkoutState.addresses.shipping.province === 'NS' ? 'selected' : ''}>Nouvelle-Écosse</option>
                    <option value="NB" ${checkoutState.addresses.shipping.province === 'NB' ? 'selected' : ''}>Nouveau-Brunswick</option>
                    <option value="PE" ${checkoutState.addresses.shipping.province === 'PE' ? 'selected' : ''}>Île-du-Prince-Édouard</option>
                    <option value="NL" ${checkoutState.addresses.shipping.province === 'NL' ? 'selected' : ''}>Terre-Neuve-et-Labrador</option>
                    <option value="YT" ${checkoutState.addresses.shipping.province === 'YT' ? 'selected' : ''}>Yukon</option>
                    <option value="NT" ${checkoutState.addresses.shipping.province === 'NT' ? 'selected' : ''}>Territoires du Nord-Ouest</option>
                    <option value="NU" ${checkoutState.addresses.shipping.province === 'NU' ? 'selected' : ''}>Nunavut</option>
                  </select>
                </div>
                <div class="gd-form-group">
                  <label for="shipping-postalcode">Code Postal *</label>
                  <input type="text" id="shipping-postalcode" name="postalcode" required 
                         value="${checkoutState.addresses.shipping.postalcode || ''}" 
                         placeholder="H1A 1A1"
                         ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
                </div>
              </div>
              <div class="gd-form-group">
                <label for="shipping-country">Pays *</label>
                <select id="shipping-country" name="country" required
                        ${checkoutState.addresses.sameAsbilling ? 'disabled' : ''}>
                  <option value="CA" ${checkoutState.addresses.shipping.country === 'CA' ? 'selected' : ''}>Canada</option>
                  <option value="US" ${checkoutState.addresses.shipping.country === 'US' ? 'selected' : ''}>États-Unis</option>
                </select>
              </div>
            </form>
          </div>
        </div>

        <div class="gd-step-actions">
          <button class="gd-btn gd-btn-outline" onclick="GDEcommerce.closeCheckout()">
            ⬅️ Retour au Panier
          </button>
          <button class="gd-btn gd-btn-primary" onclick="GDEcommerce.nextCheckoutStep()">
            Continuer ➡️
          </button>
        </div>
      </div>
    `;

    // Ajouter les gestionnaires d'événements pour la saisie automatique
    setupAddressFormListeners();
  }

  /**
   * Basculer l'adresse de livraison
   */
  function toggleShippingAddress(sameAsBilling) {
    checkoutState.addresses.sameAsbilling = sameAsBilling;
    const billingForm = document.getElementById('billing-address-form');
    const shippingForm = document.getElementById('shipping-address-form');

    if (sameAsBilling) {
      shippingForm.classList.add('gd-form-disabled');
      const inputs = shippingForm.querySelectorAll('input, select');
      inputs.forEach((input) => {
        if (billingForm) {
          const billingInput = billingForm.querySelector(`[name="${input.name}"]`);
          if (billingInput) {
            input.value = billingInput.value;
          }
        }
        input.disabled = true;
      });

      // Copier les données de facturation (incluant le pays)
      checkoutState.addresses.shipping = {
        ...checkoutState.addresses.billing,
        country: checkoutState.addresses.billing.country,
      };
    } else {
      shippingForm.classList.remove('gd-form-disabled');
      const inputs = shippingForm.querySelectorAll('input, select');
      inputs.forEach((input) => {
        input.disabled = false;
      });
    }
  }

  /**
   * Configurer les gestionnaires d'événements pour les formulaires d'adresse
   */
  function setupAddressFormListeners() {
    const billingForm = document.getElementById('billing-address-form');
    const shippingForm = document.getElementById('shipping-address-form');

    if (billingForm) {
      const inputs = billingForm.querySelectorAll('input');
      inputs.forEach((input) => {
        checkoutState.addresses.billing[input.name] = input.value;
        input.addEventListener('input', (e) => {
          checkoutState.addresses.billing[e.target.name] = e.target.value;

          // Si l'adresse de livraison est identique, copier automatiquement
          if (checkoutState.addresses.sameAsbilling) {
            checkoutState.addresses.shipping[e.target.name] = e.target.value;
            const corresponding = shippingForm.querySelector(
              `[name="${e.target.name}"]`,
            );
            if (corresponding) {
              corresponding.value = e.target.value;
            }
          }
        });
      });

      const selects = billingForm.querySelectorAll('select');
      selects.forEach((select) => {
        checkoutState.addresses.billing[select.name] = select.value;
        select.addEventListener('change', (e) => {
          checkoutState.addresses.billing[e.target.name] = e.target.value;

          if (checkoutState.addresses.sameAsbilling) {
            checkoutState.addresses.shipping[e.target.name] = e.target.value;
            const corresponding = shippingForm.querySelector(
              `[name="${e.target.name}"]`,
            );
            if (corresponding) {
              corresponding.value = e.target.value;
            }
          }
        });
      });
    }

    if (shippingForm) {
      const inputs = shippingForm.querySelectorAll('input');
      inputs.forEach((input) => {
        checkoutState.addresses.shipping[input.name] = input.value;
        input.addEventListener('input', (e) => {
          checkoutState.addresses.shipping[e.target.name] = e.target.value;
        });
      });

      const selects = shippingForm.querySelectorAll('select');
      selects.forEach((select) => {
        checkoutState.addresses.shipping[select.name] = select.value;
        select.addEventListener('change', (e) => {
          checkoutState.addresses.shipping[e.target.name] = e.target.value;
        });
      });
    }

    if (checkoutState.addresses.sameAsbilling) {
      checkoutState.addresses.shipping = { ...checkoutState.addresses.billing };
    }
  }

  /**
   * Attache tous les événements
   */
  function attachEventListeners() {
    if (eventsAttached || !elements.accountModal || !elements.cartModal) return;
    eventsAttached = true;

    // Boutons header
    if (elements.accountToggle) {
      elements.accountToggle.addEventListener('click', () => {
        if (state.ui.accountModalOpen) {
          closeModal('gd-account-modal');
        } else {
          openModal('gd-account-modal');
        }
      });
    }

    if (elements.cartToggle) {
      elements.cartToggle.addEventListener('click', () => {
        if (state.ui.cartModalOpen) {
          closeModal('gd-cart-modal');
        } else {
          openModal('gd-cart-modal');
        }
      });
    }

    if (elements.accountToggleMobile) {
      elements.accountToggleMobile.addEventListener('click', () => {
        if (state.ui.accountModalOpen) {
          closeModal('gd-account-modal');
        } else {
          openModal('gd-account-modal');
        }
      });
    }

    if (elements.cartToggleMobile) {
      elements.cartToggleMobile.addEventListener('click', () => {
        if (state.ui.cartModalOpen) {
          closeModal('gd-cart-modal');
        } else {
          openModal('gd-cart-modal');
        }
      });
    }

    // Fermeture des modales
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gd-modal-overlay')) {
        if (e.target.id === 'gd-account-modal') closeModal('gd-account-modal');
        if (e.target.id === 'gd-cart-modal') closeModal('gd-cart-modal');
      }

      // Amélioration : utiliser closest() pour gérer les clics sur le SVG à l'intérieur du bouton
      const closeButton = e.target.closest('.gd-modal-close');
      if (closeButton) {
        e.preventDefault();
        e.stopPropagation();
        const modalType = closeButton.dataset.modal;
        if (modalType === 'account') closeModal('gd-account-modal');
        if (modalType === 'cart') closeModal('gd-cart-modal');
      }
    });

    // Onglets compte
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gd-account-tab')) {
        const tabName = e.target.dataset.tab;
        if (tabName) switchAccountTab(tabName);
      }
    });

    // Navigation clavier pour l'accessibilité
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  /**
   * Cache les éléments DOM
   */
  function cacheElements() {
    elements.accountToggle = document.getElementById('gd-account-toggle');
    elements.cartToggle = document.getElementById('gd-cart-toggle');
    elements.accountToggleMobile = document.getElementById('gd-account-toggle-mobile');
    elements.cartToggleMobile = document.getElementById('gd-cart-toggle-mobile');
    elements.cartBadge = document.getElementById('gd-cart-count');
    elements.cartBadgeMobile = document.querySelector('.gd-cart-badge-mobile');
  }

  /**
   * Initialise le système e-commerce
   */
  function init() {
    if (state.initialized) return;

    logger.info('🏰 Initialisation du système e-commerce Geek & Dragon');

    // Éviter le FOUC
    elements.body.classList.add('gd-preload');

    // Cache des éléments DOM
    cacheElements();

    // Chargement du panier
    loadCart();

    // Pré-chargement des données produits
    loadProductsData().catch(logger.error);

    // Création des modales
    createModals();

    // Attachement des événements
    attachEventListeners();

    // Mise à jour de l'interface
    updateCartDisplay();

    // Retirer la classe preload après initialisation
    requestAnimationFrame(() => {
      elements.body.classList.remove('gd-preload');
    });

    state.initialized = true;
    logger.info('✅ Système e-commerce initialisé avec succès');
  }

  /**
   * Passer à l'étape suivante du checkout
   */
  async function nextCheckoutStep() {
    if (checkoutState.step === 1) {
      // Valider les adresses
      if (!validateAddresses()) {
        return;
      }

      // Charger les options de livraison
      checkoutState.step = 2;
      renderCheckoutStep();
      await loadShippingRates();
      // Réactualiser l'étape pour afficher les tarifs obtenus
      renderCheckoutStep();
    } else if (checkoutState.step === 2) {
      // Valider la méthode de livraison
      if (!checkoutState.shipping.method) {
        showNotification('Veuillez sélectionner une méthode de livraison', 'warning');
        return;
      }

      // Calculer les taxes
      await calculateTaxes();
      checkoutState.step = 3;
      renderCheckoutStep();
    }
  }

  /**
   * Revenir à l'étape précédente
   */
  function previousCheckoutStep() {
    if (checkoutState.step > 1) {
      checkoutState.step -= 1;
      renderCheckoutStep();
    }
  }

  /**
   * Valider les adresses
   */
  function validateAddresses() {
    const billingRequired = ['firstname', 'lastname', 'email', 'address1', 'city', 'province', 'postalcode', 'country'];

    const missingBilling = billingRequired.find((field) => !checkoutState.addresses.billing[field]);
    if (missingBilling) {
      showNotification(`Le champ "${missingBilling}" de l'adresse de facturation est requis`, 'error');
      return false;
    }

    if (!checkoutState.addresses.sameAsbilling) {
      const shippingRequired = ['firstname', 'lastname', 'address1', 'city', 'province', 'postalcode', 'country'];

      const missingShipping = shippingRequired.find(
        (field) => !checkoutState.addresses.shipping[field],
      );
      if (missingShipping) {
        showNotification(`Le champ "${missingShipping}" de l'adresse de livraison est requis`, 'error');
        return false;
      }
    }

    return true;
  }

  /**
   * Charger les tarifs de livraison depuis Snipcart
  */
  async function loadShippingRates() {
    const previousRates = JSON.stringify(checkoutState.shipping.rates);

    try {
      const shippingAddress = checkoutState.addresses.sameAsbilling
        ? checkoutState.addresses.billing
        : checkoutState.addresses.shipping;

      const payload = {
        eventName: 'shippingrates.fetch',
        content: {
          token: `checkout-token-${Date.now()}`,
          shippingAddress: {
            country: shippingAddress.country,
            province: shippingAddress.province,
            postalCode: shippingAddress.postalcode,
            city: shippingAddress.city,
          },
          items: state.cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            weight: item.weight || 100,
          })),
        },
      };

      const response = await fetch('/gd-ecommerce-native/public/index.php/snipcart/shipping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const newRates = data.rates || [];
        checkoutState.shipping.rates = newRates;
        logger.info('Tarifs de livraison reçus:', data);
        if (JSON.stringify(newRates) !== previousRates) {
          renderCheckoutStep();
        }
      } else {
        throw new Error('Erreur lors du chargement des tarifs de livraison');
      }
    } catch (error) {
      logger.error('Erreur lors du chargement des tarifs:', error);
      // Fallback avec tarifs par défaut
      const fallbackRates = [
        {
          cost: 0,
          description: 'Livraison gratuite (Québec)',
          guaranteedDaysToDelivery: 5,
          method: 'free_shipping',
        },
        {
          cost: 1500,
          description: 'Livraison standard',
          guaranteedDaysToDelivery: 3,
          method: 'standard',
        },
      ];
      checkoutState.shipping.rates = fallbackRates;
      if (JSON.stringify(fallbackRates) !== previousRates) {
        renderCheckoutStep();
      }
    }
  }

  /**
   * Calculer les taxes
   */
  async function calculateTaxes() {
    try {
      const shippingAddress = checkoutState.addresses.sameAsbilling
        ? checkoutState.addresses.billing
        : checkoutState.addresses.shipping;

      const payload = {
        eventName: 'taxes.calculate',
        content: {
          token: `checkout-token-${Date.now()}`,
          shippingAddress: {
            country: shippingAddress.country,
            province: shippingAddress.province,
          },
          items: state.cart.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      };

      const response = await fetch('/gd-ecommerce-native/public/index.php/snipcart/taxes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        checkoutState.taxes.amount = data.taxes?.reduce((sum, tax) => sum + tax.amount, 0) || 0;
        checkoutState.taxes.details = data.taxes || [];
        logger.info('Taxes calculées:', data);
      } else {
        throw new Error('Erreur lors du calcul des taxes');
      }
    } catch (error) {
      logger.error('Erreur lors du calcul des taxes:', error);
      // Fallback avec calcul de taxes par défaut pour le Québec
      const province = checkoutState.addresses.shipping.province
        || checkoutState.addresses.billing.province;
      if (province === 'QC') {
        const subtotal = state.cart.total;
        const tps = subtotal * 0.05;
        const tvq = subtotal * 0.09975;
        checkoutState.taxes.amount = tps + tvq;
        checkoutState.taxes.details = [
          { name: 'TPS', rate: 0.05, amount: tps },
          { name: 'TVQ', rate: 0.09975, amount: tvq },
        ];
      }
    }
  }

  /**
   * Rendre l'étape de livraison
   */
  function renderShippingStep(container) {
    const shippingRatesHtml = checkoutState.shipping.rates.map((rate) => `
      <label class="gd-shipping-option">
        <input type="radio" name="shipping-method" value="${rate.method}" 
               ${checkoutState.shipping.method === rate.method ? 'checked' : ''}
               onchange="GDEcommerce.selectShippingMethod('${rate.method}', ${rate.cost})">
        <div class="gd-shipping-option-content">
          <div class="gd-shipping-option-header">
            <span class="gd-shipping-option-name">🚚 ${escapeHtml(rate.description)}</span>
            <span class="gd-shipping-option-price">${rate.cost > 0 ? formatPrice(rate.cost / 100) : 'Gratuit'}</span>
          </div>
          <div class="gd-shipping-option-details">
            ${rate.guaranteedDaysToDelivery ? `Livraison en ${rate.guaranteedDaysToDelivery} jour(s)` : 'Délai variable'}
          </div>
        </div>
      </label>
    `).join('');

    container.innerHTML = `
      <div class="gd-checkout-step">
        <h3 class="gd-step-title">🚚 Méthode de Livraison</h3>
        
        <div class="gd-shipping-address-preview">
          <h4>Adresse de livraison :</h4>
          <div class="gd-address-preview">
            ${checkoutState.addresses.shipping.firstname} ${checkoutState.addresses.shipping.lastname}<br>
            ${checkoutState.addresses.shipping.address1}<br>
            ${checkoutState.addresses.shipping.address2 ? `${checkoutState.addresses.shipping.address2}<br>` : ''}
            ${checkoutState.addresses.shipping.city}, ${checkoutState.addresses.shipping.province} ${checkoutState.addresses.shipping.postalcode}<br>
            ${checkoutState.addresses.shipping.country === 'CA' ? 'Canada' : 'États-Unis'}
          </div>
        </div>

        <div class="gd-shipping-options">
          <h4>Choisissez votre méthode de livraison :</h4>
          ${shippingRatesHtml}
        </div>

        <div class="gd-step-actions">
          <button class="gd-btn gd-btn-outline" onclick="GDEcommerce.previousCheckoutStep()">
            ⬅️ Retour
          </button>
          <button class="gd-btn gd-btn-primary" onclick="GDEcommerce.nextCheckoutStep()">
            Continuer ➡️
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Sélectionner une méthode de livraison
   */
  function selectShippingMethod(method, cost) {
    checkoutState.shipping.method = method;
    checkoutState.shipping.cost = cost / 100;

    const summaryContent = document.getElementById('gd-checkout-summary');
    if (summaryContent) {
      renderOrderSummary(summaryContent);
    }

    logger.info('Méthode de livraison sélectionnée:', { method, cost });
  }

  /**
   * Rendre l'étape de paiement
   */
  function renderPaymentStep(container) {
    const total = state.cart.total + checkoutState.shipping.cost + checkoutState.taxes.amount;

    container.innerHTML = `
      <div class="gd-checkout-step">
        <h3 class="gd-step-title">💳 Paiement</h3>
        
        <div class="gd-payment-section">
          <div class="gd-payment-form">
            <h4>💳 Informations de paiement</h4>
            
            <form class="gd-credit-card-form" id="payment-form">
              <div class="gd-form-group">
                <label for="card-number">Numéro de carte *</label>
                <input type="text" id="card-number" name="cardNumber" required 
                       placeholder="1234 5678 9012 3456" 
                       maxlength="19"
                       oninput="GDEcommerce.formatCardNumber(this)">
              </div>
              
              <div class="gd-form-row">
                <div class="gd-form-group">
                  <label for="card-expiry">Date d'expiration *</label>
                  <input type="text" id="card-expiry" name="cardExpiry" required 
                         placeholder="MM/AA" 
                         maxlength="5"
                         oninput="GDEcommerce.formatCardExpiry(this)">
                </div>
                <div class="gd-form-group">
                  <label for="card-cvc">Code CVC *</label>
                  <input type="text" id="card-cvc" name="cardCvc" required 
                         placeholder="123" 
                         maxlength="4"
                         oninput="GDEcommerce.formatCardCvc(this)">
                </div>
              </div>
              
              <div class="gd-form-group">
                <label for="card-name">Nom sur la carte *</label>
                <input type="text" id="card-name" name="cardName" required 
                       placeholder="NOM PRÉNOM"
                       value="${checkoutState.addresses.billing.firstname} ${checkoutState.addresses.billing.lastname}"
                       style="text-transform: uppercase;">
              </div>

              <div class="gd-payment-security">
                <div class="gd-security-badges">
                  <span class="gd-security-badge">🔒 Sécurisé SSL</span>
                  <span class="gd-security-badge">🛡️ Stripe</span>
                  <span class="gd-security-badge">🔐 3D Secure</span>
                </div>
                <p class="gd-security-text">
                  Vos informations de paiement sont sécurisées et chiffrées.
                </p>
              </div>
            </form>
          </div>
        </div>

        <div class="gd-step-actions">
          <button class="gd-btn gd-btn-outline" onclick="GDEcommerce.previousCheckoutStep()">
            ⬅️ Retour
          </button>
          <button class="gd-btn gd-btn-primary gd-btn-large" 
                  onclick="GDEcommerce.processPayment()" 
                  id="pay-button">
            ⚔️ Payer ${formatPrice(total)} 💰
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Formater le numéro de carte
   */
  function formatCardNumber(input) {
    const value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const match = value.match(/\d{4,16}/g);
    const parts = [];

    if (match) {
      for (let i = 0, len = match[0].length; i < len; i += 4) {
        parts.push(match[0].substring(i, i + 4));
      }
    }

    input.value = parts.length ? parts.join(' ') : value;
  }

  /**
   * Formater la date d'expiration
   */
  function formatCardExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    input.value = value;
  }

  /**
   * Formater le code CVC
   */
  function formatCardCvc(input) {
    input.value = input.value.replace(/\D/g, '');
  }

  /**
   * Traiter le paiement
   */
  async function processPayment() {
    const payButton = document.getElementById('pay-button');
    if (!payButton) return;

    const form = document.getElementById('payment-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const total = state.cart.total + checkoutState.shipping.cost + checkoutState.taxes.amount;

    payButton.disabled = true;
    payButton.innerHTML = '⏳ Traitement en cours...';
    checkoutState.payment.processing = true;

    try {
      const invoice = {
        amount: total,
        currency: CONFIG.currency.toLowerCase(),
        number: `GD-${Date.now()}`,
        email: checkoutState.addresses.billing.email,
      };

      // paymentMethodId should come from Stripe.js integration in production
      const payload = {
        invoice,
        paymentMethodId: 'pm_card_visa',
      };

      const response = await fetch(
        '/gd-ecommerce-native/public/index.php/snipcart/payment/authorize',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success') {
        if (data.instructions && data.instructions.toLowerCase().includes('capture')) {
          await fetch('/gd-ecommerce-native/public/index.php/snipcart/payment/capture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: data.transactionId }),
          });
        }

        logger.info('Paiement traité avec succès', data);
        clearCart();
        window.location.href = '/merci.php';
      } else if (data.status === 'requires_action') {
        showNotification(data.instructions || 'Authentification requise.', 'error');
        payButton.disabled = false;
        payButton.innerHTML = `⚔️ Payer ${formatPrice(total)} 💰`;
      } else {
        const message = data.instructions || 'Erreur lors du traitement du paiement. Veuillez réessayer.';
        logger.error('Paiement refusé', data);
        showNotification(message, 'error');
        payButton.disabled = false;
        payButton.innerHTML = `⚔️ Payer ${formatPrice(total)} 💰`;
      }
    } catch (error) {
      logger.error('Erreur lors du paiement:', error);
      showNotification('Erreur lors du traitement du paiement. Veuillez réessayer.', 'error');

      payButton.disabled = false;
      payButton.innerHTML = `⚔️ Payer ${formatPrice(total)} 💰`;
    }

    checkoutState.payment.processing = false;
  }

  /**
   * Afficher la confirmation de commande
   */
  function showOrderConfirmation() {
    const modal = document.getElementById('gd-checkout-modal');
    if (!modal) return;

    const content = modal.querySelector('.gd-checkout-content');
    content.innerHTML = `
      <div class="gd-order-confirmation">
        <div class="gd-confirmation-header">
          <div class="gd-confirmation-icon">🎉</div>
          <h2 class="gd-confirmation-title">Commande Confirmée !</h2>
          <p class="gd-confirmation-subtitle">Merci pour votre achat, noble aventurier !</p>
        </div>
        
        <div class="gd-confirmation-details">
          <div class="gd-confirmation-section">
            <h3>📧 Confirmation par courriel</h3>
            <p>Un courriel de confirmation a été envoyé à :</p>
            <strong>${checkoutState.addresses.billing.email}</strong>
          </div>
          
          <div class="gd-confirmation-section">
            <h3>🚚 Livraison</h3>
            <p>Votre commande sera livrée à :</p>
            <div class="gd-delivery-address">
              ${checkoutState.addresses.shipping.firstname} ${checkoutState.addresses.shipping.lastname}<br>
              ${checkoutState.addresses.shipping.address1}<br>
              ${checkoutState.addresses.shipping.city}, ${checkoutState.addresses.shipping.province}
            </div>
          </div>
        </div>
        
        <div class="gd-confirmation-actions">
          <button class="gd-btn gd-btn-primary" onclick="GDEcommerce.closeCheckout()">
            🏰 Retour à la Boutique
          </button>
        </div>
      </div>
    `;
  }

  // ========================================================================
  // API PUBLIQUE
  // ========================================================================

  // Exposition de l'API publique
  window.GDEcommerce = {
    // Gestion du panier
    addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateItemQuantity,
    updateVariant,
    clearCart,

    // Contrôle des modales
    openAccountModal: () => openModal('gd-account-modal'),
    openCartModal: () => openModal('gd-cart-modal'),
    closeAccountModal: () => closeModal('gd-account-modal'),
    closeCartModal: () => closeModal('gd-cart-modal'),

    // Utilitaires
    getCart: () => ({ ...state.cart }),
    getCartCount: () => state.cart.count,
    getCartTotal: () => state.cart.total,

    // Checkout
    showCheckout,
    closeCheckout,
    nextCheckoutStep,
    previousCheckoutStep,
    toggleShippingAddress,
    selectShippingMethod,
    formatCardNumber,
    formatCardExpiry,
    formatCardCvc,
    processPayment,

    // État de l'interface
    isAccountModalOpen: () => state.ui.accountModalOpen,
    isCartModalOpen: () => state.ui.cartModalOpen,
  };

  // ========================================================================
  // INITIALISATION
  // ========================================================================

  // Initialisation selon l'état de chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM déjà chargé
    init();
  }

  // Réinitialisation si nécessaire après chargement complet
  window.addEventListener('load', () => {
    if (!state.initialized) {
      logger.warn('Réinitialisation du système e-commerce');
      init();
    }
  });
}());

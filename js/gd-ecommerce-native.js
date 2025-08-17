// ========================================================================
// GEEK & DRAGON - E-COMMERCE NATIF MODERNE
// Système Web-first, léger et performant
// Architecture en îlots avec hydratation partielle
// ========================================================================

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
            ...parsedCart
          };
          calculateCartTotals();
          return true;
        }
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du panier:', error);
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
      console.warn('Erreur lors de la sauvegarde du panier:', error);
    }
  }, CONFIG.debounceDelay);

  // ========================================================================
  // GESTION DU PANIER
  // ========================================================================

  /**
   * Calcule les totaux du panier
   */
  function calculateCartTotals() {
    state.cart.count = state.cart.items.reduce((total, item) => total + item.quantity, 0);
    state.cart.total = state.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Ajoute un article au panier
   */
  function addToCart(productData) {
    // Validation des données
    if (!productData.id || !productData.name || !productData.price) {
      console.warn('Données produit invalides:', productData);
      return false;
    }

    const existingItemIndex = state.cart.items.findIndex(item => 
      item.id === productData.id && 
      JSON.stringify(item.variants) === JSON.stringify(productData.variants)
    );

    if (existingItemIndex !== -1) {
      // Article existant - mettre à jour la quantité
      state.cart.items[existingItemIndex].quantity += (productData.quantity || 1);
    } else {
      // Nouvel article
      const newItem = {
        id: productData.id,
        name: escapeHtml(productData.name),
        price: parseFloat(productData.price),
        quantity: productData.quantity || 1,
        image: productData.image || '',
        url: productData.url || '',
        variants: productData.variants || {},
        addedAt: Date.now()
      };
      
      state.cart.items.push(newItem);
    }

    calculateCartTotals();
    saveCart();
    updateCartDisplay();
    
    // Feedback utilisateur
    announceToScreenReader(`${productData.name} ajouté au panier`);
    animateCartButton();
    
    console.log('Article ajouté au panier:', productData.name);
    return true;
  }

  /**
   * Met à jour la quantité d'un article
   */
  function updateItemQuantity(itemId, variants, newQuantity) {
    const itemIndex = state.cart.items.findIndex(item => 
      item.id === itemId && 
      JSON.stringify(item.variants) === JSON.stringify(variants)
    );

    if (itemIndex === -1) return false;

    if (newQuantity <= 0) {
      removeFromCart(itemId, variants);
    } else if (newQuantity <= CONFIG.maxItems) {
      state.cart.items[itemIndex].quantity = newQuantity;
      calculateCartTotals();
      saveCart();
      updateCartDisplay();
      updateCartModal();
    }

    return true;
  }

  /**
   * Supprime un article du panier
   */
  function removeFromCart(itemId, variants = {}) {
    const itemIndex = state.cart.items.findIndex(item => 
      item.id === itemId && 
      JSON.stringify(item.variants) === JSON.stringify(variants)
    );

    if (itemIndex !== -1) {
      const removedItem = state.cart.items.splice(itemIndex, 1)[0];
      calculateCartTotals();
      saveCart();
      updateCartDisplay();
      updateCartModal();
      
      announceToScreenReader(`${removedItem.name} retiré du panier`);
      console.log('Article retiré du panier:', removedItem.name);
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
    updateCartModal();
    
    announceToScreenReader('Panier vidé');
    console.log('Panier vidé');
  }

  // ========================================================================
  // INTERFACE UTILISATEUR
  // ========================================================================

  /**
   * Met à jour l'affichage du panier dans le header
   */
  function updateCartDisplay() {
    const badges = [elements.cartBadge, elements.cartBadgeMobile].filter(Boolean);
    
    badges.forEach(badge => {
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
    
    buttons.forEach(button => {
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
  function updateCartModal() {
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

    const itemsHtml = state.cart.items.map(item => {
      const variantsHtml = Object.keys(item.variants).length > 0 
        ? Object.entries(item.variants).map(([key, value]) => 
            `<span class="gd-cart-item-variant">${escapeHtml(key)}: ${escapeHtml(value)}</span>`
          ).join('')
        : '';

      return `
        <div class="gd-cart-item" data-item-id="${escapeHtml(item.id)}">
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
    }).join('');

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
        <button class="gd-btn gd-btn-primary gd-btn-full" onclick="GDEcommerce.proceedToCheckout()">
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
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Préparation de la modal
    if (modalId === 'gd-cart-modal') {
      updateCartModal();
      state.ui.cartModalOpen = true;
    } else if (modalId === 'gd-account-modal') {
      state.ui.accountModalOpen = true;
    }

    // Gestion de l'accessibilité
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    elements.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
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
    } else if (modalId === 'gd-account-modal') {
      state.ui.accountModalOpen = false;
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

    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    contents.forEach(content => {
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
   * Gère l'ajout au panier depuis les boutons existants
   */
  function handleAddToCartClick(event) {
    // Chercher le bouton d'ajout au panier le plus proche
    const button = event.target.closest('[data-item-id]');
    if (!button) return;

    event.preventDefault();

    // Extraire les données du produit
    const productData = {
      id: button.dataset.itemId,
      name: button.dataset.itemName || button.dataset.itemNameFr,
      price: parseFloat(button.dataset.itemPrice),
      quantity: parseInt(button.dataset.itemQuantity) || 1,
      image: extractProductImage(button),
      url: button.dataset.itemUrl || window.location.href,
      variants: extractProductVariants(button)
    };

    if (addToCart(productData)) {
      // Feedback visuel
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  }

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
   * Extrait les variantes du produit
   */
  function extractProductVariants(button) {
    const variants = {};
    
    // Récupérer les sélecteurs de variantes proches
    const container = button.closest('.card, .product-panel, .product-info');
    if (container) {
      // Multiplicateurs
      const multiplierSelect = container.querySelector('select[id^="multiplier-"]');
      if (multiplierSelect && multiplierSelect.value !== '1') {
        variants.Multiplicateur = multiplierSelect.value;
      }

      // Langues
      const languageSelect = container.querySelector('select[data-type="language"]');
      if (languageSelect) {
        variants.Langue = languageSelect.options[languageSelect.selectedIndex].text;
      }

      // Autres variantes depuis les data attributes
      if (button.dataset.itemCustom1Name && button.dataset.itemCustom1Value) {
        variants[button.dataset.itemCustom1Name] = button.dataset.itemCustom1Value;
      }
    }

    return variants;
  }

  // ========================================================================
  // CHECKOUT ET PAIEMENT
  // ========================================================================

  /**
   * Procède au checkout
   */
  function proceedToCheckout() {
    if (state.cart.items.length === 0) {
      announceToScreenReader('Le panier est vide');
      return;
    }

    // Pour l'instant, on redirige vers une page de checkout
    // À terme, on pourrait intégrer Stripe ou un autre processeur de paiement
    console.log('Redirection vers le checkout avec:', state.cart);
    
    // Exemple de redirection
    const checkoutData = encodeURIComponent(JSON.stringify(state.cart));
    window.location.href = `/checkout.php?data=${checkoutData}`;
  }

  // ========================================================================
  // ÉVÉNEMENTS ET INITIALISATION
  // ========================================================================

  /**
   * Attache tous les événements
   */
  function attachEventListeners() {
    // Boutons header
    if (elements.accountToggle) {
      elements.accountToggle.addEventListener('click', () => openModal('gd-account-modal'));
    }
    
    if (elements.cartToggle) {
      elements.cartToggle.addEventListener('click', () => openModal('gd-cart-modal'));
    }

    if (elements.accountToggleMobile) {
      elements.accountToggleMobile.addEventListener('click', () => openModal('gd-account-modal'));
    }
    
    if (elements.cartToggleMobile) {
      elements.cartToggleMobile.addEventListener('click', () => openModal('gd-cart-modal'));
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

    // Ajout au panier (délégation d'événements)
    document.addEventListener('click', (e) => {
      if (e.target.closest('.snipcart-add-item, [data-item-id]')) {
        handleAddToCartClick(e);
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

    console.log('🏰 Initialisation du système e-commerce Geek & Dragon');

    // Éviter le FOUC
    elements.body.classList.add('gd-preload');
    
    // Cache des éléments DOM
    cacheElements();
    
    // Chargement du panier
    loadCart();
    
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
    console.log('✅ Système e-commerce initialisé avec succès');
  }

  // ========================================================================
  // API PUBLIQUE
  // ========================================================================

  // Exposition de l'API publique
  window.GDEcommerce = {
    // Gestion du panier
    addToCart: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearCart,
    
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
    proceedToCheckout: proceedToCheckout,
    
    // État de l'interface
    isAccountModalOpen: () => state.ui.accountModalOpen,
    isCartModalOpen: () => state.ui.cartModalOpen
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
      console.warn('Réinitialisation du système e-commerce');
      init();
    }
  });

}());

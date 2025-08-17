// ========================================================================
// GEEK & DRAGON - SYSTÈME E-COMMERCE MODERNE
// Gestion compte et panier avec style médiéval fantasy
// ========================================================================

(function() {
  'use strict';

  // Configuration
  const config = {
    storageKey: 'gd_cart',
    animations: true,
    autoSave: true
  };

  // État global
  let cart = {
    items: [],
    total: 0,
    count: 0
  };

  let isAccountModalOpen = false;
  let isCartModalOpen = false;

  // ========================================================================
  // INITIALISATION
  // ========================================================================

  function init() {
    console.log('🏰 Initialisation du système e-commerce Geek & Dragon');
    
    loadCart();
    createModals();
    attachEventListeners();
    updateCartDisplay();
    
    // Intégration avec Snipcart si disponible
    if (window.Snipcart) {
      initSnipcartIntegration();
    } else {
      // Fallback vers système interne
      initInternalCart();
    }
  }

  // ========================================================================
  // GESTION DU PANIER
  // ========================================================================

  function loadCart() {
    try {
      const savedCart = localStorage.getItem(config.storageKey);
      if (savedCart) {
        cart = JSON.parse(savedCart);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du panier:', error);
      cart = { items: [], total: 0, count: 0 };
    }
  }

  function saveCart() {
    if (config.autoSave) {
      try {
        localStorage.setItem(config.storageKey, JSON.stringify(cart));
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde du panier:', error);
      }
    }
  }

  function addToCart(item) {
    const existingItem = cart.items.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity || 1;
    } else {
      cart.items.push({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity || 1,
        image: item.image || '',
        url: item.url || ''
      });
    }
    
    updateCartTotals();
    saveCart();
    updateCartDisplay();
    
    // Animation d'ajout
    if (config.animations) {
      animateCartAdd();
    }
    
    console.log('✅ Produit ajouté au panier:', item.name);
  }

  function removeFromCart(itemId) {
    cart.items = cart.items.filter(item => item.id !== itemId);
    updateCartTotals();
    saveCart();
    updateCartDisplay();
    updateCartModal();
    
    console.log('🗑️ Produit retiré du panier:', itemId);
  }

  function updateItemQuantity(itemId, newQuantity) {
    const item = cart.items.find(cartItem => cartItem.id === itemId);
    if (item && newQuantity > 0) {
      item.quantity = newQuantity;
      updateCartTotals();
      saveCart();
      updateCartDisplay();
      updateCartModal();
    } else if (newQuantity <= 0) {
      removeFromCart(itemId);
    }
  }

  function updateCartTotals() {
    cart.count = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.total = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  function clearCart() {
    cart = { items: [], total: 0, count: 0 };
    saveCart();
    updateCartDisplay();
    updateCartModal();
    
    console.log('🧹 Panier vidé');
  }

  // ========================================================================
  // AFFICHAGE DU PANIER
  // ========================================================================

  function updateCartDisplay() {
    const countElements = document.querySelectorAll('.gd-cart-count');
    countElements.forEach(element => {
      element.textContent = cart.count;
      element.style.display = cart.count > 0 ? 'flex' : 'none';
    });
  }

  function animateCartAdd() {
    const cartBtn = document.getElementById('gd-cart-btn');
    if (cartBtn) {
      cartBtn.style.transform = 'scale(1.2)';
      setTimeout(() => {
        cartBtn.style.transform = 'scale(1)';
      }, 200);
    }
  }

  // ========================================================================
  // MODALES
  // ========================================================================

  function createModals() {
    createAccountModal();
    createCartModal();
  }

  function createAccountModal() {
    const accountModal = document.createElement('div');
    accountModal.id = 'gd-account-modal';
    accountModal.className = 'gd-modal-overlay';
    accountModal.innerHTML = `
      <div class="gd-modal">
        <div class="gd-modal-header">
          <h2 class="gd-modal-title">⚔️ Mon Compte</h2>
          <button class="gd-modal-close" aria-label="Fermer">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="gd-modal-body">
          <div class="gd-account-section">
            <div class="gd-account-welcome">
              <h2>🏰 Bienvenue, Aventurier !</h2>
              <p>Gérez votre profil et vos commandes dans cette section</p>
            </div>
            
            <div class="gd-account-tabs">
              <button class="gd-account-tab active" data-tab="profile">🛡️ Profil</button>
              <button class="gd-account-tab" data-tab="orders">📜 Commandes</button>
              <button class="gd-account-tab" data-tab="settings">⚙️ Paramètres</button>
            </div>
            
            <div class="gd-account-content">
              <div class="gd-tab-content active" data-tab-content="profile">
                <div class="gd-form-group">
                  <label class="gd-form-label">Nom d'aventurier</label>
                  <input type="text" class="gd-form-input" placeholder="Votre nom complet">
                </div>
                <div class="gd-form-group">
                  <label class="gd-form-label">Adresse de messagerie</label>
                  <input type="email" class="gd-form-input" placeholder="votre@email.com">
                </div>
                <div class="gd-form-group">
                  <label class="gd-form-label">Classe d'aventurier</label>
                  <select class="gd-form-input">
                    <option>Guerrier</option>
                    <option>Mage</option>
                    <option>Rôdeur</option>
                    <option>Clerc</option>
                    <option>Voleur</option>
                  </select>
                </div>
                <button class="gd-btn gd-btn-primary gd-btn-full">💾 Sauvegarder le Profil</button>
              </div>
              
              <div class="gd-tab-content" data-tab-content="orders">
                <div style="text-align: center; padding: 2rem; color: var(--gd-text-secondary);">
                  📜 Vos quêtes précédentes apparaîtront ici
                </div>
              </div>
              
              <div class="gd-tab-content" data-tab-content="settings">
                <div class="gd-form-group">
                  <label class="gd-form-label">Notifications par corbeau</label>
                  <select class="gd-form-input">
                    <option>Toutes les notifications</option>
                    <option>Commandes uniquement</option>
                    <option>Aucune notification</option>
                  </select>
                </div>
                <div class="gd-form-group">
                  <label class="gd-form-label">Langue préférée</label>
                  <select class="gd-form-input">
                    <option>Français</option>
                    <option>Common (English)</option>
                  </select>
                </div>
                <button class="gd-btn gd-btn-secondary gd-btn-full">⚙️ Sauvegarder les Paramètres</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(accountModal);
  }

  function createCartModal() {
    const cartModal = document.createElement('div');
    cartModal.id = 'gd-cart-modal';
    cartModal.className = 'gd-modal-overlay';
    cartModal.innerHTML = `
      <div class="gd-modal">
        <div class="gd-modal-header">
          <h2 class="gd-modal-title">🛒 Sac d'Aventurier</h2>
          <button class="gd-modal-close" aria-label="Fermer">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="gd-modal-body">
          <div class="gd-cart-section">
            <div id="gd-cart-content">
              <!-- Le contenu sera généré dynamiquement -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(cartModal);
    updateCartModal();
  }

  function updateCartModal() {
    const cartContent = document.getElementById('gd-cart-content');
    if (!cartContent) return;

    if (cart.items.length === 0) {
      cartContent.innerHTML = `
        <div class="gd-cart-empty">
          <svg class="gd-cart-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <h3>🎒 Sac Vide</h3>
          <p>Votre sac d'aventurier est vide. Ajoutez des objets pour commencer votre quête !</p>
          <button class="gd-btn gd-btn-primary" onclick="gdEcommerce.closeCartModal()">
            🛒 Continuer les Achats
          </button>
        </div>
      `;
      return;
    }

    const itemsHtml = cart.items.map(item => `
      <div class="gd-cart-item" data-item-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="gd-cart-item-image" loading="lazy">
        <div class="gd-cart-item-details">
          <div class="gd-cart-item-name">${item.name}</div>
          <div class="gd-cart-item-price">${item.price.toFixed(2)} $ CA</div>
          <div class="gd-cart-item-controls">
            <button class="gd-qty-btn" onclick="gdEcommerce.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
            <span class="gd-qty-value">${item.quantity}</span>
            <button class="gd-qty-btn" onclick="gdEcommerce.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
        </div>
        <button class="gd-cart-item-remove" onclick="gdEcommerce.removeItem('${item.id}')" title="Retirer l'objet">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    `).join('');

    cartContent.innerHTML = `
      <div class="gd-cart-items">
        ${itemsHtml}
      </div>
      <div class="gd-cart-summary">
        <div class="gd-cart-summary-row">
          <span class="gd-cart-summary-label">Articles (${cart.count})</span>
          <span class="gd-cart-summary-value">${cart.total.toFixed(2)} $ CA</span>
        </div>
        <div class="gd-cart-summary-row">
          <span class="gd-cart-summary-label">Livraison</span>
          <span class="gd-cart-summary-value">Calculée à l'étape suivante</span>
        </div>
        <div class="gd-cart-summary-row">
          <span class="gd-cart-summary-label gd-cart-total">Total</span>
          <span class="gd-cart-summary-value gd-cart-total">${cart.total.toFixed(2)} $ CA</span>
        </div>
      </div>
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="gd-btn gd-btn-outline" onclick="gdEcommerce.closeCartModal()">
          🛒 Continuer les Achats
        </button>
        <button class="gd-btn gd-btn-primary gd-btn-full" onclick="gdEcommerce.proceedToCheckout()">
          ⚔️ Finaliser la Commande
        </button>
      </div>
      <div style="text-align: center; margin-top: 1rem;">
        <button class="gd-btn gd-btn-outline" onclick="gdEcommerce.clearCart()" style="color: var(--gd-error); border-color: var(--gd-error);">
          🧹 Vider le Sac
        </button>
      </div>
    `;
  }

  // ========================================================================
  // ÉVÉNEMENTS
  // ========================================================================

  function attachEventListeners() {
    // Boutons header
    const accountBtns = document.querySelectorAll('#gd-account-btn, #gd-account-btn-mobile');
    const cartBtns = document.querySelectorAll('#gd-cart-btn, #gd-cart-btn-mobile');

    accountBtns.forEach(btn => {
      btn.addEventListener('click', openAccountModal);
    });

    cartBtns.forEach(btn => {
      btn.addEventListener('click', openCartModal);
    });

    // Fermeture des modales
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gd-modal-overlay')) {
        closeAllModals();
      }
      if (e.target.classList.contains('gd-modal-close')) {
        closeAllModals();
      }
    });

    // Échap pour fermer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    // Onglets compte
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gd-account-tab')) {
        switchAccountTab(e.target.dataset.tab);
      }
    });

    // Intégration avec les boutons d'ajout au panier existants
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('snipcart-add-item') || e.target.closest('.snipcart-add-item')) {
        handleAddToCart(e);
      }
    });
  }

  function handleAddToCart(event) {
    const btn = event.target.closest('.snipcart-add-item') || event.target;
    const itemData = {
      id: btn.dataset.itemId,
      name: btn.dataset.itemName || btn.dataset.itemNameFr,
      price: btn.dataset.itemPrice,
      quantity: parseInt(btn.dataset.itemQuantity) || 1,
      image: extractImageFromPage(btn.dataset.itemId),
      url: btn.dataset.itemUrl || window.location.href
    };

    if (itemData.id && itemData.name && itemData.price) {
      addToCart(itemData);
    }
  }

  function extractImageFromPage(itemId) {
    // Essayer de trouver l'image du produit sur la page
    const productImages = document.querySelectorAll('.product-media, .card-product img, .product-card img');
    if (productImages.length > 0) {
      return productImages[0].src;
    }
    return '/images/optimized-modern/webp/brand-geekndragon-main.webp';
  }

  // ========================================================================
  // CONTRÔLE DES MODALES
  // ========================================================================

  function openAccountModal() {
    const modal = document.getElementById('gd-account-modal');
    if (modal) {
      modal.classList.add('active');
      isAccountModalOpen = true;
      document.body.style.overflow = 'hidden';
      
      if (config.animations) {
        modal.querySelector('.gd-modal').classList.add('gd-animate-fade-in-up');
      }
    }
  }

  function openCartModal() {
    const modal = document.getElementById('gd-cart-modal');
    if (modal) {
      updateCartModal();
      modal.classList.add('active');
      isCartModalOpen = true;
      document.body.style.overflow = 'hidden';
      
      if (config.animations) {
        modal.querySelector('.gd-modal').classList.add('gd-animate-slide-in-right');
      }
    }
  }

  function closeAccountModal() {
    const modal = document.getElementById('gd-account-modal');
    if (modal) {
      modal.classList.remove('active');
      isAccountModalOpen = false;
      document.body.style.overflow = '';
    }
  }

  function closeCartModal() {
    const modal = document.getElementById('gd-cart-modal');
    if (modal) {
      modal.classList.remove('active');
      isCartModalOpen = false;
      document.body.style.overflow = '';
    }
  }

  function closeAllModals() {
    closeAccountModal();
    closeCartModal();
  }

  function switchAccountTab(tabName) {
    // Gérer les onglets
    document.querySelectorAll('.gd-account-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.gd-tab-content').forEach(content => {
      content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.querySelector(`[data-tab-content="${tabName}"]`).classList.add('active');
  }

  // ========================================================================
  // INTÉGRATIONS
  // ========================================================================

  function initSnipcartIntegration() {
    console.log('🔗 Intégration avec Snipcart détectée');
    
    // Synchroniser avec Snipcart si disponible
    if (window.Snipcart?.api) {
      window.Snipcart.api.on('cart.ready', () => {
        syncWithSnipcart();
      });
      
      window.Snipcart.api.on('item.added', (item) => {
        console.log('📦 Article ajouté via Snipcart:', item);
        syncWithSnipcart();
      });
    }
  }

  function syncWithSnipcart() {
    if (window.Snipcart?.api?.items) {
      const snipcartItems = window.Snipcart.api.items.all();
      const snipcartCount = window.Snipcart.api.items.count();
      
      // Mettre à jour notre affichage
      const countElements = document.querySelectorAll('.gd-cart-count');
      countElements.forEach(element => {
        element.textContent = snipcartCount;
        element.style.display = snipcartCount > 0 ? 'flex' : 'none';
      });
    }
  }

  function initInternalCart() {
    console.log('🏠 Utilisation du système de panier interne');
    // Le système interne est déjà initialisé
  }

  function proceedToCheckout() {
    if (window.Snipcart?.api) {
      // Rediriger vers Snipcart
      window.Snipcart.api.modal.show();
      closeCartModal();
    } else {
      // Système interne - redirection vers page de commande
      window.location.href = '/checkout.php';
    }
  }

  // ========================================================================
  // API PUBLIQUE
  // ========================================================================

  window.gdEcommerce = {
    // Méthodes publiques
    addToCart: addToCart,
    removeItem: removeFromCart,
    updateQuantity: updateItemQuantity,
    clearCart: clearCart,
    
    // Contrôle des modales
    openAccountModal: openAccountModal,
    openCartModal: openCartModal,
    closeAccountModal: closeAccountModal,
    closeCartModal: closeCartModal,
    
    // Utilitaires
    getCart: () => cart,
    getCartCount: () => cart.count,
    getCartTotal: () => cart.total,
    
    // Checkout
    proceedToCheckout: proceedToCheckout
  };

  // ========================================================================
  // INITIALISATION AU CHARGEMENT
  // ========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
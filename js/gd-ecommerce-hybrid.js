// ========================================================================
// GEEK & DRAGON - SYSTÈME E-COMMERCE HYBRIDE
// Interface DnD médiévale fantasy + Fonctionnalité Snipcart
// ========================================================================

/* eslint-disable no-use-before-define, no-param-reassign */
(function gdEcommerceHybrid() {
  // Classes DnD officielles avec Artificier
  const DND_CLASSES = [
    { value: 'artificer', label: '🔧 Artificier', description: 'Maître des inventions magiques et des objets enchantés' },
    { value: 'barbarian', label: '⚔️ Barbare', description: 'Guerrier sauvage aux instincts primitifs' },
    { value: 'bard', label: '🎵 Barde', description: 'Maître des mots, de la musique et de la magie' },
    { value: 'cleric', label: '⚕️ Clerc', description: 'Champion divin doté de pouvoirs de guérison' },
    { value: 'druid', label: '🌿 Druide', description: 'Gardien de la nature et maître des éléments' },
    { value: 'fighter', label: '🛡️ Guerrier', description: 'Maître des armes et de la tactique militaire' },
    { value: 'monk', label: '👊 Moine', description: 'Ascète maîtrisant l\'art martial et l\'énergie ki' },
    { value: 'paladin', label: '⚖️ Paladin', description: 'Saint guerrier guidé par la justice divine' },
    { value: 'ranger', label: '🏹 Rôdeur', description: 'Chasseur et éclaireur expert de la nature' },
    { value: 'rogue', label: '🗡️ Voleur', description: 'Expert en discrétion, vol et attaques sournoises' },
    { value: 'sorcerer', label: '⚡ Ensorceleur', description: 'Mage inné aux pouvoirs magiques spontanés' },
    { value: 'warlock', label: '👹 Démoniste', description: 'Pratiquant de la magie occulte et des pactes interdits' },
    { value: 'wizard', label: '🔮 Magicien', description: 'Érudit de la magie arcanique et des sortilèges' }
  ];

  // Configuration globale
  const CONFIG = {
    animationDuration: 200,
    debounceDelay: 300
  };

  // État global du système
  const state = {
    ui: {
      accountModalOpen: false,
      cartModalOpen: false,
      currentAccountTab: 'profile'
    },
    initialized: false
  };

  // Cache DOM pour les performances
  const elements = {
    accountToggle: null,
    cartToggle: null,
    accountToggleMobile: null,
    cartToggleMobile: null,
    accountModal: null,
    cartModal: null,
    body: document.body
  };

  // ========================================================================
  // UTILITAIRES
  // ========================================================================

  /**
   * Échappe les caractères HTML pour éviter XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Debounce pour optimiser les performances
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
      if (announcement.parentNode) {
        elements.body.removeChild(announcement);
      }
    }, 1000);
  }

  // ========================================================================
  // EXTRACTION DES VARIANTES SNIPCART
  // ========================================================================

  /**
   * Extrait les variantes d'un item Snipcart
   */
  function extractItemVariants(item) {
    const variants = {};
    
    if (!item) return variants;

    // Gestion des custom fields de Snipcart
    const customFields = item.customFields || item.custom_fields || {};
    
    // Langues
    if (customFields.language || customFields.langue) {
      variants.Langue = customFields.language || customFields.langue;
    }

    // Multiplicateurs
    if (customFields.multiplier || customFields.multiplicateur) {
      const mult = customFields.multiplier || customFields.multiplicateur;
      if (mult && mult !== '1') {
        variants.Multiplicateur = `x${mult}`;
      }
    }

    // Autres champs personnalisés
    Object.keys(customFields).forEach(key => {
      if (!['language', 'langue', 'multiplier', 'multiplicateur'].includes(key.toLowerCase())) {
        if (customFields[key]) {
          variants[key] = customFields[key];
        }
      }
    });

    return variants;
  }

  /**
   * Formate les variantes pour l'affichage
   */
  function formatVariantsForDisplay(variants) {
    if (!variants || Object.keys(variants).length === 0) {
      return '';
    }

    return Object.entries(variants)
      .map(([key, value]) => `<span class="gd-cart-item-variant">${escapeHtml(key)}: ${escapeHtml(value)}</span>`)
      .join('');
  }

  // ========================================================================
  // INTERFACE UTILISATEUR - MODALES
  // ========================================================================

  /**
   * Crée le HTML pour les modales avec thème DnD
   */
  function createModals() {
    // Modal Compte avec classes DnD
    const classOptions = DND_CLASSES.map(cls => 
      `<option value="${cls.value}">${cls.label}</option>`
    ).join('');

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
                        ${classOptions}
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

    // Modal Panier avec intégration Snipcart
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
                <!-- Le contenu sera généré dynamiquement via Snipcart -->
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
   * Met à jour le contenu de la modal panier avec les données Snipcart
   */
  function updateCartModal() {
    const cartContent = document.getElementById('gd-cart-content');
    if (!cartContent) return;

    // Récupérer les données du panier Snipcart
    if (window.Snipcart && window.Snipcart.store) {
      const cart = window.Snipcart.store.getState().cart;
      
      if (!cart.items || cart.items.length === 0) {
        cartContent.innerHTML = `
          <div class="gd-cart-empty">
            <svg class="gd-cart-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h3>🎒 Sac Vide</h3>
            <p>Votre sac d'aventurier est vide. Ajoutez des objets pour commencer votre quête !</p>
            <button class="gd-btn gd-btn-primary" onclick="GDEcommerceHybrid.closeCartModal()">
              🛒 Continuer les Achats
            </button>
          </div>
        `;
        return;
      }

      const itemsHtml = cart.items.map((item) => {
        const variants = extractItemVariants(item);
        const variantsHtml = formatVariantsForDisplay(variants);

        return `
          <div class="gd-cart-item" data-item-id="${escapeHtml(item.id)}">
            <img src="${escapeHtml(item.image || '/images/optimized-modern/webp/brand-geekndragon-main.webp')}" 
                 alt="${escapeHtml(item.name)}" 
                 class="gd-cart-item-image" 
                 loading="lazy">
            <div class="gd-cart-item-details">
              <div class="gd-cart-item-name">${escapeHtml(item.name)}</div>
              ${variantsHtml ? `<div class="gd-cart-item-variants">${variantsHtml}</div>` : ''}
              <div class="gd-cart-item-price">${item.price} ${cart.currency}</div>
              <div class="gd-cart-item-controls">
                <div class="gd-qty-control">
                  <button class="gd-qty-btn" onclick="GDEcommerceHybrid.updateQuantity('${escapeHtml(item.id)}', ${item.quantity - 1})" 
                          ${item.quantity <= 1 ? 'disabled' : ''} 
                          aria-label="Diminuer la quantité">−</button>
                  <span class="gd-qty-value">${item.quantity}</span>
                  <button class="gd-qty-btn" onclick="GDEcommerceHybrid.updateQuantity('${escapeHtml(item.id)}', ${item.quantity + 1})" 
                          aria-label="Augmenter la quantité">+</button>
                </div>
              </div>
            </div>
            <button class="gd-cart-item-remove" 
                    onclick="GDEcommerceHybrid.removeItem('${escapeHtml(item.id)}')" 
                    title="Retirer l'objet" 
                    aria-label="Retirer ${escapeHtml(item.name)}">
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
            <span class="gd-cart-summary-label">Articles (${cart.items.length})</span>
            <span class="gd-cart-summary-value">${cart.subtotal} ${cart.currency}</span>
          </div>
          <div class="gd-cart-summary-row">
            <span class="gd-cart-summary-label">Livraison</span>
            <span class="gd-cart-summary-value">Calculée à l'étape suivante</span>
          </div>
          <div class="gd-cart-summary-row">
            <span class="gd-cart-summary-label gd-cart-total">Total</span>
            <span class="gd-cart-summary-value gd-cart-total">${cart.total} ${cart.currency}</span>
          </div>
        </div>
        <div class="gd-cart-actions">
          <button class="gd-btn gd-btn-outline" onclick="GDEcommerceHybrid.closeCartModal()">
            🛒 Continuer les Achats
          </button>
          <button class="gd-btn gd-btn-primary gd-btn-full" onclick="GDEcommerceHybrid.proceedToCheckout()">
            ⚔️ Finaliser la Commande
          </button>
        </div>
        <div class="gd-cart-secondary-actions">
          <button class="gd-btn gd-btn-danger" onclick="GDEcommerceHybrid.clearCart()">
            🧹 Vider le Sac
          </button>
        </div>
      `;
    }
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
      ? elements.cartToggle || elements.cartToggleMobile
      : elements.accountToggle || elements.accountToggleMobile;

    if (triggerButton) {
      triggerButton.focus();
    }
  }

  // ========================================================================
  // GESTION DES ONGLETS COMPTE
  // ========================================================================

  /**
   * Change d'onglet dans la section compte
   */
  function switchAccountTab(tabName) {
    const tabs = document.querySelectorAll('.gd-account-tab');
    const contents = document.querySelectorAll('.gd-tab-content');

    tabs.forEach((tab) => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    contents.forEach((content) => {
      content.classList.remove('active');
    });

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
  // INTÉGRATION SNIPCART
  // ========================================================================

  /**
   * Met à jour la quantité d'un item via Snipcart
   */
  function updateQuantity(itemId, newQuantity) {
    if (window.Snipcart && window.Snipcart.api) {
      if (newQuantity <= 0) {
        window.Snipcart.api.items.remove(itemId);
      } else {
        window.Snipcart.api.items.update(itemId, { quantity: newQuantity });
      }
      
      // Mettre à jour l'affichage après un court délai
      setTimeout(() => {
        updateCartModal();
        updateCartDisplay();
      }, 100);
    }
  }

  /**
   * Supprime un item du panier via Snipcart
   */
  function removeItem(itemId) {
    if (window.Snipcart && window.Snipcart.api) {
      window.Snipcart.api.items.remove(itemId);
      
      setTimeout(() => {
        updateCartModal();
        updateCartDisplay();
      }, 100);
      
      announceToScreenReader('Article retiré du panier');
    }
  }

  /**
   * Vide le panier via Snipcart
   */
  function clearCart() {
    if (window.Snipcart && window.Snipcart.api) {
      window.Snipcart.api.cart.clear();
      
      setTimeout(() => {
        updateCartModal();
        updateCartDisplay();
      }, 100);
      
      announceToScreenReader('Panier vidé');
    }
  }

  /**
   * Procède au checkout Snipcart
   */
  function proceedToCheckout() {
    if (window.Snipcart && window.Snipcart.api) {
      closeModal('gd-cart-modal');
      window.Snipcart.api.theme.cart.open();
    }
  }

  /**
   * Met à jour l'affichage du panier dans le header
   */
  function updateCartDisplay() {
    if (window.Snipcart && window.Snipcart.store) {
      const cart = window.Snipcart.store.getState().cart;
      const count = cart.items ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0;
      
      const badge = document.getElementById('gd-cart-count');
      const badgeMobile = document.querySelector('.gd-cart-badge-mobile');
      
      [badge, badgeMobile].forEach(element => {
        if (element) {
          element.textContent = count;
          element.setAttribute('data-count', count);
          element.setAttribute('aria-label', `${count} articles dans le panier`);
          
          if (count > 0) {
            element.style.transform = 'scale(1)';
          } else {
            element.style.transform = 'scale(0)';
          }
        }
      });
    }
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
      elements.accountToggle.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('gd-account-modal');
      });
    }

    if (elements.cartToggle) {
      elements.cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('gd-cart-modal');
      });
    }

    if (elements.accountToggleMobile) {
      elements.accountToggleMobile.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('gd-account-modal');
      });
    }

    if (elements.cartToggleMobile) {
      elements.cartToggleMobile.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('gd-cart-modal');
      });
    }

    // Fermeture des modales avec gestion améliorée des clics
    document.addEventListener('click', (e) => {
      // Fermeture via overlay
      if (e.target.classList.contains('gd-modal-overlay')) {
        if (e.target.id === 'gd-account-modal') closeModal('gd-account-modal');
        if (e.target.id === 'gd-cart-modal') closeModal('gd-cart-modal');
      }

      // Fermeture via bouton X (utilisation de closest pour gérer les SVG)
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
        if (state.ui.accountModalOpen) closeModal('gd-account-modal');
        if (state.ui.cartModalOpen) closeModal('gd-cart-modal');
      }
    });

    // Écouter les événements Snipcart pour synchroniser l'affichage
    if (window.Snipcart) {
      document.addEventListener('snipcart.ready', () => {
        updateCartDisplay();
        
        // Écouter les changements du panier
        window.Snipcart.events.on('cart.confirmed', updateCartDisplay);
        window.Snipcart.events.on('item.added', updateCartDisplay);
        window.Snipcart.events.on('item.removed', updateCartDisplay);
        window.Snipcart.events.on('item.updated', updateCartDisplay);
      });
    }
  }

  /**
   * Cache les éléments DOM
   */
  function cacheElements() {
    elements.accountToggle = document.getElementById('gd-account-toggle');
    elements.cartToggle = document.getElementById('gd-cart-toggle');
    elements.accountToggleMobile = document.getElementById('gd-account-toggle-mobile');
    elements.cartToggleMobile = document.getElementById('gd-cart-toggle-mobile');
  }

  /**
   * Initialise le système e-commerce hybride
   */
  function init() {
    if (state.initialized) return;

    console.log('🏰 Initialisation du système e-commerce hybride Geek & Dragon');

    // Éviter le FOUC
    elements.body.classList.add('gd-preload');

    // Cache des éléments DOM
    cacheElements();

    // Création des modales
    createModals();

    // Attachement des événements
    attachEventListeners();

    // Mise à jour initiale de l'affichage
    updateCartDisplay();

    // Retirer la classe preload après initialisation
    requestAnimationFrame(() => {
      elements.body.classList.remove('gd-preload');
    });

    state.initialized = true;
    console.log('✅ Système e-commerce hybride initialisé avec succès');
  }

  // ========================================================================
  // API PUBLIQUE
  // ========================================================================

  // Exposition de l'API publique
  window.GDEcommerceHybrid = {
    // Contrôle des modales
    openAccountModal: () => openModal('gd-account-modal'),
    openCartModal: () => openModal('gd-cart-modal'),
    closeAccountModal: () => closeModal('gd-account-modal'),
    closeCartModal: () => closeModal('gd-cart-modal'),

    // Gestion du panier Snipcart
    updateQuantity,
    removeItem,
    clearCart,
    proceedToCheckout,

    // Utilitaires
    updateCartDisplay,
    updateCartModal,

    // État de l'interface
    isAccountModalOpen: () => state.ui.accountModalOpen,
    isCartModalOpen: () => state.ui.cartModalOpen,

    // Classes DnD
    getDndClasses: () => DND_CLASSES
  };

  // ========================================================================
  // INITIALISATION
  // ========================================================================

  // Initialisation selon l'état de chargement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Réinitialisation si nécessaire après chargement complet
  window.addEventListener('load', () => {
    if (!state.initialized) {
      console.warn('Réinitialisation du système e-commerce hybride');
      init();
    }
  });
}());
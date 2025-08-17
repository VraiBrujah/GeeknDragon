// ========================================================================
// GEEK & DRAGON - SYSTÈME HYBRIDE E-COMMERCE
// Interface DnD Role-Play + Snipcart Fonctionnel en Arrière-plan
// ========================================================================

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    animationDuration: 200,
    debounceDelay: 300
  };

  // État global
  const state = {
    ui: {
      accountModalOpen: false,
      cartModalOpen: false,
      currentAccountTab: 'profile'
    },
    initialized: false
  };

  // Cache DOM
  const elements = {
    accountToggle: null,
    cartToggle: null,
    accountToggleMobile: null,
    cartToggleMobile: null,
    accountModal: null,
    cartModal: null,
    body: document.body
  };

  // Classes DnD officielles complètes
  const DND_CLASSES = [
    { value: 'artificer', label: '🔧 Artificier', description: 'Maître des inventions magiques et des objets enchantés' },
    { value: 'barbarian', label: '⚔️ Barbare', description: 'Guerrier sauvage alimenté par une rage primitive' },
    { value: 'bard', label: '🎵 Barde', description: 'Artiste magique maîtrisant la puissance des mots et de la musique' },
    { value: 'cleric', label: '⚕️ Clerc', description: 'Prêtre aux pouvoirs divins, guérisseur et protecteur' },
    { value: 'druid', label: '🌿 Druide', description: 'Gardien de la nature et maître des éléments' },
    { value: 'fighter', label: '🛡️ Guerrier', description: 'Combattant expert et discipliné dans l\'art de la guerre' },
    { value: 'monk', label: '👊 Moine', description: 'Ascète aux arts martiaux mystiques et à la discipline intérieure' },
    { value: 'paladin', label: '⚡ Paladin', description: 'Champion divin, protecteur des innocents et ennemi du mal' },
    { value: 'ranger', label: '🏹 Rôdeur', description: 'Pisteur et chasseur expert des terres sauvages' },
    { value: 'rogue', label: '🗡️ Voleur', description: 'Expert en discrétion, agilité et coups sournoiss' },
    { value: 'sorcerer', label: '✨ Sorcier', description: 'Magie innée coulant dans ses veines' },
    { value: 'warlock', label: '👹 Sorcier', description: 'Pouvoir magique octroyé par un patron surnaturel' },
    { value: 'wizard', label: '🔮 Magicien', description: 'Érudit de la magie arcanique et des mystères anciens' }
  ];

  // ========================================================================
  // UTILITAIRES
  // ========================================================================

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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    elements.body.appendChild(announcement);
    
    setTimeout(() => {
      if (elements.body.contains(announcement)) {
        elements.body.removeChild(announcement);
      }
    }, 1000);
  }

  // ========================================================================
  // EXTRACTION DES VARIANTES PRODUITS
  // ========================================================================

  function extractProductVariants(button) {
    const variants = {};
    
    // Récupérer le conteneur parent
    const container = button.closest('.card, .product-panel, .product-info, .product-card');
    if (!container) return variants;

    // Multiplicateurs
    const multiplierSelect = container.querySelector('select[id^="multiplier-"]');
    if (multiplierSelect && multiplierSelect.value && multiplierSelect.value !== '1') {
      const selectedOption = multiplierSelect.options[multiplierSelect.selectedIndex];
      if (selectedOption) {
        variants.Multiplicateur = selectedOption.text.trim();
      }
    }

    // Langues
    const languageSelect = container.querySelector('select[data-type="language"]');
    if (languageSelect && languageSelect.value) {
      const selectedOption = languageSelect.options[languageSelect.selectedIndex];
      if (selectedOption) {
        variants.Langue = selectedOption.text.trim();
      }
    }

    // Variantes depuis les data attributes Snipcart
    if (button.dataset.itemCustom1Name && button.dataset.itemCustom1Value) {
      const customName = button.dataset.itemCustom1Name;
      const customValue = button.dataset.itemCustom1Value;
      
      // Nettoyer les valeurs (enlever les tirets et espaces au début)
      const cleanValue = customValue.replace(/^[\s\u2000-\u200F\u2028-\u202F—–-]+/, '').trim();
      variants[customName] = cleanValue;
    }

    return variants;
  }

  function formatVariantsForDisplay(variants) {
    if (!variants || Object.keys(variants).length === 0) {
      return '';
    }

    return Object.entries(variants)
      .map(([key, value]) => {
        // Nettoyer la valeur pour l'affichage
        const cleanValue = value.replace(/^[\s\u2000-\u200F\u2028-\u202F—–-]+/, '').trim();
        return `<div class="gd-variant-item">
          <span class="gd-variant-key">${escapeHtml(key)}:</span>
          <span class="gd-variant-value">${escapeHtml(cleanValue)}</span>
        </div>`;
      })
      .join('');
  }

  // ========================================================================
  // CRÉATION DES MODALES
  // ========================================================================

  function createModals() {
    createAccountModal();
    createCartModal();
  }

  function createAccountModal() {
    const classOptions = DND_CLASSES.map(cls => 
      `<option value="${cls.value}" title="${cls.description}">${cls.label}</option>`
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
                  <h2>🏰 Bienvenue, Noble Aventurier !</h2>
                  <p>Gérez votre profil et vos quêtes dans cette section mystique</p>
                </div>
                
                <div class="gd-account-tabs" role="tablist">
                  <button class="gd-account-tab active" role="tab" aria-selected="true" aria-controls="profile-panel" data-tab="profile">
                    🛡️ Profil
                  </button>
                  <button class="gd-account-tab" role="tab" aria-selected="false" aria-controls="orders-panel" data-tab="orders">
                    📜 Quêtes
                  </button>
                  <button class="gd-account-tab" role="tab" aria-selected="false" aria-controls="settings-panel" data-tab="settings">
                    ⚙️ Paramètres
                  </button>
                </div>
                
                <div class="gd-account-content">
                  <div class="gd-tab-content active" id="profile-panel" role="tabpanel" aria-labelledby="profile-tab">
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-name">Nom d'Aventurier</label>
                      <input type="text" id="profile-name" class="gd-form-input" placeholder="Votre nom de héros">
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-email">Adresse de Messagerie</label>
                      <input type="email" id="profile-email" class="gd-form-input" placeholder="votre@domaine.royaume">
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-class">Classe d'Aventurier</label>
                      <select id="profile-class" class="gd-form-select">
                        ${classOptions}
                      </select>
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="profile-level">Niveau d'Expérience</label>
                      <select id="profile-level" class="gd-form-select">
                        <option value="1">🌟 Niveau 1 - Novice</option>
                        <option value="5">⭐ Niveau 5 - Apprenti</option>
                        <option value="10">🔥 Niveau 10 - Vétéran</option>
                        <option value="15">💎 Niveau 15 - Expert</option>
                        <option value="20">👑 Niveau 20 - Légendaire</option>
                      </select>
                    </div>
                    <button class="gd-btn gd-btn-primary gd-btn-full">💾 Sauvegarder le Profil</button>
                  </div>
                  
                  <div class="gd-tab-content" id="orders-panel" role="tabpanel" aria-labelledby="orders-tab">
                    <div style="text-align: center; padding: 2rem; color: var(--gd-text-secondary);">
                      <h3 style="font-family: 'Cinzel', serif; margin-bottom: 1rem;">📜 Journal de Quêtes</h3>
                      <p>Vos aventures et acquisitions précédentes apparaîtront ici</p>
                      <div style="margin-top: 2rem; padding: 1rem; background: var(--gd-bg-elevated); border-radius: var(--gd-radius); border: 1px solid var(--gd-border);">
                        <em>🗺️ Aucune quête terminée pour l'instant...</em>
                      </div>
                    </div>
                  </div>
                  
                  <div class="gd-tab-content" id="settings-panel" role="tabpanel" aria-labelledby="settings-tab">
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="settings-notifications">Notifications par Corbeau</label>
                      <select id="settings-notifications" class="gd-form-select">
                        <option value="all">🐦 Toutes les notifications</option>
                        <option value="orders">📦 Commandes uniquement</option>
                        <option value="none">🔕 Aucune notification</option>
                      </select>
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="settings-language">Langue du Royaume</label>
                      <select id="settings-language" class="gd-form-select">
                        <option value="fr">🇫🇷 Français</option>
                        <option value="en">🇬🇧 Common (English)</option>
                      </select>
                    </div>
                    <div class="gd-form-group">
                      <label class="gd-form-label" for="settings-theme">Thème d'Interface</label>
                      <select id="settings-theme" class="gd-form-select">
                        <option value="dark">🌙 Sombre (Donjon)</option>
                        <option value="light">☀️ Clair (Taverne)</option>
                        <option value="auto">🌗 Automatique</option>
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

    elements.body.insertAdjacentHTML('beforeend', accountModalHtml);
    elements.accountModal = document.getElementById('gd-account-modal');
  }

  function createCartModal() {
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
              <div class="gd-cart-hybrid">
                <div class="gd-cart-header">
                  <h3>🎒 Inventaire Mystique</h3>
                  <p>Vos objets magiques et équipements sont listés ci-dessous</p>
                </div>
                
                <div id="gd-snipcart-content">
                  <!-- Contenu Snipcart sera injecté ici -->
                </div>
                
                <div class="gd-cart-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                  <button class="gd-btn gd-btn-outline" onclick="GDEcommerceHybrid.closeCartModal()">
                    🛒 Continuer l'Exploration
                  </button>
                  <button id="gd-checkout-btn" class="gd-btn gd-btn-primary gd-btn-full">
                    ⚔️ Finaliser l'Acquisition
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    elements.body.insertAdjacentHTML('beforeend', cartModalHtml);
    elements.cartModal = document.getElementById('gd-cart-modal');
  }

  // ========================================================================
  // GESTION DES MODALES
  // ========================================================================

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Préparation spécifique
    if (modalId === 'gd-cart-modal') {
      updateSnipcartContent();
      state.ui.cartModalOpen = true;
    } else if (modalId === 'gd-account-modal') {
      state.ui.accountModalOpen = true;
    }

    // Gestion de l'accessibilité
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    elements.body.style.overflow = 'hidden';
    
    // Focus sur le premier élément focusable
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    console.log(`🏰 Modal ${modalId} ouverte`);
  }

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

    // Retourner le focus
    const triggerButton = modalId === 'gd-cart-modal' 
      ? (elements.cartToggle || elements.cartToggleMobile)
      : (elements.accountToggle || elements.accountToggleMobile);
    
    if (triggerButton) {
      triggerButton.focus();
    }

    console.log(`🚪 Modal ${modalId} fermée`);
  }

  function closeAllModals() {
    closeModal('gd-account-modal');
    closeModal('gd-cart-modal');
  }

  // ========================================================================
  // INTÉGRATION SNIPCART
  // ========================================================================

  function updateSnipcartContent() {
    const contentDiv = document.getElementById('gd-snipcart-content');
    if (!contentDiv) return;

    // Vérifier si Snipcart est disponible
    if (window.Snipcart && window.Snipcart.api) {
      try {
        const items = window.Snipcart.api.items.all();
        const itemCount = window.Snipcart.api.items.count();
        const total = window.Snipcart.api.checkout.total();

        if (itemCount === 0) {
          contentDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gd-text-secondary);">
              <svg width="4rem" height="4rem" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="margin: 0 auto 1rem; color: var(--gd-text-muted);">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <h3 style="font-family: 'Cinzel', serif; margin-bottom: 0.5rem;">🎒 Sac Vide</h3>
              <p>Votre sac d'aventurier est vide. Partez à la découverte de trésors magiques !</p>
            </div>
          `;
        } else {
          // Afficher les articles avec variantes
          const itemsHtml = items.map(item => {
            const variants = extractItemVariants(item);
            const variantsHtml = formatVariantsForDisplay(variants);
            
            return `
              <div style="background: var(--gd-bg-primary); border: 1px solid var(--gd-border); border-radius: var(--gd-radius-lg); padding: var(--gd-space-lg); margin-bottom: var(--gd-space-md);">
                <div style="display: flex; gap: var(--gd-space-md); align-items: flex-start;">
                  <div style="flex: 1;">
                    <h4 style="font-family: 'Cinzel', serif; color: var(--gd-text-primary); margin-bottom: 0.5rem;">${escapeHtml(item.name)}</h4>
                    ${variantsHtml ? `<div class="gd-cart-item-variants"><div class="gd-variant-label">Caractéristiques Mystiques :</div>${variantsHtml}</div>` : ''}
                    <div style="color: var(--gd-secondary); font-weight: 600; font-size: 1.1rem;">${item.price.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</div>
                    <div style="color: var(--gd-text-secondary); margin-top: 0.25rem;">Quantité : ${item.quantity}</div>
                  </div>
                </div>
              </div>
            `;
          }).join('');

          contentDiv.innerHTML = `
            <div style="max-height: 400px; overflow-y: auto; margin-bottom: var(--gd-space-lg);">
              ${itemsHtml}
            </div>
            <div class="gd-cart-summary-enhanced">
              <div class="gd-cart-summary-row">
                <span class="gd-cart-summary-label">Objets Magiques (${itemCount})</span>
                <span class="gd-cart-summary-value">${total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
              </div>
              <div class="gd-cart-summary-row">
                <span class="gd-cart-summary-label">Livraison par Dragon</span>
                <span class="gd-cart-summary-value">Calculée à l'étape suivante</span>
              </div>
              <div class="gd-cart-summary-row">
                <span class="gd-cart-summary-label gd-cart-total">Total Mystique</span>
                <span class="gd-cart-summary-value gd-cart-total">${total.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' })}</span>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.warn('Erreur lors de la récupération des données Snipcart:', error);
        contentDiv.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--gd-text-secondary);">
            <p>🔮 Connexion au système mystique en cours...</p>
          </div>
        `;
      }
    } else {
      contentDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gd-text-secondary);">
          <p>⚡ Chargement du système de commerce mystique...</p>
        </div>
      `;
    }
  }

  function extractItemVariants(snipcartItem) {
    const variants = {};
    
    // Extraire les custom fields de Snipcart
    if (snipcartItem.customFields && Array.isArray(snipcartItem.customFields)) {
      snipcartItem.customFields.forEach(field => {
        if (field.name && field.value) {
          // Nettoyer les valeurs
          const cleanValue = field.value.replace(/^[\s\u2000-\u200F\u2028-\u202F—–-]+/, '').trim();
          variants[field.name] = cleanValue;
        }
      });
    }

    return variants;
  }

  // ========================================================================
  // GESTION DES ONGLETS
  // ========================================================================

  function switchAccountTab(tabName) {
    const tabs = document.querySelectorAll('.gd-account-tab');
    const contents = document.querySelectorAll('.gd-tab-content');

    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    contents.forEach(content => {
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
  // ÉVÉNEMENTS
  // ========================================================================

  function attachEventListeners() {
    // Boutons header
    if (elements.accountToggle) {
      elements.accountToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal('gd-account-modal');
      });
    }
    
    if (elements.cartToggle) {
      elements.cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal('gd-cart-modal');
      });
    }

    if (elements.accountToggleMobile) {
      elements.accountToggleMobile.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal('gd-account-modal');
      });
    }
    
    if (elements.cartToggleMobile) {
      elements.cartToggleMobile.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal('gd-cart-modal');
      });
    }

    // Bouton checkout
    document.addEventListener('click', (e) => {
      if (e.target.id === 'gd-checkout-btn') {
        e.preventDefault();
        e.stopPropagation();
        
        // Fermer notre modal et ouvrir Snipcart
        closeModal('gd-cart-modal');
        
        // Déclencher le checkout Snipcart
        setTimeout(() => {
          if (window.Snipcart && window.Snipcart.api) {
            window.Snipcart.api.modal.show();
          }
        }, 300);
      }
    });

    // Fermeture des modales - Délégation d'événements améliorée
    document.addEventListener('click', (e) => {
      // Clic sur l'overlay
      if (e.target.classList.contains('gd-modal-overlay')) {
        if (e.target.id === 'gd-account-modal') closeModal('gd-account-modal');
        if (e.target.id === 'gd-cart-modal') closeModal('gd-cart-modal');
      }
      
      // Clic sur le bouton fermer ou son SVG
      const closeButton = e.target.closest('.gd-modal-close');
      if (closeButton) {
        e.preventDefault();
        e.stopPropagation();
        const modalType = closeButton.dataset.modal;
        if (modalType === 'account') closeModal('gd-account-modal');
        if (modalType === 'cart') closeModal('gd-cart-modal');
      }

      // Onglets compte
      if (e.target.classList.contains('gd-account-tab')) {
        const tabName = e.target.dataset.tab;
        if (tabName) switchAccountTab(tabName);
      }
    });

    // Navigation clavier
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    console.log('🔗 Événements hybrides attachés');
  }

  // ========================================================================
  // INTÉGRATION SNIPCART
  // ========================================================================

  function initSnipcartIntegration() {
    // Attendre que Snipcart soit prêt
    if (window.Snipcart && window.Snipcart.api) {
      setupSnipcartListeners();
    } else {
      // Écouter l'événement de chargement
      document.addEventListener('snipcart.ready', () => {
        setupSnipcartListeners();
      });
      
      // Fallback : vérifier périodiquement
      const checkSnipcart = setInterval(() => {
        if (window.Snipcart && window.Snipcart.api) {
          clearInterval(checkSnipcart);
          setupSnipcartListeners();
        }
      }, 500);
      
      // Arrêter après 10 secondes
      setTimeout(() => clearInterval(checkSnipcart), 10000);
    }
  }

  function setupSnipcartListeners() {
    if (!window.Snipcart?.api) return;

    try {
      // Écouter les changements du panier
      window.Snipcart.api.on('cart.ready', () => {
        console.log('🛒 Panier Snipcart prêt');
        updateCartBadge();
      });

      window.Snipcart.api.on('item.added', (item) => {
        console.log('📦 Article ajouté:', item.name);
        announceToScreenReader(`${item.name} ajouté au panier`);
        updateCartBadge();
        animateCartButton();
      });

      window.Snipcart.api.on('item.removed', (item) => {
        console.log('🗑️ Article retiré:', item.name);
        announceToScreenReader(`${item.name} retiré du panier`);
        updateCartBadge();
      });

      window.Snipcart.api.on('item.updated', () => {
        updateCartBadge();
      });

      window.Snipcart.api.on('cart.confirmed', () => {
        console.log('✅ Commande confirmée');
        closeAllModals();
        updateCartBadge();
      });

      // Mise à jour initiale
      updateCartBadge();

      console.log('🔗 Intégration Snipcart configurée');
    } catch (error) {
      console.warn('Erreur lors de la configuration Snipcart:', error);
    }
  }

  function updateCartBadge() {
    if (!window.Snipcart?.api) return;
    
    try {
      const itemCount = window.Snipcart.api.items.count();
      const badges = [
        document.getElementById('gd-cart-count'),
        document.querySelector('.gd-cart-badge-mobile'),
        ...document.querySelectorAll('.snipcart-items-count')
      ].filter(Boolean);

      badges.forEach(badge => {
        badge.textContent = itemCount;
        badge.setAttribute('aria-label', `${itemCount} articles dans le panier`);
      });
    } catch (error) {
      console.warn('Erreur lors de la mise à jour du badge:', error);
    }
  }

  function animateCartButton() {
    const buttons = [elements.cartToggle, elements.cartToggleMobile].filter(Boolean);
    
    buttons.forEach(button => {
      button.style.transform = 'scale(1.1)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, CONFIG.animationDuration);
    });
  }

  // ========================================================================
  // INITIALISATION
  // ========================================================================

  function cacheElements() {
    elements.accountToggle = document.getElementById('gd-account-toggle');
    elements.cartToggle = document.getElementById('gd-cart-toggle');
    elements.accountToggleMobile = document.getElementById('gd-account-toggle-mobile');
    elements.cartToggleMobile = document.getElementById('gd-cart-toggle-mobile');
  }

  function init() {
    if (state.initialized) return;

    console.log('🏰 Initialisation du système hybride Geek & Dragon');

    // Éviter le FOUC
    elements.body.classList.add('gd-preload');
    
    // Cache des éléments DOM
    cacheElements();
    
    // Création des modales
    createModals();
    
    // Attachement des événements
    attachEventListeners();
    
    // Intégration Snipcart
    initSnipcartIntegration();
    
    // Retirer la classe preload
    requestAnimationFrame(() => {
      elements.body.classList.remove('gd-preload');
    });

    state.initialized = true;
    console.log('✅ Système hybride initialisé avec succès');
  }

  // ========================================================================
  // API PUBLIQUE
  // ========================================================================

  window.GDEcommerceHybrid = {
    // Contrôle des modales
    openAccountModal: () => openModal('gd-account-modal'),
    openCartModal: () => openModal('gd-cart-modal'),
    closeAccountModal: () => closeModal('gd-account-modal'),
    closeCartModal: () => closeModal('gd-cart-modal'),
    
    // Utilitaires
    updateSnipcartContent: updateSnipcartContent,
    extractProductVariants: extractProductVariants,
    formatVariantsForDisplay: formatVariantsForDisplay,
    updateCartBadge: updateCartBadge,
    
    // État
    isAccountModalOpen: () => state.ui.accountModalOpen,
    isCartModalOpen: () => state.ui.cartModalOpen,
    
    // Classes DnD
    getDndClasses: () => DND_CLASSES
  };

  // ========================================================================
  // INITIALISATION AU CHARGEMENT
  // ========================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Réinitialisation si nécessaire
  window.addEventListener('load', () => {
    if (!state.initialized) {
      console.warn('Réinitialisation du système hybride');
      init();
    }
  });

})();
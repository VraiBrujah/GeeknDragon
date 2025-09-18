/**
 * Module unifié pour la gestion des favoris et du sélecteur de variantes produit.
 */
const WishlistModule = {
  /**
   * Initialise le module après chargement du DOM.
   */
  init() {
    this.cacheElements();
    this.initWishlistButton();
    this.initDropdown();
  },

  /**
   * Met en cache les éléments nécessaires aux interactions.
   */
  cacheElements() {
    this.wishlistButton = document.querySelector('.btn-wishlist');
    this.wishlistIcon = this.wishlistButton?.querySelector('.wishlist-icon');
    this.wishlistText = this.wishlistButton?.querySelector('.wishlist-text');
    this.defaultWishlistText = this.wishlistText?.textContent?.trim() || 'Favoris';
    this.productId = this.wishlistButton?.getAttribute('data-product-id') || null;

    this.dropdownRoot = document.querySelector('[data-dropdown-root]');
    this.dropdownToggle = this.dropdownRoot?.querySelector('[data-dropdown-toggle]');
    this.dropdownOptions = this.dropdownRoot?.querySelector('[data-dropdown-options]');
    this.dropdownSelectedText = this.dropdownRoot?.querySelector('[data-selected-text]');

    this.priceElement = document.querySelector('.price');
    const currencyElement = this.priceElement?.querySelector('small');
    this.currency = currencyElement?.textContent?.trim() || 'CAD';
    this.descriptionElement = document.getElementById('config-description');
    this.snipcartButton = document.querySelector('.snipcart-add-item');
    this.snipcartBaseName = this.snipcartButton?.getAttribute('data-item-name') || '';

    this.boundOutsideClick = this.handleOutsideClick.bind(this);
    this.boundEscapeKey = this.handleEscapeKey.bind(this);
  },

  /**
   * Prépare le bouton de favoris si présent.
   */
  initWishlistButton() {
    if (!this.wishlistButton || !this.productId) {
      return;
    }

    this.syncWishlistState();

    this.wishlistButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.handleWishlist(this.productId);
    });
  },

  /**
   * Synchronise l'état visuel du bouton favoris avec le stockage.
   */
  syncWishlistState() {
    const wishlist = this.loadWishlist();
    const isActive = wishlist.includes(this.productId);
    this.updateWishlistButton(isActive);
  },

  /**
   * Ajoute ou retire un produit de la liste de favoris.
   */
  handleWishlist(productIdParam) {
    const id = productIdParam || this.productId;
    if (!id) {
      return;
    }

    if (!this.ensureUserLoggedIn()) {
      return;
    }

    const wishlist = this.loadWishlist();
    const isAlreadyInWishlist = wishlist.includes(id);
    const updatedWishlist = isAlreadyInWishlist
      ? wishlist.filter((item) => item !== id)
      : [...wishlist, id];

    this.saveWishlist(updatedWishlist);
    this.updateWishlistButton(!isAlreadyInWishlist);
    this.animateWishlistButton();

    if (isAlreadyInWishlist) {
      this.showToast('Retiré des favoris', 'info');
    } else {
      this.showToast('Ajouté aux favoris ❤️', 'success');
    }

    this.trackWishlistAction(id, !isAlreadyInWishlist);
  },

  /**
   * Vérifie si l'utilisateur est connecté, sinon affiche la modale de connexion.
   */
  ensureUserLoggedIn() {
    if (this.isUserLoggedIn()) {
      return true;
    }

    this.showLoginPrompt();
    return false;
  },

  /**
   * Retourne true si des informations d'identification sont disponibles.
   */
  isUserLoggedIn() {
    return Boolean(localStorage.getItem('user_token') || sessionStorage.getItem('user_session'));
  },

  /**
   * Affiche une fenêtre invitant l'utilisateur à se connecter.
   */
  showLoginPrompt() {
    if (document.querySelector('[data-login-modal="true"]')) {
      return;
    }

    const modal = document.createElement('div');
    modal.setAttribute('data-login-modal', 'true');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    modal.innerHTML = `
        <div style="
            background: var(--dark-bg, #2a1810);
            border: 1px solid var(--border-color, #4a3728);
            border-radius: 12px;
            padding: 2rem;
            max-width: 400px;
            text-align: center;
            color: var(--light-text, #f5f5f5);
            position: relative;
        ">
            <button type="button" data-login-close
                style="position: absolute; top: 0.5rem; right: 0.5rem; background: none; border: none; color: inherit; font-size: 1.5rem; cursor: pointer;">&times;</button>
            <h3 style="color: var(--secondary-color, #d4af37); margin-bottom: 1rem;">
                🔒 Connexion Requise
            </h3>
            <p style="margin-bottom: 2rem; line-height: 1.6;">
                Pour ajouter des produits à vos favoris, vous devez être connecté à votre compte.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <a href="compte.php" style="
                    background: var(--secondary-color, #d4af37);
                    color: var(--dark-bg, #1a0f08);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: 600;
                ">Se Connecter</a>
                <button type="button" data-login-cancel style="
                    background: transparent;
                    border: 1px solid var(--border-color, #4a3728);
                    color: var(--light-text, #f5f5f5);
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                ">Annuler</button>
            </div>
        </div>
    `;

    const onKeydown = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    const closeModal = () => {
      modal.remove();
      document.removeEventListener('keydown', onKeydown);
    };

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });

    modal.querySelector('[data-login-close]')?.addEventListener('click', closeModal);
    modal.querySelector('[data-login-cancel]')?.addEventListener('click', closeModal);

    document.addEventListener('keydown', onKeydown);

    document.body.appendChild(modal);
  },

  /**
   * Charge la liste des favoris depuis le stockage local.
   */
  loadWishlist() {
    try {
      return JSON.parse(localStorage.getItem('user_wishlist') || '[]');
    } catch (error) {
      console.error('GeeknDragon: impossible de lire les favoris', error);
      return [];
    }
  },

  /**
   * Sauvegarde la liste des favoris.
   */
  saveWishlist(wishlist) {
    localStorage.setItem('user_wishlist', JSON.stringify(wishlist));
  },

  /**
   * Met à jour l'apparence du bouton de favoris.
   */
  updateWishlistButton(isActive) {
    if (!this.wishlistButton) {
      return;
    }

    this.wishlistButton.classList.toggle('active', isActive);
    this.wishlistButton.setAttribute('aria-pressed', isActive ? 'true' : 'false');

    if (this.wishlistIcon) {
      this.wishlistIcon.textContent = isActive ? '❤️' : '🤍';
    }

    if (this.wishlistText) {
      this.wishlistText.textContent = isActive ? 'Favori' : this.defaultWishlistText;
    }
  },

  /**
   * Ajoute une petite animation au bouton de favoris.
   */
  animateWishlistButton() {
    if (!this.wishlistButton) {
      return;
    }

    this.wishlistButton.style.transform = 'scale(0.95)';
    window.setTimeout(() => {
      this.wishlistButton.style.transform = 'scale(1)';
    }, 150);
  },

  /**
   * Affiche un toast de confirmation.
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'var(--secondary-color, #d4af37)' : 'var(--dark-bg, #2a1810)'};
        color: ${type === 'success' ? 'var(--dark-bg, #1a0f08)' : 'var(--light-text, #f5f5f5)'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border: 1px solid var(--border-color, #4a3728);
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    window.setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);

    window.setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      window.setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  /**
   * Initialise les interactions du dropdown de variantes.
   */
  initDropdown() {
    if (!this.dropdownRoot || !this.dropdownToggle || !this.dropdownOptions) {
      return;
    }

    this.dropdownToggle.addEventListener('click', (event) => {
      event.preventDefault();
      this.toggleDropdown();
    });

    this.dropdownToggle.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.toggleDropdown();
      }
    });

    this.dropdownOptions.addEventListener('click', (event) => {
      const option = event.target.closest('[data-dropdown-option]');
      if (option) {
        event.preventDefault();
        this.selectOption(option);
      }
    });

    const activeOption = this.dropdownOptions.querySelector('[data-dropdown-option].active')
      || this.dropdownOptions.querySelector('[data-dropdown-option]');
    if (activeOption) {
      this.selectOption(activeOption, { shouldClose: false });
    }
  },

  /**
   * Ouvre ou ferme le dropdown selon son état courant.
   */
  toggleDropdown() {
    if (this.dropdownRoot.classList.contains('active')) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  },

  /**
   * Ouvre la liste des variantes.
   */
  openDropdown() {
    this.dropdownRoot.classList.add('active');
    this.dropdownToggle.classList.add('active');
    this.dropdownToggle.setAttribute('aria-expanded', 'true');
    this.dropdownOptions.classList.add('show');

    document.addEventListener('click', this.boundOutsideClick);
    document.addEventListener('keydown', this.boundEscapeKey);
  },

  /**
   * Ferme la liste des variantes.
   */
  closeDropdown() {
    this.dropdownRoot.classList.remove('active');
    this.dropdownToggle.classList.remove('active');
    this.dropdownToggle.setAttribute('aria-expanded', 'false');
    this.dropdownOptions.classList.remove('show');

    document.removeEventListener('click', this.boundOutsideClick);
    document.removeEventListener('keydown', this.boundEscapeKey);
  },

  /**
   * Ferme le dropdown si un clic a lieu à l'extérieur.
   */
  handleOutsideClick(event) {
    if (!this.dropdownRoot || this.dropdownRoot.contains(event.target)) {
      return;
    }

    this.closeDropdown();
  },

  /**
   * Gère la fermeture du dropdown via la touche Échap.
   */
  handleEscapeKey(event) {
    if (event.key === 'Escape') {
      this.closeDropdown();
    }
  },

  /**
   * Sélectionne une variante et met à jour l'affichage.
   */
  selectOption(optionElement, { shouldClose = true } = {}) {
    if (!optionElement || !this.dropdownOptions) {
      return;
    }

    this.dropdownOptions
      .querySelectorAll('[data-dropdown-option]')
      .forEach((option) => {
        option.classList.remove('active');
        option.setAttribute('aria-selected', 'false');
        option.setAttribute('tabindex', '-1');
      });

    optionElement.classList.add('active');
    optionElement.setAttribute('aria-selected', 'true');
    optionElement.setAttribute('tabindex', '0');

    const value = optionElement.getAttribute('data-value') || '';
    const price = optionElement.getAttribute('data-price') || '';
    const description = optionElement.getAttribute('data-description') || '';
    const label = optionElement.querySelector('.option-title')?.textContent?.trim() || value;

    if (this.dropdownSelectedText && label) {
      const formattedPrice = this.formatPrice(price);
      this.dropdownSelectedText.textContent = formattedPrice
        ? `${label} - ${formattedPrice}$ ${this.currency}`
        : label;
    }

    this.updateDisplayedPrice(price);
    this.updateDescription(description);
    this.updateSnipcartData(value, price);

    if (shouldClose) {
      this.closeDropdown();
    }
  },

  /**
   * Met à jour le prix affiché sur la page.
   */
  updateDisplayedPrice(price) {
    if (!this.priceElement || !price) {
      return;
    }

    const formattedPrice = this.formatPrice(price);
    this.priceElement.innerHTML = `${formattedPrice}$ <small>${this.currency}</small>`;
  },

  /**
   * Met à jour la description de la variante sélectionnée.
   */
  updateDescription(description) {
    if (!this.descriptionElement) {
      return;
    }

    this.descriptionElement.textContent = description || '';
  },

  /**
   * Synchronise les données Snipcart avec la variante choisie.
   */
  updateSnipcartData(value, price) {
    if (!this.snipcartButton) {
      return;
    }

    if (price) {
      const numericPrice = Number.parseFloat(String(price).replace(',', '.'));
      if (!Number.isNaN(numericPrice)) {
        this.snipcartButton.setAttribute('data-item-price', numericPrice.toFixed(2));
      }
    }

    const baseName = this.snipcartBaseName || '';
    if (baseName) {
      const variantLabel = value && value !== 'x1' ? ` (${value})` : '';
      this.snipcartButton.setAttribute('data-item-name', `${baseName}${variantLabel}`);
    }
  },

  /**
   * Formate un prix pour afficher des décimales cohérentes.
   */
  formatPrice(value) {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numeric = Number.parseFloat(String(value).replace(',', '.'));
    if (Number.isNaN(numeric)) {
      return String(value);
    }

    const formatted = numeric.toFixed(2);
    return formatted.endsWith('.00') ? formatted.slice(0, -3) : formatted;
  },

  /**
   * Enregistre un évènement Analytics pour la wishlist.
   */
  trackWishlistAction(productId, added) {
    if (window.GeeknDragon && window.GeeknDragon.Analytics) {
      const action = added ? 'wishlist_add' : 'wishlist_remove';
      window.GeeknDragon.Analytics.trackEvent(action, 'product_page', productId);
    }
  },
};

// Initialisation automatique après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => WishlistModule.init());

// Exposition de l'API publique unique
window.GeeknDragon = window.GeeknDragon || {};
window.GeeknDragon.handleWishlist = (productId) => WishlistModule.handleWishlist(productId);

// JavaScript pour les pages de produits individuels
document.addEventListener('DOMContentLoaded', () => {
  ProductPage.init();
});

const ProductPage = {
  init() {
    this.setupImageGallery();
    this.setupTabs();
    this.setupProductConfiguration();
    this.setupCartFunctionality();
    this.setupWishlist();
    this.setupReviews();
  },

  // Galerie d'images produit
  setupImageGallery() {
    this.mainImage = document.getElementById('mainProductImage');
    this.thumbnails = document.querySelectorAll('.thumbnail');

    if (this.mainImage && this.thumbnails.length > 0) {
      // Setup zoom on hover
      this.setupImageZoom();

      // Preload images
      this.preloadImages();
    }
  },

  setupImageZoom() {
    const mainImageContainer = this.mainImage.parentElement;

    mainImageContainer.addEventListener('mousemove', (e) => {
      const rect = mainImageContainer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      this.mainImage.style.transformOrigin = `${x}% ${y}%`;
      this.mainImage.style.transform = 'scale(1.5)';
    });

    mainImageContainer.addEventListener('mouseleave', () => {
      this.mainImage.style.transform = 'scale(1)';
      this.mainImage.style.transformOrigin = 'center';
    });
  },

  preloadImages() {
    this.thumbnails.forEach((thumb) => {
      const img = new Image();
      img.src = thumb.src;
    });
  },

  // System d'onglets
  setupTabs() {
    this.tabButtons = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');

    this.tabButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const targetTab = button.textContent.toLowerCase().replace(/[^a-z]/g, '');
        this.switchTab(targetTab);
      });
    });

    // Animation d'entrée pour les contenus d'onglets
    this.animateTabContent();
  },

  switchTab(tabName) {
    // Désactiver tous les onglets
    this.tabButtons.forEach((btn) => btn.classList.remove('active'));
    this.tabContents.forEach((content) => {
      content.classList.remove('active');
      content.style.opacity = '0';
      content.style.transform = 'translateY(20px)';
    });

    // Activer l'onglet ciblé
    const activeButton = Array.from(this.tabButtons).find((btn) => btn.textContent.toLowerCase().includes(tabName.substring(0, 4)));
    const activeContent = document.getElementById(tabName);

    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeContent.classList.add('active');

      // Animation d'entrée
      setTimeout(() => {
        activeContent.style.opacity = '1';
        activeContent.style.transform = 'translateY(0)';
      }, 50);
    }

    // Tracking
    this.trackTabSwitch(tabName);
  },

  animateTabContent() {
    this.tabContents.forEach((content) => {
      content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
  },

  // Configuration du produit
  setupProductConfiguration() {
    this.multiplicateurSelect = document.getElementById('multiplicateur');
    this.multiplicateurDesc = document.getElementById('multiplicateurDesc');

    if (this.multiplicateurSelect && this.multiplicateurDesc) {
      this.multiplicateurSelect.addEventListener('change', () => {
        this.updateProductConfig();
      });

      // Configuration initiale
      this.updateProductConfig();
    }
  },

  updateProductConfig() {
    const selectedOption = this.multiplicateurSelect.selectedOptions[0];
    const multiplicateur = selectedOption.value;
    const price = selectedOption.getAttribute('data-price');

    // Mettre à jour la description
    const descriptions = {
      x1: 'Finition brillante sans gravure pour un aspect "neuf" authentique. Parfait pour débuter l\'aventure avec des pièces éclatantes.',
      x10: 'Gravure précise du multiplicateur x10 avec finition légèrement mate. Aspect "noble usagé" pour l\'immersion historique.',
      x100: 'Gravure précise du multiplicateur x100 avec finition mate. Idéal pour les économies régionales prospères.',
      x1000: 'Gravure précise du multiplicateur x1000 avec finition mate. Pour les trésors des marchands et nobles.',
      x10000: 'Gravure précise du multiplicateur x10000 avec finition mate. La richesse des rois et empereurs.',
    };

    if (this.multiplicateurDesc) {
      this.multiplicateurDesc.innerHTML = `<p>${descriptions[multiplicateur]}</p>`;
    }

    // Animation de changement
    this.animateConfigChange();

    // Tracking
    this.trackConfigChange(multiplicateur, price);
  },

  animateConfigChange() {
    const configDesc = document.querySelector('.config-description');
    if (configDesc) {
      configDesc.style.transform = 'scale(0.98)';
      configDesc.style.opacity = '0.7';

      setTimeout(() => {
        configDesc.style.transform = 'scale(1)';
        configDesc.style.opacity = '1';
      }, 150);
    }
  },

  // Fonctionnalité panier
  setupCartFunctionality() {
    this.addToCartBtn = document.querySelector('.btn-add-to-cart');

    if (this.addToCartBtn) {
      this.addToCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.addToCart();
      });
    }
  },

  addToCart() {
    const productData = this.getProductData();

    // Animation du bouton
    this.animateButton(this.addToCartBtn, 'Ajouté ! ✓');

    // Ajouter au panier (localStorage pour le moment)
    this.saveToCart(productData);

    // Notification
    this.showNotification('Produit ajouté au panier !', 'success');

    // Tracking
    this.trackAddToCart(productData);
  },

  getProductData() {
    const title = document.querySelector('.product-title').textContent;
    const price = document.querySelector('.price').textContent.replace(/[^\d.]/g, '');
    const multiplicateur = this.multiplicateurSelect ? this.multiplicateurSelect.value : 'x1';

    return {
      title,
      price: parseFloat(price),
      multiplicateur,
      quantity: 1,
      timestamp: Date.now(),
    };
  },

  saveToCart(productData) {
    const cart = JSON.parse(localStorage.getItem('geekndragon_cart') || '[]');

    // Vérifier si le produit existe déjà avec la même configuration
    const existingIndex = cart.findIndex((item) => item.title === productData.title
            && item.multiplicateur === productData.multiplicateur);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(productData);
    }

    localStorage.setItem('geekndragon_cart', JSON.stringify(cart));
    this.updateCartCount();
  },

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('geekndragon_cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Mettre à jour l'indicateur de panier s'il existe
    const cartIndicator = document.querySelector('.cart-count');
    if (cartIndicator) {
      cartIndicator.textContent = totalItems;
      cartIndicator.style.display = totalItems > 0 ? 'block' : 'none';
    }
  },

  animateButton(button, newText) {
    const originalText = button.textContent;

    button.style.transform = 'scale(0.95)';
    button.style.opacity = '0.8';

    setTimeout(() => {
      button.textContent = newText;
      button.style.transform = 'scale(1.05)';
      button.style.opacity = '1';
    }, 150);

    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.textContent = originalText;
    }, 2000);
  },

  // Liste de souhaits
  setupWishlist() {
    this.wishlistBtn = document.querySelector('.btn-wishlist');

    if (this.wishlistBtn) {
      // Vérifier l'état initial
      this.updateWishlistState();

      this.wishlistBtn.addEventListener('click', () => {
        this.toggleWishlist();
      });
    }
  },

  toggleWishlist() {
    const productTitle = document.querySelector('.product-title').textContent;
    let wishlist = JSON.parse(localStorage.getItem('geekndragon_wishlist') || '[]');

    const isInWishlist = wishlist.includes(productTitle);

    if (isInWishlist) {
      wishlist = wishlist.filter((item) => item !== productTitle);
      this.wishlistBtn.classList.remove('active');
      this.showNotification('Retiré des favoris', 'info');
    } else {
      wishlist.push(productTitle);
      this.wishlistBtn.classList.add('active');
      this.showNotification('Ajouté aux favoris ❤️', 'success');
    }

    localStorage.setItem('geekndragon_wishlist', JSON.stringify(wishlist));

    // Animation
    this.wishlistBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      this.wishlistBtn.style.transform = 'scale(1)';
    }, 200);

    // Tracking
    this.trackWishlistAction(productTitle, !isInWishlist);
  },

  updateWishlistState() {
    const productTitle = document.querySelector('.product-title').textContent;
    const wishlist = JSON.parse(localStorage.getItem('geekndragon_wishlist') || '[]');

    if (wishlist.includes(productTitle)) {
      this.wishlistBtn.classList.add('active');
    }
  },

  // Système d'avis
  setupReviews() {
    this.setupReviewsAnimation();
    this.setupReviewsInteraction();
  },

  setupReviewsAnimation() {
    // Animer les barres de notation au scroll
    const ratingBars = document.querySelectorAll('.bar .fill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const { width } = fill.style;
          fill.style.width = '0%';

          setTimeout(() => {
            fill.style.width = width;
          }, 500);
        }
      });
    }, { threshold: 0.5 });

    ratingBars.forEach((bar) => observer.observe(bar));
  },

  setupReviewsInteraction() {
    // Boutons utiles pour les avis (simulation)
    const reviewItems = document.querySelectorAll('.review-item');

    reviewItems.forEach((review) => {
      const helpfulBtn = document.createElement('button');
      helpfulBtn.className = 'helpful-btn';
      helpfulBtn.innerHTML = '👍 Utile (0)';
      helpfulBtn.style.cssText = `
                background: transparent;
                border: 1px solid var(--border-color);
                color: var(--medium-text);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                cursor: pointer;
                transition: var(--transition);
                font-size: 0.8rem;
                margin-top: 1rem;
            `;

      helpfulBtn.addEventListener('click', () => {
        this.markReviewHelpful(helpfulBtn);
      });

      review.appendChild(helpfulBtn);
    });
  },

  markReviewHelpful(button) {
    if (button.classList.contains('voted')) return;

    button.classList.add('voted');
    button.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
    button.style.borderColor = '#4CAF50';
    button.style.color = '#4CAF50';

    // Incrémenter le compteur
    const currentText = button.textContent;
    const currentCount = parseInt(currentText.match(/\d+/)[0]);
    button.textContent = `👍 Utile (${currentCount + 1})`;

    // Animation
    button.style.transform = 'scale(1.1)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
  },

  // Notifications
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 2rem;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-medium);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;

    document.body.appendChild(notification);

    // Animation d'entrée
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Animation de sortie
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  },

  // Analytics et tracking
  trackTabSwitch(tabName) {
    if (window.GeeknDragon && window.GeeknDragon.Analytics) {
      window.GeeknDragon.Analytics.trackEvent('product_tab_switch', 'product_page', tabName);
    }
  },

  trackConfigChange(multiplicateur, price) {
    if (window.GeeknDragon && window.GeeknDragon.Analytics) {
      window.GeeknDragon.Analytics.trackEvent('product_config_change', 'product_page', `${multiplicateur}:${price}`);
    }
  },

  trackAddToCart(productData) {
    if (window.GeeknDragon && window.GeeknDragon.Analytics) {
      window.GeeknDragon.Analytics.trackEvent('add_to_cart', 'ecommerce', productData.title);
    }
  },

  trackWishlistAction(productTitle, added) {
    if (window.GeeknDragon && window.GeeknDragon.Analytics) {
      const action = added ? 'wishlist_add' : 'wishlist_remove';
      window.GeeknDragon.Analytics.trackEvent(action, 'product_page', productTitle);
    }
  },
};

// Fonctions globales pour les interactions HTML
function changeMainImage(thumbnail) {
  const mainImage = document.getElementById('mainProductImage');
  if (mainImage && thumbnail) {
    // Animation de transition
    mainImage.style.opacity = '0.7';

    setTimeout(() => {
      mainImage.src = thumbnail.src;
      mainImage.alt = thumbnail.alt;
      mainImage.style.opacity = '1';
    }, 150);

    // Mettre à jour les vignettes actives
    document.querySelectorAll('.thumbnail').forEach((thumb) => {
      thumb.classList.remove('active');
    });
    thumbnail.classList.add('active');
  }
}

function switchTab(tabName) {
  if (ProductPage.switchTab) {
    ProductPage.switchTab(tabName);
  }
}

function updateProductConfig() {
  if (ProductPage.updateProductConfig) {
    ProductPage.updateProductConfig();
  }
}

function addToCart() {
  if (ProductPage.addToCart) {
    ProductPage.addToCart();
  }
}

function toggleWishlist() {
  if (ProductPage.toggleWishlist) {
    ProductPage.toggleWishlist();
  }
}

// Initialisation du panier au chargement
window.addEventListener('load', () => {
  if (ProductPage.updateCartCount) {
    ProductPage.updateCartCount();
  }
});

// Export pour utilisation globale
window.GeeknDragon = window.GeeknDragon || {};
window.GeeknDragon.ProductPage = ProductPage;

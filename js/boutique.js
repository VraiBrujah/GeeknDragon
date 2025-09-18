// JavaScript spécifique pour la page boutique
document.addEventListener('DOMContentLoaded', () => {
  ShopAnimations.init();
  ProductInteractions.init();
});

// Module d'animations pour la boutique
const ShopAnimations = {
  init() {
    this.setupScrollAnimations();
    this.setupProductAnimations();
    this.setupSectionTransitions();
  },

  setupScrollAnimations() {
    // Animation des produits au scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, index * 100);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    });

    document.querySelectorAll('.product-card').forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      card.style.transitionDelay = `${index * 0.1}s`;
      observer.observe(card);
    });
  },

  setupProductAnimations() {
    // Animation des badges
    document.querySelectorAll('.product-badge').forEach((badge) => {
      badge.addEventListener('mouseenter', () => {
        badge.style.transform = 'scale(1.1) rotate(-3deg)';
      });

      badge.addEventListener('mouseleave', () => {
        badge.style.transform = 'scale(1) rotate(0deg)';
      });
    });

    // Animation des feature tags
    document.querySelectorAll('.feature-tag').forEach((tag) => {
      tag.addEventListener('mouseenter', () => {
        tag.style.backgroundColor = 'var(--secondary-color)';
        tag.style.color = 'var(--dark-bg)';
      });

      tag.addEventListener('mouseleave', () => {
        tag.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        tag.style.color = 'var(--secondary-color)';
      });
    });
  },

  setupSectionTransitions() {
    // Navigation fluide entre sections
    const sectionLinks = document.querySelectorAll('a[href^="#"]');
    sectionLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const headerElement = document.querySelector('.header');
          const filtersElement = document.querySelector('.shop-filters');
          const headerHeight = headerElement ? headerElement.offsetHeight : 0;
          const filtersHeight = filtersElement ? filtersElement.offsetHeight : 0;
          const offset = headerHeight + filtersHeight + 20;

          window.scrollTo({
            top: targetSection.offsetTop - offset,
            behavior: 'smooth',
          });

          // Highlight de la section
          targetSection.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
          setTimeout(() => {
            targetSection.style.boxShadow = '';
          }, 2000);
        }
      });
    });
  },
};

// Module d'interactions produits
const ProductInteractions = {
  init() {
    this.setupProductHovers();
    this.setupQuickActions();
    this.setupProductComparison();
    this.setupPriceCalculator();
    this.setupVideoModal();
  },

  setupProductHovers() {
    document.querySelectorAll('.product-card').forEach((card) => {
      card.addEventListener('mouseenter', () => {
        // Effet de parallax subtil sur l'image
        const image = card.querySelector('.product-image img');
        if (image) {
          image.style.transform = 'scale(1.1) translateZ(0)';
        }

        // Animation du prix
        const price = card.querySelector('.price');
        if (price) {
          price.style.transform = 'scale(1.05)';
          price.style.color = 'var(--secondary-color)';
        }
      });

      card.addEventListener('mouseleave', () => {
        const image = card.querySelector('.product-image img');
        if (image) {
          image.style.transform = 'scale(1) translateZ(0)';
        }

        const price = card.querySelector('.price');
        if (price) {
          price.style.transform = 'scale(1)';
          price.style.color = 'var(--accent-color)';
        }
      });
    });
  },

  setupQuickActions() {
    // Actions rapides sur les produits
    document.querySelectorAll('.product-quick-view').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productCard = button.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;

        // Tracking
        if (window.GeeknDragon && window.GeeknDragon.Analytics) {
          window.GeeknDragon.Analytics.trackEvent('product_quick_view', 'shop', productTitle);
        }

        // Animation de chargement
        button.style.transform = 'scale(0.95)';
        button.textContent = 'Chargement...';

        setTimeout(() => {
          button.style.transform = 'scale(1)';
          button.textContent = 'Voir Détails';
          window.location.href = button.href;
        }, 500);
      });
    });
  },

  setupProductComparison() {
    // Système de comparaison simple
    const comparisonList = [];

    document.querySelectorAll('.product-card').forEach((card) => {
      // Ajouter bouton de comparaison
      const compareButton = document.createElement('button');
      compareButton.className = 'compare-btn';
      compareButton.innerHTML = '⚖️';
      compareButton.title = 'Comparer ce produit';
      compareButton.style.cssText = `
                position: absolute;
                top: 1rem;
                left: 1rem;
                background: rgba(0, 0, 0, 0.7);
                border: none;
                color: white;
                padding: 0.5rem;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                transition: opacity 0.3s ease;
                z-index: 3;
            `;

      card.querySelector('.product-image').appendChild(compareButton);

      card.addEventListener('mouseenter', () => {
        compareButton.style.opacity = '1';
      });

      card.addEventListener('mouseleave', () => {
        if (!compareButton.classList.contains('active')) {
          compareButton.style.opacity = '0';
        }
      });

      compareButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleComparison(card, compareButton);
      });
    });
  },

  toggleComparison(card, button) {
    const productId = card.querySelector('.product-title').textContent;

    if (button.classList.contains('active')) {
      // Retirer de la comparaison
      button.classList.remove('active');
      button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      this.removeFromComparison(productId);
    } else {
      // Ajouter à la comparaison
      if (this.comparisonList.length >= 3) {
        alert('Vous pouvez comparer maximum 3 produits à la fois.');
        return;
      }

      button.classList.add('active');
      button.style.backgroundColor = 'var(--secondary-color)';
      button.style.opacity = '1';
      this.addToComparison(card);
    }

    this.updateComparisonUI();
  },

  addToComparison(card) {
    const productData = {
      title: card.querySelector('.product-title').textContent,
      price: card.dataset.price,
      category: card.dataset.category,
      image: card.querySelector('.product-image img').src,
      features: Array.from(card.querySelectorAll('.feature-tag')).map((tag) => tag.textContent),
    };

    this.comparisonList.push(productData);
  },

  removeFromComparison(productId) {
    this.comparisonList = this.comparisonList.filter((item) => item.title !== productId);
  },

  updateComparisonUI() {
    let comparisonBar = document.querySelector('.comparison-bar');

    if (this.comparisonList.length === 0) {
      if (comparisonBar) comparisonBar.remove();
      return;
    }

    if (!comparisonBar) {
      comparisonBar = document.createElement('div');
      comparisonBar.className = 'comparison-bar';
      comparisonBar.style.cssText = `
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: var(--darker-bg);
                border-top: 2px solid var(--secondary-color);
                padding: 1rem;
                z-index: 1000;
                transform: translateY(100%);
                transition: transform 0.3s ease;
            `;
      document.body.appendChild(comparisonBar);
    }

    comparisonBar.innerHTML = `
            <div class="container">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span style="color: var(--secondary-color); font-weight: 600;">
                        ${this.comparisonList.length} produit(s) sélectionné(s) pour comparaison
                    </span>
                    <div>
                        <button class="compare-btn-action" style="margin-right: 1rem; padding: 0.5rem 1rem; background: var(--secondary-color); color: var(--dark-bg); border: none; border-radius: 5px; cursor: pointer;">
                            Comparer
                        </button>
                        <button class="clear-comparison" style="padding: 0.5rem 1rem; background: transparent; color: var(--medium-text); border: 1px solid var(--border-color); border-radius: 5px; cursor: pointer;">
                            Effacer
                        </button>
                    </div>
                </div>
            </div>
        `;

    comparisonBar.style.transform = 'translateY(0)';

    // Événements des boutons
    comparisonBar.querySelector('.clear-comparison').addEventListener('click', () => {
      this.clearComparison();
    });

    comparisonBar.querySelector('.compare-btn-action').addEventListener('click', () => {
      this.showComparisonModal();
    });
  },

  clearComparison() {
    this.comparisonList = [];
    document.querySelectorAll('.compare-btn.active').forEach((btn) => {
      btn.classList.remove('active');
      btn.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      btn.style.opacity = '0';
    });
    this.updateComparisonUI();
  },

  showComparisonModal() {
    // Créer une modal de comparaison simple
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;

    const content = document.createElement('div');
    content.style.cssText = `
            background: var(--dark-bg);
            border-radius: var(--border-radius);
            padding: 2rem;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        `;

    let comparisonHTML = `
            <button class="close-modal" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; color: var(--medium-text); cursor: pointer;">&times;</button>
            <h2 style="color: var(--secondary-color); margin-bottom: 2rem;">Comparaison des Produits</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
        `;

    this.comparisonList.forEach((product) => {
      comparisonHTML += `
                <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 1rem;">
                    <h3 style="color: var(--secondary-color); margin-bottom: 1rem;">${product.title}</h3>
                    <p style="color: var(--accent-color); font-weight: 600; margin-bottom: 1rem;">${product.price}$ CAD</p>
                    <p style="color: var(--medium-text); margin-bottom: 1rem;">Catégorie: ${product.category}</p>
                    <div>
                        ${product.features.map((feature) => `<span style="display: inline-block; background: rgba(212, 175, 55, 0.1); padding: 0.2rem 0.5rem; margin: 0.2rem; border-radius: 3px; font-size: 0.8rem; color: var(--secondary-color);">${feature}</span>`).join('')}
                    </div>
                </div>
            `;
    });

    comparisonHTML += '</div>';
    content.innerHTML = comparisonHTML;
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Fermeture de la modal
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  },

  setupPriceCalculator() {
    // Calculateur de prix pour les multiplicateurs (pièces)
    document.querySelectorAll('[data-category="coins"]').forEach((card) => {
      const priceElement = card.querySelector('.price');
      if (priceElement) {
        // Ajouter tooltip avec explication des multiplicateurs
        const tooltip = document.createElement('div');
        tooltip.className = 'price-tooltip';
        tooltip.innerHTML = `
                    <small style="color: var(--medium-text); font-style: italic;">
                        * Prix de base - Options de multiplicateurs disponibles
                    </small>
                `;
        priceElement.parentNode.appendChild(tooltip);
      }
    });
  },

  setupVideoModal() {
    const openBtn = document.querySelector('[data-video-open]');
    const modal = document.getElementById('video-modal');
    if (!openBtn || !modal) return;
    const closeBtn = modal.querySelector('[data-video-close]');
    const iframe = modal.querySelector('iframe');

    const escListener = (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        e.preventDefault();
        closeModal();
      }
    };

    const openModal = () => {
      modal.classList.remove('hidden');
      document.addEventListener('keydown', escListener);
      modal.focus();
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      iframe.src = iframe.src;
      document.removeEventListener('keydown', escListener);
    };

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  },
};

// Initialisation du défilement vers la section ciblée au chargement
window.addEventListener('load', () => {
  if (window.location.hash) {
    const targetSection = document.querySelector(window.location.hash);
    if (targetSection) {
      setTimeout(() => {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);
    }
  }
});

// Export pour utilisation globale
window.GeeknDragon = window.GeeknDragon || {};
window.GeeknDragon.Shop = {
  ShopAnimations,
  ProductInteractions,
};

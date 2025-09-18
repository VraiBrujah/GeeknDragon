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

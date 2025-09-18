// JavaScript pour les pages de produits individuels
// Ce module gère les interactions visuelles comme la galerie d'images et les onglets.
document.addEventListener('DOMContentLoaded', () => {
  ProductPage.init();
});

const ProductPage = {
  /**
   * Initialise les modules visuels de la page produit.
   */
  init() {
    this.cacheDom();
    this.setupImageGallery();
    this.setupTabs();
    this.setupReviews();
    this.setupReviewCta();
  },

  /**
   * Mémorise les éléments DOM utilisés régulièrement.
   */
  cacheDom() {
    this.mainImage = document.getElementById('mainProductImage');
    this.thumbnailList = Array.from(document.querySelectorAll('.thumbnail'));
    this.tabButtons = Array.from(document.querySelectorAll('.tab-btn'));
    this.tabContents = Array.from(document.querySelectorAll('.tab-content'));
  },

  /**
   * Active les interactions de la galerie d'images.
   */
  setupImageGallery() {
    if (!this.mainImage || this.thumbnailList.length === 0) {
      return;
    }

    this.setupImageZoom();
    this.preloadImages();

    this.thumbnailList.forEach((thumbnail) => {
      thumbnail.addEventListener('click', (event) => {
        event.preventDefault();
        this.updateMainImage(thumbnail);
      });

      thumbnail.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.updateMainImage(thumbnail);
        }
      });
    });
  },

  /**
   * Remplace l'image principale par la vignette choisie.
   */
  updateMainImage(thumbnail) {
    if (!this.mainImage || !thumbnail) {
      return;
    }

    const newSrc = thumbnail.getAttribute('data-image-src') || thumbnail.src;
    const newAlt = thumbnail.getAttribute('data-image-alt') || thumbnail.alt;

    this.mainImage.style.opacity = '0.7';

    window.setTimeout(() => {
      this.mainImage.src = newSrc;
      this.mainImage.alt = newAlt;
      this.mainImage.style.opacity = '1';
    }, 150);

    this.thumbnailList.forEach((thumb) => thumb.classList.remove('active'));
    thumbnail.classList.add('active');
  },

  /**
   * Configure l'effet de zoom sur la visuel principal.
   */
  setupImageZoom() {
    if (!this.mainImage || !this.mainImage.parentElement) {
      return;
    }

    const mainImageContainer = this.mainImage.parentElement;

    mainImageContainer.addEventListener('mousemove', (event) => {
      const rect = mainImageContainer.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      this.mainImage.style.transformOrigin = `${x}% ${y}%`;
      this.mainImage.style.transform = 'scale(1.5)';
    });

    mainImageContainer.addEventListener('mouseleave', () => {
      this.mainImage.style.transform = 'scale(1)';
      this.mainImage.style.transformOrigin = 'center';
    });
  },

  /**
   * Précharge l'ensemble des vignettes pour fluidifier la navigation.
   */
  preloadImages() {
    this.thumbnailList.forEach((thumb) => {
      const img = new Image();
      img.src = thumb.getAttribute('data-image-src') || thumb.src;
    });
  },

  /**
   * Met en place la navigation par onglets.
   */
  setupTabs() {
    if (this.tabButtons.length === 0 || this.tabContents.length === 0) {
      return;
    }

    this.tabButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const targetTab = button.dataset.tabTarget;
        if (targetTab) {
          this.switchTab(targetTab);
        }
      });
    });

    this.animateTabContent();
  },

  /**
   * Active l'onglet demandé et anime la transition.
   */
  switchTab(tabName) {
    if (!tabName) {
      return;
    }

    this.tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tabTarget === tabName;
      btn.classList.toggle('active', isActive);
    });

    this.tabContents.forEach((content) => {
      const isTarget = content.id === tabName;
      if (isTarget) {
        content.classList.add('active');
        window.setTimeout(() => {
          content.style.opacity = '1';
          content.style.transform = 'translateY(0)';
        }, 50);
      } else {
        content.classList.remove('active');
        content.style.opacity = '0';
        content.style.transform = 'translateY(20px)';
      }
    });

    this.trackTabSwitch(tabName);
  },

  /**
   * Applique une transition homogène aux contenus des onglets.
   */
  animateTabContent() {
    this.tabContents.forEach((content) => {
      content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    });
  },

  /**
   * Configure les animations et interactions liées aux avis.
   */
  setupReviews() {
    this.setupReviewsAnimation();
    this.setupReviewsInteraction();

    const reviewItems = document.querySelectorAll('.review-item');
    const reviewsContainer = document.getElementById('reviews');

    if (reviewsContainer && reviewItems.length === 0) {
      const message = document.createElement('p');
      message.textContent = 'Soyez le premier à donner votre avis.';
      reviewsContainer.appendChild(message);
    }

    const reviewsTabBtn = this.tabButtons.find((btn) => btn.dataset.tabTarget === 'reviews');
    if (reviewsTabBtn) {
      reviewsTabBtn.textContent = `Avis (${reviewItems.length})`;
    }
  },

  /**
   * Ajoute le comportement au bouton d'accès direct au formulaire d'avis.
   */
  setupReviewCta() {
    const reviewCta = document.querySelector('[data-scroll-target]');
    if (!reviewCta) {
      return;
    }

    reviewCta.addEventListener('click', (event) => {
      event.preventDefault();
      const targetSelector = reviewCta.getAttribute('data-scroll-target');
      const focusSelector = reviewCta.getAttribute('data-focus-target');

      if (targetSelector) {
        const targetElement = document.querySelector(targetSelector);
        targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (focusSelector) {
          window.setTimeout(() => {
            document.querySelector(focusSelector)?.focus();
          }, 400);
        }
      }
    });
  },

  /**
   * Anime la distribution des notes lorsque la section devient visible.
   */
  setupReviewsAnimation() {
    const ratingBars = document.querySelectorAll('.bar .fill');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const fill = entry.target;
            const { width } = fill.style;
            fill.style.width = '0%';

            window.setTimeout(() => {
              fill.style.width = width;
            }, 500);
          }
        });
      },
      { threshold: 0.5 }
    );

    ratingBars.forEach((bar) => observer.observe(bar));
  },

  /**
   * Ajoute une interaction de vote utile simulée sur chaque avis.
   */
  setupReviewsInteraction() {
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

  /**
   * Marque un avis comme utile (simulation locale).
   */
  markReviewHelpful(button) {
    if (button.classList.contains('voted')) return;

    button.classList.add('voted');
    button.style.backgroundColor = 'var(--color-success-light)';
    button.style.borderColor = 'var(--color-success)';
    button.style.color = 'var(--color-success)';

    const currentText = button.textContent;
    const currentCount = parseInt(currentText.match(/\d+/)[0], 10);
    button.textContent = `👍 Utile (${currentCount + 1})`;

    button.style.transform = 'scale(1.1)';
    window.setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 200);
  },

  /**
   * Envoie un évènement Analytics lors du changement d'onglet.
   */
  trackTabSwitch(tabName) {
    if (window.GeeknDragon && window.GeeknDragon.Analytics) {
      window.GeeknDragon.Analytics.trackEvent('product_tab_switch', 'product_page', tabName);
    }
  },
};

window.GeeknDragon = window.GeeknDragon || {};
window.GeeknDragon.ProductPage = ProductPage;

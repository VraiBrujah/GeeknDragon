// Geek&Dragon - Script principal avec fonctionnalités modernes
document.addEventListener('DOMContentLoaded', () => {
  // Initialisation des modules
  Navigation.init();
  ScrollEffects.init();
  Animations.init();
  Performance.init();
  
  // Force l'affichage des sections critiques
  const ensureVisibility = () => {
    const criticalSections = document.querySelectorAll('.features, .testimonials, .news, .feature-card, .testimonial-card');
    criticalSections.forEach(section => {
      section.style.opacity = '1';
      section.style.visibility = 'visible';
      section.style.display = 'block';
      section.classList.remove('fade-in'); // Retire la classe problématique
    });
    
    // Protection spéciale pour la grille des features
    const featuresGrid = document.querySelector('.features-grid');
    if (featuresGrid) {
      featuresGrid.style.opacity = '1';
      featuresGrid.style.visibility = 'visible';
      featuresGrid.style.display = 'grid';
    }
  };
  
  // Forcer l'affichage immédiatement et après un délai
  ensureVisibility();
  setTimeout(ensureVisibility, 100);
  setTimeout(ensureVisibility, 500);
  setTimeout(ensureVisibility, 1000);

  /**
   * Gestion centralisée des interactions du panier (Snipcart ou fallback natif).
   * Cette logique harmonise les boutons du header, du widget et du menu mobile,
   * tout en synchronisant les attributs d'accessibilité et les badges.
   */
  const CartInteractions = (() => {
    const toggleIds = ['gd-cart-toggle-widget', 'gd-cart-toggle', 'gd-cart-toggle-mobile'];
    const toggles = [];
    const badges = [];
    let unsubscribeStore = null;
    let isExpanded = false;
    const fallbackState = {
      panel: null,
      overlay: null,
    };

    /**
     * Normalise une valeur numérique afin d'éviter les NaN et négatifs.
     * @param {string|number|null|undefined} value Valeur à convertir.
     * @returns {number} Nombre entier positif ou nul.
     */
    const normaliseCount = (value) => {
      const parsed = Number.parseInt(value, 10);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    };

    /**
     * Met à jour l'état visuel et ARIA des déclencheurs.
     * @param {boolean} expanded Indique si le panier est affiché.
     */
    const setExpandedState = (expanded) => {
      isExpanded = Boolean(expanded);
      const ariaValue = isExpanded ? 'true' : 'false';
      toggles.forEach((btn) => {
        btn.setAttribute('aria-expanded', ariaValue);
        btn.classList.toggle('is-open', isExpanded);
      });
      badges.forEach((badge) => {
        badge.classList.toggle('is-open', isExpanded);
        badge.setAttribute('data-open', ariaValue);
      });
      const root = document.documentElement;
      if (root) {
        root.setAttribute('data-gd-cart-open', ariaValue);
      }
    };

    /**
     * Récupère la valeur la plus fiable connue pour le compteur de panier.
     * @returns {number} Nombre d'articles actuellement connus.
     */
    const readKnownCount = () => {
      for (let index = 0; index < badges.length; index += 1) {
        const badge = badges[index];
        const datasetValue = normaliseCount(badge.dataset.count);
        if (datasetValue || badge.dataset.count === '0') return datasetValue;
        const textValue = normaliseCount(badge.textContent);
        if (textValue || (badge.textContent || '').trim() === '0') return textValue;
      }
      const widgetBadge = document.getElementById('gd-cart-count-widget');
      if (widgetBadge) {
        const fromDataset = normaliseCount(widgetBadge.dataset.count);
        if (fromDataset || widgetBadge.dataset.count === '0') return fromDataset;
        return normaliseCount(widgetBadge.textContent);
      }
      return 0;
    };

    /**
     * Applique le compteur harmonisé sur tous les badges connus.
     * @param {number} count Nombre d'articles à afficher.
     */
    const applyBadgeCount = (count) => {
      const safeCount = normaliseCount(count);
      const textValue = `${safeCount}`;
      badges.forEach((badge) => {
        if ((badge.textContent || '').trim() !== textValue) {
          badge.textContent = textValue;
        }
        badge.dataset.count = textValue;
        badge.classList.toggle('has-items', safeCount > 0);
      });
      const widgetBadge = document.getElementById('gd-cart-count-widget');
      if (widgetBadge) {
        widgetBadge.dataset.count = textValue;
        if ((widgetBadge.textContent || '').trim() !== textValue) {
          widgetBadge.textContent = textValue;
        }
      }
    };

    /**
     * Lit le compteur via Snipcart si disponible, sinon via la valeur locale.
     */
    const refreshBadgeCounts = () => {
      let count = null;
      try {
        if (window.Snipcart && window.Snipcart.store && typeof window.Snipcart.store.getState === 'function') {
          const state = window.Snipcart.store.getState();
          if (state && state.cart && state.cart.items) {
            count = normaliseCount(state.cart.items.count);
          }
        }
      } catch (_) {
        count = null;
      }
      if (count === null || typeof count === 'undefined') {
        count = readKnownCount();
      }
      applyBadgeCount(count);
    };

    /**
     * Calcule l'état du panneau fallback afin de synchroniser aria-expanded.
     * @returns {boolean} État ouvert/fermé du panneau natif.
     */
    const computeFallbackExpanded = () => {
      const panel = fallbackState.panel;
      const overlay = fallbackState.overlay;
      const panelOpen = panel && (panel.classList.contains('open') || panel.getAttribute('aria-hidden') === 'false');
      const overlayActive = overlay && overlay.classList.contains('active');
      return Boolean(panelOpen || overlayActive);
    };

    /**
     * Synchronise les attributs aria après une action sur le fallback.
     */
    const syncFallbackState = () => {
      if (!fallbackState.panel && !fallbackState.overlay) return;
      window.requestAnimationFrame(() => {
        setExpandedState(computeFallbackExpanded());
        refreshBadgeCounts();
      });
    };

    /**
     * Gestion du clic sur n'importe quel bouton de panier.
     * @param {MouseEvent} event Événement de clic intercepté.
     */
    const handleToggleClick = (event) => {
      event.preventDefault();

      let handled = false;
      try {
        if (window.Snipcart && window.Snipcart.api) {
          if (window.Snipcart.api.theme && typeof window.Snipcart.api.theme.openCart === 'function') {
            window.Snipcart.api.theme.openCart();
            handled = true;
          } else if (window.Snipcart.api.cart && typeof window.Snipcart.api.cart.open === 'function') {
            window.Snipcart.api.cart.open();
            handled = true;
          }
        }
      } catch (_) {
        handled = false;
      }

      if (handled) {
        setExpandedState(true);
        refreshBadgeCounts();
        return;
      }

      if (window.gdCart && typeof window.gdCart.toggle === 'function') {
        try {
          const result = window.gdCart.toggle();
          if (typeof result === 'boolean') {
            setExpandedState(result);
            refreshBadgeCounts();
          } else {
            syncFallbackState();
          }
        } catch (_) {
          syncFallbackState();
        }
      }
    };

    /**
     * Branche les événements émis par Snipcart pour suivre l'état réel.
     */
    const bindSnipcartEvents = () => {
      document.addEventListener('snipcart.cart.opened', () => {
        setExpandedState(true);
        refreshBadgeCounts();
      });
      document.addEventListener('snipcart.cart.closed', () => {
        setExpandedState(false);
        refreshBadgeCounts();
      });
      const updateEvents = ['snipcart.item.added', 'snipcart.item.removed', 'snipcart.order.completed', 'snipcart.cart.confirmed'];
      updateEvents.forEach((eventName) => {
        document.addEventListener(eventName, refreshBadgeCounts);
      });
      document.addEventListener('snipcart.ready', () => {
        refreshBadgeCounts();
        if (window.Snipcart && window.Snipcart.store && typeof window.Snipcart.store.subscribe === 'function') {
          try {
            if (unsubscribeStore) {
              unsubscribeStore();
            }
            unsubscribeStore = window.Snipcart.store.subscribe(() => {
              refreshBadgeCounts();
            });
          } catch (_) {
            unsubscribeStore = null;
          }
        }
        const snipcartRoot = document.getElementById('snipcart');
        if (snipcartRoot) {
          toggles.forEach((btn) => {
            btn.setAttribute('aria-controls', snipcartRoot.id);
          });
        }
      }, { once: true });
    };

    /**
     * Observe le panneau natif pour refléter son état dans les attributs.
     */
    const observeFallback = () => {
      fallbackState.panel = document.getElementById('gd-cart-panel');
      fallbackState.overlay = document.getElementById('gd-cart-overlay');
      if (!fallbackState.panel && !fallbackState.overlay) return;

      const observerConfig = { attributes: true, attributeFilter: ['class', 'aria-hidden', 'hidden'] };
      const observerCallback = () => {
        setExpandedState(computeFallbackExpanded());
        refreshBadgeCounts();
      };

      if (fallbackState.panel) {
        new MutationObserver(observerCallback).observe(fallbackState.panel, observerConfig);
        toggles.forEach((btn) => {
          btn.setAttribute('aria-controls', fallbackState.panel.id);
        });
      }

      if (fallbackState.overlay) {
        new MutationObserver(observerCallback).observe(fallbackState.overlay, observerConfig);
      }

      observerCallback();
    };

    /**
     * Prépare les boutons (type=button, attributs ARIA, badge associé).
     */
    const setupToggles = () => {
      toggleIds.forEach((id) => {
        const button = document.getElementById(id);
        if (!button) return;

        toggles.push(button);
        if (!button.hasAttribute('type')) {
          button.setAttribute('type', 'button');
        }
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', handleToggleClick, { capture: true });

        const badge = button.querySelector('.gd-cart-badge, .gd-cart-badge-mobile, .cart-count');
        if (badge && !badges.includes(badge)) {
          badges.push(badge);
        }
      });
    };

    /**
     * Ajuste l'accessibilité spécifique du widget historique.
     */
    const enhanceWidgetButton = () => {
      const widgetButton = document.getElementById('gd-cart-toggle-widget');
      if (!widgetButton) return;
      widgetButton.setAttribute('aria-label', "Ouvrir l'inventaire");
      const textNode = widgetButton.querySelector('.cart-text');
      if (textNode) {
        textNode.remove();
      }
    };

    /**
     * Point d'entrée principal.
     */
    const init = () => {
      setupToggles();
      if (!toggles.length) return;

      enhanceWidgetButton();
      setExpandedState(false);
      observeFallback();
      bindSnipcartEvents();
      refreshBadgeCounts();
    };

    return { init };
  })();

  CartInteractions.init();

  // Harmoniser la terminologie Snipcart => "Inventaire"
  try {
    const applyInventoryTerms = (root = document) => {
      const sel = '.snipcart, [class*="snipcart-"]';
      const scope = root.querySelector ? root : document;
      const nodes = scope.querySelectorAll ? scope.querySelectorAll(sel) : [];
      nodes.forEach((n) => {
        // Remplace quelques occurrences visibles
        if (n.textContent && n.textContent.includes("Sac d'Aventurier")) {
          n.textContent = n.textContent.replace("Sac d'Aventurier", 'Inventaire');
        }
        if (n.textContent && n.textContent.includes("sac d'aventurier")) {
          n.textContent = n.textContent.replace("sac d'aventurier", 'inventaire');
        }
        if (n.textContent && n.textContent.includes('Votre sac')) {
          n.textContent = n.textContent.replace('Votre sac', 'Votre inventaire');
        }
      });
    };

    document.addEventListener('snipcart.ready', () => {
      applyInventoryTerms();
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((m) => m.addedNodes && m.addedNodes.forEach((node) => {
          if (node.nodeType === 1) applyInventoryTerms(node);
        }));
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } catch(_) {}
});

// Module Navigation
const Navigation = {
  init() {
    this.setupMobileMenu();
    this.setupSmoothScrolling();
    this.setupActiveStates();
  },

  setupMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });

      // Fermer le menu mobile quand on clique sur un lien
      const navLinks = document.querySelectorAll('.nav-link');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
        });
      });
    }
  },

  setupSmoothScrolling() {
    // Smooth scroll pour les liens d'ancrage
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    if (!anchorLinks.length) {
      return;
    }

    const headerElement = document.querySelector('.header') || document.querySelector('header');

    anchorLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') {
          return;
        }

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
          return;
        }

        e.preventDefault();
        const headerHeight = headerElement ? headerElement.offsetHeight : 0;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  },

  setupActiveStates() {
    // Header transparence au scroll
    const header = document.querySelector('.header') || document.querySelector('header');
    if (!header) {
      return;
    }

    const isLegacyHeader = header.classList.contains('header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (isLegacyHeader) {
        // Effet de transparence uniquement pour l'ancien header
        if (scrollTop > 100) {
          header.style.background = 'rgba(26, 26, 26, 0.98)';
        } else {
          header.style.background = 'rgba(26, 26, 26, 0.95)';
        }

        // Maintenir l'en-tête visible sur toutes les tailles d'écran
        header.style.transform = 'translateY(0)';
      }

      // Ancien comportement d'auto-masquage sur mobile supprimé
      // if (window.innerWidth <= 768) {
      //   if (scrollTop > lastScrollTop && scrollTop > 200) {
      //     header.style.transform = 'translateY(-100%)';
      //   } else {
      //     header.style.transform = 'translateY(0)';
      //   }
      // }

      lastScrollTop = scrollTop;
    });
  },
};

// Module Effets de Scroll
const ScrollEffects = {
  init() {
    this.setupScrollTriggers();
    this.setupParallax();
    this.setupCounters();
  },

  setupScrollTriggers() {
    // Observer pour les animations au scroll
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Démarrer les compteurs si c'est une section avec compteurs
          if (entry.target.classList.contains('counter-section')) {
            this.startCounters(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observer les éléments à animer
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach((element) => {
      observer.observe(element);
    });

    // Ajouter la classe fade-in aux cartes (sauf feature-card et testimonial-card pour débugger)
    const cards = document.querySelectorAll('.product-category');
    cards.forEach((card, index) => {
      card.classList.add('fade-in');
      card.style.transitionDelay = `${index * 0.1}s`;
    });
  },

  setupParallax() {
    // Effet parallax simple pour la vidéo hero
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        heroVideo.style.transform = `translateY(${rate}px)`;
      });
    }
  },

  setupCounters() {
    // Animation de compteur (à utiliser si vous ajoutez des statistiques)
    this.startCounters = function (section) {
      const counters = section.querySelectorAll('[data-count]');
      counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = 2000; // 2 secondes
        const step = target / (duration / 16); // 60fps
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            counter.textContent = target.toLocaleString();
            clearInterval(timer);
          } else {
            counter.textContent = Math.floor(current).toLocaleString();
          }
        }, 16);
      });
    };
  },
};

// Module Animations
const Animations = {
  init() {
    this.setupHoverEffects();
    this.setupLoadingStates();
    this.setupMicroInteractions();
  },

  setupHoverEffects() {
    // Effet de survol avancé pour les cartes
    const cards = document.querySelectorAll('.feature-card, .product-category, .testimonial-card');
    cards.forEach((card) => {
      card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('div');
        ripple.className = 'hover-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        card.appendChild(ripple);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  },

  setupLoadingStates() {
    // États de chargement pour les interactions
    const buttons = document.querySelectorAll('.cta-primary, .cta-secondary');
    buttons.forEach((button) => {
      button.addEventListener('click', function (e) {
        // Ajouter classe loading temporaire
        this.classList.add('loading');

        // Simuler un chargement (remplacer par vraie logique)
        setTimeout(() => {
          this.classList.remove('loading');
        }, 1000);
      });
    });
  },

  setupMicroInteractions() {
    // Micro-interactions pour améliorer l'UX

    // Animation des liens avec délai
    const links = document.querySelectorAll('.nav-link, .category-link');
    links.forEach((link) => {
      link.addEventListener('mouseenter', () => {
        link.style.transform = 'translateY(-1px)';
      });

      link.addEventListener('mouseleave', () => {
        link.style.transform = 'translateY(0)';
      });
    });

    // Effet de focus amélioré
    const focusableElements = document.querySelectorAll('button, a, input, select, textarea');
    focusableElements.forEach((element) => {
      element.addEventListener('focus', () => {
        element.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.3)';
      });

      element.addEventListener('blur', () => {
        element.style.boxShadow = '';
      });
    });
  },
};

// Module Performance
const Performance = {
  init() {
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupErrorHandling();
  },

  setupLazyLoading() {
    // Lazy loading pour les images
    if ('IntersectionObserver' in window) {
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach((img) => imageObserver.observe(img));
    }
  },

  setupImageOptimization() {
    // Optimisation des images au chargement
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });

      img.addEventListener('error', () => {
        // Fallback image si l'image ne charge pas
        img.src = 'assets/images/placeholder.jpg';
        img.alt = 'Image non disponible';
      });
    });
  },

  setupErrorHandling() {
    // Gestion des erreurs globales
    window.addEventListener('error', (e) => {
      console.error('Erreur JavaScript:', e.error);
      // Optionnel: envoyer l'erreur à un service de monitoring
    });

    // Gestion des erreurs de ressources
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Promise rejetée:', e.reason);
    });
  },
};

// Utilitaires globaux
const Utils = {
  // Debounce pour optimiser les events de scroll/resize
  debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  },

  // Throttle pour les animations
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Animation fluide de valeurs
  animateValue(element, start, end, duration, callback) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      element.textContent = current;
      if (callback) callback(current);

      if (current === end) {
        clearInterval(timer);
      }
    }, stepTime);
  },

  // Détection de dispositif
  isMobile() {
    return window.innerWidth <= 768;
  },

  isTablet() {
    return window.innerWidth <= 1024 && window.innerWidth > 768;
  },

  // Gestion du local storage avec fallback
  setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage non disponible');
    }
  },

  getStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn('LocalStorage non disponible');
      return null;
    }
  },
};

// Optimisation des performances de scroll
window.addEventListener('scroll', Utils.throttle(() => {
  // Code optimisé pour le scroll
}, 16)); // ~60fps

// Optimisation des performances de resize
window.addEventListener('resize', Utils.debounce(() => {
  // Code pour le resize
  Navigation.setupActiveStates();
}, 250));

// Analytics et tracking (à personnaliser selon vos besoins)
const Analytics = {
  init() {
    // Placeholder pour Google Analytics, Hotjar, etc.
    this.trackPageView();
    this.setupEventTracking();
  },

  trackPageView() {
    // gtag('config', 'GA_TRACKING_ID', {
    //     page_title: document.title,
    //     page_location: window.location.href
    // });
  },

  trackEvent(action, category, label, value) {
    // gtag('event', action, {
    //     event_category: category,
    //     event_label: label,
    //     value: value
    // });
    console.log('Event tracked:', {
      action, category, label, value,
    });
  },

  setupEventTracking() {
    // Tracking des clics sur les CTA
    const ctaButtons = document.querySelectorAll('.cta-primary, .cta-secondary');
    ctaButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.trackEvent('click', 'CTA', button.textContent);
      });
    });

    // Tracking du scroll profondeur
    let maxScroll = 0;
    window.addEventListener('scroll', Utils.throttle(() => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // 25%, 50%, 75%, 100%
          this.trackEvent('scroll', 'Depth', `${maxScroll}%`);
        }
      }
    }, 1000));
  },
};

// Initialiser analytics si nécessaire
// Analytics.init();

// Export pour utilisation dans d'autres modules
window.GeeknDragon = {
  Navigation,
  ScrollEffects,
  Animations,
  Performance,
  Utils,
  Analytics,
};

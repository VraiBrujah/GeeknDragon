/* ========================================================================
   GEEK & DRAGON - EFFETS VISUELS PREMIUM POUR LA BOUTIQUE
   Animations et interactions avancées pour une expérience immersive
   ======================================================================== */
/* eslint-disable max-classes-per-file,
   no-param-reassign,
   class-methods-use-this,
   no-new,
   no-console */

(() => {
  // Configuration des animations
  const ANIMATION_CONFIG = {
    observerOptions: {
      threshold: [0.1, 0.25, 0.5, 0.75],
      rootMargin: '0px 0px -50px 0px',
    },
    delays: {
      card: 100,
      feature: 150,
      stagger: 50,
    },
  };

  // ================================================================
  // SYSTÈME D'ANIMATIONS AU SCROLL
  // ================================================================
  class ScrollAnimations {
    constructor() {
      this.observer = null;
      this.animatedElements = new Set();
      this.init();
    }

    init() {
      this.setupIntersectionObserver();
      this.observeElements();
      this.setupParallaxEffects();
    }

    setupIntersectionObserver() {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        ANIMATION_CONFIG.observerOptions,
      );
    }

    handleIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animateElement(entry.target);
          this.animatedElements.add(entry.target);
        }
      });
    }

    animateElement(element) {
      const animationType = element.dataset.animation || 'fadeInUp';
      const delay = parseInt(element.dataset.delay || '0', 10);

      setTimeout(() => {
        element.classList.add(`animate-${animationType}`);
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, delay);

      // Ajouter un effet de particules pour les cartes premium
      if (element.classList.contains('product-card')) {
        this.addSparkleEffect(element);
      }
    }

    addSparkleEffect(element) {
      const sparkles = document.createElement('div');
      sparkles.className = 'sparkle-container';
      sparkles.innerHTML = `
        <div class="sparkle" style="--delay: 0s; --duration: 2s;"></div>
        <div class="sparkle" style="--delay: 0.5s; --duration: 2.5s;"></div>
        <div class="sparkle" style="--delay: 1s; --duration: 2s;"></div>
      `;

      element.style.position = 'relative';
      element.appendChild(sparkles);

      setTimeout(() => sparkles.remove(), 3000);
    }

    observeElements() {
      // Observer les cartes produits
      document.querySelectorAll('.product-card').forEach((card, index) => {
        card.dataset.animation = 'fadeInUp';
        card.dataset.delay = (index * ANIMATION_CONFIG.delays.stagger).toString();
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        this.observer.observe(card);
      });

      // Observer les feature cards
      document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.dataset.animation = 'scaleIn';
        card.dataset.delay = (index * ANIMATION_CONFIG.delays.feature).toString();
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        this.observer.observe(card);
      });

      // Observer les titres de section
      document.querySelectorAll('.shop-section-title').forEach((title) => {
        title.dataset.animation = 'slideInFromLeft';
        title.style.opacity = '0';
        title.style.transform = 'translateX(-50px)';
        this.observer.observe(title);
      });
    }

    setupParallaxEffects() {
      window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    }

    handleScroll() {
      const { scrollY } = window;
      const speed = 0.5;

      // Effet parallax sur le hero
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        heroContent.style.transform = `translateY(${scrollY * speed}px)`;
      }

      // Effet de floating sur les feature icons
      document.querySelectorAll('.feature-icon').forEach((icon, index) => {
        const offset = Math.sin(scrollY * 0.01 + index) * 3;
        icon.style.transform = `translateY(${offset}px)`;
      });
    }
  }

  // ================================================================
  // EFFETS DE PARTICULES PREMIUM
  // ================================================================
  class ParticleEffects {
    constructor() {
      this.particles = [];
      this.canvas = null;
      this.ctx = null;
      this.init();
    }

    init() {
      this.createCanvas();
      this.bindEvents();
      this.animate();
    }

    createCanvas() {
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.6;
      `;

      this.ctx = this.canvas.getContext('2d');
      this.updateCanvasSize();

      const heroSection = document.querySelector('.hero-boutique');
      if (heroSection) {
        heroSection.appendChild(this.canvas);
      }
    }

    updateCanvasSize() {
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = window.innerWidth * dpr;
      this.canvas.height = window.innerHeight * dpr;
      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
    }

    bindEvents() {
      window.addEventListener('resize', () => this.updateCanvasSize());

      // Créer des particules au survol des cartes
      document.addEventListener('mouseenter', (e) => {
        if (e.target.closest('.product-card')) {
          this.createBurstEffect(e.pageX, e.pageY);
        }
      }, true);
    }

    createBurstEffect(x, y) {
      for (let i = 0; i < 6; i += 1) {
        this.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          decay: 0.02,
          size: Math.random() * 3 + 1,
          color: `hsl(${Math.random() * 60 + 270}, 70%, 60%)`,
        });
      }
    }

    animate() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Mise à jour et rendu des particules
      this.particles = this.particles.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        particle.vy += 0.1; // Gravité

        if (particle.life > 0) {
          this.ctx.save();
          this.ctx.globalAlpha = particle.life;
          this.ctx.fillStyle = particle.color;
          this.ctx.beginPath();
          this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
          return true;
        }
        return false;
      });

      requestAnimationFrame(() => this.animate());
    }
  }

  // ================================================================
  // AMÉLIORATIONS INTERACTIVES
  // ================================================================
  class InteractiveEnhancements {
    constructor() {
      this.init();
    }

    init() {
      this.enhanceButtons();
      this.addHoverEffects();
      this.setupQuantityControls();
      this.addSoundEffects();
      this.setupLoadingStates();
    }

    enhanceButtons() {
      // Effet ripple sur les boutons
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.hero-cta, .add-to-cart-btn');
        if (!button) return;

        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s ease-out;
          pointer-events: none;
        `;

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });

      // Ajouter les keyframes pour l'effet ripple
      this.addRippleStyles();
    }

    addRippleStyles() {
      if (document.getElementById('ripple-styles')) return;

      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1) rotate(180deg);
          }
        }
        
        .sparkle-container {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 20px;
          height: 20px;
          pointer-events: none;
        }
        
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #8b5cf6;
          border-radius: 50%;
          animation: sparkle var(--duration, 2s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
      `;
      document.head.appendChild(style);
    }

    addHoverEffects() {
      // Effet de glow sur les cartes
      document.querySelectorAll('.product-card').forEach((card) => {
        card.addEventListener('mouseenter', () => {
          card.style.filter = 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.4))';
        });

        card.addEventListener('mouseleave', () => {
          card.style.filter = '';
        });
      });

      // Effet de rotation 3D sur les images
      document.querySelectorAll('.product-media').forEach((media) => {
        media.addEventListener('mousemove', (e) => {
          const rect = media.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;

          const rotateX = (y - 0.5) * 10;
          const rotateY = (0.5 - x) * 10;

          media.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });

        media.addEventListener('mouseleave', () => {
          media.style.transform = '';
        });
      });
    }

    setupQuantityControls() {
      // Animations pour les contrôles de quantité
      document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quantity-btn')) {
          e.target.style.transform = 'scale(0.9)';
          setTimeout(() => {
            e.target.style.transform = '';
          }, 100);

          // Effet de confetti sur l'ajout
          if (e.target.classList.contains('plus')) {
            this.createConfettiEffect(e.target);
          }
        }
      });
    }

    createConfettiEffect(element) {
      const colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
      const rect = element.getBoundingClientRect();

      for (let i = 0; i < 5; i += 1) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 4px;
          height: 4px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${rect.left + rect.width / 2}px;
          top: ${rect.top + rect.height / 2}px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          animation: confetti 1s ease-out forwards;
        `;

        confetti.style.setProperty('--x', `${(Math.random() - 0.5) * 100}px`);
        confetti.style.setProperty('--y', `${(Math.random() - 0.5) * 100}px`);

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 1000);
      }
    }

    addSoundEffects() {
      // Créer des sons synthétiques simples
      const audioCtx = window.AudioContext ? new AudioContext() : null;

      const playSound = (frequency, duration = 100) => {
        if (!audioCtx) return;

        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + duration / 1000);
      };

      // Sons pour les interactions
      document.addEventListener('click', (e) => {
        if (e.target.closest('.quantity-btn.plus')) {
          playSound(800, 150);
        } else if (e.target.closest('.quantity-btn.minus')) {
          playSound(400, 150);
        } else if (e.target.closest('.add-to-cart-btn')) {
          playSound(600, 200);
        }
      });
    }

    setupLoadingStates() {
      // États de chargement pour les boutons d'achat
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.add-to-cart-btn');
        if (!button || button.disabled) return;

        button.classList.add('loading');
        button.disabled = true;

        // Simuler un délai de chargement
        setTimeout(() => {
          button.classList.remove('loading');
          button.disabled = false;

          // Animation de succès
          button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          button.innerHTML = `
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span>Ajouté !</span>
          `;

          setTimeout(() => {
            button.style.background = '';
            button.innerHTML = `
              <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
                <circle cx="9" cy="20" r="1"/>
                <circle cx="20" cy="20" r="1"/>
              </svg>
              <span>Ajouter au panier</span>
            `;
          }, 2000);
        }, 1000);
      });
    }
  }

  // ================================================================
  // OPTIMISATIONS PERFORMANCE
  // ================================================================
  class PerformanceOptimizer {
    constructor() {
      this.init();
    }

    init() {
      this.lazyLoadImages();
      this.prefetchResources();
      this.optimizeAnimations();
    }

    lazyLoadImages() {
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        });

        document.querySelectorAll('img[data-src]').forEach((img) => {
          imageObserver.observe(img);
        });
      }
    }

    prefetchResources() {
      // Précharger les images des produits suivants
      const productImages = document.querySelectorAll('.product-media');
      productImages.forEach((img, index) => {
        if (index < 3) { // Précharger les 3 premières images
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = img.src;
          document.head.appendChild(link);
        }
      });
    }

    optimizeAnimations() {
      // Réduire les animations sur les appareils moins puissants
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--boutique-transition', 'none');
        document.documentElement.style.setProperty('--boutique-transition-fast', 'none');
      }
    }
  }

  // ================================================================
  // INITIALISATION
  // ================================================================
  function initializeBoutiquePremium() {
    // Vérifier que nous sommes sur la page boutique
    if (!document.querySelector('.hero-boutique')) return;

    // Initialisation en mode debug seulement
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=1')) {
      console.log('[Boutique Premium] Initialisation...');
    }

    // Initialiser tous les modules
    new ScrollAnimations();
    new ParticleEffects();
    new InteractiveEnhancements();
    new PerformanceOptimizer();

    // Ajouter les styles CSS pour les animations
    const animationStyles = document.createElement('style');
    animationStyles.textContent = `
      @keyframes confetti {
        to {
          transform: translate(var(--x), var(--y)) rotate(360deg);
          opacity: 0;
        }
      }
      
      @keyframes slideInFromLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(animationStyles);

    // Log de succès en mode debug seulement
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=1')) {
      console.log('[Boutique Premium] ✅ Initialisé avec succès');
    }
  }

  // Démarrer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBoutiquePremium);
  } else {
    initializeBoutiquePremium();
  }

  // Exposer les fonctionnalités pour debug
  window.BoutiquePremium = {
    ScrollAnimations,
    ParticleEffects,
    InteractiveEnhancements,
    PerformanceOptimizer,
  };
})();

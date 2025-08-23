/**
 * 🎯 INTERACTIONS JDR PREMIUM - GEEKNDRAGON
 * Micro-interactions immersives pour e-commerce JDR
 */

(function() {
  'use strict';

  // Sons d'interface (optionnels - peuvent être désactivés)
  const SOUNDS = {
    coinDrop: null, // Sera initialisé si l'utilisateur interagit
    treasureFound: null,
    buttonHover: null
  };

  // Initialisation des sons (lazy loading)
  function initSounds() {
    if (SOUNDS.coinDrop) return; // Déjà initialisé
    
    try {
      // Sons synthétiques légers pour éviter les fichiers audio
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      SOUNDS.coinDrop = createCoinSound(audioContext);
      SOUNDS.treasureFound = createTreasureSound(audioContext);
      SOUNDS.buttonHover = createHoverSound(audioContext);
    } catch (e) {
      // Fallback silencieux si AudioContext n'est pas supporté
      console.log('Audio Context non disponible - mode silencieux');
    }
  }

  // Générateur de son "cling" de pièce
  function createCoinSound(ctx) {
    return () => {
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    };
  }

  // Générateur de son "trésor trouvé"
  function createTreasureSound(ctx) {
    return () => {
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(523, ctx.currentTime); // Do
      oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // Mi
      oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // Sol
      
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    };
  }

  // Générateur de son hover subtil
  function createHoverSound(ctx) {
    return () => {
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    };
  }

  // Gestion des interactions panier avec feedback
  function handleAddToCart(button) {
    // Animation visuelle
    button.classList.add('add-to-cart-success');
    
    // Son de pièce
    if (SOUNDS.coinDrop) {
      SOUNDS.coinDrop();
    }
    
    // Notification toast
    showToast('Trésor ajouté à votre sac ! 🏆', 'success');
    
    // Retirer l'animation après
    setTimeout(() => {
      button.classList.remove('add-to-cart-success');
    }, 800);
  }

  // Système de notifications toast
  function showToast(message, type = 'info', duration = 3000) {
    // Retirer les toasts existants
    const existingToasts = document.querySelectorAll('.toast-notification');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Animation de sortie
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 500);
    }, duration);
  }

  // Gestion hover avec effet sonore subtil
  function handleProductHover(card) {
    // Son hover très subtil (optionnel)
    if (SOUNDS.buttonHover && Math.random() > 0.7) { // 30% de chance
      SOUNDS.buttonHover();
    }
    
    // Effet trésor trouvé pour produits premium
    if (card.dataset.price && parseFloat(card.dataset.price) > 100) {
      if (SOUNDS.treasureFound) {
        setTimeout(() => SOUNDS.treasureFound(), 200);
      }
    }
  }

  // Animations au scroll avec Intersection Observer
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-treasure-reveal');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observer les cartes produits
    document.querySelectorAll('.product-card').forEach(card => {
      observer.observe(card);
    });

    // Observer les sections importantes
    document.querySelectorAll('.shop-section, .features-section').forEach(section => {
      observer.observe(section);
    });
  }

  // Amélioration des contrôles de quantité
  function enhanceQuantityControls() {
    document.addEventListener('click', function(e) {
      if (!e.target.matches('.quantity-btn')) return;
      
      e.preventDefault();
      const btn = e.target;
      const target = btn.getAttribute('data-target');
      const qtyEl = document.getElementById('qty-' + target);
      
      if (!qtyEl) return;
      
      let qty = parseInt(qtyEl.textContent, 10);
      const isPlus = btn.classList.contains('plus');
      const isMinus = btn.classList.contains('minus');
      
      if (isPlus) {
        qty = Math.min(qty + 1, 99);
        // Son de pièce ajoutée
        if (SOUNDS.coinDrop) SOUNDS.coinDrop();
      } else if (isMinus) {
        qty = Math.max(qty - 1, 1);
      }
      
      qtyEl.textContent = qty;
      
      // Animation de mise à jour
      qtyEl.style.transform = 'scale(1.3)';
      qtyEl.style.color = '#8b5cf6';
      setTimeout(() => {
        qtyEl.style.transform = 'scale(1)';
        qtyEl.style.color = '';
      }, 200);
      
      // Mettre à jour le bouton d'achat
      const addBtn = btn.closest('.product-card').querySelector('.gd-add-to-cart');
      if (addBtn) {
        addBtn.setAttribute('data-quantity', qty.toString());
      }
    });
  }

  // Badge "Fabriqué au Québec" amélioré
  function enhanceQuebecBadge() {
    const badges = document.querySelectorAll('.quebec-badge, [data-quebec="true"]');
    badges.forEach(badge => {
      badge.classList.add('quebec-badge');
      
      badge.addEventListener('mouseenter', () => {
        if (SOUNDS.treasureFound) {
          setTimeout(() => SOUNDS.treasureFound(), 100);
        }
      });
    });
  }

  // Amélioration du badge "Fabriqué au Québec" dans le hero
  function enhanceHeroQuebecBadge() {
    const heroQuebecSection = document.querySelector('.hero-text .flex.items-center');
    if (heroQuebecSection) {
      heroQuebecSection.classList.add('quebec-badge');
    }
  }

  // Performance tracking léger
  function trackInteractions() {
    let interactions = 0;
    
    document.addEventListener('click', function(e) {
      if (e.target.matches('.btn, .product-card, .quantity-btn')) {
        interactions++;
        
        // Logging léger pour analytics
        if (typeof gtag !== 'undefined') {
          gtag('event', 'interaction', {
            'event_category': 'engagement',
            'event_label': e.target.className,
            'value': interactions
          });
        }
      }
    });
  }

  // Initialisation au chargement
  document.addEventListener('DOMContentLoaded', function() {
    // Initialisation paresseuse des sons au premier clic
    document.addEventListener('click', function() {
      initSounds();
    }, { once: true });
    
    // Gestion des ajouts au panier
    document.addEventListener('click', function(e) {
      if (e.target.closest('.gd-add-to-cart')) {
        handleAddToCart(e.target.closest('.gd-add-to-cart'));
      }
    });
    
    // Hover sur les produits
    document.addEventListener('mouseenter', function(e) {
      if (e.target.matches('.product-card')) {
        handleProductHover(e.target);
      }
    }, true);
    
    // Initialiser les autres fonctionnalités
    initScrollAnimations();
    enhanceQuantityControls();
    enhanceQuebecBadge();
    enhanceHeroQuebecBadge();
    trackInteractions();
    
    console.log('🎯 Interactions JDR Premium initialisées');
  });

  // Préchargement des animations CSS critiques
  const criticalCSS = `
    .product-card { will-change: transform; }
    .btn-primary { will-change: transform, box-shadow; }
    .quantity-btn { will-change: transform; }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);

})();
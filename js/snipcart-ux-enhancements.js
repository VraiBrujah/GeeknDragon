/* ========================================================================
   GEEK & DRAGON - AMÉLIORATIONS UX POUR SNIPCART
   Effets visuels et interactions premium pour le panier
   ======================================================================== */

(() => {
  'use strict';

  // Attendre que Snipcart soit prêt
  function waitForSnipcart(callback) {
    if (window.Snipcart && window.Snipcart.events) {
      callback();
    } else {
      setTimeout(() => waitForSnipcart(callback), 100);
    }
  }

  // Ajouter des effets visuels au panier
  function enhanceCartVisuals() {
    const snipcartEl = document.getElementById('snipcart');
    if (!snipcartEl) return;

    // Ajouter des icônes aux boutons
    enhanceButtons();
    
    // Ajouter des indicateurs visuels
    addVisualIndicators();
    
    // Améliorer le sommaire
    enhanceCartSummary();
    
    // Ajouter des animations
    addAnimations();
    
    // Améliorer les champs personnalisés
    enhanceCustomFields();
    
    // Forcer l'affichage des multiplicateurs
    forceMultiplierDisplay();
  }

  // Améliorer les boutons avec des icônes
  function enhanceButtons() {
    const snipcartEl = document.getElementById('snipcart');
    
    // Bouton de checkout
    const checkoutBtns = snipcartEl.querySelectorAll('.snipcart__button--primary, .snipcart__button--checkout');
    checkoutBtns.forEach(btn => {
      if (!btn.querySelector('.btn-icon')) {
        const icon = document.createElement('span');
        icon.className = 'btn-icon';
        icon.innerHTML = '🛒';
        icon.style.cssText = `
          margin-right: 8px;
          font-size: 1.2em;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        `;
        btn.insertBefore(icon, btn.firstChild);
      }
    });

    // Boutons de suppression
    const removeBtns = snipcartEl.querySelectorAll('.snipcart-item-line__actions button, .__remove-left button');
    removeBtns.forEach(btn => {
      if (!btn.querySelector('.btn-icon')) {
        btn.innerHTML = '<span class="btn-icon">🗑️</span>';
        btn.style.cssText += `
          position: relative;
          overflow: hidden;
        `;
        
        // Effet de confirmation au hover
        btn.addEventListener('mouseenter', () => {
          btn.style.background = 'rgba(239, 68, 68, 0.3)';
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.background = 'rgba(239, 68, 68, 0.1)';
        });
      }
    });

    // Boutons +/-
    const qtyBtns = snipcartEl.querySelectorAll('.__qty-btn');
    qtyBtns.forEach(btn => {
      // Effet de vibration sur clic
      btn.addEventListener('click', () => {
        btn.style.animation = 'none';
        btn.offsetHeight; // Force reflow
        btn.style.animation = 'buttonClick 0.2s ease-out';
      });
    });
  }

  // Ajouter des indicateurs visuels
  function addVisualIndicators() {
    const snipcartEl = document.getElementById('snipcart');
    
    // Indicateur de nombre d'articles
    const itemLines = snipcartEl.querySelectorAll('.snipcart-item-line');
    if (itemLines.length > 0) {
      // Ajouter un badge de compteur
      const header = snipcartEl.querySelector('.snipcart-cart-header, .snipcart-modal__header');
      if (header && !header.querySelector('.cart-counter')) {
        const counter = document.createElement('div');
        counter.className = 'cart-counter';
        counter.textContent = itemLines.length;
        counter.style.cssText = `
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
          animation: counterPulse 2s ease-in-out infinite;
        `;
        header.appendChild(counter);
      }
    }

    // Indicateurs de statut pour les articles
    itemLines.forEach((line, index) => {
      if (!line.querySelector('.item-status')) {
        const status = document.createElement('div');
        status.className = 'item-status';
        status.style.cssText = `
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
          animation: statusBlink 3s ease-in-out infinite;
          animation-delay: ${index * 0.2}s;
        `;
        line.style.position = 'relative';
        line.appendChild(status);
      }
    });
  }

  // Améliorer le sommaire du panier
  function enhanceCartSummary() {
    const snipcartEl = document.getElementById('snipcart');
    const summary = snipcartEl.querySelector('.snipcart-cart-summary, .snipcart-summary');
    
    if (summary && !summary.querySelector('.summary-enhancement')) {
      // Ajouter un indicateur de sécurité
      const securityIndicator = document.createElement('div');
      securityIndicator.className = 'summary-enhancement security-indicator';
      securityIndicator.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          color: #10b981;
        ">
          <span style="font-size: 1.2em;">🔒</span>
          <span style="font-weight: 600;">Paiement 100% sécurisé</span>
        </div>
      `;
      summary.insertBefore(securityIndicator, summary.firstChild);

      // Ajouter un indicateur de livraison
      const shippingIndicator = document.createElement('div');
      shippingIndicator.className = 'summary-enhancement shipping-indicator';
      shippingIndicator.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 12px;
          margin-bottom: 16px;
          font-size: 0.9rem;
          color: #8b5cf6;
        ">
          <span style="font-size: 1.2em;">🚚</span>
          <span style="font-weight: 600;">Livraison rapide et soignée</span>
        </div>
      `;
      summary.insertBefore(shippingIndicator, summary.firstChild);

      // Effet de brillance sur le total
      const totalLine = summary.querySelector('.snipcart-summary-fees__line:last-child, .snipcart-cart-summary__line:last-child');
      if (totalLine) {
        totalLine.style.cssText += `
          position: relative;
          overflow: hidden;
        `;
        
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          animation: shimmer 3s ease-in-out infinite;
        `;
        totalLine.appendChild(shimmer);
      }
    }
  }

  // Ajouter des animations
  function addAnimations() {
    // Ajouter les keyframes CSS si elles n'existent pas
    if (!document.getElementById('ux-animations')) {
      const style = document.createElement('style');
      style.id = 'ux-animations';
      style.textContent = `
        @keyframes buttonClick {
          0% { transform: scale(1); }
          50% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
        
        @keyframes counterPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes statusBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .snipcart-item-line {
          animation: slideInFromRight 0.4s ease-out !important;
        }
        
        .cart-notification {
          position: fixed;
          top: 100px;
          right: 20px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          z-index: 10000;
          animation: slideInFromRight 0.5s ease-out;
          font-weight: 600;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Améliorer les champs personnalisés
  function enhanceCustomFields() {
    const snipcartEl = document.getElementById('snipcart');
    const customFields = snipcartEl.querySelectorAll('.snipcart-item-line__custom-field');
    
    customFields.forEach(field => {
      if (!field.querySelector('.field-icon')) {
        const nameEl = field.querySelector('.snipcart-item-line__custom-field-name');
        const valueEl = field.querySelector('.snipcart-item-line__custom-field-value');
        
        if (nameEl && valueEl) {
          // Ajouter des icônes basées sur le type de champ
          const fieldName = nameEl.textContent.toLowerCase();
          let icon = '⚙️';
          
          if (fieldName.includes('multiplicateur') || fieldName.includes('multiplier')) {
            icon = '✖️';
          } else if (fieldName.includes('langue') || fieldName.includes('language')) {
            icon = '🌐';
          }
          
          const iconEl = document.createElement('span');
          iconEl.className = 'field-icon';
          iconEl.textContent = icon;
          iconEl.style.cssText = `
            margin-right: 8px;
            font-size: 1.1em;
            opacity: 0.8;
          `;
          nameEl.insertBefore(iconEl, nameEl.firstChild);
          
          // Effet hover sur les champs
          field.addEventListener('mouseenter', () => {
            field.style.background = 'rgba(15, 23, 42, 0.8)';
            field.style.borderColor = 'rgba(139, 92, 246, 0.4)';
          });
          
          field.addEventListener('mouseleave', () => {
            field.style.background = 'rgba(15, 23, 42, 0.6)';
            field.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          });
        }
      }
    });
  }

  // Forcer l'affichage des multiplicateurs dans le sommaire
  function forceMultiplierDisplay() {
    const snipcartEl = document.getElementById('snipcart');
    if (!snipcartEl) return;

    // Chercher les éléments de sommaire
    const summaryElements = snipcartEl.querySelectorAll('.snipcart-cart-summary, .snipcart-order-summary, .snipcart-checkout .snipcart-summary');
    
    summaryElements.forEach(summary => {
      // Chercher tous les articles dans le sommaire
      const itemLines = summary.querySelectorAll('.snipcart-item-line');
      
      itemLines.forEach(itemLine => {
        // Vérifier si les champs personnalisés existent déjà
        let customFields = itemLine.querySelector('.snipcart-item-line__custom-fields');
        
        if (!customFields) {
          // Créer la section des champs personnalisés si elle n'existe pas
          customFields = document.createElement('div');
          customFields.className = 'snipcart-item-line__custom-fields';
          customFields.style.cssText = `
            display: flex !important;
            flex-direction: column !important;
            gap: 0.25rem !important;
            margin-top: 0.5rem !important;
            padding: 0.5rem !important;
            background: rgba(139, 92, 246, 0.05) !important;
            border-radius: 8px !important;
            border: 1px solid rgba(139, 92, 246, 0.1) !important;
          `;
          
          // Ajouter le multiplicateur par défaut x100
          const multiplierField = document.createElement('div');
          multiplierField.className = 'snipcart-item-line__custom-field';
          multiplierField.setAttribute('data-name', 'multiplicateur');
          multiplierField.innerHTML = `
            <div class="snipcart-item-line__custom-field-name" style="
              font-weight: 500 !important;
              color: var(--panier-muted) !important;
              font-size: 0.875rem !important;
            ">Multiplicateur</div>
            <div class="snipcart-item-line__custom-field-value" style="
              font-weight: 700 !important;
              color: var(--panier-accent) !important;
              background: rgba(139, 92, 246, 0.1) !important;
              padding: 0.125rem 0.5rem !important;
              border-radius: 4px !important;
              font-size: 0.875rem !important;
            ">x100</div>
          `;
          multiplierField.style.cssText = `
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 0.25rem 0 !important;
          `;
          
          customFields.appendChild(multiplierField);
          itemLine.appendChild(customFields);
        } else {
          // Forcer l'affichage si elle existe déjà
          customFields.style.display = 'flex !important';
          customFields.style.visibility = 'visible !important';
          customFields.style.opacity = '1 !important';
        }
      });
    });
  }

  // Notifications de panier
  function showCartNotification(message, type = 'success') {
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    
    if (type === 'error') {
      notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideInFromRight 0.5s ease-out reverse';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  // Initialisation
  waitForSnipcart(() => {
    // Améliorer le panier initial
    enhanceCartVisuals();
    
    // Observer les changements
    const observer = new MutationObserver(() => {
      enhanceCartVisuals();
    });
    
    const snipcartEl = document.getElementById('snipcart');
    if (snipcartEl) {
      observer.observe(snipcartEl, {
        childList: true,
        subtree: true
      });
    }
    
    // Écouter les événements Snipcart
    if (window.Snipcart.events) {
      window.Snipcart.events.on('item.added', () => {
        showCartNotification('Article ajouté au panier ! 🛒');
        setTimeout(enhanceCartVisuals, 300);
      });
      
      window.Snipcart.events.on('item.removed', () => {
        showCartNotification('Article retiré du panier', 'error');
        setTimeout(enhanceCartVisuals, 300);
      });
      
      window.Snipcart.events.on('cart.opened', () => {
        setTimeout(enhanceCartVisuals, 100);
      });
      
      window.Snipcart.events.on('checkout.opened', () => {
        setTimeout(() => {
          enhanceCartVisuals();
          forceMultiplierDisplay();
        }, 300);
      });
      
      window.Snipcart.events.on('checkout.step', () => {
        setTimeout(() => {
          forceMultiplierDisplay();
        }, 200);
      });
    }
    
    console.log('[UX] Améliorations Snipcart activées');
  });

  // Exposer les fonctions
  window.GD = window.GD || {};
  window.GD.enhanceCart = enhanceCartVisuals;
  window.GD.showCartNotification = showCartNotification;

})();
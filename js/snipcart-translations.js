/* ========================================================================
   TRADUCTIONS SNIPCART SIMPLES ET ROBUSTES
   ======================================================================== */

(() => {
  'use strict';

  // Fonction principale de traduction
  function translateSnipcart() {
    const lang = localStorage.getItem('lang') || 'fr';
    
    // Traductions directes
    const translations = {
      fr: {
        multiplier: 'Multiplicateur',
        language: 'Langue',
        quantity: 'Quantité',
        remove: 'Retirer',
        cart: 'Panier',
        checkout: 'Commander',
        total: 'Total',
        subtotal: 'Sous-total'
      },
      en: {
        multiplier: 'Multiplier', 
        language: 'Language',
        quantity: 'Quantity',
        remove: 'Remove',
        cart: 'Cart',
        checkout: 'Checkout', 
        total: 'Total',
        subtotal: 'Subtotal'
      }
    };

    const t = translations[lang] || translations.fr;

    // Attendre que Snipcart soit visible
    const snipcartEl = document.getElementById('snipcart');
    if (!snipcartEl || !snipcartEl.children.length) {
      return;
    }

    // Traduire les éléments de texte
    const elementsToTranslate = [
      // Noms de champs personnalisés
      { selector: '*', text: 'multiplier', replacement: t.multiplier },
      { selector: '*', text: 'language', replacement: t.language },
      
      // Autres éléments courants
      { selector: 'button, span, label, div', text: 'quantity', replacement: t.quantity },
      { selector: 'button, span, label, div', text: 'remove', replacement: t.remove },
      { selector: 'button, span, label, div', text: 'cart', replacement: t.cart },
      { selector: 'button, span, label, div', text: 'checkout', replacement: t.checkout },
      { selector: 'button, span, label, div', text: 'total', replacement: t.total },
      { selector: 'button, span, label, div', text: 'subtotal', replacement: t.subtotal }
    ];

    elementsToTranslate.forEach(({ selector, text, replacement }) => {
      snipcartEl.querySelectorAll(selector).forEach(el => {
        if (el.textContent && el.textContent.trim().toLowerCase() === text.toLowerCase()) {
          el.textContent = replacement;
        }
        
        // Aussi vérifier les attributs
        if (el.title && el.title.toLowerCase() === text.toLowerCase()) {
          el.title = replacement;
        }
        if (el.placeholder && el.placeholder.toLowerCase() === text.toLowerCase()) {
          el.placeholder = replacement;
        }
      });
    });

    console.log(`[Snipcart] Traductions appliquées pour ${lang}`);
  }

  // Observer les changements dans Snipcart
  function setupTranslationObserver() {
    const snipcartEl = document.getElementById('snipcart');
    if (!snipcartEl) return;

    let debounceTimer;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(translateSnipcart, 200);
    });

    observer.observe(snipcartEl, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false
    });

    console.log('[Snipcart] Observer de traduction installé');
  }

  // Attendre que Snipcart soit prêt
  function waitForSnipcart() {
    if (window.Snipcart && window.Snipcart.events) {
      // Snipcart est prêt
      setupTranslationObserver();
      
      // Appliquer les traductions sur les événements Snipcart
      window.Snipcart.events.on('cart.opened', translateSnipcart);
      window.Snipcart.events.on('item.added', () => setTimeout(translateSnipcart, 300));
      window.Snipcart.events.on('item.updated', () => setTimeout(translateSnipcart, 300));
      window.Snipcart.events.on('cart.confirmed', translateSnipcart);
      
      // Traduction initiale
      setTimeout(translateSnipcart, 500);
      
      console.log('[Snipcart] Système de traduction initialisé');
    } else {
      // Réessayer dans 100ms
      setTimeout(waitForSnipcart, 100);
    }
  }

  // Écouter les changements de langue
  function setupLanguageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'lang' || e.key === 'snipcartLanguage') {
        setTimeout(translateSnipcart, 100);
      }
    });

    // Écouter les événements personnalisés de changement de langue
    document.addEventListener('languageChanged', translateSnipcart);
  }

  // Initialisation
  document.addEventListener('DOMContentLoaded', () => {
    setupLanguageListener();
    waitForSnipcart();
  });

  // Exposer la fonction pour utilisation externe
  window.GD = window.GD || {};
  window.GD.translateSnipcart = translateSnipcart;

})();
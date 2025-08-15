/* ========================================================================
   TRADUCTIONS SNIPCART SIMPLES ET ROBUSTES
   ======================================================================== */

(() => {
  'use strict';

  // Fonction principale de traduction
  function translateSnipcart() {
    const lang = localStorage.getItem('lang') || 'fr';
    
    // Traductions complètes incluant les clés Snipcart
    const translations = {
      fr: {
        // Champs personnalisés
        multiplier: 'Multiplicateur',
        language: 'Langue',
        
        // Clés Snipcart standard
        'actions.continue_shopping': 'Continuer les achats',
        'header.title_cart_summary': 'Panier',
        'signin_form.signin': 'Se connecter',
        'item.quantity': 'Quantité',
        'cart.shipping_taxes_calculated_at_checkout': 'Frais de port et taxes calculés à la commande',
        'cart_summary.total': 'Total',
        'actions.checkout': 'Commander',
        'cart.secured_by': 'Sécurisé par',
        'billing.title': 'Facturation',
        'address_form.name': 'Nom complet',
        'address_form.email': 'Adresse e-mail',
        'address_form.address1': 'Adresse',
        'address_form.address2': 'Complément d\'adresse',
        'address_form.city': 'Ville',
        'address_form.country': 'Pays',
        'address_form.province': 'Province',
        'address_form.postalCode': 'Code postal',
        'billing.continue_to_shipping': 'Continuer vers la livraison',
        'shipping.title': 'Livraison',
        'payment.title': 'Paiement',
        'item.remove_item': 'Retirer l\'article'
      },
      en: {
        // Champs personnalisés
        multiplier: 'Multiplier', 
        language: 'Language',
        
        // Clés Snipcart standard
        'actions.continue_shopping': 'Continue shopping',
        'header.title_cart_summary': 'Cart',
        'signin_form.signin': 'Sign in',
        'item.quantity': 'Quantity',
        'cart.shipping_taxes_calculated_at_checkout': 'Shipping and taxes calculated at checkout',
        'cart_summary.total': 'Total',
        'actions.checkout': 'Checkout',
        'cart.secured_by': 'Secured by',
        'billing.title': 'Billing',
        'address_form.name': 'Full name',
        'address_form.email': 'Email address',
        'address_form.address1': 'Address',
        'address_form.address2': 'Address line 2',
        'address_form.city': 'City',
        'address_form.country': 'Country',
        'address_form.province': 'Province/State',
        'address_form.postalCode': 'Postal code',
        'billing.continue_to_shipping': 'Continue to shipping',
        'shipping.title': 'Shipping',
        'payment.title': 'Payment',
        'item.remove_item': 'Remove item'
      }
    };

    const t = translations[lang] || translations.fr;

    // Attendre que Snipcart soit visible
    const snipcartEl = document.getElementById('snipcart');
    if (!snipcartEl || !snipcartEl.children.length) {
      return;
    }

    // Traduire tous les éléments texte (y compris les clés Snipcart)
    snipcartEl.querySelectorAll('*').forEach(el => {
      const text = el.textContent?.trim();
      if (!text || el.children.length > 0) return; // Ignorer les conteneurs
      
      // Vérifier si c'est une clé de traduction ou un texte à traduire
      if (t[text]) {
        el.textContent = t[text];
      }
      
      // Vérifier aussi les attributs
      if (el.title && t[el.title]) {
        el.title = t[el.title];
      }
      if (el.placeholder && t[el.placeholder]) {
        el.placeholder = t[el.placeholder];
      }
      
      // Traductions spéciales pour les labels
      if (el.tagName === 'LABEL' && el.getAttribute('for')) {
        const forAttr = el.getAttribute('for');
        if (forAttr.includes('name') && text.toLowerCase().includes('name')) {
          el.textContent = t['address_form.name'];
        } else if (forAttr.includes('email') && text.toLowerCase().includes('email')) {
          el.textContent = t['address_form.email'];
        }
      }
    });

    console.log(`[Snipcart] Traductions appliquées pour ${lang}`);
  }

  // Observer les changements dans Snipcart
  function setupTranslationObserver() {
    const snipcartEl = document.getElementById('snipcart');
    if (!snipcartEl) return;

    let debounceTimer;
    const observer = new MutationObserver((mutations) => {
      // Vérifier si des changements de texte ont eu lieu
      let hasTextChanges = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData' || 
            (mutation.type === 'childList' && mutation.addedNodes.length > 0)) {
          hasTextChanges = true;
        }
      });

      if (hasTextChanges) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(translateSnipcart, 100);
      }
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
      
      // Appliquer les traductions sur TOUS les événements Snipcart
      const events = [
        'cart.opened', 'cart.closed',
        'item.added', 'item.updated', 'item.removed',
        'cart.confirmed', 'cart.reset',
        'checkout.step.switched',
        'billing.address.updated',
        'shipping.address.updated',
        'shipping.method.selected',
        'payment.method.selected'
      ];
      
      events.forEach(event => {
        window.Snipcart.events.on(event, () => {
          setTimeout(translateSnipcart, 50);
          setTimeout(translateSnipcart, 200);
          setTimeout(translateSnipcart, 500);
        });
      });
      
      // Traductions multiples pour s'assurer que ça marche
      setTimeout(translateSnipcart, 100);
      setTimeout(translateSnipcart, 300);
      setTimeout(translateSnipcart, 600);
      setTimeout(translateSnipcart, 1000);
      
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
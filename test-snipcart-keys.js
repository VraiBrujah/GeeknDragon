/* ========================================================================
   TEST IMMÉDIAT DES TRADUCTIONS SNIPCART
   Coller ce code dans la console pour forcer les traductions
   ======================================================================== */

(() => {
  const snipcartKeys = {
    fr: {
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
      'multiplier': 'Multiplicateur',
      'language': 'Langue'
    },
    en: {
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
      'multiplier': 'Multiplier',
      'language': 'Language'
    }
  };

  function forceTranslateSnipcart() {
    const lang = localStorage.getItem('lang') || 'fr';
    const translations = snipcartKeys[lang] || snipcartKeys.fr;
    const snipcart = document.getElementById('snipcart');
    
    if (!snipcart) {
      console.log('❌ Snipcart non trouvé');
      return;
    }

    let translatedCount = 0;
    
    // Traduire tous les éléments de texte
    snipcart.querySelectorAll('*').forEach(el => {
      const text = el.textContent?.trim();
      
      // Ignorer les éléments avec des enfants (conteneurs)
      if (!text || el.children.length > 0) return;
      
      // Chercher une traduction exacte
      if (translations[text]) {
        console.log(`🔄 Traduction: "${text}" → "${translations[text]}"`);
        el.textContent = translations[text];
        translatedCount++;
      }
      
      // Vérifier attributs
      if (el.placeholder && translations[el.placeholder]) {
        el.placeholder = translations[el.placeholder];
        translatedCount++;
      }
      
      if (el.title && translations[el.title]) {
        el.title = translations[el.title];
        translatedCount++;
      }
    });

    console.log(`✨ ${translatedCount} éléments traduits en ${lang.toUpperCase()}`);
    
    // Répéter dans 1 seconde au cas où
    setTimeout(() => {
      forceTranslateSnipcart();
    }, 1000);
  }

  // Exposer la fonction globalement
  window.forceTranslateSnipcart = forceTranslateSnipcart;
  
  // Exécuter immédiatement
  forceTranslateSnipcart();
  
  console.log('🚀 Test de traduction Snipcart lancé !');
  console.log('💡 Utilisez forceTranslateSnipcart() pour relancer manuellement');
})();
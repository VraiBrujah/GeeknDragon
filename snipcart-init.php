<?php
// Récupération des variables d'environnement Snipcart
$snipcartKey = $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY'];
$snipcartLanguage = $_ENV['SNIPCART_LANGUAGE']
    ?? $_SERVER['SNIPCART_LANGUAGE']
    ?? $lang ?? 'fr'; // Utilise la langue du site si pas définie
$snipcartAddProductBehavior = $_ENV['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? $_SERVER['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? 'standard';

if (!$snipcartAddProductBehavior) {
    $snipcartAddProductBehavior = 'standard';
}

if (!$snipcartKey) {
    throw new RuntimeException('SNIPCART_API_KEY doit être définie.');
}
?>
<div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
<script>
  // Synchronisation des langues entre le site et Snipcart
  const siteLang = '<?= htmlspecialchars($lang ?? 'fr') ?>';
  const storedLang = localStorage.getItem('lang') || localStorage.getItem('snipcartLanguage');
  const currentLang = storedLang || siteLang;
  
  // Synchroniser les deux storages
  localStorage.setItem('lang', currentLang);
  localStorage.setItem('snipcartLanguage', currentLang);
  
  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
    loadStrategy: 'onload',
    config: {
      addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
      locale: currentLang,
      customerAccount: { enabled: true },
      // Configuration des traductions personnalisées
      locales: {
        fr: {
          cart: {
            title: 'Panier',
            empty: 'Votre panier est vide',
            subtotal: 'Sous-total',
            total: 'Total',
            checkout: 'Commander',
            continue_shopping: 'Continuer les achats'
          },
          checkout: {
            title: 'Commande',
            billing_address: 'Adresse de facturation',
            shipping_address: 'Adresse de livraison',
            payment_method: 'Méthode de paiement',
            place_order: 'Passer la commande'
          },
          customer: {
            title: 'Mon compte',
            sign_in: 'Se connecter',
            sign_out: 'Se déconnecter'
          }
        },
        en: {
          cart: {
            title: 'Cart',
            empty: 'Your cart is empty',
            subtotal: 'Subtotal', 
            total: 'Total',
            checkout: 'Checkout',
            continue_shopping: 'Continue shopping'
          },
          checkout: {
            title: 'Checkout',
            billing_address: 'Billing address',
            shipping_address: 'Shipping address',
            payment_method: 'Payment method',
            place_order: 'Place order'
          },
          customer: {
            title: 'My account',
            sign_in: 'Sign in',
            sign_out: 'Sign out'
          }
        }
      }
    },
  };

</script>
<!-- Librairie Snipcart -->
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>

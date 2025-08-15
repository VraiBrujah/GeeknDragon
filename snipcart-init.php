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
  // Configuration avec format de langue correct pour Snipcart
  const siteLang = '<?= htmlspecialchars($lang ?? 'fr') ?>';
  const currentLang = localStorage.getItem('lang') || siteLang;
  
  // Snipcart utilise des codes de langue spécifiques
  const snipcartLang = currentLang === 'en' ? 'en' : 'fr';
  
  localStorage.setItem('snipcartLanguage', snipcartLang);
  
  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
    loadStrategy: 'onload',
    config: {
      addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
      locale: snipcartLang,
      customerAccount: { enabled: true }
    }
  };

  // Forcer la langue après chargement
  document.addEventListener('snipcart.ready', function() {
    if (window.Snipcart && window.Snipcart.api && window.Snipcart.api.session) {
      window.Snipcart.api.session.setLanguage(snipcartLang);
    }
  });

</script>
<!-- Librairie Snipcart -->
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
<!-- Script de traduction -->
<script defer src="/js/snipcart-translations.js?v=<?= filemtime(__DIR__.'/js/snipcart-translations.js') ?>"></script>

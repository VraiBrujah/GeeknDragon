<?php
// Récupération des variables d'environnement Snipcart
$snipcartKey = $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY'];
$snipcartLanguage = $_ENV['SNIPCART_LANGUAGE']
    ?? $_SERVER['SNIPCART_LANGUAGE'];
$snipcartAddProductBehavior = $_ENV['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? $_SERVER['SNIPCART_ADD_PRODUCT_BEHAVIOR']
    ?? 'standard';

if (!$snipcartAddProductBehavior) {
    $snipcartAddProductBehavior = 'standard';
}

if (!$snipcartKey || !$snipcartLanguage) {
    throw new RuntimeException('SNIPCART_API_KEY et SNIPCART_LANGUAGE doivent être définies.');
}
?>
<div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
<script>
  const lang = localStorage.getItem('snipcartLanguage') || '<?= htmlspecialchars($snipcartLanguage) ?>';
  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
    loadStrategy: 'onload',
    version: '3.4.0', // Version CSS fixe pour éviter les breaking changes
    config: {
      addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
      locale: lang,
      customerAccount: { enabled: true },
    },
  };

</script>
<!-- Librairie Snipcart -->
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>

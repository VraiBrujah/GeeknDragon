<?php
// Récupération des variables d'environnement Snipcart
$snipcartKey = getenv('SNIPCART_API_KEY');
$snipcartLanguage = getenv('SNIPCART_LANGUAGE');
$snipcartAddProductBehavior = getenv('SNIPCART_ADD_PRODUCT_BEHAVIOR');

if (!$snipcartKey || !$snipcartLanguage || !$snipcartAddProductBehavior) {
    throw new RuntimeException('SNIPCART_API_KEY, SNIPCART_LANGUAGE et SNIPCART_ADD_PRODUCT_BEHAVIOR doivent être définies.');
}
?>
<div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
<script>
  const lang = localStorage.getItem('snipcartLanguage') || '<?= htmlspecialchars($snipcartLanguage) ?>';
  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
    loadStrategy: 'onload',
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

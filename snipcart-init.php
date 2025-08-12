<?php
$snipcartKey    = getenv('SNIPCART_API_KEY');
$snipcartSecret = getenv('SNIPCART_SECRET_API_KEY');

if (!$snipcartKey || !$snipcartSecret) {
    throw new RuntimeException('Snipcart environment variables missing');
}

// Définition de la langue (fallback sur 'fr' si non définie)
$snipcartLanguage = $snipcartLanguage ?? ($lang ?? 'fr');

// Définition du comportement d'ajout (fallback sur 'overlay')
$snipcartAddProductBehavior = $snipcartAddProductBehavior ?? 'overlay';
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

  // Stockage de la clé secrète si besoin (attention à la sécurité côté client)
  window.SnipcartSecretKey = '<?= htmlspecialchars($snipcartSecret) ?>';
</script>
<!-- Librairie Snipcart -->
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>

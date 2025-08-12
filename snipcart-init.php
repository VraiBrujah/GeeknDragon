<?php
// Récupération de la clé publique depuis l'environnement ou fallback
$snipcartKey = getenv('SNIPCART_API_KEY');
if (!$snipcartKey) {
    // Fallback en dur
    $snipcartKey = 'YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1';
}

// Récupération de la clé secrète depuis l'environnement ou fallback
$snipcartSecret = getenv('SNIPCART_SECRET_API_KEY');
if (!$snipcartSecret) {
    // Fallback en dur
    $snipcartSecret = 'S_MDdhYmU2NWMtYmI5ZC00NmI0LWJjZGUtZDdkYTZjYTRmZTMxNjM4ODkxMjUzODg0NDc4ODU4';
}

// Définition de la langue (fallback sur 'fr' si non définie)
$snipcartLanguage = $snipcartLanguage ?? ($lang ?? 'fr');

// Définition du comportement d'ajout (fallback sur 'overlay')
$snipcartAddProductBehavior = $snipcartAddProductBehavior ?? 'overlay';
?>
<?php if ($snipcartKey): ?>
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
<script
  async
  src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>'"
  onerror="this.onerror=null;this.src='https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js';"
></script>
<?php else: ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY manquante</p>
<?php endif; ?>

<?php
// Récupération de la clé publique depuis l'environnement ou fallback
$snipcartKey = getenv('SNIPCART_API_KEY');
if (!$snipcartKey) {
    // Fallback en dur
    $snipcartKey = 'YmFhMjM0ZDEtM2VhNy00YTVlLWI0NGYtM2ZiOWI2Y2IzYmU1NjM4ODkxMjUzMDE3NzIzMjc1';
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

</script>
<!-- Librairie Snipcart -->
<script async src="https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js"></script>
<!-- Script de personnalisation -->
<script defer src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"></script>
<?php else: ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY manquante</p>
<?php endif; ?>

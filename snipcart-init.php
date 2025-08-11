<?php
$snipcartKey = $snipcartKey ?? getenv('SNIPCART_API_KEY');
$snipcartLanguage = $snipcartLanguage ?? 'fr';
$snipcartAddProductBehavior = $snipcartAddProductBehavior ?? 'overlay';
?>
<?php if ($snipcartKey): ?>
<div hidden id="snipcart" data-api-key="<?= htmlspecialchars($snipcartKey) ?>"></div>
<script>
  const lang = localStorage.getItem('snipcartLanguage') || '<?= htmlspecialchars($snipcartLanguage) ?>';
  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
    loadStrategy: 'onload',
    customerAccountEnabled: true,
    config: {
      addProductBehavior: '<?= htmlspecialchars($snipcartAddProductBehavior) ?>',
      locale: lang,
    },
  };
</script>
<script
  async
  src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"
  onerror="this.onerror=null;this.src='https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js';"
></script>
<?php else: ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY missing</p>
<?php endif; ?>

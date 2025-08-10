<?php
$snipcartKey = $snipcartKey ?? getenv('SNIPCART_API_KEY');
$snipcartLanguage = $snipcartLanguage ?? 'fr';
$snipcartLocales = $snipcartLocales ?? 'fr,en';
$snipcartAddProductBehavior = $snipcartAddProductBehavior ?? 'overlay';
?>
<div hidden id="snipcart"
     data-api-key="<?= htmlspecialchars($snipcartKey ?? '') ?>"
     data-config-add-product-behavior="<?= htmlspecialchars($snipcartAddProductBehavior) ?>"
     data-config-locales="<?= htmlspecialchars($snipcartLocales) ?>"
     data-config-language="<?= htmlspecialchars($snipcartLanguage) ?>">
</div>
<?php if (!$snipcartKey): ?>
<p class="text-red-500 text-center">SNIPCART_API_KEY missing</p>
<?php endif; ?>
<script>
  const lang = localStorage.getItem('snipcartLanguage') || '<?= htmlspecialchars($snipcartLanguage) ?>';
  document.getElementById('snipcart').setAttribute('data-config-language', lang);
</script>
<script
  async
  src="/js/snipcart.js?v=<?= filemtime(__DIR__.'/js/snipcart.js') ?>"
  onerror="this.onerror=null;this.src='https://cdn.snipcart.com/themes/v3.4.0/default/snipcart.js';"
></script>

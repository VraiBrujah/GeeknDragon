<?php
// Récupération de la clé publique Snipcart
$snipcartKey = $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY'];

if (!$snipcartKey) {
    throw new RuntimeException('SNIPCART_API_KEY doit être définie.');
}
?>
<script>
  window.SnipcartSettings = {
    publicApiKey: '<?= htmlspecialchars($snipcartKey) ?>',
  };
</script>
<script async src="https://cdn.snipcart.com/sdk/snipcart.js"></script>

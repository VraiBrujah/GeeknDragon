<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = '';
require __DIR__ . '/i18n.php';
$title = $translations['meta']['checkout']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['checkout']['desc'] ?? '';
$extraHead = '<link rel="stylesheet" href="/css/checkout-dnd.css?v=' . filemtime(__DIR__ . '/css/checkout-dnd.css') . '">';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
<?php include 'header.php'; ?>
<main id="main" class="pt-32 flex items-center justify-center min-h-screen">
  <div class="max-w-3xl w-full bg-gray-900/70 backdrop-blur p-8 rounded-3xl border border-yellow-500 shadow-2xl text-center">
    <h1 class="text-3xl font-bold mb-6 text-yellow-400" data-i18n="checkout.title">Finaliser la commande</h1>
    <p class="text-gray-300" data-i18n="checkout.loading">Chargement du module de paiement...</p>
  </div>
</main>
<?php include 'footer.php'; ?>
<script src="/js/app.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    if (window.GDEcommerce && typeof window.GDEcommerce.showCheckout === 'function') {
      window.GDEcommerce.showCheckout();
    }
  });
</script>
</body>
</html>

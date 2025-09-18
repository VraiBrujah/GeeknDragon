<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use GeeknDragon\Core\SessionHelper;

SessionHelper::ensureSession();
$config = require __DIR__ . '/config.php';
$translator = require __DIR__ . '/i18n.php';

$lang = $translator->getCurrentLanguage();
$title = 'Finaliser la commande | Geek & Dragon';
$metaDescription = 'Accédez au module de paiement sécurisé Snipcart pour conclure votre commande.';
$extraHead = '';
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang, ENT_QUOTES, 'UTF-8'); ?>">
<?php include __DIR__ . '/head-common.php'; ?>
<body>
<?php include __DIR__ . '/header.php'; ?>
<main id="main" class="pt-32 flex items-center justify-center min-h-screen">
  <div class="max-w-3xl w-full bg-gray-900/70 backdrop-blur p-8 rounded-3xl border border-yellow-500 shadow-2xl text-center">
    <h1 class="text-3xl font-bold mb-6 text-yellow-400" data-i18n="checkout.title">Finaliser la commande</h1>
    <p class="text-lg mb-6 txt-court text-gray-300" data-i18n="checkout.loading">Chargement du module de paiement...</p>
  </div>
</main>
<?php include __DIR__ . '/footer.php'; ?>
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

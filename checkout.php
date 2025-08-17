<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
$active = '';
require __DIR__ . '/i18n.php';
$title = $translations['meta']['checkout']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['checkout']['desc'] ?? '';
$extraHead = '';

// Decode cart data from query string
$cart = [
    'items' => [],
    'total' => 0,
    'count' => 0,
    'currency' => 'CAD'
];

if (isset($_GET['data'])) {
    $decoded = json_decode($_GET['data'], true);
    if (is_array($decoded)) {
        $cart = array_merge($cart, $decoded);
    }
}
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
<?php
ob_start();
include 'snipcart-init.php';
$snipcartInit = ob_get_clean();
include 'header.php';
echo $snipcartInit;
?>
<main id="main" class="pt-32 flex items-center justify-center min-h-screen">
  <div class="max-w-3xl w-full bg-gray-900/70 backdrop-blur p-8 rounded-3xl border border-yellow-500 shadow-2xl">
    <h1 class="text-3xl font-bold mb-6 text-yellow-400" data-i18n="checkout.title">Résumé de la commande</h1>
    <?php if (empty($cart['items'])): ?>
      <p class="text-gray-300" data-i18n="checkout.empty">Votre panier est vide.</p>
    <?php else: ?>
      <div class="space-y-4 mb-8">
        <?php foreach ($cart['items'] as $item): ?>
          <?php $qty = (int)($item['quantity'] ?? 1); ?>
          <div class="flex justify-between text-gray-200">
            <span><?= htmlspecialchars($item['name']) ?> × <?= $qty ?></span>
            <span><?= number_format(($item['price'] ?? 0) * $qty, 2) ?> <?= htmlspecialchars($cart['currency'] ?? 'CAD') ?></span>
          </div>
        <?php endforeach; ?>
      </div>
      <div class="text-right font-bold text-xl text-yellow-300">
        <span data-i18n="checkout.total">Total :</span>
        <?= number_format($cart['total'] ?? 0, 2) ?> <?= htmlspecialchars($cart['currency'] ?? 'CAD') ?>
      </div>
    <?php endif; ?>
  </div>
</main>
<?php include 'footer.php'; ?>
<script src="/js/app.js"></script>
</body>
</html>

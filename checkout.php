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

function normalize_variants(array $variants): array
{
    ksort($variants);
    foreach ($variants as $k => $v) {
        $variants[$k] = (string) $v;
    }
    return $variants;
}

function merge_cart_items(array $items): array
{
    $merged = [];
    foreach ($items as $item) {
        $variants = normalize_variants($item['variants'] ?? []);
        $key = ($item['id'] ?? '') . '|' . json_encode($variants);
        if (isset($merged[$key])) {
            $merged[$key]['quantity'] += (int) ($item['quantity'] ?? 1);
        } else {
            $item['variants'] = $variants;
            $item['quantity'] = (int) ($item['quantity'] ?? 1);
            $merged[$key] = $item;
        }
    }
    return array_values($merged);
}

$cart['items'] = merge_cart_items($cart['items']);
$cart['count'] = array_sum(array_column($cart['items'], 'quantity'));
$cart['total'] = array_reduce($cart['items'], function ($carry, $it) {
    return $carry + (($it['price'] ?? 0) * ($it['quantity'] ?? 1));
}, 0);
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
    <?php if (empty($cart['items'])) : ?>
      <p class="text-gray-300" data-i18n="checkout.empty">Votre panier est vide.</p>
    <?php else : ?>
      <div class="space-y-4 mb-8">
        <?php foreach ($cart['items'] as $item) : ?>
            <?php $qty = (int) ($item['quantity'] ?? 1); ?>
            <div class="text-gray-200">
            <div class="flex justify-between">
              <span><?= htmlspecialchars($item['name']) ?> × <?= $qty ?></span>
              <span>
                <?= number_format(($item['price'] ?? 0) * $qty, 2) ?>
                <?= htmlspecialchars($cart['currency'] ?? 'CAD') ?>
              </span>
            </div>
            <?php if (!empty($item['variants']) && is_array($item['variants'])) : ?>
              <ul class="ml-4 text-sm text-gray-400 list-disc">
                <?php foreach ($item['variants'] as $variantName => $variantValue) : ?>
                  <li><?= htmlspecialchars($variantName) ?> : <?= htmlspecialchars($variantValue) ?></li>
                <?php endforeach; ?>
              </ul>
            <?php endif; ?>
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

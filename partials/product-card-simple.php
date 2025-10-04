<?php
/**
 * Carte produit SIMPLIFIÉE pour page d'accueil
 * Version allégée sans sélecteurs complexes ni options multiples
 *
 * Variables attendues:
 * @var array $product - Données du produit depuis products.json
 * @var string $lang - Langue actuelle ('fr' ou 'en')
 */

if (!isset($product)) {
    return;
}

$lang = $lang ?? 'fr';
$productId = $product['id'] ?? '';
$productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$productPrice = $product['price'] ?? 0;
$productImage = $product['images'][0] ?? '/media/products/default.webp';
$productUrl = 'product.php?id=' . urlencode($productId);
$productSummary = $lang === 'en' ? ($product['summary_en'] ?? $product['summary'] ?? '') : ($product['summary'] ?? '');

?>
<div class="product-card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
  <a href="<?= htmlspecialchars($productUrl) ?>" class="block">
    <div class="relative aspect-square">
      <img
        src="<?= htmlspecialchars($productImage) ?>"
        alt="<?= htmlspecialchars(strip_tags($productName)) ?>"
        class="w-full h-full object-cover"
        loading="lazy"
      >
    </div>
    <div class="p-4">
      <h3 class="text-lg font-semibold text-white mb-2">
        <?= $productName ?>
      </h3>
      <?php if (!empty($productSummary)): ?>
        <p class="text-sm text-gray-300 mb-3 line-clamp-2">
          <?= htmlspecialchars($productSummary) ?>
        </p>
      <?php endif; ?>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-indigo-400">
          <?= number_format($productPrice, 2) ?> $
        </span>
        <span class="text-sm text-indigo-300 hover:text-indigo-200">
          <?= $lang === 'en' ? 'View details →' : 'Voir détails →' ?>
        </span>
      </div>
    </div>
  </a>
</div>

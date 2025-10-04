<?php
/**
 * Partial OPTIMISÉ pour grille de produits page d'accueil
 * Version allégée utilisant product-card-simple.php
 *
 * Variables attendues:
 * @var string $sectionId - ID unique de la section
 * @var string $sectionTitle - Titre de la section
 * @var array $productIds - Liste des IDs de produits à afficher
 * @var array $products - Tableau des produits depuis products.json
 * @var string $lang - Langue actuelle ('fr' ou 'en')
 */

if (!isset($sectionId) || !isset($productIds) || !isset($products)) {
    error_log('[products-grid-home.php] Variables manquantes');
    return;
}

$sectionTitle = $sectionTitle ?? '';
$lang = $lang ?? 'fr';
?>

<section id="<?= htmlspecialchars($sectionId) ?>" class="py-24 bg-gray-900/80 scroll-mt-24">
  <div class="max-w-6xl mx-auto px-6">

    <?php if (!empty($sectionTitle)): ?>
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-8">
        <?= htmlspecialchars($sectionTitle) ?>
      </h2>
    <?php endif; ?>

    <!-- Grille simple sans scroll horizontal -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <?php
      foreach ($productIds as $productId) {
        if (isset($products[$productId])) {
          $product = $products[$productId];
          $product['id'] = $productId;

          // Utiliser la version SIMPLE de product-card
          include __DIR__ . '/product-card-simple.php';
        }
      }
      ?>
    </div>

  </div>
</section>

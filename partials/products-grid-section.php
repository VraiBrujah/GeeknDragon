<?php
/**
 * Partial réutilisable pour afficher une section de produits avec scroll horizontal
 *
 * Variables attendues:
 * @var string $sectionId - ID unique de la section (ex: 'pieces', 'featured-home')
 * @var string $sectionTitle - Titre de la section
 * @var array $productIds - Liste des IDs de produits à afficher
 * @var array $products - Tableau des produits chargés depuis products.json
 * @var string $lang - Langue actuelle ('fr' ou 'en')
 *
 * @example
 * $sectionId = 'featured-home';
 * $sectionTitle = 'Produits Phares';
 * $productIds = ['coin-merchant-essence-double', 'cards-adventurer-arsenal-190'];
 * include 'partials/products-grid-section.php';
 */

// Vérifications des variables obligatoires
if (!isset($sectionId) || !isset($productIds) || !isset($products)) {
    echo '<!-- DEBUG: Variables manquantes dans products-grid-section.php -->';
    echo '<!-- sectionId: ' . (isset($sectionId) ? 'OK' : 'MANQUANT') . ' -->';
    echo '<!-- productIds: ' . (isset($productIds) ? 'OK' : 'MANQUANT') . ' -->';
    echo '<!-- products: ' . (isset($products) ? 'OK' : 'MANQUANT') . ' -->';
    error_log('[products-grid-section.php] Variables manquantes : sectionId, productIds ou products');
    return;
}

// Valeurs par défaut
$sectionTitle = $sectionTitle ?? '';
$lang = $lang ?? 'fr';
?>

<!-- Section avec grille de produits et scroll horizontal -->
<section id="<?= htmlspecialchars($sectionId) ?>" class="py-24 bg-gray-900/80 scroll-mt-24">
  <div class="max-w-6xl mx-auto px-6">

    <?php if (!empty($sectionTitle)): ?>
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-8">
        <?= htmlspecialchars($sectionTitle) ?>
      </h2>
    <?php endif; ?>

    <!-- Grille de produits avec scroll horizontal -->
    <div class="shop-grid" data-section="<?= htmlspecialchars($sectionId) ?>">
      <?php
      // DEBUG
      echo '<!-- DEBUG: Nombre de productIds: ' . count($productIds) . ' -->';
      echo '<!-- DEBUG: Nombre total produits: ' . count($products) . ' -->';

      // Affichage des produits avec product-card.php
      foreach ($productIds as $productId) {
        echo '<!-- DEBUG: Recherche produit ' . $productId . ' -->';

        if (isset($products[$productId])) {
          echo '<!-- DEBUG: Produit ' . $productId . ' TROUVÉ -->';
          $product = $products[$productId];

          // IMPORTANT : Ajouter l'ID au produit (product-card.php l'attend)
          $product['id'] = $productId;

          // Inclusion du partial product-card.php (même affichage que boutique)
          include __DIR__ . '/product-card.php';
        } else {
          echo '<!-- DEBUG: Produit ' . $productId . ' NON TROUVÉ -->';
        }
      }
      ?>
    </div>

  </div>
</section>

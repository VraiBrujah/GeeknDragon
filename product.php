<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
require __DIR__ . '/i18n.php';

// Inclusion des fonctions unifiées
require_once __DIR__ . '/includes/stock-functions.php';

$active = 'boutique';
$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;

if (!$id || !isset($data[$id])) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}
$product = $data[$id];

// Langue & champs
$productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$productDescHtml = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];
$productDescText = trim(strip_tags($productDescHtml));

// Formatage du produit avec les nouvelles fonctions
$product['id'] = $id;
$formattedProduct = formatProduct($product, $lang, $_GET['from'] ?? 'pieces');

$title = $productName . ' | Geek & Dragon - Boutique D&D';
$metaDescription = $productDescText . ' Fabriqué au Québec avec des matériaux premium.';
$host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
$metaUrl = 'https://' . $host . '/product.php?id=' . urlencode($id);
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');

// Design system unifié
$extraHead = <<<HTML
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" as="style">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/css/design-system.css?v=<?= filemtime(__DIR__.'/css/design-system.css') ?>">
<link rel="stylesheet" href="/css/components.css?v=<?= filemtime(__DIR__.'/css/components.css') ?>">
<meta name="theme-color" content="#8b5cf6">
HTML;

// Les fonctions de stock sont maintenant dans includes/stock-functions.php

// Affichage (FR/EN) pour le titre
$displayName   = str_replace(' – ', '<br>', $product['name']);
$displayNameEn = str_replace(' – ', '<br>', $product['name_en'] ?? $product['name']);

$multipliers   = $product['multipliers'] ?? [];
$languages     = $product['languages'] ?? [];
$customOptions = !empty($languages) ? $languages : $multipliers;
$customLabel   = !empty($languages)
    ? ($translations['product']['language'] ?? ($lang === 'en' ? 'Language' : 'Langue'))
    : ($translations['product']['multiplier'] ?? ($lang === 'en' ? 'Multiplier' : 'Multiplicateur'));
$images        = $product['images'] ?? [];

// Métadonnées pour JSON-LD
$productJsonLd = generateProductJsonLd($formattedProduct, $host);
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
<?php
$snipcartLanguage = $lang;
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
ob_start();
include 'snipcart-init.php';
$snipcartInit = ob_get_clean();
include 'header.php';
echo $snipcartInit;
?>
<main id="main" class="pt-[var(--header-height)] gd-section">
  <div class="gd-container max-w-4xl">
    
    <!-- Navigation de retour -->
    <nav class="mb-8" aria-label="Breadcrumb">
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" 
         class="gd-btn gd-btn--ghost"
         aria-label="Retourner à la section <?= htmlspecialchars($from) ?> de la boutique">
        <svg class="gd-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </nav>

    <!-- Carte produit détaillée -->
    <article class="gd-card" itemscope itemtype="https://schema.org/Product">
      <?php if (!empty($images)) : ?>
        <div class="swiper mb-6 w-full">
          <div class="swiper-wrapper">
            <?php foreach ($images as $img) : ?>
              <?php $isVideo = preg_match('/\.mp4$/i', $img); ?>
              <div class="swiper-slide">
                <div class="product-media-wrapper">
                  <?php if ($isVideo) : ?>
                    <video src="<?= htmlspecialchars($img) ?>" class="product-media" muted playsinline></video>
                  <?php else : ?>
                    <a href="<?= htmlspecialchars($img) ?>" data-fancybox="<?= htmlspecialchars($id) ?>">
                      <img loading="lazy" src="<?= htmlspecialchars($img) ?>"
                           alt="<?= htmlspecialchars('Geek & Dragon – ' . strip_tags($productName)) ?>"
                           class="product-media">
                    </a>
                  <?php endif; ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
          <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
        </div>
      <?php endif; ?>

      <!-- En-tête produit -->
      <header class="gd-card__header text-center">
        <h1 class="gd-heading gd-heading--2" 
            itemprop="name"
            data-name-fr="<?= htmlspecialchars($product['name']) ?>"
            data-name-en="<?= htmlspecialchars($product['name_en'] ?? $product['name']) ?>">
          <?= ($lang === 'en' ? $displayNameEn : $displayName) ?>
        </h1>
        
        <!-- Prix principal -->
        <div class="gd-product-price mt-6" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <span class="gd-price-value" itemprop="price" content="<?= number_format((float)$product['price'], 2, '.', '') ?>">
            <?= number_format((float)$product['price'], 2, '.', '') ?>
          </span>
          <span class="gd-price-currency" itemprop="priceCurrency" content="CAD">$CA</span>
          <meta itemprop="availability" content="<?= $formattedProduct['isInStock'] ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' ?>">
        </div>
      </header>

      <!-- Description produit -->
      <div class="gd-card__body">
        <div class="prose prose-lg prose-invert max-w-none mb-8" itemprop="description">
          <?= $productDescHtml ?>
        </div>



        <!-- Contrôles et ajout au panier -->
        <?php if ($formattedProduct['isInStock']) : ?>
          <div class="gd-product-controls mb-8">
            <!-- Contrôles de quantité avec le partial unifié -->
            <?php include __DIR__ . '/partials/quantity-controls.php'; ?>
          </div>

          <!-- Bouton d'ajout au panier -->
          <button class="snipcart-add-item gd-btn gd-btn--primary gd-btn--lg w-full"
                  data-item-id="<?= htmlspecialchars($id) ?>"
                  data-item-name="<?= htmlspecialchars(strip_tags($productName)) ?>"
                  data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
                  data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
                  data-item-price="<?= htmlspecialchars(number_format((float)$product['price'], 2, '.', '')) ?>"
                  data-item-url="<?= htmlspecialchars($metaUrl) ?>"
                  data-item-quantity="1"
                  <?php if (!empty($customOptions)) : ?>
                  data-item-custom1-name="<?= htmlspecialchars($customLabel) ?>"
                  data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $customOptions))) ?>"
                  data-item-custom1-value="<?= htmlspecialchars((string)$customOptions[0]) ?>"
                  <?php endif; ?>>
            <svg class="gd-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
              <circle cx="9" cy="20" r="1"/>
              <circle cx="20" cy="20" r="1"/>
            </svg>
            <span data-i18n="product.add">Ajouter au panier</span>
          </button>
        <?php else : ?>
          <!-- Bouton rupture de stock -->
          <button class="gd-btn gd-btn--disabled w-full" disabled>
            <svg class="gd-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
            </svg>
            <span data-i18n="product.outOfStock">Rupture de stock</span>
          </button>
        <?php endif; ?>

      </div>

      <!-- Trust indicators dans footer de la carte -->
      <footer class="gd-card__footer">
        <?php include __DIR__ . '/partials/trust-indicators.php'; ?>
      </footer>
    </article>

    <!-- Recommandations ou informations complémentaires -->
    <aside class="mt-12">
      <div class="gd-card text-center">
        <div class="gd-card__body">
          <h3 class="gd-heading gd-heading--4 mb-4">Besoin d'aide ?</h3>
          <p class="gd-text gd-text--muted mb-6">
            Notre équipe est là pour vous accompagner dans votre choix et répondre à toutes vos questions.
          </p>
          <a href="index.php#contact" class="gd-btn gd-btn--outline">
            Nous contacter
          </a>
        </div>
      </div>
    </aside>
  </div>

  <?php include __DIR__ . '/partials/testimonials.php'; ?>
</main>

<?php include 'footer.php'; ?>

<script type="application/ld+json">
<?= json_encode($productJsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?>
</script>

<script src="js/app.js"></script>

<!-- Patch : mettre à jour quantité & multiplicateur juste avant l’ajout -->
<script>
(function(){
  if (window.__snipcartQtyPatch) return;
  window.__snipcartQtyPatch = true;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.snipcart-add-item');
    if (!btn) return;

    const id = btn.getAttribute('data-item-id');
    if (!id) return;

    // Quantité
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-item-quantity', String(q));
    }

    // Multiplicateur (si présent)
    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value;
      btn.setAttribute('data-item-custom1-value', mult);

      // Mettre à jour le nom affiché dans le panier (optionnel)
      const lang = document.documentElement.lang;
      const baseName = (lang === 'en')
        ? (btn.dataset.itemNameEn || btn.getAttribute('data-item-name'))
        : (btn.dataset.itemNameFr || btn.getAttribute('data-item-name'));
      btn.setAttribute('data-item-name', mult !== '1' ? (baseName + ' x' + mult) : baseName);
    }
  }, { passive: true });
})();
</script>
</body>
</html>

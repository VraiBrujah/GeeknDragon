<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
require __DIR__ . '/i18n.php';

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

$title  = $productName . ' | Geek & Dragon';
$metaDescription = $productDescText;
$host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
$metaUrl = 'https://' . $host . '/product.php?id=' . urlencode($id);
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');

function getStock(string $id): ?int
{
    global $snipcartSecret;
    static $cache = [];
    if (isset($cache[$id])) {
        return $cache[$id];
    }
    if ($snipcartSecret) {
        $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        if ($res === false || $status >= 400) {
            return $cache[$id] = null;
        }
        $inv = json_decode($res, true);
        return $cache[$id] = $inv['stock'] ?? $inv['available'] ?? null;
    }
    return $cache[$id] = null;
}

function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;
}

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

// CSS local pour une description propre
$extraHead = <<<HTML
<link rel="stylesheet" href="/css/boutique-premium.css?v=<?= filemtime(__DIR__.'/css/boutique-premium.css') ?>">
<style>
  .main-product {
    background: var(--boutique-bg);
    min-height: 100vh;
  }
  .product-panel {
    background: var(--boutique-gradient-card) !important;
    border: 1px solid var(--boutique-border) !important;
    border-radius: var(--boutique-radius-lg) !important;
    box-shadow: var(--boutique-shadow-xl) !important;
  }
</style>
HTML;
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
<main id="main" class="py-10 pt-[var(--header-height)] main-product">
  <section class="max-w-3xl w-full mx-auto px-6">
    <div class="flex justify-center mb-6">
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="hero-cta">
        <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
        </svg>
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </div>

    <div class="product-card max-w-4xl mx-auto"
         style="background: var(--boutique-gradient-card); border: 1px solid var(--boutique-border); border-radius: var(--boutique-radius-lg); box-shadow: var(--boutique-shadow-xl);"
    >
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

      <h1 class="product-title text-4xl"
          data-name-fr="<?= $displayName ?>"
          data-name-en="<?= $displayNameEn ?>"><?= ($lang === 'en' ? $displayNameEn : $displayName) ?></h1>

      <!-- Description : rendu HTML direct, sans data-desc-* pour éviter les remplacements JS -->
      <div class="product-description text-lg mb-6">
        <?= $productDescHtml ?>
      </div>
      
      <div class="product-price text-2xl mb-6">
        <?= number_format((float)$product['price'], 2, '.', '') ?> $CA
      </div>



      <?php if (inStock($id)) : ?>
        <div class="quantity-controls">
          <div class="quantity-selector" data-id="<?= htmlspecialchars($id) ?>">
            <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
            <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
            <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
          </div>
          
          <?php if (!empty($customOptions)) : ?>
            <div class="custom-options">
              <label for="custom-<?= htmlspecialchars($id) ?>" class="block text-sm font-medium text-gray-300 mb-2">
                <?= htmlspecialchars($customLabel) ?>
              </label>
              <select id="custom-<?= htmlspecialchars($id) ?>" 
                      class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <?php foreach ($customOptions as $option) : ?>
                  <option value="<?= htmlspecialchars((string)$option) ?>">
                    <?= htmlspecialchars((string)$option) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
          <?php endif; ?>
        </div>

        <button class="snipcart-add-item add-to-cart-btn"
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
          <?php endif; ?>
        >
          <svg class="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h2l.4 2m0 0L8 17h8l3-8H5.4z"/>
            <circle cx="9" cy="20" r="1"/>
            <circle cx="20" cy="20" r="1"/>
          </svg>
          <span data-i18n="product.add">Ajouter au panier</span>
        </button>
      <?php else : ?>
        <button class="add-to-cart-btn" disabled>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clip-rule="evenodd"/>
          </svg>
          <span data-i18n="product.outOfStock">Rupture de stock</span>
        </button>
      <?php endif; ?>

      <div class="trust-section mt-8 pt-6 border-t border-gray-600">
        <div class="trust-badges justify-center">
          <div class="trust-badge">
            <span class="trust-icon">🔒</span>
            <span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
          </div>
          
          <div class="trust-badge">
            <img src="/images/payments/visa.svg" alt="Logo Visa" class="w-8 h-6" loading="lazy">
            <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" class="w-8 h-6" loading="lazy">
            <img src="/images/payments/american-express.svg" alt="Logo American Express" class="w-8 h-6" loading="lazy">
          </div>
        </div>
      </div>
    </div>
  </section>

  <?php include __DIR__ . '/partials/testimonials.php'; ?>
</main>

<?php include 'footer.php'; ?>

<script type="application/ld+json">
<?= json_encode([
    '@context' => 'https://schema.org/',
    '@type' => 'Product',
    'name' => $productName,
    'description' => $productDescText,
    'image' => !empty($images) ? ('https://' . $host . '/' . ltrim($images[0], '/')) : null,
    'sku' => $id,
    'offers' => [
        '@type' => 'Offer',
        'price' => (float)$product['price'],
        'priceCurrency' => 'CAD',
        'availability' => inStock($id) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) ?>
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

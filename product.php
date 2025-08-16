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

require_once __DIR__ . '/includes/stock-functions.php';

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
$extraHead = '<link rel="stylesheet" href="/css/product-gallery.css?v=' . filemtime(__DIR__.'/css/product-gallery.css') . '">';
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
<main id="main" class="py-10 pt-[calc(var(--header-height)+2rem)] main-product">
  <section class="max-w-4xl w-full mx-auto px-6">
    <div class="flex justify-center mb-8">
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline">&larr;
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </div>

    <div class="bg-gray-800 p-6 rounded-xl shadow-lg product-panel">
      <?php if (!empty($images)) : ?>
        <!-- Galerie produit moderne -->
        <div class="product-gallery-container mb-6">
          <!-- Image principale -->
          <div class="main-image-container relative">
            <div class="main-image-wrapper" id="main-image-wrapper">
              <?php $firstImage = $images[0]; $isFirstVideo = preg_match('/\.mp4$/i', $firstImage); ?>
              <?php if ($isFirstVideo) : ?>
                <video id="main-media" 
                       src="<?= htmlspecialchars($firstImage) ?>" 
                       class="main-product-media"
                       muted playsinline controls
                       data-type="video"
                       data-src="<?= htmlspecialchars($firstImage) ?>">
                </video>
              <?php else : ?>
                <img id="main-media" 
                     src="<?= htmlspecialchars($firstImage) ?>"
                     alt="<?= htmlspecialchars('Geek & Dragon – ' . strip_tags($productName)) ?>"
                     class="main-product-media"
                     data-type="image"
                     data-src="<?= htmlspecialchars($firstImage) ?>">
              <?php endif; ?>
              
              <!-- Overlay zoom/fullscreen -->
              <div class="media-overlay">
                <button class="zoom-btn" id="zoom-btn" title="Zoom">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    <path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>
                  </svg>
                </button>
                <button class="fullscreen-btn" id="fullscreen-btn" title="Plein écran">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
              
              <!-- Badge 360° ou Vidéo -->
              <div class="media-badges">
                <?php if ($isFirstVideo) : ?>
                  <span class="badge badge-video">Vidéo</span>
                <?php endif; ?>
              </div>
            </div>
          </div>
          
          <!-- Thumbnails -->
          <?php if (count($images) > 1) : ?>
            <div class="thumbnails-container">
              <div class="thumbnails-wrapper" id="thumbnails-wrapper">
                <?php foreach ($images as $index => $img) : ?>
                  <?php $isVideo = preg_match('/\.mp4$/i', $img); ?>
                  <div class="thumbnail <?= $index === 0 ? 'active' : '' ?>" 
                       data-index="<?= $index ?>"
                       data-src="<?= htmlspecialchars($img) ?>"
                       data-type="<?= $isVideo ? 'video' : 'image' ?>">
                    <?php if ($isVideo) : ?>
                      <video src="<?= htmlspecialchars($img) ?>" class="thumbnail-media" muted></video>
                      <div class="video-icon">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.68L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/>
                        </svg>
                      </div>
                    <?php else : ?>
                      <img src="<?= htmlspecialchars($img) ?>" 
                           alt="<?= htmlspecialchars('Image ' . ($index + 1) . ' - ' . strip_tags($productName)) ?>"
                           class="thumbnail-media">
                    <?php endif; ?>
                  </div>
                <?php endforeach; ?>
              </div>
              
              <!-- Navigation thumbnails -->
              <?php if (count($images) > 4) : ?>
                <button class="thumb-nav thumb-prev" id="thumb-prev">‹</button>
                <button class="thumb-nav thumb-next" id="thumb-next">›</button>
              <?php endif; ?>
            </div>
          <?php endif; ?>
        </div>
        
        <!-- Modal fullscreen -->
        <div id="fullscreen-modal" class="fullscreen-modal hidden">
          <div class="fullscreen-content">
            <button class="close-fullscreen" id="close-fullscreen">&times;</button>
            <div class="fullscreen-media-container">
              <img id="fullscreen-media" class="fullscreen-media" alt="">
              <div class="fullscreen-controls">
                <button class="fs-nav fs-prev" id="fs-prev">‹</button>
                <button class="fs-nav fs-next" id="fs-next">›</button>
              </div>
            </div>
            <div class="fullscreen-thumbs" id="fullscreen-thumbs">
              <!-- Thumbnails générées par JS -->
            </div>
          </div>
        </div>
      <?php endif; ?>
      
      <div class="product-info">
      <!-- En-tête produit -->
      <div class="product-header mb-6">
        <h1 class="text-3xl font-bold mb-2 text-center"
            data-name-fr="<?= $displayName ?>"
            data-name-en="<?= $displayNameEn ?>"><?= ($lang === 'en' ? $displayNameEn : $displayName) ?></h1>
        
        <!-- Prix et disponibilité -->
        <div class="product-pricing text-center mb-4">
          <div class="price-container">
            <span class="current-price"><?= number_format((float)$product['price'], 2) ?> CAD</span>
            <?php if (inStock($id)) : ?>
              <span class="stock-status in-stock">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="inline mr-1">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                <span data-i18n="product.inStock">En stock</span>
              </span>
            <?php else : ?>
              <span class="stock-status out-of-stock">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" class="inline mr-1">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                <span data-i18n="product.outOfStock">Rupture de stock</span>
              </span>
            <?php endif; ?>
          </div>
        </div>
        
        <!-- Actions de partage -->
        <div class="product-actions mb-6">
          <div class="social-share">
            <span class="share-label" data-i18n="product.share">Partager :</span>
            <button class="share-btn" data-share="facebook" title="Partager sur Facebook">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button class="share-btn" data-share="twitter" title="Partager sur Twitter">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button class="share-btn" data-share="whatsapp" title="Partager sur WhatsApp">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
            </button>
            <button class="share-btn" data-share="copy" title="Copier le lien">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Description -->
      <div class="product-desc mb-6">
        <?= $productDescHtml ?>
      </div>



      <?php if (inStock($id)) : ?>
        <div class="text-center mb-4 w-full">
          <label class="block mb-2" data-i18n="product.quantity">Quantité</label>
          <div class="flex items-center justify-center gap-4">
<!--
            <?php if (!empty($customOptions)) : ?>
              <select id="multiplier-<?= htmlspecialchars($id) ?>" class="multiplier-select select" data-target="<?= htmlspecialchars($id) ?>">
                <?php foreach ($customOptions as $opt) : ?>
                  <option value="<?= htmlspecialchars((string)$opt) ?>">
                    <?= !empty($languages) ? htmlspecialchars((string)$opt) : 'x' . htmlspecialchars((string)$opt) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            <?php endif; ?>
-->
            <div class="quantity-selector" data-id="<?= htmlspecialchars($id) ?>">
              <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
              <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
              <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
            </div>
          </div>
        </div>

        <button class="snipcart-add-item btn btn-shop"
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
          <span data-i18n="product.add">Ajouter</span>
        </button>
      <?php else : ?>
        <span class="btn btn-shop opacity-60 cursor-not-allowed" disabled data-i18n="product.outOfStock">Rupture de stock</span>
      <?php endif; ?>

      <p class="mt-4 text-center txt-court">
        <span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
        <span class="payment-icons inline-flex gap-2 align-middle ml-2">
          <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy">
          <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
          <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
        </span>
      </p>
      </div> <!-- Fermeture product-info -->
    </div> <!-- Fermeture product-panel -->
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
<script src="/js/product-gallery.js?v=<?= filemtime(__DIR__.'/js/product-gallery.js') ?>"></script>

<!-- Patch : mettre à jour quantité & multiplicateur juste avant l'ajout -->
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

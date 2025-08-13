<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
require __DIR__ . '/i18n.php';

$active = 'boutique';
$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$stockData = json_decode(file_get_contents(__DIR__ . '/data/stock.json'), true) ?? [];
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;

if (!$id || !isset($data[$id])) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}
$product = $data[$id];

$productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$productDesc = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];

// Parse Markdown description to HTML for display
$parsedown = new Parsedown();
$htmlDesc  = $parsedown->text($productDesc);

$title  = $productName . ' | Geek & Dragon';
$metaDescription = $productDesc;
$host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
$metaUrl = 'https://' . $host . '/product.php?id=' . urlencode($id);
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');

function getStock(string $id): ?int
{
    global $snipcartSecret, $stockData;
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
    return $cache[$id] = $stockData[$id] ?? null;
}

function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;
}

$displayName   = str_replace(' – ', '<br>', $product['name']);
$displayNameEn = str_replace(' – ', '<br>', $product['name_en'] ?? $product['name']);
$descriptionEn = $product['description_en'] ?? $product['description'];
$multipliers   = $product['multipliers'] ?? [];
$images        = $product['images'] ?? [];

$extraHead = <<<HTML
<style>
  /* évite @apply en inline : on garde les classes utilitaires dans le HTML */
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
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline">&larr;
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </div>

    <div class="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center card">
      <?php if (!empty($images)) : ?>
      <div class="swiper mb-6 w-full">
        <div class="swiper-wrapper">
          <?php foreach ($images as $img) : ?>
          <div class="swiper-slide">
            <a href="<?= htmlspecialchars($img) ?>" data-fancybox="<?= htmlspecialchars($id) ?>">
              <img loading="lazy" src="<?= htmlspecialchars($img) ?>"
                   alt="<?= htmlspecialchars($product['description']) ?>"
                   data-alt-fr="<?= htmlspecialchars($product['description']) ?>"
                   data-alt-en="<?= htmlspecialchars($descriptionEn) ?>"
                   class="rounded w-full object-cover">
            </a>
          </div>
          <?php endforeach; ?>
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
        <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
      </div>
      <?php endif; ?>

      <h1 class="text-3xl font-bold mb-4 text-center"
          data-name-fr="<?= $displayName ?>"
          data-name-en="<?= $displayNameEn ?>"><?= $displayName ?></h1>

        <div class="mb-6 text-gray-300 text-center"
             data-desc-fr="<?= htmlspecialchars($product['description']) ?>"
             data-desc-en="<?= htmlspecialchars($descriptionEn) ?>">
          <?= $htmlDesc ?>
        </div>

      <?php if (inStock($id)) : ?>
      <div class="text-center mb-4 w-full">
        <label class="block mb-2" data-i18n="product.quantity">Quantité</label>
        <div class="quantity-selector justify-center mx-auto" data-id="<?= htmlspecialchars($id) ?>">
          <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
          <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
          <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
        </div>
      </div>



      <button class="snipcart-add-item btn btn-shop"
        data-item-id="<?= htmlspecialchars($id) ?>"
        data-item-name="<?= htmlspecialchars(strip_tags($productName)) ?>"
        data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
        data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
        data-item-description="<?= htmlspecialchars($productDesc) ?>"
        data-item-description-fr="<?= htmlspecialchars($product['description']) ?>"
        data-item-description-en="<?= htmlspecialchars($product['description_en'] ?? $product['description']) ?>"
        data-item-price="<?= htmlspecialchars(number_format((float)$product['price'], 2, '.', '')) ?>"
        data-item-url="<?= htmlspecialchars($metaUrl) ?>"
        data-item-quantity="1"
        <?php if (!empty($multipliers)) : ?>
          data-item-custom1-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
          data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $multipliers))) ?>"
          data-item-custom1-value="<?= htmlspecialchars((string)$multipliers[0]) ?>"
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
    'description' => $productDesc,
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

<script>window.stock = <?= json_encode([$id => getStock($id)]) ?>;</script>
<script src="js/app.js"></script>

<!-- Patch robuste : met à jour quantité & multiplicateur juste avant l’ajout -->
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

    // Multiplicateur
    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value;
      btn.setAttribute('data-item-custom1-value', mult);
      const lang = document.documentElement.lang;
      const baseName = lang === 'en'
        ? (btn.dataset.itemNameEn || btn.getAttribute('data-item-name'))
        : (btn.dataset.itemNameFr || btn.getAttribute('data-item-name'));
      btn.setAttribute('data-item-name', mult !== '1' ? baseName + ' x' + mult : baseName);
    }
  }, { passive: true });
})();
</script>
</body>
</html>

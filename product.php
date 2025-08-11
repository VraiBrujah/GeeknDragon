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
$title  = $productName . ' | Geek & Dragon';
$metaDescription = $productDesc;
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/product.php?id=' . urlencode($id);
$extraHead = <<<HTML
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center;}
</style>
HTML;
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
$displayName = str_replace(' – ', '<br>', $product['name']);
$displayNameEn = str_replace(' – ', '<br>', $product['name_en'] ?? $product['name']);
$descriptionEn = $product['description_en'] ?? $product['description'];
$multipliers = $product['multipliers'] ?? [];
$images = $product['images'] ?? [];
?>
<!DOCTYPE html>
<html lang="<?= htmlspecialchars($lang) ?>">
<?php include 'head-common.php'; ?>
<body>
<?php include 'header.php'; ?>
<?php
$snipcartLanguage = 'fr';
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
include 'snipcart-init.php';
?>
<main id="main" class="py-42">
  <section class="max-w-md mx-auto px-6">
    <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline mb-6 block mx-auto">&larr; <span data-i18n="product.back">Retour à la boutique</span></a>
    <div class="card">
      <div class="swiper mb-6">
        <div class="swiper-wrapper">
          <?php foreach ($images as $img) : ?>
          <div class="swiper-slide">
            <a href="<?= htmlspecialchars($img) ?>" data-fancybox="<?= htmlspecialchars($id) ?>">
              <img loading="lazy" src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($product['description']) ?>" data-alt-fr="<?= htmlspecialchars($product['description']) ?>" data-alt-en="<?= htmlspecialchars($descriptionEn) ?>" class="rounded">
            </a>
          </div>
          <?php endforeach; ?>
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
        <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
      </div>
      <h1 class="text-3xl font-bold mb-4 text-center" data-name-fr="<?= $displayName ?>" data-name-en="<?= $displayNameEn ?>"><?= $displayName ?></h1>
      <p class="mb-6 text-gray-300 text-center" data-desc-fr="<?= htmlspecialchars($product['description']) ?>" data-desc-en="<?= htmlspecialchars($descriptionEn) ?>"><?= htmlspecialchars($product['description']) ?></p>
      <?php if (inStock($id)) : ?>
      <div class="quantity-selector justify-center mx-auto mb-4" data-id="<?= htmlspecialchars($id) ?>">
        <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
        <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
        <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
      </div>
            <?php if (!empty($multipliers)) : ?>
      <label for="multiplier-<?= htmlspecialchars($id) ?>" class="block mb-4 text-center">
        <span class="sr-only" data-i18n="product.multiplier">Multiplicateur</span>
        <select id="multiplier-<?= htmlspecialchars($id) ?>" class="multiplier-select text-black" data-target="<?= htmlspecialchars($id) ?>">
                <?php foreach ($multipliers as $m) : ?>
                    <?php if ($m == 1) : ?>
          <option value="<?= $m ?>" data-i18n="product.unit">unitaire</option>
                    <?php else : ?>
          <option value="<?= $m ?>">x<?= $m ?></option>
                    <?php endif; ?>
                <?php endforeach; ?>
        </select>
      </label>
            <?php endif; ?>
      <button class="snipcart-add-item btn btn-shop mx-auto block"
              data-item-id="<?= htmlspecialchars($id) ?>" data-item-name="<?= htmlspecialchars(strip_tags($product['name'])) ?>" data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'])) ?>"
              data-item-price="<?= htmlspecialchars($product['price']) ?>" data-item-url="product.php?id=<?= htmlspecialchars($id) ?>"
              data-item-description="<?= htmlspecialchars($product['description']) ?>" data-item-description-en="<?= htmlspecialchars($descriptionEn) ?>"
              data-item-quantity="1"
              <?php if (!empty($multipliers)) : ?>
              data-item-custom1-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
              data-item-custom1-options="<?= implode('|', $multipliers) ?>"
              data-item-custom1-value="<?= $multipliers[0] ?>"
              <?php endif; ?>>
        <span data-i18n="product.add">Ajouter</span> — <?= htmlspecialchars($product['price']) ?> $
      </button>
      <?php else :
            ?><span class="btn btn-shop" disabled data-i18n="product.outOfStock">Rupture de stock</span><?php
      endif; ?>
      <p class="mt-4 text-center txt-court"><span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
        <span class="payment-icons">
          <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy">
          <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy">
          <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy">
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
    'name' => $product['name'],
    'description' => $product['description'],
    'image' => 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/' . ($images[0] ?? ''),
    'sku' => $id,
    'offers' => [
        '@type' => 'Offer',
        'price' => $product['price'],
        'priceCurrency' => 'CAD',
        'availability' => inStock($id) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    ],
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) ?>
</script>
<script>window.stock = <?= json_encode([$id => getStock($id)]) ?>;</script>
<script src="js/app.js"></script>
</body>
</html>

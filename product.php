<?php
$active = 'boutique';
$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$snipcartSecret = getenv('SNIPCART_SECRET_API_KEY');
if (!$id || !isset($data[$id])) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}
$product = $data[$id];
$title  = $product['name'] . ' | Geek & Dragon';
$metaDescription = $product['description'];
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/product.php?id=' . urlencode($id);
$snipcartCssVersion = filemtime(__DIR__ . '/css/snipcart.css');
$extraHead = <<<HTML
<!-- Snipcart styles -->
<link rel="stylesheet" href="/css/snipcart.css?v=$snipcartCssVersion" />
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center;}
  .snipcart-modal__container{background:#1f2937!important;}
  .snipcart .snipcart-button-primary{background-image:linear-gradient(to right,#4f46e5,#7c3aed)!important;border:none;}
  .snipcart .snipcart-button-primary:hover{background-image:linear-gradient(to right,#6366f1,#8b5cf6)!important;}
</style>
HTML;
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');

function getStock(string $id): ?int
{
    global $snipcartSecret;
    if (!$snipcartSecret) {
        return null;
    }
    $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => $snipcartSecret . ':',
    ]);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($res === false || $status >= 400) {
        return null;
    }
    $data = json_decode($res, true);
    return $data['stock'] ?? $data['available'] ?? null;
}

function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;
}
$displayName = str_replace(' – ', '<br>', $product['name']);
$multipliers = $product['multipliers'] ?? [];
$images = $product['images'] ?? [];
?>
<!DOCTYPE html>
<html lang="fr">
<?php include 'head-common.php'; ?>
<body>
<?php include 'header.php'; ?>
<?php
$snipcartLanguage = 'fr';
$snipcartLocales = 'fr,en';
$snipcartAddProductBehavior = 'overlay';
include 'snipcart-init.php';
?>
<main class="pt-32 pb-20">
  <section class="max-w-md mx-auto px-6">
    <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline mb-6 block mx-auto">&larr; <span data-i18n="product.back">Retour à la boutique</span></a>
    <div class="card">
      <div class="swiper mb-6">
        <div class="swiper-wrapper">
          <?php foreach ($images as $img) : ?>
          <div class="swiper-slide">
            <a href="<?= htmlspecialchars($img) ?>" data-fancybox="<?= htmlspecialchars($id) ?>">
              <img loading="lazy" src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($product['description']) ?>" class="rounded">
            </a>
          </div>
          <?php endforeach; ?>
        </div>
        <div class="swiper-pagination"></div>
        <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
        <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
      </div>
      <?php if (count($images) > 1) : ?>
      <div class="swiper swiper-thumbs mb-6">
        <div class="swiper-wrapper">
            <?php foreach ($images as $img) : ?>
          <div class="swiper-slide"><img loading="lazy" src="<?= htmlspecialchars($img) ?>" alt="<?= htmlspecialchars($product['description']) ?>" width="100" height="100" class="rounded"></div>
            <?php endforeach; ?>
        </div>
      </div>
      <?php endif; ?>
      <h1 class="text-3xl font-bold mb-4 text-center"><?= $displayName ?></h1>
      <p class="mb-6 text-gray-300 text-center"><?= htmlspecialchars($product['description']) ?></p>
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
              data-item-id="<?= htmlspecialchars($id) ?>" data-item-name="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
              data-item-price="<?= htmlspecialchars($product['price']) ?>" data-item-url="product.php?id=<?= htmlspecialchars($id) ?>"
              data-item-description="<?= htmlspecialchars($product['description']) ?>"
              data-item-quantity="1"
              <?php if (!empty($multipliers)) : ?>
              data-item-custom1-name="Multiplicateur"
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
        </span>
        &nbsp;|&nbsp; <span data-i18n="product.realTimeStock">Stocks mis à jour en temps réel.</span>
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
<script src="js/app.js"></script>
</body>
</html>

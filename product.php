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

// Utilisation de la fonction partagée pour la conversion Markdown
require_once __DIR__ . '/includes/markdown-utils.php';

$productDescHtml = convertMarkdownToHtml($productDesc);

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

// Préparation des langues proposées lorsqu'elles sont définies dans le catalogue.
$languagesRaw = $product['languages'] ?? [];
$languages = [];
if (is_array($languagesRaw)) {
    foreach ($languagesRaw as $languageCode) {
        $normalized = strtoupper(trim((string) $languageCode));
        if ($normalized === '') {
            continue;
        }
        $languages[] = $normalized;
    }
}
$languages = array_values(array_unique($languages));
$languageLabels = [];
foreach ($languages as $code) {
    $languageLabels[$code] = (string) ($translations['product']['languageOptions'][$code] ?? $code);
}
$languageFieldIndex = !empty($languageLabels) ? 1 : null;
$customFieldCursor = $languageFieldIndex !== null ? 2 : 1;
$multiplierFieldIndex = !empty($multipliers) ? $customFieldCursor : null;
$defaultLanguage = $languages[0] ?? '';
$multiplierOptions = array_map(static fn ($value) => (string) $value, $multipliers);

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
  <section class="max-w-6xl mx-auto px-6">
    <div class="flex justify-center mb-6">
      <a href="boutique.php#<?= htmlspecialchars($from) ?>" class="btn btn-outline">&larr;
        <span data-i18n="product.back">Retour à la boutique</span>
      </a>
    </div>

    <div class="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
        
        <!-- Section Image (Gauche) -->
        <div class="bg-gray-900/50 p-6 flex items-center justify-center min-h-[400px]">
          <?php if (!empty($images)) : ?>
          <div class="swiper w-full max-w-lg relative">
            <div class="swiper-wrapper">
              <?php foreach ($images as $img) : ?>
              <div class="swiper-slide">
                <a href="<?= htmlspecialchars($img) ?>" data-fancybox="<?= htmlspecialchars($id) ?>">
                  <img loading="lazy" src="<?= htmlspecialchars($img) ?>"
                       alt="<?= htmlspecialchars($product['description']) ?>"
                       data-alt-fr="<?= htmlspecialchars($product['description']) ?>"
                       data-alt-en="<?= htmlspecialchars($descriptionEn) ?>"
                       class="rounded-lg w-full object-contain h-80">
                </a>
              </div>
              <?php endforeach; ?>
            </div>
            <div class="swiper-button-prev" role="button" aria-label="Image précédente"></div>
            <div class="swiper-button-next" role="button" aria-label="Image suivante"></div>
          </div>
          <?php else : ?>
          <div class="w-full max-w-lg h-96 bg-gray-700 rounded-lg flex items-center justify-center">
            <span class="text-gray-400">Aucune image disponible</span>
          </div>
          <?php endif; ?>
        </div>
        
        <!-- Section Informations Produit (Droite) -->
        <div class="p-8 flex flex-col">
          <div class="flex-1">
            <h1 class="text-3xl lg:text-4xl font-bold mb-4 text-white leading-tight"
                data-name-fr="<?= $displayName ?>"
                data-name-en="<?= $displayNameEn ?>"><?= $displayName ?></h1>

            <div class="text-xl font-bold text-indigo-400 mb-6">
              <?= htmlspecialchars(number_format((float)$product['price'], 2, ',', ' ')) ?> $ CAD
            </div>

            <div class="mb-6 text-gray-200 leading-relaxed product-description">
              <?= $productDescHtml ?>
            </div>
          </div>

          <?php if (inStock($id)) : ?>
          <div class="space-y-6">
            <div>
              <label class="block mb-3 text-lg font-medium text-white" data-i18n="product.quantity">Quantité</label>
              <div class="quantity-selector" data-id="<?= htmlspecialchars($id) ?>">
                <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
                <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
                <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
              </div>
            </div>


            <?php if (!empty($multipliers)) : ?>
            <div class="multiplier-wrapper">
              <label for="multiplier-<?= htmlspecialchars($id) ?>"
                     class="block mb-3 text-lg font-medium text-white"
                     data-i18n="product.multiplier">
                <?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>
              </label>
              <select id="multiplier-<?= htmlspecialchars($id) ?>"
                      class="multiplier-select w-full md:w-64 px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $multiplierFieldIndex ?>">
                <?php foreach ($multiplierOptions as $index => $value) : ?>
                <option value="<?= htmlspecialchars($value) ?>" <?= $index === 0 ? 'selected' : '' ?>><?= htmlspecialchars($value) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <?php endif; ?>

            <?php if ($languageFieldIndex !== null) : ?>
            <div>
              <label for="language-<?= htmlspecialchars($id) ?>" class="block mb-3 text-lg font-medium text-white" data-i18n="product.language">Langue</label>
              <select id="language-<?= htmlspecialchars($id) ?>"
                      class="language-select w-full md:w-64 px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $languageFieldIndex ?>">
                <?php foreach ($languageLabels as $value => $label) : ?>
                <option value="<?= htmlspecialchars($value) ?>" <?= $value === $defaultLanguage ? 'selected' : '' ?>><?= htmlspecialchars($label) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <?php endif; ?>


            <button class="snipcart-add-item btn btn-primary w-full text-lg py-4 font-bold bg-indigo-600 hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
              <?php if ($languageFieldIndex !== null) : ?>
                data-item-custom<?= (int) $languageFieldIndex ?>-name="<?= htmlspecialchars($translations['product']['language'] ?? 'Langue') ?>"
                data-item-custom<?= (int) $languageFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $languages)) ?>"
                data-item-custom<?= (int) $languageFieldIndex ?>-value="<?= htmlspecialchars($defaultLanguage) ?>"
              <?php endif; ?>
              <?php if ($multiplierFieldIndex !== null) : ?>
                data-item-custom<?= (int) $multiplierFieldIndex ?>-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
                data-item-custom<?= (int) $multiplierFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $multiplierOptions)) ?>"
                data-item-custom<?= (int) $multiplierFieldIndex ?>-value="<?= htmlspecialchars($multiplierOptions[0] ?? '') ?>"
              <?php endif; ?>
            >
              🛒 <span data-i18n="product.add">Ajouter au panier</span> — <?= htmlspecialchars(number_format((float)$product['price'], 2, ',', ' ')) ?> $ CAD
            </button>

            <p class="mt-4 text-center text-sm text-gray-400">
              <span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
              <span class="payment-icons inline-flex gap-1 align-middle ml-2">
                <img src="/images/payments/visa.svg" alt="Logo Visa" loading="lazy" class="h-4">
                <img src="/images/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy" class="h-4">
                <img src="/images/payments/american-express.svg" alt="Logo American Express" loading="lazy" class="h-4">
              </span>
            </p>
          </div>

          <?php else : ?>
          <div class="space-y-6">
            <span class="btn w-full text-lg py-4 bg-gray-600 cursor-not-allowed opacity-60" disabled data-i18n="product.outOfStock">Rupture de stock</span>
          </div>
          <?php endif; ?>
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

<!-- Snipcart — initialisation du patch quantité/champs personnalisés -->
<script>
(function () {
  if (window.__snipcartQtyPatchBootstrap) return;
  window.__snipcartQtyPatchBootstrap = true;

  const bootstrap = () => {
    if (typeof window.__ensureSnipcartQtyPatch === 'function') {
      window.__ensureSnipcartQtyPatch();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap, { once: true });
  } else {
    bootstrap();
  }
})();
</script>
</body>
</html>

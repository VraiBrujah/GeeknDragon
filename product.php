<?php
require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';
require __DIR__ . '/i18n.php';

$active = 'boutique';
$id = preg_replace('/[^a-z0-9_-]/i', '', $_GET['id'] ?? '');
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$stockData = json_decode(file_get_contents(__DIR__ . '/data/stock.json'), true) ?? [];
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;
$snipcartSyncRaw = $_ENV['SNIPCART_SYNC'] ?? null;
$forceOfflineStock = false;
if ($snipcartSyncRaw !== null) {
    $syncFlag = filter_var($snipcartSyncRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($syncFlag === false) {
        $forceOfflineStock = true;
    }
}

if (!$id || !isset($data[$id])) {
    http_response_code(404);
    echo 'Produit introuvable';
    exit;
}
$product = $data[$id];
$canonicalProductUrl = gd_build_absolute_url('product.php?id=' . urlencode($id));

// CORRECTION DASHBOARD SNIPCART : Détecter les vrais crawlers Snipcart
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$purpose = $_SERVER['HTTP_X_SNIPCART_PURPOSE'] ?? '';
$isSnipcartCrawler = (
    strpos($userAgent, 'Snipcart/') !== false ||
    $purpose === 'Crawling' ||
    (isset($_GET['format']) && $_GET['format'] === 'json')
);

if ($isSnipcartCrawler) {
    // Snipcart veut du HTML avec les bons attributs, PAS du JSON !
    // On garde le HTML normal mais on s'assure qu'il est correct
    
    // Si c'est explicitement demandé en JSON (debug)
    if (isset($_GET['format']) && $_GET['format'] === 'json') {
        header('Content-Type: application/json');
        
        $productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
        $productSummary = $lang === 'en' ? ($product['summary_en'] ?? $product['summary'] ?? '') : ($product['summary'] ?? '');
        
        $jsonResponse = [
            'id' => $id,
            'name' => $productName,
            'price' => floatval($product['price'] ?? 0),
            'url' => $canonicalProductUrl,
            'description' => $productSummary
        ];
        
        echo json_encode($jsonResponse, JSON_PRETTY_PRINT);
        exit;
    }
    
    // Pour les vrais crawlers Snipcart, on continue avec le HTML normal
    // Ils cherchent un élément avec class="snipcart-add-item" et data-item-id correspondant
}

$productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$descriptionFr = (string) ($product['description'] ?? '');
$descriptionEn = (string) ($product['description_en'] ?? $descriptionFr);
$productDesc = $lang === 'en' ? $descriptionEn : $descriptionFr;

// Utilisation de la fonction partagée pour la conversion Markdown
require_once __DIR__ . '/includes/markdown-utils.php';

$productDescHtmlFr = convertMarkdownToHtml($descriptionFr);
$productDescHtmlEn = $descriptionEn === $descriptionFr
    ? $productDescHtmlFr
    : convertMarkdownToHtml($descriptionEn);
$productDescHtml = $lang === 'en' ? $productDescHtmlEn : $productDescHtmlFr;

// Traitement du résumé comme dans product-card.php
$toPlainText = static function (string $value): string {
    if ($value === '') {
        return '';
    }
    $text = str_replace(["\r\n", "\r"], "\n", $value);
    $text = preg_replace('/^\s{0,3}#{1,6}\s*/mu', '', $text) ?? $text;
    $text = preg_replace('/^\s{0,3}>\s?/mu', '', $text) ?? $text;
    $text = preg_replace('/^\s{0,3}[-*+]\s+/mu', '', $text) ?? $text;
    $text = preg_replace('/!\[(.*?)\]\((.*?)\)/u', '$1', $text) ?? $text;
    $text = preg_replace('/\[(.*?)\]\((.*?)\)/u', '$1', $text) ?? $text;
    $text = preg_replace('/(`{1,3})(.+?)\1/u', '$2', $text) ?? $text;
    $text = preg_replace('/([*_~]{1,2})(.+?)\1/u', '$2', $text) ?? $text;
    $text = strip_tags($text);
    $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
    $text = trim($text);
    return $text !== '' ? $text : trim(strip_tags($value));
};

$summaryRawFr = trim((string) ($product['summary'] ?? ''));
$summaryRawEn = trim((string) ($product['summary_en'] ?? ''));
if ($summaryRawFr === '' && $summaryRawEn !== '') {
    $summaryRawFr = $summaryRawEn;
}
if ($summaryRawEn === '' && $summaryRawFr !== '') {
    $summaryRawEn = $summaryRawFr;
}

$summaryFr = $summaryRawFr !== '' ? $toPlainText($summaryRawFr) : $toPlainText($descriptionFr);
$summaryEn = $summaryRawEn !== '' ? $toPlainText($summaryRawEn) : $toPlainText($descriptionEn);
$summary = $lang === 'en' ? $summaryEn : $summaryFr;

$title  = $productName . ' | Geek & Dragon';
$metaDescription = $productDesc;
$metaUrl = $canonicalProductUrl;
$from = preg_replace('/[^a-z0-9_-]/i', '', $_GET['from'] ?? 'pieces');

/**
 * Retourne le stock courant d'un produit Snipcart avec repli local.
 */
function getStock(string $id): ?int
{
    global $snipcartSecret, $stockData, $forceOfflineStock;
    static $cache = [];
    if (isset($cache[$id])) {
        return $cache[$id];
    }
    if ($snipcartSecret && !$forceOfflineStock) {
        $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
            CURLOPT_TIMEOUT => 2,
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        if ($res !== false && $status < 400) {
            $inv = json_decode($res, true);
            return $cache[$id] = $inv['stock'] ?? $inv['available'] ?? null;
        }
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
$multipliers   = $product['multipliers'] ?? [];
$metals        = $product['metals'] ?? [];
$metalsEn      = $product['metals_en'] ?? [];
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

// Préparation des options de triptyque
$triptychOptions = $product['triptych_options'] ?? [];
$triptychType = $product['triptych_type'] ?? null;

if (!defined('GD_CUSTOM_FIELD_LANGUAGE_INDEX')) {
    define('GD_CUSTOM_FIELD_LANGUAGE_INDEX', 1);
}
if (!defined('GD_CUSTOM_FIELD_MULTIPLIER_INDEX')) {
    define('GD_CUSTOM_FIELD_MULTIPLIER_INDEX', 2);
}
if (!defined('GD_CUSTOM_FIELD_TRIPTYCH_INDEX')) {
    define('GD_CUSTOM_FIELD_TRIPTYCH_INDEX', 1);
}

// Gestion des champs personnalisés avec index dynamiques (comme dans le partial)
$metalFieldIndex = null;
$languageFieldIndex = null;
$triptychFieldIndex = null;
$multiplierFieldIndex = null;

$currentIndex = 1;

// Pour les triptyques, utiliser les options de triptyque
if (!empty($triptychOptions)) {
    $triptychFieldIndex = $currentIndex++;
    $defaultTriptychOption = $triptychOptions[0] ?? '';
} else {
    $defaultTriptychOption = '';
}

// Pour les métaux (pièces personnalisables)
if (!empty($metals)) {
    $metalFieldIndex = $currentIndex++;
    $metalsDisplay = $lang === 'en' ? $metalsEn : $metals;
    $defaultMetal = $metalsDisplay[0] ?? '';
} else {
    $metalsDisplay = [];
    $defaultMetal = '';
}

// Pour les langues (cartes)
if (!empty($languageLabels) && empty($triptychOptions) && empty($metals)) {
    $languageFieldIndex = $currentIndex++;
}

// Pour les multiplicateurs
if (!empty($multipliers)) {
    $multiplierFieldIndex = $currentIndex++;
}

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
      <?php
      $href = 'boutique.php#' . htmlspecialchars($from);
      $text = '&larr; ' . __('product.back', 'Retour à la boutique');
      $i18nKey = '';
      $classes = '';
      ?>
      <a href="<?= $href ?>"
         class="btn btn-primary btn-boutique <?= $classes ?>"
         aria-label="<?= $text ?>"
         title="<?= $text ?>"
         data-i18n="product.back">
        <span class="btn-text-overlay">
          <span class="hidden md:inline"><?= __('buttons.shop.desktop', 'L\'Échoppe') ?></span>
          <span class="md:hidden"><?= __('buttons.shop.mobile', 'Échoppe') ?></span>
        </span>
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
            <div class="swiper-button-prev" role="button" aria-label="<?= __('ui.previousImage', 'Image précédente') ?>"></div>
            <div class="swiper-button-next" role="button" aria-label="<?= __('ui.nextImage', 'Image suivante') ?>"></div>
          </div>
          <?php else : ?>
          <div class="w-full max-w-lg h-96 bg-gray-700 rounded-lg flex items-center justify-center">
            <span class="text-gray-400" data-i18n="ui.noImageAvailable"><?= __('ui.noImageAvailable', 'Aucune image disponible') ?></span>
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
                <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>" aria-label="<?= __('product.decreaseQuantity', 'Diminuer la quantité') ?>">
                  <img src="/media/branding/icons/-.webp" alt="-" class="quantity-btn-icon" loading="lazy">
                </button>
                <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
                <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>" aria-label="<?= __('product.increaseQuantity', 'Augmenter la quantité') ?>">
                  <img src="/media/branding/icons/+.webp" alt="+" class="quantity-btn-icon" loading="lazy">
                </button>
              </div>
            </div>


            <?php if ($metalFieldIndex !== null) : ?>
            <div class="metal-wrapper">
              <label for="metal-<?= htmlspecialchars($id) ?>"
                     class="block mb-3 text-lg font-medium text-white"
                     data-i18n="product.metal">
                <?= htmlspecialchars($translations['product']['metal'] ?? 'Métal') ?>
              </label>
              <select id="metal-<?= htmlspecialchars($id) ?>"
                      class="metal-select w-full md:w-64 px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $metalFieldIndex ?>"
                      data-item-custom-role="metal">
                <?php foreach ($metalsDisplay as $index => $metal) : ?>
                <option value="<?= htmlspecialchars($metal) ?>" <?= $index === 0 ? 'selected' : '' ?>><?= htmlspecialchars(ucfirst($metal)) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <?php endif; ?>

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
                      data-custom-index="<?= (int) $multiplierFieldIndex ?>"
                      data-item-custom-role="multiplier">
                <?php foreach ($multiplierOptions as $index => $value) : ?>
                <option value="<?= htmlspecialchars($value) ?>" <?= $index === 0 ? 'selected' : '' ?>><?= htmlspecialchars($value) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <?php endif; ?>

            <?php if ($triptychFieldIndex !== null) : ?>
            <div>
              <label for="triptych-<?= htmlspecialchars($id) ?>" class="block mb-3 text-lg font-medium text-white">
                <?php
                $triptychLabel = match($triptychType) {
                    'espece' => $translations['product']['triptychSpecies'] ?? 'Espèce',
                    'classe' => $translations['product']['triptychClass'] ?? 'Classe',
                    'historique' => $translations['product']['triptychBackground'] ?? 'Historique',
                    default => $translations['product']['triptychOption'] ?? 'Option'
                };
                echo htmlspecialchars($triptychLabel);
                ?>
              </label>
              <select id="triptych-<?= htmlspecialchars($id) ?>"
                      class="triptych-select w-full md:w-64 px-4 py-2 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $triptychFieldIndex ?>"
                      data-item-custom-role="triptych">
                <?php foreach ($triptychOptions as $option) : ?>
                <option value="<?= htmlspecialchars($option) ?>" <?= $option === $defaultTriptychOption ? 'selected' : '' ?>><?= htmlspecialchars($option) ?></option>
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
                      data-custom-index="<?= (int) $languageFieldIndex ?>"
                      data-item-custom-role="language">
                <?php foreach ($languageLabels as $value => $label) : ?>
                <option value="<?= htmlspecialchars($value) ?>" <?= $value === $defaultLanguage ? 'selected' : '' ?>><?= htmlspecialchars($label) ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <?php endif; ?>


            <button class="snipcart-add-item btn-cart-icon mx-auto"
              data-item-id="<?= htmlspecialchars($id) ?>"
              data-item-name="<?= htmlspecialchars(strip_tags($productName)) ?>"
              data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
              data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
              data-item-description="<?= htmlspecialchars($summary, ENT_QUOTES, 'UTF-8') ?>"
              data-item-description-fr="<?= htmlspecialchars($summaryFr, ENT_QUOTES, 'UTF-8') ?>"
              data-item-description-en="<?= htmlspecialchars($summaryEn, ENT_QUOTES, 'UTF-8') ?>"
              data-item-image="<?= !empty($images) ? ('/' . ltrim(htmlspecialchars($images[0]), '/')) : '' ?>"
              data-item-price="<?= htmlspecialchars(number_format((float)$product['price'], 2, '.', '')) ?>"
              data-item-url="<?= htmlspecialchars($metaUrl) ?>"
              data-item-quantity="1"
              <?php if ($triptychFieldIndex !== null) : ?>
                data-item-custom<?= (int) $triptychFieldIndex ?>-name="<?= htmlspecialchars($triptychLabel ?? 'Option') ?>"
                data-item-custom<?= (int) $triptychFieldIndex ?>-type="dropdown"
                data-item-custom<?= (int) $triptychFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $triptychOptions)) ?>"
                data-item-custom<?= (int) $triptychFieldIndex ?>-value="<?= htmlspecialchars($defaultTriptychOption) ?>"
              <?php endif; ?>
              <?php if ($metalFieldIndex !== null) : ?>
                data-item-custom<?= (int) $metalFieldIndex ?>-name="Metal"
                data-item-custom<?= (int) $metalFieldIndex ?>-type="dropdown"
                data-item-custom<?= (int) $metalFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $metalsDisplay)) ?>"
                data-item-custom<?= (int) $metalFieldIndex ?>-value="<?= htmlspecialchars($defaultMetal) ?>"
              <?php endif; ?>
              <?php if ($languageFieldIndex !== null) : ?>
                data-item-custom<?= (int) $languageFieldIndex ?>-name="<?= htmlspecialchars($translations['product']['language'] ?? 'Langue') ?>"
                data-item-custom<?= (int) $languageFieldIndex ?>-type="dropdown"
                data-item-custom<?= (int) $languageFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $languages)) ?>"
                data-item-custom<?= (int) $languageFieldIndex ?>-value="<?= htmlspecialchars($defaultLanguage) ?>"
              <?php endif; ?>
              <?php if ($multiplierFieldIndex !== null) : ?>
                data-item-custom<?= (int) $multiplierFieldIndex ?>-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
                data-item-custom<?= (int) $multiplierFieldIndex ?>-type="dropdown"
                data-item-custom<?= (int) $multiplierFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $multiplierOptions)) ?>"
                data-item-custom<?= (int) $multiplierFieldIndex ?>-value="<?= htmlspecialchars($multiplierOptions[0] ?? '') ?>"
              <?php endif; ?>
              aria-label="<?= __('product.add', 'Ajouter au panier') ?> — <?= htmlspecialchars(number_format((float)$product['price'], 2, ',', ' ')) ?> $ CAD"
              title="<?= __('product.add', 'Ajouter au panier') ?> — <?= htmlspecialchars(number_format((float)$product['price'], 2, ',', ' ')) ?> $ CAD"
            >
              <img src="/media/branding/icons/ajout.webp"
                   alt="<?= __('product.add', 'Ajouter au panier') ?>"
                   class="btn-cart-icon-img"
                   loading="lazy">
            </button>

            <p class="mt-4 text-center text-sm text-gray-400">
              <span data-i18n="product.securePayment">Paiement sécurisé via Snipcart</span>
              <span class="payment-icons inline-flex gap-1 align-middle ml-2">
                <img src="/media/ui/payments/visa.svg" alt="Logo Visa" loading="lazy" class="h-4">
                <img src="/media/ui/payments/mastercard.svg" alt="Logo Mastercard" loading="lazy" class="h-4">
                <img src="/media/ui/payments/american-express.svg" alt="Logo American Express" loading="lazy" class="h-4">
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

<!-- Synchronisation Snipcart selon documentation officielle -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  /**
   * Synchronise les valeurs des selects avec les attributs Snipcart
   * Méthode conforme à la documentation officielle Snipcart
   */
  const syncSelectToSnipcart = (select) => {
    const productId = select.dataset.target;
    const customIndex = select.dataset.customIndex;
    const button = document.querySelector(`button[data-item-id="${productId}"]`);
    
    if (button && customIndex) {
      const attributeName = `data-item-custom${customIndex}-value`;
      button.setAttribute(attributeName, select.value);
      // Production: log sync supprimé
    }
  };
  
  // Synchroniser au changement et initialiser avec valeurs par défaut
  document.querySelectorAll('select[data-target][data-custom-index]').forEach(select => {
    select.addEventListener('change', () => syncSelectToSnipcart(select));
    // Synchroniser immédiatement avec la valeur par défaut
    syncSelectToSnipcart(select);
  });

  // Production: log init supprimé
});
</script>
</body>
</html>

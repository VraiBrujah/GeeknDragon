<?php
// Variables attendues dans le scope : $product (array), $lang (fr|en), $translations (array)

if (!isset($product['id'])) {
    return;
}
$id = (string) $product['id'];

$nameFr = (string) ($product['name'] ?? '');
$nameEn = (string) ($product['name_en'] ?? $nameFr);
$name = $lang === 'en' ? $nameEn : $nameFr;

$descriptionFr = (string) ($product['description'] ?? '');
$descriptionEn = (string) ($product['description_en'] ?? $descriptionFr);
$description = $lang === 'en' ? $descriptionEn : $descriptionFr;

// Utilisation du cache Markdown optimisé
require_once __DIR__ . '/../includes/markdown-cache.php';

// Génération de clés de cache uniques basées sur l'ID produit
$cacheKeyFr = $id . '_desc_fr';
$cacheKeyEn = $id . '_desc_en';

$descriptionHtmlFr = MarkdownCache::convertToHtml($descriptionFr, $cacheKeyFr);
$descriptionHtmlEn = MarkdownCache::convertToHtml($descriptionEn, $cacheKeyEn);
$descriptionHtml = $lang === 'en' ? $descriptionHtmlEn : $descriptionHtmlFr;

// Conversion optimisée vers texte brut avec cache
$altFr = MarkdownCache::convertToPlainText($descriptionFr, $id . '_alt_fr');
$altEn = MarkdownCache::convertToPlainText($descriptionEn, $id . '_alt_en');
$alt = $lang === 'en' ? $altEn : $altFr;

// Gestion d'un résumé multilingue avec repli sur la description nettoyée
$summaryRawFr = trim((string) ($product['summary'] ?? ''));
$summaryRawEn = trim((string) ($product['summary_en'] ?? ''));
if ($summaryRawFr === '' && $summaryRawEn !== '') {
    $summaryRawFr = $summaryRawEn;
}
if ($summaryRawEn === '' && $summaryRawFr !== '') {
    $summaryRawEn = $summaryRawFr;
}

$summaryFr = $summaryRawFr !== '' ? MarkdownCache::convertToPlainText($summaryRawFr, $id . '_sum_fr') : $altFr;
$summaryEn = $summaryRawEn !== '' ? MarkdownCache::convertToPlainText($summaryRawEn, $id . '_sum_en') : $altEn;

if ($summaryFr === '') {
    $summaryFr = $altFr;
}
if ($summaryEn === '') {
    $summaryEn = $altEn;
}

$summary = $lang === 'en' ? $summaryEn : $summaryFr;

$img = $product['img'] ?? ($product['images'][0] ?? '');
$url = $product['url'] ?? ('product.php?id=' . urlencode($id));
$price = number_format((float) ($product['price'] ?? 0), 2, '.', '');
$multipliers = $product['multipliers'] ?? [];

// Prépare les codes de langue disponibles pour les produits de cartes.
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

// Pour les triptyques, utiliser les options de triptyque au lieu des langues
if (!empty($triptychOptions)) {
    $languageFieldIndex = null; // Pas de sélection de langue pour les triptyques
    $triptychFieldIndex = GD_CUSTOM_FIELD_TRIPTYCH_INDEX;
    $defaultTriptychOption = $triptychOptions[0] ?? '';
} else {
    $languageFieldIndex = !empty($languageLabels) ? GD_CUSTOM_FIELD_LANGUAGE_INDEX : null;
    $triptychFieldIndex = null;
    $defaultTriptychOption = '';
}

$multiplierFieldIndex = !empty($multipliers) ? GD_CUSTOM_FIELD_MULTIPLIER_INDEX : null;
$defaultLanguage = $languages[0] ?? '';
$multiplierOptions = array_map(static fn ($value) => (string) $value, $multipliers);
?>

<?php if (inStock($id)) : ?>
<div class="card h-full flex flex-col bg-gray-800 p-4 rounded-xl shadow
            min-w-[14.5rem] sm:min-w-[15rem]">
  <a href="<?= htmlspecialchars($url) ?>">
    <img src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
         alt="<?= htmlspecialchars($alt) ?>"
         data-alt-fr="<?= htmlspecialchars($altFr) ?>"
         data-alt-en="<?= htmlspecialchars($altEn) ?>"
         class="rounded mb-4 w-full max-h-48 object-contain" 
         loading="lazy"
         onerror="this.src='/media/ui/placeholders/placeholder-product.svg'; this.onerror=null;">
  </a>

  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <h4 class="text-center text-2xl font-semibold mb-2"
        data-name-fr="<?= htmlspecialchars($nameFr) ?>"
        data-name-en="<?= htmlspecialchars($nameEn) ?>">
      <?= htmlspecialchars($name) ?>
    </h4>
  </a>

  <a href="<?= htmlspecialchars($url) ?>" class="text-center mb-4 text-gray-300 flex-grow text-sm leading-relaxed block hover:text-gray-100 transition-colors"
     data-summary-fr="<?= htmlspecialchars($summaryFr) ?>"
     data-summary-en="<?= htmlspecialchars($summaryEn) ?>">
    <?= htmlspecialchars($summary) ?>
  </a>




  <div class="mt-auto w-full flex flex-col items-center gap-4">


          <!-- Bloc quantité -->
          <div class="flex flex-col items-center">
                <label class="mb-2 text-center" data-i18n="product.quantity"><?= __('product.quantity', 'Quantité') ?></label>
                <div class="quantity-selector mx-auto text-center" data-id="<?= htmlspecialchars($id) ?>">
                  <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
                  <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
                  <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
                </div>
          </div>



          <?php if (!empty($multipliers)) : ?>
            <div class="multiplier-wrapper flex flex-col items-center w-full">
              <label for="multiplier-<?= htmlspecialchars($id) ?>"
                     class="mb-2 text-center"
                     data-i18n="product.multiplier">
                <?= __('product.multiplier', 'Multiplicateur') ?>
              </label>
              <select id="multiplier-<?= htmlspecialchars($id) ?>"
                      class="multiplier-select w-full max-w-[12rem] bg-gray-700 text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $multiplierFieldIndex ?>"
                      data-item-custom-role="multiplier">
                <?php foreach ($multiplierOptions as $index => $value) : ?>
                  <option value="<?= htmlspecialchars($value) ?>" <?= $index === 0 ? 'selected' : '' ?>>
                    <?= htmlspecialchars($value) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
          <?php endif; ?>

          <?php if ($triptychFieldIndex !== null) : ?>
            <div class="flex flex-col items-center w-full">
              <label for="triptych-<?= htmlspecialchars($id) ?>" class="mb-2 text-center">
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
                      class="triptych-select w-full max-w-[12rem] bg-gray-700 text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $triptychFieldIndex ?>"
                      data-item-custom-role="triptych">
                <?php foreach ($triptychOptions as $option) : ?>
                  <option value="<?= htmlspecialchars($option) ?>" <?= $option === $defaultTriptychOption ? 'selected' : '' ?>>
                    <?= htmlspecialchars($option) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
          <?php endif; ?>

          <?php if ($languageFieldIndex !== null) : ?>
            <div class="flex flex-col items-center w-full">
              <label for="language-<?= htmlspecialchars($id) ?>" class="mb-2 text-center" data-i18n="product.language"><?= __('product.language', 'Langue') ?></label>
              <select id="language-<?= htmlspecialchars($id) ?>"
                      class="language-select w-full max-w-[12rem] bg-gray-700 text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $languageFieldIndex ?>"
                      data-item-custom-role="language">
                <?php foreach ($languageLabels as $value => $label) : ?>
                  <option value="<?= htmlspecialchars($value) ?>" <?= $value === $defaultLanguage ? 'selected' : '' ?>>
                    <?= htmlspecialchars($label) ?>
                  </option>
                <?php endforeach; ?>
              </select>
            </div>
          <?php endif; ?>



          <!-- Bouton ajouter -->
          <button class="snipcart-add-item btn btn-shop px-6 whitespace-nowrap"
                data-item-id="<?= htmlspecialchars($id) ?>"
                data-item-name="<?= htmlspecialchars(strip_tags($name)) ?>"
                data-item-name-fr="<?= htmlspecialchars(strip_tags($nameFr)) ?>"
                data-item-name-en="<?= htmlspecialchars(strip_tags($nameEn)) ?>"
                data-item-description="<?= htmlspecialchars($summary) ?>"
                data-item-description-fr="<?= htmlspecialchars($summaryFr) ?>"
                data-item-description-en="<?= htmlspecialchars($summaryEn) ?>"
                data-item-price="<?= htmlspecialchars($price) ?>"
                data-item-url="<?= htmlspecialchars($url) ?>"
                data-item-quantity="1"
                <?php if ($triptychFieldIndex !== null) : ?>
                  data-item-custom<?= (int) $triptychFieldIndex ?>-name="<?= htmlspecialchars($triptychLabel ?? 'Option') ?>"
                  data-item-custom<?= (int) $triptychFieldIndex ?>-type="dropdown"
                  data-item-custom<?= (int) $triptychFieldIndex ?>-options="<?= htmlspecialchars(implode('|', $triptychOptions)) ?>"
                  data-item-custom<?= (int) $triptychFieldIndex ?>-value="<?= htmlspecialchars($defaultTriptychOption) ?>"
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
          >
                <span data-i18n="product.add"><?= __('product.add', 'Ajouter') ?></span>
          </button>
        </div>
</div>

<?php endif; ?>

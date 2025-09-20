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

// Utilisation de la fonction partagée pour la conversion Markdown
require_once __DIR__ . '/../includes/markdown-utils.php';

$descriptionHtmlFr = convertMarkdownToHtml($descriptionFr);
$descriptionHtmlEn = convertMarkdownToHtml($descriptionEn);
$descriptionHtml = $lang === 'en' ? $descriptionHtmlEn : $descriptionHtmlFr;

/**
 * Convertit une description Markdown en texte brut pour Snipcart ou les attributs alt.
 */
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

$altFr = $toPlainText($descriptionFr);
$altEn = $toPlainText($descriptionEn);
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

$summaryFr = $summaryRawFr !== '' ? $toPlainText($summaryRawFr) : $altFr;
$summaryEn = $summaryRawEn !== '' ? $toPlainText($summaryRawEn) : $altEn;

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

$languageFieldIndex = !empty($languageLabels) ? 1 : null;
$customFieldCursor = $languageFieldIndex !== null ? 2 : 1;
$multiplierFieldIndex = !empty($multipliers) ? $customFieldCursor : null;
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
         class="rounded mb-4 w-full max-h-48 object-contain" loading="lazy">
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
                <label class="mb-2 text-center" data-i18n="product.quantity">Quantité</label>
                <div class="quantity-selector mx-auto text-center" data-id="<?= htmlspecialchars($id) ?>">
                  <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
                  <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
                  <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
                </div>
          </div>



          <?php if ($languageFieldIndex !== null) : ?>
            <div class="flex flex-col items-center w-full">
              <label for="language-<?= htmlspecialchars($id) ?>" class="mb-2 text-center" data-i18n="product.language">Langue</label>
              <select id="language-<?= htmlspecialchars($id) ?>"
                      class="language-select w-full max-w-[12rem] bg-gray-700 text-gray-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      data-target="<?= htmlspecialchars($id) ?>"
                      data-custom-index="<?= (int) $languageFieldIndex ?>">
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
                data-item-description="<?= htmlspecialchars($alt) ?>"
                data-item-description-fr="<?= htmlspecialchars($altFr) ?>"
                data-item-description-en="<?= htmlspecialchars($altEn) ?>"
                data-item-price="<?= htmlspecialchars($price) ?>"
                data-item-url="<?= htmlspecialchars($url) ?>"
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
                <span data-i18n="product.add">Ajouter</span>
          </button>
        </div>
</div>

<?php endif; ?>

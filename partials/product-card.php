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
		<?php if (!empty($multipliers)) : ?>
		  data-item-custom1-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
		  data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $multipliers))) ?>"
		  data-item-custom1-value="<?= htmlspecialchars((string)$multipliers[0]) ?>"
		<?php endif; ?>
	  >
		<span data-i18n="product.add">Ajouter</span>
	  </button>
	</div>
</div>

<!-- Petit patch local si la page liste n'inclut pas déjà le listener global -->
<script>
(function(){
  if (window.__snipcartQtyPatch) return;
  window.__snipcartQtyPatch = true;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.snipcart-add-item');
    if (!btn) return;

    const id = btn.getAttribute('data-item-id');
    if (!id) return;

    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-item-quantity', String(q));
    }

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
<?php endif; ?>

<?php
// Variables attendues dans le scope : $product (array), $lang (fr|en), $translations (array)

if (!isset($product['id'])) {
    return;
}
$id = (string)$product['id'];

$name        = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$desc        = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];
$img         = $product['img'] ?? ($product['images'][0] ?? '');
$url         = $product['url'] ?? ('/product.php?id=' . urlencode($id));
$price       = number_format((float)$product['price'], 2, '.', '');
$multipliers = $product['multipliers'] ?? [];
$isLanguage  = !empty($multipliers) && preg_match('/fran[cç]ais|english/i', $multipliers[0]);

static $parsedown;
$parsedown = $parsedown ?? new Parsedown();
$htmlDesc  = $parsedown->text($desc);
$isInStock = inStock($id);
?>

<div class="card h-full flex flex-col bg-gray-800 p-4 rounded-xl shadow
            min-w-[21rem] sm:min-w-[22rem] md:min-w-[23rem] <?= $isInStock ? '' : 'oos' ?>">
  <a href="<?= htmlspecialchars($url) ?>">
    <img src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
         alt="<?= htmlspecialchars($desc) ?>"
         data-alt-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
         data-alt-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>"
         class="rounded mb-4 w-full h-48 object-cover" loading="lazy">
  </a>

  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <h4 class="text-center text-2xl font-semibold mb-2"
        data-name-fr="<?= htmlspecialchars($product['name']) ?>"
        data-name-en="<?= htmlspecialchars($product['name_en'] ?? $product['name']) ?>">
      <?= htmlspecialchars($name) ?>
    </h4>
  </a>

  <div class="text-center mb-4 text-gray-300 flex-grow"
     data-desc-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
     data-desc-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>">
    <?= $htmlDesc ?>
  </div>




  <div class="mt-auto w-full flex flex-col items-center gap-4">
    <?php if ($isInStock) : ?>
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
              data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
              data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
              data-item-price="<?= htmlspecialchars($price) ?>"
              data-item-url="<?= htmlspecialchars($url) ?>"
              data-item-quantity="1"
        <?php if (!empty($multipliers)) : ?>
        data-item-custom1-name="<?= htmlspecialchars($translations['product'][$isLanguage ? 'language' : 'multiplier'] ?? ($isLanguage ? 'Langue' : 'Multiplicateur')) ?>"
        data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $multipliers))) ?>"
        data-item-custom1-value="<?= htmlspecialchars((string)$multipliers[0]) ?>"
      <?php endif; ?>
      >
        <span data-i18n="product.add">Ajouter</span>
      </button>
    <?php else : ?>
      <span class="btn btn-shop opacity-60 cursor-not-allowed" data-i18n="product.outOfStock">Rupture de stock</span>
    <?php endif; ?>
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

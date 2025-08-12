<?php
// Variables attendues dans le scope : $product (array), $lang (fr|en), $translations (array)
if (!isset($product['id'])) return;

$id          = (string)$product['id'];
$name        = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$desc        = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];
$img         = $product['img'] ?? ($product['images'][0] ?? '');
$url         = $product['url'] ?? ('product.php?id=' . urlencode($id));
$price       = number_format((float)$product['price'], 2, '.', '');
$multipliers = $product['multipliers'] ?? [];
?>

<?php if (inStock($id)) : ?>
<article class="card-product">
  <a href="<?= htmlspecialchars($url) ?>" class="media" style="aspect-ratio:1/1">
    <img
      src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
      alt="<?= htmlspecialchars($desc) ?>"
      data-alt-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
      data-alt-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>"
      loading="lazy" decoding="async" fetchpriority="low"
      style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center"
    >
  </a>

  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <h4 class="title"
        data-name-fr="<?= htmlspecialchars($product['name']) ?>"
        data-name-en="<?= htmlspecialchars($product['name_en'] ?? $product['name']) ?>">
      <?= htmlspecialchars($name) ?>
    </h4>
  </a>

  <p class="desc"
     data-desc-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
     data-desc-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>">
    <?= htmlspecialchars($desc) ?>
  </p>

  <p class="price mt-2 text-xl font-bold text-yellow-400">
    <?= htmlspecialchars($price) ?> $ CAD
  </p>

  <div class="mt-auto w-full flex flex-col items-center gap-4">

    <!-- Quantité -->
    <div class="flex flex-col items-center">
      <label class="mb-2 text-center" data-i18n="product.quantity">Quantité</label>
      <div class="quantity-selector mx-auto text-center" data-id="<?= htmlspecialchars($id) ?>">
        <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
        <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
        <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
      </div>
    </div>

    <!-- Multiplicateur (ou espace réservé pour garder les cartes alignées) -->
    <div class="flex flex-col items-center h-[70px] justify-center">
      <?php if (!empty($multipliers)) : ?>
        <label for="multiplier-<?= htmlspecialchars($id) ?>" class="mb-2 text-center" data-i18n="product.multiplier">Multiplicateur</label>
        <select id="multiplier-<?= htmlspecialchars($id) ?>" class="multiplier-select" data-target="<?= htmlspecialchars($id) ?>">
          <?php foreach ($multipliers as $m): $m = (int)$m; ?>
            <?php if ($m === 1): ?>
              <option value="1" data-i18n="product.unit">unitaire</option>
            <?php else: ?>
              <option value="<?= $m ?>">x<?= $m ?></option>
            <?php endif; ?>
          <?php endforeach; ?>
        </select>
      <?php else: ?>
        <div style="height:48px"></div>
      <?php endif; ?>
    </div>

    <!-- Bouton ajouter -->
    <button
      class="snipcart-add-item btn btn-shop px-6 whitespace-nowrap w-full"
      data-item-id="<?= htmlspecialchars($id) ?>"
      data-item-name="<?= htmlspecialchars(strip_tags($name)) ?>"
      data-item-name-fr="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
      data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'] ?? $product['name'])) ?>"
      data-item-description="<?= htmlspecialchars($desc) ?>"
      data-item-description-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
      data-item-description-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>"
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
</article>

<!-- Patch “quantité + multiplicateur” au clic sur le bouton Snipcart -->
<script>
(function () {
  if (window.__snipcartQtyPatch) return;
  window.__snipcartQtyPatch = true;

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.snipcart-add-item');
    if (!btn) return;

    const id = btn.getAttribute('data-item-id');
    if (!id) return;

    // quantité
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-item-quantity', String(q));
    }

    // multiplicateur
    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value;
      btn.setAttribute('data-item-custom1-value', mult);

      // mettre le bon nom selon la langue visible
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

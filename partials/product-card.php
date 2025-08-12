<?php
// product-card.php
// Attendu dans le scope: $product (array), $lang ('fr'|'en'), $translations (array)
// Requis côté page: fonctions inStock($id), getStock($id)

if (!isset($product['id'])) return;
$id = (string)$product['id'];

// Nom (avec fallback si la structure de $product varie entre pages)
$nameFr = $product['name']      ?? ($product['name_fr'] ?? '');
$nameEn = $product['name_en']   ?? $nameFr;
$name   = ($lang === 'en') ? $nameEn : $nameFr;

// Description (fallbacks pour compat 'boutique' vs 'product')
$descFr = $product['desc']      ?? ($product['description']     ?? '');
$descEn = $product['desc_en']   ?? ($product['description_en']  ?? $descFr);
$desc   = ($lang === 'en') ? $descEn : $descFr;

// Image principale + URL produit
$img = $product['img'] ?? ($product['images'][0] ?? '');
$url = $product['url'] ?? ('product.php?id=' . urlencode($id));

// Prix (format machine pour Snipcart)
$price = number_format((float)($product['price'] ?? 0), 2, '.', '');

// Multiplicateurs éventuels
$multipliers = $product['multipliers'] ?? [];

// Texte du CTA (affichage seulement)
$displayPrice = rtrim(rtrim(number_format((float)($product['price'] ?? 0), 2, ',', ' '), '0'), ',');
$ctaLabel     = ($translations['product']['add'] ?? 'Ajouter') . ' — ' . $displayPrice . ' $';
?>

<?php if (inStock($id)) : ?>
<article class="card-product" itemscope itemtype="https://schema.org/Product">
  <!-- Image / lien -->
  <a href="<?= htmlspecialchars($url) ?>" class="media" aria-label="<?= strip_tags($name) ?>">
    <img
      src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
      alt="<?= htmlspecialchars($desc) ?>"
      data-alt-fr="<?= htmlspecialchars($descFr) ?>"
      data-alt-en="<?= htmlspecialchars($descEn) ?>"
      loading="lazy"
      itemprop="image"
    >
  </a>

  <!-- Titre -->
  <a href="<?= htmlspecialchars($url) ?>" class="block">
    <h4 class="title"
        data-name-fr="<?= htmlspecialchars($nameFr) ?>"
        data-name-en="<?= htmlspecialchars($nameEn) ?>"
        itemprop="name">
      <?= $name // peut contenir <br> si déjà injecté côté listing ?>
    </h4>
  </a>

  <!-- Description -->
  <p class="desc"
     data-desc-fr="<?= htmlspecialchars($descFr) ?>"
     data-desc-en="<?= htmlspecialchars($descEn) ?>"
     itemprop="description">
    <?= htmlspecialchars($desc) ?>
  </p>

  <!-- Quantité -->
  <div class="qty-row" aria-label="<?= htmlspecialchars($translations['product']['quantity'] ?? 'Quantité') ?>">
    <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>" aria-label="−">−</button>
    <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>" aria-live="polite">1</span>
    <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>" aria-label="+">+</button>
  </div>

  <!-- Multiplicateur (option Snipcart) -->
  <div class="mult-row" style="<?= empty($multipliers) ? 'min-height:48px' : '' ?>">
    <?php if (!empty($multipliers)) : ?>
      <label for="multiplier-<?= htmlspecialchars($id) ?>" class="sr-only"
             data-i18n="product.multiplier">Multiplicateur</label>
      <select
        id="multiplier-<?= htmlspecialchars($id) ?>"
        class="multiplier-select"
        data-target="<?= htmlspecialchars($id) ?>"
        aria-label="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
      >
        <?php foreach ($multipliers as $m): $m = (int)$m; ?>
          <?php if ($m === 1): ?>
            <option value="1" data-i18n="product.unit">unitaire</option>
          <?php else: ?>
            <option value="<?= $m ?>">x<?= $m ?></option>
          <?php endif; ?>
        <?php endforeach; ?>
      </select>
    <?php endif; ?>
  </div>

  <!-- Bouton Snipcart -->
  <button
    class="snipcart-add-item btn btn-shop"
    aria-label="<?= htmlspecialchars($translations['product']['add'] ?? 'Ajouter') ?>"
    data-item-id="<?= htmlspecialchars($id) ?>"
    data-item-name="<?= htmlspecialchars(strip_tags(($lang === 'en') ? $nameEn : $nameFr)) ?>"
    data-item-name-fr="<?= htmlspecialchars(strip_tags($nameFr)) ?>"
    data-item-name-en="<?= htmlspecialchars(strip_tags($nameEn)) ?>"
    data-item-description="<?= htmlspecialchars($desc) ?>"
    data-item-description-fr="<?= htmlspecialchars($descFr) ?>"
    data-item-description-en="<?= htmlspecialchars($descEn) ?>"
    data-item-price="<?= htmlspecialchars($price) ?>"
    data-item-url="<?= htmlspecialchars($url) ?>"
    data-item-quantity="1"
    <?php if (!empty($multipliers)) : ?>
      data-item-custom1-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
      data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $multipliers))) ?>"
      data-item-custom1-value="<?= htmlspecialchars((string)$multipliers[0]) ?>"
    <?php endif; ?>
  >
    <span data-i18n="product.add"><?= htmlspecialchars($ctaLabel) ?></span>
  </button>
</article>

<?php else: ?>
  <!-- Carte désactivée si rupture -->
  <article class="card-product oos" aria-disabled="true">
    <div class="media">
      <img
        src="/<?= ltrim(htmlspecialchars($img), '/') ?>"
        alt="<?= htmlspecialchars($desc) ?>"
        loading="lazy">
    </div>
    <h4 class="title"><?= $name ?></h4>
    <p class="desc"><?= htmlspecialchars($desc) ?></p>
    <button class="btn btn-shop" disabled data-i18n="product.outOfStock">Rupture de stock</button>
  </article>
<?php endif; ?>

<!-- Patch léger : juste avant l’ajout, on recalcule quantité & multiplicateur -->
<script>
(function () {
  if (window.__gdCardPatch) return; // ne pose qu'un listener global
  window.__gdCardPatch = true;

  document.addEventListener('click', function (ev) {
    const btn = ev.target.closest('.snipcart-add-item');
    if (!btn) return;

    const id = btn.getAttribute('data-item-id');
    if (!id) return;

    // quantité (depuis l'afficheur)
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) {
      const q = parseInt(qtyEl.textContent, 10);
      if (!isNaN(q) && q > 0) btn.setAttribute('data-item-quantity', String(q));
    }

    // multiplicateur (option custom1)
    const multEl = document.getElementById('multiplier-' + id);
    if (multEl) {
      const mult = multEl.value || '1';
      btn.setAttribute('data-item-custom1-value', mult);

      // met à jour le libellé envoyé, en FR/EN selon <html lang>
      const lang = document.documentElement.lang || 'fr';
      const base =
        lang === 'en'
          ? (btn.dataset.itemNameEn || btn.getAttribute('data-item-name'))
          : (btn.dataset.itemNameFr || btn.getAttribute('data-item-name'));
      btn.setAttribute('data-item-name', mult !== '1' ? `${base} x${mult}` : base);
    }
  }, { passive: true });
})();
</script>

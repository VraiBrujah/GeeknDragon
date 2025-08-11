<?php
// Variables attendues dans le scope : $product (array), $lang (fr|en), $translations (array)

if (!isset($product['id'])) return;
$id = (string)$product['id'];

$name        = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
$desc        = $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'];
$img         = $product['img'] ?? ($product['images'][0] ?? '');
$url         = $product['url'] ?? ('product.php?id=' . urlencode($id));
$price       = number_format((float)$product['price'], 2, '.', '');
$multipliers = $product['multipliers'] ?? [];
?>

<?php if (inStock($id)) : ?>
<div class="card h-full flex flex-col bg-gray-800 p-4 rounded-xl shadow
            min-w-[21rem] sm:min-w-[22rem] md:min-w-[23rem]">
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

  <p class="text-center mb-4 text-gray-300 flex-grow"
     data-desc-fr="<?= htmlspecialchars($product['description'] ?? $desc) ?>"
     data-desc-en="<?= htmlspecialchars($product['description_en'] ?? $desc) ?>">
    <?= htmlspecialchars($desc) ?>
  </p>

	<div class="mt-auto flex flex-col items-center gap-4 w-full">

	  <!-- Bloc quantité -->
	  <div class="flex flex-col items-center">
		<label class="mb-2 text-center" data-i18n="product.quantity">Quantité</label>
		<div class="quantity-selector mx-auto text-center" data-id="<?= htmlspecialchars($id) ?>">
		  <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($id) ?>">−</button>
		  <span class="qty-value" id="qty-<?= htmlspecialchars($id) ?>">1</span>
		  <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($id) ?>">+</button>
		</div>
	  </div>

	  <!-- Bloc multiplicateur : affiché ou espace réservé -->
	  <div class="flex flex-col items-center h-[70px] justify-center">
		<?php if (!empty($multipliers)) : ?>
		  <label for="multiplier-<?= htmlspecialchars($id) ?>" class="mb-2 text-center" data-i18n="product.multiplier">Multiplicateur</label>
		  <select id="multiplier-<?= htmlspecialchars($id) ?>" class="multiplier-select text-black px-3 py-2 rounded" data-target="<?= htmlspecialchars($id) ?>">
			<?php foreach ($multipliers as $m) :
				$m = (int)$m; ?>
			  <?php if ($m === 1) : ?>
				<option value="1" data-i18n="product.unit">unitaire</option>
			  <?php else : ?>
				<option value="<?= $m ?>">x<?= $m ?></option>
			  <?php endif; ?>
			<?php endforeach; ?>
		  </select>
		<?php else : ?>
		  <!-- Espace réservé pour alignement -->
		  <div style="height:48px"></div>
		<?php endif; ?>
	  </div>

	  <!-- Bouton ajouter -->
	  <button class="snipcart-add-item btn btn-shop px-6 whitespace-nowrap"
		data-item-id="<?= htmlspecialchars($id) ?>"
		data-item-name="<?= htmlspecialchars(strip_tags($name)) ?>"
		data-item-description="<?= htmlspecialchars($desc) ?>"
		data-item-price="<?= htmlspecialchars($price) ?>"
		data-item-url="<?= htmlspecialchars($url) ?>"
		data-item-quantity="1"
		<?php if (!empty($multipliers)) : ?>
		  data-item-custom1-name="<?= htmlspecialchars($translations['product']['multiplier'] ?? 'Multiplicateur') ?>"
		  data-item-custom1-options="<?= htmlspecialchars(implode('|', array_map('strval', $multipliers))) ?>"
		  data-item-custom1-value="<?= htmlspecialchars((string)$multipliers[0]) ?>"
		<?php endif; ?>
	  >
		<span data-i18n="product.add">Ajouter</span> — <?= htmlspecialchars($price) ?> $
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
      btn.setAttribute('data-item-custom1-value', multEl.value);
    }
  }, { passive: true });
})();
</script>
<?php endif; ?>

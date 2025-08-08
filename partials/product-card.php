<?php if(inStock($product['id'])): ?>
<div class="card flex flex-col">
  <a href="<?= htmlspecialchars($product['url']) ?>">
    <img src="/<?= htmlspecialchars($product['img']) ?>" alt="<?= htmlspecialchars($product['desc']) ?>" class="rounded mb-4 w-full h-48 object-cover" loading="lazy">
  </a>
  <h4 class="text-center text-2xl font-semibold mb-2"><?= $product['name'] ?></h4>
  <p class="text-center mb-4 text-gray-300"><?= htmlspecialchars($product['desc']) ?></p>
  <div class="mt-auto flex flex-col items-center">
    <div class="multiplier-slot">
      <?php if (!empty($product['multipliers'])): ?>
      <label for="multiplier-<?= htmlspecialchars($product['id']) ?>" class="mx-auto text-center">
        <span class="sr-only">Multiplicateur</span>
        <select id="multiplier-<?= htmlspecialchars($product['id']) ?>" class="multiplier-select text-black" data-target="<?= htmlspecialchars($product['id']) ?>">
          <?php foreach ($product['multipliers'] as $m): ?>
          <option value="<?= $m ?>"><?= $m == 1 ? 'unitaire' : 'x' . $m ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <?php endif; ?>
    </div>
    <div class="flex flex-col items-center">
      <div class="quantity-selector mx-auto text-center" data-id="<?= htmlspecialchars($product['id']) ?>">
        <button type="button" class="quantity-btn minus" data-target="<?= htmlspecialchars($product['id']) ?>">−</button>
        <span class="qty-value" id="qty-<?= htmlspecialchars($product['id']) ?>">1</span>
        <button type="button" class="quantity-btn plus" data-target="<?= htmlspecialchars($product['id']) ?>">+</button>
      </div>
    </div>
    <button class="snipcart-add-item btn btn-shop mx-auto"
            data-item-id="<?= htmlspecialchars($product['id']) ?>"
            data-item-name="<?= htmlspecialchars(strip_tags($product['name'])) ?>"
            data-item-price="<?= htmlspecialchars($product['price']) ?>"
            data-item-url="boutique.php"
            data-item-description="<?= htmlspecialchars($product['desc']) ?>"
            data-item-quantity="1"
            <?php if (!empty($product['multipliers'])): ?>
            data-item-custom1-name="Multiplicateur"
            data-item-custom1-options="<?= implode('|', $product['multipliers']) ?>"
            data-item-custom1-value="<?= $product['multipliers'][0] ?>"
            <?php endif; ?>>
      Ajouter
    </button>
  </div>
</div>
<?php endif; ?>

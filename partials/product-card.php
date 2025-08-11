<?php if(inStock($product['id'])): ?>
<div class="card flex flex-col">
  <a href="<?= htmlspecialchars($product['url']) ?>">
    <img src="/<?= htmlspecialchars($product['img']) ?>" alt="<?= htmlspecialchars($product['desc']) ?>" data-alt-fr="<?= htmlspecialchars($product['desc']) ?>" data-alt-en="<?= htmlspecialchars($product['desc_en']) ?>" class="rounded mb-4 w-full h-48 object-cover" loading="lazy">
  </a>
  <h4 class="text-center text-2xl font-semibold mb-2" data-name-fr="<?= htmlspecialchars($product['name']) ?>" data-name-en="<?= htmlspecialchars($product['name_en']) ?>"><?= $product['name'] ?></h4>
  <p class="text-center mb-4 text-gray-300" data-desc-fr="<?= htmlspecialchars($product['desc']) ?>" data-desc-en="<?= htmlspecialchars($product['desc_en']) ?>"><?= htmlspecialchars($product['desc']) ?></p>
  <div class="mt-auto flex flex-col items-center">
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
            data-item-name-en="<?= htmlspecialchars(strip_tags($product['name_en'])) ?>"
            data-item-price="<?= htmlspecialchars($product['price']) ?>"
            data-item-url="boutique.php"
            data-item-description="<?= htmlspecialchars($product['desc']) ?>"
            data-item-description-en="<?= htmlspecialchars($product['desc_en']) ?>"
            data-item-quantity="1"
            <?php if (!empty($product['multipliers'])): ?>
            data-item-custom1-name="Multiplier"
            data-item-custom1-name-fr="Multiplicateur"
            data-item-custom1-options="<?= implode('|', $product['multipliers']) ?>"
            data-item-custom1-value="<?= $product['multipliers'][0] ?>"
            <?php endif; ?>>
      <span data-i18n="product.add">Ajouter</span>
    </button>
  </div>
</div>
<?php endif; ?>

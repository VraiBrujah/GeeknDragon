<?php
/**
 * Partial : Contrôles de quantité
 * Variables attendues : $id (string), $customOptions (array), $customLabel (string)
 */

if (!isset($id)) return;
$customOptions = $customOptions ?? [];
$customLabel = $customLabel ?? 'Options';
?>

<div class="gd-quantity-controls">
  <!-- Sélecteur de quantité -->
  <div class="gd-quantity-selector" data-id="<?= htmlspecialchars($id) ?>">
    <button type="button" 
            class="gd-quantity-btn gd-quantity-btn--minus" 
            data-target="<?= htmlspecialchars($id) ?>"
            aria-label="Diminuer la quantité">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
      </svg>
    </button>
    
    <span class="gd-quantity-value" 
          id="qty-<?= htmlspecialchars($id) ?>"
          aria-label="Quantité sélectionnée">1</span>
    
    <button type="button" 
            class="gd-quantity-btn gd-quantity-btn--plus" 
            data-target="<?= htmlspecialchars($id) ?>"
            aria-label="Augmenter la quantité">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
      </svg>
    </button>
  </div>
  
  <?php if (!empty($customOptions)) : ?>
    <!-- Options personnalisées (multiplicateurs, langues) -->
    <div class="gd-custom-options">
      <label for="custom-<?= htmlspecialchars($id) ?>" class="gd-custom-label">
        <?= htmlspecialchars($customLabel) ?>
      </label>
      <select id="custom-<?= htmlspecialchars($id) ?>" 
              class="gd-custom-select"
              aria-label="<?= htmlspecialchars($customLabel) ?>">
        <?php foreach ($customOptions as $option) : ?>
          <option value="<?= htmlspecialchars((string)$option) ?>">
            <?= htmlspecialchars((string)$option) ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>
  <?php endif; ?>
</div>
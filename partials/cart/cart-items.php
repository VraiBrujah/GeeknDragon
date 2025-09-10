<?php
/**
 * Contenu HTML des articles du panier pour le widget
 * Variables disponibles : $helper (ViewHelper), $viewData['cartService'] (CartService)
 */

if (!isset($helper) || !isset($viewData['cartService'])) {
    throw new RuntimeException('Variables requises manquantes pour cart-items');
}

$items = $viewData['cartService']->getItems();
$isEmpty = $viewData['cartService']->isEmpty();
?>

<?php if ($isEmpty): ?>
    <!-- Panier vide -->
    <div class="p-6 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9"/>
        </svg>
        <p class="text-sm"><?php echo $helper->t('cart.empty', 'Votre panier est vide'); ?></p>
    </div>
<?php else: ?>
    <!-- Articles du panier -->
    <div class="divide-y divide-gray-200">
        <?php foreach ($items as $itemKey => $item): ?>
            <div class="p-4" data-item-key="<?php echo $helper->escape($itemKey); ?>">
                <div class="flex items-center gap-3">
                    <!-- Image produit -->
                    <?php if (!empty($item['image'])): ?>
                        <img
                            src="<?php echo $helper->escape($item['image']); ?>"
                            alt="<?php echo $helper->escape($item['name']); ?>"
                            class="w-12 h-12 object-cover rounded border"
                            loading="lazy"
                        >
                    <?php else: ?>
                        <div class="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                            </svg>
                        </div>
                    <?php endif; ?>

                    <!-- Détails de l'article -->
                    <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-medium text-gray-900 truncate">
                            <?php echo $helper->escape($item['name']); ?>
                        </h4>
                        <p class="text-sm text-gray-500">
                            <?php echo $helper->formatPrice($item['price']); ?>
                        </p>

                        <!-- Options produit -->
                        <?php if (!empty($item['options'])): ?>
                            <div class="text-xs text-gray-400 mt-1">
                                <?php foreach ($item['options'] as $key => $value): ?>
                                    <span><?php echo $helper->escape($key); ?>: <?php echo $helper->escape($value); ?></span>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- Contrôles quantité -->
                    <div class="flex items-center gap-2">
                        <button
                            class="gd-qty-btn gd-qty-decrease w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                            data-action="decrease"
                            data-item-key="<?php echo $helper->escape($itemKey); ?>"
                            aria-label="Diminuer la quantité"
                        >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                            </svg>
                        </button>

                        <span class="gd-item-quantity text-sm font-medium min-w-[2rem] text-center">
                            <?php echo $item['quantity']; ?>
                        </span>

                        <button
                            class="gd-qty-btn gd-qty-increase w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                            data-action="increase"
                            data-item-key="<?php echo $helper->escape($itemKey); ?>"
                            aria-label="Augmenter la quantité"
                        >
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Bouton supprimer -->
                    <button
                        class="gd-remove-btn text-red-400 hover:text-red-600 p-1"
                        data-item-key="<?php echo $helper->escape($itemKey); ?>"
                        aria-label="Supprimer l'article"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
<?php endif; ?>


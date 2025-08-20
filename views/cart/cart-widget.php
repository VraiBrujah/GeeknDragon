<?php
/**
 * Widget panier custom pour remplacer Snipcart natif
 * Variables disponibles : $helper (ViewHelper), $cartService (CartService)
 */

if (!isset($helper) || !isset($cartService)) {
    throw new RuntimeException('Variables requises manquantes pour cart-widget');
}

$items = $cartService->getItems();
$itemCount = $cartService->getItemCount();
$total = $cartService->getTotal();
$isEmpty = $cartService->isEmpty();
?>

<!-- Widget Panier Custom -->
<div id="gd-cart-widget" class="relative">
    <!-- Bouton panier -->
    <button 
        id="gd-cart-toggle" 
        class="gd-cart-btn flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        aria-label="<?= $helper->t('nav.cart') ?>"
        aria-expanded="false"
        aria-haspopup="dialog"
    >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9"/>
        </svg>
        <span class="sr-only"><?= $helper->t('nav.cart') ?></span>
        <span id="gd-cart-count" class="gd-cart-badge bg-red-500 text-white text-xs rounded-full px-2 py-1">
            <?= $itemCount ?>
        </span>
    </button>

    <!-- Panneau panier (caché par défaut) -->
    <div 
        id="gd-cart-panel" 
        class="gd-cart-panel absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 hidden"
        role="dialog"
        aria-labelledby="cart-title"
        aria-hidden="true"
    >
        <!-- En-tête -->
        <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
                <h3 id="cart-title" class="text-lg font-semibold text-gray-900">
                    <?= $helper->t('nav.cart') ?>
                </h3>
                <button 
                    id="gd-cart-close" 
                    class="text-gray-400 hover:text-gray-600"
                    aria-label="Fermer le panier"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Contenu du panier -->
        <div id="gd-cart-content" class="max-h-96 overflow-y-auto">
            <?php if ($isEmpty): ?>
                <!-- Panier vide -->
                <div class="p-6 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9"/>
                    </svg>
                    <p class="text-sm"><?= $helper->t('cart.empty', 'Votre panier est vide') ?></p>
                </div>
            <?php else: ?>
                <!-- Articles du panier -->
                <div class="divide-y divide-gray-200">
                    <?php foreach ($items as $itemKey => $item): ?>
                        <div class="p-4" data-item-key="<?= $helper->escape($itemKey) ?>">
                            <div class="flex items-center gap-3">
                                <!-- Image produit -->
                                <?php if (!empty($item['image'])): ?>
                                    <img 
                                        src="<?= $helper->escape($item['image']) ?>" 
                                        alt="<?= $helper->escape($item['name']) ?>"
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
                                        <?= $helper->escape($item['name']) ?>
                                    </h4>
                                    <p class="text-sm text-gray-500">
                                        <?= $helper->formatPrice($item['price']) ?>
                                    </p>
                                    
                                    <!-- Options produit -->
                                    <?php if (!empty($item['options'])): ?>
                                        <div class="text-xs text-gray-400 mt-1">
                                            <?php foreach ($item['options'] as $key => $value): ?>
                                                <span><?= $helper->escape($key) ?>: <?= $helper->escape($value) ?></span>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endif; ?>
                                </div>

                                <!-- Contrôles quantité -->
                                <div class="flex items-center gap-2">
                                    <button 
                                        class="gd-qty-btn gd-qty-decrease w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                        data-action="decrease"
                                        data-item-key="<?= $helper->escape($itemKey) ?>"
                                        aria-label="Diminuer la quantité"
                                    >
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                                        </svg>
                                    </button>
                                    
                                    <span class="gd-item-quantity text-sm font-medium min-w-[2rem] text-center">
                                        <?= $item['quantity'] ?>
                                    </span>
                                    
                                    <button 
                                        class="gd-qty-btn gd-qty-increase w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                                        data-action="increase"
                                        data-item-key="<?= $helper->escape($itemKey) ?>"
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
                                    data-item-key="<?= $helper->escape($itemKey) ?>"
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
        </div>

        <?php if (!$isEmpty): ?>
            <!-- Pied de panier -->
            <div class="p-4 border-t border-gray-200 bg-gray-50">
                <!-- Total -->
                <div class="flex justify-between items-center mb-4">
                    <span class="text-base font-medium text-gray-900">
                        <?= $helper->t('cart.total', 'Total') ?>
                    </span>
                    <span id="gd-cart-total" class="text-lg font-bold text-indigo-600">
                        <?= $helper->formatPrice($total) ?>
                    </span>
                </div>

                <!-- Actions -->
                <div class="space-y-2">
                    <button 
                        id="gd-cart-checkout" 
                        class="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <?= $helper->t('cart.checkout', 'Finaliser la commande') ?>
                    </button>
                    
                    <button 
                        id="gd-cart-clear" 
                        class="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                        <?= $helper->t('cart.clear', 'Vider le panier') ?>
                    </button>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>

<!-- Overlay pour fermer le panier -->
<div id="gd-cart-overlay" class="fixed inset-0 bg-black bg-opacity-25 z-40 hidden"></div>
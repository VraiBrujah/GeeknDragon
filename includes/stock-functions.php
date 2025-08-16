<?php
/**
 * Fonctions de gestion du stock Snipcart
 * Partagées entre boutique.php et product.php
 */

/**
 * Récupère le stock d'un produit via l'API Snipcart
 * @param string $id ID du produit
 * @return int|null Stock disponible ou null si illimité/erreur
 */
function getStock(string $id): ?int
{
    global $snipcartSecret;
    static $cache = [];
    
    // Cache pour éviter les appels répétés
    if (isset($cache[$id])) {
        return $cache[$id];
    }
    
    if (!$snipcartSecret) {
        return $cache[$id] = null;
    }
    
    $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => $snipcartSecret . ':',
        CURLOPT_TIMEOUT => 5, // Timeout optimisé
        CURLOPT_CONNECTTIMEOUT => 2,
        CURLOPT_USERAGENT => 'GeeknDragon/1.0',
    ]);
    
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    
    if ($res === false || $status >= 400) {
        return $cache[$id] = null;
    }
    
    $inv = json_decode($res, true);
    return $cache[$id] = $inv['stock'] ?? $inv['available'] ?? null;
}

/**
 * Vérifie si un produit est en stock
 * @param string $id ID du produit
 * @return bool True si en stock (ou stock illimité)
 */
function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;
}

/**
 * Obtient le badge de stock formaté
 * @param string $id ID du produit
 * @return array ['class' => string, 'text' => string, 'icon' => string]
 */
function getStockBadge(string $id): array
{
    $isInStock = inStock($id);
    
    if ($isInStock) {
        return [
            'class' => 'gd-badge--success',
            'text' => 'En stock',
            'icon' => '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>'
        ];
    } else {
        return [
            'class' => 'gd-badge--danger',
            'text' => 'Rupture de stock',
            'icon' => '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>'
        ];
    }
}

/**
 * Formate un produit pour l'affichage
 * @param array $product Données brutes du produit
 * @param string $lang Langue courante
 * @param string $category Catégorie pour l'URL de retour
 * @return array Produit formaté
 */
function formatProduct(array $product, string $lang, string $category = 'pieces'): array
{
    $id = (string)$product['id'];
    
    return [
        'id' => $id,
        'name' => $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'],
        'name_display' => str_replace(' – ', '<br>', 
            $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name']
        ),
        'description' => $lang === 'en' ? ($product['description_en'] ?? $product['description']) : $product['description'],
        'summary' => $lang === 'en' 
            ? ($product['summary_en'] ?? $product['summary'] ?? $product['description_en'] ?? $product['description'])
            : ($product['summary'] ?? $product['description']),
        'price' => number_format((float)$product['price'], 2, '.', ''),
        'img' => $product['images'][0] ?? '',
        'images' => $product['images'] ?? [],
        'url' => '/product.php?id=' . urlencode($id) . '&from=' . urlencode($category),
        'multipliers' => $product['multipliers'] ?? [],
        'languages' => $product['languages'] ?? [],
        'isInStock' => inStock($id),
        'stockBadge' => getStockBadge($id),
    ];
}

/**
 * Génère les métadonnées pour le JSON-LD d'un produit
 * @param array $product Produit formaté
 * @param string $host Nom d'hôte
 * @return array Métadonnées JSON-LD
 */
function generateProductJsonLd(array $product, string $host): array
{
    return [
        '@type' => 'Product',
        'name' => strip_tags($product['name']),
        'description' => strip_tags($product['summary'] ?? $product['description']),
        'image' => !empty($product['img']) ? "https://{$host}/" . ltrim($product['img'], '/') : null,
        'sku' => $product['id'],
        'brand' => [
            '@type' => 'Brand',
            'name' => 'Geek & Dragon'
        ],
        'offers' => [
            '@type' => 'Offer',
            'price' => (float)$product['price'],
            'priceCurrency' => 'CAD',
            'availability' => $product['isInStock'] 
                ? 'https://schema.org/InStock' 
                : 'https://schema.org/OutOfStock',
            'seller' => [
                '@type' => 'Organization',
                'name' => 'Geek & Dragon'
            ]
        ],
    ];
}
?>
<?php
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/cache/CacheHelper.php';

$config = require __DIR__ . '/config.php';
$active = 'boutique';
require __DIR__ . '/i18n.php';

$title = $translations['meta']['shop']['title'] ?? 'Geek & Dragon';
$metaDescription = $translations['meta']['shop']['desc'] ?? '';
$metaUrl = 'https://' . ($_SERVER['HTTP_HOST'] ?? 'geekndragon.com') . '/boutique.php';

$extraHead = <<<HTML
<style>
  .card{@apply bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col;}
  .oos{@apply bg-gray-700 text-gray-400 cursor-not-allowed;}
</style>
HTML;

/* ───── STOCK AVEC CACHE ───── */
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;

function getStock(string $id): ?int
{
    global $snipcartSecret;
    
    // Vérifier le cache d'abord
    $cachedStock = CacheHelper::getCachedProductStock($id);
    if ($cachedStock !== null) {
        return $cachedStock;
    }
    
    $stock = null;
    
    if ($snipcartSecret) {
        // Appel API Snipcart
        $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERPWD => $snipcartSecret . ':',
            CURLOPT_TIMEOUT => 5, // Timeout plus court
        ]);
        $res = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        curl_close($ch);
        
        if ($res !== false && $status < 400) {
            $inv = json_decode($res, true);
            $stock = $inv['stock'] ?? $inv['available'] ?? null;
        }
    }
    
    // Fallback sur les données locales
    if ($stock === null) {
        $stockData = CacheHelper::remember('local_stock_data', function() {
            return json_decode(file_get_contents(__DIR__ . '/data/stock.json'), true) ?? [];
        }, 600); // Cache 10 minutes
        
        $stock = $stockData[$id] ?? null;
    }
    
    // Mettre en cache le résultat
    CacheHelper::cacheProductStock($id, $stock, 300); // Cache 5 minutes
    
    return $stock;
}

function inStock(string $id): bool
{
    $stock = getStock($id);
    return $stock === null || $stock > 0;
}

// Chargement des produits avec cache
$data = CacheHelper::remember('products_processed', function() {
    $rawData = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
    $processed = [];
    
    foreach ($rawData as $id => $p) {
        $summaryFr = (string) ($p['summary'] ?? ($p['description'] ?? ''));
        $summaryEn = (string) ($p['summary_en'] ?? ($p['description_en'] ?? ''));
        
        if ($summaryFr === '' && $summaryEn !== '') {
            $summaryFr = $summaryEn;
        }
        if ($summaryEn === '' && $summaryFr !== '') {
            $summaryEn = $summaryFr;
        }

        $processed[$id] = [
            'id' => $id,
            'name' => str_replace(' – ', '<br>', $p['name']),
            'name_en' => str_replace(' – ', '<br>', $p['name_en'] ?? $p['name']),
            'price' => $p['price'],
            'img' => $p['images'][0] ?? '',
            'description' => $p['description'] ?? '',
            'description_en' => $p['description_en'] ?? ($p['description'] ?? ''),
            'summary' => $summaryFr,
            'summary_en' => $summaryEn,
            'multipliers' => $p['multipliers'] ?? [],
        ];
    }
    
    return $processed;
}, 1800); // Cache 30 minutes

// Catégorisation des produits (avec cache)
$cacheKey = CacheHelper::generateKey('products_categorized', $lang);
$categorizedProducts = CacheHelper::remember($cacheKey, function() use ($data) {
    $pieces = [];
    $cards = [];
    $triptychs = [];
    
    foreach ($data as $id => $product) {
        // Catégorisation
        if (str_starts_with($id, 'lot') || str_contains($id, 'essence') || str_contains($id, 'tresorerie')) {
            $product['url'] = 'product.php?id=' . urlencode($id) . '&from=pieces';
            $pieces[] = $product;
        } elseif (str_contains($id, 'carte') || str_contains($id, 'card')) {
            $product['url'] = 'product.php?id=' . urlencode($id) . '&from=cartes';
            $cards[] = $product;
        } else {
            $product['url'] = 'product.php?id=' . urlencode($id) . '&from=triptyques';
            $triptychs[] = $product;
        }
    }
    
    return compact('pieces', 'cards', 'triptychs');
}, 1800); // Cache 30 minutes

extract($categorizedProducts);

// Génération des données de stock pour JavaScript (avec cache)
$jsStockData = CacheHelper::remember('js_stock_data', function() use ($data) {
    $jsStock = [];
    foreach (array_keys($data) as $id) {
        $stock = getStock($id);
        if ($stock !== null) {
            $jsStock[$id] = $stock;
        }
    }
    return $jsStock;
}, 300); // Cache 5 minutes
?>
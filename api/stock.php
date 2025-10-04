<?php
/**
 * API Endpoint Stock - Optimisé pour performance
 *
 * GET /api/stock.php?products=id1,id2,id3
 * POST /api/stock.php avec JSON {"products": ["id1", "id2", "id3"]}
 *
 * Retourne : {"id1": 10, "id2": null, "id3": 5}
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../bootstrap.php';
$config = require __DIR__ . '/../config.php';

// Récupérer les IDs produits à vérifier
$productIds = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $productIds = $input['products'] ?? [];
} else {
    $productsParam = $_GET['products'] ?? '';
    $productIds = $productsParam ? explode(',', $productsParam) : [];
}

// Validation
$productIds = array_filter(array_map('trim', $productIds));
if (empty($productIds)) {
    http_response_code(400);
    echo json_encode(['error' => 'Paramètre products requis']);
    exit;
}

// Limitation sécurité
if (count($productIds) > 50) {
    http_response_code(400);
    echo json_encode(['error' => 'Maximum 50 produits par requête']);
    exit;
}

// Configuration stock
$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;
$stockData = []; // Plus de stock.json local - géré par Snipcart
$snipcartSyncRaw = $_ENV['SNIPCART_SYNC'] ?? null;
$forceOfflineStock = false;

if ($snipcartSyncRaw !== null) {
    $syncFlag = filter_var($snipcartSyncRaw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($syncFlag === false) {
        $forceOfflineStock = true;
    }
}

/**
 * Récupération stock optimisée avec parallélisation cURL
 */
function getStockBatch(array $productIds, string $snipcartSecret = null, array $stockData = [], bool $forceOffline = false): array {
    $results = [];

    // Si mode offline ou pas d'API, utiliser données locales
    if ($forceOffline || !$snipcartSecret) {
        foreach ($productIds as $id) {
            $results[$id] = $stockData[$id] ?? null;
        }
        return $results;
    }

    // Parallélisation cURL pour performance optimale
    $multiHandle = curl_multi_init();
    $curlHandles = [];

    foreach ($productIds as $id) {
        // Endpoint correct Snipcart v3: /api/products avec filtre userDefinedId
        $url = 'https://app.snipcart.com/api/products?userDefinedId=' . urlencode($id);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Authorization: Basic ' . base64_encode($snipcartSecret . ':')
            ],
            CURLOPT_TIMEOUT => 5,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_MAXREDIRS => 0,
            CURLOPT_SSL_VERIFYPEER => true
        ]);

        curl_multi_add_handle($multiHandle, $ch);
        $curlHandles[$id] = $ch;
    }

    // Exécution parallèle
    $running = null;
    do {
        curl_multi_exec($multiHandle, $running);
        curl_multi_select($multiHandle, 0.1);
    } while ($running > 0);

    // Récupération des résultats
    foreach ($curlHandles as $id => $ch) {
        $response = curl_multi_getcontent($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

        if ($response !== false && $httpCode >= 200 && $httpCode < 400) {
            $data = json_decode($response, true);

            // L'API retourne {"items": [...], "totalItems": X}
            if (!empty($data['items']) && isset($data['items'][0])) {
                $product = $data['items'][0];
                // Stock peut être dans 'stock', 'inventory.stock', ou 'inventoryManagementMethod'
                $results[$id] = $product['stock'] ?? $product['inventory']['stock'] ?? null;
            } else {
                // Produit pas trouvé dans Snipcart = stock inconnu (null)
                $results[$id] = null;
            }
        } else {
            // Erreur API : log et fallback
            error_log("Snipcart API error for {$id}: HTTP {$httpCode}");
            $results[$id] = $stockData[$id] ?? null;
        }

        curl_multi_remove_handle($multiHandle, $ch);
        curl_close($ch);
    }

    curl_multi_close($multiHandle);
    return $results;
}

// Log de performance
$startTime = microtime(true);

try {
    $stockResults = getStockBatch($productIds, $snipcartSecret, $stockData, $forceOfflineStock);

    $executionTime = round((microtime(true) - $startTime) * 1000, 2);

    // Log des métriques
    log_gd()->debug("API Stock batch", [
        'products_count' => count($productIds),
        'execution_time_ms' => $executionTime,
        'cache_hits' => array_sum(array_map(fn($v) => $v !== null ? 1 : 0, $stockResults)),
        'api_mode' => $forceOfflineStock ? 'offline' : 'snipcart'
    ]);

    // Réponse optimisée
    echo json_encode($stockResults, JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    log_gd()->erreur("API Stock erreur", [
        'error' => $e->getMessage(),
        'products' => $productIds
    ]);

    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur lors de la récupération du stock']);
}
?>
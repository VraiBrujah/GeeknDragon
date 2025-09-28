<?php
/**
 * Endpoint de validation Snipcart pour réparer le dashboard
 * Répondez aux crawling de validation produits
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Snipcart-RequestToken');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Charger la configuration afin de récupérer la clé secrète Snipcart
    $config = [];
    $configPath = __DIR__ . '/config.php';
    if (is_file($configPath)) {
        /** @var array<string, mixed> $config */
        $config = require $configPath;
    }

    $secretFromEnv = getenv('SNIPCART_WEBHOOK_SECRET')
        ?: getenv('SNIPCART_SECRET_API_KEY')
        ?: ($_SERVER['SNIPCART_WEBHOOK_SECRET'] ?? $_SERVER['SNIPCART_SECRET_API_KEY'] ?? null);
    $snipcartSecret = $secretFromEnv
        ?: ($config['snipcart_webhook_secret'] ?? $config['snipcart_secret_api_key'] ?? null);

    // Charger les données produits
    $products = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
    
    // Si requête GET avec ID produit (validation Snipcart)
    if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
        $productId = sanitizeId($_GET['id']);
        
        if (isset($products[$productId])) {
            $product = $products[$productId];
            
            // Format attendu par Snipcart
            $response = [
                'id' => $productId,
                'name' => $product['name'] ?? 'Produit',
                'price' => floatval($product['price'] ?? 0),
                'url' => "https://geekndragon.com/product.php?id=" . $productId,
                'description' => $product['summary'] ?? '',
                'image' => isset($product['images'][0]) 
                    ? "https://geekndragon.com" . $product['images'][0] 
                    : null
            ];
            
            echo json_encode($response, JSON_PRETTY_PRINT);
            exit;
        }
    }
    
    // Requête POST (webhook)
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $payload = file_get_contents('php://input') ?: '';
        $data = json_decode($payload, true);

        $providedSignature = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] ?? '';

        if (empty($providedSignature) || empty($snipcartSecret)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Signature manquante ou configuration Snipcart invalide.',
            ]);
            exit;
        }

        $expectedSignature = hash_hmac('sha256', $payload, $snipcartSecret);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Signature Snipcart invalide.',
            ]);
            exit;
        }

        // Log uniquement après validation de la signature
        error_log('Snipcart Webhook valide: ' . $payload);

        // Toujours retourner succès pour webhook
        echo json_encode(['success' => true, 'message' => 'Webhook processed']);
        exit;
    }
    
    // Page de status par défaut
    echo json_encode([
        'status' => 'ready',
        'service' => 'Snipcart Validation Endpoint',
        'products_count' => count($products),
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}

function sanitizeId($id) {
    return preg_replace('/[^a-zA-Z0-9_-]/', '', $id);
}
?>
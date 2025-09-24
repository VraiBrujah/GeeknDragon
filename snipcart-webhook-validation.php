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
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        // Log pour debugging
        error_log('Snipcart Webhook: ' . $input);
        
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
<?php
/**
 * API REST pour la gestion des produits
 * Endpoints disponibles :
 * - GET /api/products.php : Liste tous les produits
 * - GET /api/products.php?action=show&id=xxx : Affiche un produit
 * - GET /api/products.php?action=search&q=xxx : Recherche de produits
 * - GET /api/products.php?action=suggestions&id=xxx : Produits similaires
 */

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Controllers\ProductController;

// Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Validation de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Allow: GET, OPTIONS');
    echo json_encode(['error' => 'Seule la méthode GET est autorisée']);
    exit;
}

try {
    $controller = new ProductController();
    $action = $_GET['action'] ?? 'index';

    switch ($action) {
        case 'index':
        case 'list':
            $controller->apiIndex();
            break;
            
        case 'show':
        case 'get':
            $controller->apiShow();
            break;
            
        case 'search':
            $controller->apiSearch();
            break;
            
        case 'suggestions':
        case 'similar':
            $controller->apiSuggestions();
            break;
            
        default:
            http_response_code(404);
            echo json_encode(['error' => "Action non trouvée : {$action}"]);
            break;
    }

} catch (\Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
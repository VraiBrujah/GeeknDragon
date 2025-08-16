<?php
/**
 * API REST pour la gestion des médias optimisés
 * Endpoints disponibles :
 * - POST /api/media.php?action=optimize : Optimise un média
 * - GET /api/media.php?action=html : Génère le HTML responsive
 * - GET /api/media.php?action=stats : Statistiques du cache
 * - POST /api/media.php?action=clear : Vide le cache
 * - POST /api/media.php?action=cleanup : Nettoie le cache
 */

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Controllers\MediaController;

// Configuration CORS pour les requêtes AJAX
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gérer les requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $controller = new MediaController();
    $action = $_REQUEST['action'] ?? 'optimize';

    switch ($action) {
        case 'optimize':
            $controller->optimize();
            break;
            
        case 'html':
            $controller->generateHtml();
            break;
            
        case 'stats':
            $controller->getStats();
            break;
            
        case 'clear':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode POST requise']);
                exit;
            }
            $controller->clearCache();
            break;
            
        case 'cleanup':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Méthode POST requise']);
                exit;
            }
            $controller->cleanupCache();
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
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
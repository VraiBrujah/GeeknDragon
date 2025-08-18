<?php
/**
 * Routes pour les endpoints Snipcart
 * Système de routage simple pour l'intégration backend transparente
 */

use App\Snipcart\{
    ShippingWebhook,
    TaxesWebhook,
    PaymentMethods,
    PaymentAuthorize,
    PaymentCapture,
    PaymentRefund,
    OrderWebhook
};

/**
 * Gestionnaire principal des routes Snipcart
 */
function handleSnipcartRoutes(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    
    // Normaliser le chemin (supprimer les slashes de fin)
    $path = rtrim($path, '/');
    
    // Headers CORS pour les requêtes Snipcart
    header('Access-Control-Allow-Origin: https://app.snipcart.com');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Snipcart-RequestToken');
    header('Access-Control-Max-Age: 86400'); // 24h
    
    // Gérer les requêtes OPTIONS (preflight CORS)
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    // Log de la requête pour diagnostic
    error_log("Snipcart Route: {$method} {$path}");
    
    try {
        // Routage des webhooks (POST uniquement)
        if ($method === 'POST') {
            switch ($path) {
                // Webhooks Snipcart
                case '/snipcart/shipping':
                    ShippingWebhook::handle();
                    break;
                    
                case '/snipcart/taxes':
                    TaxesWebhook::handle();
                    break;
                    
                case '/snipcart/order/completed':
                case '/snipcart/order/webhook':
                    OrderWebhook::handle();
                    break;
                    
                // Passerelle de paiement Stripe
                case '/snipcart/payment/methods':
                    PaymentMethods::handle();
                    break;
                    
                case '/snipcart/payment/authorize':
                    PaymentAuthorize::handle();
                    break;
                    
                case '/snipcart/payment/capture':
                    PaymentCapture::handle();
                    break;
                    
                case '/snipcart/payment/refund':
                    PaymentRefund::handle();
                    break;
                    
                default:
                    http_response_code(404);
                    echo json_encode([
                        'error' => 'Endpoint non trouvé',
                        'path' => $path,
                        'method' => $method
                    ]);
                    break;
            }
        } elseif ($method === 'GET') {
            // Quelques endpoints GET pour les méthodes de paiement
            switch ($path) {
                case '/snipcart/payment/methods':
                    PaymentMethods::handle();
                    break;
                    
                case '/snipcart/status':
                    // Endpoint de vérification de statut
                    echo json_encode([
                        'status' => 'ok',
                        'service' => 'GeeknDragon Snipcart Backend',
                        'version' => '1.0',
                        'timestamp' => date('c')
                    ]);
                    break;
                    
                default:
                    http_response_code(404);
                    echo json_encode([
                        'error' => 'Endpoint GET non trouvé',
                        'path' => $path
                    ]);
                    break;
            }
        } else {
            // Méthode non autorisée
            http_response_code(405);
            echo json_encode([
                'error' => 'Méthode non autorisée',
                'method' => $method,
                'allowed' => ['GET', 'POST', 'OPTIONS']
            ]);
        }
        
    } catch (\Exception $e) {
        error_log('Erreur endpoint Snipcart: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => 'Erreur serveur interne',
            'message' => $e->getMessage(),
            'path' => $path,
            'method' => $method
        ]);
    }
}

// Si ce fichier est appelé directement, traiter la route
if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {
    // Charger l'autoloader Composer
    require_once __DIR__ . '/../vendor/autoload.php';
    
    // Charger les variables d'environnement depuis .env si disponible
    if (file_exists(__DIR__ . '/../.env')) {
        $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $_ENV[trim($key)] = trim($value);
                putenv(trim($key) . '=' . trim($value));
            }
        }
    }
    
    handleSnipcartRoutes();
}
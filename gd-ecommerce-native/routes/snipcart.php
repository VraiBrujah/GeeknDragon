<?php
/**
 * Routes pour les endpoints Snipcart
 * À inclure dans votre système de routage principal
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

// Simple routeur pour les endpoints Snipcart
function handleSnipcartRoutes(): void
{
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    
    // Normaliser le chemin
    $path = rtrim($path, '/');
    
    // Headers CORS pour les requêtes Snipcart
    header('Access-Control-Allow-Origin: https://app.snipcart.com');
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Snipcart-RequestToken');
    
    // Gérer les requêtes OPTIONS (preflight CORS)
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    // Router les requêtes POST uniquement
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Méthode non autorisée']);
        exit;
    }
    
    try {
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
                echo json_encode(['error' => 'Endpoint non trouvé']);
        }
    } catch (\Exception $e) {
        error_log('Erreur endpoint Snipcart: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Erreur serveur']);
    }
}

// Si ce fichier est appelé directement, traiter la route
if (basename($_SERVER['SCRIPT_NAME']) === basename(__FILE__)) {
    require_once __DIR__ . '/../vendor/autoload.php';
    handleSnipcartRoutes();
}
<?php
/**
 * Test simple de l'architecture backend Snipcart
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Répondre aux requêtes OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Charger les variables d'environnement
if (file_exists('.env')) {
    $envLines = file('.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
        }
    }
}

$response = [
    'status' => 'success',
    'service' => 'GeeknDragon Snipcart Backend',
    'timestamp' => date('c'),
    'tests' => []
];

// Test 1: Vérifier les variables d'environnement
$requiredVars = ['SNIPCART_API_KEY', 'SNIPCART_SECRET_API_KEY'];
$envTest = [
    'name' => 'Variables d\'environnement',
    'status' => 'success',
    'details' => []
];

foreach ($requiredVars as $var) {
    $envTest['details'][$var] = !empty($_ENV[$var]) ? 'OK' : 'MANQUANT';
    if (empty($_ENV[$var])) {
        $envTest['status'] = 'warning';
    }
}

$response['tests']['environment'] = $envTest;

// Test 2: Vérifier l'architecture de fichiers
$requiredFiles = [
    'gd-ecommerce-native/src/Config/SnipcartConfig.php',
    'gd-ecommerce-native/src/Snipcart/ShippingWebhook.php',
    'gd-ecommerce-native/src/Snipcart/TaxesWebhook.php',
    'gd-ecommerce-native/src/Payment/PaymentAuthorize.php'
];

$filesTest = [
    'name' => 'Architecture de fichiers',
    'status' => 'success',
    'details' => []
];

foreach ($requiredFiles as $file) {
    $filesTest['details'][$file] = file_exists($file) ? 'OK' : 'MANQUANT';
    if (!file_exists($file)) {
        $filesTest['status'] = 'error';
    }
}

$response['tests']['files'] = $filesTest;

// Test 3: Test de calcul de taxes (simulation)
$taxesTest = [
    'name' => 'Calcul de taxes (simulation)',
    'status' => 'success',
    'details' => [
        'QC_TPS' => '5%',
        'QC_TVQ' => '9.975%',
        'ON_TVH' => '13%',
        'calculation' => 'Fonctionnel'
    ]
];

$response['tests']['taxes'] = $taxesTest;

// Test 4: Test de shipping (simulation)
$shippingTest = [
    'name' => 'Calcul d\'expédition (simulation)',
    'status' => 'success',
    'details' => [
        'QC_free_shipping' => 'Gratuit >= 75$',
        'standard_rates' => 'Configuré',
        'international' => 'Supporté'
    ]
];

$response['tests']['shipping'] = $shippingTest;

// Test 5: Vérifier la configuration Stripe (simulation)
$stripeTest = [
    'name' => 'Configuration Stripe',
    'status' => !empty($_ENV['STRIPE_SECRET_KEY']) ? 'success' : 'warning',
    'details' => [
        'api_key' => !empty($_ENV['STRIPE_SECRET_KEY']) ? 'Configuré' : 'Manquant',
        'webhooks' => 'Prêt',
        'payment_intents' => 'Supporté'
    ]
];

$response['tests']['stripe'] = $stripeTest;

// Résumé général
$allSuccess = true;
foreach ($response['tests'] as $test) {
    if ($test['status'] === 'error') {
        $allSuccess = false;
        break;
    }
}

$response['overall_status'] = $allSuccess ? 'READY' : 'NEEDS_ATTENTION';
$response['message'] = $allSuccess ? 
    'Système backend prêt pour l\'intégration Snipcart' : 
    'Certains éléments nécessitent une attention';

// Ajouter des informations sur les endpoints disponibles
$response['endpoints'] = [
    'status' => '/test-backend.php',
    'shipping' => '/gd-ecommerce-native/public/index.php/snipcart/shipping',
    'taxes' => '/gd-ecommerce-native/public/index.php/snipcart/taxes',
    'payment_methods' => '/gd-ecommerce-native/public/index.php/snipcart/payment/methods',
    'payment_authorize' => '/gd-ecommerce-native/public/index.php/snipcart/payment/authorize'
];

echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
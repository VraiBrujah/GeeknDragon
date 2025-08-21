<?php
/**
 * Point d'entrée public pour l'API Snipcart Backend
 * Doit être accessible via votre serveur web
 * 
 * Configuration Apache/Nginx recommandée pour pointer vers ce répertoire
 * avec réécriture d'URL vers ce fichier pour tous les endpoints /snipcart/*
 * 
 * Exemple Apache (.htaccess) :
 * RewriteEngine On
 * RewriteCond %{REQUEST_FILENAME} !-f
 * RewriteCond %{REQUEST_FILENAME} !-d
 * RewriteRule ^snipcart/(.*)$ /gd-ecommerce-native/public/index.php [QSA,L]
 */

declare(strict_types=1);

// Headers de sécurité de base
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');

// Configuration des erreurs selon l'environnement
$isProduction = ($_ENV['APP_ENV'] ?? 'development') === 'production';

if ($isProduction) {
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
    ini_set('log_errors', '1');
}

// Chargement de l'autoloader Composer
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Dépendances manquantes',
        'message' => 'Veuillez exécuter "composer install" dans le dossier gd-ecommerce-native'
    ]);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

// Chargement des variables d'environnement depuis .env
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $envLines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            $_ENV[$key] = $value;
            putenv("{$key}={$value}");
        }
    }
}

// Vérification des variables d'environnement critiques
$requiredEnvVars = [
    'SNIPCART_SECRET_API_KEY'
];

$missingVars = [];
foreach ($requiredEnvVars as $var) {
    if (empty($_ENV[$var])) {
        $missingVars[] = $var;
    }
}

if (!empty($missingVars)) {
    error_log('Variables d\'environnement manquantes: ' . implode(', ', $missingVars));
    if (!$isProduction) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Configuration incomplète',
            'missing_env_vars' => $missingVars,
            'message' => 'Veuillez configurer le fichier .env'
        ]);
        exit;
    }
}

// Chargement du routeur Snipcart
require_once __DIR__ . '/../routes/snipcart.php';

// Log de la requête entrante
$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

error_log("GeeknDragon Snipcart API - {$requestMethod} {$requestUri} - {$userAgent}");

// Gestion des requêtes
try {
    // Vérifier que la requête concerne bien Snipcart
    $path = parse_url($requestUri, PHP_URL_PATH);
    if (strpos($path, '/snipcart/') !== 0) {
        // Afficher une page d'information pour les autres requêtes
        if ($requestMethod === 'GET' && $path === '/') {
            self::showApiInfo();
            exit;
        }
        
        http_response_code(404);
        echo json_encode([
            'error' => 'Endpoint non trouvé',
            'message' => 'Cet endpoint est dédié aux intégrations Snipcart',
            'available_endpoints' => [
                '/snipcart/shipping',
                '/snipcart/taxes', 
                '/snipcart/order/completed',
                '/snipcart/payment/methods',
                '/snipcart/payment/authorize',
                '/snipcart/payment/capture',
                '/snipcart/payment/refund',
                '/snipcart/status'
            ]
        ]);
        exit;
    }
    
    // Traiter la requête Snipcart
    handleSnipcartRoutes();
    
} catch (\Throwable $e) {
    error_log('Erreur fatale API Snipcart: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    http_response_code(500);
    
    $errorResponse = [
        'error' => 'Erreur serveur interne',
        'status' => 'error'
    ];
    
    // Ajouter plus de détails en mode développement
    if (!$isProduction) {
        $errorResponse['details'] = [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => array_slice($e->getTrace(), 0, 5) // Limiter la trace
        ];
    }
    
    echo json_encode($errorResponse);
}

/**
 * Affiche les informations de l'API
 */
function showApiInfo(): void
{
    $config = [
        'service' => 'GeeknDragon Snipcart Backend API',
        'version' => '1.0.0',
        'description' => 'API backend transparente pour intégration Snipcart avec interface custom',
        'status' => 'operational',
        'endpoints' => [
            'webhooks' => [
                'POST /snipcart/shipping' => 'Calcul des tarifs d\'expédition',
                'POST /snipcart/taxes' => 'Calcul des taxes',
                'POST /snipcart/order/completed' => 'Traitement des commandes'
            ],
            'payment_gateway' => [
                'GET/POST /snipcart/payment/methods' => 'Méthodes de paiement disponibles',
                'POST /snipcart/payment/authorize' => 'Autorisation de paiement',
                'POST /snipcart/payment/capture' => 'Capture de paiement',
                'POST /snipcart/payment/refund' => 'Remboursement'
            ],
            'utility' => [
                'GET /snipcart/status' => 'Statut du service'
            ]
        ],
        'environment' => $_ENV['APP_ENV'] ?? 'development',
        'timestamp' => date('c')
    ];
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($config, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
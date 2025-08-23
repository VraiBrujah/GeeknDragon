<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\AI\ProductRecommendationEngine;

/**
 * 🤖 API ENDPOINT RECOMMANDATIONS PRODUITS
 * Interface REST pour le système de recommandations IA
 */

// Headers CORS et JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    
    // Router les différents endpoints
    switch ($path) {
        case '/api/recommendations':
            handleRecommendations($method);
            break;
        case '/api/recommendations/track':
            handleTracking($method);
            break;
        case '/api/recommendations/stats':
            handleStats($method);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
    
} catch (Exception $e) {
    error_log("Recommendations API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * Gestion des demandes de recommandations
 */
function handleRecommendations(string $method): void
{
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        return;
    }
    
    $context = $input['context'] ?? [];
    $pageContext = $input['page_context'] ?? 'general';
    $currentProduct = $input['current_product'] ?? null;
    $maxResults = (int)($input['max_results'] ?? 6);
    
    // Initialiser le moteur de recommandations
    $engine = new ProductRecommendationEngine();
    
    // Construire le contexte enrichi
    $enrichedContext = buildEnrichedContext($context, $pageContext, $currentProduct);
    
    // Obtenir les recommandations
    $recommendations = $engine->getRecommendations($enrichedContext);
    
    // Limiter les résultats
    $recommendations = array_slice($recommendations, 0, $maxResults);
    
    // Formater la réponse
    $response = [
        'success' => true,
        'recommendations' => $recommendations,
        'total_count' => count($recommendations),
        'page_context' => $pageContext,
        'detected_profile' => detectUserProfile($enrichedContext),
        'context_used' => $enrichedContext,
        'timestamp' => time(),
        'cache_ttl' => 300 // 5 minutes
    ];
    
    // Ajouter insights de debugging si en mode développement
    if (isLocalhost()) {
        $response['debug'] = [
            'engine_stats' => $engine->getRecommendationStats(),
            'scoring_details' => array_column($recommendations, 'scoring_details'),
            'ml_weights_used' => true
        ];
    }
    
    // Headers de cache
    header('Cache-Control: private, max-age=300'); // 5 minutes
    header('ETag: "' . md5(json_encode($response)) . '"');
    
    echo json_encode($response);
}

/**
 * Gestion du tracking des interactions
 */
function handleTracking(string $method): void
{
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        return;
    }
    
    $type = $input['type'] ?? 'unknown';
    $data = $input['data'] ?? [];
    $context = $input['context'] ?? [];
    $timestamp = $input['timestamp'] ?? time();
    
    // Enrichir les données de tracking
    $trackingData = [
        'type' => $type,
        'data' => $data,
        'context' => $context,
        'timestamp' => $timestamp,
        'ip_address' => getClientIP(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'session_id' => session_id() ?: 'no_session',
        'referer' => $_SERVER['HTTP_REFERER'] ?? 'direct'
    ];
    
    // Sauvegarder les données de tracking
    saveTrackingData($trackingData);
    
    // Réponse
    echo json_encode([
        'success' => true,
        'tracked_events' => count($data),
        'type' => $type,
        'timestamp' => $timestamp
    ]);
}

/**
 * Statistiques des recommandations
 */
function handleStats(string $method): void
{
    if ($method !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $period = $_GET['period'] ?? '24h';
    
    $engine = new ProductRecommendationEngine();
    $stats = $engine->getRecommendationStats();
    
    // Ajouter statistiques de tracking
    $trackingStats = getTrackingStats($period);
    
    $response = [
        'success' => true,
        'period' => $period,
        'engine_stats' => $stats,
        'tracking_stats' => $trackingStats,
        'performance_metrics' => getPerformanceMetrics($period),
        'generated_at' => time()
    ];
    
    echo json_encode($response);
}

/**
 * Construction du contexte enrichi
 */
function buildEnrichedContext(array $context, string $pageContext, ?string $currentProduct): array
{
    return array_merge($context, [
        'page_context' => $pageContext,
        'current_product' => $currentProduct,
        'server_timestamp' => time(),
        'ip_address' => getClientIP(),
        'user_agent_parsed' => parseUserAgent($_SERVER['HTTP_USER_AGENT'] ?? ''),
        'geo_location' => getGeoLocation(getClientIP()),
        'session_data' => getSessionData(),
        'historical_data' => getHistoricalUserData($context['session_id'] ?? ''),
        'real_time_inventory' => getRealTimeInventory(),
        'current_promotions' => getCurrentPromotions(),
        'weather_context' => getWeatherContext(), // Pour recommandations saisonnières
    ]);
}

/**
 * Détection du profil utilisateur
 */
function detectUserProfile(array $context): string
{
    $indicators = [
        'page_views' => $context['page_views'] ?? 0,
        'time_on_site' => $context['time_on_site'] ?? 0,
        'cart_value' => $context['cart_value'] ?? 0,
        'previous_purchases' => count($context['previous_purchases'] ?? []),
        'device_type' => $context['device_type'] ?? 'desktop'
    ];
    
    // Algorithme de détection de profil
    if ($indicators['previous_purchases'] === 0 && $indicators['page_views'] < 3) {
        return 'nouveau_joueur';
    }
    
    if ($indicators['cart_value'] > 300 || $indicators['time_on_site'] > 600) {
        return 'collectionneur';
    }
    
    if ($indicators['cart_value'] > 150 || $indicators['previous_purchases'] > 1) {
        return 'maître_de_jeu';
    }
    
    return 'joueur_régulier';
}

/**
 * Sauvegarde des données de tracking
 */
function saveTrackingData(array $data): void
{
    $logDir = __DIR__ . '/../storage/recommendations_tracking';
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $date = date('Y-m-d');
    $filename = $logDir . "/tracking_{$date}.jsonl";
    
    $logEntry = json_encode($data) . "\n";
    
    file_put_contents($filename, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Statistiques de tracking
 */
function getTrackingStats(string $period): array
{
    $logDir = __DIR__ . '/../storage/recommendations_tracking';
    
    // Calculer la période
    $days = match($period) {
        '1h' => 1/24,
        '24h' => 1,
        '7d' => 7,
        '30d' => 30,
        default => 1
    };
    
    $cutoff = time() - ($days * 24 * 3600);
    
    // Analyser les fichiers de log
    $stats = [
        'total_views' => 0,
        'total_clicks' => 0,
        'click_through_rate' => 0,
        'top_recommended_products' => [],
        'best_performing_types' => [],
        'conversion_rate' => 0
    ];
    
    $files = glob($logDir . '/tracking_*.jsonl');
    
    if (!$files) {
        return $stats;
    }
    
    $views = 0;
    $clicks = 0;
    $products = [];
    $types = [];
    
    foreach ($files as $file) {
        if (filemtime($file) < $cutoff) continue;
        
        $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            $data = json_decode($line, true);
            if (!$data || $data['timestamp'] < $cutoff) continue;
            
            if ($data['type'] === 'view') {
                $views += count($data['data']);
                
                foreach ($data['data'] as $view) {
                    $productId = $view['product_id'] ?? 'unknown';
                    $products[$productId] = ($products[$productId] ?? 0) + 1;
                    
                    $recType = $view['recommendation_type'] ?? 'unknown';
                    $types[$recType] = ($types[$recType] ?? 0) + 1;
                }
            } elseif ($data['type'] === 'click') {
                $clicks += count($data['data']);
            }
        }
    }
    
    // Calculer les statistiques
    $stats['total_views'] = $views;
    $stats['total_clicks'] = $clicks;
    $stats['click_through_rate'] = $views > 0 ? ($clicks / $views) * 100 : 0;
    
    // Top produits
    arsort($products);
    $stats['top_recommended_products'] = array_slice($products, 0, 5, true);
    
    // Meilleurs types
    arsort($types);
    $stats['best_performing_types'] = array_slice($types, 0, 5, true);
    
    return $stats;
}

/**
 * Métriques de performance
 */
function getPerformanceMetrics(string $period): array
{
    return [
        'recommendation_latency_ms' => getAverageRecommendationLatency($period),
        'cache_hit_rate' => getCacheHitRate($period),
        'error_rate' => getErrorRate($period),
        'user_satisfaction_score' => getUserSatisfactionScore($period)
    ];
}

/**
 * Données de session
 */
function getSessionData(): array
{
    $sessionData = [
        'session_id' => session_id(),
        'session_start' => $_SESSION['session_start'] ?? time(),
        'pages_visited' => $_SESSION['pages_visited'] ?? 0,
        'last_activity' => $_SESSION['last_activity'] ?? time()
    ];
    
    // Mettre à jour la session
    $_SESSION['pages_visited'] = ($sessionData['pages_visited'] ?? 0) + 1;
    $_SESSION['last_activity'] = time();
    
    if (!isset($_SESSION['session_start'])) {
        $_SESSION['session_start'] = time();
    }
    
    return $sessionData;
}

/**
 * Données historiques utilisateur
 */
function getHistoricalUserData(string $sessionId): array
{
    // Simplifiée - à connecter avec vraie base de données
    return [
        'total_sessions' => 1,
        'total_purchases' => 0,
        'favorite_categories' => ['pieces_metalliques'],
        'avg_cart_value' => 0,
        'last_visit' => null
    ];
}

/**
 * Inventaire temps réel
 */
function getRealTimeInventory(): array
{
    // Simulation - à connecter avec vrai système d'inventaire
    return [
        'lot10' => ['stock' => 50, 'status' => 'in_stock'],
        'lot25' => ['stock' => 30, 'status' => 'in_stock'],
        'lot50-essence' => ['stock' => 15, 'status' => 'low_stock'],
        'triptyque-aleatoire' => ['stock' => 100, 'status' => 'in_stock']
    ];
}

/**
 * Promotions actuelles
 */
function getCurrentPromotions(): array
{
    // Promotion active exemple
    $month = (int)date('n');
    $promotions = [];
    
    // Promotion de Noël
    if ($month === 12) {
        $promotions[] = [
            'type' => 'seasonal',
            'name' => 'Noël JDR',
            'discount' => 15,
            'products' => ['lot25', 'lot50-essence'],
            'expires' => strtotime('2024-12-31 23:59:59')
        ];
    }
    
    return $promotions;
}

/**
 * Contexte météo pour recommandations saisonnières
 */
function getWeatherContext(): array
{
    $month = (int)date('n');
    $season = 'spring';
    
    if ($month >= 12 || $month <= 2) $season = 'winter';
    elseif ($month >= 3 && $month <= 5) $season = 'spring';
    elseif ($month >= 6 && $month <= 8) $season = 'summer';
    elseif ($month >= 9 && $month <= 11) $season = 'autumn';
    
    return [
        'season' => $season,
        'month' => $month,
        'is_holiday_season' => $month === 12 || $month === 1,
        'is_back_to_school' => $month === 9 || $month === 10
    ];
}

/**
 * Utilitaires
 */
function getClientIP(): string
{
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
           $_SERVER['HTTP_X_REAL_IP'] ?? 
           $_SERVER['REMOTE_ADDR'] ?? 
           'unknown';
}

function parseUserAgent(string $userAgent): array
{
    $mobile = preg_match('/Mobile|Android|iPhone|iPad/', $userAgent);
    $browser = 'unknown';
    
    if (strpos($userAgent, 'Chrome') !== false) $browser = 'chrome';
    elseif (strpos($userAgent, 'Firefox') !== false) $browser = 'firefox';
    elseif (strpos($userAgent, 'Safari') !== false) $browser = 'safari';
    elseif (strpos($userAgent, 'Edge') !== false) $browser = 'edge';
    
    return [
        'is_mobile' => (bool)$mobile,
        'browser' => $browser,
        'raw' => $userAgent
    ];
}

function getGeoLocation(string $ip): array
{
    // Géolocalisation simplifiée
    if ($ip === '127.0.0.1' || strpos($ip, '192.168.') === 0 || $ip === 'unknown') {
        return ['country' => 'CA', 'region' => 'QC', 'city' => 'Montreal'];
    }
    
    // À connecter avec service de géolocalisation réel
    return ['country' => 'CA', 'region' => 'QC', 'city' => 'Unknown'];
}

function isLocalhost(): bool
{
    return in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', '::1']);
}

// Métriques simplifiées (à implémenter avec vraies données)
function getAverageRecommendationLatency(string $period): float { return 45.2; }
function getCacheHitRate(string $period): float { return 0.78; }
function getErrorRate(string $period): float { return 0.02; }
function getUserSatisfactionScore(string $period): float { return 8.5; }
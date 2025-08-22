<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Reviews\ReviewManager;

/**
 * 📝 API ENDPOINT REVIEWS ET TÉMOIGNAGES
 * Interface REST pour le système de reviews avec modération
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
    $pathParts = explode('/', trim($path, '/'));
    
    // Router les différents endpoints
    switch (true) {
        case $path === '/api/reviews' && $method === 'POST':
            handleGetReviews();
            break;
        case $path === '/api/reviews/submit' && $method === 'POST':
            handleSubmitReview();
            break;
        case $path === '/api/reviews/vote' && $method === 'POST':
            handleReviewVote();
            break;
        case $path === '/api/reviews/flag' && $method === 'POST':
            handleReviewFlag();
            break;
        case $path === '/api/reviews/stats' && $method === 'GET':
            handleReviewStats();
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Endpoint not found']);
    }
    
} catch (Exception $e) {
    error_log("Reviews API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}

/**
 * Récupération des reviews (avec filtres)
 */
function handleGetReviews(): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        return;
    }
    
    $filters = $input['filters'] ?? [];
    
    // Validation des filtres
    $allowedSortBy = ['recent', 'rating_high', 'rating_low', 'helpful'];
    if (isset($filters['sort_by']) && !in_array($filters['sort_by'], $allowedSortBy)) {
        $filters['sort_by'] = 'recent';
    }
    
    $filters['limit'] = min(50, max(1, (int)($filters['limit'] ?? 10))); // Entre 1 et 50
    $filters['offset'] = max(0, (int)($filters['offset'] ?? 0));
    
    try {
        $reviewManager = new ReviewManager();
        $result = $reviewManager->getApprovedReviews($filters);
        
        // Enrichir avec métadonnées de cache
        $response = [
            'success' => true,
            'reviews' => $result['reviews'],
            'total_count' => $result['total_count'],
            'average_rating' => $result['average_rating'],
            'rating_distribution' => $result['rating_distribution'],
            'pagination' => $result['pagination'],
            'filters_applied' => $filters,
            'generated_at' => time(),
            'cache_ttl' => 600 // 10 minutes
        ];
        
        // Headers de cache
        header('Cache-Control: public, max-age=600');
        header('ETag: "' . md5(json_encode($response)) . '"');
        
        echo json_encode($response);
        
    } catch (Exception $e) {
        error_log("Error fetching reviews: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error fetching reviews']);
    }
}

/**
 * Soumission d'une nouvelle review
 */
function handleSubmitReview(): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        return;
    }
    
    // Validation des données requises
    $requiredFields = ['content', 'author_name', 'product_id'];
    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode([
                'error' => "Le champ '$field' est obligatoire",
                'field' => $field
            ]);
            return;
        }
    }
    
    // Enrichissement avec données serveur
    $reviewData = [
        'content' => trim($input['content']),
        'author_name' => trim($input['author_name']),
        'author_email' => trim($input['author_email'] ?? ''),
        'product_id' => trim($input['product_id']),
        'rating' => isset($input['rating']) ? (int)$input['rating'] : null,
        'type' => $input['type'] ?? 'product',
        'source' => 'website',
        'metadata' => [
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'referrer' => $_SERVER['HTTP_REFERER'] ?? '',
            'ip_address' => getClientIP(),
            'session_id' => session_id() ?: 'no_session'
        ]
    ];
    
    try {
        $reviewManager = new ReviewManager();
        $result = $reviewManager->submitReview($reviewData);
        
        if ($result['success']) {
            // Log pour analytics
            logReviewSubmission($reviewData, $result);
            
            // Réponse succès
            echo json_encode([
                'success' => true,
                'review_id' => $result['review_id'],
                'status' => $result['status'],
                'message' => $result['message'],
                'estimated_review_time' => $result['estimated_review_time'],
                'next_steps' => getNextStepsMessage($result['status'])
            ]);
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $result['error'],
                'details' => $result['details'] ?? null
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Error submitting review: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error submitting review']);
    }
}

/**
 * Vote utile/pas utile sur une review
 */
function handleReviewVote(): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        return;
    }
    
    $reviewId = $input['review_id'] ?? '';
    $action = $input['action'] ?? '';
    
    if (!$reviewId || !in_array($action, ['helpful', 'unhelpful'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid vote parameters']);
        return;
    }
    
    // Vérification rate limiting par IP
    if (isVoteRateLimited(getClientIP())) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many votes. Please wait before voting again.']);
        return;
    }
    
    try {
        $success = recordReviewVote($reviewId, $action, getClientIP());
        
        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Vote enregistré',
                'action' => $action,
                'review_id' => $reviewId
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Unable to record vote']);
        }
        
    } catch (Exception $e) {
        error_log("Error recording vote: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error recording vote']);
    }
}

/**
 * Signalement d'une review
 */
function handleReviewFlag(): void
{
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON input']);
        return;
    }
    
    $reviewId = $input['review_id'] ?? '';
    $reason = trim($input['reason'] ?? '');
    
    if (!$reviewId || !$reason) {
        http_response_code(400);
        echo json_encode(['error' => 'Review ID and reason are required']);
        return;
    }
    
    // Vérification rate limiting pour signalements
    if (isFlagRateLimited(getClientIP())) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many flags from this IP']);
        return;
    }
    
    try {
        $reviewManager = new ReviewManager();
        $flagData = [
            'reason' => $reason,
            'description' => $input['description'] ?? '',
            'reporter_ip' => getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ];
        
        $result = $reviewManager->flagReview($reviewId, $flagData);
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'message' => $result['message'],
                'flag_count' => $result['flag_count'] ?? null
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['error' => $result['error']]);
        }
        
    } catch (Exception $e) {
        error_log("Error flagging review: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error processing flag']);
    }
}

/**
 * Statistiques globales des reviews
 */
function handleReviewStats(): void
{
    try {
        $reviewManager = new ReviewManager();
        $stats = $reviewManager->getReviewStatistics();
        
        // Ajouter métadonnées publiques
        $publicStats = [
            'total_reviews' => $stats['total_reviews'],
            'average_rating' => $stats['average_rating'],
            'reviews_by_status' => [
                'approved' => $stats['reviews_by_status']['approved'] ?? 0
            ],
            'top_products' => $stats['top_products'] ?? [],
            'generated_at' => time()
        ];
        
        // Cache long pour les stats
        header('Cache-Control: public, max-age=3600'); // 1 heure
        
        echo json_encode([
            'success' => true,
            'stats' => $publicStats
        ]);
        
    } catch (Exception $e) {
        error_log("Error fetching review stats: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error fetching statistics']);
    }
}

/**
 * Fonctions utilitaires
 */
function getClientIP(): string
{
    return $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
           $_SERVER['HTTP_X_REAL_IP'] ?? 
           $_SERVER['REMOTE_ADDR'] ?? 
           'unknown';
}

function logReviewSubmission(array $reviewData, array $result): void
{
    $logEntry = [
        'action' => 'review_submitted',
        'review_id' => $result['review_id'],
        'product_id' => $reviewData['product_id'],
        'status' => $result['status'],
        'author_name' => $reviewData['author_name'],
        'has_rating' => isset($reviewData['rating']),
        'content_length' => strlen($reviewData['content']),
        'ip_address' => getClientIP(),
        'timestamp' => time()
    ];
    
    $logDir = __DIR__ . '/../storage/reviews';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/submissions.log';
    file_put_contents($logFile, json_encode($logEntry) . "\n", FILE_APPEND | LOCK_EX);
}

function getNextStepsMessage(string $status): string
{
    return match($status) {
        'approved' => 'Votre avis est maintenant visible sur le site. Merci pour votre contribution !',
        'pending' => 'Votre avis sera vérifié par notre équipe avant publication. Vous recevrez une notification par email si vous avez fourni votre adresse.',
        'flagged' => 'Votre avis nécessite une validation manuelle approfondie. Cela peut prendre jusqu\'à 72 heures.',
        default => 'Votre avis a été reçu et sera traité prochainement.'
    };
}

function recordReviewVote(string $reviewId, string $action, string $ip): bool
{
    // Enregistrement simple des votes (à améliorer avec vraie DB)
    $voteData = [
        'review_id' => $reviewId,
        'action' => $action,
        'ip_address' => $ip,
        'timestamp' => time(),
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ];
    
    $voteDir = __DIR__ . '/../storage/reviews';
    if (!is_dir($voteDir)) {
        mkdir($voteDir, 0755, true);
    }
    
    $voteFile = $voteDir . '/votes.jsonl';
    $success = file_put_contents($voteFile, json_encode($voteData) . "\n", FILE_APPEND | LOCK_EX);
    
    return $success !== false;
}

function isVoteRateLimited(string $ip): bool
{
    // Rate limiting: max 10 votes par heure par IP
    $rateLimitFile = __DIR__ . '/../storage/reviews/vote_limits.json';
    $limits = [];
    
    if (file_exists($rateLimitFile)) {
        $limits = json_decode(file_get_contents($rateLimitFile), true) ?? [];
    }
    
    $currentHour = floor(time() / 3600);
    $key = $ip . '_' . $currentHour;
    
    $count = $limits[$key] ?? 0;
    
    if ($count >= 10) {
        return true; // Rate limit exceeded
    }
    
    // Incrementer le compteur
    $limits[$key] = $count + 1;
    
    // Nettoyer les anciennes entrées (plus de 2 heures)
    foreach ($limits as $limitKey => $limitCount) {
        if (strpos($limitKey, '_' . ($currentHour - 2)) !== false) {
            unset($limits[$limitKey]);
        }
    }
    
    file_put_contents($rateLimitFile, json_encode($limits));
    
    return false;
}

function isFlagRateLimited(string $ip): bool
{
    // Rate limiting pour signalements: max 5 par jour par IP
    $rateLimitFile = __DIR__ . '/../storage/reviews/flag_limits.json';
    $limits = [];
    
    if (file_exists($rateLimitFile)) {
        $limits = json_decode(file_get_contents($rateLimitFile), true) ?? [];
    }
    
    $currentDay = floor(time() / 86400); // Jour actuel
    $key = $ip . '_' . $currentDay;
    
    $count = $limits[$key] ?? 0;
    
    if ($count >= 5) {
        return true; // Rate limit exceeded
    }
    
    // Incrementer le compteur
    $limits[$key] = $count + 1;
    
    // Nettoyer les anciennes entrées (plus de 2 jours)
    foreach ($limits as $limitKey => $limitCount) {
        if (strpos($limitKey, '_' . ($currentDay - 2)) !== false) {
            unset($limits[$limitKey]);
        }
    }
    
    file_put_contents($rateLimitFile, json_encode($limits));
    
    return false;
}
<?php
/**
 * Gestionnaire des avis produits
 * Gestion de la soumission et validation des avis clients
 */

// Configuration
$reviews_pending_file = __DIR__ . '/../data/reviews_pending.json';
$reviews_approved_file = __DIR__ . '/../data/reviews_approved.json';

// Créer les dossiers data si nécessaire
if (!is_dir(__DIR__ . '/../data')) {
    mkdir(__DIR__ . '/../data', 0755, true);
}

// Headers CORS et JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (pré-vol CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Charge les avis depuis un fichier JSON
 */
function loadReviews($file) {
    if (!file_exists($file)) {
        return [];
    }
    $content = file_get_contents($file);
    return $content ? json_decode($content, true) : [];
}

/**
 * Sauvegarde les avis dans un fichier JSON
 */
function saveReviews($file, $reviews) {
    return file_put_contents($file, json_encode($reviews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

/**
 * Valide les données d'un avis
 */
function validateReviewData($data) {
    $errors = [];
    
    if (empty($data['name']) || strlen(trim($data['name'])) < 2) {
        $errors[] = 'Le nom doit contenir au moins 2 caractères';
    }
    
    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Adresse email invalide';
    }
    
    if (empty($data['rating']) || !in_array($data['rating'], [1, 2, 3, 4, 5])) {
        $errors[] = 'Note invalide (1-5)';
    }
    
    if (empty($data['comment']) || strlen(trim($data['comment'])) < 10) {
        $errors[] = 'Le commentaire doit contenir au moins 10 caractères';
    }
    
    if (empty($data['product_id'])) {
        $errors[] = 'ID produit manquant';
    }
    
    return $errors;
}

/**
 * Calcule les statistiques des avis pour un produit
 */
function calculateReviewStats($product_id) {
    $approved_reviews = loadReviews($GLOBALS['reviews_approved_file']);
    $product_reviews = array_filter($approved_reviews, function($review) use ($product_id) {
        return $review['product_id'] === $product_id;
    });
    
    if (empty($product_reviews)) {
        return [
            'average' => 0,
            'total' => 0,
            'distribution' => [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0]
        ];
    }
    
    $total = count($product_reviews);
    $sum = array_sum(array_column($product_reviews, 'rating'));
    $average = round($sum / $total, 1);
    
    $distribution = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
    foreach ($product_reviews as $review) {
        $distribution[$review['rating']]++;
    }
    
    return [
        'average' => $average,
        'total' => $total,
        'distribution' => $distribution
    ];
}

// Routage des requêtes
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'POST':
            if ($action === 'submit') {
                // Soumission d'un nouvel avis
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input) {
                    throw new Exception('Données JSON invalides');
                }
                
                // Validation
                $errors = validateReviewData($input);
                if (!empty($errors)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'errors' => $errors]);
                    exit;
                }
                
                // Créer l'avis
                $review = [
                    'id' => uniqid('review_'),
                    'product_id' => $input['product_id'],
                    'name' => trim($input['name']),
                    'email' => trim($input['email']),
                    'rating' => (int)$input['rating'],
                    'comment' => trim($input['comment']),
                    'verified_purchase' => false, // À implémenter plus tard
                    'submitted_at' => date('Y-m-d H:i:s'),
                    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
                ];
                
                // Sauvegarder en attente
                $pending_reviews = loadReviews($reviews_pending_file);
                $pending_reviews[] = $review;
                
                if (saveReviews($reviews_pending_file, $pending_reviews)) {
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Votre avis a été soumis et sera publié après validation'
                    ]);
                } else {
                    throw new Exception('Erreur lors de la sauvegarde');
                }
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Action non trouvée']);
            }
            break;
            
        case 'GET':
            if ($action === 'stats' && isset($_GET['product_id'])) {
                // Récupérer les statistiques d'un produit
                $stats = calculateReviewStats($_GET['product_id']);
                echo json_encode(['success' => true, 'stats' => $stats]);
                
            } elseif ($action === 'list' && isset($_GET['product_id'])) {
                // Récupérer la liste des avis approuvés d'un produit
                $approved_reviews = loadReviews($reviews_approved_file);
                $product_reviews = array_filter($approved_reviews, function($review) {
                    return $review['product_id'] === $_GET['product_id'];
                });
                
                // Trier par date (plus récent en premier)
                usort($product_reviews, function($a, $b) {
                    return strtotime($b['approved_at'] ?? $b['submitted_at']) - strtotime($a['approved_at'] ?? $a['submitted_at']);
                });
                
                echo json_encode(['success' => true, 'reviews' => array_values($product_reviews)]);
                
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
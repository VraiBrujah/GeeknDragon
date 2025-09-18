<?php
/**
 * API de déconnexion utilisateur
 * Geek&Dragon - Système de comptes aventuriers
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit();
}

try {
    $userId = $_SESSION['user_id'] ?? null;
    $sessionId = session_id();

    // Nettoyer la session en base de données si on a les informations
    if ($userId && $sessionId) {
        $dbPath = __DIR__ . '/../database/geekndragon.db';
        
        if (file_exists($dbPath)) {
            $pdo = new PDO("sqlite:$dbPath");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // Supprimer la session de la base
            $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE id = ? AND user_id = ?");
            $stmt->execute([$sessionId, $userId]);

            // Journaliser la déconnexion
            error_log("Déconnexion utilisateur ID: $userId, Session: $sessionId");
        }
    }

    // Détruire la session PHP
    $_SESSION = array();

    // Supprimer le cookie de session
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Détruire la session
    session_destroy();

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie'
    ]);

} catch (PDOException $e) {
    error_log("Erreur PDO lors de la déconnexion: " . $e->getMessage());
    
    // Détruire quand même la session PHP même en cas d'erreur base
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie (avec erreur base)'
    ]);
} catch (Exception $e) {
    error_log("Erreur lors de la déconnexion: " . $e->getMessage());
    
    // Détruire quand même la session PHP
    session_destroy();
    
    echo json_encode([
        'success' => true,
        'message' => 'Déconnexion réussie (avec erreur)'
    ]);
}
?>
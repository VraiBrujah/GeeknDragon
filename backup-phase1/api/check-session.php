<?php
/**
 * API de vérification de session utilisateur
 * Geek&Dragon - Système de comptes aventuriers
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Vérifier si l'utilisateur est connecté
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['session_token'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Aucune session active'
        ]);
        exit();
    }

    $userId = $_SESSION['user_id'];

    // Connexion à la base de données
    $dbPath = __DIR__ . '/../database/geekndragon.db';
    if (!file_exists($dbPath)) {
        throw new Exception('Base de données non trouvée');
    }

    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Vérifier que la session existe en base
    $stmt = $pdo->prepare("
        SELECT expires_at FROM user_sessions 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([session_id(), $userId]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$session) {
        // Session non trouvée en base
        session_destroy();
        echo json_encode([
            'success' => false,
            'error' => 'Session invalide'
        ]);
        exit();
    }

    // Vérifier l'expiration
    $expiresAt = new DateTime($session['expires_at']);
    $now = new DateTime();
    
    if ($expiresAt < $now) {
        // Session expirée
        $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE id = ?");
        $stmt->execute([session_id()]);
        
        session_destroy();
        echo json_encode([
            'success' => false,
            'error' => 'Session expirée'
        ]);
        exit();
    }

    // Récupérer les informations utilisateur
    $stmt = $pdo->prepare("
        SELECT id, email, nom_aventurier, niveau, espece, classe, historique,
               style_jeu, experience_jeu, campagnes_preferees, email_verifie,
               date_creation, derniere_connexion
        FROM users 
        WHERE id = ? AND statut = 'actif'
    ");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Utilisateur non trouvé ou inactif
        $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE id = ?");
        $stmt->execute([session_id()]);
        
        session_destroy();
        echo json_encode([
            'success' => false,
            'error' => 'Utilisateur introuvable'
        ]);
        exit();
    }

    // Mettre à jour l'activité de la session
    $stmt = $pdo->prepare("
        UPDATE user_sessions 
        SET last_activity = datetime('now') 
        WHERE id = ?
    ");
    $stmt->execute([session_id()]);

    // Convertir les types appropriés
    $user['id'] = intval($user['id']);
    $user['niveau'] = intval($user['niveau']);
    $user['email_verifie'] = (bool)$user['email_verifie'];

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'user' => $user,
        'session_valid' => true
    ]);

} catch (PDOException $e) {
    error_log("Erreur PDO lors de la vérification de session: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données'
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
<?php
/**
 * API de connexion des utilisateurs
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
    // Récupération et validation des données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Données JSON invalides');
    }

    // Validation des champs requis
    if (!isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Email et mot de passe requis');
    }

    $email = filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL);
    if (!$email) {
        throw new Exception('Format d\'email invalide');
    }

    $password = $input['password'];
    if (empty($password)) {
        throw new Exception('Mot de passe requis');
    }

    // Protection contre le brute force
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (isIpBlocked($clientIp)) {
        throw new Exception('Trop de tentatives de connexion. Réessayez dans 15 minutes.');
    }

    // Connexion à la base de données
    $dbPath = __DIR__ . '/../database/geekndragon.db';
    if (!file_exists($dbPath)) {
        throw new Exception('Base de données non trouvée');
    }

    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Recherche de l'utilisateur
    $stmt = $pdo->prepare("
        SELECT id, email, password_hash, nom_aventurier, niveau, espece, classe, historique,
               style_jeu, experience_jeu, campagnes_preferees, email_verifie, statut,
               date_creation, derniere_connexion
        FROM users 
        WHERE email = ?
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        // Enregistrer la tentative échouée
        recordFailedAttempt($clientIp);
        throw new Exception('Email ou mot de passe incorrect');
    }

    // Vérification du statut du compte
    if ($user['statut'] !== 'actif') {
        throw new Exception('Compte désactivé. Contactez le support.');
    }

    // Vérification du mot de passe
    if (!password_verify($password, $user['password_hash'])) {
        // Enregistrer la tentative échouée
        recordFailedAttempt($clientIp);
        throw new Exception('Email ou mot de passe incorrect');
    }

    // Mise à jour de la dernière connexion
    $stmt = $pdo->prepare("UPDATE users SET derniere_connexion = datetime('now') WHERE id = ?");
    $stmt->execute([$user['id']]);

    // Création de la session
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_name'] = $user['nom_aventurier'];
    $_SESSION['login_time'] = time();

    // Générer un token de session sécurisé
    $sessionToken = bin2hex(random_bytes(32));
    $_SESSION['session_token'] = $sessionToken;

    // Enregistrer la session en base
    $stmt = $pdo->prepare("
        INSERT OR REPLACE INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
        VALUES (?, ?, ?, ?, datetime('now', '+30 days'))
    ");
    $stmt->execute([
        session_id(),
        $user['id'],
        $clientIp,
        $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ]);

    // Récupération des recommandations récentes
    $recommendations = getUserRecommendations($pdo, $user['id']);

    // Réinitialiser les tentatives échouées pour cette IP
    clearFailedAttempts($clientIp);

    // Journalisation de la connexion
    error_log("Connexion réussie: {$user['email']} (ID: {$user['id']}) depuis $clientIp");

    // Préparation de la réponse (sans données sensibles)
    $userResponse = [
        'id' => $user['id'],
        'email' => $user['email'],
        'nom_aventurier' => $user['nom_aventurier'],
        'niveau' => intval($user['niveau']),
        'espece' => $user['espece'],
        'classe' => $user['classe'],
        'historique' => $user['historique'],
        'style_jeu' => $user['style_jeu'],
        'experience_jeu' => $user['experience_jeu'],
        'campagnes_preferees' => $user['campagnes_preferees'],
        'email_verifie' => (bool)$user['email_verifie'],
        'date_creation' => $user['date_creation'],
        'derniere_connexion' => $user['derniere_connexion']
    ];

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'user' => $userResponse,
        'recommendations' => $recommendations,
        'session_token' => $sessionToken
    ]);

} catch (PDOException $e) {
    error_log("Erreur PDO lors de la connexion: " . $e->getMessage());
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

/**
 * Vérifie si une IP est bloquée (protection brute force)
 */
function isIpBlocked($ip) {
    $lockFile = __DIR__ . '/../cache/failed_attempts.json';
    
    if (!file_exists($lockFile)) {
        return false;
    }

    $attempts = json_decode(file_get_contents($lockFile), true) ?: [];
    
    if (!isset($attempts[$ip])) {
        return false;
    }

    $ipData = $attempts[$ip];
    
    // Vérifier si le blocage est expiré (15 minutes)
    if (time() - $ipData['last_attempt'] > 900) {
        unset($attempts[$ip]);
        file_put_contents($lockFile, json_encode($attempts));
        return false;
    }
    
    // Bloquer après 5 tentatives en 15 minutes
    return $ipData['count'] >= 5;
}

/**
 * Enregistre une tentative de connexion échouée
 */
function recordFailedAttempt($ip) {
    $lockFile = __DIR__ . '/../cache/failed_attempts.json';
    $cacheDir = dirname($lockFile);
    
    // Créer le dossier cache s'il n'existe pas
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    
    $attempts = [];
    if (file_exists($lockFile)) {
        $attempts = json_decode(file_get_contents($lockFile), true) ?: [];
    }
    
    if (!isset($attempts[$ip])) {
        $attempts[$ip] = ['count' => 0, 'first_attempt' => time()];
    }
    
    $attempts[$ip]['count']++;
    $attempts[$ip]['last_attempt'] = time();
    
    // Nettoyer les anciennes tentatives (plus de 24h)
    foreach ($attempts as $attemptIp => $data) {
        if (time() - $data['first_attempt'] > 86400) {
            unset($attempts[$attemptIp]);
        }
    }
    
    file_put_contents($lockFile, json_encode($attempts));
}

/**
 * Efface les tentatives échouées pour une IP
 */
function clearFailedAttempts($ip) {
    $lockFile = __DIR__ . '/../cache/failed_attempts.json';
    
    if (!file_exists($lockFile)) {
        return;
    }
    
    $attempts = json_decode(file_get_contents($lockFile), true) ?: [];
    
    if (isset($attempts[$ip])) {
        unset($attempts[$ip]);
        file_put_contents($lockFile, json_encode($attempts));
    }
}

/**
 * Récupère les recommandations de l'utilisateur
 */
function getUserRecommendations($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("
            SELECT product_id, type_recommandation, score, raison, date_generation
            FROM user_recommendations 
            WHERE user_id = ? AND (expires_at IS NULL OR expires_at > datetime('now'))
            ORDER BY score DESC, date_generation DESC
            LIMIT 5
        ");
        $stmt->execute([$userId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Erreur lors de la récupération des recommandations: " . $e->getMessage());
        return [];
    }
}
?>
<?php
/**
 * Page de Connexion Administrateur - Geek&Dragon
 * Authentification sécurisée avec protection contre les attaques
 */

session_start();
define('ADMIN_ACCESS', true);
require_once 'config.php';

// Rediriger si déjà connecté
if (isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    header('Location: dashboard.php');
    exit;
}

$error = '';
$lockout_message = '';

// Gestion du verrouillage IP
function isLocked($ip) {
    $lockFile = __DIR__ . '/logs/lockouts.json';
    if (!file_exists($lockFile)) {
        return false;
    }
    
    $lockouts = json_decode(file_get_contents($lockFile), true) ?: [];
    
    if (isset($lockouts[$ip])) {
        $lockData = $lockouts[$ip];
        if (time() - $lockData['time'] < LOCKOUT_DURATION) {
            return $lockData;
        } else {
            // Supprimer le verrouillage expiré
            unset($lockouts[$ip]);
            file_put_contents($lockFile, json_encode($lockouts));
        }
    }
    
    return false;
}

function recordFailedAttempt($ip) {
    $attemptsFile = __DIR__ . '/logs/attempts.json';
    $attempts = [];
    
    if (file_exists($attemptsFile)) {
        $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
    }
    
    if (!isset($attempts[$ip])) {
        $attempts[$ip] = ['count' => 0, 'first_attempt' => time()];
    }
    
    $attempts[$ip]['count']++;
    $attempts[$ip]['last_attempt'] = time();
    
    // Nettoyer les tentatives anciennes (plus de 1 heure)
    foreach ($attempts as $checkIp => $data) {
        if (time() - $data['first_attempt'] > 3600) {
            unset($attempts[$checkIp]);
        }
    }
    
    file_put_contents($attemptsFile, json_encode($attempts));
    
    // Verrouiller si trop de tentatives
    if ($attempts[$ip]['count'] >= MAX_LOGIN_ATTEMPTS) {
        $lockFile = __DIR__ . '/logs/lockouts.json';
        $lockouts = [];
        
        if (file_exists($lockFile)) {
            $lockouts = json_decode(file_get_contents($lockFile), true) ?: [];
        }
        
        $lockouts[$ip] = [
            'time' => time(),
            'attempts' => $attempts[$ip]['count']
        ];
        
        if (!is_dir(dirname($lockFile))) {
            mkdir(dirname($lockFile), 0755, true);
        }
        
        file_put_contents($lockFile, json_encode($lockouts));
        
        logAdminAction('IP_LOCKED', "IP {$ip} verrouillée après {$attempts[$ip]['count']} tentatives");
        
        return true;
    }
    
    return false;
}

$clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Vérifier si l'IP est verrouillée
$lockInfo = isLocked($clientIP);
if ($lockInfo) {
    $remainingTime = LOCKOUT_DURATION - (time() - $lockInfo['time']);
    $lockout_message = "Trop de tentatives de connexion. Veuillez patienter " . ceil($remainingTime / 60) . " minutes.";
    logAdminAction('LOGIN_BLOCKED', "Tentative de connexion bloquée - IP verrouillée");
}

// Traitement du formulaire de connexion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$lockInfo) {
    $username = sanitizeInput($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $csrf_token = $_POST['csrf_token'] ?? '';
    
    // Vérification CSRF
    if (!verifyCSRFToken($csrf_token)) {
        $error = 'Token de sécurité invalide';
        logAdminAction('LOGIN_CSRF_FAIL', "Token CSRF invalide pour {$username}");
    } else {
        // Vérification des identifiants
        if ($username === ADMIN_USERNAME && $password === ADMIN_PASSWORD) {
            // Connexion réussie
            $_SESSION['admin_logged_in'] = true;
            $_SESSION['admin_username'] = $username;
            $_SESSION['admin_login_time'] = time();
            $_SESSION['admin_last_activity'] = time();
            
            // Nettoyer les tentatives pour cette IP
            $attemptsFile = __DIR__ . '/logs/attempts.json';
            if (file_exists($attemptsFile)) {
                $attempts = json_decode(file_get_contents($attemptsFile), true) ?: [];
                unset($attempts[$clientIP]);
                file_put_contents($attemptsFile, json_encode($attempts));
            }
            
            logAdminAction('LOGIN_SUCCESS', "Connexion réussie pour {$username}");
            
            header('Location: dashboard.php');
            exit;
        } else {
            // Connexion échouée
            $error = 'Identifiants incorrects';
            logAdminAction('LOGIN_FAIL', "Échec de connexion pour {$username}");
            
            // Enregistrer la tentative échouée
            if (recordFailedAttempt($clientIP)) {
                $lockout_message = "Trop de tentatives de connexion. Accès verrouillé pour " . (LOCKOUT_DURATION / 60) . " minutes.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administration - Geek&Dragon</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .admin-login {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--dark-bg);
            padding: 2rem;
        }
        
        .login-form {
            background: var(--card-bg);
            padding: 3rem;
            border-radius: var(--border-radius);
            border: 2px solid var(--secondary-color);
            box-shadow: var(--shadow-heavy);
            width: 100%;
            max-width: 400px;
        }
        
        .login-form h1 {
            color: var(--secondary-color);
            text-align: center;
            margin-bottom: 2rem;
            font-family: var(--font-heading);
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            color: var(--light-text);
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .form-group input {
            width: 100%;
            padding: 1rem;
            background: var(--dark-bg);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            color: var(--light-text);
            font-size: 1rem;
            transition: var(--transition);
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--secondary-color);
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }
        
        .login-btn {
            width: 100%;
            padding: 1rem;
            background: var(--secondary-color);
            color: var(--dark-bg);
            border: none;
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .login-btn:hover {
            background: #b8860b;
            transform: translateY(-2px);
        }
        
        .login-btn:disabled {
            background: var(--border-color);
            cursor: not-allowed;
            transform: none;
        }
        
        .error-message {
            background: rgba(220, 20, 60, 0.2);
            border: 1px solid var(--dragon-red);
            color: var(--dragon-red);
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .lockout-message {
            background: rgba(255, 165, 0, 0.2);
            border: 1px solid orange;
            color: orange;
            padding: 1rem;
            border-radius: var(--border-radius);
            margin-bottom: 1.5rem;
            text-align: center;
        }
        
        .security-info {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(212, 175, 55, 0.1);
            border-radius: var(--border-radius);
            color: var(--medium-text);
            font-size: 0.9rem;
            text-align: center;
        }
        
        .back-to-site {
            text-align: center;
            margin-top: 1.5rem;
        }
        
        .back-to-site a {
            color: var(--secondary-color);
            text-decoration: none;
            font-size: 0.9rem;
        }
        
        .back-to-site a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="admin-login">
        <form class="login-form" method="POST">
            <h1>🛡️ Administration</h1>
            
            <?php if ($lockout_message): ?>
                <div class="lockout-message">
                    <?= htmlspecialchars($lockout_message) ?>
                </div>
            <?php elseif ($error): ?>
                <div class="error-message">
                    <?= htmlspecialchars($error) ?>
                </div>
            <?php endif; ?>
            
            <div class="form-group">
                <label for="username">Nom d'utilisateur</label>
                <input type="text" id="username" name="username" required <?= $lockInfo ? 'disabled' : '' ?> 
                       value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
            </div>
            
            <div class="form-group">
                <label for="password">Mot de passe</label>
                <input type="password" id="password" name="password" required <?= $lockInfo ? 'disabled' : '' ?>>
            </div>
            
            <input type="hidden" name="csrf_token" value="<?= generateCSRFToken() ?>">
            
            <button type="submit" class="login-btn" <?= $lockInfo ? 'disabled' : '' ?>>
                <?= $lockInfo ? 'Accès verrouillé' : 'Se connecter' ?>
            </button>
            
            <div class="security-info">
                🔒 Connexion sécurisée avec protection anti-bruteforce.<br>
                Maximum <?= MAX_LOGIN_ATTEMPTS ?> tentatives par IP.
            </div>
            
            <div class="back-to-site">
                <a href="../index.php">← Retour au site</a>
            </div>
        </form>
    </div>
</body>
</html>
<?php
/**
 * Configuration Administrative - Geek&Dragon
 * Gestion sécurisée des identifiants et paramètres admin
 */

// Empêcher l'accès direct
if (!defined('ADMIN_ACCESS')) {
    die('Accès interdit');
}

// Chargement du fichier .env
function loadEnv($path) {
    if (!file_exists($path)) {
        throw new Exception('.env file not found');
    }
    
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        
        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}

// Charger la configuration depuis .env
try {
    loadEnv(__DIR__ . '/../.env');
} catch (Exception $e) {
    die('Erreur de configuration: ' . $e->getMessage());
}

// Configuration de sécurité
define('ADMIN_USERNAME', $_ENV['ADMIN_USERNAME'] ?? 'admin');
define('ADMIN_PASSWORD', $_ENV['ADMIN_PASSWORD'] ?? 'password');
define('SESSION_TIMEOUT', (int)($_ENV['ADMIN_SESSION_TIMEOUT'] ?? 3600));
define('MAX_LOGIN_ATTEMPTS', (int)($_ENV['ADMIN_MAX_LOGIN_ATTEMPTS'] ?? 5));
define('LOCKOUT_DURATION', (int)($_ENV['ADMIN_LOCKOUT_DURATION'] ?? 900));

// Configuration Snipcart API
define('SNIPCART_API_KEY', $_ENV['SNIPCART_API_KEY'] ?? '');
define('SNIPCART_SECRET_KEY', $_ENV['SNIPCART_SECRET_KEY'] ?? '');
define('SNIPCART_API_URL', 'https://app.snipcart.com/api');

// Fonctions utilitaires de sécurité
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

function logAdminAction($action, $details = '') {
    $logFile = __DIR__ . '/logs/admin_actions.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'Unknown';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown';
    
    $logEntry = "[{$timestamp}] IP: {$ip} | Action: {$action} | Details: {$details} | UserAgent: {$userAgent}" . PHP_EOL;
    
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}
?>
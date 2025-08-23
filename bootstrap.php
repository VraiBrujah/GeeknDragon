<?php

// Fonction de validation sécurisée des hosts
if (!function_exists('validateHost')) {
function validateHost($host) {
    // Liste des domaines autorisés
    $allowedHosts = [
        'geekndragon.com',
        'www.geekndragon.com',
        'localhost',
        '127.0.0.1'
    ];
    
    // Nettoyer et valider le host
    $host = strtolower(trim($host));
    
    // Vérifier si le host est dans la liste autorisée
    if (in_array($host, $allowedHosts, true)) {
        return $host;
    }
    
    // Si développement local, permettre les ports
    if (preg_match('/^(localhost|127\.0\.0\.1):\d+$/', $host)) {
        return $host;
    }
    
    // Fallback sécurisé
    return 'geekndragon.com';
}
}

// Validation sécurisée des variables d'environnement
if (!function_exists('getSecureEnvVar')) {
function getSecureEnvVar($key, $default = null) {
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? $default;
    
    // Validation spécifique selon le type de variable
    if ($value) {
        // Variables SMTP plus permissives (peuvent contenir @, +, etc.)
        if (str_contains($key, 'SMTP_')) {
            if (!preg_match('/^[a-zA-Z0-9_\-\.@+]+$/', $value)) {
                error_log("Invalid SMTP env var detected: $key");
                return $default;
            }
        } else {
            // Autres variables - validation stricte
            if (!preg_match('/^[a-zA-Z0-9_\-\.]+$/', $value)) {
                error_log("Invalid env var detected: $key");
                return $default;
            }
        }
    }
    
    return $value;
}
}

// Headers de sécurité critiques (seulement si pas en mode CLI)
if (php_sapi_name() !== 'cli' && !headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: payment=(self)');

    // CSP basique mais compatible
    $csp = "default-src 'self'; " .
           "script-src 'self' 'unsafe-inline' cdn.snipcart.com js.stripe.com *.google-analytics.com; " .
           "style-src 'self' 'unsafe-inline' fonts.googleapis.com; " .
           "font-src 'self' fonts.gstatic.com; " .
           "img-src 'self' data: *.geekndragon.com; " .
           "connect-src 'self' app.snipcart.com *.google-analytics.com; " .
           "frame-src js.stripe.com;";
    header("Content-Security-Policy: $csp");
}

require_once __DIR__ . '/vendor/erusev/parsedown/Parsedown.php';

// Attempt to load Composer's autoloader only if all required files are present.
$vendorDir = __DIR__ . '/vendor';
$autoload  = $vendorDir . '/autoload.php';
$polyfills = [
    $vendorDir . '/symfony/polyfill-ctype/bootstrap.php',
    $vendorDir . '/symfony/polyfill-mbstring/bootstrap.php',
    $vendorDir . '/symfony/polyfill-php80/bootstrap.php',
];

$canLoadVendor = file_exists($autoload);
foreach ($polyfills as $file) {
    if (!file_exists($file)) {
        $canLoadVendor = false;
        break;
    }
}
if ($canLoadVendor) {
    require_once $autoload;

    if (class_exists('Dotenv\\Dotenv')) {
        Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();
    }
} else {
    // Basic .env loader sécurisé
    $envPath = __DIR__ . '/.env';
    
    // Validation du chemin pour éviter path traversal
    $realEnvPath = realpath($envPath);
    $realBaseDir = realpath(__DIR__);
    
    if ($realEnvPath && $realBaseDir && str_starts_with($realEnvPath, $realBaseDir) && file_exists($envPath)) {
        $content = file_get_contents($envPath);
        if ($content !== false) {
            foreach (explode("\n", $content) as $line) {
                $line = trim($line);
                
                // Ignorer commentaires et lignes vides
                if ($line === '' || str_starts_with($line, '#')) {
                    continue;
                }
                
                // Validation format key=value
                if (!str_contains($line, '=')) {
                    continue;
                }
                
                [$name, $value] = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                
                // Validation nom de variable
                if ($name === '' || !preg_match('/^[A-Z_][A-Z0-9_]*$/', $name)) {
                    error_log("Invalid env var name: $name");
                    continue;
                }
                
                // Limitation taille pour éviter DoS
                if (strlen($value) > 1000) {
                    error_log("Env var too long: $name");
                    continue;
                }
                
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Configuration du mode production
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/storage/logs/php_errors.log');

// Gestionnaire d'erreurs global pour les clés API manquantes
set_exception_handler(function ($e) {
    error_log("Erreur critique: " . $e->getMessage() . " dans " . $e->getFile() . ":" . $e->getLine());
    
    // En mode production, afficher une page d'erreur générique
    if (strpos($e->getMessage(), 'SNIPCART') !== false) {
        http_response_code(503);
        $userMessage = htmlspecialchars(preg_replace('/^SNIPCART:\\s*/', '', $e->getMessage()), ENT_QUOTES, 'UTF-8');
        echo '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Configuration requise - Geek & Dragon</title>
    <style>
        body { font-family: "Cinzel", serif; text-align: center; padding: 2rem; background: #111827; color: white; }
        .error-box { max-width: 500px; margin: 0 auto; padding: 2rem; border: 2px solid #dc2626; border-radius: 0.5rem; }
        h1 { color: #fbbf24; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; line-height: 1.6; }
        .contact { margin-top: 2rem; }
        a { color: #60a5fa; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="error-box">
        <h1>⚙️ Configuration requise</h1>
        <p>' . $userMessage . '</p>
        <p>Veuillez contacter l\'administrateur du site.</p>
        <div class="contact">
            <a href="mailto:contact@geekndragon.com">📧 Nous contacter</a>
        </div>
    </div>
</body>
</html>';
        exit;
    }
    
    // Autres erreurs : page d'erreur générique
    http_response_code(500);
    echo '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Erreur temporaire - Geek & Dragon</title>
    <style>
        body { font-family: "Cinzel", serif; text-align: center; padding: 2rem; background: #111827; color: white; }
        .error-box { max-width: 500px; margin: 0 auto; padding: 2rem; border: 2px solid #dc2626; border-radius: 0.5rem; }
        h1 { color: #fbbf24; margin-bottom: 1rem; }
        p { margin-bottom: 1rem; line-height: 1.6; }
        .back { margin-top: 2rem; }
        a { color: #60a5fa; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="error-box">
        <h1>🛡️ Erreur temporaire</h1>
        <p>Une erreur technique temporaire est survenue.</p>
        <p>Nos dragons travaillent à la résoudre !</p>
        <div class="back">
            <a href="/">🏠 Retour à l\'accueil</a>
        </div>
    </div>
</body>
</html>';
    exit;
});

<?php
declare(strict_types=1);
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
        // Variables SMTP plus permissives (peuvent contenir @, +, caractères spéciaux pour mots de passe)
        if (str_contains($key, 'SMTP_')) {
            // Validation très permissive pour SMTP (accepte la plupart des caractères sauf ceux dangereux)
            if (!preg_match('/^[a-zA-Z0-9_\-\.@+#$~^=!%*]+$/', $value)) {
                error_log("Invalid SMTP env var detected: $key");
                return $default;
            }
        } 
        // Variables Snipcart (accepte base64 et formats standards)
        elseif (str_contains($key, 'SNIPCART_')) {
            if (!preg_match('/^[A-Za-z0-9_\-\.\/+=]+$/', $value)) {
                error_log("Invalid Snipcart env var detected: $key");
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
$cspNonce = base64_encode(random_bytes(16));
if (php_sapi_name() !== 'cli' && !headers_sent()) {
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: payment=(self)');

    // CSP stricte avec nonces
    $csp = "default-src 'self'; " .
           "script-src 'self' 'nonce-$cspNonce' cdn.snipcart.com js.stripe.com *.google-analytics.com; " .
           "style-src 'self' 'nonce-$cspNonce' fonts.googleapis.com; " .
           "font-src 'self' fonts.gstatic.com; " .
           "img-src 'self' data: *.geekndragon.com; " .
           "connect-src 'self' app.snipcart.com *.google-analytics.com; " .
           "frame-src js.stripe.com;";
    header("Content-Security-Policy: $csp");
}

require_once __DIR__ . '/vendor/erusev/parsedown/Parsedown.php';

// 🚀 INITIALISATION PERFORMANCE
$GLOBALS['startTime'] = microtime(true);
$GLOBALS['performanceTimings'] = [];

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
    
    // 🚀 INITIALISATION SYSTÈMES PERFORMANCE
    if (class_exists('GeeknDragon\\Performance\\CacheManager')) {
        $GLOBALS['cacheManager'] = new GeeknDragon\Performance\CacheManager();
        
        // Nettoyage automatique (1% de chance)
        if (mt_rand(1, 100) === 1) {
            $cleanupStats = $GLOBALS['cacheManager']->cleanup();
            error_log("Cache cleanup: " . $cleanupStats['deleted'] . " files, " . $cleanupStats['space_freed'] . " freed");
        }
    }
    
    // Headers de performance intelligents
    if (php_sapi_name() !== 'cli' && class_exists('GeeknDragon\\Performance\\PerformanceHeaders')) {
        $requestUri = $_SERVER['REQUEST_URI'] ?? '';
        
        // Ressources statiques avec cache agressif
        if (preg_match('/\.(css|js|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|eot|svg|mp4)$/i', $requestUri)) {
            $ext = pathinfo($requestUri, PATHINFO_EXTENSION);
            $contentType = match(strtolower($ext)) {
                'css' => 'text/css',
                'js' => 'application/javascript',
                'png' => 'image/png',
                'jpg', 'jpeg' => 'image/jpeg',
                'webp' => 'image/webp',
                'gif' => 'image/gif',
                'ico' => 'image/x-icon',
                'woff', 'woff2' => 'font/woff2',
                'ttf' => 'font/ttf',
                'svg' => 'image/svg+xml',
                'mp4' => 'video/mp4',
                default => 'application/octet-stream'
            };
            GeeknDragon\Performance\PerformanceHeaders::setStaticResourceHeaders($contentType);
        }
        // API endpoints
        elseif (strpos($requestUri, '/api/') !== false || strpos($requestUri, '.json') !== false) {
            GeeknDragon\Performance\PerformanceHeaders::setApiHeaders(300);
        }
        // Pages dynamiques avec hints critiques
        else {
            GeeknDragon\Performance\PerformanceHeaders::setDynamicPageHeaders(1800, true);
            GeeknDragon\Performance\PerformanceHeaders::addCriticalResourceHints();
        }
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
set_exception_handler(function ($e) use ($cspNonce) {
    error_log("Erreur critique: " . $e->getMessage() . " dans " . $e->getFile() . ":" . $e->getLine());
    
    // Générer un nonce de sécurité si pas déjà défini
    $safeNonce = $cspNonce ?? base64_encode(random_bytes(16));
    
    // En mode production, afficher une page d'erreur générique
    if (strpos($e->getMessage(), 'SNIPCART') !== false) {
        http_response_code(503);
        $userMessage = htmlspecialchars(preg_replace('/^SNIPCART:\\s*/', '', $e->getMessage()), ENT_QUOTES, 'UTF-8');
        echo '<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Configuration requise - Geek & Dragon</title>
    <style nonce="' . htmlspecialchars($safeNonce, ENT_QUOTES, 'UTF-8') . '">
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
    <style nonce="' . htmlspecialchars($safeNonce, ENT_QUOTES, 'UTF-8') . '">
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

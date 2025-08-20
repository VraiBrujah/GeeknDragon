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

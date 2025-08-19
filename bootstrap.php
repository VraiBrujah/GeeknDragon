<?php

// Headers de sécurité
header('Permissions-Policy: payment=(self)');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Content-Security-Policy: default-src \'self\'; img-src \'self\' data: https:; script-src \'self\' \'unsafe-inline\' https://js.snipcart.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; connect-src \'self\' https://app.snipcart.com; frame-src https://js.snipcart.com');

// Configuration des erreurs et logging  
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log');

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
    // Basic .env loader to emulate Dotenv functionality
    $envPath = __DIR__ . '/.env';
    if (file_exists($envPath)) {
        foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
                continue;
            }
            [$name, $value] = explode('=', $line, 2);
            $name  = trim($name);
            $value = trim($value);
            if ($name !== '') {
                putenv("{$name}={$value}");
                $_ENV[$name]    = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

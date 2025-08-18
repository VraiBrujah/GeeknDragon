<?php

header('Permissions-Policy: payment=(self)');

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
            if (strpos(trim($line), '#') === 0 || strpos($line, '=') === false) {
                continue;
            }
            $parts = explode('=', $line, 2);
            $name  = trim($parts[0]);
            $value = isset($parts[1]) ? trim($parts[1]) : '';
            if ($name !== '') {
                putenv("{$name}={$value}");
                $_ENV[$name]    = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

$snipcartConfig = require __DIR__ . '/config/snipcart.php';
$stripeConfig   = require __DIR__ . '/config/stripe.php';

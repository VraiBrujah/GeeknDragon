<?php
// Version debug du bootstrap pour identifier le problème

header('Permissions-Policy: payment=(self)');

echo "<!-- Debug Bootstrap Step 1: Headers set -->\n";

// Test de base
if (!file_exists(__DIR__ . '/vendor/erusev/parsedown/Parsedown.php')) {
    die('ERREUR: Parsedown non trouvé dans ' . __DIR__ . '/vendor/erusev/parsedown/Parsedown.php');
}

require_once __DIR__ . '/vendor/erusev/parsedown/Parsedown.php';
echo "<!-- Debug Bootstrap Step 2: Parsedown loaded -->\n";

// Attempt to load Composer's autoloader only if all required files are present.
$vendorDir = __DIR__ . '/vendor';
$autoload  = $vendorDir . '/autoload.php';
$polyfills = [
    $vendorDir . '/symfony/polyfill-ctype/bootstrap.php',
    $vendorDir . '/symfony/polyfill-mbstring/bootstrap.php',
    $vendorDir . '/symfony/polyfill-php80/bootstrap.php',
];

echo "<!-- Debug Bootstrap Step 3: Checking vendor files -->\n";

$canLoadVendor = file_exists($autoload);
echo "<!-- Autoload exists: " . ($canLoadVendor ? 'YES' : 'NO') . " -->\n";

foreach ($polyfills as $file) {
    $exists = file_exists($file);
    echo "<!-- Polyfill $file exists: " . ($exists ? 'YES' : 'NO') . " -->\n";
    if (!$exists) {
        $canLoadVendor = false;
        break;
    }
}

echo "<!-- Can load vendor: " . ($canLoadVendor ? 'YES' : 'NO') . " -->\n";

if ($canLoadVendor) {
    echo "<!-- Debug Bootstrap Step 4: Loading autoloader -->\n";
    require_once $autoload;
    echo "<!-- Debug Bootstrap Step 5: Autoloader loaded -->\n";

    if (class_exists('Dotenv\\Dotenv')) {
        echo "<!-- Debug Bootstrap Step 6: Dotenv exists, loading .env -->\n";
        try {
            Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();
            echo "<!-- Debug Bootstrap Step 7: .env loaded successfully -->\n";
        } catch (Exception $e) {
            echo "<!-- Debug Bootstrap ERROR loading .env: " . $e->getMessage() . " -->\n";
        }
    } else {
        echo "<!-- Debug Bootstrap Step 6: Dotenv class not found -->\n";
    }
} else {
    echo "<!-- Debug Bootstrap Step 4: Using manual .env loader -->\n";
    // Basic .env loader to emulate Dotenv functionality
    $envPath = __DIR__ . '/.env';
    if (file_exists($envPath)) {
        echo "<!-- Debug Bootstrap Step 5: .env file found -->\n";
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
        echo "<!-- Debug Bootstrap Step 6: .env loaded manually -->\n";
    } else {
        echo "<!-- Debug Bootstrap Step 5: .env file NOT found -->\n";
    }
}

echo "<!-- Debug Bootstrap Step 7: Loading config files -->\n";

try {
    $snipcartConfig = require __DIR__ . '/config/snipcart.php';
    echo "<!-- Debug Bootstrap Step 8: snipcart.php loaded -->\n";
} catch (Exception $e) {
    echo "<!-- Debug Bootstrap ERROR loading snipcart.php: " . $e->getMessage() . " -->\n";
    die('ERREUR: Impossible de charger config/snipcart.php');
}

try {
    $stripeConfig = require __DIR__ . '/config/stripe.php';
    echo "<!-- Debug Bootstrap Step 9: stripe.php loaded -->\n";
} catch (Exception $e) {
    echo "<!-- Debug Bootstrap ERROR loading stripe.php: " . $e->getMessage() . " -->\n";
    die('ERREUR: Impossible de charger config/stripe.php');
}

echo "<!-- Debug Bootstrap Step 10: Bootstrap completed successfully -->\n";
?>
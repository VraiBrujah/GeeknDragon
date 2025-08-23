<?php
// Page de diagnostic temporaire pour identifier les problèmes de production
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

echo "<h1>Diagnostic GeeknDragon</h1>";
echo "<p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Test 1: Version PHP
echo "<h2>1. Version PHP</h2>";
echo "<p>Version: " . phpversion() . "</p>";

// Test 2: Extensions PHP requises
echo "<h2>2. Extensions PHP</h2>";
$extensions = ['mbstring', 'json', 'curl', 'openssl'];
foreach ($extensions as $ext) {
    $status = extension_loaded($ext) ? '✅' : '❌';
    echo "<p>{$status} {$ext}</p>";
}

// Test 3: Fichiers critiques
echo "<h2>3. Fichiers critiques</h2>";
$files = [
    'bootstrap.php',
    'config.php',
    '.env',
    'vendor/autoload.php',
    'vendor/erusev/parsedown/Parsedown.php'
];
foreach ($files as $file) {
    $path = __DIR__ . '/' . $file;
    $status = file_exists($path) ? '✅' : '❌';
    echo "<p>{$status} {$file}</p>";
}

// Test 4: Variables d'environnement
echo "<h2>4. Variables d'environnement</h2>";
$envVars = ['SNIPCART_API_KEY', 'SNIPCART_SECRET_API_KEY', 'SMTP_HOST'];
foreach ($envVars as $var) {
    $value = $_ENV[$var] ?? $_SERVER[$var] ?? 'NON DÉFINIE';
    $masked = $var === 'SNIPCART_SECRET_API_KEY' ? substr($value, 0, 10) . '...' : $value;
    echo "<p>{$var}: {$masked}</p>";
}

// Test 5: Inclusion Bootstrap
echo "<h2>5. Test Bootstrap</h2>";
try {
    ob_start();
    require_once __DIR__ . '/bootstrap.php';
    ob_end_clean();
    echo "<p>✅ bootstrap.php chargé avec succès</p>";
} catch (Throwable $e) {
    echo "<p>❌ Erreur bootstrap: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Fichier: " . htmlspecialchars($e->getFile()) . ":" . $e->getLine() . "</p>";
}

// Test 6: Test config
echo "<h2>6. Test Config</h2>";
try {
    $config = require __DIR__ . '/config.php';
    echo "<p>✅ config.php chargé avec succès</p>";
} catch (Throwable $e) {
    echo "<p>❌ Erreur config: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Fichier: " . htmlspecialchars($e->getFile()) . ":" . $e->getLine() . "</p>";
}

echo "<hr>";
echo "<p><em>⚠️ SUPPRIMEZ ce fichier debug.php après diagnostic !</em></p>";
?>
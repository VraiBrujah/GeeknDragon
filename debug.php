<?php
/**
 * Script de diagnostic pour identifier les problèmes sur HostPapa
 */

// Activer l'affichage des erreurs
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Diagnostic HostPapa</h1>";

// 1. Version PHP
echo "<h2>1. Version PHP</h2>";
echo "Version PHP : " . phpversion() . "<br>";
echo "SAPI : " . php_sapi_name() . "<br>";

// 2. Extensions requises
echo "<h2>2. Extensions PHP</h2>";
$required_extensions = ['curl', 'json', 'openssl', 'mbstring'];
foreach ($required_extensions as $ext) {
    $status = extension_loaded($ext) ? '✅' : '❌';
    echo "$status Extension $ext<br>";
}

// 3. Fichiers critiques
echo "<h2>3. Fichiers critiques</h2>";
$critical_files = [
    'bootstrap.php',
    'config.php', 
    'i18n.php',
    'vendor/autoload.php',
    'data/products.json',
    'data/stock.json',
    'translations/fr.json',
    'translations/en.json'
];

foreach ($critical_files as $file) {
    $status = file_exists(__DIR__ . '/' . $file) ? '✅' : '❌';
    echo "$status $file<br>";
}

// 4. Permissions
echo "<h2>4. Permissions</h2>";
$check_dirs = ['.', 'data', 'translations', 'vendor'];
foreach ($check_dirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (is_dir($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        echo "Dossier $dir : $perms<br>";
    }
}

// 5. Test de chargement des dépendances
echo "<h2>5. Test des dépendances</h2>";
try {
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require __DIR__ . '/vendor/autoload.php';
        echo "✅ vendor/autoload.php chargé<br>";
        
        // Test Dotenv
        if (class_exists('Dotenv\Dotenv')) {
            echo "✅ Dotenv disponible<br>";
            
            // Test chargement .env
            if (file_exists(__DIR__ . '/.env')) {
                try {
                    Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();
                    echo "✅ .env chargé<br>";
                } catch (Exception $e) {
                    echo "❌ Erreur chargement .env : " . $e->getMessage() . "<br>";
                }
            } else {
                echo "⚠️ Fichier .env manquant<br>";
            }
        } else {
            echo "❌ Dotenv non disponible<br>";
        }
    } else {
        echo "❌ vendor/autoload.php manquant<br>";
    }
} catch (Exception $e) {
    echo "❌ Erreur chargement dependencies : " . $e->getMessage() . "<br>";
}

// 6. Test config
echo "<h2>6. Test configuration</h2>";
try {
    $config = require __DIR__ . '/config.php';
    echo "✅ config.php chargé<br>";
    echo "Clés config : " . implode(', ', array_keys($config)) . "<br>";
} catch (Exception $e) {
    echo "❌ Erreur config : " . $e->getMessage() . "<br>";
}

// 7. Variables d'environnement
echo "<h2>7. Variables d'environnement</h2>";
$env_vars = ['SMTP_HOST', 'SMTP_USERNAME', 'SNIPCART_API_KEY'];
foreach ($env_vars as $var) {
    $value = $_ENV[$var] ?? $_SERVER[$var] ?? null;
    $status = $value ? '✅' : '❌';
    echo "$status $var" . ($value ? " (définie)" : " (manquante)") . "<br>";
}

// 8. Test des fichiers JSON
echo "<h2>8. Test fichiers JSON</h2>";
$json_files = [
    'data/products.json',
    'data/stock.json', 
    'translations/fr.json'
];

foreach ($json_files as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $data = json_decode($content, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "✅ $file (valide)<br>";
        } else {
            echo "❌ $file (JSON invalide : " . json_last_error_msg() . ")<br>";
        }
    } else {
        echo "❌ $file (manquant)<br>";
    }
}

echo "<h2>9. Informations serveur</h2>";
echo "Document root : " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script filename : " . $_SERVER['SCRIPT_FILENAME'] . "<br>";
echo "Working directory : " . getcwd() . "<br>";
echo "__DIR__ : " . __DIR__ . "<br>";

echo "<h2>✅ Diagnostic terminé</h2>";
?>
<?php
// Script de diagnostic pour identifier les problemes sur le serveur de production
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Diagnostic du serveur GeeknDragon</h1>";

// Test 1: PHP version et extensions
echo "<h2>1. Environnement PHP</h2>";
echo "Version PHP: " . PHP_VERSION . "<br>";
echo "Extensions disponibles: " . implode(", ", get_loaded_extensions()) . "<br><br>";

// Test 2: Fichiers requis
echo "<h2>2. Fichiers requis</h2>";
$requiredFiles = [
    'bootstrap.php',
    'config.php',
    'i18n.php',
    'head-common.php',
    'header.php',
    'snipcart-init.php'
];

foreach ($requiredFiles as $file) {
    $exists = file_exists(__DIR__ . '/' . $file);
    echo "$file: " . ($exists ? "✅ Existe" : "❌ Manquant") . "<br>";
    if (!$exists) {
        echo "Chemin testé: " . __DIR__ . '/' . $file . "<br>";
    }
}

// Test 3: Dossiers media
echo "<h2>3. Dossiers médias</h2>";
$mediaDirs = [
    'media',
    'media/videos',
    'media/videos/backgrounds',
    'media/videos/demos',
    'media/branding',
    'media/ui',
    'media/products'
];

foreach ($mediaDirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    $exists = is_dir($path);
    echo "$dir: " . ($exists ? "✅ Existe" : "❌ Manquant") . "<br>";
    if ($exists) {
        $files = scandir($path);
        $fileCount = count($files) - 2; // -2 pour . et ..
        echo "  → $fileCount fichiers<br>";
    }
}

// Test 4: Videos clés
echo "<h2>4. Vidéos critiques</h2>";
$criticalVideos = [
    'media/videos/backgrounds/mage_compressed.mp4',
    'media/videos/backgrounds/cascade_HD_compressed.mp4',
    'media/videos/backgrounds/fontaine11_compressed.mp4'
];

foreach ($criticalVideos as $video) {
    $path = __DIR__ . '/' . $video;
    $exists = file_exists($path);
    echo "$video: " . ($exists ? "✅ Existe" : "❌ Manquant") . "<br>";
    if ($exists) {
        $size = round(filesize($path) / 1024 / 1024, 2);
        echo "  → Taille: {$size} MB<br>";
    }
}

// Test 5: Permissions
echo "<h2>5. Permissions</h2>";
$permission = substr(sprintf('%o', fileperms(__DIR__)), -4);
echo "Permissions du répertoire: $permission<br>";
echo "Propriétaire: " . (function_exists('posix_getpwuid') ? posix_getpwuid(fileowner(__DIR__))['name'] : 'N/A') . "<br>";

// Test 6: Variables d'environnement
echo "<h2>6. Variables d'environnement</h2>";
if (file_exists(__DIR__ . '/.env')) {
    echo ".env: ✅ Existe<br>";
    $envContent = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envContent);
    foreach ($lines as $line) {
        if (trim($line) && !str_starts_with(trim($line), '#')) {
            $parts = explode('=', $line, 2);
            if (count($parts) == 2) {
                $key = trim($parts[0]);
                echo "  → $key: défini<br>";
            }
        }
    }
} else {
    echo ".env: ❌ Manquant<br>";
}

// Test 7: Inclusions
echo "<h2>7. Test d'inclusion des fichiers</h2>";
try {
    if (file_exists(__DIR__ . '/bootstrap.php')) {
        require_once __DIR__ . '/bootstrap.php';
        echo "bootstrap.php: ✅ Inclusion réussie<br>";
    }
    
    if (file_exists(__DIR__ . '/config.php')) {
        $config = require __DIR__ . '/config.php';
        echo "config.php: ✅ Inclusion réussie<br>";
        echo "Config type: " . gettype($config) . "<br>";
    }
    
    if (file_exists(__DIR__ . '/i18n.php')) {
        require_once __DIR__ . '/i18n.php';
        echo "i18n.php: ✅ Inclusion réussie<br>";
        if (isset($translations)) {
            echo "Translations chargées: " . count($translations) . " sections<br>";
        }
    }
} catch (Exception $e) {
    echo "❌ Erreur d'inclusion: " . $e->getMessage() . "<br>";
}

echo "<h2>8. Test complet</h2>";
try {
    ob_start();
    
    // Simuler le début d'index.php
    if (file_exists(__DIR__ . '/bootstrap.php')) {
        require __DIR__ . '/bootstrap.php';
    }
    if (file_exists(__DIR__ . '/config.php')) {
        $config = require __DIR__ . '/config.php';
    }
    if (file_exists(__DIR__ . '/i18n.php')) {
        require __DIR__ . '/i18n.php';
    }
    
    $title = $translations['meta']['home']['title'] ?? 'Geek & Dragon';
    $metaDescription = $translations['meta']['home']['desc'] ?? '';
    
    ob_end_clean();
    echo "✅ Simulation d'index.php réussie<br>";
    echo "Titre: $title<br>";
    
} catch (Exception $e) {
    ob_end_clean();
    echo "❌ Erreur dans index.php: " . $e->getMessage() . "<br>";
    echo "Trace: " . $e->getTraceAsString() . "<br>";
}

echo "<p><strong>Diagnostic terminé.</strong></p>";
?>
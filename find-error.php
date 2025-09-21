<?php
// Script pour identifier l'erreur 500 en testant les inclusions une par une
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== IDENTIFICATION DE L'ERREUR 500 ===\n\n";

// Test 1: Fichiers de base un par un
$baseFiles = [
    'bootstrap.php' => 'Bootstrap',
    'config.php' => 'Configuration', 
    'i18n.php' => 'Internationalisation'
];

foreach ($baseFiles as $file => $desc) {
    echo "Test $desc ($file): ";
    try {
        if (file_exists($file)) {
            if ($file === 'config.php') {
                $result = require $file;
            } else {
                require_once $file;
            }
            echo "✅ OK\n";
        } else {
            echo "❌ Fichier manquant\n";
        }
    } catch (Throwable $e) {
        echo "❌ ERREUR: " . $e->getMessage() . "\n";
        echo "   Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "\n";
        exit("ERREUR FATALE TROUVÉE !\n");
    }
}

// Test 2: Variables critiques
echo "\nTest variables: ";
try {
    $title = $translations['meta']['home']['title'] ?? 'Geek & Dragon';
    $metaDescription = $translations['meta']['home']['desc'] ?? '';
    echo "✅ Variables OK\n";
} catch (Throwable $e) {
    echo "❌ ERREUR: " . $e->getMessage() . "\n";
    exit("ERREUR FATALE DANS LES VARIABLES !\n");
}

// Test 3: Inclusion des templates
$templates = [
    'head-common.php' => 'Head commun',
    'header.php' => 'Header',
    'snipcart-init.php' => 'Snipcart init'
];

foreach ($templates as $file => $desc) {
    echo "Test $desc ($file): ";
    try {
        if (file_exists($file)) {
            ob_start();
            include $file;
            ob_end_clean();
            echo "✅ OK\n";
        } else {
            echo "❌ Fichier manquant\n";
        }
    } catch (Throwable $e) {
        echo "❌ ERREUR: " . $e->getMessage() . "\n";
        echo "   Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "\n";
        exit("ERREUR FATALE TROUVÉE DANS $file !\n");
    }
}

echo "\n✅ TOUS LES TESTS PASSENT - Le problème vient d'ailleurs\n";
echo "Vérifiez :\n";
echo "- Les permissions des fichiers\n";
echo "- La version PHP du serveur\n";
echo "- Les extensions PHP manquantes\n";
echo "- Les logs d'erreur du serveur\n";
?>
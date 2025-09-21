<?php
// Test étape par étape pour identifier l'erreur 500
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== TEST ÉTAPE PAR ÉTAPE ===<br><br>";

try {
    echo "1. PHP de base : ✅<br>";
    
    echo "2. Test bootstrap.php : ";
    if (file_exists(__DIR__ . '/bootstrap.php')) {
        require __DIR__ . '/bootstrap.php';
        echo "✅<br>";
    } else {
        echo "❌ Fichier manquant<br>";
        exit;
    }
    
    echo "3. Test config.php : ";
    if (file_exists(__DIR__ . '/config.php')) {
        $config = require __DIR__ . '/config.php';
        echo "✅<br>";
    } else {
        echo "❌ Fichier manquant<br>";
        exit;
    }
    
    echo "4. Test i18n.php : ";
    if (file_exists(__DIR__ . '/i18n.php')) {
        require __DIR__ . '/i18n.php';
        echo "✅<br>";
    } else {
        echo "❌ Fichier manquant<br>";
        exit;
    }
    
    echo "5. Test variables : ";
    $title = $translations['meta']['home']['title'] ?? 'Geek & Dragon';
    $metaDescription = $translations['meta']['home']['desc'] ?? '';
    echo "✅ Title: $title<br>";
    
    echo "6. Test head-common.php : ";
    if (file_exists(__DIR__ . '/head-common.php')) {
        ob_start();
        include __DIR__ . '/head-common.php';
        $headContent = ob_get_clean();
        echo "✅<br>";
    } else {
        echo "❌ Fichier manquant<br>";
    }
    
    echo "7. Test header.php : ";
    if (file_exists(__DIR__ . '/header.php')) {
        ob_start();
        include __DIR__ . '/header.php';
        $headerContent = ob_get_clean();
        echo "✅<br>";
    } else {
        echo "❌ Fichier manquant<br>";
    }
    
    echo "8. Test snipcart-init.php : ";
    if (file_exists(__DIR__ . '/snipcart-init.php')) {
        ob_start();
        include __DIR__ . '/snipcart-init.php';
        $snipcartContent = ob_get_clean();
        echo "✅<br>";
    } else {
        echo "❌ Fichier manquant<br>";
    }
    
    echo "<br><strong>Tous les tests passent ! Le problème est ailleurs.</strong><br>";
    
} catch (Error $e) {
    echo "❌ ERREUR FATALE: " . $e->getMessage() . "<br>";
    echo "Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "<br>";
    echo "Trace: <pre>" . $e->getTraceAsString() . "</pre>";
} catch (Exception $e) {
    echo "❌ EXCEPTION: " . $e->getMessage() . "<br>";
    echo "Fichier: " . $e->getFile() . " ligne " . $e->getLine() . "<br>";
}
?>
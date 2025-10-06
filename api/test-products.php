<?php
/**
 * Script de test pour diagnostiquer l'endpoint products-async.php
 *
 * @author Brujah - Geek & Dragon
 */

// Activer l'affichage des erreurs pour le diagnostic
error_reporting(E_ALL);
ini_set('display_errors', '1');

// Simuler une requête GET
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['category'] = 'all';
$_GET['lang'] = 'fr';
$_SERVER['HTTP_HOST'] = '192.168.2.33:8000';

// Capturer la sortie
ob_start();

try {
    include __DIR__ . '/products-async.php';
    $output = ob_get_clean();

    echo "=== TEST RÉUSSI ===\n\n";
    echo "Longueur de la sortie: " . strlen($output) . " octets\n\n";

    // Vérifier si c'est du JSON valide
    $decoded = json_decode($output, true);
    if (json_last_error() === JSON_ERROR_NONE) {
        echo "✅ JSON VALIDE\n\n";
        echo "Clés présentes: " . implode(', ', array_keys($decoded)) . "\n\n";

        if (isset($decoded['counts'])) {
            echo "Compteurs produits:\n";
            foreach ($decoded['counts'] as $key => $count) {
                echo "  - {$key}: {$count}\n";
            }
        }

        if (isset($decoded['performance'])) {
            echo "\nPerformance:\n";
            echo "  - Temps d'exécution: {$decoded['performance']['execution_time_ms']} ms\n";
            echo "  - Mémoire utilisée: {$decoded['performance']['memory_mb']} MB\n";
        }
    } else {
        echo "❌ ERREUR JSON: " . json_last_error_msg() . "\n\n";
        echo "Sortie brute (premiers 500 caractères):\n";
        echo substr($output, 0, 500) . "\n";
    }

} catch (Exception $e) {
    $output = ob_get_clean();
    echo "=== ERREUR FATALE ===\n\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Fichier: " . $e->getFile() . ":" . $e->getLine() . "\n\n";
    echo "Sortie capturée:\n" . $output . "\n";
}

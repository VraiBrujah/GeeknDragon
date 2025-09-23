<?php
/**
 * Script pour générer le fichier CSV initial depuis le JSON existant
 * 
 * Usage: php scripts/generate-initial-csv.php
 */

require_once __DIR__ . '/../includes/csv-products-manager.php';

$jsonPath = __DIR__ . '/../data/products.json';
$csvPath = __DIR__ . '/../data/products.csv';

echo "Génération du fichier CSV initial depuis products.json...\n";

$manager = new CsvProductsManager();
$result = $manager->convertJsonToCsv($jsonPath, $csvPath);

if ($result['success']) {
    echo "✅ " . $result['message'] . "\n";
    echo "📁 Fichier CSV créé : data/products.csv\n";
    echo "\nVous pouvez maintenant :\n";
    echo "1. Éditer data/products.csv avec Excel/LibreOffice\n";
    echo "2. Utiliser l'interface d'administration pour importer les modifications\n";
} else {
    echo "❌ Erreur : " . $result['message'] . "\n";
    if (isset($result['errors'])) {
        foreach ($result['errors'] as $error) {
            echo "   - $error\n";
        }
    }
    exit(1);
}
?>
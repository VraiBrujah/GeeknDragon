<?php
require 'includes/csv-products-manager.php';

// Nettoyage automatique du CSV si nécessaire
$csvContent = file_get_contents('data/products.csv');
$csvContent = ltrim($csvContent, "\xEF\xBB\xBF"); // Supprime BOM UTF-8
$lines = explode("\n", $csvContent);

$csvPath = 'data/products.csv';

// Si ligne parasite Excel présente, créer un CSV temporaire nettoyé
if (isset($lines[0]) && strpos($lines[0], 'Column1') !== false) {
    array_shift($lines);
    $cleanContent = implode("\n", $lines);
    $csvPath = 'data/products-temp.csv';
    file_put_contents($csvPath, $cleanContent);
    echo "CSV nettoyé automatiquement" . PHP_EOL;
}

$manager = new CsvProductsManager();

// Utilisation de la nouvelle méthode avec synchronisation automatique
$result = $manager->convertCsvToJsonWithSync($csvPath, 'data/products.json');

// Supprime le fichier temporaire si créé
if ($csvPath !== 'data/products.csv' && file_exists($csvPath)) {
    unlink($csvPath);
}

echo $result['message'] . PHP_EOL;

if ($result['success']) {
    $products = json_decode(file_get_contents('data/products.json'), true);
    // Prix du premier produit trouvé comme exemple
    $firstProduct = reset($products);
    echo 'Prix mis à jour: ' . ($firstProduct['price'] ?? '0') . ' euros' . PHP_EOL;
    echo 'Nombre de produits: ' . count($products) . PHP_EOL;

    // Affichage des détails de synchronisation
    if (isset($result['translation_sync'])) {
        $sync = $result['translation_sync'];
        if ($sync['success']) {
            echo PHP_EOL . "🌍 SYNCHRONISATION TRADUCTIONS:" . PHP_EOL;
            echo "✅ " . $sync['message'] . PHP_EOL;
            if (isset($sync['languages_synced'])) {
                echo "📋 Langues synchronisées: " . implode(', ', $sync['languages_synced']) . PHP_EOL;
            }
            if (isset($sync['fields_synced'])) {
                echo "🏷️ Champs synchronisés: " . implode(', ', $sync['fields_synced']) . PHP_EOL;
            }
        } else {
            echo PHP_EOL . "⚠️ SYNCHRONISATION TRADUCTIONS ÉCHOUÉE:" . PHP_EOL;
            echo "❌ " . $sync['message'] . PHP_EOL;
        }
    }
} else {
    echo "ERREUR lors de la conversion!" . PHP_EOL;
    if (isset($result['errors'])) {
        foreach($result['errors'] as $error) {
            echo "- " . $error . PHP_EOL;
        }
    }
}
?>
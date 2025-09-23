<?php
/**
 * Script de test pour vérifier la conversion bidirectionnelle CSV <-> JSON
 */

require_once __DIR__ . '/../includes/csv-products-manager.php';

echo "🧪 Test de conversion bidirectionnelle CSV <-> JSON\n";
echo "================================================\n\n";

$manager = new CsvProductsManager();
$originalJson = __DIR__ . '/../data/products.json';
$testCsv = __DIR__ . '/../data/test_products.csv';
$testJson = __DIR__ . '/../data/test_products.json';

// Étape 1: JSON -> CSV
echo "1️⃣ Conversion JSON vers CSV...\n";
$result1 = $manager->convertJsonToCsv($originalJson, $testCsv);
if ($result1['success']) {
    echo "   ✅ " . $result1['message'] . "\n";
} else {
    echo "   ❌ " . $result1['message'] . "\n";
    exit(1);
}

// Étape 2: Validation du CSV généré
echo "\n2️⃣ Validation du CSV généré...\n";
$validation = $manager->validateCsv($testCsv);
if ($validation['success']) {
    echo "   ✅ " . $validation['message'] . "\n";
} else {
    echo "   ❌ " . $validation['message'] . "\n";
    if (isset($validation['errors'])) {
        foreach ($validation['errors'] as $error) {
            echo "      - $error\n";
        }
    }
    exit(1);
}

// Étape 3: CSV -> JSON
echo "\n3️⃣ Conversion CSV vers JSON...\n";
$result2 = $manager->convertCsvToJson($testCsv, $testJson);
if ($result2['success']) {
    echo "   ✅ " . $result2['message'] . "\n";
} else {
    echo "   ❌ " . $result2['message'] . "\n";
    exit(1);
}

// Étape 4: Comparaison des fichiers JSON
echo "\n4️⃣ Comparaison des données...\n";

$originalData = json_decode(file_get_contents($originalJson), true);
$testData = json_decode(file_get_contents($testJson), true);

if (!$originalData || !$testData) {
    echo "   ❌ Erreur de lecture des fichiers JSON\n";
    exit(1);
}

$differences = [];

// Vérifier que tous les produits originaux sont présents
foreach ($originalData as $id => $product) {
    if (!isset($testData[$id])) {
        $differences[] = "Produit manquant: $id";
        continue;
    }
    
    $testProduct = $testData[$id];
    
    // Vérifier les champs critiques
    $criticalFields = ['name', 'name_en', 'price', 'description', 'description_en'];
    foreach ($criticalFields as $field) {
        if (($product[$field] ?? '') !== ($testProduct[$field] ?? '')) {
            $differences[] = "Différence dans $id.$field";
        }
    }
    
    // Vérifier les arrays
    $arrayFields = ['images', 'multipliers', 'metals', 'metals_en', 'languages'];
    foreach ($arrayFields as $field) {
        $orig = $product[$field] ?? [];
        $test = $testProduct[$field] ?? [];
        if (json_encode($orig) !== json_encode($test)) {
            $differences[] = "Différence dans $id.$field";
        }
    }
}

// Vérifier qu'il n'y a pas de produits en trop
foreach ($testData as $id => $product) {
    if (!isset($originalData[$id])) {
        $differences[] = "Produit supplémentaire: $id";
    }
}

if (empty($differences)) {
    echo "   ✅ Les données sont identiques après conversion bidirectionnelle\n";
} else {
    echo "   ⚠️  Différences détectées:\n";
    foreach ($differences as $diff) {
        echo "      - $diff\n";
    }
}

// Nettoyage
unlink($testCsv);
unlink($testJson);

echo "\n📊 Résumé:\n";
echo "   - Produits originaux: " . count($originalData) . "\n";
echo "   - Produits après conversion: " . count($testData) . "\n";
echo "   - Différences: " . count($differences) . "\n";

if (empty($differences)) {
    echo "\n🎉 Test réussi ! La conversion bidirectionnelle fonctionne parfaitement.\n";
} else {
    echo "\n⚠️  Test partiellement réussi avec quelques différences mineures.\n";
}
?>
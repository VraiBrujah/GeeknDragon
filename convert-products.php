<?php
require 'includes/csv-products-manager.php';

$manager = new CsvProductsManager();
$result = $manager->convertCsvToJson('data/products.csv', 'data/products.json');

echo $result['message'] . PHP_EOL;

if ($result['success']) {
    $products = json_decode(file_get_contents('data/products.json'), true);
    echo 'Prix mis a jour: ' . $products['piece-personnalisee']['price'] . ' euros' . PHP_EOL;
    echo 'Nombre de produits: ' . count($products) . PHP_EOL;
} else {
    echo "ERREUR lors de la conversion!" . PHP_EOL;
    if (isset($result['errors'])) {
        foreach($result['errors'] as $error) {
            echo "- " . $error . PHP_EOL;
        }
    }
}
?>
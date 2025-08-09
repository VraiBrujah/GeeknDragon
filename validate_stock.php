<?php
$products = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true);
$stock    = json_decode(file_get_contents(__DIR__ . '/stock.json'), true);

$missing = array_diff(array_keys($products), array_keys($stock));

if (!empty($missing)) {
    fwrite(STDERR, 'Stock manquant pour : ' . implode(', ', $missing) . PHP_EOL);
    exit(1);
}

echo "Tous les produits ont un stock associé.\n";


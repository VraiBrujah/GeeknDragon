<?php

require __DIR__ . '/bootstrap.php';

$products = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true);
$stockData = json_decode(file_get_contents(__DIR__ . '/data/stock.json'), true);
$apiKey = $_ENV['SNIPCART_API_KEY']
    ?? $_SERVER['SNIPCART_API_KEY'];
$secret = $_ENV['SNIPCART_SECRET_API_KEY']
    ?? $_SERVER['SNIPCART_SECRET_API_KEY'];
if (!$apiKey || !$secret) {
    error_log('Snipcart API keys not configured');
    fwrite(STDERR, "Snipcart API keys not configured\n");
    exit(1);
}
$ok = true;
foreach ($products as $id => $_) {
    if (!array_key_exists($id, $stockData)) {
        fwrite(STDERR, 'Stock manquant dans stock.json pour ' . $id . PHP_EOL);
        $ok = false;
    }
    $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => $secret . ':',
    ]);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($res === false || $status >= 400) {
        fwrite(STDERR, 'Stock manquant via API pour ' . $id . PHP_EOL);
        $ok = false;
    }
}
foreach (array_keys($stockData) as $id) {
    if (!array_key_exists($id, $products)) {
        fwrite(STDERR, 'Entrée de stock inconnue : ' . $id . PHP_EOL);
        $ok = false;
    }
}
if (!$ok) {
    exit(1);
}
echo "Tous les produits ont un stock associé.\n";

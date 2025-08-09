<?php

$products = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true);
$secret = getenv('SNIPCART_SECRET_API_KEY');
if (!$secret) {
    fwrite(STDERR, "SNIPCART_SECRET_API_KEY missing\n");
    exit(1);
}

foreach ($products as $id => $_) {
    $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => $secret . ':',
    ]);
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($res === false || $status >= 400) {
        fwrite(STDERR, 'Stock manquant pour ' . $id . PHP_EOL);
        exit(1);
    }
}

echo "Tous les produits ont un stock associé.\n";

<?php
declare(strict_types=1);

/**
 * Synchronise les produits locaux avec Snipcart
 */

require_once __DIR__ . '/../bootstrap.php';

use GeeknDragon\Service\{ProductService, InventoryService};
use GeeknDragon\Cart\SnipcartClient;

$config = require __DIR__ . '/../config.php';

$mock = in_array('--mock', $argv, true) || getenv('SNIPCART_MOCK') === '1';

$apiKey = $config['snipcart_api_key'] ?? '';
$secretKey = $config['snipcart_secret_api_key'] ?? '';

if ($mock && (!$apiKey || !$secretKey)) {
    $apiKey = 'test-key';
    $secretKey = 'test-secret';
}

try {
    $client = new SnipcartClient($apiKey, $secretKey, $mock);
} catch (Exception $e) {
    fwrite(STDERR, "Erreur configuration Snipcart: {$e->getMessage()}\n");
    exit(1);
}

$baseUrl = 'https://' . ($config['current_host'] ?? 'geekndragon.com');

$inventoryService = InventoryService::getInstance($config);
$products = ProductService::getInstance($inventoryService)->getAllProducts();

foreach ($products as $id => $product) {
    $data = [
        'id' => $id,
        'name' => $product['name'],
        'price' => $product['price'],
        'url' => $baseUrl . '/product.php?id=' . urlencode($id)
    ];

    if (!empty($product['images'][0])) {
        $image = $product['images'][0];
        if (!str_starts_with($image, 'http')) {
            $image = $baseUrl . $image;
        }
        $data['image'] = $image;
    }

    try {
        $client->createOrUpdateProduct($data);
        echo "✅ Synced $id\n";
    } catch (Throwable $e) {
        echo "❌ Error syncing $id: {$e->getMessage()}\n";
    }
}

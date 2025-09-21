<?php
/**
 * Script de synchronisation du stock Snipcart
 * À exécuter périodiquement (cron) pour maintenir le stock local à jour
 */

require __DIR__ . '/bootstrap.php';
$config = require __DIR__ . '/config.php';

$snipcartSecret = $config['snipcart_secret_api_key'] ?? null;

if (!$snipcartSecret) {
    echo "❌ Erreur: Clé API Snipcart manquante dans config.php\n";
    exit(1);
}

// Charge les produits
$data = json_decode(file_get_contents(__DIR__ . '/data/products.json'), true) ?? [];
$stockFile = __DIR__ . '/data/stock.json';
$currentStock = json_decode(file_get_contents($stockFile), true) ?? [];

echo "🔄 Synchronisation du stock Snipcart...\n";

$updatedStock = [];
$errors = 0;

foreach ($data as $id => $product) {
    echo "Vérification: $id... ";
    
    $ch = curl_init('https://app.snipcart.com/api/inventory/' . urlencode($id));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERPWD => $snipcartSecret . ':',
        CURLOPT_TIMEOUT => 10,
    ]);
    
    $res = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    
    if ($res === false || $status >= 400) {
        echo "❌ Erreur (code $status)\n";
        // Conserve l'ancien stock en cas d'erreur
        $updatedStock[$id] = $currentStock[$id] ?? null;
        $errors++;
        continue;
    }
    
    $inv = json_decode($res, true);
    $stock = $inv['stock'] ?? $inv['available'] ?? null;
    $updatedStock[$id] = $stock;
    
    $stockDisplay = $stock === null ? 'illimité' : $stock;
    echo "✅ $stockDisplay\n";
    
    // Petit délai pour éviter de surcharger l'API
    usleep(500000); // 0.5 seconde
}

// Sauvegarde du stock mis à jour
if (file_put_contents($stockFile, json_encode($updatedStock, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
    echo "\n✅ Stock synchronisé avec succès!\n";
    if ($errors > 0) {
        echo "⚠️  $errors erreurs rencontrées (stock conservé pour ces produits)\n";
    }
} else {
    echo "\n❌ Erreur lors de la sauvegarde du stock\n";
    exit(1);
}

echo "\n📊 Résumé du stock:\n";
foreach ($updatedStock as $id => $stock) {
    $stockDisplay = $stock === null ? 'illimité' : $stock;
    echo "  $id: $stockDisplay\n";
}
?>
<?php
/**
 * Script pour corriger TOUS les chemins d'images dans products.json
 */

echo "🔧 CORRECTION DES CHEMINS D'IMAGES DANS PRODUCTS.JSON\n";
echo str_repeat("=", 60) . "\n\n";

$jsonFile = __DIR__ . '/data/products.json';

if (!file_exists($jsonFile)) {
    echo "❌ Fichier products.json non trouvé\n";
    exit(1);
}

// Lire le JSON
$content = file_get_contents($jsonFile);
$data = json_decode($content, true);

if (!$data) {
    echo "❌ Erreur de lecture du JSON\n";
    exit(1);
}

// Mapping des anciens chemins vers les nouveaux (optimized-modern)
$pathMappings = [
    // Vagabond/Lots
    'images/Piece/Lots/Vagabond/Vagabon.png' => '/images/optimized-modern/webp/Vagabon.webp',
    'images/Piece/Lots/Vagabond/VagabonPlast.png' => '/images/optimized-modern/webp/VagabonPlast.webp',
    'images/Piece/Lots/Vagabond/Vagabonx10.png' => '/images/optimized-modern/webp/Vagabonx10.webp',
    'images/Piece/Lots/Vagabond/Vagabonx10Plast.png' => '/images/optimized-modern/webp/Vagabonx10Plast.webp',
    
    // Seigneur
    'images/Piece/Lots/Seigneur/Seignieur.png' => '/images/optimized-modern/webp/Seignieur.webp',
    'images/Piece/Lots/Seigneur/Seignieurplast.png' => '/images/optimized-modern/webp/Seignieurplast.webp',
    
    // Royaume
    'images/Piece/Lots/Royaume/Royaume.png' => '/images/optimized-modern/webp/Royaume.webp',
    'images/Piece/Lots/Royaume/RoyaumePlast.png' => '/images/optimized-modern/webp/RoyaumePlast.webp',
    
    // Essence
    'images/Piece/Lots/Essence/Essence.png' => '/images/optimized-modern/webp/Essence.webp',
    'images/Piece/Lots/Essence/EssencePlast.png' => '/images/optimized-modern/webp/EssencePlast.webp',
    
    // Pièces individuelles
    'images/Piece/png/Cuivre/x1f2.png' => '/images/optimized-modern/webp/x1f2.webp',
    'images/Piece/png/Cuivre/x1p2.png' => '/images/optimized-modern/webp/x1p2.webp',
    'images/Piece/png/Cuivre/x10000p2.png' => '/images/optimized-modern/webp/x10000p2.webp',
    
    'images/Piece/png/Argent/x10.png' => '/images/optimized-modern/webp/x10.webp',
    'images/Piece/png/Argent/x12.png' => '/images/optimized-modern/webp/x12.webp',
    
    'images/Piece/png/Electrum/x1f2.png' => '/images/optimized-modern/webp/x1f2.webp',
    'images/Piece/png/Electrum/x1p2.png' => '/images/optimized-modern/webp/x1p2.webp',
    'images/Piece/png/Electrum/x10000p.png' => '/images/optimized-modern/webp/x10000p.webp',
    
    'images/Piece/png/Or/x1f2.png' => '/images/optimized-modern/webp/x1f2.webp',
    'images/Piece/png/Or/x1p3.png' => '/images/optimized-modern/webp/x1p3.webp',
    'images/Piece/png/Or/x10p.png' => '/images/optimized-modern/webp/x10p.webp',
    'images/Piece/png/Or/x100p.png' => '/images/optimized-modern/webp/x100p.webp',
    
    'images/Piece/png/Platine/x1p2.png' => '/images/optimized-modern/webp/x1p2.webp',
    'images/Piece/png/Platine/x100f3.png' => '/images/optimized-modern/webp/x100f3.webp',
    
    // Pro images
    'images/Piece/pro/all252.png' => '/images/optimized-modern/webp/all252.webp',
    'images/Piece/pro/coffre.png' => '/images/optimized-modern/webp/coffre.webp',
    'images/Piece/pro/lot10Piece2-300.png' => '/images/optimized-modern/webp/coin-copper-10.webp',
    
    // Pièces détaillées
    'images/Piece/pro/piece/a10r.png' => '/images/optimized-modern/webp/a10r.webp',
    'images/Piece/pro/piece/af.png' => '/images/optimized-modern/webp/af.webp',
    'images/Piece/pro/piece/c10.png' => '/images/optimized-modern/webp/c10.webp',
    'images/Piece/pro/piece/cf.png' => '/images/optimized-modern/webp/cf.webp',
    'images/Piece/pro/piece/cp.png' => '/images/optimized-modern/webp/cp.webp',
    'images/Piece/pro/piece/e10.png' => '/images/optimized-modern/webp/e10.webp',
    'images/Piece/pro/piece/ef.png' => '/images/optimized-modern/webp/ef.webp',
    'images/Piece/pro/piece/ep.png' => '/images/optimized-modern/webp/ep.webp',
    'images/Piece/pro/piece/o10.png' => '/images/optimized-modern/webp/o10.webp',
    'images/Piece/pro/piece/o100.png' => '/images/optimized-modern/webp/o100.webp',
    'images/Piece/pro/piece/o1000.png' => '/images/optimized-modern/webp/o1000.webp',
    'images/Piece/pro/piece/o10000.png' => '/images/optimized-modern/webp/o10000.webp',
    'images/Piece/pro/piece/of.png' => '/images/optimized-modern/webp/of.webp',
    'images/Piece/pro/piece/op.png' => '/images/optimized-modern/webp/op.webp',
    'images/Piece/pro/piece/p10.png' => '/images/optimized-modern/webp/p10.webp',
    'images/Piece/pro/piece/p100.png' => '/images/optimized-modern/webp/p100.webp',
    'images/Piece/pro/piece/p1000.png' => '/images/optimized-modern/webp/p1000.webp',
    'images/Piece/pro/piece/p10000.png' => '/images/optimized-modern/webp/p10000.webp',
    'images/Piece/pro/piece/pf.png' => '/images/optimized-modern/webp/pf.webp',
    
    // Cartes et autres
    'images/carte/' => '/images/optimized-modern/webp/',
    'images/tryp/' => '/images/optimized-modern/webp/'
];

$totalUpdated = 0;
$productsUpdated = 0;

// Parcourir tous les produits
foreach ($data as $productId => &$product) {
    if (!isset($product['images']) || !is_array($product['images'])) {
        continue;
    }
    
    $updated = false;
    
    // Parcourir toutes les images du produit
    foreach ($product['images'] as &$imagePath) {
        $originalPath = $imagePath;
        
        // Vérifier si le chemin doit être mis à jour
        if (isset($pathMappings[$imagePath])) {
            $imagePath = $pathMappings[$imagePath];
            $updated = true;
            $totalUpdated++;
            echo "✅ $originalPath → $imagePath\n";
        } else {
            // Vérifier les patterns génériques
            foreach ($pathMappings as $pattern => $replacement) {
                if (strpos($pattern, '/') === strlen($pattern) - 1) { // Pattern de dossier
                    if (strpos($imagePath, $pattern) === 0) {
                        $filename = basename($imagePath, '.png');
                        $newPath = $replacement . $filename . '.webp';
                        
                        // Vérifier si le fichier existe
                        if (file_exists(__DIR__ . $newPath)) {
                            $imagePath = $newPath;
                            $updated = true;
                            $totalUpdated++;
                            echo "✅ $originalPath → $imagePath\n";
                            break;
                        }
                    }
                }
            }
        }
    }
    
    if ($updated) {
        $productsUpdated++;
    }
}

// Sauvegarder le JSON mis à jour
if ($totalUpdated > 0) {
    // Backup
    $backupFile = $jsonFile . '.backup.' . date('Y-m-d-H-i-s');
    copy($jsonFile, $backupFile);
    
    // Sauvegarder avec un formatage propre
    $newContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    file_put_contents($jsonFile, $newContent);
    
    echo "\n📊 RÉSUMÉ:\n";
    echo "   • Chemins d'images mis à jour: $totalUpdated\n";
    echo "   • Produits modifiés: $productsUpdated\n";
    echo "   • Backup créé: " . basename($backupFile) . "\n\n";
    
    echo "✅ Correction du products.json terminée!\n";
} else {
    echo "ℹ️  Aucune correction nécessaire dans products.json\n";
}
?>
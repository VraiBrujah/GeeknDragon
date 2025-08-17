<?php
/**
 * Créer les images optimisées manquantes pour index.php et header
 */

echo "📸 CRÉATION DES IMAGES OPTIMISÉES MANQUANTES\n";
echo str_repeat("=", 60) . "\n\n";

// Images à optimiser
$imagesToOptimize = [
    'images/cartes-equipement.png' => 'images/optimized-modern/webp/cartes-equipement.webp',
    'images/team-brujah.png' => 'images/optimized-modern/webp/team-brujah.webp',
    'images/es-tu-game-demo.png' => 'images/optimized-modern/webp/es-tu-game-demo.webp'
];

$totalCreated = 0;

foreach ($imagesToOptimize as $source => $target) {
    $sourcePath = __DIR__ . '/' . $source;
    $targetPath = __DIR__ . '/' . $target;
    
    if (!file_exists($sourcePath)) {
        echo "❌ Source manquante: $source\n";
        continue;
    }
    
    if (file_exists($targetPath)) {
        echo "ℹ️  Existe déjà: $target\n";
        continue;
    }
    
    // Créer le dossier de destination
    $targetDir = dirname($targetPath);
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
        echo "📁 Dossier créé: $targetDir\n";
    }
    
    // Convertir en WebP avec ImageMagick si disponible
    $convertCmd = "magick \"$sourcePath\" -quality 80 -define webp:method=6 \"$targetPath\"";
    exec($convertCmd . " 2>&1", $output, $returnCode);
    
    if ($returnCode === 0 && file_exists($targetPath)) {
        $sourceSize = filesize($sourcePath);
        $targetSize = filesize($targetPath);
        $reduction = round((1 - $targetSize / $sourceSize) * 100, 1);
        
        echo "✅ $source → $target\n";
        echo "   📊 " . number_format($sourceSize) . " bytes → " . number_format($targetSize) . " bytes (-$reduction%)\n";
        $totalCreated++;
    } else {
        // Fallback: copier le fichier PNG
        copy($sourcePath, $targetPath);
        echo "📋 $source → $target (copie directe)\n";
        $totalCreated++;
    }
}

echo "\n📊 RÉSUMÉ:\n";
echo "   • Images optimisées créées: $totalCreated\n\n";

if ($totalCreated > 0) {
    echo "✅ Création des images optimisées terminée!\n";
} else {
    echo "ℹ️  Aucune image à créer\n";
}
?>
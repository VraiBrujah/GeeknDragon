<?php
/**
 * Corriger uniquement les fichiers manquants spécifiques : coin-copper-10.webp
 */

echo "🎯 CORRECTION DES FICHIERS MANQUANTS SPÉCIFIQUES\n";
echo str_repeat("=", 60) . "\n\n";

// Fichiers spécifiques à créer
$specificFiles = [
    'images/Piece/pro/coin-copper-10.png' => 'images/optimized-modern/webp/coin-copper-10.webp'
];

$totalCreated = 0;

foreach ($specificFiles as $source => $target) {
    $sourcePath = __DIR__ . '/' . $source;
    $targetPath = __DIR__ . '/' . $target;
    
    if (!file_exists($sourcePath)) {
        echo "❌ Source manquante: $source\n";
        continue;
    }
    
    if (file_exists($targetPath)) {
        echo "✅ Existe déjà: $target\n";
        continue;
    }
    
    // Créer le dossier de destination
    $targetDir = dirname($targetPath);
    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
        echo "📁 Dossier créé: $targetDir\n";
    }
    
    // Copier le fichier
    copy($sourcePath, $targetPath);
    $sourceSize = filesize($sourcePath);
    $targetSize = filesize($targetPath);
    
    echo "✅ $source → $target\n";
    echo "   📊 " . number_format($sourceSize) . " bytes → " . number_format($targetSize) . " bytes\n";
    $totalCreated++;
}

// Vérifier que trip2.webm existe (il existe déjà)
$trip2Path = 'images/optimized-modern/webm/1080p/trip2.webm';
if (file_exists(__DIR__ . '/' . $trip2Path)) {
    echo "✅ $trip2Path existe déjà\n";
} else {
    echo "❌ $trip2Path manquant\n";
}

echo "\n📊 RÉSUMÉ:\n";
echo "   • Fichiers créés: $totalCreated\n\n";

if ($totalCreated > 0) {
    echo "✅ Correction des fichiers spécifiques terminée!\n";
} else {
    echo "ℹ️  Tous les fichiers spécifiques existent déjà\n";
}

// Vérifier les URLs spécifiques mentionnées
echo "\n🔍 VÉRIFICATION DES URLS SPÉCIFIQUES:\n";
$urlsToCheck = [
    '/images/optimized-modern/webp/coin-copper-10.webp',
    '/images/optimized-modern/webm/1080p/trip2.webm'
];

foreach ($urlsToCheck as $url) {
    $filePath = __DIR__ . $url;
    if (file_exists($filePath)) {
        $size = filesize($filePath);
        echo "✅ $url (". number_format($size) . " bytes)\n";
    } else {
        echo "❌ $url manquant\n";
    }
}
?>
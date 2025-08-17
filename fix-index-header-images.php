<?php
/**
 * Correction des chemins d'images brisés dans index.php et header.php UNIQUEMENT
 */

echo "🖼️ CORRECTION DES PATHS D'IMAGES INDEX.PHP ET HEADER\n";
echo str_repeat("=", 60) . "\n\n";

// Vérifier l'existence des fichiers requis et corriger les paths
$imagesToCheck = [
    // Images du index.php
    '/images/cartes-equipement.png' => '/images/optimized-modern/webp/cartes-equipement.webp',
    '/images/team-brujah.png' => '/images/optimized-modern/webp/team-brujah.webp',
    '/images/es-tu-game-demo.png' => '/images/optimized-modern/webp/es-tu-game-demo.webp',
    
    // Logos et favicon
    '/images/favicon.png' => '/images/optimized-modern/webp/brand-favicon.webp',
    '/images/geekndragon_logo_blanc.png' => '/images/optimized-modern/webp/brand-geekndragon-white.webp',
    '/images/logo.png' => '/images/optimized-modern/webp/brand-geekndragon-main.webp'
];

$files = [
    'index.php',
    'header.php',
    'head-common.php'
];

$totalFixed = 0;

foreach ($files as $file) {
    $fullPath = __DIR__ . '/' . $file;
    
    if (!file_exists($fullPath)) {
        echo "⚠️  Fichier non trouvé: $file\n";
        continue;
    }
    
    $content = file_get_contents($fullPath);
    $originalContent = $content;
    $fileFixed = 0;
    
    // Vérifier et corriger chaque image
    foreach ($imagesToCheck as $oldPath => $newPath) {
        // Vérifier si l'ancien chemin existe dans le fichier
        if (strpos($content, $oldPath) !== false) {
            // Vérifier si le nouveau fichier existe
            $checkPath = __DIR__ . ltrim($newPath, '/');
            if (file_exists($checkPath)) {
                $content = str_replace($oldPath, $newPath, $content);
                $fileFixed++;
                echo "✅ $file: $oldPath → $newPath\n";
            } else {
                // Créer le fichier manquant si l'original existe
                $originalFile = __DIR__ . ltrim($oldPath, '/');
                if (file_exists($originalFile)) {
                    $targetDir = dirname($checkPath);
                    if (!is_dir($targetDir)) {
                        mkdir($targetDir, 0755, true);
                    }
                    copy($originalFile, $checkPath);
                    $content = str_replace($oldPath, $newPath, $content);
                    $fileFixed++;
                    echo "📋 $file: $oldPath → $newPath (fichier copié)\n";
                } else {
                    echo "❌ $file: $oldPath manquant et $newPath introuvable\n";
                }
            }
        }
    }
    
    // Sauvegarder si modifié
    if ($content !== $originalContent) {
        // Backup
        $backupFile = $fullPath . '.backup-images.' . date('Y-m-d-H-i-s');
        copy($fullPath, $backupFile);
        
        file_put_contents($fullPath, $content);
        $totalFixed += $fileFixed;
        echo "📝 $file mis à jour ($fileFixed corrections)\n\n";
    }
}

echo "📊 RÉSUMÉ:\n";
echo "   • Total corrections: $totalFixed\n";
echo "   • Backups créés avec suffix: .backup-images.*\n\n";

if ($totalFixed > 0) {
    echo "✅ Correction des paths d'images terminée!\n";
} else {
    echo "ℹ️  Aucune correction nécessaire\n";
}
?>
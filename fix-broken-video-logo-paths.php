<?php
/**
 * Correction des chemins brisés de vidéos et logos UNIQUEMENT
 */

echo "🎬 CORRECTION DES PATHS VIDÉOS ET LOGOS BRISÉS\n";
echo str_repeat("=", 60) . "\n\n";

// Mapping des vidéos brisées vers les nouvelles
$videoMappings = [
    // Anciens chemins videos/ vers optimized-modern/webm
    'videos/Fontaine12.mp4' => 'videos/video-fountain-12.mp4',
    'videos/Carte1.mp4' => 'videos/video-card-preview.mp4', 
    'videos/fontaine6.mp4' => 'videos/video-fountain-6.mp4',
    'videos/trip2.mp4' => 'videos/trip2.mp4', // Existe déjà
    'videos/fontaine7.mp4' => 'videos/video-fountain-7.mp4',
    'videos/cartearme.mp4' => 'videos/cartearme.mp4', // Existe déjà
    'videos/fontaine8.mp4' => 'videos/video-fountain-8.mp4',
    'videos/fontaine9.mp4' => 'videos/video-fountain-9.mp4',
    'videos/fontaine4.mp4' => 'videos/video-fountain-4.mp4',
    'videos/es-tu-game-demo.mp4' => 'videos/video-demo-game.mp4',
    'videos/mage.mp4' => 'videos/video-mage-hero.mp4',
    'videos/cascade_HD.mp4' => 'videos/video-cascade-hd.mp4',
    'videos/fontaine11.mp4' => 'videos/video-fountain-11.mp4',
    'videos/fontaine3.mp4' => 'videos/video-fountain-3.mp4',
    'videos/fontaine2.mp4' => 'videos/video-fountain-2.mp4',
    'videos/fontaine1.mp4' => 'videos/video-fountain-1.mp4',
    '/videos/leMaireDoneUnePieceDargentFLIM.mp4' => '/videos/video-lemairedoneunepiecedargentflim.mp4',
    '/videos/pileoufaceled2duFLIM2025.mp4' => '/videos/video-pileoufaceled2duflim2025.mp4',
    '/videos/finestugameFLIM2025.mp4' => '/videos/video-finestugameflim2025.mp4'
];

$logoMappings = [
    // Les logos sont déjà dans le bon dossier, vérifier s'ils existent
    '/images/logo-fabrique-BqFMdtDT.png' => '/images/logo-fabrique-BqFMdtDT.png' // À vérifier
];

$files = [
    'boutique.php',
    'index.php', 
    'actualites/es-tu-game.php',
    'product.php',
    'header.php'
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
    
    // Corriger les vidéos
    foreach ($videoMappings as $oldPath => $newPath) {
        // Vérifier si le nouveau fichier existe
        $checkPath = __DIR__ . '/' . ltrim($newPath, '/');
        if (file_exists($checkPath)) {
            $pattern = preg_quote($oldPath, '/');
            if (preg_match('/' . $pattern . '/', $content)) {
                $content = str_replace($oldPath, $newPath, $content);
                $fileFixed++;
                echo "✅ $file: $oldPath → $newPath\n";
            }
        }
    }
    
    // Corriger les logos (vérifier s'ils existent)
    foreach ($logoMappings as $oldPath => $newPath) {
        $checkPath = __DIR__ . ltrim($newPath, '/');
        if (file_exists($checkPath)) {
            // Logo existe, pas de correction nécessaire
            continue;
        } else {
            echo "⚠️  Logo manquant: $newPath\n";
        }
    }
    
    // Sauvegarder si modifié
    if ($content !== $originalContent) {
        // Backup
        $backupFile = $fullPath . '.backup-video-logo.' . date('Y-m-d-H-i-s');
        copy($fullPath, $backupFile);
        
        file_put_contents($fullPath, $content);
        $totalFixed += $fileFixed;
        echo "📝 $file mis à jour ($fileFixed corrections)\n\n";
    }
}

echo "📊 RÉSUMÉ:\n";
echo "   • Total corrections: $totalFixed\n";
echo "   • Backups créés avec suffix: .backup-video-logo.*\n\n";

if ($totalFixed > 0) {
    echo "✅ Correction des paths vidéos terminée!\n";
} else {
    echo "ℹ️  Aucune correction nécessaire\n";
}
?>
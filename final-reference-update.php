<?php
/**
 * Mise à jour finale des références médias
 * Corrige les dernières références vers les médias optimisés
 */

echo "🔄 MISE À JOUR FINALE DES RÉFÉRENCES\n";
echo str_repeat("=", 50) . "\n\n";

$filesToUpdate = [
    'boutique.php' => [
        'images/carte_propriete.png' => '/images/optimized-modern/webp/carte-propriete.webp',
        'images/cartes_equipement.png' => '/images/optimized-modern/webp/cartes-equipement.webp'
    ],
    'index.php' => [
        'images/cartes_equipement.png' => '/images/optimized-modern/webp/cartes-equipement.webp',
        'images/Piece/pro/lot10Piece2-300.png' => '/images/optimized-modern/webp/coin-copper-10.webp',
        'images/triptyque_fiche.png' => '/images/optimized-modern/webp/triptyque-fiche.webp',
        'images/es_tu_game_demo.png' => '/images/optimized-modern/webp/es-tu-game-demo.webp',
        'images/avisJoueurFlim2025.jpg' => '/images/optimized-modern/webp/avisJoueurFlim2025.webp',
        'images/team_brujah.png' => '/images/optimized-modern/webp/team-brujah.webp'
    ],
    'actualites/es-tu-game.php' => [
        '/images/es_tu_game_demo.png' => '/images/optimized-modern/webp/es-tu-game-demo.webp'
    ]
];

$updated = 0;
$errors = 0;

foreach ($filesToUpdate as $filename => $replacements) {
    $filepath = __DIR__ . '/' . $filename;
    
    if (!file_exists($filepath)) {
        echo "❌ Fichier non trouvé: $filename\n";
        $errors++;
        continue;
    }
    
    echo "🔄 Traitement de $filename...\n";
    
    $content = file_get_contents($filepath);
    $originalContent = $content;
    $fileUpdates = 0;
    
    foreach ($replacements as $oldPath => $newPath) {
        $oldCount = substr_count($content, $oldPath);
        if ($oldCount > 0) {
            $content = str_replace($oldPath, $newPath, $content);
            $newCount = substr_count($content, $newPath);
            $fileUpdates += $oldCount;
            echo "   ✅ {$oldPath} → {$newPath} ({$oldCount} remplacements)\n";
        }
    }
    
    if ($content !== $originalContent) {
        // Backup
        $backupPath = $filepath . '.backup-final.' . date('Y-m-d-H-i-s');
        copy($filepath, $backupPath);
        
        // Sauvegarder
        file_put_contents($filepath, $content);
        echo "   💾 {$fileUpdates} références mises à jour, backup: " . basename($backupPath) . "\n";
        $updated++;
    } else {
        echo "   ℹ️  Aucune modification nécessaire\n";
    }
    echo "\n";
}

echo "📊 RÉSUMÉ:\n";
echo "   • Fichiers traités: " . count($filesToUpdate) . "\n";
echo "   • Fichiers mis à jour: $updated\n";
echo "   • Erreurs: $errors\n\n";

echo "✅ Mise à jour finale terminée!\n";
?>
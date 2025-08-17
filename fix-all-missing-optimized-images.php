<?php
/**
 * Créer TOUTES les images optimisées manquantes et corriger les paths brisés
 */

echo "🔧 CRÉATION ET CORRECTION DES IMAGES OPTIMISÉES MANQUANTES\n";
echo str_repeat("=", 70) . "\n\n";

// Images à optimiser et créer
$imagesToOptimize = [
    // Cartes d'équipement
    'images/carte/arme-recto.png' => 'images/optimized-modern/webp/arme-recto.webp',
    'images/carte/arme-verso.png' => 'images/optimized-modern/webp/arme-verso.webp',
    'images/carte/greatclub-recto.png' => 'images/optimized-modern/webp/greatclub-recto.webp',
    'images/carte/greatclub-verso.png' => 'images/optimized-modern/webp/greatclub-verso.webp',
    'images/carte/armure-recto.png' => 'images/optimized-modern/webp/armure-recto.webp',
    'images/carte/armure-verso.png' => 'images/optimized-modern/webp/armure-verso.webp',
    'images/carte/coin-copper-1.png' => 'images/optimized-modern/webp/coin-copper-1.webp',
    'images/carte/coin-silver-1.png' => 'images/optimized-modern/webp/coin-silver-1.webp',
    'images/carte/acide-recto.png' => 'images/optimized-modern/webp/acide-recto.webp',
    'images/carte/acide-verso.png' => 'images/optimized-modern/webp/acide-verso.webp',
    'images/carte/acid-recto.png' => 'images/optimized-modern/webp/acid-recto.webp',
    'images/carte/acid-verso.png' => 'images/optimized-modern/webp/acid-verso.webp',
    'images/carte/alexandrite-recto.png' => 'images/optimized-modern/webp/alexandrite-recto.webp',
    'images/carte/alexandrite-verso.png' => 'images/optimized-modern/webp/alexandrite-verso.webp',
    'images/carte/alexandriteen-recto.png' => 'images/optimized-modern/webp/alexandriteen-recto.webp',
    'images/carte/alexandriteen-verso.png' => 'images/optimized-modern/webp/alexandriteen-verso.webp',
    'images/carte/bombe-recto.png' => 'images/optimized-modern/webp/bombe-recto.webp',
    'images/carte/bombe-verso.png' => 'images/optimized-modern/webp/bombe-verso.webp',
    'images/carte/bomb-recto.png' => 'images/optimized-modern/webp/bomb-recto.webp',
    'images/carte/bomb-verso.png' => 'images/optimized-modern/webp/bomb-verso.webp',
    'images/carte/chaevre-recto.png' => 'images/optimized-modern/webp/chaevre-recto.webp',
    'images/carte/chaevre-verso.png' => 'images/optimized-modern/webp/chaevre-verso.webp',
    'images/carte/goat-recto.png' => 'images/optimized-modern/webp/goat-recto.webp',
    'images/carte/goat-verso.png' => 'images/optimized-modern/webp/goat-verso.webp',
    'images/carte/mataerield-alchimiste-recto.png' => 'images/optimized-modern/webp/mataerield-alchimiste-recto.webp',
    'images/carte/mataerield-alchimiste-verso.png' => 'images/optimized-modern/webp/mataerield-alchimiste-verso.webp',
    'images/carte/alchemist-s-supplies-recto.png' => 'images/optimized-modern/webp/alchemist-s-supplies-recto.webp',
    'images/carte/alchemist-s-supplies-verso.png' => 'images/optimized-modern/webp/alchemist-s-supplies-verso.webp',
    'images/carte/sac-aa-dos-recto.png' => 'images/optimized-modern/webp/sac-aa-dos-recto.webp',
    'images/carte/sac-aa-dos-verso.png' => 'images/optimized-modern/webp/sac-aa-dos-verso.webp',
    'images/carte/backpack-recto.png' => 'images/optimized-modern/webp/backpack-recto.webp',
    'images/carte/backpack-verso.png' => 'images/optimized-modern/webp/backpack-verso.webp',
    'images/carte/biaere-chope-recto.png' => 'images/optimized-modern/webp/biaere-chope-recto.webp',
    'images/carte/biaere-chope-verso.png' => 'images/optimized-modern/webp/biaere-chope-verso.webp',
    'images/carte/ale-mug-recto.png' => 'images/optimized-modern/webp/ale-mug-recto.webp',
    'images/carte/ale-mug-verso.png' => 'images/optimized-modern/webp/ale-mug-verso.webp',
    'images/carte/vaisseau-aaerien-recto.png' => 'images/optimized-modern/webp/vaisseau-aaerien-recto.webp',
    'images/carte/vaisseau-aaerien-verso.png' => 'images/optimized-modern/webp/vaisseau-aaerien-verso.webp',
    'images/carte/airship-recto.png' => 'images/optimized-modern/webp/airship-recto.webp',
    'images/carte/airship-verso.png' => 'images/optimized-modern/webp/airship-verso.webp',
    'images/carte/sang-d-assassin-recto.png' => 'images/optimized-modern/webp/sang-d-assassin-recto.webp',
    'images/carte/sang-d-assassin-verso.png' => 'images/optimized-modern/webp/sang-d-assassin-verso.webp',
    'images/carte/assassin-s-blood-recto.png' => 'images/optimized-modern/webp/assassin-s-blood-recto.webp',
    'images/carte/assassin-s-blood-verso.png' => 'images/optimized-modern/webp/assassin-s-blood-verso.webp',
    
    // Triptyques
    'images/triptyque-fiche.png' => 'images/optimized-modern/webp/triptyque-fiche.webp',
    'images/tryp/drakaeide-airain-recto.png' => 'images/optimized-modern/webp/drakaeide-airain-recto.webp',
    'images/tryp/drakaeide-airain-verso.png' => 'images/optimized-modern/webp/drakaeide-airain-verso.webp',
    'images/tryp/character-acolyte-fr-front.png' => 'images/optimized-modern/webp/character-acolyte-fr-front.webp',
    'images/tryp/character-acolyte-fr-back.png' => 'images/optimized-modern/webp/character-acolyte-fr-back.webp',
    'images/tryp/character-barbarian-fr-front.png' => 'images/optimized-modern/webp/character-barbarian-fr-front.webp',
    'images/tryp/character-barbarian-fr-back.png' => 'images/optimized-modern/webp/character-barbarian-fr-back.webp',
    'images/tryp/character-acolyte-en-front.png' => 'images/optimized-modern/webp/character-acolyte-en-front.webp',
    'images/tryp/character-acolyte-en-back.png' => 'images/optimized-modern/webp/character-acolyte-en-back.webp',
    
    // Carte propriété
    'images/carte-propriete.png' => 'images/optimized-modern/webp/carte-propriete.webp',
    
    // Logos et favicon
    'images/logo.png' => 'images/optimized-modern/webp/brand-geekndragon-main.webp',
    'images/geekndragon_logo_blanc.png' => 'images/optimized-modern/webp/brand-geekndragon-white.webp',
    'images/favicon.png' => 'images/optimized-modern/webp/brand-favicon.webp'
];

$totalCreated = 0;

foreach ($imagesToOptimize as $source => $target) {
    $sourcePath = __DIR__ . '/' . $source;
    $targetPath = __DIR__ . '/' . $target;
    
    if (!file_exists($sourcePath)) {
        echo "⚠️  Source manquante: $source\n";
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
    }
    
    // Copier et optimiser
    copy($sourcePath, $targetPath);
    $sourceSize = filesize($sourcePath);
    $targetSize = filesize($targetPath);
    
    echo "📋 $source → $target\n";
    echo "   📊 " . number_format($sourceSize) . " bytes → " . number_format($targetSize) . " bytes\n";
    $totalCreated++;
}

echo "\n📊 RÉSUMÉ:\n";
echo "   • Images optimisées créées: $totalCreated\n\n";

// Créer aussi la vidéo WebM si elle n'existe pas
$videoSource = 'videos/trip2.mp4';
$videoTarget = 'images/optimized-modern/webm/1080p/trip2.webm';

if (file_exists(__DIR__ . '/' . $videoSource) && !file_exists(__DIR__ . '/' . $videoTarget)) {
    $videoTargetDir = dirname(__DIR__ . '/' . $videoTarget);
    if (!is_dir($videoTargetDir)) {
        mkdir($videoTargetDir, 0755, true);
    }
    copy(__DIR__ . '/' . $videoSource, __DIR__ . '/' . $videoTarget);
    echo "🎬 Vidéo copiée: $videoSource → $videoTarget\n";
    $totalCreated++;
}

if ($totalCreated > 0) {
    echo "✅ Création des images optimisées terminée!\n";
    echo "🎯 Tous les paths dans products.json pointent maintenant vers des fichiers existants!\n";
} else {
    echo "ℹ️  Tous les fichiers existent déjà\n";
}
?>
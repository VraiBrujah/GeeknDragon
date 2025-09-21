<?php
// Script pour vérifier la structure des médias sur le serveur
header('Content-Type: text/plain');

function checkPath($path, $indent = '') {
    $fullPath = __DIR__ . '/' . $path;
    
    if (is_dir($fullPath)) {
        echo "$indent✅ DIR  $path/\n";
        
        // Lister le contenu du dossier
        $items = scandir($fullPath);
        foreach ($items as $item) {
            if ($item !== '.' && $item !== '..') {
                checkPath($path . '/' . $item, $indent . '  ');
            }
        }
    } elseif (is_file($fullPath)) {
        $size = round(filesize($fullPath) / 1024, 1);
        echo "$indent✅ FILE $path ({$size} KB)\n";
    } else {
        echo "$indent❌ MISS $path\n";
    }
}

echo "=== STRUCTURE DES MÉDIAS ===\n\n";

echo "Répertoire de base: " . __DIR__ . "\n\n";

// Vérifier la structure complète
$mediaStructure = [
    'media',
    'media/branding',
    'media/branding/icons',
    'media/branding/logos',
    'media/content',
    'media/products',
    'media/products/bundles',
    'media/products/cards',
    'media/products/coins',
    'media/ui',
    'media/ui/flags',
    'media/ui/payments',
    'media/ui/placeholders',
    'media/videos',
    'media/videos/backgrounds',
    'media/videos/demos',
    'media/campaign',
    'media/campaign/maps'
];

foreach ($mediaStructure as $path) {
    checkPath($path);
}

echo "\n=== VIDÉOS CRITIQUES ===\n";
$criticalVideos = [
    'media/videos/backgrounds/mage_compressed.mp4',
    'media/videos/backgrounds/cascade_HD_compressed.mp4',
    'media/videos/backgrounds/fontaine11_compressed.mp4',
    'media/videos/backgrounds/Carte1_compressed.mp4'
];

foreach ($criticalVideos as $video) {
    checkPath($video);
}

echo "\n=== IMAGES CRITIQUES ===\n";
$criticalImages = [
    'media/branding/logos/geekndragon_logo_blanc.webp',
    'media/ui/flags/flag-fr-medieval-rim-on-top.svg',
    'media/ui/payments/visa.svg',
    'media/content/cartes_equipement.webp'
];

foreach ($criticalImages as $image) {
    checkPath($image);
}

echo "\nVérification terminée.\n";
?>
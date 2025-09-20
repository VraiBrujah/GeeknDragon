<?php
/**
 * Script d'optimisation des images - Version simple
 * Prépare la structure pour l'optimisation future
 */

echo "🖼️  Préparation de l'optimisation des images\n";

$imageDir = __DIR__ . '/../images';
$outputDir = __DIR__ . '/../assets/images';

// Créer les dossiers de sortie
$dirs = ['webp', 'responsive', 'thumbnails', 'originals'];
foreach ($dirs as $dir) {
    $path = $outputDir . '/' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
        echo "📁 Dossier créé : $dir\n";
    }
}

// Scanner les images
$extensions = ['jpg', 'jpeg', 'png', 'gif'];
$imageCount = 0;
$totalSize = 0;

if (is_dir($imageDir)) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($imageDir)
    );

    foreach ($iterator as $file) {
        if (!$file->isFile()) continue;
        
        $extension = strtolower($file->getExtension());
        if (!in_array($extension, $extensions)) continue;
        
        $imageCount++;
        $totalSize += $file->getSize();
    }
}

// Créer un fichier de configuration pour l'optimisation
$config = [
    'images_found' => $imageCount,
    'total_size_mb' => round($totalSize / 1024 / 1024, 2),
    'extensions_supported' => [
        'gd' => extension_loaded('gd'),
        'imagick' => extension_loaded('imagick'),
        'webp' => function_exists('imagewebp'),
    ],
    'optimization_ready' => extension_loaded('gd') || extension_loaded('imagick'),
    'recommended_actions' => [],
];

if (!$config['optimization_ready']) {
    $config['recommended_actions'][] = 'Installer l\'extension GD ou ImageMagick pour PHP';
}

if (!$config['extensions_supported']['webp']) {
    $config['recommended_actions'][] = 'Activer le support WebP dans PHP';
}

file_put_contents($outputDir . '/optimization-config.json', json_encode($config, JSON_PRETTY_PRINT));

echo "📊 Images trouvées : {$imageCount}\n";
echo "📦 Taille totale : {$config['total_size_mb']} MB\n";

if ($config['optimization_ready']) {
    echo "✅ Extensions PHP prêtes pour l'optimisation\n";
} else {
    echo "⚠️  Extensions PHP manquantes pour l'optimisation automatique\n";
    echo "   Installez php-gd ou php-imagick pour continuer\n";
}

echo "📋 Configuration sauvegardée dans optimization-config.json\n";

// Créer un guide d'optimisation manuelle
$guide = <<<GUIDE
# Guide d'Optimisation des Images - Geek & Dragon

## Images trouvées : {$imageCount} ({$config['total_size_mb']} MB)

## Optimisations recommandées :

### 1. Conversion WebP
- Réduction moyenne : 25-35% de la taille
- Commande : `cwebp -q 85 input.jpg -o output.webp`

### 2. Versions responsive
- Petite : 300px de large
- Moyenne : 600px de large  
- Grande : 1200px de large

### 3. Compression JPEG
- Qualité recommandée : 85%
- Suppression des métadonnées EXIF

### 4. Optimisation PNG
- Compression sans perte avec pngcrush ou optipng
- Conversion en WebP pour les images sans transparence

## Outils recommandés :
- ImageMagick (ligne de commande)
- Squoosh.app (interface web)
- TinyPNG/TinyJPG (service en ligne)

## Gains estimés :
- Réduction taille : 30-50%
- Amélioration temps de chargement : 20-40%
GUIDE;

file_put_contents($outputDir . '/optimization-guide.md', $guide);
echo "📖 Guide d'optimisation créé : optimization-guide.md\n";
echo "✅ Préparation terminée !\n";
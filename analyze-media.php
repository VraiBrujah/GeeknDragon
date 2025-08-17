<?php
/**
 * Analyse complète des fichiers multimédias du projet
 */

require_once __DIR__ . '/bootstrap.php';

echo "📊 ANALYSE COMPLÈTE DES MÉDIAS DU PROJET\n";
echo str_repeat("=", 70) . "\n\n";

// Configuration des catégories
$mediaCategories = [
    'product_images' => [
        'patterns' => [
            '/carte\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/images\/.*[_-](recto|verso)\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/piece\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i'
        ],
        'target_size' => 1000,
        'target_weight' => 150, // Ko
        'description' => 'Images de produits principales'
    ],
    'thumbnails' => [
        'patterns' => [
            '/optimized\/thumbnails\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/small\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i'
        ],
        'target_size' => 300,
        'target_weight' => 50, // Ko
        'description' => 'Miniatures et vignettes'
    ],
    'banners' => [
        'patterns' => [
            '/banner.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/background.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/bg_.*\.(png|jpg|jpeg|gif|webp|avif)$/i'
        ],
        'target_size' => 1920,
        'target_weight' => 400, // Ko
        'description' => 'Bannières et arrière-plans'
    ],
    'logos_icons' => [
        'patterns' => [
            '/logo.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/icon.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/favicon.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/payments\/.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/flags\/.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i'
        ],
        'target_size' => 200,
        'target_weight' => 30, // Ko
        'description' => 'Logos et icônes'
    ],
    'videos' => [
        'patterns' => [
            '/.*\.(mp4|webm|avi|mov|mkv)$/i'
        ],
        'target_resolution' => '720p',
        'target_weight' => 5000, // Ko pour 30s
        'description' => 'Vidéos'
    ]
];

$projectRoot = __DIR__;
$allFiles = [];
$categorizedFiles = [];
$stats = [
    'total_files' => 0,
    'total_size' => 0,
    'images_count' => 0,
    'videos_count' => 0,
    'oversized_files' => [],
    'optimization_potential' => 0
];

echo "🔍 SCAN DES FICHIERS MULTIMÉDIAS...\n";
echo str_repeat("-", 50) . "\n";

// Scanner récursivement tous les fichiers
function scanDirectory($dir) {
    $files = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $extension = strtolower($file->getExtension());
            $mediaExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'mp4', 'webm', 'avi', 'mov', 'mkv'];
            
            if (in_array($extension, $mediaExtensions)) {
                $files[] = [
                    'path' => $file->getPathname(),
                    'relative_path' => str_replace($GLOBALS['projectRoot'] . DIRECTORY_SEPARATOR, '', $file->getPathname()),
                    'name' => $file->getFilename(),
                    'extension' => $extension,
                    'size' => $file->getSize(),
                    'is_image' => in_array($extension, ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg']),
                    'is_video' => in_array($extension, ['mp4', 'webm', 'avi', 'mov', 'mkv'])
                ];
            }
        }
    }

    return $files;
}

$allFiles = scanDirectory($projectRoot . '/images');
$stats['total_files'] = count($allFiles);

echo "📁 Fichiers trouvés: " . $stats['total_files'] . "\n\n";

// Catégoriser les fichiers
echo "📝 CATÉGORISATION DES MÉDIAS...\n";
echo str_repeat("-", 50) . "\n";

foreach ($mediaCategories as $categoryName => $category) {
    $categorizedFiles[$categoryName] = [];
    
    foreach ($allFiles as $file) {
        $relativePath = str_replace('\\', '/', $file['relative_path']);
        
        foreach ($category['patterns'] as $pattern) {
            if (preg_match($pattern, $relativePath)) {
                $categorizedFiles[$categoryName][] = $file;
                break;
            }
        }
    }
    
    $count = count($categorizedFiles[$categoryName]);
    echo sprintf("%-20s: %3d fichiers - %s\n", 
        strtoupper($categoryName), 
        $count, 
        $category['description']
    );
}

// Fichiers non catégorisés
$uncategorized = [];
foreach ($allFiles as $file) {
    $isCategorized = false;
    foreach ($categorizedFiles as $categoryFiles) {
        if (in_array($file, $categoryFiles)) {
            $isCategorized = true;
            break;
        }
    }
    if (!$isCategorized) {
        $uncategorized[] = $file;
    }
}

echo sprintf("%-20s: %3d fichiers - Fichiers non catégorisés\n", 
    "UNCATEGORIZED", 
    count($uncategorized)
);

echo "\n📊 ANALYSE DÉTAILLÉE PAR CATÉGORIE\n";
echo str_repeat("=", 70) . "\n";

foreach ($mediaCategories as $categoryName => $category) {
    if (empty($categorizedFiles[$categoryName])) {
        continue;
    }
    
    echo "\n🎯 " . strtoupper($categoryName) . " - " . $category['description'] . "\n";
    echo str_repeat("-", 60) . "\n";
    
    $totalSize = 0;
    $oversizedCount = 0;
    $optimizationPotential = 0;
    
    foreach ($categorizedFiles[$categoryName] as $file) {
        $sizeKb = round($file['size'] / 1024, 1);
        $totalSize += $file['size'];
        
        // Vérifier les dimensions pour les images
        $dimensions = null;
        $needsResize = false;
        $needsOptimization = false;
        
        if ($file['is_image'] && function_exists('getimagesize')) {
            $imageInfo = @getimagesize($file['path']);
            if ($imageInfo) {
                $dimensions = ['width' => $imageInfo[0], 'height' => $imageInfo[1]];
                $maxDimension = max($dimensions['width'], $dimensions['height']);
                $needsResize = $maxDimension > $category['target_size'];
            }
        }
        
        // Vérifier le poids
        $targetWeight = $categoryName === 'videos' ? $category['target_weight'] : $category['target_weight'];
        $needsOptimization = $sizeKb > $targetWeight;
        
        if ($needsResize || $needsOptimization) {
            $oversizedCount++;
            $optimizationPotential += $sizeKb;
            
            echo sprintf("⚠️  %-35s %6.1f Ko", basename($file['name']), $sizeKb);
            
            if ($dimensions) {
                echo sprintf(" [%dx%d]", $dimensions['width'], $dimensions['height']);
            }
            
            $issues = [];
            if ($needsResize) $issues[] = "Redim.";
            if ($needsOptimization) $issues[] = "Poids";
            if (!empty($issues)) {
                echo " → " . implode(", ", $issues);
            }
            echo "\n";
        }
    }
    
    $totalSizeKb = round($totalSize / 1024, 1);
    $avgSizeKb = round($totalSizeKb / count($categorizedFiles[$categoryName]), 1);
    
    echo "\n📈 STATISTIQUES:\n";
    echo "   • Fichiers: " . count($categorizedFiles[$categoryName]) . "\n";
    echo "   • Taille totale: {$totalSizeKb} Ko\n";
    echo "   • Taille moyenne: {$avgSizeKb} Ko\n";
    echo "   • Cible recommandée: " . $category['target_weight'] . " Ko\n";
    echo "   • À optimiser: {$oversizedCount} fichiers\n";
    
    if (isset($category['target_size'])) {
        echo "   • Taille max recommandée: " . $category['target_size'] . "px\n";
    }
    
    $stats['total_size'] += $totalSize;
    if ($categoryName !== 'videos') {
        $stats['images_count'] += count($categorizedFiles[$categoryName]);
    } else {
        $stats['videos_count'] += count($categorizedFiles[$categoryName]);
    }
}

echo "\n🎯 RECOMMANDATIONS D'OPTIMISATION\n";
echo str_repeat("=", 70) . "\n";

$totalSizeMb = round($stats['total_size'] / (1024 * 1024), 1);

echo "📊 RÉSUMÉ GLOBAL:\n";
echo "   • Total des médias: " . $stats['total_files'] . " fichiers\n";
echo "   • Images: " . $stats['images_count'] . " fichiers\n";
echo "   • Vidéos: " . $stats['videos_count'] . " fichiers\n";
echo "   • Taille totale: {$totalSizeMb} Mo\n\n";

echo "🚀 PLAN D'OPTIMISATION:\n";
echo "1. 📷 IMAGES:\n";
echo "   • Conversion en WebP (qualité 80, transparence)\n";
echo "   • Fallback PNG optimisé pour compatibilité\n";
echo "   • Redimensionnement selon catégorie\n";
echo "   • Compression aggressive pour réduire le poids\n\n";

echo "2. 🎥 VIDÉOS:\n";
echo "   • Conversion en WebM (VP9, 720p, 2-4 Mbps)\n";
echo "   • Fallback MP4 (H.264) pour compatibilité\n";
echo "   • Optimisation du bitrate adaptatif\n\n";

echo "3. 🔄 INTÉGRATION:\n";
echo "   • Mise à jour des références dans tous les fichiers\n";
echo "   • Implémentation du lazy loading\n";
echo "   • Configuration des fallbacks automatiques\n\n";

echo "💡 OUTILS REQUIS:\n";
echo "   • FFmpeg (vidéos + WebP)\n";
echo "   • ImageMagick (images + optimisation)\n";
echo "   • cwebp (WebP natif)\n";
echo "   • avifenc (AVIF si supporté)\n\n";

echo "🎯 GAINS ESTIMÉS:\n";
echo "   • Réduction de poids: 60-80%\n";
echo "   • Amélioration de vitesse: 2-3x\n";
echo "   • Meilleure compatibilité navigateurs\n";
echo "   • Support transparent et responsive\n\n";

echo "⚡ PROCHAINES ÉTAPES:\n";
echo "1. Installer les outils d'optimisation\n";
echo "2. Créer les services d'optimisation\n";
echo "3. Traiter les fichiers par catégorie\n";
echo "4. Mettre à jour les références\n";
echo "5. Tester la compatibilité\n\n";

echo "✅ Analyse terminée ! Prêt pour l'optimisation.\n";
?>
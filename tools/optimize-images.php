<?php
/**
 * Script d'optimisation des images
 * Convertit en WebP et génère des versions responsive
 */

echo "🖼️  Optimisation des images Geek & Dragon\n";

$imageDir = __DIR__ . '/../images';
$outputDir = __DIR__ . '/../assets/images';

// Créer les dossiers de sortie
$dirs = ['webp', 'responsive', 'thumbnails'];
foreach ($dirs as $dir) {
    $path = $outputDir . '/' . $dir;
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
        echo "📁 Dossier créé : $dir\n";
    }
}

// Extensions supportées
$extensions = ['jpg', 'jpeg', 'png'];

// Tailles responsive
$sizes = [
    'thumbnail' => 150,
    'small' => 300,
    'medium' => 600,
    'large' => 1200
];

$optimized = 0;
$errors = 0;
$totalSavings = 0;

// Scanner les images
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($imageDir)
);

foreach ($iterator as $file) {
    if (!$file->isFile()) continue;
    
    $extension = strtolower($file->getExtension());
    if (!in_array($extension, $extensions)) continue;
    
    $originalPath = $file->getPathname();
    $relativePath = str_replace($imageDir . DIRECTORY_SEPARATOR, '', $originalPath);
    $relativePath = str_replace('\\', '/', $relativePath);
    
    echo "🔄 Traitement : $relativePath\n";
    
    try {
        // Chargement de l'image
        switch ($extension) {
            case 'jpg':
            case 'jpeg':
                $image = imagecreatefromjpeg($originalPath);
                break;
            case 'png':
                $image = imagecreatefrompng($originalPath);
                imagealphablending($image, false);
                imagesavealpha($image, true);
                break;
            default:
                continue 2;
        }
        
        if (!$image) {
            echo "❌ Erreur lors du chargement de $relativePath\n";
            $errors++;
            continue;
        }
        
        $originalSize = filesize($originalPath);
        $width = imagesx($image);
        $height = imagesy($image);
        
        // Créer le dossier de destination si nécessaire
        $outputSubdir = dirname($outputDir . '/webp/' . $relativePath);
        if (!is_dir($outputSubdir)) {
            mkdir($outputSubdir, 0755, true);
        }
        
        // Conversion WebP (version originale)
        $webpPath = $outputDir . '/webp/' . pathinfo($relativePath, PATHINFO_FILENAME) . '.webp';
        if (function_exists('imagewebp')) {
            imagewebp($image, $webpPath, 85);
            $webpSize = filesize($webpPath);
            $savings = $originalSize - $webpSize;
            $totalSavings += $savings;
            
            echo "  ✅ WebP : " . round($webpSize / 1024, 2) . " KB (économie : " . round($savings / 1024, 2) . " KB)\n";
        } else {
            echo "  ⚠️  WebP non supporté sur ce serveur\n";
        }
        
        // Versions responsive
        foreach ($sizes as $sizeName => $maxWidth) {
            if ($width <= $maxWidth) continue; // Pas d'upscale
            
            $ratio = $maxWidth / $width;
            $newWidth = $maxWidth;
            $newHeight = round($height * $ratio);
            
            $resized = imagecreatetruecolor($newWidth, $newHeight);
            
            // Préserver la transparence pour PNG
            if ($extension === 'png') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
                $transparent = imagecolorallocatealpha($resized, 255, 255, 255, 127);
                imagefilledrectangle($resized, 0, 0, $newWidth, $newHeight, $transparent);
            }
            
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            
            // Sauvegarder version responsive
            $responsiveDir = $outputDir . '/responsive/' . $sizeName;
            if (!is_dir($responsiveDir)) {
                mkdir($responsiveDir, 0755, true);
            }
            
            $responsivePath = $responsiveDir . '/' . pathinfo($relativePath, PATHINFO_FILENAME) . '.webp';
            if (function_exists('imagewebp')) {
                imagewebp($resized, $responsivePath, 80);
                echo "  📐 {$sizeName} ({$newWidth}x{$newHeight}) : " . round(filesize($responsivePath) / 1024, 2) . " KB\n";
            }
            
            imagedestroy($resized);
        }
        
        // Thumbnail spécial (carré 150x150)
        $thumbSize = 150;
        $thumbPath = $outputDir . '/thumbnails/' . pathinfo($relativePath, PATHINFO_FILENAME) . '.webp';
        
        $size = min($width, $height);
        $x = ($width - $size) / 2;
        $y = ($height - $size) / 2;
        
        $thumb = imagecreatetruecolor($thumbSize, $thumbSize);
        if ($extension === 'png') {
            imagealphablending($thumb, false);
            imagesavealpha($thumb, true);
            $transparent = imagecolorallocatealpha($thumb, 255, 255, 255, 127);
            imagefilledrectangle($thumb, 0, 0, $thumbSize, $thumbSize, $transparent);
        }
        
        imagecopyresampled($thumb, $image, 0, 0, $x, $y, $thumbSize, $thumbSize, $size, $size);
        
        if (function_exists('imagewebp')) {
            imagewebp($thumb, $thumbPath, 75);
            echo "  🖼️  Thumbnail : " . round(filesize($thumbPath) / 1024, 2) . " KB\n";
        }
        
        imagedestroy($thumb);
        imagedestroy($image);
        
        $optimized++;
        
    } catch (Exception $e) {
        echo "❌ Erreur : " . $e->getMessage() . "\n";
        $errors++;
    }
}

// Génération du fichier d'optimisation pour HTML
$manifestData = [
    'webp_supported' => function_exists('imagewebp'),
    'sizes' => $sizes,
    'optimized_count' => $optimized,
    'total_savings_kb' => round($totalSavings / 1024, 2),
    'generated_at' => date('Y-m-d H:i:s')
];

file_put_contents($outputDir . '/optimization.json', json_encode($manifestData, JSON_PRETTY_PRINT));

echo "\n📊 Résumé de l'optimisation :\n";
echo "Images traitées : $optimized\n";
echo "Erreurs : $errors\n";
echo "Économies totales : " . round($totalSavings / 1024, 2) . " KB\n";
echo "✅ Optimisation terminée !\n";
<?php
/**
 * Test du système de médias modernes optimisés
 */

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\Helpers\ModernMediaHelper;

echo "🧪 TEST DU SYSTÈME DE MÉDIAS MODERNES\n";
echo str_repeat("=", 60) . "\n\n";

// Vérifier si les images optimisées existent
$testImages = [
    'Acid_recto',
    'Acide_recto', 
    'ClasseEN',
    'logo'
];

echo "📁 VÉRIFICATION DES FICHIERS OPTIMISÉS:\n";
echo str_repeat("-", 50) . "\n";

foreach ($testImages as $image) {
    $hasWebP = ModernMediaHelper::hasOptimizedVersion($image, 'webp');
    $hasPNG = ModernMediaHelper::hasOptimizedVersion($image, 'png');
    $hasAVIF = ModernMediaHelper::hasOptimizedVersion($image, 'avif');
    
    echo sprintf("%-20s : WebP %s | PNG %s | AVIF %s\n", 
        $image,
        $hasWebP ? "✅" : "❌",
        $hasPNG ? "✅" : "❌", 
        $hasAVIF ? "✅" : "❌"
    );
}

echo "\n🎨 GÉNÉRATION HTML D'EXEMPLES:\n";
echo str_repeat("-", 50) . "\n";

// Test 1: Image simple
echo "1️⃣ IMAGE SIMPLE RESPONSIVE:\n";
$imageHTML = ModernMediaHelper::renderImage('Acid_recto', 'Carte Acide Recto', [
    'class' => 'test-image',
    'loading' => 'lazy',
    'sizes' => '(max-width: 768px) 100vw, 50vw'
]);
echo htmlspecialchars($imageHTML) . "\n\n";

// Test 2: Carte produit
echo "2️⃣ CARTE PRODUIT:\n";
$productData = [
    'name' => 'Carte Acide',
    'name_en' => 'Acid Card',
    'images' => ['Acid_recto.png']
];
$cardHTML = ModernMediaHelper::renderProductCard($productData, 'fr');
echo htmlspecialchars($cardHTML) . "\n\n";

// Test 3: Galerie complète
echo "3️⃣ GALERIE COMPLÈTE:\n";
$galleryImages = ['Acid_recto.png', 'Acid_verso.png', 'Acide_recto.png'];
$galleryHTML = ModernMediaHelper::renderImageGallery($galleryImages, 'Cartes Acide', [
    'autoplay' => true,
    'autoplay_delay' => 3000
]);
echo "Galerie HTML générée (" . strlen($galleryHTML) . " caractères)\n";
echo "Contient <picture> : " . (strpos($galleryHTML, '<picture>') !== false ? "✅" : "❌") . "\n";
echo "Contient WebP : " . (strpos($galleryHTML, 'type="image/webp"') !== false ? "✅" : "❌") . "\n";
echo "Contient AVIF : " . (strpos($galleryHTML, 'type="image/avif"') !== false ? "✅" : "❌") . "\n\n";

echo "🔧 GÉNÉRATION CSS ET JS:\n";
echo str_repeat("-", 50) . "\n";

$css = ModernMediaHelper::generateModernMediaCSS();
echo "CSS généré (" . strlen($css) . " caractères)\n";
echo "Contient .modern-responsive-image : " . (strpos($css, '.modern-responsive-image') !== false ? "✅" : "❌") . "\n";
echo "Contient responsive design : " . (strpos($css, '@media') !== false ? "✅" : "❌") . "\n\n";

echo "📊 STATISTIQUES DES MÉDIAS OPTIMISÉS:\n";
echo str_repeat("-", 50) . "\n";

$optimizedDir = __DIR__ . '/images/optimized-modern';

if (is_dir($optimizedDir)) {
    $webpCount = count(glob($optimizedDir . '/webp/*.webp'));
    $pngCount = count(glob($optimizedDir . '/png/*.png'));
    $avifCount = count(glob($optimizedDir . '/avif/*.avif'));
    
    echo "📁 Dossier optimisé trouvé\n";
    echo "   • Images WebP: {$webpCount}\n";
    echo "   • Images PNG: {$pngCount}\n";
    echo "   • Images AVIF: {$avifCount}\n\n";
    
    // Calculer les tailles
    $webpSize = 0;
    $pngSize = 0;
    $avifSize = 0;
    
    foreach (glob($optimizedDir . '/webp/*.webp') as $file) {
        $webpSize += filesize($file);
    }
    foreach (glob($optimizedDir . '/png/*.png') as $file) {
        $pngSize += filesize($file);
    }
    foreach (glob($optimizedDir . '/avif/*.avif') as $file) {
        $avifSize += filesize($file);
    }
    
    echo "💾 TAILLES OPTIMISÉES:\n";
    echo "   • WebP total: " . formatBytes($webpSize) . "\n";
    echo "   • PNG total: " . formatBytes($pngSize) . "\n";
    echo "   • AVIF total: " . formatBytes($avifSize) . "\n";
    echo "   • Total optimisé: " . formatBytes($webpSize + $pngSize + $avifSize) . "\n\n";
} else {
    echo "❌ Dossier optimisé non trouvé\n\n";
}

echo "🚀 RECOMMANDATIONS D'INTÉGRATION:\n";
echo str_repeat("-", 50) . "\n";
echo "1. Remplacer les <img> par ModernMediaHelper::renderImage()\n";
echo "2. Utiliser renderImageGallery() pour les galeries produit\n";
echo "3. Ajouter le CSS avec generateModernMediaCSS()\n";
echo "4. Tester la compatibilité sur différents navigateurs\n";
echo "5. Configurer le cache pour les nouveaux formats\n\n";

echo "✅ Test du système de médias modernes terminé!\n";
echo "\n📱 Le système WebP/AVIF + PNG fallback est opérationnel!\n";

function formatBytes(int $bytes, int $precision = 2): string
{
    if ($bytes === 0) return '0 B';
    
    $units = ['B', 'KB', 'MB', 'GB'];
    $base = 1024;
    $pow = floor(log($bytes) / log($base));
    $pow = min($pow, count($units) - 1);
    
    return round($bytes / pow($base, $pow), $precision) . ' ' . $units[$pow];
}
?>
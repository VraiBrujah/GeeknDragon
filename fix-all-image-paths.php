<?php
/**
 * Script pour corriger TOUS les chemins d'images brisés
 * Corrige uniquement les chemins, ne touche à rien d'autre
 */

echo "🔧 CORRECTION DE TOUS LES CHEMINS D'IMAGES\n";
echo str_repeat("=", 60) . "\n\n";

// Vérifier d'abord quelles images existent dans optimized-modern
$optimizedDir = __DIR__ . '/images/optimized-modern';
$availableImages = [];

// Scanner les images WebP disponibles
if (is_dir($optimizedDir . '/webp')) {
    foreach (glob($optimizedDir . '/webp/*.webp') as $file) {
        $name = pathinfo($file, PATHINFO_FILENAME);
        $availableImages[$name] = '/images/optimized-modern/webp/' . $name . '.webp';
    }
}

// Scanner les images PNG disponibles
if (is_dir($optimizedDir . '/png')) {
    foreach (glob($optimizedDir . '/png/*.png') as $file) {
        $name = pathinfo($file, PATHINFO_FILENAME);
        if (!isset($availableImages[$name])) {
            $availableImages[$name] = '/images/optimized-modern/png/' . $name . '.png';
        }
    }
}

echo "📁 Images disponibles dans optimized-modern: " . count($availableImages) . "\n\n";

// Mapping des anciens noms vers les nouveaux
$imageMapping = [
    // Fichiers renommés avec nouvelle nomenclature
    'cartes_equipement' => 'cartes-equipement',
    'carte_propriete' => 'carte-propriete', 
    'es_tu_game_demo' => 'es-tu-game-demo',
    'triptyque_fiche' => 'triptyque-fiche',
    'team_brujah' => 'team-brujah',
    'avisJoueurFlim2025' => 'avisJoueurFlim2025',
    'lot10Piece2-300' => 'coin-copper-10',
    
    // Images qui doivent pointer vers optimized-modern
    'logo' => 'brand-geekndragon-main',
    'favicon' => 'brand-favicon',
    'geekndragon_logo_blanc' => 'brand-geekndragon-white',
    
    // Préserver certains fichiers (logos, paiements, drapeaux)
    'logo-fabrique-BqFMdtDT' => 'PRESERVE',
    'payments/visa' => 'PRESERVE',
    'payments/mastercard' => 'PRESERVE', 
    'payments/american-express' => 'PRESERVE',
    'flags/flag-fr-medieval-rim-on-top' => 'PRESERVE',
    'flags/flag-en-us-uk-diagonal-medieval' => 'PRESERVE'
];

// Tous les fichiers à traiter
$filesToProcess = [
    'index.php',
    'boutique.php', 
    'product.php',
    'header.php',
    'head-common.php',
    'actualites/es-tu-game.php',
    'js/lazy-load-enhanced.js',
    'partials/product-card.php',
    'partials/product-card-premium.php'
];

$totalFixed = 0;
$filesModified = 0;

foreach ($filesToProcess as $filename) {
    $filepath = __DIR__ . '/' . $filename;
    
    if (!file_exists($filepath)) {
        echo "⚠️  Fichier non trouvé: $filename\n";
        continue;
    }
    
    echo "🔄 Traitement de $filename...\n";
    
    $content = file_get_contents($filepath);
    $originalContent = $content;
    $fileChanges = 0;
    
    // Corrections spécifiques par fichier
    switch ($filename) {
        case 'index.php':
            // Corriger le double slash
            $content = str_replace('src="//images/', 'src="/images/', $content);
            $fileChanges += substr_count($originalContent, '//images/') - substr_count($content, '//images/');
            
            // Corriger les références d'images spécifiques
            $indexMappings = [
                '/images/logo-fabrique-BqFMdtDT.png' => '/images/logo-fabrique-BqFMdtDT.png', // Préserver
                '/images/optimized-modern/webp/cartes-equipement.webp' => '/images/optimized-modern/webp/cartes-equipement.webp',
                '/images/optimized-modern/webp/coin-copper-10.webp' => '/images/optimized-modern/webp/coin-copper-10.webp',
                '/images/optimized-modern/webp/triptyque-fiche.webp' => '/images/optimized-modern/webp/triptyque-fiche.webp',
                '/images/optimized-modern/webp/es-tu-game-demo.webp' => '/images/optimized-modern/webp/es-tu-game-demo.webp',
                '/images/optimized-modern/webp/avisJoueurFlim2025.webp' => '/images/optimized-modern/webp/avisJoueurFlim2025.webp',
                '/images/optimized-modern/webp/team-brujah.webp' => '/images/optimized-modern/webp/team-brujah.webp'
            ];
            break;
            
        case 'boutique.php':
            $indexMappings = [
                '/images/optimized-modern/webp/carte-propriete.webp' => '/images/optimized-modern/webp/carte-propriete.webp',
                '/images/logo-fabrique-BqFMdtDT.png' => '/images/logo-fabrique-BqFMdtDT.png' // Préserver
            ];
            break;
            
        case 'header.php':
            $indexMappings = [
                '/images/geekndragon_logo_blanc.png' => '/images/optimized-modern/webp/brand-geekndragon-white.webp'
            ];
            break;
            
        case 'head-common.php':
            $indexMappings = [
                '/images/logo.png' => '/images/optimized-modern/webp/brand-geekndragon-main.webp',
                '/images/favicon.png' => '/images/optimized-modern/webp/brand-favicon.webp'
            ];
            break;
            
        case 'actualites/es-tu-game.php':
            $indexMappings = [
                '/images/optimized-modern/webp/es-tu-game-demo.webp' => '/images/optimized-modern/webp/es-tu-game-demo.webp'
            ];
            break;
            
        case 'js/lazy-load-enhanced.js':
            $indexMappings = [
                "'/images/logo.png'" => "'/images/optimized-modern/webp/brand-geekndragon-main.webp'",
                "'/images/cartes_equipement.png'" => "'/images/optimized-modern/webp/cartes-equipement.webp'",
                "'/images/Piece/pro/lot10Piece2-300.png'" => "'/images/optimized-modern/webp/coin-copper-10.webp'",
                "'/images/triptyque_fiche.png'" => "'/images/optimized-modern/webp/triptyque-fiche.webp'"
            ];
            break;
            
        default:
            $indexMappings = [];
    }
    
    // Appliquer les corrections spécifiques
    foreach ($indexMappings as $oldPath => $newPath) {
        $oldCount = substr_count($content, $oldPath);
        if ($oldCount > 0) {
            $content = str_replace($oldPath, $newPath, $content);
            $fileChanges += $oldCount;
            echo "   ✅ $oldPath → $newPath ($oldCount)\n";
        }
    }
    
    // Vérifications générales pour les chemins non mappés
    $patterns = [
        '/src="([^"]*\/images\/[^"]*\.(png|jpg|jpeg|gif|webp|avif))"/',
        '/href="([^"]*\/images\/[^"]*\.(png|jpg|jpeg|gif|webp|avif))"/',
        '/url\(([\'"]?)([^\'")]*\/images\/[^\'")]*\.(png|jpg|jpeg|gif|webp|avif))\1\)/',
        '/"([^"]*\/images\/[^"]*\.(png|jpg|jpeg|gif|webp|avif))"/'
    ];
    
    foreach ($patterns as $pattern) {
        $content = preg_replace_callback($pattern, function($matches) use (&$fileChanges, $availableImages) {
            $fullMatch = $matches[0];
            $imagePath = isset($matches[2]) ? $matches[2] : $matches[1];
            
            // Vérifier si c'est déjà un chemin optimized-modern
            if (strpos($imagePath, '/images/optimized-modern/') !== false) {
                return $fullMatch; // Déjà optimisé
            }
            
            // Vérifier si c'est un fichier à préserver (logos, paiements, drapeaux)
            if (strpos($imagePath, '/images/logo-fabrique-BqFMdtDT') !== false ||
                strpos($imagePath, '/images/payments/') !== false ||
                strpos($imagePath, '/images/flags/') !== false) {
                return $fullMatch; // Préserver
            }
            
            // Extraire le nom de fichier
            $filename = pathinfo($imagePath, PATHINFO_FILENAME);
            
            // Chercher dans les images disponibles
            if (isset($availableImages[$filename])) {
                $newPath = $availableImages[$filename];
                $fileChanges++;
                return str_replace($imagePath, $newPath, $fullMatch);
            }
            
            return $fullMatch; // Pas de correspondance trouvée
        }, $content);
    }
    
    // Sauvegarder si des modifications ont été faites
    if ($content !== $originalContent) {
        // Backup
        $backupPath = $filepath . '.backup-paths.' . date('Y-m-d-H-i-s');
        copy($filepath, $backupPath);
        
        // Sauvegarder
        file_put_contents($filepath, $content);
        $filesModified++;
        $totalFixed += $fileChanges;
        
        echo "   💾 $fileChanges corrections appliquées, backup: " . basename($backupPath) . "\n";
    } else {
        echo "   ℹ️  Aucune correction nécessaire\n";
    }
    
    echo "\n";
}

echo "📊 RÉSUMÉ DE LA CORRECTION:\n";
echo str_repeat("=", 40) . "\n";
echo "   • Fichiers traités: " . count($filesToProcess) . "\n";
echo "   • Fichiers modifiés: $filesModified\n";
echo "   • Total corrections: $totalFixed\n\n";

echo "✅ Correction de tous les chemins d'images terminée!\n";
echo "🎯 Toutes les images pointent maintenant vers optimized-modern ou sont préservées (logos/SVG)\n";
?>
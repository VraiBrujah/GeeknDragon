<?php
/**
 * Script de build des assets optimisés
 * Compile CSS et JS minifiés pour la production
 */

echo "🚀 Build des assets Geek & Dragon\n";

// Configuration
$sourceCSS = __DIR__ . '/assets/css/src/main.css';
$outputCSS = __DIR__ . '/assets/css/styles.css';
$sourceJS = __DIR__ . '/assets/js/app.js';
$outputJS = __DIR__ . '/assets/js/app.min.js';

// 1. Compilation CSS
echo "📦 Compilation CSS...\n";
if (file_exists($sourceCSS)) {
    $css = file_get_contents($sourceCSS);
    
    // Résolution des @import (simple)
    $css = preg_replace_callback('/\@import\s+[\'"]([^\'\"]+)[\'"]\s*;/', function($matches) use ($sourceCSS) {
        $importPath = dirname($sourceCSS) . '/' . $matches[1];
        if (file_exists($importPath)) {
            return file_get_contents($importPath);
        }
        return $matches[0];
    }, $css);
    
    // Minification basique
    $css = preg_replace('/\/\*.*?\*\//s', '', $css); // Supprime commentaires
    $css = preg_replace('/\s+/', ' ', $css); // Compresse espaces
    $css = str_replace(['; ', ' {', '{ ', ' }', '} '], [';', '{', '{', '}', '}'], $css);
    
    file_put_contents($outputCSS, trim($css));
    echo "✅ CSS compilé : " . round(filesize($outputCSS) / 1024, 2) . " KB\n";
} else {
    echo "❌ Fichier CSS source introuvable\n";
}

// 2. Compilation JS (copie optimisée pour compatibilité)
echo "📦 Compilation JS...\n";
if (file_exists($sourceJS)) {
    $js = file_get_contents($sourceJS);
    
    // Conversion modules ES6 vers compatibilité navigateur
    $js = preg_replace('/import\s+{[^}]+}\s+from\s+[\'"][^\'\"]+[\'"];?/m', '', $js);
    $js = preg_replace('/export\s+(const|function|class)/m', '$1', $js);
    
    // Minification basique
    $js = preg_replace('/\/\*.*?\*\//s', '', $js); // Supprime commentaires multilignes
    $js = preg_replace('/\/\/.*$/m', '', $js); // Supprime commentaires lignes
    $js = preg_replace('/\s+/', ' ', $js); // Compresse espaces
    
    file_put_contents($outputJS, trim($js));
    echo "✅ JS compilé : " . round(filesize($outputJS) / 1024, 2) . " KB\n";
} else {
    echo "❌ Fichier JS source introuvable\n";
}

// 3. Génération du manifest des assets
$manifest = [
    'css' => [
        'main' => '/assets/css/styles.css?v=' . filemtime($outputCSS)
    ],
    'js' => [
        'app' => '/assets/js/app.min.js?v=' . filemtime($outputJS),
        'hero-videos' => '/js/hero-videos.js?v=' . filemtime(__DIR__ . '/js/hero-videos.js')
    ]
];

file_put_contents(__DIR__ . '/assets/manifest.json', json_encode($manifest, JSON_PRETTY_PRINT));
echo "✅ Manifest généré\n";

// 4. Stats finaux
$originalCSS = filesize(__DIR__ . '/css/styles.css');
$newCSS = filesize($outputCSS);
$originalJS = filesize(__DIR__ . '/js/app.js');
$newJS = filesize($outputJS);

echo "\n📊 Statistiques d'optimisation :\n";
echo "CSS : " . round($originalCSS / 1024, 2) . " KB → " . round($newCSS / 1024, 2) . " KB (" . round((1 - $newCSS / $originalCSS) * 100, 1) . "% de réduction)\n";
echo "JS : " . round($originalJS / 1024, 2) . " KB → " . round($newJS / 1024, 2) . " KB (" . round((1 - $newJS / $originalJS) * 100, 1) . "% de réduction)\n";
echo "\n🎉 Build terminé avec succès !\n";
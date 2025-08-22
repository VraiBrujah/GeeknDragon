<?php
declare(strict_types=1);

/**
 * 🚀 SYSTÈME DE MINIFICATION AUTOMATIQUE - GEEKNDRAGON
 * Minification CSS/JS avec gestion de cache et optimisations avancées
 */

class AssetMinifier
{
    private string $rootDir;
    private string $buildDir;
    private array $config;
    
    public function __construct(string $rootDir = null)
    {
        $this->rootDir = $rootDir ?? dirname(__DIR__);
        $this->buildDir = $this->rootDir . '/build';
        
        $this->config = [
            'css' => [
                'input_dirs' => ['css'],
                'output_file' => 'css/optimized.min.css',
                'preserve_important' => true,
                'remove_comments' => true,
            ],
            'js' => [
                'input_dirs' => ['js'],
                'output_file' => 'js/optimized.min.js',
                'preserve_functions' => ['jQuery', '$'],
                'remove_console' => true,
            ]
        ];
        
        if (!is_dir($this->buildDir)) {
            mkdir($this->buildDir, 0755, true);
        }
    }

    /**
     * Minification CSS avancée avec préservation des règles critiques
     */
    public function minifyCSS(string $content): string
    {
        // Supprimer les commentaires (sauf ceux avec !)
        $content = preg_replace('/\/\*(?!\!).*?\*\//s', '', $content);
        
        // Supprimer les espaces et retours à la ligne inutiles
        $content = preg_replace('/\s+/', ' ', $content);
        
        // Optimiser les sélecteurs redondants
        $content = preg_replace('/;\s*;/', ';', $content);
        
        // Supprimer les espaces autour des caractères spéciaux
        $content = str_replace([' {', '{ ', ' }', '} ', ' ;', '; ', ' :', ': ', ' ,', ', '], 
                              ['{', '{', '}', '}', ';', ';', ':', ':', ',', ','], $content);
        
        // Optimiser les valeurs CSS (0px -> 0, etc.)
        $content = preg_replace('/\b0+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch)\b/', '0', $content);
        
        // Compresser les couleurs hexadécimales
        $content = preg_replace('/#([a-f0-9])\1([a-f0-9])\2([a-f0-9])\3/i', '#$1$2$3', $content);
        
        return trim($content);
    }

    /**
     * Minification JS avec préservation des fonctions essentielles
     */
    public function minifyJS(string $content): string
    {
        // Supprimer les commentaires de ligne
        $content = preg_replace('/\/\/.*$/m', '', $content);
        
        // Supprimer les commentaires de bloc
        $content = preg_replace('/\/\*.*?\*\//s', '', $content);
        
        // Supprimer les console.log en production
        if ($this->config['js']['remove_console']) {
            $content = preg_replace('/console\.(log|debug|info|warn|error)\([^)]*\);?/i', '', $content);
        }
        
        // Compresser les espaces
        $content = preg_replace('/\s+/', ' ', $content);
        
        // Optimiser les points-virgules
        $content = preg_replace('/;\s*;/', ';', $content);
        
        // Supprimer les espaces autour des opérateurs
        $content = str_replace([' = ', ' + ', ' - ', ' * ', ' / ', ' == ', ' != ', ' === ', ' !== '], 
                              ['=', '+', '-', '*', '/', '==', '!=', '===', '!=='], $content);
        
        return trim($content);
    }

    /**
     * Traitement intelligent des fichiers avec gestion des dépendances
     */
    public function processAssets(): array
    {
        $results = ['css' => [], 'js' => []];
        
        // Traitement CSS
        $cssContent = '';
        $cssFiles = $this->getAssetFiles('css');
        
        foreach ($cssFiles as $file) {
            $content = file_get_contents($file);
            if ($content !== false) {
                $cssContent .= "/* Source: " . basename($file) . " */\n";
                $cssContent .= $this->minifyCSS($content) . "\n";
                $results['css'][] = $file;
            }
        }
        
        if (!empty($cssContent)) {
            $outputFile = $this->rootDir . '/' . $this->config['css']['output_file'];
            $this->ensureDirectoryExists(dirname($outputFile));
            file_put_contents($outputFile, $cssContent);
            
            echo "✅ CSS minifié : " . count($results['css']) . " fichiers → " . $this->config['css']['output_file'] . "\n";
            echo "   Taille finale : " . $this->formatBytes(strlen($cssContent)) . "\n";
        }
        
        // Traitement JS (scripts non-critiques seulement)
        $jsContent = '';
        $jsFiles = $this->getAssetFiles('js', ['app.js', 'hero-videos.js']); // Exclure les scripts critiques
        
        foreach ($jsFiles as $file) {
            $content = file_get_contents($file);
            if ($content !== false) {
                $jsContent .= "/* Source: " . basename($file) . " */\n";
                $jsContent .= $this->minifyJS($content) . "\n";
                $results['js'][] = $file;
            }
        }
        
        if (!empty($jsContent)) {
            $outputFile = $this->rootDir . '/' . $this->config['js']['output_file'];
            $this->ensureDirectoryExists(dirname($outputFile));
            file_put_contents($outputFile, $jsContent);
            
            echo "✅ JS minifié : " . count($results['js']) . " fichiers → " . $this->config['js']['output_file'] . "\n";
            echo "   Taille finale : " . $this->formatBytes(strlen($jsContent)) . "\n";
        }
        
        return $results;
    }

    /**
     * Récupérer les fichiers d'assets avec filtrage intelligent
     */
    private function getAssetFiles(string $type, array $excludes = []): array
    {
        $files = [];
        $extensions = $type === 'css' ? ['css'] : ['js'];
        
        foreach ($this->config[$type]['input_dirs'] as $dir) {
            $fullDir = $this->rootDir . '/' . $dir;
            if (!is_dir($fullDir)) continue;
            
            $iterator = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($fullDir)
            );
            
            foreach ($iterator as $file) {
                if ($file->isFile()) {
                    $ext = strtolower($file->getExtension());
                    $filename = $file->getFilename();
                    
                    // Filtrer par extension et exclusions
                    if (in_array($ext, $extensions) && 
                        !in_array($filename, $excludes) && 
                        !str_contains($filename, '.min.') &&
                        !str_contains($filename, 'vendor')) {
                        $files[] = $file->getPathname();
                    }
                }
            }
        }
        
        return $files;
    }

    private function ensureDirectoryExists(string $dir): void
    {
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }
}

// Exécution du script
if (php_sapi_name() === 'cli') {
    echo "🚀 Démarrage de la minification des assets...\n\n";
    
    $minifier = new AssetMinifier();
    $results = $minifier->processAssets();
    
    $totalFiles = count($results['css']) + count($results['js']);
    echo "\n✨ Minification terminée ! $totalFiles fichiers traités.\n";
    
    // Génération du rapport
    echo "\n📊 Rapport de minification :\n";
    echo "- CSS : " . count($results['css']) . " fichiers\n";
    echo "- JS : " . count($results['js']) . " fichiers\n";
    echo "\n💡 Pour optimiser davantage, considérez l'activation de la compression Gzip/Brotli.\n";
}
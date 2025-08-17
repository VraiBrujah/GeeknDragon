<?php

namespace GeeknDragon\Services;

/**
 * Service d'optimisation multimédia moderne
 * Suit les standards WebP/AVIF + WebM/MP4 avec fallbacks
 */
class ModernMediaOptimizerService
{
    private string $sourceDir;
    private string $optimizedDir;
    
    // Configuration des catégories selon les règles
    private array $categories = [
        'product_images' => [
            'max_dimension' => 1000, // Entre 800-1200px pour les images produit
            'target_weight' => 150, // Ko
            'quality_webp' => 80,
            'quality_avif' => 70,
            'quality_png' => 95,
        ],
        'thumbnails' => [
            'max_dimension' => 300, // 200-400px pour miniatures
            'target_weight' => 50, // Ko
            'quality_webp' => 85,
            'quality_avif' => 75,
            'quality_png' => 90,
        ],
        'banners' => [
            'max_dimension' => 1920, // Max 1920px pour bannières
            'target_weight' => 400, // Ko
            'quality_webp' => 75,
            'quality_avif' => 65,
            'quality_png' => 90,
        ],
        'logos_icons' => [
            'max_dimension' => 200, // Max 200px pour logos/icônes
            'target_weight' => 30, // Ko
            'quality_webp' => 90, // Qualité plus élevée pour les logos
            'quality_avif' => 80,
            'quality_png' => 95,
        ]
    ];

    // Patterns de détection des catégories
    private array $categoryPatterns = [
        'product_images' => [
            '/carte\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/images\/.*[_-](recto|verso)\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/piece\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/tryp\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i'
        ],
        'thumbnails' => [
            '/optimized\/thumbnails\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/small\/.*\.(png|jpg|jpeg|gif|webp|avif)$/i'
        ],
        'banners' => [
            '/banner.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/background.*\.(png|jpg|jpeg|gif|webp|avif)$/i',
            '/bg_.*\.(png|jpg|jpeg|gif|webp|avif)$/i'
        ],
        'logos_icons' => [
            '/logo.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/icon.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/favicon.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/payments\/.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i',
            '/flags\/.*\.(png|jpg|jpeg|gif|webp|avif|svg)$/i'
        ]
    ];

    public function __construct(string $sourceDir = null, string $optimizedDir = null)
    {
        $this->sourceDir = $sourceDir ?? __DIR__ . '/../../images';
        $this->optimizedDir = $optimizedDir ?? __DIR__ . '/../../images/optimized-modern';
        
        $this->createDirectoryStructure();
    }

    /**
     * Crée la structure de dossiers optimisés
     */
    private function createDirectoryStructure(): void
    {
        $dirs = [
            $this->optimizedDir,
            $this->optimizedDir . '/webp',      // Images WebP principales
            $this->optimizedDir . '/avif',      // Images AVIF pour support maximal
            $this->optimizedDir . '/png',       // PNG fallback optimisés
            $this->optimizedDir . '/webm',      // Vidéos WebM
            $this->optimizedDir . '/mp4',       // Vidéos MP4 fallback
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    /**
     * Optimise tous les médias selon les catégories
     */
    public function optimizeAllMedia(): array
    {
        $results = [
            'processed' => [],
            'errors' => [],
            'statistics' => [
                'total_files' => 0,
                'optimized_files' => 0,
                'original_size' => 0,
                'optimized_size' => 0,
                'space_saved' => 0,
                'compression_ratio' => 0
            ]
        ];

        echo "🚀 OPTIMISATION MULTIMÉDIA MODERNE\n";
        echo str_repeat("=", 60) . "\n\n";

        // Vérification des outils
        $this->checkOptimizationTools();

        // Scanner tous les fichiers images
        $allFiles = $this->scanMediaFiles();
        $results['statistics']['total_files'] = count($allFiles);

        echo "📁 Fichiers trouvés: " . count($allFiles) . "\n\n";

        foreach ($allFiles as $index => $file) {
            $progress = round(($index + 1) / count($allFiles) * 100, 1);
            echo "\r⚡ Progression: {$progress}% - " . basename($file['name']) . str_repeat(' ', 30);

            try {
                $result = $this->optimizeFile($file);
                if ($result) {
                    $results['processed'][] = $result;
                    $results['statistics']['original_size'] += $result['original_size'];
                    $results['statistics']['optimized_size'] += $result['optimized_size'];
                    $results['statistics']['optimized_files']++;
                }
            } catch (\Exception $e) {
                $results['errors'][] = [
                    'file' => $file['path'],
                    'error' => $e->getMessage()
                ];
            }
        }

        echo "\n\n";

        // Calculer les statistiques finales
        $results['statistics']['space_saved'] = $results['statistics']['original_size'] - $results['statistics']['optimized_size'];
        if ($results['statistics']['original_size'] > 0) {
            $results['statistics']['compression_ratio'] = round(
                ($results['statistics']['space_saved'] / $results['statistics']['original_size']) * 100, 1
            );
        }

        return $results;
    }

    /**
     * Optimise un fichier selon sa catégorie
     */
    private function optimizeFile(array $file): ?array
    {
        $category = $this->detectCategory($file['relative_path']);
        if (!$category) {
            return null; // Fichier non catégorisé, ignorer
        }

        $config = $this->categories[$category];
        $originalSize = $file['size'];

        // Obtenir les dimensions actuelles
        $dimensions = $this->getImageDimensions($file['path']);
        if (!$dimensions) {
            throw new \Exception("Impossible de lire les dimensions de l'image");
        }

        // Calculer les nouvelles dimensions en préservant le ratio
        $newDimensions = $this->calculateOptimalDimensions($dimensions, $config['max_dimension']);

        $results = [
            'original_path' => $file['path'],
            'original_size' => $originalSize,
            'original_dimensions' => $dimensions,
            'new_dimensions' => $newDimensions,
            'category' => $category,
            'optimized_versions' => [],
            'optimized_size' => 0
        ];

        // Générer les versions optimisées
        $baseFilename = pathinfo($file['name'], PATHINFO_FILENAME);

        // 1. Version WebP (priorité)
        $webpPath = $this->optimizedDir . "/webp/{$baseFilename}.webp";
        if ($this->createWebPVersion($file['path'], $webpPath, $newDimensions, $config)) {
            $webpSize = filesize($webpPath);
            $results['optimized_versions']['webp'] = [
                'path' => $webpPath,
                'size' => $webpSize,
                'quality' => $config['quality_webp']
            ];
            $results['optimized_size'] += $webpSize;
        }

        // 2. Version AVIF (support maximal)
        $avifPath = $this->optimizedDir . "/avif/{$baseFilename}.avif";
        if ($this->createAVIFVersion($file['path'], $avifPath, $newDimensions, $config)) {
            $avifSize = filesize($avifPath);
            $results['optimized_versions']['avif'] = [
                'path' => $avifPath,
                'size' => $avifSize,
                'quality' => $config['quality_avif']
            ];
        }

        // 3. Version PNG optimisée (fallback)
        $pngPath = $this->optimizedDir . "/png/{$baseFilename}.png";
        if ($this->createOptimizedPNG($file['path'], $pngPath, $newDimensions, $config)) {
            $pngSize = filesize($pngPath);
            $results['optimized_versions']['png'] = [
                'path' => $pngPath,
                'size' => $pngSize,
                'quality' => $config['quality_png']
            ];
            $results['optimized_size'] += $pngSize;
        }

        return $results;
    }

    /**
     * Crée une version WebP optimisée
     */
    private function createWebPVersion(string $source, string $dest, array $dimensions, array $config): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        // Méthode 1: FFmpeg (plus fiable pour WebP)
        if ($this->isFFmpegAvailable()) {
            $command = sprintf(
                'ffmpeg -i "%s" -vf "scale=%d:%d:flags=lanczos" -c:v libwebp -quality %d -preset picture -f webp "%s" -y 2>&1',
                $source,
                $dimensions['width'],
                $dimensions['height'],
                $config['quality_webp'],
                $dest
            );

            exec($command, $output, $returnCode);
            if ($returnCode === 0 && file_exists($dest)) {
                return true;
            }
        }

        // Méthode 2: cwebp (natif WebP)
        if ($this->isCWebPAvailable()) {
            $command = sprintf(
                'cwebp -q %d -resize %d %d "%s" -o "%s" 2>&1',
                $config['quality_webp'],
                $dimensions['width'],
                $dimensions['height'],
                $source,
                $dest
            );

            exec($command, $output, $returnCode);
            if ($returnCode === 0 && file_exists($dest)) {
                return true;
            }
        }

        // Méthode 3: ImageMagick fallback
        if ($this->isImageMagickAvailable()) {
            $command = sprintf(
                'magick "%s" -resize %dx%d -quality %d -define webp:method=6 "%s" 2>&1',
                $source,
                $dimensions['width'],
                $dimensions['height'],
                $config['quality_webp'],
                $dest
            );

            exec($command, $output, $returnCode);
            return $returnCode === 0 && file_exists($dest);
        }

        return false;
    }

    /**
     * Crée une version AVIF optimisée
     */
    private function createAVIFVersion(string $source, string $dest, array $dimensions, array $config): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        // FFmpeg avec encodeur AVIF (si disponible)
        if ($this->isFFmpegAvailable()) {
            $command = sprintf(
                'ffmpeg -i "%s" -vf "scale=%d:%d:flags=lanczos" -c:v libaom-av1 -crf %d -pix_fmt yuv420p "%s" -y 2>&1',
                $source,
                $dimensions['width'],
                $dimensions['height'],
                35 - ($config['quality_avif'] * 0.35), // Conversion qualité CRF
                $dest
            );

            exec($command, $output, $returnCode);
            if ($returnCode === 0 && file_exists($dest)) {
                return true;
            }
        }

        return false; // AVIF optionnel
    }

    /**
     * Crée un PNG optimisé (fallback)
     */
    private function createOptimizedPNG(string $source, string $dest, array $dimensions, array $config): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        // ImageMagick avec optimisation PNG
        if ($this->isImageMagickAvailable()) {
            $command = sprintf(
                'magick "%s" -resize %dx%d -quality %d -strip -define png:compression-filter=5 -define png:compression-level=9 "%s" 2>&1',
                $source,
                $dimensions['width'],
                $dimensions['height'],
                $config['quality_png'],
                $dest
            );

            exec($command, $output, $returnCode);
            if ($returnCode === 0 && file_exists($dest)) {
                return true;
            }
        }

        // FFmpeg fallback
        if ($this->isFFmpegAvailable()) {
            $command = sprintf(
                'ffmpeg -i "%s" -vf "scale=%d:%d:flags=lanczos" -c:v png -compression_level 9 "%s" -y 2>&1',
                $source,
                $dimensions['width'],
                $dimensions['height'],
                $dest
            );

            exec($command, $output, $returnCode);
            return $returnCode === 0 && file_exists($dest);
        }

        return false;
    }

    /**
     * Calcule les dimensions optimales en préservant le ratio
     */
    private function calculateOptimalDimensions(array $currentDimensions, int $maxSize): array
    {
        $width = $currentDimensions['width'];
        $height = $currentDimensions['height'];
        $maxDimension = max($width, $height);

        // Si déjà à la bonne taille ou plus petit, garder tel quel
        if ($maxDimension <= $maxSize) {
            return ['width' => $width, 'height' => $height];
        }

        // Redimensionner en préservant le ratio
        $ratio = $maxSize / $maxDimension;
        return [
            'width' => (int)round($width * $ratio),
            'height' => (int)round($height * $ratio)
        ];
    }

    /**
     * Détecte la catégorie d'un fichier
     */
    private function detectCategory(string $relativePath): ?string
    {
        $normalizedPath = str_replace('\\', '/', $relativePath);
        
        foreach ($this->categoryPatterns as $category => $patterns) {
            foreach ($patterns as $pattern) {
                if (preg_match($pattern, $normalizedPath)) {
                    return $category;
                }
            }
        }
        
        return null;
    }

    /**
     * Scanne tous les fichiers médias
     */
    private function scanMediaFiles(): array
    {
        $files = [];
        $imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];

        if (!is_dir($this->sourceDir)) {
            return $files;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($this->sourceDir, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, $imageExtensions)) {
                    $path = $file->getPathname();
                    
                    // Éviter les dossiers d'optimisation
                    if (strpos($path, '/optimized') === false && 
                        strpos($path, '\\optimized') === false &&
                        strpos($path, '/transparent-square') === false && 
                        strpos($path, '\\transparent-square') === false) {
                        
                        $files[] = [
                            'path' => $path,
                            'relative_path' => str_replace($this->sourceDir . DIRECTORY_SEPARATOR, '', $path),
                            'name' => $file->getFilename(),
                            'extension' => $extension,
                            'size' => $file->getSize()
                        ];
                    }
                }
            }
        }

        return $files;
    }

    /**
     * Obtient les dimensions d'une image
     */
    private function getImageDimensions(string $imagePath): ?array
    {
        if (function_exists('getimagesize')) {
            $info = @getimagesize($imagePath);
            if ($info && $info[0] > 0 && $info[1] > 0) {
                return ['width' => $info[0], 'height' => $info[1]];
            }
        }
        
        if ($this->isImageMagickAvailable()) {
            $command = sprintf('magick identify -ping -format "%%w %%h" "%s" 2>&1', $imagePath);
            $output = trim(shell_exec($command));
            if ($output && preg_match('/^(\d+) (\d+)$/', $output, $matches)) {
                return ['width' => (int)$matches[1], 'height' => (int)$matches[2]];
            }
        }
        
        return null;
    }

    /**
     * Vérifie les outils d'optimisation disponibles
     */
    private function checkOptimizationTools(): void
    {
        echo "🔧 Vérification des outils d'optimisation...\n";
        
        $tools = [];
        
        if ($this->isFFmpegAvailable()) {
            echo "✅ FFmpeg disponible (WebP, AVIF, redimensionnement)\n";
            $tools[] = 'FFmpeg';
        } else {
            echo "❌ FFmpeg non disponible\n";
        }
        
        if ($this->isImageMagickAvailable()) {
            echo "✅ ImageMagick disponible (optimisation complète)\n";
            $tools[] = 'ImageMagick';
        } else {
            echo "❌ ImageMagick non disponible\n";
        }
        
        if ($this->isCWebPAvailable()) {
            echo "✅ cwebp disponible (WebP natif optimal)\n";
            $tools[] = 'cwebp';
        } else {
            echo "❌ cwebp non disponible\n";
        }
        
        if (empty($tools)) {
            echo "⚠️  Aucun outil d'optimisation disponible - résultats limités\n";
        }
        
        echo "\n";
    }

    /**
     * Vérifie la disponibilité d'FFmpeg
     */
    private function isFFmpegAvailable(): bool
    {
        exec('ffmpeg -version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }

    /**
     * Vérifie la disponibilité d'ImageMagick
     */
    private function isImageMagickAvailable(): bool
    {
        exec('magick -version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }

    /**
     * Vérifie la disponibilité de cwebp
     */
    private function isCWebPAvailable(): bool
    {
        exec('cwebp -version 2>&1', $output, $returnCode);
        return $returnCode === 0;
    }

    /**
     * Génère un helper HTML pour les images responsives avec fallbacks
     */
    public static function generateResponsiveImageHTML(string $baseFilename, string $alt, array $options = []): string
    {
        $basePath = '/images/optimized-modern';
        $class = $options['class'] ?? 'responsive-image';
        $loading = $options['loading'] ?? 'lazy';
        
        return sprintf(
            '<picture class="%s">
                <source srcset="%s/avif/%s.avif" type="image/avif">
                <source srcset="%s/webp/%s.webp" type="image/webp">
                <img src="%s/png/%s.png" alt="%s" loading="%s">
            </picture>',
            htmlspecialchars($class),
            $basePath, htmlspecialchars($baseFilename),
            $basePath, htmlspecialchars($baseFilename),
            $basePath, htmlspecialchars($baseFilename),
            htmlspecialchars($alt),
            htmlspecialchars($loading)
        );
    }
}
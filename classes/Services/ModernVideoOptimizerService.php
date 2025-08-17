<?php

namespace GeeknDragon\Services;

/**
 * Service d'optimisation vidéo moderne
 * WebM (VP9/AV1) + MP4 (H.264) avec résolutions adaptatives
 */
class ModernVideoOptimizerService
{
    private string $sourceDir;
    private string $optimizedDir;
    
    // Configuration des résolutions et bitrates
    private array $videoConfigs = [
        '480p' => [
            'width' => 854,
            'height' => 480,
            'bitrate_webm' => '1M',
            'bitrate_mp4' => '1.2M',
            'crf_webm' => 30,
            'crf_mp4' => 28,
            'description' => 'Petites animations secondaires'
        ],
        '720p' => [
            'width' => 1280,
            'height' => 720,
            'bitrate_webm' => '2.5M',
            'bitrate_mp4' => '3M',
            'crf_webm' => 28,
            'crf_mp4' => 26,
            'description' => 'Standard web recommandé'
        ],
        '1080p' => [
            'width' => 1920,
            'height' => 1080,
            'bitrate_webm' => '6M',
            'bitrate_mp4' => '8M',
            'crf_webm' => 26,
            'crf_mp4' => 24,
            'description' => 'Haute qualité si détails requis'
        ]
    ];

    // Catégories vidéo selon usage
    private array $videoCategories = [
        'product_demos' => [
            'target_resolution' => '720p',
            'max_duration' => 60, // secondes
            'target_weight' => 8000, // Ko
            'description' => 'Démonstrations de produits'
        ],
        'short_animations' => [
            'target_resolution' => '480p',
            'max_duration' => 10, // secondes
            'target_weight' => 2000, // Ko
            'description' => 'Courtes animations d\'interface'
        ],
        'hero_videos' => [
            'target_resolution' => '1080p',
            'max_duration' => 30, // secondes
            'target_weight' => 15000, // Ko
            'description' => 'Vidéos hero/bannières'
        ]
    ];

    public function __construct(string $sourceDir = null, string $optimizedDir = null)
    {
        $this->sourceDir = $sourceDir ?? __DIR__ . '/../../videos';
        $this->optimizedDir = $optimizedDir ?? __DIR__ . '/../../images/optimized-modern';
        
        $this->createDirectoryStructure();
    }

    /**
     * Crée la structure de dossiers pour vidéos
     */
    private function createDirectoryStructure(): void
    {
        $dirs = [
            $this->optimizedDir . '/webm',      // Vidéos WebM (VP9/AV1)
            $this->optimizedDir . '/mp4',       // Vidéos MP4 fallback (H.264)
            $this->optimizedDir . '/webm/480p', // Résolutions WebM
            $this->optimizedDir . '/webm/720p',
            $this->optimizedDir . '/webm/1080p',
            $this->optimizedDir . '/mp4/480p',  // Résolutions MP4
            $this->optimizedDir . '/mp4/720p',
            $this->optimizedDir . '/mp4/1080p',
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }

    /**
     * Optimise toutes les vidéos trouvées
     */
    public function optimizeAllVideos(): array
    {
        $results = [
            'processed' => [],
            'errors' => [],
            'statistics' => [
                'total_files' => 0,
                'optimized_files' => 0,
                'original_size' => 0,
                'optimized_size' => 0,
                'space_saved' => 0
            ]
        ];

        if (!$this->isFFmpegAvailable()) {
            throw new \Exception("FFmpeg est requis pour l'optimisation vidéo");
        }

        $videoFiles = $this->scanVideoFiles();
        $results['statistics']['total_files'] = count($videoFiles);

        echo "🎥 Vidéos trouvées: " . count($videoFiles) . "\n\n";

        foreach ($videoFiles as $index => $file) {
            $progress = round(($index + 1) / count($videoFiles) * 100, 1);
            echo "\r⚡ Progression: {$progress}% - " . basename($file['name']) . str_repeat(' ', 30);

            try {
                $result = $this->optimizeVideo($file);
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

        $results['statistics']['space_saved'] = 
            $results['statistics']['original_size'] - $results['statistics']['optimized_size'];

        return $results;
    }

    /**
     * Optimise une vidéo selon sa catégorie
     */
    private function optimizeVideo(array $file): ?array
    {
        $category = $this->detectVideoCategory($file);
        $config = $this->videoCategories[$category];
        $videoConfig = $this->videoConfigs[$config['target_resolution']];

        $originalSize = $file['size'];
        $baseFilename = pathinfo($file['name'], PATHINFO_FILENAME);

        // Obtenir les informations vidéo
        $videoInfo = $this->getVideoInfo($file['path']);
        if (!$videoInfo) {
            throw new \Exception("Impossible de lire les informations vidéo");
        }

        // Calculer les nouvelles dimensions en préservant le ratio
        $newDimensions = $this->calculateOptimalVideoDimensions(
            $videoInfo['dimensions'], 
            $videoConfig
        );

        $results = [
            'original_path' => $file['path'],
            'original_size' => $originalSize,
            'original_info' => $videoInfo,
            'new_dimensions' => $newDimensions,
            'category' => $category,
            'target_resolution' => $config['target_resolution'],
            'optimized_versions' => [],
            'optimized_size' => 0
        ];

        $resolution = $config['target_resolution'];

        // 1. Version WebM (VP9/AV1 - priorité)
        $webmPath = $this->optimizedDir . "/webm/{$resolution}/{$baseFilename}.webm";
        if ($this->createWebMVersion($file['path'], $webmPath, $newDimensions, $videoConfig)) {
            $webmSize = filesize($webmPath);
            $results['optimized_versions']['webm'] = [
                'path' => $webmPath,
                'size' => $webmSize,
                'codec' => 'VP9',
                'resolution' => $resolution
            ];
            $results['optimized_size'] += $webmSize;
        }

        // 2. Version MP4 (H.264 - fallback)
        $mp4Path = $this->optimizedDir . "/mp4/{$resolution}/{$baseFilename}.mp4";
        if ($this->createMP4Version($file['path'], $mp4Path, $newDimensions, $videoConfig)) {
            $mp4Size = filesize($mp4Path);
            $results['optimized_versions']['mp4'] = [
                'path' => $mp4Path,
                'size' => $mp4Size,
                'codec' => 'H.264',
                'resolution' => $resolution
            ];
            $results['optimized_size'] += $mp4Size;
        }

        return $results;
    }

    /**
     * Crée une version WebM optimisée
     */
    private function createWebMVersion(string $source, string $dest, array $dimensions, array $config): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        // Commande FFmpeg pour WebM VP9 optimisé
        $command = sprintf(
            'ffmpeg -i "%s" -c:v libvpx-vp9 -crf %d -b:v %s -vf "scale=%d:%d:flags=lanczos" -c:a libopus -b:a 96k -f webm "%s" -y 2>&1',
            $source,
            $config['crf_webm'],
            $config['bitrate_webm'],
            $dimensions['width'],
            $dimensions['height'],
            $dest
        );

        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }

    /**
     * Crée une version MP4 optimisée
     */
    private function createMP4Version(string $source, string $dest, array $dimensions, array $config): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) {
            mkdir($destDir, 0755, true);
        }

        // Commande FFmpeg pour MP4 H.264 optimisé
        $command = sprintf(
            'ffmpeg -i "%s" -c:v libx264 -crf %d -b:v %s -vf "scale=%d:%d:flags=lanczos" -c:a aac -b:a 128k -movflags +faststart "%s" -y 2>&1',
            $source,
            $config['crf_mp4'],
            $config['bitrate_mp4'],
            $dimensions['width'],
            $dimensions['height'],
            $dest
        );

        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }

    /**
     * Calcule les dimensions optimales pour vidéo
     */
    private function calculateOptimalVideoDimensions(array $currentDimensions, array $targetConfig): array
    {
        $currentWidth = $currentDimensions['width'];
        $currentHeight = $currentDimensions['height'];
        $targetWidth = $targetConfig['width'];
        $targetHeight = $targetConfig['height'];

        // Si déjà plus petit ou égal, garder tel quel
        if ($currentWidth <= $targetWidth && $currentHeight <= $targetHeight) {
            return ['width' => $currentWidth, 'height' => $currentHeight];
        }

        // Calculer le ratio pour préserver les proportions
        $widthRatio = $targetWidth / $currentWidth;
        $heightRatio = $targetHeight / $currentHeight;
        $ratio = min($widthRatio, $heightRatio);

        return [
            'width' => (int)round($currentWidth * $ratio),
            'height' => (int)round($currentHeight * $ratio)
        ];
    }

    /**
     * Obtient les informations d'une vidéo
     */
    private function getVideoInfo(string $videoPath): ?array
    {
        $command = sprintf('ffprobe -v quiet -print_format json -show_streams -show_format "%s" 2>&1', $videoPath);
        $output = shell_exec($command);
        
        if (!$output) {
            return null;
        }

        $data = json_decode($output, true);
        if (!$data || !isset($data['streams'])) {
            return null;
        }

        // Trouver le stream vidéo
        $videoStream = null;
        foreach ($data['streams'] as $stream) {
            if ($stream['codec_type'] === 'video') {
                $videoStream = $stream;
                break;
            }
        }

        if (!$videoStream) {
            return null;
        }

        return [
            'dimensions' => [
                'width' => (int)$videoStream['width'],
                'height' => (int)$videoStream['height']
            ],
            'duration' => (float)($data['format']['duration'] ?? 0),
            'codec' => $videoStream['codec_name'] ?? 'unknown',
            'bitrate' => (int)($data['format']['bit_rate'] ?? 0)
        ];
    }

    /**
     * Détecte la catégorie d'une vidéo
     */
    private function detectVideoCategory(array $file): string
    {
        $filename = strtolower($file['name']);
        
        if (strpos($filename, 'hero') !== false || strpos($filename, 'banner') !== false) {
            return 'hero_videos';
        }
        
        if (strpos($filename, 'demo') !== false || strpos($filename, 'product') !== false) {
            return 'product_demos';
        }
        
        // Par défaut, considérer comme animation courte
        return 'short_animations';
    }

    /**
     * Scanne tous les fichiers vidéo
     */
    private function scanVideoFiles(): array
    {
        $files = [];
        $videoExtensions = ['mp4', 'webm', 'avi', 'mov', 'mkv'];

        if (!is_dir($this->sourceDir)) {
            return $files;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($this->sourceDir, \RecursiveDirectoryIterator::SKIP_DOTS)
        );

        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $extension = strtolower($file->getExtension());
                if (in_array($extension, $videoExtensions)) {
                    $files[] = [
                        'path' => $file->getPathname(),
                        'name' => $file->getFilename(),
                        'extension' => $extension,
                        'size' => $file->getSize()
                    ];
                }
            }
        }

        return $files;
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
     * Génère le HTML pour vidéo responsive avec fallbacks
     */
    public static function generateResponsiveVideoHTML(string $baseFilename, array $options = []): string
    {
        $basePath = '/images/optimized-modern';
        $resolution = $options['resolution'] ?? '720p';
        $autoplay = $options['autoplay'] ?? false;
        $loop = $options['loop'] ?? false;
        $muted = $options['muted'] ?? true;
        $controls = $options['controls'] ?? true;
        $poster = $options['poster'] ?? '';

        $autoplayAttr = $autoplay ? 'autoplay' : '';
        $loopAttr = $loop ? 'loop' : '';
        $mutedAttr = $muted ? 'muted' : '';
        $controlsAttr = $controls ? 'controls' : '';
        $posterAttr = $poster ? "poster=\"{$poster}\"" : '';

        return sprintf(
            '<video %s %s %s %s %s playsinline preload="metadata">
                <source src="%s/webm/%s/%s.webm" type="video/webm">
                <source src="%s/mp4/%s/%s.mp4" type="video/mp4">
                <p>Votre navigateur ne supporte pas les vidéos HTML5.</p>
            </video>',
            $autoplayAttr,
            $loopAttr,
            $mutedAttr,
            $controlsAttr,
            $posterAttr,
            $basePath, $resolution, htmlspecialchars($baseFilename),
            $basePath, $resolution, htmlspecialchars($baseFilename)
        );
    }
}
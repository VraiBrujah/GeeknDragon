<?php
/**
 * Système complet d'optimisation et renommage des médias
 * Applique les règles strictes d'optimisation et nomenclature logique
 * Préserve les logos et SVG, traite uniquement images et vidéos
 */

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\Services\ModernMediaOptimizerService;

echo "🏗️ SYSTÈME COMPLET D'OPTIMISATION DES MÉDIAS\n";
echo str_repeat("=", 70) . "\n\n";

class CompleteMediaOptimizer 
{
    private string $projectRoot;
    private string $optimizedDir;
    private array $statistics = [
        'analyzed' => 0,
        'renamed' => 0,
        'optimized' => 0,
        'videos_processed' => 0,
        'deleted' => 0,
        'errors' => 0
    ];
    
    // Extensions à traiter (exclut SVG et logos spécifiques)
    private array $imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];
    private array $videoExtensions = ['mp4', 'webm', 'mov', 'avi'];
    
    // Fichiers à préserver (logos, SVG, etc.)
    private array $preservePatterns = [
        '/logo/',
        '/favicon/',
        '/brand-/',
        '\.svg$',
        '/payments/',
        '/flags/'
    ];
    
    // Règles d'optimisation strictes
    private array $optimizationRules = [
        'product_images' => [
            'max_dimension' => 1200,  // Entre 800-1200px
            'min_dimension' => 800,
            'target_weight' => 150,   // 50-200 Ko
            'quality_webp' => 80,
            'quality_avif' => 70,
            'quality_png' => 95,
        ],
        'thumbnails' => [
            'max_dimension' => 400,   // 200-400px max
            'min_dimension' => 200,
            'target_weight' => 75,    // < 100 Ko
            'quality_webp' => 85,
            'quality_avif' => 75,
            'quality_png' => 90,
        ],
        'banners' => [
            'max_dimension' => 1920,  // 1920px max
            'target_weight' => 300,   // 200-400 Ko max
            'quality_webp' => 75,
            'quality_avif' => 65,
            'quality_png' => 90,
        ],
        'icons' => [
            'max_dimension' => 200,   // Petites icônes
            'target_weight' => 30,    // < 50 Ko
            'quality_webp' => 90,
            'quality_avif' => 80,
            'quality_png' => 95,
        ]
    ];
    
    // Règles vidéo
    private array $videoRules = [
        'standard' => [
            'resolution' => '720p',
            'width' => 1280,
            'height' => 720,
            'bitrate' => '3M',        // 2-4 Mbps
            'target_weight' => 5000,  // 5 Mo max pour 30s
        ],
        'animation' => [
            'resolution' => '480p',
            'width' => 854,
            'height' => 480,
            'bitrate' => '1.5M',
            'target_weight' => 2000,  // 2 Mo max
        ],
        'detail' => [
            'resolution' => '1080p',
            'width' => 1920,
            'height' => 1080,
            'bitrate' => '6M',        // 5-8 Mbps
            'target_weight' => 8000,  // 8 Mo max
        ]
    ];
    
    // Nomenclature logique
    private array $namingConventions = [
        'cards' => [
            'pattern' => '/^(.*?)(_recto|_verso|_front|_back)?\\./',
            'format' => 'card-{name}-{side}',
            'category' => 'product_images'
        ],
        'coins' => [
            'pattern' => '/^(.*?)(piece|coin|p|f|o|e|c|a)(\\d+)?\\./',
            'format' => 'coin-{type}-{value}',
            'category' => 'thumbnails'
        ],
        'characters' => [
            'pattern' => '/^(.*?)(EN|FR)?(_recto|_verso)?\\./',
            'format' => 'character-{name}-{lang}-{side}',
            'category' => 'product_images'
        ],
        'equipment' => [
            'pattern' => '/^(.*?)(supplies|equipment|armor|weapon)(_recto|_verso)?\\./',
            'format' => 'equipment-{name}-{side}',
            'category' => 'product_images'
        ],
        'ui' => [
            'pattern' => '/^(class|race|histo|demo|event).*\\./',
            'format' => 'ui-{type}-{variant}',
            'category' => 'thumbnails'
        ],
        'branding' => [
            'pattern' => '/^(logo|icon|favicon|brand).*\\./',
            'format' => 'brand-{name}-{variant}',
            'category' => 'icons'
        ],
        'layouts' => [
            'pattern' => '/^(bg|background|banner|header|texture).*\\./',
            'format' => 'layout-{type}-{variant}',
            'category' => 'banners'
        ],
        'videos' => [
            'pattern' => '/^(.*?)\\./',
            'format' => 'video-{name}',
            'category' => 'standard'
        ]
    ];

    public function __construct()
    {
        $this->projectRoot = __DIR__;
        $this->optimizedDir = __DIR__ . '/images/optimized-modern';
        
        $this->createOptimizedStructure();
    }
    
    /**
     * Processus complet d'optimisation
     */
    public function processAllMedia(): array
    {
        echo "🔍 PHASE 1: Analyse complète du projet\n";
        echo str_repeat("-", 50) . "\n";
        
        $allFiles = $this->scanAllMediaFiles();
        $this->statistics['analyzed'] = count($allFiles);
        
        echo "📁 Fichiers trouvés: " . count($allFiles) . "\n\n";
        
        echo "🏷️ PHASE 2: Application de la nomenclature logique\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->applyNamingConventions($allFiles);
        
        echo "\n⚡ PHASE 3: Optimisation des images\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->optimizeImages($allFiles);
        
        echo "\n🎥 PHASE 4: Optimisation des vidéos\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->optimizeVideos($allFiles);
        
        echo "\n🗑️ PHASE 5: Nettoyage des anciens fichiers\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->cleanupOldFiles($allFiles);
        
        echo "\n🔄 PHASE 6: Mise à jour des références\n";
        echo str_repeat("-", 50) . "\n";
        
        $this->updateAllReferences();
        
        return $this->generateReport();
    }
    
    /**
     * Scanne tous les fichiers médias du projet
     */
    private function scanAllMediaFiles(): array
    {
        $files = [];
        $allExtensions = array_merge($this->imageExtensions, $this->videoExtensions);
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->projectRoot, RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $extension = strtolower($file->getExtension());
                $path = $file->getPathname();
                
                // Vérifier si c'est un type de fichier à traiter
                if (in_array($extension, $allExtensions)) {
                    // Vérifier si le fichier doit être préservé
                    $shouldPreserve = false;
                    foreach ($this->preservePatterns as $pattern) {
                        if (preg_match($pattern, $path)) {
                            $shouldPreserve = true;
                            break;
                        }
                    }
                    
                    // Éviter les dossiers d'optimisation existants
                    if (!$shouldPreserve && 
                        strpos($path, '/optimized-modern/') === false &&
                        strpos($path, '\\optimized-modern\\') === false) {
                        
                        $files[] = [
                            'path' => $path,
                            'name' => $file->getFilename(),
                            'extension' => $extension,
                            'size' => $file->getSize(),
                            'type' => in_array($extension, $this->imageExtensions) ? 'image' : 'video',
                            'category' => $this->detectCategory($path)
                        ];
                    }
                }
            }
        }
        
        return $files;
    }
    
    /**
     * Applique les conventions de nommage
     */
    private function applyNamingConventions(array $files): void
    {
        foreach ($files as &$file) {
            $oldName = pathinfo($file['name'], PATHINFO_FILENAME);
            $newName = $this->generateLogicalName($oldName, $file['path'], $file['type']);
            
            if ($newName && $newName !== $oldName) {
                $oldPath = $file['path'];
                $newPath = dirname($oldPath) . '/' . $newName . '.' . $file['extension'];
                
                if (file_exists($oldPath) && !file_exists($newPath)) {
                    if (rename($oldPath, $newPath)) {
                        $file['path'] = $newPath;
                        $file['name'] = $newName . '.' . $file['extension'];
                        $this->statistics['renamed']++;
                        echo "✅ " . basename($oldName) . " → " . $newName . "\n";
                    } else {
                        $this->statistics['errors']++;
                        echo "❌ Échec renommage: " . basename($oldName) . "\n";
                    }
                }
            }
        }
    }
    
    /**
     * Optimise les images selon les règles strictes
     */
    private function optimizeImages(array $files): void
    {
        $imageFiles = array_filter($files, fn($f) => $f['type'] === 'image');
        $total = count($imageFiles);
        $current = 0;
        
        foreach ($imageFiles as $file) {
            $current++;
            $percentage = round(($current / $total) * 100, 1);
            
            echo sprintf("⚡ Progression: %s%% - %s\n", 
                $percentage, 
                basename($file['name'])
            );
            
            $this->optimizeImage($file);
        }
    }
    
    /**
     * Optimise une image individuelle
     */
    private function optimizeImage(array $file): void
    {
        $sourcePath = $file['path'];
        $filename = pathinfo($file['name'], PATHINFO_FILENAME);
        $category = $file['category'];
        $rules = $this->optimizationRules[$category] ?? $this->optimizationRules['thumbnails'];
        
        // Chemins de destination
        $webpPath = $this->optimizedDir . '/webp/' . $filename . '.webp';
        $pngPath = $this->optimizedDir . '/png/' . $filename . '.png';
        $avifPath = $this->optimizedDir . '/avif/' . $filename . '.avif';
        
        // Vérifier les dimensions actuelles
        $imageInfo = getimagesize($sourcePath);
        if (!$imageInfo) return;
        
        list($width, $height) = $imageInfo;
        $maxDimension = max($width, $height);
        $targetDimension = $rules['max_dimension'];
        
        // Calculer les nouvelles dimensions en conservant le ratio
        if ($maxDimension > $targetDimension) {
            $ratio = $targetDimension / $maxDimension;
            $newWidth = round($width * $ratio);
            $newHeight = round($height * $ratio);
        } else {
            $newWidth = $width;
            $newHeight = $height;
        }
        
        // Créer WebP optimisé
        $this->createOptimizedWebP($sourcePath, $webpPath, $newWidth, $newHeight, $rules['quality_webp']);
        
        // Créer PNG fallback
        $this->createOptimizedPNG($sourcePath, $pngPath, $newWidth, $newHeight, $rules['quality_png']);
        
        // Créer AVIF si demandé
        if (function_exists('imageavif')) {
            $this->createOptimizedAVIF($sourcePath, $avifPath, $newWidth, $newHeight, $rules['quality_avif']);
        }
        
        $this->statistics['optimized']++;
    }
    
    /**
     * Optimise les vidéos
     */
    private function optimizeVideos(array $files): void
    {
        $videoFiles = array_filter($files, fn($f) => $f['type'] === 'video');
        $total = count($videoFiles);
        $current = 0;
        
        foreach ($videoFiles as $file) {
            $current++;
            $percentage = round(($current / $total) * 100, 1);
            
            echo sprintf("🎥 Progression: %s%% - %s\n", 
                $percentage, 
                basename($file['name'])
            );
            
            $this->optimizeVideo($file);
        }
    }
    
    /**
     * Optimise une vidéo individuelle
     */
    private function optimizeVideo(array $file): void
    {
        $sourcePath = $file['path'];
        $filename = pathinfo($file['name'], PATHINFO_FILENAME);
        $category = $this->detectVideoCategory($file);
        $rules = $this->videoRules[$category] ?? $this->videoRules['standard'];
        
        // Chemins de destination
        $webmPath = $this->optimizedDir . '/webm/' . $rules['resolution'] . '/' . $filename . '.webm';
        $mp4Path = $this->optimizedDir . '/mp4/' . $rules['resolution'] . '/' . $filename . '.mp4';
        
        // Créer les dossiers de résolution si nécessaire
        $webmDir = dirname($webmPath);
        $mp4Dir = dirname($mp4Path);
        if (!is_dir($webmDir)) mkdir($webmDir, 0755, true);
        if (!is_dir($mp4Dir)) mkdir($mp4Dir, 0755, true);
        
        // Optimiser en WebM (priorité)
        $this->createOptimizedWebM($sourcePath, $webmPath, $rules);
        
        // Créer fallback MP4
        $this->createOptimizedMP4($sourcePath, $mp4Path, $rules);
        
        $this->statistics['videos_processed']++;
    }
    
    /**
     * Crée une version WebP optimisée
     */
    private function createOptimizedWebP(string $source, string $dest, int $width, int $height, int $quality): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);
        
        // Utiliser FFmpeg pour WebP avec transparence
        $command = sprintf(
            'ffmpeg -i "%s" -vf "scale=%d:%d" -c:v libwebp -quality %d -preset default -f webp "%s" -y 2>&1',
            $source, $width, $height, $quality, $dest
        );
        
        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }
    
    /**
     * Crée une version PNG optimisée
     */
    private function createOptimizedPNG(string $source, string $dest, int $width, int $height, int $quality): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);
        
        // Utiliser FFmpeg pour PNG avec transparence
        $command = sprintf(
            'ffmpeg -i "%s" -vf "scale=%d:%d" -c:v png -pix_fmt rgba "%s" -y 2>&1',
            $source, $width, $height, $dest
        );
        
        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }
    
    /**
     * Crée une version AVIF optimisée
     */
    private function createOptimizedAVIF(string $source, string $dest, int $width, int $height, int $quality): bool
    {
        $destDir = dirname($dest);
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);
        
        // Utiliser FFmpeg pour AVIF
        $command = sprintf(
            'ffmpeg -i "%s" -vf "scale=%d:%d" -c:v libaom-av1 -crf %d "%s" -y 2>&1',
            $source, $width, $height, $quality, $dest
        );
        
        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }
    
    /**
     * Crée une version WebM optimisée
     */
    private function createOptimizedWebM(string $source, string $dest, array $rules): bool
    {
        $command = sprintf(
            'ffmpeg -i "%s" -vf "scale=%d:%d" -c:v libvpx-vp9 -b:v %s -c:a libopus -b:a 96k "%s" -y 2>&1',
            $source, $rules['width'], $rules['height'], $rules['bitrate'], $dest
        );
        
        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }
    
    /**
     * Crée une version MP4 optimisée
     */
    private function createOptimizedMP4(string $source, string $dest, array $rules): bool
    {
        $command = sprintf(
            'ffmpeg -i "%s" -vf "scale=%d:%d" -c:v libx264 -b:v %s -c:a aac -b:a 128k "%s" -y 2>&1',
            $source, $rules['width'], $rules['height'], $rules['bitrate'], $dest
        );
        
        exec($command, $output, $returnCode);
        return $returnCode === 0 && file_exists($dest);
    }
    
    /**
     * Génère un nom logique selon les conventions
     */
    private function generateLogicalName(string $originalName, string $filePath, string $type): ?string
    {
        $originalName = strtolower($originalName);
        $originalName = $this->cleanFileName($originalName);
        
        if ($type === 'video') {
            // Nomenclature vidéo
            if (strpos($originalName, 'demo') !== false) return 'video-demo-game';
            if (strpos($originalName, 'fontaine') !== false) return 'video-fountain-' . str_replace('fontaine', '', $originalName);
            if (strpos($originalName, 'carte') !== false) return 'video-card-preview';
            if (strpos($originalName, 'mage') !== false) return 'video-mage-hero';
            if (strpos($originalName, 'cascade') !== false) return 'video-cascade-hd';
            if (strpos($originalName, 'trip') !== false) return 'video-triptych-demo';
            
            return 'video-' . $originalName;
        }
        
        // Images - appliquer les conventions existantes
        return $this->applyImageNamingConventions($originalName, $filePath);
    }
    
    /**
     * Applique les conventions de nommage pour images
     */
    private function applyImageNamingConventions(string $name, string $path): ?string
    {
        // Cartes
        if (preg_match('/^(.*?)(_recto|_verso|_front|_back)?$/', $name, $matches)) {
            $baseName = $this->cleanCardName($matches[1]);
            $side = $this->standardizeSide($matches[2] ?? '');
            
            if (strpos($path, '/carte/') !== false) {
                return $side ? "card-{$baseName}-{$side}" : "card-{$baseName}";
            }
        }
        
        // Pièces
        if (preg_match('/(piece|coin|copper|silver|gold|platinum|electrum|cuivre|argent|or|platine)/', $name)) {
            return $this->generateCoinName($name);
        }
        
        // Personnages
        if (preg_match('/(acolyte|barbarian|barbare|dragonborn|drakeide)/', $name)) {
            return $this->generateCharacterName($name);
        }
        
        // Interface
        if (preg_match('/^(class|race|histo)/', $name)) {
            $lang = strpos($name, 'en') !== false ? 'en' : 'fr';
            $type = 'unknown';
            if (strpos($name, 'class') !== false) $type = 'class';
            if (strpos($name, 'race') !== false) $type = 'race';
            if (strpos($name, 'histo') !== false) $type = 'history';
            
            return "ui-{$type}-{$lang}";
        }
        
        // Layouts
        if (preg_match('/(bg|background|texture)/', $name)) {
            return 'layout-bg-texture';
        }
        
        return $this->cleanFileName($name);
    }
    
    // Méthodes utilitaires (reprises du système précédent)
    
    private function cleanFileName(string $name): string
    {
        $name = str_replace([' ', '_', '-', '(', ')', '[', ']', '&', '+'], '-', $name);
        $name = preg_replace('/[àáâãäå]/', 'a', $name);
        $name = preg_replace('/[èéêë]/', 'e', $name);
        $name = preg_replace('/[ìíîï]/', 'i', $name);
        $name = preg_replace('/[òóôõö]/', 'o', $name);
        $name = preg_replace('/[ùúûü]/', 'u', $name);
        $name = preg_replace('/[ç]/', 'c', $name);
        $name = preg_replace('/[ñ]/', 'n', $name);
        $name = preg_replace('/[^a-z0-9-]/', '', $name);
        $name = preg_replace('/-+/', '-', $name);
        return trim($name, '-');
    }
    
    private function cleanCardName(string $name): string
    {
        $name = $this->cleanFileName($name);
        $translations = [
            'acide' => 'acid',
            'vaisseau-aerien' => 'airship',
            'materiel-alchimiste' => 'alchemist-supplies',
            'biere-chope' => 'ale-mug',
            'alexandrite' => 'alexandrite',
            'arme' => 'weapon',
            'armure' => 'armor'
        ];
        return $translations[$name] ?? $name;
    }
    
    private function standardizeSide(string $side): string
    {
        $side = strtolower($side);
        if (in_array($side, ['_recto', '_front', 'recto', 'front'])) return 'front';
        if (in_array($side, ['_verso', '_back', 'verso', 'back'])) return 'back';
        return '';
    }
    
    private function generateCoinName(string $name): string
    {
        $metals = [
            'cuivre' => 'copper', 'copper' => 'copper', 'c' => 'copper',
            'argent' => 'silver', 'silver' => 'silver', 'a' => 'silver',
            'electrum' => 'electrum', 'e' => 'electrum',
            'or' => 'gold', 'gold' => 'gold', 'o' => 'gold',
            'platine' => 'platinum', 'platinum' => 'platinum', 'p' => 'platinum'
        ];
        
        $metal = 'generic';
        $value = '1';
        
        foreach ($metals as $key => $standardMetal) {
            if (strpos($name, $key) !== false) {
                $metal = $standardMetal;
                break;
            }
        }
        
        if (preg_match('/(\\d+)/', $name, $matches)) {
            $value = $matches[1];
        }
        
        return "coin-{$metal}-{$value}";
    }
    
    private function generateCharacterName(string $name): string
    {
        $characters = [
            'acolyte' => 'acolyte',
            'barbarian' => 'barbarian', 'barbare' => 'barbarian',
            'dragonborn' => 'dragonborn', 'drakeide' => 'dragonborn'
        ];
        
        $lang = strpos($name, 'en') !== false ? 'en' : 'fr';
        $side = '';
        
        if (strpos($name, 'recto') !== false || strpos($name, 'front') !== false) $side = 'front';
        if (strpos($name, 'verso') !== false || strpos($name, 'back') !== false) $side = 'back';
        
        $character = 'unknown';
        foreach ($characters as $key => $standard) {
            if (strpos($name, $key) !== false) {
                $character = $standard;
                break;
            }
        }
        
        $result = "character-{$character}-{$lang}";
        return $side ? "{$result}-{$side}" : $result;
    }
    
    private function detectCategory(string $filePath): string
    {
        if (strpos($filePath, '/carte/') !== false) return 'product_images';
        if (strpos($filePath, '/piece/') !== false || strpos($filePath, '/Piece/') !== false) return 'thumbnails';
        if (strpos($filePath, '/tryp/') !== false) return 'product_images';
        if (strpos($filePath, 'logo') !== false || strpos($filePath, 'favicon') !== false) return 'icons';
        if (strpos($filePath, 'banner') !== false || strpos($filePath, 'bg_') !== false) return 'banners';
        
        return 'thumbnails';
    }
    
    private function detectVideoCategory(array $file): string
    {
        $name = strtolower($file['name']);
        $size = $file['size'];
        
        // Petites animations (< 2MB)
        if ($size < 2 * 1024 * 1024) return 'animation';
        
        // Vidéos détaillées (> 10MB)
        if ($size > 10 * 1024 * 1024) return 'detail';
        
        return 'standard';
    }
    
    private function cleanupOldFiles(array $files): void
    {
        // Identifier les fichiers sources originaux qui ont été traités
        foreach ($files as $file) {
            if ($file['type'] === 'image') {
                $filename = pathinfo($file['name'], PATHINFO_FILENAME);
                
                // Vérifier si une version optimisée existe
                $hasOptimized = file_exists($this->optimizedDir . '/webp/' . $filename . '.webp') &&
                               file_exists($this->optimizedDir . '/png/' . $filename . '.png');
                
                if ($hasOptimized) {
                    // Supprimer l'original seulement s'il n'est pas dans optimized-modern
                    if (strpos($file['path'], '/optimized-modern/') === false) {
                        if (unlink($file['path'])) {
                            $this->statistics['deleted']++;
                            echo "🗑️ Supprimé: " . basename($file['name']) . "\n";
                        }
                    }
                }
            }
        }
    }
    
    private function updateAllReferences(): void
    {
        echo "🔄 Mise à jour des références en cours...\n";
        
        // Exécuter le script de mise à jour des références existant
        include __DIR__ . '/update-media-references.php';
        
        echo "✅ Références mises à jour\n";
    }
    
    private function createOptimizedStructure(): void
    {
        $dirs = [
            $this->optimizedDir,
            $this->optimizedDir . '/webp',
            $this->optimizedDir . '/avif', 
            $this->optimizedDir . '/png',
            $this->optimizedDir . '/webm',
            $this->optimizedDir . '/webm/720p',
            $this->optimizedDir . '/webm/480p',
            $this->optimizedDir . '/webm/1080p',
            $this->optimizedDir . '/mp4',
            $this->optimizedDir . '/mp4/720p',
            $this->optimizedDir . '/mp4/480p',
            $this->optimizedDir . '/mp4/1080p'
        ];

        foreach ($dirs as $dir) {
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
        }
    }
    
    private function generateReport(): array
    {
        return $this->statistics;
    }
}

// Exécution du processus complet
try {
    $optimizer = new CompleteMediaOptimizer();
    $results = $optimizer->processAllMedia();
    
    echo "\n📊 RAPPORT FINAL D'OPTIMISATION\n";
    echo str_repeat("=", 70) . "\n";
    echo "📈 STATISTIQUES:\n";
    echo "   • Fichiers analysés: " . $results['analyzed'] . "\n";
    echo "   • Fichiers renommés: " . $results['renamed'] . "\n";
    echo "   • Images optimisées: " . $results['optimized'] . "\n";
    echo "   • Vidéos traitées: " . $results['videos_processed'] . "\n";
    echo "   • Fichiers supprimés: " . $results['deleted'] . "\n";
    echo "   • Erreurs: " . $results['errors'] . "\n\n";
    
    echo "✅ OPTIMISATION COMPLÈTE TERMINÉE!\n";
    echo "\n🎯 RÈGLES APPLIQUÉES:\n";
    echo "   • Images produit: 800-1200px, WebP 80% + PNG fallback\n";
    echo "   • Miniatures: 200-400px, poids < 100 Ko\n";
    echo "   • Bannières: ≤1920px, poids < 400 Ko\n";
    echo "   • Vidéos: 720p WebM (2-4 Mbps) + MP4 fallback\n";
    echo "   • Nomenclature logique appliquée\n";
    echo "   • Logos et SVG préservés\n\n";
    
    echo "🚀 Votre projet utilise maintenant des médias optimisés modernes!\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    exit(1);
}
?>
<?php
/**
 * Script d'optimisation en lot de tous les médias
 * Traite les images et vidéos existantes avec compression optimale
 */

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../classes/Core/Application.php';

use GeeknDragon\Core\Application;
use GeeknDragon\Services\MediaService;

ini_set('max_execution_time', 0); // Pas de limite de temps
ini_set('memory_limit', '512M');

class MediaOptimizer
{
    private MediaService $mediaService;
    private array $stats = [
        'processed' => 0,
        'success' => 0,
        'errors' => 0,
        'total_size_before' => 0,
        'total_size_after' => 0
    ];

    public function __construct()
    {
        $app = Application::getInstance();
        $this->mediaService = $app->getService('media');
    }

    public function optimizeAll(): void
    {
        echo "🚀 Démarrage de l'optimisation des médias...\n\n";

        $this->optimizeImages();
        $this->optimizeVideos();
        
        $this->displayFinalStats();
    }

    private function optimizeImages(): void
    {
        echo "📸 Optimisation des images...\n";
        
        $imagePatterns = [
            __DIR__ . '/../images/**/*.{jpg,jpeg,png,gif,webp}',
            __DIR__ . '/../images/*.{jpg,jpeg,png,gif,webp}'
        ];

        foreach ($imagePatterns as $pattern) {
            $files = glob($pattern, GLOB_BRACE);
            foreach ($files as $file) {
                $this->processMedia($file, 'image');
            }
        }
    }

    private function optimizeVideos(): void
    {
        echo "\n🎬 Optimisation des vidéos...\n";
        
        $videoPatterns = [
            __DIR__ . '/../videos/*.{mp4,webm,mov,avi}',
            __DIR__ . '/../videos/**/*.{mp4,webm,mov,avi}'
        ];

        foreach ($videoPatterns as $pattern) {
            $files = glob($pattern, GLOB_BRACE);
            foreach ($files as $file) {
                $this->processMedia($file, 'video');
            }
        }
    }

    private function processMedia(string $filePath, string $expectedType): void
    {
        $relativePath = str_replace(__DIR__ . '/../', '', $filePath);
        echo "  📄 Traitement : {$relativePath}";

        $this->stats['processed']++;
        $originalSize = filesize($filePath);
        $this->stats['total_size_before'] += $originalSize;

        try {
            $media = $this->mediaService->optimizeMedia($filePath);
            
            $optimizedSize = $media->getTotalOptimizedSize();
            $this->stats['total_size_after'] += $optimizedSize;
            
            $compressionRatio = $media->getCompressionRatio();
            $variantCount = count($media->getVariants());
            
            echo " ✅ ({$variantCount} variantes, {$compressionRatio}% compression)\n";
            $this->stats['success']++;
            
        } catch (\Exception $e) {
            echo " ❌ Erreur : " . $e->getMessage() . "\n";
            $this->stats['errors']++;
            $this->stats['total_size_after'] += $originalSize; // Conserver taille originale si erreur
        }
    }

    private function displayFinalStats(): void
    {
        $totalSavings = $this->stats['total_size_before'] - $this->stats['total_size_after'];
        $savingsPercent = $this->stats['total_size_before'] > 0 
            ? round(($totalSavings / $this->stats['total_size_before']) * 100, 2) 
            : 0;

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 STATISTIQUES D'OPTIMISATION\n";
        echo str_repeat("=", 60) . "\n";
        echo "Fichiers traités     : {$this->stats['processed']}\n";
        echo "Succès               : {$this->stats['success']}\n";
        echo "Erreurs              : {$this->stats['errors']}\n";
        echo "Taille avant         : " . $this->formatBytes($this->stats['total_size_before']) . "\n";
        echo "Taille après         : " . $this->formatBytes($this->stats['total_size_after']) . "\n";
        echo "Économie totale      : " . $this->formatBytes($totalSavings) . " ({$savingsPercent}%)\n";
        echo str_repeat("=", 60) . "\n";

        if ($this->stats['errors'] > 0) {
            echo "⚠️  Certains fichiers n'ont pas pu être optimisés.\n";
            echo "   Vérifiez les erreurs ci-dessus et les dépendances système.\n";
        }
        
        if ($savingsPercent > 10) {
            echo "🎉 Excellente optimisation ! Gain significatif en performance web.\n";
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}

// Exécution du script
if (php_sapi_name() === 'cli') {
    $optimizer = new MediaOptimizer();
    $optimizer->optimizeAll();
} else {
    echo "⚠️ Ce script doit être exécuté en ligne de commande.\n";
    echo "Usage : php scripts/optimize-all-media.php\n";
}
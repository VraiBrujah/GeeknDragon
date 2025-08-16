<?php

namespace GeeknDragon\Services;

use GeeknDragon\Models\Media;
use GeeknDragon\Processors\ImageProcessor;
use GeeknDragon\Processors\VideoProcessor;

/**
 * Service de gestion des médias avec compression optimale
 * Utilise le patron Strategy pour différents types de médias
 */
class MediaService
{
    private ImageProcessor $imageProcessor;
    private VideoProcessor $videoProcessor;
    private CacheService $cache;

    public function __construct()
    {
        $this->imageProcessor = new ImageProcessor();
        $this->videoProcessor = new VideoProcessor();
        $this->cache = new CacheService();
    }

    /**
     * Optimise un média selon son type
     */
    public function optimizeMedia(string $filePath): Media
    {
        $mediaInfo = $this->analyzeMedia($filePath);
        $cacheKey = $this->generateCacheKey($filePath, $mediaInfo);
        
        if ($cachedMedia = $this->cache->get($cacheKey)) {
            return $cachedMedia;
        }

        $processor = $this->getProcessor($mediaInfo['type']);
        $optimizedMedia = $processor->process($filePath, $mediaInfo);
        
        $this->cache->set($cacheKey, $optimizedMedia, 3600); // Cache 1h
        
        return $optimizedMedia;
    }

    /**
     * Génère plusieurs variantes d'un média (responsive)
     */
    public function generateVariants(string $filePath): array
    {
        $mediaInfo = $this->analyzeMedia($filePath);
        $processor = $this->getProcessor($mediaInfo['type']);
        
        return $processor->generateVariants($filePath, $mediaInfo);
    }

    private function analyzeMedia(string $filePath): array
    {
        if (!file_exists($filePath)) {
            throw new \InvalidArgumentException("Fichier non trouvé : $filePath");
        }

        $info = getimagesize($filePath);
        $fileSize = filesize($filePath);
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        return [
            'type' => $this->getMediaType($extension),
            'width' => $info[0] ?? null,
            'height' => $info[1] ?? null,
            'size' => $fileSize,
            'extension' => $extension,
            'mime' => $info['mime'] ?? mime_content_type($filePath)
        ];
    }

    private function getMediaType(string $extension): string
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $videoExtensions = ['mp4', 'webm', 'mov', 'avi'];

        if (in_array($extension, $imageExtensions)) {
            return 'image';
        }
        if (in_array($extension, $videoExtensions)) {
            return 'video';
        }
        
        throw new \InvalidArgumentException("Type de média non supporté : $extension");
    }

    private function getProcessor(string $type): object
    {
        return match($type) {
            'image' => $this->imageProcessor,
            'video' => $this->videoProcessor,
            default => throw new \InvalidArgumentException("Processeur non trouvé pour : $type")
        };
    }

    private function generateCacheKey(string $filePath, array $mediaInfo): string
    {
        return 'media_' . md5($filePath . serialize($mediaInfo) . filemtime($filePath));
    }
}
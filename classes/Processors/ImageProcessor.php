<?php

namespace GeeknDragon\Processors;

use GeeknDragon\Models\Media;

/**
 * Processeur d'images avec compression optimale
 * Préserve la qualité perceptuelle tout en réduisant la taille
 */
class ImageProcessor
{
    private const QUALITY_SETTINGS = [
        'thumbnail' => ['width' => 300, 'height' => 300, 'quality' => 85],
        'medium' => ['width' => 800, 'height' => 600, 'quality' => 90],
        'large' => ['width' => 1200, 'height' => 900, 'quality' => 92],
        'original' => ['quality' => 95]
    ];

    /**
     * Traite une image avec compression optimale
     */
    public function process(string $filePath, array $mediaInfo): Media
    {
        $outputDir = $this->createOutputDirectory($filePath);
        $variants = [];

        foreach (self::QUALITY_SETTINGS as $size => $settings) {
            $outputPath = $this->generateOutputPath($outputDir, $size, $mediaInfo['extension']);
            $optimized = $this->optimizeImage($filePath, $outputPath, $settings, $mediaInfo);
            
            if ($optimized) {
                $variants[$size] = [
                    'path' => $outputPath,
                    'size' => filesize($outputPath),
                    'dimensions' => getimagesize($outputPath)
                ];
            }
        }

        return new Media($filePath, $variants, $mediaInfo);
    }

    /**
     * Génère plusieurs variantes responsives
     */
    public function generateVariants(string $filePath, array $mediaInfo): array
    {
        return $this->process($filePath, $mediaInfo)->getVariants();
    }

    private function optimizeImage(string $inputPath, string $outputPath, array $settings, array $mediaInfo): bool
    {
        $originalImage = $this->createImageResource($inputPath, $mediaInfo['extension']);
        if (!$originalImage) {
            return false;
        }

        $originalWidth = imagesx($originalImage);
        $originalHeight = imagesy($originalImage);

        // Calcul des nouvelles dimensions en préservant le ratio
        [$newWidth, $newHeight] = $this->calculateDimensions(
            $originalWidth, 
            $originalHeight, 
            $settings['width'] ?? $originalWidth, 
            $settings['height'] ?? $originalHeight
        );

        // Création de l'image optimisée
        $optimizedImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Préservation de la transparence pour PNG/GIF
        $this->preserveTransparency($optimizedImage, $originalImage, $mediaInfo['extension']);

        // Redimensionnement avec algorithme bicubique pour meilleure qualité
        imagecopyresampled(
            $optimizedImage, $originalImage,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $originalWidth, $originalHeight
        );

        // Sauvegarde avec compression optimale
        $success = $this->saveOptimizedImage($optimizedImage, $outputPath, $mediaInfo['extension'], $settings['quality']);

        imagedestroy($originalImage);
        imagedestroy($optimizedImage);

        return $success;
    }

    private function createImageResource($filePath, string $extension)
    {
        // Vérifier si l'extension GD est disponible
        if (!extension_loaded('gd')) {
            throw new \RuntimeException('Extension GD PHP non disponible - requise pour le traitement d\'images');
        }

        return match(strtolower($extension)) {
            'jpg', 'jpeg' => function_exists('imagecreatefromjpeg') ? imagecreatefromjpeg($filePath) : false,
            'png' => function_exists('imagecreatefrompng') ? imagecreatefrompng($filePath) : false,
            'gif' => function_exists('imagecreatefromgif') ? imagecreatefromgif($filePath) : false,
            'webp' => function_exists('imagecreatefromwebp') ? imagecreatefromwebp($filePath) : false,
            default => false
        };
    }

    private function calculateDimensions(int $origWidth, int $origHeight, int $maxWidth, int $maxHeight): array
    {
        $ratio = min($maxWidth / $origWidth, $maxHeight / $origHeight);
        
        // Ne pas agrandir l'image si elle est plus petite
        if ($ratio > 1) {
            return [$origWidth, $origHeight];
        }

        return [
            (int)round($origWidth * $ratio),
            (int)round($origHeight * $ratio)
        ];
    }

    private function preserveTransparency($newImage, $originalImage, string $extension): void
    {
        if (in_array(strtolower($extension), ['png', 'gif'])) {
            imagealphablending($newImage, false);
            imagesavealpha($newImage, true);
            
            $transparentColor = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
            imagefill($newImage, 0, 0, $transparentColor);
        }
    }

    private function saveOptimizedImage($image, string $outputPath, string $extension, int $quality): bool
    {
        $this->ensureDirectoryExists(dirname($outputPath));

        return match(strtolower($extension)) {
            'jpg', 'jpeg' => imagejpeg($image, $outputPath, $quality),
            'png' => imagepng($image, $outputPath, $this->pngQualityFromJpeg($quality)),
            'gif' => imagegif($image, $outputPath),
            'webp' => imagewebp($image, $outputPath, $quality),
            default => false
        };
    }

    private function pngQualityFromJpeg(int $jpegQuality): int
    {
        // Conversion qualité JPEG (0-100) vers PNG (0-9, inversé)
        return (int)round((100 - $jpegQuality) / 11.11);
    }

    private function createOutputDirectory(string $filePath): string
    {
        $baseDir = dirname($filePath);
        $outputDir = $baseDir . '/optimized';
        $this->ensureDirectoryExists($outputDir);
        return $outputDir;
    }

    private function generateOutputPath(string $outputDir, string $size, string $extension): string
    {
        $filename = $size . '_' . uniqid() . '.' . $extension;
        return $outputDir . '/' . $filename;
    }

    private function ensureDirectoryExists(string $directory): void
    {
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }
}
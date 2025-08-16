<?php

namespace GeeknDragon\Processors;

use GeeknDragon\Models\Media;

/**
 * Processeur de vidéos avec compression H.264/H.265 optimale
 * Utilise FFmpeg pour la compression avec préservation de la qualité perceptuelle
 */
class VideoProcessor
{
    private const QUALITY_PRESETS = [
        'thumbnail' => ['width' => 320, 'height' => 240, 'bitrate' => '500k', 'crf' => 28],
        'mobile' => ['width' => 480, 'height' => 360, 'bitrate' => '800k', 'crf' => 25],
        'standard' => ['width' => 720, 'height' => 540, 'bitrate' => '1500k', 'crf' => 23],
        'hd' => ['width' => 1280, 'height' => 720, 'bitrate' => '2500k', 'crf' => 21],
        'fullhd' => ['width' => 1920, 'height' => 1080, 'bitrate' => '4000k', 'crf' => 20]
    ];

    /**
     * Traite une vidéo avec compression optimale
     */
    public function process(string $filePath, array $mediaInfo): Media
    {
        if (!$this->checkFFmpegAvailable()) {
            throw new \RuntimeException('FFmpeg non disponible - installation requise pour la compression vidéo');
        }

        $outputDir = $this->createOutputDirectory($filePath);
        $variants = [];

        foreach (self::QUALITY_PRESETS as $quality => $settings) {
            // Ne pas créer de variante plus grande que l'original
            if ($this->shouldSkipVariant($mediaInfo, $settings)) {
                continue;
            }

            $outputPath = $this->generateOutputPath($outputDir, $quality);
            
            if ($this->compressVideo($filePath, $outputPath, $settings)) {
                $variants[$quality] = [
                    'path' => $outputPath,
                    'size' => filesize($outputPath),
                    'dimensions' => $this->getVideoDimensions($outputPath)
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

    private function compressVideo(string $inputPath, string $outputPath, array $settings): bool
    {
        $this->ensureDirectoryExists(dirname($outputPath));

        // Construction de la commande FFmpeg optimisée
        $command = $this->buildFFmpegCommand($inputPath, $outputPath, $settings);
        
        $output = [];
        $returnCode = 0;
        exec($command . ' 2>&1', $output, $returnCode);

        if ($returnCode !== 0) {
            error_log("Erreur FFmpeg: " . implode("\n", $output));
            return false;
        }

        return file_exists($outputPath) && filesize($outputPath) > 0;
    }

    private function buildFFmpegCommand(string $inputPath, string $outputPath, array $settings): string
    {
        $parts = [
            'ffmpeg',
            '-i ' . escapeshellarg($inputPath),
            '-c:v libx264',  // Codec H.264 pour compatibilité maximale
            '-preset medium', // Équilibre qualité/vitesse
            '-crf ' . $settings['crf'], // Qualité constante (lower = better)
            '-maxrate ' . $settings['bitrate'], // Bitrate maximum
            '-bufsize ' . $settings['bitrate'], // Buffer size
            '-vf "scale=' . $settings['width'] . ':' . $settings['height'] . ':force_original_aspect_ratio=decrease,pad=' . $settings['width'] . ':' . $settings['height'] . ':(ow-iw)/2:(oh-ih)/2"',
            '-c:a aac', // Audio AAC
            '-b:a 128k', // Bitrate audio
            '-movflags +faststart', // Optimisation streaming
            '-y', // Écraser fichier existant
            escapeshellarg($outputPath)
        ];

        return implode(' ', $parts);
    }

    private function shouldSkipVariant(array $mediaInfo, array $settings): bool
    {
        // Skip si la variante serait plus grande que l'original
        return ($mediaInfo['width'] ?? 0) < $settings['width'] || 
               ($mediaInfo['height'] ?? 0) < $settings['height'];
    }

    private function getVideoDimensions(string $videoPath): array
    {
        $command = 'ffprobe -v quiet -print_format json -show_format -show_streams ' . escapeshellarg($videoPath);
        $output = shell_exec($command);
        
        if (!$output) {
            return ['width' => 0, 'height' => 0];
        }

        $data = json_decode($output, true);
        $videoStream = null;

        foreach ($data['streams'] ?? [] as $stream) {
            if ($stream['codec_type'] === 'video') {
                $videoStream = $stream;
                break;
            }
        }

        return [
            'width' => $videoStream['width'] ?? 0,
            'height' => $videoStream['height'] ?? 0
        ];
    }

    private function checkFFmpegAvailable(): bool
    {
        $output = shell_exec('ffmpeg -version 2>&1');
        return $output !== null && strpos($output, 'ffmpeg version') !== false;
    }

    private function createOutputDirectory(string $filePath): string
    {
        $baseDir = dirname($filePath);
        $outputDir = $baseDir . '/optimized';
        $this->ensureDirectoryExists($outputDir);
        return $outputDir;
    }

    private function generateOutputPath(string $outputDir, string $quality): string
    {
        $filename = $quality . '_' . uniqid() . '.mp4';
        return $outputDir . '/' . $filename;
    }

    private function ensureDirectoryExists(string $directory): void
    {
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }
}
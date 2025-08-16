<?php

namespace GeeknDragon\Models;

/**
 * Modèle représentant un média optimisé avec ses variantes
 * Implémente une interface propre pour l'accès aux données
 */
class Media
{
    private string $originalPath;
    private array $variants;
    private array $metadata;
    private \DateTime $createdAt;

    public function __construct(string $originalPath, array $variants, array $metadata)
    {
        $this->originalPath = $originalPath;
        $this->variants = $variants;
        $this->metadata = $metadata;
        $this->createdAt = new \DateTime();
    }

    public function getOriginalPath(): string
    {
        return $this->originalPath;
    }

    public function getVariants(): array
    {
        return $this->variants;
    }

    public function getVariant(string $size): ?array
    {
        return $this->variants[$size] ?? null;
    }

    public function getBestVariant(int $maxWidth = null, int $maxHeight = null): ?array
    {
        if ($maxWidth === null && $maxHeight === null) {
            return $this->variants['original'] ?? reset($this->variants);
        }

        $bestVariant = null;
        $bestScore = PHP_INT_MAX;

        foreach ($this->variants as $variant) {
            $dimensions = $variant['dimensions'] ?? [0, 0];
            $width = $dimensions[0] ?? $dimensions['width'] ?? 0;
            $height = $dimensions[1] ?? $dimensions['height'] ?? 0;

            // Calculer un score basé sur la différence avec les dimensions demandées
            $widthDiff = $maxWidth ? abs($width - $maxWidth) : 0;
            $heightDiff = $maxHeight ? abs($height - $maxHeight) : 0;
            $score = $widthDiff + $heightDiff;

            // Éviter les variantes trop grandes
            if (($maxWidth && $width > $maxWidth * 1.2) || 
                ($maxHeight && $height > $maxHeight * 1.2)) {
                continue;
            }

            if ($score < $bestScore) {
                $bestScore = $score;
                $bestVariant = $variant;
            }
        }

        return $bestVariant ?? reset($this->variants);
    }

    public function getMetadata(): array
    {
        return $this->metadata;
    }

    public function getType(): string
    {
        return $this->metadata['type'] ?? 'unknown';
    }

    public function getOriginalSize(): int
    {
        return $this->metadata['size'] ?? 0;
    }

    public function getTotalOptimizedSize(): int
    {
        return array_sum(array_column($this->variants, 'size'));
    }

    public function getCompressionRatio(): float
    {
        $originalSize = $this->getOriginalSize();
        $optimizedSize = $this->getTotalOptimizedSize();
        
        if ($originalSize === 0) {
            return 0.0;
        }

        return round((1 - ($optimizedSize / $originalSize)) * 100, 2);
    }

    public function getCreatedAt(): \DateTime
    {
        return $this->createdAt;
    }

    /**
     * Génère le HTML responsive pour ce média
     */
    public function toHtml(array $attributes = []): string
    {
        if ($this->getType() === 'image') {
            return $this->generateImageHtml($attributes);
        } elseif ($this->getType() === 'video') {
            return $this->generateVideoHtml($attributes);
        }

        return '';
    }

    private function generateImageHtml(array $attributes): string
    {
        $srcset = [];
        $sizes = ['thumbnail', 'medium', 'large', 'original'];

        foreach ($sizes as $size) {
            if ($variant = $this->getVariant($size)) {
                $dimensions = $variant['dimensions'];
                $width = $dimensions[0] ?? $dimensions['width'] ?? 0;
                $srcset[] = $variant['path'] . ' ' . $width . 'w';
            }
        }

        $defaultSrc = $this->getVariant('medium')['path'] ?? $this->getVariant('original')['path'] ?? '';
        $alt = $attributes['alt'] ?? '';
        $class = $attributes['class'] ?? '';

        $srcsetStr = implode(', ', $srcset);
        $sizesStr = $attributes['sizes'] ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

        return "<img src=\"{$defaultSrc}\" srcset=\"{$srcsetStr}\" sizes=\"{$sizesStr}\" alt=\"{$alt}\" class=\"{$class}\" loading=\"lazy\">";
    }

    private function generateVideoHtml(array $attributes): string
    {
        $sources = [];
        $sizes = ['mobile', 'standard', 'hd', 'fullhd'];

        foreach ($sizes as $size) {
            if ($variant = $this->getVariant($size)) {
                $dimensions = $variant['dimensions'];
                $width = $dimensions['width'] ?? 0;
                $sources[] = "<source src=\"{$variant['path']}\" media=\"(max-width: {$width}px)\">";
            }
        }

        $defaultSrc = $this->getVariant('standard')['path'] ?? $this->getVariant('mobile')['path'] ?? '';
        $class = $attributes['class'] ?? '';
        $controls = isset($attributes['controls']) ? 'controls' : '';
        $autoplay = isset($attributes['autoplay']) ? 'autoplay muted' : '';

        $sourcesStr = implode("\n", $sources);

        return "<video class=\"{$class}\" {$controls} {$autoplay} preload=\"metadata\">
            {$sourcesStr}
            <source src=\"{$defaultSrc}\">
            Votre navigateur ne supporte pas la lecture vidéo.
        </video>";
    }

    /**
     * Sérialise l'objet pour le cache
     */
    public function toArray(): array
    {
        return [
            'originalPath' => $this->originalPath,
            'variants' => $this->variants,
            'metadata' => $this->metadata,
            'createdAt' => $this->createdAt->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Crée un objet Media depuis un array (désérialisation)
     */
    public static function fromArray(array $data): self
    {
        $media = new self($data['originalPath'], $data['variants'], $data['metadata']);
        $media->createdAt = new \DateTime($data['createdAt']);
        return $media;
    }
}
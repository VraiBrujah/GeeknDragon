<?php

namespace GeeknDragon\Helpers;

use GeeknDragon\Core\Application;
use GeeknDragon\Services\MediaService;

/**
 * Helper centralisé pour l'affichage des médias optimisés
 * Élimine la duplication de code entre boutique et pages produits
 */
class MediaHelper
{
    private static ?MediaService $mediaService = null;

    /**
     * Initialise le service média
     */
    private static function getMediaService(): MediaService
    {
        if (self::$mediaService === null) {
            try {
                $app = Application::getInstance();
                self::$mediaService = $app->getService('media');
            } catch (\Exception $e) {
                // Fallback si l'application n'est pas disponible
                self::$mediaService = new MediaService();
            }
        }
        return self::$mediaService;
    }

    /**
     * Génère le HTML pour une image de produit avec optimisation
     */
    public static function renderProductImage(
        string $imagePath, 
        string $alt = '', 
        array $attributes = [],
        bool $enableLazyLoading = true
    ): string {
        $attributes = array_merge([
            'class' => 'product-media',
            'loading' => $enableLazyLoading ? 'lazy' : 'eager'
        ], $attributes);

        // Vérifier si c'est une vidéo
        if (self::isVideo($imagePath)) {
            return self::renderProductVideo($imagePath, $attributes);
        }

        // Tentative d'optimisation de l'image
        try {
            $fullPath = self::resolveImagePath($imagePath);
            
            if (file_exists($fullPath) && self::canOptimizeImages()) {
                $mediaService = self::getMediaService();
                $media = $mediaService->optimizeMedia($fullPath);
                
                return self::generateOptimizedImageHtml($media, $alt, $attributes);
            }
        } catch (\Exception $e) {
            // Log l'erreur mais continue avec l'image standard
            error_log("Erreur optimisation image {$imagePath}: " . $e->getMessage());
        }

        // Fallback vers image standard
        return self::generateStandardImageHtml($imagePath, $alt, $attributes);
    }

    /**
     * Génère le HTML pour une vidéo de produit
     */
    public static function renderProductVideo(string $videoPath, array $attributes = []): string
    {
        $defaultAttributes = [
            'class' => 'product-media',
            'autoplay' => true,
            'muted' => true,
            'loop' => true,
            'playsinline' => true
        ];

        $attributes = array_merge($defaultAttributes, $attributes);
        $attributeString = self::buildAttributeString($attributes);
        $safePath = htmlspecialchars('/' . ltrim($videoPath, '/'));

        return "<video src=\"{$safePath}\" {$attributeString}></video>";
    }

    /**
     * Génère le HTML pour une galerie de produit (page produit détaillée)
     */
    public static function renderProductGallery(array $images, string $productName = ''): string
    {
        if (empty($images)) {
            return '';
        }

        $firstImage = $images[0];
        $isFirstVideo = self::isVideo($firstImage);
        $safeProductName = htmlspecialchars($productName);

        $html = '<div class="product-gallery-container mb-6">';
        $html .= '<div class="main-image-container relative">';

        // Image/vidéo principale
        if ($isFirstVideo) {
            $html .= self::renderProductVideo($firstImage, [
                'class' => 'product-media main-product-media',
                'controls' => true,
                'data-no-gallery' => true,
                'autoplay' => false
            ]);
        } else {
            $html .= self::renderProductImage($firstImage, 
                "Geek & Dragon – {$safeProductName}", 
                [
                    'class' => 'product-media main-product-media',
                    'data-gallery' => 'product'
                ],
                false // Pas de lazy loading pour l'image principale
            );
        }

        $html .= '</div>';

        // Thumbnails si plusieurs images
        if (count($images) > 1) {
            $html .= '<div class="thumbnails-container">';
            $html .= '<div class="thumbnails-wrapper">';

            foreach ($images as $index => $img) {
                $isVideo = self::isVideo($img);
                $activeClass = $index === 0 ? 'active' : '';
                
                if ($isVideo) {
                    $html .= self::renderProductVideo($img, [
                        'class' => "thumbnail-media {$activeClass}",
                        'data-index' => $index,
                        'data-no-gallery' => true,
                        'autoplay' => false,
                        'loop' => false
                    ]);
                } else {
                    $html .= self::renderProductImage($img,
                        "Image " . ($index + 1) . " - {$safeProductName}",
                        [
                            'class' => "thumbnail-media {$activeClass}",
                            'data-index' => $index,
                            'data-gallery' => 'product'
                        ]
                    );
                }
            }

            $html .= '</div></div>';
        }

        $html .= '</div>';

        return $html;
    }

    /**
     * Génère le HTML optimisé pour une image avec variantes responsives
     */
    private static function generateOptimizedImageHtml($media, string $alt, array $attributes): string
    {
        $variants = $media->getVariants();
        $srcset = [];
        $sizes = ['thumbnail', 'medium', 'large', 'original'];

        // Construire le srcset
        foreach ($sizes as $size) {
            if ($variant = $media->getVariant($size)) {
                $dimensions = $variant['dimensions'];
                $width = is_array($dimensions) ? ($dimensions[0] ?? $dimensions['width'] ?? 0) : 0;
                if ($width > 0) {
                    $relativePath = str_replace(__DIR__ . '/../../', '', $variant['path']);
                    $srcset[] = "/{$relativePath} {$width}w";
                }
            }
        }

        // Image par défaut (medium ou original)
        $defaultVariant = $media->getBestVariant(800, 600);
        $defaultSrc = $defaultVariant ? str_replace(__DIR__ . '/../../', '', $defaultVariant['path']) : '';
        $defaultSrc = '/' . ltrim($defaultSrc, '/');

        // Sizes par défaut pour responsive
        $responsiveSizes = $attributes['sizes'] ?? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

        $attributesString = self::buildAttributeString(array_merge($attributes, [
            'src' => $defaultSrc,
            'srcset' => implode(', ', $srcset),
            'sizes' => $responsiveSizes,
            'alt' => $alt
        ]));

        return "<img {$attributesString}>";
    }

    /**
     * Génère le HTML standard pour une image (fallback)
     */
    private static function generateStandardImageHtml(string $imagePath, string $alt, array $attributes): string
    {
        $safePath = htmlspecialchars('/' . ltrim($imagePath, '/'));
        $safeAlt = htmlspecialchars($alt);
        
        $attributesString = self::buildAttributeString(array_merge($attributes, [
            'src' => $safePath,
            'alt' => $safeAlt
        ]));

        return "<img {$attributesString}>";
    }

    /**
     * Construit une chaîne d'attributs HTML
     */
    private static function buildAttributeString(array $attributes): string
    {
        $attributeParts = [];
        
        foreach ($attributes as $key => $value) {
            if (is_bool($value)) {
                if ($value) {
                    $attributeParts[] = htmlspecialchars($key);
                }
            } else {
                $safeKey = htmlspecialchars($key);
                $safeValue = htmlspecialchars((string)$value);
                $attributeParts[] = "{$safeKey}=\"{$safeValue}\"";
            }
        }

        return implode(' ', $attributeParts);
    }

    /**
     * Vérifie si un fichier est une vidéo
     */
    private static function isVideo(string $filePath): bool
    {
        return preg_match('/\.(mp4|webm|mov|avi)$/i', $filePath);
    }

    /**
     * Résout le chemin complet d'une image
     */
    private static function resolveImagePath(string $imagePath): string
    {
        $basePath = __DIR__ . '/../../';
        return $basePath . ltrim($imagePath, '/');
    }

    /**
     * Vérifie si l'optimisation d'images est possible
     */
    private static function canOptimizeImages(): bool
    {
        return extension_loaded('gd') && function_exists('imagecreatetruecolor');
    }

    /**
     * Génère le JavaScript pour la navigation de galerie
     */
    public static function renderGalleryScript(): string
    {
        return <<<'SCRIPT'
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Navigation des thumbnails
    const thumbnails = document.querySelectorAll('.thumbnail-media');
    const mainImage = document.querySelector('.main-product-media');
    
    if (thumbnails.length && mainImage) {
        thumbnails.forEach((thumb, index) => {
            thumb.addEventListener('click', function() {
                // Retirer la classe active de tous
                thumbnails.forEach(t => t.classList.remove('active'));
                // Ajouter active au thumbnail cliqué
                this.classList.add('active');
                
                // Changer l'image principale
                if (mainImage.tagName === 'IMG' && this.tagName === 'IMG') {
                    mainImage.src = this.src;
                    mainImage.alt = this.alt;
                    // Copier srcset si disponible
                    if (this.srcset) {
                        mainImage.srcset = this.srcset;
                    }
                } else if (mainImage.tagName === 'VIDEO' && this.tagName === 'VIDEO') {
                    mainImage.src = this.src;
                } else if (mainImage.tagName === 'IMG' && this.tagName === 'VIDEO') {
                    // Remplacer img par video
                    const newVideo = document.createElement('video');
                    newVideo.className = mainImage.className;
                    newVideo.src = this.src;
                    newVideo.controls = true;
                    newVideo.muted = true;
                    newVideo.playsInline = true;
                    newVideo.dataset.noGallery = true;
                    mainImage.parentNode.replaceChild(newVideo, mainImage);
                } else if (mainImage.tagName === 'VIDEO' && this.tagName === 'IMG') {
                    // Remplacer video par img
                    const newImg = document.createElement('img');
                    newImg.className = mainImage.className;
                    newImg.src = this.src;
                    newImg.alt = this.alt;
                    newImg.dataset.gallery = 'product';
                    // Copier srcset si disponible
                    if (this.srcset) {
                        newImg.srcset = this.srcset;
                    }
                    mainImage.parentNode.replaceChild(newImg, mainImage);
                    // Réappliquer la galerie
                    if (window.UniversalGallery) {
                        window.UniversalGallery.refresh();
                    }
                }
            });
        });
    }
});
</script>
SCRIPT;
    }

    /**
     * Génère les métadonnées d'image pour le SEO
     */
    public static function generateImageMetadata(string $imagePath, string $productName = '', string $host = 'geekndragon.com'): array
    {
        $imageUrl = 'https://' . $host . '/' . ltrim($imagePath, '/');
        
        // Tentative d'obtenir les dimensions optimisées
        try {
            $fullPath = self::resolveImagePath($imagePath);
            if (file_exists($fullPath) && self::canOptimizeImages()) {
                $mediaService = self::getMediaService();
                $media = $mediaService->optimizeMedia($fullPath);
                $bestVariant = $media->getBestVariant(1200, 630); // Format optimal pour OpenGraph
                
                if ($bestVariant) {
                    $dimensions = $bestVariant['dimensions'];
                    return [
                        'url' => $imageUrl,
                        'width' => is_array($dimensions) ? ($dimensions[0] ?? $dimensions['width'] ?? null) : null,
                        'height' => is_array($dimensions) ? ($dimensions[1] ?? $dimensions['height'] ?? null) : null,
                        'alt' => $productName
                    ];
                }
            }
        } catch (\Exception $e) {
            // Continue avec les valeurs par défaut
        }

        return [
            'url' => $imageUrl,
            'width' => null,
            'height' => null,
            'alt' => $productName
        ];
    }
}
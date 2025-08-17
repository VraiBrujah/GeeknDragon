<?php

namespace GeeknDragon\Helpers;

use GeeknDragon\Services\ModernMediaOptimizerService;
use GeeknDragon\Services\ModernVideoOptimizerService;

/**
 * Helper pour utiliser les médias optimisés modernes
 * Gère automatiquement les fallbacks WebP/AVIF + WebM/MP4
 */
class ModernMediaHelper
{
    private static string $optimizedBasePath = '/images/optimized-modern';
    
    /**
     * Rendu d'une image responsive moderne avec fallbacks
     */
    public static function renderImage(
        string $filename, 
        string $alt, 
        array $options = []
    ): string {
        // Nettoyer le nom de fichier (sans extension)
        $baseFilename = pathinfo($filename, PATHINFO_FILENAME);
        
        // Options par défaut
        $defaultOptions = [
            'class' => 'modern-responsive-image',
            'loading' => 'lazy',
            'sizes' => '100vw',
            'width' => null,
            'height' => null,
            'style' => '',
            'include_avif' => true, // Support AVIF activé par défaut
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        // Construire les attributs
        $attributes = [];
        if ($options['class']) $attributes[] = 'class="' . htmlspecialchars($options['class']) . '"';
        if ($options['loading']) $attributes[] = 'loading="' . htmlspecialchars($options['loading']) . '"';
        if ($options['width']) $attributes[] = 'width="' . htmlspecialchars($options['width']) . '"';
        if ($options['height']) $attributes[] = 'height="' . htmlspecialchars($options['height']) . '"';
        if ($options['style']) $attributes[] = 'style="' . htmlspecialchars($options['style']) . '"';
        if ($options['sizes']) $attributes[] = 'sizes="' . htmlspecialchars($options['sizes']) . '"';
        
        $attributeString = implode(' ', $attributes);
        
        // Générer le HTML avec fallbacks
        $html = '<picture>';
        
        // Source AVIF (support maximal)
        if ($options['include_avif']) {
            $html .= sprintf(
                '<source srcset="%s/avif/%s.avif" type="image/avif">',
                self::$optimizedBasePath,
                htmlspecialchars($baseFilename)
            );
        }
        
        // Source WebP (priorité)
        $html .= sprintf(
            '<source srcset="%s/webp/%s.webp" type="image/webp">',
            self::$optimizedBasePath,
            htmlspecialchars($baseFilename)
        );
        
        // Fallback PNG
        $html .= sprintf(
            '<img src="%s/png/%s.png" alt="%s" %s>',
            self::$optimizedBasePath,
            htmlspecialchars($baseFilename),
            htmlspecialchars($alt),
            $attributeString
        );
        
        $html .= '</picture>';
        
        return $html;
    }
    
    /**
     * Rendu d'une vidéo responsive moderne avec fallbacks
     */
    public static function renderVideo(
        string $filename,
        array $options = []
    ): string {
        $baseFilename = pathinfo($filename, PATHINFO_FILENAME);
        
        $defaultOptions = [
            'resolution' => '720p',
            'autoplay' => false,
            'loop' => false,
            'muted' => true,
            'controls' => true,
            'poster' => '',
            'class' => 'modern-responsive-video',
            'width' => '',
            'height' => '',
            'preload' => 'metadata'
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        // Construire les attributs vidéo
        $attributes = [];
        if ($options['class']) $attributes[] = 'class="' . htmlspecialchars($options['class']) . '"';
        if ($options['autoplay']) $attributes[] = 'autoplay';
        if ($options['loop']) $attributes[] = 'loop';
        if ($options['muted']) $attributes[] = 'muted';
        if ($options['controls']) $attributes[] = 'controls';
        if ($options['poster']) $attributes[] = 'poster="' . htmlspecialchars($options['poster']) . '"';
        if ($options['width']) $attributes[] = 'width="' . htmlspecialchars($options['width']) . '"';
        if ($options['height']) $attributes[] = 'height="' . htmlspecialchars($options['height']) . '"';
        if ($options['preload']) $attributes[] = 'preload="' . htmlspecialchars($options['preload']) . '"';
        
        $attributes[] = 'playsinline'; // Important pour mobile
        
        $attributeString = implode(' ', $attributes);
        $resolution = $options['resolution'];
        
        return sprintf(
            '<video %s>
                <source src="%s/webm/%s/%s.webm" type="video/webm">
                <source src="%s/mp4/%s/%s.mp4" type="video/mp4">
                <p>Votre navigateur ne supporte pas les vidéos HTML5.</p>
            </video>',
            $attributeString,
            self::$optimizedBasePath, $resolution, htmlspecialchars($baseFilename),
            self::$optimizedBasePath, $resolution, htmlspecialchars($baseFilename)
        );
    }
    
    /**
     * Rendu d'une galerie d'images optimisées
     */
    public static function renderImageGallery(array $images, string $productName, array $options = []): string
    {
        if (empty($images)) {
            return '';
        }
        
        $defaultOptions = [
            'class' => 'modern-image-gallery',
            'autoplay' => true,
            'autoplay_delay' => 4000, // ms
            'show_thumbnails' => true,
            'lazy_load' => true
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        $html = sprintf('<div class="%s" data-gallery="modern-product">', htmlspecialchars($options['class']));
        
        // Image principale
        $mainImage = $images[0];
        $html .= '<div class="main-image-container">';
        $html .= '<div class="main-image-wrapper">';
        $html .= self::renderImage(
            $mainImage,
            "Geek & Dragon – " . strip_tags($productName),
            [
                'class' => 'main-product-image',
                'loading' => 'eager', // Image principale chargée immédiatement
                'sizes' => '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px'
            ]
        );
        $html .= '</div></div>';
        
        // Vignettes si demandées et si plus d'une image
        if ($options['show_thumbnails'] && count($images) > 1) {
            $html .= '<div class="thumbnails-container">';
            $html .= '<div class="thumbnails-wrapper">';
            
            foreach ($images as $index => $image) {
                $html .= sprintf(
                    '<div class="thumbnail %s" data-index="%d">',
                    $index === 0 ? 'active' : '',
                    $index
                );
                
                $html .= self::renderImage(
                    $image,
                    "Image " . ($index + 1) . " - " . strip_tags($productName),
                    [
                        'class' => 'thumbnail-image',
                        'loading' => $options['lazy_load'] ? 'lazy' : 'eager',
                        'sizes' => '100px',
                        'include_avif' => false // Pas d'AVIF pour les miniatures
                    ]
                );
                
                $html .= '</div>';
            }
            
            $html .= '</div></div>';
        }
        
        $html .= '</div>';
        
        // JavaScript pour l'interactivité si demandé
        if ($options['autoplay'] || $options['show_thumbnails']) {
            $html .= self::generateGalleryJS($options);
        }
        
        return $html;
    }
    
    /**
     * Rendu d'une carte produit optimisée
     */
    public static function renderProductCard(array $product, string $lang = 'fr', array $options = []): string
    {
        $imagePath = $product['images'][0] ?? $product['img'] ?? '';
        if (empty($imagePath)) {
            return '';
        }
        
        $productName = $lang === 'en' ? ($product['name_en'] ?? $product['name']) : $product['name'];
        
        $defaultOptions = [
            'class' => 'product-card-image',
            'sizes' => '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 300px',
            'include_avif' => true
        ];
        
        $options = array_merge($defaultOptions, $options);
        
        return self::renderImage(
            $imagePath,
            strip_tags($productName),
            $options
        );
    }
    
    /**
     * Vérifie si une version optimisée existe
     */
    public static function hasOptimizedVersion(string $filename, string $format = 'webp'): bool
    {
        $baseFilename = pathinfo($filename, PATHINFO_FILENAME);
        $projectRoot = realpath(__DIR__ . '/../../');
        if (!$projectRoot) return false;
        
        $optimizedPath = $projectRoot . '/images/optimized-modern/' . $format . '/' . $baseFilename . '.' . $format;
        return file_exists($optimizedPath);
    }
    
    /**
     * Génère le CSS pour les médias modernes
     */
    public static function generateModernMediaCSS(): string
    {
        return '
        <style>
        /* Images responsives modernes */
        .modern-responsive-image {
            width: 100%;
            height: auto;
            object-fit: contain;
            object-position: center;
            transition: opacity 0.3s ease;
        }
        
        .modern-responsive-image[loading="lazy"] {
            opacity: 0;
        }
        
        .modern-responsive-image.loaded,
        .modern-responsive-image[loading="eager"] {
            opacity: 1;
        }
        
        /* Galerie d\'images moderne */
        .modern-image-gallery {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .main-image-container {
            display: flex;
            justify-content: center;
        }
        
        .main-image-wrapper {
            width: 100%;
            max-width: 600px;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .main-product-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            object-fit: contain;
        }
        
        /* Vignettes */
        .thumbnails-container {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
        }
        
        .thumbnails-wrapper {
            display: flex;
            gap: 0.75rem;
            overflow-x: auto;
            padding: 0.5rem;
            scroll-behavior: smooth;
        }
        
        .thumbnail {
            flex: 0 0 80px;
            width: 80px;
            height: 80px;
            border-radius: 0.5rem;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .thumbnail:hover {
            border-color: #3b82f6;
            transform: scale(1.05);
        }
        
        .thumbnail.active {
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        /* Vidéos responsives modernes */
        .modern-responsive-video {
            width: 100%;
            height: auto;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        /* Cartes produits */
        .product-card-image {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            object-fit: contain;
            border-radius: 0.5rem;
            transition: transform 0.3s ease;
        }
        
        .product-card-image:hover {
            transform: scale(1.02);
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .thumbnail {
                flex: 0 0 60px;
                width: 60px;
                height: 60px;
            }
            
            .thumbnails-wrapper {
                gap: 0.5rem;
            }
        }
        
        @media (min-width: 1024px) {
            .modern-image-gallery {
                flex-direction: row;
                align-items: flex-start;
                gap: 2rem;
            }
            
            .main-image-container {
                flex: 1;
            }
            
            .thumbnails-container {
                flex: 0 0 100px;
                margin-top: 0;
            }
            
            .thumbnails-wrapper {
                flex-direction: column;
                overflow-x: hidden;
                overflow-y: auto;
                max-height: 400px;
            }
            
            .thumbnail {
                width: 80px;
                height: 80px;
            }
        }
        
        /* Optimisations performance */
        .modern-responsive-image,
        .modern-responsive-video {
            will-change: transform, opacity;
            transform: translateZ(0);
            backface-visibility: hidden;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .modern-responsive-image,
            .thumbnail,
            .product-card-image {
                transition: none;
            }
        }
        </style>';
    }
    
    /**
     * Génère le JavaScript pour les galeries
     */
    private static function generateGalleryJS(array $options): string
    {
        $autoplayDelay = $options['autoplay_delay'] ?? 4000;
        
        return "
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Lazy loading pour les images modernes
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    });
                }, { rootMargin: '50px 0px' });
                
                document.querySelectorAll('.modern-responsive-image[loading=\"lazy\"]').forEach(img => {
                    img.addEventListener('load', () => img.classList.add('loaded'));
                    imageObserver.observe(img);
                });
            }
            
            // Navigation galerie moderne avec autoplay
            const modernGalleries = document.querySelectorAll('.modern-image-gallery');
            modernGalleries.forEach(gallery => {
                const thumbnails = gallery.querySelectorAll('.thumbnail');
                const mainImage = gallery.querySelector('.main-product-image');
                let currentIndex = 0;
                let autoplayInterval;
                
                if (thumbnails.length > 0 && mainImage) {
                    // Navigation manuelle
                    thumbnails.forEach((thumbnail, index) => {
                        thumbnail.addEventListener('click', () => {
                            clearInterval(autoplayInterval);
                            switchToImage(index);
                            if ({$autoplayDelay} > 0) startAutoplay();
                        });
                    });
                    
                    // Fonction de changement d'image
                    function switchToImage(index) {
                        thumbnails.forEach(t => t.classList.remove('active'));
                        thumbnails[index].classList.add('active');
                        
                        const thumbnailImg = thumbnails[index].querySelector('picture img, img');
                        if (thumbnailImg) {
                            // Extraire le nom de base du fichier
                            const src = thumbnailImg.src;
                            const baseFilename = src.split('/').pop().split('.')[0];
                            
                            // Mettre à jour toutes les sources de l'image principale
                            const mainPicture = mainImage.closest('picture');
                            if (mainPicture) {
                                const avifSource = mainPicture.querySelector('source[type=\"image/avif\"]');
                                const webpSource = mainPicture.querySelector('source[type=\"image/webp\"]');
                                
                                if (avifSource) {
                                    avifSource.srcset = '/images/optimized-modern/avif/' + baseFilename + '.avif';
                                }
                                if (webpSource) {
                                    webpSource.srcset = '/images/optimized-modern/webp/' + baseFilename + '.webp';
                                }
                                mainImage.src = '/images/optimized-modern/png/' + baseFilename + '.png';
                            }
                        }
                        
                        currentIndex = index;
                    }
                    
                    // Autoplay
                    function startAutoplay() {
                        if (thumbnails.length <= 1 || {$autoplayDelay} <= 0) return;
                        
                        autoplayInterval = setInterval(() => {
                            currentIndex = (currentIndex + 1) % thumbnails.length;
                            switchToImage(currentIndex);
                        }, {$autoplayDelay});
                    }
                    
                    // Pause autoplay au survol
                    gallery.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
                    gallery.addEventListener('mouseleave', () => {
                        if ({$autoplayDelay} > 0) startAutoplay();
                    });
                    
                    // Démarrer l'autoplay si activé
                    if (thumbnails.length > 1 && {$autoplayDelay} > 0) {
                        setTimeout(startAutoplay, 2000);
                    }
                }
            });
        });
        </script>";
    }
}
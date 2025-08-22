<?php
declare(strict_types=1);

namespace GeeknDragon\Performance;

/**
 * 🚀 HEADERS DE PERFORMANCE OPTIMISÉS - GEEKNDRAGON
 * Gestion intelligente des headers HTTP pour performance maximale
 */
class PerformanceHeaders
{
    private static bool $headersSent = false;
    
    /**
     * Headers pour ressources statiques (CSS, JS, images)
     */
    public static function setStaticResourceHeaders(string $contentType, int $maxAge = 31536000): void
    {
        if (self::$headersSent) return;
        
        // Cache agressif pour ressources avec versioning
        header("Content-Type: {$contentType}");
        header("Cache-Control: public, max-age={$maxAge}, immutable");
        header("Expires: " . gmdate('D, d M Y H:i:s', time() + $maxAge) . ' GMT');
        
        // Headers de performance avancés
        header("Vary: Accept-Encoding");
        header("X-Content-Type-Options: nosniff");
        
        // ETag optimisé basé sur la modification du fichier
        $etag = md5(filemtime($_SERVER['SCRIPT_FILENAME'] ?? __FILE__));
        header("ETag: \"$etag\"");
        
        // Gérer les requêtes conditionnelles
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && 
            trim($_SERVER['HTTP_IF_NONE_MATCH'], '"') === $etag) {
            http_response_code(304);
            exit;
        }
        
        // Compression intelligente
        if (extension_loaded('zlib') && !ob_get_level() && 
            !str_contains($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'br')) {
            ob_start('ob_gzhandler');
        }
        
        self::$headersSent = true;
    }

    /**
     * Headers pour pages dynamiques avec cache intelligent
     */
    public static function setDynamicPageHeaders(int $maxAge = 3600, bool $mustRevalidate = true): void
    {
        if (self::$headersSent) return;
        
        $cacheControl = "public, max-age={$maxAge}";
        if ($mustRevalidate) {
            $cacheControl .= ", must-revalidate";
        }
        
        header("Cache-Control: {$cacheControl}");
        header("Vary: Accept-Encoding, Accept-Language");
        
        // ETag pour validation cache
        $etag = '"' . md5($_SERVER['REQUEST_URI'] . filemtime(__FILE__)) . '"';
        header("ETag: {$etag}");
        
        // Vérifier If-None-Match
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && 
            $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
            http_response_code(304);
            exit;
        }
        
        self::setCommonPerformanceHeaders();
    }

    /**
     * Headers pour API et données JSON
     */
    public static function setApiHeaders(int $maxAge = 300): void
    {
        if (self::$headersSent) return;
        
        header("Content-Type: application/json; charset=utf-8");
        header("Cache-Control: public, max-age={$maxAge}");
        header("Access-Control-Max-Age: 86400");
        
        // CORS optimisé pour performance
        $allowedOrigins = ['https://geekndragon.com', 'https://www.geekndragon.com'];
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        if (in_array($origin, $allowedOrigins)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header("Access-Control-Allow-Credentials: true");
        }
        
        self::setCommonPerformanceHeaders();
    }

    /**
     * Headers spéciaux pour images WebP avec fallback
     */
    public static function setImageHeaders(string $imagePath, bool $isWebP = false): void
    {
        if (self::$headersSent) return;
        
        $mimeType = $isWebP ? 'image/webp' : mime_content_type($imagePath);
        $lastModified = filemtime($imagePath);
        
        header("Content-Type: {$mimeType}");
        header("Last-Modified: " . gmdate('D, d M Y H:i:s', $lastModified) . ' GMT');
        header("Cache-Control: public, max-age=31536000, immutable");
        
        // Optimisations spécifiques images
        header("Accept-Ranges: bytes");
        
        // Support WebP conditionnel
        if ($isWebP) {
            header("Vary: Accept");
        }
        
        self::$headersSent = true;
    }

    /**
     * Headers pour vidéos avec streaming optimisé
     */
    public static function setVideoHeaders(string $videoPath): void
    {
        if (self::$headersSent) return;
        
        header("Content-Type: video/mp4");
        header("Accept-Ranges: bytes");
        header("Cache-Control: public, max-age=86400");
        
        $fileSize = filesize($videoPath);
        
        // Support du streaming par chunks
        if (isset($_SERVER['HTTP_RANGE'])) {
            self::handleRangeRequest($videoPath, $fileSize);
        } else {
            header("Content-Length: {$fileSize}");
        }
        
        self::$headersSent = true;
    }

    /**
     * Headers pour fonts avec cache très long
     */
    public static function setFontHeaders(): void
    {
        if (self::$headersSent) return;
        
        header("Cache-Control: public, max-age=31536000, immutable");
        header("Access-Control-Allow-Origin: *");
        
        // Preload hint pour fonts critiques
        if (!headers_sent()) {
            header("Link: </css/fonts/cinzel.woff2>; rel=preload; as=font; type=font/woff2; crossorigin");
        }
        
        self::$headersSent = true;
    }

    /**
     * Headers de sécurité et performance combinés
     */
    private static function setCommonPerformanceHeaders(): void
    {
        // Compression
        if (extension_loaded('zlib') && !ob_get_level()) {
            ob_start('ob_gzhandler');
        }
        
        // DNS prefetch pour domaines tiers
        header("Link: <//fonts.googleapis.com>; rel=dns-prefetch");
        header("Link: <//www.google-analytics.com>; rel=dns-prefetch", false);
        
        // Security headers optimisés
        header("X-Frame-Options: SAMEORIGIN");
        header("X-Content-Type-Options: nosniff");
        header("Referrer-Policy: strict-origin-when-cross-origin");
        
        // Performance hints
        header("Timing-Allow-Origin: *");
        
        self::$headersSent = true;
    }

    /**
     * Gestion des requêtes Range pour streaming vidéo
     */
    private static function handleRangeRequest(string $filePath, int $fileSize): void
    {
        $range = $_SERVER['HTTP_RANGE'];
        
        if (preg_match('/bytes=(\d+)-(\d+)?/', $range, $matches)) {
            $start = intval($matches[1]);
            $end = isset($matches[2]) ? intval($matches[2]) : $fileSize - 1;
            
            $length = $end - $start + 1;
            
            http_response_code(206);
            header("Content-Range: bytes {$start}-{$end}/{$fileSize}");
            header("Content-Length: {$length}");
            
            $file = fopen($filePath, 'rb');
            fseek($file, $start);
            echo fread($file, $length);
            fclose($file);
            exit;
        }
    }

    /**
     * Preloading hints intelligent pour ressources critiques
     */
    public static function addCriticalResourceHints(): void
    {
        if (headers_sent()) return;
        
        $hints = [
            // CSS critique
            "</css/styles.css>; rel=preload; as=style",
            "</css/jdr-micro-interactions.css>; rel=preload; as=style",
            
            // JS critique
            "</js/jdr-interactions.js>; rel=preload; as=script",
            
            // Images hero
            "</images/optimized-modern/webp/brand-geekndragon-main.webp>; rel=preload; as=image",
            
            // Fonts
            "</css/fonts/cinzel.woff2>; rel=preload; as=font; type=font/woff2; crossorigin",
        ];
        
        foreach ($hints as $hint) {
            header("Link: {$hint}", false);
        }
    }

    /**
     * Headers pour Service Worker et PWA
     */
    public static function setPWAHeaders(): void
    {
        if (self::$headersSent) return;
        
        header("Service-Worker-Allowed: /");
        
        // Manifest
        header("Link: </manifest.json>; rel=manifest", false);
        
        // Theme color
        header("Theme-Color: #8b5cf6", false);
        
        self::$headersSent = true;
    }

    /**
     * Monitoring des performances avec Server-Timing
     */
    public static function addServerTiming(array $timings): void
    {
        if (headers_sent()) return;
        
        $serverTimingParts = [];
        
        foreach ($timings as $name => $duration) {
            $serverTimingParts[] = "{$name};dur={$duration}";
        }
        
        if (!empty($serverTimingParts)) {
            header("Server-Timing: " . implode(', ', $serverTimingParts));
        }
    }

    /**
     * Reset pour tests
     */
    public static function reset(): void
    {
        self::$headersSent = false;
    }
}
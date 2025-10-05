<?php
/**
 * Cache Markdown optimisé - Standards v2.1.0
 * 
 * Système de cache haute performance pour conversions Markdown vers HTML/texte.
 * Évite les conversions répétitives avec cache mémoire + fichier pour optimiser
 * les temps de réponse des pages produits et descriptions.
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0
 * @since 1.0.0
 * @category Cache
 * @package GeeknDragon\Includes
 */

class MarkdownCache {
    /** @var array Cache en mémoire pour accès ultra-rapide */
    private static $memoryCache = [];
    
    /** @var string Répertoire de stockage du cache sur disque */
    private static $cacheDir = __DIR__ . '/../cache/markdown/';
    
    /** @var Parsedown|null Instance du parseur Markdown */
    private static $parsedown = null;
    
    /**
     * Initialise le système de cache Markdown
     * 
     * Crée le répertoire de cache et configure l'instance Parsedown
     * avec les paramètres de sécurité appropriés.
     * 
     * @return void
     * @throws Exception Si impossible de créer le répertoire de cache
     */
    public static function init(): void {
        if (!is_dir(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }
        
        if (self::$parsedown === null) {
            require_once __DIR__ . '/../vendor/erusev/parsedown/Parsedown.php';
            self::$parsedown = new Parsedown();
            self::$parsedown->setSafeMode(true);
        }
    }
    
    /**
     * Convertit le Markdown en HTML avec cache
     * 
     * @param string $markdown Le contenu Markdown
     * @param string $cacheKey Clé de cache unique (optionnel)
     * @return string HTML généré
     */
    public static function convertToHtml(string $markdown, string $cacheKey = null): string {
        if (empty($markdown)) {
            return '';
        }
        
        self::init();
        
        // Génère une clé de cache basée sur le contenu si non fournie
        if ($cacheKey === null) {
            $cacheKey = 'md_' . md5($markdown);
        }
        
        // Vérification du cache mémoire (plus rapide)
        if (isset(self::$memoryCache[$cacheKey])) {
            return self::$memoryCache[$cacheKey];
        }
        
        // Vérification du cache fichier
        $cacheFile = self::$cacheDir . $cacheKey . '.html';
        if (file_exists($cacheFile)) {
            $cachedHtml = file_get_contents($cacheFile);
            if ($cachedHtml !== false) {
                self::$memoryCache[$cacheKey] = $cachedHtml;
                return $cachedHtml;
            }
        }
        
        // Conversion et mise en cache
        $html = self::$parsedown->text($markdown);
        
        // Stockage en mémoire
        self::$memoryCache[$cacheKey] = $html;
        
        // Stockage sur disque (async pour ne pas ralentir)
        self::saveToCacheAsync($cacheFile, $html);
        
        return $html;
    }
    
    /**
     * Sauvegarde asynchrone en cache (non bloquante)
     */
    private static function saveToCacheAsync(string $cacheFile, string $content): void {
        // Écriture non bloquante pour ne pas ralentir la réponse
        if (function_exists('fastcgi_finish_request')) {
            register_shutdown_function(function() use ($cacheFile, $content) {
                file_put_contents($cacheFile, $content, LOCK_EX);
            });
        } else {
            // Fallback direct
            file_put_contents($cacheFile, $content, LOCK_EX);
        }
    }
    
    /**
     * Convertit le Markdown en texte brut (pour les résumés)
     * Version optimisée avec cache
     */
    public static function convertToPlainText(string $markdown, string $cacheKey = null): string {
        if (empty($markdown)) {
            return '';
        }
        
        // Clé de cache distincte pour le texte brut
        if ($cacheKey === null) {
            $cacheKey = 'txt_' . md5($markdown);
        } else {
            $cacheKey = 'txt_' . $cacheKey;
        }
        
        // Vérification cache mémoire
        if (isset(self::$memoryCache[$cacheKey])) {
            return self::$memoryCache[$cacheKey];
        }
        
        // Vérification cache fichier
        self::init();
        $cacheFile = self::$cacheDir . $cacheKey . '.txt';
        if (file_exists($cacheFile)) {
            $cachedText = file_get_contents($cacheFile);
            if ($cachedText !== false) {
                self::$memoryCache[$cacheKey] = $cachedText;
                return $cachedText;
            }
        }
        
        // Conversion optimisée
        $text = self::processMarkdownToText($markdown);
        
        // Mise en cache
        self::$memoryCache[$cacheKey] = $text;
        self::saveToCacheAsync($cacheFile, $text);
        
        return $text;
    }
    
    /**
     * Traitement optimisé Markdown vers texte brut
     */
    private static function processMarkdownToText(string $value): string {
        $text = str_replace(["\r\n", "\r"], "\n", $value);
        
        // Optimisation: traitement en une seule passe avec preg_replace_callback
        $text = preg_replace([
            '/^\s{0,3}#{1,6}\s*/mu',     // Headers
            '/^\s{0,3}>\s?/mu',          // Blockquotes
            '/^\s{0,3}[-*+]\s+/mu',      // Lists
            '/!\[(.*?)\]\((.*?)\)/u',    // Images
            '/\[(.*?)\]\((.*?)\)/u',     // Links
            '/(`{1,3})(.+?)\1/u',        // Code
            '/([*_~]{1,2})(.+?)\1/u',    // Emphasis
            '/\s+/u'                     // Whitespace
        ], [
            '',
            '',
            '',
            '$1',
            '$1',
            '$2',
            '$2',
            ' '
        ], $text) ?? $text;
        
        $text = strip_tags($text);
        $text = trim($text);
        
        return $text !== '' ? $text : trim(strip_tags($value));
    }
    
    /**
     * Nettoie le cache (utile pour maintenance)
     */
    public static function clearCache(): void {
        self::$memoryCache = [];
        
        if (is_dir(self::$cacheDir)) {
            $files = glob(self::$cacheDir . '*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }
    
    /**
     * Statistiques du cache pour debug
     */
    public static function getCacheStats(): array {
        $memoryCount = count(self::$memoryCache);
        $diskCount = 0;
        
        if (is_dir(self::$cacheDir)) {
            $diskCount = count(glob(self::$cacheDir . '*.{html,txt}', GLOB_BRACE));
        }
        
        return [
            'memory_entries' => $memoryCount,
            'disk_entries' => $diskCount,
            'cache_dir' => self::$cacheDir
        ];
    }
}

/**
 * Fonction de compatibilité pour remplacer convertMarkdownToHtml
 */
function convertMarkdownToHtml(string $markdown): string {
    return MarkdownCache::convertToHtml($markdown);
}

/**
 * Fonction optimisée pour conversion en texte brut
 */
function convertMarkdownToPlainText(string $markdown): string {
    return MarkdownCache::convertToPlainText($markdown);
}
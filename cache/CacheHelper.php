<?php
/**
 * Helper de cache pour Geek & Dragon
 * Fonctions utilitaires pour la mise en cache
 */

require_once __DIR__ . '/CacheManager.php';

class CacheHelper
{
    private static ?CacheManager $instance = null;
    
    /**
     * Obtient l'instance singleton du cache
     */
    public static function getInstance(): CacheManager
    {
        if (self::$instance === null) {
            $cacheDir = __DIR__ . '/storage';
            $config = [
                'default_ttl' => 3600, // 1 heure
                'serialize' => true,
                'compress' => true, // Activé pour économiser l'espace
            ];
            
            self::$instance = new CacheManager($cacheDir, $config);
        }
        
        return self::$instance;
    }
    
    /**
     * Cache les données de produits
     */
    public static function cacheProducts(array $products, int $ttl = 3600): bool
    {
        return self::getInstance()->set('products_data', $products, $ttl);
    }
    
    /**
     * Récupère les données de produits en cache
     */
    public static function getCachedProducts(): ?array
    {
        return self::getInstance()->get('products_data');
    }
    
    /**
     * Cache les traductions
     */
    public static function cacheTranslations(string $lang, array $translations, int $ttl = 86400): bool
    {
        return self::getInstance()->set("translations_{$lang}", $translations, $ttl);
    }
    
    /**
     * Récupère les traductions en cache
     */
    public static function getCachedTranslations(string $lang): ?array
    {
        return self::getInstance()->get("translations_{$lang}");
    }
    
    /**
     * Cache les données de stock Snipcart
     */
    public static function cacheStock(array $stockData, int $ttl = 300): bool
    {
        return self::getInstance()->set('snipcart_stock', $stockData, $ttl);
    }
    
    /**
     * Récupère les données de stock en cache
     */
    public static function getCachedStock(): ?array
    {
        return self::getInstance()->get('snipcart_stock');
    }
    
    /**
     * Cache le stock d'un produit spécifique
     */
    public static function cacheProductStock(string $productId, ?int $stock, int $ttl = 300): bool
    {
        return self::getInstance()->set("stock_{$productId}", $stock, $ttl);
    }
    
    /**
     * Récupère le stock d'un produit en cache
     */
    public static function getCachedProductStock(string $productId): ?int
    {
        return self::getInstance()->get("stock_{$productId}");
    }
    
    /**
     * Cache le rendu d'une page ou d'un fragment
     */
    public static function cachePageFragment(string $key, string $html, int $ttl = 1800): bool
    {
        return self::getInstance()->set("page_fragment_{$key}", $html, $ttl);
    }
    
    /**
     * Récupère un fragment de page en cache
     */
    public static function getCachedPageFragment(string $key): ?string
    {
        return self::getInstance()->get("page_fragment_{$key}");
    }
    
    /**
     * Mise en cache avec génération automatique
     */
    public static function remember(string $key, callable $callback, int $ttl = 3600)
    {
        return self::getInstance()->remember($key, $callback, $ttl);
    }
    
    /**
     * Invalide le cache des produits
     */
    public static function invalidateProducts(): void
    {
        $cache = self::getInstance();
        $cache->delete('products_data');
        
        // Nettoie aussi les fragments de pages produits
        $stats = $cache->getStats();
        // Simple cleanup basé sur pattern
        $cache->cleanup();
    }
    
    /**
     * Invalide le cache de stock
     */
    public static function invalidateStock(): void
    {
        $cache = self::getInstance();
        $cache->delete('snipcart_stock');
        
        // Pattern pour supprimer tous les stocks individuels
        // Simplified: on fait un cleanup général
        $cache->cleanup();
    }
    
    /**
     * Nettoie tout le cache expiré
     */
    public static function cleanup(): int
    {
        return self::getInstance()->cleanup();
    }
    
    /**
     * Obtient les statistiques du cache
     */
    public static function getStats(): array
    {
        $stats = self::getInstance()->getStats();
        $stats['size_mb'] = round($stats['total_size'] / 1024 / 1024, 2);
        return $stats;
    }
    
    /**
     * Génère une clé de cache basée sur plusieurs paramètres
     */
    public static function generateKey(string $prefix, ...$params): string
    {
        $key = $prefix;
        foreach ($params as $param) {
            if (is_array($param) || is_object($param)) {
                $key .= '_' . md5(serialize($param));
            } else {
                $key .= '_' . $param;
            }
        }
        return $key;
    }
    
    /**
     * Cache conditionnel basé sur l'environnement
     */
    public static function shouldCache(): bool
    {
        // Ne pas cacher en développement si DEBUG est activé
        if (defined('DEBUG') && DEBUG) {
            return false;
        }
        
        // Ne pas cacher si on force le refresh
        if (isset($_GET['no_cache']) || isset($_GET['refresh'])) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Wrapper pour mise en cache conditionnelle
     */
    public static function conditionalCache(string $key, callable $callback, int $ttl = 3600)
    {
        if (!self::shouldCache()) {
            return $callback();
        }
        
        return self::remember($key, $callback, $ttl);
    }
}
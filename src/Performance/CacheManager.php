<?php
declare(strict_types=1);

namespace GeeknDragon\Performance;

/**
 * 🚀 GESTIONNAIRE DE CACHE INTELLIGENT - GEEKNDRAGON
 * Cache multi-niveaux avec invalidation intelligente
 */
class CacheManager
{
    private string $cacheDir;
    private int $defaultTtl;
    private array $stats = ['hits' => 0, 'misses' => 0, 'writes' => 0];
    
    public function __construct(string $cacheDir = null, int $defaultTtl = 3600)
    {
        $this->cacheDir = $cacheDir ?? (__DIR__ . '/../../storage/cache');
        $this->defaultTtl = $defaultTtl;
        $this->ensureCacheDirectory();
    }

    /**
     * Cache avec stratégies différenciées par type de contenu
     */
    public function get(string $key, string $type = 'default'): mixed
    {
        $filePath = $this->getCacheFilePath($key, $type);
        
        if (!file_exists($filePath)) {
            $this->stats['misses']++;
            return null;
        }

        $data = unserialize(file_get_contents($filePath));
        
        // Vérifier l'expiration
        if ($data['expires'] < time()) {
            unlink($filePath);
            $this->stats['misses']++;
            return null;
        }

        $this->stats['hits']++;
        return $data['value'];
    }

    /**
     * Mise en cache avec TTL adaptatif selon le type
     */
    public function set(string $key, mixed $value, string $type = 'default', int $ttl = null): bool
    {
        $ttl = $ttl ?? $this->getOptimalTtl($type);
        $filePath = $this->getCacheFilePath($key, $type);
        
        $data = [
            'value' => $value,
            'expires' => time() + $ttl,
            'created' => time(),
            'type' => $type,
            'size' => strlen(serialize($value))
        ];

        $result = file_put_contents($filePath, serialize($data), LOCK_EX) !== false;
        
        if ($result) {
            $this->stats['writes']++;
        }
        
        return $result;
    }

    /**
     * Cache avec callback pour génération automatique
     */
    public function remember(string $key, callable $callback, string $type = 'default', int $ttl = null): mixed
    {
        $cached = $this->get($key, $type);
        
        if ($cached !== null) {
            return $cached;
        }

        $value = $callback();
        $this->set($key, $value, $type, $ttl);
        
        return $value;
    }

    /**
     * Cache pour les produits avec invalidation sur stock change
     */
    public function cacheProduct(string $productId, array $productData): bool
    {
        $key = "product:{$productId}";
        return $this->set($key, $productData, 'products', 7200); // 2h
    }

    /**
     * Cache pour les images optimisées
     */
    public function cacheImage(string $imagePath, string $optimizedData): bool
    {
        $key = "image:" . md5($imagePath);
        return $this->set($key, $optimizedData, 'images', 86400); // 24h
    }

    /**
     * Cache pour les traductions
     */
    public function cacheTranslations(string $lang, array $translations): bool
    {
        $key = "translations:{$lang}";
        return $this->set($key, $translations, 'i18n', 3600); // 1h
    }

    /**
     * Cache pour les résultats de recherche
     */
    public function cacheSearch(string $query, array $results): bool
    {
        $key = "search:" . md5(strtolower($query));
        return $this->set($key, $results, 'search', 1800); // 30min
    }

    /**
     * Invalidation intelligente par pattern
     */
    public function invalidate(string $pattern): int
    {
        $deleted = 0;
        $cacheFiles = glob($this->cacheDir . '/*/*.cache');
        
        foreach ($cacheFiles as $file) {
            $key = basename($file, '.cache');
            if (fnmatch($pattern, $key)) {
                unlink($file);
                $deleted++;
            }
        }
        
        return $deleted;
    }

    /**
     * Invalidation par type
     */
    public function invalidateType(string $type): int
    {
        $typeDir = $this->cacheDir . '/' . $type;
        if (!is_dir($typeDir)) {
            return 0;
        }

        $deleted = 0;
        $files = glob($typeDir . '/*.cache');
        
        foreach ($files as $file) {
            unlink($file);
            $deleted++;
        }
        
        return $deleted;
    }

    /**
     * Nettoyage automatique des caches expirés
     */
    public function cleanup(): array
    {
        $stats = ['deleted' => 0, 'space_freed' => 0];
        $cacheFiles = glob($this->cacheDir . '/*/*.cache');
        
        foreach ($cacheFiles as $file) {
            if (!file_exists($file)) continue;
            
            $data = unserialize(file_get_contents($file));
            
            if ($data['expires'] < time()) {
                $stats['space_freed'] += filesize($file);
                unlink($file);
                $stats['deleted']++;
            }
        }
        
        return $stats;
    }

    /**
     * Statistiques de performance du cache
     */
    public function getStats(): array
    {
        $hitRate = $this->stats['hits'] + $this->stats['misses'] > 0 
            ? round(($this->stats['hits'] / ($this->stats['hits'] + $this->stats['misses'])) * 100, 2)
            : 0;

        return [
            'hits' => $this->stats['hits'],
            'misses' => $this->stats['misses'],
            'writes' => $this->stats['writes'],
            'hit_rate' => $hitRate,
            'cache_size' => $this->getCacheSize(),
            'file_count' => $this->getCacheFileCount()
        ];
    }

    /**
     * Préchargement intelligent des caches critiques
     */
    public function warmup(): array
    {
        $warmed = [];
        
        // Préchauffer les produits populaires
        $popularProducts = ['lot10', 'lot25', 'pack-182-arsenal-aventurier'];
        foreach ($popularProducts as $productId) {
            $key = "product:{$productId}";
            if ($this->get($key, 'products') === null) {
                // Simuler le chargement du produit
                $this->set($key, ['id' => $productId, 'preloaded' => true], 'products');
                $warmed[] = $key;
            }
        }
        
        // Préchauffer les traductions
        foreach (['fr', 'en'] as $lang) {
            $key = "translations:{$lang}";
            if ($this->get($key, 'i18n') === null) {
                $this->set($key, ['lang' => $lang, 'preloaded' => true], 'i18n');
                $warmed[] = $key;
            }
        }
        
        return $warmed;
    }

    private function getCacheFilePath(string $key, string $type): string
    {
        $typeDir = $this->cacheDir . '/' . $type;
        if (!is_dir($typeDir)) {
            mkdir($typeDir, 0755, true);
        }
        
        return $typeDir . '/' . md5($key) . '.cache';
    }

    private function getOptimalTtl(string $type): int
    {
        return match($type) {
            'products' => 7200,     // 2h - changent avec le stock
            'images' => 86400,      // 24h - statiques
            'i18n' => 3600,        // 1h - peuvent être mises à jour
            'search' => 1800,      // 30min - résultats dynamiques
            'pages' => 1800,       // 30min - contenu semi-statique
            'analytics' => 300,     // 5min - données temps réel
            default => $this->defaultTtl
        };
    }

    private function ensureCacheDirectory(): void
    {
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }

    private function getCacheSize(): string
    {
        $bytes = 0;
        $cacheFiles = glob($this->cacheDir . '/*/*.cache');
        
        foreach ($cacheFiles as $file) {
            $bytes += filesize($file);
        }
        
        return $this->formatBytes($bytes);
    }

    private function getCacheFileCount(): int
    {
        return count(glob($this->cacheDir . '/*/*.cache'));
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
<?php
/**
 * Gestionnaire de cache simple et efficace
 * Geek & Dragon - Cache Manager
 */

class CacheManager
{
    private string $cacheDir;
    private array $config;
    
    public function __construct(string $cacheDir = null, array $config = [])
    {
        $this->cacheDir = $cacheDir ?: __DIR__ . '/storage';
        $this->config = array_merge([
            'default_ttl' => 3600, // 1 heure par défaut
            'serialize' => true,
            'compress' => false,
        ], $config);
        
        $this->ensureCacheDir();
    }
    
    /**
     * Récupère une valeur du cache
     */
    public function get(string $key, $default = null)
    {
        $file = $this->getFilePath($key);
        
        if (!file_exists($file)) {
            return $default;
        }
        
        $data = file_get_contents($file);
        if ($data === false) {
            return $default;
        }
        
        // Décompression si activée
        if ($this->config['compress']) {
            $data = gzuncompress($data);
            if ($data === false) {
                return $default;
            }
        }
        
        $cached = json_decode($data, true);
        if (!$cached || !isset($cached['expires_at'], $cached['data'])) {
            return $default;
        }
        
        // Vérifier l'expiration
        if ($cached['expires_at'] < time()) {
            $this->delete($key);
            return $default;
        }
        
        $value = $cached['data'];
        
        // Désérialisation si nécessaire
        if ($this->config['serialize'] && isset($cached['serialized']) && $cached['serialized']) {
            $value = unserialize($value);
        }
        
        return $value;
    }
    
    /**
     * Stocke une valeur dans le cache
     */
    public function set(string $key, $value, int $ttl = null): bool
    {
        $ttl = $ttl ?? $this->config['default_ttl'];
        $expiresAt = time() + $ttl;
        
        $serialized = false;
        if ($this->config['serialize'] && !is_string($value)) {
            $value = serialize($value);
            $serialized = true;
        }
        
        $data = json_encode([
            'expires_at' => $expiresAt,
            'data' => $value,
            'serialized' => $serialized,
            'created_at' => time(),
        ]);
        
        // Compression si activée
        if ($this->config['compress']) {
            $data = gzcompress($data);
        }
        
        $file = $this->getFilePath($key);
        $this->ensureFileDir($file);
        
        return file_put_contents($file, $data, LOCK_EX) !== false;
    }
    
    /**
     * Supprime une entrée du cache
     */
    public function delete(string $key): bool
    {
        $file = $this->getFilePath($key);
        
        if (file_exists($file)) {
            return unlink($file);
        }
        
        return true;
    }
    
    /**
     * Vérifie si une clé existe dans le cache
     */
    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }
    
    /**
     * Récupère ou génère une valeur mise en cache
     */
    public function remember(string $key, callable $callback, int $ttl = null)
    {
        $value = $this->get($key);
        
        if ($value === null) {
            $value = $callback();
            $this->set($key, $value, $ttl);
        }
        
        return $value;
    }
    
    /**
     * Vide complètement le cache
     */
    public function clear(): bool
    {
        return $this->deleteDirectory($this->cacheDir);
    }
    
    /**
     * Nettoie les entrées expirées
     */
    public function cleanup(): int
    {
        $cleaned = 0;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->cacheDir)
        );
        
        foreach ($iterator as $file) {
            if (!$file->isFile() || $file->getExtension() !== 'cache') {
                continue;
            }
            
            $data = file_get_contents($file->getPathname());
            if ($data === false) {
                continue;
            }
            
            if ($this->config['compress']) {
                $data = gzuncompress($data);
            }
            
            $cached = json_decode($data, true);
            if ($cached && isset($cached['expires_at']) && $cached['expires_at'] < time()) {
                unlink($file->getPathname());
                $cleaned++;
            }
        }
        
        return $cleaned;
    }
    
    /**
     * Obtient des statistiques du cache
     */
    public function getStats(): array
    {
        $stats = [
            'total_files' => 0,
            'total_size' => 0,
            'expired_files' => 0,
            'valid_files' => 0,
        ];
        
        if (!is_dir($this->cacheDir)) {
            return $stats;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->cacheDir)
        );
        
        foreach ($iterator as $file) {
            if (!$file->isFile() || $file->getExtension() !== 'cache') {
                continue;
            }
            
            $stats['total_files']++;
            $stats['total_size'] += $file->getSize();
            
            $data = file_get_contents($file->getPathname());
            if ($data !== false) {
                if ($this->config['compress']) {
                    $data = gzuncompress($data);
                }
                
                $cached = json_decode($data, true);
                if ($cached && isset($cached['expires_at'])) {
                    if ($cached['expires_at'] < time()) {
                        $stats['expired_files']++;
                    } else {
                        $stats['valid_files']++;
                    }
                }
            }
        }
        
        return $stats;
    }
    
    /**
     * Génère le chemin de fichier pour une clé
     */
    private function getFilePath(string $key): string
    {
        $hash = hash('sha256', $key);
        $dir = substr($hash, 0, 2);
        return $this->cacheDir . '/' . $dir . '/' . $hash . '.cache';
    }
    
    /**
     * S'assure que le dossier de cache existe
     */
    private function ensureCacheDir(): void
    {
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * S'assure que le dossier d'un fichier existe
     */
    private function ensureFileDir(string $file): void
    {
        $dir = dirname($file);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
    }
    
    /**
     * Supprime récursivement un dossier
     */
    private function deleteDirectory(string $dir): bool
    {
        if (!is_dir($dir)) {
            return true;
        }
        
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST
        );
        
        foreach ($iterator as $file) {
            if ($file->isDir()) {
                rmdir($file->getPathname());
            } else {
                unlink($file->getPathname());
            }
        }
        
        return rmdir($dir);
    }
}
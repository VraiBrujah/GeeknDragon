<?php

namespace GeeknDragon\Services;

/**
 * Service de cache simple basé sur des fichiers
 * Implémente une solution de cache robuste pour les médias optimisés
 */
class CacheService
{
    private string $cacheDir;
    private int $defaultTtl;

    public function __construct(string $cacheDir = null, int $defaultTtl = 3600)
    {
        $this->cacheDir = $cacheDir ?? __DIR__ . '/../../cache';
        $this->defaultTtl = $defaultTtl;
        $this->ensureDirectoryExists($this->cacheDir);
    }

    /**
     * Récupère une valeur du cache
     */
    public function get(string $key): mixed
    {
        $filePath = $this->getFilePath($key);
        
        if (!file_exists($filePath)) {
            return null;
        }

        $data = json_decode(file_get_contents($filePath), true);
        
        if (!$data || !isset($data['expires_at'], $data['value'])) {
            $this->delete($key);
            return null;
        }

        if (time() > $data['expires_at']) {
            $this->delete($key);
            return null;
        }

        // Désérialisation spéciale pour les objets Media
        if (isset($data['type']) && $data['type'] === 'media') {
            return \GeeknDragon\Models\Media::fromArray($data['value']);
        }

        return $data['value'];
    }

    /**
     * Stocke une valeur dans le cache
     */
    public function set(string $key, mixed $value, int $ttl = null): bool
    {
        $ttl = $ttl ?? $this->defaultTtl;
        $expiresAt = time() + $ttl;

        $data = [
            'expires_at' => $expiresAt,
            'value' => $value
        ];

        // Sérialisation spéciale pour les objets Media
        if ($value instanceof \GeeknDragon\Models\Media) {
            $data['type'] = 'media';
            $data['value'] = $value->toArray();
        }

        $filePath = $this->getFilePath($key);
        $this->ensureDirectoryExists(dirname($filePath));

        return file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }

    /**
     * Supprime une clé du cache
     */
    public function delete(string $key): bool
    {
        $filePath = $this->getFilePath($key);
        
        if (file_exists($filePath)) {
            return unlink($filePath);
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
     * Vide tout le cache
     */
    public function clear(): bool
    {
        $files = glob($this->cacheDir . '/*');
        $success = true;

        foreach ($files as $file) {
            if (is_file($file)) {
                $success = unlink($file) && $success;
            }
        }

        return $success;
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    public function cleanup(): int
    {
        $files = glob($this->cacheDir . '/*.json');
        $cleaned = 0;

        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            
            if (!$data || !isset($data['expires_at'])) {
                unlink($file);
                $cleaned++;
                continue;
            }

            if (time() > $data['expires_at']) {
                unlink($file);
                $cleaned++;
            }
        }

        return $cleaned;
    }

    /**
     * Obtient des statistiques sur le cache
     */
    public function getStats(): array
    {
        $files = glob($this->cacheDir . '/*.json');
        $totalSize = 0;
        $validEntries = 0;
        $expiredEntries = 0;

        foreach ($files as $file) {
            $totalSize += filesize($file);
            $data = json_decode(file_get_contents($file), true);
            
            if ($data && isset($data['expires_at'])) {
                if (time() > $data['expires_at']) {
                    $expiredEntries++;
                } else {
                    $validEntries++;
                }
            }
        }

        return [
            'total_files' => count($files),
            'valid_entries' => $validEntries,
            'expired_entries' => $expiredEntries,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize)
        ];
    }

    private function getFilePath(string $key): string
    {
        $hash = md5($key);
        $subDir = substr($hash, 0, 2);
        $this->ensureDirectoryExists($this->cacheDir . '/' . $subDir);
        return $this->cacheDir . '/' . $subDir . '/' . $hash . '.json';
    }

    private function ensureDirectoryExists(string $directory): void
    {
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
    }

    private function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
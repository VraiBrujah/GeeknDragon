<?php

namespace GeeknDragon\Controllers;

use GeeknDragon\Core\Application;
use GeeknDragon\Services\MediaService;

/**
 * Contrôleur pour la gestion des médias optimisés
 * Fournit une API REST pour l'optimisation et la récupération de médias
 */
class MediaController
{
    private MediaService $mediaService;

    public function __construct()
    {
        $app = Application::getInstance();
        $this->mediaService = $app->getService('media');
    }

    /**
     * Optimise un média et retourne les variantes
     */
    public function optimize(): void
    {
        try {
            $filePath = $_POST['file_path'] ?? $_GET['file_path'] ?? null;
            
            if (!$filePath) {
                $this->jsonResponse(['error' => 'Chemin de fichier requis'], 400);
                return;
            }

            $fullPath = $this->resolvePath($filePath);
            $media = $this->mediaService->optimizeMedia($fullPath);
            
            $this->jsonResponse([
                'success' => true,
                'media' => [
                    'original_path' => $filePath,
                    'variants' => $media->getVariants(),
                    'metadata' => $media->getMetadata(),
                    'compression_ratio' => $media->getCompressionRatio()
                ]
            ]);

        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Génère le HTML responsive pour un média
     */
    public function generateHtml(): void
    {
        try {
            $filePath = $_POST['file_path'] ?? $_GET['file_path'] ?? null;
            $attributes = $_POST['attributes'] ?? $_GET['attributes'] ?? [];
            
            if (!$filePath) {
                $this->jsonResponse(['error' => 'Chemin de fichier requis'], 400);
                return;
            }

            $fullPath = $this->resolvePath($filePath);
            $media = $this->mediaService->optimizeMedia($fullPath);
            $html = $media->toHtml($attributes);
            
            $this->jsonResponse([
                'success' => true,
                'html' => $html
            ]);

        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Récupère les statistiques d'optimisation
     */
    public function getStats(): void
    {
        try {
            $app = Application::getInstance();
            $cache = $app->getService('cache');
            $stats = $cache->getStats();
            
            $this->jsonResponse([
                'success' => true,
                'cache_stats' => $stats,
                'optimization_enabled' => true
            ]);

        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Vide le cache des médias optimisés
     */
    public function clearCache(): void
    {
        try {
            $app = Application::getInstance();
            $cache = $app->getService('cache');
            $cleared = $cache->clear();
            
            $this->jsonResponse([
                'success' => $cleared,
                'message' => $cleared ? 'Cache vidé avec succès' : 'Erreur lors du vidage du cache'
            ]);

        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Nettoie les entrées expirées du cache
     */
    public function cleanupCache(): void
    {
        try {
            $app = Application::getInstance();
            $cache = $app->getService('cache');
            $cleaned = $cache->cleanup();
            
            $this->jsonResponse([
                'success' => true,
                'cleaned_entries' => $cleaned,
                'message' => "{$cleaned} entrées expirées supprimées"
            ]);

        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    private function resolvePath(string $filePath): string
    {
        // Nettoyer le chemin pour éviter les injections
        $filePath = trim($filePath, '/\\');
        $filePath = str_replace(['../', '..\\'], '', $filePath);
        
        $basePath = __DIR__ . '/../../';
        $fullPath = $basePath . $filePath;
        
        if (!file_exists($fullPath)) {
            throw new \InvalidArgumentException("Fichier non trouvé : {$filePath}");
        }
        
        // Vérifier que le fichier est dans notre arborescence
        $realPath = realpath($fullPath);
        $realBasePath = realpath($basePath);
        
        if (!$realPath || strpos($realPath, $realBasePath) !== 0) {
            throw new \InvalidArgumentException("Accès au fichier non autorisé");
        }
        
        return $fullPath;
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
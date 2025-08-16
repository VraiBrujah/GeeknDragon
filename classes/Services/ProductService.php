<?php

namespace GeeknDragon\Services;

/**
 * Service de gestion des produits avec cache et optimisation
 * Refactorise la logique métier des produits
 */
class ProductService
{
    private CacheService $cache;
    private MediaService $mediaService;
    private string $dataPath;

    public function __construct()
    {
        $this->cache = new CacheService();
        $this->mediaService = new MediaService();
        $this->dataPath = __DIR__ . '/../../data/products.json';
    }

    /**
     * Récupère tous les produits avec médias optimisés
     */
    public function getAllProducts(): array
    {
        $cacheKey = 'products_all_' . filemtime($this->dataPath);
        
        if ($cachedProducts = $this->cache->get($cacheKey)) {
            return $cachedProducts;
        }

        $rawData = $this->loadRawProductData();
        $products = $this->processProducts($rawData);
        
        $this->cache->set($cacheKey, $products, 1800); // Cache 30min
        
        return $products;
    }

    /**
     * Récupère un produit spécifique par ID
     */
    public function getProduct(string $id): ?array
    {
        $products = $this->getAllProducts();
        return $products[$id] ?? null;
    }

    /**
     * Récupère les produits par catégorie
     */
    public function getProductsByCategory(string $category): array
    {
        $products = $this->getAllProducts();
        return array_filter($products, fn($p) => ($p['category'] ?? 'pieces') === $category);
    }

    /**
     * Recherche des produits par terme
     */
    public function searchProducts(string $query): array
    {
        $products = $this->getAllProducts();
        $query = strtolower($query);
        
        return array_filter($products, function($product) use ($query) {
            $searchableText = strtolower(
                $product['name'] . ' ' . 
                $product['name_en'] . ' ' . 
                strip_tags($product['description']) . ' ' .
                strip_tags($product['description_en'])
            );
            
            return strpos($searchableText, $query) !== false;
        });
    }

    private function loadRawProductData(): array
    {
        if (!file_exists($this->dataPath)) {
            throw new \RuntimeException("Fichier produits non trouvé : {$this->dataPath}");
        }

        $data = json_decode(file_get_contents($this->dataPath), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Erreur JSON : " . json_last_error_msg());
        }

        return $data ?? [];
    }

    private function processProducts(array $rawData): array
    {
        $processed = [];

        foreach ($rawData as $id => $productData) {
            $processed[$id] = $this->processSingleProduct($id, $productData);
        }

        return $processed;
    }

    private function processSingleProduct(string $id, array $productData): array
    {
        $category = $productData['category'] ?? 'pieces';
        
        // Optimisation des médias
        $optimizedImages = $this->optimizeProductImages($productData['images'] ?? []);
        
        return [
            'id' => $id,
            'category' => $category,
            'name' => $this->formatProductName($productData['name']),
            'name_en' => $this->formatProductName($productData['name_en'] ?? $productData['name']),
            'price' => (float)$productData['price'],
            'description' => $productData['description'],
            'description_en' => $productData['description_en'] ?? $productData['description'],
            'summary' => $productData['summary'] ?? strip_tags($productData['description'] ?? ''),
            'summary_en' => $productData['summary_en'] ?? strip_tags($productData['description_en'] ?? $productData['description'] ?? ''),
            'images' => $productData['images'] ?? [],
            'optimized_images' => $optimizedImages,
            'primary_image' => $optimizedImages[0] ?? $productData['images'][0] ?? '',
            'multipliers' => $productData['multipliers'] ?? [],
            'languages' => $productData['languages'] ?? [],
            'url' => '/product.php?id=' . urlencode($id) . '&from=' . urlencode($category),
            'processed_at' => date('Y-m-d H:i:s')
        ];
    }

    private function formatProductName(string $name): string
    {
        return str_replace(' – ', '<br>', $name);
    }

    private function optimizeProductImages(array $images): array
    {
        $optimized = [];
        
        foreach ($images as $imagePath) {
            $fullPath = __DIR__ . '/../../' . $imagePath;
            
            if (file_exists($fullPath) && $this->isImage($fullPath)) {
                try {
                    // Vérifier si l'optimisation est possible
                    if ($this->canOptimizeImages()) {
                        $media = $this->mediaService->optimizeMedia($fullPath);
                        $optimized[] = [
                            'original' => $imagePath,
                            'optimized' => $media->getVariants(),
                            'best_variant' => $media->getBestVariant(800, 600)
                        ];
                    } else {
                        // Mode fallback sans optimisation
                        $optimized[] = [
                            'original' => $imagePath,
                            'optimized' => [],
                            'best_variant' => ['path' => $imagePath],
                            'fallback' => true
                        ];
                    }
                } catch (\Exception $e) {
                    // En cas d'erreur, garder l'image originale
                    $optimized[] = [
                        'original' => $imagePath,
                        'optimized' => [],
                        'best_variant' => ['path' => $imagePath],
                        'error' => $e->getMessage()
                    ];
                }
            }
        }
        
        return $optimized;
    }

    private function canOptimizeImages(): bool
    {
        return extension_loaded('gd') && function_exists('imagecreatetruecolor');
    }

    private function isImage(string $filePath): bool
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        return in_array($extension, $imageExtensions);
    }

    /**
     * Met à jour le cache des produits
     */
    public function refreshProductCache(): bool
    {
        $cacheKey = 'products_all_' . filemtime($this->dataPath);
        $this->cache->delete($cacheKey);
        
        try {
            $this->getAllProducts();
            return true;
        } catch (\Exception $e) {
            error_log("Erreur refresh cache produits : " . $e->getMessage());
            return false;
        }
    }

    /**
     * Valide la structure d'un produit
     */
    public function validateProduct(array $productData): array
    {
        $errors = [];
        
        if (empty($productData['name'])) {
            $errors[] = 'Le nom du produit est requis';
        }
        
        if (!isset($productData['price']) || !is_numeric($productData['price']) || $productData['price'] < 0) {
            $errors[] = 'Le prix doit être un nombre positif';
        }
        
        if (empty($productData['description'])) {
            $errors[] = 'La description est requise';
        }
        
        return $errors;
    }
}
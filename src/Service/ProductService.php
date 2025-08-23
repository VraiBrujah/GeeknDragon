<?php
declare(strict_types=1);

namespace GeeknDragon\Service;

/**
 * Service de gestion des produits
 * Centralise la logique métier des produits et du stock
 */
class ProductService
{
    private array $products = [];
    private static ?self $instance = null;
    private InventoryService $inventoryService;
    private string $filePath;
    private int $lastModifiedTime = 0;

    private function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
        $this->filePath = __DIR__ . '/../../data/products.json';
        $this->loadProducts();
    }

    /**
     * Singleton pour éviter de recharger les produits
     */
    public static function getInstance(InventoryService $inventoryService): self
    {
        if (self::$instance === null) {
            self::$instance = new self($inventoryService);
        }
        return self::$instance;
    }
    
    /**
     * Charge les produits depuis le fichier JSON
     */
    private function loadProducts(): void
    {
        if (!file_exists($this->filePath)) {
            throw new \RuntimeException("Fichier produits non trouvé : {$this->filePath}");
        }

        $content = file_get_contents($this->filePath);
        if ($content === false) {
            throw new \RuntimeException("Impossible de lire le fichier produits");
        }
        
        $products = json_decode($content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Erreur JSON : " . json_last_error_msg());
        }
        
        $this->products = $products;
        $mtime = filemtime($this->filePath);
        if ($mtime === false) {
            throw new \RuntimeException("Impossible de récupérer la date de modification du fichier produits");
        }
        $this->lastModifiedTime = $mtime;
    }

    /**
     * Recharge les produits si le fichier source a été modifié
     */
    private function reloadIfNeeded(): void
    {
        clearstatcache(false, $this->filePath);
        $currentMtime = filemtime($this->filePath);
        if ($currentMtime !== false && $currentMtime !== $this->lastModifiedTime) {
            $this->loadProducts();
        }
    }
    
    /**
     * Retourne tous les produits
     */
    public function getAllProducts(): array
    {
        $this->reloadIfNeeded();
        return $this->products;
    }
    
    /**
     * Retourne un produit par son ID
     */
    public function getProduct(string $id): ?array
    {
        $this->reloadIfNeeded();
        return $this->products[$id] ?? null;
    }
    
    /**
     * Retourne les produits par catégorie
     */
    public function getProductsByCategory(string $category): array
    {
        return array_filter($this->products, function($product) use ($category) {
            return ($product['category'] ?? 'pieces') === $category;
        });
    }
    
    /**
     * Retourne le nom du produit selon la langue
     */
    public function getProductName(array $product, string $lang): string
    {
        if ($lang === 'en' && isset($product['name_en'])) {
            return $product['name_en'];
        }
        return $product['name'];
    }
    
    /**
     * Retourne la description du produit selon la langue
     */
    public function getProductDescription(array $product, string $lang): string
    {
        if ($lang === 'en' && isset($product['description_en'])) {
            return $product['description_en'];
        }
        return $product['description'];
    }
    
    /**
     * Retourne le résumé du produit selon la langue
     */
    public function getProductSummary(array $product, string $lang): string
    {
        if ($lang === 'en' && isset($product['summary_en'])) {
            return $product['summary_en'];
        }
        return $product['summary'] ?? '';
    }
    
    /**
     * Vérifie si un produit est en stock
     */
    public function isInStock(string $productId): bool
    {
        return $this->inventoryService->isInStock($productId);
    }

    /**
     * Retourne le stock d'un produit
     */
    public function getStock(string $productId): ?int
    {
        return $this->inventoryService->getStock($productId);
    }
}
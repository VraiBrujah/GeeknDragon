<?php

namespace GeeknDragon\Controllers;

use GeeknDragon\Core\Application;
use GeeknDragon\Services\ProductService;
use GeeknDragon\Repositories\ProductRepository;

/**
 * Contrôleur pour la gestion des produits
 * Sépare la logique métier de la présentation
 */
class ProductController
{
    private ProductService $productService;
    private ProductRepository $productRepository;

    public function __construct()
    {
        $app = Application::getInstance();
        $this->productService = $app->getService('product');
        $this->productRepository = new ProductRepository();
    }

    /**
     * Affiche la liste des produits avec filtres
     */
    public function index(): array
    {
        $category = $_GET['category'] ?? null;
        $search = $_GET['search'] ?? null;
        $priceMin = $_GET['price_min'] ?? null;
        $priceMax = $_GET['price_max'] ?? null;

        if ($search || $priceMin || $priceMax) {
            $criteria = array_filter([
                'text' => $search,
                'price_min' => $priceMin ? (float)$priceMin : null,
                'price_max' => $priceMax ? (float)$priceMax : null,
                'category' => $category
            ]);
            
            $rawProducts = $this->productRepository->search($criteria);
        } elseif ($category) {
            $rawProducts = $this->productRepository->findByCategory($category);
        } else {
            $rawProducts = $this->productRepository->findAll();
        }

        // Traitement par le service pour optimisation des médias
        $products = [];
        foreach ($rawProducts as $id => $productData) {
            $products[$id] = $this->processProductForDisplay($id, $productData);
        }

        return [
            'products' => $products,
            'total' => count($products),
            'filters' => [
                'category' => $category,
                'search' => $search,
                'price_min' => $priceMin,
                'price_max' => $priceMax
            ]
        ];
    }

    /**
     * Affiche un produit spécifique
     */
    public function show(string $id): ?array
    {
        $productData = $this->productRepository->findById($id);
        
        if (!$productData) {
            return null;
        }

        return $this->processProductForDisplay($id, $productData);
    }

    /**
     * API JSON pour les produits
     */
    public function apiIndex(): void
    {
        try {
            $result = $this->index();
            $this->jsonResponse($result);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * API JSON pour un produit spécifique
     */
    public function apiShow(): void
    {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                $this->jsonResponse(['error' => 'ID produit requis'], 400);
                return;
            }

            $product = $this->show($id);
            
            if (!$product) {
                $this->jsonResponse(['error' => 'Produit non trouvé'], 404);
                return;
            }

            $this->jsonResponse(['product' => $product]);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Recherche de produits (API)
     */
    public function apiSearch(): void
    {
        try {
            $query = $_GET['q'] ?? '';
            
            if (strlen($query) < 2) {
                $this->jsonResponse(['products' => [], 'total' => 0]);
                return;
            }

            $rawProducts = $this->productRepository->search(['text' => $query]);
            
            $products = [];
            foreach ($rawProducts as $id => $productData) {
                $products[$id] = $this->processProductForDisplay($id, $productData);
            }

            $this->jsonResponse([
                'products' => $products,
                'total' => count($products),
                'query' => $query
            ]);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Suggestions de produits similaires
     */
    public function apiSuggestions(): void
    {
        try {
            $id = $_GET['id'] ?? null;
            $limit = min((int)($_GET['limit'] ?? 4), 10);
            
            if (!$id) {
                $this->jsonResponse(['error' => 'ID produit requis'], 400);
                return;
            }

            $currentProduct = $this->productRepository->findById($id);
            if (!$currentProduct) {
                $this->jsonResponse(['suggestions' => []]);
                return;
            }

            $category = $currentProduct['category'] ?? 'pieces';
            $allInCategory = $this->productRepository->findByCategory($category);
            
            // Retirer le produit actuel et limiter
            unset($allInCategory[$id]);
            $suggestions = array_slice($allInCategory, 0, $limit, true);

            $processedSuggestions = [];
            foreach ($suggestions as $suggestionId => $suggestionData) {
                $processedSuggestions[$suggestionId] = $this->processProductForDisplay($suggestionId, $suggestionData);
            }

            $this->jsonResponse(['suggestions' => $processedSuggestions]);
        } catch (\Exception $e) {
            $this->jsonResponse(['error' => $e->getMessage()], 500);
        }
    }

    private function processProductForDisplay(string $id, array $productData): array
    {
        $category = $productData['category'] ?? 'pieces';
        
        return [
            'id' => $id,
            'category' => $category,
            'name' => $this->formatProductName($productData['name']),
            'name_en' => $this->formatProductName($productData['name_en'] ?? $productData['name']),
            'price' => (float)$productData['price'],
            'price_formatted' => number_format($productData['price'], 2) . ' CAD',
            'description' => $productData['description'],
            'description_en' => $productData['description_en'] ?? $productData['description'],
            'summary' => $productData['summary'] ?? strip_tags($productData['description'] ?? ''),
            'summary_en' => $productData['summary_en'] ?? strip_tags($productData['description_en'] ?? $productData['description'] ?? ''),
            'images' => $productData['images'] ?? [],
            'primary_image' => $productData['images'][0] ?? '',
            'multipliers' => $productData['multipliers'] ?? [],
            'languages' => $productData['languages'] ?? [],
            'url' => '/product.php?id=' . urlencode($id) . '&from=' . urlencode($category),
            'api_url' => '/api/products.php?action=show&id=' . urlencode($id)
        ];
    }

    private function formatProductName(string $name): string
    {
        return str_replace(' – ', '<br>', $name);
    }

    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}
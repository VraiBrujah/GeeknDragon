<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\Service\ProductService;

/**
 * API pour récupérer les informations d'un produit
 */
class ProductController extends BaseController
{
    private ProductService $productService;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $this->productService = ProductService::getInstance();
    }

    /**
     * GET /api/products/{id} - Retourne les détails d'un produit
     */
    public function getProduct(string $id): void
    {
        try {
            $product = $this->productService->getProduct($id);

            if ($product === null) {
                $this->json(['success' => false, 'message' => 'Produit introuvable'], 404);
                return;
            }

            $lang = $this->translator->getCurrentLanguage();
            $name = $this->productService->getProductName($product, $lang);
            $image = $product['images'][0] ?? ($product['img'] ?? '');

            $this->json([
                'success' => true,
                'product' => [
                    'id' => $id,
                    'name' => $name,
                    'price' => $product['price'] ?? 0,
                    'image' => $image,
                ]
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, 'ProductController::getProduct');
        }
    }
}

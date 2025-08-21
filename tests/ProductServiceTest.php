<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Service\ProductService;

final class ProductServiceTest extends TestCase
{
    public function testProductService(): void
    {
        $service = ProductService::getInstance();

        $products = $service->getAllProducts();
        $this->assertNotEmpty($products, 'ProductService doit retourner des produits');

        $firstProductKey = array_key_first($products);
        $product = $service->getProduct($firstProductKey);
        $this->assertNotNull($product, 'ProductService doit retourner un produit existant');
        $this->assertArrayHasKey('name', $product, 'Un produit doit avoir un nom');
        $this->assertArrayHasKey('price', $product, 'Un produit doit avoir un prix');

        $nameEN = $service->getProductName($product, 'en');
        $nameFR = $service->getProductName($product, 'fr');
        $this->assertNotEmpty($nameEN, 'Le nom en anglais ne doit pas être vide');
        $this->assertNotEmpty($nameFR, 'Le nom en français ne doit pas être vide');

        $nonExistent = $service->getProduct('produit-inexistant');
        $this->assertNull($nonExistent, 'Un produit inexistant doit retourner null');
    }
}

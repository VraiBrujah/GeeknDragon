<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Service\{ProductService, InventoryService};

final class ProductServiceTest extends TestCase
{
    public function testProductService(): void
    {
        require_once __DIR__ . '/../bootstrap.php';
        $config = require __DIR__ . '/../config.php';
        $inventory = InventoryService::getInstance($config);
        $service = ProductService::getInstance($inventory);

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

    public function testProductsAreReloadedWhenFileChanges(): void
    {
        require_once __DIR__ . '/../bootstrap.php';
        $config = require __DIR__ . '/../config.php';
        $inventory = InventoryService::getInstance($config);
        $service = ProductService::getInstance($inventory);

        $products = $service->getAllProducts();
        $firstProductKey = array_key_first($products);
        $filePath = __DIR__ . '/../data/products.json';

        $originalContent = file_get_contents($filePath);
        $this->assertNotFalse($originalContent, 'Impossible de lire le fichier de produits');
        $data = json_decode($originalContent, true);
        $originalName = $data[$firstProductKey]['name'];
        $data[$firstProductKey]['name'] = 'Test Reload';
        $newContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        $mtime = filemtime($filePath);
        $this->assertNotFalse($mtime, 'Impossible de récupérer le timestamp du fichier');
        file_put_contents($filePath, $newContent);
        touch($filePath, $mtime + 2);
        clearstatcache(false, $filePath);

        $reloaded = $service->getProduct($firstProductKey);
        $this->assertSame('Test Reload', $reloaded['name'] ?? null, 'Le service doit recharger les produits après modification du fichier');

        file_put_contents($filePath, $originalContent);
        touch($filePath, $mtime);
        clearstatcache(false, $filePath);
        $service->getAllProducts();
        $restored = $service->getProduct($firstProductKey);
        $this->assertSame($originalName, $restored['name'] ?? null, 'Le fichier de produits doit être restauré');
    }
}

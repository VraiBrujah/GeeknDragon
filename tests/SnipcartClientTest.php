<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Cart\SnipcartClient;

final class SnipcartClientTest extends TestCase
{
    public function testSnipcartClient(): void
    {
        $client = new SnipcartClient('test-key', 'test-secret', true);

        $product = $client->getProduct('test-product');
        $this->assertArrayHasKey('id', $product, 'Le produit mock doit avoir un ID');
        $this->assertArrayHasKey('name', $product, 'Le produit mock doit avoir un nom');
        $this->assertArrayHasKey('price', $product, 'Le produit mock doit avoir un prix');

        $created = $client->createOrUpdateProduct([
            'id' => 'test-new-product',
            'name' => 'Produit Test',
            'price' => 9.99,
            'url' => 'https://example.com/product',
            'image' => '/images/test.jpg'
        ]);
        $this->assertSame('test-new-product', $created['id'], "La création de produit mock doit retourner l'ID fourni");

        $inventory = $client->getInventory('test-product');
        $this->assertArrayHasKey('stock', $inventory, "L'inventaire mock doit avoir un stock");
        $this->assertIsInt($inventory['stock'], 'Le stock doit être un entier');

        $orders = $client->getOrders();
        $this->assertArrayHasKey('items', $orders, 'Les commandes mock doivent avoir des items');
        $this->assertIsArray($orders['items'], 'Les items doivent être un tableau');
    }
}

<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\CartService;

final class CartServiceTest extends TestCase
{
    public function testCartService(): void
    {
        if (session_status() !== PHP_SESSION_NONE) {
            session_unset();
            session_destroy();
        }

        $client = new SnipcartClient('test-key', 'test-secret', true);
        $cart = new CartService($client);

        $this->assertTrue($cart->isEmpty(), 'Le panier doit être vide initialement');
        $this->assertSame(0, $cart->getItemCount(), 'Le nombre d\'articles doit être 0');
        $this->assertSame(0.0, $cart->getTotal(), 'Le total doit être 0');

        $this->assertTrue($cart->addItem('test-product', 2), "L'ajout de produit doit réussir");
        $this->assertFalse($cart->isEmpty(), "Le panier ne doit plus être vide");
        $this->assertSame(2, $cart->getItemCount(), "Le nombre d'articles doit être 2");

        $items = $cart->getItems();
        $this->assertCount(1, $items, 'Il doit y avoir 1 type d\'item');

        $firstItem = reset($items);
        $this->assertSame(2, $firstItem['quantity'], 'La quantité doit être 2');
        $this->assertSame('test-product', $firstItem['productId'], "L'ID produit doit correspondre");

        $itemKey = array_key_first($items);
        $this->assertTrue($cart->updateQuantity($itemKey, 3), "La mise à jour de quantité doit réussir");
        $this->assertSame(3, $cart->getItemCount(), "Le nombre d'articles doit être 3");

        $this->assertTrue($cart->removeItem($itemKey), "La suppression doit réussir");
        $this->assertTrue($cart->isEmpty(), "Le panier doit être vide après suppression");

        $cart->addItem('test-product', 1);
        $cart->clearCart();
        $this->assertTrue($cart->isEmpty(), "Le panier doit être vide après vidage");

        session_unset();
        session_destroy();
    }
}

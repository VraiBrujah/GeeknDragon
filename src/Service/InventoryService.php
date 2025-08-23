<?php
declare(strict_types=1);

namespace GeeknDragon\Service;

use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\SnipcartException;

/**
 * Service centralisé pour la gestion du stock via l'API Snipcart
 */
class InventoryService
{
    private SnipcartClient $client;
    private static ?self $instance = null;

    private function __construct(SnipcartClient $client)
    {
        $this->client = $client;
    }

    /**
     * Singleton avec configuration
     */
    public static function getInstance(array $config): self
    {
        if (self::$instance === null) {
            $mock = (($_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'production') === 'development');
            $apiKey = $config['snipcart_api_key'] ?? '';
            $secret = $config['snipcart_secret_api_key'] ?? '';
            if (!$apiKey || !$secret) {
                $mock = true;
                $apiKey = $apiKey ?: 'test-key';
                $secret = $secret ?: 'test-secret';
            }
            $client = new SnipcartClient($apiKey, $secret, $mock);
            self::$instance = new self($client);
        }
        return self::$instance;
    }

    /**
     * Récupère le stock disponible pour un produit
     */
    public function getStock(string $productId): ?int
    {
        if (!$productId || !preg_match('/^[a-zA-Z0-9_\-]+$/', $productId)) {
            error_log("Invalid product ID: {$productId}");
            return null;
        }

        try {
            $inventory = $this->client->getInventory($productId);
            $stock = $inventory['stock'] ?? $inventory['available'] ?? null;
            return is_numeric($stock) ? (int)$stock : null;
        } catch (SnipcartException $e) {
            throw $e;
        } catch (\Throwable $e) {
            error_log("Snipcart inventory error for {$productId}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Vérifie si un produit est en stock
     */
    public function isInStock(string $productId): bool
    {
        $stock = $this->getStock($productId);
        return $stock === null || $stock > 0;
    }
}


<?php

declare(strict_types=1);

namespace App\Snipcart;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

/**
 * Client REST pour l'API Snipcart
 * Permet d'interagir avec les commandes, produits, etc.
 */
final class SnipcartClient
{
    private Client $client;
    private array $config;
    private string $baseUrl;
    
    public function __construct()
    {
        $this->config = include __DIR__ . '/../../config/snipcart.php';
        $this->baseUrl = $this->config['test_mode'] 
            ? 'https://app.snipcart.com/api' 
            : 'https://app.snipcart.com/api';
            
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->config['secret_key'] . ':')
            ],
            'timeout' => 30
        ]);
    }
    
    /**
     * Récupère une commande par son ID
     */
    public function getOrder(string $orderId): ?array
    {
        try {
            $response = $this->client->get("/orders/$orderId");
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur récupération commande: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Récupère la liste des commandes avec pagination
     */
    public function getOrders(int $offset = 0, int $limit = 20, array $filters = []): ?array
    {
        try {
            $query = [
                'offset' => $offset,
                'limit' => $limit
            ];
            
            // Filtres optionnels
            if (!empty($filters['status'])) {
                $query['status'] = $filters['status'];
            }
            
            if (!empty($filters['from'])) {
                $query['from'] = $filters['from'];
            }
            
            if (!empty($filters['to'])) {
                $query['to'] = $filters['to'];
            }
            
            $response = $this->client->get('/orders', ['query' => $query]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur récupération commandes: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Met à jour une commande (statut, numéro de suivi, etc.)
     */
    public function updateOrder(string $orderId, array $data): bool
    {
        try {
            $this->client->put("/orders/$orderId", [
                'json' => $data
            ]);
            return true;
        } catch (RequestException $e) {
            error_log('Erreur mise à jour commande: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Ajoute un numéro de suivi à une commande
     */
    public function addTrackingNumber(string $orderId, string $trackingNumber, ?string $trackingUrl = null): bool
    {
        $data = [
            'trackingNumber' => $trackingNumber
        ];
        
        if ($trackingUrl) {
            $data['trackingUrl'] = $trackingUrl;
        }
        
        return $this->updateOrder($orderId, $data);
    }
    
    /**
     * Change le statut d'une commande
     */
    public function updateOrderStatus(string $orderId, string $status): bool
    {
        return $this->updateOrder($orderId, ['status' => $status]);
    }
    
    /**
     * Récupère les statistiques des ventes
     */
    public function getSalesStatistics(string $from, string $to): ?array
    {
        try {
            $response = $this->client->get('/orders/statistics', [
                'query' => [
                    'from' => $from,
                    'to' => $to
                ]
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur récupération statistiques: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Récupère les produits les plus vendus
     */
    public function getTopSellingProducts(int $limit = 10): ?array
    {
        try {
            $response = $this->client->get('/products/top-selling', [
                'query' => ['limit' => $limit]
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur récupération top produits: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Recherche des commandes par email client
     */
    public function searchOrdersByEmail(string $email): ?array
    {
        try {
            $response = $this->client->get('/orders', [
                'query' => ['userEmail' => $email]
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur recherche commandes par email: ' . $e->getMessage());
            return null;
        }
    }
}
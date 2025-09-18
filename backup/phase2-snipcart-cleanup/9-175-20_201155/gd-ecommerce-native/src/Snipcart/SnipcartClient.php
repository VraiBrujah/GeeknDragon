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
        $this->baseUrl = $this->config['api']['base_url'] ?? 'https://app.snipcart.com/api';
        
        if (empty($this->config['secret_key'])) {
            throw new \InvalidArgumentException('Clé secrète Snipcart non configurée');
        }
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'Accept' => 'application/json',
                'Authorization' => 'Basic ' . base64_encode($this->config['secret_key'] . ':'),
                'User-Agent' => 'GeeknDragon-Snipcart/1.0'
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
            $response = $this->client->get("/orders/{$orderId}");
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
            
            if (!empty($filters['userEmail'])) {
                $query['userEmail'] = $filters['userEmail'];
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
            $this->client->put("/orders/{$orderId}", [
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
        $validStatuses = ['InProgress', 'Processed', 'Dispatched', 'Delivered', 'Cancelled'];
        
        if (!in_array($status, $validStatuses, true)) {
            error_log("Statut de commande invalide: $status");
            return false;
        }
        
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
    
    /**
     * Récupère les détails d'un client
     */
    public function getCustomer(string $customerId): ?array
    {
        try {
            $response = $this->client->get("/customers/{$customerId}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur récupération client: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Récupère les données analytiques
     */
    public function getAnalytics(string $period = '30d'): ?array
    {
        try {
            $response = $this->client->get('/data/analytics', [
                'query' => ['period' => $period]
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur récupération analytiques: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Valide une session de paiement
     */
    public function validatePaymentSession(string $publicToken): ?array
    {
        try {
            $response = $this->client->get('/public/custom-payment-gateway/payment-session', [
                'query' => ['publicToken' => $publicToken]
            ]);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            error_log('Erreur validation session de paiement: ' . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Met à jour le statut d'un paiement
     */
    public function updatePaymentStatus(string $paymentSessionId, string $status, ?string $transactionId = null): bool
    {
        try {
            $data = [
                'paymentSessionId' => $paymentSessionId,
                'state' => $status // processing, processed, invalidated, failed
            ];
            
            if ($transactionId) {
                $data['transactionId'] = $transactionId;
            }
            
            $response = $this->client->post('/private/custom-payment-gateway/payment', [
                'json' => $data
            ]);
            
            return $response->getStatusCode() === 200;
        } catch (RequestException $e) {
            error_log('Erreur mise à jour statut paiement: ' . $e->getMessage());
            return false;
        }
    }
}
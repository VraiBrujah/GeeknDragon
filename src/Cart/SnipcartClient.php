<?php
declare(strict_types=1);

namespace GeeknDragon\Cart;

/**
 * Client API Snipcart sécurisé
 * Remplace le système natif Snipcart par des appels API directs
 */
class SnipcartClient
{
    private string $apiKey;
    private string $secretKey;
    private string $baseUrl = 'https://app.snipcart.com/api';
    private bool $mockMode = false;
    
    public function __construct(string $apiKey, string $secretKey, bool $mockMode = false)
    {
        if (empty($apiKey) || empty($secretKey)) {
            throw new SnipcartException('Configuration Snipcart invalide');
        }

        $this->apiKey = $apiKey;
        $this->secretKey = $secretKey;
        $this->mockMode = $mockMode;
    }
    
    /**
     * Récupère les informations d'un produit
     */
    public function getProduct(string $productId): array
    {
        if ($this->mockMode) {
            return $this->getMockProduct($productId);
        }

        return $this->makeRequest("GET", "/products/{$productId}");
    }

    /**
     * Crée ou met à jour un produit
     */
    public function createOrUpdateProduct(array $product): array
    {
        if ($this->mockMode) {
            $id = $product['id'] ?? 'mock-product';
            return array_merge($this->getMockProduct($id), $product);
        }

        return $this->makeRequest('POST', '/products', $product);
    }

    /**
     * Récupère l'inventaire d'un produit
     */
    public function getInventory(string $productId): array
    {
        if ($this->mockMode) {
            return $this->getMockInventory($productId);
        }
        
        return $this->makeRequest("GET", "/inventory/{$productId}");
    }
    
    /**
     * Crée ou met à jour l'inventaire d'un produit
     */
    public function updateInventory(string $productId, int $stock): array
    {
        if ($this->mockMode) {
            return $this->getMockInventory($productId, $stock);
        }
        
        return $this->makeRequest("PUT", "/inventory/{$productId}", [
            'stock' => $stock
        ]);
    }
    
    /**
     * Récupère les commandes
     */
    public function getOrders(array $filters = []): array
    {
        if ($this->mockMode) {
            return $this->getMockOrders();
        }
        
        $query = http_build_query($filters);
        return $this->makeRequest("GET", "/orders" . ($query ? "?{$query}" : ""));
    }
    
    /**
     * Récupère une commande spécifique
     */
    public function getOrder(string $orderId): array
    {
        if ($this->mockMode) {
            return $this->getMockOrder($orderId);
        }
        
        return $this->makeRequest("GET", "/orders/{$orderId}");
    }
    
    /**
     * Effectue une requête HTTP vers l'API Snipcart
     */
    private function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        $url = $this->baseUrl . $endpoint;
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_USERPWD => $this->secretKey . ':',
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Accept: application/json',
                'User-Agent: GeeknDragon/1.0'
            ],
            // Sécurité SSL
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            // Timeouts
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);
        
        if (!empty($data) && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($response === false) {
            throw new \RuntimeException("Erreur cURL Snipcart : {$error}");
        }

        if ($httpCode === 401 || $httpCode === 403) {
            error_log("Snipcart API auth error {$httpCode} for {$endpoint}: {$response}");
            throw new SnipcartException('Configuration Snipcart invalide', $httpCode);
        }

        if ($httpCode >= 400) {
            error_log("Snipcart API error {$httpCode} for {$endpoint}: {$response}");
            throw new \RuntimeException("Erreur API Snipcart : {$httpCode}");
        }
        
        $decoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \RuntimeException("Réponse JSON invalide de Snipcart : " . json_last_error_msg());
        }
        
        return $decoded;
    }
    
    /**
     * Données mock pour les tests et développement offline
     */
    private function getMockProduct(string $productId): array
    {
        return [
            'id' => $productId,
            'name' => "Produit Mock {$productId}",
            'price' => 59.99,
            'url' => "https://geekndragon.com/product/{$productId}",
            'description' => "Description mock du produit {$productId}",
            'image' => "/images/mock-product.jpg",
            'categories' => ['mock'],
            'metadata' => []
        ];
    }
    
    private function getMockInventory(string $productId, ?int $stock = null): array
    {
        return [
            'productId' => $productId,
            'stock' => $stock ?? rand(5, 50),
            'allowOutOfStockPurchases' => false,
            'creationDate' => date('c'),
            'modificationDate' => date('c')
        ];
    }
    
    private function getMockOrders(): array
    {
        return [
            'totalItems' => 2,
            'items' => [
                $this->getMockOrder('mock-order-1'),
                $this->getMockOrder('mock-order-2')
            ]
        ];
    }
    
    private function getMockOrder(string $orderId): array
    {
        return [
            'token' => $orderId,
            'email' => 'test@example.com',
            'status' => 'Processed',
            'paymentStatus' => 'Paid',
            'total' => 149.98,
            'totalPaid' => 149.98,
            'currency' => 'CAD',
            'creationDate' => date('c', strtotime('-1 day')),
            'modificationDate' => date('c'),
            'items' => [
                [
                    'id' => 'lot10',
                    'name' => "L'Offrande du Voyageur",
                    'price' => 60.00,
                    'quantity' => 1,
                    'totalPrice' => 60.00
                ],
                [
                    'id' => 'lot25',
                    'name' => 'La Monnaie des Cinq Royaumes',
                    'price' => 89.98,
                    'quantity' => 1,
                    'totalPrice' => 89.98
                ]
            ],
            'shippingInformation' => [
                'name' => 'Jean Dupont',
                'address1' => '123 Rue Test',
                'city' => 'Montréal',
                'province' => 'QC',
                'postalCode' => 'H1A 1A1',
                'country' => 'CA'
            ]
        ];
    }
}
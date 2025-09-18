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
     * Récupère un client par son ID
     */
    public function getCustomer(string $customerId): array
    {
        if ($this->mockMode) {
            return $this->getMockCustomer($customerId);
        }

        return $this->makeRequest('GET', "/customers/{$customerId}");
    }

    /**
     * Recherche un client par email
     */
    public function getCustomerByEmail(string $email): ?array
    {
        if ($this->mockMode) {
            return $this->getMockCustomer('mock-customer', $email);
        }

        $query = http_build_query(['email' => $email]);
        $result = $this->makeRequest('GET', '/customers?' . $query);
        return $result['items'][0] ?? null;
    }

    /**
     * Récupère les tarifs de livraison
     */
    public function getShippingRates(array $data): array
    {
        if ($this->mockMode) {
            return $this->getMockShippingRates();
        }

        return $this->makeRequest('POST', '/shippingrates', $data);
    }

    /**
     * Valide un token de requête Snipcart
     */
    public function validateToken(string $token): bool
    {
        if ($this->mockMode) {
            return !empty($token);
        }

        $url = $this->baseUrl . '/requestvalidation/' . urlencode($token);
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_USERPWD => $this->secretKey . ':',
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'User-Agent: GeeknDragon/1.0'
            ],
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            throw new \RuntimeException("Erreur cURL Snipcart : {$error}");
        }

        if ($httpCode === 401 || $httpCode === 403) {
            error_log("Snipcart API auth error {$httpCode} for requestvalidation: {$response}");
            throw new SnipcartException('Configuration Snipcart invalide', $httpCode);
        }

        if ($httpCode >= 400) {
            error_log("Snipcart API error {$httpCode} for requestvalidation: {$response}");
            return false;
        }

        return $httpCode === 200 || $httpCode === 204;
    }

    /**
     * Récupère les commandes récentes (fonctionnalité administrative)
     */
    public function getRecentOrders(int $limit = 20): array
    {
        if ($this->mockMode) {
            return $this->getMockRecentOrders($limit);
        }

        return $this->makeRequest('GET', "/orders?limit={$limit}&offset=0");
    }

    /**
     * Récupère les statistiques de vente détaillées (fonctionnalité administrative)
     */
    public function getSalesStats(?string $from = null, ?string $to = null): array
    {
        if ($this->mockMode) {
            return $this->getMockSalesStats($from, $to);
        }

        $from = $from ?: date('Y-m-01');
        $to = $to ?: date('Y-m-d');
        
        $orders = $this->makeRequest('GET', "/orders?from={$from}&to={$to}");
        
        $stats = [
            'total_orders' => count($orders['items'] ?? []),
            'total_revenue' => 0,
            'average_order_value' => 0,
            'top_products' => [],
            'orders_by_status' => [
                'InProgress' => 0,
                'Processed' => 0,
                'Shipped' => 0,
                'Delivered' => 0,
                'Cancelled' => 0
            ]
        ];
        
        $productSales = [];
        
        foreach ($orders['items'] ?? [] as $order) {
            $stats['total_revenue'] += $order['finalGrandTotal'] ?? 0;
            $status = $order['status'] ?? 'Unknown';
            if (isset($stats['orders_by_status'][$status])) {
                $stats['orders_by_status'][$status]++;
            }
            
            foreach ($order['items'] ?? [] as $item) {
                $productId = $item['id'] ?? 'unknown';
                $productName = $item['name'] ?? 'Produit inconnu';
                $quantity = $item['quantity'] ?? 1;
                
                if (!isset($productSales[$productId])) {
                    $productSales[$productId] = [
                        'name' => $productName,
                        'quantity' => 0,
                        'revenue' => 0
                    ];
                }
                
                $productSales[$productId]['quantity'] += $quantity;
                $productSales[$productId]['revenue'] += ($item['price'] ?? 0) * $quantity;
            }
        }
        
        if ($stats['total_orders'] > 0) {
            $stats['average_order_value'] = $stats['total_revenue'] / $stats['total_orders'];
        }
        
        uasort($productSales, function($a, $b) {
            return $b['quantity'] <=> $a['quantity'];
        });
        
        $stats['top_products'] = array_slice($productSales, 0, 5, true);
        
        return $stats;
    }

    /**
     * Récupère les clients avec pagination (fonctionnalité administrative)
     */
    public function getCustomers(int $limit = 50): array
    {
        if ($this->mockMode) {
            return $this->getMockCustomers($limit);
        }

        return $this->makeRequest('GET', "/customers?limit={$limit}");
    }

    /**
     * Met à jour le statut d'une commande (fonctionnalité administrative)
     */
    public function updateOrderStatus(string $orderId, string $status): array
    {
        if ($this->mockMode) {
            return $this->getMockOrderStatusUpdate($orderId, $status);
        }

        return $this->makeRequest('PUT', "/orders/{$orderId}", ['status' => $status]);
    }

    /**
     * Récupère les statistiques des produits avec données catalogue (fonctionnalité administrative)
     */
    public function getProductStats(): array
    {
        return [
            'lot10' => ['name' => "L'Offrande du Voyageur", 'price' => 60.00],
            'lot25' => ['name' => "La Monnaie des Cinq Royaumes", 'price' => 145.00],
            'lot50-essence' => ['name' => "L'Essence du Marchand", 'price' => 275.00],
            'lot50-tresorerie' => ['name' => "La Trésorerie du Seigneur", 'price' => 275.00],
            'arsenal-aventurier' => ['name' => "Arsenal de l'Aventurier", 'price' => 49.99],
            'butins-ingenieries' => ['name' => "Butins & Ingénieries", 'price' => 36.99],
            'routes-services' => ['name' => "Routes & Services", 'price' => 34.99],
            'triptyques-mysteres' => ['name' => "Triptyques Mystères", 'price' => 59.99]
        ];
    }

    /**
     * Teste la connexion à l'API Snipcart (fonctionnalité administrative)
     */
    public function testConnection(): bool
    {
        if ($this->mockMode) {
            return true;
        }

        try {
            $result = $this->makeRequest('GET', '/orders?limit=1');
            return true;
        } catch (\Exception $e) {
            error_log("Test de connexion Snipcart échoué: " . $e->getMessage());
            return false;
        }
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

    private function getMockShippingRates(): array
    {
        return [
            'rates' => [
                [
                    'cost' => 10.0,
                    'description' => 'Livraison standard mock',
                    'guaranteedDaysToDelivery' => 5,
                    'userDefinedId' => 'standard',
                ],
            ],
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

    private function getMockCustomer(string $id, string $email = 'test@example.com'): array
    {
        return [
            'id' => $id,
            'email' => $email,
            'firstName' => 'Test',
            'lastName' => 'User'
        ];
    }

    /**
     * Données mock pour les fonctionnalités administratives
     */
    private function getMockRecentOrders(int $limit): array
    {
        $orders = [];
        for ($i = 1; $i <= min($limit, 5); $i++) {
            $orders[] = $this->getMockOrder("recent-order-{$i}");
        }
        
        return [
            'totalItems' => $limit,
            'items' => $orders
        ];
    }

    private function getMockSalesStats(?string $from, ?string $to): array
    {
        return [
            'total_orders' => 42,
            'total_revenue' => 2847.58,
            'average_order_value' => 67.80,
            'top_products' => [
                'lot25' => [
                    'name' => 'La Monnaie des Cinq Royaumes',
                    'quantity' => 15,
                    'revenue' => 2175.00
                ],
                'lot10' => [
                    'name' => "L'Offrande du Voyageur",
                    'quantity' => 8,
                    'revenue' => 480.00
                ],
                'arsenal-aventurier' => [
                    'name' => "Arsenal de l'Aventurier",
                    'quantity' => 4,
                    'revenue' => 199.96
                ]
            ],
            'orders_by_status' => [
                'InProgress' => 2,
                'Processed' => 35,
                'Shipped' => 4,
                'Delivered' => 1,
                'Cancelled' => 0
            ]
        ];
    }

    private function getMockCustomers(int $limit): array
    {
        $customers = [];
        for ($i = 1; $i <= min($limit, 10); $i++) {
            $customers[] = [
                'id' => "customer-{$i}",
                'email' => "client{$i}@geekndragon.com",
                'firstName' => "Client{$i}",
                'lastName' => 'Test',
                'creationDate' => date('c', strtotime("-{$i} days"))
            ];
        }
        
        return [
            'totalItems' => $limit,
            'items' => $customers
        ];
    }

    private function getMockOrderStatusUpdate(string $orderId, string $status): array
    {
        return [
            'token' => $orderId,
            'status' => $status,
            'modificationDate' => date('c'),
            'message' => "Statut mis à jour vers {$status} (mode mock)"
        ];
    }
}

<?php
/**
 * Intégration API Snipcart - Geek&Dragon
 * Récupération des données réelles de commandes et statistiques
 */

// Empêcher l'accès direct
if (!defined('ADMIN_ACCESS')) {
    die('Accès interdit');
}

class SnipcartAPI {
    private $apiKey;
    private $secretKey;
    private $apiUrl;
    
    public function __construct() {
        $this->apiKey = SNIPCART_API_KEY;
        $this->secretKey = SNIPCART_SECRET_KEY;
        $this->apiUrl = SNIPCART_API_URL;
    }
    
    /**
     * Effectue une requête à l'API Snipcart
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        if (empty($this->secretKey)) {
            return ['error' => 'Clé API Snipcart non configurée'];
        }
        
        $url = $this->apiUrl . $endpoint;
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Basic ' . base64_encode($this->secretKey . ':'),
                'Accept: application/json',
                'Content-Type: application/json'
            ],
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true
        ]);
        
        if ($data && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            return ['error' => 'Erreur cURL: ' . $error];
        }
        
        if ($httpCode >= 400) {
            return ['error' => 'Erreur API: HTTP ' . $httpCode];
        }
        
        return json_decode($response, true);
    }
    
    /**
     * Récupère les commandes récentes
     */
    public function getRecentOrders($limit = 20) {
        $endpoint = "/orders?limit={$limit}&offset=0";
        return $this->makeRequest($endpoint);
    }
    
    /**
     * Récupère les statistiques de vente
     */
    public function getSalesStats($from = null, $to = null) {
        $from = $from ?: date('Y-m-01'); // Début du mois actuel par défaut
        $to = $to ?: date('Y-m-d'); // Aujourd'hui par défaut
        
        $endpoint = "/orders?from={$from}&to={$to}";
        $orders = $this->makeRequest($endpoint);
        
        if (isset($orders['error'])) {
            return $orders;
        }
        
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
            
            // Comptage des produits
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
        
        // Trier les produits par quantité vendue
        uasort($productSales, function($a, $b) {
            return $b['quantity'] <=> $a['quantity'];
        });
        
        $stats['top_products'] = array_slice($productSales, 0, 5, true);
        
        return $stats;
    }
    
    /**
     * Récupère les détails d'une commande spécifique
     */
    public function getOrder($orderId) {
        $endpoint = "/orders/{$orderId}";
        return $this->makeRequest($endpoint);
    }
    
    /**
     * Récupère les clients
     */
    public function getCustomers($limit = 50) {
        $endpoint = "/customers?limit={$limit}";
        return $this->makeRequest($endpoint);
    }
    
    /**
     * Récupère les produits avec statistiques
     */
    public function getProductStats() {
        // Snipcart ne stocke pas les produits, on utilise notre catalogue
        $products = [
            'lot10' => ['name' => "L'Offrande du Voyageur", 'price' => 60.00],
            'lot25' => ['name' => "La Monnaie des Cinq Royaumes", 'price' => 145.00],
            'lot50-essence' => ['name' => "L'Essence du Marchand", 'price' => 275.00],
            'lot50-tresorerie' => ['name' => "La Trésorerie du Seigneur", 'price' => 275.00],
            'arsenal-aventurier' => ['name' => "Arsenal de l'Aventurier", 'price' => 49.99],
            'butins-ingenieries' => ['name' => "Butins & Ingénieries", 'price' => 36.99],
            'routes-services' => ['name' => "Routes & Services", 'price' => 34.99],
            'triptyques-mysteres' => ['name' => "Triptyques Mystères", 'price' => 59.99]
        ];
        
        return $products;
    }
    
    /**
     * Met à jour le statut d'une commande
     */
    public function updateOrderStatus($orderId, $status) {
        $endpoint = "/orders/{$orderId}";
        $data = ['status' => $status];
        return $this->makeRequest($endpoint, 'PUT', $data);
    }
    
    /**
     * Teste la connexion à l'API
     */
    public function testConnection() {
        $result = $this->makeRequest('/orders?limit=1');
        return !isset($result['error']);
    }
}
?>
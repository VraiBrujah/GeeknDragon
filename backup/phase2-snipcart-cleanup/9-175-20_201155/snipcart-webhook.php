<?php
/**
 * Webhook Snipcart - GeeknDragon
 * ===============================
 * Gestion des événements Snipcart avec thématique D&D
 * 
 * Endpoints:
 * - POST /api/snipcart-webhook.php (événements Snipcart)
 * - GET  /api/products/{id}        (validation produits)
 */

require_once __DIR__ . '/../bootstrap.php';
require_once __DIR__ . '/../vendor/autoload.php';

// Headers CORS et sécurité
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://app.snipcart.com');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Snipcart-RequestToken');

// Gestion des requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

class GeeknDragonSnipcartWebhook
{
    private $secretKey;
    private $productsData;
    private $logFile;

    public function __construct()
    {
        $this->secretKey = $_ENV['SNIPCART_SECRET_API_KEY'] ?? '';
        $this->logFile = __DIR__ . '/../logs/snipcart-' . date('Y-m-d') . '.log';
        
        // Charger les données produits
        $this->loadProducts();
        
        if (empty($this->secretKey)) {
            $this->logError('Snipcart Secret API Key manquante');
            $this->respondError('Configuration invalide', 500);
        }
    }

    /**
     * Point d'entrée principal
     */
    public function handle()
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = $this->getPath();

        try {
            switch ($method) {
                case 'POST':
                    if ($path === '/api/snipcart-webhook.php') {
                        $this->handleWebhook();
                    } else {
                        $this->respondError('Endpoint non trouvé', 404);
                    }
                    break;

                case 'GET':
                    if (strpos($path, '/api/products/') === 0) {
                        $productId = basename($path);
                        $this->handleProductValidation($productId);
                    } else {
                        $this->respondError('Endpoint non trouvé', 404);
                    }
                    break;

                default:
                    $this->respondError('Méthode non supportée', 405);
            }
        } catch (Exception $e) {
            $this->logError('Erreur webhook: ' . $e->getMessage());
            $this->respondError('Erreur serveur', 500);
        }
    }

    /**
     * Gestion des webhooks Snipcart
     */
    private function handleWebhook()
    {
        // Validation du token de sécurité
        $requestToken = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] ?? '';
        if (!$this->validateRequestToken($requestToken)) {
            $this->respondError('Token invalide', 401);
        }

        // Récupération du body
        $body = file_get_contents('php://input');
        $data = json_decode($body, true);

        if (!$data) {
            $this->respondError('Données invalides', 400);
        }

        $eventName = $data['eventName'] ?? '';
        $this->logInfo("Événement reçu: {$eventName}");

        // Dispatch selon le type d'événement
        switch ($eventName) {
            case 'order.completed':
                $this->handleOrderCompleted($data);
                break;

            case 'order.status.changed':
                $this->handleOrderStatusChanged($data);
                break;

            case 'order.tracking.changed':
                $this->handleOrderTrackingChanged($data);
                break;

            case 'shippingrates.fetch':
                $this->handleShippingRatesFetch($data);
                break;

            case 'taxes.calculate':
                $this->handleTaxesCalculate($data);
                break;

            default:
                $this->logInfo("Événement ignoré: {$eventName}");
                $this->respondSuccess(['message' => 'Événement traité']);
        }
    }

    /**
     * Validation d'un produit pour Snipcart
     */
    private function handleProductValidation($productId)
    {
        if (!isset($this->productsData[$productId])) {
            $this->respondError('Produit non trouvé', 404);
        }

        $product = $this->productsData[$productId];
        $lang = $_GET['lang'] ?? 'fr';

        // Structure de réponse Snipcart
        $response = [
            'id' => $productId,
            'name' => $lang === 'fr' ? $product['name'] : $product['name_en'],
            'price' => $product['price'],
            'description' => $this->cleanDescription(
                $lang === 'fr' ? $product['description'] : $product['description_en']
            ),
            'url' => $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . '/api/products/' . $productId,
            'weight' => $this->getProductWeight($productId),
            'currency' => 'CAD',
            'taxable' => true,
            'inventory' => $this->getProductInventory($productId)
        ];

        // Image principale
        if (!empty($product['images'])) {
            $response['image'] = $this->formatImageUrl($product['images'][0]);
        }

        // Champs personnalisés (variantes)
        $customFields = [];
        
        if (!empty($product['multipliers'])) {
            $customFields[] = [
                'name' => 'Multiplicateur',
                'options' => implode('|', $product['multipliers']),
                'required' => true
            ];
        }

        if (!empty($product['languages'])) {
            $customFields[] = [
                'name' => 'Langue',
                'options' => implode('|', $product['languages']),
                'required' => true
            ];
        }

        if (!empty($customFields)) {
            $response['customFields'] = $customFields;
        }

        $this->respondSuccess($response);
    }

    /**
     * Commande complétée - Envoi de confirmations D&D
     */
    private function handleOrderCompleted($data)
    {
        $order = $data['content'] ?? [];
        $orderNumber = $order['invoiceNumber'] ?? '';
        $customerEmail = $order['email'] ?? '';

        $this->logInfo("Commande complétée: {$orderNumber} pour {$customerEmail}");

        // Envoyer email de confirmation avec thème D&D
        $this->sendOrderConfirmationEmail($order);

        // Mettre à jour l'inventaire si nécessaire
        $this->updateInventory($order);

        // Analytics & tracking
        $this->trackOrderCompletion($order);

        $this->respondSuccess([
            'message' => 'Commande traitée avec succès',
            'orderNumber' => $orderNumber
        ]);
    }

    /**
     * Changement de statut de commande
     */
    private function handleOrderStatusChanged($data)
    {
        $order = $data['content'] ?? [];
        $newStatus = $order['status'] ?? '';
        $orderNumber = $order['invoiceNumber'] ?? '';

        $this->logInfo("Statut changé pour {$orderNumber}: {$newStatus}");

        // Actions selon le nouveau statut
        switch ($newStatus) {
            case 'Processed':
                $this->onOrderProcessed($order);
                break;
            case 'Shipped':
                $this->onOrderShipped($order);
                break;
            case 'Delivered':
                $this->onOrderDelivered($order);
                break;
        }

        $this->respondSuccess(['message' => 'Statut mis à jour']);
    }

    /**
     * Calcul des frais de livraison avec thématique D&D
     */
    private function handleShippingRatesFetch($data)
    {
        $content = $data['content'] ?? [];
        $items = $content['items'] ?? [];
        $shippingAddress = $content['shippingAddress'] ?? [];

        // Calculs selon les catégories de produits
        $totalWeight = 0;
        $hasCoins = false;
        $hasCards = false;
        $hasTriptychs = false;

        foreach ($items as $item) {
            $productId = $item['id'];
            $quantity = $item['quantity'];
            
            $weight = $this->getProductWeight($productId);
            $totalWeight += $weight * $quantity;

            // Catégorisation
            if (strpos($productId, 'lot') === 0) $hasCoins = true;
            if (strpos($productId, 'pack-182') === 0) $hasCards = true;
            if (strpos($productId, 'triptyque') === 0) $hasTriptychs = true;
        }

        // Options de livraison avec noms thématiques
        $shippingRates = [];

        // Canada seulement pour l'instant
        if ($shippingAddress['country'] === 'CA') {
            // Livraison standard - "Transport par Caravane"
            $standardRate = $this->calculateStandardShipping($totalWeight, $shippingAddress);
            $shippingRates[] = [
                'cost' => $standardRate,
                'description' => '🐎 Transport par Caravane (5-7 jours)',
                'guaranteedDaysToDelivery' => 7,
                'userDefinedId' => 'standard'
            ];

            // Livraison express - "Vol de Dragon Express"
            if ($totalWeight <= 1000) { // Max 1kg pour express
                $expressRate = $this->calculateExpressShipping($totalWeight, $shippingAddress);
                $shippingRates[] = [
                    'cost' => $expressRate,
                    'description' => '🐉 Vol de Dragon Express (2-3 jours)',
                    'guaranteedDaysToDelivery' => 3,
                    'userDefinedId' => 'express'
                ];
            }

            // Livraison gratuite pour commandes > 150$ - "Portail Magique"
            $totalValue = array_sum(array_map(function($item) {
                return $item['price'] * $item['quantity'];
            }, $items));

            if ($totalValue >= 150) {
                $shippingRates[] = [
                    'cost' => 0,
                    'description' => '✨ Portail Magique GRATUIT (3-5 jours)',
                    'guaranteedDaysToDelivery' => 5,
                    'userDefinedId' => 'free'
                ];
            }
        } else {
            // International - "Expédition Interdimensionnelle"
            $shippingRates[] = [
                'cost' => 25.00,
                'description' => '🌎 Expédition Interdimensionnelle (10-15 jours)',
                'guaranteedDaysToDelivery' => 15,
                'userDefinedId' => 'international'
            ];
        }

        $this->respondSuccess(['rates' => $shippingRates]);
    }

    /**
     * Calcul des taxes
     */
    private function handleTaxesCalculate($data)
    {
        $content = $data['content'] ?? [];
        $shippingAddress = $content['shippingAddress'] ?? [];
        $items = $content['items'] ?? [];

        $subtotal = array_sum(array_map(function($item) {
            return $item['price'] * $item['quantity'];
        }, $items));

        // Taxes canadiennes par province
        $province = $shippingAddress['province'] ?? '';
        $taxRate = $this->getTaxRate($province);

        $taxes = [];
        if ($taxRate > 0) {
            $taxes[] = [
                'name' => 'TPS/TVQ',
                'amount' => round($subtotal * $taxRate, 2),
                'rate' => $taxRate,
                'appliesOnShipping' => false
            ];
        }

        $this->respondSuccess(['taxes' => $taxes]);
    }

    /**
     * Envoi d'email de confirmation avec thème D&D
     */
    private function sendOrderConfirmationEmail($order)
    {
        $to = $order['email'];
        $orderNumber = $order['invoiceNumber'];
        $total = $order['finalGrandTotal'];

        $subject = "🐉 Votre Quête d'Équipement est Complète ! [Commande #{$orderNumber}]";
        
        $htmlBody = $this->generateOrderEmailTemplate($order);

        // Configuration SMTP (utiliser vos paramètres d'env)
        try {
            $this->sendEmail($to, $subject, $htmlBody);
            $this->logInfo("Email de confirmation envoyé à {$to}");
        } catch (Exception $e) {
            $this->logError("Erreur envoi email: " . $e->getMessage());
        }
    }

    /**
     * Génère le template HTML d'email avec thème D&D
     */
    private function generateOrderEmailTemplate($order)
    {
        $orderNumber = $order['invoiceNumber'];
        $total = $order['finalGrandTotal'];
        $items = $order['items'] ?? [];

        $itemsHtml = '';
        foreach ($items as $item) {
            $itemsHtml .= "
                <tr style='border-bottom: 1px solid #d4af37;'>
                    <td style='padding: 15px; color: #f4e4bc;'>
                        <strong>{$item['name']}</strong><br>
                        <small>{$item['description']}</small>
                    </td>
                    <td style='padding: 15px; text-align: center; color: #d4af37;'>
                        {$item['quantity']}
                    </td>
                    <td style='padding: 15px; text-align: right; color: #d4af37; font-weight: bold;'>
                        {$item['totalPrice']}$ CAD
                    </td>
                </tr>
            ";
        }

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='utf-8'>
            <style>
                body { 
                    font-family: 'Georgia', serif; 
                    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                    color: #f4e4bc;
                    margin: 0;
                    padding: 0;
                }
                .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    background: rgba(26,26,26,0.95);
                    border: 2px solid #d4af37;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .header { 
                    background: linear-gradient(135deg, #8b4513 0%, #654321 100%);
                    padding: 30px;
                    text-align: center;
                    border-bottom: 3px solid #d4af37;
                }
                .header h1 { 
                    color: #f4e4bc;
                    font-size: 28px;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                }
                .content { padding: 30px; }
                .order-details {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid #d4af37;
                    border-radius: 8px;
                    margin: 20px 0;
                    overflow: hidden;
                }
                .order-details table { 
                    width: 100%; 
                    border-collapse: collapse; 
                }
                .total { 
                    font-size: 24px;
                    color: #d4af37;
                    font-weight: bold;
                    text-align: center;
                    padding: 20px;
                    background: rgba(212, 175, 55, 0.1);
                    border-top: 2px solid #d4af37;
                }
                .footer {
                    background: rgba(0,0,0,0.5);
                    padding: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #ccc;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>🎉 Félicitations, Aventurier !</h1>
                    <p>Votre quête d'équipement s'est achevée avec succès !</p>
                </div>
                
                <div class='content'>
                    <h2>📋 Détails de votre Commande #{$orderNumber}</h2>
                    
                    <div class='order-details'>
                        <table>
                            <thead>
                                <tr style='background: rgba(212, 175, 55, 0.2);'>
                                    <th style='padding: 15px; text-align: left; color: #d4af37;'>Article</th>
                                    <th style='padding: 15px; text-align: center; color: #d4af37;'>Qté</th>
                                    <th style='padding: 15px; text-align: right; color: #d4af37;'>Prix</th>
                                </tr>
                            </thead>
                            <tbody>
                                {$itemsHtml}
                            </tbody>
                        </table>
                        
                        <div class='total'>
                            Total: {$total}$ CAD
                        </div>
                    </div>
                    
                    <h3>📬 Prochaines Étapes</h3>
                    <ul>
                        <li>📧 Vous recevrez un email de suivi une fois votre commande expédiée</li>
                        <li>📦 Nos artisans préparent votre équipement avec le plus grand soin</li>
                        <li>🚚 Livraison estimée selon l'option choisie</li>
                    </ul>
                    
                    <p><strong>Merci de faire confiance à Geek&Dragon !</strong><br>
                    Que vos aventures soient légendaires ! ⚔️🐉</p>
                </div>
                
                <div class='footer'>
                    <p>Geek&Dragon - Accessoires Immersifs pour Jeux de Rôle<br>
                    <a href='mailto:contact@geekndragon.com' style='color: #d4af37;'>contact@geekndragon.com</a></p>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    // ... [Méthodes utilitaires continues] ...

    private function loadProducts()
    {
        $file = __DIR__ . '/../data/products.json';
        if (file_exists($file)) {
            $this->productsData = json_decode(file_get_contents($file), true);
        } else {
            $this->productsData = [];
        }
    }

    private function getPath()
    {
        return parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    }

    private function validateRequestToken($token)
    {
        // Validation basique du token - à améliorer selon vos besoins
        return !empty($token) && strlen($token) > 20;
    }

    private function cleanDescription($description)
    {
        return strip_tags($description);
    }

    private function getProductWeight($productId)
    {
        $weights = [
            'lot10' => 150,
            'lot25' => 350,
            'lot50-essence' => 700,
            'lot50-tresorerie' => 700,
            'pack-182-arsenal-aventurier' => 300,
            'pack-182-butins-ingenieries' => 300,
            'pack-182-routes-services' => 300,
            'triptyque-aleatoire' => 200
        ];
        return $weights[$productId] ?? 100;
    }

    private function formatImageUrl($imageUrl)
    {
        if (strpos($imageUrl, 'http') === 0) {
            return $imageUrl;
        }
        return $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . $imageUrl;
    }

    private function calculateStandardShipping($weight, $address)
    {
        // Calcul basique - à ajuster selon vos besoins
        $baseRate = 8.99;
        $weightRate = max(0, ($weight - 100) / 100) * 2.50;
        return round($baseRate + $weightRate, 2);
    }

    private function calculateExpressShipping($weight, $address)
    {
        return $this->calculateStandardShipping($weight, $address) + 12.99;
    }

    private function getTaxRate($province)
    {
        $rates = [
            'QC' => 0.14975, // 5% GST + 9.975% PST
            'ON' => 0.13,    // 13% HST
            'BC' => 0.12,    // 5% GST + 7% PST
            'AB' => 0.05,    // 5% GST seulement
            'SK' => 0.11,    // 5% GST + 6% PST
            'MB' => 0.12,    // 5% GST + 7% PST
        ];
        return $rates[$province] ?? 0.05; // GST par défaut
    }

    private function sendEmail($to, $subject, $htmlBody)
    {
        // Configuration SMTP avec vos paramètres d'environnement
        // Implémentation à faire selon votre service d'email
    }

    private function respondSuccess($data)
    {
        http_response_code(200);
        echo json_encode($data);
        exit;
    }

    private function respondError($message, $code = 400)
    {
        http_response_code($code);
        echo json_encode(['error' => $message]);
        exit;
    }

    private function logInfo($message)
    {
        $this->writeLog('INFO', $message);
    }

    private function logError($message)
    {
        $this->writeLog('ERROR', $message);
    }

    private function writeLog($level, $message)
    {
        $timestamp = date('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] {$level}: {$message}" . PHP_EOL;
        file_put_contents($this->logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// Exécution
$webhook = new GeeknDragonSnipcartWebhook();
$webhook->handle();
?>
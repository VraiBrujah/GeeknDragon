<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\SnipcartException;
use GeeknDragon\Service\InvoiceService;
use GeeknDragon\Service\DatabaseService;

/**
 * Point d'entrée unique pour les webhooks Snipcart
 */
class SnipcartWebhookController extends BaseController
{
    private SnipcartClient $client;
    private InvoiceService $invoiceService;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $mockMode = ($config['APP_ENV'] ?? 'production') === 'development';
        $this->client = new SnipcartClient(
            $config['snipcart_api_key'] ?? '',
            $config['snipcart_secret_api_key'] ?? '',
            $mockMode
        );
        
        // Initialiser le service de factures avec base centralisée
        $this->invoiceService = new InvoiceService(DatabaseService::getInstance());
    }

    public function handle(): void
    {
        header('Content-Type: application/json; charset=utf-8');

        try {
            $token = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] ?? '';
            if (!$this->validateToken($token)) {
                $this->json(['errors' => [[
                    'key' => 'invalid-token',
                    'message' => 'Échec de validation du jeton Snipcart'
                ]]], 401);
            }

            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $event = $payload['eventName'] ?? '';
            $content = $payload['content'] ?? [];

            switch ($event) {
                case 'shippingrates.fetch':
                    $this->handleShipping($content);
                    break;
                case 'order.completed':
                    $this->handleOrderCompleted($content);
                    break;
                case 'order.status.changed':
                    $this->handleOrderStatusChanged($content);
                    break;
                default:
                    $this->json(['status' => 'ignored']);
            }
        } catch (SnipcartException $e) {
            $this->json(['errors' => [[
                'key' => 'snipcart-error',
                'message' => $e->getMessage()
            ]]], 500);
        } catch (\Throwable $e) {
            $this->handleError($e, 'SnipcartWebhookController::handle');
        }
    }

    private function handleShipping(array $content): void
    {
        $response = $this->client->getShippingRates($content);
        http_response_code(200);
        echo json_encode($response, JSON_THROW_ON_ERROR);
        exit;
    }

    /**
     * Traite une commande complétée - Synchronise avec la base locale
     */
    private function handleOrderCompleted(array $content): void
    {
        try {
            $result = $this->invoiceService->syncSnipcartOrder($content);
            
            if ($result['success']) {
                error_log("Facture synchronisée: " . $result['invoice_id'] . " pour commande " . ($content['token'] ?? 'inconnue'));
                $this->json(['status' => 'synchronized', 'invoice_id' => $result['invoice_id']]);
            } else {
                error_log("Échec synchronisation facture: " . $result['error']);
                $this->json(['status' => 'error', 'message' => $result['error']], 500);
            }
        } catch (\Exception $e) {
            error_log("Erreur webhook order.completed: " . $e->getMessage());
            $this->json(['status' => 'error', 'message' => 'Erreur de synchronisation'], 500);
        }
    }
    
    /**
     * Traite un changement de statut de commande
     */
    private function handleOrderStatusChanged(array $content): void
    {
        try {
            $orderId = $content['token'] ?? '';
            $newStatus = $content['status'] ?? '';
            
            if (empty($orderId) || empty($newStatus)) {
                $this->json(['status' => 'error', 'message' => 'Données incomplètes'], 400);
                return;
            }
            
            // Récupérer la facture existante
            $invoice = $this->invoiceService->getInvoiceByOrderId($orderId);
            
            if ($invoice) {
                // Synchroniser la commande mise à jour
                $result = $this->invoiceService->syncSnipcartOrder($content);
                
                if ($result['success']) {
                    error_log("Statut facture mis à jour: {$orderId} -> {$newStatus}");
                    $this->json(['status' => 'updated']);
                } else {
                    $this->json(['status' => 'error', 'message' => $result['error']], 500);
                }
            } else {
                // Facture non trouvée, créer si nécessaire
                error_log("Facture non trouvée pour mise à jour statut: {$orderId}");
                $this->json(['status' => 'not_found']);
            }
        } catch (\Exception $e) {
            error_log("Erreur webhook order.status.changed: " . $e->getMessage());
            $this->json(['status' => 'error'], 500);
        }
    }
    

    private function validateToken(string $token): bool
    {
        if (!$token) {
            return false;
        }
        return $this->client->validateToken($token);
    }
}

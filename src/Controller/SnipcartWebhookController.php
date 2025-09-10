<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

use GeeknDragon\Cart\SnipcartClient;
use GeeknDragon\Cart\SnipcartException;

/**
 * Point d'entrée unique pour les webhooks Snipcart
 */
class SnipcartWebhookController extends BaseController
{
    private SnipcartClient $client;

    public function __construct(array $config)
    {
        parent::__construct($config);
        $mockMode = ($config['APP_ENV'] ?? 'production') === 'development';
        $this->client = new SnipcartClient(
            $config['snipcart_api_key'] ?? '',
            $config['snipcart_secret_api_key'] ?? '',
            $mockMode
        );
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
                    // Traitement minimal des commandes
                    $this->json(['status' => 'ok']);
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

    private function validateToken(string $token): bool
    {
        if (!$token) {
            return false;
        }
        return $this->client->validateToken($token);
    }
}

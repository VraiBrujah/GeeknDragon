<?php
declare(strict_types=1);

namespace GeeknDragon\Controller;

/**
 * Point d'entrée unique pour les webhooks Snipcart
 */
class SnipcartWebhookController extends BaseController
{
    public function handle(): void
    {
        header('Content-Type: application/json; charset=utf-8');

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
    }

    private function handleShipping(array $content): void
    {
        $secret = $this->config['snipcart_secret_api_key'] ?? '';
        $ch = curl_init('https://app.snipcart.com/api/shippingrates');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json',
                'Content-Type: application/json'
            ],
            CURLOPT_USERPWD => $secret . ':',
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($content),
            CURLOPT_TIMEOUT => 10,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);
        $response = curl_exec($ch);
        $error = curl_error($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $json = json_decode($response, true);
        if ($response === false || $code !== 200 || $json === null) {
            error_log('Snipcart shippingrates API error: ' . ($error ?: $response));
            $this->json(['errors' => [[
                'key' => 'shipping-api',
                'message' => 'Erreur lors de la récupération des tarifs de livraison'
            ]]], 500);
        }

        http_response_code(200);
        echo $response;
        exit;
    }

    private function validateToken(string $token): bool
    {
        if (!$token) {
            return false;
        }
        $secret = $this->config['snipcart_secret_api_key'] ?? '';
        $ch = curl_init('https://app.snipcart.com/api/requestvalidation/' . urlencode($token));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Accept: application/json'],
            CURLOPT_USERPWD => $secret . ':',
            CURLOPT_TIMEOUT => 5,
        ]);
        curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return $code === 200 || $code === 204;
    }
}

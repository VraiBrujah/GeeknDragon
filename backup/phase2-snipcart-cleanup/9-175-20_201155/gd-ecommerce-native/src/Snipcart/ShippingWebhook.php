<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Webhook d'expédition Snipcart
 * Agit comme proxy vers l'API officielle pour obtenir les tarifs
 */
final class ShippingWebhook
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validateWebhookRequest();

            $payload = file_get_contents('php://input') ?: '';
            $config = include __DIR__ . '/../../config/snipcart.php';
            $secret = $config['secret_key'] ?? '';
            $apiBase = $config['api']['base_url'] ?? 'https://app.snipcart.com/api';
            $endpoint = $config['api']['endpoints']['shipping_rates'] ?? '/shippingrates';
            $url = rtrim($apiBase, '/') . $endpoint;

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => [
                    'Accept: application/json',
                    'Content-Type: application/json',
                    'User-Agent: GeeknDragon-Snipcart/1.0',
                ],
                CURLOPT_USERPWD => $secret . ':',
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => $payload,
                CURLOPT_TIMEOUT => 10,
            ]);

            $response = curl_exec($ch);
            $error = curl_error($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($response === false) {
                error_log('Snipcart shippingrates API error: ' . $error);
                http_response_code(500);
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode(['error' => "Erreur lors de la récupération des tarifs d'expédition"], JSON_UNESCAPED_UNICODE);
                return;
            }

            http_response_code($code > 0 ? $code : 200);
            header('Content-Type: application/json; charset=utf-8');
            echo $response;
        } catch (\Exception $e) {
            error_log('Erreur webhook expédition: ' . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['error' => "Erreur lors de la récupération des tarifs d'expédition"], JSON_UNESCAPED_UNICODE);
        }
    }
}

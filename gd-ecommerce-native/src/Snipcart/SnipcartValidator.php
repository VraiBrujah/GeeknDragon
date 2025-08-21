<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Validateur pour les requêtes Snipcart selon documentation 2025
 * - Webhooks: validation via X-Snipcart-RequestToken
 * - Custom Payment Gateway: validation via publicToken
 */
final class SnipcartValidator
{
    /**
     * Valide une requête webhook Snipcart entrante
     * Utilise X-Snipcart-RequestToken selon la doc officielle 2025
     */
    public static function validateWebhookRequest(): void
    {
        $config = include __DIR__ . '/../../config/snipcart.php';
        $secretKey = $config['secret_key'];
        
        if (empty($secretKey)) {
            throw new \RuntimeException('Clé secrète Snipcart non configurée');
        }
        
        // Récupération du token depuis le header (avec gestion de la casse)
        $token = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] 
               ?? $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] 
               ?? $_SERVER['HTTP_X_Snipcart_Requesttoken'] 
               ?? '';
        
        if (empty($token)) {
            http_response_code(401);
            throw new \RuntimeException('Token Snipcart manquant dans les headers');
        }
        
        if (!self::validateWebhookToken($token, $secretKey)) {
            http_response_code(403);
            throw new \RuntimeException('Token Snipcart invalide');
        }
    }
    
    /**
     * Valide une requête de passerelle de paiement personnalisée
     * Utilise publicToken selon la doc officielle 2025
     */
    public static function validatePaymentGatewayRequest(): void
    {
        $publicToken = $_GET['publicToken'] ?? $_POST['publicToken'] ?? '';
        
        if (empty($publicToken)) {
            http_response_code(401);
            throw new \RuntimeException('publicToken manquant');
        }
        
        if (!self::validatePaymentGatewayToken($publicToken)) {
            http_response_code(403);
            throw new \RuntimeException('publicToken invalide');
        }
    }
    
    /**
     * Valide le token webhook via l'API officielle Snipcart
     * Endpoint: https://app.snipcart.com/api/requestvalidation/{token}
     */
    private static function validateWebhookToken(string $token, string $secretKey): bool
    {
        try {
            $config = include __DIR__ . '/../../config/snipcart.php';
            $apiBase = $config['api']['base_url'] ?? 'https://app.snipcart.com/api';
            $endpoint = $config['api']['endpoints']['request_validation'] ?? '/requestvalidation/';
            $validationUrl = rtrim($apiBase, '/') . $endpoint . urlencode($token);
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'Authorization: Basic ' . base64_encode($secretKey . ':'),
                        'Accept: application/json',
                        'User-Agent: GeeknDragon-Snipcart/1.0'
                    ],
                    'timeout' => 10
                ]
            ]);
            
            $response = file_get_contents($validationUrl, false, $context);
            
            if ($response === false) {
                error_log('Erreur validation webhook token: impossible de contacter l\'API Snipcart');
                return false;
            }
            
            // Un statut HTTP 200 indique que le token est valide
            if (isset($http_response_header)) {
                foreach ($http_response_header as $header) {
                    if (strpos($header, 'HTTP/') === 0) {
                        $statusCode = (int) substr($header, 9, 3);
                        return $statusCode === 200;
                    }
                }
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Erreur validation webhook token: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Valide le publicToken via l'API officielle Snipcart
     * Endpoint: https://payment.snipcart.com/api/public/custom-payment-gateway/validate
     */
    private static function validatePaymentGatewayToken(string $publicToken): bool
    {
        try {
            $validationUrl = 'https://payment.snipcart.com/api/public/custom-payment-gateway/validate?publicToken=' . urlencode($publicToken);
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'Accept: application/json',
                        'User-Agent: GeeknDragon-Snipcart/1.0'
                    ],
                    'timeout' => 10
                ]
            ]);
            
            $response = file_get_contents($validationUrl, false, $context);
            
            if ($response === false) {
                error_log('Erreur validation payment gateway token: impossible de contacter l\'API Snipcart');
                return false;
            }
            
            // Vérifier le status code HTTP
            if (isset($http_response_header)) {
                foreach ($http_response_header as $header) {
                    if (strpos($header, 'HTTP/') === 0) {
                        $statusCode = (int) substr($header, 9, 3);
                        return $statusCode === 200;
                    }
                }
            }
            
            return true;
            
        } catch (\Exception $e) {
            error_log('Erreur validation payment gateway token: ' . $e->getMessage());
            return false;
        }
    }
}
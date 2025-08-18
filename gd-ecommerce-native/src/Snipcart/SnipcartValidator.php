<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Validateur pour les requêtes Snipcart
 * Vérifie la signature/token pour s'assurer que les requêtes viennent bien de Snipcart
 */
final class SnipcartValidator
{
    /**
     * Valide une requête entrante de Snipcart
     * 
     * @throws \RuntimeException Si la validation échoue
     */
    public static function validateIncoming(): void
    {
        $config = include __DIR__ . '/../../config/snipcart.php';
        $secretKey = $config['secret_key'];
        
        if (empty($secretKey)) {
            throw new \RuntimeException('Clé secrète Snipcart non configurée');
        }
        
        // Pour les webhooks, Snipcart envoie un token dans les headers
        $token = $_SERVER['HTTP_X_SNIPCART_REQUESTTOKEN'] ?? '';
        
        if (empty($token)) {
            http_response_code(401);
            throw new \RuntimeException('Token Snipcart manquant');
        }
        
        // Validation basique du token
        // En production, vous devriez implémenter une validation HMAC plus robuste
        if (!self::validateToken($token, $secretKey)) {
            http_response_code(403);
            throw new \RuntimeException('Token Snipcart invalide');
        }
    }
    
    /**
     * Valide le token Snipcart via l'API officielle
     */
    private static function validateToken(string $token, string $secretKey): bool
    {
        try {
            // Utiliser l'API Snipcart pour valider le token selon la doc 2025
            $validationUrl = 'https://app.snipcart.com/api/requestvalidation/' . urlencode($token);
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'header' => [
                        'Authorization: Basic ' . base64_encode($secretKey . ':'),
                        'Accept: application/json'
                    ],
                    'timeout' => 10
                ]
            ]);
            
            $response = file_get_contents($validationUrl, false, $context);
            
            if ($response === false) {
                error_log('Erreur validation token Snipcart: impossible de contacter l\'API');
                return false;
            }
            
            $data = json_decode($response, true);
            return isset($data['valid']) && $data['valid'] === true;
            
        } catch (\Exception $e) {
            error_log('Erreur validation token Snipcart: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Valide une requête de passerelle de paiement
     */
    public static function validatePaymentGatewayRequest(): void
    {
        // Validation spécifique pour la passerelle de paiement
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (!str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            throw new \RuntimeException('Token d\'autorisation manquant');
        }
        
        $token = substr($authHeader, 7);
        $config = include __DIR__ . '/../../config/snipcart.php';
        
        if (!hash_equals($config['secret_key'], $token)) {
            http_response_code(403);
            throw new \RuntimeException('Token d\'autorisation invalide');
        }
    }
}
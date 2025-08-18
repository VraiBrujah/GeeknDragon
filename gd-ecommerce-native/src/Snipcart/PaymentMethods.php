<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Endpoint des méthodes de paiement Snipcart
 * Conforme à l'API Custom Payment Gateway 2025
 */
final class PaymentMethods
{
    public static function handle(): void
    {
        try {
            // Valider le token public Snipcart
            self::validatePublicToken();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            
            // Récupérer les détails de la session de paiement si nécessaire
            $paymentSessionId = $payload['paymentSessionId'] ?? '';
            
            // Retourner les méthodes de paiement disponibles selon la doc Snipcart
            $methods = [
                [
                    'id' => 'stripe_card',
                    'name' => 'Carte de crédit / débit',
                    'description' => 'Paiement sécurisé par Stripe',
                    'flow' => 'server_side', // Traitement côté serveur sans redirection
                    'isEnabled' => true
                ]
            ];
            
            // Logging pour diagnostic
            error_log('Snipcart Payment Methods demandées: ' . json_encode([
                'payment_session_id' => $paymentSessionId,
                'methods_count' => count($methods),
                'timestamp' => date('c')
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($methods, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur méthodes de paiement: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'error' => 'Erreur lors de la récupération des méthodes de paiement',
                'details' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Valide le token public selon la documentation Snipcart
     */
    private static function validatePublicToken(): void
    {
        $publicToken = $_GET['publicToken'] ?? '';
        
        if (!$publicToken) {
            throw new \InvalidArgumentException('Token public manquant');
        }
        
        // Valider le token via l'API Snipcart
        $stripeClient = new StripeClient();
        $client = $stripeClient->getHttpClient();
        
        try {
            $response = $client->get('https://payment.snipcart.com/api/public/custom-payment-gateway/validate', [
                'query' => ['publicToken' => $publicToken]
            ]);
            
            $validation = json_decode($response->getBody()->getContents(), true);
            
            if (!$validation || !($validation['isValid'] ?? false)) {
                throw new \InvalidArgumentException('Token public invalide');
            }
            
        } catch (\Exception $e) {
            error_log('Erreur validation token public: ' . $e->getMessage());
            throw new \InvalidArgumentException('Validation du token public échouée');
        }
    }
}
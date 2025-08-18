<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Endpoint des méthodes de paiement pour custom payment gateway
 * Conforme à l'API Snipcart 2025
 */
final class PaymentMethods
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validatePaymentGatewayRequest();
            
            // Méthodes de paiement supportées
            $methods = [
                [
                    'id' => 'stripe_card',
                    'name' => 'Carte de crédit / débit',
                    'description' => 'Paiement sécurisé par Stripe',
                    'flow' => 'server_side', // Pas de redirection, traitement côté serveur
                    'isEnabled' => true
                ]
            ];
            
            // Logging pour diagnostic
            error_log('Snipcart Payment Methods demandées: ' . json_encode([
                'methods_count' => count($methods),
                'timestamp' => date('c'),
                'public_token' => $_GET['publicToken'] ?? 'missing'
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
}
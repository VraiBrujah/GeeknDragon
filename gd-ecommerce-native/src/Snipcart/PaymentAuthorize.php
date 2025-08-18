<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Endpoint d'autorisation de paiement
 * Crée et confirme un PaymentIntent Stripe
 */
final class PaymentAuthorize
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validatePaymentGatewayRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $invoice = $payload['invoice'] ?? [];
            
            // Données de la facture
            $amount = (int) round(($invoice['amount'] ?? 0) * 100); // Convertir en cents
            $currency = strtolower($invoice['currency'] ?? 'cad');
            $orderId = $invoice['number'] ?? '';
            $customerEmail = $invoice['email'] ?? '';
            
            // Payment method depuis votre UI (Stripe Elements)
            $paymentMethodId = $payload['paymentMethodId'] ?? $_POST['payment_method_id'] ?? null;
            
            if (!$paymentMethodId) {
                throw new \InvalidArgumentException('payment_method_id manquant');
            }
            
            if ($amount <= 0) {
                throw new \InvalidArgumentException('Montant invalide');
            }
            
            $stripeClient = new StripeClient();
            
            // Métadonnées pour traçabilité
            $metadata = [
                'source' => 'geekndragon_snipcart',
                'order_id' => $orderId,
                'customer_email' => $customerEmail,
                'public_token' => $_GET['publicToken'] ?? ''
            ];
            
            // Créer et confirmer le PaymentIntent
            $paymentIntent = $stripeClient->createPaymentIntent([
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethodId,
                'confirmation_method' => 'manual',
                'confirm' => true,
                'capture_method' => 'automatic', // Ou 'manual' pour capture en 2 temps
                'metadata' => $metadata,
                'description' => "Commande Geek & Dragon #{$orderId}",
                'receipt_email' => $customerEmail
            ]);
            
            // Déterminer le statut de la réponse selon Snipcart
            $status = self::determineStatus($paymentIntent);
            $instructions = self::getStatusInstructions($paymentIntent->status);
            
            $result = [
                'status' => $status,
                'transactionId' => $paymentIntent->id,
                'instructions' => $instructions
            ];
            
            // Ajouter le client_secret pour 3D Secure si nécessaire
            if ($paymentIntent->status === 'requires_action') {
                $result['clientSecret'] = $paymentIntent->client_secret;
            }
            
            // Logging pour diagnostic
            error_log('Snipcart Payment Authorize: ' . json_encode([
                'payment_intent_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'amount' => $amount,
                'currency' => $currency,
                'order_id' => $orderId
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur autorisation paiement: ' . $e->getMessage());
            http_response_code(500);
            
            $errorResult = [
                'status' => 'failed',
                'transactionId' => null,
                'instructions' => 'Erreur lors du traitement du paiement: ' . $e->getMessage()
            ];
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($errorResult, JSON_UNESCAPED_UNICODE);
        }
    }
    
    /**
     * Détermine le statut selon les spécifications Snipcart
     */
    private static function determineStatus(\Stripe\PaymentIntent $paymentIntent): string
    {
        switch ($paymentIntent->status) {
            case 'succeeded':
                return 'success';
                
            case 'requires_capture':
                return 'success'; // Autorisé, en attente de capture
                
            case 'requires_action':
            case 'requires_source_action':
                return 'requires_action'; // 3D Secure requis
                
            case 'requires_payment_method':
                return 'failed'; // Méthode de paiement refusée
                
            case 'processing':
                return 'processing'; // En cours de traitement
                
            default:
                return 'failed';
        }
    }
    
    /**
     * Retourne les instructions selon le statut
     */
    private static function getStatusInstructions(string $status): ?string
    {
        switch ($status) {
            case 'requires_action':
            case 'requires_source_action':
                return 'Authentification 3D Secure requise';
                
            case 'requires_payment_method':
                return 'Méthode de paiement refusée, veuillez essayer une autre carte';
                
            case 'processing':
                return 'Paiement en cours de traitement';
                
            case 'succeeded':
                return 'Paiement confirmé avec succès';
                
            case 'requires_capture':
                return 'Paiement autorisé, en attente de capture';
                
            default:
                return null;
        }
    }
}
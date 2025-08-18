<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Endpoint d'autorisation de paiement
 * Crée un PaymentIntent Stripe et l'autorise
 */
final class PaymentAuthorize
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validatePaymentGatewayRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $invoice = $payload['invoice'] ?? [];
            
            $amount = (int) round(($invoice['amount'] ?? 0) * 100); // Convertir en cents
            $currency = strtolower($invoice['currency'] ?? 'cad');
            
            // Récupérer le payment_method depuis la requête
            $paymentMethodId = $payload['paymentMethodId'] ?? $_POST['payment_method_id'] ?? null;
            
            if (!$paymentMethodId) {
                throw new \InvalidArgumentException('payment_method_id manquant');
            }
            
            $stripeClient = new StripeClient();
            $stripe = $stripeClient->getClient();
            
            // Métadonnées pour traçabilité
            $metadata = [
                'source' => 'geekndragon_snipcart',
                'invoice_id' => $invoice['id'] ?? '',
                'order_id' => $payload['orderId'] ?? '',
                'customer_email' => $invoice['email'] ?? ''
            ];
            
            // Créer et confirmer le PaymentIntent
            $paymentIntent = $stripe->paymentIntents->create([
                'amount' => $amount,
                'currency' => $currency,
                'payment_method' => $paymentMethodId,
                'confirmation_method' => 'manual',
                'confirm' => true,
                'capture_method' => 'automatic', // Capture immédiate, changez en 'manual' pour capture en 2 temps
                'metadata' => $metadata,
                'description' => 'Commande Geek & Dragon - ' . ($invoice['id'] ?? 'N/A')
            ]);
            
            // Déterminer le statut de la réponse
            $status = 'failed';
            $instructions = null;
            
            switch ($paymentIntent->status) {
                case 'succeeded':
                    $status = 'success';
                    break;
                    
                case 'requires_capture':
                    $status = 'success'; // Autorisé, en attente de capture
                    break;
                    
                case 'requires_action':
                case 'requires_source_action':
                    $status = 'requires_action';
                    $instructions = 'Authentification 3D Secure requise';
                    break;
                    
                case 'requires_payment_method':
                    $status = 'failed';
                    $instructions = 'Méthode de paiement refusée';
                    break;
            }
            
            $result = [
                'status' => $status,
                'transactionId' => $paymentIntent->id,
                'instructions' => $instructions,
                'clientSecret' => $paymentIntent->client_secret // Pour gestion 3DS côté client
            ];
            
            // Logging pour diagnostic
            error_log('Snipcart Payment Authorize: ' . json_encode([
                'payment_intent_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'amount' => $amount,
                'currency' => $currency
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur autorisation paiement: ' . $e->getMessage());
            http_response_code(500);
            
            $errorResult = [
                'status' => 'failed',
                'transactionId' => null,
                'instructions' => 'Erreur lors du traitement du paiement'
            ];
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($errorResult, JSON_UNESCAPED_UNICODE);
        }
    }
}
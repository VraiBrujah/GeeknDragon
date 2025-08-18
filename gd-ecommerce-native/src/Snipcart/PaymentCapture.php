<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Endpoint de capture de paiement
 * Capture un PaymentIntent Stripe préalablement autorisé
 */
final class PaymentCapture
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validatePaymentGatewayRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $transactionId = $payload['transactionId'] ?? '';
            $amount = isset($payload['amount']) ? (int)($payload['amount'] * 100) : null; // Optionnel, pour capture partielle
            
            if (!$transactionId) {
                throw new \InvalidArgumentException('transactionId manquant');
            }
            
            $stripeClient = new StripeClient();
            $stripe = $stripeClient->getClient();
            
            $captureData = [];
            if ($amount !== null) {
                $captureData['amount_to_capture'] = $amount;
            }
            
            $paymentIntent = $stripe->paymentIntents->capture($transactionId, $captureData);
            
            $result = [
                'status' => $paymentIntent->status === 'succeeded' ? 'success' : 'failed',
                'transactionId' => $paymentIntent->id,
                'amount' => $paymentIntent->amount_received
            ];
            
            // Logging pour diagnostic
            error_log('Snipcart Payment Capture: ' . json_encode([
                'payment_intent_id' => $paymentIntent->id,
                'status' => $paymentIntent->status,
                'amount_captured' => $paymentIntent->amount_received
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur capture paiement: ' . $e->getMessage());
            http_response_code(500);
            
            $errorResult = [
                'status' => 'failed',
                'transactionId' => $payload['transactionId'] ?? null,
                'error' => 'Erreur lors de la capture du paiement'
            ];
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($errorResult, JSON_UNESCAPED_UNICODE);
        }
    }
}
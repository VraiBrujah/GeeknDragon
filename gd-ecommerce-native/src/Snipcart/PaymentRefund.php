<?php

declare(strict_types=1);

namespace App\Snipcart;

/**
 * Endpoint de remboursement
 * Crée un remboursement Stripe pour un PaymentIntent
 */
final class PaymentRefund
{
    public static function handle(): void
    {
        try {
            SnipcartValidator::validatePaymentGatewayRequest();
            
            $payload = json_decode(file_get_contents('php://input'), true) ?: [];
            $transactionId = $payload['transactionId'] ?? '';
            $amount = isset($payload['amount']) ? (int)($payload['amount'] * 100) : null; // En cents, null = remboursement total
            $reason = $payload['reason'] ?? 'requested_by_customer';
            
            if (!$transactionId) {
                throw new \InvalidArgumentException('transactionId manquant');
            }
            
            // Valider la raison
            $validReasons = ['requested_by_customer', 'duplicate', 'fraudulent'];
            if (!in_array($reason, $validReasons, true)) {
                $reason = 'requested_by_customer';
            }
            
            $stripeClient = new StripeClient();
            
            // Créer le remboursement
            $refund = $stripeClient->createRefund($transactionId, $amount, $reason);
            
            $result = [
                'status' => $refund->status === 'succeeded' ? 'success' : 'failed',
                'refundId' => $refund->id,
                'transactionId' => $transactionId,
                'amount' => $refund->amount,
                'reason' => $refund->reason
            ];
            
            // Logging pour diagnostic
            error_log('Snipcart Payment Refund: ' . json_encode([
                'refund_id' => $refund->id,
                'payment_intent_id' => $transactionId,
                'status' => $refund->status,
                'amount' => $refund->amount,
                'reason' => $refund->reason,
                'refund_amount_requested' => $amount
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur remboursement: ' . $e->getMessage());
            http_response_code(500);
            
            $errorResult = [
                'status' => 'failed',
                'transactionId' => $payload['transactionId'] ?? null,
                'error' => 'Erreur lors du remboursement: ' . $e->getMessage()
            ];
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($errorResult, JSON_UNESCAPED_UNICODE);
        }
    }
}
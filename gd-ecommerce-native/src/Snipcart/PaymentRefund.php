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
            
            $stripeClient = new StripeClient();
            $stripe = $stripeClient->getClient();
            
            $refundData = [
                'payment_intent' => $transactionId,
                'reason' => $reason,
                'metadata' => [
                    'source' => 'geekndragon_snipcart',
                    'refund_reason' => $reason
                ]
            ];
            
            if ($amount !== null) {
                $refundData['amount'] = $amount;
            }
            
            $refund = $stripe->refunds->create($refundData);
            
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
                'reason' => $refund->reason
            ]));
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($result, JSON_UNESCAPED_UNICODE);
            
        } catch (\Exception $e) {
            error_log('Erreur remboursement: ' . $e->getMessage());
            http_response_code(500);
            
            $errorResult = [
                'status' => 'failed',
                'transactionId' => $payload['transactionId'] ?? null,
                'error' => 'Erreur lors du remboursement'
            ];
            
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($errorResult, JSON_UNESCAPED_UNICODE);
        }
    }
}
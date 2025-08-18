<?php

declare(strict_types=1);

namespace App\Snipcart;

use Stripe\StripeClient as BaseStripeClient;

/**
 * Wrapper pour le client Stripe avec configuration GeekNDragon
 */
final class StripeClient
{
    private BaseStripeClient $stripe;
    private array $config;
    
    public function __construct()
    {
        $this->config = include __DIR__ . '/../../config/stripe.php';
        
        if (empty($this->config['secret_key'])) {
            throw new \InvalidArgumentException('Clé secrète Stripe non configurée');
        }
        
        $this->stripe = new BaseStripeClient($this->config['secret_key']);
    }
    
    public function getClient(): BaseStripeClient
    {
        return $this->stripe;
    }
    
    public function getConfig(): array
    {
        return $this->config;
    }
    
    /**
     * Crée un PaymentIntent avec la configuration par défaut
     */
    public function createPaymentIntent(array $options): \Stripe\PaymentIntent
    {
        $defaultOptions = [
            'currency' => $this->config['default_currency'],
            'metadata' => [
                'source' => 'geekndragon_snipcart',
                'created_at' => date('c')
            ]
        ];
        
        $mergedOptions = array_merge($defaultOptions, $this->config['payment_intent_options'], $options);
        
        return $this->stripe->paymentIntents->create($mergedOptions);
    }
    
    /**
     * Confirme un PaymentIntent
     */
    public function confirmPaymentIntent(string $paymentIntentId, array $options = []): \Stripe\PaymentIntent
    {
        return $this->stripe->paymentIntents->confirm($paymentIntentId, $options);
    }
    
    /**
     * Capture un PaymentIntent
     */
    public function capturePaymentIntent(string $paymentIntentId, ?int $amount = null): \Stripe\PaymentIntent
    {
        $options = [];
        if ($amount !== null) {
            $options['amount_to_capture'] = $amount;
        }
        
        return $this->stripe->paymentIntents->capture($paymentIntentId, $options);
    }
    
    /**
     * Crée un remboursement
     */
    public function createRefund(string $paymentIntentId, ?int $amount = null, string $reason = 'requested_by_customer'): \Stripe\Refund
    {
        $options = [
            'payment_intent' => $paymentIntentId,
            'reason' => $reason,
            'metadata' => [
                'source' => 'geekndragon_snipcart',
                'refund_reason' => $reason,
                'refunded_at' => date('c')
            ]
        ];
        
        if ($amount !== null) {
            $options['amount'] = $amount;
        }
        
        return $this->stripe->refunds->create($options);
    }
}
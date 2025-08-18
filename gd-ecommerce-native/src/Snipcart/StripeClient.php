<?php

declare(strict_types=1);

namespace App\Snipcart;

use Stripe\StripeClient as BaseStripeClient;
use GuzzleHttp\Client;

/**
 * Wrapper pour le client Stripe avec support HTTP pour validation Snipcart
 */
final class StripeClient
{
    private BaseStripeClient $stripe;
    private Client $httpClient;
    private array $config;
    
    public function __construct()
    {
        $this->config = include __DIR__ . '/../../config/stripe.php';
        $this->stripe = new BaseStripeClient($this->config['secret_key']);
        
        // Client HTTP pour les validations Snipcart
        $this->httpClient = new Client([
            'timeout' => 10,
            'headers' => [
                'User-Agent' => 'GeeknDragon-Snipcart/1.0'
            ]
        ]);
    }
    
    public function getClient(): BaseStripeClient
    {
        return $this->stripe;
    }
    
    public function getHttpClient(): Client
    {
        return $this->httpClient;
    }
    
    public function getConfig(): array
    {
        return $this->config;
    }
}
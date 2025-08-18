<?php
/**
 * Configuration Stripe pour passerelle de paiement
 */

return [
    'public_key' => $_ENV['STRIPE_PUBLIC_KEY'] ?? '',
    'secret_key' => $_ENV['STRIPE_SECRET_KEY'] ?? '',
    'test_mode' => true, // À modifier en production
    'webhook_secret' => $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '',
    
    // Configuration PaymentIntents
    'payment_intent_options' => [
        'automatic_payment_methods' => [
            'enabled' => true,
        ],
        'capture_method' => 'automatic', // ou 'manual' pour capture en 2 temps
        'confirmation_method' => 'automatic',
    ],
    
    // Devises supportées
    'supported_currencies' => ['cad', 'usd'],
    'default_currency' => 'cad',
];
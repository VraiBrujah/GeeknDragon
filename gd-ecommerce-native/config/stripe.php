<?php
/**
 * Configuration Stripe
 */

return [
    'secret_key' => $_ENV['STRIPE_SECRET_KEY'] ?? '',
    'publishable_key' => $_ENV['STRIPE_PUBLISHABLE_KEY'] ?? '',
    'webhook_secret' => $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '',
    'currency' => 'cad',
    'payment_methods' => ['card'],
    'test_mode' => ($_ENV['STRIPE_TEST_MODE'] ?? 'true') === 'true'
];
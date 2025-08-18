<?php
/**
 * Configuration Snipcart pour intégration backend transparente
 */

return [
    'public_key' => $_ENV['SNIPCART_API_KEY'] ?? '',
    'secret_key' => $_ENV['SNIPCART_SECRET_API_KEY'] ?? '',
    'test_mode' => true, // À modifier en production
    'language' => $_ENV['SNIPCART_LANGUAGE'] ?? 'fr',
    'add_product_behavior' => $_ENV['SNIPCART_ADD_PRODUCT_BEHAVIOR'] ?? 'standard',
    
    // URLs des endpoints (à adapter selon votre domaine)
    'base_url' => 'https://api.geekndragon.com',
    'webhook_endpoints' => [
        'shipping' => '/snipcart/shipping',
        'taxes' => '/snipcart/taxes',
        'order_completed' => '/snipcart/order/completed',
    ],
    'payment_gateway_endpoints' => [
        'methods' => '/snipcart/payment/methods',
        'authorize' => '/snipcart/payment/authorize',
        'capture' => '/snipcart/payment/capture',
        'refund' => '/snipcart/payment/refund',
    ],
];
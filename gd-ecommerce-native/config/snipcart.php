<?php
/**
 * Configuration Snipcart pour intégration backend transparente
 */

return [
    'public_key' => $_ENV['SNIPCART_API_KEY']
        ?? $_SERVER['SNIPCART_API_KEY']
        ?? '',
    'secret_key' => $_ENV['SNIPCART_SECRET_API_KEY']
        ?? $_SERVER['SNIPCART_SECRET_API_KEY']
        ?? '',
    'test_mode' => ($_ENV['SNIPCART_TEST_MODE'] ?? 'true') === 'true',
    'language' => $_ENV['SNIPCART_LANGUAGE'] ?? 'fr',
    'add_product_behavior' => $_ENV['SNIPCART_ADD_PRODUCT_BEHAVIOR'] ?? 'standard',

    // URLs des endpoints de notre backend
    'base_url' => $_ENV['SNIPCART_BASE_URL'] ?? 'https://api.geekndragon.com',
    'webhook_endpoints' => [
        'shipping' => $_ENV['SNIPCART_WEBHOOK_SHIPPING'] ?? '/snipcart/shipping',
        'taxes' => $_ENV['SNIPCART_WEBHOOK_TAXES'] ?? '/snipcart/taxes',
        'order_completed' => $_ENV['SNIPCART_WEBHOOK_ORDER_COMPLETED'] ?? '/snipcart/order/completed',
    ],
    'payment_gateway_endpoints' => [
        'methods' => '/snipcart/payment/methods',
        'authorize' => '/snipcart/payment/authorize',
        'capture' => '/snipcart/payment/capture',
        'refund' => '/snipcart/payment/refund',
    ],

    // Configuration de l'API Snipcart
    'api' => [
        'base_url' => $_ENV['SNIPCART_API_BASE_URL'] ?? 'https://app.snipcart.com/api',
        'endpoints' => [
            'shipping_rates' => $_ENV['SNIPCART_API_SHIPPING_RATES'] ?? '/shippingrates',
            'request_validation' => '/requestvalidation/',
        ],
    ],
];

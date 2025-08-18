<?php
/**
 * Configuration Snipcart
 */

return [
    'public_key' => $_ENV['SNIPCART_API_KEY'] ?? '',
    'secret_key' => $_ENV['SNIPCART_SECRET_API_KEY'] ?? '',
    'test_mode' => ($_ENV['SNIPCART_TEST_MODE'] ?? 'true') === 'true',
    'language' => $_ENV['SNIPCART_LANGUAGE'] ?? 'fr',
    
    // URLs des webhooks (configurés dans le dashboard Snipcart)
    'webhooks' => [
        'shipping' => '/snipcart/shipping',
        'taxes' => '/snipcart/taxes',
        'order_completed' => '/snipcart/order/completed'
    ],
    
    // URLs de la passerelle de paiement personnalisée
    'payment_gateway' => [
        'methods' => '/snipcart/payment/methods',
        'authorize' => '/snipcart/payment/authorize',
        'capture' => '/snipcart/payment/capture',
        'refund' => '/snipcart/payment/refund'
    ],
    
    // Configuration d'expédition
    'shipping' => [
        'free_shipping_threshold' => 75.00, // CAD
        'default_rates' => [
            [
                'cost' => 12.99,
                'description' => 'Standard (2–5 jours ouvrables)',
                'guaranteedDaysToDelivery' => 5
            ],
            [
                'cost' => 24.99,
                'description' => 'Express (1–2 jours ouvrables)',
                'guaranteedDaysToDelivery' => 2
            ]
        ]
    ],
    
    // Configuration des taxes
    'taxes' => [
        'canada' => [
            'tps' => 0.05,
            'tvq' => 0.09975
        ]
    ]
];
<?php
return [
    'publicToken' => $_ENV['SNIPCART_API_KEY']
        ?? $_SERVER['SNIPCART_API_KEY']
        ?? '',
    'secret' => $_ENV['SNIPCART_SECRET_API_KEY']
        ?? $_SERVER['SNIPCART_SECRET_API_KEY']
        ?? '',
    'endpoints' => [
        'shipping' => '/snipcart/shipping',
        'taxes' => '/snipcart/taxes',
        'order_completed' => '/snipcart/order/completed',
        'payment_methods' => '/snipcart/payment/methods',
        'payment_authorize' => '/snipcart/payment/authorize',
        'payment_capture' => '/snipcart/payment/capture',
        'payment_refund' => '/snipcart/payment/refund',
    ],
];

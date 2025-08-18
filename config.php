<?php

$snipcartConfig = require __DIR__ . '/config/snipcart.php';
$stripeConfig   = require __DIR__ . '/config/stripe.php';

return [
    'smtp' => [
        'host' => $_ENV['SMTP_HOST']
            ?? $_SERVER['SMTP_HOST'],
        'username' => $_ENV['SMTP_USERNAME']
            ?? $_SERVER['SMTP_USERNAME'],
        'password' => $_ENV['SMTP_PASSWORD']
            ?? $_SERVER['SMTP_PASSWORD'],
        'port' => (
            $_ENV['SMTP_PORT']
            ?? $_SERVER['SMTP_PORT']
        ) ?: 587,
    ],
    'snipcart' => $snipcartConfig,
    'stripe'   => $stripeConfig,
    'snipcart_api_key' => $snipcartConfig['publicToken'],
    'snipcart_secret_api_key' => $snipcartConfig['secret'],
];

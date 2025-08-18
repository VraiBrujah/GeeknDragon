<?php
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
    'snipcart_api_key' => $_ENV['SNIPCART_API_KEY']
        ?? $_SERVER['SNIPCART_API_KEY'],
    'snipcart_secret_api_key' => $_ENV['SNIPCART_SECRET_API_KEY']
        ?? $_SERVER['SNIPCART_SECRET_API_KEY'],
];

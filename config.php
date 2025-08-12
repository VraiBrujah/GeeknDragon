<?php
return [
    'smtp' => [
        'host' => getenv('SMTP_HOST'),
        'username' => getenv('SMTP_USERNAME'),
        'password' => getenv('SMTP_PASSWORD'),
        'port' => getenv('SMTP_PORT') ?: 587,
    ],
    'recaptcha_site_key' => getenv('RECAPTCHA_SITE_KEY'),
    'recaptcha_secret_key' => getenv('RECAPTCHA_SECRET_KEY'),
    'snipcart_api_key' => getenv('SNIPCART_API_KEY'),
    'snipcart_secret_api_key' => getenv('SNIPCART_SECRET_API_KEY'),
];

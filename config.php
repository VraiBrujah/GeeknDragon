<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

return [
    'snipcart_api_key'        => getSecureEnvVar('SNIPCART_API_KEY', 'test_api_key'),
    'snipcart_secret_api_key' => getSecureEnvVar('SNIPCART_SECRET_API_KEY', 'test_secret_key'),
];

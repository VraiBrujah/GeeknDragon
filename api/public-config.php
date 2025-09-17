<?php
/**
 * Expose public configuration for client-side scripts.
 * Only returns non-sensitive values (e.g., Snipcart public API key).
 */
declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    $config = require __DIR__ . '/../config.php';
    $public = [
        'snipcartPublicApiKey' => $config['snipcart_api_key'] ?? '',
    ];
    echo json_encode($public);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['snipcartPublicApiKey' => '']);
}
?>


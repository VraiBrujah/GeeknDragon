<?php
declare(strict_types=1);
header('Content-Type: application/javascript; charset=UTF-8');
try {
    $config = require __DIR__ . '/../config.php';
    $key = $config['snipcart_api_key'] ?? '';
    echo 'window.SNIPCART_API_KEY = ' . json_encode($key, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';';
} catch (Throwable $e) {
    echo 'window.SNIPCART_API_KEY = "";';
}
?>


<?php

$autoload = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoload)) {
    $message = 'Missing vendor/autoload.php. Run `composer install`.';
    error_log($message);
    exit($message);
}

require_once $autoload;

Dotenv\Dotenv::createImmutable(__DIR__)->safeLoad();

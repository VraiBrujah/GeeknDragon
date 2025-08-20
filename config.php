<?php

// Validation sécurisée pour les clés API (uniquement alphanumérique et tirets)
if (!function_exists('validateApiKey')) {
function validateApiKey($key) {
    return $key && preg_match('/^[a-zA-Z0-9_\-\.]+$/', $key) ? $key : null;
}
}

// Validation sécurisée pour les mots de passe SMTP
if (!function_exists('validateSmtpPassword')) {
function validateSmtpPassword($password) {
    // Plus permissif pour les mots de passe SMTP mais sécurisé
    return $password && strlen($password) >= 8 ? $password : null;
}
}

// Configuration avec validation sécurisée
return [
    'smtp' => [
        'host' => getSecureEnvVar('SMTP_HOST') ?: 'localhost',
        'username' => getSecureEnvVar('SMTP_USERNAME'),
        'password' => validateSmtpPassword($_ENV['SMTP_PASSWORD'] ?? $_SERVER['SMTP_PASSWORD'] ?? ''),
        'port' => (int)(getSecureEnvVar('SMTP_PORT') ?: 587),
    ],
    'snipcart_api_key' => validateApiKey(
        $_ENV['SNIPCART_API_KEY'] ?? $_SERVER['SNIPCART_API_KEY'] ?? ''
    ) ?: throw new RuntimeException('SNIPCART_API_KEY manquante ou invalide'),
    'snipcart_secret_api_key' => validateApiKey(
        $_ENV['SNIPCART_SECRET_API_KEY'] ?? $_SERVER['SNIPCART_SECRET_API_KEY'] ?? ''
    ) ?: throw new RuntimeException('SNIPCART_SECRET_API_KEY manquante ou invalide'),
    
    // Validation du host sécurisée
    'current_host' => validateHost($_SERVER['HTTP_HOST'] ?? 'geekndragon.com'),
    
    // Configuration de sécurité
    'security' => [
        'force_https' => true,
        'csrf_token_name' => '_token',
        'max_request_size' => 10 * 1024 * 1024, // 10MB
    ]
];

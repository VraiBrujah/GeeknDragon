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

// Récupération et validation des clés Snipcart
$snipcartApiKey = validateApiKey(
    $_ENV['SNIPCART_API_KEY'] ?? $_SERVER['SNIPCART_API_KEY'] ?? ''
);
$snipcartSecretApiKey = validateApiKey(
    $_ENV['SNIPCART_SECRET_API_KEY'] ?? $_SERVER['SNIPCART_SECRET_API_KEY'] ?? ''
);

if (PHP_SAPI !== 'cli') {
    if (!$snipcartApiKey || !$snipcartSecretApiKey) {
        throw new RuntimeException('SNIPCART: Les clés API Snipcart sont absentes ou invalides.');
    }
    if (str_contains($snipcartApiKey, 'pk_test') || str_contains($snipcartSecretApiKey, 'sk_test')) {
        throw new RuntimeException('SNIPCART: Des clés de test Snipcart ont été détectées.');
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

    // Clés Snipcart validées
    'snipcart_api_key' => $snipcartApiKey,
    'snipcart_secret_api_key' => $snipcartSecretApiKey,

    // Validation du host sécurisée
    'current_host' => validateHost($_SERVER['HTTP_HOST'] ?? 'geekndragon.com'),

    // Configuration de sécurité
    'security' => [
        'force_https' => true,
        'csrf_token_name' => '_token',
        'max_request_size' => 10 * 1024 * 1024, // 10MB
    ]
];

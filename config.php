<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

/**
 * Configuration principale de GeeknDragon.
 *
 * Ce fichier regroupe les variables d'environnement nécessaires aux
 * différentes couches (contrôleurs, services, scripts CLI). Les valeurs
 * sont nettoyées afin d'éviter les entrées malformées lors du déploiement
 * ou de l'exécution en local.
 */

if (!function_exists('gdValidateApiKey')) {
    /**
     * Valide une clé d'API Snipcart.
     */
    function gdValidateApiKey(string $key): ?string
    {
        $trimmed = trim($key);
        if ($trimmed === '') {
            return null;
        }

        return preg_match('/^[A-Za-z0-9_\-\.\/+=]+$/', $trimmed) === 1
            ? $trimmed
            : null;
    }
}

if (!function_exists('gdSanitizeBoolean')) {
    /**
     * Convertit une valeur d'environnement en booléen fiable.
     */
    function gdSanitizeBoolean($value, bool $default = false): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if ($value === null) {
            return $default;
        }

        $normalized = strtolower(trim((string) $value));
        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) {
            return true;
        }
        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) {
            return false;
        }

        return $default;
    }
}

if (!function_exists('gdComputeBaseUrl')) {
    /**
     * Calcule l'URL de base du site selon l'environnement courant.
     */
    function gdComputeBaseUrl(): string
    {
        $https = $_SERVER['HTTPS'] ?? getenv('HTTPS') ?? '';
        $scheme = ($https && strtolower((string) $https) !== 'off') ? 'https' : 'http';
        $host = validateHost($_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost');

        return sprintf('%s://%s', $scheme, $host);
    }
}

$env = static function (string $name, $default = '') {
    return getSecureEnvVar($name, $default);
};

$appEnv = $env('APP_ENV', $_SERVER['APP_ENV'] ?? 'production');
$appEnv = strtolower($appEnv);
if (!in_array($appEnv, ['production', 'development'], true)) {
    $appEnv = 'production';
}

$apiKey = gdValidateApiKey($env('SNIPCART_API_KEY', ''));
$secretCandidate = $env('SNIPCART_SECRET_API_KEY', '');
if ($secretCandidate === '') {
    $secretCandidate = $env('SNIPCART_SECRET_KEY', '');
}
$secretKey = gdValidateApiKey($secretCandidate);
$snipcartConfigured = $apiKey !== null && $secretKey !== null;

return [
    'APP_ENV' => $appEnv,
    'APP_DEBUG' => gdSanitizeBoolean($env('APP_DEBUG', false)),
    'base_url' => gdComputeBaseUrl(),
    'current_host' => validateHost($_SERVER['HTTP_HOST'] ?? 'localhost'),
    'storage_path' => __DIR__ . '/storage',
    'snipcart_api_key' => $apiKey ?? '',
    'snipcart_secret_api_key' => $secretKey ?? '',
    'snipcart_configured' => $snipcartConfigured,
    'quote_email' => $env('QUOTE_EMAIL', 'commande@geekndragon.com'),
    'max_message_chars' => (int) $env('MAX_MESSAGE_CHARS', 3000),
    'rate_limit_window' => (int) $env('RATE_LIMIT_WINDOW', 120),
    'smtp' => [
        'host' => $env('SMTP_HOST', ''),
        'username' => $env('SMTP_USERNAME', ''),
        'password' => $env('SMTP_PASSWORD', ''),
        'port' => (int) $env('SMTP_PORT', 587),
        'secure' => $env('SMTP_SECURE', 'tls'),
    ],
    'features' => [
        'local_password_auth' => gdSanitizeBoolean($env('LOCAL_PASSWORD_AUTH', false)),
    ],
    'security' => [
        'force_https' => gdSanitizeBoolean($env('FORCE_HTTPS', true), true),
        'csrf_token_name' => '_token',
        'max_request_size' => 10 * 1024 * 1024,
    ],
];

<?php
declare(strict_types=1);

// Set security headers when possible without output
if (PHP_SAPI !== 'cli') {
    header('Permissions-Policy: payment=(self)');
}

// Require Composer autoloader if available
$autoload = __DIR__ . '/vendor/autoload.php';
if (is_file($autoload)) {
    require_once $autoload;
}

// Load environment variables
if (class_exists('Dotenv\\Dotenv')) {
    Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();
} else {
    $envPath = __DIR__ . '/.env';
    if (is_file($envPath)) {
        foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$name, $value] = explode('=', $line, 2);
            $name  = trim($name);
            $value = trim($value);
            if ($name !== '') {
                putenv("{$name}={$value}");
                $_ENV[$name]    = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// --------------------------------------------------
// Global helper functions
// --------------------------------------------------

if (!function_exists('getSecureEnvVar')) {
    /**
     * Retrieve an environment variable with basic sanitisation.
     *
     * @param string $name    Variable name
     * @param mixed  $default Default value if variable is not set or invalid
     */
    function getSecureEnvVar(string $name, $default = ''): string
    {
        $value = $_ENV[$name] ?? $_SERVER[$name] ?? getenv($name);
        if ($value === false || $value === null || $value === '') {
            return (string) $default;
        }
        $value = trim((string) $value);
        // Allow common safe characters only
        return preg_match('/^[A-Za-z0-9_@\.:\-\/\\ ]+$/', $value)
            ? $value
            : (string) $default;
    }
}

if (!function_exists('validateHost')) {
    /**
     * Validate a host name, returning a default if invalid.
     */
    function validateHost(string $host, string $default = 'localhost'): string
    {
        $host = strtolower(trim($host));
        return preg_match('/^[a-z0-9.-]+$/', $host) ? $host : $default;
    }
}


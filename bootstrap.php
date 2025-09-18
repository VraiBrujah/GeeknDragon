<?php
declare(strict_types=1);

namespace {
    // Set security headers when possible without output
    if (PHP_SAPI !== 'cli') {
        header('Permissions-Policy: payment=(self)');
    }

    // Require Composer autoloader si tous les fichiers nécessaires sont présents
    $autoload = __DIR__ . '/vendor/autoload.php';
    if (is_file($autoload)) {
        $mandatoryVendors = [
            __DIR__ . '/vendor/symfony/polyfill-ctype/bootstrap.php',
            __DIR__ . '/vendor/symfony/polyfill-mbstring/bootstrap.php',
            __DIR__ . '/vendor/symfony/polyfill-php80/bootstrap.php',
        ];

        $missingVendors = array_filter($mandatoryVendors, static fn(string $path): bool => !is_file($path));

        if ($missingVendors === []) {
            require_once $autoload;
        } else {
            spl_autoload_register(
                static function (string $class): void {
                    $prefix = 'GeeknDragon\\';
                    if (!str_starts_with($class, $prefix)) {
                        return;
                    }

                    $relativeClass = substr($class, strlen($prefix));
                    $file = __DIR__ . '/src/' . str_replace('\\', '/', $relativeClass) . '.php';

                    if (is_file($file)) {
                        require_once $file;
                    }
                }
            );
        }
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
}

// --------------------------------------------------
// Global helper functions
// --------------------------------------------------

namespace GeeknDragon\Controller {
    if (!function_exists(__NAMESPACE__ . '\\file_get_contents')) {
        function file_get_contents(string $filename): string|false
        {
            if ($filename === 'php://input' && array_key_exists('__TEST_PHP_INPUT__', $GLOBALS)) {
                return (string)$GLOBALS['__TEST_PHP_INPUT__'];
            }
            return \file_get_contents($filename);
        }
    }
}

namespace {
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
}

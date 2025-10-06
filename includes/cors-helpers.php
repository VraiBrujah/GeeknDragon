<?php
/**
 * Helpers CORS centralisés pour API Geek & Dragon
 */

declare(strict_types=1);

if (!function_exists('gd_get_allowed_origins')) {
    function gd_get_allowed_origins(): array
    {
        $envList = $_ENV['CORS_ALLOWED_ORIGINS'] ?? $_SERVER['CORS_ALLOWED_ORIGINS'] ?? '';
        $origins = [];
        if (is_string($envList) && trim($envList) !== '') {
            foreach (explode(',', $envList) as $o) {
                $o = trim($o);
                if ($o !== '') {
                    $origins[] = $o;
                }
            }
        }

        if (!$origins) {
            $origins = ['https://geekndragon.com'];
        }
        return $origins;
    }
}

if (!function_exists('gd_detect_request_scheme')) {
    // fallback minimal si bootstrap non encore chargé
    function gd_detect_request_scheme(): string
    {
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] && strtolower((string) $_SERVER['HTTPS']) !== 'off') {
            return 'https';
        }
        if (isset($_SERVER['REQUEST_SCHEME']) && strtolower((string) $_SERVER['REQUEST_SCHEME']) === 'https') {
            return 'https';
        }
        if (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) {
            return 'https';
        }
        return 'http';
    }
}

if (!function_exists('gd_send_cors_headers')) {
    function gd_send_cors_headers(array $methods = ['GET','POST','OPTIONS'], array $headers = ['Content-Type','X-Requested-With']): void
    {
        $allowed = gd_get_allowed_origins();
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        $allow = '';
        if (is_string($origin) && $origin !== '' && in_array($origin, $allowed, true)) {
            $allow = $origin;
        } else {
            $scheme = gd_detect_request_scheme();
            $host = $_SERVER['HTTP_HOST'] ?? '';
            if ($host !== '') {
                $candidate = $scheme . '://' . $host;
                if (in_array($candidate, $allowed, true)) {
                    $allow = $candidate;
                }
            }
        }

        if ($allow === '') {
            $allow = $allowed[0];
        }

        header('Vary: Origin');
        header('Access-Control-Allow-Origin: ' . $allow);
        header('Access-Control-Allow-Methods: ' . implode(', ', $methods));
        header('Access-Control-Allow-Headers: ' . implode(', ', $headers));
    }
}

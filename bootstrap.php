<?php
require_once __DIR__ . '/vendor/autoload.php';

Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();

// Configuration basique sans système de logs complexe pour la production
if (!defined('REQUEST_START_TIME')) {
    define('REQUEST_START_TIME', microtime(true));
}

if (!defined('REQUEST_START_MEMORY')) {
    define('REQUEST_START_MEMORY', memory_get_usage(true));
}

/**
 * Détecte dynamiquement le schéma HTTP utilisé pour la requête courante.
 *
 * Cette détection tient compte des en-têtes classiques ajoutés par les
 * reverse proxies (X-Forwarded-Proto, X-Forwarded-Ssl) afin d'éviter de
 * forcer HTTPS lorsque l'application est servie en HTTP simple en local.
 */
if (!function_exists('gd_detect_request_scheme')) {
    function gd_detect_request_scheme(): string
    {
        $https = false;

        if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
            $forwardedProto = strtolower(trim(explode(',', (string) $_SERVER['HTTP_X_FORWARDED_PROTO'])[0]));
            $https = $forwardedProto === 'https';
        }

        if (!$https && !empty($_SERVER['HTTP_X_FORWARDED_SSL'])) {
            $https = strtolower((string) $_SERVER['HTTP_X_FORWARDED_SSL']) === 'on';
        }

        if (!$https && isset($_SERVER['HTTPS'])) {
            $https = strtolower((string) $_SERVER['HTTPS']) !== 'off' && $_SERVER['HTTPS'] !== '';
        }

        if (!$https && isset($_SERVER['REQUEST_SCHEME'])) {
            $https = strtolower((string) $_SERVER['REQUEST_SCHEME']) === 'https';
        }

        if (!$https && isset($_SERVER['SERVER_PORT'])) {
            $https = (string) $_SERVER['SERVER_PORT'] === '443';
        }

        return $https ? 'https' : 'http';
    }
}

/**
 * Construit une URL absolue reposant sur le schéma et l'hôte courants.
 *
 * @param string $path Chemin relatif ou chemin incluant une requête.
 */
if (!function_exists('gd_build_absolute_url')) {
    function gd_build_absolute_url(string $path = ''): string
    {
        $host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
        $normalizedPath = $path === ''
            ? ''
            : ('/' . ltrim($path, '/'));

        return gd_detect_request_scheme() . '://' . $host . $normalizedPath;
    }
}


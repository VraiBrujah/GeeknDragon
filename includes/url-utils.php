<?php
/**
 * Fonctions utilitaires liées aux URLs pour Geek & Dragon.
 *
 * Ces helpers centralisent la construction d'URLs absolues afin d'éviter
 * la duplication de logique dans les templates PHP et garantissent que les
 * intégrations tierces comme Snipcart reçoivent toujours des chemins complets.
 */

if (!function_exists('gd_current_origin')) {
    /**
     * Retourne l'origine complète (schéma + hôte + port éventuel) de la requête courante.
     *
     * @return string Origine détectée, vide si aucun hôte n'est disponible.
     */
    function gd_current_origin(): string
    {
        static $origin = null;
        if ($origin !== null) {
            return $origin;
        }

        $scheme = 'http';
        if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
            $scheme = 'https';
        }

        $candidates = [
            $_SERVER['HTTP_HOST'] ?? null,
            $_SERVER['SERVER_NAME'] ?? null,
        ];

        $envUrl = $_ENV['APP_URL'] ?? $_SERVER['APP_URL'] ?? '';
        if ($envUrl !== '') {
            $candidates[] = parse_url($envUrl, PHP_URL_HOST);
            $scheme = parse_url($envUrl, PHP_URL_SCHEME) ?: $scheme;
            $envPort = parse_url($envUrl, PHP_URL_PORT);
        } else {
            $envPort = null;
        }

        $host = 'geekndragon.com';
        foreach ($candidates as $candidate) {
            if (is_string($candidate) && $candidate !== '') {
                $host = $candidate;
                break;
            }
        }

        $port = $envPort
            ?? ($_SERVER['SERVER_PORT'] ?? null);

        $hasExplicitPort = str_contains($host, ':');
        $portSuffix = '';
        if (!$hasExplicitPort && $port && !in_array($port, ['80', '443'], true)) {
            $portSuffix = ':' . $port;
        }

        $origin = sprintf('%s://%s%s', $scheme, $host, $portSuffix);
        return $origin;
    }
}

if (!function_exists('gd_absolute_url')) {
    /**
     * Normalise un chemin ou une URL relative en URL absolue basée sur l'origine courante.
     *
     * @param string $path URL ou chemin à normaliser.
     * @return string URL absolue prête pour des appels externes (Snipcart, SEO, ...).
     */
    function gd_absolute_url(string $path): string
    {
        if ($path === '') {
            return gd_current_origin();
        }

        if (preg_match('~^https?://~i', $path)) {
            return $path;
        }

        $origin = gd_current_origin();
        $normalised = '/' . ltrim($path, '/');
        return $origin . $normalised;
    }
}

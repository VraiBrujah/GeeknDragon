<?php
/**
 * Helper de gestion des assets avec cache-busting optimisé
 *
 * Centralise la logique de versioning des assets pour éviter
 * les appels répétés à filemtime() et fournir un fallback gracieux.
 *
 * @package GeeknDragon\Helpers
 */

if (!function_exists('asset_url')) {
    /**
     * Génère une URL d'asset avec versioning automatique
     *
     * Utilise un cache statique pour éviter les accès disque répétés.
     * Retourne un timestamp par défaut si le fichier n'existe pas.
     *
     * @param string $path Chemin relatif depuis la racine web (ex: 'css/styles.css')
     * @param bool $absolute Générer une URL absolue avec domaine
     * @return string URL complète avec paramètre de version
     *
     * @example
     * asset_url('css/styles.css') // '/css/styles.css?v=1234567890'
     * asset_url('js/app.js', true) // 'https://geekndragon.com/js/app.js?v=1234567890'
     */
    function asset_url(string $path, bool $absolute = false): string
    {
        static $cache = [];

        // Nettoyer le chemin
        $path = ltrim($path, '/');

        // Vérifier le cache
        if (!isset($cache[$path])) {
            $fullPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $path;

            // Fallback gracieux si fichier manquant
            if (file_exists($fullPath)) {
                $cache[$path] = filemtime($fullPath);
            } else {
                $cache[$path] = time();

                // Log en mode développement uniquement
                if (defined('DEBUG_MODE') && DEBUG_MODE) {
                    error_log("Asset manquant : {$path}");
                }
            }
        }

        $url = '/' . $path . '?v=' . $cache[$path];

        if ($absolute) {
            $scheme = gd_detect_request_scheme();
            $host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
            $url = $scheme . '://' . $host . $url;
        }

        return $url;
    }
}

if (!function_exists('preload_asset')) {
    /**
     * Génère une balise link de préchargement pour un asset
     *
     * @param string $path Chemin de l'asset
     * @param string $type Type d'asset (style, script, font, image, video)
     * @param array $attributes Attributs HTML additionnels
     * @return string Balise HTML complète
     *
     * @example
     * preload_asset('css/vendor.css', 'style')
     * preload_asset('fonts/OpenSans.woff2', 'font', ['crossorigin' => true])
     */
    function preload_asset(string $path, string $type, array $attributes = []): string
    {
        $url = asset_url($path);
        $attrs = ['rel' => 'preload', 'href' => $url];

        // Mapper les types aux attributs 'as'
        $asMap = [
            'style' => 'style',
            'script' => 'script',
            'font' => 'font',
            'image' => 'image',
            'video' => 'video',
        ];

        if (isset($asMap[$type])) {
            $attrs['as'] = $asMap[$type];
        }

        // Ajouter type MIME pour fonts et vidéos
        if ($type === 'font') {
            $attrs['type'] = 'font/woff2';
            $attrs['crossorigin'] = '';
        } elseif ($type === 'video') {
            $attrs['type'] = 'video/mp4';
        }

        // Fusionner attributs custom
        $attrs = array_merge($attrs, $attributes);

        // Construire la balise
        $html = '<link';
        foreach ($attrs as $key => $value) {
            if ($value === '') {
                $html .= ' ' . htmlspecialchars($key);
            } else {
                $html .= ' ' . htmlspecialchars($key) . '="' . htmlspecialchars($value) . '"';
            }
        }
        $html .= '>';

        return $html;
    }
}

if (!function_exists('stylesheet_tag')) {
    /**
     * Génère une balise link stylesheet avec versioning
     *
     * @param string $path Chemin du fichier CSS
     * @param array $attributes Attributs HTML additionnels
     * @return string Balise HTML complète
     *
     * @example
     * stylesheet_tag('css/styles.css')
     * stylesheet_tag('css/print.css', ['media' => 'print'])
     */
    function stylesheet_tag(string $path, array $attributes = []): string
    {
        $url = asset_url($path);
        $attrs = array_merge(['rel' => 'stylesheet', 'href' => $url], $attributes);

        $html = '<link';
        foreach ($attrs as $key => $value) {
            $html .= ' ' . htmlspecialchars($key) . '="' . htmlspecialchars($value) . '"';
        }
        $html .= '>';

        return $html;
    }
}

if (!function_exists('script_tag')) {
    /**
     * Génère une balise script avec versioning
     *
     * @param string $path Chemin du fichier JS
     * @param array $attributes Attributs HTML additionnels
     * @return string Balise HTML complète
     *
     * @example
     * script_tag('js/app.js')
     * script_tag('js/analytics.js', ['async' => true, 'defer' => true])
     */
    function script_tag(string $path, array $attributes = []): string
    {
        $url = asset_url($path);
        $attrs = array_merge(['src' => $url], $attributes);

        $html = '<script';
        foreach ($attrs as $key => $value) {
            if ($value === true) {
                $html .= ' ' . htmlspecialchars($key);
            } else {
                $html .= ' ' . htmlspecialchars($key) . '="' . htmlspecialchars($value) . '"';
            }
        }
        $html .= '></script>';

        return $html;
    }
}

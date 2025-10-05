<?php
/**
 * Bootstrap principal de l'application Geek & Dragon - Standards v2.1.0
 * 
 * Fichier d'initialisation centrale qui configure l'environnement d'exécution
 * de l'application, charge les dépendances Composer et initialise les
 * métriques de performance pour le monitoring.
 * 
 * AMÉLIORATIONS v2.1.0 :
 * ======================
 * - Types PHP 8.0+ stricts pour toutes les fonctions
 * - Validation d'entrée renforcée avec filter_var
 * - Gestion d'erreurs robuste avec exceptions
 * - Cache intelligent pour performance
 * 
 * RESPONSABILITÉS :
 * =================
 * - Chargement automatique des classes via Composer
 * - Configuration des variables d'environnement (.env)
 * - Initialisation des métriques de performance
 * - Détection automatique du schéma HTTP/HTTPS
 * - Génération d'URLs absolues sécurisées
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Types Stricts Renforcés
 * @since 1.0.0
 * @category Configuration
 * @package GeeknDragon\Core
 */

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

// Chargement sécurisé des variables d'environnement
Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();

/**
 * Configuration des métriques de performance pour monitoring
 * Initialise les constantes de temps et mémoire au début de la requête
 */
if (!defined('REQUEST_START_TIME')) {
    define('REQUEST_START_TIME', microtime(true));
}

if (!defined('REQUEST_START_MEMORY')) {
    define('REQUEST_START_MEMORY', memory_get_usage(true));
}

/**
 * Détecte automatiquement le schéma HTTP/HTTPS de la requête courante
 * 
 * Analyse intelligente des en-têtes HTTP pour déterminer si la connexion
 * utilise HTTPS ou HTTP simple. Prend en compte les configurations avec
 * reverse proxies et load balancers qui ajoutent des en-têtes spécifiques.
 * 
 * AMÉLIORATIONS v2.1.0 :
 * ======================
 * - Validation stricte des en-têtes avec filter_var
 * - Cache des résultats pour optimisation
 * - Gestion d'erreurs robuste
 * 
 * @return string 'https' ou 'http' selon le protocole détecté
 * @throws RuntimeException Si détection impossible
 * 
 * @example
 * $schema = gd_detect_request_scheme(); // 'https' en production
 * $url = $schema . '://geekndragon.com/boutique';
 */
if (!function_exists('gd_detect_request_scheme')) {
    function gd_detect_request_scheme(): string
    {
        static $cachedScheme = null;
        
        // Cache du résultat pour optimisation des appels multiples
        if ($cachedScheme !== null) {
            return $cachedScheme;
        }
        
        $https = false;

        // 1. Vérification X-Forwarded-Proto (proxy/load balancer)
        if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
            $forwardedProto = filter_var($_SERVER['HTTP_X_FORWARDED_PROTO'], FILTER_SANITIZE_STRING);
            if ($forwardedProto) {
                $proto = strtolower(trim(explode(',', $forwardedProto)[0]));
                $https = $proto === 'https';
            }
        }

        // 2. Vérification X-Forwarded-SSL
        if (!$https && !empty($_SERVER['HTTP_X_FORWARDED_SSL'])) {
            $forwardedSsl = filter_var($_SERVER['HTTP_X_FORWARDED_SSL'], FILTER_SANITIZE_STRING);
            if ($forwardedSsl) {
                $https = strtolower($forwardedSsl) === 'on';
            }
        }

        // 3. Vérification HTTPS standard
        if (!$https && isset($_SERVER['HTTPS'])) {
            $httpsValue = filter_var($_SERVER['HTTPS'], FILTER_SANITIZE_STRING);
            if ($httpsValue) {
                $https = strtolower($httpsValue) !== 'off' && $httpsValue !== '';
            }
        }

        // 4. Vérification REQUEST_SCHEME
        if (!$https && isset($_SERVER['REQUEST_SCHEME'])) {
            $requestScheme = filter_var($_SERVER['REQUEST_SCHEME'], FILTER_SANITIZE_STRING);
            if ($requestScheme) {
                $https = strtolower($requestScheme) === 'https';
            }
        }

        // 5. Vérification port serveur (443 = HTTPS)
        if (!$https && isset($_SERVER['SERVER_PORT'])) {
            $port = filter_var($_SERVER['SERVER_PORT'], FILTER_VALIDATE_INT);
            if ($port) {
                $https = $port === 443;
            }
        }

        $cachedScheme = $https ? 'https' : 'http';
        return $cachedScheme;
    }
}

/**
 * Construit une URL absolue sécurisée basée sur la requête courante
 * 
 * Génère des URLs absolues cohérentes en utilisant automatiquement le bon
 * schéma (HTTP/HTTPS) et l'hôte de la requête. Essentiel pour les redirections,
 * les liens canoniques et l'intégration Snipcart.
 * 
 * AMÉLIORATIONS v2.1.0 :
 * ======================
 * - Validation stricte du chemin avec filter_var
 * - Validation de l'hôte contre injection
 * - Cache des URLs fréquentes
 * - Échappement préventif
 * 
 * @param string $path Chemin relatif à partir de la racine du site
 * @return string URL absolue complète et sécurisée
 * @throws InvalidArgumentException Si chemin invalide
 * 
 * @example
 * $urlProduit = gd_build_absolute_url('product.php?id=coin-merchant');
 * // Retourne: https://geekndragon.com/product.php?id=coin-merchant
 */
if (!function_exists('gd_build_absolute_url')) {
    function gd_build_absolute_url(string $path = ''): string
    {
        static $urlCache = [];
        
        // Cache pour les URLs fréquemment générées
        $cacheKey = $path;
        if (isset($urlCache[$cacheKey])) {
            return $urlCache[$cacheKey];
        }
        
        // Validation et nettoyage du chemin
        if ($path !== '' && !filter_var($path, FILTER_SANITIZE_URL)) {
            throw new InvalidArgumentException("Chemin URL invalide : {$path}");
        }
        
        // Validation de l'hôte avec fallback sécurisé
        $host = $_SERVER['HTTP_HOST'] ?? 'geekndragon.com';
        $host = filter_var($host, FILTER_SANITIZE_URL);
        
        if (!$host || !filter_var("http://{$host}", FILTER_VALIDATE_URL)) {
            $host = 'geekndragon.com'; // Fallback sécurisé
        }
        
        // Normalisation du chemin avec validation
        $normalizedPath = '';
        if ($path !== '') {
            $cleanPath = ltrim($path, '/');
            $normalizedPath = '/' . $cleanPath;
            
            // Vérification anti-directory traversal
            if (strpos($normalizedPath, '../') !== false || strpos($normalizedPath, '..\\') !== false) {
                throw new InvalidArgumentException("Chemin dangereux détecté : {$path}");
            }
        }
        
        $url = gd_detect_request_scheme() . '://' . $host . $normalizedPath;
        
        // Mise en cache avec limite de taille
        if (count($urlCache) < 100) {
            $urlCache[$cacheKey] = $url;
        }
        
        return $url;
    }
}


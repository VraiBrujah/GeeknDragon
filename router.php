<?php
/**
 * Routeur personnalisé pour le serveur PHP intégré
 * Usage: php -S localhost:8000 router.php
 *
 * @author Brujah - Geek & Dragon
 */

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestUri = urldecode($requestUri);

// Permettre les fichiers statiques
if ($requestUri !== '/' && file_exists(__DIR__ . $requestUri)) {
    // Laisser le serveur PHP gérer les fichiers statiques
    return false;
}

// Pour les fichiers .php, les inclure directement
if (preg_match('/\.php$/', $requestUri)) {
    $file = __DIR__ . $requestUri;
    if (file_exists($file)) {
        require $file;
        return true;
    }
}

// Index par défaut
if ($requestUri === '/') {
    require __DIR__ . '/index.php';
    return true;
}

// 404 pour tout le reste
http_response_code(404);
echo "404 Not Found";
return true;

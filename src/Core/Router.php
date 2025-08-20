<?php
declare(strict_types=1);

namespace GeeknDragon\Core;

use Throwable;

/**
 * Mini-routeur simple pour GeeknDragon
 * Gère les routes GET/POST avec redirections 301 pour préserver l'existant
 */
class Router
{
    private array $routes = [];
    private array $redirects = [];
    
    /**
     * Ajoute une route GET
     */
    public function get(string $path, callable $handler): void
    {
        $this->routes['GET'][$path] = $handler;
    }
    
    /**
     * Ajoute une route POST
     */
    public function post(string $path, callable $handler): void
    {
        $this->routes['POST'][$path] = $handler;
    }
    
    /**
     * Ajoute une redirection 301 pour préserver les liens existants
     */
    public function redirect(string $from, string $to, int $code = 301): void
    {
        $this->redirects[$from] = ['to' => $to, 'code' => $code];
    }
    
    /**
     * Résout et exécute la route courante
     */
    public function resolve(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        
        // Nettoyage de l'URI
        $uri = rtrim($uri, '/') ?: '/';
        
        // Vérifier les redirections d'abord
        if (isset($this->redirects[$uri])) {
            $redirect = $this->redirects[$uri];
            http_response_code($redirect['code']);
            header("Location: {$redirect['to']}");
            exit;
        }
        
        // Recherche de route exacte
        if (isset($this->routes[$method][$uri])) {
            $handler = $this->routes[$method][$uri];
            $this->executeHandler($handler);
            return;
        }
        
        // Recherche de route avec paramètres dynamiques
        foreach ($this->routes[$method] ?? [] as $route => $handler) {
            if ($this->matchRoute($route, $uri)) {
                $this->executeHandler($handler);
                return;
            }
        }
        
        // 404 - Page non trouvée
        $this->handle404();
    }
    
    /**
     * Vérifie si une route correspond avec support des paramètres dynamiques
     */
    private function matchRoute(string $route, string $uri): bool
    {
        // Support simple des paramètres comme /product/{id}
        $pattern = preg_replace('/\{[^}]+\}/', '([^/]+)', $route);
        $pattern = '#^' . $pattern . '$#';
        
        return preg_match($pattern, $uri) === 1;
    }
    
    /**
     * Exécute un gestionnaire de route
     */
    private function executeHandler(callable $handler): void
    {
        try {
            call_user_func($handler);
        } catch (Throwable $e) {
            $this->handle500($e);
        }
    }
    
    /**
     * Gestion d'erreur 404
     */
    private function handle404(): void
    {
        http_response_code(404);
        
        // Inclure une page 404 simple ou la page d'accueil
        if (file_exists(__DIR__ . '/../../views/pages/404.php')) {
            include __DIR__ . '/../../views/pages/404.php';
        } else {
            echo "<h1>Page non trouvée</h1>";
        }
    }
    
    /**
     * Gestion d'erreur 500
     */
    private function handle500(Throwable $e): void
    {
        http_response_code(500);
        
        // En développement, afficher l'erreur détaillée
        if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
            echo "<h1>Erreur serveur</h1>";
            echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
            echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
        } else {
            echo "<h1>Erreur serveur</h1>";
            echo "<p>Une erreur est survenue. Veuillez réessayer plus tard.</p>";
        }
        
        // Logger l'erreur
        error_log("Router error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
    }
}
<?php
declare(strict_types=1);

namespace GeeknDragon\Security;

use GeeknDragon\Core\SessionHelper;

/**
 * Protection CSRF pour les formulaires et requêtes POST
 */
class CsrfProtection
{
    private const TOKEN_NAME = '_token';
    private const SESSION_KEY = 'csrf_token';
    
    /**
     * Génère un nouveau token CSRF
     */
    public static function generateToken(): string
    {
        SessionHelper::ensureSession();

        $token = bin2hex(random_bytes(32));
        $_SESSION[self::SESSION_KEY] = $token;
        $_SESSION['csrf_token_time'] = time();

        return $token;
    }
    
    /**
     * Retourne le token CSRF actuel ou en génère un nouveau
     */
    public static function getToken(): string
    {
        SessionHelper::ensureSession();

        if (!isset($_SESSION[self::SESSION_KEY])) {
            return self::generateToken();
        }

        if (!isset($_SESSION['csrf_token_time'])) {
            $_SESSION['csrf_token_time'] = time();
        }

        return $_SESSION[self::SESSION_KEY];
    }
    
    /**
     * Valide un token CSRF
     */
    public static function validateToken(string $token): bool
    {
        SessionHelper::ensureSession();
        
        $sessionToken = $_SESSION[self::SESSION_KEY] ?? '';
        
        if (empty($sessionToken) || empty($token)) {
            return false;
        }
        
        return hash_equals($sessionToken, $token);
    }
    
    /**
     * Valide le token depuis une requête POST
     */
    public static function validateRequest(): bool
    {
        // Récupérer le token depuis différentes sources
        $token = $_POST[self::TOKEN_NAME] 
               ?? $_SERVER['HTTP_X_CSRF_TOKEN'] 
               ?? $_SERVER['HTTP_X_XSRF_TOKEN']
               ?? '';
        
        return self::validateToken($token);
    }
    
    /**
     * Génère un champ input caché avec le token CSRF
     */
    public static function getHiddenField(): string
    {
        $token = htmlspecialchars(self::getToken(), ENT_QUOTES, 'UTF-8');
        return '<input type="hidden" name="' . self::TOKEN_NAME . '" value="' . $token . '">';
    }
    
    /**
     * Génère un meta tag pour JavaScript
     */
    public static function getMetaTag(): string
    {
        $token = htmlspecialchars(self::getToken(), ENT_QUOTES, 'UTF-8');
        return '<meta name="csrf-token" content="' . $token . '">';
    }
    
    /**
     * Middleware de protection CSRF pour les requêtes POST
     */
    public static function protect(): void
    {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && !self::validateRequest()) {
            http_response_code(403);
            
            $isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) 
                   && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
            
            if ($isAjax) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'message' => 'Token CSRF invalide',
                    'code' => 'CSRF_TOKEN_MISMATCH'
                ]);
            } else {
                echo '<h1>403 Forbidden</h1><p>Token CSRF invalide. Veuillez actualiser la page.</p>';
            }
            
            exit;
        }
    }
    
    /**
     * Régénère le token après utilisation (optionnel, pour sécurité renforcée)
     */
    public static function regenerateToken(): string
    {
        return self::generateToken();
    }
    
    /**
     * Nettoie les anciens tokens (à appeler périodiquement)
     */
    public static function cleanup(): void
    {
        SessionHelper::ensureSession();
        
        // Simple cleanup - régénérer le token s'il est ancien
        $tokenAge = $_SESSION['csrf_token_time'] ?? 0;
        $maxAge = 3600; // 1 heure

        if (time() - $tokenAge > $maxAge) {
            self::generateToken();
        }
    }
}

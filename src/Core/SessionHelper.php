<?php
declare(strict_types=1);

namespace GeeknDragon\Core;

/**
 * Utilitaire pour gérer les sessions de manière sécurisée
 */
class SessionHelper
{
    /**
     * Assure qu'une session est démarrée avec des paramètres sécurisés
     */
    public static function ensureSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            if (PHP_SAPI === 'cli' || !headers_sent()) {
                ini_set('session.cookie_httponly', '1');
                ini_set('session.use_only_cookies', '1');
                ini_set('session.cookie_secure', isset($_SERVER['HTTPS']) ? '1' : '0');
                ini_set('session.cookie_samesite', 'Strict');
                ini_set('session.gc_maxlifetime', '3600');
                session_start();
            }
        }
    }
}


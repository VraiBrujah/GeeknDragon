<?php
/**
 * Configuration principale de l'application Geek & Dragon
 * 
 * Gère les paramètres SMTP pour l'envoi d'emails et les clés API Snipcart
 * pour le système e-commerce. Toutes les valeurs sensibles sont externalisées
 * via variables d'environnement pour garantir la sécurité en production.
 * 
 * @author Brujah - Geek & Dragon
 * @version 1.0.0
 */

/**
 * Récupère une variable d'environnement avec fallback
 * 
 * @param string $key Nom de la variable d'environnement
 * @param mixed $default Valeur par défaut si la variable n'existe pas
 * @return mixed Valeur de la variable ou valeur par défaut
 */
function getEnvironmentVariable(string $key, $default = null) {
    return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

return [
    // Configuration SMTP pour l'envoi d'emails transactionnels
    'smtp' => [
        'host' => getEnvironmentVariable('SMTP_HOST'),
        'username' => getEnvironmentVariable('SMTP_USERNAME'),
        'password' => getEnvironmentVariable('SMTP_PASSWORD'),
        'port' => (int) getEnvironmentVariable('SMTP_PORT', 587),
    ],
    
    // Clés API Snipcart pour le système e-commerce
    'snipcart_api_key' => getEnvironmentVariable('SNIPCART_API_KEY'),
    'snipcart_secret_api_key' => getEnvironmentVariable('SNIPCART_SECRET_API_KEY'),
];

<?php
/**
 * Configuration principale de l'application Geek & Dragon - Standards v2.1.0
 * 
 * Fichier de configuration centrale qui gère tous les paramètres sensibles
 * de l'application : SMTP, APIs externes, clés de chiffrement, etc.
 * Toutes les valeurs critiques sont externalisées via variables d'environnement
 * pour garantir la sécurité et la portabilité entre environnements.
 * 
 * RESPONSABILITÉS :
 * =================
 * - Configuration SMTP pour envoi d'emails transactionnels
 * - Clés API Snipcart pour intégration e-commerce sécurisée
 * - Paramètres de performance et cache
 * - Variables d'environnement avec fallbacks sécurisés
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Standards Français
 * @since 1.0.0
 * @category Configuration
 * @package GeeknDragon\Core
 */

/**
 * Récupère une variable d'environnement avec fallback sécurisé
 * 
 * Fonction utilitaire qui extrait les variables d'environnement
 * en vérifiant d'abord $_ENV puis $_SERVER avec gestion des valeurs
 * par défaut pour éviter les erreurs de configuration.
 * 
 * @param string $key Nom de la variable d'environnement à récupérer
 * @param mixed $default Valeur par défaut si la variable n'existe pas
 * @return mixed Valeur de la variable ou valeur par défaut
 * 
 * @example
 * $apiKey = getEnvironmentVariable('SNIPCART_API_KEY', 'dev-key');
 * $port = getEnvironmentVariable('SMTP_PORT', 587);
 */
function getEnvironmentVariable(string $key, $default = null) {
    return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

/**
 * Configuration structurée de l'application
 * 
 * Retourne un tableau associatif contenant tous les paramètres
 * de configuration organisés par domaine fonctionnel.
 */
return [
    // Configuration serveur SMTP pour envoi d'emails transactionnels
    'smtp' => [
        'host' => getEnvironmentVariable('SMTP_HOST'),
        'username' => getEnvironmentVariable('SMTP_USERNAME'),
        'password' => getEnvironmentVariable('SMTP_PASSWORD'),
        'port' => (int) getEnvironmentVariable('SMTP_PORT', 587),
    ],
    
    // Clés d'authentification API Snipcart pour e-commerce sécurisé
    'snipcart_api_key' => getEnvironmentVariable('SNIPCART_API_KEY'),
    'snipcart_secret_api_key' => getEnvironmentVariable('SNIPCART_SECRET_API_KEY'),
];

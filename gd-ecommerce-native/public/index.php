<?php
/**
 * Point d'entrée public pour l'API Snipcart Backend
 * Doit être accessible via votre serveur web
 * 
 * Configuration Apache/Nginx recommandée pour pointer vers ce répertoire
 * avec réécriture d'URL vers ce fichier pour tous les endpoints /snipcart/*
 */

declare(strict_types=1);

// Headers de sécurité de base
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Chargement de l'autoloader Composer
require_once __DIR__ . '/../vendor/autoload.php';

// Chargement du routeur Snipcart
require_once __DIR__ . '/../routes/snipcart.php';

// Configuration des erreurs pour la production
if (getenv('APP_ENV') === 'production') {
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

// Gestion des requêtes
try {
    handleSnipcartRoutes();
} catch (\Throwable $e) {
    error_log('Erreur fatale API Snipcart: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur serveur interne',
        'status' => 'error'
    ]);
}
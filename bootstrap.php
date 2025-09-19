<?php
/**
 * Bootstrap avec gestion d'erreurs pour HostPapa
 */

// Activer l'affichage des erreurs en développement
if (file_exists(__DIR__ . '/.env.development')) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
}

// Vérifier que vendor/autoload.php existe
$autoloadPath = __DIR__ . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die('Erreur : vendor/autoload.php manquant. Exécutez "composer install" ou uploadez le dossier vendor/');
}

try {
    require_once $autoloadPath;
} catch (Exception $e) {
    die('Erreur lors du chargement de vendor/autoload.php : ' . $e->getMessage());
}

// Charger les variables d'environnement si disponibles
if (class_exists('Dotenv\Dotenv')) {
    try {
        if (file_exists(__DIR__ . '/.env')) {
            Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();
        }
    } catch (Exception $e) {
        // Continuer sans .env si erreur (mode production)
        error_log('Avertissement : impossible de charger .env : ' . $e->getMessage());
    }
} else {
    error_log('Avertissement : Dotenv non disponible');
}


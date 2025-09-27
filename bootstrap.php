<?php
require_once __DIR__ . '/vendor/autoload.php';

Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();

// Initialisation du système de monitoring et logs centralisé
require_once __DIR__ . '/includes/logging-system.php';

// Configuration du système de logs selon l'environnement
$configLogs = [
    'repertoire' => __DIR__ . '/logs',
    'niveau_minimum' => $_ENV['LOG_LEVEL'] ?? $_SERVER['LOG_LEVEL'] ?? 'INFO',
    'taille_maximale' => (int)($_ENV['LOG_MAX_SIZE'] ?? $_SERVER['LOG_MAX_SIZE'] ?? 10485760), // 10MB
    'nombre_rotations' => (int)($_ENV['LOG_ROTATIONS'] ?? $_SERVER['LOG_ROTATIONS'] ?? 5),
    'debug' => ($_ENV['LOG_DEBUG'] ?? $_SERVER['LOG_DEBUG'] ?? 'false') === 'true'
];

// Initialiser le système de logs global
LogManager::getInstance($configLogs);

// Gestionnaire global d'exceptions pour logging automatique
set_exception_handler(function(Throwable $exception) {
    log_gd()->exception($exception, [
        'script' => $_SERVER['SCRIPT_NAME'] ?? 'CLI',
        'request_uri' => $_SERVER['REQUEST_URI'] ?? 'N/A',
        'ip_client' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);

    // En production, ne pas exposer les détails d'erreur
    if (($_ENV['APP_ENV'] ?? $_SERVER['APP_ENV'] ?? 'production') !== 'development') {
        http_response_code(500);
        echo "Une erreur technique est survenue. Veuillez réessayer plus tard.";
    } else {
        // En développement, afficher l'erreur pour debug
        echo "<h1>Erreur de développement</h1>";
        echo "<pre>" . htmlspecialchars($exception->__toString()) . "</pre>";
    }
    exit;
});

// Gestionnaire d'erreurs PHP pour logging
set_error_handler(function($severity, $message, $file, $line) {
    // Convertir la sévérité PHP en niveau de log
    $niveauLog = match($severity) {
        E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR => 'ERROR',
        E_WARNING, E_CORE_WARNING, E_COMPILE_WARNING, E_USER_WARNING => 'WARN',
        E_NOTICE, E_USER_NOTICE, E_DEPRECATED, E_USER_DEPRECATED => 'INFO',
        default => 'DEBUG'
    };

    // Logger l'erreur avec contexte
    $contexte = [
        'fichier' => $file,
        'ligne' => $line,
        'severite_php' => $severity,
        'script' => $_SERVER['SCRIPT_NAME'] ?? 'CLI'
    ];

    log_gd()->enregistrer($niveauLog, "Erreur PHP : {$message}", $contexte);

    // Retourner false pour que PHP continue son traitement normal
    return false;
});

// Enregistrer le début de la requête pour les métriques de performance
if (!defined('REQUEST_START_TIME')) {
    define('REQUEST_START_TIME', microtime(true));
}

if (!defined('REQUEST_START_MEMORY')) {
    define('REQUEST_START_MEMORY', memory_get_usage(true));
}

// Enregistrer la fin de la requête à l'arrêt du script
register_shutdown_function(function() {
    $tempsExecution = microtime(true) - REQUEST_START_TIME;
    $memoireUtilisee = memory_get_usage(true) - REQUEST_START_MEMORY;

    // Enregistrer les métriques de performance de la requête
    log_gd()->requete($tempsExecution, $memoireUtilisee);

    // Log spécial pour les requêtes lentes
    if ($tempsExecution > 1.0) {
        log_warn('Requête lente détectée', [
            'duree_seconde' => round($tempsExecution, 3),
            'memoire_mb' => round($memoireUtilisee / 1024 / 1024, 2),
            'script' => $_SERVER['SCRIPT_NAME'] ?? 'CLI',
            'uri' => $_SERVER['REQUEST_URI'] ?? 'N/A'
        ]);
    }
});


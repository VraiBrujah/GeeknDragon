#!/usr/bin/env php
<?php
/**
 * Script de Test du Système de Monitoring - Geek & Dragon
 *
 * Script CLI pour tester et valider le fonctionnement du système de monitoring.
 * Tests automatisés de tous les composants et génération de rapport de validation.
 *
 * Usage:
 *   php scripts/test-monitoring.php [--verbeux] [--quick] [--rapport]
 *
 * @author Brujah
 * @version 1.0.0
 * @since 2025-09-27
 */

// Vérifier que le script est exécuté en CLI
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Ce script doit être exécuté en ligne de commande uniquement.');
}

// Initialisation
$scriptDir = dirname(__DIR__);
require_once $scriptDir . '/bootstrap.php';

// Configuration des tests
$config = [
    'verbeux' => in_array('--verbeux', $argv),
    'quick' => in_array('--quick', $argv),
    'rapport' => in_array('--rapport', $argv),
    'repertoire_logs' => $scriptDir . '/logs'
];

// Résultats des tests
$résultatsTests = [
    'début' => microtime(true),
    'tests_passés' => 0,
    'tests_échoués' => 0,
    'erreurs' => [],
    'métriques' => []
];

/**
 * Affiche un message si le mode verbeux est activé
 *
 * @param string $message Message à afficher
 * @param string $niveau Niveau (INFO, WARN, ERROR, SUCCESS)
 * @return void
 */
function afficherVerbeux(string $message, string $niveau = 'INFO'): void
{
    global $config;

    if (!$config['verbeux']) {
        return;
    }

    $icones = [
        'INFO' => '💡',
        'WARN' => '⚠️',
        'ERROR' => '❌',
        'SUCCESS' => '✅',
        'TEST' => '🧪'
    ];

    echo ($icones[$niveau] ?? '•') . " {$message}\n";
}

/**
 * Exécute un test et enregistre le résultat
 *
 * @param string $nom Nom du test
 * @param callable $fonction Fonction de test
 * @return bool Résultat du test
 */
function exécuterTest(string $nom, callable $fonction): bool
{
    global $résultatsTests;

    afficherVerbeux("Test : {$nom}", 'TEST');

    try {
        $début = microtime(true);
        $résultat = $fonction();
        $durée = microtime(true) - $début;

        $résultatsTests['métriques'][$nom] = [
            'durée_ms' => round($durée * 1000, 2),
            'mémoire_mb' => round(memory_get_usage(true) / 1024 / 1024, 2)
        ];

        if ($résultat) {
            $résultatsTests['tests_passés']++;
            afficherVerbeux("  ✅ {$nom} réussi ({$résultatsTests['métriques'][$nom]['durée_ms']}ms)", 'SUCCESS');
            return true;
        } else {
            $résultatsTests['tests_échoués']++;
            $résultatsTests['erreurs'][] = "Test {$nom} a échoué sans exception";
            afficherVerbeux("  ❌ {$nom} échoué", 'ERROR');
            return false;
        }

    } catch (Exception $e) {
        $durée = microtime(true) - $début;
        $résultatsTests['tests_échoués']++;
        $résultatsTests['erreurs'][] = "Test {$nom} : " . $e->getMessage();
        $résultatsTests['métriques'][$nom] = [
            'durée_ms' => round($durée * 1000, 2),
            'erreur' => $e->getMessage()
        ];

        afficherVerbeux("  ❌ {$nom} échoué : " . $e->getMessage(), 'ERROR');
        return false;
    }
}

/**
 * Test 1: Initialisation du système de logs
 *
 * @return bool Succès du test
 */
function testInitialisationLogs(): bool
{
    // Tenter d'obtenir l'instance du système de logs
    $systemeLog = LogManager::getInstance();

    if (!$systemeLog instanceof SystemeLogsGeekDragon) {
        throw new Exception('Instance du système de logs invalide');
    }

    // Vérifier que les fonctions globales sont disponibles
    if (!function_exists('log_gd') || !function_exists('log_info')) {
        throw new Exception('Fonctions globales de logging non disponibles');
    }

    return true;
}

/**
 * Test 2: Écriture et lecture des logs
 *
 * @return bool Succès du test
 */
function testEcritureLecture(): bool
{
    $messageTest = 'Test du système de logs - ' . uniqid();

    // Écrire un log de test
    log_info($messageTest, ['test' => true, 'timestamp' => time()]);

    // Attendre un peu pour que l'écriture soit effectuée
    usleep(100000); // 100ms

    // Vérifier que le fichier de log existe
    $fichierLog = __DIR__ . '/../logs/app.log';
    if (!file_exists($fichierLog)) {
        throw new Exception('Fichier de log non créé');
    }

    // Lire le contenu et vérifier la présence du message
    $contenu = file_get_contents($fichierLog);
    if (strpos($contenu, $messageTest) === false) {
        throw new Exception('Message de test non trouvé dans les logs');
    }

    return true;
}

/**
 * Test 3: Niveaux de logs différents
 *
 * @return bool Succès du test
 */
function testNiveauxLogs(): bool
{
    $systemeLog = log_gd();

    // Tester tous les niveaux
    $niveaux = ['debug', 'info', 'warn', 'error', 'critical'];

    foreach ($niveaux as $niveau) {
        $message = "Test niveau {$niveau} - " . uniqid();
        $systemeLog->$niveau($message, ['niveau_test' => $niveau]);
    }

    // Vérifier que les fichiers appropriés existent
    $fichierApp = __DIR__ . '/../logs/app.log';
    $fichierErreurs = __DIR__ . '/../logs/erreurs.log';

    if (!file_exists($fichierApp)) {
        throw new Exception('Fichier app.log non créé');
    }

    // Le fichier d'erreurs doit exister car on a logué ERROR et CRITICAL
    if (!file_exists($fichierErreurs)) {
        throw new Exception('Fichier erreurs.log non créé');
    }

    return true;
}

/**
 * Test 4: Métriques de performance
 *
 * @return bool Succès du test
 */
function testMetriques(): bool
{
    $systemeLog = log_gd();

    // Enregistrer différents types de métriques
    $systemeLog->metrique('test_counter', 42, 'count', ['test' => 'metric']);
    $systemeLog->metrique('test_timer', 123.45, 'ms', ['test' => 'timer']);
    $systemeLog->metrique('test_gauge', 67.89, 'percent', ['test' => 'gauge']);

    // Vérifier que le fichier de métriques existe
    $fichierMetriques = __DIR__ . '/../logs/metriques.log';
    if (!file_exists($fichierMetriques)) {
        throw new Exception('Fichier métriques.log non créé');
    }

    // Vérifier le contenu
    $contenu = file_get_contents($fichierMetriques);
    if (strpos($contenu, 'test_counter') === false) {
        throw new Exception('Métrique test_counter non trouvée');
    }

    return true;
}

/**
 * Test 5: Rotation des logs
 *
 * @return bool Succès du test
 */
function testRotation(): bool
{
    $systemeLog = log_gd();

    // Obtenir le nombre de fichiers avant nettoyage
    $avantNettoyage = count(glob(__DIR__ . '/../logs/*.log*'));

    // Effectuer le nettoyage
    $fichiersSupprimes = $systemeLog->nettoyerAnciennesLogs();

    // Le nombre peut être 0 si aucun fichier à nettoyer, c'est normal
    if (!is_int($fichiersSupprimes) || $fichiersSupprimes < 0) {
        throw new Exception('Résultat de nettoyage invalide');
    }

    return true;
}

/**
 * Test 6: Statistiques système
 *
 * @return bool Succès du test
 */
function testStatistiques(): bool
{
    $systemeLog = log_gd();
    $stats = $systemeLog->obtenirStatistiques();

    // Vérifier la structure des statistiques
    $champsRequis = ['systeme', 'logs', 'metriques_cache'];

    foreach ($champsRequis as $champ) {
        if (!isset($stats[$champ])) {
            throw new Exception("Champ statistique manquant : {$champ}");
        }
    }

    // Vérifier les sous-champs système
    $champsSysteme = ['php_version', 'memoire_utilisee_mb'];
    foreach ($champsSysteme as $champ) {
        if (!isset($stats['systeme'][$champ])) {
            throw new Exception("Champ système manquant : {$champ}");
        }
    }

    return true;
}

/**
 * Test 7: Export des logs
 *
 * @return bool Succès du test
 */
function testExport(): bool
{
    global $config;

    if ($config['quick']) {
        // En mode rapide, on ne teste que le JSON
        $formats = ['json'];
    } else {
        $formats = ['json', 'csv', 'txt'];
    }

    $systemeLog = log_gd();

    foreach ($formats as $format) {
        $export = $systemeLog->exporterLogs($format);

        if (empty($export)) {
            throw new Exception("Export {$format} vide");
        }

        // Validation basique du format
        switch ($format) {
            case 'json':
                $decoded = json_decode($export, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception("Export JSON invalide : " . json_last_error_msg());
                }
                break;

            case 'csv':
                if (strpos($export, 'Timestamp,Date,Niveau,Message') === false) {
                    throw new Exception("En-têtes CSV manquants");
                }
                break;

            case 'txt':
                if (strlen($export) < 10) {
                    throw new Exception("Export TXT trop court");
                }
                break;
        }
    }

    return true;
}

/**
 * Test 8: Gestion des exceptions
 *
 * @return bool Succès du test
 */
function testGestionExceptions(): bool
{
    $systemeLog = log_gd();

    // Créer une exception de test
    $exception = new RuntimeException('Exception de test pour monitoring', 12345);

    // L'enregistrer
    $systemeLog->exception($exception, ['test' => 'exception_handling']);

    // Vérifier qu'elle apparaît dans les logs d'erreur
    $fichierErreurs = __DIR__ . '/../logs/erreurs.log';
    if (!file_exists($fichierErreurs)) {
        throw new Exception('Fichier erreurs.log non créé pour exception');
    }

    $contenu = file_get_contents($fichierErreurs);
    if (strpos($contenu, 'Exception de test pour monitoring') === false) {
        throw new Exception('Exception non trouvée dans erreurs.log');
    }

    return true;
}

/**
 * Test 9: API de synchronisation monitoring (simulation)
 *
 * @return bool Succès du test
 */
function testAPISynchronisation(): bool
{
    // Vérifier que le fichier API existe
    $fichierAPI = __DIR__ . '/../api/monitoring/sync.php';
    if (!file_exists($fichierAPI)) {
        throw new Exception('Fichier API de synchronisation manquant');
    }

    // Vérifier que le répertoire api/monitoring existe
    $repertoireAPI = dirname($fichierAPI);
    if (!is_dir($repertoireAPI)) {
        throw new Exception('Répertoire API monitoring manquant');
    }

    // Test basique de parsing du fichier
    $contenuAPI = file_get_contents($fichierAPI);
    if (strpos($contenuAPI, 'MonitoringSystemeGeekDragon') === false) {
        throw new Exception('Contenu API invalide ou corrompu');
    }

    return true;
}

/**
 * Test 10: Interface de visualisation
 *
 * @return bool Succès du test
 */
function testInterfaceVisualisation(): bool
{
    // Vérifier que le dashboard admin existe
    $dashboardFile = __DIR__ . '/../admin/monitoring-dashboard.php';
    if (!file_exists($dashboardFile)) {
        throw new Exception('Dashboard de monitoring manquant');
    }

    // Vérifier le contenu basique
    $contenu = file_get_contents($dashboardFile);
    if (strpos($contenu, 'SystemeLogsGeekDragon') === false) {
        throw new Exception('Dashboard ne référence pas le système de logs');
    }

    return true;
}

/**
 * Génère un rapport de test détaillé
 *
 * @return void
 */
function genererRapport(): void
{
    global $résultatsTests, $config;

    $duréeTotale = microtime(true) - $résultatsTests['début'];
    $totalTests = $résultatsTests['tests_passés'] + $résultatsTests['tests_échoués'];
    $tauxRéussite = $totalTests > 0 ? round(($résultatsTests['tests_passés'] / $totalTests) * 100, 1) : 0;

    $rapport = [
        'date_test' => date('Y-m-d H:i:s'),
        'durée_totale_seconde' => round($duréeTotale, 3),
        'résultats' => [
            'total_tests' => $totalTests,
            'tests_passés' => $résultatsTests['tests_passés'],
            'tests_échoués' => $résultatsTests['tests_échoués'],
            'taux_réussite_percent' => $tauxRéussite
        ],
        'métriques_performance' => $résultatsTests['métriques'],
        'erreurs' => $résultatsTests['erreurs'],
        'environnement' => [
            'php_version' => PHP_VERSION,
            'mémoire_pic_mb' => round(memory_get_peak_usage(true) / 1024 / 1024, 2),
            'système' => php_uname()
        ]
    ];

    echo "\n📊 RAPPORT DE TEST DU MONITORING\n";
    echo "================================\n\n";

    echo "🎯 Résultats Globaux :\n";
    echo "   Tests exécutés : {$totalTests}\n";
    echo "   Tests réussis : {$résultatsTests['tests_passés']}\n";
    echo "   Tests échoués : {$résultatsTests['tests_échoués']}\n";
    echo "   Taux de réussite : {$tauxRéussite}%\n";
    echo "   Durée totale : " . round($duréeTotale, 2) . " secondes\n\n";

    if (!empty($résultatsTests['erreurs'])) {
        echo "❌ Erreurs Rencontrées :\n";
        foreach ($résultatsTests['erreurs'] as $erreur) {
            echo "   • {$erreur}\n";
        }
        echo "\n";
    }

    if ($config['verbeux']) {
        echo "⚡ Métriques de Performance :\n";
        foreach ($résultatsTests['métriques'] as $test => $métrique) {
            echo "   {$test} : {$métrique['durée_ms']}ms";
            if (isset($métrique['mémoire_mb'])) {
                echo " | {$métrique['mémoire_mb']}MB";
            }
            echo "\n";
        }
        echo "\n";
    }

    echo "🖥️ Environnement :\n";
    echo "   PHP : " . $rapport['environnement']['php_version'] . "\n";
    echo "   Mémoire pic : {$rapport['environnement']['mémoire_pic_mb']} MB\n\n";

    // Sauvegarder le rapport si demandé
    if ($config['rapport']) {
        $nomRapport = $config['repertoire_logs'] . '/test_monitoring_' . date('Y-m-d_H-i-s') . '.json';
        file_put_contents($nomRapport, json_encode($rapport, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo "💾 Rapport détaillé sauvegardé : " . basename($nomRapport) . "\n";
    }

    // Log du résultat des tests
    log_info('Tests du système de monitoring terminés', [
        'tests_passés' => $résultatsTests['tests_passés'],
        'tests_échoués' => $résultatsTests['tests_échoués'],
        'taux_réussite_percent' => $tauxRéussite,
        'durée_totale_seconde' => round($duréeTotale, 3)
    ]);
}

// === EXÉCUTION PRINCIPALE ===

try {
    echo "🧪 Test du Système de Monitoring - Geek & Dragon\n";
    echo "===============================================\n\n";

    if ($config['quick']) {
        afficherVerbeux("Mode rapide activé - tests essentiels uniquement", 'INFO');
    }

    // Liste des tests à exécuter
    $tests = [
        'Initialisation du système de logs' => 'testInitialisationLogs',
        'Écriture et lecture des logs' => 'testEcritureLecture',
        'Niveaux de logs différents' => 'testNiveauxLogs',
        'Métriques de performance' => 'testMetriques',
        'Rotation des logs' => 'testRotation',
        'Statistiques système' => 'testStatistiques',
        'Export des logs' => 'testExport',
        'Gestion des exceptions' => 'testGestionExceptions',
        'API de synchronisation' => 'testAPISynchronisation',
        'Interface de visualisation' => 'testInterfaceVisualisation'
    ];

    // En mode quick, ne faire que les tests essentiels
    if ($config['quick']) {
        $tests = array_slice($tests, 0, 6, true);
    }

    // Exécuter tous les tests
    foreach ($tests as $nom => $fonction) {
        exécuterTest($nom, $fonction);
    }

    // Générer le rapport final
    genererRapport();

    // Code de sortie basé sur les résultats
    $codeRetour = $résultatsTests['tests_échoués'] > 0 ? 1 : 0;

    if ($codeRetour === 0) {
        echo "🎉 Tous les tests sont passés avec succès !\n";
        echo "Le système de monitoring est opérationnel.\n";
    } else {
        echo "⚠️ Certains tests ont échoué.\n";
        echo "Veuillez vérifier la configuration et les erreurs ci-dessus.\n";
    }

    exit($codeRetour);

} catch (Exception $e) {
    echo "💥 Erreur fatale lors des tests : " . $e->getMessage() . "\n";
    log_error('Erreur fatale tests monitoring', [
        'erreur' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit(1);
}
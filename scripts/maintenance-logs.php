#!/usr/bin/env php
<?php
/**
 * Script de Maintenance des Logs - Geek & Dragon
 *
 * Script CLI pour la maintenance automatisée du système de logs :
 * - Rotation des logs anciens
 * - Nettoyage des fichiers expirés
 * - Compression des archives
 * - Génération de rapports de synthèse
 * - Optimisation des performances
 *
 * Usage:
 *   php scripts/maintenance-logs.php [--rotation] [--nettoyage] [--rapport] [--compression] [--dry-run]
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

// Configuration par défaut
$config = [
    'retention_jours' => 30,        // Conserver les logs pendant 30 jours
    'compression_jours' => 7,       // Comprimer les logs de plus de 7 jours
    'taille_max_repertoire' => 100, // Taille maximale du répertoire de logs en MB
    'dry_run' => false,             // Mode simulation par défaut
    'verbeux' => true,              // Affichage détaillé
    'repertoire_logs' => $scriptDir . '/logs',
    'repertoire_archives' => $scriptDir . '/logs/archives'
];

/**
 * Affiche l'aide d'utilisation du script
 *
 * @return void
 */
function afficherAide(): void
{
    echo "Script de Maintenance des Logs - Geek & Dragon\n";
    echo "==============================================\n\n";
    echo "Usage: php scripts/maintenance-logs.php [OPTIONS]\n\n";
    echo "Options:\n";
    echo "  --rotation        Effectuer la rotation des logs\n";
    echo "  --nettoyage       Nettoyer les anciens fichiers\n";
    echo "  --compression     Comprimer les logs anciens\n";
    echo "  --rapport         Générer un rapport de synthèse\n";
    echo "  --optimisation    Optimiser les performances des logs\n";
    echo "  --dry-run         Mode simulation (pas de modifications)\n";
    echo "  --verbeux         Affichage détaillé\n";
    echo "  --retention=X     Nombre de jours de rétention (défaut: 30)\n";
    echo "  --taille-max=X    Taille max du répertoire en MB (défaut: 100)\n";
    echo "  --help            Afficher cette aide\n\n";
    echo "Exemples:\n";
    echo "  php scripts/maintenance-logs.php --rotation --nettoyage\n";
    echo "  php scripts/maintenance-logs.php --rapport --verbeux\n";
    echo "  php scripts/maintenance-logs.php --dry-run --rotation\n\n";
}

/**
 * Analyse les arguments de ligne de commande
 *
 * @param array $argv Arguments CLI
 * @return array Configuration analysée
 */
function analyserArguments(array $argv): array
{
    global $config;

    $actions = [
        'rotation' => false,
        'nettoyage' => false,
        'compression' => false,
        'rapport' => false,
        'optimisation' => false
    ];

    for ($i = 1; $i < count($argv); $i++) {
        $arg = $argv[$i];

        switch ($arg) {
            case '--help':
            case '-h':
                afficherAide();
                exit(0);

            case '--rotation':
                $actions['rotation'] = true;
                break;

            case '--nettoyage':
                $actions['nettoyage'] = true;
                break;

            case '--compression':
                $actions['compression'] = true;
                break;

            case '--rapport':
                $actions['rapport'] = true;
                break;

            case '--optimisation':
                $actions['optimisation'] = true;
                break;

            case '--dry-run':
                $config['dry_run'] = true;
                break;

            case '--verbeux':
                $config['verbeux'] = true;
                break;

            default:
                if (str_starts_with($arg, '--retention=')) {
                    $config['retention_jours'] = (int) substr($arg, 12);
                } elseif (str_starts_with($arg, '--taille-max=')) {
                    $config['taille_max_repertoire'] = (int) substr($arg, 13);
                } else {
                    echo "Argument non reconnu : {$arg}\n";
                    echo "Utilisez --help pour voir l'aide.\n";
                    exit(1);
                }
        }
    }

    // Si aucune action spécifiée, faire toutes les actions
    if (!array_filter($actions)) {
        $actions = array_fill_keys(array_keys($actions), true);
    }

    return $actions;
}

/**
 * Effectue la rotation des logs volumineux
 *
 * @param array $config Configuration
 * @return array Statistiques de rotation
 */
function effectuerRotation(array $config): array
{
    $stats = ['fichiers_rotés' => 0, 'taille_libérée' => 0];

    if ($config['verbeux']) {
        echo "🔄 Rotation des logs en cours...\n";
    }

    $systemeLog = LogManager::getInstance();
    $nombreSupprimes = $systemeLog->nettoyerAnciennesLogs();

    $stats['fichiers_rotés'] = $nombreSupprimes;

    if ($config['verbeux']) {
        echo "   ✅ {$nombreSupprimes} fichiers rotés\n";
    }

    log_info('Rotation des logs effectuée', [
        'fichiers_rotés' => $nombreSupprimes,
        'dry_run' => $config['dry_run']
    ]);

    return $stats;
}

/**
 * Nettoie les anciens fichiers selon la politique de rétention
 *
 * @param array $config Configuration
 * @return array Statistiques de nettoyage
 */
function effectuerNettoyage(array $config): array
{
    $stats = ['fichiers_supprimés' => 0, 'espace_libéré' => 0];

    if ($config['verbeux']) {
        echo "🧹 Nettoyage des anciens logs...\n";
    }

    $repertoire = $config['repertoire_logs'];
    $seuilRetention = time() - ($config['retention_jours'] * 24 * 3600);

    $fichiers = glob($repertoire . '/*.log*');

    foreach ($fichiers as $fichier) {
        $dateModification = filemtime($fichier);

        if ($dateModification < $seuilRetention) {
            $taille = filesize($fichier);

            if ($config['verbeux']) {
                echo "   🗑️ Suppression : " . basename($fichier) . " (" . formaterTaille($taille) . ")\n";
            }

            if (!$config['dry_run']) {
                if (unlink($fichier)) {
                    $stats['fichiers_supprimés']++;
                    $stats['espace_libéré'] += $taille;
                }
            } else {
                $stats['fichiers_supprimés']++;
                $stats['espace_libéré'] += $taille;
            }
        }
    }

    if ($config['verbeux']) {
        echo "   ✅ {$stats['fichiers_supprimés']} fichiers supprimés, ";
        echo formaterTaille($stats['espace_libéré']) . " libérés\n";
    }

    log_info('Nettoyage des logs effectué', [
        'fichiers_supprimés' => $stats['fichiers_supprimés'],
        'espace_libéré_bytes' => $stats['espace_libéré'],
        'retention_jours' => $config['retention_jours'],
        'dry_run' => $config['dry_run']
    ]);

    return $stats;
}

/**
 * Compresse les logs anciens pour économiser l'espace
 *
 * @param array $config Configuration
 * @return array Statistiques de compression
 */
function effectuerCompression(array $config): array
{
    $stats = ['fichiers_compressés' => 0, 'espace_économisé' => 0];

    if (!extension_loaded('zlib')) {
        if ($config['verbeux']) {
            echo "⚠️ Extension zlib non disponible, compression ignorée\n";
        }
        return $stats;
    }

    if ($config['verbeux']) {
        echo "📦 Compression des logs anciens...\n";
    }

    $repertoire = $config['repertoire_logs'];
    $seuilCompression = time() - ($config['compression_jours'] * 24 * 3600);

    // Créer le répertoire d'archives si nécessaire
    if (!is_dir($config['repertoire_archives'])) {
        if (!$config['dry_run']) {
            mkdir($config['repertoire_archives'], 0755, true);
        }
    }

    $fichiers = glob($repertoire . '/*.log.*');

    foreach ($fichiers as $fichier) {
        // Ignorer les fichiers déjà compressés
        if (str_ends_with($fichier, '.gz')) {
            continue;
        }

        $dateModification = filemtime($fichier);

        if ($dateModification < $seuilCompression) {
            $tailleOriginale = filesize($fichier);
            $nomArchive = $config['repertoire_archives'] . '/' . basename($fichier) . '.gz';

            if ($config['verbeux']) {
                echo "   📦 Compression : " . basename($fichier) . "\n";
            }

            if (!$config['dry_run']) {
                $contenu = file_get_contents($fichier);
                $contenuCompressé = gzencode($contenu, 9);

                if ($contenuCompressé !== false) {
                    file_put_contents($nomArchive, $contenuCompressé);
                    $tailleCompressée = filesize($nomArchive);

                    // Supprimer l'original après compression réussie
                    unlink($fichier);

                    $stats['fichiers_compressés']++;
                    $stats['espace_économisé'] += $tailleOriginale - $tailleCompressée;

                    if ($config['verbeux']) {
                        $ratioCompression = round((1 - $tailleCompressée / $tailleOriginale) * 100, 1);
                        echo "      ✅ {$ratioCompression}% d'économie d'espace\n";
                    }
                }
            } else {
                $stats['fichiers_compressés']++;
                $stats['espace_économisé'] += $tailleOriginale * 0.7; // Estimation 70% compression
            }
        }
    }

    if ($config['verbeux']) {
        echo "   ✅ {$stats['fichiers_compressés']} fichiers compressés, ";
        echo formaterTaille($stats['espace_économisé']) . " économisés\n";
    }

    log_info('Compression des logs effectuée', [
        'fichiers_compressés' => $stats['fichiers_compressés'],
        'espace_économisé_bytes' => $stats['espace_économisé'],
        'compression_jours' => $config['compression_jours'],
        'dry_run' => $config['dry_run']
    ]);

    return $stats;
}

/**
 * Génère un rapport de synthèse du système de logs
 *
 * @param array $config Configuration
 * @return array Données du rapport
 */
function genererRapport(array $config): array
{
    if ($config['verbeux']) {
        echo "📊 Génération du rapport de synthèse...\n";
    }

    $systemeLog = LogManager::getInstance();
    $stats = $systemeLog->obtenirStatistiques();

    // Analyse du répertoire de logs
    $repertoire = $config['repertoire_logs'];
    $fichiers = glob($repertoire . '/*');
    $tailleTotal = 0;
    $repartitionTypes = [];

    foreach ($fichiers as $fichier) {
        if (is_file($fichier)) {
            $taille = filesize($fichier);
            $tailleTotal += $taille;

            $extension = pathinfo($fichier, PATHINFO_EXTENSION);
            $repartitionTypes[$extension] = ($repartitionTypes[$extension] ?? 0) + $taille;
        }
    }

    $rapport = [
        'date_rapport' => date('Y-m-d H:i:s'),
        'système' => $stats['systeme'],
        'répertoire_logs' => [
            'chemin' => $repertoire,
            'taille_totale' => $tailleTotal,
            'taille_formatée' => formaterTaille($tailleTotal),
            'nombre_fichiers' => count($fichiers),
            'répartition_types' => $repartitionTypes
        ],
        'configuration' => [
            'rétention_jours' => $config['retention_jours'],
            'compression_jours' => $config['compression_jours'],
            'taille_max_mb' => $config['taille_max_repertoire']
        ],
        'alertes' => []
    ];

    // Analyse des alertes
    $tailleLimiteMB = $config['taille_max_repertoire'] * 1024 * 1024;

    if ($tailleTotal > $tailleLimiteMB) {
        $rapport['alertes'][] = [
            'niveau' => 'WARN',
            'message' => 'Taille du répertoire de logs dépassée',
            'details' => "Actuel: " . formaterTaille($tailleTotal) . ", Limite: " . formaterTaille($tailleLimiteMB)
        ];
    }

    if ($stats['systeme']['memoire_utilisee_mb'] > 100) {
        $rapport['alertes'][] = [
            'niveau' => 'INFO',
            'message' => 'Utilisation mémoire élevée',
            'details' => $stats['systeme']['memoire_utilisee_mb'] . ' MB utilisés'
        ];
    }

    // Affichage du rapport
    if ($config['verbeux']) {
        echo "\n📋 RAPPORT DE SYNTHÈSE\n";
        echo "=====================\n\n";

        echo "🖥️ Système :\n";
        echo "   PHP Version : " . $rapport['système']['php_version'] . "\n";
        echo "   Mémoire utilisée : " . $rapport['système']['memoire_utilisee_mb'] . " MB\n";
        echo "   Uptime processus : " . $rapport['système']['uptime_processus'] . "\n\n";

        echo "📁 Logs :\n";
        echo "   Répertoire : " . $rapport['répertoire_logs']['chemin'] . "\n";
        echo "   Taille totale : " . $rapport['répertoire_logs']['taille_formatée'] . "\n";
        echo "   Nombre de fichiers : " . $rapport['répertoire_logs']['nombre_fichiers'] . "\n\n";

        if (!empty($rapport['alertes'])) {
            echo "⚠️ Alertes :\n";
            foreach ($rapport['alertes'] as $alerte) {
                echo "   [{$alerte['niveau']}] {$alerte['message']}\n";
                echo "          {$alerte['details']}\n";
            }
            echo "\n";
        }
    }

    // Sauvegarder le rapport
    $nomRapport = $repertoire . '/rapport_maintenance_' . date('Y-m-d_H-i-s') . '.json';
    if (!$config['dry_run']) {
        file_put_contents($nomRapport, json_encode($rapport, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        if ($config['verbeux']) {
            echo "💾 Rapport sauvegardé : " . basename($nomRapport) . "\n";
        }
    }

    log_info('Rapport de maintenance généré', [
        'taille_logs_mb' => round($tailleTotal / 1024 / 1024, 2),
        'nombre_fichiers' => count($fichiers),
        'nombre_alertes' => count($rapport['alertes']),
        'fichier_rapport' => basename($nomRapport ?? 'dry-run')
    ]);

    return $rapport;
}

/**
 * Optimise les performances du système de logs
 *
 * @param array $config Configuration
 * @return array Résultats de l'optimisation
 */
function effectuerOptimisation(array $config): array
{
    $stats = ['optimisations_appliquées' => 0, 'amélioration_performance' => 0];

    if ($config['verbeux']) {
        echo "⚡ Optimisation des performances...\n";
    }

    $repertoire = $config['repertoire_logs'];

    // 1. Défragmentation des gros fichiers de logs
    $fichiers = glob($repertoire . '/*.log');
    foreach ($fichiers as $fichier) {
        $taille = filesize($fichier);

        // Défragmenter les fichiers > 5MB
        if ($taille > 5 * 1024 * 1024) {
            if ($config['verbeux']) {
                echo "   🔧 Défragmentation : " . basename($fichier) . "\n";
            }

            if (!$config['dry_run']) {
                // Réécrire le fichier pour éliminer la fragmentation
                $contenu = file_get_contents($fichier);
                file_put_contents($fichier . '.tmp', $contenu);
                rename($fichier . '.tmp', $fichier);
            }

            $stats['optimisations_appliquées']++;
        }
    }

    // 2. Optimisation des permissions
    if (!$config['dry_run']) {
        chmod($repertoire, 0755);
        foreach (glob($repertoire . '/*') as $fichier) {
            chmod($fichier, is_dir($fichier) ? 0755 : 0644);
        }
    }

    if ($config['verbeux']) {
        echo "   ✅ {$stats['optimisations_appliquées']} optimisations appliquées\n";
    }

    log_info('Optimisation des logs effectuée', [
        'optimisations_appliquées' => $stats['optimisations_appliquées'],
        'dry_run' => $config['dry_run']
    ]);

    return $stats;
}

/**
 * Formate une taille en octets de manière lisible
 *
 * @param int $octets Nombre d'octets
 * @return string Taille formatée
 */
function formaterTaille(int $octets): string
{
    $unités = ['B', 'KB', 'MB', 'GB', 'TB'];
    $index = 0;

    while ($octets >= 1024 && $index < count($unités) - 1) {
        $octets /= 1024;
        $index++;
    }

    return round($octets, 2) . ' ' . $unités[$index];
}

// === EXÉCUTION PRINCIPALE ===

try {
    echo "🔍 Script de Maintenance des Logs - Geek & Dragon\n";
    echo "================================================\n\n";

    if ($config['dry_run']) {
        echo "🧪 MODE SIMULATION ACTIVÉ - Aucune modification ne sera effectuée\n\n";
    }

    $actions = analyserArguments($argv);
    $statistiquesGlobales = [
        'début' => microtime(true),
        'actions_effectuées' => [],
        'erreurs' => 0
    ];

    // Exécuter les actions demandées
    foreach ($actions as $action => $actif) {
        if (!$actif) continue;

        try {
            $début = microtime(true);

            switch ($action) {
                case 'rotation':
                    $résultat = effectuerRotation($config);
                    break;
                case 'nettoyage':
                    $résultat = effectuerNettoyage($config);
                    break;
                case 'compression':
                    $résultat = effectuerCompression($config);
                    break;
                case 'rapport':
                    $résultat = genererRapport($config);
                    break;
                case 'optimisation':
                    $résultat = effectuerOptimisation($config);
                    break;
                default:
                    continue 2;
            }

            $durée = microtime(true) - $début;
            $statistiquesGlobales['actions_effectuées'][$action] = [
                'résultat' => $résultat,
                'durée_seconde' => round($durée, 3)
            ];

        } catch (Exception $e) {
            $statistiquesGlobales['erreurs']++;
            log_error("Erreur lors de l'action {$action}", [
                'erreur' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            echo "❌ Erreur lors de {$action} : " . $e->getMessage() . "\n";
        }
    }

    $duréeTotale = microtime(true) - $statistiquesGlobales['début'];

    echo "\n🏁 Maintenance terminée en " . round($duréeTotale, 2) . " secondes\n";
    echo "   Actions effectuées : " . count($statistiquesGlobales['actions_effectuées']) . "\n";
    echo "   Erreurs : " . $statistiquesGlobales['erreurs'] . "\n";

    // Log final de synthèse
    log_info('Maintenance des logs terminée', [
        'durée_totale_seconde' => round($duréeTotale, 3),
        'actions_effectuées' => array_keys($statistiquesGlobales['actions_effectuées']),
        'nombre_erreurs' => $statistiquesGlobales['erreurs'],
        'mode_dry_run' => $config['dry_run']
    ]);

    exit($statistiquesGlobales['erreurs'] > 0 ? 1 : 0);

} catch (Exception $e) {
    echo "💥 Erreur fatale : " . $e->getMessage() . "\n";
    log_error('Erreur fatale maintenance logs', [
        'erreur' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    exit(1);
}
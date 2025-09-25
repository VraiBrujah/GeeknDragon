<?php
/**
 * Script de gestion du système multilingue unifié - GeeknDragon
 *
 * Fournit une interface en ligne de commande pour gérer les traductions
 * et l'extension du système à de nouvelles langues
 */

require 'includes/csv-products-manager.php';

echo "🌍 Gestionnaire de Traductions - GeeknDragon" . PHP_EOL;
echo "=============================================" . PHP_EOL;

$manager = new CsvProductsManager();

// Analyse des arguments de ligne de commande
$action = $argv[1] ?? '';
$param = $argv[2] ?? '';

switch ($action) {
    case 'report':
    case 'rapport':
        generateReport();
        break;

    case 'add-language':
    case 'add-lang':
        if (empty($param)) {
            echo "❌ Usage: php manage-translations.php add-language <code_langue>" . PHP_EOL;
            echo "   Exemple: php manage-translations.php add-language es" . PHP_EOL;
            exit(1);
        }
        addLanguage($param);
        break;

    case 'extend-csv':
        if (empty($param)) {
            echo "❌ Usage: php manage-translations.php extend-csv <code_langue>" . PHP_EOL;
            echo "   Exemple: php manage-translations.php extend-csv es" . PHP_EOL;
            exit(1);
        }
        extendCsvForLanguage($param);
        break;

    case 'detect-languages':
    case 'detect':
        detectLanguages();
        break;

    case 'sync':
    case 'synchronize':
        synchronizeTranslations();
        break;

    case 'validate':
        validateConsistency();
        break;

    case 'help':
    case '--help':
    case '-h':
    default:
        showHelp();
        break;
}

/**
 * Génère un rapport complet du système multilingue
 */
function generateReport(): void
{
    global $manager;

    echo "📊 GÉNÉRATION DU RAPPORT MULTILINGUE" . PHP_EOL;
    echo "====================================" . PHP_EOL . PHP_EOL;

    $csvPath = 'data/products.csv';
    $report = $manager->generateMultilingualReport($csvPath);

    if (!$report['success']) {
        echo "❌ Erreur génération rapport" . PHP_EOL;
        return;
    }

    // Analyse CSV
    echo "📋 ANALYSE DU CSV PRODUITS:" . PHP_EOL;
    if ($report['csv_analysis']['success']) {
        $csv = $report['csv_analysis'];
        echo "   ✅ Langues détectées: " . implode(', ', $csv['languages_detected']) . PHP_EOL;
        echo "   📊 Total langues: " . $csv['total_languages'] . PHP_EOL;
        echo "   🏷️ Champs multilingues: " . $csv['total_multilingual_fields'] . PHP_EOL;

        echo PHP_EOL . "   📋 Champs par langue:" . PHP_EOL;
        foreach ($csv['fields_by_language'] as $lang => $fields) {
            echo "      {$lang}: " . implode(', ', $fields) . PHP_EOL;
        }
    } else {
        echo "   ❌ " . $report['csv_analysis']['message'] . PHP_EOL;
    }

    echo PHP_EOL;

    // Cohérence système I18N
    echo "🌐 SYSTÈME I18N PRINCIPAL:" . PHP_EOL;
    if ($report['i18n_consistency']['success']) {
        $i18n = $report['i18n_consistency'];
        foreach ($i18n['languages'] as $lang => $info) {
            $status = $info['file_exists'] ? '✅' : '❌';
            $count = $info['file_exists'] ? " ({$info['products_count']} produits)" : '';
            echo "   {$status} {$lang}.json{$count}" . PHP_EOL;
        }
    }

    echo PHP_EOL;

    // Alignement des systèmes
    if (isset($report['system_alignment'])) {
        $align = $report['system_alignment'];
        echo "🔄 ALIGNEMENT DES SYSTÈMES:" . PHP_EOL;
        echo "   🔗 Alignement complet: " . ($align['fully_aligned'] ? '✅ OUI' : '❌ NON') . PHP_EOL;
        echo "   🌍 Langues synchronisées: " . implode(', ', $align['synchronized_languages']) . PHP_EOL;

        if (!empty($align['csv_only_languages'])) {
            echo "   ⚠️ Langues CSV seulement: " . implode(', ', $align['csv_only_languages']) . PHP_EOL;
        }

        if (!empty($align['i18n_only_languages'])) {
            echo "   ⚠️ Langues I18N seulement: " . implode(', ', $align['i18n_only_languages']) . PHP_EOL;
        }
    }

    echo PHP_EOL . "✅ Rapport généré à " . $report['timestamp'] . PHP_EOL;
}

/**
 * Ajoute support pour une nouvelle langue
 */
function addLanguage(string $langCode): void
{
    global $manager;

    echo "🆕 AJOUT SUPPORT NOUVELLE LANGUE: {$langCode}" . PHP_EOL;
    echo "======================================" . PHP_EOL . PHP_EOL;

    $result = $manager->addLanguageSupport($langCode);

    if ($result['success']) {
        echo "✅ " . $result['message'] . PHP_EOL;
        echo "📄 Fichier JSON créé: " . basename($result['json_file_created']) . PHP_EOL;
        echo "⚙️ Configuration i18n.php mise à jour" . PHP_EOL;

        if (isset($result['csv_extension_needed'])) {
            $ext = $result['csv_extension_needed'];
            echo PHP_EOL . "📋 ÉTAPES SUIVANTES:" . PHP_EOL;
            echo "1. " . $ext['instructions'] . PHP_EOL;
            echo "2. Colonnes à ajouter: " . implode(', ', $ext['new_columns_needed']) . PHP_EOL;
            echo "3. Utilisez: php manage-translations.php extend-csv {$langCode}" . PHP_EOL;
        }

    } else {
        echo "❌ " . $result['message'] . PHP_EOL;
    }
}

/**
 * Étend le CSV pour une nouvelle langue
 */
function extendCsvForLanguage(string $langCode): void
{
    global $manager;

    echo "📋 EXTENSION CSV POUR LANGUE: {$langCode}" . PHP_EOL;
    echo "=================================" . PHP_EOL . PHP_EOL;

    $csvPath = 'data/products.csv';
    $result = $manager->extendCsvForLanguage($csvPath, $langCode);

    if ($result['success']) {
        echo "✅ " . $result['message'] . PHP_EOL;
        echo "📄 Fichier généré: " . basename($result['output_file']) . PHP_EOL;
        echo "📊 Colonnes ajoutées: " . implode(', ', $result['new_columns_added']) . PHP_EOL;

        echo PHP_EOL . "📋 ÉTAPES SUIVANTES:" . PHP_EOL;
        foreach ($result['next_steps'] as $step) {
            echo "   " . $step . PHP_EOL;
        }

    } else {
        echo "❌ " . $result['message'] . PHP_EOL;
    }
}

/**
 * Détecte les langues dans le CSV
 */
function detectLanguages(): void
{
    global $manager;

    echo "🔍 DÉTECTION LANGUES CSV" . PHP_EOL;
    echo "========================" . PHP_EOL . PHP_EOL;

    $csvPath = 'data/products.csv';
    $result = $manager->detectCsvLanguages($csvPath);

    if ($result['success']) {
        echo "✅ Analyse terminée" . PHP_EOL;
        echo "🌍 Langues détectées: " . implode(', ', $result['languages_detected']) . PHP_EOL;
        echo "📊 Total langues: " . $result['total_languages'] . PHP_EOL;
        echo "🏷️ Champs multilingues: " . $result['total_multilingual_fields'] . PHP_EOL;

        echo PHP_EOL . "📋 Détail par langue:" . PHP_EOL;
        foreach ($result['fields_by_language'] as $lang => $fields) {
            echo "   {$lang}: " . implode(', ', $fields) . PHP_EOL;
        }

    } else {
        echo "❌ " . $result['message'] . PHP_EOL;
    }
}

/**
 * Synchronise les traductions
 */
function synchronizeTranslations(): void
{
    echo "🔄 SYNCHRONISATION TRADUCTIONS" . PHP_EOL;
    echo "==============================" . PHP_EOL . PHP_EOL;

    echo "Exécution de la conversion avec synchronisation..." . PHP_EOL;

    // Exécution du script de conversion avec synchronisation
    $output = [];
    $returnCode = 0;
    exec('php convert-products.php', $output, $returnCode);

    foreach ($output as $line) {
        echo $line . PHP_EOL;
    }

    if ($returnCode === 0) {
        echo PHP_EOL . "✅ Synchronisation terminée avec succès" . PHP_EOL;
    } else {
        echo PHP_EOL . "❌ Erreur lors de la synchronisation" . PHP_EOL;
    }
}

/**
 * Valide la cohérence des traductions
 */
function validateConsistency(): void
{
    global $manager;

    echo "🔍 VALIDATION COHÉRENCE TRADUCTIONS" . PHP_EOL;
    echo "===================================" . PHP_EOL . PHP_EOL;

    $result = $manager->validateTranslationConsistency();

    if ($result['success']) {
        echo "✅ Validation terminée" . PHP_EOL . PHP_EOL;

        foreach ($result['languages'] as $lang => $info) {
            if ($info['file_exists']) {
                echo "✅ {$lang}.json - {$info['products_count']} produits - Modifié: {$info['last_modified']}" . PHP_EOL;
            } else {
                echo "❌ {$lang}.json - FICHIER MANQUANT" . PHP_EOL;
            }
        }

        if (!empty($result['inconsistencies'])) {
            echo PHP_EOL . "⚠️ Incohérences détectées:" . PHP_EOL;
            foreach ($result['inconsistencies'] as $inconsistency) {
                echo "   - " . $inconsistency . PHP_EOL;
            }
        } else {
            echo PHP_EOL . "✅ Aucune incohérence détectée" . PHP_EOL;
        }

    } else {
        echo "❌ Erreur validation" . PHP_EOL;
    }
}

/**
 * Affiche l'aide
 */
function showHelp(): void
{
    echo "💡 AIDE - Gestionnaire de Traductions GeeknDragon" . PHP_EOL;
    echo "================================================" . PHP_EOL . PHP_EOL;

    echo "COMMANDES DISPONIBLES:" . PHP_EOL . PHP_EOL;

    echo "📊 ANALYSE & RAPPORTS:" . PHP_EOL;
    echo "  report                    Génère un rapport complet du système multilingue" . PHP_EOL;
    echo "  detect-languages         Détecte les langues présentes dans le CSV" . PHP_EOL;
    echo "  validate                 Valide la cohérence des traductions" . PHP_EOL . PHP_EOL;

    echo "🆕 GESTION DES LANGUES:" . PHP_EOL;
    echo "  add-language <code>      Ajoute support pour une nouvelle langue" . PHP_EOL;
    echo "  extend-csv <code>        Étend le CSV avec les colonnes d'une nouvelle langue" . PHP_EOL . PHP_EOL;

    echo "🔄 SYNCHRONISATION:" . PHP_EOL;
    echo "  sync                     Synchronise les traductions CSV vers système I18N" . PHP_EOL . PHP_EOL;

    echo "EXEMPLES:" . PHP_EOL;
    echo "  php manage-translations.php report" . PHP_EOL;
    echo "  php manage-translations.php add-language es" . PHP_EOL;
    echo "  php manage-translations.php extend-csv de" . PHP_EOL;
    echo "  php manage-translations.php sync" . PHP_EOL . PHP_EOL;

    echo "📋 CODES LANGUES COURANTS:" . PHP_EOL;
    echo "  es (Espagnol), de (Allemand), it (Italien), pt (Portugais)" . PHP_EOL;
    echo "  nl (Néerlandais), ru (Russe), ja (Japonais), zh (Chinois)" . PHP_EOL . PHP_EOL;

    echo "🔗 WORKFLOW TYPIQUE NOUVELLE LANGUE:" . PHP_EOL;
    echo "1. php manage-translations.php add-language es" . PHP_EOL;
    echo "2. php manage-translations.php extend-csv es" . PHP_EOL;
    echo "3. [Remplir manuellement les traductions dans le CSV étendu]" . PHP_EOL;
    echo "4. php manage-translations.php sync" . PHP_EOL;
    echo "5. php manage-translations.php validate" . PHP_EOL;
}
?>
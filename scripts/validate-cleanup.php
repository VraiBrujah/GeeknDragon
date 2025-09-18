<?php
/**
 * Validation post-nettoyage Phase 1
 * Vérifie que le nettoyage s'est bien déroulé
 */

echo "🔍 VALIDATION POST-NETTOYAGE PHASE 1\n";
echo "====================================\n\n";

$errors = [];
$warnings = [];
$success = [];

// 1. Vérifier que les fichiers redondants ont été supprimés
echo "🗑️ Vérification suppression des fichiers redondants...\n";

$deletedFiles = [
    'user-system/api/login.php',
    'user-system/api/register.php',
    'user-system/api/logout.php',
    'user-system/api/check-session.php',
    'user-system/login.html',
    'user-system/character-creation.html'
];

foreach ($deletedFiles as $file) {
    if (file_exists(__DIR__ . '/../' . $file)) {
        $errors[] = "❌ Fichier non supprimé: {$file}";
    } else {
        $success[] = "✅ Fichier supprimé: {$file}";
    }
}

// 2. Vérifier que les fichiers essentiels sont conservés
echo "\n📋 Vérification conservation des fichiers essentiels...\n";

$essentialFiles = [
    'user-system/database-schema.sql' => 'Schéma principal',
    'user-system/database-invoices-schema.sql' => 'Schéma factures',
    'src/Service/DatabaseService.php' => 'Service base centralisé',
    'src/Controller/AccountController.php' => 'Contrôleur unifié',
    'compte.php' => 'Interface modernisée',
    'views/account/invoices.php' => 'Interface factures'
];

foreach ($essentialFiles as $file => $desc) {
    if (file_exists(__DIR__ . '/../' . $file)) {
        $success[] = "✅ {$desc}: {$file}";
    } else {
        $errors[] = "❌ Fichier essentiel manquant: {$file} ({$desc})";
    }
}

// 3. Vérifier que la sauvegarde existe
echo "\n💾 Vérification de la sauvegarde...\n";

$backupDir = __DIR__ . '/../backup-phase1';
if (is_dir($backupDir)) {
    $backupFiles = scandir($backupDir);
    $backupCount = count($backupFiles) - 2; // Enlever . et ..
    
    if ($backupCount > 0) {
        $success[] = "✅ Sauvegarde créée: {$backupCount} fichiers";
    } else {
        $warnings[] = "⚠️ Sauvegarde vide";
    }
} else {
    $errors[] = "❌ Dossier de sauvegarde manquant";
}

// 4. Vérifier la structure finale
echo "\n📂 Vérification structure finale user-system/...\n";

$userSystemDir = __DIR__ . '/../user-system';
if (is_dir($userSystemDir)) {
    $files = scandir($userSystemDir);
    $actualFiles = array_diff($files, ['.', '..']);
    
    $expectedFiles = ['database-schema.sql', 'database-invoices-schema.sql', 'js'];
    $extraFiles = array_diff($actualFiles, $expectedFiles);
    $missingFiles = array_diff($expectedFiles, $actualFiles);
    
    if (empty($extraFiles) && empty($missingFiles)) {
        $success[] = "✅ Structure user-system/ optimale";
    } else {
        if (!empty($extraFiles)) {
            $warnings[] = "⚠️ Fichiers supplémentaires: " . implode(', ', $extraFiles);
        }
        if (!empty($missingFiles)) {
            $errors[] = "❌ Fichiers manquants: " . implode(', ', $missingFiles);
        }
    }
}

// 5. Vérifier l'absence du dossier api
echo "\n🗂️ Vérification suppression dossier api...\n";

if (!is_dir(__DIR__ . '/../user-system/api')) {
    $success[] = "✅ Dossier api supprimé";
} else {
    $warnings[] = "⚠️ Dossier api encore présent";
}

// 6. Résultats finaux
echo "\n" . str_repeat("=", 50) . "\n";
echo "📊 RÉSULTATS DE LA VALIDATION\n";
echo str_repeat("=", 50) . "\n\n";

if (!empty($success)) {
    echo "✅ SUCCÈS (" . count($success) . "):\n";
    foreach ($success as $msg) {
        echo "   {$msg}\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "⚠️ AVERTISSEMENTS (" . count($warnings) . "):\n";
    foreach ($warnings as $msg) {
        echo "   {$msg}\n";
    }
    echo "\n";
}

if (!empty($errors)) {
    echo "❌ ERREURS (" . count($errors) . "):\n";
    foreach ($errors as $msg) {
        echo "   {$msg}\n";
    }
    echo "\n";
}

// Verdict final
if (empty($errors)) {
    if (empty($warnings)) {
        echo "🎉 NETTOYAGE PARFAIT!\n";
        echo "✨ Tous les objectifs atteints sans problème\n";
        echo "🚀 Prêt pour Phase 2: Consolidation Snipcart\n";
        exit(0);
    } else {
        echo "🟡 NETTOYAGE RÉUSSI AVEC AVERTISSEMENTS\n";
        echo "✅ Objectifs principaux atteints\n";
        echo "⚠️ Quelques points mineurs à vérifier\n";
        echo "🚀 Peut procéder à Phase 2\n";
        exit(0);
    }
} else {
    echo "🔴 NETTOYAGE INCOMPLET\n";
    echo "❌ Certains objectifs non atteints\n";
    echo "🛠️ Corriger les erreurs avant Phase 2\n";
    exit(1);
}
?>
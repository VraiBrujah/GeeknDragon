<?php
/**
 * Script de configuration et vérification pour HostPapa
 * À exécuter une seule fois après upload des fichiers
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Configuration HostPapa - Geek & Dragon</h1>";

$errors = [];
$warnings = [];
$success = [];

// 1. Vérifier la version PHP
echo "<h2>1. Vérification PHP</h2>";
$phpVersion = phpversion();
echo "Version PHP : $phpVersion<br>";

if (version_compare($phpVersion, '7.4', '<')) {
    $errors[] = "Version PHP trop ancienne ($phpVersion). Minimum requis : 7.4";
} else {
    $success[] = "Version PHP compatible ($phpVersion)";
}

// 2. Vérifier les extensions
echo "<h2>2. Extensions PHP</h2>";
$requiredExtensions = ['curl', 'json', 'openssl', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ $ext<br>";
    } else {
        $errors[] = "Extension PHP manquante : $ext";
        echo "❌ $ext<br>";
    }
}

// 3. Décompresser vendor.zip si nécessaire
echo "<h2>3. Installation des dépendances</h2>";
if (!is_dir(__DIR__ . '/vendor') || !file_exists(__DIR__ . '/vendor/autoload.php')) {
    if (file_exists(__DIR__ . '/vendor.zip')) {
        echo "Décompression de vendor.zip...<br>";
        
        $zip = new ZipArchive;
        $result = $zip->open(__DIR__ . '/vendor.zip');
        
        if ($result === TRUE) {
            $zip->extractTo(__DIR__ . '/');
            $zip->close();
            
            if (file_exists(__DIR__ . '/vendor/autoload.php')) {
                $success[] = "Dépendances installées depuis vendor.zip";
                echo "✅ vendor.zip décompressé avec succès<br>";
                
                // Supprimer vendor.zip après extraction
                unlink(__DIR__ . '/vendor.zip');
                echo "vendor.zip supprimé<br>";
            } else {
                $errors[] = "Échec de la décompression de vendor.zip";
            }
        } else {
            $errors[] = "Impossible d'ouvrir vendor.zip (code: $result)";
        }
    } else {
        $errors[] = "vendor/ et vendor.zip manquants. Uploadez vendor.zip ou le dossier vendor/";
    }
} else {
    $success[] = "Dossier vendor/ déjà présent";
    echo "✅ vendor/ existe<br>";
}

// 4. Vérifier les fichiers critiques
echo "<h2>4. Fichiers critiques</h2>";
$criticalFiles = [
    'bootstrap.php',
    'config.php',
    'i18n.php',
    'index.php',
    'boutique.php',
    'data/products.json',
    'data/stock.json',
    'translations/fr.json',
    'translations/en.json'
];

foreach ($criticalFiles as $file) {
    $path = __DIR__ . '/' . $file;
    if (file_exists($path)) {
        echo "✅ $file<br>";
        
        // Vérifier les JSON
        if (pathinfo($file, PATHINFO_EXTENSION) === 'json') {
            $content = file_get_contents($path);
            $data = json_decode($content, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $errors[] = "Fichier JSON invalide : $file (" . json_last_error_msg() . ")";
            }
        }
    } else {
        $errors[] = "Fichier manquant : $file";
        echo "❌ $file<br>";
    }
}

// 5. Test de bootstrap
echo "<h2>5. Test de chargement</h2>";
try {
    ob_start();
    require_once __DIR__ . '/bootstrap.php';
    ob_end_clean();
    
    $success[] = "Bootstrap chargé avec succès";
    echo "✅ bootstrap.php fonctionne<br>";
} catch (Exception $e) {
    $errors[] = "Erreur dans bootstrap.php : " . $e->getMessage();
    echo "❌ Erreur bootstrap : " . $e->getMessage() . "<br>";
}

// 6. Créer les dossiers manquants si nécessaire
echo "<h2>6. Structure des dossiers</h2>";
$requiredDirs = ['data', 'translations', 'images', 'css', 'js'];
foreach ($requiredDirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (!is_dir($path)) {
        if (mkdir($path, 0755, true)) {
            $warnings[] = "Dossier créé : $dir";
            echo "📁 Créé : $dir<br>";
        } else {
            $errors[] = "Impossible de créer le dossier : $dir";
        }
    } else {
        echo "✅ $dir/<br>";
    }
}

// 7. Configuration des permissions
echo "<h2>7. Permissions</h2>";
$writableDirs = ['data'];
foreach ($writableDirs as $dir) {
    $path = __DIR__ . '/' . $dir;
    if (is_dir($path)) {
        if (is_writable($path)) {
            echo "✅ $dir/ (écriture OK)<br>";
        } else {
            $warnings[] = "Dossier $dir/ non accessible en écriture";
            echo "⚠️ $dir/ (écriture limitée)<br>";
        }
    }
}

// 8. Résumé
echo "<h2>8. Résumé</h2>";

if (!empty($errors)) {
    echo "<div style='background: #ffebee; padding: 10px; border-left: 4px solid #f44336; margin: 10px 0;'>";
    echo "<h3 style='color: #c62828;'>❌ Erreurs critiques</h3>";
    foreach ($errors as $error) {
        echo "• $error<br>";
    }
    echo "</div>";
}

if (!empty($warnings)) {
    echo "<div style='background: #fff3e0; padding: 10px; border-left: 4px solid #ff9800; margin: 10px 0;'>";
    echo "<h3 style='color: #ef6c00;'>⚠️ Avertissements</h3>";
    foreach ($warnings as $warning) {
        echo "• $warning<br>";
    }
    echo "</div>";
}

if (!empty($success)) {
    echo "<div style='background: #e8f5e8; padding: 10px; border-left: 4px solid #4caf50; margin: 10px 0;'>";
    echo "<h3 style='color: #2e7d32;'>✅ Succès</h3>";
    foreach ($success as $succ) {
        echo "• $succ<br>";
    }
    echo "</div>";
}

if (empty($errors)) {
    echo "<div style='background: #e8f5e8; padding: 15px; border: 2px solid #4caf50; margin: 20px 0; text-align: center;'>";
    echo "<h3 style='color: #2e7d32;'>🎉 Configuration terminée avec succès !</h3>";
    echo "<p>Votre site devrait maintenant fonctionner sur HostPapa.</p>";
    echo "<p><a href='index.php' style='color: #1976d2; text-decoration: underline;'>Tester la page d'accueil</a></p>";
    echo "</div>";
    
    // Créer un fichier de verrouillage pour éviter les re-installations
    file_put_contents(__DIR__ . '/.setup-complete', date('Y-m-d H:i:s'));
    
} else {
    echo "<div style='background: #ffebee; padding: 15px; border: 2px solid #f44336; margin: 20px 0; text-align: center;'>";
    echo "<h3 style='color: #c62828;'>❌ Configuration incomplète</h3>";
    echo "<p>Corrigez les erreurs ci-dessus avant de continuer.</p>";
    echo "</div>";
}

echo "<hr>";
echo "<p><em>Script d'installation HostPapa - Geek & Dragon</em></p>";
echo "<p><strong>Important :</strong> Supprimez ce fichier après installation pour des raisons de sécurité.</p>";
?>
<?php
/**
 * Script de test pour vérifier le bon fonctionnement du module notes
 */

header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html lang='fr'>
<head>
    <meta charset='UTF-8'>
    <title>Test Module Notes - Serveur</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; }
        .test { margin: 15px 0; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow: auto; }
    </style>
</head>
<body>
<div class='container'>
<h1>🧪 Test du Module Notes Universelles</h1>";

// Test 1 : Version PHP
echo "<div class='test success'>
<h3>✅ Version PHP</h3>
<p>Version PHP : " . phpversion() . "</p>
</div>";

// Test 2 : Permissions de dossier
$dossierNotes = __DIR__ . '/notes/';
echo "<div class='test'>";

if (!is_dir($dossierNotes)) {
    if (mkdir($dossierNotes, 0755, true)) {
        echo "<h3>✅ Dossier créé</h3>";
        echo "<p>Le dossier 'notes/' a été créé avec succès</p>";
        echo "<p class='success'>Chemin: " . $dossierNotes . "</p>";
    } else {
        echo "<h3 class='error'>❌ Erreur création dossier</h3>";
        echo "<p>Impossible de créer le dossier 'notes/'</p>";
    }
} else {
    echo "<h3>✅ Dossier exists</h3>";
    echo "<p>Le dossier 'notes/' existe déjà</p>";
    echo "<p class='success'>Chemin: " . $dossierNotes . "</p>";
}

// Vérifier permissions
if (is_writable($dossierNotes)) {
    echo "<p class='success'>✅ Dossier accessible en écriture</p>";
} else {
    echo "<p class='error'>❌ Dossier non accessible en écriture</p>";
}
echo "</div>";

// Test 3 : Test d'écriture
$fichierTest = $dossierNotes . 'test-' . date('Y-m-d-H-i-s') . '.md';
echo "<div class='test'>";

if (file_put_contents($fichierTest, "# Test d'écriture\n\nCeci est un test d'écriture dans le dossier notes.\n\nTimestamp: " . date('Y-m-d H:i:s') . "\n")) {
    echo "<h3 class='success'>✅ Test d'écriture réussi</h3>";
    echo "<p>Fichier créé: " . basename($fichierTest) . "</p>";
    
    // Test de lecture
    $contenu = file_get_contents($fichierTest);
    echo "<h4>Contenu du fichier :</h4>";
    echo "<pre>" . htmlspecialchars($contenu) . "</pre>";
    
    // Supprimer le fichier de test
    if (unlink($fichierTest)) {
        echo "<p class='success'>✅ Fichier de test supprimé</p>";
    }
} else {
    echo "<h3 class='error'>❌ Test d'écriture échoué</h3>";
    echo "<p>Impossible d'écrire dans le dossier notes/</p>";
}
echo "</div>";

// Test 4 : Test API
echo "<div class='test'>";
echo "<h3>🔌 Test API notes-handler.php</h3>";

if (file_exists(__DIR__ . '/notes-handler.php')) {
    echo "<p class='success'>✅ Fichier notes-handler.php trouvé</p>";
    
    // Test simple
    $_GET['action'] = 'stats';
    ob_start();
    try {
        include 'notes-handler.php';
        $output = ob_get_clean();
        $json = json_decode($output, true);
        
        if ($json && isset($json['success'])) {
            echo "<p class='success'>✅ API répond correctement</p>";
            echo "<h4>Réponse de l'API :</h4>";
            echo "<pre>" . htmlspecialchars($output) . "</pre>";
        } else {
            echo "<p class='warning'>⚠️ API répond mais format inattendu</p>";
            echo "<pre>" . htmlspecialchars($output) . "</pre>";
        }
    } catch (Exception $e) {
        ob_end_clean();
        echo "<p class='error'>❌ Erreur API: " . htmlspecialchars($e->getMessage()) . "</p>";
    }
} else {
    echo "<p class='error'>❌ Fichier notes-handler.php non trouvé</p>";
}
echo "</div>";

// Test 5 : Informations système
echo "<div class='test'>";
echo "<h3>ℹ️ Informations système</h3>";
echo "<p><strong>Serveur:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Inconnu') . "</p>";
echo "<p><strong>Document Root:</strong> " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Inconnu') . "</p>";
echo "<p><strong>Script Path:</strong> " . __FILE__ . "</p>";
echo "<p><strong>Répertoire de travail:</strong> " . getcwd() . "</p>";
echo "<p><strong>Utilisateur PHP:</strong> " . get_current_user() . "</p>";

// Extensions PHP importantes
$extensions = ['json', 'fileinfo', 'curl'];
foreach ($extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "<p class='success'>✅ Extension $ext chargée</p>";
    } else {
        echo "<p class='warning'>⚠️ Extension $ext non chargée</p>";
    }
}
echo "</div>";

// Instructions
echo "<div class='test warning'>
<h3>📋 Instructions de mise en ligne</h3>
<p>Pour que le module fonctionne sur HostPapa :</p>
<ol>
<li>Téléversez tout le dossier <code>module_notes/</code> sur votre serveur</li>
<li>Assurez-vous que le dossier <code>notes/</code> a les permissions d'écriture (755 ou 775)</li>
<li>Testez cette page sur votre serveur : <code>module_notes/test-serveur.php</code></li>
<li>Si tous les tests passent, le module fonctionnera parfaitement</li>
</ol>
</div>";

echo "<div style='text-align: center; margin-top: 30px; color: #7f8c8d;'>
<p>📝 Module Notes Universelles v1.0 - Test Server</p>
<p><a href='test-page.html'>Page de démonstration</a> | <a href='admin-notes.html'>Administration</a></p>
</div>";

echo "</div></body></html>";
?>
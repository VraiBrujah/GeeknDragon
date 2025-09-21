<?php
// Test ultra-simple
echo "Test simple : PHP fonctionne ✅<br>";
echo "Date: " . date('Y-m-d H:i:s') . "<br>";
echo "Dossier: " . __DIR__ . "<br>";

// Test existence des fichiers principaux
$files = ['bootstrap.php', 'config.php', 'i18n.php', 'index.php'];
foreach ($files as $file) {
    echo "$file: " . (file_exists($file) ? "✅" : "❌") . "<br>";
}
?>
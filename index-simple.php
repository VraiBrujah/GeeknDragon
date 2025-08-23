<?php
// Version simplifiée temporaire pour tester
ini_set('display_errors', '1');
error_reporting(E_ALL);

echo "<!DOCTYPE html>";
echo "<html lang='fr'>";
echo "<head>";
echo "<meta charset='UTF-8'>";
echo "<title>Test - Geek & Dragon</title>";
echo "</head>";
echo "<body>";
echo "<h1>🐉 Site en cours de réparation</h1>";
echo "<p>Test de base réussi - PHP fonctionne !</p>";
echo "<p>Date: " . date('Y-m-d H:i:s') . "</p>";

// Test minimal du fichier .env
if (file_exists(__DIR__ . '/.env')) {
    echo "<p>✅ Fichier .env trouvé</p>";
    
    $envContent = file_get_contents(__DIR__ . '/.env');
    if ($envContent !== false) {
        echo "<p>✅ Fichier .env lisible</p>";
        
        // Chargement basique des variables
        foreach (explode("\n", $envContent) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$name, $value] = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if ($name !== '') {
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
        echo "<p>✅ Variables d'environnement chargées</p>";
    }
} else {
    echo "<p>❌ Fichier .env manquant</p>";
}

echo "<hr>";
echo "<p><a href='debug.php'>🔍 Page de diagnostic complète</a></p>";
echo "<p><a href='index-original.php'>🔄 Essayer la version originale</a></p>";
echo "</body>";
echo "</html>";
?>
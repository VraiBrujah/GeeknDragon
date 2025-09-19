<?php
declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$translator = require __DIR__ . '/i18n.php';
$lang = $translator->getCurrentLanguage();

$title = 'Debug Header';
$active = 'boutique';
$extraHead = '';

echo "<!DOCTYPE html>
<html lang=\"{$lang}\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Debug Header</title>
    <script src=\"https://cdn.tailwindcss.com\"></script>
</head>
<body class=\"bg-gray-900 text-white p-4\">
    <h1 class=\"text-2xl mb-4\">Debug Header Variables</h1>
    
    <div class=\"space-y-4\">";

echo "<h2 class=\"text-xl\">Variables définies:</h2>";
echo "<ul class=\"list-disc pl-4\">";
echo "<li>Lang: " . htmlspecialchars($lang) . "</li>";
echo "<li>Active: " . htmlspecialchars($active) . "</li>";
echo "<li>Bootstrap chargé: " . (class_exists('GeeknDragon\\Core\\SessionHelper') ? 'Oui' : 'Non') . "</li>";
echo "</ul>";

echo "<h2 class=\"text-xl mt-6\">Test inclusion header.php:</h2>";
echo "<div class=\"border border-gray-600 p-4\">";

ob_start();
try {
    include __DIR__ . '/header.php';
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage();
}
$headerOutput = ob_get_clean();

echo "<p>Taille du header généré: " . strlen($headerOutput) . " caractères</p>";
echo "<p>Preview (100 premiers caractères): " . htmlspecialchars(substr($headerOutput, 0, 100)) . "...</p>";

echo "</div>";
echo "</div>
</body>
</html>";
?>
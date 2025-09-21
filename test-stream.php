<?php
/**
 * Script de test simple pour le streaming vidéo
 */

header('Content-Type: text/html; charset=utf-8');

echo "<h1>🎬 Test du Streaming Vidéo</h1>";

// Test 1: Vérifier l'existence des fichiers
echo "<h2>📁 Vérification des fichiers</h2>";
$videoFiles = [
    'media/videos/backgrounds/mage_compressed.mp4',
    'media/videos/backgrounds/fontaine4_compressed.mp4',
    'media/videos/backgrounds/cascade_HD_compressed.mp4'
];

foreach ($videoFiles as $file) {
    $fullPath = __DIR__ . DIRECTORY_SEPARATOR . $file;
    $exists = file_exists($fullPath);
    $size = $exists ? filesize($fullPath) : 0;
    
    echo "<p>" . ($exists ? "✅" : "❌") . " $file";
    if ($exists) {
        echo " (" . round($size / 1024 / 1024, 2) . " MB)";
    }
    echo "</p>";
}

// Test 2: Tester les URLs de streaming
echo "<h2>🔗 Test des URLs de streaming</h2>";
foreach ($videoFiles as $file) {
    $streamUrl = "/stream-video.php?file=" . urlencode("/$file");
    echo "<p><a href='$streamUrl' target='_blank'>$streamUrl</a></p>";
}

// Test 3: Test direct avec curl si disponible
echo "<h2>🌐 Test HTTP</h2>";
if (function_exists('curl_init')) {
    $testFile = '/media/videos/backgrounds/mage_compressed.mp4';
    $streamUrl = "http://" . $_SERVER['HTTP_HOST'] . "/stream-video.php?file=" . urlencode($testFile);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $streamUrl);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "<p>Test de $streamUrl</p>";
    echo "<p>Code HTTP: <strong>$httpCode</strong></p>";
    
    if ($httpCode === 200) {
        echo "<p style='color: green;'>✅ Streaming OK !</p>";
    } else {
        echo "<p style='color: red;'>❌ Erreur de streaming</p>";
        echo "<pre>$response</pre>";
    }
} else {
    echo "<p>⚠️ cURL non disponible pour les tests HTTP</p>";
}

// Test 4: Lecteur vidéo de test
echo "<h2>📺 Lecteur de Test</h2>";
echo "<video controls width='400' style='max-width: 100%;'>";
echo "<source src='/stream-video.php?file=" . urlencode('/media/videos/backgrounds/mage_compressed.mp4') . "' type='video/mp4'>";
echo "Votre navigateur ne supporte pas la lecture vidéo.";
echo "</video>";

// Test 5: Informations système
echo "<h2>ℹ️ Informations Système</h2>";
echo "<ul>";
echo "<li>PHP Version: " . phpversion() . "</li>";
echo "<li>Document Root: " . __DIR__ . "</li>";
echo "<li>Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Inconnu') . "</li>";
echo "<li>User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'Inconnu') . "</li>";
echo "</ul>";

?>

<style>
body { 
    font-family: Arial, sans-serif; 
    margin: 20px; 
    background: #f5f5f5; 
}
h1, h2 { 
    color: #333; 
}
pre { 
    background: #eee; 
    padding: 10px; 
    border-radius: 4px; 
    overflow-x: auto; 
}
video { 
    border: 2px solid #ddd; 
    border-radius: 8px; 
}
</style>
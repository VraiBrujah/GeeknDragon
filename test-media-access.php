<?php
// Test simple d'accès aux médias
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<!DOCTYPE html><html><head><title>Test Média</title></head><body>";
echo "<h1>Test d'accès aux médias</h1>";

// Test 1: Vérifier que les vidéos existent
echo "<h2>1. Test des vidéos principales</h2>";
$videos = [
    '/media/videos/backgrounds/mage_compressed.mp4',
    '/media/videos/backgrounds/cascade_HD_compressed.mp4',
    '/media/videos/backgrounds/fontaine11_compressed.mp4'
];

foreach ($videos as $video) {
    $path = $_SERVER['DOCUMENT_ROOT'] . $video;
    if (file_exists($path)) {
        $size = round(filesize($path) / 1024 / 1024, 2);
        echo "✅ $video ({$size} MB)<br>";
    } else {
        echo "❌ $video (manquant)<br>";
        echo "Chemin testé: $path<br>";
    }
}

// Test 2: Vérifier les images principales
echo "<h2>2. Test des images principales</h2>";
$images = [
    '/media/branding/logos/geekndragon_logo_blanc.webp',
    '/media/ui/flags/flag-fr-medieval-rim-on-top.svg',
    '/media/ui/payments/visa.svg',
    '/media/content/cartes_equipement.webp'
];

foreach ($images as $image) {
    $path = $_SERVER['DOCUMENT_ROOT'] . $image;
    if (file_exists($path)) {
        $size = round(filesize($path) / 1024, 1);
        echo "✅ $image ({$size} KB)<br>";
    } else {
        echo "❌ $image (manquant)<br>";
        echo "Chemin testé: $path<br>";
    }
}

// Test 3: Vérifier l'accès HTTP
echo "<h2>3. Test d'accès HTTP</h2>";
echo "<video controls width='300'><source src='/media/videos/backgrounds/mage_compressed.mp4' type='video/mp4'>Votre navigateur ne supporte pas la vidéo.</video><br>";
echo "<img src='/media/branding/logos/geekndragon_logo_blanc.webp' alt='Logo' style='max-width:200px'><br>";

echo "<h2>4. Informations serveur</h2>";
echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "<br>";
echo "Script Path: " . __FILE__ . "<br>";
echo "Current Dir: " . getcwd() . "<br>";

echo "</body></html>";
?>
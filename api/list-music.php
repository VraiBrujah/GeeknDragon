<?php
/**
 * API pour lister les fichiers musicaux MP3
 * Endpoint pour le lecteur audio Geek&Dragon
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

// Sécurité: limiter aux dossiers autorisés
$allowedDirectories = [
    'musique',
    'musique/index',
    'musique/boutique',
    'musique/produit'
];

$directory = $_GET['dir'] ?? 'musique';

// Vérification de sécurité
if (!in_array($directory, $allowedDirectories)) {
    http_response_code(403);
    echo json_encode(['error' => 'Répertoire non autorisé']);
    exit;
}

// Chemin complet sécurisé
$fullPath = __DIR__ . '/../' . $directory;
$fullPath = realpath($fullPath);

// Vérifier que le chemin existe et est dans notre arborescence
if (!$fullPath || !is_dir($fullPath) || !str_starts_with($fullPath, realpath(__DIR__ . '/../musique'))) {
    http_response_code(404);
    echo json_encode(['error' => 'Répertoire non trouvé', 'path' => $directory]);
    exit;
}

try {
    $musicFiles = [];
    $supportedExtensions = ['mp3', 'ogg', 'wav', 'm4a'];
    
    $files = scandir($fullPath);
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $filePath = $fullPath . '/' . $file;
        
        if (is_file($filePath)) {
            $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            
            if (in_array($extension, $supportedExtensions)) {
                // Chemin relatif pour le web
                $webPath = $directory . '/' . $file;
                $musicFiles[] = $webPath;
            }
        }
    }
    
    // Trier les fichiers
    sort($musicFiles);
    
    echo json_encode([
        'success' => true,
        'directory' => $directory,
        'count' => count($musicFiles),
        'files' => $musicFiles
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Erreur lors du scan du répertoire',
        'message' => $e->getMessage()
    ]);
}
?>
<?php
/**
 * Scanner automatique des fichiers audio MP3
 * Scan récursif du dossier media/musique avec gestion des erreurs
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

function scanMusicDirectory($baseDir) {
    $musicFiles = [];
    $heroIntroPath = null;
    
    // Fonction récursive pour scanner les dossiers
    function scanRecursive($dir, &$files, &$heroPath) {
        if (!is_dir($dir)) return;
        
        try {
            $iterator = new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS);
            $recursiveIterator = new RecursiveIteratorIterator($iterator);
            
            foreach ($recursiveIterator as $file) {
                if ($file->isFile() && strtolower($file->getExtension()) === 'mp3') {
                    // Obtenir le chemin relatif depuis la racine du projet
                    $fullPath = $file->getPathname();
                    $projectRoot = dirname(__DIR__);
                    
                    // Nettoyer les slashes et normaliser les chemins
                    $fullPath = str_replace('\\', '/', $fullPath);
                    $projectRoot = str_replace('\\', '/', $projectRoot);
                    
                    $relativePath = str_replace($projectRoot . '/', '', $fullPath);
                    
                    // Identifier le fichier hero-intro.mp3 principal
                    if ($file->getBasename() === 'hero-intro.mp3' && strpos($relativePath, 'media/musique/hero-intro.mp3') !== false) {
                        $heroPath = $relativePath;
                    }
                    
                    $files[] = [
                        'path' => $relativePath,
                        'name' => $file->getBasename('.mp3'),
                        'size' => $file->getSize(),
                        'modified' => $file->getMTime()
                    ];
                }
            }
        } catch (Exception $e) {
            error_log("Erreur scan musique: " . $e->getMessage());
        }
    }
    
    $musicDir = dirname(__DIR__) . '/media/musique';
    scanRecursive($musicDir, $musicFiles, $heroIntroPath);
    
    // Trier par nom pour cohérence
    usort($musicFiles, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    return [
        'files' => $musicFiles,
        'heroIntro' => $heroIntroPath,
        'count' => count($musicFiles),
        'scannedAt' => date('Y-m-d H:i:s')
    ];
}

// Vérifier si c'est une requête AJAX valide
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $result = scanMusicDirectory(__DIR__);
        echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Erreur lors du scan des fichiers audio',
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
}
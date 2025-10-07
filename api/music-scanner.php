<?php
/**
 * Scanner automatique des fichiers audio MP3
 * Scan récursif du dossier media/musique avec gestion des erreurs
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');
require_once __DIR__ . '/../includes/cors-helpers.php';
if (function_exists('gd_send_cors_headers')) {
    gd_send_cors_headers(['GET','OPTIONS'], ['Content-Type','X-Requested-With']);
}

function scanMusicDirectory($baseDir) {
    $musicFiles = [];
    $heroIntroPath = null;
    $initFolderFiles = [];
    
    // Fonction récursive pour scanner les dossiers
    function scanRecursive($dir, &$files, &$heroPath, &$initFiles) {
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
                    
                    // Identifier les fichiers dans le dossier init
                    $isInInitFolder = strpos($relativePath, 'media/musique/init/') !== false;
                    
                    // Identifier le fichier hero-intro.mp3 (maintenant dans init/)
                    if (strtolower($file->getBasename()) === 'hero-intro.mp3') {
                        $heroPath = $relativePath;
                    }
                    
                    $fileData = [
                        'path' => $relativePath,
                        'name' => $file->getBasename('.mp3'),
                        'size' => $file->getSize(),
                        'modified' => $file->getMTime(),
                        'isInit' => $isInInitFolder
                    ];
                    
                    $files[] = $fileData;
                    
                    // Ajouter séparément les fichiers du dossier init
                    if ($isInInitFolder) {
                        $initFiles[] = $fileData;
                    }
                }
            }
        } catch (Exception $e) {
            error_log("Erreur scan musique: " . $e->getMessage());
        }
    }
    
    $musicDir = dirname(__DIR__) . '/media/musique';
    scanRecursive($musicDir, $musicFiles, $heroIntroPath, $initFolderFiles);
    
    // Trier par nom pour cohérence
    usort($musicFiles, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    usort($initFolderFiles, function($a, $b) {
        return strcmp($a['name'], $b['name']);
    });
    
    return [
        'files' => $musicFiles,
        'initFiles' => $initFolderFiles,
        'heroIntro' => $heroIntroPath,
        'count' => count($musicFiles),
        'initCount' => count($initFolderFiles),
        'scannedAt' => date('Y-m-d H:i:s')
    ];
}

// Vérifier si c'est une requête AJAX valide
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

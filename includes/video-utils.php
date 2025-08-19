<?php
/**
 * Utilitaires pour la gestion des vidéos et génération d'images poster
 */

/**
 * Génère une image poster à partir d'une vidéo MP4
 * @param string $videoPath Chemin vers le fichier vidéo
 * @return string|null Chemin vers l'image poster générée ou null en cas d'erreur
 */
function generateVideoPoster($videoPath) {
    try {
        // Validation et normalisation du chemin vidéo
        $videoPath = ltrim($videoPath, '/');
        
        // Validation stricte : seulement lettres, chiffres, tirets, underscores, points et slashes
        if (!preg_match('/^[a-zA-Z0-9._\/-]+\.mp4$/i', $videoPath)) {
            error_log("Video path validation failed: $videoPath");
            return null;
        }
        
        $fullVideoPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $videoPath;
        
        // Vérifications de sécurité sur le chemin
        $realPath = realpath($fullVideoPath);
        $documentRoot = realpath($_SERVER['DOCUMENT_ROOT']);
        
        if (!$realPath || !str_starts_with($realPath, $documentRoot)) {
            error_log("Path traversal attempt detected: $videoPath");
            return null;
        }
        
        // Vérifier que le fichier vidéo existe et est lisible
        if (!file_exists($fullVideoPath) || !is_readable($fullVideoPath)) {
            error_log("Video file not found or not readable: $fullVideoPath");
            return null;
        }
        
        // Générer le nom du fichier poster de manière sécurisée
        $pathInfo = pathinfo($videoPath);
        $safeFilename = preg_replace('/[^a-zA-Z0-9._-]/', '_', $pathInfo['filename']);
        $posterPath = $pathInfo['dirname'] . '/posters/' . $safeFilename . '_poster.jpg';
        $fullPosterPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $posterPath;
        
        // Créer le dossier posters s'il n'existe pas
        $posterDir = dirname($fullPosterPath);
        if (!is_dir($posterDir)) {
            if (!mkdir($posterDir, 0755, true)) {
                error_log("Failed to create poster directory: $posterDir");
                return null;
            }
        }
        
        // Si l'image poster existe déjà, la retourner
        if (file_exists($fullPosterPath)) {
            return '/' . $posterPath;
        }
        
        // Vérifier que FFmpeg est disponible
        $ffmpegPath = trim(shell_exec('which ffmpeg 2>/dev/null') ?: '');
        if (empty($ffmpegPath) || !is_executable($ffmpegPath)) {
            error_log("FFmpeg not found or not executable");
            return null;
        }
        
        // Construire la commande FFmpeg de manière sécurisée
        $command = [
            $ffmpegPath,
            '-i', $fullVideoPath,
            '-ss', '00:00:01',
            '-vframes', '1',
            '-q:v', '2',
            '-y', // Écraser si existe
            $fullPosterPath
        ];
        
        // Exécuter la commande de manière sécurisée
        $descriptors = [
            0 => ['pipe', 'r'], // stdin
            1 => ['pipe', 'w'], // stdout
            2 => ['pipe', 'w']  // stderr
        ];
        
        $process = proc_open($command, $descriptors, $pipes);
        
        if (!is_resource($process)) {
            error_log("Failed to start FFmpeg process");
            return null;
        }
        
        // Fermer stdin
        fclose($pipes[0]);
        
        // Lire et ignorer stdout/stderr
        fclose($pipes[1]);
        fclose($pipes[2]);
        
        // Attendre la fin du processus
        $returnCode = proc_close($process);
        
        // Vérifier si l'image a été générée avec succès
        if ($returnCode === 0 && file_exists($fullPosterPath) && filesize($fullPosterPath) > 0) {
            return '/' . $posterPath;
        } else {
            error_log("FFmpeg failed with return code: $returnCode");
            // Nettoyer le fichier vide si créé
            if (file_exists($fullPosterPath) && filesize($fullPosterPath) === 0) {
                unlink($fullPosterPath);
            }
        }
        
    } catch (Exception $e) {
        error_log("Exception in generateVideoPoster: " . $e->getMessage());
    }
    
    return null;
}

/**
 * Récupère le chemin de l'image poster pour une vidéo donnée
 * @param string $videoPath Chemin vers le fichier vidéo
 * @return string|null Chemin vers l'image poster ou null si elle n'existe pas
 */
function getVideoPosterPath($videoPath) {
    $pathInfo = pathinfo($videoPath);
    $posterPath = $pathInfo['dirname'] . '/posters/' . $pathInfo['filename'] . '_poster.jpg';
    $fullPosterPath = $_SERVER['DOCUMENT_ROOT'] . '/' . ltrim($posterPath, '/');
    
    return file_exists($fullPosterPath) ? '/' . ltrim($posterPath, '/') : null;
}
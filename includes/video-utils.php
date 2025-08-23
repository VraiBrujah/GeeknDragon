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
    // Normaliser le chemin vidéo
    $videoPath = ltrim($videoPath, '/');
    $fullVideoPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $videoPath;
    
    // Vérifier que le fichier vidéo existe
    if (!file_exists($fullVideoPath)) {
        return null;
    }
    
    // Générer le nom du fichier poster
    $pathInfo = pathinfo($videoPath);
    $posterPath = $pathInfo['dirname'] . '/posters/' . $pathInfo['filename'] . '_poster.jpg';
    $fullPosterPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $posterPath;
    
    // Créer le dossier posters s'il n'existe pas
    $posterDir = dirname($fullPosterPath);
    if (!is_dir($posterDir)) {
        mkdir($posterDir, 0755, true);
    }
    
    // Si l'image poster existe déjà, la retourner
    if (file_exists($fullPosterPath)) {
        return '/' . $posterPath;
    }
    
    // Générer l'image poster avec FFmpeg (première frame de la vidéo)
    $command = sprintf(
        'ffmpeg -i %s -ss 00:00:01 -vframes 1 -q:v 2 %s 2>/dev/null',
        escapeshellarg($fullVideoPath),
        escapeshellarg($fullPosterPath)
    );
    
    // Exécuter la commande
    exec($command, $output, $returnCode);
    
    // Vérifier si l'image a été générée avec succès
    if ($returnCode === 0 && file_exists($fullPosterPath)) {
        return '/' . $posterPath;
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
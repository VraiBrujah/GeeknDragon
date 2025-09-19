<?php
declare(strict_types=1);

/**
 * Fonctions utilitaires liées aux assets statiques locaux.
 */
if (!function_exists('gdAssetVersion')) {
    /**
     * Calcule la version d'un asset en fonction de sa date de modification.
     *
     * @param string $relativePath Chemin relatif depuis la racine du projet.
     *
     * @return string Timestamp UNIX sous forme de chaîne ou "0" si le fichier est introuvable.
     */
    function gdAssetVersion(string $relativePath): string
    {
        $projectRoot = dirname(__DIR__);
        $absolutePath = $projectRoot . '/' . ltrim($relativePath, '/');

        return is_file($absolutePath) ? (string) filemtime($absolutePath) : '0';
    }
}

if (!function_exists('gdLocalAssetVersion')) {
    /**
     * Alias conservé pour compatibilité avec l'ancien nommage.
     *
     * @deprecated Utiliser gdAssetVersion() pour éviter la duplication de logique.
     */
    function gdLocalAssetVersion(string $relativePath): string
    {
        return gdAssetVersion($relativePath);
    }
}

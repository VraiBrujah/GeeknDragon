<?php
declare(strict_types=1);

/**
 * Fonctions utilitaires liées aux assets statiques locaux.
 */
if (!function_exists('gdLocalAssetVersion')) {
    /**
     * Retourne le timestamp de dernière modification d'un asset local.
     *
     * @param string $relativePath Chemin relatif depuis la racine du projet.
     *
     * @return string Timestamp UNIX sous forme de chaîne ou "0" si le fichier est introuvable.
     */
    function gdLocalAssetVersion(string $relativePath): string
    {
        $projectRoot = dirname(__DIR__);
        $absolutePath = $projectRoot . '/' . ltrim($relativePath, '/');

        return is_file($absolutePath) ? (string) filemtime($absolutePath) : '0';
    }
}

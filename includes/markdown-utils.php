<?php
/**
 * Utilitaires pour la conversion Markdown
 * Fonction réutilisable pour éviter la duplication de code
 */

/**
 * Convertit le Markdown en HTML sécurisé pour l'affichage des descriptions
 * 
 * @param string $markdown Le contenu Markdown à convertir
 * @return string Le HTML sécurisé généré
 */
function convertMarkdownToHtml(string $markdown): string 
{
    if (empty($markdown)) {
        return '';
    }
    
    require_once __DIR__ . '/../vendor/erusev/parsedown/Parsedown.php';
    $parsedown = new Parsedown();
    $parsedown->setSafeMode(true); // Mode sécurisé pour éviter les injections
    return $parsedown->text($markdown);
}
<?php
/**
 * Système d'internationalisation amélioré.
 *
 * La langue est résolue depuis le paramètre `lang` ou le cookie stocké.
 * La fonction `langUrl()` ajoute la langue courante aux liens internes quand
 * nécessaire pour que la navigation reste cohérente entre les pages.
 */

// Inclusion du helper d'internationalisation
require_once __DIR__ . '/includes/i18n-helper.php';

$availableLangs = ['fr', 'en'];

// Fonction pour détecter la langue préférée du navigateur
function getBrowserLanguage($availableLangs) {
    if (!isset($_SERVER['HTTP_ACCEPT_LANGUAGE'])) {
        return 'fr'; // Défaut si pas d'en-tête
    }
    
    $browserLangs = explode(',', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
    foreach ($browserLangs as $browserLang) {
        $lang = strtolower(trim(explode(';', $browserLang)[0]));
        // Vérifier langue exacte (ex: "fr") ou préfixe (ex: "fr-CA")
        foreach ($availableLangs as $availableLang) {
            if ($lang === $availableLang || strpos($lang, $availableLang . '-') === 0) {
                return $availableLang;
            }
        }
    }
    return 'fr'; // Défaut français si aucune langue supportée
}

// Résolution langue : URL > Cookie > Navigateur > Défaut
$lang = $_GET['lang'] ?? ($_COOKIE['lang'] ?? getBrowserLanguage($availableLangs));
if (!in_array($lang, $availableLangs, true)) {
    $lang = 'fr';
}
setcookie('lang', $lang, time() + 31536000, '/');

/**
 * Ajoute la langue courante comme paramètre de requête à une URL.
 */
function langUrl(string $url): string
{
    global $lang;
    if ($lang === 'fr') {
        return $url;
    }

    $parts = explode('#', $url, 2);
    if (str_contains($parts[0], '?')) {
        $parts[0] .= '&lang=' . $lang;
    } else {
        $parts[0] .= '?lang=' . $lang;
    }

    return isset($parts[1]) ? $parts[0] . '#' . $parts[1] : $parts[0];
}

/**
 * Charge les traductions depuis le fichier JSON correspondant à la langue
 */
$translations = json_decode(file_get_contents(__DIR__ . "/lang/$lang.json"), true) ?: [];

/**
 * Alias global pour la fonction t() du helper
 */
function __(string $key, string $fallback = ''): string 
{
    global $translations;
    return t($key, $translations, $fallback);
}

// Expose les variables globales pour compatibilité
$GLOBALS['lang'] = $lang;
$GLOBALS['translations'] = $translations;
?>


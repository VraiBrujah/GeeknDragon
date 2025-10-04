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

$availableLangs = ['fr', 'en', 'es', 'de'];

/**
 * Détecte la langue préférée du navigateur basée sur Accept-Language
 * 
 * @param array $availableLangs Liste des langues supportées par l'application
 * @return string Code langue préférée ou 'fr' par défaut
 */
function getBrowserLanguage(array $availableLangs): string {
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
 * Ajoute la langue courante comme paramètre de requête à une URL
 * 
 * Ne modifie pas l'URL si la langue est française (langue par défaut).
 * Préserve les fragments d'ancre (#) et gère les paramètres existants.
 * 
 * @param string $url URL à traiter
 * @return string URL avec paramètre de langue si nécessaire
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
 * Alias global pour la fonction t() du helper d'internationalisation
 * 
 * Utilise la convention __ (double underscore) pour simplifier l'usage
 * dans les templates et maintenir la compatibilité avec d'autres frameworks.
 * 
 * @param string $key Clé de traduction (notation pointée supportée)
 * @param string $fallback Texte de fallback si la traduction n'existe pas
 * @return string Texte traduit ou fallback
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


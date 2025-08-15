<?php
/**
 * Basic internationalisation bootstrap.
 *
 * Language is resolved from the `lang` query parameter or the stored cookie.
 * The helper `langUrl()` appends the current language to internal links when
 * needed so that navigation remains consistent across pages.
 */

$availableLangs = ['fr', 'en'];

// Validation stricte du paramètre de langue
$lang = null;
if (isset($_GET['lang']) && is_string($_GET['lang'])) {
    $langParam = trim($_GET['lang']);
    if (in_array($langParam, $availableLangs, true)) {
        $lang = $langParam;
    }
}

// Fallback sur le cookie si GET invalide
if ($lang === null && isset($_COOKIE['lang']) && is_string($_COOKIE['lang'])) {
    $cookieLang = trim($_COOKIE['lang']);
    if (in_array($cookieLang, $availableLangs, true)) {
        $lang = $cookieLang;
    }
}

// Fallback sur Accept-Language si aucune langue valide trouvée
if ($lang === null) {
    $accept = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
    $lang = str_starts_with(strtolower($accept), 'fr') ? 'fr' : 'en';
}

// Cookie sécurisé
$isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';
setcookie('lang', $lang, [
    'expires' => time() + 31536000,
    'path' => '/',
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'Lax'
]);

/**
 * Append the current language as query parameter to a URL.
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

$translationFile = __DIR__ . "/translations/$lang.json";
$translations = [];
if (file_exists($translationFile)) {
    $jsonContent = file_get_contents($translationFile);
    if ($jsonContent !== false) {
        $translations = json_decode($jsonContent, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error in $translationFile: " . json_last_error_msg());
            $translations = [];
        }
    }
}
?>


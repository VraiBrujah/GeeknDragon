<?php
/**
 * Basic internationalisation bootstrap.
 *
 * Language is resolved from the `lang` query parameter or the stored cookie.
 * The helper `langUrl()` appends the current language to internal links when
 * needed so that navigation remains consistent across pages.
 */

$availableLangs = ['fr', 'en'];
$lang = $_GET['lang'] ?? ($_COOKIE['lang'] ?? null);
if ($lang === null) {
    $accept = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
    $lang = str_starts_with(strtolower($accept), 'fr') ? 'fr' : 'en';
}
if (!in_array($lang, $availableLangs, true)) {
    $lang = 'fr';
}
setcookie('lang', $lang, time() + 31536000, '/');

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


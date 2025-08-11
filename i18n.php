<?php
$availableLangs = ['fr','en'];
$lang = $_GET['lang'] ?? ($_COOKIE['lang'] ?? 'fr');
if (!in_array($lang, $availableLangs, true)) {
    $lang = 'fr';
}
setcookie('lang', $lang, time() + 31536000, '/');
$translations = json_decode(file_get_contents(__DIR__ . "/translations/$lang.json"), true);
?>

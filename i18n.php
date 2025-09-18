<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\I18n\TranslationService;

$translator = TranslationService::getInstance();
$translator->setLanguage($translator->detectLanguage());

if (!function_exists('__')) {
    function __(string $key, string $default = ''): string
    {
        return TranslationService::getInstance()->get($key, $default);
    }
}

if (!function_exists('langUrl')) {
    function langUrl(string $path): string
    {
        return TranslationService::getInstance()->langUrl($path);
    }
}

return $translator;

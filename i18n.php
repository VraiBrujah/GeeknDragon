<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

use GeeknDragon\I18n\TranslationService;

$translator = TranslationService::getInstance();
$translator->setLanguage($translator->detectLanguage());

function __(string $key, string $default = ''): string
{
    return TranslationService::getInstance()->get($key, $default);
}

function langUrl(string $path): string
{
    return TranslationService::getInstance()->langUrl($path);
}

return $translator;

<?php
namespace GeeknDragon\Includes;

class MarkdownCache
{
    private static $memoryCache = [];
    private static $cacheDir;
    private static $parsedown = null;

    public static function init(): void
    {
        if (self::$cacheDir === null) {
            self::$cacheDir = dirname(__DIR__, 2) . '/cache/markdown/';
        }
        if (!is_dir(self::$cacheDir)) {
            mkdir(self::$cacheDir, 0755, true);
        }
        if (self::$parsedown === null) {
            if (!class_exists('Parsedown')) {
                require_once dirname(__DIR__, 2) . '/vendor/erusev/parsedown/Parsedown.php';
            }
            self::$parsedown = new \Parsedown();
            self::$parsedown->setSafeMode(true);
        }
    }

    public static function convertToHtml(string $markdown, ?string $cacheKey = null): string
    {
        if ($markdown === '') {
            return '';
        }
        self::init();
        if ($cacheKey === null) {
            $cacheKey = 'md_' . md5($markdown);
        }
        if (isset(self::$memoryCache[$cacheKey])) {
            return self::$memoryCache[$cacheKey];
        }
        $cacheFile = self::$cacheDir . $cacheKey . '.html';
        if (file_exists($cacheFile)) {
            $cachedHtml = file_get_contents($cacheFile);
            if ($cachedHtml !== false) {
                self::$memoryCache[$cacheKey] = $cachedHtml;
                return $cachedHtml;
            }
        }
        $html = self::$parsedown->text($markdown);
        self::$memoryCache[$cacheKey] = $html;
        self::saveToCacheAsync($cacheFile, $html);
        return $html;
    }

    private static function saveToCacheAsync(string $cacheFile, string $content): void
    {
        if (function_exists('fastcgi_finish_request')) {
            register_shutdown_function(function () use ($cacheFile, $content) {
                file_put_contents($cacheFile, $content, LOCK_EX);
            });
        } else {
            file_put_contents($cacheFile, $content, LOCK_EX);
        }
    }

    public static function convertToPlainText(string $markdown, ?string $cacheKey = null): string
    {
        if ($markdown === '') {
            return '';
        }
        if ($cacheKey === null) {
            $cacheKey = 'txt_' . md5($markdown);
        } else {
            $cacheKey = 'txt_' . $cacheKey;
        }
        if (isset(self::$memoryCache[$cacheKey])) {
            return self::$memoryCache[$cacheKey];
        }
        self::init();
        $cacheFile = self::$cacheDir . $cacheKey . '.txt';
        if (file_exists($cacheFile)) {
            $cachedText = file_get_contents($cacheFile);
            if ($cachedText !== false) {
                self::$memoryCache[$cacheKey] = $cachedText;
                return $cachedText;
            }
        }
        $text = self::processMarkdownToText($markdown);
        self::$memoryCache[$cacheKey] = $text;
        self::saveToCacheAsync($cacheFile, $text);
        return $text;
    }

    private static function processMarkdownToText(string $value): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $value);
        $text = preg_replace([
            '/^\s{0,3}#{1,6}\s*/mu',
            '/^\s{0,3}>\s?/mu',
            '/^\s{0,3}[-*+]\s+/mu',
            '/!\[(.*?)\]\((.*?)\)/u',
            '/\[(.*?)\]\((.*?)\)/u',
            '/(`{1,3})(.+?)\1/u',
            '/([*_~]{1,2})(.+?)\1/u',
            '/\s+/u'
        ], [
            '',
            '',
            '',
            '$1',
            '$1',
            '$2',
            '$2',
            ' '
        ], $text) ?? $text;
        $text = strip_tags($text);
        $text = trim($text);
        return $text !== '' ? $text : trim(strip_tags($value));
    }

    public static function clearCache(): void
    {
        self::$memoryCache = [];
        self::init();
        if (is_dir(self::$cacheDir)) {
            $files = glob(self::$cacheDir . '*');
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
    }

    public static function getCacheStats(): array
    {
        self::init();
        $memoryCount = count(self::$memoryCache);
        $diskCount = 0;
        if (is_dir(self::$cacheDir)) {
            $diskCount = count(glob(self::$cacheDir . '*.{html,txt}', GLOB_BRACE));
        }
        return [
            'memory_entries' => $memoryCount,
            'disk_entries' => $diskCount,
            'cache_dir' => self::$cacheDir
        ];
    }
}


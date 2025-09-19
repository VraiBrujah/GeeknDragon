<?php
require_once __DIR__ . '/vendor/autoload.php';

Dotenv\Dotenv::createUnsafeImmutable(__DIR__)->safeLoad();

if (!function_exists('gd_parse_markdown')) {
    /**
     * Convertit du Markdown en HTML sécurisé et en texte brut nettoyé.
     *
     * @return array{html: string, text: string} HTML assaini et équivalent texte.
     */
    function gd_parse_markdown(string $markdown): array
    {
        static $parser = null;

        $markdown = trim($markdown);
        if ($markdown === '') {
            return ['html' => '', 'text' => ''];
        }

        if ($parser === null) {
            $parser = new Parsedown();
            if (method_exists($parser, 'setSafeMode')) {
                $parser->setSafeMode(true);
            }
            if (method_exists($parser, 'setMarkupEscaped')) {
                $parser->setMarkupEscaped(true);
            }
        }

        $html = trim((string) $parser->text($markdown));
        if ($html !== '') {
            $html = preg_replace('/\s+$/u', '', $html) ?? $html;
            if (trim(strip_tags($html)) === '') {
                $html = '';
            }
        }

        $text = '';
        if ($html !== '') {
            $text = preg_replace('/<(?:br\s*\/?)>/i', "\n", $html) ?? $html;
            $text = preg_replace('/<\/(?:p|div|h[1-6]|li|blockquote|pre)>/i', "\n", $text) ?? $text;
            $text = strip_tags($text);
            $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $text = preg_replace('/\s+/u', ' ', $text) ?? $text;
            $text = trim($text);
        }

        if ($text === '') {
            $fallback = strip_tags($markdown);
            $fallback = html_entity_decode($fallback, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $fallback = preg_replace('/\s+/u', ' ', $fallback) ?? $fallback;
            $text = trim($fallback);
        }

        return [
            'html' => $html,
            'text' => $text,
        ];
    }
}


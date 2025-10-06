<?php
namespace GeeknDragon\Includes;

class ProductCardRenderer
{
    private static $cache = [];
    private static $cacheEnabled = true;

    public static function render(array $product, string $lang, array $translations): string
    {
        $cacheKey = ($product['id'] ?? '') . '_' . $lang;
        if (self::$cacheEnabled && isset(self::$cache[$cacheKey])) {
            return self::$cache[$cacheKey];
        }
        ob_start();
        $product = $product; $lang = $lang; $translations = $translations; // make variables explicit
        include dirname(__DIR__, 2) . '/partials/product-card.php';
        $html = ob_get_clean();
        if (self::$cacheEnabled) {
            self::$cache[$cacheKey] = $html;
        }
        return $html;
    }

    public static function renderMultiple(array $products, string $lang, array $translations): string
    {
        $html = '';
        foreach ($products as $product) {
            $html .= self::render($product, $lang, $translations);
        }
        return $html;
    }

    public static function clearCache(bool $logAction = false): int
    {
        $count = count(self::$cache);
        self::$cache = [];
        if ($logAction && $count > 0) {
            error_log(
                "Cache ProductCardRenderer vidé : {$count} entrée(s) supprimée(s) - " . date('Y-m-d H:i:s'),
                3,
                dirname(__DIR__, 2) . '/logs/cache_operations.log'
            );
        }
        return $count;
    }

    public static function setCacheEnabled(bool $enabled, bool $clearOnDisable = false): bool
    {
        $previousState = self::$cacheEnabled;
        self::$cacheEnabled = $enabled;
        if (!$enabled && $clearOnDisable) {
            self::clearCache(true);
        }
        return $previousState;
    }
}


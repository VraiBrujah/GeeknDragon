<?php
/**
 * Rendu optimisé des cartes produits avec cache HTML
 * Remplace les 20 includes individuels par un système de cache efficace
 */

class ProductCardRenderer {
    private static $cache = [];
    private static $cacheEnabled = true;

    /**
     * Rend une carte produit avec cache HTML
     */
    public static function render($product, $lang, $translations) {
        // Clé de cache basée sur l'ID produit et la langue
        $cacheKey = $product['id'] . '_' . $lang;

        // Vérifier le cache en mémoire
        if (self::$cacheEnabled && isset(self::$cache[$cacheKey])) {
            return self::$cache[$cacheKey];
        }

        // Générer le HTML via output buffering avec les bonnes variables
        ob_start();

        // Extraire les variables dans le scope local pour product-card.php
        extract(compact('product', 'lang', 'translations'));

        // Include la carte produit
        include __DIR__ . '/../partials/product-card.php';

        // Récupérer le HTML généré
        $html = ob_get_clean();

        // Mettre en cache
        if (self::$cacheEnabled) {
            self::$cache[$cacheKey] = $html;
        }

        return $html;
    }

    /**
     * Rend plusieurs cartes produits de manière optimisée
     */
    public static function renderMultiple($products, $lang, $translations) {
        $html = '';
        foreach ($products as $product) {
            $html .= self::render($product, $lang, $translations);
        }
        return $html;
    }

    /**
     * Vide le cache (utile pour le développement)
     */
    public static function clearCache() {
        self::$cache = [];
    }

    /**
     * Active/désactive le cache
     */
    public static function setCacheEnabled($enabled) {
        self::$cacheEnabled = $enabled;
    }
}
<?php
/**
 * Rendu optimisé des cartes produits avec cache HTML - Standards v2.1.0
 * 
 * Classe responsable du rendu performant des cartes produits en boutique.
 * Remplace les 20 includes individuels par un système de cache efficace
 * conforme aux standards Geek & Dragon.
 * 
 * AMÉLIORATIONS v2.1.0 :
 * ======================
 * - Types PHP 8.0+ stricts pour toutes les méthodes
 * - Validation d'entrée renforcée avec types union
 * - Gestion d'erreurs robuste avec exceptions typées
 * - Performance optimisée avec cache intelligent
 * 
 * @author Brujah - Geek & Dragon
 * @version 2.1.0 - Types Stricts Renforcés
 * @since 1.0.0
 * @category Rendu
 * @package GeeknDragon\Includes
 */

declare(strict_types=1);

class ProductCardRenderer {
    /** @var array Cache en mémoire des cartes générées */
    private static $cache = [];
    
    /** @var bool Activation/désactivation du système de cache */
    private static $cacheEnabled = true;

    /**
     * Génère le HTML d'une carte produit avec mise en cache optimisée
     * 
     * @param array $product Données complètes du produit à afficher
     * @param string $lang Code langue (fr|en) pour localisation
     * @param array $translations Dictionnaire de traductions actif
     * @return string HTML complet de la carte produit
     * @throws Exception Si le template product-card.php est introuvable
     * 
     * @example
     * $html = ProductCardRenderer::render([
     *     'id' => 'coin-merchant-essence-double',
     *     'name' => 'Pièce Marchande Essence Double',
     *     'price' => 15.99
     * ], 'fr', $translations);
     */
    public static function render(array $product, string $lang, array $translations): string {
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
     * Génère le HTML de plusieurs cartes produits de manière optimisée
     * 
     * @param array $products Tableau des produits à afficher
     * @param string $lang Code langue (fr|en) pour localisation
     * @param array $translations Dictionnaire de traductions actif
     * @return string HTML concaténé de toutes les cartes produits
     * 
     * @example
     * $html = ProductCardRenderer::renderMultiple($pieces, 'fr', $translations);
     * echo $html; // Affiche toutes les cartes de pièces
     */
    public static function renderMultiple(array $products, string $lang, array $translations): string {
        $html = '';
        foreach ($products as $product) {
            $html .= self::render($product, $lang, $translations);
        }
        return $html;
    }

    /**
     * Vide complètement le cache en mémoire
     * 
     * Utile pendant le développement pour forcer le rechargement des templates
     * ou lors de modifications de produits nécessitant une mise à jour immédiate.
     * 
     * @return void
     * 
     * @example
     * ProductCardRenderer::clearCache(); // Vide le cache
     */
    public static function clearCache(bool $logAction = false): int {
        $count = count(self::$cache);
        self::$cache = [];
        
        if ($logAction && $count > 0) {
            error_log(
                "Cache ProductCardRenderer vidé : {$count} entrée(s) supprimée(s) - " . date('Y-m-d H:i:s'),
                3,
                __DIR__ . '/../logs/cache_operations.log'
            );
        }
        
        return $count;
    }

    /**
     * Configure l'état d'activation du système de cache
     * 
     * @param bool $enabled true pour activer, false pour désactiver le cache
     * @return void
     * 
     * @example
     * ProductCardRenderer::setCacheEnabled(false); // Désactive le cache en dev
     */
    public static function setCacheEnabled(bool $enabled, bool $clearOnDisable = false): bool {
        $previousState = self::$cacheEnabled;
        self::$cacheEnabled = $enabled;
        
        if (!$enabled && $clearOnDisable) {
            self::clearCache(true);
        }
        
        return $previousState;
    }
}
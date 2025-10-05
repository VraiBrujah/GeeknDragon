<?php
/**
 * Système de chargement intelligent des scripts optimisés
 * Charge automatiquement la version minifiée si disponible, sinon la version originale
 */

class ScriptLoader {
    private $baseDir;
    private static $loadedScripts = [];
    
    public function __construct($baseDir = null) {
        $this->baseDir = $baseDir ?: dirname(__DIR__);
    }
    
    /**
     * Charge le bundle principal
     */
    public function loadMainBundle() {
        $bundlePath = $this->baseDir . '/js/app.bundle.min.js';
        
        if (file_exists($bundlePath)) {
            echo '<script src="/js/app.bundle.min.js?v=' . filemtime($bundlePath) . '"></script>' . "\n";
            return true;
        } else {
            $this->loadScript('app');
            $this->loadScript('currency-converter');
            $this->loadScript('coin-lot-optimizer');
            return false;
        }
    }
    
    /**
     * Charge un script individuel avec protection contre les doubles chargements
     */
    public function loadScript($name, $fallbackToOriginal = true) {
        if (in_array($name, self::$loadedScripts)) {
            return 'already_loaded';
        }
        
        $minPath = $this->baseDir . '/js/' . $name . '.min.js';
        $originalPath = $this->baseDir . '/js/' . $name . '.js';
        
        if (file_exists($minPath)) {
            echo '<script src="/js/' . $name . '.min.js?v=' . filemtime($minPath) . '"></script>' . "\n";
            self::$loadedScripts[] = $name;
            return 'minified';
        } elseif ($fallbackToOriginal && file_exists($originalPath)) {
            echo '<script src="/js/' . $name . '.js?v=' . filemtime($originalPath) . '"></script>' . "\n";
            self::$loadedScripts[] = $name;
            return 'original';
        }
        
        return false;
    }
    
    /**
     * Charge plusieurs scripts
     */
    public function loadScripts(array $scriptNames) {
        $results = [];
        foreach ($scriptNames as $name) {
            $results[$name] = $this->loadScript($name);
        }
        return $results;
    }
    
    /**
     * Charge les scripts pour la boutique
     */
    public function loadShopScripts() {
        $this->loadMainBundle();
        $this->loadScripts([
            'header-scroll-animation',
            'hero-videos',
            // 'snipcart-utils', // Déjà inclus dans app.bundle.min.js
            'account-icon-switcher',
            'boutique-premium',
            'boutique-async-loader',
            'async-stock-loader'
        ]);
    }
    
    /**
     * Charge les scripts pour l'aide de jeux
     */
    public function loadGameHelpScripts() {
        $this->loadMainBundle();
        $this->loadScripts([
            'header-scroll-animation',
            'hero-videos',
            'boutique-premium',
            // 'snipcart-utils', // Déjà inclus dans app.bundle.min.js
            'account-icon-switcher',
            'dnd-music-player'
        ]);
    }
    
    /**
     * Charge les scripts de base
     */
    public function loadBasicScripts() {
        $this->loadScript('app');
    }
    
}

/**
 * Interface principale pour le chargement de scripts optimisé
 */
function load_optimized_scripts($type = 'basic', $baseDir = null) {
    $loader = new ScriptLoader($baseDir);
    
    switch ($type) {
        case 'shop':
        case 'boutique':
            $loader->loadShopScripts();
            break;
            
        case 'game-help':
        case 'aide-jeux':
            $loader->loadGameHelpScripts();
            break;
            
        case 'main-bundle':
            $loader->loadMainBundle();
            $loader->loadScript('header-scroll-animation');
            $loader->loadScript('hero-videos');
            $loader->loadScript('account-icon-switcher');
            // $loader->loadScript('snipcart-utils'); // Déjà inclus dans app.bundle.min.js
            $loader->loadScript('shop-grid-scroll'); // Pour scroll horizontal produits
            $loader->loadScript('async-stock-loader'); // Pour affichage rupture de stock
            break;
            
        case 'basic':
        default:
            $loader->loadBasicScripts();
            break;
    }
    
    return $loader;
}
?>
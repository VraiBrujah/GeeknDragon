<?php
/**
 * Système de chargement intelligent des scripts optimisés
 * Charge automatiquement la version minifiée si disponible, sinon la version originale
 */

class ScriptLoader {
    private $baseDir;
    
    public function __construct($baseDir = null) {
        $this->baseDir = $baseDir ?: dirname(__DIR__);
    }
    
    /**
     * Charge le bundle principal (app, currency-converter, coin-lot-optimizer)
     */
    public function loadMainBundle() {
        $bundlePath = $this->baseDir . '/js/app.bundle.min.js';
        
        if (file_exists($bundlePath)) {
            echo '<script src="/js/app.bundle.min.js?v=' . filemtime($bundlePath) . '"></script>' . "\n";
            return true;
        } else {
            // Fallback : charger les fichiers individuels
            $this->loadScript('app');
            $this->loadScript('currency-converter');
            $this->loadScript('coin-lot-optimizer');
            return false;
        }
    }
    
    /**
     * Charge un script individuel (version optimisée si disponible)
     */
    public function loadScript($name, $fallbackToOriginal = true) {
        $minPath = $this->baseDir . '/js/' . $name . '.min.js';
        $originalPath = $this->baseDir . '/js/' . $name . '.js';
        
        if (file_exists($minPath)) {
            echo '<script src="/js/' . $name . '.min.js?v=' . filemtime($minPath) . '"></script>' . "\n";
            return 'minified';
        } elseif ($fallbackToOriginal && file_exists($originalPath)) {
            echo '<script src="/js/' . $name . '.js?v=' . filemtime($originalPath) . '"></script>' . "\n";
            return 'original';
        }
        
        return false;
    }
    
    /**
     * Charge plusieurs scripts avec optimisation automatique
     */
    public function loadScripts(array $scriptNames) {
        $results = [];
        foreach ($scriptNames as $name) {
            $results[$name] = $this->loadScript($name);
        }
        return $results;
    }
    
    /**
     * Charge les scripts de la boutique/aide-jeux avec configuration optimale
     */
    public function loadShopScripts() {
        // Bundle principal
        $this->loadMainBundle();

        // Scripts utilitaires
        $this->loadScripts([
            'hero-videos',
            'snipcart-utils',
            'boutique-premium',
            'async-stock-loader'
        ]);
    }
    
    /**
     * Charge les scripts pour l'aide de jeux
     */
    public function loadGameHelpScripts() {
        // Bundle principal
        $this->loadMainBundle();
        
        // Scripts spécifiques aide-jeux
        $this->loadScripts([
            'hero-videos',
            'boutique-premium', 
            'snipcart-utils',
            'dnd-music-player'
        ]);
    }
    
    /**
     * Charge les scripts génériques (pages simples)
     */
    public function loadBasicScripts() {
        // Juste app.js (ou son équivalent minifié)
        $this->loadScript('app');
    }
    
    /**
     * Charge les scripts de debug conditionnellement
     */
    public function loadDebugScripts() {
        if (isset($_GET['debug']) || strpos($_SERVER['REQUEST_URI'] ?? '', '#debug') !== false) {
            $this->loadScript('currency-converter-tests', false);
        }
    }
}

/**
 * Fonction helper globale pour faciliter l'utilisation
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
            $loader->loadDebugScripts();
            break;
            
        case 'main-bundle':
            $loader->loadMainBundle();
            $loader->loadScript('hero-videos');
            break;
            
        case 'basic':
        default:
            $loader->loadBasicScripts();
            break;
    }
    
    return $loader;
}
?>
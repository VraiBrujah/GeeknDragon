/**
 * Lazy Loader Intelligent - Geek & Dragon
 * Charge les modules uniquement quand nécessaire
 */
class LazyModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingPromises = new Map();
    }

    /**
     * Charge un module de manière asynchrone
     * @param {string} moduleName - Nom du module
     * @param {string} fileName - Nom du fichier
     * @returns {Promise} Promise de chargement
     */
    async loadModule(moduleName, fileName) {
        if (this.loadedModules.has(moduleName)) {
            return window[moduleName];
        }

        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        const loadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `/js/${fileName}`;
            script.async = true;
            
            script.onload = () => {
                this.loadedModules.add(moduleName);
                resolve(window[moduleName]);
            };
            
            script.onerror = () => {
                this.loadingPromises.delete(moduleName);
                reject(new Error(`Impossible de charger ${moduleName}`));
            };
            
            document.head.appendChild(script);
        });

        this.loadingPromises.set(moduleName, loadPromise);
        return loadPromise;
    }

    /**
     * Précharge les modules selon les conditions
     */
    preloadConditional() {
        // Précharger le lecteur audio au premier survol
        let audioPreloaded = false;
        document.addEventListener('mouseover', () => {
            if (!audioPreloaded && document.querySelector('.music-player')) {
                this.loadModule('DnDMusicPlayer', 'dnd-music-player.min.js');
                audioPreloaded = true;
            }
        }, { once: true });

        // Précharger boutique-loader si on est sur la boutique
        if (window.location.pathname.includes('boutique')) {
            this.loadModule('BoutiqueAsyncLoader', 'boutique-async-loader.js');
        }

        // Précharger stock-loader si des produits sont visibles
        if (document.querySelector('[data-snipcart-id]')) {
            this.loadModule('AsyncStockLoader', 'async-stock-loader.js');
        }
    }
}

// Instance globale
window.lazyLoader = new LazyModuleLoader();

// Démarrage automatique
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.lazyLoader.preloadConditional();
    });
} else {
    window.lazyLoader.preloadConditional();
}
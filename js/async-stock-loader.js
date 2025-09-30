/**
 * Chargeur de Stock Asynchrone - Performance Optimisée
 *
 * Charge le stock des produits en arrière-plan sans bloquer l'affichage
 * Utilise le batching, le debouncing, et la mise en cache pour une performance optimale
 */

class AsyncStockLoader {
    constructor(options = {}) {
        this.apiEndpoint = options.apiEndpoint || '/api/stock.php';
        this.batchSize = options.batchSize || 20;
        this.debounceDelay = options.debounceDelay || 100;
        this.retryAttempts = options.retryAttempts || 2;

        this.pendingProducts = new Set();
        this.loadedCache = new Map();
        this.loadingStates = new Map();

        this.debounceTimer = null;
        this.requestInProgress = false;

        // Métriques de performance
        this.metrics = {
            totalRequests: 0,
            totalProducts: 0,
            cacheHits: 0,
            averageResponseTime: 0,
        };
    }

    /**
     * Ajoute des produits à charger
     * @param {string|string[]} productIds
     */
    loadStock(productIds) {
        const ids = Array.isArray(productIds) ? productIds : [productIds];

        ids.forEach((id) => {
            // Éviter les doublons et les produits déjà chargés
            if (!this.loadedCache.has(id) && !this.pendingProducts.has(id)) {
                this.pendingProducts.add(id);
            }
        });

        this.debouncedProcess();
    }

    /**
     * Traitement groupé avec debouncing pour éviter les requêtes multiples
     */
    debouncedProcess() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.processPendingBatch();
        }, this.debounceDelay);
    }

    /**
     * Traite un lot de produits en attente
     */
    async processPendingBatch() {
        if (this.requestInProgress || this.pendingProducts.size === 0) {
            return;
        }

        // Convertir en array et limiter la taille du batch
        const productIds = Array.from(this.pendingProducts).slice(0, this.batchSize);

        // Nettoyer les produits en cours de traitement
        productIds.forEach((id) => this.pendingProducts.delete(id));

        try {
            await this.fetchStockBatch(productIds);
        } catch (error) {
            console.error('Erreur chargement stock:', error);
            // Remettre dans la queue pour retry
            productIds.forEach((id) => this.pendingProducts.add(id));
        }

        // Traiter le prochain lot s'il y en a
        if (this.pendingProducts.size > 0) {
            setTimeout(() => this.processPendingBatch(), 50);
        }
    }

    /**
     * Effectue la requête API pour un lot de produits
     */
    async fetchStockBatch(productIds) {
        if (productIds.length === 0) return;

        this.requestInProgress = true;
        const startTime = performance.now();

        // Mettre à jour l'état de chargement
        productIds.forEach((id) => {
            this.loadingStates.set(id, 'loading');
            this.updateProductUI(id, 'loading');
        });

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ products: productIds }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const stockData = await response.json();

            // Mettre à jour le cache et l'interface
            Object.entries(stockData).forEach(([productId, stock]) => {
                this.loadedCache.set(productId, stock);
                this.loadingStates.set(productId, 'loaded');
                this.updateProductUI(productId, 'loaded', stock);
            });

            // Métriques de performance
            const responseTime = performance.now() - startTime;
            this.updateMetrics(productIds.length, responseTime);

            // Production: log stock supprimé
        } catch (error) {
            console.error('Erreur API stock:', error);

            // Marquer comme erreur et utiliser fallback
            productIds.forEach((id) => {
                this.loadingStates.set(id, 'error');
                this.updateProductUI(id, 'error');
            });

            throw error;
        } finally {
            this.requestInProgress = false;
        }
    }

    /**
     * Met à jour l'interface utilisateur d'un produit
     */
    updateProductUI(productId, status, stock = null) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (!productCard) return;

        const loadingIndicator = productCard.querySelector('.stock-loading-indicator');
        const unavailableOverlay = productCard.querySelector('.stock-unavailable-overlay');
        const addButton = productCard.querySelector('[data-i18n="product.add"]')?.closest('button');

        // Mettre à jour l'attribut de statut
        productCard.setAttribute('data-stock-status', status);

        switch (status) {
        case 'loading':
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
            break;

        case 'loaded':
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            // Vérifier disponibilité
            const isInStock = stock === null || stock > 0;

            if (!isInStock) {
                // Rupture de stock
                if (unavailableOverlay) {
                    unavailableOverlay.style.display = 'flex';
                }
                if (addButton) {
                    addButton.disabled = true;
                    addButton.classList.add('opacity-50', 'cursor-not-allowed');
                }
                productCard.classList.add('oos'); // Out of stock class
            } else {
                // En stock
                if (unavailableOverlay) {
                    unavailableOverlay.style.display = 'none';
                }
                if (addButton) {
                    addButton.disabled = false;
                    addButton.classList.remove('opacity-50', 'cursor-not-allowed');
                }
                productCard.classList.remove('oos');
            }
            break;

        case 'error':
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            // En cas d'erreur, on considère comme disponible (fallback optimiste)
            // Production: warning fallback supprimé
            break;
        }
    }

    /**
     * Met à jour les métriques de performance
     */
    updateMetrics(productCount, responseTime) {
        this.metrics.totalRequests++;
        this.metrics.totalProducts += productCount;

        // Moyenne mobile du temps de réponse
        this.metrics.averageResponseTime = (
            (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)) + responseTime
        ) / this.metrics.totalRequests;
    }

    /**
     * Obtient les métriques de performance
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.loadedCache.size > 0 ? (this.metrics.cacheHits / this.loadedCache.size) : 0,
        };
    }

    /**
     * Initialise le chargement automatique pour tous les produits visibles
     */
    initAutoLoad() {
        const productCards = document.querySelectorAll('[data-product-id]');
        const productIds = Array.from(productCards).map((card) => card.getAttribute('data-product-id'));

        if (productIds.length > 0) {
            // Production: log init supprimé
            this.loadStock(productIds);
        }
    }

    /**
     * Observer d'intersection pour lazy loading
     */
    initLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback pour navigateurs anciens
            this.initAutoLoad();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const visibleProducts = entries
                .filter((entry) => entry.isIntersecting)
                .map((entry) => entry.target.getAttribute('data-product-id'))
                .filter((id) => id);

            if (visibleProducts.length > 0) {
                this.loadStock(visibleProducts);
            }
        }, {
            rootMargin: '100px', // Charger 100px avant que l'élément soit visible
            threshold: 0.1,
        });

        // Observer tous les produits
        document.querySelectorAll('[data-product-id]').forEach((card) => {
            observer.observe(card);
        });
    }
}

// Instance globale
window.asyncStockLoader = new AsyncStockLoader({
    batchSize: 20,
    debounceDelay: 100,
    retryAttempts: 2,
});

// Auto-initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.asyncStockLoader.initAutoLoad();
    });
} else {
    window.asyncStockLoader.initAutoLoad();
}

// Debug dans la console
// Production: log global supprimé

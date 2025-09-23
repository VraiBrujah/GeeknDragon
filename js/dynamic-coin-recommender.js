/**
 * Recommandeur de pièces 100% dynamique - VERSION SIMPLIFIÉE
 * Analyse automatiquement products.json et trouve la solution la moins chère
 * Cache intelligent non-bloquant pour optimiser les performances
 */
class DynamicCoinRecommender {
    constructor() {
        this.products = {};
        this.cache = new Map();
        this.isLoading = false;
        this.isReady = false;
        this.loadPromise = null;

        // Charger les données de façon non-bloquante
        this.loadProducts();
    }

    /**
     * Chargement avec cache et gestion des promesses
     */
    async loadProducts() {
        // Éviter les chargements multiples
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.fetchProductsWithCache();
        return this.loadPromise;
    }

    /**
     * Récupération des données avec mise en cache
     */
    async fetchProductsWithCache() {
        try {
            // Vérifier le cache localStorage en premier
            const cacheKey = 'coin_products_cache';
            const cacheTimeKey = 'coin_products_cache_time';
            const cacheDuration = 5 * 60 * 1000; // 5 minutes

            const cachedTime = localStorage.getItem(cacheTimeKey);
            const cachedData = localStorage.getItem(cacheKey);

            // Utiliser le cache si valide
            if (cachedTime && cachedData && (Date.now() - parseInt(cachedTime)) < cacheDuration) {
                this.products = JSON.parse(cachedData);
                this.isReady = true;
                console.log('Produits de pièces chargés depuis le cache:', Object.keys(this.products).length);
                return;
            }

            // Sinon, charger depuis le serveur
            const response = await fetch('/data/products.json');
            const allProducts = await response.json();

            // Extraction automatique des produits de pièces
            this.products = this.extractCoinProducts(allProducts);
            this.isReady = true;

            // Mise en cache
            localStorage.setItem(cacheKey, JSON.stringify(this.products));
            localStorage.setItem(cacheTimeKey, Date.now().toString());

            console.log('Produits de pièces chargés dynamiquement et mis en cache:', Object.keys(this.products).length);
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            // Fallback vers les données statiques
            this.loadFromStaticData();
        }
    }

    /**
     * Extraction intelligente des produits de pièces
     */
    extractCoinProducts(allProducts) {
        const coinProducts = {};

        Object.keys(allProducts).forEach(id => {
            if (id.startsWith('coin-')) {
                const product = allProducts[id];

                coinProducts[id] = {
                    name: product.name,
                    name_en: product.name_en || product.name,
                    price: parseFloat(product.price),
                    customizable: product.customizable === true || product.customizable === 'true',
                    coinLots: product.coin_lots || {},
                    category: product.category
                };
            }
        });

        return coinProducts;
    }

    /**
     * Chargement depuis les données statiques (backup)
     */
    loadFromStaticData() {
        // Utiliser les données du window.products si disponible
        if (window.products) {
            this.products = this.extractCoinProducts(window.products);
            this.isReady = true;
            console.log('Produits de pièces chargés depuis window.products:', Object.keys(this.products).length);
        } else {
            console.warn('Aucune donnée de produits disponible');
            this.products = {};
            this.isReady = false;
        }
    }

    /**
     * ALGORITHME SIMPLIFIÉ - Trouve la combinaison la moins chère
     */
    findOptimalLots(needs) {
        const cacheKey = JSON.stringify(needs);

        // Vérification cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const bestCombination = this.findCheapestSolution(needs);

        // Mise en cache (limitation à 1000 entrées)
        if (this.cache.size > 1000) {
            this.cache.clear();
        }
        this.cache.set(cacheKey, bestCombination);

        return bestCombination;
    }

    /**
     * Trouve la solution la moins chère en testant toutes les combinaisons possibles
     */
    findCheapestSolution(needs) {
        if (!this.products) {
            console.warn('Produits non chargés');
            return [];
        }

        console.log('🎯 Recherche de la solution optimale pour:', needs);

        // Filtrer les besoins non-zéro
        const filteredNeeds = {};
        Object.keys(needs).forEach(metal => {
            if (needs[metal] > 0) {
                filteredNeeds[metal] = needs[metal];
            }
        });

        if (Object.keys(filteredNeeds).length === 0) {
            return [];
        }

        // Obtenir tous les lots de pièces disponibles
        const availableLots = this.getAllAvailableLots();
        console.log(`💰 ${availableLots.length} lots disponibles pour optimisation`);

        // Trouver la meilleure solution
        const bestSolution = this.bruteForceOptimization(filteredNeeds, availableLots);

        console.log('✅ Solution optimale trouvée:', bestSolution);
        return bestSolution;
    }

    /**
     * Obtient tous les lots de pièces disponibles avec leurs configurations
     */
    getAllAvailableLots() {
        const lots = [];

        Object.keys(this.products).forEach(productId => {
            const product = this.products[productId];

            // Vérifier si c'est un produit de pièces
            if (product.category === 'pieces' || product.coinLots) {
                if (product.customizable) {
                    // Produit personnalisable : créer un lot pour chaque métal
                    ['copper', 'silver', 'electrum', 'gold', 'platinum'].forEach(metal => {
                        if (product.coinLots[metal]) {
                            lots.push({
                                productId: productId,
                                name: product.name,
                                price: product.price,
                                metal: metal,
                                quantity: product.coinLots[metal],
                                customizable: true,
                                displayName: `${product.name} (${metal})`
                            });
                        }
                    });
                } else {
                    // Produit fixe : un lot avec toutes les pièces
                    lots.push({
                        productId: productId,
                        name: product.name,
                        price: product.price,
                        coinLots: product.coinLots,
                        customizable: false,
                        displayName: product.name
                    });
                }
            }
        });

        return lots;
    }

    /**
     * Algorithme de force brute pour trouver la solution optimale
     */
    bruteForceOptimization(needs, lots) {
        let bestSolution = null;
        let bestCost = Infinity;

        console.log('🔍 Test de toutes les solutions possibles');

        // Tester les solutions simples (1 produit)
        for (const lot of lots) {
            for (let qty = 1; qty <= 10; qty++) {
                const solution = this.testSingleLotSolution(lot, qty, needs);
                if (solution && solution.cost < bestCost) {
                    bestCost = solution.cost;
                    bestSolution = solution.combination;
                    console.log(`🎯 Nouvelle meilleure solution: ${solution.description} = $${solution.cost}`);
                }
            }
        }

        // Tester les combinaisons de 2 produits si nécessaire
        if (!bestSolution || bestCost > 50) {
            for (let i = 0; i < lots.length; i++) {
                for (let j = i + 1; j < lots.length; j++) {
                    for (let qty1 = 1; qty1 <= 5; qty1++) {
                        for (let qty2 = 1; qty2 <= 5; qty2++) {
                            const solution = this.testTwoLotSolution(lots[i], qty1, lots[j], qty2, needs);
                            if (solution && solution.cost < bestCost) {
                                bestCost = solution.cost;
                                bestSolution = solution.combination;
                                console.log(`🎯 Nouvelle meilleure solution (2 lots): ${solution.description} = $${solution.cost}`);
                            }
                        }
                    }
                }
            }
        }

        console.log(`✅ Solution finale: $${bestCost}`, bestSolution);
        return bestSolution || [];
    }

    /**
     * Teste une solution avec un seul lot
     */
    testSingleLotSolution(lot, quantity, needs) {
        if (lot.customizable) {
            // Produit personnalisable : vérifier si ce métal est nécessaire
            if (needs[lot.metal] && needs[lot.metal] <= lot.quantity * quantity) {
                return {
                    combination: [{
                        productId: lot.productId,
                        quantity: quantity,
                        price: lot.price,
                        displayName: lot.displayName,
                        customMultiplier: lot.metal
                    }],
                    cost: lot.price * quantity,
                    description: `${quantity}× ${lot.displayName}`
                };
            }
        } else {
            // Produit fixe : vérifier si satisfait tous les besoins
            if (this.satisfiesAllNeeds(lot.coinLots, quantity, needs)) {
                return {
                    combination: [{
                        productId: lot.productId,
                        quantity: quantity,
                        price: lot.price,
                        displayName: lot.displayName
                    }],
                    cost: lot.price * quantity,
                    description: `${quantity}× ${lot.displayName}`
                };
            }
        }

        return null;
    }

    /**
     * Teste une solution avec deux lots
     */
    testTwoLotSolution(lot1, qty1, lot2, qty2, needs) {
        const provided = this.calculateProvidedMetals([
            { lot: lot1, quantity: qty1 },
            { lot: lot2, quantity: qty2 }
        ]);

        // Vérifier si cette combinaison satisfait tous les besoins
        const satisfies = Object.keys(needs).every(metal => provided[metal] >= needs[metal]);

        if (satisfies) {
            return {
                combination: [
                    {
                        productId: lot1.productId,
                        quantity: qty1,
                        price: lot1.price,
                        displayName: lot1.displayName,
                        customMultiplier: lot1.customizable ? lot1.metal : undefined
                    },
                    {
                        productId: lot2.productId,
                        quantity: qty2,
                        price: lot2.price,
                        displayName: lot2.displayName,
                        customMultiplier: lot2.customizable ? lot2.metal : undefined
                    }
                ],
                cost: lot1.price * qty1 + lot2.price * qty2,
                description: `${qty1}× ${lot1.displayName} + ${qty2}× ${lot2.displayName}`
            };
        }

        return null;
    }

    /**
     * Calcule les métaux fournis par une combinaison de lots
     */
    calculateProvidedMetals(lotCombination) {
        const provided = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 };

        lotCombination.forEach(({ lot, quantity }) => {
            if (lot.customizable) {
                // Produit personnalisable : ajouter seulement le métal spécifique
                provided[lot.metal] += lot.quantity * quantity;
            } else {
                // Produit fixe : ajouter tous les métaux
                Object.keys(lot.coinLots).forEach(metal => {
                    provided[metal] += lot.coinLots[metal] * quantity;
                });
            }
        });

        return provided;
    }

    /**
     * Vérifie si un lot fixe satisfait tous les besoins
     */
    satisfiesAllNeeds(coinLots, quantity, needs) {
        return Object.keys(needs).every(metal => {
            const provided = (coinLots[metal] || 0) * quantity;
            return provided >= needs[metal];
        });
    }

    /**
     * Attendre que les données soient prêtes
     */
    async waitForReady() {
        if (this.isReady) return;

        // Attendre la fin du chargement
        if (this.loadPromise) {
            await this.loadPromise;
        }

        // Si toujours pas prêt, attendre un peu
        let attempts = 0;
        while (!this.isReady && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    /**
     * Interface publique pour les recommandations avec attente non-bloquante
     */
    async recommend(copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0) {
        // Attendre que les données soient prêtes
        await this.waitForReady();

        if (!this.isReady || !this.products) {
            console.warn('Recommandeur pas encore prêt');
            return [];
        }

        const needs = { copper, silver, electrum, gold, platinum };

        // Filtrage des besoins zéro
        Object.keys(needs).forEach(key => {
            if (needs[key] <= 0) delete needs[key];
        });

        if (Object.keys(needs).length === 0) {
            return [];
        }

        return this.findOptimalLots(needs);
    }

    /**
     * Version synchrone pour la compatibilité
     */
    recommendSync(copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0) {
        if (!this.isReady || !this.products) {
            return [];
        }

        const needs = { copper, silver, electrum, gold, platinum };

        // Filtrage des besoins zéro
        Object.keys(needs).forEach(key => {
            if (needs[key] <= 0) delete needs[key];
        });

        if (Object.keys(needs).length === 0) {
            return [];
        }

        return this.findOptimalLots(needs);
    }
}

// Initialisation différée pour attendre le chargement des données
document.addEventListener('DOMContentLoaded', () => {
    // Attendre que window.products soit disponible
    const initRecommender = () => {
        if (window.products) {
            window.dynamicRecommender = new DynamicCoinRecommender();

            // Interface de compatibilité avec l'ancien système (synchrone)
            window.convertCoinsToLots = function(copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0) {
                return window.dynamicRecommender.recommendSync(copper, silver, electrum, gold, platinum);
            };

            console.log('DynamicCoinRecommender initialisé avec', Object.keys(window.dynamicRecommender.products || {}).length, 'produits de pièces');
        } else {
            // Réessayer dans 100ms
            setTimeout(initRecommender, 100);
        }
    };

    initRecommender();
});
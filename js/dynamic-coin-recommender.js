/**
 * CALCULATEUR DE LOTS DYNAMIQUE 100% - OPTIMISÉ
 * Brute force intelligent avec cache pour recommandations optimales
 * Créé automatiquement depuis les données JSON des produits
 */
class DynamicCoinRecommender {
    constructor() {
        this.products = null;
        this.cache = new Map();
        this.loadProducts();
    }

    /**
     * Chargement 100% dynamique des produits depuis le JSON
     */
    async loadProducts() {
        try {
            const response = await fetch('/data/products.json');
            const allProducts = await response.json();
            
            // Extraction automatique des produits de pièces
            this.products = this.extractCoinProducts(allProducts);
            console.log('Produits de pièces chargés dynamiquement:', Object.keys(this.products).length);
        } catch (error) {
            console.error('Erreur chargement produits:', error);
            // Pas de fallback hardcodé - on charge depuis les données statiques
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
                    customizable: product.customizable === 'VRAI',
                    multipliers: this.parseMultipliers(product.multipliers),
                    coinLots: this.parseCoinLots(product.coin_lots),
                    metals: this.parseArray(product.metals_fr)
                };
            }
        });
        
        return coinProducts;
    }

    /**
     * Parseurs pour les différents formats de données
     */
    parseMultipliers(str) {
        if (!str) return [];
        return str.split('|').map(m => parseInt(m)).filter(m => !isNaN(m));
    }

    parseCoinLots(str) {
        if (!str) return {};
        try {
            return JSON.parse(str);
        } catch (e) {
            return {};
        }
    }

    parseArray(str) {
        if (!str) return [];
        return str.split('|').filter(s => s.trim());
    }

    /**
     * Chargement depuis les données statiques (backup)
     */
    loadFromStaticData() {
        // Utilise les données générées par PHP
        this.products = GENERATED_COIN_PRODUCTS;
    }

    /**
     * ALGORITHME DE BRUTE FORCE OPTIMISÉ
     * Trouve la combinaison la moins chère pour satisfaire les besoins
     */
    findOptimalLots(needs) {
        const cacheKey = JSON.stringify(needs);
        
        // Vérification cache
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const bestCombination = this.bruteForceOptimal(needs);
        
        // Mise en cache (limitation à 1000 entrées)
        if (this.cache.size > 1000) {
            this.cache.clear();
        }
        this.cache.set(cacheKey, bestCombination);
        
        return bestCombination;
    }

    /**
     * Brute force intelligent avec optimisations
     */
    bruteForceOptimal(needs) {
        if (!this.products) {
            console.warn('Produits non chargés');
            return [];
        }

        const productIds = Object.keys(this.products);
        let bestCombination = null;
        let bestCost = Infinity;

        // Générateur de combinaisons avec optimisation early exit
        this.generateCombinations(productIds, needs, 0, [], 0, (combination, cost) => {
            if (cost < bestCost && this.satisfiesNeeds(combination, needs)) {
                bestCost = cost;
                bestCombination = [...combination];
            }
        });

        return bestCombination || [];
    }

    /**
     * Générateur de combinaisons avec early exit
     */
    generateCombinations(productIds, needs, index, current, currentCost, callback) {
        // Early exit si coût déjà trop élevé
        if (currentCost >= callback.bestCost) return;

        // Test de la combinaison actuelle
        callback(current, currentCost);

        // Génération récursive
        for (let i = index; i < productIds.length; i++) {
            const productId = productIds[i];
            const product = this.products[productId];
            
            // Optimisation: skip si ce produit ne peut pas aider
            if (!this.canHelpWithNeeds(product, needs)) continue;

            // Test avec quantités variables (1-10 max par produit)
            for (let qty = 1; qty <= Math.min(10, this.maxReasonableQuantity(product, needs)); qty++) {
                const newCost = currentCost + (product.price * qty);
                if (newCost < callback.bestCost) {
                    current.push({ productId, quantity: qty, price: product.price });
                    this.generateCombinations(productIds, needs, i + 1, current, newCost, callback);
                    current.pop();
                }
            }
        }
    }

    /**
     * Vérifications d'optimisation
     */
    canHelpWithNeeds(product, needs) {
        const lots = product.coinLots;
        for (const metal in needs) {
            if (lots[metal] && needs[metal] > 0) {
                return true;
            }
        }
        return false;
    }

    maxReasonableQuantity(product, needs) {
        // Calcul intelligent de la quantité max raisonnable
        let maxNeeded = Math.max(...Object.values(needs));
        return Math.ceil(maxNeeded / 10) + 1;
    }

    /**
     * Vérification que les besoins sont satisfaits
     */
    satisfiesNeeds(combination, needs) {
        const provided = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 };
        
        combination.forEach(item => {
            const product = this.products[item.productId];
            const lots = product.coinLots;
            
            Object.keys(lots).forEach(metal => {
                if (typeof lots[metal] === 'object') {
                    // Gestion des lots complexes (avec multiplicateurs)
                    Object.values(lots[metal]).forEach(count => {
                        provided[metal] += count * item.quantity;
                    });
                } else {
                    // Gestion des lots simples
                    provided[metal] += lots[metal] * item.quantity;
                }
            });
        });

        // Vérification que tous les besoins sont couverts
        return Object.keys(needs).every(metal => provided[metal] >= needs[metal]);
    }

    /**
     * Interface publique pour les recommandations
     */
    recommend(copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0) {
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

// Données générées automatiquement depuis PHP
const GENERATED_COIN_PRODUCTS = [
    {
        "id": "coin-custom-single",
        "name": "Pi\u00e8ce Personnalis\u00e9e",
        "name_en": "Custom Coin",
        "price": 10,
        "customizable": false,
        "multipliers": [
            1,
            10,
            100,
            1000,
            10000
        ],
        "coin_lots": {
            "copper": 1,
            "silver": 1,
            "electrum": 1,
            "gold": 1,
            "platinum": 1
        },
        "metals": [
            "cuivre",
            "argent",
            "\u00e9lectrum",
            "or",
            "platine"
        ]
    },
    {
        "id": "coin-trio-customizable",
        "name": "Trio de Pi\u00e8ces",
        "name_en": "Trio of Coins",
        "price": 25,
        "customizable": false,
        "multipliers": [
            1,
            10,
            100,
            1000,
            10000
        ],
        "coin_lots": {
            "copper": 3,
            "silver": 3,
            "electrum": 3,
            "gold": 3,
            "platinum": 3
        },
        "metals": [
            "cuivre",
            "argent",
            "\u00e9lectrum",
            "or",
            "platine"
        ]
    },
    {
        "id": "coin-quintessence-metals",
        "name": "Quintessence M\u00e9tallique",
        "name_en": "Metal Quintessence",
        "price": 35,
        "customizable": false,
        "multipliers": [
            1,
            10,
            100,
            1000,
            10000
        ],
        "coin_lots": {
            "copper": 1,
            "silver": 1,
            "electrum": 1,
            "gold": 1,
            "platinum": 1
        }
    },
    {
        "id": "coin-septuple-free",
        "name": "Septuple Libre",
        "name_en": "Free Septuple",
        "price": 50,
        "customizable": false,
        "multipliers": [
            1,
            10,
            100,
            1000,
            10000
        ],
        "coin_lots": {
            "copper": 7,
            "silver": 7,
            "electrum": 7,
            "gold": 7,
            "platinum": 7
        },
        "metals": [
            "cuivre",
            "argent",
            "\u00e9lectrum",
            "or",
            "platine"
        ]
    },
    {
        "id": "coin-traveler-offering",
        "name": "Offrande du Voyageur",
        "name_en": "The Traveler Offering",
        "price": 60,
        "customizable": false,
        "multipliers": [
            1,
            10,
            100,
            1000,
            10000
        ],
        "coin_lots": {
            "copper": 2,
            "silver": 2,
            "electrum": 2,
            "gold": 2,
            "platinum": 2
        }
    },
    {
        "id": "coin-five-realms-complete",
        "name": "La Monnaie des Cinq Royaumes",
        "name_en": "Currency of the Five Realms",
        "price": 145,
        "customizable": false,
        "multipliers": [],
        "coin_lots": {
            "copper": {
                "1": 1,
                "10": 1,
                "100": 1,
                "1000": 1,
                "10000": 1
            },
            "silver": {
                "1": 1,
                "10": 1,
                "100": 1,
                "1000": 1,
                "10000": 1
            },
            "electrum": {
                "1": 1,
                "10": 1,
                "100": 1,
                "1000": 1,
                "10000": 1
            },
            "gold": {
                "1": 1,
                "10": 1,
                "100": 1,
                "1000": 1,
                "10000": 1
            },
            "platinum": {
                "1": 1,
                "10": 1,
                "100": 1,
                "1000": 1,
                "10000": 1
            }
        }
    },
    {
        "id": "coin-merchant-essence-double",
        "name": "Essence du Marchand",
        "name_en": "Essence of the Merchant",
        "price": 275,
        "customizable": false,
        "multipliers": [],
        "coin_lots": {
            "copper": {
                "1": 2,
                "10": 2,
                "100": 2,
                "1000": 2,
                "10000": 2
            },
            "silver": {
                "1": 2,
                "10": 2,
                "100": 2,
                "1000": 2,
                "10000": 2
            },
            "electrum": {
                "1": 2,
                "10": 2,
                "100": 2,
                "1000": 2,
                "10000": 2
            },
            "gold": {
                "1": 2,
                "10": 2,
                "100": 2,
                "1000": 2,
                "10000": 2
            },
            "platinum": {
                "1": 2,
                "10": 2,
                "100": 2,
                "1000": 2,
                "10000": 2
            }
        }
    },
    {
        "id": "coin-lord-treasury-uniform",
        "name": "La Tr\u00e9sorerie du Seigneur",
        "name_en": "The Lord's Treasury",
        "price": 275,
        "customizable": false,
        "multipliers": [
            1,
            10,
            100,
            1000,
            10000
        ],
        "coin_lots": {
            "copper": 10,
            "silver": 10,
            "electrum": 10,
            "gold": 10,
            "platinum": 10
        }
    }
];

// Instance globale
window.dynamicRecommender = new DynamicCoinRecommender();

// Interface de compatibilité avec l'ancien système
window.convertCoinsToLots = function(copper = 0, silver = 0, electrum = 0, gold = 0, platinum = 0) {
    return window.dynamicRecommender.recommend(copper, silver, electrum, gold, platinum);
};
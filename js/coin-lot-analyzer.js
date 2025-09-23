/**
 * Analyseur de lots de pièces - Parsing dynamique des capacités
 * Extrait automatiquement les capacités de chaque lot depuis products.json
 * Calcule les recommandations optimales (prix minimum)
 */
class CoinLotAnalyzer {
    constructor(products = {}) {
        this.products = products;
        this.coinProducts = this.extractCoinProducts();
        this.rates = { copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000 };
        this.multipliers = [1, 10, 100, 1000, 10000];
    }

    /**
     * Extrait et analyse tous les produits de pièces
     */
    extractCoinProducts() {
        const coinProducts = {};

        Object.entries(this.products).forEach(([id, product]) => {
            if (!id.startsWith('coin-') || !product.coin_lots) return;

            coinProducts[id] = {
                id,
                name: product.name || '',
                name_en: product.name_en || product.name || '',
                summary: product.summary || '',
                summary_en: product.summary_en || product.summary || '',
                price: parseFloat(product.price) || 0,
                customizable: product.customizable === true,
                multipliers: product.multipliers || [],
                metals: product.metals || [],
                metals_en: product.metals_en || [],
                capabilities: this.analyzeLotCapabilities(product.coin_lots, product.customizable, product.multipliers || [])
            };
        });

        return coinProducts;
    }

    /**
     * Analyse les capacités d'un lot depuis sa structure coin_lots
     */
    analyzeLotCapabilities(coinLots, isCustomizable, availableMultipliers) {
        const capabilities = [];

        if (isCustomizable && availableMultipliers.length > 0) {
            // Produit personnalisable : peut faire n'importe quelle combinaison
            Object.entries(coinLots).forEach(([metal, quantity]) => {
                if (typeof quantity === 'number' && quantity > 0) {
                    availableMultipliers.forEach(multiplier => {
                        capabilities.push({
                            type: 'customizable',
                            metal,
                            multiplier,
                            quantity,
                            totalValue: quantity * this.rates[metal] * multiplier
                        });
                    });
                }
            });
        } else {
            // Produit fixe ou semi-fixe
            if (typeof coinLots === 'object') {
                Object.entries(coinLots).forEach(([metal, data]) => {
                    if (typeof data === 'number') {
                        // Cas simple : quantité fixe, multiplicateur choisi à l'achat
                        if (availableMultipliers.length > 0) {
                            availableMultipliers.forEach(multiplier => {
                                capabilities.push({
                                    type: 'fixed_quantity_chosen_multiplier',
                                    metal,
                                    multiplier,
                                    quantity: data,
                                    totalValue: data * this.rates[metal] * multiplier
                                });
                            });
                        } else {
                            // Pas de multiplicateur spécifié, assume unitaire
                            capabilities.push({
                                type: 'fixed',
                                metal,
                                multiplier: 1,
                                quantity: data,
                                totalValue: data * this.rates[metal]
                            });
                        }
                    } else if (typeof data === 'object') {
                        // Cas complexe : quantités par multiplicateur
                        Object.entries(data).forEach(([multiplier, quantity]) => {
                            const mult = parseInt(multiplier);
                            const qty = parseInt(quantity);
                            if (!isNaN(mult) && !isNaN(qty) && qty > 0) {
                                capabilities.push({
                                    type: 'fixed_complete',
                                    metal,
                                    multiplier: mult,
                                    quantity: qty,
                                    totalValue: qty * this.rates[metal] * mult
                                });
                            }
                        });
                    }
                });
            }
        }

        return capabilities;
    }

    /**
     * Trouve les lots optimaux pour couvrir exactement les besoins (prix minimum)
     */
    findOptimalLots(needs) {
        // needs = { copper: {1: qty, 10: qty, ...}, silver: {...}, ... }
        const solutions = [];
        
        // Générer toutes les combinaisons possibles
        this.generateSolutions(needs, [], 0, solutions);
        
        // Trier par prix croissant
        solutions.sort((a, b) => a.totalPrice - b.totalPrice);
        
        // Retourner la meilleure solution
        return solutions[0]?.lots || [];
    }

    /**
     * Génère récursivement toutes les solutions possibles
     */
    generateSolutions(remainingNeeds, currentLots, currentPrice, solutions) {
        // Vérifier si tous les besoins sont satisfaits
        if (this.areNeedsSatisfied(remainingNeeds)) {
            solutions.push({
                lots: [...currentLots],
                totalPrice: currentPrice
            });
            return;
        }

        // Pour chaque produit de pièces, essayer de l'utiliser
        Object.values(this.coinProducts).forEach(product => {
            product.capabilities.forEach(capability => {
                const { metal, multiplier, quantity } = capability;
                
                // Vérifier si cette capacité peut aider
                if (!remainingNeeds[metal] || !remainingNeeds[metal][multiplier]) return;
                
                const needed = remainingNeeds[metal][multiplier];
                if (needed <= 0) return;

                // Calculer combien de lots de ce type nous pouvons utiliser
                const maxLots = Math.ceil(needed / quantity);
                
                // Essayer différentes quantités (de 1 à maxLots, mais limité pour éviter explosion)
                const maxTries = Math.min(maxLots, 5); // Limite pour performance
                
                for (let lotCount = 1; lotCount <= maxTries; lotCount++) {
                    const newNeeds = this.subtractCapability(remainingNeeds, capability, lotCount);
                    const newPrice = currentPrice + (product.price * lotCount);
                    
                    // Détails du lot pour l'affichage
                    const lotDetail = {
                        productId: product.id,
                        product: product,
                        quantity: lotCount,
                        price: product.price,
                        capability: capability,
                        displayName: this.generateDisplayName(product, capability),
                        customFields: this.generateCustomFields(product, capability)
                    };
                    
                    const newLots = [...currentLots, lotDetail];
                    
                    // Récursion avec limite de profondeur
                    if (newLots.length < 10) { // Éviter récursion infinie
                        this.generateSolutions(newNeeds, newLots, newPrice, solutions);
                    }
                }
            });
        });
    }

    /**
     * Génère le nom d'affichage pour un lot avec ses variations
     */
    generateDisplayName(product, capability) {
        let name = product.name;
        
        if (product.customizable) {
            // Pour les produits personnalisables, ne pas inclure les variations dans le nom
            return name;
        } else if (capability.type === 'fixed_quantity_chosen_multiplier') {
            // Pour les produits avec multiplicateur choisi, ne pas l'inclure dans le nom
            return name;
        }
        
        return name;
    }

    /**
     * Génère les champs personnalisés Snipcart pour un lot
     */
    generateCustomFields(product, capability) {
        const fields = {};
        let fieldIndex = 1;

        if (product.customizable && product.metals && product.metals.length > 0) {
            fields[`custom${fieldIndex}`] = {
                name: 'Metal',
                type: 'dropdown',
                options: product.metals.join('|'),
                value: capability.metal,
                role: 'metal'
            };
            fieldIndex++;
        }

        if (product.multipliers && product.multipliers.length > 0) {
            fields[`custom${fieldIndex}`] = {
                name: 'Multiplicateur',
                type: 'dropdown', 
                options: product.multipliers.join('|'),
                value: capability.multiplier.toString(),
                role: 'multiplier'
            };
            fieldIndex++;
        }

        return fields;
    }

    /**
     * Soustrait une capacité des besoins restants
     */
    subtractCapability(needs, capability, lotCount) {
        const newNeeds = JSON.parse(JSON.stringify(needs)); // Deep clone
        const { metal, multiplier, quantity } = capability;
        
        if (newNeeds[metal] && newNeeds[metal][multiplier]) {
            newNeeds[metal][multiplier] = Math.max(0, newNeeds[metal][multiplier] - (quantity * lotCount));
        }
        
        return newNeeds;
    }

    /**
     * Vérifie si tous les besoins sont satisfaits
     */
    areNeedsSatisfied(needs) {
        return Object.values(needs).every(metalNeeds => 
            Object.values(metalNeeds).every(qty => qty <= 0)
        );
    }

    /**
     * Convertit les valeurs du convertisseur en besoins structurés
     */
    convertCurrencyToNeeds(copper, silver, electrum, gold, platinum) {
        // Utilise la logique du convertisseur pour obtenir la répartition optimale
        const baseValue = copper * this.rates.copper + 
                          silver * this.rates.silver + 
                          electrum * this.rates.electrum + 
                          gold * this.rates.gold + 
                          platinum * this.rates.platinum;

        return this.convertBaseValueToNeeds(baseValue);
    }

    /**
     * Convertit une valeur de base en besoins par métal/multiplicateur
     */
    convertBaseValueToNeeds(baseValue) {
        const needs = {
            copper: {}, silver: {}, electrum: {}, gold: {}, platinum: {}
        };

        // Pour chaque métal, calculer les besoins par multiplicateur
        Object.keys(this.rates).forEach(metal => {
            const rate = this.rates[metal];
            const totalUnits = Math.floor(baseValue / rate);
            
            if (totalUnits > 0) {
                // Décomposer en multiplicateurs (plus grande valeur d'abord)
                let remaining = totalUnits;
                this.multipliers.slice().reverse().forEach(mult => {
                    const count = Math.floor(remaining / mult);
                    if (count > 0) {
                        needs[metal][mult] = count;
                        remaining -= count * mult;
                    }
                });
            }
        });

        return needs;
    }

    /**
     * Méthode publique pour obtenir les recommandations
     */
    getRecommendations(copper, silver, electrum, gold, platinum) {
        const needs = this.convertCurrencyToNeeds(copper, silver, electrum, gold, platinum);
        return this.findOptimalLots(needs);
    }
}

// Export pour utilisation
window.CoinLotAnalyzer = CoinLotAnalyzer;
/**
 * CoinLotOptimizer - Algorithme de sac à dos pour optimisation des lots de pièces D&D
 *
 * Architecture : Pattern Strategy pour l'optimisation multi-critères
 * Responsabilité : Trouver la combinaison de lots la moins chère qui couvre exactement
 * les besoins de pièces, avec surplus autorisé mais déficit interdit.
 *
 * Algorithme : Sac à dos dynamique avec génération exhaustive des variations produits
 * - Pièces Personnalisées : 25 variations (5 métaux × 5 multiplicateurs)
 * - Trio de Pièces : 25 variations (3 pièces même métal/multiplicateur)
 * - Quintessence Métallique : 5 variations (1 par multiplicateur, tous métaux)
 * - Septuple Libre : 25 variations (7 pièces même métal/multiplicateur)
 * - Produits fixes : parsing dynamique structure coin_lots
 *
 * @author Brujah - Geek & Dragon
 * @version 2.0.0 - Production
 */
class CoinLotOptimizer {
    /**
     * Initialise l'optimiseur avec les taux D&D standard et la configuration des multiplicateurs
     * Configuration monétaire basée sur les règles officielles D&D 5e
     */
    constructor() {
        // Taux de change standards D&D (base cuivre)
        this.rates = {
            copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000,
        };
        
        // Multiplicateurs physiques disponibles pour les pièces personnalisées
        this.multipliers = [1, 10, 100, 1000, 10000];
        
        // Traductions des noms de métaux pour l'affichage multilingue
        this.metalNames = {
            fr: {
                copper: 'Cuivre', silver: 'Argent', electrum: 'Électrum', gold: 'Or', platinum: 'Platine',
            },
            en: {
                copper: 'Copper', silver: 'Silver', electrum: 'Electrum', gold: 'Gold', platinum: 'Platinum',
            },
        };
    }

    
    /**
     * Obtient la langue actuelle du document pour les traductions
     * @returns {string} Code langue (fr/en)
     */
    getCurrentLang() {
        return document.documentElement?.lang || 'fr';
    }

    /**
     * Point d'entrée principal : trouve la combinaison optimale de lots
     * Utilise l'algorithme de sac à dos pour minimiser le coût total
     * 
     * @param {Object} needs - Besoins exacts par type de pièce {"copper_1": 2, "platinum_10": 1, ...}
     * @returns {Array} Solution optimale formatée pour ajout au panier Snipcart
     * @example
     * const needs = {"copper_1": 5, "gold_100": 2};
     * const solution = optimizer.findOptimalProductCombination(needs);
     * // Retourne: [{product: {...}, quantity: 1, displayName: "...", totalCost: 35}]
     */
    findOptimalProductCombination(needs) {
        if (!needs || Object.keys(needs).length === 0) {
            return [];
        }

        // Vérifier disponibilité des produits
        if (!window.products) {
            return [];
        }

        // 1. Générer toutes les variations possibles de tous les produits
        const allVariations = this.generateAllProductVariations();

        // 2. Appliquer l'algorithme de sac à dos pour trouver la solution optimale
        const optimalSolution = this.knapsackOptimize(needs, allVariations);

        // 3. Formater la solution pour l'interface utilisateur et Snipcart
        return this.formatSolution(optimalSolution);
    }

    /**
   * Génère toutes les variations possibles de tous les produits de type "pieces"
   * @returns {Array} Liste de toutes les variations avec capacités
   */
    generateAllProductVariations() {
        const variations = [];

        Object.entries(window.products).forEach(([productId, product]) => {
            if (!product || product.category !== 'pieces') return;

            if (product.customizable) {
                this.generateCustomizableVariations(productId, product, variations);
            } else {
                this.generateFixedVariations(productId, product, variations);
            }
        });

        return variations;
    }

    /**
   * Génère les variations pour les produits personnalisables
   * @param {string} productId - ID du produit
   * @param {Object} product - Données du produit
   * @param {Array} variations - Array à remplir
   */
    generateCustomizableVariations(productId, product, variations) {
        const metals = product.metals_en || ['copper', 'silver', 'electrum', 'gold', 'platinum'];
        const multipliers = product.multipliers || [1, 10, 100, 1000, 10000];

        // Détecter le type de produit par ID
        if (productId === 'coin-quintessence-metals') {
            // CAS SPÉCIAL : Quintessence Métallique
            // 5 variations (1 par multiplicateur)
            // Chaque variation donne 1 pièce de chaque métal avec le même multiplicateur

            multipliers.forEach((mult) => {
                const capacity = {};
                metals.forEach((metal) => {
                    capacity[`${metal}_${mult}`] = 1; // 1 pièce de chaque métal
                });

                variations.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    type: 'quintessence',
                    multiplier: mult,
                    capacity,
                    coinsProvided: metals.length, // 5 pièces total
                });
            });
        } else {
            // CAS STANDARD : Pièces Personnalisées, Trio, Septuple
            // 25 variations (5 métaux × 5 multiplicateurs)
            // Chaque variation donne N pièces du même métal/multiplicateur
            const coinsPerLot = Object.values(product.coin_lots)[0] || 1;

            metals.forEach((metal) => {
                multipliers.forEach((mult) => {
                    if (product.coin_lots[metal]) {
                        const capacity = {};
                        capacity[`${metal}_${mult}`] = product.coin_lots[metal]; // N pièces du même type

                        variations.push({
                            productId,
                            name: product.name,
                            price: product.price,
                            type: 'normal',
                            metal,
                            multiplier: mult,
                            capacity,
                            coinsProvided: product.coin_lots[metal],
                        });
                    }
                });
            });
        }
    }

    /**
   * Génère les variations pour les produits fixes
   * @param {string} productId - ID du produit
   * @param {Object} product - Données du produit
   * @param {Array} variations - Array à remplir
   */
    generateFixedVariations(productId, product, variations) {

        const multipliers = product.multipliers || [];

        if (multipliers.length > 0) {
            // Produit fixe avec choix de multiplicateur (ex: Offrande du Voyageur)
            multipliers.forEach((mult) => {
                const capacity = {};
                let totalCoins = 0;

                if (product.coin_lots) {
                    Object.entries(product.coin_lots).forEach(([metal, quantity]) => {
                        if (typeof quantity === 'number' && quantity > 0) {
                            capacity[`${metal}_${mult}`] = quantity;
                            totalCoins += quantity;
                        }
                    });
                }

                if (Object.keys(capacity).length > 0) {
                    variations.push({
                        productId,
                        name: product.name,
                        price: product.price,
                        type: 'fixed_multiplier',
                        multiplier: mult,
                        capacity,
                        coinsProvided: totalCoins,
                    });
                }
            });
        } else {
            // Produit complètement fixe (ex: Collections complètes)
            const capacity = {};
            let totalCoins = 0;

            if (product.coin_lots) {
                Object.entries(product.coin_lots).forEach(([metal, data]) => {
                    if (typeof data === 'number') {
                        // Format simple: coin_lots.copper = 2
                        capacity[`${metal}_1`] = data;
                        totalCoins += data;
                    } else if (typeof data === 'object' && data !== null) {
                        // Format détaillé: coin_lots.copper.1 = 1, coin_lots.copper.10 = 1, etc.
                        Object.entries(data).forEach(([mult, qty]) => {
                            if (qty > 0) {
                                capacity[`${metal}_${mult}`] = qty;
                                totalCoins += qty;
                            }
                        });
                    }
                });
            }

            if (Object.keys(capacity).length > 0) {
                variations.push({
                    productId,
                    name: product.name,
                    price: product.price,
                    type: 'fixed_complete',
                    capacity,
                    coinsProvided: totalCoins,
                });
            }
        }
    }

    /**
   * Algorithme de sac à dos pour trouver la solution optimale
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Toutes les variations disponibles
   * @returns {Array} Solution optimale
   */
    knapsackOptimize(needs, variations) {

        const solutions = [];

        // ÉTAPE 1: BRUTE-FORCE INTELLIGENT (NOUVEAU - Prioritaire)
        // Tester quantités multiples pour trouver le panier le moins cher
        const bruteForceResults = this.findBruteForceOptimal(needs, variations);
        bruteForceResults.forEach((solution) => solutions.push(solution));

        // ÉTAPE 2: Solutions à produit unique (améliorée mais secondaire)
        // Chercher si un seul produit peut couvrir tous les besoins
        variations.forEach((variation) => {
            if (this.canCoverAllNeeds(variation, needs)) {
                const quantity = this.calculateRequiredQuantity(variation, needs);
                const cost = variation.price * quantity;

                solutions.push({
                    items: [{ variation, quantity }],
                    totalCost: cost,
                    type: 'single',
                });

            }
        });

        // ÉTAPE 3: Combinaisons multiples de Quintessence
        // Tester toutes les combinaisons possibles de Quintessence ensemble
        const quintessenceVariations = variations.filter((v) => v.type === 'quintessence');
        const quintessenceCombinations = this.findQuintessenceCombinations(needs, quintessenceVariations);

        quintessenceCombinations.forEach((combination) => {
            const totalCost = combination.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);

            solutions.push({
                items: combination,
                totalCost,
                type: 'quintessence_multiple',
            });

        });

        // ÉTAPE 4: Décomposition intelligente avec Quintessences partielles
        // Identifier les patterns Quintessence dans les besoins et les extraire
        const decompositionSolutions = this.findDecompositionSolutions(needs, variations);

        decompositionSolutions.forEach((solution) => {
            solutions.push({
                items: solution,
                totalCost: solution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0),
                type: 'decomposition',
            });

            const totalCost = solution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
        });

        // ÉTAPE 5: Solutions combinées avec quintessence + complément
        // Utiliser une approche de base + compléments pour les cas complexes

        quintessenceVariations.forEach((baseVariation) => {
            const coverage = this.calculateCoverage(baseVariation, needs, 1);
            const remaining = this.calculateRemainingNeeds(needs, coverage);

            if (Object.keys(remaining).length > 0) {
                const complement = this.findComplementSolution(remaining, variations);

                if (complement) {
                    const allItems = [{ variation: baseVariation, quantity: 1 }, ...complement];
                    const totalCost = allItems.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);

                    solutions.push({
                        items: allItems,
                        totalCost,
                        type: 'combined',
                    });

                }
            }
        });

        // ÉTAPE 6: Solution avec pièces personnalisées (EN DERNIER RECOURS)
        // Seulement si aucune solution optimale trouvée ou très peu de solutions
        if (solutions.length < 3) {
            const customSolution = this.findCustomCoinsSolution(needs, variations);
            if (customSolution && customSolution.length > 0) {
                const totalCost = customSolution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);

                solutions.push({
                    items: customSolution,
                    totalCost,
                    type: 'custom_fallback',
                });

            }
        }

        // ÉTAPE 6.5: NOUVELLE - Optimisation spécifique des lots trio/septuple
        // Analyser si on peut remplacer des pièces identiques par des lots économiques
        const bulkOptimizedSolutions = this.findBulkOptimizedSolutions(needs, variations);
        bulkOptimizedSolutions.forEach((solution) => {
            solutions.push({
                items: solution,
                totalCost: solution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0),
                type: 'bulk_optimized',
            });
        });

        // ÉTAPE 7: Filtrer les solutions complètes et sélectionner la meilleure
        const completeSolutions = solutions.filter((solution) => this.validateSolution(solution.items, needs));

        // ÉTAPE 7.5: NOUVELLE - Post-traitement pour optimiser les lots dans toutes les solutions
        const optimizedSolutions = completeSolutions.map((solution) => {
            const optimizedItems = this.optimizeWithBulkLots(solution.items, variations);
            const optimizedCost = this.calculateSolutionCost(optimizedItems);
            return {
                ...solution,
                items: optimizedItems,
                totalCost: optimizedCost,
                type: `${solution.type}_bulk_optimized`,
            };
        });

        // Tri par coût total uniquement (objectif: panier moins cher)
        optimizedSolutions.sort((a, b) => a.totalCost - b.totalCost);

        if (optimizedSolutions.length > 0) {
            const best = optimizedSolutions[0];
            return best.items;
        }

        // Aucune solution trouvée - retour vide silencieux
        return [];
    }

    /**
   * Vérifie si une variation peut couvrir tous les besoins
   * @param {Object} variation - Variation à tester
   * @param {Object} needs - Besoins
   * @returns {boolean}
   */
    canCoverAllNeeds(variation, needs) {
        for (const [coinKey, needed] of Object.entries(needs)) {
            if (needed > 0 && (!variation.capacity[coinKey] || variation.capacity[coinKey] === 0)) {
                return false;
            }
        }
        return true;
    }

    /**
   * Calcule la quantité requise d'un produit pour couvrir les besoins
   * @param {Object} variation - Variation du produit
   * @param {Object} needs - Besoins
   * @returns {number}
   */
    calculateRequiredQuantity(variation, needs) {
        let maxQuantity = 1;

        for (const [coinKey, needed] of Object.entries(needs)) {
            if (needed > 0 && variation.capacity[coinKey]) {
                const requiredQty = Math.ceil(needed / variation.capacity[coinKey]);
                maxQuantity = Math.max(maxQuantity, requiredQty);
            }
        }

        return maxQuantity;
    }

    /**
   * Calcule la couverture fournie par une variation
   * @param {Object} variation - Variation du produit
   * @param {Object} needs - Besoins
   * @param {number} quantity - Quantité du produit
   * @returns {Object}
   */
    calculateCoverage(variation, needs, quantity = 1) {
        const coverage = {};

        for (const [coinKey, needed] of Object.entries(needs)) {
            const provided = (variation.capacity[coinKey] || 0) * quantity;
            if (provided > 0) {
                coverage[coinKey] = Math.min(needed, provided);
            }
        }

        return coverage;
    }

    /**
   * Calcule les besoins restants après couverture
   * @param {Object} originalNeeds - Besoins originaux
   * @param {Object} coverage - Couverture fournie
   * @returns {Object}
   */
    calculateRemainingNeeds(originalNeeds, coverage) {
        const remaining = {};

        for (const [coinKey, needed] of Object.entries(originalNeeds)) {
            const covered = coverage[coinKey] || 0;
            const stillNeeded = needed - covered;
            if (stillNeeded > 0) {
                remaining[coinKey] = stillNeeded;
            }
        }

        return remaining;
    }

    /**
   * NOUVELLE MÉTHODE: Brute-force intelligent pour trouver le panier le moins cher
   * Teste quantités multiples et combinaisons simples
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Variations disponibles
   * @returns {Array} Solutions trouvées triées par coût
   */
    findBruteForceOptimal(needs, variations) {

        const solutions = [];
        const maxQuantity = this.calculateMaxReasonableQuantity(needs);


        // Test 1: Solutions à produit unique avec quantités multiples
        variations.forEach((variation) => {
            for (let qty = 1; qty <= maxQuantity; qty++) {
                if (this.canCoverWithQuantity(variation, needs, qty)) {
                    // LOGIQUE ANTI-GASPILLAGE: Éviter Quintessence pour besoins simples
                    if (this.isWastefulSolution(variation, needs, qty)) {
                        continue;
                    }

                    const cost = variation.price * qty;

                    solutions.push({
                        items: [{ variation, quantity: qty }],
                        totalCost: cost,
                        type: 'brute_force_single',
                    });

                }
            }
        });

        // Test 2: Combinaisons de 2 produits pour cas complexes
        if (Object.keys(needs).length > 1 && solutions.length < 5) {
            this.findBruteForce2Products(needs, variations, solutions, maxQuantity);
        }

        // FALLBACK: Si aucune solution économique trouvée, créer solution par pièces individuelles
        if (solutions.length === 0 || solutions.every((s) => s.totalCost > 50)) {
            const individualSolution = this.createIndividualSolution(needs, variations);
            if (individualSolution) {
                solutions.push(individualSolution);
            }
        }

        return solutions.sort((a, b) => a.totalCost - b.totalCost);
    }

    /**
   * Test combinaisons de 2 produits (limité pour performance)
   */
    findBruteForce2Products(needs, variations, solutions, maxQuantity) {
        const limit = Math.min(variations.length, 10); // Limite pour performance

        for (let i = 0; i < limit; i++) {
            for (let j = i + 1; j < limit; j++) {
                const var1 = variations[i];
                const var2 = variations[j];

                // Tester quelques combinaisons prometteuses
                for (let qty1 = 1; qty1 <= 3; qty1++) {
                    for (let qty2 = 1; qty2 <= 3; qty2++) {
                        if (this.canCoverWith2Products(var1, qty1, var2, qty2, needs)) {
                            const cost = (var1.price * qty1) + (var2.price * qty2);

                            solutions.push({
                                items: [
                                    { variation: var1, quantity: qty1 },
                                    { variation: var2, quantity: qty2 },
                                ],
                                totalCost: cost,
                                type: 'brute_force_double',
                            });

                        }
                    }
                }
            }
        }
    }

    /**
   * Vérifie si une variation avec quantité spécifique peut couvrir tous les besoins
   * @param {Object} variation - Variation à tester
   * @param {Object} needs - Besoins
   * @param {number} quantity - Quantité à tester
   * @returns {boolean}
   */
    canCoverWithQuantity(variation, needs, quantity) {
        const coverage = {};

        // Calculer ce que cette quantité couvre
        Object.entries(variation.capacity).forEach(([coinKey, capacity]) => {
            coverage[coinKey] = capacity * quantity;
        });

        // Vérifier que TOUS les besoins sont couverts (surplus autorisé)
        return Object.entries(needs).every(([coinKey, needed]) => {
            const covered = coverage[coinKey] || 0;
            return needed <= covered;
        });
    }

    /**
   * Détermine si une solution génère un gaspillage excessif
   * @param {Object} variation - Variation du produit
   * @param {Object} needs - Besoins
   * @param {number} quantity - Quantité
   * @returns {boolean} true si la solution est considérée comme gaspilleuse
   */
    isWastefulSolution(variation, needs, quantity) {
    // Cas spécial : Quintessence avec besoins simples
        if (variation.type === 'quintessence') {
            const neededMetals = Object.keys(needs).map((key) => key.split('_')[0]);
            const uniqueMetals = [...new Set(neededMetals)];

            // Si seulement 1-2 métaux demandés, Quintessence est gaspilleuse
            if (uniqueMetals.length <= 2) {
                return true;
            }

            // NOUVEAU: Comparaison économique directe avec pièces individuelles
            const totalNeeded = Object.values(needs).reduce((sum, qty) => sum + qty, 0);
            const quintessenceCost = variation.price * quantity;
            const individualCost = totalNeeded * 10; // Prix pièce personnalisée = $10

            if (individualCost < quintessenceCost) {
                return true;
            }

            // Si besoins totaux très faibles ET peu de métaux, Quintessence disproportionnée
            if (totalNeeded <= 3 && uniqueMetals.length <= 2) {
                return true;
            }
        }

        // Calculer le ratio de gaspillage global
        const totalProvided = Object.values(variation.capacity).reduce((sum, cap) => sum + cap * quantity, 0);
        const totalNeeded = Object.values(needs).reduce((sum, needed) => sum + needed, 0);
        const wasteRatio = (totalProvided - totalNeeded) / totalProvided;

        // Rejeter si plus de 70% de gaspillage
        if (wasteRatio > 0.7) {
            return true;
        }

        return false;
    }

    /**
   * Crée une solution par pièces individuelles
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Toutes les variations disponibles
   * @returns {Object|null} Solution par pièces individuelles
   */
    createIndividualSolution(needs, variations) {
        const items = [];
        let totalCost = 0;

        // Pour chaque besoin, trouver la pièce personnalisée correspondante
        for (const [coinKey, quantity] of Object.entries(needs)) {
            if (quantity <= 0) continue;

            const [metal, mult] = coinKey.split('_');
            const individualVariation = variations.find((v) => v.type === 'normal'
        && v.productId === 'coin-custom-single'
        && v.capacity[coinKey] === 1);

            if (individualVariation) {
                items.push({ variation: individualVariation, quantity });
                totalCost += individualVariation.price * quantity;
            } else {
                return null;
            }
        }

        if (items.length === 0) {
            return null;
        }


        return {
            items,
            totalCost,
            type: 'individual_fallback',
        };
    }

    /**
   * Vérifie si 2 produits peuvent couvrir ensemble tous les besoins
   */
    canCoverWith2Products(var1, qty1, var2, qty2, needs) {
        const coverage = {};

        // Couverture produit 1
        Object.entries(var1.capacity).forEach(([coinKey, capacity]) => {
            coverage[coinKey] = (coverage[coinKey] || 0) + (capacity * qty1);
        });

        // Couverture produit 2
        Object.entries(var2.capacity).forEach(([coinKey, capacity]) => {
            coverage[coinKey] = (coverage[coinKey] || 0) + (capacity * qty2);
        });

        // Vérifier couverture complète
        return Object.entries(needs).every(([coinKey, needed]) => needed <= (coverage[coinKey] || 0));
    }

    /**
   * Calcule une limite raisonnable pour les quantités à tester
   * @param {Object} needs - Besoins
   * @returns {number} Quantité maximum à tester
   */
    calculateMaxReasonableQuantity(needs) {
        const totalNeeds = Object.values(needs).reduce((sum, val) => sum + val, 0);

        // Limites raisonnables basées sur la complexité
        if (totalNeeds <= 5) return 8; // Petits besoins: test plus exhaustif
        if (totalNeeds <= 10) return 5; // Besoins moyens: test modéré
        if (totalNeeds <= 20) return 3; // Gros besoins: test limité
        return 2; // Très gros besoins: test minimal
    }

    /**
   * Trouve une solution avec uniquement des pièces personnalisées
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Variations disponibles
   * @returns {Array|null}
   */
    findCustomCoinsSolution(needs, variations) {
    // Chercher toutes les pièces personnalisées nécessaires
        const customVariations = variations.filter((v) => v.productId === 'coin-custom-single' && v.type === 'normal');

        const solution = [];

        for (const [coinKey, needed] of Object.entries(needs)) {
            if (needed <= 0) continue;

            const [metal, multiplier] = coinKey.split('_');
            const matchingVariation = customVariations.find((v) => v.metal === metal && v.multiplier == multiplier);

            if (matchingVariation) {
                solution.push({
                    variation: matchingVariation,
                    quantity: needed,
                });
            } else {
                // Si on ne peut pas satisfaire un besoin, cette stratégie échoue
                return null;
            }
        }

        return solution.length > 0 ? solution : null;
    }

    /**
   * Trouve une solution complémentaire pour les besoins restants
   * @param {Object} remainingNeeds - Besoins restants
   * @param {Array} variations - Variations disponibles
   * @returns {Array|null}
   */
    findComplementSolution(remainingNeeds, variations) {
    // Même logique que findCustomCoinsSolution
        return this.findCustomCoinsSolution(remainingNeeds, variations);
    }

    /**
   * Formate la solution pour l'interface utilisateur et Snipcart
   * @param {Array} solution - Solution brute de l'algorithme
   * @returns {Array} Solution formatée
   */
    formatSolution(solution) {
        if (!solution || solution.length === 0) {
            return [];
        }

        const formatted = [];
        const lang = this.getCurrentLang();

        for (const item of solution) {
            const { variation } = item;

            let displayName = variation.name;
            const customFields = {};

            // Formater selon le type de variation
            if (variation.type === 'quintessence') {
                displayName += ` (×${variation.multiplier})`;
                customFields[`multiplier-${variation.productId}`] = {
                    role: 'multiplier',
                    value: variation.multiplier,
                };
            } else if (variation.type === 'normal' && variation.metal && variation.multiplier) {
                const metalName = this.metalNames[lang][variation.metal] || variation.metal;
                displayName += ` (${metalName} ×${variation.multiplier})`;

                customFields[`metal-${variation.productId}`] = {
                    role: 'metal',
                    value: variation.metal,
                };
                customFields[`multiplier-${variation.productId}`] = {
                    role: 'multiplier',
                    value: variation.multiplier,
                };
            } else if (variation.type === 'fixed_multiplier') {
                displayName += ` (×${variation.multiplier})`;
                customFields[`multiplier-${variation.productId}`] = {
                    role: 'multiplier',
                    value: variation.multiplier,
                };
            }

            formatted.push({
                productId: variation.productId,
                displayName,
                price: variation.price,
                quantity: item.quantity,
                totalCost: variation.price * item.quantity,
                customFields,
                url: `/${lang}/products/${variation.productId}/`,
                image: window.products[variation.productId]?.images?.[0] || null,
                description: window.products[variation.productId]?.description || '',
            });
        }

        return formatted;
    }

    /**
   * Trouve toutes les combinaisons valides de Quintessence
   * @param {Object} needs - Besoins
   * @param {Array} quintessenceVariations - Variations Quintessence disponibles
   * @returns {Array} Combinaisons valides
   */
    findQuintessenceCombinations(needs, quintessenceVariations) {
        const combinations = [];

        // NOUVELLE LOGIQUE: Tester spécifiquement les patterns détectés
        const patterns = this.multipliers.map((mult) => this.identifyQuintessencePattern(needs, mult))
            .filter((p) => p.matches >= 4); // SEUIL REHAUSSÉ: Minimum 4 métaux sur 5


        // 1. Tester combinaisons de 2 patterns viables avec complétion (INTELLIGENT)
        for (let i = 0; i < patterns.length; i++) {
            for (let j = i + 1; j < patterns.length; j++) {
                const pattern1 = patterns[i];
                const pattern2 = patterns[j];

                // Ne tester que si les patterns ont des multiplicateurs différents et suffisamment de métaux
                if (pattern1.multiplier !== pattern2.multiplier
            && pattern1.matches >= 4 && pattern2.matches >= 4) {
                    const quintessence1 = quintessenceVariations.find((v) => v.multiplier === pattern1.multiplier);
                    const quintessence2 = quintessenceVariations.find((v) => v.multiplier === pattern2.multiplier);

                    if (quintessence1 && quintessence2) {
                        // Créer solution partielle avec 2 Quintessences
                        const partialSolution = [
                            { variation: quintessence1, quantity: 1 },
                            { variation: quintessence2, quantity: 1 },
                        ];

                        // Calculer les besoins restants après ces 2 Quintessences
                        const remainingNeeds = { ...needs };
                        partialSolution.forEach((item) => {
                            Object.entries(item.variation.capacity).forEach(([coinKey, capacity]) => {
                                if (remainingNeeds[coinKey]) {
                                    remainingNeeds[coinKey] = Math.max(0, remainingNeeds[coinKey] - capacity);
                                }
                            });
                        });

                        // Compléter avec pièces personnalisées pour le reste
                        const allVariations = this.generateAllProductVariations();
                        const customVariations = allVariations.filter((v) => v.type === 'normal' && v.productId === 'coin-custom-single');
                        const complement = this.findCustomCoinsSolution(remainingNeeds, customVariations);

                        if (complement) {
                            const completeSolution = [...partialSolution, ...complement];
                            const totalCost = completeSolution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);

                            // Vérifier que la solution complète couvre tous les besoins
                            if (this.validateSolution(completeSolution, needs)) {
                                combinations.push(completeSolution);
                            }
                        }
                    }
                }
            }
        }

        // 2. Fallback: anciennes combinaisons pour compatibilité
        const maxCombinationSize = 3;
        for (let size = 2; size <= Math.min(maxCombinationSize, quintessenceVariations.length); size++) {
            const combos = this.generateCombinations(quintessenceVariations, size);

            combos.forEach((combo) => {
                const solution = this.testQuintessenceCombination(needs, combo);
                if (solution && solution.length > 0) {
                    combinations.push(solution);
                }
            });
        }

        return combinations;
    }

    /**
   * Génère toutes les combinaisons de taille donnée
   * @param {Array} items - Items à combiner
   * @param {number} size - Taille des combinaisons
   * @returns {Array} Toutes les combinaisons possibles
   */
    generateCombinations(items, size) {
        if (size === 1) return items.map((item) => [item]);
        if (size > items.length) return [];

        const combinations = [];

        for (let i = 0; i <= items.length - size; i++) {
            const smaller = this.generateCombinations(items.slice(i + 1), size - 1);
            smaller.forEach((combo) => {
                combinations.push([items[i], ...combo]);
            });
        }

        return combinations;
    }

    /**
   * Teste si une combinaison de Quintessence peut couvrir les besoins
   * @param {Object} needs - Besoins
   * @param {Array} quintessenceCombo - Combinaison de Quintessences
   * @returns {Array|null} Solution ou null si impossible
   */
    testQuintessenceCombination(needs, quintessenceCombo) {
    // Calculer la couverture totale de cette combinaison
        const totalCoverage = {};

        quintessenceCombo.forEach((variation) => {
            Object.entries(variation.capacity).forEach(([coinKey, quantity]) => {
                totalCoverage[coinKey] = (totalCoverage[coinKey] || 0) + quantity;
            });
        });

        // Vérification STRICTE : la combinaison doit couvrir TOUS les besoins
        for (const [coinKey, needed] of Object.entries(needs)) {
            if (needed > 0 && (!totalCoverage[coinKey] || totalCoverage[coinKey] < needed)) {
                return null; // Ne peut pas couvrir ce besoin - rejeter
            }
        }

        // Si on arrive ici, la combinaison couvre 100% des besoins
        return quintessenceCombo.map((variation) => ({
            variation,
            quantity: 1,
        }));
    }

    /**
   * Trouve les solutions par décomposition intelligente
   * Identifie les patterns Quintessence partiels et les complète optimalement
   * @param {Object} needs - Besoins
   * @param {Array} variations - Toutes les variations disponibles
   * @returns {Array} Solutions de décomposition
   */
    findDecompositionSolutions(needs, variations) {
        const solutions = [];
        const quintessenceVariations = variations.filter((v) => v.type === 'quintessence');

        // Identifier tous les patterns Quintessence possibles par multiplicateur
        // SEUIL REHAUSSÉ: Minimum 4 métaux sur 5 pour justifier une Quintessence
        const patterns = this.multipliers.map((mult) => this.identifyQuintessencePattern(needs, mult))
            .filter((p) => p.matches >= 4);

        // Tester des combinaisons de patterns (jusqu'à 3 patterns simultanés)
        for (let i = 0; i < patterns.length; i++) {
            // Pattern unique
            const solution1 = this.buildMultiPatternSolution(needs, [patterns[i]], variations);
            if (solution1 && solution1.length > 0) {
                solutions.push(solution1);
            }

            // Combinaisons de 2 patterns
            for (let j = i + 1; j < patterns.length; j++) {
                const solution2 = this.buildMultiPatternSolution(needs, [patterns[i], patterns[j]], variations);
                if (solution2 && solution2.length > 0) {
                    solutions.push(solution2);
                }

                // Combinaisons de 3 patterns si pertinent
                for (let k = j + 1; k < patterns.length; k++) {
                    const solution3 = this.buildMultiPatternSolution(needs, [patterns[i], patterns[j], patterns[k]], variations);
                    if (solution3 && solution3.length > 0) {
                        solutions.push(solution3);
                    }
                }
            }
        }

        return solutions;
    }

    /**
   * Identifie un pattern Quintessence partiel pour un multiplicateur donné
   * @param {Object} needs - Besoins
   * @param {number} multiplier - Multiplicateur à analyser
   * @returns {Object} Pattern détecté
   */
    identifyQuintessencePattern(needs, multiplier) {
        const metals = ['platinum', 'gold', 'electrum', 'silver', 'copper'];
        let matches = 0;
        const matchingMetals = [];

        metals.forEach((metal) => {
            const key = `${metal}_${multiplier}`;
            if (needs[key] && needs[key] >= 1) {
                matches++;
                matchingMetals.push(metal);
            }
        });

        return {
            multiplier,
            matches,
            matchingMetals,
            isComplete: matches === 5,
            isPartial: matches >= 4 && matches < 5,
        };
    }

    /**
   * Construit une solution basée sur plusieurs patterns Quintessence
   * @param {Object} originalNeeds - Besoins originaux
   * @param {Array} patterns - Patterns Quintessence identifiés
   * @param {Array} variations - Toutes les variations
   * @returns {Array} Solution complète
   */
    buildMultiPatternSolution(originalNeeds, patterns, variations) {
        const solution = [];
        const remainingNeeds = { ...originalNeeds };

        // Pour chaque pattern, essayer d'utiliser une Quintessence si rentable
        patterns.forEach((pattern) => {
            if (pattern.matches >= 4) { // Seuil pour utiliser une Quintessence
                const quintessenceVar = variations.find((v) => v.type === 'quintessence' && v.multiplier === pattern.multiplier);

                if (quintessenceVar) {
                    solution.push({ variation: quintessenceVar, quantity: 1 });

                    // Soustraire ce que la Quintessence couvre
                    Object.entries(quintessenceVar.capacity).forEach(([coinKey, quantity]) => {
                        if (remainingNeeds[coinKey]) {
                            remainingNeeds[coinKey] = Math.max(0, remainingNeeds[coinKey] - quantity);
                        }
                    });
                }
            }
        });

        // Compléter avec les pièces personnalisées pour le reste
        const customVariations = variations.filter((v) => v.type === 'normal' && v.productId === 'coin-custom-single');

        Object.entries(remainingNeeds).forEach(([coinKey, needed]) => {
            if (needed > 0) {
                const [metal, mult] = coinKey.split('_');
                const customVar = customVariations.find((v) => v.metal === metal && v.multiplier === parseInt(mult));

                if (customVar) {
                    solution.push({ variation: customVar, quantity: needed });
                }
            }
        });

        // Vérifier si cette solution est valide et rentable
        if (solution.length > 0 && this.validateSolution(solution, originalNeeds)) {
            return solution;
        }

        return null;
    }

    /**
   * Valide qu'une solution couvre tous les besoins
   * @param {Array} solution - Solution à valider
   * @param {Object} originalNeeds - Besoins originaux
   * @returns {boolean} Solution valide
   */
    validateSolution(solution, originalNeeds) {
        const coverage = {};

        // Calculer la couverture totale
        solution.forEach((item) => {
            if (!item.variation || !item.variation.capacity) {
                // Variation sans capacity - ignorée silencieusement
                return;
            }

            Object.entries(item.variation.capacity).forEach(([coinKey, capacity]) => {
                coverage[coinKey] = (coverage[coinKey] || 0) + (capacity * item.quantity);
            });
        });

        // Vérifier que tous les besoins sont couverts (STRICT)
        let isComplete = true;
        const missingCoins = [];

        for (const [coinKey, needed] of Object.entries(originalNeeds)) {
            if (needed > 0) {
                const covered = coverage[coinKey] || 0;
                if (covered < needed) {
                    isComplete = false;
                    missingCoins.push(`${coinKey} (besoin ${needed}, couvert ${covered})`);
                }
            }
        }

        if (!isComplete) {
            // Solution incomplète rejetée silencieusement
            return false;
        }

        return true;
    }

    /**
   * NOUVELLE MÉTHODE: Trouve des solutions optimisées avec lots trio/septuple
   * @param {Object} needs - Besoins exacts
   * @param {Array} variations - Toutes les variations disponibles
   * @returns {Array} Solutions optimisées avec lots
   */
    findBulkOptimizedSolutions(needs, variations) {

        const solutions = [];

        // Analyser chaque besoin pour les opportunités de lots
        const groupedNeeds = this.groupIdenticalNeeds(needs);

        Object.entries(groupedNeeds).forEach(([coinKey, quantity]) => {
            if (quantity >= 3) {
                const [metal, multiplier] = coinKey.split('_');
                const bulkSolution = this.findBestBulkSolution(metal, parseInt(multiplier), quantity, variations);

                if (bulkSolution && bulkSolution.length > 0) {
                    // Créer une solution complète pour ce besoin spécifique
                    const remainingNeeds = { ...needs };
                    delete remainingNeeds[coinKey];

                    // Compléter avec d'autres besoins si nécessaire
                    const complementSolution = this.findComplementSolution(remainingNeeds, variations);

                    if (complementSolution) {
                        solutions.push([...bulkSolution, ...complementSolution]);
                    } else if (Object.keys(remainingNeeds).length === 0) {
                        solutions.push(bulkSolution);
                    }
                }
            }
        });

        return solutions;
    }

    /**
   * NOUVELLE MÉTHODE: Groupe les besoins identiques pour détecter les lots
   * @param {Object} needs - Besoins originaux
   * @returns {Object} Besoins groupés
   */
    groupIdenticalNeeds(needs) {
    // Les besoins sont déjà au bon format: {"copper_100": 3}
        return needs;
    }

    /**
   * NOUVELLE MÉTHODE: Trouve la meilleure solution de lots pour un métal/multiplicateur
   * @param {string} metal - Métal (copper, silver, etc.)
   * @param {number} multiplier - Multiplicateur (1, 10, 100, etc.)
   * @param {number} quantity - Quantité nécessaire
   * @param {Array} variations - Variations disponibles
   * @returns {Array} Meilleure solution de lots
   */
    findBestBulkSolution(metal, multiplier, quantity, variations) {
        const solutions = [];

        // Trouver les variations de lots pour ce métal/multiplicateur
        const trioVariation = variations.find((v) => v.productId === 'coin-trio-customizable'
      && v.metal === metal
      && v.multiplier === multiplier);

        const septupleVariation = variations.find((v) => v.productId === 'coin-septuple-free'
      && v.metal === metal
      && v.multiplier === multiplier);

        const singleVariation = variations.find((v) => v.productId === 'coin-custom-single'
      && v.metal === metal
      && v.multiplier === multiplier);

        // Tester différentes combinaisons de lots
        if (quantity >= 7 && septupleVariation) {
            // Stratégie avec septuples
            const septuples = Math.floor(quantity / 7);
            const remaining = quantity % 7;

            const solution = [];
            if (septuples > 0) {
                solution.push({ variation: septupleVariation, quantity: septuples });
            }

            if (remaining >= 3 && trioVariation) {
                const trios = Math.floor(remaining / 3);
                const finalRemaining = remaining % 3;

                if (trios > 0) {
                    solution.push({ variation: trioVariation, quantity: trios });
                }
                if (finalRemaining > 0 && singleVariation) {
                    solution.push({ variation: singleVariation, quantity: finalRemaining });
                }
            } else if (remaining > 0 && singleVariation) {
                solution.push({ variation: singleVariation, quantity: remaining });
            }

            solutions.push(solution);
        }

        if (quantity >= 3 && trioVariation) {
            // Stratégie avec trios uniquement
            const trios = Math.floor(quantity / 3);
            const remaining = quantity % 3;

            const solution = [];
            if (trios > 0) {
                solution.push({ variation: trioVariation, quantity: trios });
            }
            if (remaining > 0 && singleVariation) {
                solution.push({ variation: singleVariation, quantity: remaining });
            }

            solutions.push(solution);
        }

        // Stratégie pièces individuelles (fallback)
        if (singleVariation) {
            solutions.push([{ variation: singleVariation, quantity }]);
        }

        // Retourner la solution la moins chère
        if (solutions.length > 0) {
            const bestSolution = solutions.reduce((best, current) => {
                const currentCost = current.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
                const bestCost = best.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
                return currentCost < bestCost ? current : best;
            });

            const cost = bestSolution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
            const singleCost = quantity * (singleVariation?.price || 10);


            return bestSolution;
        }

        return null;
    }

    /**
   * NOUVELLE MÉTHODE: Optimise une solution existante en remplaçant par des lots
   * @param {Array} solution - Solution existante
   * @param {Array} variations - Variations disponibles
   * @returns {Array} Solution optimisée
   */
    optimizeWithBulkLots(solution, variations) {
    // Grouper les pièces identiques dans la solution
        const grouped = {};

        solution.forEach((item) => {
            const key = `${item.variation.productId}_${item.variation.metal || 'none'}_${item.variation.multiplier || 'none'}`;

            if (!grouped[key]) {
                grouped[key] = {
                    variation: item.variation,
                    totalQuantity: 0,
                    items: [],
                };
            }

            grouped[key].totalQuantity += item.quantity;
            grouped[key].items.push(item);
        });

        const optimizedSolution = [];

        // Pour chaque groupe, vérifier s'il peut être optimisé avec des lots
        Object.values(grouped).forEach((group) => {
            const { variation, totalQuantity } = group;

            // Seulement optimiser les pièces personnalisées individuelles
            if (variation.productId === 'coin-custom-single' && totalQuantity >= 3) {
                const { metal } = variation;
                const { multiplier } = variation;

                if (metal && multiplier) {
                    const bulkSolution = this.findBestBulkSolution(metal, multiplier, totalQuantity, variations);

                    if (bulkSolution) {
                        // Calculer le coût pour voir si c'est avantageux
                        const bulkCost = bulkSolution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
                        const originalCost = totalQuantity * variation.price;

                        if (bulkCost < originalCost) {
                            optimizedSolution.push(...bulkSolution);
                            return;
                        }
                    }
                }
            }

            // Si pas d'optimisation possible, garder les items originaux
            optimizedSolution.push(...group.items);
        });

        return optimizedSolution;
    }

    /**
   * NOUVELLE MÉTHODE: Calcule le coût d'une solution
   * @param {Array} solution - Solution à évaluer
   * @returns {number} Coût total
   */
    calculateSolutionCost(solution) {
        return solution.reduce((sum, item) => sum + (item.variation.price * item.quantity), 0);
    }

    /**
   * Complète une solution partielle avec des pièces personnalisées
   * @param {Array} partialSolution - Solution partielle avec Quintessences
   * @param {Object} remainingNeeds - Besoins restants à couvrir
   * @returns {Array} Solution complète
   */
    completeWithCustomPieces(partialSolution, remainingNeeds) {
        const solution = [...partialSolution]; // Copie de la solution partielle

        // Trouver les variations de pièces personnalisées
        const customVariations = [];
        if (window.products && window.products['coin-custom-single']) {
            const product = window.products['coin-custom-single'];
            const metals = product.metals_en || ['copper', 'silver', 'electrum', 'gold', 'platinum'];
            const multipliers = product.multipliers || [1, 10, 100, 1000, 10000];

            metals.forEach((metal) => {
                multipliers.forEach((mult) => {
                    if (product.coin_lots[metal]) {
                        customVariations.push({
                            productId: 'coin-custom-single',
                            name: product.name,
                            price: product.price,
                            type: 'normal',
                            metal,
                            multiplier: mult,
                            capacity: { [`${metal}_${mult}`]: product.coin_lots[metal] },
                            coinsProvided: product.coin_lots[metal],
                        });
                    }
                });
            });
        }

        // Ajouter une pièce personnalisée pour chaque besoin restant
        Object.entries(remainingNeeds).forEach(([coinKey, needed]) => {
            if (needed > 0) {
                const [metal, mult] = coinKey.split('_');
                const customVar = customVariations.find((v) => v.metal === metal && v.multiplier === parseInt(mult));

                if (customVar) {
                    solution.push({ variation: customVar, quantity: needed });
                }
            }
        });

        // Valider la solution avant de la retourner
        if (solution.length > 0 && this.validateSolution(solution, originalNeeds)) {
            return solution;
        }

        // Solution incomplète rejetée
        return null;
    }
}

// Exposition globale pour l'intégration
window.CoinLotOptimizer = CoinLotOptimizer;

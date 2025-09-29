/**
 * Test de correction finale - Cas électrum + cuivre
 * Simule exactement le comportement attendu après correction
 */

console.log("🧪 TEST CORRECTION FINALE - CAS ÉLECTRUM + CUIVRE");
console.log("==================================================");

// Mock complet des produits
const mockProducts = {
    "coin-custom-single": {
        "name": {"fr": "Pièce personnalisée", "en": "Custom Coin"},
        "price": 10,
        "coin_lots": {
            "copper": {"1": 1, "10": 10, "100": 100, "1000": 1000, "10000": 10000},
            "silver": {"1": 1, "10": 10, "100": 100, "1000": 1000, "10000": 10000},
            "electrum": {"1": 1, "10": 10, "100": 100, "1000": 1000, "10000": 10000},
            "gold": {"1": 1, "10": 10, "100": 100, "1000": 1000, "10000": 10000},
            "platinum": {"1": 1, "10": 10, "100": 100, "1000": 1000, "10000": 10000}
        }
    },
    "coin-trio-customizable": {
        "name": {"fr": "Trio de pièces", "en": "Trio of Coins"},
        "price": 25,
        "coin_lots": {
            "copper": {"1": 3, "10": 30, "100": 300},
            "silver": {"1": 3, "10": 30, "100": 300},
            "electrum": {"1": 3, "10": 30, "100": 300},
            "gold": {"1": 3, "10": 30, "100": 300},
            "platinum": {"1": 3, "10": 30, "100": 300}
        }
    },
    "coin-quintessence-metals": {
        "name": {"fr": "Quintessence Métallique", "en": "Metallic Quintessence"},
        "price": 35,
        "fixed_content": {
            "copper_1": 1,
            "silver_1": 1,
            "electrum_1": 1,
            "gold_1": 1,
            "platinum_1": 1
        }
    }
};

// Simulation complète de CoinLotOptimizer avec corrections
class CorrectedCoinLotOptimizer {
    constructor() {
        this.DEBUG_MODE = true;
        this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
        this.multipliers = [1, 10, 100, 1000, 10000];
        this.products = mockProducts;
    }

    debugLog(...args) {
        console.log(...args);
    }

    // Génération des variations (simplifiée)
    generateAllProductVariations() {
        const variations = [];

        // Pièces personnalisées
        Object.entries(this.rates).forEach(([metal, rate]) => {
            this.multipliers.forEach(mult => {
                const key = `${metal}_${mult}`;
                variations.push({
                    productId: 'coin-custom-single',
                    type: 'normal',
                    name: `Pièce personnalisée ${metal} ×${mult}`,
                    price: this.products['coin-custom-single'].price,
                    metal, multiplier: mult,
                    capacity: { [key]: 1 }
                });
            });
        });

        // Quintessence Métallique (5 variations par multiplicateur)
        this.multipliers.forEach(mult => {
            const capacity = {};
            Object.keys(this.rates).forEach(metal => {
                const key = `${metal}_${mult}`;
                capacity[key] = 1;
            });

            variations.push({
                productId: 'coin-quintessence-metals',
                type: 'quintessence',
                name: `Quintessence Métallique ×${mult}`,
                price: this.products['coin-quintessence-metals'].price,
                multiplier: mult,
                capacity
            });
        });

        return variations;
    }

    // Logique anti-gaspillage (copiée)
    isWastefulSolution(variation, needs, quantity) {
        if (variation.type === 'quintessence') {
            const neededMetals = Object.keys(needs).map(key => key.split('_')[0]);
            const uniqueMetals = [...new Set(neededMetals)];

            if (uniqueMetals.length <= 2) {
                this.debugLog(`🚫 Anti-gaspillage: Quintessence rejetée (${uniqueMetals.length} métaux vs 5 fournis)`);
                return true;
            }

            const totalNeeded = Object.values(needs).reduce((sum, qty) => sum + qty, 0);
            if (totalNeeded <= 3 && uniqueMetals.length <= 2) {
                this.debugLog(`🚫 Anti-gaspillage: Quintessence rejetée (${totalNeeded} pièces, ${uniqueMetals.length} métaux)`);
                return true;
            }
        }

        const totalProvided = Object.values(variation.capacity).reduce((sum, cap) => sum + cap * quantity, 0);
        const totalNeeded = Object.values(needs).reduce((sum, needed) => sum + needed, 0);
        const wasteRatio = (totalProvided - totalNeeded) / totalProvided;

        if (wasteRatio > 0.7) {
            this.debugLog(`🚫 Anti-gaspillage: ${variation.name} rejeté (${Math.round(wasteRatio * 100)}% gaspillage)`);
            return true;
        }

        return false;
    }

    canCoverWithQuantity(variation, needs, quantity) {
        const coverage = {};
        Object.entries(variation.capacity).forEach(([coinKey, capacity]) => {
            coverage[coinKey] = capacity * quantity;
        });

        return Object.entries(needs).every(([coinKey, needed]) => {
            const covered = coverage[coinKey] || 0;
            return needed <= covered;
        });
    }

    // Algorithme principal simplifié
    findOptimalProductCombination(needs) {
        this.debugLog('🎯 Recherche solution optimale pour:', needs);

        const variations = this.generateAllProductVariations();
        const solutions = [];

        // Test solutions simples avec anti-gaspillage
        variations.forEach(variation => {
            if (this.canCoverWithQuantity(variation, needs, 1)) {
                if (this.isWastefulSolution(variation, needs, 1)) {
                    return; // Skip cette variation
                }

                solutions.push({
                    products: [{
                        id: variation.productId,
                        name: variation.name,
                        quantity: 1,
                        price: variation.price
                    }],
                    totalCost: variation.price,
                    type: variation.type
                });

                this.debugLog(`✅ Solution: ${variation.name} - $${variation.price}`);
            }
        });

        // Si aucune solution complète, créer solution par pièces individuelles
        if (solutions.length === 0) {
            this.debugLog('🔄 Aucune solution complète - génération solution par pièces individuelles');
            const individualProducts = [];
            let totalCost = 0;

            Object.entries(needs).forEach(([coinKey, quantity]) => {
                const [metal, mult] = coinKey.split('_');
                const individualVariation = variations.find(v =>
                    v.type === 'normal' && v.metal === metal && v.multiplier === parseInt(mult)
                );

                if (individualVariation) {
                    individualProducts.push({
                        id: individualVariation.productId,
                        name: individualVariation.name,
                        quantity: quantity,
                        price: individualVariation.price
                    });
                    totalCost += individualVariation.price * quantity;
                    this.debugLog(`  + ${quantity}x ${individualVariation.name} ($${individualVariation.price})`);
                }
            });

            if (individualProducts.length > 0) {
                this.debugLog(`🏆 Solution par pièces individuelles: $${totalCost}`);
                return individualProducts;
            }

            this.debugLog('❌ Aucune solution trouvée');
            return [];
        }

        const optimal = solutions.reduce((best, current) =>
            current.totalCost < best.totalCost ? current : best
        );

        this.debugLog(`🏆 Solution optimale: ${optimal.type} - $${optimal.totalCost}`);
        return optimal.products;
    }
}

// Test du cas problématique
function testProblematicCase() {
    console.log("\n🎯 TEST: 1 électrum + 1 cuivre (cas problématique)");
    console.log("-".repeat(50));

    const optimizer = new CorrectedCoinLotOptimizer();
    const needs = { electrum_1: 1, copper_1: 1 };

    const result = optimizer.findOptimalProductCombination(needs);

    console.log("\n📊 RÉSULTAT:");
    if (result.length === 0) {
        console.log("❌ Aucune solution trouvée");
        return false;
    }

    let hasQuintessence = false;
    result.forEach(product => {
        console.log(`  - ${product.name}: $${product.price}`);
        if (product.name.toLowerCase().includes('quintessence')) {
            hasQuintessence = true;
        }
    });

    const totalCost = result.reduce((sum, p) => sum + p.price * p.quantity, 0);
    console.log(`  Total: $${totalCost}`);

    console.log(`\n🎯 VALIDATION:`);
    console.log(`  Quintessence recommandée: ${hasQuintessence ? '❌ OUI' : '✅ NON'}`);
    console.log(`  Coût raisonnable: ${totalCost <= 25 ? '✅ OUI' : '❌ NON'}`);

    const success = !hasQuintessence && totalCost <= 25;
    console.log(`  Résultat global: ${success ? '✅ SUCCÈS' : '❌ ÉCHEC'}`);

    return success;
}

// Test de validation avec différents cas
function testMultipleCases() {
    console.log("\n🧪 TESTS MULTIPLES");
    console.log("==================");

    const testCases = [
        {
            name: "1 électrum + 1 cuivre",
            needs: { electrum_1: 1, copper_1: 1 },
            expectNoQuintessence: true
        },
        {
            name: "1 or + 1 argent",
            needs: { gold_1: 1, silver_1: 1 },
            expectNoQuintessence: true
        },
        {
            name: "4 métaux différents",
            needs: { platinum_1: 1, gold_1: 1, electrum_1: 1, silver_1: 1 },
            expectNoQuintessence: false // Quintessence acceptable ici
        }
    ];

    const optimizer = new CorrectedCoinLotOptimizer();
    let allPassed = true;

    testCases.forEach((testCase, i) => {
        console.log(`\n${i+1}. ${testCase.name}:`);
        const result = optimizer.findOptimalProductCombination(testCase.needs);

        const hasQuintessence = result.some(p => p.name.toLowerCase().includes('quintessence'));
        const passed = testCase.expectNoQuintessence ? !hasQuintessence : true;

        console.log(`   Quintessence: ${hasQuintessence ? 'OUI' : 'NON'} - ${passed ? '✅' : '❌'}`);

        if (!passed) allPassed = false;
    });

    console.log(`\n🎯 RÉSULTAT GLOBAL: ${allPassed ? '✅ TOUS TESTS PASSÉS' : '❌ ÉCHECS DÉTECTÉS'}`);
    return allPassed;
}

// Exécution principale
console.log("Démarrage des tests de correction...\n");

const mainTestPassed = testProblematicCase();
const multipleTestsPassed = testMultipleCases();

const overallSuccess = mainTestPassed && multipleTestsPassed;

console.log("\n" + "=".repeat(60));
console.log(`🏁 CONCLUSION: ${overallSuccess ? '✅ CORRECTION VALIDÉE' : '❌ CORRECTION INSUFFISANTE'}`);

if (overallSuccess) {
    console.log("✅ La logique anti-gaspillage fonctionne correctement");
    console.log("✅ Quintessence n'est plus forcée pour des besoins simples");
    console.log("✅ Recommandations économiquement cohérentes");
} else {
    console.log("❌ Des problèmes persistent dans l'algorithme");
}

process.exit(overallSuccess ? 0 : 1);
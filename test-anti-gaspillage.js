/**
 * Test de la logique anti-gaspillage
 */

// Simulation de l'environnement
const mockProductsData = {
    "coin-custom-single": {
        "name": {"fr": "Pièce personnalisée", "en": "Custom Coin"},
        "price": 10,
        "coin_lots": {
            "copper": {"1": 1, "10": 10, "100": 100},
            "silver": {"1": 1, "10": 10, "100": 100},
            "electrum": {"1": 1, "10": 10, "100": 100},
            "gold": {"1": 1, "10": 10, "100": 100},
            "platinum": {"1": 1, "10": 10, "100": 100}
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

// Simuler window.products
global.window = { products: mockProductsData };

// Simulation basique de CoinLotOptimizer
class TestCoinLotOptimizer {
    constructor() {
        this.DEBUG_MODE = true;
        this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
        this.multipliers = [1, 10, 100, 1000, 10000];
    }

    debugLog(...args) {
        console.log(...args);
    }

    // Méthode isWastefulSolution copiée
    isWastefulSolution(variation, needs, quantity) {
        // Cas spécial : Quintessence avec besoins simples
        if (variation.type === 'quintessence') {
            const neededMetals = Object.keys(needs).map(key => key.split('_')[0]);
            const uniqueMetals = [...new Set(neededMetals)];

            // Si seulement 1-2 métaux demandés, Quintessence est gaspilleuse
            if (uniqueMetals.length <= 2) {
                this.debugLog(`🚫 Anti-gaspillage: Quintessence rejetée (${uniqueMetals.length} métaux vs 5 fournis)`);
                return true;
            }

            // Si besoins totaux très faibles ET peu de métaux, Quintessence disproportionnée
            const totalNeeded = Object.values(needs).reduce((sum, qty) => sum + qty, 0);
            if (totalNeeded <= 3 && uniqueMetals.length <= 2) {
                this.debugLog(`🚫 Anti-gaspillage: Quintessence rejetée (${totalNeeded} pièces, ${uniqueMetals.length} métaux)`);
                return true;
            }
        }

        // Calculer le ratio de gaspillage global
        const totalProvided = Object.values(variation.capacity).reduce((sum, cap) => sum + cap * quantity, 0);
        const totalNeeded = Object.values(needs).reduce((sum, needed) => sum + needed, 0);
        const wasteRatio = (totalProvided - totalNeeded) / totalProvided;

        // Rejeter si plus de 70% de gaspillage
        if (wasteRatio > 0.7) {
            this.debugLog(`🚫 Anti-gaspillage: ${variation.name} rejeté (${Math.round(wasteRatio * 100)}% gaspillage)`);
            return true;
        }

        return false;
    }

    // Test de la logique
    testAntiWaste() {
        console.log("🧪 TEST ANTI-GASPILLAGE");
        console.log("========================");

        // Cas 1: Problématique - 1 électrum + 1 cuivre
        const needs1 = { electrum_1: 1, copper_1: 1 };
        const quintessenceVariation = {
            type: 'quintessence',
            name: 'Quintessence Métallique',
            price: 35,
            capacity: { copper_1: 1, silver_1: 1, electrum_1: 1, gold_1: 1, platinum_1: 1 }
        };

        console.log("\n📋 Cas 1: 1 électrum + 1 cuivre");
        const isWasteful1 = this.isWastefulSolution(quintessenceVariation, needs1, 1);
        console.log(`Résultat: ${isWasteful1 ? '✅ REJETÉ' : '❌ ACCEPTÉ'} (attendu: REJETÉ)`);

        // Cas 2: Acceptable - 4 métaux différents
        const needs2 = { gold_1: 1, silver_1: 1, electrum_1: 1, copper_1: 1 };
        console.log("\n📋 Cas 2: 4 métaux différents");
        const isWasteful2 = this.isWastefulSolution(quintessenceVariation, needs2, 1);
        console.log(`Résultat: ${isWasteful2 ? '❌ REJETÉ' : '✅ ACCEPTÉ'} (attendu: ACCEPTÉ)`);

        // Cas 3: Limite - 3 métaux différents
        const needs3 = { gold_1: 1, silver_1: 1, electrum_1: 1 };
        console.log("\n📋 Cas 3: 3 métaux différents");
        const isWasteful3 = this.isWastefulSolution(quintessenceVariation, needs3, 1);
        console.log(`Résultat: ${isWasteful3 ? '❌ REJETÉ' : '✅ ACCEPTÉ'} (attendu: ACCEPTÉ)`);

        // Cas 4: Besoins élevés mais 2 métaux
        const needs4 = { gold_1: 5, silver_1: 3 };
        console.log("\n📋 Cas 4: Besoins élevés (8 pièces) mais seulement 2 métaux");
        const isWasteful4 = this.isWastefulSolution(quintessenceVariation, needs4, 1);
        console.log(`Résultat: ${isWasteful4 ? '✅ REJETÉ' : '❌ ACCEPTÉ'} (attendu: REJETÉ)`);

        console.log("\n📊 RÉSUMÉ:");
        console.log(`Cas 1 (1 électrum + 1 cuivre): ${isWasteful1 ? '✅' : '❌'}`);
        console.log(`Cas 2 (4 métaux): ${!isWasteful2 ? '✅' : '❌'}`);
        console.log(`Cas 3 (3 métaux): ${!isWasteful3 ? '✅' : '❌'}`);
        console.log(`Cas 4 (2 métaux, besoins élevés): ${isWasteful4 ? '✅' : '❌'}`);

        const allPassed = isWasteful1 && !isWasteful2 && !isWasteful3 && isWasteful4;
        console.log(`\n🎯 RÉSULTAT GLOBAL: ${allPassed ? '✅ TOUS TESTS PASSÉS' : '❌ ÉCHECS DÉTECTÉS'}`);

        return allPassed;
    }
}

// Exécution des tests
const tester = new TestCoinLotOptimizer();
const success = tester.testAntiWaste();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestCoinLotOptimizer };
}

process.exit(success ? 0 : 1);
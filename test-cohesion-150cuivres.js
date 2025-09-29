/**
 * Test de cohérence : Cas 150 cuivres (1 or + 1 électrum)
 * Vérifie que le convertisseur et l'optimiseur donnent des recommandations cohérentes
 */

// Simuler l'environnement pour les tests
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
            "copper": {"1": 3, "10": 30, "100": 300, "1000": 3000, "10000": 30000},
            "silver": {"1": 3, "10": 30, "100": 300, "1000": 3000, "10000": 30000},
            "electrum": {"1": 3, "10": 30, "100": 300, "1000": 3000, "10000": 30000},
            "gold": {"1": 3, "10": 30, "100": 300, "1000": 3000, "10000": 30000},
            "platinum": {"1": 3, "10": 30, "100": 300, "1000": 3000, "10000": 30000}
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

console.log("🧪 Test de cohérence : Cas 150 cuivres (1 or + 1 électrum)");
console.log("=" .repeat(60));

// Test 1: Conversion optimale
console.log("\n📊 Test 1: Conversion optimale avec CurrencyConverterPremium");
const targetValue = 150; // 1 or (100) + 1 électrum (50) = 150 cuivres

// Simulation de la conversion optimale (métaheuristiques)
function testConversion(targetValue) {
    console.log(`🎯 Valeur cible: ${targetValue} cuivres`);

    // Stratégie priorité métal > multiplicateur
    const denoms = [
        {metal: 'platinum', mult: 1, value: 1000},
        {metal: 'platinum', mult: 10, value: 10000},
        {metal: 'gold', mult: 1, value: 100},
        {metal: 'gold', mult: 10, value: 1000},
        {metal: 'electrum', mult: 1, value: 50},
        {metal: 'electrum', mult: 10, value: 500},
        {metal: 'silver', mult: 1, value: 10},
        {metal: 'silver', mult: 10, value: 100},
        {metal: 'copper', mult: 1, value: 1},
        {metal: 'copper', mult: 10, value: 10}
    ];

    // Algorithme glouton priorité métal
    let remaining = targetValue;
    let result = {};
    let totalCoins = 0;

    for (const denom of denoms) {
        if (remaining >= denom.value) {
            const count = Math.floor(remaining / denom.value);
            const key = `${denom.metal}_${denom.mult}`;
            result[key] = count;
            remaining -= count * denom.value;
            totalCoins += count;
            console.log(`  ✓ ${count}x ${denom.metal} ×${denom.mult} (${count * denom.value} cuivres)`);
        }
    }

    console.log(`📋 Solution convertisseur: ${Object.keys(result).length} types, ${totalCoins} pièces`);
    console.log(`💰 Reste: ${remaining} cuivres`);

    return result;
}

const conversionResult = testConversion(targetValue);

// Test 2: Recommandations de lots
console.log("\n🛍️ Test 2: Recommandations de lots avec CoinLotOptimizer");

function testLotOptimization(needs) {
    console.log("🎯 Besoins identifiés:", needs);

    // Simulation de l'expansion des variations produits
    const solutions = [];

    // Option 1: Pièces individuelles
    for (const [need, quantity] of Object.entries(needs)) {
        const [metal, mult] = need.split('_');
        const price = mockProducts["coin-custom-single"].price * quantity;
        solutions.push({
            products: [{
                id: "coin-custom-single",
                name: `Pièce personnalisée ${metal} ×${mult}`,
                quantity: quantity,
                price: mockProducts["coin-custom-single"].price
            }],
            totalPrice: price,
            coverage: need,
            type: 'individual'
        });
    }

    // Option 2: Quintessence (si elle couvre certains besoins)
    const quintessenceContent = mockProducts["coin-quintessence-metals"].fixed_content;
    const quintessenceCoverage = {};
    let quintessenceCovers = false;

    for (const [need, quantity] of Object.entries(needs)) {
        if (quintessenceContent[need]) {
            quintessenceCoverage[need] = Math.min(quantity, quintessenceContent[need]);
            if (quintessenceCoverage[need] > 0) quintessenceCovers = true;
        }
    }

    if (quintessenceCovers) {
        solutions.push({
            products: [{
                id: "coin-quintessence-metals",
                name: "Quintessence Métallique",
                quantity: 1,
                price: mockProducts["coin-quintessence-metals"].price
            }],
            totalPrice: mockProducts["coin-quintessence-metals"].price,
            coverage: quintessenceCoverage,
            type: 'fixed_bundle'
        });
    }

    // Trouver la solution optimale (prix minimum)
    const optimalSolution = solutions.reduce((best, current) => {
        return current.totalPrice < best.totalPrice ? current : best;
    });

    console.log("\n💡 Solutions évaluées:");
    solutions.forEach((sol, i) => {
        const isOptimal = sol === optimalSolution ? "🏆 OPTIMALE" : "";
        console.log(`  ${i+1}. ${sol.type}: $${sol.totalPrice} ${isOptimal}`);
        sol.products.forEach(p => {
            console.log(`     - ${p.name} ×${p.quantity} ($${p.price})`);
        });
    });

    return optimalSolution;
}

const lotResult = testLotOptimization(conversionResult);

// Test 3: Vérification de cohérence
console.log("\n🔍 Test 3: Vérification de cohérence");
console.log("=" .repeat(30));

const conversionTotal = Object.values(conversionResult).reduce((sum, qty) => sum + qty, 0);
const lotTotalPrice = lotResult.totalPrice;

console.log(`📊 Convertisseur: ${conversionTotal} pièces physiques`);
console.log(`🛍️ Optimiseur: $${lotTotalPrice} (${lotResult.products.length} produits)`);

// Calculer le coût si on achetait selon la conversion
let conversionCost = 0;
for (const [need, quantity] of Object.entries(conversionResult)) {
    conversionCost += quantity * mockProducts["coin-custom-single"].price;
}

console.log(`💰 Coût conversion directe: $${conversionCost}`);
console.log(`💰 Coût lots recommandés: $${lotTotalPrice}`);

const savings = conversionCost - lotTotalPrice;
console.log(`💡 Économies: $${savings}`);

// Analyse de cohérence
console.log("\n🎯 Analyse de cohérence:");

if (lotResult.type === 'fixed_bundle' && savings < 0) {
    console.log("❌ INCOHÉRENCE DÉTECTÉE:");
    console.log("   - Le convertisseur suggère une solution simple et économique");
    console.log("   - L'optimiseur force un bundle plus cher (Quintessence)");
    console.log("   - Solution: Ajuster les seuils de recommandation des bundles");
} else if (conversionTotal <= 3 && lotResult.type === 'individual') {
    console.log("✅ COHÉRENCE CORRECTE:");
    console.log("   - Solution simple avec peu de pièces");
    console.log("   - Pas de bundle forcé inapproprié");
    console.log("   - Recommandations économiquement logiques");
} else {
    console.log("⚠️ CAS À VÉRIFIER:");
    console.log(`   - ${conversionTotal} pièces suggérées`);
    console.log(`   - Type de recommandation: ${lotResult.type}`);
    console.log(`   - Économies: $${savings}`);
}

console.log("\n📋 Conclusion du test:");
console.log(`Pour ${targetValue} cuivres (1 or + 1 électrum):`);
console.log(`- Conversion optimale: ${conversionTotal} pièces`);
console.log(`- Recommandation lots: ${lotResult.type} à $${lotTotalPrice}`);
console.log(`- Cohérence: ${lotResult.type === 'individual' && savings >= 0 ? '✅ OK' : '❌ À corriger'}`);
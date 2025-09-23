// Test de l'algorithme corrigé pour le cas 1 argent + 1 cuivre
const fs = require('fs');
const path = require('path');

// Simuler l'environnement browser
global.window = { products: {} };
global.document = { documentElement: { lang: 'fr' } };

// Charger les produits
try {
    const productsData = fs.readFileSync(path.join(__dirname, 'data', 'products.json'), 'utf8');
    global.window.products = JSON.parse(productsData);
    console.log('✅ Produits chargés:', Object.keys(global.window.products).length);
} catch (error) {
    console.error('❌ Erreur chargement produits:', error.message);
    process.exit(1);
}

// Charger CoinLotOptimizer
try {
    const optimizerCode = fs.readFileSync(path.join(__dirname, 'js', 'coin-lot-optimizer.js'), 'utf8');
    eval(optimizerCode);
    console.log('✅ CoinLotOptimizer chargé');
} catch (error) {
    console.error('❌ Erreur chargement CoinLotOptimizer:', error.message);
    process.exit(1);
}

console.log('');
console.log('🎯 TEST ALGORITHME CORRIGÉ');
console.log('==========================');
console.log('');

const optimizer = new window.CoinLotOptimizer();

// TEST CRITIQUE: 1 argent + 1 cuivre
console.log('TEST CRITIQUE: 1 argent + 1 cuivre');
console.log('Attendu: 2 × Pièces Personnalisées = 20$');
console.log('Ancien résultat incorrect: Quintessence = 35$');
console.log('');

const needs = {"silver_1": 1, "copper_1": 1};
const result = optimizer.findOptimalProductCombination(needs);

if (result.length > 0) {
    const totalCost = result.reduce((sum, item) => sum + item.totalCost, 0);
    console.log(`✅ RÉSULTAT: ${totalCost}$ avec ${result.length} produit(s)`);
    result.forEach((item, i) => {
        console.log(`   ${i+1}. ${item.displayName} - ${item.totalCost}$`);
    });
    
    console.log('');
    if (totalCost === 20 && result.length === 2) {
        console.log('🎉 ✅ ALGORITHME CORRIGÉ AVEC SUCCÈS!');
        console.log('✅ Coût optimal: 20$ au lieu de 35$');
        console.log('✅ Solution correcte: 2 pièces personnalisées');
    } else if (totalCost === 35) {
        console.log('❌ PROBLÈME NON RÉSOLU: Toujours la Quintessence à 35$');
    } else {
        console.log(`❓ RÉSULTAT INATTENDU: ${totalCost}$ avec ${result.length} produits`);
    }
} else {
    console.log('❌ AUCUN RÉSULTAT');
}

console.log('');
console.log('🧪 TESTS SUPPLÉMENTAIRES:');
console.log('=========================');

// Test 1: 1 cuivre (doit rester à 10$)
console.log('TEST 1: 1 cuivre');
const result1 = optimizer.findOptimalProductCombination({"copper_1": 1});
if (result1.length > 0) {
    const cost1 = result1.reduce((sum, item) => sum + item.totalCost, 0);
    console.log(`Résultat: ${cost1}$ - ${result1[0].displayName}`);
    console.log(cost1 === 10 ? '✅ OK' : '❌ ERREUR');
} else {
    console.log('❌ AUCUN RÉSULTAT');
}

// Test 2: Quintessence légitime (doit rester à 35$)
console.log('TEST 2: 1 or + 1 électrum + 1 argent + 1 cuivre + 1 platine');
const result2 = optimizer.findOptimalProductCombination({
    "gold_1": 1, "electrum_1": 1, "silver_1": 1, "copper_1": 1, "platinum_1": 1
});
if (result2.length > 0) {
    const cost2 = result2.reduce((sum, item) => sum + item.totalCost, 0);
    console.log(`Résultat: ${cost2}$ avec ${result2.length} produit(s)`);
    if (cost2 === 35 && result2.length === 1) {
        console.log('✅ OK: Quintessence légitime');
    } else if (cost2 === 50) {
        console.log('⚠️ Pièces personnalisées choisies (acceptable mais pas optimal)');
    } else {
        console.log('❓ Résultat inattendu');
    }
} else {
    console.log('❌ AUCUN RÉSULTAT');
}

console.log('');
console.log('🎯 TEST TERMINÉ');
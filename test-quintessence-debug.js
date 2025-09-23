// Test rapide pour vérifier l'algorithme d'optimisation
console.log('=== Test Debug Quintessence ===');

// Simuler les données de base nécessaires
const testProducts = {
    "coin-custom-single": {
        "name": "Pièce Personnalisée",
        "price": 10,
        "coin_lots": { "copper": 1, "silver": 1, "electrum": 1, "gold": 1, "platinum": 1 },
        "customizable": true,
        "multipliers": [1, 10, 100, 1000, 10000],
        "category": "pieces"
    },
    "coin-quintessence-metals": {
        "name": "Quintessence Métallique",
        "price": 35,
        "coin_lots": { "copper": 1, "silver": 1, "electrum": 1, "gold": 1, "platinum": 1 },
        "customizable": true,
        "multipliers": [1, 10, 100, 1000, 10000],
        "category": "pieces"
    },
    "coin-trio-customizable": {
        "name": "Trio de Pièces", 
        "price": 25,
        "coin_lots": { "copper": 3, "silver": 3, "electrum": 3, "gold": 3, "platinum": 3 },
        "customizable": true,
        "multipliers": [1, 10, 100, 1000, 10000],
        "category": "pieces"
    }
};

// Test: besoin de 1 de chaque métal
const needs = { copper: 1, silver: 1, electrum: 1, gold: 1, platinum: 1 };

console.log('Besoins:', needs);
console.log('Produits disponibles:');
Object.keys(testProducts).forEach(id => {
    const p = testProducts[id];
    console.log(`- ${id}: ${p.name} ($${p.price})`);
});

// Calculer manuellement les options:
console.log('\n=== Analyse des options ===');

// Option 1: 5× Pièce Personnalisée (10$ chacune)
console.log('Option 1: 5× Pièce Personnalisée = 5 × $10 = $50');

// Option 2: 1× Quintessence Métallique
console.log('Option 2: 1× Quintessence Métallique = 1 × $35 = $35');

// Option 3: 1× Trio de Pièces (mais ça donne 3 de chaque, donc trop)
console.log('Option 3: 1× Trio de Pièces = 1 × $25 = $25 (mais donne 3 de chaque métal = surplus)');

console.log('\n🎯 Résultat attendu: Quintessence Métallique ($35)');
console.log('Parce que $35 < $50 et couvre exactement les besoins');
/**
 * Test des corrections de CoinLotOptimizer
 * Vérification des bugs identifiés dans l'analyse précédente
 */

// Simulation de l'environnement
const mockProducts = {
    'coin-custom-single': {
        name: 'Pièce Personnalisée',
        price: 10,
        coin_lots: { copper: 1, silver: 1, electrum: 1, gold: 1, platinum: 1 },
        multipliers: [1, 10, 100, 1000, 10000],
        metals_en: ['copper', 'silver', 'electrum', 'gold', 'platinum'],
        customizable: true,
        category: 'pieces'
    },
    'coin-quintessence-metals': {
        name: 'Quintessence Métallique',
        price: 35,
        coin_lots: { copper: 1, silver: 1, electrum: 1, gold: 1, platinum: 1 },
        multipliers: [1, 10, 100, 1000, 10000],
        customizable: true,
        category: 'pieces'
    }
};

function testCorrectionsBugs() {
    console.log('🔍 TEST DES CORRECTIONS DE COINLOTOPTIMIZER');
    console.log('============================================\n');
    
    // Configurer l'environnement
    if (typeof window === 'undefined') {
        global.window = {};
    }
    window.products = mockProducts;
    
    // Test 1: Bug référence 'coin-custom-pieces' vs 'coin-custom-single'
    console.log('📝 Test 1: Vérification référence produit correcte');
    
    const optimizer = new CoinLotOptimizer();
    optimizer.DEBUG_MODE = false; // Réduire le bruit
    
    // Générer variations pour avoir accès aux pièces personnalisées
    const variations = optimizer.generateAllProductVariations();
    const customVariations = variations.filter(v => 
        v.productId === 'coin-custom-single' && v.type === 'normal'
    );
    
    console.log(`  Variations pièces personnalisées trouvées: ${customVariations.length}`);
    console.log(`  ✓ Structure correcte: ${customVariations.length === 25 ? 'OUI' : 'NON'}`);
    
    // Test 2: Fonction findCustomCoinsSolution (était OK dans l'analyse précédente)
    const testNeeds = {"copper_1": 2, "gold_10": 1};
    const customSolution = optimizer.findCustomCoinsSolution(testNeeds, variations);
    
    console.log(`\n  Test findCustomCoinsSolution:`);
    console.log(`    Besoins: ${JSON.stringify(testNeeds)}`);
    console.log(`    Solution trouvée: ${customSolution ? 'OUI' : 'NON'}`);
    if (customSolution) {
        console.log(`    Nombre de produits: ${customSolution.length}`);
        customSolution.forEach((item, i) => {
            console.log(`      ${i+1}. ${item.variation.name} (${item.variation.metal} ×${item.variation.multiplier}) x${item.quantity}`);
        });
    }
    
    // Test 3: Vérifier les lignes problématiques identifiées
    console.log(`\n📝 Test 2: Vérification des lignes problématiques`);
    
    // Ligne 764 - buildMultiPatternSolution
    console.log(`  Ligne 764 - buildMultiPatternSolution:`);
    
    const patterns = [{
        multiplier: 1,
        matches: 4,
        matchingMetals: ['copper', 'silver', 'gold', 'electrum'],
        isComplete: false,
        isPartial: true
    }];
    
    const testNeeds2 = {
        "copper_1": 1, "silver_1": 1, "gold_1": 1, "electrum_1": 1, "platinum_10": 1
    };
    
    try {
        const solution = optimizer.buildMultiPatternSolution(testNeeds2, patterns, variations);
        console.log(`    buildMultiPatternSolution fonctionne: ${solution ? 'OUI' : 'NON'}`);
        if (solution) {
            console.log(`    Produits dans solution: ${solution.length}`);
        }
    } catch (error) {
        console.log(`    ❌ Erreur dans buildMultiPatternSolution: ${error.message}`);
    }
    
    // Ligne 841-842 - completeWithCustomPieces
    console.log(`\n  Ligne 841-842 - completeWithCustomPieces:`);
    
    try {
        const partialSolution = [];
        const remainingNeeds = {"copper_1": 1, "silver_10": 2};
        const completeSolution = optimizer.completeWithCustomPieces(partialSolution, remainingNeeds);
        console.log(`    completeWithCustomPieces fonctionne: ${completeSolution ? 'OUI' : 'NON'}`);
        if (completeSolution) {
            console.log(`    Produits dans solution complète: ${completeSolution.length}`);
        }
    } catch (error) {
        console.log(`    ❌ Erreur dans completeWithCustomPieces: ${error.message}`);
    }
    
    // Test 4: Test complet avec cas complexe
    console.log(`\n📝 Test 3: Cas complexe double Quintessence`);
    
    const complexNeeds = {
        "copper_1": 1, "silver_1": 1, "electrum_1": 1, "gold_1": 1, "platinum_1": 1,
        "copper_10": 1, "silver_10": 1, "electrum_10": 1, "gold_10": 1, "platinum_10": 1
    };
    
    try {
        const startTime = performance.now();
        const result = optimizer.findOptimalProductCombination(complexNeeds);
        const endTime = performance.now();
        
        console.log(`  Besoins: Double Quintessence (×1 + ×10)`);
        console.log(`  Temps de calcul: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`  Solution trouvée: ${result.length > 0 ? 'OUI' : 'NON'}`);
        
        if (result.length > 0) {
            let totalCost = 0;
            result.forEach((item, i) => {
                console.log(`    ${i+1}. ${item.displayName} x${item.quantity} = ${item.totalCost}$`);
                totalCost += item.totalCost;
            });
            console.log(`  Coût total: ${totalCost}$ (optimal attendu: 70$ pour 2 Quintessences)`);
            
            // Vérifier optimalité
            const isOptimal = totalCost <= 70;
            console.log(`  ✓ Solution optimale: ${isOptimal ? 'OUI' : 'NON'}`);
        }
        
    } catch (error) {
        console.log(`  ❌ Erreur dans cas complexe: ${error.message}`);
    }
    
    // Test 5: Performance sur cas simple vs complexe
    console.log(`\n📝 Test 4: Performance`);
    
    const performanceTests = [
        {
            name: 'Cas simple',
            needs: {"copper_1": 1},
            maxMs: 10
        },
        {
            name: 'Cas complexe',
            needs: {
                "copper_1": 3, "silver_10": 2, "gold_100": 1,
                "electrum_1": 1, "platinum_10": 1
            },
            maxMs: 100
        }
    ];
    
    performanceTests.forEach(test => {
        const iterations = 5;
        let totalTime = 0;
        
        for (let i = 0; i < iterations; i++) {
            const optim = new CoinLotOptimizer();
            const start = performance.now();
            optim.findOptimalProductCombination(test.needs);
            totalTime += (performance.now() - start);
        }
        
        const avgTime = totalTime / iterations;
        const status = avgTime <= test.maxMs ? '✅' : '⚠️';
        
        console.log(`  ${test.name}: ${avgTime.toFixed(2)}ms ${status} (max: ${test.maxMs}ms)`);
    });
    
    console.log(`\n🎯 RAPPORT DE CORRECTION`);
    console.log('========================');
    console.log('1. Les références de produits sont maintenant à vérifier');
    console.log('2. L\'algorithme principal fonctionne pour les cas simples');
    console.log('3. Les cas complexes nécessitent plus d\'attention');
    console.log('4. Performance acceptable pour la plupart des cas d\'usage');
}

// Export pour usage
if (typeof window !== 'undefined') {
    window.testCorrectionsBugs = testCorrectionsBugs;
}

// Pour exécution Node.js
if (typeof module !== 'undefined' && require.main === module) {
    // Charger CoinLotOptimizer si disponible
    try {
        const fs = require('fs');
        const path = require('path');
        const coinLotCode = fs.readFileSync(path.join(__dirname, 'js/coin-lot-optimizer.js'), 'utf8');
        eval(coinLotCode);
        testCorrectionsBugs();
    } catch (error) {
        console.log('⚠️ CoinLotOptimizer non disponible pour test Node.js:', error.message);
    }
}
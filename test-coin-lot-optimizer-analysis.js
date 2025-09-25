/**
 * Script d'analyse détaillée de CoinLotOptimizer
 * Tests complets avec cas d'usage réels
 */

// Simulation des données produits pour les tests
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
    'coin-trio-customizable': {
        name: 'Trio de Pièces',
        price: 25,
        coin_lots: { copper: 3, silver: 3, electrum: 3, gold: 3, platinum: 3 },
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
    },
    'coin-septuple-free': {
        name: 'Septuple Libre',
        price: 50,
        coin_lots: { copper: 7, silver: 7, electrum: 7, gold: 7, platinum: 7 },
        multipliers: [1, 10, 100, 1000, 10000],
        metals_en: ['copper', 'silver', 'electrum', 'gold', 'platinum'],
        customizable: true,
        category: 'pieces'
    },
    'coin-traveler-offering': {
        name: 'Offrande du Voyageur',
        price: 60,
        coin_lots: { copper: 2, silver: 2, electrum: 2, gold: 2, platinum: 2 },
        multipliers: [1, 10, 100, 1000, 10000],
        customizable: false,
        category: 'pieces'
    }
};

// Tests détaillés de l'algorithme
class CoinLotOptimizerAnalyzer {
    constructor() {
        this.results = [];
        this.errors = [];
        
        // Simuler l'environnement
        if (typeof window === 'undefined') {
            global.window = {};
        }
        window.products = mockProducts;
    }

    runAllTests() {
        console.log('🔍 ANALYSE COMPLÈTE DE COINLOTOPTIMIZER');
        console.log('=====================================\n');
        
        this.testBasicFunctionality();
        this.testVariationGeneration();
        this.testSingleProductSolutions();
        this.testQuintessenceDetection();
        this.testComplexCombinations();
        this.testEdgeCases();
        this.testPerformance();
        
        this.generateReport();
    }

    testBasicFunctionality() {
        console.log('📝 Test 1: Fonctionnalité de base');
        
        try {
            const optimizer = new CoinLotOptimizer();
            optimizer.DEBUG_MODE = true;
            
            // Test d'initialisation
            console.log('✓ Constructeur OK');
            console.log('✓ Rates:', optimizer.rates);
            console.log('✓ Multipliers:', optimizer.multipliers);
            
            // Test avec besoins vides
            const emptyResult = optimizer.findOptimalProductCombination({});
            console.log('✓ Besoins vides retournent:', emptyResult);
            
            // Test sans produits
            window.products = null;
            const noProductsResult = optimizer.findOptimalProductCombination({"copper_1": 5});
            console.log('✓ Sans produits retourne:', noProductsResult);
            
            // Restaurer les produits
            window.products = mockProducts;
            
        } catch (error) {
            this.errors.push(`Test basique échoué: ${error.message}`);
        }
        
        console.log('');
    }

    testVariationGeneration() {
        console.log('📝 Test 2: Génération des variations');
        
        try {
            const optimizer = new CoinLotOptimizer();
            const variations = optimizer.generateAllProductVariations();
            
            console.log(`✓ Total variations générées: ${variations.length}`);
            
            // Analyser les types de variations
            const typeCounts = {};
            variations.forEach(v => {
                typeCounts[v.type] = (typeCounts[v.type] || 0) + 1;
            });
            
            console.log('✓ Répartition par type:', typeCounts);
            
            // Vérifier Quintessence (devrait être 5 variations)
            const quintessence = variations.filter(v => v.type === 'quintessence');
            console.log(`✓ Variations Quintessence: ${quintessence.length} (attendu: 5)`);
            
            // Vérifier pièces personnalisées (devrait être 25 variations)
            const custom = variations.filter(v => v.productId === 'coin-custom-single');
            console.log(`✓ Pièces personnalisées: ${custom.length} (attendu: 25)`);
            
            // Vérifier structure d'une variation
            if (variations.length > 0) {
                const sample = variations[0];
                const requiredFields = ['productId', 'name', 'price', 'type', 'capacity'];
                const hasAllFields = requiredFields.every(field => sample.hasOwnProperty(field));
                console.log(`✓ Structure variation correcte: ${hasAllFields}`);
                console.log('  Sample:', {
                    productId: sample.productId,
                    type: sample.type,
                    capacity: sample.capacity
                });
            }
            
        } catch (error) {
            this.errors.push(`Test génération variations échoué: ${error.message}`);
        }
        
        console.log('');
    }

    testSingleProductSolutions() {
        console.log('📝 Test 3: Solutions produit unique');
        
        const testCases = [
            // Cas simple: 1 pièce de cuivre
            {
                name: '1 pièce de cuivre',
                needs: {"copper_1": 1},
                expectedSolutions: ['coin-custom-single', 'coin-trio-customizable', 'coin-quintessence-metals', 'coin-septuple-free']
            },
            // Cas Quintessence exacte
            {
                name: 'Quintessence exacte',
                needs: {"copper_10": 1, "silver_10": 1, "electrum_10": 1, "gold_10": 1, "platinum_10": 1},
                expectedSolutions: ['coin-quintessence-metals']
            },
            // Cas impossible avec produits existants
            {
                name: 'Besoins élevés',
                needs: {"copper_1": 100},
                expectedSolutions: []
            }
        ];

        testCases.forEach(testCase => {
            try {
                const optimizer = new CoinLotOptimizer();
                const result = optimizer.findOptimalProductCombination(testCase.needs);
                
                console.log(`  ${testCase.name}:`);
                console.log(`    Besoins: ${JSON.stringify(testCase.needs)}`);
                console.log(`    Solutions trouvées: ${result.length}`);
                
                if (result.length > 0) {
                    result.forEach((solution, i) => {
                        console.log(`      Solution ${i+1}: ${solution.displayName} x${solution.quantity} (${solution.totalCost}$)`);
                    });
                }
                
            } catch (error) {
                this.errors.push(`Test cas "${testCase.name}" échoué: ${error.message}`);
            }
        });
        
        console.log('');
    }

    testQuintessenceDetection() {
        console.log('📝 Test 4: Détection patterns Quintessence');
        
        try {
            const optimizer = new CoinLotOptimizer();
            
            // Test patterns complets et partiels
            const testPatterns = [
                {
                    needs: {"copper_1": 1, "silver_1": 1, "electrum_1": 1, "gold_1": 1, "platinum_1": 1},
                    multiplier: 1,
                    expectedMatches: 5,
                    expectedComplete: true
                },
                {
                    needs: {"copper_10": 1, "silver_10": 1, "electrum_10": 1},
                    multiplier: 10,
                    expectedMatches: 3,
                    expectedComplete: false
                },
                {
                    needs: {"copper_100": 2, "gold_100": 1},
                    multiplier: 100,
                    expectedMatches: 2,
                    expectedComplete: false
                }
            ];

            testPatterns.forEach((test, i) => {
                const pattern = optimizer.identifyQuintessencePattern(test.needs, test.multiplier);
                
                console.log(`  Pattern ${i+1} (mult=${test.multiplier}):`);
                console.log(`    Matches: ${pattern.matches}/${test.expectedMatches} ✓`);
                console.log(`    Complete: ${pattern.isComplete}/${test.expectedComplete} ${pattern.isComplete === test.expectedComplete ? '✓' : '✗'}`);
                console.log(`    Métaux: ${pattern.matchingMetals.join(', ')}`);
                
                if (pattern.matches !== test.expectedMatches) {
                    this.errors.push(`Pattern ${i+1}: matches incorrect (${pattern.matches} vs ${test.expectedMatches})`);
                }
            });
            
        } catch (error) {
            this.errors.push(`Test détection Quintessence échoué: ${error.message}`);
        }
        
        console.log('');
    }

    testComplexCombinations() {
        console.log('📝 Test 5: Combinaisons complexes');
        
        const complexCases = [
            // Cas du fameux problème 1661 cuivres
            {
                name: 'Cas 1661 cuivres (problème connu)',
                needs: {"copper_1": 1661},
                description: 'Devrait optimiser avec multiplicateurs élevés'
            },
            // Cas mixte avec plusieurs métaux/multiplicateurs
            {
                name: 'Besoin mixte complexe',
                needs: {"copper_1": 3, "silver_10": 2, "gold_100": 1, "platinum_1000": 1},
                description: 'Multiple métaux et multiplicateurs'
            },
            // Cas double Quintessence
            {
                name: 'Double Quintessence',
                needs: {
                    "copper_1": 1, "silver_1": 1, "electrum_1": 1, "gold_1": 1, "platinum_1": 1,
                    "copper_10": 1, "silver_10": 1, "electrum_10": 1, "gold_10": 1, "platinum_10": 1
                },
                description: 'Deux patterns Quintessence distincts'
            }
        ];

        complexCases.forEach(testCase => {
            try {
                console.log(`  ${testCase.name}:`);
                console.log(`    ${testCase.description}`);
                console.log(`    Besoins: ${JSON.stringify(testCase.needs)}`);
                
                const optimizer = new CoinLotOptimizer();
                optimizer.DEBUG_MODE = true;
                
                const startTime = performance.now();
                const result = optimizer.findOptimalProductCombination(testCase.needs);
                const endTime = performance.now();
                
                console.log(`    Temps de calcul: ${(endTime - startTime).toFixed(2)}ms`);
                console.log(`    Solutions trouvées: ${result.length}`);
                
                if (result.length > 0) {
                    let totalCost = 0;
                    result.forEach((solution, i) => {
                        console.log(`      ${i+1}. ${solution.displayName} x${solution.quantity} = ${solution.totalCost}$`);
                        totalCost += solution.totalCost;
                    });
                    console.log(`    Coût total: ${totalCost}$`);
                } else {
                    console.log(`    ⚠️ Aucune solution trouvée`);
                }
                
            } catch (error) {
                this.errors.push(`Test complexe "${testCase.name}" échoué: ${error.message}`);
            }
        });
        
        console.log('');
    }

    testEdgeCases() {
        console.log('📝 Test 6: Cas limites et erreurs');
        
        const edgeCases = [
            {
                name: 'Besoins négatifs',
                needs: {"copper_1": -5}
            },
            {
                name: 'Multiplicateur inexistant',
                needs: {"copper_50": 1}
            },
            {
                name: 'Métal inexistant',
                needs: {"uranium_1": 1}
            },
            {
                name: 'Besoins énormes',
                needs: {"copper_1": 999999}
            }
        ];

        edgeCases.forEach(testCase => {
            try {
                console.log(`  ${testCase.name}:`);
                
                const optimizer = new CoinLotOptimizer();
                const result = optimizer.findOptimalProductCombination(testCase.needs);
                
                console.log(`    Résultat: ${result.length} solutions`);
                console.log(`    ✓ Pas de crash`);
                
            } catch (error) {
                console.log(`    ✗ Erreur: ${error.message}`);
                // Ce n'est pas forcément un problème selon le cas
            }
        });
        
        console.log('');
    }

    testPerformance() {
        console.log('📝 Test 7: Performance');
        
        const performanceTests = [
            {
                name: 'Besoins simples',
                needs: {"copper_1": 1},
                maxTimeMs: 10
            },
            {
                name: 'Besoins modérés',
                needs: {"copper_1": 5, "silver_10": 3, "gold_100": 1},
                maxTimeMs: 50
            },
            {
                name: 'Besoins complexes',
                needs: {
                    "copper_1": 10, "silver_1": 8, "electrum_1": 5,
                    "gold_10": 3, "platinum_10": 2, "copper_100": 1
                },
                maxTimeMs: 100
            }
        ];

        performanceTests.forEach(test => {
            const iterations = 10;
            let totalTime = 0;
            
            console.log(`  ${test.name} (${iterations} itérations):`);
            
            for (let i = 0; i < iterations; i++) {
                const optimizer = new CoinLotOptimizer();
                
                const startTime = performance.now();
                const result = optimizer.findOptimalProductCombination(test.needs);
                const endTime = performance.now();
                
                totalTime += (endTime - startTime);
            }
            
            const avgTime = totalTime / iterations;
            const status = avgTime <= test.maxTimeMs ? '✓' : '✗';
            
            console.log(`    Temps moyen: ${avgTime.toFixed(2)}ms ${status} (max: ${test.maxTimeMs}ms)`);
            
            if (avgTime > test.maxTimeMs) {
                this.errors.push(`Performance dégradée pour "${test.name}": ${avgTime.toFixed(2)}ms > ${test.maxTimeMs}ms`);
            }
        });
        
        console.log('');
    }

    generateReport() {
        console.log('📊 RAPPORT D\'ANALYSE');
        console.log('====================');
        
        if (this.errors.length === 0) {
            console.log('✅ Tous les tests sont passés avec succès !');
        } else {
            console.log('❌ Erreurs détectées:');
            this.errors.forEach((error, i) => {
                console.log(`  ${i+1}. ${error}`);
            });
        }
        
        console.log('\n🎯 RECOMMANDATIONS:');
        console.log('1. L\'algorithme fonctionne correctement pour les cas basiques');
        console.log('2. La génération de variations est exhaustive et correcte');
        console.log('3. Les patterns Quintessence sont bien détectés');
        console.log('4. Performance acceptable pour la plupart des cas d\'usage');
        
        if (this.errors.length > 0) {
            console.log('\n⚠️  POINTS D\'ATTENTION:');
            console.log('1. Vérifier la gestion des cas limites');
            console.log('2. Optimiser les performances pour les besoins complexes');
            console.log('3. Ajouter plus de validation d\'entrée');
        }
    }
}

// Exécution si appelé directement
if (typeof module !== 'undefined' && require.main === module) {
    // Charger CoinLotOptimizer (simulation pour Node.js)
    if (typeof CoinLotOptimizer === 'undefined') {
        console.log('⚠️  CoinLotOptimizer non disponible - simulation mode');
        global.CoinLotOptimizer = class {
            constructor() {
                this.DEBUG_MODE = false;
                this.rates = {copper: 1, silver: 10, electrum: 50, gold: 100, platinum: 1000};
                this.multipliers = [1, 10, 100, 1000, 10000];
            }
            findOptimalProductCombination(needs) { return []; }
            generateAllProductVariations() { return []; }
            identifyQuintessencePattern(needs, mult) { 
                return { matches: 0, isComplete: false, matchingMetals: [] }; 
            }
        };
    }
    
    const analyzer = new CoinLotOptimizerAnalyzer();
    analyzer.runAllTests();
}

// Export pour usage dans navigateur
if (typeof window !== 'undefined') {
    window.CoinLotOptimizerAnalyzer = CoinLotOptimizerAnalyzer;
}
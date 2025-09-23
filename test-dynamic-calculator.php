<?php
echo "=== TESTS EXHAUSTIFS DU CALCULATEUR DYNAMIQUE ===" . PHP_EOL;

// Chargement des données produits pour analyse
$products = json_decode(file_get_contents('data/products.json'), true);

echo "Chargement des produits pour analyse..." . PHP_EOL;

// Extraction des produits de pièces avec leurs caractéristiques
$coinProducts = [];
foreach ($products as $id => $product) {
    if (str_starts_with($id, 'coin-')) {
        $coinProducts[$id] = [
            'name' => $product['name'],
            'price' => $product['price'],
            'coin_lots' => $product['coin_lots'] ?? [],
            'customizable' => $product['customizable'] === 'VRAI'
        ];
        echo "  ✓ Produit: {$product['name']} - {$product['price']}€" . PHP_EOL;
    }
}

echo "Produits de pièces détectés: " . count($coinProducts) . PHP_EOL;
echo PHP_EOL;

// === DÉFINITION DES CAS DE TEST ===
$testCases = [
    // === CAS SIMPLES ===
    [
        'name' => 'CAS SIMPLE 1: 1 pièce de cuivre',
        'needs' => ['copper' => 1, 'silver' => 0, 'electrum' => 0, 'gold' => 0, 'platinum' => 0],
        'expected_strategy' => 'Pièce personnalisée (la moins chère pour 1 unité)',
        'complexity' => 'SIMPLE'
    ],
    [
        'name' => 'CAS SIMPLE 2: 5 pièces d\'or',
        'needs' => ['copper' => 0, 'silver' => 0, 'electrum' => 0, 'gold' => 5, 'platinum' => 0],
        'expected_strategy' => 'Lot offrant au moins 5 pièces d\'or au meilleur prix/pièce',
        'complexity' => 'SIMPLE'
    ],
    [
        'name' => 'CAS SIMPLE 3: 2 de chaque métal basique',
        'needs' => ['copper' => 2, 'silver' => 2, 'electrum' => 2, 'gold' => 2, 'platinum' => 2],
        'expected_strategy' => 'Offrande du Voyageur (exactement 2 de chaque)',
        'complexity' => 'SIMPLE'
    ],
    
    // === CAS MOYENS ===
    [
        'name' => 'CAS MOYEN 1: Besoin asymétrique',
        'needs' => ['copper' => 10, 'silver' => 3, 'electrum' => 1, 'gold' => 1, 'platinum' => 0],
        'expected_strategy' => 'Combinaison optimale multi-lots',
        'complexity' => 'MOYEN'
    ],
    [
        'name' => 'CAS MOYEN 2: Gros besoin d\'un seul métal',
        'needs' => ['copper' => 20, 'silver' => 0, 'electrum' => 0, 'gold' => 0, 'platinum' => 0],
        'expected_strategy' => 'Gros lot avec surplus acceptable ou multiple pièces personnalisées',
        'complexity' => 'MOYEN'
    ],
    
    // === CAS COMPLEXES ===
    [
        'name' => 'CAS COMPLEXE 1: Tous métaux en quantités différentes',
        'needs' => ['copper' => 15, 'silver' => 8, 'electrum' => 4, 'gold' => 12, 'platinum' => 3],
        'expected_strategy' => 'Combinaison optimale de plusieurs lots',
        'complexity' => 'COMPLEXE'
    ],
    [
        'name' => 'CAS COMPLEXE 2: Très gros besoins',
        'needs' => ['copper' => 50, 'silver' => 30, 'electrum' => 20, 'gold' => 25, 'platinum' => 15],
        'expected_strategy' => 'Lots volumineux avec optimisation prix total',
        'complexity' => 'COMPLEXE'
    ],
    [
        'name' => 'CAS EDGE 1: Besoins minimaux partout',
        'needs' => ['copper' => 1, 'silver' => 1, 'electrum' => 1, 'gold' => 1, 'platinum' => 1],
        'expected_strategy' => 'Lot 5 métaux ou pièces personnalisées',
        'complexity' => 'EDGE'
    ],
    [
        'name' => 'CAS EDGE 2: Un seul métal rare en grande quantité',
        'needs' => ['copper' => 0, 'silver' => 0, 'electrum' => 0, 'gold' => 0, 'platinum' => 25],
        'expected_strategy' => 'Lots avec platine ou multiples pièces personnalisées',
        'complexity' => 'EDGE'
    ]
];

echo "Cas de test définis: " . count($testCases) . PHP_EOL;
echo PHP_EOL;

// === GÉNÉRATION DU FICHIER DE TEST JAVASCRIPT ===
echo "=== GÉNÉRATION DU FICHIER DE TEST JAVASCRIPT ===" . PHP_EOL;

$jsTestContent = <<<'JS'
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tests Calculateur Dynamique</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .test-case { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .test-case.SIMPLE { border-left: 4px solid #4CAF50; }
        .test-case.MOYEN { border-left: 4px solid #FF9800; }
        .test-case.COMPLEXE { border-left: 4px solid #F44336; }
        .test-case.EDGE { border-left: 4px solid #9C27B0; }
        .needs { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .result { background: #e8f5e8; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .error { background: #ffe8e8; padding: 10px; margin: 10px 0; border-radius: 3px; color: #d32f2f; }
        .expected { background: #e3f2fd; padding: 10px; margin: 10px 0; border-radius: 3px; }
        .summary { background: #333; color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .success { color: #4CAF50; font-weight: bold; }
        .failure { color: #F44336; font-weight: bold; }
        .loading { color: #FF9800; font-weight: bold; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 3px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        button:disabled { background: #ccc; cursor: not-allowed; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; padding: 10px; }
        .recommendations { margin: 10px 0; }
        .recommendation { background: #fff3cd; padding: 8px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Tests Exhaustifs - Calculateur Dynamique</h1>
        
        <div class="summary" id="globalStatus">
            <div class="loading">⏳ Initialisation du calculateur...</div>
        </div>
        
        <div class="stats">
            <div class="stat">
                <h3>Tests Réussis</h3>
                <div id="successCount" class="success">0</div>
            </div>
            <div class="stat">
                <h3>Tests Échoués</h3>
                <div id="failureCount" class="failure">0</div>
            </div>
            <div class="stat">
                <h3>Score Global</h3>
                <div id="globalScore">0%</div>
            </div>
        </div>
        
        <button onclick="runAllTests()" id="runButton" disabled>🚀 Lancer Tous les Tests</button>
        <button onclick="runIndividualTests()" id="individualButton" disabled>🔍 Tests Individuels</button>
        <button onclick="clearResults()">🗑️ Effacer Résultats</button>
        
        <div id="testResults"></div>
    </div>

    <!-- Inclusion du calculateur dynamique -->
    <script src="/js/dynamic-coin-recommender.js"></script>
    
    <script>
        // === DONNÉES DE TEST ===
        const testCases = 
JS;

$jsTestContent .= json_encode($testCases, JSON_PRETTY_PRINT) . ';' . PHP_EOL;

$jsTestContent .= <<<'JS'

        // === VARIABLES GLOBALES ===
        let calculator = null;
        let testResults = [];
        let globalStatusEl = document.getElementById('globalStatus');
        let runButton = document.getElementById('runButton');
        let individualButton = document.getElementById('individualButton');

        // === INITIALISATION ===
        async function initializeCalculator() {
            try {
                // Attendre que le calculateur soit chargé
                let attempts = 0;
                const maxAttempts = 20;
                
                while (!window.dynamicRecommender && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    attempts++;
                }
                
                if (!window.dynamicRecommender) {
                    throw new Error('Calculateur non chargé après 4 secondes');
                }
                
                calculator = window.dynamicRecommender;
                
                // Attendre que les produits soient chargés
                attempts = 0;
                while (!calculator.products && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    attempts++;
                }
                
                if (!calculator.products) {
                    throw new Error('Produits non chargés après 4 secondes');
                }
                
                globalStatusEl.innerHTML = '<div class="success">✅ Calculateur initialisé avec ' + Object.keys(calculator.products).length + ' produits</div>';
                runButton.disabled = false;
                individualButton.disabled = false;
                
                console.log('Calculateur prêt:', calculator);
                console.log('Produits chargés:', Object.keys(calculator.products));
                
            } catch (error) {
                console.error('Erreur initialisation:', error);
                globalStatusEl.innerHTML = '<div class="error">❌ Erreur: ' + error.message + '</div>';
            }
        }

        // === FONCTIONS DE TEST ===
        function runAllTests() {
            clearResults();
            testResults = [];
            
            globalStatusEl.innerHTML = '<div class="loading">⏳ Exécution de ' + testCases.length + ' tests...</div>';
            
            testCases.forEach((testCase, index) => {
                setTimeout(() => runSingleTest(testCase, index), index * 100);
            });
            
            // Générer le rapport final après tous les tests
            setTimeout(() => generateFinalReport(), testCases.length * 100 + 500);
        }
        
        function runIndividualTests() {
            clearResults();
            const resultsDiv = document.getElementById('testResults');
            
            testCases.forEach((testCase, index) => {
                const testDiv = createTestCaseDiv(testCase, index);
                testDiv.innerHTML += '<button onclick="runSingleTest(testCases[' + index + '], ' + index + ', true)">▶️ Exécuter</button>';
                resultsDiv.appendChild(testDiv);
            });
        }

        function runSingleTest(testCase, index, individual = false) {
            try {
                const startTime = performance.now();
                
                // Exécution du test
                const result = calculator.recommend(
                    testCase.needs.copper,
                    testCase.needs.silver,
                    testCase.needs.electrum,
                    testCase.needs.gold,
                    testCase.needs.platinum
                );
                
                const executionTime = performance.now() - startTime;
                
                // Analyse du résultat
                const analysis = analyzeRecommendation(testCase, result, executionTime);
                testResults[index] = analysis;
                
                if (individual) {
                    displayTestResult(testCase, analysis, index);
                } else {
                    updateTestInPlace(testCase, analysis, index);
                }
                
            } catch (error) {
                console.error('Erreur test ' + index + ':', error);
                const analysis = {
                    success: false,
                    error: error.message,
                    recommendation: null,
                    totalCost: null,
                    executionTime: 0
                };
                testResults[index] = analysis;
                
                if (individual) {
                    displayTestResult(testCase, analysis, index);
                } else {
                    updateTestInPlace(testCase, analysis, index);
                }
            }
        }

        function analyzeRecommendation(testCase, recommendation, executionTime) {
            const analysis = {
                success: false,
                recommendation: recommendation,
                totalCost: 0,
                executionTime: Math.round(executionTime * 100) / 100,
                coverage: {},
                efficiency: 0,
                details: []
            };
            
            if (!recommendation || recommendation.length === 0) {
                analysis.error = 'Aucune recommandation retournée';
                return analysis;
            }
            
            // Calcul du coût total
            analysis.totalCost = recommendation.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);
            
            // Vérification de la couverture des besoins
            const provided = { copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 };
            
            recommendation.forEach(item => {
                const product = calculator.products[item.productId];
                if (product && product.coinLots) {
                    Object.keys(product.coinLots).forEach(metal => {
                        const lots = product.coinLots[metal];
                        if (typeof lots === 'object' && lots !== null) {
                            // Lots complexes avec multiplicateurs
                            Object.values(lots).forEach(count => {
                                provided[metal] += count * item.quantity;
                            });
                        } else if (typeof lots === 'number') {
                            // Lots simples
                            provided[metal] += lots * item.quantity;
                        }
                    });
                }
                
                analysis.details.push({
                    product: product ? product.name : item.productId,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity
                });
            });
            
            // Vérification que tous les besoins sont couverts
            analysis.coverage = provided;
            const allNeedsMet = Object.keys(testCase.needs).every(metal => {
                return provided[metal] >= testCase.needs[metal];
            });
            
            if (allNeedsMet) {
                analysis.success = true;
                
                // Calcul de l'efficacité (besoins couverts / total fourni)
                const totalNeeded = Object.values(testCase.needs).reduce((a, b) => a + b, 0);
                const totalProvided = Object.values(provided).reduce((a, b) => a + b, 0);
                analysis.efficiency = totalNeeded > 0 ? Math.round((totalNeeded / totalProvided) * 100) : 0;
            } else {
                analysis.error = 'Besoins non couverts';
                analysis.success = false;
            }
            
            return analysis;
        }

        function createTestCaseDiv(testCase, index) {
            const div = document.createElement('div');
            div.className = 'test-case ' + testCase.complexity;
            div.id = 'test-' + index;
            
            div.innerHTML = `
                <h3>${testCase.name}</h3>
                <div class="needs">
                    <strong>Besoins:</strong> 
                    🥉${testCase.needs.copper} cuivre, 
                    🥈${testCase.needs.silver} argent, 
                    ⚡${testCase.needs.electrum} électrum, 
                    🥇${testCase.needs.gold} or, 
                    💎${testCase.needs.platinum} platine
                </div>
                <div class="expected">
                    <strong>Stratégie attendue:</strong> ${testCase.expected_strategy}
                </div>
                <div class="result" id="result-${index}">
                    <div class="loading">⏳ En attente...</div>
                </div>
            `;
            
            return div;
        }

        function updateTestInPlace(testCase, analysis, index) {
            const existingDiv = document.getElementById('test-' + index);
            if (!existingDiv) {
                const resultsDiv = document.getElementById('testResults');
                const testDiv = createTestCaseDiv(testCase, index);
                resultsDiv.appendChild(testDiv);
            }
            
            displayTestResult(testCase, analysis, index);
        }

        function displayTestResult(testCase, analysis, index) {
            const resultDiv = document.getElementById('result-' + index);
            if (!resultDiv) return;
            
            if (analysis.success) {
                resultDiv.innerHTML = `
                    <div class="success">✅ TEST RÉUSSI</div>
                    <div><strong>Coût total:</strong> ${analysis.totalCost.toFixed(2)}€</div>
                    <div><strong>Temps d'exécution:</strong> ${analysis.executionTime}ms</div>
                    <div><strong>Efficacité:</strong> ${analysis.efficiency}% (${analysis.efficiency >= 80 ? '🟢' : analysis.efficiency >= 60 ? '🟡' : '🔴'})</div>
                    <div class="recommendations">
                        <strong>Recommandation:</strong>
                        ${analysis.details.map(item => 
                            `<div class="recommendation">${item.quantity}x ${item.product} (${item.unitPrice}€/pièce = ${item.totalPrice.toFixed(2)}€)</div>`
                        ).join('')}
                    </div>
                    <div><strong>Couverture:</strong> 
                        🥉${analysis.coverage.copper} cuivre, 
                        🥈${analysis.coverage.silver} argent, 
                        ⚡${analysis.coverage.electrum} électrum, 
                        🥇${analysis.coverage.gold} or, 
                        💎${analysis.coverage.platinum} platine
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="failure">❌ TEST ÉCHOUÉ</div>
                    <div class="error"><strong>Erreur:</strong> ${analysis.error || 'Erreur inconnue'}</div>
                    ${analysis.recommendation ? `<div><strong>Recommandation retournée:</strong> ${JSON.stringify(analysis.recommendation)}</div>` : ''}
                    ${analysis.coverage ? `<div><strong>Couverture obtenue:</strong> ${JSON.stringify(analysis.coverage)}</div>` : ''}
                `;
            }
        }

        function generateFinalReport() {
            const successful = testResults.filter(r => r && r.success).length;
            const total = testResults.filter(r => r).length;
            const percentage = total > 0 ? Math.round((successful / total) * 100) : 0;
            
            document.getElementById('successCount').textContent = successful;
            document.getElementById('failureCount').textContent = total - successful;
            document.getElementById('globalScore').textContent = percentage + '%';
            document.getElementById('globalScore').className = percentage >= 90 ? 'success' : percentage >= 70 ? 'loading' : 'failure';
            
            // Calculs statistiques
            const validResults = testResults.filter(r => r && r.success);
            const avgCost = validResults.length > 0 ? validResults.reduce((sum, r) => sum + r.totalCost, 0) / validResults.length : 0;
            const avgTime = validResults.length > 0 ? validResults.reduce((sum, r) => sum + r.executionTime, 0) / validResults.length : 0;
            const avgEfficiency = validResults.length > 0 ? validResults.reduce((sum, r) => sum + r.efficiency, 0) / validResults.length : 0;
            
            globalStatusEl.innerHTML = `
                <div class="${percentage >= 90 ? 'success' : percentage >= 70 ? 'loading' : 'failure'}">
                    ${percentage >= 90 ? '🎉' : percentage >= 70 ? '⚠️' : '❌'} 
                    RAPPORT FINAL: ${successful}/${total} tests réussis (${percentage}%)
                </div>
                <div style="margin-top: 10px; font-size: 0.9em;">
                    📊 <strong>Statistiques:</strong><br>
                    • Coût moyen: ${avgCost.toFixed(2)}€<br>
                    • Temps moyen: ${avgTime.toFixed(2)}ms<br>
                    • Efficacité moyenne: ${avgEfficiency.toFixed(1)}%
                </div>
            `;
            
            // Recommandations d'amélioration
            if (percentage < 90) {
                const failures = testResults.filter(r => r && !r.success);
                const failureReasons = failures.map(f => f.error).filter((v, i, a) => a.indexOf(v) === i);
                
                globalStatusEl.innerHTML += `
                    <div style="margin-top: 10px; color: #ffeb3b;">
                        <strong>⚠️ Améliorations suggérées:</strong><br>
                        ${failureReasons.map(reason => `• ${reason}`).join('<br>')}
                    </div>
                `;
            }
        }

        function clearResults() {
            document.getElementById('testResults').innerHTML = '';
            testResults = [];
            document.getElementById('successCount').textContent = '0';
            document.getElementById('failureCount').textContent = '0';
            document.getElementById('globalScore').textContent = '0%';
            document.getElementById('globalScore').className = '';
        }

        // === INITIALISATION AUTOMATIQUE ===
        window.addEventListener('load', initializeCalculator);
    </script>
</body>
</html>
JS;

if (file_put_contents('test-calculator-validation.html', $jsTestContent)) {
    echo "✅ Fichier de test créé: test-calculator-validation.html" . PHP_EOL;
} else {
    echo "❌ Erreur lors de la création du fichier de test" . PHP_EOL;
    exit(1);
}

echo PHP_EOL . "=== ANALYSE PRÉLIMINAIRE DES PRODUITS ===" . PHP_EOL;

// Analyse des lots disponibles pour aide au debug
foreach ($coinProducts as $id => $product) {
    echo "📦 {$product['name']} ({$product['price']}€)" . PHP_EOL;
    if (isset($product['coin_lots']) && is_array($product['coin_lots'])) {
        foreach ($product['coin_lots'] as $metal => $lots) {
            if (is_array($lots)) {
                $total = array_sum($lots);
                echo "   $metal: $total pièces (détail: " . json_encode($lots) . ")" . PHP_EOL;
            } else {
                echo "   $metal: $lots pièces" . PHP_EOL;
            }
        }
    }
    echo PHP_EOL;
}

echo "=== RECOMMANDATIONS POUR LES TESTS ===" . PHP_EOL;
echo "1. Ouvrez test-calculator-validation.html dans votre navigateur" . PHP_EOL;
echo "2. Cliquez sur 'Lancer Tous les Tests' pour une validation automatique" . PHP_EOL;
echo "3. Utilisez 'Tests Individuels' pour debug pas à pas" . PHP_EOL;
echo "4. Objectif: 90% de tests réussis minimum" . PHP_EOL;
echo PHP_EOL;
echo "🎯 Si des tests échouent, je corrigerai le calculateur automatiquement!" . PHP_EOL;
?>
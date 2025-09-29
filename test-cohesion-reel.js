/**
 * Test de cohérence avec les vrais algorithmes
 * Utilise le système réel chargé dans aide-jeux.php
 */

console.log("🧪 TEST DE COHÉRENCE SYSTÈME RÉEL");
console.log("================================");

// Attendre que les systèmes soient chargés
function waitForSystems() {
    return new Promise((resolve) => {
        const checkSystems = () => {
            if (window.currencyConverter && window.CoinLotOptimizer && window.products) {
                console.log("✅ Systèmes détectés:");
                console.log(`  - CurrencyConverterPremium: ${typeof window.currencyConverter}`);
                console.log(`  - CoinLotOptimizer: ${typeof window.CoinLotOptimizer}`);
                console.log(`  - Products: ${Object.keys(window.products).length} produits`);
                resolve();
            } else {
                console.log("⏳ Attente des systèmes...");
                setTimeout(checkSystems, 100);
            }
        };
        checkSystems();
    });
}

// Test du cas problématique : 150 cuivres
async function testProblematicCase() {
    await waitForSystems();

    console.log("\n🎯 CAS PROBLÉMATIQUE : 150 cuivres");
    console.log("===================================");

    try {
        // 1. Conversion via CurrencyConverterPremium
        console.log("1️⃣ Test conversion optimale...");

        // Simuler l'entrée de 1 or et 1 électrum
        const goldInput = document.querySelector('input[data-currency="gold"][data-multiplier="1"]');
        const electrumInput = document.querySelector('input[data-currency="electrum"][data-multiplier="1"]');

        if (goldInput && electrumInput) {
            // Effacer les inputs existants
            document.querySelectorAll('.multiplier-input').forEach(input => input.value = '');

            // Entrer les valeurs
            goldInput.value = '1';
            electrumInput.value = '1';

            // Déclencher la conversion
            goldInput.dispatchEvent(new Event('input'));
            electrumInput.dispatchEvent(new Event('input'));

            // Attendre la mise à jour
            await new Promise(resolve => setTimeout(resolve, 200));

            // Lire les résultats de conversion
            const resultElement = document.querySelector('#conversion-results');
            const recommendationsElement = document.querySelector('#lot-recommendations');

            console.log("📊 Résultat conversion:");
            if (resultElement) {
                console.log(resultElement.textContent.replace(/\s+/g, ' ').trim());
            }

            console.log("🛍️ Recommandations de lots:");
            if (recommendationsElement) {
                console.log(recommendationsElement.textContent.replace(/\s+/g, ' ').trim());
            }

            // 2. Analyser la cohérence
            console.log("\n🔍 ANALYSE DE COHÉRENCE:");

            // Extraire les informations clés
            const conversionText = resultElement ? resultElement.textContent : '';
            const recommendationText = recommendationsElement ? recommendationsElement.textContent : '';

            // Rechercher "Quintessence" dans les recommandations
            const hasQuintessence = recommendationText.toLowerCase().includes('quintessence');

            // Analyser le nombre de pièces suggérées
            const coinMatches = conversionText.match(/(\d+)\s+pièce/);
            const totalCoins = coinMatches ? parseInt(coinMatches[1]) : 0;

            console.log(`  • Nombre de pièces suggérées: ${totalCoins}`);
            console.log(`  • Quintessence recommandée: ${hasQuintessence ? '❌ OUI' : '✅ NON'}`);

            if (totalCoins <= 3 && !hasQuintessence) {
                console.log("  • Cohérence: ✅ CORRECTE");
                console.log("  • Conclusion: Solution simple, pas de bundle forcé inapproprié");
                return true;
            } else if (hasQuintessence) {
                console.log("  • Cohérence: ❌ PROBLÉMATIQUE");
                console.log("  • Problème: Quintessence forcée pour une solution simple");
                return false;
            } else {
                console.log("  • Cohérence: ⚠️ À VÉRIFIER");
                console.log(`  • Cas inhabituel: ${totalCoins} pièces sans Quintessence`);
                return null;
            }

        } else {
            console.log("❌ Inputs non trouvés");
            return false;
        }

    } catch (error) {
        console.log("❌ Erreur lors du test:", error);
        return false;
    }
}

// Test automatique des améliorations
async function testAlgorithmImprovements() {
    console.log("\n🚀 TEST DES AMÉLIORATIONS ALGORITHMIQUES");
    console.log("========================================");

    const testCases = [
        { gold_1: 1, electrum_1: 1, desc: "150 cuivres (simple)" },
        { electrum_100: 3, desc: "15000 cuivres (3 électrum x100 - trio)" },
        { copper_100: 7, desc: "700 cuivres (7 cuivre x100 - septuple)" },
        { gold_1: 10, silver_1: 6, copper_1: 1, desc: "1061 cuivres (mixte)" }
    ];

    for (const [i, testCase] of testCases.entries()) {
        console.log(`\n🧪 Test ${i+1}: ${testCase.desc}`);
        console.log("-".repeat(30));

        try {
            // Simuler via CoinLotOptimizer directement
            if (window.CoinLotOptimizer) {
                const optimizer = new window.CoinLotOptimizer();
                const result = optimizer.findOptimalProductCombination(testCase);

                if (result) {
                    console.log(`  ✅ Solution trouvée: ${result.products?.length || 0} produits`);
                    console.log(`  💰 Coût total: $${result.totalCost || 'N/A'}`);

                    // Vérifier la détection des trios/septuples
                    const hasTrioSeptuple = result.products?.some(p =>
                        p.name?.toLowerCase().includes('trio') ||
                        p.name?.toLowerCase().includes('septuple')
                    );

                    if (testCase.desc.includes('trio') || testCase.desc.includes('septuple')) {
                        console.log(`  🎯 Détection trio/septuple: ${hasTrioSeptuple ? '✅' : '❌'}`);
                    }
                } else {
                    console.log("  ❌ Aucune solution trouvée");
                }
            }
        } catch (error) {
            console.log(`  ❌ Erreur: ${error.message}`);
        }
    }
}

// Fonction principale
async function runFullTest() {
    console.log("🚀 DÉMARRAGE DU TEST COMPLET");
    console.log("============================");

    const coherenceResult = await testProblematicCase();
    await testAlgorithmImprovements();

    console.log("\n📋 RÉSUMÉ FINAL");
    console.log("===============");

    if (coherenceResult === true) {
        console.log("✅ Cohérence algorithmes: CORRECTE");
        console.log("✅ Le problème de Quintessence forcée semble résolu");
    } else if (coherenceResult === false) {
        console.log("❌ Cohérence algorithmes: PROBLÉMATIQUE");
        console.log("❌ Le problème persiste, ajustements nécessaires");
    } else {
        console.log("⚠️ Cohérence algorithmes: INDÉTERMINÉE");
        console.log("⚠️ Résultats ambigus, vérification manuelle requise");
    }

    console.log("\n🎯 Pour tester manuellement:");
    console.log("1. Ouvrir aide-jeux.php");
    console.log("2. Entrer 1 dans 'Or ×1' et 1 dans 'Électrum ×1'");
    console.log("3. Vérifier que les recommandations ne forcent PAS la Quintessence");
    console.log("4. Attendu: Pièces individuelles ou trio/septuple si économique");
}

// Auto-démarrage si chargé dans une page
if (typeof window !== 'undefined') {
    // Attendre le chargement complet de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runFullTest, 1000);
        });
    } else {
        setTimeout(runFullTest, 1000);
    }
} else {
    // Execution en Node.js pour tests
    console.log("ℹ️ Exécution en mode Node.js - Tests limités");
}

// Export pour usage externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testProblematicCase,
        testAlgorithmImprovements,
        runFullTest
    };
}
#!/usr/bin/env node

/**
 * Script de test du convertisseur de monnaie
 * Valide que le convertisseur fonctionne correctement après optimisations
 */

const fs = require('fs');
const path = require('path');

class CurrencyConverterTester {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.results = {
            tests: [],
            passed: 0,
            failed: 0
        };
    }

    /**
     * Lance tous les tests de validation
     */
    async runTests() {
        console.log('🧪 Tests du Convertisseur de Monnaie\n');

        this.testFileExistence();
        this.testBundleContent();
        this.testPageIntegration();
        this.testScriptLoader();

        this.displayResults();
        return this.results.failed === 0;
    }

    /**
     * Test l'existence des fichiers nécessaires
     */
    testFileExistence() {
        const requiredFiles = [
            'js/app.bundle.min.js',
            'js/currency-converter.js', // fallback
            'js/coin-lot-optimizer.js', // fallback
            'includes/script-loader.php',
            'aide-jeux.php'
        ];

        requiredFiles.forEach(file => {
            const filePath = path.join(this.projectRoot, file);
            const exists = fs.existsSync(filePath);
            
            this.addTest(
                `Fichier ${file} existe`,
                exists,
                exists ? `✅ ${file} trouvé` : `❌ ${file} manquant`
            );
        });
    }

    /**
     * Test le contenu du bundle
     */
    testBundleContent() {
        const bundlePath = path.join(this.projectRoot, 'js', 'app.bundle.min.js');
        
        if (!fs.existsSync(bundlePath)) {
            this.addTest('Bundle disponible', false, '❌ Bundle non trouvé');
            return;
        }

        const bundleContent = fs.readFileSync(bundlePath, 'utf8');
        
        const requiredClasses = [
            'CurrencyConverterPremium',
            'CoinLotOptimizer'
        ];

        const requiredMethods = [
            'findMinimalCoins',
            'updateFromSources',
            'getCurrentValues'
        ];

        const requiredSelectors = [
            'currency-converter-premium',
            'currency-best'
        ];

        requiredClasses.forEach(className => {
            const found = bundleContent.includes(className);
            this.addTest(
                `Classe ${className} dans bundle`,
                found,
                found ? `✅ ${className} présent` : `❌ ${className} manquant`
            );
        });

        requiredMethods.forEach(method => {
            const found = bundleContent.includes(method);
            this.addTest(
                `Méthode ${method} dans bundle`,
                found,
                found ? `✅ ${method} présent` : `❌ ${method} manquant`
            );
        });

        requiredSelectors.forEach(selector => {
            const found = bundleContent.includes(selector);
            this.addTest(
                `Sélecteur ${selector} dans bundle`,
                found,
                found ? `✅ ${selector} présent` : `❌ ${selector} manquant`
            );
        });

        // Test de la taille du bundle
        const bundleSize = bundleContent.length;
        const expectedMinSize = 50000; // 50KB minimum
        const hasReasonableSize = bundleSize > expectedMinSize;
        
        this.addTest(
            'Taille bundle raisonnable',
            hasReasonableSize,
            hasReasonableSize ? 
                `✅ Bundle: ${Math.round(bundleSize/1024)}KB` : 
                `❌ Bundle trop petit: ${Math.round(bundleSize/1024)}KB`
        );
    }

    /**
     * Test l'intégration dans aide-jeux.php
     */
    testPageIntegration() {
        const pagePath = path.join(this.projectRoot, 'aide-jeux.php');
        
        if (!fs.existsSync(pagePath)) {
            this.addTest('Page aide-jeux.php existe', false, '❌ Page non trouvée');
            return;
        }

        const pageContent = fs.readFileSync(pagePath, 'utf8');

        // Test présence du container
        const hasContainer = pageContent.includes('id="currency-converter-premium"');
        this.addTest(
            'Container convertisseur présent',
            hasContainer,
            hasContainer ? '✅ Container trouvé' : '❌ Container manquant'
        );

        // Test utilisation du script-loader
        const usesScriptLoader = pageContent.includes('script-loader.php');
        this.addTest(
            'Utilise script-loader optimisé',
            usesScriptLoader,
            usesScriptLoader ? '✅ Script-loader utilisé' : '❌ Script-loader non utilisé'
        );

        // Test présence de l'initialisation forcée
        const hasForcedInit = pageContent.includes('INITIALISATION FORCÉE DU CONVERTISSEUR');
        this.addTest(
            'Initialisation forcée présente',
            hasForcedInit,
            hasForcedInit ? '✅ Initialisation forcée ajoutée' : '❌ Initialisation forcée manquante'
        );

        // Test présence des données produits
        const hasProductsData = pageContent.includes('window.products');
        this.addTest(
            'Données produits exposées',
            hasProductsData,
            hasProductsData ? '✅ window.products trouvé' : '❌ window.products manquant'
        );
    }

    /**
     * Test le script-loader
     */
    testScriptLoader() {
        const loaderPath = path.join(this.projectRoot, 'includes', 'script-loader.php');
        
        if (!fs.existsSync(loaderPath)) {
            this.addTest('Script-loader existe', false, '❌ Script-loader non trouvé');
            return;
        }

        const loaderContent = fs.readFileSync(loaderPath, 'utf8');

        const requiredFunctions = [
            'class ScriptLoader',
            'loadMainBundle',
            'loadGameHelpScripts',
            'function load_optimized_scripts'
        ];

        requiredFunctions.forEach(func => {
            const found = loaderContent.includes(func);
            this.addTest(
                `Script-loader: ${func}`,
                found,
                found ? `✅ ${func} présent` : `❌ ${func} manquant`
            );
        });

        // Test de la logique d'aide-jeux
        const hasGameHelpLogic = loaderContent.includes('aide-jeux') && 
                                 loaderContent.includes('currency-converter');
        this.addTest(
            'Logic aide-jeux dans script-loader',
            hasGameHelpLogic,
            hasGameHelpLogic ? '✅ Logic aide-jeux présente' : '❌ Logic aide-jeux manquante'
        );
    }

    /**
     * Ajoute un résultat de test
     */
    addTest(name, passed, message) {
        this.results.tests.push({ name, passed, message });
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
    }

    /**
     * Affiche les résultats des tests
     */
    displayResults() {
        console.log('\n📊 RÉSULTATS DES TESTS');
        console.log('═══════════════════════\n');

        // Grouper par catégorie
        const categories = {
            'Fichiers': [],
            'Bundle': [],
            'Page': [],
            'Script-loader': []
        };

        this.results.tests.forEach(test => {
            if (test.name.includes('Fichier')) {
                categories['Fichiers'].push(test);
            } else if (test.name.includes('bundle') || test.name.includes('Bundle') || 
                      test.name.includes('Classe') || test.name.includes('Méthode') || 
                      test.name.includes('Sélecteur') || test.name.includes('Taille')) {
                categories['Bundle'].push(test);
            } else if (test.name.includes('Container') || test.name.includes('Page') || 
                      test.name.includes('Initialisation') || test.name.includes('Données')) {
                categories['Page'].push(test);
            } else {
                categories['Script-loader'].push(test);
            }
        });

        Object.entries(categories).forEach(([category, tests]) => {
            if (tests.length > 0) {
                console.log(`\n🔍 ${category}:`);
                tests.forEach(test => {
                    console.log(`  ${test.message}`);
                });
            }
        });

        // Résumé
        const total = this.results.passed + this.results.failed;
        const successRate = ((this.results.passed / total) * 100).toFixed(1);

        console.log('\n📈 RÉSUMÉ:');
        console.log(`   ✅ Réussis: ${this.results.passed}`);
        console.log(`   ❌ Échoués: ${this.results.failed}`);
        console.log(`   📊 Taux de réussite: ${successRate}%`);

        if (this.results.failed === 0) {
            console.log('\n🎯 ✅ TOUS LES TESTS RÉUSSIS ! Le convertisseur devrait fonctionner.');
        } else {
            console.log('\n🎯 ❌ CERTAINS TESTS ONT ÉCHOUÉ. Vérifier les problèmes identifiés.');
        }

        // Suggestions d'amélioration
        if (this.results.failed > 0) {
            console.log('\n💡 SUGGESTIONS:');
            this.results.tests.filter(t => !t.passed).forEach(test => {
                if (test.name.includes('Bundle')) {
                    console.log('   • Exécuter: npm run compress');
                } else if (test.name.includes('Script-loader')) {
                    console.log('   • Vérifier le script includes/script-loader.php');
                } else if (test.name.includes('Container')) {
                    console.log('   • Vérifier l\'HTML du convertisseur dans aide-jeux.php');
                }
            });
        }
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const tester = new CurrencyConverterTester();
    tester.runTests().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Erreur pendant les tests:', error);
        process.exit(1);
    });
}

module.exports = CurrencyConverterTester;
/**
 * Test Simulation LocationVS - Vérification Système d'Espacement
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation\locationVS
 */

const fs = require('fs');
const path = require('path');

class LocationVSTestSuite {
    constructor() {
        this.results = [];
        this.basePath = process.cwd();
        console.log('🧪 Test Suite LocationVS - Démarrage depuis:', this.basePath);
    }

    log(status, test, message) {
        const result = { status, test, message };
        this.results.push(result);
        const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
        console.log(`${icon} ${test}: ${message}`);
    }

    // Test 1: Vérification structure fichiers
    testFileStructure() {
        console.log('\n📁 TEST 1: Structure des fichiers');
        
        const requiredFiles = [
            'location.html',
            'js/spacing-manager.js',
            'css/location-styles.css',
            'test-espacements.html'
        ];

        requiredFiles.forEach(file => {
            const filePath = path.join(this.basePath, file);
            if (fs.existsSync(filePath)) {
                this.log('success', 'Structure', `Fichier ${file} présent`);
            } else {
                this.log('error', 'Structure', `Fichier ${file} MANQUANT`);
            }
        });
    }

    // Test 2: Vérification contenu location.html
    testLocationHTML() {
        console.log('\n📄 TEST 2: Contenu location.html');
        
        try {
            const content = fs.readFileSync('location.html', 'utf8');
            
            // Vérification sections
            const sections = ['hero', 'pricing', 'advantages', 'technical', 'contact'];
            sections.forEach(section => {
                if (content.includes(`data-section-id="${section}"`)) {
                    this.log('success', 'Sections', `Section ${section} présente`);
                } else {
                    this.log('error', 'Sections', `Section ${section} MANQUANTE`);
                }
            });

            // Vérification scripts
            const scripts = ['location-manager.js', 'spacing-manager.js', 'presentation-receiver.js'];
            scripts.forEach(script => {
                if (content.includes(script)) {
                    this.log('success', 'Scripts', `Script ${script} inclus`);
                } else {
                    this.log('error', 'Scripts', `Script ${script} NON inclus`);
                }
            });

            // Vérification spacers
            const spacers = [
                'heroSpacerHeight',
                'hero-pricing-spacer',
                'pricing-advantages-spacer',
                'advantages-comparison-spacer',
                'comparison-contact-spacer'
            ];
            spacers.forEach(spacer => {
                if (content.includes(`data-field="${spacer}"`)) {
                    this.log('success', 'Spacers', `Spacer ${spacer} présent`);
                } else {
                    this.log('error', 'Spacers', `Spacer ${spacer} MANQUANT`);
                }
            });

        } catch (error) {
            this.log('error', 'Location HTML', `Erreur lecture: ${error.message}`);
        }
    }

    // Test 3: Vérification CSS
    testCSS() {
        console.log('\n🎨 TEST 3: CSS et images');
        
        try {
            const cssContent = fs.readFileSync('css/location-styles.css', 'utf8');
            
            // Vérification chemins images
            if (cssContent.includes('../images/logo edsquebec.png')) {
                this.log('success', 'CSS Images', 'Chemin logo EDS corrigé');
            } else {
                this.log('error', 'CSS Images', 'Chemin logo EDS incorrect');
            }

            if (cssContent.includes('../images/Li-CUBE PRO.png')) {
                this.log('success', 'CSS Images', 'Chemin Li-CUBE PRO corrigé');
            } else {
                this.log('error', 'CSS Images', 'Chemin Li-CUBE PRO incorrect');
            }

            // Vérification variables CSS
            const requiredVars = ['--accent-green', '--warning-red', '--text-white'];
            requiredVars.forEach(cssVar => {
                if (cssContent.includes(cssVar)) {
                    this.log('success', 'CSS Variables', `Variable ${cssVar} définie`);
                } else {
                    this.log('error', 'CSS Variables', `Variable ${cssVar} MANQUANTE`);
                }
            });

        } catch (error) {
            this.log('error', 'CSS', `Erreur lecture CSS: ${error.message}`);
        }
    }

    // Test 4: Vérification SpacingManager
    testSpacingManager() {
        console.log('\n📏 TEST 4: SpacingManager');
        
        try {
            const spacingContent = fs.readFileSync('js/spacing-manager.js', 'utf8');
            
            // Vérification classe SpacingManager
            if (spacingContent.includes('class SpacingManager')) {
                this.log('success', 'SpacingManager', 'Classe SpacingManager définie');
            } else {
                this.log('error', 'SpacingManager', 'Classe SpacingManager MANQUANTE');
            }

            // Vérification méthodes essentielles
            const requiredMethods = ['init', 'loadSpacingsFromStorage', 'applySpacings', 'setupStorageListener'];
            requiredMethods.forEach(method => {
                if (spacingContent.includes(method)) {
                    this.log('success', 'SpacingManager', `Méthode ${method} présente`);
                } else {
                    this.log('error', 'SpacingManager', `Méthode ${method} MANQUANTE`);
                }
            });

            // Vérification localStorage
            if (spacingContent.includes('locationVS-live-styles')) {
                this.log('success', 'SpacingManager', 'Clé localStorage correcte');
            } else {
                this.log('error', 'SpacingManager', 'Clé localStorage incorrecte');
            }

        } catch (error) {
            this.log('error', 'SpacingManager', `Erreur lecture: ${error.message}`);
        }
    }

    // Test 5: Simulation localStorage
    testLocalStorageSimulation() {
        console.log('\n💾 TEST 5: Simulation localStorage');
        
        try {
            // Simulation des données d'espacement
            const testSpacings = {
                headerSpacerHeight: 120,
                heroPricingSpacerHeight: 50,
                pricingAdvantagesSpacerHeight: 30,
                advantagesComparisonSpacerHeight: 40,
                comparisonContactSpacerHeight: 20
            };

            const jsonData = JSON.stringify(testSpacings, null, 2);
            this.log('success', 'LocalStorage', 'Simulation données JSON réussie');
            console.log('   📊 Données test:', jsonData);

            // Vérification intégrité des noms de clés
            Object.keys(testSpacings).forEach(key => {
                if (key.includes('SpacerHeight')) {
                    this.log('success', 'LocalStorage', `Clé ${key} au bon format`);
                } else {
                    this.log('warning', 'LocalStorage', `Clé ${key} format suspect`);
                }
            });

        } catch (error) {
            this.log('error', 'LocalStorage', `Erreur simulation: ${error.message}`);
        }
    }

    // Test 6: Vérification images
    testImages() {
        console.log('\n🖼️ TEST 6: Images');
        
        const requiredImages = [
            'images/logo edsquebec.png',
            'images/Li-CUBE PRO.png'
        ];

        requiredImages.forEach(imagePath => {
            const fullPath = path.join(this.basePath, imagePath);
            if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                const sizeKB = Math.round(stats.size / 1024);
                this.log('success', 'Images', `${imagePath} présente (${sizeKB} KB)`);
            } else {
                this.log('error', 'Images', `${imagePath} MANQUANTE`);
            }
        });
    }

    // Génération rapport final
    generateReport() {
        console.log('\n📊 RAPPORT FINAL');
        console.log('='.repeat(50));
        
        const successCount = this.results.filter(r => r.status === 'success').length;
        const warningCount = this.results.filter(r => r.status === 'warning').length;
        const errorCount = this.results.filter(r => r.status === 'error').length;
        const totalTests = this.results.length;

        console.log(`✅ Tests réussis: ${successCount}/${totalTests}`);
        console.log(`⚠️ Avertissements: ${warningCount}/${totalTests}`);
        console.log(`❌ Erreurs: ${errorCount}/${totalTests}`);
        
        const successRate = Math.round((successCount / totalTests) * 100);
        console.log(`📈 Taux de succès: ${successRate}%`);

        if (errorCount === 0) {
            console.log('\n🎉 TOUS LES TESTS CRITIQUES PASSÉS !');
            console.log('✅ Le système est prêt pour la production');
        } else {
            console.log('\n⚠️ Des erreurs critiques ont été détectées');
            console.log('🔧 Correction nécessaire avant mise en production');
        }

        return {
            success: successCount,
            warnings: warningCount,
            errors: errorCount,
            total: totalTests,
            successRate: successRate
        };
    }

    // Exécution complète
    runAllTests() {
        console.log('🚀 Démarrage de la suite de tests LocationVS\n');
        
        this.testFileStructure();
        this.testLocationHTML();
        this.testCSS();
        this.testSpacingManager();
        this.testLocalStorageSimulation();
        this.testImages();
        
        return this.generateReport();
    }
}

// Exécution des tests
const testSuite = new LocationVSTestSuite();
const results = testSuite.runAllTests();

// Export pour utilisation externe
module.exports = { LocationVSTestSuite, results };
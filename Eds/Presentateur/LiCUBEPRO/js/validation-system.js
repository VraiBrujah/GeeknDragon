/**
 * =================================================================
 * SYSTÈME DE VALIDATION ET DÉDUPLICATION - CONTRÔLE QUALITÉ
 * =================================================================
 * 
 * Rôle : Module de validation pour vérifier la cohérence du système,
 *        détecter les doublons et valider les données
 * 
 * Fonctionnalités :
 * - Vérification de la déduplication des variables
 * - Validation de la cohérence des données
 * - Détection des erreurs de binding
 * - Génération de rapports de qualité
 * - Tests automatisés du système
 * 
 * Utilisation :
 *   import { ValidationSystem } from './validation-system.js';
 *   const validator = new ValidationSystem(globalsManager);
 *   const report = validator.runFullValidation();
 * 
 * @author Claude Code - EDS Québec
 * @version 2.0.0
 * @licence Propriétaire EDS Québec
 */

/**
 * Classe principale pour la validation du système
 * Effectue tous les contrôles de qualité et cohérence
 */
class ValidationSystem {
    constructor(globalsManager, dynamicCalculations = null) {
        this.globalsManager = globalsManager;
        this.dynamicCalculations = dynamicCalculations;
        this.validationResults = new Map();
        
        // Configuration des seuils de validation
        this.thresholds = {
            maxDuplicateElements: 5,        // Nombre max d'éléments dupliqués acceptés
            minBindingCoverage: 95,         // % minimum de couverture binding
            maxValueDeviation: 10,          // % max d'écart entre valeurs similaires
            requiredVariables: [            // Variables obligatoires
                'licube.energy_total_wh',
                'licube.weight_kg',
                'licube.cycle_life_at_80dod',
                'nicd.cycle_life_typical',
                'calculations.tco_vente.savings.percentage',
                'calculations.tco_location.savings.percentage'
            ]
        };

        console.log('🔍 ValidationSystem : Module initialisé');
    }

    /**
     * Lance la validation complète du système
     * Point d'entrée principal pour tous les tests
     * 
     * @returns {Object} Rapport complet de validation
     */
    runFullValidation() {
        console.log('🚀 Démarrage validation complète...');
        
        const startTime = Date.now();
        const report = {
            timestamp: new Date().toISOString(),
            mode: this.globalsManager?.mode || 'unknown',
            tests: {},
            summary: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            recommendations: []
        };

        // === TESTS DE VALIDATION ===

        // 1. Test de déduplication
        report.tests.deduplication = this.testDeduplication();
        
        // 2. Test de cohérence des données
        report.tests.dataConsistency = this.testDataConsistency();
        
        // 3. Test de binding DOM
        report.tests.domBinding = this.testDomBinding();
        
        // 4. Test des variables obligatoires
        report.tests.requiredVariables = this.testRequiredVariables();
        
        // 5. Test des calculs dynamiques
        report.tests.dynamicCalculations = this.testDynamicCalculations();
        
        // 6. Test de performance
        report.tests.performance = this.testPerformance();

        // === COMPILATION DU RAPPORT ===
        
        this.compileTestResults(report);
        this.generateRecommendations(report);
        
        const duration = Date.now() - startTime;
        report.duration = duration;
        
        console.log(`✅ Validation terminée en ${duration}ms`);
        console.log(`📊 Résultats: ${report.summary.passed} ✅ | ${report.summary.failed} ❌ | ${report.summary.warnings} ⚠️`);
        
        // Sauvegarde locale du rapport
        this.saveValidationReport(report);
        
        return report;
    }

    /**
     * Test de déduplication - Vérifie l'unicité des variables
     * Détecte les variables dupliquées et les valeurs identiques mal mappées
     * 
     * @returns {Object} Résultats du test de déduplication
     */
    testDeduplication() {
        console.log('🔍 Test déduplication...');
        
        const test = {
            name: 'Déduplication des variables',
            passed: true,
            warnings: [],
            errors: [],
            details: {
                duplicateElements: [],
                duplicateValues: [],
                unmappedValues: []
            }
        };

        // Scan de tous les éléments avec data-pricing-value
        const elements = document.querySelectorAll('[data-pricing-value]');
        const valueMap = new Map(); // variable → éléments
        const textValueMap = new Map(); // texte affiché → éléments

        elements.forEach((element, index) => {
            const variable = element.getAttribute('data-pricing-value');
            const textContent = element.textContent?.trim() || '';
            
            // Groupement par variable
            if (!valueMap.has(variable)) {
                valueMap.set(variable, []);
            }
            valueMap.get(variable).push({
                element,
                index,
                textContent,
                location: this.getElementLocation(element)
            });

            // Groupement par contenu textuel (pour détecter doublons)
            const numericValue = this.extractNumericValue(textContent);
            if (numericValue !== null) {
                const key = `${numericValue}`;
                if (!textValueMap.has(key)) {
                    textValueMap.set(key, []);
                }
                textValueMap.get(key).push({
                    element,
                    variable,
                    location: this.getElementLocation(element)
                });
            }
        });

        // === DÉTECTION DES DOUBLONS D'ÉLÉMENTS ===
        
        valueMap.forEach((elementList, variable) => {
            if (elementList.length > 3) { // Seuil acceptable : 3 occurrences max
                test.details.duplicateElements.push({
                    variable,
                    count: elementList.length,
                    locations: elementList.map(item => item.location)
                });
                
                if (elementList.length > this.thresholds.maxDuplicateElements) {
                    test.warnings.push(`Variable "${variable}" utilisée ${elementList.length} fois (> ${this.thresholds.maxDuplicateElements})`);
                }
            }
        });

        // === DÉTECTION DES VALEURS IDENTIQUES MAL MAPPÉES ===
        
        textValueMap.forEach((elementList, numericValue) => {
            if (elementList.length > 1) {
                const uniqueVariables = new Set(elementList.map(item => item.variable));
                
                if (uniqueVariables.size > 1) {
                    test.details.duplicateValues.push({
                        value: numericValue,
                        variables: Array.from(uniqueVariables),
                        count: elementList.length,
                        elements: elementList.map(item => ({
                            variable: item.variable,
                            location: item.location
                        }))
                    });
                    
                    test.errors.push(`Valeur "${numericValue}" mappée vers ${uniqueVariables.size} variables différentes : ${Array.from(uniqueVariables).join(', ')}`);
                    test.passed = false;
                }
            }
        });

        // === SCAN DES VALEURS NON MAPPÉES ===
        
        const allTextNodes = this.getAllTextNodes();
        const unmappedNumbers = [];

        allTextNodes.forEach(node => {
            const text = node.textContent || '';
            const numbers = text.match(/\b\d+(?:\.\d+)?\b/g) || [];
            
            numbers.forEach(num => {
                const numValue = parseFloat(num);
                if (numValue > 1 && !this.isValueMapped(numValue)) {
                    unmappedNumbers.push({
                        value: numValue,
                        context: text.substring(0, 50) + '...',
                        location: this.getElementLocation(node.parentElement)
                    });
                }
            });
        });

        test.details.unmappedValues = unmappedNumbers.slice(0, 10); // Limiter à 10 résultats

        if (unmappedNumbers.length > 0) {
            test.warnings.push(`${unmappedNumbers.length} valeurs numériques non mappées détectées`);
        }

        console.log(`🔍 Déduplication: ${test.errors.length} erreurs, ${test.warnings.length} avertissements`);
        return test;
    }

    /**
     * Test de cohérence des données
     * Vérifie que les valeurs sont cohérentes entre elles
     * 
     * @returns {Object} Résultats du test de cohérence
     */
    testDataConsistency() {
        console.log('🔍 Test cohérence des données...');
        
        const test = {
            name: 'Cohérence des données',
            passed: true,
            warnings: [],
            errors: [],
            details: {
                mathematicalInconsistencies: [],
                valueRangeIssues: [],
                correctedValues: []
            }
        };

        if (!this.globalsManager?.isInitialized) {
            test.passed = false;
            test.errors.push('GlobalsManager non initialisé');
            return test;
        }

        // === VÉRIFICATIONS MATHÉMATIQUES ===
        
        // 1. Énergie = Tension × Capacité (Li-CUBE)
        const licubeVoltage = this.globalsManager.getValue('licube.voltage_nominal_v');
        const licubeCapacity = this.globalsManager.getValue('licube.capacity_ah');
        const licubeEnergy = this.globalsManager.getValue('licube.energy_total_wh');
        
        if (licubeVoltage && licubeCapacity && licubeEnergy) {
            const expectedEnergy = licubeVoltage * licubeCapacity;
            const deviation = Math.abs(expectedEnergy - licubeEnergy) / expectedEnergy * 100;
            
            if (deviation > this.thresholds.maxValueDeviation) {
                test.errors.push(`Incohérence énergie Li-CUBE: ${licubeEnergy}Wh vs ${expectedEnergy.toFixed(1)}Wh calculé (${deviation.toFixed(1)}% d'écart)`);
                test.passed = false;
                
                test.details.mathematicalInconsistencies.push({
                    field: 'licube.energy_total_wh',
                    expected: expectedEnergy,
                    actual: licubeEnergy,
                    deviation: deviation.toFixed(1) + '%'
                });
            }
        }

        // 2. Densité énergétique = Énergie / Poids
        const licubeWeight = this.globalsManager.getValue('licube.weight_kg');
        const licubeDensity = this.globalsManager.getValue('licube.energy_density_wh_per_kg');
        
        if (licubeEnergy && licubeWeight && licubeDensity) {
            const expectedDensity = licubeEnergy / licubeWeight;
            const deviation = Math.abs(expectedDensity - licubeDensity) / expectedDensity * 100;
            
            if (deviation > this.thresholds.maxValueDeviation) {
                test.warnings.push(`Densité énergétique Li-CUBE: ${licubeDensity} vs ${expectedDensity.toFixed(1)} calculé (${deviation.toFixed(1)}% d'écart)`);
                
                test.details.mathematicalInconsistencies.push({
                    field: 'licube.energy_density_wh_per_kg',
                    expected: expectedDensity,
                    actual: licubeDensity,
                    deviation: deviation.toFixed(1) + '%'
                });
            }
        }

        // === VÉRIFICATION DES PLAGES DE VALEURS ===
        
        const rangeChecks = [
            { path: 'licube.cycle_life_at_80dod', min: 5000, max: 15000, name: 'Cycles Li-CUBE' },
            { path: 'nicd.cycle_life_typical', min: 1000, max: 5000, name: 'Cycles Ni-Cd' },
            { path: 'licube.weight_kg', min: 15, max: 40, name: 'Poids Li-CUBE' },
            { path: 'nicd.weight_kg', min: 60, max: 120, name: 'Poids Ni-Cd' },
            { path: 'licube.energy_density_wh_per_kg', min: 80, max: 150, name: 'Densité Li-CUBE' },
            { path: 'nicd.energy_density_wh_per_kg', min: 20, max: 50, name: 'Densité Ni-Cd' }
        ];

        rangeChecks.forEach(check => {
            const value = this.globalsManager.getValue(check.path);
            if (value !== null && value !== undefined) {
                if (value < check.min || value > check.max) {
                    test.warnings.push(`${check.name}: ${value} hors plage attendue [${check.min}-${check.max}]`);
                    
                    test.details.valueRangeIssues.push({
                        field: check.path,
                        value,
                        expectedRange: [check.min, check.max],
                        name: check.name
                    });
                }
            }
        });

        // === VÉRIFICATION DES CORRECTIONS APPLIQUÉES ===
        
        const corrections = [
            { path: 'licube.energy_total_wh', expected: 2688, name: 'Énergie Li-CUBE corrigée' },
            { path: 'nicd.cycle_life_typical', expected: 2500, name: 'Cycles Ni-Cd corrigés' },
            { path: 'licube.energy_density_wh_per_kg', expected: 117, name: 'Densité Li-CUBE corrigée' }
        ];

        corrections.forEach(correction => {
            const value = this.globalsManager.getValue(correction.path);
            if (value === correction.expected) {
                test.details.correctedValues.push({
                    field: correction.path,
                    value: correction.expected,
                    name: correction.name,
                    status: 'Applied'
                });
            } else {
                test.warnings.push(`${correction.name}: valeur ${value} au lieu de ${correction.expected} attendu`);
            }
        });

        console.log(`🔍 Cohérence: ${test.errors.length} erreurs, ${test.warnings.length} avertissements`);
        return test;
    }

    /**
     * Test du binding DOM
     * Vérifie que tous les éléments sont correctement liés
     * 
     * @returns {Object} Résultats du test de binding
     */
    testDomBinding() {
        console.log('🔍 Test binding DOM...');
        
        const test = {
            name: 'Binding DOM',
            passed: true,
            warnings: [],
            errors: [],
            details: {
                totalElements: 0,
                boundElements: 0,
                errorElements: 0,
                unboundVariables: []
            }
        };

        // Scan de tous les éléments avec data-pricing-value
        const elements = document.querySelectorAll('[data-pricing-value]');
        test.details.totalElements = elements.length;

        let boundCount = 0;
        let errorCount = 0;
        const unboundVariables = new Set();

        elements.forEach(element => {
            const variable = element.getAttribute('data-pricing-value');
            const format = element.getAttribute('data-pricing-format') || 'number';
            
            if (element.classList.contains('globals-bound')) {
                boundCount++;
            } else if (element.classList.contains('globals-error')) {
                errorCount++;
                unboundVariables.add(variable);
            } else {
                // Vérifier si la variable existe dans le système
                const value = this.globalsManager?.getValue(variable);
                if (value === null || value === undefined) {
                    unboundVariables.add(variable);
                }
            }
        });

        test.details.boundElements = boundCount;
        test.details.errorElements = errorCount;
        test.details.unboundVariables = Array.from(unboundVariables);

        // Calcul de la couverture
        const coverage = elements.length > 0 ? (boundCount / elements.length) * 100 : 0;
        
        if (coverage < this.thresholds.minBindingCoverage) {
            test.passed = false;
            test.errors.push(`Couverture binding insuffisante: ${coverage.toFixed(1)}% < ${this.thresholds.minBindingCoverage}%`);
        }

        if (unboundVariables.size > 0) {
            test.warnings.push(`${unboundVariables.size} variables non liées détectées`);
        }

        console.log(`🔍 Binding: ${coverage.toFixed(1)}% couverture, ${boundCount}/${elements.length} éléments liés`);
        return test;
    }

    /**
     * Test des variables obligatoires
     * Vérifie que toutes les variables requises sont présentes
     * 
     * @returns {Object} Résultats du test des variables
     */
    testRequiredVariables() {
        console.log('🔍 Test variables obligatoires...');
        
        const test = {
            name: 'Variables obligatoires',
            passed: true,
            warnings: [],
            errors: [],
            details: {
                requiredCount: this.thresholds.requiredVariables.length,
                presentCount: 0,
                missingVariables: []
            }
        };

        if (!this.globalsManager?.isInitialized) {
            test.passed = false;
            test.errors.push('GlobalsManager non initialisé');
            return test;
        }

        let presentCount = 0;
        const missingVariables = [];

        this.thresholds.requiredVariables.forEach(variable => {
            const value = this.globalsManager.getValue(variable);
            
            if (value !== null && value !== undefined && value !== 0) {
                presentCount++;
            } else {
                missingVariables.push(variable);
            }
        });

        test.details.presentCount = presentCount;
        test.details.missingVariables = missingVariables;

        if (missingVariables.length > 0) {
            test.passed = false;
            test.errors.push(`${missingVariables.length} variables obligatoires manquantes: ${missingVariables.join(', ')}`);
        }

        console.log(`🔍 Variables: ${presentCount}/${this.thresholds.requiredVariables.length} présentes`);
        return test;
    }

    /**
     * Test des calculs dynamiques
     * Vérifie que le système de calculs fonctionne
     * 
     * @returns {Object} Résultats du test des calculs
     */
    testDynamicCalculations() {
        console.log('🔍 Test calculs dynamiques...');
        
        const test = {
            name: 'Calculs dynamiques',
            passed: true,
            warnings: [],
            errors: [],
            details: {
                calculationsActive: false,
                calculationResults: {}
            }
        };

        if (!this.dynamicCalculations) {
            test.warnings.push('Module DynamicCalculations non disponible pour les tests');
            return test;
        }

        test.details.calculationsActive = this.dynamicCalculations.isActive;
        
        if (!this.dynamicCalculations.isActive) {
            test.warnings.push('Calculs dynamiques non activés');
        } else {
            // Récupérer les statistiques des calculs
            const stats = this.dynamicCalculations.getCalculationStats();
            test.details.calculationResults = stats.currentCalculations;
        }

        console.log(`🔍 Calculs: ${this.dynamicCalculations.isActive ? 'actifs' : 'inactifs'}`);
        return test;
    }

    /**
     * Test de performance
     * Mesure les performances du système
     * 
     * @returns {Object} Résultats du test de performance
     */
    testPerformance() {
        console.log('🔍 Test performance...');
        
        const test = {
            name: 'Performance',
            passed: true,
            warnings: [],
            errors: [],
            details: {
                bindingTime: 0,
                calculationTime: 0,
                memoryUsage: 0
            }
        };

        // Test temps de binding
        const bindingStart = performance.now();
        const elements = document.querySelectorAll('[data-pricing-value]');
        const bindingEnd = performance.now();
        
        test.details.bindingTime = bindingEnd - bindingStart;
        
        if (test.details.bindingTime > 100) {
            test.warnings.push(`Binding lent: ${test.details.bindingTime.toFixed(2)}ms pour ${elements.length} éléments`);
        }

        // Estimation mémoire
        if (performance.memory) {
            test.details.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }

        console.log(`🔍 Performance: binding ${test.details.bindingTime.toFixed(2)}ms`);
        return test;
    }

    // === MÉTHODES UTILITAIRES ===

    /**
     * Compile les résultats de tous les tests
     * 
     * @param {Object} report - Rapport à compiler
     */
    compileTestResults(report) {
        let totalTests = 0;
        let passed = 0;
        let failed = 0;
        let warnings = 0;

        Object.values(report.tests).forEach(test => {
            totalTests++;
            if (test.passed) {
                passed++;
            } else {
                failed++;
            }
            warnings += test.warnings.length;
        });

        report.summary = { totalTests, passed, failed, warnings };
    }

    /**
     * Génère les recommandations basées sur les résultats
     * 
     * @param {Object} report - Rapport pour lequel générer les recommandations
     */
    generateRecommendations(report) {
        const recommendations = [];

        // Recommandations basées sur les tests
        Object.values(report.tests).forEach(test => {
            if (!test.passed) {
                recommendations.push({
                    priority: 'HIGH',
                    type: 'ERROR',
                    message: `Corriger les erreurs dans ${test.name}`,
                    details: test.errors
                });
            }
            
            if (test.warnings.length > 0) {
                recommendations.push({
                    priority: 'MEDIUM',
                    type: 'WARNING',
                    message: `Examiner les avertissements dans ${test.name}`,
                    details: test.warnings
                });
            }
        });

        // Recommandations spécifiques
        if (report.tests.deduplication?.details.duplicateValues.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                type: 'OPTIMIZATION',
                message: 'Unifie les valeurs identiques vers une seule variable',
                details: 'Plusieurs valeurs identiques pointent vers des variables différentes'
            });
        }

        if (report.tests.domBinding?.details.boundElements < report.tests.domBinding?.details.totalElements * 0.9) {
            recommendations.push({
                priority: 'MEDIUM',
                type: 'PERFORMANCE',
                message: 'Améliorer la couverture du binding DOM',
                details: 'Plusieurs éléments ne sont pas correctement liés'
            });
        }

        report.recommendations = recommendations;
    }

    /**
     * Sauvegarde le rapport de validation
     * 
     * @param {Object} report - Rapport à sauvegarder
     */
    saveValidationReport(report) {
        try {
            if (typeof localStorage !== 'undefined') {
                const key = `validation-report-${report.timestamp}`;
                localStorage.setItem(key, JSON.stringify(report));
                localStorage.setItem('latest-validation-report', JSON.stringify(report));
                
                console.log(`💾 Rapport sauvegardé: ${key}`);
            }
        } catch (error) {
            console.warn('⚠️  Impossible de sauvegarder le rapport:', error);
        }
    }

    // === MÉTHODES HELPER ===

    getElementLocation(element) {
        if (!element) return 'unknown';
        
        const tag = element.tagName?.toLowerCase() || 'unknown';
        const className = element.className || '';
        const id = element.id || '';
        
        return `${tag}${id ? `#${id}` : ''}${className ? `.${className.split(' ').join('.')}` : ''}`;
    }

    extractNumericValue(text) {
        const match = text.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : null;
    }

    getAllTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.textContent?.trim()) {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    }

    isValueMapped(value) {
        // Vérifier si une valeur numérique est déjà mappée dans le système
        const elements = document.querySelectorAll('[data-pricing-value]');
        
        for (const element of elements) {
            const displayedValue = this.extractNumericValue(element.textContent || '');
            if (displayedValue === value) {
                return true;
            }
        }
        
        return false;
    }
}

/**
 * Fonction d'initialisation globale
 */
function initializeValidationSystem() {
    window.addEventListener('dynamic-calculations-ready', (event) => {
        const calculator = event.detail.calculator;
        const globalsManager = window.globalsManager;
        
        if (globalsManager) {
            console.log('🔍 Initialisation ValidationSystem...');
            
            const validator = new ValidationSystem(globalsManager, calculator);
            window.validationSystem = validator;
            
            console.log('✅ ValidationSystem prêt et disponible globalement');
            
            // Lancer une validation automatique après 2 secondes
            setTimeout(() => {
                const report = validator.runFullValidation();
                console.log('📊 Validation automatique terminée:', report);
            }, 2000);
        }
    });
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', initializeValidationSystem);

/**
 * Export pour utilisation moderne
 */
export { ValidationSystem };

/**
 * Disponibilité globale pour compatibilité legacy
 */
window.ValidationSystem = ValidationSystem;
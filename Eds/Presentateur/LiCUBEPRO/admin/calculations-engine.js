/**
 * =====================================================================
 * MOTEUR DE CALCULS TRAÇABLES Li-CUBE PRO™
 * =====================================================================
 * 
 * Système complet de calculs dynamiques avec:
 * - Formules mathématiques traçables
 * - Dépendances automatiques
 * - Validation des résultats
 * - Cache intelligent
 * - Historique des changements
 * 
 * Créé par Claude Code - Janvier 2025
 */

class CalculationsEngine {
    constructor(config = null) {
        this.config = config || {};
        this.cache = new Map();
        this.dependencies = new Map();
        this.calculationHistory = [];
        this.validationRules = new Map();
        
        this.setupCalculationFormulas();
        this.setupValidationRules();
        
        console.log('🧮 Moteur de calculs traçables initialisé');
    }
    
    /**
     * Configuration de toutes les formules de calcul
     */
    setupCalculationFormulas() {
        this.formulas = {
            // ========== CALCULS DE BASE ==========
            
            'modes.vente.licube.price_total': {
                name: 'Prix total Li-CUBE (vente)',
                description: 'Prix de vente TTC avec installation',
                formula: '(price_base * (1 + taxes_percent/100)) + installation_cost',
                dependencies: [
                    'modes.vente.licube.price_base',
                    'modes.vente.licube.taxes_percent', 
                    'modes.vente.licube.installation_cost'
                ],
                unit: 'CAD',
                category: 'pricing',
                calculate: (config) => {
                    const base = this.getValue(config, 'modes.vente.licube.price_base');
                    const taxes = this.getValue(config, 'modes.vente.licube.taxes_percent');
                    const installation = this.getValue(config, 'modes.vente.licube.installation_cost');
                    
                    return Math.round((base * (1 + taxes/100)) + installation);
                }
            },
            
            'modes.vente.nicd.price_total': {
                name: 'Prix total Ni-Cd (vente)',
                description: 'Prix de vente Ni-Cd TTC avec installation',
                formula: '(price_base * (1 + taxes_percent/100)) + installation_cost',
                dependencies: [
                    'modes.vente.nicd.price_base',
                    'modes.vente.nicd.taxes_percent',
                    'modes.vente.nicd.installation_cost'
                ],
                unit: 'CAD',
                category: 'pricing',
                calculate: (config) => {
                    const base = this.getValue(config, 'modes.vente.nicd.price_base');
                    const taxes = this.getValue(config, 'modes.vente.nicd.taxes_percent');
                    const installation = this.getValue(config, 'modes.vente.nicd.installation_cost');
                    
                    return Math.round((base * (1 + taxes/100)) + installation);
                }
            },
            
            // ========== CALCULS TCO 20 ANS ==========
            
            'calculations.tco_vente.licube.total_20_years': {
                name: 'TCO Li-CUBE 20 ans (vente)',
                description: 'Coût total de possession Li-CUBE sur 20 ans',
                formula: 'price_total + (monitoring_monthly * 12 * 20) + (maintenance_annual * 20)',
                dependencies: [
                    'modes.vente.licube.price_total',
                    'modes.vente.licube.monitoring_monthly',
                    'modes.vente.licube.maintenance_annual'
                ],
                unit: 'CAD',
                category: 'tco',
                calculate: (config) => {
                    const priceTotal = this.calculateValue(config, 'modes.vente.licube.price_total');
                    const monitoring = this.getValue(config, 'modes.vente.licube.monitoring_monthly');
                    const maintenance = this.getValue(config, 'modes.vente.licube.maintenance_annual');
                    
                    const monitoringCost = monitoring * 12 * 20; // 20 ans
                    const maintenanceCost = maintenance * 20; // 20 ans
                    
                    return Math.round(priceTotal + monitoringCost + maintenanceCost);
                }
            },
            
            'calculations.tco_vente.nicd.total_20_years': {
                name: 'TCO Ni-Cd 20 ans (vente)',
                description: 'Coût total de possession Ni-Cd sur 20 ans avec remplacements',
                formula: 'price_total + (maintenance_annual * 20) + replacement_costs_over_20_years',
                dependencies: [
                    'modes.vente.nicd.price_total',
                    'modes.vente.nicd.maintenance_annual',
                    'modes.vente.nicd.replacement_cycle_years',
                    'modes.vente.nicd.price_base'
                ],
                unit: 'CAD',
                category: 'tco',
                calculate: (config) => {
                    const priceTotal = this.calculateValue(config, 'modes.vente.nicd.price_total');
                    const maintenanceAnnual = this.getValue(config, 'modes.vente.nicd.maintenance_annual');
                    const replacementCycle = this.getValue(config, 'modes.vente.nicd.replacement_cycle_years');
                    const basePrice = this.getValue(config, 'modes.vente.nicd.price_base');
                    
                    const maintenanceCost = maintenanceAnnual * 20; // 20 ans de maintenance
                    const replacements = Math.floor(20 / replacementCycle); // Nombre de remplacements
                    const replacementCosts = replacements * basePrice;
                    
                    return Math.round(priceTotal + maintenanceCost + replacementCosts);
                }
            },
            
            'calculations.tco_location.licube.total_20_years': {
                name: 'TCO Li-CUBE 20 ans (location)',
                description: 'Coût total location Li-CUBE sur 20 ans',
                formula: 'monthly_rate * 12 * 20',
                dependencies: [
                    'modes.location.licube.monthly_rate'
                ],
                unit: 'CAD',
                category: 'tco',
                calculate: (config) => {
                    const monthlyRate = this.getValue(config, 'modes.location.licube.monthly_rate');
                    return Math.round(monthlyRate * 12 * 20);
                }
            },
            
            'calculations.tco_location.nicd.total_20_years': {
                name: 'TCO Ni-Cd 20 ans (location)',
                description: 'Coût total location Ni-Cd sur 20 ans',
                formula: 'monthly_rate * 12 * 20 + additional_maintenance_costs',
                dependencies: [
                    'modes.location.nicd.monthly_rate',
                    'modes.location.nicd.maintenance_annual'
                ],
                unit: 'CAD',
                category: 'tco',
                calculate: (config) => {
                    const monthlyRate = this.getValue(config, 'modes.location.nicd.monthly_rate');
                    const maintenanceAnnual = this.getValue(config, 'modes.location.nicd.maintenance_annual') || 0;
                    
                    const locationCost = monthlyRate * 12 * 20;
                    const maintenanceCost = maintenanceAnnual * 20;
                    
                    return Math.round(locationCost + maintenanceCost);
                }
            },
            
            // ========== CALCULS D'ÉCONOMIES ==========
            
            'calculations.tco_vente.savings.total': {
                name: 'Économies totales (vente)',
                description: 'Économies absolues Li-CUBE vs Ni-Cd en mode vente',
                formula: 'tco_nicd_20_years - tco_licube_20_years',
                dependencies: [
                    'calculations.tco_vente.nicd.total_20_years',
                    'calculations.tco_vente.licube.total_20_years'
                ],
                unit: 'CAD',
                category: 'savings',
                calculate: (config) => {
                    const tcoNicd = this.calculateValue(config, 'calculations.tco_vente.nicd.total_20_years');
                    const tcoLicube = this.calculateValue(config, 'calculations.tco_vente.licube.total_20_years');
                    
                    return Math.max(0, Math.round(tcoNicd - tcoLicube));
                }
            },
            
            'calculations.tco_vente.savings.percentage': {
                name: 'Pourcentage économies (vente)',
                description: 'Pourcentage d\'économies Li-CUBE vs Ni-Cd',
                formula: '((tco_nicd - tco_licube) / tco_nicd) * 100',
                dependencies: [
                    'calculations.tco_vente.nicd.total_20_years',
                    'calculations.tco_vente.licube.total_20_years'
                ],
                unit: '%',
                category: 'savings',
                calculate: (config) => {
                    const tcoNicd = this.calculateValue(config, 'calculations.tco_vente.nicd.total_20_years');
                    const tcoLicube = this.calculateValue(config, 'calculations.tco_vente.licube.total_20_years');
                    
                    if (tcoNicd === 0) return 0;
                    return Math.max(0, Math.round(((tcoNicd - tcoLicube) / tcoNicd) * 100));
                }
            },
            
            'calculations.tco_vente.savings.roi_years': {
                name: 'Retour sur investissement (années)',
                description: 'Nombre d\'années pour récupérer l\'investissement supplémentaire',
                formula: 'investment_difference / annual_savings',
                dependencies: [
                    'modes.vente.licube.price_total',
                    'modes.vente.nicd.price_total',
                    'calculations.tco_vente.savings.total'
                ],
                unit: 'années',
                category: 'roi',
                calculate: (config) => {
                    const licubePrice = this.calculateValue(config, 'modes.vente.licube.price_total');
                    const nicdPrice = this.calculateValue(config, 'modes.vente.nicd.price_total');
                    const totalSavings = this.calculateValue(config, 'calculations.tco_vente.savings.total');
                    
                    const investmentDiff = Math.max(0, licubePrice - nicdPrice);
                    const annualSavings = totalSavings / 20;
                    
                    if (annualSavings === 0) return 999;
                    return Math.round((investmentDiff / annualSavings) * 10) / 10; // 1 décimale
                }
            },
            
            'calculations.tco_location.savings.total': {
                name: 'Économies totales (location)',
                description: 'Économies absolues en mode location',
                formula: 'tco_location_nicd - tco_location_licube',
                dependencies: [
                    'calculations.tco_location.nicd.total_20_years',
                    'calculations.tco_location.licube.total_20_years'
                ],
                unit: 'CAD',
                category: 'savings',
                calculate: (config) => {
                    const tcoNicd = this.calculateValue(config, 'calculations.tco_location.nicd.total_20_years');
                    const tcoLicube = this.calculateValue(config, 'calculations.tco_location.licube.total_20_years');
                    
                    return Math.max(0, Math.round(tcoNicd - tcoLicube));
                }
            },
            
            'calculations.tco_location.savings.percentage': {
                name: 'Pourcentage économies (location)',
                description: 'Pourcentage d\'économies en mode location',
                formula: '((tco_location_nicd - tco_location_licube) / tco_location_nicd) * 100',
                dependencies: [
                    'calculations.tco_location.nicd.total_20_years',
                    'calculations.tco_location.licube.total_20_years'
                ],
                unit: '%',
                category: 'savings',
                calculate: (config) => {
                    const tcoNicd = this.calculateValue(config, 'calculations.tco_location.nicd.total_20_years');
                    const tcoLicube = this.calculateValue(config, 'calculations.tco_location.licube.total_20_years');
                    
                    if (tcoNicd === 0) return 0;
                    return Math.max(0, Math.round(((tcoNicd - tcoLicube) / tcoNicd) * 100));
                }
            },
            
            'calculations.tco_location.savings.roi_months': {
                name: 'ROI location (mois)',
                description: 'Retour sur investissement en mois pour la location',
                formula: 'break_even_calculation_for_location',
                dependencies: [
                    'modes.location.licube.monthly_rate',
                    'modes.location.nicd.monthly_rate'
                ],
                unit: 'mois',
                category: 'roi',
                calculate: (config) => {
                    const licubeMonthly = this.getValue(config, 'modes.location.licube.monthly_rate');
                    const nicdMonthly = this.getValue(config, 'modes.location.nicd.monthly_rate');
                    
                    const monthlySavings = Math.max(0, nicdMonthly - licubeMonthly);
                    
                    // Pour la location, le ROI est immédiat si Li-CUBE coûte moins cher
                    return licubeMonthly < nicdMonthly ? 1 : 12;
                }
            },
            
            'calculations.tco_general.savings.roi_years': {
                name: 'ROI général (années)',
                description: 'Retour sur investissement général',
                formula: 'weighted_average_roi_vente_location',
                dependencies: [
                    'calculations.tco_vente.savings.roi_years'
                ],
                unit: 'années',
                category: 'roi',
                calculate: (config) => {
                    // Pour l'instant, on utilise le ROI de vente comme référence
                    return this.calculateValue(config, 'calculations.tco_vente.savings.roi_years');
                }
            }
        };
        
        // Générer automatiquement le graphe de dépendances
        this.buildDependencyGraph();
    }
    
    /**
     * Configuration des règles de validation
     */
    setupValidationRules() {
        this.validationRules.set('price_consistency', {
            name: 'Cohérence des prix',
            description: 'Les prix Li-CUBE doivent être inférieurs aux prix Ni-Cd',
            validate: (config) => {
                const licubePrice = this.getValue(config, 'modes.vente.licube.price_base');
                const nicdPrice = this.getValue(config, 'modes.vente.nicd.price_base');
                
                if (licubePrice >= nicdPrice) {
                    return {
                        valid: false,
                        message: `Prix Li-CUBE (${licubePrice}$) >= Prix Ni-Cd (${nicdPrice}$)`
                    };
                }
                
                return { valid: true };
            }
        });
        
        this.validationRules.set('cycles_superiority', {
            name: 'Supériorité des cycles',
            description: 'Les cycles Li-CUBE doivent être supérieurs aux cycles Ni-Cd',
            validate: (config) => {
                const licubeCycles = this.getValue(config, 'modes.vente.licube.cycles');
                const nicdCycles = this.getValue(config, 'modes.vente.nicd.cycles');
                
                if (licubeCycles <= nicdCycles) {
                    return {
                        valid: false,
                        message: `Cycles Li-CUBE (${licubeCycles}) <= Cycles Ni-Cd (${nicdCycles})`
                    };
                }
                
                return { valid: true };
            }
        });
        
        this.validationRules.set('tax_rate_validity', {
            name: 'Taux de taxe valide',
            description: 'Le taux de taxe doit être réaliste',
            validate: (config) => {
                const taxRate = this.getValue(config, 'modes.vente.licube.taxes_percent');
                
                if (taxRate < 0 || taxRate > 25) {
                    return {
                        valid: false,
                        message: `Taux de taxe (${taxRate}%) invalide (doit être 0-25%)`
                    };
                }
                
                return { valid: true };
            }
        });
        
        this.validationRules.set('positive_savings', {
            name: 'Économies positives',
            description: 'Les économies calculées doivent être positives',
            validate: (config) => {
                const savings = this.calculateValue(config, 'calculations.tco_vente.savings.total');
                const percentage = this.calculateValue(config, 'calculations.tco_vente.savings.percentage');
                
                if (savings <= 0 || percentage <= 0) {
                    return {
                        valid: false,
                        message: `Économies négatives: ${savings}$ (${percentage}%)`
                    };
                }
                
                return { valid: true };
            }
        });
    }
    
    /**
     * Construction du graphe de dépendances
     */
    buildDependencyGraph() {
        this.dependencies.clear();
        
        Object.keys(this.formulas).forEach(formulaKey => {
            const formula = this.formulas[formulaKey];
            
            formula.dependencies.forEach(dependency => {
                if (!this.dependencies.has(dependency)) {
                    this.dependencies.set(dependency, new Set());
                }
                this.dependencies.get(dependency).add(formulaKey);
            });
        });
        
        console.log(`📊 Graphe de dépendances construit: ${this.dependencies.size} nœuds`);
    }
    
    /**
     * Obtenir une valeur directe de la configuration
     */
    getValue(config, path) {
        const parts = path.split('.');
        let current = config;
        
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                console.warn(`⚠️ Valeur manquante: ${path}`);
                return 0; // Valeur par défaut
            }
        }
        
        return current;
    }
    
    /**
     * Calculer une valeur avec mise en cache
     */
    calculateValue(config, path) {
        // Vérifier le cache
        const cacheKey = `${path}_${this.getConfigHash(config)}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        
        let result;
        
        if (this.formulas[path]) {
            // Calculer avec la formule
            try {
                result = this.formulas[path].calculate(config);
                console.log(`🧮 Calculé ${path}: ${result}`);
            } catch (error) {
                console.error(`❌ Erreur calcul ${path}:`, error);
                result = 0;
            }
        } else {
            // Valeur directe
            result = this.getValue(config, path);
        }
        
        // Mettre en cache
        this.cache.set(cacheKey, result);
        
        // Enregistrer dans l'historique
        this.calculationHistory.push({
            path,
            result,
            timestamp: Date.now(),
            configHash: this.getConfigHash(config)
        });
        
        return result;
    }
    
    /**
     * Recalculer toutes les valeurs dépendantes d'un chemin
     */
    recalculateDependents(config, changedPath) {
        const dependents = this.dependencies.get(changedPath);
        if (!dependents) return [];
        
        const recalculated = [];
        
        dependents.forEach(dependentPath => {
            // Vider le cache pour cette valeur
            this.clearCache(dependentPath);
            
            // Recalculer
            const newValue = this.calculateValue(config, dependentPath);
            recalculated.push({
                path: dependentPath,
                value: newValue
            });
            
            // Recalculer récursivement les dépendants de cette valeur
            const subDependents = this.recalculateDependents(config, dependentPath);
            recalculated.push(...subDependents);
        });
        
        return recalculated;
    }
    
    /**
     * Vider le cache pour un chemin spécifique
     */
    clearCache(path = null) {
        if (path) {
            // Vider le cache pour un chemin spécifique
            const keysToDelete = [];
            this.cache.forEach((value, key) => {
                if (key.startsWith(path + '_')) {
                    keysToDelete.push(key);
                }
            });
            keysToDelete.forEach(key => this.cache.delete(key));
        } else {
            // Vider tout le cache
            this.cache.clear();
        }
    }
    
    /**
     * Obtenir le hash de la configuration pour le cache
     */
    getConfigHash(config) {
        return JSON.stringify(config).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
    }
    
    /**
     * Obtenir les informations d'une formule
     */
    getFormulaInfo(path) {
        return this.formulas[path] || null;
    }
    
    /**
     * Obtenir toutes les formules d'une catégorie
     */
    getFormulasByCategory(category) {
        const formulas = {};
        
        Object.keys(this.formulas).forEach(key => {
            if (this.formulas[key].category === category) {
                formulas[key] = this.formulas[key];
            }
        });
        
        return formulas;
    }
    
    /**
     * Valider toute la configuration
     */
    validateConfiguration(config) {
        const results = [];
        
        this.validationRules.forEach((rule, ruleId) => {
            try {
                const result = rule.validate(config);
                results.push({
                    ruleId,
                    name: rule.name,
                    description: rule.description,
                    valid: result.valid,
                    message: result.message || null
                });
            } catch (error) {
                results.push({
                    ruleId,
                    name: rule.name,
                    description: rule.description,
                    valid: false,
                    message: `Erreur de validation: ${error.message}`
                });
            }
        });
        
        const allValid = results.every(r => r.valid);
        const errors = results.filter(r => !r.valid);
        
        return {
            valid: allValid,
            results: results,
            errors: errors,
            summary: {
                total: results.length,
                passed: results.length - errors.length,
                failed: errors.length
            }
        };
    }
    
    /**
     * Obtenir l'historique des calculs
     */
    getCalculationHistory(path = null, limit = 50) {
        let history = this.calculationHistory;
        
        if (path) {
            history = history.filter(entry => entry.path === path);
        }
        
        return history
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
    
    /**
     * Exporter toutes les formules et résultats
     */
    exportCalculations(config) {
        const exportData = {
            metadata: {
                timestamp: new Date().toISOString(),
                configHash: this.getConfigHash(config),
                totalFormulas: Object.keys(this.formulas).length
            },
            formulas: {},
            results: {},
            validation: this.validateConfiguration(config)
        };
        
        // Exporter les formulas avec leurs résultats
        Object.keys(this.formulas).forEach(path => {
            const formula = this.formulas[path];
            const result = this.calculateValue(config, path);
            
            exportData.formulas[path] = {
                name: formula.name,
                description: formula.description,
                formula: formula.formula,
                dependencies: formula.dependencies,
                unit: formula.unit,
                category: formula.category
            };
            
            exportData.results[path] = {
                value: result,
                formatted: this.formatValue(result, formula.unit),
                calculatedAt: Date.now()
            };
        });
        
        return exportData;
    }
    
    /**
     * Formater une valeur selon son unité
     */
    formatValue(value, unit = '') {
        if (typeof value !== 'number' || isNaN(value)) {
            return 'N/A';
        }
        
        switch (unit) {
            case 'CAD':
            case '$':
                return `${Math.round(value).toLocaleString('fr-CA')} $ CAD`;
            case '%':
                return `${Math.round(value)}%`;
            case 'années':
            case 'ans':
                return `${value} an${value > 1 ? 's' : ''}`;
            case 'mois':
                return `${value} mois`;
            default:
                return `${Math.round(value).toLocaleString('fr-CA')}${unit ? ' ' + unit : ''}`;
        }
    }
    
    /**
     * Obtenir un résumé des performances
     */
    getPerformanceStats() {
        return {
            cacheSize: this.cache.size,
            calculationCount: this.calculationHistory.length,
            dependencyNodes: this.dependencies.size,
            formulaCount: Object.keys(this.formulas).length,
            validationRules: this.validationRules.size
        };
    }
    
    /**
     * Réinitialiser le moteur de calculs
     */
    reset() {
        this.cache.clear();
        this.calculationHistory = [];
        console.log('🔄 Moteur de calculs réinitialisé');
    }
}

// Export pour utilisation
if (typeof window !== 'undefined') {
    window.CalculationsEngine = CalculationsEngine;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculationsEngine;
}
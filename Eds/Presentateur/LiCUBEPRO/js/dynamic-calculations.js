/**
 * =================================================================
 * CALCULS DYNAMIQUES - BADGES D'ÉCONOMIES & MÉTRIQUES
 * =================================================================
 * 
 * Rôle : Module de calculs en temps réel pour les badges d'économies,
 *        les pourcentages TCO, et toutes les métriques dérivées
 * 
 * Fonctionnalités :
 * - Calcul automatique des % d'économies selon mode vente/location
 * - Mise à jour des badges en temps réel
 * - Recalcul automatique lors de changements de données
 * - Synchronisation avec GlobalsManager
 * 
 * Utilisation :
 *   import { DynamicCalculations } from './dynamic-calculations.js';
 *   const calc = new DynamicCalculations(globalsManager);
 * 
 * @author Claude Code - EDS Québec
 * @version 2.0.0
 * @licence Propriétaire EDS Québec
 */

/**
 * Classe principale pour les calculs dynamiques
 * Gère tous les calculs dérivés et leur synchronisation
 */
class DynamicCalculations {
    constructor(globalsManager) {
        this.globalsManager = globalsManager;
        this.isActive = false;
        this.calculationQueue = new Set(); // File d'attente des calculs
        this.debounceTimer = null;          // Timer pour grouper les calculs

        // Configuration des calculs
        this.calculationRules = this.initializeCalculationRules();
        
        // Écouteurs de changements
        this.listeners = new Map();

        console.log('🧮 DynamicCalculations : Module initialisé');
    }

    /**
     * Initialise les règles de calculs dynamiques
     * Définit quels champs dépendent de quels autres champs
     * 
     * @returns {Map} Règles de calculs
     */
    initializeCalculationRules() {
        const rules = new Map();

        // === CALCULS TCO (vente/location) ===
        
        // Pourcentage d'économies : (nicd - licube) / nicd * 100 (peut être négatif)
        rules.set('tco_savings_percentage', {
            dependencies: ['licube.total_20_years', 'nicd.total_20_years'],
            formula: (licubeTotal, nicdTotal) => {
                if (!nicdTotal || nicdTotal <= 0) return 0;
                const savings = nicdTotal - licubeTotal;
                return Math.round((savings / nicdTotal) * 100 * 10) / 10; // 1 décimale, peut être négatif
            },
            targets: ['calculations.tco_vente.savings.percentage', 'calculations.tco_location.savings.percentage'],
            description: 'Pourcentage d\'économies/surcoût TCO sur 20 ans'
        });

        // Montant total économisé : nicd - licube (peut être négatif)
        rules.set('tco_savings_amount', {
            dependencies: ['licube.total_20_years', 'nicd.total_20_years'],
            formula: (licubeTotal, nicdTotal) => {
                return nicdTotal - licubeTotal; // Peut être négatif (surcoût)
            },
            targets: ['calculations.tco_vente.savings.total', 'calculations.tco_location.savings.total'],
            description: 'Montant total des économies/surcoût sur 20 ans'
        });

        // === CALCULS PHYSIQUES ===

        // Réduction de poids : (nicd_weight - licube_weight) / nicd_weight * 100
        rules.set('weight_reduction_percentage', {
            dependencies: ['licube.weight_kg', 'nicd.weight_kg'],
            formula: (licubeWeight, nicdWeight) => {
                if (!nicdWeight || nicdWeight <= 0) return 0;
                const reduction = ((nicdWeight - licubeWeight) / nicdWeight) * 100;
                return Math.round(reduction);
            },
            targets: ['licube.weight_reduction_percentage'],
            description: 'Pourcentage de réduction de poids vs Ni-Cd'
        });

        // Densité énergétique Li-CUBE : énergie / poids
        rules.set('licube_energy_density', {
            dependencies: ['licube.energy_total_wh', 'licube.weight_kg'],
            formula: (energy, weight) => {
                if (!weight || weight <= 0) return 0;
                return Math.round(energy / weight);
            },
            targets: ['licube.energy_density_wh_per_kg'],
            description: 'Densité énergétique Li-CUBE en Wh/kg'
        });

        // Densité énergétique Ni-Cd : énergie / poids
        rules.set('nicd_energy_density', {
            dependencies: ['nicd.energy_total_wh', 'nicd.weight_kg'],
            formula: (energy, weight) => {
                if (!weight || weight <= 0) return 0;
                return Math.round(energy / weight);
            },
            targets: ['nicd.energy_density_wh_per_kg'],
            description: 'Densité énergétique Ni-Cd en Wh/kg'
        });

        // === CALCULS AVANCÉS ===

        // Ratio de durabilité : licube_cycles / nicd_cycles
        rules.set('durability_ratio', {
            dependencies: ['licube.cycle_life_at_80dod', 'nicd.cycle_life_typical'],
            formula: (licubeCycles, nicdCycles) => {
                if (!nicdCycles || nicdCycles <= 0) return 0;
                return Math.round((licubeCycles / nicdCycles) * 10) / 10; // 1 décimale
            },
            targets: ['calculations.durability_ratio'],
            description: 'Ratio de durabilité Li-CUBE vs Ni-Cd'
        });

        console.log(`📐 ${rules.size} règles de calculs initialisées`);
        return rules;
    }

    /**
     * Active le système de calculs dynamiques
     * Lance les calculs initiaux et configure les écouteurs
     * 
     * @returns {boolean} Succès de l'activation
     */
    activate() {
        if (this.isActive) {
            console.log('⚠️  DynamicCalculations déjà actif');
            return true;
        }

        if (!this.globalsManager?.isInitialized) {
            console.error('❌ GlobalsManager non initialisé, impossible d\'activer les calculs');
            return false;
        }

        try {
            // Configuration des écouteurs de changements
            this.setupChangeListeners();

            // Calculs initiaux
            this.performAllCalculations();

            // Mise à jour des éléments DOM
            this.updateAllBadges();

            this.isActive = true;
            console.log('✅ DynamicCalculations : Système activé');
            
            // Event personnalisé pour notifier l'activation
            window.dispatchEvent(new CustomEvent('dynamic-calculations-ready', {
                detail: { calculator: this }
            }));

            return true;

        } catch (error) {
            console.error('❌ Erreur activation DynamicCalculations:', error);
            return false;
        }
    }

    /**
     * Configure les écouteurs de changements sur les données sources
     * Déclenche les recalculs automatiquement
     */
    setupChangeListeners() {
        // Écouter les changements dans GlobalsManager
        const watchedPaths = new Set();

        this.calculationRules.forEach((rule, key) => {
            rule.dependencies.forEach(dep => {
                watchedPaths.add(dep);
            });
        });

        // Ajouter des écouteurs pour chaque chemin surveillé
        watchedPaths.forEach(path => {
            this.globalsManager.addListener(path, (value, changedPath) => {
                console.log(`📊 Changement détecté: ${changedPath} = ${value}`);
                this.scheduleCalculation(changedPath);
            });
        });

        console.log(`👂 ${watchedPaths.size} écouteurs de changements configurés`);
    }

    /**
     * Programme un calcul avec debouncing
     * Évite les calculs trop fréquents
     * 
     * @param {string} triggerPath - Chemin qui a déclenché le calcul
     */
    scheduleCalculation(triggerPath) {
        this.calculationQueue.add(triggerPath);

        // Debouncing : attendre 100ms avant de calculer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            this.performQueuedCalculations();
            this.calculationQueue.clear();
        }, 100);
    }

    /**
     * Effectue tous les calculs initiaux
     * Lance tous les calculs une première fois
     */
    performAllCalculations() {
        console.log('🔄 Démarrage de tous les calculs...');

        this.calculationRules.forEach((rule, key) => {
            try {
                this.performCalculation(key, rule);
            } catch (error) {
                console.error(`❌ Erreur calcul ${key}:`, error);
            }
        });

        console.log('✅ Tous les calculs initiaux terminés');
    }

    /**
     * Effectue les calculs en file d'attente
     * Optimise en ne calculant que les règles affectées
     */
    performQueuedCalculations() {
        const affectedRules = new Set();

        // Identifier les règles affectées par les changements
        this.calculationQueue.forEach(changedPath => {
            this.calculationRules.forEach((rule, key) => {
                if (rule.dependencies.some(dep => changedPath.includes(dep))) {
                    affectedRules.add(key);
                }
            });
        });

        console.log(`🔄 Recalcul de ${affectedRules.size} règles affectées...`);

        // Effectuer les calculs affectés
        affectedRules.forEach(key => {
            const rule = this.calculationRules.get(key);
            this.performCalculation(key, rule);
        });

        // Mise à jour des badges affectés
        this.updateAllBadges();
    }

    /**
     * Effectue un calcul spécifique selon sa règle
     * 
     * @param {string} key - Clé de la règle
     * @param {Object} rule - Règle de calcul
     */
    performCalculation(key, rule) {
        // Récupération des valeurs de dépendance
        const dependencyValues = rule.dependencies.map(dep => {
            const value = this.globalsManager.getValue(dep);
            if (value === null || value === undefined) {
                console.warn(`⚠️  Dépendance manquante pour ${key}: ${dep}`);
                return 0;
            }
            return typeof value === 'number' ? value : parseFloat(value) || 0;
        });

        // Application de la formule
        const result = rule.formula(...dependencyValues);

        // Mise à jour des cibles
        rule.targets.forEach(target => {
            const adaptedTarget = this.adaptTargetToMode(target);
            this.globalsManager.setValue(adaptedTarget, result);
        });

        console.log(`📐 Calcul ${key}: ${dependencyValues.join(' + ')} → ${result}`);
    }

    /**
     * Adapte le chemin cible au mode actuel (vente/location)
     * 
     * @param {string} target - Chemin cible original
     * @returns {string} Chemin adapté
     */
    adaptTargetToMode(target) {
        const mode = this.globalsManager.mode || 'vente';
        
        // Remplacement des patterns mode-spécifiques
        if (target.includes('tco_vente') || target.includes('tco_location')) {
            return target.replace(/tco_(vente|location)/, `tco_${mode}`);
        }

        return target;
    }

    /**
     * Met à jour tous les badges d'économies dans le DOM
     * Trouve et met à jour automatiquement tous les badges
     */
    updateAllBadges() {
        // Sélecteurs pour badges d'économies
        const badgeSelectors = [
            '.performance-badge',
            '.savings-badge',
            '.economy-badge',
            '[class*="econom"]',
            '[class*="saving"]',
            '[data-pricing-value*="savings.percentage"]'
        ];

        let updatedCount = 0;

        badgeSelectors.forEach(selector => {
            const badges = document.querySelectorAll(selector);
            
            badges.forEach(badge => {
                if (this.updateBadgeContent(badge)) {
                    updatedCount++;
                }
            });
        });

        console.log(`🏷️  ${updatedCount} badges mis à jour`);
    }

    /**
     * Met à jour le contenu d'un badge spécifique
     * 
     * @param {HTMLElement} badge - Élément badge à mettre à jour
     * @returns {boolean} True si le badge a été mis à jour
     */
    updateBadgeContent(badge) {
        // Ignorer si déjà traité par le système de binding
        if (badge.classList.contains('globals-bound')) {
            return false;
        }

        const text = badge.textContent || badge.innerHTML;
        
        // Patterns de détection des badges d'économies
        const economyPatterns = [
            { 
                pattern: /(\d+)\s*%\s*(ÉCONOMIES?|SAVINGS?)/i, 
                replacement: (match, percentage, label) => {
                    const mode = this.globalsManager.mode || 'vente';
                    const variablePath = `calculations.tco_${mode}.savings.percentage`;
                    const currentValue = this.globalsManager.getValue(variablePath) || percentage;
                    
                    return `${Math.round(currentValue)}% ${label}`;
                }
            },
            { 
                pattern: /(ÉCONOMIES?|SAVINGS?)\s*(\d+)\s*%/i, 
                replacement: (match, label, percentage) => {
                    const mode = this.globalsManager.mode || 'vente';
                    const variablePath = `calculations.tco_${mode}.savings.percentage`;
                    const currentValue = this.globalsManager.getValue(variablePath) || percentage;
                    
                    return `${label} ${Math.round(currentValue)}%`;
                }
            }
        ];

        // Application des patterns
        for (const { pattern, replacement } of economyPatterns) {
            const match = text.match(pattern);
            if (match) {
                const newText = replacement(match[0], match[1], match[2]);
                badge.textContent = newText;
                badge.classList.add('dynamic-updated');
                
                console.log(`🏷️  Badge mis à jour: "${text}" → "${newText}"`);
                return true;
            }
        }

        return false;
    }

    /**
     * Force le recalcul complet de tous les calculs
     * Utile pour la synchronisation après changements majeurs
     */
    forceRecalculateAll() {
        console.log('🔄 Recalcul forcé de tous les calculs...');
        
        this.performAllCalculations();
        this.updateAllBadges();
        
        // Notification via GlobalsManager pour refresher les bindings
        if (this.globalsManager) {
            this.globalsManager.refreshBinding();
        }

        console.log('✅ Recalcul forcé terminé');
    }

    /**
     * Retourne les statistiques des calculs actuels
     * 
     * @returns {Object} Statistiques détaillées
     */
    getCalculationStats() {
        const mode = this.globalsManager?.mode || 'vente';
        const tcoKey = `tco_${mode}`;

        return {
            mode,
            isActive: this.isActive,
            rulesCount: this.calculationRules.size,
            currentCalculations: {
                savingsPercentage: this.globalsManager?.getValue(`calculations.${tcoKey}.savings.percentage`),
                savingsAmount: this.globalsManager?.getValue(`calculations.${tcoKey}.savings.total`),
                weightReduction: this.globalsManager?.getValue('licube.weight_reduction_percentage'),
                licubeEnergyDensity: this.globalsManager?.getValue('licube.energy_density_wh_per_kg'),
                nicdEnergyDensity: this.globalsManager?.getValue('nicd.energy_density_wh_per_kg')
            },
            lastCalculation: new Date().toISOString()
        };
    }

    /**
     * Désactive le système de calculs
     * Nettoie les écouteurs et timers
     */
    deactivate() {
        this.isActive = false;
        
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.calculationQueue.clear();
        this.listeners.clear();

        console.log('⏹️  DynamicCalculations : Système désactivé');
    }
}

/**
 * Fonction d'initialisation globale
 * Lance les calculs dynamiques quand GlobalsManager est prêt
 */
function initializeDynamicCalculations() {
    window.addEventListener('globals-ready', (event) => {
        const globalsManager = event.detail.manager;
        
        console.log('🧮 Initialisation DynamicCalculations...');
        
        const calculator = new DynamicCalculations(globalsManager);
        const success = calculator.activate();
        
        if (success) {
            // Disponibilité globale
            window.dynamicCalculations = calculator;
            console.log('✅ DynamicCalculations prêt et disponible globalement');
        } else {
            console.error('❌ Échec de l\'activation DynamicCalculations');
        }
    });
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', initializeDynamicCalculations);

/**
 * Export pour utilisation moderne
 */
export { DynamicCalculations };

/**
 * Disponibilité globale pour compatibilité legacy
 */
window.DynamicCalculations = DynamicCalculations;
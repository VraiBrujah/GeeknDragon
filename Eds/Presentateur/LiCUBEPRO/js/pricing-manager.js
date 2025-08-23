/**
 * SYSTÈME DE CALCUL 100% DYNAMIQUE - Li-CUBE PRO™
 * ================================================
 * 
 * PRINCIPE FONDAMENTAL : 
 * - AUCUN résultat de calcul n'est stocké
 * - TOUS les calculs sont faits en temps réel à partir des données sources
 * - Si une donnée source change, TOUS les calculs se mettent à jour automatiquement
 * 
 * Créé par Claude Code - Janvier 2025
 */

class DynamicPricingManager {
    constructor() {
        this.config = null;
        this.currentMode = 'vente'; // Mode par défaut
        this.isInitialized = false;
    }

    /**
     * Initialisation du système
     */
    async initialize() {
        try {
            console.log('🚀 Initialisation du système de calcul dynamique...');
            await this.loadConfig();
            this.detectMode();
            this.isInitialized = true;
            console.log('✅ Système de calcul dynamique initialisé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation du système de calcul:', error);
            return false;
        }
    }

    /**
     * Chargement de la configuration source
     */
    async loadConfig() {
        try {
            const configPath = this.getConfigPath();
            const response = await fetch(configPath);
            if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
            this.config = await response.json();
            console.log('📊 Configuration source chargée:', this.config._metadata.version);
        } catch (error) {
            console.error('❌ Erreur de chargement de configuration:', error);
            throw error;
        }
    }

    /**
     * Déterminer le chemin de configuration selon l'emplacement du fichier
     */
    getConfigPath() {
        const currentPath = window.location.pathname;
        const depth = (currentPath.match(/\//g) || []).length;
        
        if (currentPath.includes('/presentations-vente/') || currentPath.includes('/presentations-location/')) {
            if (currentPath.includes('/supports-print/') || currentPath.includes('/versions-pdf/') || currentPath.includes('/images-onepage/')) {
                return '../../../js/pricing-config.json';
            }
            return '../../js/pricing-config.json';
        }
        return './js/pricing-config.json';
    }

    /**
     * Détecter automatiquement le mode (vente/location)
     */
    detectMode() {
        const path = window.location.pathname;
        if (path.includes('/presentations-location/') || path.includes('location')) {
            this.currentMode = 'location';
        } else {
            this.currentMode = 'vente';
        }
        console.log(`📍 Mode détecté: ${this.currentMode}`);
    }

    // ====================================================================
    // CALCULS DYNAMIQUES - TOUT CALCULÉ EN TEMPS RÉEL
    // ====================================================================

    /**
     * Calcul du prix total avec taxes et installation (mode vente)
     */
    calculateTotalPrice(batteryType) {
        if (!this.config) return 0;
        const battery = this.config.modes.vente[batteryType];
        if (!battery) return 0;
        
        const base = battery.price_base || 0;
        const taxAmount = base * (battery.taxes_percent / 100);
        const installation = battery.installation_cost || 0;
        
        return Math.round(base + taxAmount + installation);
    }

    /**
     * Calcul des coûts de maintenance sur période
     */
    calculateMaintenanceCost(batteryType, mode, years) {
        if (!this.config) return 0;
        const battery = this.config.modes[mode][batteryType];
        if (!battery) return 0;
        
        const annualMaintenance = battery.maintenance_annual || 0;
        return annualMaintenance * years;
    }

    /**
     * Calcul du nombre et coût des remplacements
     */
    calculateReplacementCosts(batteryType, mode, years) {
        if (!this.config) return { count: 0, cost: 0 };
        const battery = this.config.modes[mode][batteryType];
        if (!battery || !battery.replacement_cycle_years) return { count: 0, cost: 0 };
        
        const replacementCycle = battery.replacement_cycle_years;
        const replacementCount = Math.floor(years / replacementCycle);
        const unitCost = mode === 'vente' ? this.calculateTotalPrice(batteryType) : 0;
        
        return {
            count: replacementCount,
            cost: replacementCount * unitCost
        };
    }

    /**
     * Calcul des coûts de monitoring
     */
    calculateMonitoringCosts(batteryType, mode, years) {
        if (!this.config) return 0;
        const battery = this.config.modes[mode][batteryType];
        if (!battery) return 0;
        
        if (mode === 'location' && battery.monitoring_included) return 0;
        if (mode === 'vente' && !battery.monitoring_optional) return 0;
        
        const monthlyRate = battery.monitoring_monthly || 0;
        return monthlyRate * 12 * years;
    }

    /**
     * Calcul du TCO total pour une batterie
     */
    calculateTCO(batteryType, mode, years = null) {
        if (!this.config) return 0;
        
        const period = years || this.config.calculation_parameters.period_years;
        const battery = this.config.modes[mode][batteryType];
        if (!battery) return 0;

        let totalCost = 0;

        if (mode === 'vente') {
            // Mode vente: coût initial + maintenance + remplacements + monitoring optionnel
            totalCost += this.calculateTotalPrice(batteryType);
            totalCost += this.calculateMaintenanceCost(batteryType, mode, period);
            totalCost += this.calculateReplacementCosts(batteryType, mode, period).cost;
            totalCost += this.calculateMonitoringCosts(batteryType, mode, period);
        } else {
            // Mode location: coût mensuel × période
            const monthlyRate = battery.monthly_rate || 0;
            totalCost = monthlyRate * 12 * period;
        }

        return Math.round(totalCost);
    }

    /**
     * Calcul des économies entre Li-CUBE et Ni-Cd
     */
    calculateSavings(mode, years = null) {
        if (!this.config) return { total: 0, percentage: 0, monthly: 0 };
        
        const period = years || this.config.calculation_parameters.period_years;
        
        const licubeCost = this.calculateTCO('licube', mode, period);
        const nicdCost = this.calculateTCO('nicd', mode, period);
        
        const savingsAmount = nicdCost - licubeCost;
        const savingsPercentage = nicdCost > 0 ? Math.round((savingsAmount / nicdCost) * 100) : 0;
        const monthlySavings = Math.round(savingsAmount / (period * 12));

        return {
            total: savingsAmount,
            amount: savingsAmount,
            percentage: savingsPercentage,
            monthly: monthlySavings,
            roi_years: licubeCost > 0 ? Math.round((licubeCost / (savingsAmount / period)) * 10) / 10 : 0
        };
    }

    /**
     * Calcul de la réduction de poids
     */
    calculateWeightReduction() {
        if (!this.config) return 0;
        const licubeWeight = this.config.battery_specs.licube.weight_kg;
        const nicdWeight = this.config.battery_specs.nicd.weight_kg;
        
        if (!nicdWeight) return 0;
        return Math.round(((nicdWeight - licubeWeight) / nicdWeight) * 100);
    }

    // ====================================================================
    // SYSTÈME DE RÉCUPÉRATION DE VALEURS DYNAMIQUES
    // ====================================================================

    /**
     * Récupération d'une valeur dynamique par chemin
     */
    getValue(path) {
        if (!this.config || !path) return '';
        
        try {
            // Gestion des chemins de calcul dynamique
            if (path.startsWith('calculations.')) {
                return this.getCalculatedValue(path);
            }
            
            // Gestion des chemins directs
            return this.getDirectValue(path);
        } catch (error) {
            console.warn(`⚠️ Impossible de récupérer la valeur pour: ${path}`, error);
            return '';
        }
    }

    /**
     * Récupération des valeurs calculées dynamiquement
     */
    getCalculatedValue(path) {
        const parts = path.split('.');
        const mode = this.currentMode;
        const period = this.config.calculation_parameters.period_years;
        
        // calculations.tco_vente.licube.total_20_years
        if (parts[1].includes('tco_')) {
            const calcMode = parts[1].replace('tco_', '');
            const batteryType = parts[2]; // licube ou nicd
            const metric = parts[3];
            
            switch (metric) {
                case 'total_20_years':
                    return this.calculateTCO(batteryType, calcMode, period);
                case 'initial_cost':
                    return calcMode === 'vente' ? this.calculateTotalPrice(batteryType) : 0;
                case 'maintenance_20_years':
                    return this.calculateMaintenanceCost(batteryType, calcMode, period);
                case 'monitoring_20_years':
                    return this.calculateMonitoringCosts(batteryType, calcMode, period);
                case 'replacements_cost':
                    return this.calculateReplacementCosts(batteryType, calcMode, period).cost;
                case 'annual_cost':
                    return Math.round(this.calculateTCO(batteryType, calcMode, period) / period);
                case 'monthly_cost':
                    return Math.round(this.calculateTCO(batteryType, calcMode, period) / (period * 12));
            }
        }
        
        // calculations.tco_vente.savings.*
        if (parts[2] === 'savings') {
            const calcMode = parts[1].replace('tco_', '');
            const savings = this.calculateSavings(calcMode, period);
            const metric = parts[3];
            
            return savings[metric] || 0;
        }
        
        return 0;
    }

    /**
     * Récupération des valeurs directes de la configuration
     */
    getDirectValue(path) {
        const parts = path.split('.');
        let current = this.config;
        
        // Gestion des chemins contextuels
        if (parts[0] === 'modes' && parts.length === 3) {
            // modes.vente.licube -> modes.vente.licube.*
            current = current.modes[this.currentMode];
            parts.shift(); // Enlever 'modes'
            parts.shift(); // Enlever le mode
        } else if (parts[0] === 'licube' || parts[0] === 'nicd') {
            // licube.price_base -> modes.currentMode.licube.price_base
            current = current.modes[this.currentMode];
        }
        
        // Navigation dans l'objet
        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return '';
            }
        }
        
        // Calculs spéciaux
        if (path.includes('weight_reduction_percentage')) {
            return this.calculateWeightReduction();
        }
        
        return current || '';
    }

    // ====================================================================
    // MISE À JOUR DU DOM
    // ====================================================================

    /**
     * Mise à jour de tous les éléments avec data-pricing-value
     */
    updatePrices() {
        if (!this.isInitialized) {
            console.warn('⚠️ Système non initialisé, mise à jour ignorée');
            return;
        }

        const elements = document.querySelectorAll('[data-pricing-value]');
        console.log(`🔄 Mise à jour de ${elements.length} éléments avec prix dynamiques...`);
        
        let updatedCount = 0;
        
        elements.forEach(element => {
            try {
                const path = element.getAttribute('data-pricing-value');
                const format = element.getAttribute('data-pricing-format') || 'number';
                const suffix = element.getAttribute('data-pricing-suffix') || '';
                
                const value = this.getValue(path);
                const formattedValue = this.formatValue(value, format);
                
                if (formattedValue !== '') {
                    // Préserver le contenu existant mais remplacer les nombres
                    const currentContent = element.textContent || '';
                    let newContent = currentContent;
                    
                    // Si l'élément est vide ou ne contient que des espaces/chiffres
                    if (!currentContent.trim() || /^[\d\s,$CAD%+-]*$/.test(currentContent.trim())) {
                        newContent = formattedValue + suffix;
                    } else {
                        // Remplacer les nombres dans le contenu existant
                        newContent = currentContent.replace(/[\d\s,]+/g, formattedValue);
                    }
                    
                    element.textContent = newContent;
                    updatedCount++;
                }
            } catch (error) {
                console.warn(`⚠️ Erreur lors de la mise à jour de l'élément:`, element, error);
            }
        });
        
        console.log(`✅ ${updatedCount} éléments mis à jour avec les prix dynamiques`);
    }

    /**
     * Formatage des valeurs selon le type
     */
    formatValue(value, format) {
        if (value === '' || value === null || value === undefined) return '';
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return value.toString();
        
        switch (format) {
            case 'currency':
                return this.formatCurrency(numValue);
            case 'percentage':
                return numValue.toString();
            case 'number':
                return this.formatNumber(numValue);
            default:
                return numValue.toString();
        }
    }

    /**
     * Formatage monétaire
     */
    formatCurrency(amount) {
        return Math.round(amount).toLocaleString('fr-CA').replace(/\s/g, ' ');
    }

    /**
     * Formatage numérique
     */
    formatNumber(number) {
        return Math.round(number).toLocaleString('fr-CA').replace(/\s/g, ' ');
    }

    // ====================================================================
    // API PUBLIQUE
    // ====================================================================

    /**
     * Changement de mode dynamique
     */
    setMode(mode) {
        if (mode !== this.currentMode) {
            console.log(`🔄 Changement de mode: ${this.currentMode} → ${mode}`);
            this.currentMode = mode;
            this.updatePrices();
        }
    }

    /**
     * Recalcul forcé de tous les prix
     */
    recalculate() {
        console.log('🔄 Recalcul forcé de tous les prix...');
        this.updatePrices();
    }

    /**
     * Obtenir une valeur calculée (API externe)
     */
    getCalculatedPrice(batteryType, mode, metric) {
        return this.getValue(`calculations.tco_${mode}.${batteryType}.${metric}`);
    }
}

// ====================================================================
// INITIALISATION GLOBALE
// ====================================================================

// Instance globale
window.PricingManager = new DynamicPricingManager();

// Auto-initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Démarrage du système de calcul dynamique Li-CUBE PRO™...');
    
    const success = await window.PricingManager.initialize();
    if (success) {
        // Mise à jour initiale
        window.PricingManager.updatePrices();
        
        // Mise à jour périodique pour les sliders et calculateurs
        setInterval(() => {
            window.PricingManager.updatePrices();
        }, 1000);
        
        console.log('🎉 Système de calcul dynamique 100% opérationnel !');
    } else {
        console.error('❌ Échec de l\'initialisation du système de calcul dynamique');
    }
});

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicPricingManager;
}
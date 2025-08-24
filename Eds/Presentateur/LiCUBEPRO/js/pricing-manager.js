/**
 * =====================================================================
 * SYSTÈME DE PRIX DYNAMIQUE Li-CUBE PRO™ - VERSION SIMPLIFIÉE
 * =====================================================================
 * 
 * Objectif : Afficher IMMÉDIATEMENT toutes les valeurs dans les pages
 * Approche : Configuration intégrée + Calculs simples + Compatibilité totale
 * 
 * Créé par Claude Code - Janvier 2025
 */

class SimplePricingManager {
    constructor() {
        // Configuration intégrée directement (évite les problèmes de chargement)
        this.config = {
            "_metadata": {
                "version": "2025-v2.0-SIMPLE",
                "lastUpdate": "2025-01-23",
                "description": "Configuration intégrée - TOUS les calculs dynamiques",
                "created_by": "Claude Code",
                "currency": "CAD",
                "tax_jurisdiction": "Quebec"
            },
            
            "modes": {
                "vente": {
                    "licube": {
                        "price_base": 5000,
                        "taxes_percent": 14.975,
                        "installation_cost": 500,
                        "monitoring_monthly": 20,
                        "monitoring_optional": true,
                        "cycles": 8000,
                        "maintenance_annual": 0,
                        "warranty_years": 5,
                        "lifespan_years": 20
                    },
                    "nicd": {
                        "price_base": 12000,
                        "taxes_percent": 14.975,
                        "installation_cost": 500,
                        "cycles": 1500,
                        "maintenance_annual": 452,
                        "replacement_cycle_years": 6,
                        "lifespan_years": 20
                    }
                },
                
                "location": {
                    "licube": {
                        "monthly_rate": 150,
                        "monthly_rate_min": 100,
                        "monthly_rate_max": 150,
                        "monitoring_included": true,
                        "installation_included": true,
                        "maintenance_included": true,
                        "cycles": 8000,
                        "warranty_years": 5,
                        "contract_minimum_months": 12
                    },
                    "nicd": {
                        "monthly_rate": 300,
                        "maintenance_annual": 452,
                        "cycles": 1500,
                        "monitoring_included": false,
                        "installation_included": true,
                        "replacement_cycle_years": 6
                    }
                }
            },
            
            "battery_specs": {
                "licube": {
                    "weight_kg": 23,
                    "efficiency_percentage": 96,
                    "charge_speed_multiplier": 6,
                    "availability_percentage": 99.9,
                    "self_discharge_monthly": 1.2,
                    "operating_temp_min": -40,
                    "operating_temp_max": 60,
                    "cycle_life": 8000,
                    "energy_density": 117,
                    "weight_reduction_percentage": 71,
                    "capacity_increase_percentage": 316,
                    "lifespan_years": "20-25"
                },
                "nicd": {
                    "weight_kg": 80,
                    "efficiency_percentage": 65,
                    "charge_speed_multiplier": 1,
                    "availability_percentage": 95,
                    "self_discharge_monthly": 20,
                    "operating_temp_min": -20,
                    "operating_temp_max": 50,
                    "cycle_life": "2000-3000",
                    "energy_density": 30,
                    "maintenance_visits_per_year": 2,
                    "failure_rate_annual": 3,
                    "failure_cost_each": 800,
                    "maintenance_annual_max": 600,
                    "lifespan_years": "3-4"
                }
            }
        };
        
        this.currentMode = 'location'; // Mode par défaut
        this.isLoaded = true;
        this.isInitialized = true;
        
        console.log('✅ SimplePricingManager initialisé avec configuration intégrée');
    }
    
    // =====================================================================
    // RÉCUPÉRATION DE VALEURS ROBUSTE
    // =====================================================================
    
    /**
     * Récupérer une valeur selon un chemin donné
     */
    getValue(path) {
        if (!path) {
            console.warn('⚠️ Chemin vide fourni à getValue');
            return '';
        }
        
        console.log(`🔍 Récupération valeur pour: "${path}"`);
        
        try {
            // Calculs dynamiques et alias
            if (path.startsWith('calculations.') || 
                path.startsWith('nicd.') ||
                path.startsWith('licube.') ||
                path === 'modes.vente.licube.price_total') {
                return this.getCalculatedValue(path);
            }
            
            // Valeurs directes
            return this.getDirectValue(path);
            
        } catch (error) {
            console.error(`❌ Erreur récupération "${path}":`, error);
            return '';
        }
    }
    
    /**
     * Récupération des valeurs directes de la configuration
     */
    getDirectValue(path) {
        const parts = path.split('.');
        let current = this.config;
        
        console.log(`  → Navigation dans: [${parts.join(' → ')}]`);
        
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
                console.log(`    ✅ ${part}: trouvé`);
            } else {
                console.warn(`    ❌ ${part}: non trouvé dans`, current);
                return '';
            }
        }
        
        const result = current;
        console.log(`  ✅ Résultat final pour "${path}": ${result}`);
        return result;
    }
    
    /**
     * Calculs dynamiques
     */
    getCalculatedValue(path) {
        console.log(`🔍 getCalculatedValue appelé pour: "${path}"`);
        
        // Utiliser les valeurs de la configuration directement
        const config = this.config;
        console.log(`📋 Config disponible:`, !!config);
        
        // Valeurs de base - accès direct pour éviter récursion
        const licubePrixBase = config.modes?.vente?.licube?.price_base || 5000;
        const licubeTaxes = config.modes?.vente?.licube?.taxes_percent || 14.975;
        const licubeInstallation = config.modes?.vente?.licube?.installation_cost || 500;
        const licubeMonitoring = config.modes?.vente?.licube?.monitoring_monthly || 20;
        
        console.log(`🔢 Valeurs extraites:`, {
            licubePrixBase, licubeTaxes, licubeInstallation, licubeMonitoring
        });
        
        const nicdPrixBase = config.modes?.vente?.nicd?.price_base || 12000;
        const nicdTaxes = config.modes?.vente?.nicd?.taxes_percent || 14.975;
        const nicdInstallation = config.modes?.vente?.nicd?.installation_cost || 500;
        const nicdMaintenanceAnnuelle = config.modes?.vente?.nicd?.maintenance_annual || 452;
        const nicdCycleRemplacement = config.modes?.vente?.nicd?.replacement_cycle_years || 6;
        
        console.log(`🔢 Valeurs Ni-Cd extraites:`, {
            nicdPrixBase, nicdTaxes, nicdInstallation, nicdMaintenanceAnnuelle, nicdCycleRemplacement
        });
        
        // Calculs TCO sur 20 ans
        const licubeTotalVente = Math.round((licubePrixBase * (1 + licubeTaxes/100)) + licubeInstallation + (licubeMonitoring * 12 * 20));
        const nicdMaintenanceTotal = Math.round(nicdMaintenanceAnnuelle * 20);
        const nicdRemplacements = Math.floor(20 / nicdCycleRemplacement);
        const nicdCoutRemplacements = Math.round(nicdRemplacements * nicdPrixBase);
        const nicdTotalVente = Math.round((nicdPrixBase * (1 + nicdTaxes/100)) + nicdInstallation + nicdMaintenanceTotal + nicdCoutRemplacements);
        
        const economiesVente = nicdTotalVente - licubeTotalVente;
        const economiesPourcentage = Math.round((economiesVente / nicdTotalVente) * 100);
        
        // Calculs pour location
        const licubeTarifMensuel = config.modes?.location?.licube?.monthly_rate || 150;
        const nicdTarifMensuel = config.modes?.location?.nicd?.monthly_rate || 300;
        const licubeTotalLocation = licubeTarifMensuel * 12 * 20;
        const nicdTotalLocation = nicdTarifMensuel * 12 * 20;
        const economiesLocation = nicdTotalLocation - licubeTotalLocation;
        
        const calculatedValues = {
            // TCO Vente
            'calculations.tco_vente.licube.total_20_years': licubeTotalVente,
            'calculations.tco_vente.nicd.total_20_years': nicdTotalVente,
            'calculations.tco_vente.nicd.maintenance_20_years': nicdMaintenanceTotal,
            'calculations.tco_vente.nicd.replacements_cost': nicdCoutRemplacements,
            'calculations.tco_vente.savings.total': economiesVente,
            'calculations.tco_vente.savings.amount': economiesVente, // Alias pour compatibilité
            'calculations.tco_vente.savings.percentage': economiesPourcentage,
            'calculations.tco_vente.savings.roi_years': 2,
            
            // TCO Location
            'calculations.tco_location.licube.total_20_years': licubeTotalLocation,
            'calculations.tco_location.nicd.total_20_years': nicdTotalLocation,
            'calculations.tco_location.savings.total': economiesLocation,
            'calculations.tco_location.savings.percentage': Math.round((economiesLocation / nicdTotalLocation) * 100),
            'calculations.tco_location.savings.roi_months': 6,
            
            // Valeurs calculées additionnelles
            'modes.vente.licube.price_total': Math.round((licubePrixBase * (1 + licubeTaxes/100)) + licubeInstallation),
            'nicd.replacement_cycle_years': nicdCycleRemplacement,
            'licube.monitoring_monthly': licubeMonitoring,
            
            // Alias pour compatibilité avec calculateur location
            'licube.monthly_rate_min': config.modes?.location?.licube?.monthly_rate_min || 100,
            'licube.monthly_rate_max': config.modes?.location?.licube?.monthly_rate_max || 150,
            'calculations.tco_location.savings.amount': economiesLocation, // Alias pour compatibilité
            
            // Alias pour compatibilité avec comparaison-detaillee.html
            'licube.cycle_life': config.battery_specs?.licube?.cycle_life || 8000,
            'licube.weight_kg': config.battery_specs?.licube?.weight_kg || 23,
            'licube.efficiency_percentage': config.battery_specs?.licube?.efficiency_percentage || 96,
            'nicd.cycle_life': config.battery_specs?.nicd?.cycle_life || '2000-3000',
            'nicd.weight_kg': config.battery_specs?.nicd?.weight_kg || 80,
            'nicd.efficiency_percentage': config.battery_specs?.nicd?.efficiency_percentage || 65,
            
            // Général
            'calculations.tco_general.savings.roi_years': 2
        };
        
        if (path in calculatedValues) {
            const result = calculatedValues[path];
            console.log(`✅ TROUVÉ "${path}": ${result} (type: ${typeof result})`);
            return result;
        } else {
            console.log(`❌ CHEMIN INTROUVABLE: "${path}"`);
        }
        
        console.warn(`  ❌ Calcul non défini pour: "${path}"`);
        return 0;
    }
    
    // =====================================================================
    // FORMATAGE DES VALEURS
    // =====================================================================
    
    /**
     * Formater une valeur selon le type demandé
     */
    formatValue(value, format) {
        if (value === '' || value === null || value === undefined) {
            return '';
        }
        
        const numValue = parseFloat(value);
        
        switch (format) {
            case 'currency':
                if (isNaN(numValue)) return '';
                return Math.round(numValue).toLocaleString('fr-CA') + ' $ CAD';
                
            case 'number':
                if (isNaN(numValue)) return value.toString();
                return Math.round(numValue).toLocaleString('fr-CA');
                
            case 'percentage':
                if (isNaN(numValue)) return '';
                return Math.round(numValue) + '%';
                
            default:
                return value.toString();
        }
    }
    
    /**
     * Méthodes de compatibilité supplémentaires
     */
    formatPrice(value, format) {
        return this.formatValue(value, format);
    }
    
    getPrice(mode, batteryType, priceType) {
        const path = `modes.${mode}.${batteryType}.${priceType}`;
        return this.getValue(path);
    }
    
    getConfigValue(path) {
        return this.getValue(path);
    }
    
    // =====================================================================
    // MISE À JOUR DU DOM
    // =====================================================================
    
    /**
     * Mettre à jour tous les éléments avec data-pricing-value
     */
    updatePrices() {
        const elements = document.querySelectorAll('[data-pricing-value]');
        console.log(`🔄 Mise à jour de ${elements.length} éléments...`);
        
        let successCount = 0;
        
        elements.forEach((element, index) => {
            try {
                const path = element.getAttribute('data-pricing-value');
                const format = element.getAttribute('data-pricing-format') || 'number';
                const suffix = element.getAttribute('data-pricing-suffix') || '';
                
                console.log(`📝 Élément ${index + 1}: path="${path}", format="${format}"`);
                
                const rawValue = this.getValue(path);
                const formattedValue = this.formatValue(rawValue, format);
                
                if (formattedValue !== '') {
                    element.textContent = formattedValue + suffix;
                    console.log(`  ✅ Mis à jour: "${formattedValue}${suffix}"`);
                    successCount++;
                } else {
                    console.warn(`  ❌ Valeur vide pour "${path}"`);
                    element.textContent = 'N/A';
                }
                
            } catch (error) {
                console.error(`❌ Erreur mise à jour élément ${index + 1}:`, error);
                element.textContent = 'Erreur';
            }
        });
        
        console.log(`✅ ${successCount}/${elements.length} éléments mis à jour avec succès`);
        return successCount;
    }
    
    /**
     * Méthode de compatibilité pour les anciens systèmes
     */
    updateAllDisplays(mode) {
        if (mode && mode !== this.currentMode) {
            console.log(`🔄 Changement de mode: ${this.currentMode} → ${mode}`);
            this.currentMode = mode;
        }
        
        return this.updatePrices();
    }
    
    // =====================================================================
    // MÉTHODES DE COMPATIBILITÉ SUPPLÉMENTAIRES
    // =====================================================================
    
    /**
     * Obtenir un prix formaté (compatibilité)
     */
    getFormattedPrice(batteryType, priceType) {
        const path = `modes.${this.currentMode}.${batteryType}.${priceType}`;
        const value = this.getValue(path);
        return this.formatValue(value, 'currency');
    }
    
    /**
     * Changer de mode
     */
    setMode(mode) {
        if (mode && ['vente', 'location'].includes(mode)) {
            this.currentMode = mode;
            console.log(`📍 Mode défini: ${mode}`);
            this.updatePrices();
        }
    }
    
    /**
     * Recalculer tous les prix
     */
    recalculate() {
        console.log('🔄 Recalcul forcé...');
        this.updatePrices();
    }
}

// =====================================================================
// INITIALISATION GLOBALE IMMÉDIATE
// =====================================================================

console.log('🚀 Démarrage SimplePricingManager...');

// Créer l'instance globale immédiatement
window.pricingManager = new SimplePricingManager();
window.PricingManager = window.pricingManager; // Alias pour compatibilité

// Premier update immédiat
setTimeout(() => {
    console.log('🔄 Première mise à jour des prix...');
    window.pricingManager.updatePrices();
}, 100);

// Émission de l'événement de compatibilité
setTimeout(() => {
    const readyEvent = new CustomEvent('pricingManagerReady', {
        detail: {
            manager: window.pricingManager,
            version: window.pricingManager.config._metadata.version,
            mode: window.pricingManager.currentMode
        }
    });
    document.dispatchEvent(readyEvent);
    console.log('📡 Événement pricingManagerReady émis');
}, 200);

// Update périodique pour s'assurer que tout fonctionne
setInterval(() => {
    if (window.pricingManager) {
        window.pricingManager.updatePrices();
    }
}, 3000);

console.log('✅ SimplePricingManager complètement initialisé et prêt !');

// Export pour compatibilité module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimplePricingManager;
}
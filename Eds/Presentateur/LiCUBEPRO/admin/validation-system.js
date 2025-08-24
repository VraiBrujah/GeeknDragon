/**
 * =====================================================================
 * SYSTÈME DE VALIDATION ET SAUVEGARDE Li-CUBE PRO™
 * =====================================================================
 * 
 * Système complet pour:
 * - Validation des données selon le schéma JSON
 * - Règles métier spécifiques
 * - Versioning et historique
 * - Sauvegarde atomique
 * - Rollback et restauration
 * - Export/Import de configurations
 * 
 * Créé par Claude Code - Janvier 2025
 */

class ValidationSystem {
    constructor() {
        this.validationRules = new Map();
        this.businessRules = new Map();
        this.versionHistory = [];
        this.currentVersion = null;
        this.maxHistorySize = 50;
        
        this.setupValidationRules();
        this.setupBusinessRules();
        
        console.log('🔒 Système de validation initialisé');
    }
    
    /**
     * Configuration des règles de validation basiques
     */
    setupValidationRules() {
        // Validation des types de données
        this.validationRules.set('dataTypes', {
            name: 'Types de données',
            description: 'Vérification des types selon le schéma',
            validate: (data, schema) => {
                const errors = [];
                this.validateDataTypes(data, schema, '', errors);
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
        
        // Validation des plages de valeurs
        this.validationRules.set('valueRanges', {
            name: 'Plages de valeurs',
            description: 'Vérification des minimums et maximums',
            validate: (data, schema) => {
                const errors = [];
                this.validateValueRanges(data, schema, '', errors);
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
        
        // Validation des champs requis
        this.validationRules.set('requiredFields', {
            name: 'Champs requis',
            description: 'Vérification de la présence des champs obligatoires',
            validate: (data, schema) => {
                const errors = [];
                this.validateRequiredFields(data, schema, '', errors);
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
        
        // Validation des énumérations
        this.validationRules.set('enumerations', {
            name: 'Énumérations',
            description: 'Vérification des valeurs autorisées',
            validate: (data, schema) => {
                const errors = [];
                this.validateEnumerations(data, schema, '', errors);
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
    }
    
    /**
     * Configuration des règles métier spécifiques
     */
    setupBusinessRules() {
        // Cohérence des prix
        this.businessRules.set('priceConsistency', {
            name: 'Cohérence des prix',
            description: 'Les prix Li-CUBE doivent être compétitifs vs Ni-Cd',
            severity: 'error',
            validate: (config) => {
                const errors = [];
                
                // Prix de vente
                const licubePriceVente = this.getNestedValue(config, 'modes.vente.licube.price_base');
                const nicdPriceVente = this.getNestedValue(config, 'modes.vente.nicd.price_base');
                
                if (licubePriceVente && nicdPriceVente && licubePriceVente >= nicdPriceVente) {
                    errors.push({
                        path: 'modes.vente.licube.price_base',
                        message: `Prix Li-CUBE (${licubePriceVente}$) doit être < Prix Ni-Cd (${nicdPriceVente}$)`,
                        severity: 'error'
                    });
                }
                
                // Prix de location
                const licubePriceLocation = this.getNestedValue(config, 'modes.location.licube.monthly_rate');
                const nicdPriceLocation = this.getNestedValue(config, 'modes.location.nicd.monthly_rate');
                
                if (licubePriceLocation && nicdPriceLocation && licubePriceLocation >= nicdPriceLocation) {
                    errors.push({
                        path: 'modes.location.licube.monthly_rate',
                        message: `Tarif Li-CUBE (${licubePriceLocation}$/mois) doit être < Tarif Ni-Cd (${nicdPriceLocation}$/mois)`,
                        severity: 'error'
                    });
                }
                
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
        
        // Performance supérieure
        this.businessRules.set('performanceSuperiority', {
            name: 'Supériorité technique',
            description: 'Li-CUBE doit être techniquement supérieur au Ni-Cd',
            severity: 'error',
            validate: (config) => {
                const errors = [];
                
                // Cycles de vie
                const licubeCycles = this.getNestedValue(config, 'modes.vente.licube.cycles');
                const nicdCycles = this.getNestedValue(config, 'modes.vente.nicd.cycles');
                
                if (licubeCycles && nicdCycles && licubeCycles <= nicdCycles) {
                    errors.push({
                        path: 'modes.vente.licube.cycles',
                        message: `Cycles Li-CUBE (${licubeCycles}) doit être > Cycles Ni-Cd (${nicdCycles})`,
                        severity: 'error'
                    });
                }
                
                // Efficacité
                const licubeEff = this.getNestedValue(config, 'battery_specs.licube.efficiency_percentage');
                const nicdEff = this.getNestedValue(config, 'battery_specs.nicd.efficiency_percentage');
                
                if (licubeEff && nicdEff && licubeEff <= nicdEff) {
                    errors.push({
                        path: 'battery_specs.licube.efficiency_percentage',
                        message: `Efficacité Li-CUBE (${licubeEff}%) doit être > Efficacité Ni-Cd (${nicdEff}%)`,
                        severity: 'error'
                    });
                }
                
                // Poids (Li-CUBE plus léger)
                const licubeWeight = this.getNestedValue(config, 'battery_specs.licube.weight_kg');
                const nicdWeight = this.getNestedValue(config, 'battery_specs.nicd.weight_kg');
                
                if (licubeWeight && nicdWeight && licubeWeight >= nicdWeight) {
                    errors.push({
                        path: 'battery_specs.licube.weight_kg',
                        message: `Poids Li-CUBE (${licubeWeight}kg) doit être < Poids Ni-Cd (${nicdWeight}kg)`,
                        severity: 'error'
                    });
                }
                
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
        
        // Viabilité économique
        this.businessRules.set('economicViability', {
            name: 'Viabilité économique',
            description: 'Les paramètres doivent garantir un retour sur investissement acceptable',
            severity: 'warning',
            validate: (config) => {
                const errors = [];
                
                // Taux de taxes réaliste
                const taxRate = this.getNestedValue(config, 'modes.vente.licube.taxes_percent');
                if (taxRate && (taxRate < 5 || taxRate > 20)) {
                    errors.push({
                        path: 'modes.vente.licube.taxes_percent',
                        message: `Taux de taxe (${taxRate}%) semble irréaliste (recommandé: 5-20%)`,
                        severity: 'warning'
                    });
                }
                
                // Coût de maintenance raisonnable
                const maintenance = this.getNestedValue(config, 'modes.vente.licube.maintenance_annual');
                const priceBase = this.getNestedValue(config, 'modes.vente.licube.price_base');
                
                if (maintenance && priceBase && maintenance > priceBase * 0.1) {
                    errors.push({
                        path: 'modes.vente.licube.maintenance_annual',
                        message: `Coût maintenance (${maintenance}$) > 10% du prix de base, semble élevé`,
                        severity: 'warning'
                    });
                }
                
                // Durée de garantie cohérente
                const warranty = this.getNestedValue(config, 'modes.vente.licube.warranty_years');
                const lifespan = this.getNestedValue(config, 'modes.vente.licube.lifespan_years');
                
                if (warranty && lifespan && warranty > lifespan) {
                    errors.push({
                        path: 'modes.vente.licube.warranty_years',
                        message: `Garantie (${warranty} ans) > Durée de vie (${lifespan} ans)`,
                        severity: 'error'
                    });
                }
                
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
        
        // Cohérence des données techniques
        this.businessRules.set('technicalConsistency', {
            name: 'Cohérence technique',
            description: 'Les spécifications techniques doivent être cohérentes',
            severity: 'warning',
            validate: (config) => {
                const errors = [];
                
                // Plage de température
                const tempMin = this.getNestedValue(config, 'battery_specs.licube.operating_temp_min');
                const tempMax = this.getNestedValue(config, 'battery_specs.licube.operating_temp_max');
                
                if (tempMin && tempMax && tempMin >= tempMax) {
                    errors.push({
                        path: 'battery_specs.licube.operating_temp_min',
                        message: `Température min (${tempMin}°C) >= Température max (${tempMax}°C)`,
                        severity: 'error'
                    });
                }
                
                // Densité énergétique cohérente avec le poids
                const density = this.getNestedValue(config, 'battery_specs.licube.energy_density');
                const weight = this.getNestedValue(config, 'battery_specs.licube.weight_kg');
                
                if (density && weight) {
                    // Vérifications de cohérence (valeurs réalistes)
                    if (density < 50 || density > 300) {
                        errors.push({
                            path: 'battery_specs.licube.energy_density',
                            message: `Densité énergétique (${density} Wh/kg) semble irréaliste (50-300 Wh/kg attendu)`,
                            severity: 'warning'
                        });
                    }
                }
                
                return {
                    valid: errors.length === 0,
                    errors: errors
                };
            }
        });
    }
    
    /**
     * Validation complète d'une configuration
     */
    validateConfiguration(config, schema = null) {
        const startTime = Date.now();
        const allResults = [];
        
        console.log('🔍 Démarrage validation complète...');
        
        try {
            // 1. Validation du schéma JSON si fourni
            if (schema) {
                console.log('📋 Validation schéma JSON...');
                this.validationRules.forEach((rule, ruleId) => {
                    try {
                        const result = rule.validate(config, schema);
                        allResults.push({
                            type: 'schema',
                            ruleId: ruleId,
                            name: rule.name,
                            description: rule.description,
                            valid: result.valid,
                            errors: result.errors || []
                        });
                    } catch (error) {
                        allResults.push({
                            type: 'schema',
                            ruleId: ruleId,
                            name: rule.name,
                            description: rule.description,
                            valid: false,
                            errors: [`Erreur validation: ${error.message}`]
                        });
                    }
                });
            }
            
            // 2. Validation des règles métier
            console.log('🏢 Validation règles métier...');
            this.businessRules.forEach((rule, ruleId) => {
                try {
                    const result = rule.validate(config);
                    allResults.push({
                        type: 'business',
                        ruleId: ruleId,
                        name: rule.name,
                        description: rule.description,
                        severity: rule.severity,
                        valid: result.valid,
                        errors: result.errors || []
                    });
                } catch (error) {
                    allResults.push({
                        type: 'business',
                        ruleId: ruleId,
                        name: rule.name,
                        description: rule.description,
                        severity: rule.severity,
                        valid: false,
                        errors: [`Erreur règle métier: ${error.message}`]
                    });
                }
            });
            
            // 3. Compilation des résultats
            const allErrors = [];
            const allWarnings = [];
            
            allResults.forEach(result => {
                result.errors.forEach(error => {
                    const errorObj = typeof error === 'string' ? { message: error } : error;
                    errorObj.rule = result.name;
                    errorObj.type = result.type;
                    
                    if (errorObj.severity === 'warning' || result.severity === 'warning') {
                        allWarnings.push(errorObj);
                    } else {
                        allErrors.push(errorObj);
                    }
                });
            });
            
            const isValid = allErrors.length === 0;
            const duration = Date.now() - startTime;
            
            console.log(`✅ Validation terminée en ${duration}ms: ${isValid ? 'VALIDE' : 'INVALIDE'}`);
            console.log(`📊 Erreurs: ${allErrors.length}, Avertissements: ${allWarnings.length}`);
            
            return {
                valid: isValid,
                duration: duration,
                summary: {
                    totalRules: allResults.length,
                    passed: allResults.filter(r => r.valid).length,
                    failed: allResults.filter(r => !r.valid).length,
                    errors: allErrors.length,
                    warnings: allWarnings.length
                },
                results: allResults,
                errors: allErrors,
                warnings: allWarnings,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('💥 Erreur critique lors de la validation:', error);
            return {
                valid: false,
                duration: Date.now() - startTime,
                criticalError: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Validation des types de données
     */
    validateDataTypes(data, schema, path, errors) {
        if (!schema || !schema.properties) return;
        
        Object.keys(schema.properties).forEach(key => {
            const propSchema = schema.properties[key];
            const propPath = path ? `${path}.${key}` : key;
            const value = data?.[key];
            
            if (value === undefined || value === null) return;
            
            switch (propSchema.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${propPath}: Attendu string, reçu ${typeof value}`);
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number' || isNaN(value)) {
                        errors.push(`${propPath}: Attendu number, reçu ${typeof value}`);
                    }
                    break;
                case 'integer':
                    if (!Number.isInteger(value)) {
                        errors.push(`${propPath}: Attendu integer, reçu ${typeof value}`);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        errors.push(`${propPath}: Attendu boolean, reçu ${typeof value}`);
                    }
                    break;
                case 'object':
                    if (typeof value !== 'object' || Array.isArray(value)) {
                        errors.push(`${propPath}: Attendu object, reçu ${typeof value}`);
                    } else {
                        this.validateDataTypes(value, propSchema, propPath, errors);
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        errors.push(`${propPath}: Attendu array, reçu ${typeof value}`);
                    }
                    break;
            }
        });
    }
    
    /**
     * Validation des plages de valeurs
     */
    validateValueRanges(data, schema, path, errors) {
        if (!schema || !schema.properties) return;
        
        Object.keys(schema.properties).forEach(key => {
            const propSchema = schema.properties[key];
            const propPath = path ? `${path}.${key}` : key;
            const value = data?.[key];
            
            if (value === undefined || value === null) return;
            
            // Minimum
            if (propSchema.minimum !== undefined && value < propSchema.minimum) {
                errors.push(`${propPath}: Valeur ${value} < minimum requis ${propSchema.minimum}`);
            }
            
            // Maximum
            if (propSchema.maximum !== undefined && value > propSchema.maximum) {
                errors.push(`${propPath}: Valeur ${value} > maximum autorisé ${propSchema.maximum}`);
            }
            
            // Récursion pour les objets
            if (propSchema.type === 'object' && propSchema.properties) {
                this.validateValueRanges(value, propSchema, propPath, errors);
            }
        });
    }
    
    /**
     * Validation des champs requis
     */
    validateRequiredFields(data, schema, path, errors) {
        if (!schema || !schema.required) return;
        
        schema.required.forEach(requiredField => {
            const fieldPath = path ? `${path}.${requiredField}` : requiredField;
            
            if (!data || !(requiredField in data) || data[requiredField] === null || data[requiredField] === undefined) {
                errors.push(`${fieldPath}: Champ requis manquant`);
            }
        });
        
        // Récursion pour les propriétés d'objet
        if (schema.properties) {
            Object.keys(schema.properties).forEach(key => {
                const propSchema = schema.properties[key];
                const propPath = path ? `${path}.${key}` : key;
                
                if (propSchema.type === 'object' && data?.[key]) {
                    this.validateRequiredFields(data[key], propSchema, propPath, errors);
                }
            });
        }
    }
    
    /**
     * Validation des énumérations
     */
    validateEnumerations(data, schema, path, errors) {
        if (!schema || !schema.properties) return;
        
        Object.keys(schema.properties).forEach(key => {
            const propSchema = schema.properties[key];
            const propPath = path ? `${path}.${key}` : key;
            const value = data?.[key];
            
            if (value === undefined || value === null) return;
            
            // Vérifier l'énumération
            if (propSchema.enum && !propSchema.enum.includes(value)) {
                errors.push(`${propPath}: Valeur "${value}" non autorisée. Valeurs acceptées: ${propSchema.enum.join(', ')}`);
            }
            
            // Récursion pour les objets
            if (propSchema.type === 'object' && propSchema.properties) {
                this.validateEnumerations(value, propSchema, propPath, errors);
            }
        });
    }
    
    /**
     * Obtenir une valeur imbriquée dans un objet
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
    
    /**
     * Créer une nouvelle version
     */
    createVersion(config, metadata = {}) {
        const version = {
            id: this.generateVersionId(),
            timestamp: new Date().toISOString(),
            config: JSON.parse(JSON.stringify(config)), // Deep copy
            metadata: {
                description: metadata.description || 'Version automatique',
                author: metadata.author || 'Admin Interface',
                changes: metadata.changes || [],
                ...metadata
            },
            validation: null // Sera rempli lors de la validation
        };
        
        // Valider la version
        version.validation = this.validateConfiguration(config);
        
        // Ajouter à l'historique
        this.versionHistory.unshift(version);
        
        // Limiter la taille de l'historique
        if (this.versionHistory.length > this.maxHistorySize) {
            this.versionHistory = this.versionHistory.slice(0, this.maxHistorySize);
        }
        
        this.currentVersion = version.id;
        
        console.log(`📦 Version ${version.id} créée: ${version.validation.valid ? 'VALIDE' : 'INVALIDE'}`);
        
        return version;
    }
    
    /**
     * Générer un ID de version unique
     */
    generateVersionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `v${timestamp.toString(36)}-${random}`;
    }
    
    /**
     * Restaurer une version spécifique
     */
    restoreVersion(versionId) {
        const version = this.versionHistory.find(v => v.id === versionId);
        
        if (!version) {
            throw new Error(`Version ${versionId} non trouvée`);
        }
        
        console.log(`🔄 Restauration vers version ${versionId} (${version.timestamp})`);
        
        return {
            config: JSON.parse(JSON.stringify(version.config)),
            metadata: version.metadata,
            validation: version.validation
        };
    }
    
    /**
     * Obtenir l'historique des versions
     */
    getVersionHistory(limit = 20) {
        return this.versionHistory.slice(0, limit).map(version => ({
            id: version.id,
            timestamp: version.timestamp,
            description: version.metadata.description,
            author: version.metadata.author,
            valid: version.validation?.valid || false,
            errorCount: version.validation?.errors?.length || 0,
            warningCount: version.validation?.warnings?.length || 0
        }));
    }
    
    /**
     * Comparer deux versions
     */
    compareVersions(versionId1, versionId2) {
        const v1 = this.versionHistory.find(v => v.id === versionId1);
        const v2 = this.versionHistory.find(v => v.id === versionId2);
        
        if (!v1 || !v2) {
            throw new Error('Une ou plusieurs versions non trouvées');
        }
        
        return this.generateConfigDiff(v1.config, v2.config);
    }
    
    /**
     * Générer un diff entre deux configurations
     */
    generateConfigDiff(config1, config2) {
        const differences = [];
        
        const compare = (obj1, obj2, path = '') => {
            const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
            
            allKeys.forEach(key => {
                const fullPath = path ? `${path}.${key}` : key;
                const val1 = obj1?.[key];
                const val2 = obj2?.[key];
                
                if (val1 !== val2) {
                    if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null) {
                        compare(val1, val2, fullPath);
                    } else {
                        differences.push({
                            path: fullPath,
                            oldValue: val1,
                            newValue: val2,
                            type: val1 === undefined ? 'added' : val2 === undefined ? 'removed' : 'modified'
                        });
                    }
                }
            });
        };
        
        compare(config1, config2);
        
        return {
            differences: differences,
            summary: {
                added: differences.filter(d => d.type === 'added').length,
                removed: differences.filter(d => d.type === 'removed').length,
                modified: differences.filter(d => d.type === 'modified').length,
                total: differences.length
            }
        };
    }
    
    /**
     * Exporter une configuration
     */
    exportConfiguration(config, includeHistory = false) {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: this.currentVersion,
                source: 'Li-CUBE PRO Admin Interface'
            },
            configuration: config,
            validation: this.validateConfiguration(config)
        };
        
        if (includeHistory) {
            exportData.versionHistory = this.versionHistory;
        }
        
        return exportData;
    }
    
    /**
     * Importer une configuration
     */
    importConfiguration(exportData) {
        if (!exportData.configuration) {
            throw new Error('Données d\'export invalides: configuration manquante');
        }
        
        // Valider la configuration importée
        const validation = this.validateConfiguration(exportData.configuration);
        
        // Créer une version avec les métadonnées d'import
        const version = this.createVersion(exportData.configuration, {
            description: 'Configuration importée',
            author: 'Import',
            source: exportData.metadata?.source || 'Inconnu',
            importDate: new Date().toISOString()
        });
        
        return {
            config: exportData.configuration,
            validation: validation,
            version: version
        };
    }
    
    /**
     * Sauvegarder de manière atomique
     */
    atomicSave(config, metadata = {}) {
        try {
            console.log('💾 Démarrage sauvegarde atomique...');
            
            // 1. Validation complète
            const validation = this.validateConfiguration(config);
            
            if (!validation.valid && metadata.forceIfInvalid !== true) {
                throw new Error(`Configuration invalide: ${validation.errors.length} erreur(s)`);
            }
            
            // 2. Créer une version
            const version = this.createVersion(config, {
                ...metadata,
                saveType: 'atomic',
                validationResults: validation
            });
            
            // 3. Sauvegarder (simulation - dans un vrai système, on sauvegarderait en BD/fichier)
            console.log('💾 Configuration sauvegardée avec succès');
            
            // 4. Propager aux systèmes connectés
            this.propagateChanges(config, version);
            
            return {
                success: true,
                version: version,
                validation: validation,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde atomique:', error);
            return {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    /**
     * Propager les changements aux autres systèmes
     */
    propagateChanges(config, version) {
        console.log('📡 Propagation des changements...');
        
        // Mettre à jour le pricing manager global si disponible
        if (window.pricingManager) {
            window.pricingManager.config = JSON.parse(JSON.stringify(config));
            window.pricingManager.updatePrices();
            console.log('  ✅ Pricing manager mis à jour');
        }
        
        // Émettre un événement global
        const event = new CustomEvent('edsConfigUpdated', {
            detail: {
                version: version.id,
                timestamp: version.timestamp,
                changes: version.metadata.changes || [],
                validation: version.validation
            }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
            console.log('  ✅ Événement global émis');
        }
        
        console.log('✅ Propagation terminée');
    }
    
    /**
     * Obtenir des statistiques de validation
     */
    getValidationStats() {
        const recent = this.versionHistory.slice(0, 10);
        
        return {
            totalVersions: this.versionHistory.length,
            currentVersion: this.currentVersion,
            recentValidations: {
                valid: recent.filter(v => v.validation?.valid).length,
                invalid: recent.filter(v => v.validation && !v.validation.valid).length,
                avgErrors: recent.reduce((sum, v) => sum + (v.validation?.errors?.length || 0), 0) / recent.length,
                avgWarnings: recent.reduce((sum, v) => sum + (v.validation?.warnings?.length || 0), 0) / recent.length
            },
            rules: {
                schema: this.validationRules.size,
                business: this.businessRules.size,
                total: this.validationRules.size + this.businessRules.size
            }
        };
    }
}

// Export pour utilisation
if (typeof window !== 'undefined') {
    window.ValidationSystem = ValidationSystem;
} else if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationSystem;
}
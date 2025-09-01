/**
 * Gestionnaire de Configuration Centralisé Li-CUBE PRO™
 * 
 * Rôle : Configuration centralisée et extensible pour tous les modules
 * Responsabilité : Gestion unifiée des paramètres, validation et extension
 * Extensibilité : Système de plugins et configurations personnalisées
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class ConfigManager {
    constructor() {
        // Rôle : Configuration par défaut centralisée
        // Type : Object - Structure de configuration hiérarchique
        // Extensibilité : Facilement extensible via addConfig()
        this.config = {
            // Paramètres de l'application
            app: {
                name: 'Li-CUBE PRO™',
                version: '2.0.0',
                environment: 'production'
            },
            
            // Configuration de synchronisation
            sync: {
                delay: 50,              // Délai anti-rebond en millisecondes
                maxRetries: 3,          // Nombre maximum de tentatives
                storagePrefix: 'licubepro',  // Préfixe pour les clés localStorage
                healthCheckInterval: 10000   // Intervalle de vérification santé (ms)
            },
            
            // Configuration des animations
            animations: {
                duration: 300,          // Durée des animations (ms)  
                easing: 'ease',         // Type d'animation CSS
                highlightDuration: 600, // Durée surbrillance champs (ms)
                debounceDelay: 25       // Délai anti-rebond animations (ms)
            },
            
            // Configuration des couleurs et thème
            theme: {
                colors: {
                    primary: '#0F172A',
                    secondary: '#1E293B', 
                    accent: '#10B981',
                    success: '#059669',
                    warning: '#F59E0B',
                    error: '#EF4444'
                },
                fonts: {
                    primary: "'Inter', sans-serif",
                    secondary: "'Playfair Display', serif"
                }
            },
            
            // Configuration des types de pages supportées
            pages: {
                vente: {
                    name: 'Vente',
                    storageKey: 'vente-live',
                    targetUrl: 'vente.html',
                    editorUrl: 'edit-vente.html'
                },
                location: {
                    name: 'Location',
                    storageKey: 'location-live', 
                    targetUrl: 'location.html',
                    editorUrl: 'edit-location.html'
                }
            },
            
            // Configuration des validations
            validation: {
                email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                phone: /^(\+1[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}$/,
                required: {
                    minLength: 1,
                    maxLength: 1000
                }
            },
            
            // Configuration des champs spéciaux
            fields: {
                images: ['logo-path', 'product-image-path', 'competitor-image-path', 'company-image-path'],
                links: ['rental-phone', 'rental-email', 'phone-number', 'email-address'],
                metadata: ['page-title', 'page-description'],
                spacers: ['header-spacer', 'section-spacer']
            }
        };
        
        // Rôle : Cache des configurations personnalisées
        // Type : Map - Cache haute performance pour configurations étendues  
        this.customConfigs = new Map();
        
        // Rôle : Observateurs pour les changements de configuration
        // Type : Set - Collection des callbacks de notification
        this.observers = new Set();
        
        this.init();
    }
    
    /**
     * Initialisation : chargement de la configuration depuis le fichier JSON
     */
    async init() {
        try {
            // Chargement : configuration depuis le fichier de défauts
            const response = await fetch('./location-defaults.json');
            const defaultValues = await response.json();
            
            // Fusion : valeurs par défaut avec configuration système
            this.config.defaults = defaultValues;
            
            // Notification : configuration initialisée
            this.notifyObservers('initialized', this.config);
            
            console.log('✅ ConfigManager initialisé avec', Object.keys(defaultValues).length, 'valeurs par défaut');
        } catch (error) {
            console.warn('⚠️ Impossible de charger location-defaults.json, utilisation config interne');
        }
    }
    
    /**
     * Récupération : valeur de configuration par chemin
     * @param {string} path - Chemin de la configuration (ex: 'sync.delay' ou 'theme.colors.primary')
     * @param {any} defaultValue - Valeur par défaut si non trouvée
     * @return {any} - Valeur de configuration
     */
    get(path, defaultValue = null) {
        // Rôle : Navigation dans l'arbre de configuration
        // Logique : Séparation par points pour accès hiérarchique
        const keys = path.split('.');
        let current = this.config;
        
        // Parcours : chaque niveau de l'arbre de configuration
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }
    
    /**
     * Configuration : définition d'une valeur par chemin
     * @param {string} path - Chemin de configuration
     * @param {any} value - Nouvelle valeur
     */
    set(path, value) {
        // Rôle : Modification dynamique de la configuration
        // Responsabilité : Mise à jour avec notification des observateurs
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = this.config;
        
        // Navigation : jusqu'au parent de la valeur cible
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Modification : valeur finale
        const oldValue = current[lastKey];
        current[lastKey] = value;
        
        // Notification : changement aux observateurs
        this.notifyObservers('changed', { path, oldValue, newValue: value });
        
        console.log(`📝 Configuration mise à jour: ${path} = ${value}`);
    }
    
    /**
     * Extension : ajout d'une configuration personnalisée
     * @param {string} namespace - Espace de noms pour la configuration
     * @param {Object} config - Configuration à ajouter
     */
    addConfig(namespace, config) {
        // Rôle : Extensibilité pour modules tiers
        // Stockage : Configuration dans cache séparé pour isolation
        this.customConfigs.set(namespace, config);
        
        // Fusion : avec configuration principale sous le namespace
        this.config[namespace] = { ...this.config[namespace], ...config };
        
        // Notification : nouvelle configuration ajoutée
        this.notifyObservers('extended', { namespace, config });
        
        console.log(`🔧 Configuration étendue: ${namespace}`);
    }
    
    /**
     * Récupération : configuration complète d'un namespace
     * @param {string} namespace - Espace de noms 
     * @return {Object} - Configuration du namespace
     */
    getNamespace(namespace) {
        return this.config[namespace] || {};
    }
    
    /**
     * Validation : vérification d'une valeur selon les règles configurées
     * @param {string} fieldType - Type de champ (email, phone, required)
     * @param {any} value - Valeur à valider
     * @return {Object} - {isValid: boolean, message: string}
     */
    validate(fieldType, value) {
        // Rôle : Validation centralisée selon les règles configurées
        // Extensibilité : Nouvelles règles ajoutables via configuration
        const validationRules = this.get('validation');
        
        // Validation : champs requis
        if (fieldType === 'required') {
            const { minLength, maxLength } = validationRules.required;
            if (!value || value.length < minLength) {
                return { isValid: false, message: `Minimum ${minLength} caractère requis` };
            }
            if (value.length > maxLength) {
                return { isValid: false, message: `Maximum ${maxLength} caractères autorisés` };
            }
        }
        
        // Validation : email
        if (fieldType === 'email') {
            if (!validationRules.email.test(value)) {
                return { isValid: false, message: 'Format d\'email invalide' };
            }
        }
        
        // Validation : téléphone
        if (fieldType === 'phone') {
            if (!validationRules.phone.test(value)) {
                return { isValid: false, message: 'Format de téléphone invalide' };
            }
        }
        
        return { isValid: true, message: '' };
    }
    
    /**
     * Génération : clé de stockage standardisée
     * @param {string} pageType - Type de page (vente, location)
     * @param {string} suffix - Suffixe optionnel (live, backup, etc.)
     * @return {string} - Clé de stockage formatée
     */
    getStorageKey(pageType, suffix = 'live') {
        // Rôle : Standardisation des clés de stockage
        // Format : licubepro-{pageType}-{suffix}
        const prefix = this.get('sync.storagePrefix');
        return `${prefix}-${pageType}-${suffix}`;
    }
    
    /**
     * Récupération : configuration de page par type
     * @param {string} pageType - Type de page
     * @return {Object} - Configuration de la page
     */
    getPageConfig(pageType) {
        return this.get(`pages.${pageType}`, {});
    }
    
    /**
     * Vérification : si un champ est d'un type spécial
     * @param {string} fieldName - Nom du champ
     * @param {string} fieldType - Type à vérifier (images, links, metadata, spacers)
     * @return {boolean} - true si le champ est du type spécifié
     */
    isFieldType(fieldName, fieldType) {
        const fieldList = this.get(`fields.${fieldType}`, []);
        return fieldList.includes(fieldName) || fieldName.includes(fieldType);
    }
    
    /**
     * Observer : ajout d'un observateur pour les changements
     * @param {Function} callback - Fonction appelée lors des changements
     */
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    /**
     * Observer : suppression d'un observateur
     * @param {Function} callback - Fonction à supprimer
     */
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    /**
     * Notification : envoi d'événement à tous les observateurs
     * @param {string} event - Type d'événement
     * @param {any} data - Données de l'événement
     */
    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Erreur dans observateur ConfigManager:', error);
            }
        });
    }
    
    /**
     * Export : configuration complète pour sauvegarde
     * @return {Object} - Configuration complète
     */
    export() {
        return {
            config: this.config,
            custom: Object.fromEntries(this.customConfigs),
            timestamp: Date.now()
        };
    }
    
    /**
     * Import : restauration de configuration depuis export
     * @param {Object} exportedConfig - Configuration exportée
     */
    import(exportedConfig) {
        if (exportedConfig.config) {
            this.config = { ...exportedConfig.config };
        }
        
        if (exportedConfig.custom) {
            this.customConfigs = new Map(Object.entries(exportedConfig.custom));
        }
        
        this.notifyObservers('imported', exportedConfig);
        console.log('📥 Configuration importée');
    }
}

// Rôle : Instance globale singleton pour accès unifié
// Extensibilité : Une seule instance partagée entre tous les modules
window.ConfigManager = window.ConfigManager || new ConfigManager();

// Export : pour utilisation en module ES6
export default window.ConfigManager;

// Export : pour utilisation CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}
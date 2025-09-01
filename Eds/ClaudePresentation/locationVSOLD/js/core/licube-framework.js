/**
 * Framework Li-CUBE PRO™ - Système Intégré Extensible
 * 
 * Rôle : Point d'entrée unifié et orchestrateur de tous les modules
 * Responsabilité : Initialisation, coordination et extension du système
 * Extensibilité : Architecture de plugins et modules tiers
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class LiCubeFramework {
    constructor(options = {}) {
        // Rôle : Configuration globale du framework
        // Type : Object - Options personnalisables et extensibles
        this.options = {
            autoInit: options.autoInit !== false,
            debug: options.debug || false,
            pageType: options.pageType || this.detectPageType(),
            environment: options.environment || 'production',
            plugins: options.plugins || [],
            ...options
        };
        
        // Rôle : Modules core du framework
        // Type : Object - Services fondamentaux du système
        this.core = {
            config: null,           // ConfigManager
            storage: null,          // StorageService  
            sync: null,             // SyncEngine
            components: null,       // ComponentFactory
            validator: null,        // ValidationService
            events: null           // EventBus
        };
        
        // Rôle : Registry des plugins installés
        // Type : Map - Collection des plugins et extensions
        this.plugins = new Map();
        
        // Rôle : État du framework
        // Type : Object - Suivi du cycle de vie et santé
        this.state = {
            isInitialized: false,
            isStarted: false,
            version: '2.0.0',
            startTime: null,
            lastActivity: null
        };
        
        // Rôle : Cache performance et optimisations
        // Type : Object - Optimisations diverses du framework
        this.cache = {
            components: new Map(),
            templates: new Map(),
            configurations: new Map()
        };
        
        // Auto-initialisation si activée
        if (this.options.autoInit) {
            this.init();
        }
    }
    
    /**
     * Initialisation : démarrage du framework complet
     * @return {Promise<LiCubeFramework>} - Instance du framework
     */
    async init() {
        if (this.state.isInitialized) {
            console.warn('⚠️ Framework déjà initialisé');
            return this;
        }
        
        console.log(`🚀 Initialisation Li-CUBE PRO™ Framework v${this.state.version} (${this.options.pageType})`);
        
        try {
            // Phase 1 : Initialisation des modules core
            await this.initializeCoreModules();
            
            // Phase 2 : Installation des plugins
            await this.installPlugins();
            
            // Phase 3 : Configuration du type de page
            await this.configurePageType();
            
            // Phase 4 : Démarrage des services
            await this.startServices();
            
            // Marquage : framework prêt
            this.state.isInitialized = true;
            this.state.isStarted = true;
            this.state.startTime = Date.now();
            
            // Exposition : API globale
            this.exposeGlobalAPI();
            
            // Événement : framework prêt
            this.emit('framework-ready', this.getStatus());
            
            console.log('✅ Framework Li-CUBE PRO™ initialisé avec succès');
            return this;
            
        } catch (error) {
            console.error('❌ Erreur initialisation framework:', error);
            this.handleInitializationError(error);
            throw error;
        }
    }
    
    /**
     * Initialisation : modules core du système
     */
    async initializeCoreModules() {
        console.log('📦 Initialisation modules core...');
        
        // Module : Configuration centralisée
        const { default: ConfigManager } = await import('./config-manager.js');
        this.core.config = new ConfigManager();
        await this.core.config.init();
        
        // Module : Service de stockage
        const { default: StorageService } = await import('./storage-service.js');
        this.core.storage = new StorageService({
            prefix: this.core.config.get('sync.storagePrefix'),
            useCompression: this.core.config.get('storage.compression', false),
            fallbackToMemory: true
        });
        
        // Module : Moteur de synchronisation
        const { default: SyncEngine } = await import('./sync-engine.js');
        this.core.sync = new SyncEngine(this.core.config, this.core.storage);
        
        // Module : Fabrique de composants
        const { default: ComponentFactory } = await import('./component-factory.js');
        this.core.components = new ComponentFactory(this.core.config, this.core.storage);
        
        // Module : Service de validation
        this.core.validator = new ValidationService(this.core.config);
        
        // Module : Bus d'événements
        this.core.events = new EventBus();
        
        // Interconnexion : liaison des modules entre eux
        this.interconnectModules();
        
        console.log('✅ Modules core initialisés');
    }
    
    /**
     * Interconnexion : liaison des modules core
     */
    interconnectModules() {
        // Liaison : events entre modules
        this.core.sync.on('sync-success', (data) => {
            this.core.events.emit('sync-completed', data);
        });
        
        this.core.config.addObserver((event, data) => {
            this.core.events.emit('config-changed', { event, data });
        });
        
        this.core.storage.addObserver((event, data) => {
            this.core.events.emit('storage-operation', { event, data });
        });
        
        console.log('🔗 Modules interconnectés');
    }
    
    /**
     * Installation : plugins du framework
     */
    async installPlugins() {
        console.log('🔌 Installation plugins...');
        
        for (const pluginConfig of this.options.plugins) {
            try {
                await this.installPlugin(pluginConfig);
            } catch (error) {
                console.warn(`⚠️ Échec installation plugin ${pluginConfig.name}:`, error);
            }
        }
        
        console.log(`✅ ${this.plugins.size} plugins installés`);
    }
    
    /**
     * Installation : plugin individuel
     * @param {Object} pluginConfig - Configuration du plugin
     */
    async installPlugin(pluginConfig) {
        const { name, module, options = {} } = pluginConfig;
        
        // Chargement : module plugin
        let PluginClass;
        if (typeof module === 'string') {
            const imported = await import(module);
            PluginClass = imported.default || imported;
        } else {
            PluginClass = module;
        }
        
        // Validation : interface plugin
        if (typeof PluginClass !== 'function') {
            throw new Error(`Plugin ${name}: doit être une classe ou fonction`);
        }
        
        // Instanciation : plugin avec accès au framework
        const pluginInstance = new PluginClass({
            framework: this,
            ...options
        });
        
        // Validation : méthodes requises
        if (typeof pluginInstance.install !== 'function') {
            throw new Error(`Plugin ${name}: méthode install() requise`);
        }
        
        // Installation : plugin dans le framework
        await pluginInstance.install();
        
        // Enregistrement : plugin actif
        this.plugins.set(name, {
            instance: pluginInstance,
            config: pluginConfig,
            installedAt: Date.now()
        });
        
        console.log(`🔌 Plugin installé: ${name}`);
    }
    
    /**
     * Configuration : spécifique au type de page
     */
    async configurePageType() {
        const pageType = this.options.pageType;
        const pageConfig = this.core.config.getPageConfig(pageType);
        
        if (!pageConfig.name) {
            console.warn(`⚠️ Configuration manquante pour type de page: ${pageType}`);
            return;
        }
        
        // Configuration : stratégie de sync par défaut selon le type
        const defaultStrategy = pageType === 'location' ? 'instant' : 'batch';
        this.core.sync.setDefaultStrategy(defaultStrategy);
        
        // Configuration : composants spécifiques au type de page
        await this.loadPageSpecificComponents(pageType);
        
        console.log(`⚙️ Page configurée: ${pageConfig.name} (${pageType})`);
    }
    
    /**
     * Chargement : composants spécifiques à une page
     * @param {string} pageType - Type de page
     */
    async loadPageSpecificComponents(pageType) {
        // Définitions : composants par type de page
        const pageComponents = {
            location: ['SyncIndicator', 'PricingCard', 'SpacerSection'],
            vente: ['SyncIndicator', 'ProductShowcase', 'ContactForm']
        };
        
        const components = pageComponents[pageType] || [];
        
        for (const componentType of components) {
            try {
                // Pré-création : composants dans le cache
                const template = await this.core.components.createComponent(componentType, {
                    preload: true
                });
                
                this.cache.components.set(componentType, template);
                
            } catch (error) {
                console.warn(`⚠️ Échec préchargement composant ${componentType}:`, error);
            }
        }
    }
    
    /**
     * Démarrage : services du framework
     */
    async startServices() {
        console.log('🔄 Démarrage services...');
        
        // Service : détection automatique des champs éditables
        this.startFieldDetection();
        
        // Service : synchronisation temps réel
        this.startRealtimeSync();
        
        // Service : surveillance de santé
        this.startHealthMonitoring();
        
        // Service : nettoyage automatique
        this.startMaintenanceTasks();
        
        console.log('✅ Services démarrés');
    }
    
    /**
     * Détection : champs éditables automatique
     */
    startFieldDetection() {
        // Observer : mutations DOM pour nouveaux champs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanForEditableFields(node);
                        }
                    });
                }
            });
        });
        
        // Surveillance : DOM complet
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Scan initial : champs existants
        this.scanForEditableFields(document.body);
    }
    
    /**
     * Scan : recherche de champs éditables
     * @param {HTMLElement} container - Container à scanner
     */
    scanForEditableFields(container) {
        const editableFields = container.querySelectorAll('[data-field]');
        
        editableFields.forEach((field) => {
            if (!field.hasAttribute('data-framework-registered')) {
                this.registerEditableField(field);
                field.setAttribute('data-framework-registered', 'true');
            }
        });
    }
    
    /**
     * Enregistrement : champ éditable
     * @param {HTMLElement} field - Élément champ
     */
    registerEditableField(field) {
        const fieldName = field.dataset.field;
        
        // Événements : synchronisation automatique
        field.addEventListener('input', () => {
            this.core.sync.sync({
                type: 'field-update',
                fieldName: fieldName,
                data: this.extractFieldValue(field),
                strategy: 'instant'
            });
        });
        
        // Événements : validation temps réel
        field.addEventListener('blur', () => {
            this.validateField(field);
        });
        
        // Styling : indication framework actif
        field.classList.add('framework-managed');
    }
    
    /**
     * Démarrage : synchronisation temps réel
     */
    startRealtimeSync() {
        // Configuration : selon le type de page
        const isEditor = window.location.pathname.includes('edit-');
        const isPresentation = !isEditor;
        
        if (isEditor) {
            // Mode : éditeur - émission de changements
            this.core.sync.on('sync-success', (data) => {
                this.broadcastChange(data);
            });
        } else if (isPresentation) {
            // Mode : présentation - réception de changements
            this.listenForChanges();
        }
    }
    
    /**
     * Diffusion : changement vers les pages de présentation
     * @param {Object} data - Données de changement
     */
    broadcastChange(data) {
        // Broadcast : via storage events
        const message = {
            type: 'framework-sync',
            framework: 'licube-pro',
            data: data,
            timestamp: Date.now()
        };
        
        this.core.storage.set(`broadcast-${Date.now()}`, message, { 
            temporary: true, 
            ttl: 5000 
        });
    }
    
    /**
     * Écoute : changements depuis les éditeurs
     */
    listenForChanges() {
        // Écoute : storage events
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.includes('broadcast-')) {
                try {
                    const message = JSON.parse(event.newValue);
                    if (message.framework === 'licube-pro') {
                        this.handleRemoteChange(message.data);
                    }
                } catch (error) {
                    // Ignore les messages malformés
                }
            }
        });
    }
    
    /**
     * Traitement : changement distant
     * @param {Object} data - Données de changement
     */
    handleRemoteChange(data) {
        // Application : changement au DOM
        const field = document.querySelector(`[data-field="${data.fieldName}"]`);
        if (field) {
            this.applyFieldValue(field, data.data);
            this.animateFieldUpdate(field);
        }
        
        // Événement : changement appliqué
        this.emit('remote-change-applied', data);
    }
    
    /**
     * Surveillance : santé du framework
     */
    startHealthMonitoring() {
        setInterval(() => {
            const status = this.getHealthStatus();
            
            if (!status.isHealthy) {
                console.warn('⚠️ Framework en mauvaise santé:', status);
                this.emit('health-warning', status);
                
                // Auto-récupération
                this.attemptRecovery();
            }
        }, 30000); // Toutes les 30 secondes
    }
    
    /**
     * État : santé du framework
     * @return {Object} - Status de santé détaillé
     */
    getHealthStatus() {
        const now = Date.now();
        
        return {
            isHealthy: this.isFrameworkHealthy(),
            uptime: now - this.state.startTime,
            lastActivity: this.state.lastActivity,
            modules: {
                config: !!this.core.config,
                storage: !!this.core.storage,
                sync: !!this.core.sync,
                components: !!this.core.components
            },
            plugins: this.plugins.size,
            memoryUsage: this.getMemoryUsage()
        };
    }
    
    /**
     * Vérification : santé globale du framework
     * @return {boolean} - true si en bonne santé
     */
    isFrameworkHealthy() {
        // Vérification : modules core initialisés
        const coreModulesOk = Object.values(this.core).every(module => module !== null);
        
        // Vérification : sync engine en santé
        const syncHealthy = this.core.sync ? this.core.sync.getStatus().isHealthy : false;
        
        // Vérification : activité récente
        const timeSinceActivity = Date.now() - (this.state.lastActivity || this.state.startTime);
        const maxInactivity = 300000; // 5 minutes
        const activityOk = timeSinceActivity < maxInactivity;
        
        return coreModulesOk && syncHealthy && activityOk;
    }
    
    /**
     * Maintenance : tâches de nettoyage périodiques
     */
    startMaintenanceTasks() {
        // Nettoyage : toutes les 5 minutes
        setInterval(() => {
            this.performMaintenance();
        }, 300000);
    }
    
    /**
     * Maintenance : opérations de nettoyage
     */
    async performMaintenance() {
        console.log('🧹 Maintenance framework...');
        
        // Nettoyage : caches expirés
        this.cleanExpiredCache();
        
        // Nettoyage : storage temporaire
        if (this.core.storage) {
            await this.core.storage.cleanup();
        }
        
        // Nettoyage : plugins inactifs
        this.cleanupInactivePlugins();
        
        // Statistiques : mise à jour
        this.updateStatistics();
    }
    
    /**
     * Nettoyage : cache expiré
     */
    cleanExpiredCache() {
        const maxAge = 3600000; // 1 heure
        const now = Date.now();
        
        // Cache : configurations
        for (const [key, item] of this.cache.configurations.entries()) {
            if (item.timestamp && (now - item.timestamp) > maxAge) {
                this.cache.configurations.delete(key);
            }
        }
        
        // Cache : templates
        for (const [key, item] of this.cache.templates.entries()) {
            if (item.timestamp && (now - item.timestamp) > maxAge) {
                this.cache.templates.delete(key);
            }
        }
    }
    
    /**
     * Récupération : tentative de redémarrage automatique
     */
    async attemptRecovery() {
        console.log('🔧 Tentative de récupération framework...');
        
        try {
            // Redémarrage : services essentiels
            if (this.core.sync && !this.core.sync.getStatus().isHealthy) {
                this.core.sync.pause();
                setTimeout(() => this.core.sync.resume(), 1000);
            }
            
            // Réinitialisation : caches
            this.cache.components.clear();
            this.cache.templates.clear();
            
            // Notification : récupération tentée
            this.emit('recovery-attempted', { timestamp: Date.now() });
            
        } catch (error) {
            console.error('❌ Échec récupération framework:', error);
            this.emit('recovery-failed', { error: error.message });
        }
    }
    
    /**
     * Exposition : API globale du framework
     */
    exposeGlobalAPI() {
        // API : objet global
        window.LiCube = {
            framework: this,
            version: this.state.version,
            
            // API : raccourcis utilitaires
            sync: (fieldName, value) => this.core.sync.sync({
                type: 'field-update',
                fieldName,
                data: value
            }),
            
            createComponent: (type, config, container) => 
                this.core.components.createComponent(type, config, container),
            
            validate: (type, value) => this.core.validator.validate(type, value),
            
            on: (event, handler) => this.core.events.on(event, handler),
            
            emit: (event, data) => this.core.events.emit(event, data),
            
            getStatus: () => this.getStatus(),
            
            // API : configuration dynamique
            config: {
                get: (path, defaultValue) => this.core.config.get(path, defaultValue),
                set: (path, value) => this.core.config.set(path, value)
            }
        };
        
        console.log('🌐 API globale exposée: window.LiCube');
    }
    
    /**
     * Détection : type de page automatique
     * @return {string} - Type détecté
     */
    detectPageType() {
        const path = window.location.pathname.toLowerCase();
        
        if (path.includes('location')) return 'location';
        if (path.includes('vente')) return 'vente';
        
        // Fallback : analyse du contenu
        const hasLocationContent = document.querySelector('[data-field*="rental"]');
        const hasVenteContent = document.querySelector('[data-field*="price"]');
        
        if (hasLocationContent) return 'location';
        if (hasVenteContent) return 'vente';
        
        return 'location'; // Défaut
    }
    
    // ==========================================
    // UTILITAIRES ET HELPERS
    // ==========================================
    
    /**
     * Extraction : valeur d'un champ
     * @param {HTMLElement} field - Élément champ
     * @return {any} - Valeur extraite
     */
    extractFieldValue(field) {
        const tagName = field.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
            return field.value;
        } else if (field.contentEditable === 'true') {
            return field.innerHTML;
        } else {
            return field.textContent;
        }
    }
    
    /**
     * Application : valeur à un champ
     * @param {HTMLElement} field - Élément champ
     * @param {any} value - Valeur à appliquer
     */
    applyFieldValue(field, value) {
        const tagName = field.tagName.toLowerCase();
        
        if (tagName === 'input' || tagName === 'textarea') {
            field.value = value;
        } else if (field.contentEditable === 'true') {
            field.innerHTML = value;
        } else {
            field.textContent = value;
        }
        
        // Événements : notification du changement
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    /**
     * Animation : mise à jour de champ
     * @param {HTMLElement} field - Champ à animer
     */
    animateFieldUpdate(field) {
        field.style.transition = 'all 0.3s ease';
        field.style.backgroundColor = 'rgba(16, 185, 129, 0.2)';
        field.style.borderColor = '#10B981';
        
        setTimeout(() => {
            field.style.backgroundColor = '';
            field.style.borderColor = '';
        }, 600);
    }
    
    /**
     * Validation : champ individuel
     * @param {HTMLElement} field - Champ à valider
     */
    async validateField(field) {
        const fieldName = field.dataset.field;
        const value = this.extractFieldValue(field);
        
        // Détermination : type de validation
        let validationType = 'required';
        if (fieldName.includes('email')) validationType = 'email';
        if (fieldName.includes('phone')) validationType = 'phone';
        
        // Validation : via le service
        const result = await this.core.validator.validate(validationType, value);
        
        // Application : résultat visuel
        this.applyValidationResult(field, result);
        
        return result;
    }
    
    /**
     * Application : résultat de validation
     * @param {HTMLElement} field - Champ validé
     * @param {Object} result - Résultat de validation
     */
    applyValidationResult(field, result) {
        field.classList.remove('field-valid', 'field-invalid');
        
        if (result.isValid) {
            field.classList.add('field-valid');
            field.title = '';
        } else {
            field.classList.add('field-invalid');
            field.title = result.message;
        }
    }
    
    /**
     * Émission : événement framework
     * @param {string} eventType - Type d'événement
     * @param {any} data - Données de l'événement
     */
    emit(eventType, data) {
        if (this.core.events) {
            this.core.events.emit(eventType, data);
        }
        
        // Mise à jour : activité
        this.state.lastActivity = Date.now();
    }
    
    /**
     * Statistiques : utilisation mémoire
     * @return {Object} - Informations mémoire
     */
    getMemoryUsage() {
        let totalSize = 0;
        
        // Cache : composants
        for (const component of this.cache.components.values()) {
            totalSize += JSON.stringify(component).length * 2;
        }
        
        // Cache : configurations
        for (const config of this.cache.configurations.values()) {
            totalSize += JSON.stringify(config).length * 2;
        }
        
        return {
            estimated: Math.round(totalSize / 1024), // KB
            caches: {
                components: this.cache.components.size,
                templates: this.cache.templates.size,
                configurations: this.cache.configurations.size
            }
        };
    }
    
    /**
     * Mise à jour : statistiques d'utilisation
     */
    updateStatistics() {
        // Statistiques : agrégées de tous les modules
        const stats = {
            framework: this.getStatus(),
            config: this.core.config ? this.core.config.export() : null,
            storage: this.core.storage ? this.core.storage.getStats() : null,
            sync: this.core.sync ? this.core.sync.getStatus() : null,
            components: this.core.components ? this.core.components.getStats() : null
        };
        
        // Sauvegarde : statistiques (pour debug/analytics)
        if (this.options.debug) {
            console.table(stats.framework);
        }
    }
    
    /**
     * Status : état complet du framework
     * @return {Object} - État détaillé
     */
    getStatus() {
        return {
            ...this.state,
            pageType: this.options.pageType,
            health: this.getHealthStatus(),
            modules: Object.keys(this.core).map(key => ({
                name: key,
                initialized: this.core[key] !== null,
                status: this.core[key]?.getStatus?.() || 'unknown'
            })),
            plugins: Array.from(this.plugins.keys()),
            memory: this.getMemoryUsage()
        };
    }
}

// ==========================================
// SERVICES COMPLÉMENTAIRES
// ==========================================

/**
 * Service de Validation Unifié
 */
class ValidationService {
    constructor(config) {
        this.config = config;
        this.validators = new Map();
        this.registerDefaultValidators();
    }
    
    registerDefaultValidators() {
        // Validation : email
        this.validators.set('email', (value) => {
            const regex = this.config.get('validation.email');
            return {
                isValid: regex.test(value),
                message: 'Format d\'email invalide'
            };
        });
        
        // Validation : téléphone
        this.validators.set('phone', (value) => {
            const regex = this.config.get('validation.phone');
            return {
                isValid: regex.test(value),
                message: 'Format de téléphone invalide'
            };
        });
        
        // Validation : requis
        this.validators.set('required', (value) => {
            const rules = this.config.get('validation.required');
            const isValid = value && value.length >= rules.minLength && value.length <= rules.maxLength;
            
            return {
                isValid,
                message: isValid ? '' : `${rules.minLength}-${rules.maxLength} caractères requis`
            };
        });
    }
    
    async validate(type, value) {
        const validator = this.validators.get(type);
        
        if (!validator) {
            return { isValid: true, message: '' };
        }
        
        return validator(value);
    }
    
    registerValidator(type, validatorFunc) {
        this.validators.set(type, validatorFunc);
    }
}

/**
 * Bus d'Événements Centralisé
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    
    on(eventType, handler) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        
        this.listeners.get(eventType).add(handler);
    }
    
    off(eventType, handler) {
        const handlers = this.listeners.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }
    
    emit(eventType, data) {
        const handlers = this.listeners.get(eventType);
        
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Erreur handler ${eventType}:`, error);
                }
            });
        }
    }
}

// ==========================================
// AUTO-INITIALISATION
// ==========================================

// Initialisation automatique au chargement DOM
document.addEventListener('DOMContentLoaded', () => {
    // Instance : framework global
    window.LiCubeFramework = new LiCubeFramework({
        debug: new URLSearchParams(location.search).has('debug')
    });
});

// Export ES6
export default LiCubeFramework;

// Export CommonJS  
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiCubeFramework;
}
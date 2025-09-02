/**
 * ============================================================================
 * WIDGET LOADER - Système de Chargement Modulaire
 * ============================================================================
 * 
 * Rôle : Chargement dynamique et gestion des widgets modulaires
 * Type : Core system - Module loader et registry
 * Usage : Centralise le chargement et l'instanciation des widgets
 */

class WidgetLoader {
    constructor() {
        // Registry des widgets - Map des classes chargées
        this.widgetRegistry = new Map();
        
        // Registry des sections - Map des templates de sections
        this.sectionRegistry = new Map();
        
        // Cache des instances - Optimisation performance
        this.instanceCache = new Map();
        
        // Configuration des chemins - Base paths pour modules
        this.basePaths = {
            widgets: './templates/widgets/',
            sections: './templates/sections/',
            metaSections: './templates/meta-sections/'
        };
        
        // État de chargement - Tracking des modules
        this.loadingState = {
            loaded: new Set(),
            loading: new Set(),
            failed: new Set()
        };
    }

    /**
     * Rôle : Chargement dynamique d'un widget
     * Type : Module loading - Import dynamique ES6
     * Retour : Promise<Class> de la classe du widget
     */
    async loadWidget(widgetType) {
        // Vérification cache - Éviter rechargement
        if (this.widgetRegistry.has(widgetType)) {
            return this.widgetRegistry.get(widgetType);
        }

        // Vérification chargement en cours - Éviter doublons
        if (this.loadingState.loading.has(widgetType)) {
            return this.waitForWidget(widgetType);
        }

        this.loadingState.loading.add(widgetType);

        try {
            // Construction du chemin - Chemin vers le module
            const widgetPath = `${this.basePaths.widgets}${widgetType}.js`;
            
            // Import dynamique - Chargement ES6 module
            const module = await import(widgetPath);
            const WidgetClass = module.default;

            // Validation de la classe - Vérification structure
            if (!this.validateWidgetClass(WidgetClass)) {
                throw new Error(`Widget ${widgetType} ne respecte pas l'interface requise`);
            }

            // Enregistrement - Ajout au registry
            this.widgetRegistry.set(widgetType, WidgetClass);
            this.loadingState.loaded.add(widgetType);
            this.loadingState.loading.delete(widgetType);

            return WidgetClass;

        } catch (error) {
            this.loadingState.failed.add(widgetType);
            this.loadingState.loading.delete(widgetType);
            
            console.error(`Erreur chargement widget ${widgetType}:`, error);
            throw error;
        }
    }

    /**
     * Rôle : Chargement dynamique d'une section
     * Type : Section loading - Import template de section
     * Retour : Promise<Class> de la classe de section
     */
    async loadSection(sectionType) {
        // Vérification cache section - Optimisation
        if (this.sectionRegistry.has(sectionType)) {
            return this.sectionRegistry.get(sectionType);
        }

        try {
            // Construction chemin section - Path vers template
            const sectionPath = `${this.basePaths.sections}${sectionType}.js`;
            
            // Import dynamique section - Chargement module
            const module = await import(sectionPath);
            const SectionClass = module.default;

            // Validation classe section - Interface check
            if (!this.validateSectionClass(SectionClass)) {
                throw new Error(`Section ${sectionType} ne respecte pas l'interface requise`);
            }

            // Enregistrement section - Registry update
            this.sectionRegistry.set(sectionType, SectionClass);

            return SectionClass;

        } catch (error) {
            console.error(`Erreur chargement section ${sectionType}:`, error);
            throw error;
        }
    }

    /**
     * Rôle : Création d'instance de widget
     * Type : Factory pattern - Instanciation contrôlée
     * Retour : Instance configurée du widget
     */
    async createWidget(widgetType, data = {}, useCache = true) {
        // Clé de cache - Identification unique
        const cacheKey = `${widgetType}-${JSON.stringify(data)}`;
        
        // Vérification cache instance - Performance
        if (useCache && this.instanceCache.has(cacheKey)) {
            return this.instanceCache.get(cacheKey);
        }

        // Chargement de la classe - Obtention du constructeur
        const WidgetClass = await this.loadWidget(widgetType);
        
        // Instanciation - Création de l'objet
        const instance = new WidgetClass();
        
        // Configuration des données - Initialisation
        if (data && Object.keys(data).length > 0) {
            if (typeof instance.setData === 'function') {
                instance.setData(data);
            } else {
                instance.data = data;
            }
        }

        // Mise en cache - Optimisation future
        if (useCache) {
            this.instanceCache.set(cacheKey, instance);
        }

        return instance;
    }

    /**
     * Rôle : Rendu d'un widget avec données
     * Type : Rendering - Génération HTML
     * Retour : Promise<String> HTML du widget
     */
    async renderWidget(widgetType, data = {}) {
        try {
            // Création instance - Widget configuré
            const widget = await this.createWidget(widgetType, data, false);
            
            // Génération HTML - Méthode render
            const html = widget.render(data);
            
            // Génération CSS - Styles du widget
            const styles = widget.getStyles ? widget.getStyles() : '';
            
            return {
                html: html,
                styles: styles,
                widget: widget
            };

        } catch (error) {
            console.error(`Erreur rendu widget ${widgetType}:`, error);
            return this.renderErrorWidget(widgetType, error);
        }
    }

    /**
     * Rôle : Chargement en lot de widgets
     * Type : Batch loading - Chargement multiple
     * Retour : Promise<Map> des widgets chargés
     */
    async loadWidgetsBatch(widgetTypes) {
        const loadPromises = widgetTypes.map(type => 
            this.loadWidget(type).catch(error => ({ type, error }))
        );

        const results = await Promise.all(loadPromises);
        const loaded = new Map();
        const errors = [];

        results.forEach(result => {
            if (result.error) {
                errors.push(result);
            } else {
                loaded.set(result.type || 'unknown', result);
            }
        });

        return { loaded, errors };
    }

    /**
     * Rôle : Découverte automatique des widgets
     * Type : Auto-discovery - Scan des modules disponibles
     * Retour : Promise<Array> liste des widgets trouvés
     */
    async discoverWidgets() {
        try {
            // Scan du répertoire widgets - Liste des fichiers
            const widgetFiles = await this.scanDirectory(this.basePaths.widgets);
            
            // Extraction des noms - Nom sans extension
            const widgetTypes = widgetFiles
                .filter(file => file.endsWith('.js'))
                .map(file => file.replace('.js', ''));

            // Tentative de chargement - Validation existence
            const discoveries = await Promise.allSettled(
                widgetTypes.map(type => this.loadWidget(type))
            );

            // Filtrage des réussites - Widgets valides uniquement
            const availableWidgets = discoveries
                .map((result, index) => ({
                    type: widgetTypes[index],
                    status: result.status,
                    widget: result.status === 'fulfilled' ? result.value : null
                }))
                .filter(item => item.status === 'fulfilled');

            return availableWidgets;

        } catch (error) {
            console.error('Erreur découverte widgets:', error);
            return [];
        }
    }

    /**
     * Rôle : Validation d'une classe de widget
     * Type : Validation - Interface compliance
     * Retour : Boolean de conformité
     */
    validateWidgetClass(WidgetClass) {
        // Vérification constructeur - Classe valide
        if (typeof WidgetClass !== 'function') {
            return false;
        }

        // Instance temporaire - Test des méthodes
        const instance = new WidgetClass();

        // Méthodes requises - Interface minimale
        const requiredMethods = ['render', 'getEditableFields'];
        const optionalMethods = ['getStyles', 'validate', 'attachBehavior'];

        // Vérification méthodes requises - Conformité interface
        for (const method of requiredMethods) {
            if (typeof instance[method] !== 'function') {
                console.warn(`Widget manque la méthode requise: ${method}`);
                return false;
            }
        }

        // Propriétés requises - Configuration de base
        const requiredProps = ['id', 'name', 'category'];
        for (const prop of requiredProps) {
            if (!instance[prop]) {
                console.warn(`Widget manque la propriété requise: ${prop}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Rôle : Validation d'une classe de section
     * Type : Section validation - Interface compliance
     * Retour : Boolean de conformité
     */
    validateSectionClass(SectionClass) {
        // Vérification constructeur section
        if (typeof SectionClass !== 'function') {
            return false;
        }

        const instance = new SectionClass();

        // Méthodes requises pour sections
        const requiredMethods = ['render', 'getConfigOptions'];
        
        for (const method of requiredMethods) {
            if (typeof instance[method] !== 'function') {
                console.warn(`Section manque la méthode requise: ${method}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Rôle : Rendu d'un widget d'erreur
     * Type : Error handling - Fallback widget
     * Retour : Object avec HTML d'erreur
     */
    renderErrorWidget(widgetType, error) {
        const errorHtml = `
            <div class="widget-error" data-widget-type="${widgetType}">
                <div class="error-icon">⚠️</div>
                <div class="error-title">Erreur Widget</div>
                <div class="error-message">
                    Impossible de charger le widget "${widgetType}"
                </div>
                <div class="error-details">
                    ${error.message}
                </div>
                <button class="error-retry" onclick="window.widgetLoader.retryWidget('${widgetType}')">
                    Réessayer
                </button>
            </div>
        `;

        const errorStyles = `
            .widget-error {
                background: rgba(239, 68, 68, 0.1);
                border: 2px dashed #ef4444;
                border-radius: var(--border-radius);
                padding: var(--spacing-lg);
                text-align: center;
                color: #ef4444;
                font-family: var(--font-mono);
                margin: var(--spacing-sm) 0;
            }

            .error-icon {
                font-size: 2rem;
                margin-bottom: var(--spacing-sm);
            }

            .error-title {
                font-weight: bold;
                margin-bottom: var(--spacing-xs);
            }

            .error-message {
                font-size: var(--text-sm);
                margin-bottom: var(--spacing-sm);
                opacity: 0.8;
            }

            .error-details {
                font-size: var(--text-xs);
                background: rgba(239, 68, 68, 0.05);
                padding: var(--spacing-xs);
                border-radius: var(--border-radius-sm);
                margin-bottom: var(--spacing-sm);
            }

            .error-retry {
                background: #ef4444;
                color: white;
                border: none;
                padding: var(--spacing-xs) var(--spacing-sm);
                border-radius: var(--border-radius-sm);
                cursor: pointer;
                font-size: var(--text-sm);
            }

            .error-retry:hover {
                background: #dc2626;
            }
        `;

        return {
            html: errorHtml,
            styles: errorStyles,
            widget: null
        };
    }

    /**
     * Rôle : Attente du chargement d'un widget
     * Type : Async coordination - Promise waiting
     * Retour : Promise<Class> du widget attendu
     */
    async waitForWidget(widgetType, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const checkLoaded = () => {
                // Vérification si chargé - Success case
                if (this.widgetRegistry.has(widgetType)) {
                    resolve(this.widgetRegistry.get(widgetType));
                    return;
                }

                // Vérification si échec - Failure case
                if (this.loadingState.failed.has(widgetType)) {
                    reject(new Error(`Échec de chargement du widget ${widgetType}`));
                    return;
                }

                // Vérification timeout - Time limit
                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout chargement widget ${widgetType}`));
                    return;
                }

                // Nouvelle tentative - Recursive check
                setTimeout(checkLoaded, 100);
            };

            checkLoaded();
        });
    }

    /**
     * Rôle : Scan d'un répertoire pour découverte
     * Type : File system - Directory scanning
     * Retour : Promise<Array> des fichiers trouvés
     */
    async scanDirectory(path) {
        // Note: Cette méthode nécessite une implémentation spécifique
        // selon l'environnement (Node.js, browser avec build tool, etc.)
        
        // Pour le browser avec bundling, on peut utiliser require.context
        // ou une liste statique des widgets disponibles
        
        // Implémentation temporaire avec liste statique
        const knownWidgets = [
            'logo.js',
            'hero-title.js',
            'hero-description.js',
            'pricing-card.js',
            'product-showcase.js',
            'call-to-action.js',
            'benefits-grid.js',
            'advantage-card.js',
            'weakness-list.js',
            'contact-card.js'
        ];

        return knownWidgets;
    }

    /**
     * Rôle : Nettoyage du cache des instances
     * Type : Memory management - Cache cleanup
     */
    clearCache() {
        this.instanceCache.clear();
        console.log('Cache des instances de widgets nettoyé');
    }

    /**
     * Rôle : Statistiques du loader
     * Type : Debug info - Performance metrics
     * Retour : Object avec statistiques
     */
    getStats() {
        return {
            widgetsLoaded: this.loadingState.loaded.size,
            widgetsFailed: this.loadingState.failed.size,
            widgetsInRegistry: this.widgetRegistry.size,
            sectionsInRegistry: this.sectionRegistry.size,
            cachedInstances: this.instanceCache.size,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Rôle : Estimation de l'utilisation mémoire
     * Type : Memory estimation - Performance monitoring
     * Retour : Object avec estimation mémoire
     */
    estimateMemoryUsage() {
        // Estimation approximative de l'utilisation mémoire
        const registrySize = (this.widgetRegistry.size + this.sectionRegistry.size) * 1024; // ~1KB par classe
        const cacheSize = this.instanceCache.size * 512; // ~512B par instance
        
        return {
            registryKB: Math.round(registrySize / 1024),
            cacheKB: Math.round(cacheSize / 1024),
            totalKB: Math.round((registrySize + cacheSize) / 1024)
        };
    }
}

// Instance globale du widget loader
const widgetLoader = new WidgetLoader();

// Export pour utilisation
export default widgetLoader;

// Exposition globale pour développement et debug
if (typeof window !== 'undefined') {
    window.widgetLoader = widgetLoader;
}
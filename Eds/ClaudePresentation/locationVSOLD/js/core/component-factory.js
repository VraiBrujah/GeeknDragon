/**
 * Fabrique de Composants Réutilisables Li-CUBE PRO™
 * 
 * Rôle : Système de composants modulaires et extensibles
 * Responsabilité : Création, gestion et réutilisation de composants UI
 * Extensibilité : Enregistrement de nouveaux types de composants
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class ComponentFactory {
    constructor(config, storageService) {
        // Rôle : Services injectés pour fonctionnalité
        // Type : Object - Configuration et service de stockage
        this.config = config;
        this.storage = storageService;
        
        // Rôle : Registre des types de composants disponibles
        // Type : Map - Collection des définitions de composants
        this.componentTypes = new Map();
        
        // Rôle : Instance de composants créés
        // Type : Map - Cache des composants actifs
        this.activeComponents = new Map();
        
        // Rôle : Templates HTML pour les composants
        // Type : Map - Collection des templates réutilisables
        this.templates = new Map();
        
        this.init();
    }
    
    /**
     * Initialisation : enregistrement des composants de base
     */
    init() {
        // Enregistrement : composants de base du système
        this.registerBaseComponents();
        console.log('✅ ComponentFactory initialisée avec', this.componentTypes.size, 'types de composants');
    }
    
    /**
     * Enregistrement : composants de base du système Li-CUBE PRO™
     */
    registerBaseComponents() {
        // Composant : Champ éditable standard
        this.registerComponent('EditableField', {
            template: this.createEditableFieldTemplate(),
            initialize: this.initializeEditableField.bind(this),
            validate: this.validateField.bind(this),
            sync: this.syncField.bind(this),
            destroy: this.destroyField.bind(this)
        });
        
        // Composant : Section avec espacement
        this.registerComponent('SpacerSection', {
            template: this.createSpacerTemplate(),
            initialize: this.initializeSpacerSection.bind(this),
            resize: this.resizeSpacerSection.bind(this),
            destroy: this.destroySection.bind(this)
        });
        
        // Composant : Card de tarification
        this.registerComponent('PricingCard', {
            template: this.createPricingCardTemplate(),
            initialize: this.initializePricingCard.bind(this),
            updatePrice: this.updatePricingCard.bind(this),
            highlight: this.highlightPricingCard.bind(this),
            destroy: this.destroyCard.bind(this)
        });
        
        // Composant : Sélecteur d'image
        this.registerComponent('ImageSelector', {
            template: this.createImageSelectorTemplate(),
            initialize: this.initializeImageSelector.bind(this),
            changeImage: this.changeImage.bind(this),
            previewImage: this.previewImage.bind(this),
            destroy: this.destroyImageSelector.bind(this)
        });
        
        // Composant : Indicateur de synchronisation
        this.registerComponent('SyncIndicator', {
            template: this.createSyncIndicatorTemplate(),
            initialize: this.initializeSyncIndicator.bind(this),
            updateStatus: this.updateSyncStatus.bind(this),
            animate: this.animateSyncIndicator.bind(this),
            destroy: this.destroySyncIndicator.bind(this)
        });
    }
    
    /**
     * Enregistrement : nouveau type de composant
     * @param {string} componentType - Type de composant
     * @param {Object} definition - Définition du composant
     */
    registerComponent(componentType, definition) {
        // Rôle : Extension du système avec nouveaux composants
        // Validation : définition complète du composant
        const requiredMethods = ['template', 'initialize', 'destroy'];
        
        for (const method of requiredMethods) {
            if (!definition[method]) {
                throw new Error(`Composant ${componentType}: méthode ${method} requise`);
            }
        }
        
        // Enregistrement : définition dans le registre
        this.componentTypes.set(componentType, {
            ...definition,
            registeredAt: Date.now()
        });
        
        console.log(`🔧 Composant enregistré: ${componentType}`);
    }
    
    /**
     * Création : instance d'un composant
     * @param {string} componentType - Type de composant à créer
     * @param {Object} config - Configuration du composant
     * @param {HTMLElement} container - Container d'insertion
     * @return {Object} - Instance du composant créé
     */
    async createComponent(componentType, config = {}, container = null) {
        // Vérification : type de composant existe
        const definition = this.componentTypes.get(componentType);
        if (!definition) {
            throw new Error(`Type de composant inconnu: ${componentType}`);
        }
        
        // Génération : ID unique pour le composant
        const componentId = this.generateComponentId(componentType);
        
        // Création : élément DOM depuis template
        const element = await this.createElementFromTemplate(definition.template, config);
        element.setAttribute('data-component-id', componentId);
        element.setAttribute('data-component-type', componentType);
        
        // Insertion : dans le container si spécifié
        if (container) {
            container.appendChild(element);
        }
        
        // Instance : objet composant avec méthodes
        const componentInstance = {
            id: componentId,
            type: componentType,
            element: element,
            config: { ...config },
            definition: definition,
            
            // Méthodes : liaison des méthodes de définition
            ...Object.fromEntries(
                Object.entries(definition)
                    .filter(([key]) => typeof definition[key] === 'function')
                    .map(([key, method]) => [key, method.bind(this, componentInstance)])
            )
        };
        
        // Initialisation : composant avec sa configuration
        await componentInstance.initialize(config);
        
        // Enregistrement : instance active
        this.activeComponents.set(componentId, componentInstance);
        
        console.log(`🎨 Composant créé: ${componentType} (${componentId})`);
        return componentInstance;
    }
    
    /**
     * Recherche : composant par ID
     * @param {string} componentId - ID du composant
     * @return {Object|null} - Instance du composant ou null
     */
    getComponent(componentId) {
        return this.activeComponents.get(componentId) || null;
    }
    
    /**
     * Recherche : composants par type
     * @param {string} componentType - Type de composant
     * @return {Array<Object>} - Liste des instances
     */
    getComponentsByType(componentType) {
        return Array.from(this.activeComponents.values())
            .filter(component => component.type === componentType);
    }
    
    /**
     * Destruction : suppression d'un composant
     * @param {string} componentId - ID du composant à supprimer
     * @return {boolean} - true si supprimé avec succès
     */
    async destroyComponent(componentId) {
        const component = this.activeComponents.get(componentId);
        if (!component) {
            return false;
        }
        
        try {
            // Nettoyage : méthode destroy du composant
            await component.destroy();
            
            // Suppression : DOM
            if (component.element && component.element.parentNode) {
                component.element.parentNode.removeChild(component.element);
            }
            
            // Suppression : registre actif
            this.activeComponents.delete(componentId);
            
            console.log(`🗑️ Composant détruit: ${componentId}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Erreur destruction composant ${componentId}:`, error);
            return false;
        }
    }
    
    // ==========================================
    // TEMPLATES DE COMPOSANTS
    // ==========================================
    
    /**
     * Template : champ éditable standard
     * @return {string} - HTML template
     */
    createEditableFieldTemplate() {
        return `
            <div class="editable-field-container">
                <label class="field-label" for="{{fieldId}}">{{label}}</label>
                <div class="field-description">{{description}}</div>
                <input 
                    type="{{inputType}}" 
                    id="{{fieldId}}"
                    class="field-input editable" 
                    data-field="{{fieldName}}"
                    placeholder="{{placeholder}}"
                    value="{{value}}"
                />
                <div class="field-validation"></div>
            </div>
        `;
    }
    
    /**
     * Template : section avec espacement
     * @return {string} - HTML template
     */
    createSpacerTemplate() {
        return `
            <section class="section-spacer" data-field="{{fieldName}}" style="height: {{height}}px;">
                <!-- Espacement dynamique -->
            </section>
        `;
    }
    
    /**
     * Template : card de tarification
     * @return {string} - HTML template  
     */
    createPricingCardTemplate() {
        return `
            <div class="pricing-card {{featured ? 'featured' : ''}}">
                <div class="pricing-duration">{{duration}}</div>
                <span class="pricing-value">{{price}}</span>
                <div class="pricing-unit">{{unit}}</div>
                <div class="pricing-features">
                    {{#each features}}
                    <div class="pricing-feature">
                        <i class="fas fa-check"></i>
                        <span>{{this}}</span>
                    </div>
                    {{/each}}
                </div>
                <button class="pricing-cta">{{ctaText}}</button>
            </div>
        `;
    }
    
    /**
     * Template : sélecteur d'image
     * @return {string} - HTML template
     */
    createImageSelectorTemplate() {
        return `
            <div class="image-selector">
                <div class="image-preview" data-image-field="{{fieldName}}">
                    <img src="{{currentImage}}" alt="{{alt}}" />
                </div>
                <div class="image-controls">
                    <input type="file" id="{{fieldId}}" accept="image/*" style="display: none;" />
                    <button type="button" class="btn-select-image" onclick="document.getElementById('{{fieldId}}').click()">
                        <i class="fas fa-image"></i> Changer Image
                    </button>
                    <button type="button" class="btn-reset-image">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Template : indicateur de synchronisation
     * @return {string} - HTML template
     */
    createSyncIndicatorTemplate() {
        return `
            <div class="sync-indicator">
                <div class="sync-status">
                    <i id="syncStatusIcon" class="fas fa-sync status-icon"></i>
                    <span id="syncStatusText">{{statusText}}</span>
                </div>
                <div class="live-indicator">🔴 LIVE</div>
                <div class="sync-counter" id="syncCounter">{{syncCount}} modifications</div>
            </div>
        `;
    }
    
    // ==========================================
    // MÉTHODES D'INITIALISATION DES COMPOSANTS
    // ==========================================
    
    /**
     * Initialisation : champ éditable
     * @param {Object} component - Instance du composant
     * @param {Object} config - Configuration
     */
    async initializeEditableField(component, config) {
        const input = component.element.querySelector('.field-input');
        const validation = component.element.querySelector('.field-validation');
        
        // Événement : validation en temps réel
        input.addEventListener('blur', async () => {
            const validationResult = await this.validateField(component, input.value);
            this.displayValidation(validation, validationResult);
        });
        
        // Événement : synchronisation instantanée
        input.addEventListener('input', () => {
            this.syncField(component, input.value);
        });
        
        // Configuration : validation initiale
        if (config.required) {
            input.setAttribute('required', 'true');
        }
    }
    
    /**
     * Initialisation : section avec espacement
     * @param {Object} component - Instance du composant
     * @param {Object} config - Configuration
     */
    async initializeSpacerSection(component, config) {
        // Configuration : hauteur initiale
        const height = config.height || 0;
        component.element.style.height = `${height}px`;
    }
    
    /**
     * Initialisation : card de tarification
     * @param {Object} component - Instance du composant
     * @param {Object} config - Configuration
     */
    async initializePricingCard(component, config) {
        const button = component.element.querySelector('.pricing-cta');
        
        // Événement : clic sur bouton CTA
        button.addEventListener('click', () => {
            this.handlePricingCardAction(component, config);
        });
        
        // Animation : effet hover
        component.element.addEventListener('mouseenter', () => {
            component.element.style.transform = 'translateY(-5px)';
        });
        
        component.element.addEventListener('mouseleave', () => {
            component.element.style.transform = 'translateY(0)';
        });
    }
    
    /**
     * Initialisation : sélecteur d'image
     * @param {Object} component - Instance du composant
     * @param {Object} config - Configuration
     */
    async initializeImageSelector(component, config) {
        const fileInput = component.element.querySelector('input[type="file"]');
        const resetButton = component.element.querySelector('.btn-reset-image');
        
        // Événement : sélection de fichier
        fileInput.addEventListener('change', (event) => {
            this.handleImageSelection(component, event.target.files[0]);
        });
        
        // Événement : reset image
        resetButton.addEventListener('click', () => {
            this.resetImage(component, config.defaultImage);
        });
    }
    
    /**
     * Initialisation : indicateur de synchronisation
     * @param {Object} component - Instance du composant  
     * @param {Object} config - Configuration
     */
    async initializeSyncIndicator(component, config) {
        // Configuration : état initial
        this.updateSyncStatus(component, 'initialized');
        
        // Mise à jour : toutes les 1 seconde
        component.updateInterval = setInterval(() => {
            this.refreshSyncIndicator(component);
        }, 1000);
    }
    
    // ==========================================
    // UTILITAIRES ET HELPERS
    // ==========================================
    
    /**
     * Génération : ID unique pour composant
     * @param {string} componentType - Type de composant
     * @return {string} - ID unique
     */
    generateComponentId(componentType) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${componentType}-${timestamp}-${random}`;
    }
    
    /**
     * Création : élément DOM depuis template avec interpolation
     * @param {string} template - Template HTML
     * @param {Object} data - Données pour interpolation
     * @return {HTMLElement} - Élément DOM créé
     */
    async createElementFromTemplate(template, data) {
        // Interpolation : remplacement des variables {{variable}}
        let processedTemplate = template;
        
        // Remplacement : variables simples
        Object.entries(data).forEach(([key, value]) => {
            const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            processedTemplate = processedTemplate.replace(pattern, value || '');
        });
        
        // Création : élément temporaire pour parsing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = processedTemplate.trim();
        
        return tempDiv.firstElementChild;
    }
    
    /**
     * Validation : valeur de champ
     * @param {Object} component - Instance du composant
     * @param {any} value - Valeur à valider
     * @return {Object} - Résultat de validation
     */
    async validateField(component, value) {
        // Délégation : validation au ConfigManager
        const fieldType = component.config.validationType || 'required';
        return this.config.validate(fieldType, value);
    }
    
    /**
     * Synchronisation : valeur de champ
     * @param {Object} component - Instance du composant
     * @param {any} value - Nouvelle valeur
     */
    async syncField(component, value) {
        // Sauvegarde : dans le storage service
        const fieldName = component.config.fieldName;
        await this.storage.set(fieldName, value);
        
        // Animation : feedback visuel
        this.animateFieldUpdate(component.element);
    }
    
    /**
     * Animation : feedback visuel sur élément
     * @param {HTMLElement} element - Élément à animer
     */
    animateFieldUpdate(element) {
        // Animation : surbrillance verte
        const originalBorder = element.style.border;
        const originalBackground = element.style.backgroundColor;
        
        element.style.border = '2px solid #10B981';
        element.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        element.style.transition = 'all 0.3s ease';
        
        // Restauration : après animation
        setTimeout(() => {
            element.style.border = originalBorder;
            element.style.backgroundColor = originalBackground;
        }, 600);
    }
    
    /**
     * Affichage : résultat de validation
     * @param {HTMLElement} validationElement - Container de validation
     * @param {Object} validationResult - Résultat de validation
     */
    displayValidation(validationElement, validationResult) {
        if (validationResult.isValid) {
            validationElement.textContent = '';
            validationElement.className = 'field-validation';
        } else {
            validationElement.textContent = validationResult.message;
            validationElement.className = 'field-validation error';
        }
    }
    
    /**
     * Nettoyage : méthodes de destruction par défaut
     * @param {Object} component - Instance du composant
     */
    async destroyField(component) {
        // Nettoyage : événements et timers
        if (component.updateInterval) {
            clearInterval(component.updateInterval);
        }
    }
    
    async destroySection(component) {
        // Nettoyage spécialisé pour sections
    }
    
    async destroyCard(component) {
        // Nettoyage spécialisé pour cards
    }
    
    async destroyImageSelector(component) {
        // Nettoyage spécialisé pour sélecteurs d'image
    }
    
    async destroySyncIndicator(component) {
        if (component.updateInterval) {
            clearInterval(component.updateInterval);
        }
    }
    
    /**
     * Statistiques : informations sur la fabrique
     * @return {Object} - Statistiques détaillées
     */
    getStats() {
        return {
            registeredTypes: this.componentTypes.size,
            activeComponents: this.activeComponents.size,
            componentTypes: Array.from(this.componentTypes.keys()),
            memoryUsage: this.calculateMemoryUsage()
        };
    }
    
    /**
     * Calcul : estimation de l'utilisation mémoire
     * @return {number} - Utilisation mémoire estimée en Ko
     */
    calculateMemoryUsage() {
        let totalSize = 0;
        
        // Estimation : composants actifs
        this.activeComponents.forEach((component) => {
            totalSize += JSON.stringify(component.config).length;
        });
        
        return Math.round(totalSize / 1024);
    }
}

// Export ES6
export default ComponentFactory;

// Export CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentFactory;
}
/**
 * Gestionnaire de Sections Dynamiques Li-CUBE PRO™
 * 
 * Rôle : Gestion complète des sections (ajout, suppression, déplacement, duplication)
 * Responsabilité : Interface d'administration des sections en temps réel
 * Extensibilité : Support de nouveaux types de sections et contenus
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

const { sanitizeHTML } = typeof require !== 'undefined'
    ? require('../utils/sanitizer')
    : window;

class SectionManager {
    constructor(framework) {
        // Rôle : Liaison avec le framework principal
        // Type : Object - Instance du framework Li-CUBE PRO™
        this.framework = framework;
        
        // Rôle : Configuration du gestionnaire de sections
        // Type : Object - Paramètres de gestion des sections
        this.config = {
            sectionPrefix: 'section',
            fieldPrefix: 'field',
            maxSections: 50,
            maxFieldsPerSection: 20,
            autoSave: true,
            realTimeSync: true
        };
        
        // Rôle : État des sections gérées
        // Type : Object - Suivi de toutes les sections actives
        this.sectionsState = {
            sections: new Map(),     // ID → Section data
            order: [],               // Ordre d'affichage des sections
            activeSection: null,     // Section actuellement sélectionnée
            lastModified: null       // Timestamp dernière modification
        };
        
        // Rôle : Templates de sections disponibles
        // Type : Map - Collection des modèles de sections
        this.sectionTemplates = new Map();
        
        // Rôle : Observateurs pour les changements
        // Type : Set - Callbacks de notification
        this.observers = new Set();
        
        this.init();
    }
    
    /**
     * Initialisation : enregistrement des templates de base
     */
    init() {
        // Enregistrement : templates de sections de base
        this.registerBaseSectionTemplates();
        
        // Configuration : drag & drop
        this.initializeDragDrop();
        
        // Configuration : sync temps réel
        this.initializeRealtimeSync();
        
        // Scan : sections existantes dans le DOM
        this.scanExistingSections();
        
        console.log('✅ SectionManager initialisé avec', this.sectionTemplates.size, 'templates');
    }
    
    /**
     * Enregistrement : templates de sections de base
     */
    registerBaseSectionTemplates() {
        // Template : Section Hero
        this.registerSectionTemplate('hero', {
            name: 'Section Hero',
            description: 'Section d\'accueil avec titre et sous-titre',
            icon: 'fas fa-home',
            template: this.createHeroTemplate(),
            defaultFields: ['hero-title', 'hero-subtitle', 'hero-description', 'hero-image'],
            allowedComponents: ['EditableField', 'ImageSelector', 'SpacerSection']
        });
        
        // Template : Section Tarification
        this.registerSectionTemplate('pricing', {
            name: 'Section Tarification',
            description: 'Grille de cartes de prix',
            icon: 'fas fa-euro-sign',
            template: this.createPricingTemplate(),
            defaultFields: ['pricing-title', 'pricing-subtitle'],
            allowedComponents: ['PricingCard', 'EditableField']
        });
        
        // Template : Section Avantages
        this.registerSectionTemplate('advantages', {
            name: 'Section Avantages',
            description: 'Liste d\'avantages avec icônes',
            icon: 'fas fa-check-circle',
            template: this.createAdvantagesTemplate(),
            defaultFields: ['advantages-title'],
            allowedComponents: ['EditableField', 'ImageSelector']
        });
        
        // Template : Section Contact
        this.registerSectionTemplate('contact', {
            name: 'Section Contact',
            description: 'Informations de contact',
            icon: 'fas fa-envelope',
            template: this.createContactTemplate(),
            defaultFields: ['contact-title', 'contact-phone', 'contact-email'],
            allowedComponents: ['EditableField']
        });
        
        // Template : Section Personnalisée
        this.registerSectionTemplate('custom', {
            name: 'Section Personnalisée',
            description: 'Section vide personnalisable',
            icon: 'fas fa-plus',
            template: this.createCustomTemplate(),
            defaultFields: [],
            allowedComponents: ['EditableField', 'ImageSelector', 'PricingCard', 'SpacerSection']
        });
    }
    
    /**
     * Enregistrement : nouveau template de section
     * @param {string} templateId - ID unique du template
     * @param {Object} templateConfig - Configuration du template
     */
    registerSectionTemplate(templateId, templateConfig) {
        // Validation : configuration complète
        const requiredFields = ['name', 'template', 'allowedComponents'];
        for (const field of requiredFields) {
            if (!templateConfig[field]) {
                throw new Error(`Template ${templateId}: champ ${field} requis`);
            }
        }
        
        // Enregistrement : template dans la collection
        this.sectionTemplates.set(templateId, {
            id: templateId,
            ...templateConfig,
            registeredAt: Date.now()
        });
        
        console.log(`📝 Template de section enregistré: ${templateId}`);
    }
    
    /**
     * Création : nouvelle section depuis template
     * @param {string} templateId - ID du template à utiliser
     * @param {Object} options - Options de création
     * @return {Promise<Object>} - Section créée
     */
    async createSection(templateId, options = {}) {
        // Récupération : template demandé
        const template = this.sectionTemplates.get(templateId);
        if (!template) {
            throw new Error(`Template de section inconnu: ${templateId}`);
        }
        
        // Génération : ID unique pour la section
        const sectionId = this.generateSectionId(templateId);
        
        // Configuration : section avec valeurs par défaut
        const sectionConfig = {
            id: sectionId,
            templateId: templateId,
            name: options.name || `${template.name} ${this.sectionsState.sections.size + 1}`,
            position: options.position || this.sectionsState.order.length,
            fields: new Map(),
            components: new Map(),
            isVisible: options.isVisible !== false,
            createdAt: Date.now(),
            ...options
        };
        
        // Création : élément DOM depuis template
        const sectionElement = await this.createSectionElement(template, sectionConfig);
        
        // Initialisation : champs par défaut
        await this.initializeSectionFields(sectionElement, template.defaultFields, sectionConfig);
        
        // Insertion : dans le DOM à la position demandée
        this.insertSectionInDOM(sectionElement, sectionConfig.position);
        
        // Enregistrement : section active
        this.sectionsState.sections.set(sectionId, sectionConfig);
        this.sectionsState.order.splice(sectionConfig.position, 0, sectionId);
        
        // Synchronisation : temps réel
        await this.syncSectionChange('section-created', { sectionId, templateId, config: sectionConfig });
        
        // Notification : observateurs
        this.notifyObservers('section-created', { section: sectionConfig, element: sectionElement });
        
        console.log(`➕ Section créée: ${sectionId} (${template.name})`);
        return sectionConfig;
    }
    
    /**
     * Duplication : section existante
     * @param {string} sectionId - ID de la section à dupliquer
     * @param {Object} options - Options de duplication
     * @return {Promise<Object>} - Section dupliquée
     */
    async duplicateSection(sectionId, options = {}) {
        // Récupération : section source
        const sourceSection = this.sectionsState.sections.get(sectionId);
        if (!sourceSection) {
            throw new Error(`Section introuvable: ${sectionId}`);
        }
        
        // Extraction : données actuelles de la section
        const sectionData = await this.extractSectionData(sectionId);
        
        // Configuration : nouvelle section dupliquée
        const duplicateConfig = {
            ...sourceSection,
            id: this.generateSectionId(sourceSection.templateId),
            name: `${sourceSection.name} (Copie)`,
            position: options.position || sourceSection.position + 1,
            createdAt: Date.now()
        };
        
        // Création : section dupliquée
        const duplicatedSection = await this.createSection(sourceSection.templateId, duplicateConfig);
        
        // Application : données de la section source
        await this.applySectionData(duplicatedSection.id, sectionData);
        
        console.log(`📋 Section dupliquée: ${sectionId} → ${duplicatedSection.id}`);
        return duplicatedSection;
    }
    
    /**
     * Suppression : section
     * @param {string} sectionId - ID de la section à supprimer
     * @return {Promise<boolean>} - true si supprimée avec succès
     */
    async deleteSection(sectionId) {
        // Vérification : section existe
        const section = this.sectionsState.sections.get(sectionId);
        if (!section) {
            return false;
        }
        
        // Confirmation : suppression (si pas en mode automatique)
        if (!this.config.autoDelete) {
            const confirmed = await this.confirmSectionDeletion(section);
            if (!confirmed) return false;
        }
        
        // Suppression : élément DOM
        const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (sectionElement) {
            // Animation : disparition
            await this.animateSectionRemoval(sectionElement);
            sectionElement.remove();
        }
        
        // Nettoyage : composants associés
        await this.cleanupSectionComponents(sectionId);
        
        // Suppression : de l'état
        this.sectionsState.sections.delete(sectionId);
        const orderIndex = this.sectionsState.order.indexOf(sectionId);
        if (orderIndex !== -1) {
            this.sectionsState.order.splice(orderIndex, 1);
        }
        
        // Synchronisation : temps réel
        await this.syncSectionChange('section-deleted', { sectionId });
        
        // Notification : observateurs
        this.notifyObservers('section-deleted', { sectionId });
        
        console.log(`🗑️ Section supprimée: ${sectionId}`);
        return true;
    }
    
    /**
     * Déplacement : section vers nouvelle position
     * @param {string} sectionId - ID de la section à déplacer
     * @param {number} newPosition - Nouvelle position (index)
     * @return {Promise<boolean>} - true si déplacée avec succès
     */
    async moveSection(sectionId, newPosition) {
        // Validation : section et position
        const section = this.sectionsState.sections.get(sectionId);
        if (!section || newPosition < 0 || newPosition >= this.sectionsState.order.length) {
            return false;
        }
        
        // Calcul : positions actuelle et nouvelle
        const currentPosition = this.sectionsState.order.indexOf(sectionId);
        if (currentPosition === newPosition) return true;
        
        // Mise à jour : ordre des sections
        this.sectionsState.order.splice(currentPosition, 1);
        this.sectionsState.order.splice(newPosition, 0, sectionId);
        
        // Mise à jour : position dans la configuration
        section.position = newPosition;
        
        // Réorganisation : DOM
        await this.reorderSectionsInDOM();
        
        // Animation : indication du déplacement
        const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (sectionElement) {
            this.animateSectionMove(sectionElement);
        }
        
        // Synchronisation : temps réel
        await this.syncSectionChange('section-moved', { sectionId, oldPosition: currentPosition, newPosition });
        
        // Notification : observateurs
        this.notifyObservers('section-moved', { sectionId, oldPosition: currentPosition, newPosition });
        
        console.log(`🔄 Section déplacée: ${sectionId} (${currentPosition} → ${newPosition})`);
        return true;
    }
    
    /**
     * Ajout : champ dans une section
     * @param {string} sectionId - ID de la section
     * @param {string} fieldType - Type de champ ('text', 'image', 'component')
     * @param {Object} fieldConfig - Configuration du champ
     * @return {Promise<Object>} - Champ créé
     */
    async addFieldToSection(sectionId, fieldType, fieldConfig = {}) {
        // Validation : section existe
        const section = this.sectionsState.sections.get(sectionId);
        if (!section) {
            throw new Error(`Section introuvable: ${sectionId}`);
        }
        
        // Validation : limite de champs
        if (section.fields.size >= this.config.maxFieldsPerSection) {
            throw new Error(`Limite de ${this.config.maxFieldsPerSection} champs atteinte`);
        }
        
        // Génération : ID unique pour le champ
        const fieldId = this.generateFieldId(sectionId, fieldType);
        
        // Configuration : champ avec valeurs par défaut
        const fieldData = {
            id: fieldId,
            sectionId: sectionId,
            type: fieldType,
            name: fieldConfig.name || `Champ ${section.fields.size + 1}`,
            value: fieldConfig.value || '',
            placeholder: fieldConfig.placeholder || '',
            required: fieldConfig.required || false,
            validation: fieldConfig.validation || null,
            position: fieldConfig.position || section.fields.size,
            isVisible: fieldConfig.isVisible !== false,
            createdAt: Date.now(),
            ...fieldConfig
        };
        
        // Création : composant de champ approprié
        const fieldComponent = await this.createFieldComponent(fieldType, fieldData);
        
        // Insertion : dans la section DOM
        const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (sectionElement) {
            const fieldContainer = this.findFieldContainer(sectionElement);
            fieldContainer.appendChild(fieldComponent.element);
        }
        
        // Enregistrement : champ dans la section
        section.fields.set(fieldId, fieldData);
        
        // Synchronisation : temps réel
        await this.syncSectionChange('field-added', { sectionId, fieldId, fieldData });
        
        // Notification : observateurs
        this.notifyObservers('field-added', { sectionId, fieldId, fieldData, component: fieldComponent });
        
        console.log(`➕ Champ ajouté: ${fieldId} dans section ${sectionId}`);
        return fieldData;
    }
    
    /**
     * Suppression : champ d'une section
     * @param {string} sectionId - ID de la section
     * @param {string} fieldId - ID du champ à supprimer
     * @return {Promise<boolean>} - true si supprimé avec succès
     */
    async removeFieldFromSection(sectionId, fieldId) {
        // Validation : section et champ existent
        const section = this.sectionsState.sections.get(sectionId);
        if (!section || !section.fields.has(fieldId)) {
            return false;
        }
        
        // Suppression : élément DOM
        const fieldElement = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (fieldElement) {
            await this.animateFieldRemoval(fieldElement);
            fieldElement.remove();
        }
        
        // Suppression : composant associé
        const componentId = `field-${fieldId}`;
        if (section.components.has(componentId)) {
            await this.framework.core.components.destroyComponent(componentId);
            section.components.delete(componentId);
        }
        
        // Suppression : de la section
        section.fields.delete(fieldId);
        
        // Synchronisation : temps réel
        await this.syncSectionChange('field-removed', { sectionId, fieldId });
        
        // Notification : observateurs
        this.notifyObservers('field-removed', { sectionId, fieldId });
        
        console.log(`🗑️ Champ supprimé: ${fieldId} de section ${sectionId}`);
        return true;
    }
    
    // ==========================================
    // TEMPLATES DE SECTIONS
    // ==========================================
    
    /**
     * Template : Section Hero
     * @return {string} - HTML template
     */
    createHeroTemplate() {
        return `
            <section class="section hero-section" data-section-id="{{sectionId}}" data-template="hero">
                <div class="container">
                    <div class="hero-content">
                        <div class="hero-text">
                            <h1 class="hero-title editable" data-field="{{sectionId}}-title">{{title}}</h1>
                            <p class="hero-subtitle editable" data-field="{{sectionId}}-subtitle">{{subtitle}}</p>
                            <div class="hero-description editable" data-field="{{sectionId}}-description">{{description}}</div>
                            
                            <!-- Container pour champs dynamiques -->
                            <div class="dynamic-fields-container" data-section-fields="{{sectionId}}">
                                <!-- Champs ajoutés dynamiquement ici -->
                            </div>
                        </div>
                        <div class="hero-visual">
                            <div class="hero-image-container" data-field="{{sectionId}}-image">
                                <!-- Image dynamique -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contrôles d'édition (visibles uniquement en mode édition) -->
                <div class="section-controls" data-section-controls="{{sectionId}}">
                    <button class="btn-add-field" data-action="add-field" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Champ
                    </button>
                    <button class="btn-duplicate-section" data-action="duplicate" data-section="{{sectionId}}">
                        <i class="fas fa-copy"></i> Dupliquer
                    </button>
                    <button class="btn-move-up" data-action="move-up" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" data-action="move-down" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-delete-section" data-action="delete" data-section="{{sectionId}}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </section>
        `;
    }
    
    /**
     * Template : Section Tarification
     * @return {string} - HTML template
     */
    createPricingTemplate() {
        return `
            <section class="section pricing-section" data-section-id="{{sectionId}}" data-template="pricing">
                <div class="container">
                    <h2 class="section-title editable" data-field="{{sectionId}}-title">{{title}}</h2>
                    <p class="section-subtitle editable" data-field="{{sectionId}}-subtitle">{{subtitle}}</p>
                    
                    <div class="pricing-grid" data-pricing-container="{{sectionId}}">
                        <!-- Cards de tarification ajoutées dynamiquement -->
                    </div>
                    
                    <!-- Container pour champs dynamiques -->
                    <div class="dynamic-fields-container" data-section-fields="{{sectionId}}">
                        <!-- Champs ajoutés dynamiquement ici -->
                    </div>
                </div>
                
                <!-- Contrôles d'édition -->
                <div class="section-controls" data-section-controls="{{sectionId}}">
                    <button class="btn-add-pricing-card" data-action="add-pricing-card" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Card Prix
                    </button>
                    <button class="btn-add-field" data-action="add-field" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Champ
                    </button>
                    <button class="btn-duplicate-section" data-action="duplicate" data-section="{{sectionId}}">
                        <i class="fas fa-copy"></i> Dupliquer
                    </button>
                    <button class="btn-move-up" data-action="move-up" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" data-action="move-down" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-delete-section" data-action="delete" data-section="{{sectionId}}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </section>
        `;
    }
    
    /**
     * Template : Section Avantages
     * @return {string} - HTML template
     */
    createAdvantagesTemplate() {
        return `
            <section class="section advantages-section" data-section-id="{{sectionId}}" data-template="advantages">
                <div class="container">
                    <h2 class="section-title editable" data-field="{{sectionId}}-title">{{title}}</h2>
                    
                    <div class="advantages-grid" data-advantages-container="{{sectionId}}">
                        <!-- Avantages ajoutés dynamiquement -->
                    </div>
                    
                    <!-- Container pour champs dynamiques -->
                    <div class="dynamic-fields-container" data-section-fields="{{sectionId}}">
                        <!-- Champs ajoutés dynamiquement ici -->
                    </div>
                </div>
                
                <!-- Contrôles d'édition -->
                <div class="section-controls" data-section-controls="{{sectionId}}">
                    <button class="btn-add-advantage" data-action="add-advantage" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Avantage
                    </button>
                    <button class="btn-add-field" data-action="add-field" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Champ
                    </button>
                    <button class="btn-duplicate-section" data-action="duplicate" data-section="{{sectionId}}">
                        <i class="fas fa-copy"></i> Dupliquer
                    </button>
                    <button class="btn-move-up" data-action="move-up" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" data-action="move-down" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-delete-section" data-action="delete" data-section="{{sectionId}}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </section>
        `;
    }
    
    /**
     * Template : Section Contact
     * @return {string} - HTML template
     */
    createContactTemplate() {
        return `
            <section class="section contact-section" data-section-id="{{sectionId}}" data-template="contact">
                <div class="container">
                    <h2 class="section-title editable" data-field="{{sectionId}}-title">{{title}}</h2>
                    
                    <div class="contact-grid">
                        <div class="contact-card">
                            <div class="contact-icon">📞</div>
                            <h4>Téléphone</h4>
                            <p class="editable" data-field="{{sectionId}}-phone">{{phone}}</p>
                        </div>
                        <div class="contact-card">
                            <div class="contact-icon">✉️</div>
                            <h4>Email</h4>
                            <p class="editable" data-field="{{sectionId}}-email">{{email}}</p>
                        </div>
                        <div class="contact-card">
                            <div class="contact-icon">📍</div>
                            <h4>Adresse</h4>
                            <p class="editable" data-field="{{sectionId}}-address">{{address}}</p>
                        </div>
                    </div>
                    
                    <!-- Container pour champs dynamiques -->
                    <div class="dynamic-fields-container" data-section-fields="{{sectionId}}">
                        <!-- Champs ajoutés dynamiquement ici -->
                    </div>
                </div>
                
                <!-- Contrôles d'édition -->
                <div class="section-controls" data-section-controls="{{sectionId}}">
                    <button class="btn-add-contact" data-action="add-contact" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Contact
                    </button>
                    <button class="btn-add-field" data-action="add-field" data-section="{{sectionId}}">
                        <i class="fas fa-plus"></i> Ajouter Champ
                    </button>
                    <button class="btn-duplicate-section" data-action="duplicate" data-section="{{sectionId}}">
                        <i class="fas fa-copy"></i> Dupliquer
                    </button>
                    <button class="btn-move-up" data-action="move-up" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" data-action="move-down" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-delete-section" data-action="delete" data-section="{{sectionId}}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </section>
        `;
    }
    
    /**
     * Template : Section Personnalisée
     * @return {string} - HTML template
     */
    createCustomTemplate() {
        return `
            <section class="section custom-section" data-section-id="{{sectionId}}" data-template="custom">
                <div class="container">
                    <h2 class="section-title editable" data-field="{{sectionId}}-title">{{title}}</h2>
                    
                    <!-- Container principal pour contenu personnalisé -->
                    <div class="custom-content" data-custom-container="{{sectionId}}">
                        <div class="placeholder-content">
                            <i class="fas fa-plus-circle"></i>
                            <p>Section personnalisée - Ajoutez vos éléments</p>
                        </div>
                    </div>
                    
                    <!-- Container pour champs dynamiques -->
                    <div class="dynamic-fields-container" data-section-fields="{{sectionId}}">
                        <!-- Champs ajoutés dynamiquement ici -->
                    </div>
                </div>
                
                <!-- Contrôles d'édition étendus -->
                <div class="section-controls" data-section-controls="{{sectionId}}">
                    <button class="btn-add-text" data-action="add-text" data-section="{{sectionId}}">
                        <i class="fas fa-font"></i> Texte
                    </button>
                    <button class="btn-add-image" data-action="add-image" data-section="{{sectionId}}">
                        <i class="fas fa-image"></i> Image
                    </button>
                    <button class="btn-add-button" data-action="add-button" data-section="{{sectionId}}">
                        <i class="fas fa-mouse-pointer"></i> Bouton
                    </button>
                    <button class="btn-add-spacer" data-action="add-spacer" data-section="{{sectionId}}">
                        <i class="fas fa-arrows-alt-v"></i> Espace
                    </button>
                    <button class="btn-duplicate-section" data-action="duplicate" data-section="{{sectionId}}">
                        <i class="fas fa-copy"></i> Dupliquer
                    </button>
                    <button class="btn-move-up" data-action="move-up" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-move-down" data-action="move-down" data-section="{{sectionId}}">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-delete-section" data-action="delete" data-section="{{sectionId}}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </section>
        `;
    }
    
    // ==========================================
    // MÉTHODES UTILITAIRES PRIVÉES
    // ==========================================
    
    /**
     * Génération : ID unique de section
     * @param {string} templateId - ID du template
     * @return {string} - ID unique
     */
    generateSectionId(templateId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${this.config.sectionPrefix}-${templateId}-${timestamp}-${random}`;
    }
    
    /**
     * Génération : ID unique de champ
     * @param {string} sectionId - ID de la section
     * @param {string} fieldType - Type de champ
     * @return {string} - ID unique
     */
    generateFieldId(sectionId, fieldType) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 3);
        return `${this.config.fieldPrefix}-${sectionId}-${fieldType}-${timestamp}-${random}`;
    }
    
    /**
     * Création : élément DOM de section
     * @param {Object} template - Template de section
     * @param {Object} config - Configuration de section
     * @return {HTMLElement} - Élément DOM créé
     */
    async createSectionElement(template, config) {
        // Interpolation : template avec données de configuration
        let processedTemplate = template.template;
        
        // Remplacement : variables de base
        const templateVars = {
            sectionId: config.id,
            title: config.title || `${template.name}`,
            subtitle: config.subtitle || '',
            description: config.description || '',
            phone: config.phone || '',
            email: config.email || '',
            address: config.address || ''
        };
        
        Object.entries(templateVars).forEach(([key, value]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
            processedTemplate = processedTemplate.replace(regex, value);
        });
        
        // Création : élément DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizeHTML(processedTemplate.trim());
        const sectionElement = tempDiv.firstElementChild;
        
        // Configuration : événements des contrôles
        this.setupSectionControls(sectionElement, config.id);
        
        return sectionElement;
    }
    
    /**
     * Configuration : événements des contrôles de section
     * @param {HTMLElement} sectionElement - Élément section
     * @param {string} sectionId - ID de la section
     */
    setupSectionControls(sectionElement, sectionId) {
        // Événements : boutons d'action
        const controls = sectionElement.querySelector(`[data-section-controls="${sectionId}"]`);
        if (!controls) return;
        
        // Délégation : gestion des clics sur les contrôles
        controls.addEventListener('click', async (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            
            const action = button.dataset.action;
            await this.handleSectionAction(sectionId, action, button);
        });
        
        // Masquage : contrôles en mode présentation
        const isEditMode = document.body.classList.contains('edit-mode') || 
                          window.location.pathname.includes('edit-');
        
        if (!isEditMode) {
            controls.style.display = 'none';
        }
    }
    
    /**
     * Gestion : actions sur les sections
     * @param {string} sectionId - ID de la section
     * @param {string} action - Action à effectuer
     * @param {HTMLElement} button - Bouton déclencheur
     */
    async handleSectionAction(sectionId, action, button) {
        try {
            switch (action) {
                case 'add-field':
                    await this.showAddFieldDialog(sectionId);
                    break;
                    
                case 'add-text':
                    await this.addFieldToSection(sectionId, 'text', {
                        name: 'Nouveau texte',
                        placeholder: 'Saisissez votre texte ici...'
                    });
                    break;
                    
                case 'add-image':
                    await this.addFieldToSection(sectionId, 'image', {
                        name: 'Nouvelle image',
                        alt: 'Image'
                    });
                    break;
                    
                case 'add-button':
                    await this.addFieldToSection(sectionId, 'button', {
                        name: 'Nouveau bouton',
                        text: 'Cliquez ici',
                        href: '#'
                    });
                    break;
                    
                case 'add-spacer':
                    await this.addFieldToSection(sectionId, 'spacer', {
                        name: 'Espacement',
                        height: 50
                    });
                    break;
                    
                case 'duplicate':
                    await this.duplicateSection(sectionId);
                    break;
                    
                case 'move-up':
                    const currentPos = this.sectionsState.order.indexOf(sectionId);
                    if (currentPos > 0) {
                        await this.moveSection(sectionId, currentPos - 1);
                    }
                    break;
                    
                case 'move-down':
                    const currentPosDown = this.sectionsState.order.indexOf(sectionId);
                    if (currentPosDown < this.sectionsState.order.length - 1) {
                        await this.moveSection(sectionId, currentPosDown + 1);
                    }
                    break;
                    
                case 'delete':
                    await this.deleteSection(sectionId);
                    break;
                    
                default:
                    console.warn(`Action inconnue: ${action}`);
            }
        } catch (error) {
            console.error(`Erreur action ${action} sur section ${sectionId}:`, error);
            this.showErrorMessage(`Erreur: ${error.message}`);
        }
    }
    
    /**
     * Affichage : dialog d'ajout de champ
     * @param {string} sectionId - ID de la section
     */
    async showAddFieldDialog(sectionId) {
        // Création : dialog modal simple
        const dialog = document.createElement('div');
        dialog.className = 'add-field-dialog';
        dialog.innerHTML = sanitizeHTML(`
            <div class="dialog-backdrop"></div>
            <div class="dialog-content">
                <h3>Ajouter un champ</h3>
                <div class="field-type-selector">
                    <button data-type="text">📝 Texte</button>
                    <button data-type="image">🖼️ Image</button>
                    <button data-type="button">🔘 Bouton</button>
                    <button data-type="spacer">📏 Espacement</button>
                </div>
                <button class="btn-cancel">Annuler</button>
            </div>
        `);
        
        document.body.appendChild(dialog);
        
        // Retour : promesse résolue par sélection utilisateur
        return new Promise((resolve) => {
            dialog.addEventListener('click', async (event) => {
                const typeButton = event.target.closest('[data-type]');
                const cancelButton = event.target.closest('.btn-cancel');
                
                if (typeButton) {
                    const fieldType = typeButton.dataset.type;
                    await this.addFieldToSection(sectionId, fieldType);
                    resolve(fieldType);
                } else if (cancelButton || event.target.classList.contains('dialog-backdrop')) {
                    resolve(null);
                }
                
                dialog.remove();
            });
        });
    }
    
    /**
     * Liste : templates disponibles
     * @return {Array<Object>} - Templates de sections
     */
    getAvailableTemplates() {
        return Array.from(this.sectionTemplates.values());
    }
    
    /**
     * État : informations complètes sur les sections
     * @return {Object} - État détaillé
     */
    getStatus() {
        return {
            sectionsCount: this.sectionsState.sections.size,
            sectionsOrder: [...this.sectionsState.order],
            activeSection: this.sectionsState.activeSection,
            availableTemplates: this.sectionTemplates.size,
            lastModified: this.sectionsState.lastModified,
            isHealthy: this.sectionsState.sections.size < this.config.maxSections
        };
    }
}

// Export ES6
export default SectionManager;

// Export CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionManager;
}
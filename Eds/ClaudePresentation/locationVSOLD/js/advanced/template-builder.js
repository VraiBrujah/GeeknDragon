/**
 * Constructeur de Templates Li-CUBE PRO™
 * 
 * Rôle : Création visuelle de templates personnalisés
 * Responsabilité : Interface de création drag & drop de nouveaux templates
 * Extensibilité : Système de widgets et composants extensible
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation
 */

class TemplateBuilder {
    constructor(framework, sectionManager) {
        // Rôle : Services injectés
        this.framework = framework;
        this.sectionManager = sectionManager;
        
        // Rôle : Configuration du constructeur
        this.config = {
            gridSize: 12,              // Grille 12 colonnes
            snapToGrid: true,          // Alignement sur la grille
            enablePreview: true,       // Prévisualisation temps réel
            maxNestingLevel: 3,        // Profondeur maximale d'imbrication
            autoSave: true             // Sauvegarde automatique
        };
        
        // Rôle : État du constructeur
        this.state = {
            isActive: false,           // Constructeur ouvert
            currentTemplate: null,     // Template en cours d'édition
            selectedElement: null,     // Élément sélectionné
            draggedWidget: null,       // Widget en cours de déplacement
            previewMode: false         // Mode prévisualisation
        };
        
        // Rôle : Widgets disponibles
        // Type : Map - Collection des widgets draggables
        this.availableWidgets = new Map();
        
        // Rôle : Templates en cours de création
        // Type : Map - Templates non sauvegardés
        this.workingTemplates = new Map();
        
        this.init();
    }
    
    /**
     * Initialisation : enregistrement des widgets de base
     */
    init() {
        // Enregistrement : widgets de base
        this.registerBaseWidgets();
        console.log('✅ TemplateBuilder initialisé avec', this.availableWidgets.size, 'widgets');
    }
    
    /**
     * Enregistrement : widgets de base disponibles
     */
    registerBaseWidgets() {
        // Widget : Texte
        this.registerWidget('text', {
            name: 'Texte',
            icon: 'fas fa-font',
            category: 'content',
            description: 'Élément de texte éditable',
            defaultProps: {
                content: 'Votre texte ici...',
                tag: 'p',
                fontSize: '16px',
                color: '#333333',
                textAlign: 'left'
            },
            template: this.getTextWidgetTemplate(),
            configForm: this.getTextWidgetConfig()
        });
        
        // Widget : Titre
        this.registerWidget('heading', {
            name: 'Titre',
            icon: 'fas fa-heading',
            category: 'content',
            description: 'Titre hiérarchique (H1-H6)',
            defaultProps: {
                content: 'Votre titre',
                level: 2,
                fontSize: '32px',
                color: '#222222',
                textAlign: 'center',
                fontWeight: 'bold'
            },
            template: this.getHeadingWidgetTemplate(),
            configForm: this.getHeadingWidgetConfig()
        });
        
        // Widget : Image
        this.registerWidget('image', {
            name: 'Image',
            icon: 'fas fa-image',
            category: 'media',
            description: 'Image avec options d\'affichage',
            defaultProps: {
                src: 'https://via.placeholder.com/400x300',
                alt: 'Image descriptive',
                width: '100%',
                height: 'auto',
                objectFit: 'cover',
                borderRadius: '0px'
            },
            template: this.getImageWidgetTemplate(),
            configForm: this.getImageWidgetConfig()
        });
        
        // Widget : Bouton
        this.registerWidget('button', {
            name: 'Bouton',
            icon: 'fas fa-mouse-pointer',
            category: 'interactive',
            description: 'Bouton d\'action avec lien',
            defaultProps: {
                text: 'Cliquez ici',
                href: '#',
                target: '_self',
                backgroundColor: '#10B981',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '16px'
            },
            template: this.getButtonWidgetTemplate(),
            configForm: this.getButtonWidgetConfig()
        });
        
        // Widget : Container
        this.registerWidget('container', {
            name: 'Container',
            icon: 'fas fa-square',
            category: 'layout',
            description: 'Container flexible pour autres widgets',
            defaultProps: {
                backgroundColor: 'transparent',
                padding: '20px',
                borderRadius: '0px',
                border: 'none',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start'
            },
            template: this.getContainerWidgetTemplate(),
            configForm: this.getContainerWidgetConfig()
        });
        
        // Widget : Grille
        this.registerWidget('grid', {
            name: 'Grille',
            icon: 'fas fa-th',
            category: 'layout',
            description: 'Grille responsive pour organiser le contenu',
            defaultProps: {
                columns: 2,
                gap: '20px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                padding: '0px'
            },
            template: this.getGridWidgetTemplate(),
            configForm: this.getGridWidgetConfig()
        });
        
        // Widget : Espacement
        this.registerWidget('spacer', {
            name: 'Espacement',
            icon: 'fas fa-arrows-alt-v',
            category: 'layout',
            description: 'Espace vertical ou horizontal',
            defaultProps: {
                height: '50px',
                width: '100%',
                backgroundColor: 'transparent'
            },
            template: this.getSpacerWidgetTemplate(),
            configForm: this.getSpacerWidgetConfig()
        });
        
        // Widget : Card
        this.registerWidget('card', {
            name: 'Card',
            icon: 'fas fa-id-card',
            category: 'content',
            description: 'Carte avec titre, contenu et actions',
            defaultProps: {
                title: 'Titre de la carte',
                content: 'Contenu de la carte...',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                padding: '24px'
            },
            template: this.getCardWidgetTemplate(),
            configForm: this.getCardWidgetConfig()
        });
    }
    
    /**
     * Enregistrement : nouveau widget
     * @param {string} widgetId - ID unique du widget
     * @param {Object} widgetConfig - Configuration du widget
     */
    registerWidget(widgetId, widgetConfig) {
        // Validation : configuration complète
        const requiredFields = ['name', 'template', 'defaultProps'];
        for (const field of requiredFields) {
            if (!widgetConfig[field]) {
                throw new Error(`Widget ${widgetId}: champ ${field} requis`);
            }
        }
        
        // Enregistrement : widget dans la collection
        this.availableWidgets.set(widgetId, {
            id: widgetId,
            ...widgetConfig,
            registeredAt: Date.now()
        });
        
        console.log(`🧩 Widget enregistré: ${widgetId}`);
    }
    
    /**
     * Ouverture : constructeur de template
     * @param {string} templateId - ID du template à éditer (optionnel pour nouveau)
     */
    async openBuilder(templateId = null) {
        // Préparation : template de travail
        if (templateId) {
            // Édition : template existant
            this.state.currentTemplate = await this.loadTemplateForEditing(templateId);
        } else {
            // Création : nouveau template
            this.state.currentTemplate = this.createEmptyTemplate();
        }
        
        // Création : interface du constructeur
        await this.createBuilderInterface();
        
        // Activation : état du constructeur
        this.state.isActive = true;
        
        console.log(`🏗️ Constructeur ouvert: ${templateId || 'nouveau template'}`);
    }
    
    /**
     * Création : template vide
     * @return {Object} - Template vide prêt à éditer
     */
    createEmptyTemplate() {
        return {
            id: this.generateTemplateId(),
            name: 'Nouveau Template',
            description: '',
            icon: 'fas fa-layer-group',
            category: 'custom',
            structure: {
                type: 'container',
                props: {
                    className: 'template-root',
                    backgroundColor: 'transparent',
                    padding: '0px'
                },
                children: []
            },
            allowedComponents: ['EditableField', 'ImageSelector', 'SpacerSection'],
            createdAt: Date.now(),
            modifiedAt: Date.now()
        };
    }
    
    /**
     * Création : interface du constructeur
     */
    async createBuilderInterface() {
        // Création : overlay du constructeur
        const builderOverlay = document.createElement('div');
        builderOverlay.id = 'template-builder-overlay';
        builderOverlay.className = 'template-builder-overlay';
        builderOverlay.innerHTML = await this.getBuilderInterfaceHTML();
        
        // Insertion : dans le DOM
        document.body.appendChild(builderOverlay);
        
        // Configuration : événements
        this.setupBuilderEvents(builderOverlay);
        
        // Initialisation : zones
        this.initializeBuilderZones();
        
        // Rendu : template actuel
        this.renderCurrentTemplate();
    }
    
    /**
     * HTML : interface complète du constructeur
     * @return {string} - HTML de l'interface
     */
    async getBuilderInterfaceHTML() {
        return `
            <!-- Header du constructeur -->
            <div class="builder-header">
                <div class="builder-title">
                    <h2>Constructeur de Templates</h2>
                    <input type="text" class="template-name-input" 
                           value="${this.state.currentTemplate.name}" 
                           placeholder="Nom du template">
                </div>
                <div class="builder-actions">
                    <button class="btn-preview-template">
                        <i class="fas fa-eye"></i> Aperçu
                    </button>
                    <button class="btn-save-template primary">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                    <button class="btn-close-builder">
                        <i class="fas fa-times"></i> Fermer
                    </button>
                </div>
            </div>
            
            <!-- Corps du constructeur -->
            <div class="builder-body">
                
                <!-- Panneau des widgets -->
                <div class="builder-sidebar">
                    <div class="sidebar-header">
                        <h3>Widgets Disponibles</h3>
                        <div class="widgets-search">
                            <input type="text" placeholder="Rechercher widgets..." class="search-widgets">
                            <i class="fas fa-search"></i>
                        </div>
                    </div>
                    
                    <div class="widgets-categories">
                        ${this.getWidgetsCategoriesHTML()}
                    </div>
                </div>
                
                <!-- Zone de construction -->
                <div class="builder-canvas">
                    <div class="canvas-header">
                        <div class="canvas-tools">
                            <button class="btn-undo" title="Annuler (Ctrl+Z)">
                                <i class="fas fa-undo"></i>
                            </button>
                            <button class="btn-redo" title="Refaire (Ctrl+Y)">
                                <i class="fas fa-redo"></i>
                            </button>
                            <div class="canvas-zoom">
                                <button class="btn-zoom-out">
                                    <i class="fas fa-search-minus"></i>
                                </button>
                                <span class="zoom-level">100%</span>
                                <button class="btn-zoom-in">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="canvas-container">
                        <div class="canvas-grid ${this.config.snapToGrid ? 'snap-to-grid' : ''}">
                            <!-- Zone de construction drag & drop -->
                            <div class="template-canvas" id="template-canvas">
                                <div class="canvas-placeholder">
                                    <i class="fas fa-plus-circle"></i>
                                    <p>Glissez-déposez des widgets ici pour créer votre template</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Panneau des propriétés -->
                <div class="builder-properties">
                    <div class="properties-header">
                        <h3>Propriétés</h3>
                    </div>
                    
                    <div class="properties-content" id="properties-content">
                        <div class="no-selection">
                            <i class="fas fa-mouse-pointer"></i>
                            <p>Sélectionnez un élément pour voir ses propriétés</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer du constructeur -->
            <div class="builder-footer">
                <div class="builder-status">
                    <span class="elements-count">0 éléments</span>
                    <span class="template-size">0 KB</span>
                </div>
                <div class="builder-help">
                    <button class="btn-help" title="Aide et raccourcis">
                        <i class="fas fa-question-circle"></i> Aide
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * HTML : catégories de widgets
     * @return {string} - HTML des catégories
     */
    getWidgetsCategoriesHTML() {
        // Regroupement : widgets par catégorie
        const categories = {};
        
        for (const widget of this.availableWidgets.values()) {
            const category = widget.category || 'other';
            
            if (!categories[category]) {
                categories[category] = [];
            }
            
            categories[category].push(widget);
        }
        
        // Génération : HTML des catégories
        return Object.entries(categories).map(([categoryName, widgets]) => `
            <div class="widget-category" data-category="${categoryName}">
                <div class="category-header">
                    <h4>${this.getCategoryTitle(categoryName)}</h4>
                    <span class="category-count">${widgets.length}</span>
                </div>
                
                <div class="widgets-list">
                    ${widgets.map(widget => this.getWidgetItemHTML(widget)).join('')}
                </div>
            </div>
        `).join('');
    }
    
    /**
     * HTML : élément widget dans la liste
     * @param {Object} widget - Configuration du widget
     * @return {string} - HTML de l'élément
     */
    getWidgetItemHTML(widget) {
        return `
            <div class="widget-item" 
                 data-widget-id="${widget.id}"
                 draggable="true"
                 title="${widget.description || ''}">
                <div class="widget-icon">
                    <i class="${widget.icon}"></i>
                </div>
                <div class="widget-info">
                    <span class="widget-name">${widget.name}</span>
                    <span class="widget-category">${widget.category}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Titre : catégorie de widgets
     * @param {string} categoryName - Nom de la catégorie
     * @return {string} - Titre lisible
     */
    getCategoryTitle(categoryName) {
        const titles = {
            content: 'Contenu',
            media: 'Médias',
            interactive: 'Interactif',
            layout: 'Mise en page',
            other: 'Autres'
        };
        
        return titles[categoryName] || categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    }
    
    // ==========================================
    // TEMPLATES DES WIDGETS
    // ==========================================
    
    /**
     * Template : Widget Texte
     * @return {string} - Template HTML
     */
    getTextWidgetTemplate() {
        return `
            <div class="widget-text" data-widget-type="text">
                <{{tag}} style="font-size: {{fontSize}}; color: {{color}}; text-align: {{textAlign}};" 
                         class="editable" data-field="{{fieldId}}">
                    {{content}}
                </{{tag}}>
            </div>
        `;
    }
    
    /**
     * Template : Widget Titre
     * @return {string} - Template HTML
     */
    getHeadingWidgetTemplate() {
        return `
            <div class="widget-heading" data-widget-type="heading">
                <h{{level}} style="font-size: {{fontSize}}; color: {{color}}; text-align: {{textAlign}}; font-weight: {{fontWeight}};" 
                           class="editable" data-field="{{fieldId}}">
                    {{content}}
                </h{{level}}>
            </div>
        `;
    }
    
    /**
     * Template : Widget Image
     * @return {string} - Template HTML
     */
    getImageWidgetTemplate() {
        return `
            <div class="widget-image" data-widget-type="image">
                <img src="{{src}}" 
                     alt="{{alt}}" 
                     style="width: {{width}}; height: {{height}}; object-fit: {{objectFit}}; border-radius: {{borderRadius}};"
                     data-field="{{fieldId}}">
            </div>
        `;
    }
    
    /**
     * Template : Widget Bouton
     * @return {string} - Template HTML
     */
    getButtonWidgetTemplate() {
        return `
            <div class="widget-button" data-widget-type="button">
                <a href="{{href}}" 
                   target="{{target}}" 
                   class="btn-widget" 
                   style="background-color: {{backgroundColor}}; color: {{color}}; border-radius: {{borderRadius}}; padding: {{padding}}; font-size: {{fontSize}}; display: inline-block; text-decoration: none;">
                    {{text}}
                </a>
            </div>
        `;
    }
    
    /**
     * Template : Widget Container
     * @return {string} - Template HTML
     */
    getContainerWidgetTemplate() {
        return `
            <div class="widget-container" data-widget-type="container">
                <div class="container-content" 
                     style="background-color: {{backgroundColor}}; padding: {{padding}}; border-radius: {{borderRadius}}; border: {{border}}; display: flex; flex-direction: {{flexDirection}}; align-items: {{alignItems}}; justify-content: {{justifyContent}};"
                     data-drop-zone="true">
                    <!-- Les widgets enfants seront insérés ici -->
                </div>
            </div>
        `;
    }
    
    /**
     * Template : Widget Grille
     * @return {string} - Template HTML
     */
    getGridWidgetTemplate() {
        return `
            <div class="widget-grid" data-widget-type="grid">
                <div class="grid-content" 
                     style="display: grid; grid-template-columns: {{gridTemplateColumns}}; gap: {{gap}}; padding: {{padding}};"
                     data-drop-zone="true">
                    <!-- Les widgets enfants seront insérés ici -->
                </div>
            </div>
        `;
    }
    
    /**
     * Template : Widget Espacement
     * @return {string} - Template HTML
     */
    getSpacerWidgetTemplate() {
        return `
            <div class="widget-spacer" data-widget-type="spacer">
                <div style="height: {{height}}; width: {{width}}; background-color: {{backgroundColor}};"></div>
            </div>
        `;
    }
    
    /**
     * Template : Widget Card
     * @return {string} - Template HTML
     */
    getCardWidgetTemplate() {
        return `
            <div class="widget-card" data-widget-type="card">
                <div class="card-content" 
                     style="background-color: {{backgroundColor}}; border-radius: {{borderRadius}}; box-shadow: {{boxShadow}}; padding: {{padding}};">
                    <h3 class="card-title editable" data-field="{{fieldId}}-title">{{title}}</h3>
                    <div class="card-body editable" data-field="{{fieldId}}-content">{{content}}</div>
                </div>
            </div>
        `;
    }
    
    // ==========================================
    // CONFIGURATIONS DES WIDGETS
    // ==========================================
    
    /**
     * Configuration : Widget Texte
     * @return {Array} - Champs de configuration
     */
    getTextWidgetConfig() {
        return [
            { type: 'textarea', name: 'content', label: 'Contenu', rows: 3 },
            { type: 'select', name: 'tag', label: 'Balise HTML', options: [
                { value: 'p', label: 'Paragraphe (p)' },
                { value: 'span', label: 'Span' },
                { value: 'div', label: 'Div' }
            ]},
            { type: 'text', name: 'fontSize', label: 'Taille police', placeholder: '16px' },
            { type: 'color', name: 'color', label: 'Couleur du texte' },
            { type: 'select', name: 'textAlign', label: 'Alignement', options: [
                { value: 'left', label: 'Gauche' },
                { value: 'center', label: 'Centre' },
                { value: 'right', label: 'Droite' },
                { value: 'justify', label: 'Justifié' }
            ]}
        ];
    }
    
    /**
     * Configuration : Widget Titre
     * @return {Array} - Champs de configuration
     */
    getHeadingWidgetConfig() {
        return [
            { type: 'text', name: 'content', label: 'Texte du titre' },
            { type: 'select', name: 'level', label: 'Niveau de titre', options: [
                { value: 1, label: 'H1 - Titre principal' },
                { value: 2, label: 'H2 - Titre de section' },
                { value: 3, label: 'H3 - Sous-titre' },
                { value: 4, label: 'H4 - Titre mineur' },
                { value: 5, label: 'H5 - Très petit titre' },
                { value: 6, label: 'H6 - Titre minimal' }
            ]},
            { type: 'text', name: 'fontSize', label: 'Taille police', placeholder: '32px' },
            { type: 'color', name: 'color', label: 'Couleur du texte' },
            { type: 'select', name: 'textAlign', label: 'Alignement', options: [
                { value: 'left', label: 'Gauche' },
                { value: 'center', label: 'Centre' },
                { value: 'right', label: 'Droite' }
            ]},
            { type: 'select', name: 'fontWeight', label: 'Épaisseur', options: [
                { value: 'normal', label: 'Normal' },
                { value: 'bold', label: 'Gras' },
                { value: '300', label: 'Léger' },
                { value: '600', label: 'Semi-gras' },
                { value: '900', label: 'Très gras' }
            ]}
        ];
    }
    
    /**
     * Configuration : Widget Image
     * @return {Array} - Champs de configuration
     */
    getImageWidgetConfig() {
        return [
            { type: 'url', name: 'src', label: 'URL de l\'image' },
            { type: 'text', name: 'alt', label: 'Texte alternatif' },
            { type: 'text', name: 'width', label: 'Largeur', placeholder: '100%' },
            { type: 'text', name: 'height', label: 'Hauteur', placeholder: 'auto' },
            { type: 'select', name: 'objectFit', label: 'Ajustement', options: [
                { value: 'cover', label: 'Couvrir' },
                { value: 'contain', label: 'Contenir' },
                { value: 'fill', label: 'Remplir' },
                { value: 'scale-down', label: 'Réduire' }
            ]},
            { type: 'text', name: 'borderRadius', label: 'Coins arrondis', placeholder: '0px' }
        ];
    }
    
    /**
     * Configuration : Widget Bouton
     * @return {Array} - Champs de configuration
     */
    getButtonWidgetConfig() {
        return [
            { type: 'text', name: 'text', label: 'Texte du bouton' },
            { type: 'url', name: 'href', label: 'Lien (URL)' },
            { type: 'select', name: 'target', label: 'Cible du lien', options: [
                { value: '_self', label: 'Même onglet' },
                { value: '_blank', label: 'Nouvel onglet' }
            ]},
            { type: 'color', name: 'backgroundColor', label: 'Couleur de fond' },
            { type: 'color', name: 'color', label: 'Couleur du texte' },
            { type: 'text', name: 'borderRadius', label: 'Coins arrondis', placeholder: '6px' },
            { type: 'text', name: 'padding', label: 'Espacement interne', placeholder: '12px 24px' },
            { type: 'text', name: 'fontSize', label: 'Taille police', placeholder: '16px' }
        ];
    }
    
    /**
     * Configuration : Widget Container
     * @return {Array} - Champs de configuration
     */
    getContainerWidgetConfig() {
        return [
            { type: 'color', name: 'backgroundColor', label: 'Couleur de fond' },
            { type: 'text', name: 'padding', label: 'Espacement interne', placeholder: '20px' },
            { type: 'text', name: 'borderRadius', label: 'Coins arrondis', placeholder: '0px' },
            { type: 'text', name: 'border', label: 'Bordure', placeholder: 'none' },
            { type: 'select', name: 'flexDirection', label: 'Direction', options: [
                { value: 'column', label: 'Vertical' },
                { value: 'row', label: 'Horizontal' }
            ]},
            { type: 'select', name: 'alignItems', label: 'Alignement horizontal', options: [
                { value: 'stretch', label: 'Étiré' },
                { value: 'flex-start', label: 'Début' },
                { value: 'center', label: 'Centre' },
                { value: 'flex-end', label: 'Fin' }
            ]},
            { type: 'select', name: 'justifyContent', label: 'Alignement vertical', options: [
                { value: 'flex-start', label: 'Début' },
                { value: 'center', label: 'Centre' },
                { value: 'flex-end', label: 'Fin' },
                { value: 'space-between', label: 'Espacé' }
            ]}
        ];
    }
    
    /**
     * Configuration : Widget Grille
     * @return {Array} - Champs de configuration
     */
    getGridWidgetConfig() {
        return [
            { type: 'number', name: 'columns', label: 'Nombre de colonnes', min: 1, max: 12 },
            { type: 'text', name: 'gap', label: 'Espacement', placeholder: '20px' },
            { type: 'text', name: 'gridTemplateColumns', label: 'Template colonnes', placeholder: 'repeat(auto-fit, minmax(250px, 1fr))' },
            { type: 'text', name: 'padding', label: 'Espacement interne', placeholder: '0px' }
        ];
    }
    
    /**
     * Configuration : Widget Espacement
     * @return {Array} - Champs de configuration
     */
    getSpacerWidgetConfig() {
        return [
            { type: 'text', name: 'height', label: 'Hauteur', placeholder: '50px' },
            { type: 'text', name: 'width', label: 'Largeur', placeholder: '100%' },
            { type: 'color', name: 'backgroundColor', label: 'Couleur de fond (pour debug)' }
        ];
    }
    
    /**
     * Configuration : Widget Card
     * @return {Array} - Champs de configuration
     */
    getCardWidgetConfig() {
        return [
            { type: 'text', name: 'title', label: 'Titre de la carte' },
            { type: 'textarea', name: 'content', label: 'Contenu', rows: 4 },
            { type: 'color', name: 'backgroundColor', label: 'Couleur de fond' },
            { type: 'text', name: 'borderRadius', label: 'Coins arrondis', placeholder: '8px' },
            { type: 'text', name: 'boxShadow', label: 'Ombre', placeholder: '0 2px 10px rgba(0,0,0,0.1)' },
            { type: 'text', name: 'padding', label: 'Espacement interne', placeholder: '24px' }
        ];
    }
    
    /**
     * Sauvegarde : template créé
     * @param {Object} templateData - Données du template
     * @return {Promise<string>} - ID du template sauvegardé
     */
    async saveTemplate(templateData) {
        // Validation : données complètes
        if (!templateData.name || !templateData.structure) {
            throw new Error('Nom et structure requis pour sauvegarder le template');
        }
        
        // Enregistrement : dans le SectionManager
        this.sectionManager.registerSectionTemplate(templateData.id, {
            name: templateData.name,
            description: templateData.description,
            icon: templateData.icon,
            template: await this.generateHTMLFromStructure(templateData.structure),
            defaultFields: this.extractDefaultFields(templateData.structure),
            allowedComponents: templateData.allowedComponents
        });
        
        // Persistence : sauvegarde dans storage
        await this.framework.core.storage.set(`template-${templateData.id}`, templateData);
        
        console.log(`💾 Template sauvegardé: ${templateData.name} (${templateData.id})`);
        return templateData.id;
    }
    
    /**
     * Génération : ID unique de template
     * @return {string} - ID unique
     */
    generateTemplateId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 8);
        return `custom-template-${timestamp}-${random}`;
    }
    
    /**
     * État : informations sur le constructeur
     * @return {Object} - État détaillé
     */
    getStatus() {
        return {
            isActive: this.state.isActive,
            currentTemplate: this.state.currentTemplate?.id || null,
            availableWidgets: this.availableWidgets.size,
            workingTemplates: this.workingTemplates.size
        };
    }
}

// Export ES6
export default TemplateBuilder;

// Export CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateBuilder;
}
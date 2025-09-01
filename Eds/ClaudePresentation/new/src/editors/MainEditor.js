/**
 * Éditeur principal de présentations
 * 
 * Rôle : Gère l'interface utilisateur et coordonne tous les éditeurs
 * Type : Classe principale de l'interface d'édition
 * Responsabilité : UI, interactions, coordination des composants
 */
class MainEditor {
    /**
     * Constructeur de l'éditeur principal
     * 
     * @param {PresentationEngine} engine - Instance du moteur de présentation
     */
    constructor(engine) {
        // Rôle : Référence vers le moteur de présentation
        // Type : PresentationEngine (instance du moteur principal)
        // Unité : Sans unité
        // Domaine : Instance valide de PresentationEngine
        // Formule : Référence injectée depuis l'initialisation
        // Exemple : Instance centralisée pour accès aux managers
        this.engine = engine;

        // Rôle : État actuel de l'interface utilisateur
        // Type : Object (état de l'UI)
        // Unité : Sans unité
        // Domaine : Propriétés d'état de l'interface
        // Formule : État centralisé pour cohérence UI
        // Exemple : {selectedElement: null, activeTab: 'widgets', zoom: 100}
        this.uiState = {
            selectedElement: null,
            selectedSection: null,
            activeLeftTab: 'widgets',
            activeRightTab: 'properties',
            zoom: 100,
            viewMode: 'edit', // 'edit' | 'preview'
            isDragging: false,
            draggedElement: null
        };

        // Rôle : Cache des éléments DOM pour performance
        // Type : Map<String, HTMLElement> (cache des éléments)
        // Unité : Sans unité
        // Domaine : Éléments DOM fréquemment utilisés
        // Formule : Cache pour éviter querySelector répétés
        // Exemple : {'canvas': canvasElement, 'sidebar': sidebarElement}
        this.domCache = new Map();

        // Rôle : Gestionnaire d'événements pour nettoyage
        // Type : Array<Function> (liste des listeners)
        // Unité : Sans unité
        // Domaine : Fonctions de nettoyage des event listeners
        // Formule : Liste pour pouvoir supprimer tous les listeners
        // Exemple : [cleanup1, cleanup2, cleanup3]
        this.eventCleanupFunctions = [];

        // Rôle : Timers actifs pour debouncing et throttling
        // Type : Map<String, Number> (timers actifs)
        // Unité : millisecondes (ms)
        // Domaine : ID de timers setTimeout/setInterval
        // Formule : Map pour pouvoir annuler tous les timers
        // Exemple : {'autosave': 1234, 'preview-update': 5678}
        this.activeTimers = new Map();

        console.log('🎨 MainEditor initialisé');
    }

    /**
     * Initialise l'éditeur principal
     * 
     * Rôle : Configuration complète de l'interface et événements
     * Type : Méthode d'initialisation asynchrone
     * Effet de bord : Configure l'UI, lie les événements, charge les données
     */
    async init() {
        try {
            console.log('🔄 Initialisation de l\'interface éditeur...');

            // Cache des éléments DOM principaux
            this.cacheDOMElements();

            // Configuration de l'interface utilisateur
            await this.setupUI();

            // Configuration des gestionnaires d'événements
            this.setupEventListeners();

            // Configuration du drag & drop
            this.setupDragDrop();

            // Configuration des raccourcis clavier
            this.setupKeyboardShortcuts();

            // Chargement initial des données
            await this.loadInitialData();

            // Mise à jour initiale de l'interface
            this.updateUI();

            console.log('✅ Interface éditeur initialisée avec succès');
        } catch (error) {
            console.error('❌ Erreur initialisation MainEditor:', error);
            throw error;
        }
    }

    /**
     * Met en cache les éléments DOM principaux
     * 
     * Rôle : Optimisation des accès DOM fréquents
     * Type : Méthode d'optimisation performance
     * Effet de bord : Remplit le cache des éléments DOM
     */
    cacheDOMElements() {
        // Rôle : Liste des sélecteurs d'éléments à mettre en cache
        // Type : Array<Object> (sélecteurs avec clés)
        // Unité : Sans unité
        // Domaine : Sélecteurs CSS valides
        // Formule : [{key: 'nom', selector: 'selecteur_css'}]
        // Exemple : Éléments utilisés fréquemment dans l'interface
        const elementSelectors = [
            { key: 'canvas', selector: '#editor-canvas' },
            { key: 'presentationSections', selector: '#presentation-sections' },
            { key: 'canvasDropzone', selector: '.canvas-dropzone' },
            { key: 'widgetsPanel', selector: '#widgets-panel' },
            { key: 'sectionsPanel', selector: '#sections-panel' },
            { key: 'templatesPanel', selector: '#templates-panel' },
            { key: 'propertiesPanel', selector: '#properties-panel' },
            { key: 'stylesPanel', selector: '#styles-panel' },
            { key: 'historyPanel', selector: '#history-panel' },
            { key: 'widgetsList', selector: '#widgets-list' },
            { key: 'sectionsList', selector: '#sections-list' },
            { key: 'templatesList', selector: '#templates-list' },
            { key: 'propertiesContent', selector: '#properties-content' },
            { key: 'statusText', selector: '#status-text' },
            { key: 'presentationInfo', selector: '#presentation-info' },
            { key: 'syncIndicator', selector: '#sync-indicator' },
            { key: 'zoomLevel', selector: '#zoom-level' },
            { key: 'newPresentationModal', selector: '#new-presentation-modal' },
            { key: 'loadingOverlay', selector: '#loading-overlay' },
            { key: 'toastContainer', selector: '#toast-container' }
        ];

        // Mise en cache des éléments
        elementSelectors.forEach(({ key, selector }) => {
            const element = document.querySelector(selector);
            if (element) {
                this.domCache.set(key, element);
            } else {
                console.warn(`⚠️ Élément '${selector}' non trouvé pour le cache`);
            }
        });

        console.log(`📋 ${this.domCache.size} éléments DOM mis en cache`);
    }

    /**
     * Configuration initiale de l'interface utilisateur
     * 
     * Rôle : Préparation des composants UI et chargement des données
     * Type : Méthode de configuration UI
     * Effet de bord : Initialise les panels, tabs, et composants
     */
    async setupUI() {
        try {
            // Configuration des onglets des sidebars
            this.setupSidebarTabs();

            // Chargement des widgets disponibles
            await this.loadAvailableWidgets();

            // Chargement des sections disponibles
            await this.loadAvailableSections();

            // Configuration des contrôles de l'éditeur
            this.setupEditorControls();

            // Configuration du zoom
            this.updateZoomLevel(this.uiState.zoom);

            console.log('🎛️ Interface utilisateur configurée');
        } catch (error) {
            console.error('❌ Erreur configuration UI:', error);
            throw error;
        }
    }

    /**
     * Configuration des onglets des sidebars
     * 
     * Rôle : Gestion de la navigation entre les panels
     * Type : Méthode de configuration des onglets
     * Effet de bord : Active les onglets et configure les événements
     */
    setupSidebarTabs() {
        // Configuration des onglets gauches
        const leftTabs = document.querySelectorAll('.left-sidebar .sidebar-tab');
        const leftPanels = document.querySelectorAll('.left-sidebar .sidebar-panel');

        leftTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchLeftTab(targetTab);
            });
        });

        // Configuration des onglets droits
        const rightTabs = document.querySelectorAll('.right-sidebar .sidebar-tab');
        const rightPanels = document.querySelectorAll('.right-sidebar .sidebar-panel');

        rightTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchRightTab(targetTab);
            });
        });

        // Activation des onglets par défaut
        this.switchLeftTab(this.uiState.activeLeftTab);
        this.switchRightTab(this.uiState.activeRightTab);
    }

    /**
     * Bascule vers un onglet du sidebar gauche
     * 
     * @param {string} tabName - Nom de l'onglet à activer
     */
    switchLeftTab(tabName) {
        // Mise à jour de l'état
        this.uiState.activeLeftTab = tabName;

        // Mise à jour des onglets
        const leftTabs = document.querySelectorAll('.left-sidebar .sidebar-tab');
        const leftPanels = document.querySelectorAll('.left-sidebar .sidebar-panel');

        leftTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        leftPanels.forEach(panel => {
            if (panel.id === `${tabName}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        console.log(`📂 Onglet gauche activé: ${tabName}`);
    }

    /**
     * Bascule vers un onglet du sidebar droit
     * 
     * @param {string} tabName - Nom de l'onglet à activer
     */
    switchRightTab(tabName) {
        // Mise à jour de l'état
        this.uiState.activeRightTab = tabName;

        // Mise à jour des onglets
        const rightTabs = document.querySelectorAll('.right-sidebar .sidebar-tab');
        const rightPanels = document.querySelectorAll('.right-sidebar .sidebar-panel');

        rightTabs.forEach(tab => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        rightPanels.forEach(panel => {
            if (panel.id === `${tabName}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });

        console.log(`📂 Onglet droit activé: ${tabName}`);
    }

    /**
     * Charge les widgets disponibles dans le sidebar
     * 
     * Rôle : Population de la bibliothèque de widgets
     * Type : Méthode de chargement de données
     * Effet de bord : Remplit le panel widgets avec les types disponibles
     */
    async loadAvailableWidgets() {
        const widgetsList = this.domCache.get('widgetsList');
        if (!widgetsList) return;

        try {
            // Récupération des widgets disponibles depuis le WidgetManager
            const availableWidgets = this.engine.widgetManager.getAvailableWidgets();
            
            // Effacement du contenu existant
            widgetsList.innerHTML = '';

            // Création des cartes de widgets
            availableWidgets.forEach(widget => {
                const widgetCard = this.createWidgetCard(widget);
                widgetsList.appendChild(widgetCard);
            });

            console.log(`🧩 ${availableWidgets.length} widgets chargés dans la bibliothèque`);
        } catch (error) {
            console.error('❌ Erreur chargement widgets:', error);
            this.showError('Erreur lors du chargement des widgets');
        }
    }

    /**
     * Crée une carte de widget pour la bibliothèque
     * 
     * @param {Object} widgetInfo - Informations du widget
     * @returns {HTMLElement} Élément DOM de la carte
     */
    createWidgetCard(widgetInfo) {
        // Rôle : Création de la structure DOM pour une carte de widget
        // Type : HTMLElement (div container)
        // Unité : Sans unité
        // Domaine : Element DOM valide
        // Formule : Création via createElement + configuration
        // Exemple : Div avec classes, data-attributes, et contenu
        const card = document.createElement('div');
        card.className = 'widget-card';
        card.draggable = true;
        card.dataset.widgetType = widgetInfo.type;

        // Rôle : Icône représentative du type de widget
        // Type : String (classe FontAwesome)
        // Unité : Sans unité
        // Domaine : Classes d'icônes FontAwesome valides
        // Formule : Mapping type → icône appropriée
        // Exemple : 'text' → 'fas fa-font', 'image' → 'fas fa-image'
        const iconClass = this.getWidgetIcon(widgetInfo.type);

        card.innerHTML = `
            <div class="widget-preview">
                <i class="${iconClass}"></i>
            </div>
            <div class="widget-info">
                <h4>${widgetInfo.name}</h4>
                <p>${widgetInfo.description}</p>
            </div>
        `;

        // Configuration des événements drag & drop
        card.addEventListener('dragstart', (e) => {
            this.handleWidgetDragStart(e, widgetInfo);
        });

        card.addEventListener('dragend', (e) => {
            this.handleWidgetDragEnd(e);
        });

        // Événement de double-clic pour ajout direct
        card.addEventListener('dblclick', () => {
            this.addWidgetToPresentation(widgetInfo.type);
        });

        return card;
    }

    /**
     * Retourne l'icône FontAwesome pour un type de widget
     * 
     * @param {string} widgetType - Type de widget
     * @returns {string} Classe CSS de l'icône
     */
    getWidgetIcon(widgetType) {
        // Rôle : Mapping des types de widgets vers icônes FontAwesome
        // Type : Object<String, String> (dictionnaire type → icône)
        // Unité : Sans unité
        // Domaine : Types de widgets → classes FontAwesome
        // Formule : Table de correspondance statique
        // Exemple : 'text' → 'fas fa-font', 'button' → 'fas fa-hand-pointer'
        const iconMap = {
            'text': 'fas fa-font',
            'title': 'fas fa-heading',
            'image': 'fas fa-image',
            'button': 'fas fa-hand-pointer',
            'spacer': 'fas fa-arrows-alt-v',
            'divider': 'fas fa-minus',
            'video': 'fas fa-play',
            'icon': 'fas fa-star',
            'list': 'fas fa-list-ul',
            'table': 'fas fa-table',
            'form': 'fas fa-wpforms',
            'embed': 'fas fa-code'
        };

        return iconMap[widgetType] || 'fas fa-cube';
    }

    /**
     * Charge les sections disponibles dans le sidebar
     * 
     * Rôle : Population de la bibliothèque de sections
     * Type : Méthode de chargement de données
     * Effet de bord : Remplit le panel sections avec les templates disponibles
     */
    async loadAvailableSections() {
        const sectionsList = this.domCache.get('sectionsList');
        if (!sectionsList) return;

        try {
            // Récupération des sections disponibles depuis le SectionManager
            const availableSections = this.engine.sectionManager.getAvailableSections();
            
            // Effacement du contenu existant
            sectionsList.innerHTML = '';

            // Création des cartes de sections
            availableSections.forEach(section => {
                const sectionCard = this.createSectionCard(section);
                sectionsList.appendChild(sectionCard);
            });

            console.log(`📄 ${availableSections.length} sections chargées dans la bibliothèque`);
        } catch (error) {
            console.error('❌ Erreur chargement sections:', error);
            this.showError('Erreur lors du chargement des sections');
        }
    }

    /**
     * Crée une carte de section pour la bibliothèque
     * 
     * @param {Object} sectionInfo - Informations de la section
     * @returns {HTMLElement} Élément DOM de la carte
     */
    createSectionCard(sectionInfo) {
        const card = document.createElement('div');
        card.className = 'section-card';
        card.dataset.sectionType = sectionInfo.id;

        const iconClass = this.getSectionIcon(sectionInfo.category);

        card.innerHTML = `
            <div class="section-preview">
                <i class="${iconClass}"></i>
            </div>
            <div class="section-info">
                <h4>${sectionInfo.name}</h4>
                <p>${sectionInfo.description}</p>
            </div>
            <div class="section-meta">
                <span>${sectionInfo.widgetCount} widgets</span>
                <span>${sectionInfo.usageCount} utilisations</span>
            </div>
        `;

        // Événement de clic pour ajouter la section
        card.addEventListener('click', () => {
            this.addSectionToPresentation(sectionInfo.id);
        });

        return card;
    }

    /**
     * Retourne l'icône pour une catégorie de section
     * 
     * @param {string} category - Catégorie de section
     * @returns {string} Classe CSS de l'icône
     */
    getSectionIcon(category) {
        const iconMap = {
            'presentation': 'fas fa-presentation',
            'commerce': 'fas fa-shopping-cart',
            'comparison': 'fas fa-balance-scale',
            'contact': 'fas fa-envelope',
            'closing': 'fas fa-flag-checkered',
            'generic': 'fas fa-file-alt'
        };

        return iconMap[category] || 'fas fa-layer-group';
    }

    /**
     * Configuration des contrôles de l'éditeur
     * 
     * Rôle : Liaison des boutons et contrôles avec leurs actions
     * Type : Méthode de configuration des événements
     * Effet de bord : Configure tous les boutons de l'interface
     */
    setupEditorControls() {
        // Boutons du header
        this.bindButtonEvent('#btn-new-presentation', () => this.showNewPresentationModal());
        this.bindButtonEvent('#btn-save-presentation', () => this.saveCurrentPresentation());
        this.bindButtonEvent('#btn-preview-presentation', () => this.togglePreviewMode());
        this.bindButtonEvent('#btn-undo', () => this.undoLastAction());
        this.bindButtonEvent('#btn-redo', () => this.redoLastAction());
        this.bindButtonEvent('#btn-settings', () => this.showSettings());

        // Boutons de la toolbar
        this.bindButtonEvent('#btn-add-section', () => this.showAddSectionDialog());
        this.bindButtonEvent('#btn-section-up', () => this.moveSectionUp());
        this.bindButtonEvent('#btn-section-down', () => this.moveSectionDown());
        this.bindButtonEvent('#btn-delete-section', () => this.deleteSelectedSection());

        // Contrôles de zoom
        this.bindButtonEvent('#btn-zoom-out', () => this.adjustZoom(-10));
        this.bindButtonEvent('#btn-zoom-in', () => this.adjustZoom(10));
        this.bindButtonEvent('#btn-zoom-fit', () => this.fitZoomToWindow());

        // Modes de vue
        this.bindButtonEvent('#btn-edit-mode', () => this.setViewMode('edit'));
        this.bindButtonEvent('#btn-preview-mode', () => this.setViewMode('preview'));

        // Bouton de démarrage rapide
        this.bindButtonEvent('#btn-quick-start', () => this.showQuickStartOptions());

        // Boutons de modal
        this.bindButtonEvent('#btn-create-presentation', () => this.createNewPresentation());
        
        // Boutons de fermeture de modal
        document.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = btn.closest('.modal');
                if (modal) {
                    this.hideModal(modal);
                }
            });
        });

        console.log('🎛️ Contrôles de l\'éditeur configurés');
    }

    /**
     * Utilitaire pour lier un événement à un bouton
     * 
     * @param {string} selector - Sélecteur CSS du bouton
     * @param {Function} handler - Fonction à exécuter
     */
    bindButtonEvent(selector, handler) {
        const button = document.querySelector(selector);
        if (button) {
            const eventHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                handler();
            };
            
            button.addEventListener('click', eventHandler);
            
            // Sauvegarde pour nettoyage
            this.eventCleanupFunctions.push(() => {
                button.removeEventListener('click', eventHandler);
            });
        } else {
            console.warn(`⚠️ Bouton '${selector}' non trouvé`);
        }
    }

    /**
     * Configuration des gestionnaires d'événements globaux
     * 
     * Rôle : Gestion des événements de l'application
     * Type : Méthode de configuration des event listeners
     * Effet de bord : Configure tous les événements globaux
     */
    setupEventListeners() {
        // Rôle : Gestionnaire de redimensionnement de fenêtre
        // Type : Event listener (resize)
        // Unité : Sans unité
        // Domaine : Événements resize du navigateur
        // Formule : window.addEventListener('resize', callback)
        // Exemple : Recalcul layout et zoom lors redimensionnement
        const handleResize = this.debounce(() => {
            this.handleWindowResize();
        }, 250);

        window.addEventListener('resize', handleResize);
        this.eventCleanupFunctions.push(() => {
            window.removeEventListener('resize', handleResize);
        });

        // Gestion des clics sur le canvas pour sélection
        const canvas = this.domCache.get('canvas');
        if (canvas) {
            const handleCanvasClick = (e) => {
                this.handleCanvasClick(e);
            };
            
            canvas.addEventListener('click', handleCanvasClick);
            this.eventCleanupFunctions.push(() => {
                canvas.removeEventListener('click', handleCanvasClick);
            });
        }

        // Synchronisation avec le moteur de présentation
        window.addEventListener('presentationChanged', (e) => {
            this.handlePresentationChange(e);
        });

        // Gestion des messages de synchronisation
        window.addEventListener('presentationSyncReceived', (e) => {
            this.handleSyncReceived(e);
        });

        console.log('🎧 Gestionnaires d\'événements configurés');
    }

    /**
     * Configuration du système drag & drop
     * 
     * Rôle : Gestion du glisser-déposer pour widgets et sections
     * Type : Méthode de configuration drag & drop
     * Effet de bord : Configure les zones de drop et événements
     */
    setupDragDrop() {
        // Configuration de la zone de drop principale
        const dropzone = this.domCache.get('canvasDropzone');
        const presentationSections = this.domCache.get('presentationSections');

        if (dropzone) {
            // Événements de la dropzone
            dropzone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropzone.classList.add('dragover');
            });

            dropzone.addEventListener('dragleave', (e) => {
                if (!dropzone.contains(e.relatedTarget)) {
                    dropzone.classList.remove('dragover');
                }
            });

            dropzone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropzone.classList.remove('dragover');
                this.handleDropToCanvas(e);
            });
        }

        if (presentationSections) {
            // Configuration du drop entre sections
            presentationSections.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.showDropIndicator(e);
            });

            presentationSections.addEventListener('drop', (e) => {
                e.preventDefault();
                this.handleDropToSections(e);
                this.hideDropIndicator();
            });
        }

        console.log('🎯 Système drag & drop configuré');
    }

    /**
     * Configuration des raccourcis clavier
     * 
     * Rôle : Gestion des raccourcis clavier globaux
     * Type : Méthode de configuration keyboard shortcuts
     * Effet de bord : Configure tous les raccourcis de l'application
     */
    setupKeyboardShortcuts() {
        // Rôle : Gestionnaire global des raccourcis clavier
        // Type : Event listener (keydown)
        // Unité : Sans unité
        // Domaine : Événements clavier globaux
        // Formule : event.ctrlKey + event.key → combinaison détectée
        // Exemple : Ctrl+S → sauvegarde, Ctrl+Z → undo
        const handleKeydown = (e) => {
            // Ignorer si on tape dans un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }

            // Gestion des raccourcis avec Ctrl/Cmd
            if (e.ctrlKey || e.metaKey) {
                switch (e.key.toLowerCase()) {
                    case 's':
                        e.preventDefault();
                        this.saveCurrentPresentation();
                        break;
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.redoLastAction();
                        } else {
                            this.undoLastAction();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redoLastAction();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.showNewPresentationModal();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.togglePreviewMode();
                        break;
                }
            }

            // Raccourcis sans modificateur
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    if (this.uiState.selectedElement && !e.target.matches('input, textarea, [contenteditable="true"]')) {
                        e.preventDefault();
                        this.deleteSelectedElement();
                    }
                    break;
                case 'Escape':
                    this.clearSelection();
                    this.closeModals();
                    break;
                case 'F1':
                    e.preventDefault();
                    this.showHelp();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeydown);
        this.eventCleanupFunctions.push(() => {
            document.removeEventListener('keydown', handleKeydown);
        });

        console.log('⌨️ Raccourcis clavier configurés');
    }

    /**
     * Chargement initial des données
     * 
     * Rôle : Chargement de la présentation par défaut ou dernière session
     * Type : Méthode de chargement de données initiales
     * Effet de bord : Charge une présentation dans l'éditeur
     */
    async loadInitialData() {
        try {
            // Tentative de restauration de la dernière session
            const lastPresentationId = localStorage.getItem('last-presentation-id');
            
            if (lastPresentationId) {
                try {
                    const presentation = this.engine.loadPresentation(lastPresentationId);
                    this.loadPresentationInEditor(presentation);
                    this.showSuccess('Dernière présentation restaurée');
                } catch (error) {
                    console.warn('⚠️ Impossible de restaurer la dernière présentation:', error);
                    this.showWelcomeScreen();
                }
            } else {
                this.showWelcomeScreen();
            }
        } catch (error) {
            console.error('❌ Erreur chargement données initiales:', error);
            this.showError('Erreur lors du chargement des données');
        }
    }

    /**
     * Affiche l'écran d'accueil
     * 
     * Rôle : Interface de démarrage pour nouvelle présentation
     * Type : Méthode d'affichage UI
     * Effet de bord : Affiche l'interface de démarrage
     */
    showWelcomeScreen() {
        const dropzone = this.domCache.get('canvasDropzone');
        if (dropzone) {
            dropzone.style.display = 'flex';
        }
        
        // Masquer les sections existantes
        const presentationSections = this.domCache.get('presentationSections');
        if (presentationSections) {
            presentationSections.innerHTML = '';
        }

        this.updateStatusText('Prêt à créer une nouvelle présentation');
    }

    /**
     * Met à jour l'interface utilisateur
     * 
     * Rôle : Synchronisation de l'état UI avec l'état interne
     * Type : Méthode de mise à jour UI
     * Effet de bord : Met à jour tous les éléments d'interface
     */
    updateUI() {
        // Mise à jour des boutons selon l'état
        this.updateButtonStates();

        // Mise à jour des indicateurs
        this.updateZoomIndicator();
        this.updateSyncIndicator();

        // Mise à jour des panels selon la sélection
        this.updatePropertiesPanel();
        this.updateHistoryPanel();
    }

    /**
     * Met à jour l'état des boutons selon le contexte
     * 
     * Rôle : Activation/désactivation des boutons selon l'état
     * Type : Méthode de mise à jour UI
     * Effet de bord : Modifie l'état disabled des boutons
     */
    updateButtonStates() {
        // Rôle : Gestion de l'état des boutons undo/redo
        // Type : Mise à jour UI selon historique
        // Unité : Sans unité
        // Domaine : Boutons activés ou désactivés
        // Formule : historyManager.canUndo() → bouton enabled
        // Exemple : Si historique vide → bouton undo disabled
        const undoBtn = document.querySelector('#btn-undo');
        const redoBtn = document.querySelector('#btn-redo');
        
        if (undoBtn) {
            undoBtn.disabled = !this.engine.historyManager.canUndo();
        }
        if (redoBtn) {
            redoBtn.disabled = !this.engine.historyManager.canRedo();
        }

        // Boutons de section selon sélection
        const sectionUpBtn = document.querySelector('#btn-section-up');
        const sectionDownBtn = document.querySelector('#btn-section-down');
        const deleteSectionBtn = document.querySelector('#btn-delete-section');

        const hasSelectedSection = this.uiState.selectedSection !== null;
        
        if (sectionUpBtn) sectionUpBtn.disabled = !hasSelectedSection;
        if (sectionDownBtn) sectionDownBtn.disabled = !hasSelectedSection;
        if (deleteSectionBtn) deleteSectionBtn.disabled = !hasSelectedSection;

        // Bouton de sauvegarde selon les modifications
        const saveBtn = document.querySelector('#btn-save-presentation');
        if (saveBtn) {
            const hasUnsavedChanges = this.engine.syncManager.hasUnsavedChanges();
            saveBtn.classList.toggle('has-changes', hasUnsavedChanges);
        }
    }

    /**
     * Met à jour l'indicateur de niveau de zoom
     * 
     * Rôle : Affichage du niveau de zoom actuel
     * Type : Méthode de mise à jour UI
     * Effet de bord : Met à jour le texte de l'indicateur zoom
     */
    updateZoomIndicator() {
        const zoomIndicator = this.domCache.get('zoomLevel');
        if (zoomIndicator) {
            zoomIndicator.textContent = `${this.uiState.zoom}%`;
        }
    }

    /**
     * Met à jour l'indicateur de synchronisation
     * 
     * Rôle : Affichage de l'état de synchronisation
     * Type : Méthode de mise à jour UI
     * Effet de bord : Met à jour l'indicateur de sync
     */
    updateSyncIndicator() {
        const syncIndicator = this.domCache.get('syncIndicator');
        if (syncIndicator) {
            // Logique de mise à jour selon l'état de sync
            const isSyncing = this.engine.syncManager.isInitialized;
            syncIndicator.className = `sync-status ${isSyncing ? 'synced' : 'error'}`;
            
            const statusText = syncIndicator.querySelector('span');
            if (statusText) {
                statusText.textContent = isSyncing ? 'Synchronisé' : 'Hors ligne';
            }
        }
    }

    /**
     * Met à jour le panel des propriétés
     * 
     * Rôle : Affichage des propriétés de l'élément sélectionné
     * Type : Méthode de mise à jour UI
     * Effet de bord : Remplit le panel propriétés
     */
    updatePropertiesPanel() {
        const propertiesContent = this.domCache.get('propertiesContent');
        if (!propertiesContent) return;

        if (this.uiState.selectedElement) {
            // Génération du formulaire de propriétés
            const propertiesForm = this.generatePropertiesForm(this.uiState.selectedElement);
            propertiesContent.innerHTML = propertiesForm;
        } else {
            // Message par défaut
            propertiesContent.innerHTML = `
                <div class="no-selection-message">
                    <i class="fas fa-hand-pointer"></i>
                    <p>Sélectionnez un élément pour voir ses propriétés</p>
                </div>
            `;
        }
    }

    /**
     * Met à jour le panel de l'historique
     * 
     * Rôle : Affichage de l'historique des actions
     * Type : Méthode de mise à jour UI  
     * Effet de bord : Remplit le panel historique
     */
    updateHistoryPanel() {
        const historyPanel = this.domCache.get('historyPanel');
        if (!historyPanel) return;

        const historyContent = historyPanel.querySelector('.history-list');
        if (!historyContent) return;

        // Récupération de l'historique
        const history = this.engine.historyManager.getHistory();
        
        // Génération de la liste
        let historyHTML = '';
        
        [...history.undoStack].reverse().forEach((entry, index) => {
            const isLatest = index === 0;
            historyHTML += `
                <div class="history-entry ${isLatest ? 'current' : ''}">
                    <div class="history-action">${entry.action}</div>
                    <div class="history-time">${this.formatTime(entry.timestamp)}</div>
                </div>
            `;
        });

        if (history.redoStack.length > 0) {
            historyHTML += '<div class="history-separator">Actions annulées</div>';
            history.redoStack.forEach(entry => {
                historyHTML += `
                    <div class="history-entry undone">
                        <div class="history-action">${entry.action}</div>
                        <div class="history-time">${this.formatTime(entry.timestamp)}</div>
                    </div>
                `;
            });
        }

        historyContent.innerHTML = historyHTML || '<div class="no-history">Aucune action dans l\'historique</div>';
    }

    /**
     * Utilitaire de debouncing pour optimiser les performances
     * 
     * @param {Function} func - Fonction à débouncer
     * @param {number} delay - Délai en millisecondes
     * @returns {Function} Fonction débouncée
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Utilitaire pour formater un timestamp
     * 
     * @param {string} timestamp - Timestamp ISO
     * @returns {string} Temps formaté
     */
    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Met à jour le texte de statut
     * 
     * @param {string} text - Nouveau texte de statut
     */
    updateStatusText(text) {
        const statusText = this.domCache.get('statusText');
        if (statusText) {
            statusText.textContent = text;
        }
    }

    /**
     * Affiche une notification de succès
     * 
     * @param {string} message - Message à afficher
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Affiche une notification d'erreur
     * 
     * @param {string} message - Message d'erreur
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Affiche une notification toast
     * 
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification
     */
    showToast(message, type = 'info') {
        const container = this.domCache.get('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type} animate-slide-up`;
        toast.textContent = message;

        container.appendChild(toast);

        // Suppression automatique après 5 secondes
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }

    /**
     * Actions vides pour les boutons (à implémenter)
     */
    /**
     * Affiche le modal de nouvelle présentation
     * 
     * Rôle : Interface de création de nouvelle présentation
     * Type : Méthode d'affichage modal
     * Effet de bord : Affiche le modal de création
     */
    showNewPresentationModal() {
        console.log('🆕 Affichage modal nouvelle présentation');
        
        // Création du modal de nouvelle présentation
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'new-presentation-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Nouvelle présentation</h2>
                    <button type="button" class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="new-presentation-form" class="form-grid">
                        <div class="form-group">
                            <label for="presentation-title">Titre de la présentation *</label>
                            <input 
                                type="text" 
                                id="presentation-title" 
                                name="title" 
                                placeholder="Ex: Ma présentation commerciale"
                                required
                            >
                        </div>
                        <div class="form-group">
                            <label for="presentation-description">Description</label>
                            <textarea 
                                id="presentation-description" 
                                name="description" 
                                rows="3"
                                placeholder="Description optionnelle de votre présentation..."
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label for="presentation-template">Modèle de base</label>
                            <select id="presentation-template" name="template">
                                <option value="">Présentation vide</option>
                                <option value="li-cube-pro">Li-CUBE PRO (complet)</option>
                                <option value="commercial">Présentation commerciale</option>
                                <option value="simple">Présentation simple</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">
                        Annuler
                    </button>
                    <button type="submit" form="new-presentation-form" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Créer la présentation
                    </button>
                </div>
            </div>
        `;
        
        // Ajout au DOM
        document.body.appendChild(modal);
        
        // Focus sur le champ titre
        const titleInput = modal.querySelector('#presentation-title');
        setTimeout(() => titleInput?.focus(), 100);
        
        // Gestion du formulaire
        const form = modal.querySelector('#new-presentation-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createNewPresentation(new FormData(form));
            modal.remove();
        });
        
        // Fermeture au clic sur l'overlay
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    /**
     * Crée une nouvelle présentation
     * 
     * Rôle : Création et initialisation d'une nouvelle présentation
     * Type : Méthode de gestion de données
     * Paramètre : formData - FormData contenant titre, description, template
     * Effet de bord : Crée une présentation et l'affiche dans l'éditeur
     */
    async createNewPresentation(formData) {
        try {
            // Récupération des données du formulaire
            const title = formData.get('title')?.trim();
            const description = formData.get('description')?.trim() || '';
            const template = formData.get('template') || '';

            // Validation du titre obligatoire
            if (!title) {
                this.showError('Le titre de la présentation est obligatoire');
                return;
            }

            console.log(`🚀 Création nouvelle présentation: "${title}" (template: ${template || 'vide'})`);
            
            // Configuration de la présentation
            const presentationConfig = {
                title: title,
                description: description,
                template: template,
                createdAt: new Date().toISOString(),
                author: 'Utilisateur'
            };

            // Création via le moteur
            const presentation = await this.engine.createPresentation(presentationConfig);
            
            if (!presentation) {
                throw new Error('Échec de la création de la présentation');
            }

            // Sauvegarde de l'ID pour persistance
            localStorage.setItem('last-presentation-id', presentation.id);

            // Chargement dans l'éditeur
            await this.loadPresentationInEditor(presentation);

            // Notification de succès
            this.showSuccess(`Présentation "${title}" créée avec succès`);
            this.updateStatusText(`Édition de "${title}"`);

        } catch (error) {
            console.error('❌ Erreur création présentation:', error);
            this.showError(`Erreur lors de la création: ${error.message}`);
        }
    }

    /**
     * Sauvegarde la présentation courante
     * 
     * Rôle : Sauvegarde de l'état actuel de la présentation
     * Type : Méthode de persistance des données
     * Effet de bord : Sauvegarde la présentation dans le stockage
     */
    async saveCurrentPresentation() {
        try {
            // Vérification qu'une présentation est chargée
            const currentPresentation = this.engine.getCurrentPresentation();
            if (!currentPresentation) {
                this.showError('Aucune présentation à sauvegarder');
                return;
            }

            console.log(`💾 Sauvegarde de la présentation: ${currentPresentation.title}`);

            // Affichage d'un indicateur de sauvegarde
            this.updateStatusText('Sauvegarde en cours...');
            
            // Sauvegarde via le moteur
            const result = await this.engine.savePresentation();
            
            if (result.success) {
                // Sauvegarde réussie
                this.showSuccess('Présentation sauvegardée avec succès');
                this.updateStatusText(`"${currentPresentation.title}" - Sauvegardée`);
                
                // Mise à jour de l'interface (enlever les indicateurs de modification)
                this.updateButtonStates();
                
                // Synchronisation temps réel
                this.engine.syncManager.syncPresentation(currentPresentation, 'save');
                
                console.log(`✅ Présentation sauvegardée: ${result.path}`);
            } else {
                throw new Error(result.error || 'Erreur inconnue');
            }

        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
            this.showError(`Erreur lors de la sauvegarde: ${error.message}`);
            this.updateStatusText('Erreur de sauvegarde');
        }
    }
    togglePreviewMode() { console.log('👁️ Aperçu (à implémenter)'); }
    /**
     * Annule la dernière action
     * 
     * Rôle : Utilisation du système d'historique pour annuler
     * Type : Méthode de gestion d'historique
     * Effet de bord : Restaure l'état précédent de la présentation
     */
    undoLastAction() {
        try {
            const historyManager = this.engine.historyManager;
            
            if (!historyManager.canUndo()) {
                this.showWarning('Aucune action à annuler');
                return;
            }

            console.log('↶ Annulation de la dernière action');

            // Récupération de l'état précédent
            const previousState = historyManager.undo();
            
            if (previousState) {
                // Restauration de l'état
                this.engine.restoreState(previousState.state);
                
                // Rafraîchissement de l'interface
                this.refreshEditor();
                
                // Notification
                this.showSuccess(`Action annulée: ${previousState.action}`);
                this.updateStatusText(`Annulé: ${previousState.action}`);
                
                // Synchronisation
                const currentPresentation = this.engine.getCurrentPresentation();
                if (currentPresentation) {
                    this.engine.syncManager.syncPresentation(currentPresentation, 'undo');
                }
                
                // Mise à jour des boutons
                this.updateButtonStates();
            }

        } catch (error) {
            console.error('❌ Erreur annulation:', error);
            this.showError(`Erreur lors de l'annulation: ${error.message}`);
        }
    }

    /**
     * Rétablit la dernière action annulée
     * 
     * Rôle : Utilisation du système d'historique pour rétablir
     * Type : Méthode de gestion d'historique
     * Effet de bord : Restaure l'état suivant de la présentation
     */
    redoLastAction() {
        try {
            const historyManager = this.engine.historyManager;
            
            if (!historyManager.canRedo()) {
                this.showWarning('Aucune action à rétablir');
                return;
            }

            console.log('↷ Rétablissement de la dernière action annulée');

            // Récupération de l'état suivant
            const nextState = historyManager.redo();
            
            if (nextState) {
                // Restauration de l'état
                this.engine.restoreState(nextState.state);
                
                // Rafraîchissement de l'interface
                this.refreshEditor();
                
                // Notification
                this.showSuccess(`Action rétablie: ${nextState.action}`);
                this.updateStatusText(`Rétabli: ${nextState.action}`);
                
                // Synchronisation
                const currentPresentation = this.engine.getCurrentPresentation();
                if (currentPresentation) {
                    this.engine.syncManager.syncPresentation(currentPresentation, 'redo');
                }
                
                // Mise à jour des boutons
                this.updateButtonStates();
            }

        } catch (error) {
            console.error('❌ Erreur rétablissement:', error);
            this.showError(`Erreur lors du rétablissement: ${error.message}`);
        }
    }

    /**
     * Rafraîchit l'interface de l'éditeur
     * 
     * Rôle : Mise à jour complète de l'affichage après un changement d'état
     * Type : Méthode de rafraîchissement UI
     * Effet de bord : Redessine toute l'interface éditeur
     */
    refreshEditor() {
        try {
            console.log('🔄 Rafraîchissement de l\'éditeur');

            // Mise à jour des boutons et contrôles
            this.updateButtonStates();

            // Rafraîchissement du canvas de présentation
            this.refreshPresentationCanvas();

            // Mise à jour des panneaux latéraux
            this.refreshSidebars();

            // Mise à jour de la barre de statut
            const currentPresentation = this.engine.getCurrentPresentation();
            if (currentPresentation) {
                this.updateStatusText(`Édition de "${currentPresentation.title}"`);
            }

        } catch (error) {
            console.error('❌ Erreur rafraîchissement éditeur:', error);
        }
    }

    /**
     * Rafraîchit le canvas de présentation
     * 
     * Rôle : Redessine la zone de travail principale
     * Type : Méthode de rafraîchissement UI
     * Effet de bord : Met à jour l'affichage des sections et widgets
     */
    refreshPresentationCanvas() {
        const presentationSections = this.domCache.get('presentationSections');
        const dropzone = this.domCache.get('canvasDropzone');
        
        if (!presentationSections) return;

        const currentPresentation = this.engine.getCurrentPresentation();
        
        if (!currentPresentation) {
            // Aucune présentation chargée = afficher écran d'accueil
            presentationSections.innerHTML = '';
            if (dropzone) {
                dropzone.style.display = 'flex';
            }
        } else {
            // Présentation chargée = TOUJOURS masquer l'écran d'accueil
            if (dropzone) {
                dropzone.style.display = 'none';
            }
            
            if (currentPresentation.sections && currentPresentation.sections.length > 0) {
                // Génération des sections existantes
                this.renderPresentationSections(currentPresentation.sections);
            } else {
                // Présentation vide mais chargée = message d'aide
                presentationSections.innerHTML = `
                    <div class="empty-presentation-message">
                        <div class="empty-icon">
                            <i class="fas fa-plus-circle"></i>
                        </div>
                        <h3>Présentation vide</h3>
                        <p>Commencez par ajouter une section depuis le panneau latéral<br>
                        ou glissez-déposez des éléments ici</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Charge une présentation dans l'éditeur
     * 
     * Rôle : Affichage d'une présentation complète dans l'interface
     * Type : Méthode de chargement de données
     * Paramètre : presentation - Objet présentation à charger
     * Effet de bord : Met à jour toute l'interface avec la présentation
     */
    async loadPresentationInEditor(presentation) {
        try {
            console.log(`📖 Chargement présentation dans l'éditeur: ${presentation.title}`);

            // Définition de la présentation courante dans le moteur
            this.engine.setCurrentPresentation(presentation);

            // Masquage OBLIGATOIRE de l'écran d'accueil pour toute présentation chargée
            const dropzone = this.domCache.get('canvasDropzone');
            if (dropzone) {
                dropzone.style.display = 'none';
            }

            // Affichage des sections de la présentation
            if (presentation.sections && presentation.sections.length > 0) {
                await this.renderPresentationSections(presentation.sections);
            } else {
                // Même sans sections, afficher un canvas vide pour permettre l'ajout
                const presentationSections = this.domCache.get('presentationSections');
                if (presentationSections) {
                    presentationSections.innerHTML = `
                        <div class="empty-presentation-message">
                            <div class="empty-icon">
                                <i class="fas fa-plus-circle"></i>
                            </div>
                            <h3>Présentation vide</h3>
                            <p>Commencez par ajouter une section depuis le panneau latéral<br>
                            ou glissez-déposez des éléments ici</p>
                        </div>
                    `;
                }
            }

            // Mise à jour de l'interface
            this.refreshEditor();

            // Sauvegarde de l'état initial dans l'historique
            this.engine.historyManager.saveState(presentation, `Chargement de "${presentation.title}"`);

            console.log(`✅ Présentation "${presentation.title}" chargée avec ${presentation.sections?.length || 0} sections`);

        } catch (error) {
            console.error('❌ Erreur chargement présentation:', error);
            this.showError(`Erreur lors du chargement: ${error.message}`);
        }
    }

    /**
     * Affiche les sections d'une présentation
     * 
     * Rôle : Rendu visuel des sections de présentation
     * Type : Méthode de rendu UI
     * Paramètre : sections - Array des sections à afficher
     * Effet de bord : Remplit le canvas avec les sections
     */
    async renderPresentationSections(sections) {
        const presentationSections = this.domCache.get('presentationSections');
        if (!presentationSections) return;

        try {
            // Effacement du contenu existant
            presentationSections.innerHTML = '';

            // Rendu de chaque section
            for (const section of sections) {
                const sectionElement = await this.renderSection(section);
                if (sectionElement) {
                    presentationSections.appendChild(sectionElement);
                }
            }

            console.log(`✅ ${sections.length} sections affichées`);

        } catch (error) {
            console.error('❌ Erreur rendu sections:', error);
            throw error;
        }
    }

    /**
     * Rafraîchit les panneaux latéraux
     * 
     * Rôle : Mise à jour des sidebars avec les données courantes
     * Type : Méthode de rafraîchissement UI
     * Effet de bord : Met à jour les listes de widgets et sections
     */
    refreshSidebars() {
        // Rechargement des widgets disponibles
        this.loadAvailableWidgets();
        
        // Rechargement des sections disponibles
        this.loadAvailableSections();
        
        // Mise à jour du panneau de propriétés si un élément est sélectionné
        if (this.uiState.selectedElement) {
            this.updatePropertiesPanel(this.uiState.selectedElement);
        }
    }

    /**
     * Rendu d'une section individuelle
     * 
     * Rôle : Création de l'élément DOM pour une section
     * Type : Méthode de rendu UI
     * Paramètre : section - Objet section à rendre
     * Retour : HTMLElement - Élément DOM de la section
     * Effet de bord : Crée l'élément section avec ses widgets
     */
    async renderSection(section) {
        try {
            // Utilisation du SectionManager pour générer le HTML
            const sectionHtml = await this.engine.sectionManager.generateSectionHtml(section);
            
            // Création de l'élément conteneur
            const sectionElement = document.createElement('div');
            sectionElement.className = 'presentation-section';
            sectionElement.dataset.sectionId = section.id;
            sectionElement.dataset.sectionType = section.type || 'generic';
            
            // Ajout des contrôles d'édition en mode éditeur
            const sectionWrapper = document.createElement('div');
            sectionWrapper.className = 'section-wrapper editable';
            
            // Contrôles de section
            const sectionControls = document.createElement('div');
            sectionControls.className = 'section-controls';
            sectionControls.innerHTML = `
                <div class="section-info">
                    <span class="section-label">${section.name || 'Section'}</span>
                    <span class="section-type">${section.type || 'generic'}</span>
                </div>
                <div class="section-actions">
                    <button class="btn-icon" title="Dupliquer la section" data-action="duplicate-section">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn-icon" title="Modifier la section" data-action="edit-section">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon" title="Monter" data-action="move-section-up">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="btn-icon" title="Descendre" data-action="move-section-down">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                    <button class="btn-icon btn-danger" title="Supprimer" data-action="delete-section">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Contenu de la section
            const sectionContent = document.createElement('div');
            sectionContent.className = 'section-content';
            sectionContent.innerHTML = sectionHtml;
            
            // Assemblage
            sectionWrapper.appendChild(sectionControls);
            sectionWrapper.appendChild(sectionContent);
            sectionElement.appendChild(sectionWrapper);
            
            // Événements pour les contrôles
            this.bindSectionControlEvents(sectionElement, section);
            
            // Événements pour la sélection
            sectionElement.addEventListener('click', (e) => {
                // Éviter la sélection si on clique sur un contrôle
                if (!e.target.closest('.section-controls')) {
                    this.selectElement(sectionElement, 'section', section);
                }
            });

            return sectionElement;

        } catch (error) {
            console.error(`❌ Erreur rendu section ${section.id}:`, error);
            
            // Élément d'erreur en fallback
            const errorElement = document.createElement('div');
            errorElement.className = 'presentation-section section-error';
            errorElement.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erreur de rendu de la section: ${section.name || section.id}
                    <details>
                        <summary>Détails de l'erreur</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
            `;
            return errorElement;
        }
    }

    /**
     * Lie les événements des contrôles de section
     * 
     * Rôle : Configuration des événements pour les boutons de section
     * Type : Méthode de liaison d'événements
     * Paramètres : sectionElement - Element DOM, section - Objet section
     * Effet de bord : Configure les événements click des contrôles
     */
    bindSectionControlEvents(sectionElement, section) {
        const controls = sectionElement.querySelectorAll('[data-action]');
        
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation(); // Éviter la sélection de la section
                
                const action = control.dataset.action;
                
                switch (action) {
                    case 'duplicate-section':
                        this.duplicateSection(section);
                        break;
                    case 'edit-section':
                        this.editSection(section);
                        break;
                    case 'move-section-up':
                        this.moveSectionUp(section);
                        break;
                    case 'move-section-down':
                        this.moveSectionDown(section);
                        break;
                    case 'delete-section':
                        this.deleteSection(section);
                        break;
                    default:
                        console.warn(`Action de section inconnue: ${action}`);
                }
            });
        });
    }

    /**
     * Sélectionne un élément dans l'éditeur
     * 
     * Rôle : Gestion de la sélection d'éléments (sections, widgets)
     * Type : Méthode de gestion d'état UI
     * Paramètres : element - Element DOM, type - Type d'élément, data - Données associées
     * Effet de bord : Met à jour l'état de sélection et l'interface
     */
    selectElement(element, type, data) {
        try {
            // Désélection de l'élément précédent
            if (this.uiState.selectedElement && this.uiState.selectedElement.element !== element) {
                this.uiState.selectedElement.element.classList.remove('selected');
            }

            // Nouvelle sélection
            this.uiState.selectedElement = {
                element: element,
                type: type,
                data: data
            };

            // Mise à jour visuelle
            element.classList.add('selected');

            // Mise à jour du panneau de propriétés
            this.updatePropertiesPanel(this.uiState.selectedElement);

            // Mise à jour des boutons selon la sélection
            this.updateButtonStates();

            console.log(`🎯 Élément sélectionné: ${type} (${data.id || data.name || 'sans nom'})`);

        } catch (error) {
            console.error('❌ Erreur sélection élément:', error);
        }
    }

    /**
     * Duplique une section
     * 
     * Rôle : Création d'une copie de section
     * Type : Méthode de manipulation de données
     * Paramètre : section - Section à dupliquer
     * Effet de bord : Ajoute la section dupliquée à la présentation
     */
    async duplicateSection(section) {
        try {
            console.log(`📄 Duplication de la section: ${section.name || section.id}`);

            // Sauvegarde de l'état pour l'historique
            const currentPresentation = this.engine.getCurrentPresentation();
            this.engine.historyManager.saveState(currentPresentation, `Avant duplication de section`);

            // Duplication via le moteur
            const duplicatedSection = await this.engine.sectionManager.duplicateSection(section);
            
            // Ajout à la présentation courante
            if (currentPresentation) {
                const sectionIndex = currentPresentation.sections.findIndex(s => s.id === section.id);
                currentPresentation.sections.splice(sectionIndex + 1, 0, duplicatedSection);
                
                // Rafraîchissement de l'interface
                await this.renderPresentationSections(currentPresentation.sections);
                
                this.showSuccess(`Section "${section.name || 'Sans nom'}" dupliquée`);
                
                // Synchronisation temps réel
                this.engine.syncManager.syncPresentation(currentPresentation, 'duplicate-section');
            }

        } catch (error) {
            console.error('❌ Erreur duplication section:', error);
            this.showError(`Erreur lors de la duplication: ${error.message}`);
        }
    }

    /**
     * Édite une section
     * 
     * Rôle : Ouverture de l'éditeur de section
     * Type : Méthode de navigation UI
     * Paramètre : section - Section à éditer
     * Effet de bord : Affiche l'éditeur de section
     */
    editSection(section) {
        console.log(`✏️ Édition de la section: ${section.name || section.id}`);
        
        // Sélection de la section
        const sectionElement = document.querySelector(`[data-section-id="${section.id}"]`);
        if (sectionElement) {
            this.selectElement(sectionElement, 'section', section);
        }

        // Passage au panneau de propriétés si pas déjà actif
        if (this.uiState.activeRightTab !== 'properties') {
            this.switchRightTab('properties');
        }

        // TODO: Ouvrir l'éditeur de section dédié
        this.showSuccess(`Édition de "${section.name || 'Section sans nom'}" - Panneau propriétés activé`);
    }

    /**
     * Supprime une section
     * 
     * Rôle : Suppression d'une section avec confirmation
     * Type : Méthode de manipulation de données
     * Paramètre : section - Section à supprimer
     * Effet de bord : Supprime la section de la présentation
     */
    async deleteSection(section) {
        // Demande de confirmation
        const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer la section "${section.name || 'Sans nom'}" ?\n\nCette action ne peut pas être annulée directement.`);
        
        if (!confirmed) {
            return;
        }

        try {
            console.log(`🗑️ Suppression de la section: ${section.name || section.id}`);

            const currentPresentation = this.engine.getCurrentPresentation();
            if (!currentPresentation) {
                this.showError('Aucune présentation chargée');
                return;
            }

            // Sauvegarde de l'état pour l'historique
            this.engine.historyManager.saveState(currentPresentation, `Avant suppression de section`);

            // Suppression de la section
            const sectionIndex = currentPresentation.sections.findIndex(s => s.id === section.id);
            if (sectionIndex > -1) {
                currentPresentation.sections.splice(sectionIndex, 1);
                
                // Rafraîchissement de l'interface
                await this.renderPresentationSections(currentPresentation.sections);
                
                // Désélection si c'était la section sélectionnée
                if (this.uiState.selectedElement && this.uiState.selectedElement.data.id === section.id) {
                    this.clearSelection();
                }
                
                this.showSuccess(`Section "${section.name || 'Sans nom'}" supprimée`);
                
                // Synchronisation temps réel
                this.engine.syncManager.syncPresentation(currentPresentation, 'delete-section');
            }

        } catch (error) {
            console.error('❌ Erreur suppression section:', error);
            this.showError(`Erreur lors de la suppression: ${error.message}`);
        }
    }

    /**
     * Déplace une section vers le haut
     * 
     * Rôle : Réorganisation de l'ordre des sections
     * Type : Méthode de manipulation de données
     * Paramètre : section - Section à déplacer
     * Effet de bord : Modifie l'ordre des sections dans la présentation
     */
    async moveSectionUp(section) {
        try {
            const currentPresentation = this.engine.getCurrentPresentation();
            if (!currentPresentation) return;

            const sectionIndex = currentPresentation.sections.findIndex(s => s.id === section.id);
            if (sectionIndex <= 0) {
                this.showWarning('La section est déjà en première position');
                return;
            }

            console.log(`⬆️ Déplacement section vers le haut: ${section.name || section.id}`);

            // Sauvegarde de l'état pour l'historique
            this.engine.historyManager.saveState(currentPresentation, `Avant déplacement de section`);

            // Échange des positions
            [currentPresentation.sections[sectionIndex], currentPresentation.sections[sectionIndex - 1]] = 
            [currentPresentation.sections[sectionIndex - 1], currentPresentation.sections[sectionIndex]];

            // Rafraîchissement de l'interface
            await this.renderPresentationSections(currentPresentation.sections);
            
            // Synchronisation temps réel
            this.engine.syncManager.syncPresentation(currentPresentation, 'move-section');

        } catch (error) {
            console.error('❌ Erreur déplacement section:', error);
            this.showError(`Erreur lors du déplacement: ${error.message}`);
        }
    }

    /**
     * Déplace une section vers le bas
     * 
     * Rôle : Réorganisation de l'ordre des sections
     * Type : Méthode de manipulation de données
     * Paramètre : section - Section à déplacer
     * Effet de bord : Modifie l'ordre des sections dans la présentation
     */
    async moveSectionDown(section) {
        try {
            const currentPresentation = this.engine.getCurrentPresentation();
            if (!currentPresentation) return;

            const sectionIndex = currentPresentation.sections.findIndex(s => s.id === section.id);
            if (sectionIndex >= currentPresentation.sections.length - 1) {
                this.showWarning('La section est déjà en dernière position');
                return;
            }

            console.log(`⬇️ Déplacement section vers le bas: ${section.name || section.id}`);

            // Sauvegarde de l'état pour l'historique
            this.engine.historyManager.saveState(currentPresentation, `Avant déplacement de section`);

            // Échange des positions
            [currentPresentation.sections[sectionIndex], currentPresentation.sections[sectionIndex + 1]] = 
            [currentPresentation.sections[sectionIndex + 1], currentPresentation.sections[sectionIndex]];

            // Rafraîchissement de l'interface
            await this.renderPresentationSections(currentPresentation.sections);
            
            // Synchronisation temps réel
            this.engine.syncManager.syncPresentation(currentPresentation, 'move-section');

        } catch (error) {
            console.error('❌ Erreur déplacement section:', error);
            this.showError(`Erreur lors du déplacement: ${error.message}`);
        }
    }

    /**
     * Affiche les paramètres de l'éditeur
     * 
     * Rôle : Configuration de l'éditeur et préférences utilisateur
     * Type : Méthode d'affichage modal
     * Effet de bord : Affiche le modal des paramètres
     */
    showSettings() { 
        console.log('⚙️ Paramètres (interface à développer)');
        this.showInfo('Interface des paramètres en cours de développement');
    }

    /**
     * Affiche le dialogue d'ajout de section
     * 
     * Rôle : Interface de sélection et ajout de sections
     * Type : Méthode d'affichage modal
     * Effet de bord : Affiche le dialogue d'ajout de section
     */
    showAddSectionDialog() {
        console.log('➕ Affichage dialogue ajout section');
        
        // Force l'affichage de l'onglet sections si pas déjà actif
        if (this.uiState.activeLeftTab !== 'sections') {
            this.switchLeftTab('sections');
        }
        
        this.showInfo('Utilisez le panneau "Sections" pour ajouter une section à votre présentation');
    }

    /**
     * Supprime la section sélectionnée
     * 
     * Rôle : Suppression de la section actuellement sélectionnée
     * Type : Méthode de manipulation de données
     * Effet de bord : Supprime l'élément sélectionné s'il s'agit d'une section
     */
    deleteSelectedSection() {
        if (this.uiState.selectedElement && this.uiState.selectedElement.type === 'section') {
            this.deleteSection(this.uiState.selectedElement.data);
        } else {
            this.showWarning('Aucune section sélectionnée à supprimer');
        }
    }

    /**
     * Efface la sélection courante
     * 
     * Rôle : Désélection de l'élément actuellement sélectionné
     * Type : Méthode de gestion d'état UI
     * Effet de bord : Remet l'interface dans un état non-sélectionné
     */
    clearSelection() {
        if (this.uiState.selectedElement) {
            // Suppression de la classe selected
            this.uiState.selectedElement.element.classList.remove('selected');
            
            // Réinitialisation de l'état
            this.uiState.selectedElement = null;
            
            // Mise à jour de l'interface
            this.updateButtonStates();
            this.updatePropertiesPanel(null);
            
            console.log('🔄 Sélection effacée');
        }
    }

    /**
     * Ferme tous les modals ouverts
     * 
     * Rôle : Nettoyage de l'interface en fermant les overlays
     * Type : Méthode de gestion UI
     * Effet de bord : Ferme tous les modals et overlays
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            modal.remove();
        });
        
        if (modals.length > 0) {
            console.log(`🚫 ${modals.length} modal(s) fermé(s)`);
        }
    }

    /**
     * Met à jour le niveau de zoom
     * 
     * Rôle : Application d'un niveau de zoom spécifique au canvas
     * Type : Méthode de gestion d'affichage
     * Paramètre : zoomLevel - Niveau de zoom en pourcentage (25-200)
     * Effet de bord : Applique le zoom au canvas et met à jour l'interface
     */
    updateZoomLevel(zoomLevel) {
        // Rôle : Validation et limitation du niveau de zoom
        // Type : Number (pourcentage de zoom)
        // Unité : % (25% à 200% maximum)
        // Domaine : 25 ≤ zoomLevel ≤ 200
        // Formule : Math.max(25, Math.min(200, zoomLevel))
        // Exemple : zoomLevel=150 → zoom à 150%
        const clampedZoom = Math.max(25, Math.min(200, zoomLevel));
        
        // Mise à jour de l'état interne
        this.uiState.zoom = clampedZoom;
        
        // Application du zoom au canvas de présentation
        const canvas = this.domCache.get('presentationCanvas');
        if (canvas) {
            // Rôle : Application de la transformation de zoom CSS
            // Type : CSS Transform (scale)
            // Unité : Ratio décimal (1.0 = 100%)
            // Domaine : 0.25 ≤ ratio ≤ 2.0
            // Formule : ratio = zoomLevel / 100
            // Exemple : zoomLevel=150 → ratio=1.5 → scale(1.5)
            const zoomRatio = clampedZoom / 100;
            canvas.style.transform = `scale(${zoomRatio})`;
            canvas.style.transformOrigin = 'center top';
        }
        
        // Mise à jour de l'affichage du niveau de zoom
        this.updateZoomIndicator();
        
        console.log(`🔍 Niveau de zoom défini: ${clampedZoom}%`);
    }

    /**
     * Ajuste le niveau de zoom
     * 
     * Rôle : Modification du niveau de zoom du canvas
     * Type : Méthode de gestion d'affichage
     * Paramètre : delta - Changement de zoom en pourcentage (ex: +10, -20)
     * Effet de bord : Modifie l'échelle d'affichage du canvas
     */
    adjustZoom(delta) {
        // Calcul du nouveau niveau de zoom
        const newZoom = Math.max(25, Math.min(200, this.uiState.zoom + delta));
        
        if (newZoom !== this.uiState.zoom) {
            this.uiState.zoom = newZoom;
            
            // Application du zoom au canvas
            const canvas = this.domCache.get('presentationCanvas');
            if (canvas) {
                canvas.style.transform = `scale(${newZoom / 100})`;
                canvas.style.transformOrigin = 'center top';
            }
            
            // Mise à jour de l'affichage du zoom
            const zoomDisplay = document.querySelector('.zoom-level');
            if (zoomDisplay) {
                zoomDisplay.textContent = `${newZoom}%`;
            }
            
            console.log(`🔍 Zoom ajusté: ${newZoom}%`);
        }
    }

    /**
     * Ajuste le zoom pour adapter le contenu à la fenêtre
     * 
     * Rôle : Calcul automatique du zoom optimal
     * Type : Méthode de gestion d'affichage
     * Effet de bord : Définit le zoom pour afficher tout le contenu
     */
    fitZoomToWindow() {
        try {
            const canvas = this.domCache.get('presentationCanvas');
            const canvasContainer = canvas?.parentElement;
            
            if (!canvas || !canvasContainer) return;

            // Récupération des dimensions
            const containerRect = canvasContainer.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            
            // Calcul du zoom optimal (avec marge de 10%)
            const scaleX = (containerRect.width * 0.9) / (canvasRect.width / (this.uiState.zoom / 100));
            const scaleY = (containerRect.height * 0.9) / (canvasRect.height / (this.uiState.zoom / 100));
            
            const optimalZoom = Math.floor(Math.min(scaleX, scaleY) * 100);
            const clampedZoom = Math.max(25, Math.min(200, optimalZoom));
            
            // Application du nouveau zoom
            this.adjustZoom(clampedZoom - this.uiState.zoom);
            
            console.log(`🔍 Zoom ajusté automatiquement: ${clampedZoom}%`);

        } catch (error) {
            console.error('❌ Erreur ajustement zoom:', error);
        }
    }

    /**
     * Change le mode d'affichage
     * 
     * Rôle : Basculement entre les modes éditeur/prévisualisation
     * Type : Méthode de gestion d'état UI
     * Paramètre : mode - Mode d'affichage ('edit' ou 'preview')
     * Effet de bord : Modifie l'interface selon le mode
     */
    setViewMode(mode) {
        if (!['edit', 'preview'].includes(mode)) {
            console.warn(`Mode d'affichage invalide: ${mode}`);
            return;
        }

        const previousMode = this.uiState.viewMode;
        this.uiState.viewMode = mode;

        // Mise à jour des classes CSS
        document.body.classList.toggle('preview-mode', mode === 'preview');
        document.body.classList.toggle('edit-mode', mode === 'edit');

        // Masquage/affichage des contrôles d'édition
        const editControls = document.querySelectorAll('.section-controls, .widget-controls');
        editControls.forEach(control => {
            control.style.display = mode === 'edit' ? 'flex' : 'none';
        });

        // Mise à jour du bouton de mode
        const modeButton = document.querySelector('#btn-preview-presentation');
        if (modeButton) {
            const icon = modeButton.querySelector('i');
            if (mode === 'preview') {
                icon.className = 'fas fa-edit';
                modeButton.title = 'Mode édition';
            } else {
                icon.className = 'fas fa-eye';
                modeButton.title = 'Mode prévisualisation';
            }
        }

        console.log(`👀 Mode d'affichage: ${mode} (précédent: ${previousMode})`);
        this.showSuccess(`Mode ${mode === 'edit' ? 'édition' : 'prévisualisation'} activé`);
    }

    /**
     * Affiche les options de démarrage rapide
     * 
     * Rôle : Interface de création rapide de présentations
     * Type : Méthode d'affichage modal
     * Effet de bord : Affiche le modal de démarrage rapide
     */
    showQuickStartOptions() {
        console.log('🚀 Options de démarrage rapide');
        
        // Pour l'instant, redirection vers la création normale
        this.showNewPresentationModal();
    }

    /**
     * Bascule entre les modes édition et prévisualisation
     * 
     * Rôle : Basculement automatique entre les deux modes principaux
     * Type : Méthode de basculement d'état UI
     * Effet de bord : Change le mode d'affichage courant
     */
    togglePreviewMode() {
        const newMode = this.uiState.viewMode === 'edit' ? 'preview' : 'edit';
        this.setViewMode(newMode);
    }

    /**
     * Met à jour le texte de statut
     * 
     * Rôle : Affichage d'informations dans la barre de statut
     * Type : Méthode de mise à jour UI
     * Paramètre : text - Texte à afficher
     * Effet de bord : Met à jour l'affichage du statut
     */
    updateStatusText(text) {
        const statusElement = document.querySelector('.status-text') || 
                            document.querySelector('#status-text') ||
                            document.querySelector('.editor-status');
        
        if (statusElement) {
            statusElement.textContent = text;
            console.log(`📊 Statut: ${text}`);
        }
    }

    /**
     * Met à jour l'indicateur de zoom
     * 
     * Rôle : Affichage du niveau de zoom actuel
     * Type : Méthode de mise à jour UI
     * Effet de bord : Met à jour l'affichage du zoom
     */
    updateZoomIndicator() {
        const zoomElement = document.querySelector('.zoom-indicator') || 
                          document.querySelector('#zoom-level');
        
        if (zoomElement) {
            zoomElement.textContent = `${this.uiState.zoom}%`;
        }
    }

    /**
     * Met à jour l'indicateur de synchronisation
     * 
     * Rôle : Affichage du statut de synchronisation
     * Type : Méthode de mise à jour UI
     * Effet de bord : Met à jour l'affichage de la sync
     */
    updateSyncIndicator() {
        const syncElement = document.querySelector('.sync-indicator') || 
                          document.querySelector('#sync-status');
        
        if (syncElement) {
            const isConnected = this.engine.syncManager.isConnected();
            syncElement.classList.toggle('connected', isConnected);
            syncElement.classList.toggle('disconnected', !isConnected);
            
            const icon = syncElement.querySelector('i');
            if (icon) {
                icon.className = isConnected ? 'fas fa-wifi' : 'fas fa-wifi-slash';
            }
        }
    }

    /**
     * Met à jour le panneau des propriétés
     * 
     * Rôle : Affichage des propriétés de l'élément sélectionné
     * Type : Méthode de mise à jour UI
     * Paramètre : selectedElement - Élément sélectionné ou null
     * Effet de bord : Met à jour le contenu du panneau propriétés
     */
    updatePropertiesPanel(selectedElement = null) {
        const propertiesPanel = document.querySelector('#properties-panel .panel-content') ||
                              document.querySelector('#properties-content');
        
        if (!propertiesPanel) return;

        if (!selectedElement) {
            // Pas de sélection
            propertiesPanel.innerHTML = `
                <div class="no-selection">
                    <i class="fas fa-mouse-pointer"></i>
                    <p>Sélectionnez un élément pour éditer ses propriétés</p>
                </div>
            `;
            return;
        }

        // Affichage des propriétés selon le type d'élément
        let content = '';
        
        if (selectedElement.type === 'section') {
            content = this.generateSectionPropertiesUI(selectedElement.data);
        } else if (selectedElement.type === 'widget') {
            content = this.generateWidgetPropertiesUI(selectedElement.data);
        }

        propertiesPanel.innerHTML = content;
        
        // Configuration des événements pour les contrôles de propriétés
        this.setupPropertiesEventHandlers(propertiesPanel, selectedElement);
    }

    /**
     * Met à jour le panneau de l'historique
     * 
     * Rôle : Affichage de l'historique des actions
     * Type : Méthode de mise à jour UI
     * Effet de bord : Met à jour le contenu du panneau historique
     */
    updateHistoryPanel() {
        const historyPanel = document.querySelector('#history-content .history-list') ||
                           document.querySelector('#history-panel .history-list');
        
        if (!historyPanel) return;

        const history = this.engine.historyManager.getHistory();
        
        let content = '';
        
        // Affichage des actions de la pile undo (plus récentes en premier)
        history.undoStack.reverse().forEach((entry, index) => {
            content += `
                <div class="history-entry ${index === 0 ? 'current' : ''}">
                    <div class="history-icon">
                        <i class="fas fa-history"></i>
                    </div>
                    <div class="history-details">
                        <div class="history-action">${entry.action}</div>
                        <div class="history-time">${this.formatHistoryTime(entry.timestamp)}</div>
                    </div>
                    ${index === 0 ? '<div class="history-badge">Actuel</div>' : ''}
                </div>
            `;
        });

        if (content === '') {
            content = `
                <div class="no-history">
                    <i class="fas fa-clock"></i>
                    <p>Aucune action dans l'historique</p>
                </div>
            `;
        }

        historyPanel.innerHTML = content;
    }

    /**
     * Génère l'interface des propriétés de section
     * 
     * Rôle : Création de l'UI de modification de section
     * Type : Factory d'interface utilisateur
     * Paramètre : section - Données de section
     * Retour : string - HTML de l'interface
     */
    generateSectionPropertiesUI(section) {
        return `
            <div class="properties-section">
                <h4>Propriétés de Section</h4>
                
                <div class="property-group">
                    <label for="section-name">Nom de la section</label>
                    <input type="text" id="section-name" value="${section.name || ''}" 
                           class="form-input" data-property="name">
                </div>
                
                <div class="property-group">
                    <label for="section-type">Type</label>
                    <select id="section-type" class="form-select" data-property="type">
                        <option value="hero" ${section.type === 'hero' ? 'selected' : ''}>Hero</option>
                        <option value="pricing" ${section.type === 'pricing' ? 'selected' : ''}>Tarification</option>
                        <option value="advantages" ${section.type === 'advantages' ? 'selected' : ''}>Avantages</option>
                        <option value="contact" ${section.type === 'contact' ? 'selected' : ''}>Contact</option>
                        <option value="generic" ${section.type === 'generic' ? 'selected' : ''}>Générique</option>
                    </select>
                </div>
                
                <div class="property-group">
                    <label>Actions</label>
                    <div class="property-actions">
                        <button class="btn btn-sm" data-action="duplicate-section">
                            <i class="fas fa-copy"></i> Dupliquer
                        </button>
                        <button class="btn btn-sm btn-danger" data-action="delete-section">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Génère l'interface des propriétés de widget
     * 
     * Rôle : Création de l'UI de modification de widget
     * Type : Factory d'interface utilisateur
     * Paramètre : widget - Données de widget
     * Retour : string - HTML de l'interface
     */
    generateWidgetPropertiesUI(widget) {
        return `
            <div class="properties-widget">
                <h4>Propriétés de Widget</h4>
                
                <div class="property-group">
                    <label>Type: ${widget.type}</label>
                </div>
                
                <div class="property-group">
                    <label for="widget-content">Contenu</label>
                    <textarea id="widget-content" class="form-textarea" data-property="content">${widget.data?.text || ''}</textarea>
                </div>
                
                <div class="property-actions">
                    <button class="btn btn-sm" data-action="edit-widget">
                        <i class="fas fa-edit"></i> Éditer
                    </button>
                    <button class="btn btn-sm btn-danger" data-action="delete-widget">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Configure les gestionnaires d'événements des propriétés
     * 
     * Rôle : Liaison des contrôles avec les actions
     * Type : Méthode de configuration d'événements
     * Paramètres : panel - Panneau DOM, selectedElement - Élément sélectionné
     * Effet de bord : Configure les événements des contrôles
     */
    setupPropertiesEventHandlers(panel, selectedElement) {
        // Événements pour les champs de propriétés
        const propertyInputs = panel.querySelectorAll('[data-property]');
        propertyInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const property = e.target.dataset.property;
                const value = e.target.value;
                this.updateElementProperty(selectedElement, property, value);
            });
        });

        // Événements pour les boutons d'actions
        const actionButtons = panel.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executePropertyAction(action, selectedElement);
            });
        });
    }

    /**
     * Met à jour une propriété d'un élément
     * 
     * Rôle : Application de modification de propriété
     * Type : Méthode de mutation de données
     * Paramètres : element - Élément cible, property - Propriété, value - Nouvelle valeur
     * Effet de bord : Modifie l'élément et rafraîchit l'interface
     */
    updateElementProperty(element, property, value) {
        try {
            // Sauvegarde de l'état pour l'historique
            const currentPresentation = this.engine.getCurrentPresentation();
            if (currentPresentation) {
                this.engine.historyManager.saveState(currentPresentation, `Modification ${property}`);
            }

            // Application de la modification
            if (element.data[property] !== undefined) {
                element.data[property] = value;
            } else {
                element.data = { ...element.data, [property]: value };
            }

            // Rafraîchissement de l'interface
            this.refreshEditor();
            
            // Synchronisation temps réel
            if (currentPresentation) {
                this.engine.syncManager.syncPresentation(currentPresentation, 'update-property');
            }

            console.log(`🔧 Propriété ${property} mise à jour: ${value}`);

        } catch (error) {
            console.error('❌ Erreur mise à jour propriété:', error);
            this.showError(`Erreur lors de la mise à jour: ${error.message}`);
        }
    }

    /**
     * Exécute une action depuis le panneau propriétés
     * 
     * Rôle : Traitement des actions du panneau propriétés
     * Type : Méthode de dispatch d'actions
     * Paramètres : action - Action à exécuter, element - Élément cible
     * Effet de bord : Exécute l'action correspondante
     */
    executePropertyAction(action, element) {
        switch (action) {
            case 'duplicate-section':
                if (element.type === 'section') {
                    this.duplicateSection(element.data);
                }
                break;
            case 'delete-section':
                if (element.type === 'section') {
                    this.deleteSection(element.data);
                }
                break;
            case 'edit-widget':
                if (element.type === 'widget') {
                    this.editWidget(element.data);
                }
                break;
            case 'delete-widget':
                if (element.type === 'widget') {
                    this.deleteWidget(element.data);
                }
                break;
            default:
                console.warn(`Action inconnue: ${action}`);
        }
    }

    /**
     * Formate un timestamp pour l'affichage dans l'historique
     * 
     * Rôle : Conversion de timestamp en format lisible
     * Type : Utilitaire de formatage
     * Paramètre : timestamp - Timestamp ISO
     * Retour : string - Temps formaté
     */
    formatHistoryTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes < 1) return 'À l\'instant';
        if (diffMinutes === 1) return 'Il y a 1 minute';
        if (diffMinutes < 60) return `Il y a ${diffMinutes} minutes`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours === 1) return 'Il y a 1 heure';
        if (diffHours < 24) return `Il y a ${diffHours} heures`;
        
        return date.toLocaleDateString('fr-FR');
    }

    /**
     * Ajoute un widget à la présentation courante
     * 
     * Rôle : Ajout d'un widget à la section sélectionnée
     * Type : Méthode de manipulation de données
     * Paramètre : widgetType - Type de widget à ajouter
     * Effet de bord : Ajoute le widget et rafraîchit l'interface
     */
    async addWidgetToPresentation(widgetType) {
        try {
            const currentPresentation = this.engine.getCurrentPresentation();
            if (!currentPresentation) {
                this.showError('Aucune présentation chargée');
                return;
            }

            // Vérification qu'une section est sélectionnée ou création d'une section par défaut
            let targetSection = this.getSelectedSection();
            
            if (!targetSection && currentPresentation.sections.length === 0) {
                // Création d'une section par défaut si aucune n'existe
                targetSection = await this.engine.sectionManager.createSection('generic', {
                    name: 'Section par défaut'
                });
                currentPresentation.sections.push(targetSection);
            } else if (!targetSection) {
                // Utiliser la dernière section si aucune sélection
                targetSection = currentPresentation.sections[currentPresentation.sections.length - 1];
            }

            // Sauvegarde de l'état pour l'historique
            this.engine.historyManager.saveState(currentPresentation, `Avant ajout widget ${widgetType}`);

            // Création du widget
            const widget = this.engine.widgetManager.createWidget(widgetType);
            
            if (!targetSection.widgets) {
                targetSection.widgets = [];
            }
            
            // Ajout du widget à la section
            targetSection.widgets.push(widget);

            // Rafraîchissement de l'interface
            await this.renderPresentationSections(currentPresentation.sections);
            
            // Sélection du nouveau widget
            const widgetElement = document.querySelector(`[data-widget-id="${widget.id}"]`);
            if (widgetElement) {
                this.selectElement(widgetElement, 'widget', widget);
            }

            // Notifications et synchronisation
            this.showSuccess(`Widget ${widgetType} ajouté avec succès`);
            this.engine.syncManager.syncPresentation(currentPresentation, 'add-widget');

            console.log(`✅ Widget ${widgetType} ajouté à la section ${targetSection.name}`);

        } catch (error) {
            console.error('❌ Erreur ajout widget:', error);
            this.showError(`Erreur lors de l'ajout du widget: ${error.message}`);
        }
    }

    /**
     * Ajoute une section à la présentation courante
     * 
     * Rôle : Ajout d'une nouvelle section à la présentation
     * Type : Méthode de manipulation de données
     * Paramètre : sectionType - Type de section à ajouter
     * Effet de bord : Ajoute la section et rafraîchit l'interface
     */
    async addSectionToPresentation(sectionType) {
        try {
            const currentPresentation = this.engine.getCurrentPresentation();
            if (!currentPresentation) {
                this.showError('Aucune présentation chargée');
                return;
            }

            console.log(`➕ Ajout section type: ${sectionType}`);

            // Sauvegarde de l'état pour l'historique
            this.engine.historyManager.saveState(currentPresentation, `Avant ajout section ${sectionType}`);

            // Création de la section
            const newSection = await this.engine.sectionManager.createSection(sectionType);
            
            // Détermination de la position d'insertion
            let insertPosition = currentPresentation.sections.length;
            
            if (this.uiState.selectedElement && this.uiState.selectedElement.type === 'section') {
                // Insertion après la section sélectionnée
                const selectedIndex = currentPresentation.sections.findIndex(s => 
                    s.id === this.uiState.selectedElement.data.id
                );
                if (selectedIndex > -1) {
                    insertPosition = selectedIndex + 1;
                }
            }

            // Insertion de la section
            currentPresentation.sections.splice(insertPosition, 0, newSection);

            // Rafraîchissement de l'interface
            await this.renderPresentationSections(currentPresentation.sections);

            // Sélection de la nouvelle section
            const sectionElement = document.querySelector(`[data-section-id="${newSection.id}"]`);
            if (sectionElement) {
                this.selectElement(sectionElement, 'section', newSection);
                
                // Scroll vers la nouvelle section
                sectionElement.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }

            // Notifications et synchronisation
            this.showSuccess(`Section ${newSection.name} ajoutée avec succès`);
            this.engine.syncManager.syncPresentation(currentPresentation, 'add-section');

            console.log(`✅ Section ${sectionType} ajoutée à la position ${insertPosition}`);

        } catch (error) {
            console.error('❌ Erreur ajout section:', error);
            this.showError(`Erreur lors de l'ajout de la section: ${error.message}`);
        }
    }

    /**
     * Retourne la section actuellement sélectionnée
     * 
     * Rôle : Récupération de la section en cours de sélection
     * Type : Méthode utilitaire
     * Retour : Object|null - Section sélectionnée ou null
     */
    getSelectedSection() {
        if (this.uiState.selectedElement && this.uiState.selectedElement.type === 'section') {
            return this.uiState.selectedElement.data;
        }
        return null;
    }

    /**
     * Méthodes placeholders pour actions de widgets
     * 
     * Rôle : Actions de gestion de widgets depuis le panneau propriétés
     * Type : Méthodes d'action utilisateur
     * Effet de bord : Modifie les widgets et l'interface
     */
    editWidget(widget) {
        console.log('✏️ Édition widget:', widget.id);
        this.showInfo('Éditeur de widget en cours de développement');
    }

    deleteWidget(widget) {
        console.log('🗑️ Suppression widget:', widget.id);
        this.showInfo('Suppression de widget en cours de développement');
    }

    showHelp() {
        console.log('❓ Aide demandée');
        this.showInfo('Système d\'aide en cours de développement');
    }

    // ================================================
    // MÉTHODES DE DRAG & DROP ET GESTION D'ÉVÉNEMENTS
    // ================================================

    /**
     * Gère le début du glisser-déposer pour un widget
     * 
     * Rôle : Initialisation du drag & drop depuis la liste des widgets
     * Type : Méthode de gestion d'événements
     * Paramètre : event - Événement dragstart
     * Effet de bord : Configure les données de transfert pour le drag
     */
    handleWidgetDragStart(event) {
        try {
            // Récupération du type de widget depuis l'élément
            const widgetType = event.target.dataset.widgetType || 
                             event.target.closest('[data-widget-type]')?.dataset.widgetType;
            
            if (!widgetType) {
                console.error('❌ Type de widget non trouvé pour le drag');
                event.preventDefault();
                return;
            }

            // Configuration des données de transfert
            const dragData = {
                type: 'widget',
                widgetType: widgetType,
                source: 'sidebar'
            };

            // Stockage des données pour le drop
            event.dataTransfer.setData('application/json', JSON.stringify(dragData));
            event.dataTransfer.effectAllowed = 'copy';

            // Indication visuelle de drag en cours
            event.target.classList.add('dragging');
            
            console.log(`🎯 Début drag widget: ${widgetType}`);

        } catch (error) {
            console.error('❌ Erreur début drag widget:', error);
            event.preventDefault();
        }
    }

    /**
     * Gère la fin du glisser-déposer pour un widget
     * 
     * Rôle : Nettoyage après la fin du drag & drop
     * Type : Méthode de gestion d'événements  
     * Paramètre : event - Événement dragend
     * Effet de bord : Supprime les classes visuelles de drag
     */
    handleWidgetDragEnd(event) {
        try {
            // Suppression des classes visuelles
            event.target.classList.remove('dragging');
            
            // Suppression des indicateurs de drop sur le canvas
            const dropIndicators = document.querySelectorAll('.drop-indicator, .drop-target-active');
            dropIndicators.forEach(indicator => {
                indicator.classList.remove('drop-indicator', 'drop-target-active');
            });

            console.log('🎯 Fin drag widget');

        } catch (error) {
            console.error('❌ Erreur fin drag widget:', error);
        }
    }

    /**
     * Gère le drop sur le canvas principal
     * 
     * Rôle : Traitement du dépôt d'éléments sur la zone de travail
     * Type : Méthode de gestion d'événements
     * Paramètre : event - Événement drop
     * Effet de bord : Ajoute l'élément droppé à la présentation
     */
    handleDropToCanvas(event) {
        try {
            event.preventDefault();
            event.stopPropagation();

            // Récupération des données de transfert
            const rawData = event.dataTransfer.getData('application/json');
            if (!rawData) {
                console.warn('⚠️ Aucune donnée de drag trouvée');
                return;
            }

            const dragData = JSON.parse(rawData);
            console.log('📥 Drop sur canvas:', dragData);

            // Traitement selon le type d'élément
            if (dragData.type === 'widget') {
                this.addWidgetToPresentation(dragData.widgetType);
                this.showSuccess(`Widget ${dragData.widgetType} ajouté avec succès`);
            } else if (dragData.type === 'section') {
                this.addSectionToPresentation(dragData.sectionType);
                this.showSuccess(`Section ${dragData.sectionType} ajoutée avec succès`);
            }

            // Suppression des indicateurs visuels
            event.target.classList.remove('drop-target-active', 'drop-indicator');

        } catch (error) {
            console.error('❌ Erreur drop sur canvas:', error);
            this.showError(`Erreur lors du drop: ${error.message}`);
        }
    }

    /**
     * Gère les clics sur le canvas
     * 
     * Rôle : Gestion de la sélection et des interactions avec le canvas
     * Type : Méthode de gestion d'événements
     * Paramètre : event - Événement click
     * Effet de bord : Gère la sélection des éléments ou désélectionne
     */
    handleCanvasClick(event) {
        try {
            // Éviter de traiter les clics sur les contrôles
            if (event.target.closest('.section-controls, .widget-controls, .btn, button')) {
                return;
            }

            // Vérification si clic sur un élément sélectionnable
            const sectionElement = event.target.closest('[data-section-id]');
            const widgetElement = event.target.closest('[data-widget-id]');

            if (sectionElement) {
                // Sélection d'une section
                const sectionId = sectionElement.dataset.sectionId;
                const currentPresentation = this.engine.getCurrentPresentation();
                
                if (currentPresentation) {
                    const section = currentPresentation.sections.find(s => s.id === sectionId);
                    if (section) {
                        this.selectElement(sectionElement, 'section', section);
                        console.log(`🎯 Section sélectionnée: ${section.name || section.id}`);
                    }
                }
            } else if (widgetElement) {
                // Sélection d'un widget
                const widgetId = widgetElement.dataset.widgetId;
                // TODO: Implémenter la sélection de widget
                console.log(`🎯 Widget cliqué: ${widgetId}`);
            } else {
                // Clic dans le vide = désélection
                this.clearSelection();
                console.log('🔄 Sélection effacée');
            }

        } catch (error) {
            console.error('❌ Erreur clic canvas:', error);
        }
    }

    /**
     * Gère le survol pendant le drag (dragover)
     * 
     * Rôle : Indication visuelle des zones de drop valides
     * Type : Méthode de gestion d'événements
     * Paramètre : event - Événement dragover
     * Effet de bord : Affiche les indicateurs visuels de drop
     */
    handleDragOver(event) {
        try {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';

            // Ajout d'indicateur visuel
            const dropTarget = event.currentTarget;
            if (!dropTarget.classList.contains('drop-target-active')) {
                dropTarget.classList.add('drop-target-active');
            }

        } catch (error) {
            console.error('❌ Erreur dragover:', error);
        }
    }

    /**
     * Gère la sortie du drag (dragleave)
     * 
     * Rôle : Suppression des indicateurs visuels de drop
     * Type : Méthode de gestion d'événements
     * Paramètre : event - Événement dragleave
     * Effet de bord : Supprime les indicateurs visuels
     */
    handleDragLeave(event) {
        try {
            // Vérification que la souris quitte réellement l'élément
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                event.currentTarget.classList.remove('drop-target-active');
            }

        } catch (error) {
            console.error('❌ Erreur dragleave:', error);
        }
    }

    /**
     * Active ou désactive le mode prévisualisation
     * 
     * Rôle : Basculement entre mode édition et prévisualisation
     * Type : Méthode de changement d'état
     * Effet de bord : Modifie l'interface selon le mode
     */
    togglePreviewMode() {
        const newMode = this.uiState.viewMode === 'edit' ? 'preview' : 'edit';
        this.setViewMode(newMode);
    }

    /**
     * Affiche une notification d'information
     * 
     * Rôle : Notification utilisateur non-critique
     * Type : Méthode de notification
     * Paramètre : message - Message à afficher
     * Effet de bord : Affiche un toast d'information
     */
    showInfo(message) {
        this.showToast(message, 'info');
    }

    /**
     * Affiche une notification d'avertissement
     * 
     * Rôle : Notification utilisateur d'avertissement
     * Type : Méthode de notification  
     * Paramètre : message - Message d'avertissement
     * Effet de bord : Affiche un toast d'avertissement
     */
    showWarning(message) {
        this.showToast(message, 'warning');
    }
}

/**
 * Export de la classe MainEditor pour utilisation globale
 * 
 * Rôle : Module d'édition principal pour les présentations
 * Type : Classe d'orchestration UI
 * Usage : Coordinateur entre l'interface utilisateur et le moteur de présentation
 */
// Rendre la classe disponible globalement
if (typeof window !== 'undefined') {
    window.MainEditor = MainEditor;
}
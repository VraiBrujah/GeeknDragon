/**
 * 🎯 EDITOR.JS - ÉDITEUR ATOMIQUE SIMPLIFIÉ
 * 
 * Rôle : Chef d'orchestre de l'éditeur avec architecture atomique
 * Type : Classe principale gérant les widgets universels (WidgetCanvas, etc.)
 * Unité : Éditeur = interface + grille + widgets atomiques
 * Domaine : Widgets atomiques réutilisables et composables
 * Formule : Editor = UI + Grid + WidgetFactory + Persistence
 * Exemple : Editor gère WidgetCanvas et futurs widgets via BaseWidget
 */

// Namespace global pour éviter conflits
window.WidgetEditor = window.WidgetEditor || {};

/**
 * Classe principale Editor - Chef d'orchestre de l'application
 * Gère l'initialisation, la coordination des modules et l'état global
 */
window.WidgetEditor.Editor = class Editor {
    /**
     * Constructeur de l'éditeur atomique simplifié
     * 
     * Rôle : Initialisation éditeur avec architecture atomique
     * Type : Constructeur principal gérant état global
     * Unité : Instance éditeur opérationnelle
     * Domaine : Configuration valide et modules requis
     * Formule : new Editor() → état initialisé + modules + interface
     * Exemple : Editor gère widgets atomiques via factory pattern
     */
    constructor() {
        // === ÉTAT GLOBAL SIMPLIFIÉ ===
        // État : Configuration centrale de l'éditeur atomique
        // Type : Object avec propriétés d'état essentielles
        // Unité : État cohérent et minimal
        // Domaine : Propriétés requises pour fonctionnement
        // Formule : state = project + widgets + interface + config
        // Exemple : État permet gestion centralisée de tous les widgets
        this.state = {
            // === PROJET ACTUEL ===
            // Nom du projet : Identifiant utilisateur du projet
            // Type : string
            // Exemple : "Ma Présentation Marketing"
            projectName: 'Mon Projet Marketing',
            projectId: this.generateProjectId(),
            
            // === INTERFACE UTILISATEUR ===
            // Initialisation : État de l'initialisation système
            isInitialized: false,
            // Widget sélectionné : Référence au widget actuel
            selectedWidget: null,
            // Compteur widgets : Pour génération IDs uniques
            widgetCounter: 0,
            
            // === MODULES CORE SIMPLIFIÉS ===
            // Grid uniquement : Canvas de fond infini (pas WidgetCanvas)
            grid: null,
            // DragDrop : Système glisser-déposer réutilisé
            dragDrop: null,
            // Persistence : Sauvegarde/restauration simplifiée
            persistence: null,
            
            // === COLLECTION WIDGETS ATOMIQUES ===
            // Widgets : Map des widgets actifs (WidgetCanvas, etc.)
            // Type : Map<string, BaseWidget>
            // Unité : Collection de widgets atomiques
            // Domaine : Widgets héritant de BaseWidget
            // Formule : Map permet O(1) access + enumération
            widgets: new Map(),
            
            // === CONFIGURATION SIMPLIFIÉE ===
            config: {
                gridSnapSize: 10,         // Accrochage grille
                currentZoom: 1,           // Zoom actuel
                autoSaveInterval: 30000   // Sauvegarde auto (30s)
            }
        };
        
        // Éléments DOM cachés pour performance
        this.elements = {};
        
        // Initialisation automatique
        this.init();
        
        // Message de debug pour développement
        console.log('🎯 Editor principal initialisé - Phase 1');
    }
    
    /**
     * Initialisation complète de l'éditeur
     * Méthode principale appelée au démarrage
     */
    async init() {
        try {
            // Étape 1 : Cache des éléments DOM
            this.cacheElements();
            
            // Étape 2 : Initialisation des modules core
            await this.initializeModules();
            
            // Étape 3 : Configuration des événements
            this.setupEventListeners();
            
            // Étape 4 : Interface utilisateur
            this.initializeInterface();
            
            // Étape 5 : Chargement état précédent
            await this.loadPreviousState();
            
            // Étape 6 : Vérification nom projet (pop-up si besoin)
            await this.checkProjectName();
            
            // Étape 7 : Marquage comme initialisé
            this.state.isInitialized = true;
            
            // Notification interface prête
            this.updateStatus('Éditeur prêt', 'success');
            this.debugLog('Initialisation complète réussie');
            
        } catch (error) {
            console.error('❌ Erreur initialisation éditeur:', error);
            this.updateStatus('Erreur initialisation', 'error');
            throw error;
        }
    }
    
    /**
     * Cache les éléments DOM fréquemment utilisés
     * Optimisation performance - évite les querySelector répétés
     */
    cacheElements() {
        // Conteneurs principaux
        this.elements.container = document.getElementById('editor-container');
        this.elements.canvas = document.getElementById('editor-canvas');
        this.elements.grid = document.getElementById('infinite-grid');
        this.elements.dropZone = document.getElementById('main-drop-zone');
        
        // Panneaux interface
        this.elements.widgetsPanel = document.getElementById('widgets-panel');
        this.elements.propertiesPanel = document.getElementById('properties-panel');
        this.elements.hierarchyPanel = document.getElementById('hierarchy-panel');
        
        // Controls header
        this.elements.projectName = document.getElementById('project-name');
        this.elements.saveStatus = document.getElementById('save-status');
        this.elements.btnUndo = document.getElementById('btn-undo');
        this.elements.btnRedo = document.getElementById('btn-redo');
        this.elements.btnPreview = document.getElementById('btn-preview');
        this.elements.btnExport = document.getElementById('btn-export');
        
        // Canvas tools
        this.elements.zoomLevel = document.getElementById('zoom-level');
        this.elements.btnZoomIn = document.getElementById('btn-zoom-in');
        this.elements.btnZoomOut = document.getElementById('btn-zoom-out');
        this.elements.btnZoomFit = document.getElementById('btn-zoom-fit');
        
        // Status footer
        this.elements.syncStatus = document.getElementById('sync-status');
        this.elements.storageUsage = document.getElementById('storage-usage');
        this.elements.historyCount = document.getElementById('history-count');
        
        this.debugLog('Éléments DOM cachés');
    }
    
    /**
     * Initialisation des modules core de l'éditeur
     * Création des instances et configuration de base
     */
    async initializeModules() {
        try {
            // Module Grid - Grille infinie avec navigation
            this.state.grid = new window.WidgetEditor.Grid(this);
            
            // Module DragDrop - Glisser-déposer avancé
            this.state.dragDrop = new window.WidgetEditor.DragDrop(this);
            
            // Module Persistence - Sauvegarde et historique
            this.state.persistence = new window.WidgetEditor.Persistence(this);
            
            // Module Sync - Synchronisation temps réel
            this.state.sync = new window.WidgetEditor.Sync(this);
            
            // Module Viewer - Génération HTML standalone (TODO: Créer module)
            // this.state.viewer = new window.WidgetEditor.Viewer(this);
            
            // Initialisation séquentielle des modules
            await this.state.grid.init();
            await this.state.dragDrop.init();
            await this.state.persistence.init();
            await this.state.sync.init();
            // Note: Viewer n'a pas besoin d'init async
            
            this.debugLog('Modules core initialisés');
            
        } catch (error) {
            console.error('❌ Erreur initialisation modules:', error);
            throw error;
        }
    }
    
    /**
     * Configuration de tous les événements de l'interface
     * Gestion centralisée des interactions utilisateur
     */
    setupEventListeners() {
        // Nom projet éditable
        this.elements.projectName?.addEventListener('input', (e) => {
            this.state.projectName = e.target.value;
            this.saveState();
            // Auto-génération viewer synchronisé
            this.updateViewerIfOpen();
        });
        
        // Actions header
        this.elements.btnUndo?.addEventListener('click', () => {
            this.state.persistence.undo();
        });
        
        this.elements.btnRedo?.addEventListener('click', () => {
            this.state.persistence.redo();
        });
        
        this.elements.btnPreview?.addEventListener('click', () => {
            this.openViewer();
        });
        
        this.elements.btnExport?.addEventListener('click', () => {
            this.exportProject();
        });
        
        // Controls zoom
        this.elements.btnZoomIn?.addEventListener('click', () => {
            this.zoomIn();
        });
        
        this.elements.btnZoomOut?.addEventListener('click', () => {
            this.zoomOut();
        });
        
        this.elements.btnZoomFit?.addEventListener('click', () => {
            this.zoomFit();
        });
        
        // Toggle accrochage grille
        const btnGridSnap = document.getElementById('btn-grid-snap');
        btnGridSnap?.addEventListener('click', () => {
            if (this.state.grid) {
                this.state.grid.toggleSnap();
            }
        });
        
        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
        
        // Double-clic sur drop zone = création WidgetCanvas
        this.elements.dropZone?.addEventListener('dblclick', (e) => {
            this.createWidgetCanvas(e.clientX, e.clientY);
        });
        
        // Recherche widgets
        const searchInput = document.getElementById('widgets-search');
        searchInput?.addEventListener('input', (e) => {
            this.filterWidgets(e.target.value);
        });
        
        // Toggles panneaux
        this.setupPanelToggles();
        
        this.debugLog('Événements configurés');
    }
    
    /**
     * Configuration des toggles pour masquer/afficher les panneaux
     * Interface modulaire personnalisable
     */
    setupPanelToggles() {
        // Toggle widgets panel
        const toggleWidgets = document.getElementById('btn-toggle-widgets');
        toggleWidgets?.addEventListener('click', () => {
            this.togglePanel('widgetsPanel');
        });
        
        // Toggle properties panel
        const toggleProperties = document.getElementById('btn-toggle-properties');
        toggleProperties?.addEventListener('click', () => {
            this.togglePanel('propertiesPanel');
        });
        
        // Toggle hierarchy panel
        const toggleHierarchy = document.getElementById('btn-toggle-hierarchy');
        toggleHierarchy?.addEventListener('click', () => {
            this.togglePanel('hierarchyPanel');
        });
    }
    
    /**
     * Initialisation de l'interface utilisateur
     * Configuration visuelle et états par défaut
     */
    initializeInterface() {
        // Mise à jour nom projet dans l'interface
        if (this.elements.projectName) {
            this.elements.projectName.value = this.state.projectName;
        }
        
        // Mise à jour niveau de zoom
        this.updateZoomDisplay();
        
        // Configuration widgets disponibles
        this.setupWidgetsList();
        
        // État initial des panneaux
        this.updatePanelsVisibility();
        
        // Message bienvenue dans drop zone
        this.setupDropZone();
        
        // Ajout bouton "Nouveau Projet" moderne
        this.addNewProjectButton();
        
        this.debugLog('Interface initialisée');
    }
    
    /**
     * Configuration de la liste des widgets disponibles
     * Architecture Atomique : WidgetCanvas universel uniquement
     */
    setupWidgetsList() {
        const widgetsList = document.getElementById('widgets-list');
        if (!widgetsList) return;
        
        // Les widgets sont déjà définis dans le HTML
        // Configuration des événements drag pour chaque widget
        const widgetItems = widgetsList.querySelectorAll('.widget-item');
        
        widgetItems.forEach(item => {
            // Événements drag native HTML5
            item.addEventListener('dragstart', (e) => {
                const widgetType = item.dataset.widgetType;
                this.state.dragDrop.startWidgetDrag(e, widgetType);
            });
            
            item.addEventListener('dragend', (e) => {
                this.state.dragDrop.endWidgetDrag(e);
            });
        });
    }
    
    /**
     * Configuration de la zone de drop principale
     * Zone d'accueil pour premier widget
     */
    setupDropZone() {
        if (!this.elements.dropZone) return;
        
        // Événements drop pour création widgets
        this.elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.add('drag-over');
        });
        
        this.elements.dropZone.addEventListener('dragleave', () => {
            this.elements.dropZone.classList.remove('drag-over');
        });
        
        this.elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.remove('drag-over');
            
            const widgetType = e.dataTransfer.getData('text/widget-type');
            if (widgetType) {
                this.createWidget(widgetType, e.clientX, e.clientY);
            }
        });
    }
    
    /**
     * Gestion des raccourcis clavier
     * Navigation et actions rapides
     */
    handleKeyboardShortcuts(event) {
        // Ctrl+Z : Undo
        if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
            event.preventDefault();
            this.state.persistence.undo();
        }
        
        // Ctrl+Y ou Ctrl+Shift+Z : Redo
        if ((event.ctrlKey && event.key === 'y') || 
            (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
            event.preventDefault();
            this.state.persistence.redo();
        }
        
        // Ctrl+S : Sauvegarde manuelle
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveState();
            this.updateStatus('Sauvegarde manuelle', 'success');
        }
        
        // Échap : Désélectionner
        if (event.key === 'Escape') {
            this.deselectWidget();
        }
        
        // Suppr : Supprimer widget sélectionné
        if (event.key === 'Delete' && this.state.selectedWidget) {
            this.deleteSelectedWidget();
        }
    }
    
    /**
     * Factory de création de widgets atomiques
     * 
     * Rôle : Créer des widgets universels (WidgetCanvas, etc.)
     * Type : Factory pattern pour widgets héritant de BaseWidget
     * Unité : Widget atomique fonctionnel et spécialisé
     * Domaine : Types atomiques prédéfinis ('text', 'image', etc.)
     * Formule : Factory(type, pos, options) → WidgetSpecialized extends BaseWidget
     * Exemple : createWidget('canvas', 100, 50) → new WidgetCanvas()
     * 
     * @param {string} widgetType - Type atomique ('text', 'image', etc.)
     * @param {number} x - Position X en pixels
     * @param {number} y - Position Y en pixels
     * @param {Object} options - Options spécifiques au type
     */
    createWidget(widgetType, x, y, options = {}) {
        try {
            const widgetId = this.generateWidgetId();
            
            // === CONVERSION COORDONNÉES GRILLE ===
            // Position : Conversion écran vers coordonnées grille si nécessaire
            let gridPos = { x: x, y: y };
            if (this.state.grid && this.state.grid.screenToGrid) {
                gridPos = this.state.grid.screenToGrid(x, y);
            }
            
            // === ACCROCHAGE GRILLE ===
            if (this.state.grid && this.state.grid.snapToGrid) {
                gridPos = this.state.grid.snapToGrid(gridPos.x, gridPos.y);
            }
            
            // === FACTORY PATTERN ATOMIQUE ===
            let widget = null;
            const baseOptions = {
                x: gridPos.x,
                y: gridPos.y,
                ...options
            };
            
            switch (widgetType.toLowerCase()) {
                case 'canvas':
                case 'widgetcanvas':
                case 'canevas':
                    // === CRÉATION WIDGETCANVAS ===
                    // WidgetCanvas : Widget universel pour tout type de contenu (texte, images, widgets imbriqués)
                    if (window.WidgetEditor.WidgetCanvas) {
                        const canvasOptions = {
                            content: baseOptions.content || 'Nouveau contenu - Double-cliquez pour éditer',
                            isMarkdown: baseOptions.isMarkdown !== false,
                            fontSize: baseOptions.fontSize || 16,
                            color: baseOptions.color || '#0F172A',
                            width: baseOptions.width || 300,
                            ...baseOptions
                        };
                        widget = new window.WidgetEditor.WidgetCanvas(this, widgetId, canvasOptions);
                    } else {
                        console.error('WidgetCanvas non disponible - chargez WidgetCanvas.js');
                        return null;
                    }
                    break;
                
                // === WIDGETS ATOMIQUES FUTURS ===
                // case 'image':
                //     widget = new window.WidgetEditor.WidgetImage(this, widgetId, baseOptions);
                //     break;
                // case 'button':
                //     widget = new window.WidgetEditor.WidgetButton(this, widgetId, baseOptions);
                //     break;
                    
                default:
                    console.warn(`Type de widget non reconnu: ${widgetType}`);
                    // Fallback : Créer WidgetCanvas par défaut
                    if (window.WidgetEditor.WidgetCanvas) {
                        const fallbackOptions = {
                            content: `Widget créé depuis type: ${widgetType}\nDouble-cliquez pour éditer`,
                            ...baseOptions
                        };
                        widget = new window.WidgetEditor.WidgetCanvas(this, widgetId, fallbackOptions);
                    } else {
                        throw new Error('Aucun widget disponible');
                    }
            }
            
            if (!widget) {
                throw new Error(`Impossible de créer widget type: ${widgetType}`);
            }
            
            // === INTÉGRATION À L'ÉDITEUR ===
            // Collection : Ajout à la Map des widgets actifs
            this.state.widgets.set(widgetId, widget);
            
            // Rendu : Affichage dans la grille de fond
            if (this.elements.grid) {
                widget.render(this.elements.grid);
            }
            
            // Sélection automatique du nouveau widget
            this.selectWidget(widget);
            
            // === PERSISTANCE ET INTERFACE ===
            this.saveState();
            this.updateStorageUsage();
            this.updateHierarchyPanel();
            
            this.debugLog(`Widget atomique créé: ${widgetType} (${widgetId}) à (${gridPos.x}, ${gridPos.y})`);
            
            return widget;
            
        } catch (error) {
            console.error('❌ Erreur création widget atomique:', error);
            this.updateStatus(`Erreur création widget: ${error.message}`, 'error');
            return null;
        }
    }
    
    /**
     * Création rapide d'un WidgetCanvas (double-clic sur grille)
     * 
     * Rôle : Shortcut pour création rapide de widget universel
     * Type : Méthode de convenance pour interaction utilisateur
     * Unité : WidgetCanvas créé et opérationnel
     * Domaine : Position valide dans la grille
     * Formule : createWidgetCanvas = createWidget('canvas', x, y)
     * Exemple : Double-clic grille → nouveau WidgetCanvas à la position
     * 
     * @param {number} x - Position X en pixels
     * @param {number} y - Position Y en pixels
     */
    createWidgetCanvas(x, y) {
        return this.createWidget('canvas', x, y, {
            content: 'Nouveau contenu\nDouble-cliquez pour éditer',
            isMarkdown: true
        });
    }
    
    /**
     * Création widget depuis la grille de fond (API Grid.js)
     * 
     * Rôle : Interface pour le module Grid lors de drop/double-clic
     * Type : Méthode d'interface pour module Grid
     * Unité : Widget créé aux coordonnées grille
     * Domaine : Coordonnées grille valides
     * Formule : Grid coordinates → createWidget
     * Exemple : Grid détecte double-clic → createWidgetOnGrid('text', x, y)
     * 
     * @param {string} widgetType - Type de widget atomique
     * @param {number} gridX - Position X dans la grille
     * @param {number} gridY - Position Y dans la grille
     */
    createWidgetOnGrid(widgetType, gridX, gridY) {
        // Les coordonnées sont déjà en système grille
        return this.createWidget(widgetType, gridX, gridY);
    }
    
    /**
     * Sélection d'un widget
     * Mise à jour interface et propriétés
     */
    selectWidget(widget) {
        // Désélection précédente
        if (this.state.selectedWidget) {
            this.state.selectedWidget.setSelected(false);
        }
        
        // Nouvelle sélection
        this.state.selectedWidget = widget;
        widget.setSelected(true);
        
        // Mise à jour panel propriétés
        this.updatePropertiesPanel(widget);
        
        // Mise à jour hiérarchie
        this.updateHierarchyPanel();
        
        this.debugLog(`Widget sélectionné: ${widget.getId()}`);
    }
    
    /**
     * Désélection du widget actuel
     * Nettoyage interface
     */
    deselectWidget() {
        if (this.state.selectedWidget) {
            this.state.selectedWidget.setSelected(false);
            this.state.selectedWidget = null;
        }
        
        // Reset panel propriétés
        this.showNoSelectionMessage();
        
        this.debugLog('Widget désélectionné');
    }
    
    /**
     * Suppression du widget sélectionné
     * Action irréversible avec historique
     */
    deleteSelectedWidget() {
        if (!this.state.selectedWidget) return;
        
        const widget = this.state.selectedWidget;
        const widgetId = widget.getId();
        
        // Suppression du DOM
        widget.destroy();
        
        // Suppression de la collection
        this.state.widgets.delete(widgetId);
        
        // Désélection
        this.state.selectedWidget = null;
        
        // Mise à jour interface
        this.showNoSelectionMessage();
        this.updateHierarchyPanel();
        this.updateStorageUsage();
        
        // Sauvegarde état
        this.saveState();
        
        this.debugLog(`Widget supprimé: ${widgetId}`);
    }
    
    /**
     * Mise à jour du panel propriétés selon widget sélectionné
     * Interface contextuelle dynamique
     */
    updatePropertiesPanel(widget) {
        const content = document.getElementById('properties-content');
        if (!content) return;
        
        // Génération interface propriétés spécifique au widget
        content.innerHTML = widget.generatePropertiesHTML();
        
        // Configuration événements propriétés
        widget.setupPropertiesEvents(content);
    }
    
    /**
     * Affichage message aucune sélection
     * État par défaut du panel propriétés
     */
    showNoSelectionMessage() {
        const content = document.getElementById('properties-content');
        if (!content) return;
        
        content.innerHTML = `
            <div class="no-selection">
                <i class="fas fa-mouse-pointer"></i>
                <p>Sélectionnez un widget pour afficher ses propriétés</p>
            </div>
        `;
    }
    
    /**
     * Mise à jour du panel hiérarchie
     * Arborescence style Gimp des widgets
     */
    updateHierarchyPanel() {
        const root = document.getElementById('hierarchy-root');
        if (!root) return;
        
        // Vide la hiérarchie actuelle
        root.innerHTML = '';
        
        // Reconstruction arbre avec widgets actuels
        this.state.widgets.forEach((widget) => {
            const item = this.createHierarchyItem(widget);
            root.appendChild(item);
        });
        
        this.debugLog('Hiérarchie mise à jour');
    }
    
    /**
     * Création d'un item dans l'arborescence hiérarchique
     * Structure récursive pour widgets imbriqués
     */
    createHierarchyItem(widget) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        item.dataset.widgetId = widget.getId();
        
        const isSelected = widget === this.state.selectedWidget;
        
        item.innerHTML = `
            <div class="tree-item-content ${isSelected ? 'selected' : ''}">
                <button class="tree-toggle">
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="tree-icon">
                    <i class="fas ${widget.getIcon()}"></i>
                </div>
                <span class="tree-name">${widget.getName()}</span>
                <div class="tree-actions">
                    <button class="btn-tree-action" title="Visible">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-tree-action" title="Déverrouillé">
                        <i class="fas fa-unlock"></i>
                    </button>
                </div>
            </div>
            <div class="tree-children"></div>
        `;
        
        // Événement sélection
        const content = item.querySelector('.tree-item-content');
        content.addEventListener('click', () => {
            this.selectWidget(widget);
        });
        
        return item;
    }
    
    /**
     * Gestion zoom avant
     * Navigation grille infinie
     */
    zoomIn() {
        const currentIndex = this.state.config.zoomLevels.indexOf(this.state.config.currentZoom);
        if (currentIndex < this.state.config.zoomLevels.length - 1) {
            this.state.config.currentZoom = this.state.config.zoomLevels[currentIndex + 1];
            this.applyZoom();
        }
    }
    
    /**
     * Gestion zoom arrière
     * Navigation grille infinie
     */
    zoomOut() {
        const currentIndex = this.state.config.zoomLevels.indexOf(this.state.config.currentZoom);
        if (currentIndex > 0) {
            this.state.config.currentZoom = this.state.config.zoomLevels[currentIndex - 1];
            this.applyZoom();
        }
    }
    
    /**
     * Zoom ajustement automatique
     * Affichage optimal de tous les widgets
     */
    zoomFit() {
        if (this.state.grid) {
            this.state.grid.fitToContent();
        } else {
            this.state.config.currentZoom = 1;
            this.applyZoom();
        }
    }
    
    /**
     * Application du niveau de zoom
     * Délégation au module Grid
     */
    applyZoom() {
        if (this.state.grid) {
            this.state.grid.setZoom(this.state.config.currentZoom);
        }
        this.updateZoomDisplay();
    }
    
    /**
     * Mise à jour affichage niveau zoom
     * Interface utilisateur
     */
    updateZoomDisplay() {
        if (this.elements.zoomLevel) {
            this.elements.zoomLevel.textContent = `${Math.round(this.state.config.currentZoom * 100)}%`;
        }
    }
    
    /**
     * Filtrage widgets selon recherche
     * Recherche dynamique dans la banque
     */
    filterWidgets(searchTerm) {
        const widgets = document.querySelectorAll('.widget-item');
        const term = searchTerm.toLowerCase();
        
        widgets.forEach(widget => {
            const name = widget.querySelector('.widget-name').textContent.toLowerCase();
            const desc = widget.querySelector('.widget-desc').textContent.toLowerCase();
            
            const matches = name.includes(term) || desc.includes(term);
            widget.style.display = matches ? 'flex' : 'none';
        });
    }
    
    /**
     * Toggle visibilité des panneaux
     * Interface modulaire personnalisable
     */
    togglePanel(panelName) {
        this.state.panelsState[panelName] = !this.state.panelsState[panelName];
        this.updatePanelsVisibility();
        this.saveState();
    }
    
    /**
     * Mise à jour visibilité panneaux
     * Application état interface
     */
    updatePanelsVisibility() {
        // Widgets panel
        if (this.elements.widgetsPanel) {
            this.elements.widgetsPanel.style.display = 
                this.state.panelsState.widgetsPanel ? 'flex' : 'none';
        }
        
        // Properties panel
        if (this.elements.propertiesPanel) {
            this.elements.propertiesPanel.style.display = 
                this.state.panelsState.propertiesPanel ? 'flex' : 'none';
        }
        
        // Hierarchy panel
        if (this.elements.hierarchyPanel) {
            this.elements.hierarchyPanel.style.display = 
                this.state.panelsState.hierarchyPanel ? 'flex' : 'none';
        }
    }
    
    /**
     * Ouverture du viewer synchronisé
     * Génération HTML standalone dans nouvel onglet
     */
    openViewer() {
        try {
            this.updateStatus('Génération viewer...', 'info');
            this.debugLog('Ouverture viewer demandée');
            
            // Vérification widgets présents
            if (this.state.widgets.size === 0) {
                this.updateStatus('Aucun widget à afficher', 'error');
                return;
            }
            
            // Génération et ouverture viewer
            const success = this.state.viewer.openInNewTab({
                includeCSS: true,
                includeJS: true,
                responsive: true,
                accessibility: true,
                seoOptimized: true
            });
            
            if (success) {
                this.updateStatus(`Viewer ouvert (${this.state.widgets.size} widgets)`, 'success');
                this.debugLog('Viewer HTML généré avec succès');
            } else {
                this.updateStatus('Erreur ouverture viewer', 'error');
            }
            
        } catch (error) {
            console.error('❌ Erreur ouverture viewer:', error);
            this.updateStatus('Erreur génération viewer', 'error');
        }
    }
    
    /**
     * Export complet du projet
     * Export HTML standalone téléchargeable
     */
    async exportProject() {
        try {
            this.updateStatus('Export en cours...', 'info');
            this.debugLog('Démarrage export projet');
            
            // Vérification widgets présents
            if (this.state.widgets.size === 0) {
                this.updateStatus('Aucun widget à exporter', 'error');
                return;
            }
            
            // === EXPORT HTML STANDALONE ===
            const success = await this.state.viewer.exportToFile({
                includeCSS: true,
                includeJS: true,
                minifyHTML: false,    // Plus lisible pour debug
                embedAssets: true,
                responsive: true,
                accessibility: true,
                seoOptimized: true
            });
            
            if (success) {
                this.updateStatus(`Projet exporté (${this.state.widgets.size} widgets)`, 'success');
                this.debugLog('Export HTML réussi');
                
                // === SAUVEGARDE ÉTAT PROJET ===
                this.saveState();
                
                // === STATISTIQUES EXPORT ===
                const stats = {
                    widgets: this.state.widgets.size,
                    presentations: Array.from(this.state.widgets.values())
                        .filter(w => w.config.mode === 'presentation').length,
                    timestamp: new Date().toISOString()
                };
                
                console.log('📊 Export terminé:', stats);
                
            } else {
                this.updateStatus('Erreur export HTML', 'error');
            }
            
        } catch (error) {
            console.error('❌ Erreur export:', error);
            this.updateStatus('Erreur export projet', 'error');
        }
    }
    
    /**
     * Sauvegarde état actuel
     * Persistance localStorage
     */
    saveState() {
        if (this.state.persistence) {
            this.state.persistence.save();
        }
    }
    
    /**
     * Chargement état précédent
     * Restauration depuis localStorage
     */
    async loadPreviousState() {
        if (this.state.persistence) {
            await this.state.persistence.load();
        }
    }
    
    /**
     * Mise à jour statut dans l'interface
     * Communication avec utilisateur
     */
    updateStatus(message, type = 'info') {
        if (!this.elements.saveStatus) return;
        
        const icon = type === 'success' ? 'fa-check' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle';
        
        const color = type === 'success' ? 'var(--success-green)' : 
                     type === 'error' ? 'var(--warning-red)' : 
                     'var(--accent-blue)';
        
        this.elements.saveStatus.innerHTML = `
            <i class="fas ${icon}"></i>
            <span class="save-text">${message}</span>
        `;
        
        this.elements.saveStatus.style.color = color;
        
        // Auto-reset après 3 secondes si success/error
        if (type !== 'info') {
            setTimeout(() => {
                this.updateStatus('Prêt', 'info');
            }, 3000);
        }
    }
    
    /**
     * Mise à jour usage stockage
     * Statistiques dans footer
     */
    updateStorageUsage() {
        if (this.elements.storageUsage) {
            const count = this.state.widgets.size;
            this.elements.storageUsage.textContent = `${count} widget${count > 1 ? 's' : ''}`;
        }
    }
    
    /**
     * Génération ID unique pour projet
     * Format : timestamp + random
     */
    generateProjectId() {
        return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Génération ID unique pour widget
     * Format : type + counter + timestamp
     */
    generateWidgetId() {
        return `widget_${++this.state.widgetCounter}_${Date.now()}`;
    }
    
    /**
     * Log de debug avec timestamp
     * Console formatée pour développement
     */
    debugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🔧 [${timestamp}] Editor: ${message}`);
    }
    
    /**
     * Callback notification changement widget
     * Appelée par les widgets lors de modifications
     */
    onWidgetChanged(widget) {
        // Sauvegarde automatique
        this.saveState();
        
        // Mise à jour interface si widget sélectionné
        if (widget === this.state.selectedWidget) {
            this.updatePropertiesPanel(widget);
            this.updateHierarchyPanel();
        }
        
        // Auto-génération viewer synchronisé
        this.updateViewerIfOpen();
        
        this.debugLog(`Widget modifié: ${widget.getId()}`);
    }
    
    /**
     * Vérification et demande nom projet si nécessaire
     * Pop-up au premier chargement ou projet sans nom
     */
    async checkProjectName() {
        // Vérifier si projet a déjà un nom valide
        if (this.state.projectName && 
            this.state.projectName.trim() !== '' && 
            this.state.projectName !== 'Mon Projet Marketing') {
            // Nom valide existant, continuer
            return;
        }
        
        // Vérifier si c'est la première utilisation
        const hasExistingProjects = this.hasExistingProjectsInStorage();
        
        if (!hasExistingProjects || this.isProjectNameDefault()) {
            // Afficher pop-up pour nom projet
            await this.showProjectNameModal();
        }
    }
    
    /**
     * Vérification si des projets existent en localStorage
     * @returns {boolean} - True si projets existants
     */
    hasExistingProjectsInStorage() {
        const keys = Object.keys(localStorage);
        return keys.some(key => key.startsWith('widgetEditor_project_'));
    }
    
    /**
     * Vérification si nom projet est celui par défaut
     * @returns {boolean} - True si nom par défaut
     */
    isProjectNameDefault() {
        const defaultNames = ['Mon Projet Marketing', 'Projet sans titre', ''];
        return defaultNames.includes(this.state.projectName?.trim());
    }
    
    /**
     * Affichage modal pour saisie nom projet
     * Pop-up moderne avec validation
     */
    async showProjectNameModal() {
        return new Promise((resolve) => {
            // Création modal moderne
            const modal = document.createElement('div');
            modal.className = 'project-name-modal-overlay';
            modal.innerHTML = `
                <div class="project-name-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-project-diagram"></i> Nouveau Projet</h2>
                        <p>Donnez un nom à votre projet pour générer automatiquement le viewer synchronisé</p>
                    </div>
                    
                    <div class="modal-content">
                        <div class="input-group">
                            <label for="new-project-name">Nom du projet :</label>
                            <input type="text" 
                                   id="new-project-name" 
                                   class="project-name-input-modal" 
                                   placeholder="Ex: Présentation Marketing Q1, Site Web Portfolio..."
                                   maxlength="50"
                                   autofocus>
                            <div class="input-hint">
                                <i class="fas fa-lightbulb"></i>
                                Le viewer sera automatiquement créé et synchronisé avec ce nom
                            </div>
                        </div>
                        
                        <div class="preview-info">
                            <div class="preview-box">
                                <i class="fas fa-eye"></i>
                                <strong>Viewer généré :</strong>
                                <span id="viewer-preview-name">nom-du-projet.html</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" id="btn-cancel-project">
                            <i class="fas fa-times"></i> 
                            Annuler
                        </button>
                        <button type="button" class="btn-primary" id="btn-create-project" disabled>
                            <i class="fas fa-plus-circle"></i> 
                            Créer le Projet
                        </button>
                    </div>
                </div>
            `;
            
            // Styles CSS intégrés pour le modal
            const modalStyles = document.createElement('style');
            modalStyles.textContent = `
                .project-name-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 10000; animation: modalFadeIn 0.3s ease;
                }
                @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                .project-name-modal {
                    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
                    border-radius: 16px; padding: 32px; min-width: 500px; max-width: 90vw;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 1px solid #475569; color: white;
                    animation: modalSlideIn 0.3s ease;
                }
                @keyframes modalSlideIn { 
                    from { transform: translateY(-50px); opacity: 0; } 
                    to { transform: translateY(0); opacity: 1; } 
                }
                
                .modal-header h2 { 
                    margin: 0 0 12px 0; font-size: 24px; font-weight: 700;
                    background: linear-gradient(135deg, #60a5fa, #3b82f6);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .modal-header p { margin: 0; opacity: 0.8; line-height: 1.5; }
                
                .modal-content { margin: 24px 0; }
                .input-group label { 
                    display: block; margin-bottom: 8px; font-weight: 600; 
                    color: #e2e8f0;
                }
                .project-name-input-modal { 
                    width: 100%; padding: 12px 16px; font-size: 16px;
                    background: #334155; border: 2px solid #475569; 
                    border-radius: 8px; color: white; outline: none;
                    transition: border-color 0.2s;
                }
                .project-name-input-modal:focus { border-color: #60a5fa; }
                .input-hint { 
                    margin-top: 8px; font-size: 14px; color: #94a3b8;
                    display: flex; align-items: center; gap: 8px;
                }
                
                .preview-info { margin-top: 20px; }
                .preview-box {
                    background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6;
                    border-radius: 8px; padding: 16px; display: flex;
                    align-items: center; gap: 12px; font-size: 14px;
                }
                #viewer-preview-name { 
                    color: #60a5fa; font-family: 'Monaco', monospace; 
                    font-weight: 600;
                }
                
                .modal-actions { 
                    display: flex; gap: 12px; justify-content: flex-end; 
                    margin-top: 32px; padding-top: 20px;
                    border-top: 1px solid #475569;
                }
                .btn-secondary, .btn-primary { 
                    padding: 12px 24px; border-radius: 8px; border: none;
                    font-weight: 600; cursor: pointer; display: flex;
                    align-items: center; gap: 8px; transition: all 0.2s;
                }
                .btn-secondary { 
                    background: #475569; color: white; 
                }
                .btn-secondary:hover { background: #64748b; }
                .btn-primary { 
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white; 
                }
                .btn-primary:hover:not(:disabled) { 
                    transform: translateY(-2px); 
                    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
                }
                .btn-primary:disabled { 
                    opacity: 0.5; cursor: not-allowed; transform: none;
                    box-shadow: none;
                }
            `;
            document.head.appendChild(modalStyles);
            document.body.appendChild(modal);
            
            // Éléments du modal
            const input = modal.querySelector('#new-project-name');
            const previewName = modal.querySelector('#viewer-preview-name');
            const btnCreate = modal.querySelector('#btn-create-project');
            const btnCancel = modal.querySelector('#btn-cancel-project');
            
            // Mise à jour preview en temps réel
            const updatePreview = () => {
                const name = input.value.trim();
                if (name) {
                    const fileName = name.toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .substring(0, 30);
                    previewName.textContent = fileName + '.html';
                    btnCreate.disabled = false;
                } else {
                    previewName.textContent = 'nom-du-projet.html';
                    btnCreate.disabled = true;
                }
            };
            
            // Événements
            input.addEventListener('input', updatePreview);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !btnCreate.disabled) {
                    btnCreate.click();
                }
            });
            
            btnCreate.addEventListener('click', () => {
                const projectName = input.value.trim();
                if (projectName) {
                    this.createNewProject(projectName);
                    modal.remove();
                    modalStyles.remove();
                    resolve(projectName);
                }
            });
            
            btnCancel.addEventListener('click', () => {
                // Utiliser nom par défaut
                this.state.projectName = 'Projet ' + new Date().toLocaleDateString();
                if (this.elements.projectName) {
                    this.elements.projectName.value = this.state.projectName;
                }
                modal.remove();
                modalStyles.remove();
                resolve(this.state.projectName);
            });
            
            // Focus sur l'input
            setTimeout(() => input.focus(), 100);
        });
    }
    
    /**
     * Création nouveau projet avec nom
     * Génération automatique viewer synchronisé
     * @param {string} projectName - Nom du nouveau projet
     */
    createNewProject(projectName) {
        // Sauvegarde ancien projet si widgets existants
        if (this.state.widgets.size > 0) {
            this.saveState();
        }
        
        // Nouveau projet
        this.state.projectName = projectName;
        this.state.projectId = this.generateProjectId();
        
        // Mise à jour interface
        if (this.elements.projectName) {
            this.elements.projectName.value = projectName;
        }
        
        // Génération viewer automatique
        this.generateViewerForProject();
        
        // Notification succès
        this.updateStatus(`Projet "${projectName}" créé`, 'success');
        this.debugLog(`Nouveau projet créé: ${projectName}`);
    }
    
    /**
     * Génération viewer automatique pour projet
     * Création fichier HTML synchronisé
     */
    generateViewerForProject() {
        if (!this.state.viewer) return;
        
        // Configuration viewer optimisée
        const viewerConfig = {
            includeCSS: true,
            includeJS: true,
            responsive: true,
            accessibility: true,
            seoOptimized: true,
            projectName: this.state.projectName,
            autoSync: true
        };
        
        // Génération en arrière-plan
        this.state.viewer.generateForProject(viewerConfig);
    }
    
    /**
     * Mise à jour viewer si ouvert (synchronisation)
     * Appelée lors de modifications widgets/projet
     */
    updateViewerIfOpen() {
        if (this.state.viewer && this.state.viewer.isViewerOpen()) {
            // Synchronisation temps réel
            this.state.viewer.updateOpenViewer();
        }
    }
    
    /**
     * Création bouton "Nouveau Projet" moderne
     * Ajout dynamique au header avec techniques actuelles
     */
    addNewProjectButton() {
        // Vérification si bouton déjà présent
        if (document.getElementById('btn-new-project')) return;
        
        // Création bouton moderne
        const newProjectBtn = document.createElement('button');
        newProjectBtn.id = 'btn-new-project';
        newProjectBtn.className = 'btn-header btn-new-project';
        newProjectBtn.title = 'Créer nouveau projet (Ctrl+N)';
        newProjectBtn.innerHTML = `
            <i class="fas fa-plus"></i>
            <span class="btn-text">Nouveau</span>
        `;
        
        // Styles CSS modernes intégrés
        const btnStyles = document.createElement('style');
        btnStyles.textContent = `
            .btn-new-project {
                background: linear-gradient(135deg, #10b981, #059669) !important;
                color: white !important;
                border: none !important;
                padding: 8px 16px !important;
                border-radius: 8px !important;
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                font-weight: 600 !important;
                transition: all 0.2s ease !important;
                margin-left: 16px !important;
            }
            .btn-new-project:hover {
                background: linear-gradient(135deg, #059669, #047857) !important;
                transform: translateY(-2px) !important;
                box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3) !important;
            }
            .btn-new-project:active {
                transform: translateY(0) !important;
            }
            @media (max-width: 768px) {
                .btn-new-project .btn-text { display: none; }
                .btn-new-project { padding: 8px !important; }
            }
        `;
        document.head.appendChild(btnStyles);
        
        // Événement clic
        newProjectBtn.addEventListener('click', () => {
            this.showProjectNameModal();
        });
        
        // Ajout au header (après autres boutons)
        const headerActions = this.elements.container.querySelector('.header-actions');
        if (headerActions) {
            headerActions.appendChild(newProjectBtn);
        }
        
        // Raccourci clavier Ctrl+N
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.showProjectNameModal();
            }
        });
        
        this.debugLog('Bouton "Nouveau Projet" ajouté');
    }
    
    /**
     * Getters pour accès externe aux propriétés
     */
    getState() { return this.state; }
    getElements() { return this.elements; }
    getSelectedWidget() { return this.state.selectedWidget; }
    getWidgets() { return this.state.widgets; }
};

// Compatibilité globale
window.Editor = window.WidgetEditor.Editor;
/**
 * ============================================================================
 * WIDGET EDITOR - Éditeur Visuel de Widgets
 * ============================================================================
 * 
 * Rôle : Interface d'édition visuelle pour widgets avec drag & drop
 * Type : Visual editor - Interface utilisateur avancée
 * Usage : Création et modification de widgets de manière intuitive
 */

import widgetLoader from '../core/widget-loader.js';
import stateManager from '../../../../../core/widget-state-manager.js';
window.widgetStateManager = stateManager;

class WidgetEditor {
    constructor() {
        // État de l'éditeur - Variables de travail
        this.zoomLevel = 100;
        
        // Historique des modifications - Système undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Éléments DOM - Références des composants UI mis à jour pour le système de grille
        this.elements = {
            widgetLibrary: document.getElementById('widgetLibrary'),
            widgetGrid: document.getElementById('widgetGrid'),
            emptyState: document.getElementById('emptyState'),
            propertiesContent: document.getElementById('propertiesContent'),
            statusText: document.getElementById('statusText'),
            statusIndicator: document.getElementById('statusIndicator'),
            widgetCount: document.getElementById('widgetCount'),
            canvasSize: document.getElementById('canvasSize'),
            zoomLevel: document.getElementById('zoomLevel')
        };
        
        // État de la grille - Variables pour gestion des conteneurs
        this.widgetContainers = new Map(); // Map des conteneurs créés
        this.selectedContainer = null;     // Conteneur actuellement sélectionné
        this.gridSize = { cols: 12, rows: 8 }; // Taille de la grille
        this.showGrid = false;             // Affichage des guides de grille
        this.nextWidgetId = 1;             // ID auto-incrémenté pour widgets
        
        
        // Widgets disponibles - Catalogue des composants
        this.availableWidgets = new Map();
        
        this.init();
    }

    /**
     * Rôle : Initialisation de l'éditeur
     * Type : Setup - Configuration initiale
     */
    async init() {
        this.setStatus('Initialisation de l\'éditeur...', 'loading');
        
        try {
            // Chargement des widgets - Discovery automatique
            await this.loadAvailableWidgets();
            
            // Configuration des événements - Event listeners
            this.setupEventListeners();
            
            // Rendu de la bibliothèque - Interface widgets
            this.renderWidgetLibrary();
            
            this.setStatus('Éditeur prêt', 'success');
            
        } catch (error) {
            console.error('Erreur initialisation éditeur:', error);
            this.setStatus('Erreur d\'initialisation', 'error');
        }
    }

    /**
     * Rôle : Chargement des widgets disponibles
     * Type : Widget discovery - Découverte automatique
     */
    async loadAvailableWidgets() {
        try {
            // Découverte automatique - Scan des widgets
            const discoveredWidgets = await widgetLoader.discoverWidgets();
            
            // Organisation par catégorie - Groupement logique
            const categories = {};
            
            for (const widgetInfo of discoveredWidgets) {
                if (widgetInfo.widget) {
                    const instance = new widgetInfo.widget();
                    const category = instance.category || 'Autres';
                    
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    
                    categories[category].push({
                        type: widgetInfo.type,
                        name: instance.name,
                        icon: instance.icon,
                        description: instance.description,
                        category: category,
                        class: widgetInfo.widget
                    });
                    
                    this.availableWidgets.set(widgetInfo.type, instance);
                }
            }
            
            this.widgetCategories = categories;
            
        } catch (error) {
            console.error('Erreur chargement widgets:', error);
            throw error;
        }
    }

    /**
     * Rôle : Configuration des événements UI
     * Type : Event handling - Gestion des interactions
     */
    setupEventListeners() {
        // Événements de la barre d'outils - Toolbar actions
        document.getElementById('createWidgetBtn').addEventListener('click', () => this.showCreateWidgetDialog());
        document.getElementById('firstWidgetBtn').addEventListener('click', () => this.showCreateWidgetDialog());
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        
        // Événements de sauvegarde/export - File operations
        document.getElementById('saveBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportProject());
        
        // Événements de zoom - Canvas controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomFit').addEventListener('click', () => this.zoomToFit());
        
        // Événements grille - Canvas grid controls
        document.getElementById('gridToggle').addEventListener('click', () => this.toggleGrid());
        document.getElementById('guidesToggle').addEventListener('click', () => this.toggleGuides());
        
        // Événements de recherche - Search functionality
        document.getElementById('widgetSearch').addEventListener('input', (e) => {
            this.filterWidgets(e.target.value);
        });
        
        // Événements clavier - Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });
        
        // Événements de redimensionnement - Window resize
        window.addEventListener('resize', () => {
            this.updateCanvasSize();
        });
    }


    /**
     * Rôle : Rendu de la bibliothèque de widgets
     * Type : UI rendering - Interface de sélection
     */
    renderWidgetLibrary() {
        const library = this.elements.widgetLibrary;
        library.innerHTML = '';
        
        // Parcours des catégories - Génération par groupe
        Object.entries(this.widgetCategories).forEach(([category, widgets]) => {
            // Création de la catégorie - Section groupée
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'widget-category';
            
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            // Ajout des widgets - Items draggables
            widgets.forEach(widget => {
                const widgetItem = this.createWidgetItem(widget);
                categoryDiv.appendChild(widgetItem);
            });
            
            library.appendChild(categoryDiv);
        });
    }

    /**
     * Rôle : Création d'un item de widget cliquable
     * Type : DOM creation - Élément sélectionnable  
     * Retour : Element HTML du widget item
     */
    createWidgetItem(widget) {
        const item = document.createElement('div');
        item.className = 'widget-item';
        item.dataset.widgetType = widget.type;
        
        // Rôle : Clic pour ouvrir la modal de création avec ce type pré-sélectionné
        // Type : Event handler - Interaction utilisateur
        item.addEventListener('click', () => {
            this.showCreateWidgetDialog(widget.type);
            this.setStatus(`Création de ${widget.name}...`, 'info');
        });
        
        // Contenu de l'item - Structure HTML
        item.innerHTML = `
            <div class="widget-icon">${widget.icon}</div>
            <div class="widget-info">
                <div class="widget-name">${widget.name}</div>
                <div class="widget-description">${widget.description}</div>
            </div>
        `;
        
        return item;
    }


    /**
     * Rôle : Gestion du zoom
     * Type : Canvas controls - Zoom management
     */
    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 25, 200);
        this.applyZoom();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 25, 25);
        this.applyZoom();
    }

    zoomToFit() {
        this.zoomLevel = 100;
        this.applyZoom();
    }

    /**
     * Rôle : Application du niveau de zoom
     * Type : CSS transform - Transformation visuelle
     */
    applyZoom() {
        const grid = this.elements.widgetGrid;
        const scale = this.zoomLevel / 100;
        
        grid.style.transform = `scale(${scale})`;
        grid.style.transformOrigin = 'center top';
        
        // Mise à jour de l'affichage - UI feedback
        this.elements.zoomLevel.textContent = `${this.zoomLevel}%`;
    }

    /**
     * Rôle : Système undo/redo
     * Type : History management - Gestion de l'historique
     */
    saveToHistory(action, description) {
        const snapshot = {
            action: action,
            description: description,
            timestamp: new Date().toISOString(),
            // Pour le système de grille, on pourrait sauvegarder l'état des conteneurs
            gridState: Array.from(this.widgetContainers.entries()).map(([id, data]) => ({
                id,
                widgetType: data.widgetType,
                position: { ...data.position }
            }))
        };
        
        // Suppression de l'historique futur - Nouvelle branche
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Ajout du snapshot - État actuel
        this.history.push(snapshot);
        this.historyIndex = this.history.length - 1;
        
        // Limitation de la taille - Memory management
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateHistoryButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreFromHistory();
            this.setStatus('Action annulée', 'info');
        } else {
            this.setStatus('Rien à annuler', 'warning');
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
            this.setStatus('Action refaite', 'info');
        } else {
            this.setStatus('Rien à refaire', 'warning');
        }
    }

    /**
     * Rôle : Restauration depuis l'historique
     * Type : History restoration - État précédent
     */
    restoreFromHistory() {
        const snapshot = this.history[this.historyIndex];
        if (!snapshot) return;
        
        // Pour le nouveau système, l'historique pourrait restaurer l'état de la grille
        // Cette fonctionnalité peut être implémentée plus tard pour le système de grille
        
        this.updateHistoryButtons();
        this.setStatus(`${snapshot.description} (${snapshot.action})`, 'info');
    }

    /**
     * Rôle : Mise à jour des boutons historique
     * Type : UI update - État des boutons undo/redo
     */
    updateHistoryButtons() {
        document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
        document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
    }

    /**
     * Rôle : Filtrage des widgets
     * Type : Search functionality - Recherche et filtrage
     */
    filterWidgets(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        const widgetItems = this.elements.widgetLibrary.querySelectorAll('.widget-item');
        
        widgetItems.forEach(item => {
            const name = item.querySelector('.widget-name').textContent.toLowerCase();
            const description = item.querySelector('.widget-description').textContent.toLowerCase();
            const matches = name.includes(term) || description.includes(term);
            
            item.style.display = matches ? 'flex' : 'none';
        });
        
        // Masquage des catégories vides
        const categories = this.elements.widgetLibrary.querySelectorAll('.widget-category');
        categories.forEach(category => {
            const visibleItems = category.querySelectorAll('.widget-item[style="display: flex"], .widget-item:not([style])');
            category.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }

    /**
     * Rôle : Gestion des raccourcis clavier
     * Type : Keyboard handling - Shortcuts
     */
    handleKeyboard(e) {
        // Raccourcis avec Ctrl
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                // Sauvegarde non disponible dans le nouveau système
                case '+':
                case '=':
                    e.preventDefault();
                    this.zoomIn();
                    break;
                case '-':
                    e.preventDefault();
                    this.zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    this.zoomToFit();
                    break;
            }
        }
        
        // Raccourcis directs
        switch (e.key) {
            case 'Delete':
                if (this.selectedContainer) {
                    this.deleteContainer(this.selectedContainer.id);
                }
                break;
            case 'Escape':
                if (this.selectedContainer) {
                    this.selectedContainer.classList.remove('selected');
                    this.selectedContainer = null;
                    this.elements.propertiesContent.innerHTML = `
                        <div class="properties-empty">
                            <i class="fas fa-info-circle properties-empty-icon"></i>
                            <p>Sélectionnez un widget pour voir ses propriétés</p>
                        </div>
                    `;
                }
                break;
        }
    }





    /**
     * Rôle : Mise à jour du statut global
     * Type : Status management - État de l'interface
     */
    updateStatus() {
        // Compteur de widgets - Affichage info
        this.elements.widgetCount.textContent = this.widgetContainers.size.toString();
        
        // Taille du canvas - Dimensions actuelles
        const grid = this.elements.widgetGrid;
        const rect = grid.getBoundingClientRect();
        this.elements.canvasSize.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
    }

    /**
     * Rôle : Mise à jour de la taille du canvas
     * Type : Canvas management - Responsive
     */
    updateCanvasSize() {
        this.updateStatus();
    }

    /**
     * Rôle : Définition du statut de l'éditeur
     * Type : Status display - Feedback utilisateur
     */
    setStatus(message, type = 'info') {
        this.elements.statusText.textContent = message;
        
        // Mise à jour de l'indicateur - Couleur selon le type
        const indicator = this.elements.statusIndicator;
        indicator.className = `status-indicator ${type}`;
        
        // Auto-effacement des messages temporaires
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (this.elements.statusText.textContent === message) {
                    this.setStatus('Prêt', 'success');
                }
            }, 3000);
        }
    }

    // ===============================================
    // SYSTÈME DE GRILLE ET CRÉATION DE WIDGETS
    // ===============================================

    /**
     * Rôle : Afficher la boîte de dialogue de création de widget
     * Type : Modal dialog - Interface de sélection
     * Action : Ouvre un popup pour choisir le type et la taille du widget
     * Paramètres : preselectedType (string, optional) - Type de widget pré-sélectionné
     */
    showCreateWidgetDialog(preselectedType = null) {
        // Rôle : Génération de la liste des widgets disponibles
        // Type : HTML dynamique pour sélection
        let widgetOptions = '';
        
        if (this.widgetCategories) {
            Object.entries(this.widgetCategories).forEach(([category, widgets]) => {
                widgetOptions += `<optgroup label="${category}">`;
                widgets.forEach(widget => {
                    const selected = preselectedType === widget.type ? 'selected' : '';
                    widgetOptions += `<option value="${widget.type}" data-icon="${widget.icon}" ${selected}>
                        ${widget.name} - ${widget.description}
                    </option>`;
                });
                widgetOptions += '</optgroup>';
            });
        }

        // Rôle : Interface de création avec sélection de taille
        // Type : Modal HTML avec contrôles interactifs
        const dialog = document.createElement('div');
        dialog.className = 'create-widget-dialog';
        dialog.innerHTML = `
            <div class="dialog-overlay" onclick="this.parentElement.remove()"></div>
            <div class="dialog-content">
                <div class="dialog-header">
                    <h3><i class="fas fa-plus-circle"></i> Créer un Nouveau Widget</h3>
                    <button class="dialog-close" onclick="this.closest('.create-widget-dialog').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="dialog-body">
                    <div class="form-group">
                        <label>Type de Widget</label>
                        <select id="widgetTypeSelect" class="form-control">
                            <option value="">-- Choisir un type --</option>
                            ${widgetOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>Taille du Conteneur</label>
                        <div class="size-controls">
                            <div class="size-group">
                                <label>Largeur (colonnes)</label>
                                <div class="slider-group">
                                    <input type="range" id="widthSlider" min="1" max="12" value="4" class="slider">
                                    <input type="number" id="widthInput" min="1" max="12" value="4" class="size-input">
                                    <span class="size-label">/ 12</span>
                                </div>
                            </div>
                            <div class="size-group">
                                <label>Hauteur (rangées)</label>
                                <div class="slider-group">
                                    <input type="range" id="heightSlider" min="1" max="8" value="2" class="slider">
                                    <input type="number" id="heightInput" min="1" max="8" value="2" class="size-input">
                                    <span class="size-label">/ 8</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid-preview">
                            <div class="preview-grid" id="previewGrid">
                                <!-- Grille de prévisualisation générée par JS -->
                            </div>
                            <div class="preview-widget" id="previewWidget"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Position sur la Grille</label>
                        <div class="position-controls">
                            <div class="position-group">
                                <label>Colonne de Départ</label>
                                <div class="slider-group">
                                    <input type="range" id="startColSlider" min="1" max="9" value="1" class="slider">
                                    <input type="number" id="startColInput" min="1" max="9" value="1" class="size-input">
                                </div>
                            </div>
                            <div class="position-group">
                                <label>Rangée de Départ</label>
                                <div class="slider-group">
                                    <input type="range" id="startRowSlider" min="1" max="7" value="1" class="slider">
                                    <input type="number" id="startRowInput" min="1" max="7" value="1" class="size-input">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dialog-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.create-widget-dialog').remove()">
                        Annuler
                    </button>
                    <button class="btn btn-primary" id="createWidgetConfirm" ${preselectedType ? '' : 'disabled'}>
                        <i class="fas fa-plus"></i>
                        Créer le Widget
                    </button>
                </div>
            </div>
        `;

        // Rôle : Ajout des styles CSS pour la modal
        // Type : Styles inline pour interface complète
        dialog.innerHTML += `
            <style>
                .create-widget-dialog {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    font-family: var(--font-primary);
                }
                
                .dialog-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                }
                
                .dialog-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-xl);
                }
                
                .dialog-header {
                    padding: 1rem 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: var(--bg-card);
                }
                
                .dialog-header h3 {
                    color: var(--text-white);
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .dialog-header h3 i {
                    color: var(--accent-green);
                }
                
                .dialog-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: var(--border-radius);
                    transition: var(--transition-fast);
                }
                
                .dialog-close:hover {
                    background: var(--bg-primary);
                    color: var(--text-white);
                }
                
                .dialog-body {
                    padding: 1.5rem;
                }
                
                .form-group {
                    margin-bottom: 1.5rem;
                }
                
                .form-group label {
                    display: block;
                    color: var(--text-white);
                    font-weight: var(--font-medium);
                    margin-bottom: 0.5rem;
                }
                
                .form-control {
                    width: 100%;
                    padding: 0.75rem;
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    color: var(--text-white);
                    font-size: var(--text-sm);
                }
                
                .size-controls, .position-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                .size-group, .position-group {
                    background: var(--bg-primary);
                    padding: 1rem;
                    border-radius: var(--border-radius);
                }
                
                .size-group label, .position-group label {
                    font-size: var(--text-xs);
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }
                
                .slider-group {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .slider {
                    flex: 1;
                    height: 6px;
                    background: var(--bg-secondary);
                    outline: none;
                    border-radius: 3px;
                }
                
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: var(--accent-green);
                    border-radius: 50%;
                    cursor: pointer;
                }
                
                .size-input {
                    width: 50px;
                    padding: 0.25rem 0.5rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    color: var(--text-white);
                    text-align: center;
                }
                
                .size-label {
                    color: var(--text-muted);
                    font-size: var(--text-xs);
                    min-width: 30px;
                }
                
                .grid-preview {
                    margin-top: 1rem;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: var(--border-radius);
                    position: relative;
                }
                
                .preview-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    grid-template-rows: repeat(8, 20px);
                    gap: 2px;
                    margin-bottom: 1rem;
                }
                
                .preview-cell {
                    background: rgba(16, 185, 129, 0.1);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                
                .preview-cell.selected {
                    background: rgba(16, 185, 129, 0.4);
                    border-color: var(--accent-green);
                }
                
                .preview-widget {
                    position: absolute;
                    background: rgba(59, 130, 246, 0.3);
                    border: 2px solid var(--accent-blue);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-blue);
                    font-weight: bold;
                    font-size: var(--text-xs);
                    pointer-events: none;
                }
                
                .dialog-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    background: var(--bg-card);
                }
            </style>
        `;

        document.body.appendChild(dialog);

        // Rôle : Configuration des événements de la modal
        // Type : Event binding - Synchronisation des contrôles
        this.setupCreateWidgetDialogEvents(dialog);

        this.setStatus('Interface de création ouverte', 'info');
    }

    /**
     * Rôle : Configuration des événements de la boîte de création
     * Type : Event handling - Synchronisation temps réel
     * Paramètres : dialog (Element) - Référence de la modal
     */
    setupCreateWidgetDialogEvents(dialog) {
        const widthSlider = dialog.querySelector('#widthSlider');
        const widthInput = dialog.querySelector('#widthInput');
        const heightSlider = dialog.querySelector('#heightSlider');
        const heightInput = dialog.querySelector('#heightInput');
        const startColSlider = dialog.querySelector('#startColSlider');
        const startColInput = dialog.querySelector('#startColInput');
        const startRowSlider = dialog.querySelector('#startRowSlider');
        const startRowInput = dialog.querySelector('#startRowInput');
        const widgetTypeSelect = dialog.querySelector('#widgetTypeSelect');
        const createBtn = dialog.querySelector('#createWidgetConfirm');
        const previewGrid = dialog.querySelector('#previewGrid');
        const previewWidget = dialog.querySelector('#previewWidget');

        // Rôle : Synchronisation slider ↔ input (largeur)
        // Action : Maintient les deux champs en sync temps réel
        widthSlider.addEventListener('input', () => {
            widthInput.value = widthSlider.value;
            this.updateCreatePreview(dialog);
            this.updatePositionLimits(dialog);
        });
        
        widthInput.addEventListener('input', () => {
            widthSlider.value = widthInput.value;
            this.updateCreatePreview(dialog);
            this.updatePositionLimits(dialog);
        });

        // Rôle : Synchronisation slider ↔ input (hauteur)
        heightSlider.addEventListener('input', () => {
            heightInput.value = heightSlider.value;
            this.updateCreatePreview(dialog);
            this.updatePositionLimits(dialog);
        });
        
        heightInput.addEventListener('input', () => {
            heightSlider.value = heightInput.value;
            this.updateCreatePreview(dialog);
            this.updatePositionLimits(dialog);
        });

        // Rôle : Synchronisation position
        startColSlider.addEventListener('input', () => {
            startColInput.value = startColSlider.value;
            this.updateCreatePreview(dialog);
        });
        
        startColInput.addEventListener('input', () => {
            startColSlider.value = startColInput.value;
            this.updateCreatePreview(dialog);
        });

        startRowSlider.addEventListener('input', () => {
            startRowInput.value = startRowSlider.value;
            this.updateCreatePreview(dialog);
        });
        
        startRowInput.addEventListener('input', () => {
            startRowSlider.value = startRowInput.value;
            this.updateCreatePreview(dialog);
        });

        // Rôle : Activation du bouton selon sélection
        widgetTypeSelect.addEventListener('change', () => {
            createBtn.disabled = !widgetTypeSelect.value;
            this.updateCreatePreview(dialog);
        });

        // Rôle : Action de création finale
        createBtn.addEventListener('click', () => {
            this.createWidgetContainer(dialog);
        });

        // Initialisation de l'aperçu
        this.generatePreviewGrid(previewGrid);
        this.updateCreatePreview(dialog);
        this.updatePositionLimits(dialog);
    }

    /**
     * Rôle : Génération de la grille de prévisualisation
     * Type : DOM generation - Interface preview
     * Paramètres : container (Element) - Conteneur de la grille
     */
    generatePreviewGrid(container) {
        container.innerHTML = '';
        
        // Rôle : Création des cellules 12x8
        // Type : Boucle de génération DOM
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 12; col++) {
                const cell = document.createElement('div');
                cell.className = 'preview-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                container.appendChild(cell);
            }
        }
    }

    /**
     * Rôle : Mise à jour de l'aperçu de placement
     * Type : UI update - Prévisualisation temps réel
     * Paramètres : dialog (Element) - Référence de la modal
     */
    updateCreatePreview(dialog) {
        const width = parseInt(dialog.querySelector('#widthInput').value);
        const height = parseInt(dialog.querySelector('#heightInput').value);
        const startCol = parseInt(dialog.querySelector('#startColInput').value);
        const startRow = parseInt(dialog.querySelector('#startRowInput').value);
        const widgetType = dialog.querySelector('#widgetTypeSelect').value;
        const previewWidget = dialog.querySelector('#previewWidget');
        const previewGrid = dialog.querySelector('#previewGrid');

        // Rôle : Nettoyage des sélections précédentes
        // Type : Reset visuel
        previewGrid.querySelectorAll('.preview-cell').forEach(cell => {
            cell.classList.remove('selected');
        });

        // Rôle : Marquage des cellules occupées
        // Type : Visualisation de zone
        for (let row = startRow; row < startRow + height && row <= 8; row++) {
            for (let col = startCol; col < startCol + width && col <= 12; col++) {
                const cell = previewGrid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) cell.classList.add('selected');
            }
        }

        // Rôle : Positionnement du widget preview
        // Type : Calcul CSS Grid positions
        const gridRect = previewGrid.getBoundingClientRect();
        const cellWidth = gridRect.width / 12;
        const cellHeight = 20 + 2; // hauteur + gap
        
        previewWidget.style.left = `${(startCol - 1) * cellWidth + (startCol - 1) * 2}px`;
        previewWidget.style.top = `${(startRow - 1) * cellHeight}px`;
        previewWidget.style.width = `${width * cellWidth + (width - 1) * 2}px`;
        previewWidget.style.height = `${height * cellHeight - 2}px`;
        
        // Rôle : Texte informatif du preview
        // Type : Label dynamique
        const widgetInfo = widgetType ? `${widgetType}\n${width}×${height}` : `${width}×${height}`;
        previewWidget.textContent = widgetInfo;
        previewWidget.style.display = 'flex';
    }

    /**
     * Rôle : Mise à jour des limites de position
     * Type : Validation contraintes - Éviter débordement
     * Paramètres : dialog (Element) - Référence de la modal
     */
    updatePositionLimits(dialog) {
        const width = parseInt(dialog.querySelector('#widthInput').value);
        const height = parseInt(dialog.querySelector('#heightInput').value);
        
        // Rôle : Calcul des maxima autorisés
        // Type : Contrainte de grille
        const maxCol = Math.max(1, 13 - width);  // 12 colonnes max
        const maxRow = Math.max(1, 9 - height);  // 8 rangées max
        
        // Rôle : Application des contraintes aux contrôles
        // Type : Mise à jour des limites
        const startColSlider = dialog.querySelector('#startColSlider');
        const startColInput = dialog.querySelector('#startColInput');
        const startRowSlider = dialog.querySelector('#startRowSlider');
        const startRowInput = dialog.querySelector('#startRowInput');
        
        startColSlider.max = maxCol;
        startColInput.max = maxCol;
        startRowSlider.max = maxRow;
        startRowInput.max = maxRow;
        
        // Rôle : Ajustement des valeurs si nécessaire
        // Type : Validation des entrées
        if (parseInt(startColInput.value) > maxCol) {
            startColInput.value = maxCol;
            startColSlider.value = maxCol;
        }
        
        if (parseInt(startRowInput.value) > maxRow) {
            startRowInput.value = maxRow;
            startRowSlider.value = maxRow;
        }
    }

    /**
     * Rôle : Création effective du conteneur de widget
     * Type : Widget instantiation - Création finale
     * Paramètres : dialog (Element) - Données de la modal
     */
    createWidgetContainer(dialog) {
        const widgetType = dialog.querySelector('#widgetTypeSelect').value;
        const width = parseInt(dialog.querySelector('#widthInput').value);
        const height = parseInt(dialog.querySelector('#heightInput').value);
        const startCol = parseInt(dialog.querySelector('#startColInput').value);
        const startRow = parseInt(dialog.querySelector('#startRowInput').value);

        // Rôle : Vérification de disponibilité de l'espace
        // Type : Validation collision
        if (this.isGridSpaceOccupied(startCol, startRow, width, height)) {
            alert('⚠️ Cette zone est déjà occupée par un autre widget !');
            return;
        }

        // Rôle : Création de l'instance du widget
        // Type : Widget factory
        const widgetInstance = this.availableWidgets.get(widgetType);
        if (!widgetInstance) {
            alert('❌ Type de widget invalide !');
            return;
        }

        // Rôle : Génération du conteneur avec toutes les propriétés
        // Type : DOM creation
        const containerId = `widget-container-${this.nextWidgetId++}`;
        const container = this.createWidgetContainerElement(
            containerId, 
            widgetType, 
            widgetInstance,
            { startCol, startRow, width, height }
        );

        // Rôle : Placement sur la grille
        // Type : CSS Grid positioning
        container.style.gridColumnStart = startCol;
        container.style.gridColumnEnd = startCol + width;
        container.style.gridRowStart = startRow;
        container.style.gridRowEnd = startRow + height;

        // Rôle : Ajout à la grille et enregistrement
        // Type : DOM insertion + state management
        this.elements.widgetGrid.appendChild(container);
        this.widgetContainers.set(containerId, {
            element: container,
            widgetType: widgetType,
            widgetInstance: widgetInstance,
            position: { startCol, startRow, width, height }
        });

        // Rôle : Masquer l'état vide si premier widget
        // Type : UI state management
        if (this.widgetContainers.size === 1) {
            this.elements.emptyState.classList.add('hidden');
        }

        // Rôle : Sélection automatique du nouveau widget
        // Type : UX flow
        this.selectContainer(container);
        
        // Rôle : Fermeture de la modal et feedback
        // Type : UI cleanup
        dialog.remove();
        this.setStatus(`Widget ${widgetInstance.name} créé avec succès`, 'success');
    }

    /**
     * Rôle : Vérification si une zone de grille est libre
     * Type : Collision detection - Validation spatiale
     * Paramètres : startCol, startRow, width, height (numbers)
     * Retour : boolean - true si occupé, false si libre
     */
    isGridSpaceOccupied(startCol, startRow, width, height) {
        for (const [containerId, containerData] of this.widgetContainers) {
            const pos = containerData.position;
            
            // Rôle : Test de chevauchement rectangulaire
            // Formule : Pas de chevauchement si l'un des conditions est vraie :
            // - startCol >= pos.startCol + pos.width (à droite)
            // - startCol + width <= pos.startCol (à gauche)  
            // - startRow >= pos.startRow + pos.height (en bas)
            // - startRow + height <= pos.startRow (en haut)
            const noOverlap = (
                startCol >= pos.startCol + pos.width ||
                startCol + width <= pos.startCol ||
                startRow >= pos.startRow + pos.height ||
                startRow + height <= pos.startRow
            );
            
            if (!noOverlap) {
                return true; // Il y a chevauchement
            }
        }
        
        return false; // Zone libre
    }

    /**
     * Rôle : Création de l'élément DOM du conteneur de widget
     * Type : DOM factory - Construction complète
     * Paramètres : containerId, widgetType, widgetInstance, position
     * Retour : Element - Conteneur HTML complet
     */
    createWidgetContainerElement(containerId, widgetType, widgetInstance, position) {
        const container = document.createElement('div');
        container.className = 'widget-container';
        container.id = containerId;
        container.dataset.widgetType = widgetType;

        // Rôle : Structure HTML complète du conteneur
        // Type : Template HTML avec contrôles
        container.innerHTML = `
            <div class="widget-container-header">
                <div class="widget-container-title">
                    <span class="widget-icon">${widgetInstance.icon || '📦'}</span>
                    <span class="widget-name">${widgetInstance.name}</span>
                </div>
                <div class="widget-container-controls">
                    <button class="widget-control-btn" onclick="widgetEditor.duplicateContainer('${containerId}')" title="Dupliquer">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="widget-control-btn" onclick="widgetEditor.deleteContainer('${containerId}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="widget-container-content" id="${containerId}-content">
                ${this.renderWidgetContent(widgetInstance)}
            </div>
            
            <!-- Poignées de redimensionnement -->
            <div class="resize-handle nw" data-direction="nw"></div>
            <div class="resize-handle ne" data-direction="ne"></div>
            <div class="resize-handle sw" data-direction="sw"></div>
            <div class="resize-handle se" data-direction="se"></div>
            <div class="resize-handle n" data-direction="n"></div>
            <div class="resize-handle s" data-direction="s"></div>
            <div class="resize-handle w" data-direction="w"></div>
            <div class="resize-handle e" data-direction="e"></div>
        `;

        // Rôle : Configuration des événements du conteneur
        // Type : Event binding
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectContainer(container);
        });

        // Rôle : Configuration du redimensionnement
        // Type : Resize handling setup
        this.setupResizeHandles(container);

        return container;
    }

    /**
     * Rôle : Rendu du contenu d'un widget dans son conteneur
     * Type : Widget rendering - Génération HTML
     * Paramètres : widgetInstance (Object) - Instance du widget
     * Retour : string - HTML du contenu
     */
    renderWidgetContent(widgetInstance) {
        try {
            // Rôle : Génération du HTML via la méthode render du widget
            // Type : Widget delegation
            return widgetInstance.render(widgetInstance.defaultData || {});
        } catch (error) {
            console.error('Erreur rendu widget:', error);
            return `
                <div style="color: var(--danger-red); text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <div>Erreur de rendu du widget</div>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    /**
     * Rôle : Sélection d'un conteneur de widget
     * Type : Selection management - État UI
     * Paramètres : container (Element) - Conteneur à sélectionner
     */
    selectContainer(container) {
        // Rôle : Désélection de l'ancien conteneur
        // Type : State cleanup
        if (this.selectedContainer) {
            this.selectedContainer.classList.remove('selected');
        }

        // Rôle : Sélection du nouveau conteneur
        // Type : State update
        this.selectedContainer = container;
        container.classList.add('selected');

        // Rôle : Mise à jour du panneau de propriétés
        // Type : UI sync
        this.updatePropertiesPanel(container);
        
        this.setStatus(`Widget sélectionné: ${container.querySelector('.widget-name').textContent}`, 'info');
    }

    /**
     * Rôle : Mise à jour du panneau de propriétés
     * Type : Properties panel - Interface d'édition
     * Paramètres : container (Element) - Conteneur sélectionné
     */
    updatePropertiesPanel(container) {
        const containerId = container.id;
        const containerData = this.widgetContainers.get(containerId);
        
        if (!containerData) return;

        const position = containerData.position;
        const widgetInstance = containerData.widgetInstance;

        // Rôle : Interface de propriétés complète avec sliders synchronisés
        // Type : HTML Form avec contrôles temps réel
        this.elements.propertiesContent.innerHTML = `
            <div class="properties-section">
                <h4><i class="fas fa-info-circle"></i> Informations</h4>
                <div class="property-row">
                    <label>Type:</label>
                    <span>${widgetInstance.name}</span>
                </div>
                <div class="property-row">
                    <label>ID:</label>
                    <span>${containerId}</span>
                </div>
            </div>

            <div class="properties-section">
                <h4><i class="fas fa-expand-arrows-alt"></i> Position & Taille</h4>
                
                <div class="property-group">
                    <label>Largeur (colonnes)</label>
                    <div class="property-control">
                        <input type="range" min="1" max="12" value="${position.width}" 
                               class="property-slider" id="width-slider-${containerId}"
                               onchange="widgetEditor.updateContainerSize('${containerId}', 'width', this.value)">
                        <input type="number" min="1" max="12" value="${position.width}"
                               class="property-input" id="width-input-${containerId}"
                               onchange="widgetEditor.updateContainerSize('${containerId}', 'width', this.value)">
                        <span class="property-unit">/ 12</span>
                    </div>
                </div>

                <div class="property-group">
                    <label>Hauteur (rangées)</label>
                    <div class="property-control">
                        <input type="range" min="1" max="8" value="${position.height}"
                               class="property-slider" id="height-slider-${containerId}"
                               onchange="widgetEditor.updateContainerSize('${containerId}', 'height', this.value)">
                        <input type="number" min="1" max="8" value="${position.height}"
                               class="property-input" id="height-input-${containerId}"
                               onchange="widgetEditor.updateContainerSize('${containerId}', 'height', this.value)">
                        <span class="property-unit">/ 8</span>
                    </div>
                </div>

                <div class="property-group">
                    <label>Position Colonne</label>
                    <div class="property-control">
                        <input type="range" min="1" max="${13 - position.width}" value="${position.startCol}"
                               class="property-slider" id="startCol-slider-${containerId}"
                               onchange="widgetEditor.updateContainerPosition('${containerId}', 'startCol', this.value)">
                        <input type="number" min="1" max="${13 - position.width}" value="${position.startCol}"
                               class="property-input" id="startCol-input-${containerId}"
                               onchange="widgetEditor.updateContainerPosition('${containerId}', 'startCol', this.value)">
                    </div>
                </div>

                <div class="property-group">
                    <label>Position Rangée</label>
                    <div class="property-control">
                        <input type="range" min="1" max="${9 - position.height}" value="${position.startRow}"
                               class="property-slider" id="startRow-slider-${containerId}"
                               onchange="widgetEditor.updateContainerPosition('${containerId}', 'startRow', this.value)">
                        <input type="number" min="1" max="${9 - position.height}" value="${position.startRow}"
                               class="property-input" id="startRow-input-${containerId}"
                               onchange="widgetEditor.updateContainerPosition('${containerId}', 'startRow', this.value)">
                    </div>
                </div>
            </div>

            <div class="properties-section">
                <h4><i class="fas fa-sliders-h"></i> Propriétés du Widget</h4>
                <div id="widget-properties-${containerId}">
                    ${this.generateWidgetProperties(widgetInstance, containerId)}
                </div>
            </div>

            <div class="properties-section">
                <h4><i class="fas fa-tools"></i> Actions</h4>
                <div class="properties-actions">
                    <button class="btn btn-sm" onclick="widgetEditor.duplicateContainer('${containerId}')">
                        <i class="fas fa-copy"></i> Dupliquer
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="widgetEditor.deleteContainer('${containerId}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Rôle : Génération des propriétés éditables du widget
     * Type : Dynamic form generation - Interface widget-specific
     * Paramètres : widgetInstance, containerId
     * Retour : string - HTML des contrôles de propriétés
     */
    generateWidgetProperties(widgetInstance, containerId) {
        let propertiesHTML = '';
        
        try {
            // Rôle : Récupération des champs éditables du widget
            // Type : Widget introspection
            const editableFields = widgetInstance.getEditableFields ? 
                                 widgetInstance.getEditableFields() : [];
            
            if (editableFields.length === 0) {
                return '<p style="color: var(--text-muted); font-style: italic;">Aucune propriété éditable</p>';
            }

            // Rôle : Génération des contrôles par type de champ
            // Type : Form field factory
            editableFields.forEach(field => {
                const fieldId = `${containerId}-${field.name}`;
                const currentValue = widgetInstance.defaultData[field.name] || field.defaultValue || '';

                propertiesHTML += `<div class="property-group">`;
                propertiesHTML += `<label for="${fieldId}">${field.label || field.name}</label>`;

                switch (field.type) {
                    case 'text':
                        propertiesHTML += `
                            <input type="text" id="${fieldId}" class="property-input full-width" 
                                   value="${currentValue}" 
                                   onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">
                        `;
                        break;

                    case 'textarea':
                        propertiesHTML += `
                            <textarea id="${fieldId}" class="property-textarea full-width" rows="3"
                                      onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">${currentValue}</textarea>
                        `;
                        break;

                    case 'number':
                        const min = field.min || 0;
                        const max = field.max || 100;
                        propertiesHTML += `
                            <div class="property-control">
                                <input type="range" min="${min}" max="${max}" value="${currentValue}"
                                       class="property-slider" id="${fieldId}-slider"
                                       onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">
                                <input type="number" min="${min}" max="${max}" value="${currentValue}"
                                       class="property-input" id="${fieldId}-input"
                                       onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">
                                <span class="property-unit">${field.unit || ''}</span>
                            </div>
                        `;
                        break;

                    case 'color':
                        propertiesHTML += `
                            <input type="color" id="${fieldId}" class="property-color" 
                                   value="${currentValue}" 
                                   onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">
                        `;
                        break;

                    case 'select':
                        propertiesHTML += `<select id="${fieldId}" class="property-select full-width" 
                                                  onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">`;
                        (field.options || []).forEach(option => {
                            const selected = option.value === currentValue ? 'selected' : '';
                            propertiesHTML += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                        });
                        propertiesHTML += `</select>`;
                        break;

                    default:
                        propertiesHTML += `
                            <input type="text" id="${fieldId}" class="property-input full-width" 
                                   value="${currentValue}" 
                                   onchange="widgetEditor.updateWidgetProperty('${containerId}', '${field.name}', this.value)">
                        `;
                }

                propertiesHTML += `</div>`;
            });

        } catch (error) {
            console.error('Erreur génération propriétés:', error);
            propertiesHTML = '<p style="color: var(--danger-red);">Erreur lors du chargement des propriétés</p>';
        }

        return propertiesHTML;
    }

    /**
     * Rôle : Mise à jour de la taille d'un conteneur
     * Type : Container management - Redimensionnement
     * Paramètres : containerId, dimension ('width'|'height'), value
     */
    updateContainerSize(containerId, dimension, value) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        const intValue = parseInt(value);
        const container = containerData.element;
        const position = containerData.position;

        // Rôle : Vérification de collision avant redimensionnement
        // Type : Collision detection
        const newPosition = { ...position };
        newPosition[dimension] = intValue;

        // Temporairement retirer ce conteneur de la vérification
        this.widgetContainers.delete(containerId);
        const isCollision = this.isGridSpaceOccupied(
            newPosition.startCol, 
            newPosition.startRow, 
            newPosition.width, 
            newPosition.height
        );
        this.widgetContainers.set(containerId, containerData);

        if (isCollision) {
            this.setStatus('Redimensionnement impossible: collision détectée', 'warning');
            return;
        }

        // Rôle : Application du nouveau dimensionnement
        // Type : CSS Grid update + state sync
        position[dimension] = intValue;

        if (dimension === 'width') {
            container.style.gridColumnEnd = position.startCol + position.width;
        } else if (dimension === 'height') {
            container.style.gridRowEnd = position.startRow + position.height;
        }

        // Rôle : Synchronisation des contrôles (slider ↔ input)
        // Type : UI sync
        const slider = document.getElementById(`${dimension}-slider-${containerId}`);
        const input = document.getElementById(`${dimension}-input-${containerId}`);
        
        if (slider && slider.value !== value) slider.value = value;
        if (input && input.value !== value) input.value = value;

        this.setStatus(`${dimension === 'width' ? 'Largeur' : 'Hauteur'} mise à jour: ${value}`, 'success');
    }

    /**
     * Rôle : Mise à jour de la position d'un conteneur
     * Type : Container management - Déplacement
     * Paramètres : containerId, axis ('startCol'|'startRow'), value
     */
    updateContainerPosition(containerId, axis, value) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        const intValue = parseInt(value);
        const container = containerData.element;
        const position = containerData.position;

        // Vérification de collision
        const newPosition = { ...position };
        newPosition[axis] = intValue;

        this.widgetContainers.delete(containerId);
        const isCollision = this.isGridSpaceOccupied(
            newPosition.startCol, 
            newPosition.startRow, 
            newPosition.width, 
            newPosition.height
        );
        this.widgetContainers.set(containerId, containerData);

        if (isCollision) {
            this.setStatus('Déplacement impossible: collision détectée', 'warning');
            return;
        }

        // Application de la nouvelle position
        position[axis] = intValue;

        if (axis === 'startCol') {
            container.style.gridColumnStart = position.startCol;
            container.style.gridColumnEnd = position.startCol + position.width;
        } else if (axis === 'startRow') {
            container.style.gridRowStart = position.startRow;
            container.style.gridRowEnd = position.startRow + position.height;
        }

        // Synchronisation UI
        const slider = document.getElementById(`${axis}-slider-${containerId}`);
        const input = document.getElementById(`${axis}-input-${containerId}`);
        
        if (slider && slider.value !== value) slider.value = value;
        if (input && input.value !== value) input.value = value;

        this.setStatus(`Position mise à jour`, 'success');
    }

    /**
     * Rôle : Mise à jour d'une propriété du widget
     * Type : Widget property management - Temps réel
     * Paramètres : containerId, propertyName, value
     */
    updateWidgetProperty(containerId, propertyName, value) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        const widgetInstance = containerData.widgetInstance;
        
        // Rôle : Mise à jour des données du widget
        // Type : State update
        if (!widgetInstance.defaultData) {
            widgetInstance.defaultData = {};
        }
        widgetInstance.defaultData[propertyName] = value;

        // Rôle : Re-rendu du contenu avec nouvelles données
        // Type : Widget refresh
        const contentContainer = document.getElementById(`${containerId}-content`);
        if (contentContainer) {
            contentContainer.innerHTML = this.renderWidgetContent(widgetInstance);
        }

        // Rôle : Synchronisation des contrôles (si c'est un champ number avec slider)
        // Type : UI sync for dual controls
        const slider = document.getElementById(`${containerId}-${propertyName}-slider`);
        const input = document.getElementById(`${containerId}-${propertyName}-input`);
        
        if (slider && slider.value !== value) slider.value = value;
        if (input && input.value !== value) input.value = value;

        this.setStatus(`Propriété "${propertyName}" mise à jour`, 'success');
    }

    /**
     * Rôle : Configuration des poignées de redimensionnement
     * Type : Resize handles setup - Interaction mouse
     * Paramètres : container (Element) - Conteneur avec handles
     */
    setupResizeHandles(container) {
        const handles = container.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const direction = handle.dataset.direction;
                this.startResize(container, direction, e);
            });
        });
    }

    /**
     * Rôle : Démarrage du redimensionnement par glisser
     * Type : Mouse interaction - Resize start
     * Paramètres : container, direction, mouseEvent
     */
    startResize(container, direction, startEvent) {
        const containerId = container.id;
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        const startPosition = { ...containerData.position };
        const startMouseX = startEvent.clientX;
        const startMouseY = startEvent.clientY;

        // Rôle : Calcul des dimensions de cellule de grille
        // Type : Grid metrics
        const gridRect = this.elements.widgetGrid.getBoundingClientRect();
        const cellWidth = gridRect.width / 12;
        const cellHeight = (gridRect.height - 7 * 16) / 8; // 7 gaps de 16px

        const handleMouseMove = (e) => {
            const deltaX = e.clientX - startMouseX;
            const deltaY = e.clientY - startMouseY;
            
            // Rôle : Conversion pixels → colonnes/rangées
            // Type : Coordinate transformation
            const colDelta = Math.round(deltaX / cellWidth);
            const rowDelta = Math.round(deltaY / cellHeight);

            const newPosition = { ...startPosition };

            // Rôle : Application selon la direction de redimensionnement
            // Type : Direction-based resize logic
            if (direction.includes('e')) { // Est (droite)
                newPosition.width = Math.max(1, Math.min(12, startPosition.width + colDelta));
            }
            if (direction.includes('w')) { // Ouest (gauche)
                const newWidth = Math.max(1, startPosition.width - colDelta);
                const newStartCol = Math.max(1, startPosition.startCol + (startPosition.width - newWidth));
                newPosition.width = newWidth;
                newPosition.startCol = newStartCol;
            }
            if (direction.includes('s')) { // Sud (bas)
                newPosition.height = Math.max(1, Math.min(8, startPosition.height + rowDelta));
            }
            if (direction.includes('n')) { // Nord (haut)
                const newHeight = Math.max(1, startPosition.height - rowDelta);
                const newStartRow = Math.max(1, startPosition.startRow + (startPosition.height - newHeight));
                newPosition.height = newHeight;
                newPosition.startRow = newStartRow;
            }

            // Rôle : Vérification des limites de grille
            // Type : Boundary validation
            if (newPosition.startCol + newPosition.width > 13 || 
                newPosition.startRow + newPosition.height > 9 ||
                newPosition.startCol < 1 || newPosition.startRow < 1) {
                return;
            }

            // Rôle : Vérification de collision
            // Type : Collision detection
            this.widgetContainers.delete(containerId);
            const isCollision = this.isGridSpaceOccupied(
                newPosition.startCol, newPosition.startRow, 
                newPosition.width, newPosition.height
            );
            this.widgetContainers.set(containerId, containerData);

            if (isCollision) return;

            // Rôle : Application du redimensionnement
            // Type : Live resize update
            containerData.position = newPosition;
            container.style.gridColumnStart = newPosition.startCol;
            container.style.gridColumnEnd = newPosition.startCol + newPosition.width;
            container.style.gridRowStart = newPosition.startRow;
            container.style.gridRowEnd = newPosition.startRow + newPosition.height;

            // Rôle : Mise à jour du panneau de propriétés si sélectionné
            // Type : UI sync
            if (this.selectedContainer === container) {
                this.updatePropertiesPanel(container);
            }
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            this.setStatus('Redimensionnement terminé', 'success');
        };

        // Rôle : Configuration des événements globaux
        // Type : Global event handling
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = `${direction}-resize`;
        
        this.setStatus('Redimensionnement en cours...', 'info');
    }

    /**
     * Rôle : Duplication d'un conteneur de widget
     * Type : Container management - Clone
     * Paramètres : containerId (string) - ID du conteneur à dupliquer
     */
    duplicateContainer(containerId) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        // Rôle : Recherche d'une position libre à proximité
        // Type : Spatial placement algorithm
        const originalPos = containerData.position;
        let newStartCol = originalPos.startCol;
        let newStartRow = originalPos.startRow;
        
        // Rôle : Algorithme de placement - essai décalage droite puis bas
        // Type : Free space finding
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            // Essai à droite d'abord
            newStartCol = originalPos.startCol + originalPos.width;
            if (newStartCol + originalPos.width <= 13) {
                if (!this.isGridSpaceOccupied(newStartCol, newStartRow, originalPos.width, originalPos.height)) {
                    break;
                }
            }
            
            // Puis essai en bas
            newStartCol = originalPos.startCol;
            newStartRow = originalPos.startRow + originalPos.height;
            if (newStartRow + originalPos.height <= 9) {
                if (!this.isGridSpaceOccupied(newStartCol, newStartRow, originalPos.width, originalPos.height)) {
                    break;
                }
            }
            
            // Sinon, essai position aléatoire
            newStartCol = Math.floor(Math.random() * (13 - originalPos.width)) + 1;
            newStartRow = Math.floor(Math.random() * (9 - originalPos.height)) + 1;
            
            if (!this.isGridSpaceOccupied(newStartCol, newStartRow, originalPos.width, originalPos.height)) {
                break;
            }
            
            attempts++;
        }

        if (attempts >= maxAttempts) {
            alert('⚠️ Impossible de dupliquer: aucun espace libre trouvé !');
            return;
        }

        // Rôle : Création du conteneur dupliqué
        // Type : Clone creation
        const newContainerId = `widget-container-${this.nextWidgetId++}`;
        const newContainer = this.createWidgetContainerElement(
            newContainerId,
            containerData.widgetType,
            containerData.widgetInstance,
            { 
                startCol: newStartCol, 
                startRow: newStartRow, 
                width: originalPos.width, 
                height: originalPos.height 
            }
        );

        // Rôle : Positionnement sur la grille
        // Type : Grid placement
        newContainer.style.gridColumnStart = newStartCol;
        newContainer.style.gridColumnEnd = newStartCol + originalPos.width;
        newContainer.style.gridRowStart = newStartRow;
        newContainer.style.gridRowEnd = newStartRow + originalPos.height;

        // Rôle : Ajout à la grille et enregistrement
        // Type : State management
        this.elements.widgetGrid.appendChild(newContainer);
        this.widgetContainers.set(newContainerId, {
            element: newContainer,
            widgetType: containerData.widgetType,
            widgetInstance: containerData.widgetInstance,
            position: { 
                startCol: newStartCol, 
                startRow: newStartRow, 
                width: originalPos.width, 
                height: originalPos.height 
            }
        });

        // Rôle : Sélection du nouveau conteneur
        // Type : UX flow
        this.selectContainer(newContainer);
        
        this.setStatus('Widget dupliqué avec succès', 'success');
    }

    /**
     * Rôle : Suppression d'un conteneur de widget
     * Type : Container management - Delete
     * Paramètres : containerId (string) - ID du conteneur à supprimer
     */
    deleteContainer(containerId) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        // Rôle : Confirmation de suppression
        // Type : Safety check
        const widgetName = containerData.element.querySelector('.widget-name').textContent;
        if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le widget "${widgetName}" ?\n\nCette action ne peut pas être annulée.`)) {
            return;
        }

        // Rôle : Suppression du DOM et de l'état
        // Type : Cleanup
        containerData.element.remove();
        this.widgetContainers.delete(containerId);

        // Rôle : Gestion de la désélection
        // Type : State management
        if (this.selectedContainer && this.selectedContainer.id === containerId) {
            this.selectedContainer = null;
            this.elements.propertiesContent.innerHTML = `
                <div class="properties-empty">
                    <i class="fas fa-info-circle properties-empty-icon"></i>
                    <p>Sélectionnez un widget pour voir ses propriétés</p>
                </div>
            `;
        }

        // Rôle : Affichage de l'état vide si plus de widgets
        // Type : UI state management
        if (this.widgetContainers.size === 0) {
            this.elements.emptyState.classList.remove('hidden');
        }

        this.setStatus(`Widget "${widgetName}" supprimé`, 'success');
    }

    /**
     * Rôle : Basculer l'affichage de la grille
     * Type : UI toggle - Visual guides
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        
        if (this.showGrid) {
            this.elements.widgetGrid.classList.add('show-grid');
            document.getElementById('gridToggle').classList.add('active');
            this.setStatus('Grille d\'alignement activée', 'info');
        } else {
            this.elements.widgetGrid.classList.remove('show-grid');
            document.getElementById('gridToggle').classList.remove('active');
            this.setStatus('Grille d\'alignement désactivée', 'info');
        }
    }
    
    /**
     * Rôle : Basculer l'affichage des guides
     * Type : UI toggle - Guides visuels
     */
    toggleGuides() {
        const guidesBtn = document.getElementById('guidesToggle');
        const isActive = guidesBtn.classList.contains('active');
        
        if (isActive) {
            guidesBtn.classList.remove('active');
            this.setStatus('Guides désactivés', 'info');
        } else {
            guidesBtn.classList.add('active');
            this.setStatus('Guides activés', 'info');
        }
    }
    
    /**
     * Rôle : Sauvegarde du projet
     * Type : Data persistence - Export local
     */
    saveProject() {
        const projectData = {
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            widgets: Array.from(this.widgetContainers.entries()).map(([id, data]) => ({
                id: id,
                type: data.widgetType,
                position: { ...data.position },
                properties: { ...data.widgetInstance.defaultData }
            }))
        };
        
        // Rôle : Téléchargement du fichier JSON
        // Type : File download
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `widget-project-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.setStatus('Projet sauvegardé', 'success');
    }
    
    /**
     * Rôle : Export du projet
     * Type : HTML generation - Export complet
     */
    exportProject() {
        let htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widgets Export\u00e9s - Li-CUBE PRO\u2122</title>
    <link rel="stylesheet" href="../assets/css/themes.css">
</head>
<body>
    <div style="padding: 2rem;">
        <h1>Widgets Export\u00e9s</h1>
`;
        
        // Rôle : Génération du HTML de chaque widget
        // Type : Widget serialization
        this.widgetContainers.forEach((data, id) => {
            const widgetContent = this.renderWidgetContent(data.widgetInstance);
            htmlContent += `
        <div style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #ccc; border-radius: 8px;">
            <h3>${data.widgetInstance.name}</h3>
            ${widgetContent}
        </div>
            `;
        });
        
        htmlContent += `
    </div>
</body>
</html>`;
        
        // Rôle : Téléchargement du HTML
        // Type : File download
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `widgets-export-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.setStatus('Export HTML généré', 'success');
    }
}

// Instance globale de l'éditeur
const widgetEditor = new WidgetEditor();

// Exposition globale pour développement
if (typeof window !== 'undefined') {
    window.widgetEditor = widgetEditor;
}

export default widgetEditor;
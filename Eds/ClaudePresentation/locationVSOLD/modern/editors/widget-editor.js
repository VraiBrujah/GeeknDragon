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

class WidgetEditor {
    constructor() {
        // État de l'éditeur - Variables de travail
        this.currentWidget = null;
        this.currentWidgetType = null;
        this.widgetData = {};
        this.zoomLevel = 100;
        this.isDragging = false;
        this.draggedWidget = null;
        
        // Historique des modifications - Système undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Éléments DOM - Références des composants UI
        this.elements = {
            widgetLibrary: document.getElementById('widgetLibrary'),
            widgetPreview: document.getElementById('widgetPreview'),
            dropZone: document.getElementById('dropZone'),
            propertiesContent: document.getElementById('propertiesContent'),
            statusText: document.getElementById('statusText'),
            statusIndicator: document.getElementById('statusIndicator'),
            widgetCount: document.getElementById('widgetCount'),
            canvasSize: document.getElementById('canvasSize'),
            zoomLevel: document.getElementById('zoomLevel')
        };
        
        // Configuration drag & drop - Paramètres de glisser-déposer
        this.dragConfig = {
            dragClass: 'dragging',
            hoverClass: 'drag-hover',
            activeClass: 'active'
        };
        
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
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('saveBtn').addEventListener('click', () => this.saveWidget());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportWidget());
        document.getElementById('previewBtn').addEventListener('click', () => this.togglePreview());
        
        // Événements de zoom - Canvas controls
        document.getElementById('zoomIn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOut').addEventListener('click', () => this.zoomOut());
        document.getElementById('zoomFit').addEventListener('click', () => this.zoomToFit());
        
        // Événements drag & drop - Glisser-déposer
        this.setupDragAndDrop();
        
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
     * Rôle : Configuration du drag & drop
     * Type : Drag and drop setup - Système glisser-déposer
     */
    setupDragAndDrop() {
        // Configuration drop zone - Zone de dépôt
        const dropZone = this.elements.dropZone;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add(this.dragConfig.activeClass);
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove(this.dragConfig.activeClass);
            }
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove(this.dragConfig.activeClass);
            
            // Récupération des données - Widget info
            const widgetType = e.dataTransfer.getData('text/widget-type');
            if (widgetType) {
                this.addWidget(widgetType);
            }
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
     * Rôle : Création d'un item de widget
     * Type : DOM creation - Élément draggable
     * Retour : Element HTML du widget item
     */
    createWidgetItem(widget) {
        const item = document.createElement('div');
        item.className = 'widget-item';
        item.draggable = true;
        item.dataset.widgetType = widget.type;
        
        // Configuration drag - Données de transport
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/widget-type', widget.type);
            item.classList.add(this.dragConfig.dragClass);
            this.draggedWidget = widget.type;
            this.setStatus(`Glissement de ${widget.name}...`, 'info');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove(this.dragConfig.dragClass);
            this.draggedWidget = null;
            this.setStatus('Prêt', 'success');
        });
        
        // Double-click pour ajout rapide - Quick add
        item.addEventListener('dblclick', () => {
            this.addWidget(widget.type);
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
     * Rôle : Ajout d'un widget au canvas
     * Type : Widget management - Ajout et configuration
     */
    async addWidget(widgetType, data = {}) {
        try {
            this.setStatus(`Ajout du widget ${widgetType}...`, 'loading');
            
            // Sauvegarde de l'état - Historique pour undo
            this.saveToHistory('add_widget', `Ajout widget ${widgetType}`);
            
            // Chargement du widget - Instance du composant
            const widgetInstance = this.availableWidgets.get(widgetType);
            if (!widgetInstance) {
                throw new Error(`Widget ${widgetType} non trouvé`);
            }
            
            // Configuration du widget - Données initiales
            const widgetData = { ...widgetInstance.defaultData, ...data };
            
            // Mise à jour de l'état - Variables d'édition
            this.currentWidget = widgetInstance;
            this.currentWidgetType = widgetType;
            this.widgetData = widgetData;
            
            // Rendu du widget - Affichage dans le canvas
            await this.renderWidgetPreview();
            
            // Rendu des propriétés - Panneau de configuration
            this.renderWidgetProperties();
            
            // Mise à jour du statut - Interface feedback
            this.updateStatus();
            this.setStatus(`Widget ${widgetInstance.name} ajouté`, 'success');
            
        } catch (error) {
            console.error('Erreur ajout widget:', error);
            this.setStatus(`Erreur: ${error.message}`, 'error');
        }
    }

    /**
     * Rôle : Rendu de l'aperçu du widget
     * Type : Widget rendering - Affichage dans le canvas
     */
    async renderWidgetPreview() {
        const preview = this.elements.widgetPreview;
        
        if (!this.currentWidget) {
            // État vide - Aucun widget sélectionné
            preview.className = 'widget-preview empty';
            preview.innerHTML = `
                <div class="drop-zone" id="dropZone">
                    <div class="drop-indicator">
                        <i class="fas fa-plus"></i>
                        Déposez un widget ici
                    </div>
                </div>
                <div class="empty-icon">
                    <i class="fas fa-puzzle-piece"></i>
                </div>
                <div class="empty-text">
                    <strong>Aucun widget sélectionné</strong><br>
                    Glissez un widget depuis la bibliothèque pour commencer
                </div>
            `;
            
            // Re-setup du drop zone
            this.setupDragAndDrop();
            return;
        }
        
        try {
            // Rendu du widget - Génération HTML/CSS
            const result = await widgetLoader.renderWidget(this.currentWidgetType, this.widgetData);
            
            // Application du contenu - HTML dans le canvas
            preview.className = 'widget-preview';
            preview.innerHTML = `
                <div class="widget-container">
                    ${result.html}
                </div>
                <style>
                    ${result.styles}
                </style>
            `;
            
            // Application des comportements - JavaScript interactif
            if (this.currentWidget.attachBehavior) {
                const widgetElement = preview.querySelector('.widget-container');
                this.currentWidget.attachBehavior(widgetElement);
            }
            
            // Application du zoom - Transformation CSS
            this.applyZoom();
            
        } catch (error) {
            console.error('Erreur rendu widget:', error);
            preview.innerHTML = `
                <div class="widget-error">
                    <div class="error-icon">❌</div>
                    <div class="error-title">Erreur de Rendu</div>
                    <div class="error-message">${error.message}</div>
                </div>
            `;
        }
    }

    /**
     * Rôle : Rendu du panneau de propriétés
     * Type : Properties UI - Interface de configuration
     */
    renderWidgetProperties() {
        const content = this.elements.propertiesContent;
        
        if (!this.currentWidget) {
            content.innerHTML = `
                <div class="properties-empty">
                    <i class="fas fa-info-circle" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <p>Sélectionnez un widget pour voir ses propriétés</p>
                </div>
            `;
            return;
        }
        
        // Récupération des champs - Configuration du widget
        const editableFields = this.currentWidget.getEditableFields();
        
        // Génération du formulaire - Interface de propriétés
        let html = `
            <div class="property-group">
                <div class="group-title">Informations Générales</div>
                <div class="property-field">
                    <label class="field-label">Type de Widget</label>
                    <div class="field-value">${this.currentWidget.name}</div>
                </div>
                <div class="property-field">
                    <label class="field-label">Catégorie</label>
                    <div class="field-value">${this.currentWidget.category}</div>
                </div>
            </div>
            
            <div class="property-group">
                <div class="group-title">Configuration</div>
        `;
        
        // Génération des champs - Formulaire dynamique
        editableFields.forEach(field => {
            html += this.generateFieldHTML(field);
        });
        
        html += `
            </div>
            
            <div class="widget-actions">
                <button class="action-btn primary" onclick="widgetEditor.saveWidget()">
                    <i class="fas fa-save"></i>
                    Sauvegarder
                </button>
                <button class="action-btn" onclick="widgetEditor.duplicateWidget()">
                    <i class="fas fa-copy"></i>
                    Dupliquer
                </button>
                <button class="action-btn danger" onclick="widgetEditor.removeWidget()">
                    <i class="fas fa-trash"></i>
                    Supprimer
                </button>
            </div>
        `;
        
        content.innerHTML = html;
        
        // Configuration des événements - Champs interactifs
        this.setupPropertyEvents();
    }

    /**
     * Rôle : Génération HTML d'un champ de propriété
     * Type : Form generation - Création de champs
     * Retour : String HTML du champ
     */
    generateFieldHTML(field) {
        const currentValue = this.widgetData[field.id] || field.default || '';
        const fieldId = `field-${field.id}`;
        
        let inputHTML = '';
        
        // Génération selon le type - Types de champs supportés
        switch (field.type) {
            case 'text':
                inputHTML = `<input type="text" class="field-input" id="${fieldId}" value="${currentValue}" maxlength="${field.maxLength || ''}" ${field.required ? 'required' : ''}>`;
                break;
                
            case 'textarea':
                inputHTML = `<textarea class="field-input field-textarea" id="${fieldId}" maxlength="${field.maxLength || ''}" ${field.required ? 'required' : ''}>${currentValue}</textarea>`;
                break;
                
            case 'number':
                inputHTML = `<input type="number" class="field-input" id="${fieldId}" value="${currentValue}" min="${field.min || ''}" max="${field.max || ''}" step="${field.step || '1'}" ${field.required ? 'required' : ''}>`;
                break;
                
            case 'select':
                const options = field.options.map(opt => 
                    `<option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                inputHTML = `<select class="field-input field-select" id="${fieldId}" ${field.required ? 'required' : ''}>${options}</select>`;
                break;
                
            case 'checkbox':
                inputHTML = `<input type="checkbox" class="field-checkbox" id="${fieldId}" ${currentValue ? 'checked' : ''}> <label for="${fieldId}">Activer</label>`;
                break;
                
            case 'color':
                inputHTML = `<input type="color" class="field-input field-color" id="${fieldId}" value="${currentValue || '#10B981'}">`;
                break;
                
            case 'range':
                inputHTML = `<input type="range" class="field-input field-range" id="${fieldId}" value="${currentValue}" min="${field.min || 0}" max="${field.max || 100}" step="${field.step || 1}">`;
                break;
                
            case 'url':
                inputHTML = `<input type="url" class="field-input" id="${fieldId}" value="${currentValue}" placeholder="https://..." ${field.required ? 'required' : ''}>`;
                break;
                
            case 'image':
                inputHTML = `
                    <input type="text" class="field-input" id="${fieldId}" value="${currentValue}" placeholder="Chemin vers l'image" ${field.required ? 'required' : ''}>
                    <button type="button" class="btn btn-sm" style="margin-top: 0.5rem;" onclick="widgetEditor.selectImage('${fieldId}')">
                        <i class="fas fa-folder-open"></i> Parcourir
                    </button>
                `;
                break;
                
            default:
                inputHTML = `<input type="text" class="field-input" id="${fieldId}" value="${currentValue}">`;
        }
        
        return `
            <div class="property-field">
                <label class="field-label" for="${fieldId}">${field.name}</label>
                ${inputHTML}
                ${field.description ? `<div class="field-help">${field.description}</div>` : ''}
            </div>
        `;
    }

    /**
     * Rôle : Configuration des événements des propriétés
     * Type : Event setup - Listeners sur les champs
     */
    setupPropertyEvents() {
        // Écoute des changements - Live updates
        const inputs = this.elements.propertiesContent.querySelectorAll('.field-input, .field-checkbox');
        
        inputs.forEach(input => {
            const fieldId = input.id.replace('field-', '');
            
            // Événement de changement - Update en temps réel
            const updateValue = () => {
                let value;
                
                if (input.type === 'checkbox') {
                    value = input.checked;
                } else if (input.type === 'number' || input.type === 'range') {
                    value = parseFloat(input.value) || 0;
                } else {
                    value = input.value;
                }
                
                // Mise à jour des données - État du widget
                this.widgetData[fieldId] = value;
                
                // Validation en temps réel - Feedback utilisateur
                this.validateField(fieldId, value);
                
                // Re-rendu du widget - Aperçu mis à jour
                this.renderWidgetPreview();
            };
            
            // Différents types d'événements - Réactivité
            input.addEventListener('input', updateValue);
            input.addEventListener('change', updateValue);
        });
    }

    /**
     * Rôle : Validation d'un champ
     * Type : Field validation - Contrôle de saisie
     */
    validateField(fieldId, value) {
        const field = this.currentWidget.getEditableFields().find(f => f.id === fieldId);
        if (!field) return true;
        
        const input = document.getElementById(`field-${fieldId}`);
        let isValid = true;
        let errorMessage = '';
        
        // Validation selon le type - Règles spécifiques
        if (field.required && (!value || value.toString().trim() === '')) {
            isValid = false;
            errorMessage = `${field.name} est requis`;
        }
        
        if (field.maxLength && value.toString().length > field.maxLength) {
            isValid = false;
            errorMessage = `${field.name} ne peut pas dépasser ${field.maxLength} caractères`;
        }
        
        if (field.min !== undefined && value < field.min) {
            isValid = false;
            errorMessage = `${field.name} doit être supérieur ou égal à ${field.min}`;
        }
        
        if (field.max !== undefined && value > field.max) {
            isValid = false;
            errorMessage = `${field.name} doit être inférieur ou égal à ${field.max}`;
        }
        
        // Application du style - Feedback visuel
        if (input) {
            input.classList.toggle('error', !isValid);
            
            // Affichage du message - Tooltip d'erreur
            if (!isValid) {
                input.title = errorMessage;
                input.style.borderColor = 'var(--danger-red)';
            } else {
                input.title = '';
                input.style.borderColor = '';
            }
        }
        
        return isValid;
    }

    /**
     * Rôle : Sauvegarde du widget actuel
     * Type : Widget persistence - Exportation des données
     */
    saveWidget() {
        if (!this.currentWidget) {
            this.setStatus('Aucun widget à sauvegarder', 'warning');
            return;
        }
        
        try {
            // Validation complète - Vérification des données
            const validation = this.currentWidget.validate 
                ? this.currentWidget.validate(this.widgetData)
                : { isValid: true, errors: [] };
            
            if (!validation.isValid) {
                this.setStatus(`Erreurs de validation: ${validation.errors.join(', ')}`, 'error');
                return;
            }
            
            // Génération des données - Export du widget
            const widgetExport = {
                type: this.currentWidgetType,
                name: this.currentWidget.name,
                data: this.widgetData,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            };
            
            // Sauvegarde locale - localStorage
            const widgetId = `custom-widget-${Date.now()}`;
            localStorage.setItem(widgetId, JSON.stringify(widgetExport));
            
            // Sauvegarde dans l'historique - Undo system
            this.saveToHistory('save_widget', `Sauvegarde widget ${this.currentWidget.name}`);
            
            this.setStatus('Widget sauvegardé avec succès', 'success');
            
            // Événement personnalisé - Notification système
            window.dispatchEvent(new CustomEvent('widgetSaved', {
                detail: { widgetId, widgetExport }
            }));
            
        } catch (error) {
            console.error('Erreur sauvegarde widget:', error);
            this.setStatus(`Erreur de sauvegarde: ${error.message}`, 'error');
        }
    }

    /**
     * Rôle : Export du widget vers fichier
     * Type : File export - Génération de fichier
     */
    exportWidget() {
        if (!this.currentWidget) {
            this.setStatus('Aucun widget à exporter', 'warning');
            return;
        }
        
        try {
            // Génération du code - JavaScript du widget
            const widgetCode = this.generateWidgetCode();
            
            // Téléchargement automatique - Création du fichier
            const blob = new Blob([widgetCode], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.currentWidgetType}-custom.js`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            
            this.setStatus('Widget exporté avec succès', 'success');
            
        } catch (error) {
            console.error('Erreur export widget:', error);
            this.setStatus(`Erreur d'export: ${error.message}`, 'error');
        }
    }

    /**
     * Rôle : Génération du code JavaScript du widget
     * Type : Code generation - Export template
     * Retour : String code JavaScript du widget
     */
    generateWidgetCode() {
        const className = `Custom${this.currentWidget.name.replace(/\s+/g, '')}Widget`;
        
        return `/**
 * Widget personnalisé généré par l'éditeur Li-CUBE PRO™
 * Type: ${this.currentWidgetType}
 * Généré le: ${new Date().toLocaleDateString('fr-FR')}
 */

class ${className} {
    constructor() {
        this.id = '${this.currentWidgetType}-custom';
        this.name = '${this.currentWidget.name} (Personnalisé)';
        this.category = '${this.currentWidget.category}';
        this.icon = '${this.currentWidget.icon}';
        this.description = 'Widget personnalisé basé sur ${this.currentWidget.name}';
        
        this.defaultData = ${JSON.stringify(this.widgetData, null, 8)};
    }

    render(data = {}) {
        const widgetData = { ...this.defaultData, ...data };
        
        // Template HTML généré
        return \`${this.generateTemplateString()}\`;
    }

    getStyles() {
        return \`${this.currentWidget.getStyles ? this.currentWidget.getStyles() : ''}\`;
    }

    getEditableFields() {
        return ${JSON.stringify(this.currentWidget.getEditableFields(), null, 8)};
    }

    validate(data) {
        ${this.currentWidget.validate ? this.currentWidget.validate.toString() : 'return { isValid: true, errors: [] };'}
    }
}

export default ${className};`;
    }

    /**
     * Rôle : Génération du template string
     * Type : Template generation - HTML du widget
     * Retour : String template HTML
     */
    generateTemplateString() {
        // Récupération du HTML généré
        const previewElement = this.elements.widgetPreview.querySelector('.widget-container');
        if (!previewElement) return '';
        
        // Nettoyage du HTML - Suppression des attributs d'édition
        const cleanHTML = previewElement.innerHTML
            .replace(/\s*data-field="[^"]*"/g, '')
            .replace(/\s*data-widget="[^"]*"/g, '')
            .replace(/\s*data-widget-id="[^"]*"/g, '')
            .replace(/\s*contenteditable="[^"]*"/g, '')
            .replace(/\s*class="([^"]*\s+)?editable(\s+[^"]*)?"/, ' class="$1$2"')
            .replace(/\s*class=""\s*/g, ' ')
            .trim();
        
        return cleanHTML;
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
        const preview = this.elements.widgetPreview;
        const scale = this.zoomLevel / 100;
        
        preview.style.transform = `scale(${scale})`;
        preview.style.transformOrigin = 'center top';
        
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
            widgetType: this.currentWidgetType,
            widgetData: JSON.parse(JSON.stringify(this.widgetData))
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
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreFromHistory();
        }
    }

    /**
     * Rôle : Restauration depuis l'historique
     * Type : History restoration - État précédent
     */
    restoreFromHistory() {
        const snapshot = this.history[this.historyIndex];
        if (!snapshot) return;
        
        // Restauration de l'état - Données du widget
        this.currentWidgetType = snapshot.widgetType;
        this.widgetData = JSON.parse(JSON.stringify(snapshot.widgetData));
        
        if (this.currentWidgetType) {
            this.currentWidget = this.availableWidgets.get(this.currentWidgetType);
        }
        
        // Mise à jour de l'interface - Re-rendu
        this.renderWidgetPreview();
        this.renderWidgetProperties();
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
                case 's':
                    e.preventDefault();
                    this.saveWidget();
                    break;
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
                if (this.currentWidget) {
                    this.removeWidget();
                }
                break;
            case 'Escape':
                this.clearWidget();
                break;
        }
    }

    /**
     * Rôle : Suppression du widget actuel
     * Type : Widget management - Suppression
     */
    removeWidget() {
        if (!this.currentWidget) return;
        
        if (confirm(`Êtes-vous sûr de vouloir supprimer le widget "${this.currentWidget.name}" ?`)) {
            this.saveToHistory('remove_widget', `Suppression widget ${this.currentWidget.name}`);
            this.clearWidget();
            this.setStatus('Widget supprimé', 'info');
        }
    }

    /**
     * Rôle : Nettoyage du canvas
     * Type : Canvas management - État vide
     */
    clearWidget() {
        this.currentWidget = null;
        this.currentWidgetType = null;
        this.widgetData = {};
        
        this.renderWidgetPreview();
        this.renderWidgetProperties();
        this.updateStatus();
    }

    /**
     * Rôle : Duplication du widget actuel
     * Type : Widget management - Copie
     */
    duplicateWidget() {
        if (!this.currentWidget) return;
        
        // Création d'une copie - Nouvelle instance
        const duplicatedData = JSON.parse(JSON.stringify(this.widgetData));
        duplicatedData.name = `${duplicatedData.name || this.currentWidget.name} (Copie)`;
        
        this.saveToHistory('duplicate_widget', `Duplication widget ${this.currentWidget.name}`);
        this.widgetData = duplicatedData;
        
        this.renderWidgetPreview();
        this.renderWidgetProperties();
        this.setStatus('Widget dupliqué', 'success');
    }

    /**
     * Rôle : Sélection d'image
     * Type : File selection - Sélecteur de fichier
     */
    selectImage(fieldId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Création d'une URL temporaire - Preview de l'image
                const url = URL.createObjectURL(file);
                
                // Mise à jour du champ - Path de l'image
                const fieldInput = document.getElementById(fieldId);
                if (fieldInput) {
                    fieldInput.value = url;
                    fieldInput.dispatchEvent(new Event('input'));
                }
            }
        });
        
        input.click();
    }

    /**
     * Rôle : Mise à jour du statut global
     * Type : Status management - État de l'interface
     */
    updateStatus() {
        // Compteur de widgets - Affichage info
        this.elements.widgetCount.textContent = this.currentWidget ? '1' : '0';
        
        // Taille du canvas - Dimensions actuelles
        const preview = this.elements.widgetPreview;
        const rect = preview.getBoundingClientRect();
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
}

// Instance globale de l'éditeur
const widgetEditor = new WidgetEditor();

// Exposition globale pour développement
if (typeof window !== 'undefined') {
    window.widgetEditor = widgetEditor;
}

export default widgetEditor;
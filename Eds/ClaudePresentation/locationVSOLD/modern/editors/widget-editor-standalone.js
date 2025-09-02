/**
 * ============================================================================
 * WIDGET EDITOR STANDALONE - Version sans modules ES6
 * ============================================================================
 */

class WidgetEditor {
    constructor() {
        // État de l'éditeur
        this.zoomLevel = 100;
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        // Éléments DOM
        this.elements = {};
        
        // État de la grille
        this.widgetContainers = new Map();
        this.selectedContainer = null;
        this.gridSize = { cols: 12, rows: 8 };
        this.showGrid = false;
        this.nextWidgetId = 1;
        
        // Widgets disponibles - intégrés directement
        this.availableWidgets = new Map([
            ['logo', LogoWidget],
            ['hero-title', HeroTitleWidget],
            ['pricing-card', PricingCardWidget]
        ]);

        // Catégories de widgets
        this.widgetCategories = {
            'Navigation': [
                {
                    type: 'logo',
                    name: 'Logo',
                    icon: '🏢',
                    description: 'Logo avec image et effets hover',
                    category: 'Navigation',
                    class: LogoWidget
                }
            ],
            'Contenu': [
                {
                    type: 'hero-title',
                    name: 'Titre Hero',
                    icon: '✨',
                    description: 'Titre principal avec gradient',
                    category: 'Contenu',
                    class: HeroTitleWidget
                }
            ],
            'Commerce': [
                {
                    type: 'pricing-card',
                    name: 'Carte Tarification',
                    icon: '💰',
                    description: 'Carte de prix avec fonctionnalités',
                    category: 'Commerce',
                    class: PricingCardWidget
                }
            ]
        };
        
        // Initialisation après DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        // Initialisation des éléments DOM
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

        try {
            this.setupEventListeners();
            this.renderWidgetLibrary();
            this.setStatus('Éditeur prêt', 'success');
        } catch (error) {
            console.error('Erreur initialisation:', error);
            this.setStatus('Erreur d\'initialisation', 'error');
        }
    }

    setupEventListeners() {
        // Boutons principaux
        const createBtn = document.getElementById('createWidgetBtn');
        const firstBtn = document.getElementById('firstWidgetBtn');
        
        if (createBtn) createBtn.addEventListener('click', () => this.showCreateWidgetDialog());
        if (firstBtn) firstBtn.addEventListener('click', () => this.showCreateWidgetDialog());

        // Boutons de la barre d'outils
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        const saveBtn = document.getElementById('saveBtn');
        const exportBtn = document.getElementById('exportBtn');

        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveProject());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportProject());

        // Contrôles zoom
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const zoomFitBtn = document.getElementById('zoomFit');

        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomIn());
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomOut());
        if (zoomFitBtn) zoomFitBtn.addEventListener('click', () => this.zoomToFit());

        // Contrôles grille
        const gridToggle = document.getElementById('gridToggle');
        const guidesToggle = document.getElementById('guidesToggle');

        if (gridToggle) gridToggle.addEventListener('click', () => this.toggleGrid());
        if (guidesToggle) guidesToggle.addEventListener('click', () => this.toggleGuides());

        // Recherche
        const searchInput = document.getElementById('widgetSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterWidgets(e.target.value));
        }

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    renderWidgetLibrary() {
        if (!this.elements.widgetLibrary) return;
        
        this.elements.widgetLibrary.innerHTML = '';
        
        Object.entries(this.widgetCategories).forEach(([category, widgets]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'widget-category';
            
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            widgets.forEach(widget => {
                const widgetItem = this.createWidgetItem(widget);
                categoryDiv.appendChild(widgetItem);
            });
            
            this.elements.widgetLibrary.appendChild(categoryDiv);
        });
    }

    createWidgetItem(widget) {
        const item = document.createElement('div');
        item.className = 'widget-item';
        item.dataset.widgetType = widget.type;
        
        item.addEventListener('click', () => {
            this.showCreateWidgetDialog(widget.type);
            this.setStatus(`Création de ${widget.name}...`, 'info');
        });
        
        item.innerHTML = `
            <div class="widget-icon">${widget.icon}</div>
            <div class="widget-info">
                <div class="widget-name">${widget.name}</div>
                <div class="widget-description">${widget.description}</div>
            </div>
        `;
        
        return item;
    }

    showCreateWidgetDialog(preselectedType = null) {
        let widgetOptions = '';
        
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
                        <label>Position sur la Grille</label>
                        <div class="position-controls">
                            <div class="position-group">
                                <label>Colonne (1-12)</label>
                                <input type="number" id="startColInput" min="1" max="12" value="1" class="form-control">
                            </div>
                            <div class="position-group">
                                <label>Rangée (1-8)</label>
                                <input type="number" id="startRowInput" min="1" max="8" value="1" class="form-control">
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Taille du Widget</label>
                        <div class="size-controls">
                            <div class="size-group">
                                <label>Largeur (colonnes)</label>
                                <input type="number" id="widthInput" min="1" max="12" value="4" class="form-control">
                            </div>
                            <div class="size-group">
                                <label>Hauteur (rangées)</label>
                                <input type="number" id="heightInput" min="1" max="8" value="2" class="form-control">
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
            
            <style>
                .create-widget-dialog {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000;
                    font-family: var(--font-primary);
                }
                .dialog-overlay {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px);
                }
                .dialog-content {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    background: var(--bg-secondary); border: 1px solid var(--border-color);
                    border-radius: var(--border-radius); width: 90%; max-width: 500px;
                    max-height: 90vh; overflow-y: auto; box-shadow: var(--shadow-xl);
                }
                .dialog-header {
                    padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color);
                    display: flex; align-items: center; justify-content: space-between;
                    background: var(--bg-card);
                }
                .dialog-header h3 {
                    color: var(--text-white); margin: 0; display: flex; align-items: center; gap: 0.5rem;
                }
                .dialog-header h3 i { color: var(--accent-green); }
                .dialog-close {
                    background: none; border: none; color: var(--text-muted);
                    cursor: pointer; padding: 0.5rem; border-radius: var(--border-radius);
                }
                .dialog-close:hover { background: var(--bg-primary); color: var(--text-white); }
                .dialog-body { padding: 1.5rem; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label {
                    display: block; color: var(--text-white); font-weight: var(--font-medium);
                    margin-bottom: 0.5rem;
                }
                .form-control {
                    width: 100%; padding: 0.75rem; background: var(--bg-input);
                    border: 1px solid var(--border-color); border-radius: var(--border-radius);
                    color: var(--text-white); font-size: var(--text-sm);
                }
                .position-controls, .size-controls {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
                }
                .position-group, .size-group {
                    background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius);
                }
                .position-group label, .size-group label {
                    font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 0.5rem;
                }
                .dialog-footer {
                    padding: 1rem 1.5rem; border-top: 1px solid var(--border-color);
                    display: flex; gap: 1rem; justify-content: flex-end; background: var(--bg-card);
                }
            </style>
        `;

        document.body.appendChild(dialog);

        // Event listeners pour la dialog
        const widgetTypeSelect = dialog.querySelector('#widgetTypeSelect');
        const createBtn = dialog.querySelector('#createWidgetConfirm');

        widgetTypeSelect.addEventListener('change', () => {
            createBtn.disabled = !widgetTypeSelect.value;
        });

        createBtn.addEventListener('click', () => {
            this.createWidgetContainer(dialog);
        });

        this.setStatus('Interface de création ouverte', 'info');
    }

    createWidgetContainer(dialog) {
        const widgetType = dialog.querySelector('#widgetTypeSelect').value;
        const width = parseInt(dialog.querySelector('#widthInput').value);
        const height = parseInt(dialog.querySelector('#heightInput').value);
        const startCol = parseInt(dialog.querySelector('#startColInput').value);
        const startRow = parseInt(dialog.querySelector('#startRowInput').value);

        if (!widgetType) {
            alert('⚠️ Veuillez sélectionner un type de widget !');
            return;
        }

        // Vérification des limites
        if (startCol + width > 13 || startRow + height > 9) {
            alert('⚠️ Le widget dépasse les limites de la grille !');
            return;
        }

        // Vérification de collision
        if (this.isGridSpaceOccupied(startCol, startRow, width, height)) {
            alert('⚠️ Cette zone est déjà occupée par un autre widget !');
            return;
        }

        // Création de l'instance du widget
        const WidgetClass = this.availableWidgets.get(widgetType);
        if (!WidgetClass) {
            alert('❌ Type de widget invalide !');
            return;
        }

        const widgetInstance = new WidgetClass();
        const containerId = `widget-container-${this.nextWidgetId++}`;
        
        // Création du conteneur
        const container = this.createWidgetContainerElement(
            containerId, 
            widgetType, 
            widgetInstance,
            { startCol, startRow, width, height }
        );

        // Placement sur la grille
        container.style.gridColumnStart = startCol;
        container.style.gridColumnEnd = startCol + width;
        container.style.gridRowStart = startRow;
        container.style.gridRowEnd = startRow + height;

        // Ajout à la grille
        this.elements.widgetGrid.appendChild(container);
        this.widgetContainers.set(containerId, {
            element: container,
            widgetType: widgetType,
            widgetInstance: widgetInstance,
            position: { startCol, startRow, width, height }
        });

        // Masquer l'état vide
        if (this.widgetContainers.size === 1) {
            this.elements.emptyState.classList.add('hidden');
        }

        // Sélection et fermeture
        this.selectContainer(container);
        dialog.remove();
        this.setStatus(`Widget ${widgetInstance.name} créé avec succès`, 'success');
        this.updateStatus();
    }

    createWidgetContainerElement(containerId, widgetType, widgetInstance, position) {
        const container = document.createElement('div');
        container.className = 'widget-container';
        container.id = containerId;
        container.dataset.widgetType = widgetType;

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
        `;

        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectContainer(container);
        });

        return container;
    }

    renderWidgetContent(widgetInstance) {
        try {
            return widgetInstance.render(widgetInstance.defaultData || {});
        } catch (error) {
            console.error('Erreur rendu widget:', error);
            return `
                <div style="color: #ef4444; text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <div>Erreur de rendu du widget</div>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    isGridSpaceOccupied(startCol, startRow, width, height) {
        for (const [containerId, containerData] of this.widgetContainers) {
            const pos = containerData.position;
            
            const noOverlap = (
                startCol >= pos.startCol + pos.width ||
                startCol + width <= pos.startCol ||
                startRow >= pos.startRow + pos.height ||
                startRow + height <= pos.startRow
            );
            
            if (!noOverlap) {
                return true;
            }
        }
        
        return false;
    }

    selectContainer(container) {
        if (this.selectedContainer) {
            this.selectedContainer.classList.remove('selected');
        }

        this.selectedContainer = container;
        container.classList.add('selected');
        
        this.updatePropertiesPanel(container);
        this.setStatus(`Widget sélectionné: ${container.querySelector('.widget-name').textContent}`, 'info');
    }

    updatePropertiesPanel(container) {
        if (!this.elements.propertiesContent) return;

        const containerId = container.id;
        const containerData = this.widgetContainers.get(containerId);
        
        if (!containerData) return;

        const position = containerData.position;
        const widgetInstance = containerData.widgetInstance;

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
                <div class="property-row">
                    <label>Position:</label>
                    <span>${position.startCol}, ${position.startRow}</span>
                </div>
                <div class="property-row">
                    <label>Taille:</label>
                    <span>${position.width} × ${position.height}</span>
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

    duplicateContainer(containerId) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        const originalPos = containerData.position;
        let newStartCol = originalPos.startCol + originalPos.width;
        let newStartRow = originalPos.startRow;

        // Recherche d'une position libre
        if (newStartCol + originalPos.width > 13) {
            newStartCol = 1;
            newStartRow = originalPos.startRow + originalPos.height;
        }

        if (newStartRow + originalPos.height > 9) {
            alert('⚠️ Impossible de dupliquer: pas assez d\'espace !');
            return;
        }

        if (this.isGridSpaceOccupied(newStartCol, newStartRow, originalPos.width, originalPos.height)) {
            alert('⚠️ Impossible de dupliquer: zone occupée !');
            return;
        }

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

        newContainer.style.gridColumnStart = newStartCol;
        newContainer.style.gridColumnEnd = newStartCol + originalPos.width;
        newContainer.style.gridRowStart = newStartRow;
        newContainer.style.gridRowEnd = newStartRow + originalPos.height;

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

        this.selectContainer(newContainer);
        this.setStatus('Widget dupliqué avec succès', 'success');
        this.updateStatus();
    }

    deleteContainer(containerId) {
        const containerData = this.widgetContainers.get(containerId);
        if (!containerData) return;

        const widgetName = containerData.element.querySelector('.widget-name').textContent;
        if (!confirm(`⚠️ Êtes-vous sûr de vouloir supprimer le widget "${widgetName}" ?\n\nCette action ne peut pas être annulée.`)) {
            return;
        }

        containerData.element.remove();
        this.widgetContainers.delete(containerId);

        if (this.selectedContainer && this.selectedContainer.id === containerId) {
            this.selectedContainer = null;
            this.elements.propertiesContent.innerHTML = `
                <div class="properties-empty">
                    <i class="fas fa-info-circle properties-empty-icon"></i>
                    <p>Sélectionnez un widget pour voir ses propriétés</p>
                </div>
            `;
        }

        if (this.widgetContainers.size === 0) {
            this.elements.emptyState.classList.remove('hidden');
        }

        this.setStatus(`Widget "${widgetName}" supprimé`, 'success');
        this.updateStatus();
    }

    // Fonctions de zoom
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

    applyZoom() {
        if (!this.elements.widgetGrid) return;
        
        const scale = this.zoomLevel / 100;
        this.elements.widgetGrid.style.transform = `scale(${scale})`;
        this.elements.widgetGrid.style.transformOrigin = 'center top';
        
        if (this.elements.zoomLevel) {
            this.elements.zoomLevel.textContent = `${this.zoomLevel}%`;
        }
    }

    // Grille et guides
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

    // Historique
    undo() {
        this.setStatus('Fonction d\'annulation pas encore implémentée', 'warning');
    }

    redo() {
        this.setStatus('Fonction de rétablissement pas encore implémentée', 'warning');
    }

    // Sauvegarde et export
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

    exportProject() {
        let htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widgets Exportés - Li-CUBE PRO™</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: white; }
        .widget { margin-bottom: 2rem; padding: 1rem; border: 1px solid #374151; border-radius: 8px; }
        h1 { color: #10b981; }
        h3 { color: #6b7280; }
    </style>
</head>
<body>
    <h1>Widgets Exportés - Li-CUBE PRO™</h1>
`;
        
        this.widgetContainers.forEach((data, id) => {
            const widgetContent = this.renderWidgetContent(data.widgetInstance);
            htmlContent += `
    <div class="widget">
        <h3>${data.widgetInstance.name}</h3>
        ${widgetContent}
    </div>
            `;
        });
        
        htmlContent += `
</body>
</html>`;
        
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

    // Filtrage des widgets
    filterWidgets(searchTerm) {
        if (!this.elements.widgetLibrary) return;

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
            const visibleItems = category.querySelectorAll('.widget-item:not([style*="display: none"])');
            category.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }

    // Gestion clavier
    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
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

    // Mise à jour de l'état
    updateStatus() {
        if (this.elements.widgetCount) {
            this.elements.widgetCount.textContent = this.widgetContainers.size.toString();
        }
        
        if (this.elements.widgetGrid && this.elements.canvasSize) {
            const rect = this.elements.widgetGrid.getBoundingClientRect();
            this.elements.canvasSize.textContent = `${Math.round(rect.width)}x${Math.round(rect.height)}`;
        }
    }

    setStatus(message, type = 'info') {
        if (this.elements.statusText) {
            this.elements.statusText.textContent = message;
        }
        
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = `status-indicator ${type}`;
        }
        
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                if (this.elements.statusText && this.elements.statusText.textContent === message) {
                    this.setStatus('Prêt', 'success');
                }
            }, 3000);
        }

        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Initialisation globale
const widgetEditor = new WidgetEditor();

// Exposition globale pour développement
if (typeof window !== 'undefined') {
    window.widgetEditor = widgetEditor;
}
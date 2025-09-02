/**
 * GRID.JS - CANVAS DE FOND INFINI (Canvas Présentation)
 * VERSION SCRIPT CLASSIQUE - Fonctionne sans serveur
 * 
 * 🎯 RÔLE PRINCIPAL : Canvas de fond infini où les widgets sont déposés
 * - Remplace l'ancien "Canvas Présentation" qui était un widget
 * - Fonctionne comme Figma/Canva : fond infini + widgets par-dessus
 * - Gestion navigation : zoom, pan, accrochage grille
 * - Zone de drop : widgets déposés depuis la banque ou double-clic
 * - Coordonnées : conversion écran ↔ grille pour positionnement widgets
 */

// Namespace global
window.WidgetEditor = window.WidgetEditor || {};

/**
 * Classe Grid - CANVAS DE FOND INFINI pour édition widgets
 * 
 * 🎨 Fonctionnalités Canvas de Fond :
 * - Navigation : Zoom (molette), Pan (clic-milieu/Alt+clic)
 * - Accrochage : Grille de points avec snap configurable  
 * - Drop Zone : Réception widgets depuis banque
 * - Création : Double-clic pour créer widget à la position
 * - Coordonnées : Conversion écran/grille pour positionnement
 * - Infini : Bounds très larges pour simulation espace infini
 */
window.WidgetEditor.Grid = class Grid {
    /**
     * Constructeur de la grille
     * @param {Editor} editor - Instance éditeur parent
     */
    constructor(editor) {
        // Référence éditeur parent
        this.editor = editor;
        
        // Configuration grille
        this.config = {
            // Taille de la grille de points (pixels)
            gridSize: 20,
            // Accrochage activé par défaut
            snapToGrid: true,
            // Taille d'accrochage (pixels)
            snapSize: 10,
            // Limites virtuelles (pixels) - très grandes pour "infini"
            bounds: {
                minX: -10000,
                maxX: 10000,
                minY: -10000,
                maxY: 10000
            },
            // Pan/déplacement de vue
            pan: { x: 0, y: 0 },
            // Zoom actuel
            zoom: 1.0,
            // Limites zoom
            zoomMin: 0.25,
            zoomMax: 4.0
        };
        
        // État de navigation et drop
        this.state = {
            isPanning: false,
            lastMousePos: { x: 0, y: 0 },
            isInitialized: false,
            isDragOver: false,
            dropFeedback: {
                active: false,
                x: 0,
                y: 0
            }
        };
        
        // Éléments DOM Canvas de Fond
        this.elements = {
            container: null,    // Conteneur principal
            grid: null,        // Grille de fond (drop zone)
            background: null,   // Arrière-plan pattern
            dropIndicator: null // Indicateur visuel drop
        };
        
        this.debugLog('Grid créée');
    }
    
    /**
     * Initialisation de la grille
     * Configuration événements et affichage initial
     */
    async init() {
        try {
            // Récupération éléments DOM depuis éditeur
            this.elements.container = this.editor.getElements().canvas;
            this.elements.grid = this.editor.getElements().grid;
            
            if (!this.elements.grid) {
                throw new Error('Élément grille non trouvé');
            }
            
            // Configuration arrière-plan de grille
            this.setupGridBackground();
            
            // Configuration événements navigation
            this.setupNavigationEvents();
            
            // Configuration drop zone (Canvas de Fond)
            this.setupCanvasDropZone();
            
            // Configuration création widgets
            this.setupWidgetCreation();
            
            // Position initiale centrée
            this.centerView();
            
            // Marquage comme initialisé
            this.state.isInitialized = true;
            
            this.debugLog('Grid initialisée');
            
        } catch (error) {
            console.error('❌ Erreur initialisation Grid:', error);
            throw error;
        }
    }
    
    /**
     * Configuration arrière-plan grille avec points
     * CSS background-image avec pattern répétitif
     */
    setupGridBackground() {
        const gridSize = this.config.gridSize;
        
        // Pattern SVG de grille de points
        const gridPattern = `
            <svg width="${gridSize}" height="${gridSize}" xmlns="http://www.w3.org/2000/svg">
                <circle cx="${gridSize/2}" cy="${gridSize/2}" r="1" fill="rgba(148, 163, 184, 0.3)"/>
            </svg>
        `;
        
        // Encode en base64 pour CSS
        const encodedPattern = btoa(gridPattern);
        
        // Application du pattern
        this.elements.grid.style.backgroundImage = `url('data:image/svg+xml;base64,${encodedPattern}')`;
        this.elements.grid.style.backgroundSize = `${gridSize}px ${gridSize}px`;
        this.elements.grid.style.backgroundPosition = '0 0';
        
        this.debugLog('Arrière-plan grille configuré');
    }
    
    /**
     * Configuration événements de navigation
     * Pan avec clic-milieu, zoom avec molette
     */
    setupNavigationEvents() {
        // Pan avec clic-milieu ou Alt+clic
        this.elements.grid.addEventListener('mousedown', (e) => {
            if (e.button === 1 || (e.button === 0 && e.altKey)) {
                e.preventDefault();
                this.startPan(e);
            }
        });
        
        // Zoom avec molette
        this.elements.grid.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e);
        });
        
        // Événements pan
        document.addEventListener('mousemove', (e) => {
            if (this.state.isPanning) {
                this.updatePan(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.endPan();
        });
        
        // Double-clic pour recentrer OU créer widget
        this.elements.grid.addEventListener('dblclick', (e) => {
            if (e.altKey) {
                // Alt+Double-clic : recentrer vue
                this.centerView();
            } else {
                // Double-clic normal : créer widget à la position
                this.createWidgetAtPosition(e);
            }
        });
    }
    
    /**
     * Démarrage pan/déplacement vue
     * @param {MouseEvent} e - Événement mousedown
     */
    startPan(e) {
        this.state.isPanning = true;
        this.state.lastMousePos = { x: e.clientX, y: e.clientY };
        
        // Changement curseur
        this.elements.grid.style.cursor = 'grabbing';
        
        // Classe CSS pour état panning
        this.elements.grid.classList.add('panning');
    }
    
    /**
     * Mise à jour déplacement vue
     * @param {MouseEvent} e - Événement mousemove
     */
    updatePan(e) {
        if (!this.state.isPanning) return;
        
        // Calcul déplacement
        const deltaX = e.clientX - this.state.lastMousePos.x;
        const deltaY = e.clientY - this.state.lastMousePos.y;
        
        // Mise à jour position pan
        this.config.pan.x += deltaX;
        this.config.pan.y += deltaY;
        
        // Application transformation
        this.applyTransform();
        
        // Sauvegarde position souris
        this.state.lastMousePos = { x: e.clientX, y: e.clientY };
    }
    
    /**
     * Fin déplacement vue
     */
    endPan() {
        if (!this.state.isPanning) return;
        
        this.state.isPanning = false;
        
        // Reset curseur
        this.elements.grid.style.cursor = 'default';
        this.elements.grid.classList.remove('panning');
        
        // Sauvegarde état
        this.editor.saveState();
    }
    
    /**
     * Gestion zoom avec molette
     * @param {WheelEvent} e - Événement wheel
     */
    handleZoom(e) {
        // Calcul facteur zoom
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = this.config.zoom * zoomFactor;
        
        // Vérification limites
        if (newZoom < this.config.zoomMin || newZoom > this.config.zoomMax) {
            return;
        }
        
        // Point de zoom (position souris)
        const rect = this.elements.grid.getBoundingClientRect();
        const centerX = e.clientX - rect.left;
        const centerY = e.clientY - rect.top;
        
        // Ajustement pan pour zoom centré sur souris
        this.config.pan.x = centerX - (centerX - this.config.pan.x) * zoomFactor;
        this.config.pan.y = centerY - (centerY - this.config.pan.y) * zoomFactor;
        
        // Application nouveau zoom
        this.setZoom(newZoom);
    }
    
    /**
     * Définition niveau de zoom
     * @param {number} zoom - Niveau zoom (0.25 à 4.0)
     */
    setZoom(zoom) {
        // Validation limites
        this.config.zoom = Math.max(this.config.zoomMin, 
                                   Math.min(this.config.zoomMax, zoom));
        
        // Application transformation
        this.applyTransform();
        
        // Mise à jour affichage éditeur
        this.editor.getState().config.currentZoom = this.config.zoom;
        this.editor.updateZoomDisplay();
        
        this.debugLog(`Zoom: ${Math.round(this.config.zoom * 100)}%`);
    }
    
    /**
     * Application transformation CSS combinée
     * Pan + Zoom sur la grille
     */
    applyTransform() {
        const transform = `translate(${this.config.pan.x}px, ${this.config.pan.y}px) scale(${this.config.zoom})`;
        
        // Application à la grille principale
        if (this.elements.grid) {
            this.elements.grid.style.transform = transform;
            this.elements.grid.style.transformOrigin = '0 0';
        }
        
        // Mise à jour taille pattern selon zoom
        this.updateGridPattern();
    }
    
    /**
     * Mise à jour pattern grille selon zoom
     * Adaptation visuelle pour lisibilité
     */
    updateGridPattern() {
        const effectiveSize = this.config.gridSize * this.config.zoom;
        
        // Masque grille si trop petite
        if (effectiveSize < 8) {
            this.elements.grid.style.backgroundImage = 'none';
        } else {
            this.setupGridBackground();
        }
    }
    
    /**
     * Centrage vue sur origine
     * Reset position et zoom
     */
    centerView() {
        this.config.pan.x = this.elements.grid.offsetWidth / 2;
        this.config.pan.y = this.elements.grid.offsetHeight / 2;
        this.setZoom(1.0);
        
        this.debugLog('Vue centrée');
    }
    
    /**
     * Zoom ajustement automatique
     * Affichage optimal widgets présents
     */
    fitToContent() {
        const widgets = this.editor.getWidgets();
        
        if (widgets.size === 0) {
            this.centerView();
            return;
        }
        
        // Calcul bounds de tous les widgets
        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;
        
        widgets.forEach(widget => {
            const pos = widget.getPosition();
            const dim = widget.getDimensions();
            
            minX = Math.min(minX, pos.x);
            minY = Math.min(minY, pos.y);
            maxX = Math.max(maxX, pos.x + dim.width);
            maxY = Math.max(maxY, pos.y + dim.height);
        });
        
        // Calcul centre et zoom optimal
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const contentWidth = maxX - minX + 100; // Marge
        const contentHeight = maxY - minY + 100;
        
        const viewWidth = this.elements.grid.offsetWidth;
        const viewHeight = this.elements.grid.offsetHeight;
        
        const zoomX = viewWidth / contentWidth;
        const zoomY = viewHeight / contentHeight;
        const optimalZoom = Math.min(zoomX, zoomY, 1.0); // Max 100%
        
        // Application centrage et zoom
        this.setZoom(optimalZoom);
        this.config.pan.x = viewWidth / 2 - centerX * this.config.zoom;
        this.config.pan.y = viewHeight / 2 - centerY * this.config.zoom;
        
        this.applyTransform();
        
        this.debugLog(`Ajustement contenu: zoom ${Math.round(optimalZoom * 100)}%`);
    }
    
    /**
     * Conversion coordonnées écran vers grille
     * Prise en compte pan et zoom
     * @param {number} screenX - Coordonnée X écran
     * @param {number} screenY - Coordonnée Y écran
     * @returns {Object} - Coordonnées grille {x, y}
     */
    screenToGrid(screenX, screenY) {
        const rect = this.elements.grid.getBoundingClientRect();
        
        // Coordonnées relatives au container
        const relativeX = screenX - rect.left;
        const relativeY = screenY - rect.top;
        
        // Prise en compte transformation
        const gridX = (relativeX - this.config.pan.x) / this.config.zoom;
        const gridY = (relativeY - this.config.pan.y) / this.config.zoom;
        
        return { x: gridX, y: gridY };
    }
    
    /**
     * Conversion coordonnées grille vers écran
     * @param {number} gridX - Coordonnée X grille
     * @param {number} gridY - Coordonnée Y grille
     * @returns {Object} - Coordonnées écran {x, y}
     */
    gridToScreen(gridX, gridY) {
        const rect = this.elements.grid.getBoundingClientRect();
        
        const screenX = rect.left + gridX * this.config.zoom + this.config.pan.x;
        const screenY = rect.top + gridY * this.config.zoom + this.config.pan.y;
        
        return { x: screenX, y: screenY };
    }
    
    /**
     * Accrochage coordonnées à la grille
     * @param {number} x - Coordonnée X
     * @param {number} y - Coordonnée Y
     * @returns {Object} - Coordonnées accrochées {x, y}
     */
    snapToGrid(x, y) {
        if (!this.config.snapToGrid) {
            return { x, y };
        }
        
        const snapSize = this.config.snapSize;
        
        return {
            x: Math.round(x / snapSize) * snapSize,
            y: Math.round(y / snapSize) * snapSize
        };
    }
    
    /**
     * Toggle accrochage grille
     */
    toggleSnap() {
        this.config.snapToGrid = !this.config.snapToGrid;
        
        // Mise à jour bouton interface
        const snapBtn = document.getElementById('btn-grid-snap');
        if (snapBtn) {
            snapBtn.classList.toggle('active', this.config.snapToGrid);
        }
        
        this.debugLog(`Accrochage grille: ${this.config.snapToGrid ? 'ON' : 'OFF'}`);
    }
    
    /**
     * Vérification validité position dans bounds
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @returns {boolean} - True si position valide
     */
    isValidPosition(x, y) {
        return x >= this.config.bounds.minX && 
               x <= this.config.bounds.maxX && 
               y >= this.config.bounds.minY && 
               y <= this.config.bounds.maxY;
    }
    
    /**
     * Contrainte position dans les bounds
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @returns {Object} - Position contrainte {x, y}
     */
    constrainToBounds(x, y) {
        return {
            x: Math.max(this.config.bounds.minX, 
                Math.min(this.config.bounds.maxX, x)),
            y: Math.max(this.config.bounds.minY, 
                Math.min(this.config.bounds.maxY, y))
        };
    }
    
    /**
     * Export configuration grille
     * @returns {Object} - Configuration sérialisable
     */
    exportConfig() {
        return {
            pan: { ...this.config.pan },
            zoom: this.config.zoom,
            snapToGrid: this.config.snapToGrid,
            snapSize: this.config.snapSize
        };
    }
    
    /**
     * Import configuration grille
     * @param {Object} config - Configuration à restaurer
     */
    importConfig(config) {
        if (config.pan) {
            this.config.pan = { ...config.pan };
        }
        if (config.zoom) {
            this.setZoom(config.zoom);
        }
        if (typeof config.snapToGrid === 'boolean') {
            this.config.snapToGrid = config.snapToGrid;
        }
        if (config.snapSize) {
            this.config.snapSize = config.snapSize;
        }
        
        // Application état restauré
        this.applyTransform();
    }
    
    // Getters pour interface externe
    getZoom() { return this.config.zoom; }
    getPan() { return { ...this.config.pan }; }
    getSnapEnabled() { return this.config.snapToGrid; }
    getSnapSize() { return this.config.snapSize; }
    getBounds() { return { ...this.config.bounds }; }
    
    // Setters pour interface externe
    setSnapEnabled(enabled) { 
        this.config.snapToGrid = enabled;
        this.toggleSnap();
    }
    
    setSnapSize(size) { 
        this.config.snapSize = Math.max(1, size);
    }
    
    // === CANVAS DE FOND - GESTION WIDGETS ===
    
    /**
     * Configuration du Canvas de Fond comme drop zone
     * Réception widgets depuis la banque
     */
    setupCanvasDropZone() {
        const grid = this.elements.grid;
        
        // === ÉVÉNEMENTS DRAG & DROP ===
        grid.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            
            // Feedback visuel position drop
            this.showDropFeedback(e);
        });
        
        grid.addEventListener('dragenter', (e) => {
            e.preventDefault();
            this.state.isDragOver = true;
            grid.classList.add('drag-over');
        });
        
        grid.addEventListener('dragleave', (e) => {
            // Vérifier si on quitte vraiment la grille
            if (!grid.contains(e.relatedTarget)) {
                this.state.isDragOver = false;
                grid.classList.remove('drag-over');
                this.hideDropFeedback();
            }
        });
        
        grid.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleCanvasDrop(e);
            
            // Nettoyage feedback
            this.state.isDragOver = false;
            grid.classList.remove('drag-over');
            this.hideDropFeedback();
        });
        
        this.debugLog('Canvas Drop Zone configuré');
    }
    
    /**
     * Configuration création widgets par double-clic
     */
    setupWidgetCreation() {
        // Déjà configuré dans setupNavigationEvents()
        // Double-clic sans Alt = créer widget
        this.debugLog('Création widgets par double-clic configurée');
    }
    
    /**
     * Gestion drop widget sur le Canvas de Fond
     * @param {DragEvent} e - Événement drop
     */
    handleCanvasDrop(e) {
        try {
            // Récupération données drag
            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
            
            if (dragData.type !== 'widget') {
                console.warn('[Grid] Drop non-widget ignoré');
                return;
            }
            
            // Calcul position grille
            const gridPos = this.screenToGrid(e.clientX, e.clientY);
            const snappedPos = this.snapToGrid(gridPos.x, gridPos.y);
            
            // Création widget à la position
            this.createWidgetOfType(dragData.widgetType, snappedPos.x, snappedPos.y);
            
            this.debugLog(`Widget ${dragData.widgetType} créé à (${snappedPos.x}, ${snappedPos.y})`);
            
        } catch (error) {
            console.error('[Grid] Erreur drop Canvas:', error);
        }
    }
    
    /**
     * Création widget par double-clic sur Canvas de Fond
     * @param {MouseEvent} e - Événement double-clic
     */
    createWidgetAtPosition(e) {
        // Position grille avec accrochage
        const gridPos = this.screenToGrid(e.clientX, e.clientY);
        const snappedPos = this.snapToGrid(gridPos.x, gridPos.y);
        
        // Création widget par défaut (WidgetCanvas)
        this.createWidgetOfType('canvas', snappedPos.x, snappedPos.y);
        
        this.debugLog(`Widget créé par double-clic à (${snappedPos.x}, ${snappedPos.y})`);
    }
    
    /**
     * Création widget d'un type donné à une position
     * @param {string} widgetType - Type de widget à créer
     * @param {number} x - Position X grille
     * @param {number} y - Position Y grille
     */
    createWidgetOfType(widgetType, x, y) {
        // Délégation à l'éditeur pour création widget sur Canvas de Fond
        if (this.editor && typeof this.editor.createWidgetOnCanvas === 'function') {
            this.editor.createWidgetOnCanvas(widgetType, x, y);
        } else {
            console.error('[Grid] Éditeur non disponible pour création widget');
        }
    }
    
    /**
     * Affichage feedback visuel pendant drag
     * @param {DragEvent} e - Événement dragover
     */
    showDropFeedback(e) {
        const gridPos = this.screenToGrid(e.clientX, e.clientY);
        const snappedPos = this.snapToGrid(gridPos.x, gridPos.y);
        
        // Mise à jour état feedback
        this.state.dropFeedback.active = true;
        this.state.dropFeedback.x = snappedPos.x;
        this.state.dropFeedback.y = snappedPos.y;
        
        // Création indicateur visuel si nécessaire
        this.createDropIndicator(snappedPos.x, snappedPos.y);
    }
    
    /**
     * Masquage feedback visuel drop
     */
    hideDropFeedback() {
        this.state.dropFeedback.active = false;
        
        // Suppression indicateur visuel
        if (this.elements.dropIndicator) {
            this.elements.dropIndicator.remove();
            this.elements.dropIndicator = null;
        }
    }
    
    /**
     * Création indicateur visuel position drop
     * @param {number} x - Position X grille
     * @param {number} y - Position Y grille
     */
    createDropIndicator(x, y) {
        // Suppression indicateur existant
        this.hideDropFeedback();
        
        // Création nouvel indicateur
        this.elements.dropIndicator = document.createElement('div');
        this.elements.dropIndicator.className = 'grid-drop-indicator';
        this.elements.dropIndicator.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            width: 100px;
            height: 50px;
            border: 2px dashed #60a5fa;
            background: rgba(96, 165, 250, 0.1);
            border-radius: 4px;
            pointer-events: none;
            z-index: 1000;
            transform-origin: 0 0;
        `;
        
        // Ajout à la grille
        this.elements.grid.appendChild(this.elements.dropIndicator);
    }
    
    /**
     * Vérification si une position est dans la zone visible
     * @param {number} x - Position X grille
     * @param {number} y - Position Y grille
     * @returns {boolean} - True si visible
     */
    isPositionVisible(x, y) {
        const screenPos = this.gridToScreen(x, y);
        const rect = this.elements.grid.getBoundingClientRect();
        
        return screenPos.x >= rect.left && 
               screenPos.x <= rect.right &&
               screenPos.y >= rect.top && 
               screenPos.y <= rect.bottom;
    }
    
    /**
     * Obtention zone visible du Canvas de Fond
     * @returns {Object} - Bounds visibles {minX, maxX, minY, maxY}
     */
    getVisibleBounds() {
        const rect = this.elements.grid.getBoundingClientRect();
        
        // Coins de la zone visible en coordonnées grille
        const topLeft = this.screenToGrid(rect.left, rect.top);
        const bottomRight = this.screenToGrid(rect.right, rect.bottom);
        
        return {
            minX: topLeft.x,
            minY: topLeft.y,
            maxX: bottomRight.x,
            maxY: bottomRight.y
        };
    }
    
    /**
     * Log de debug spécialisé Grid
     * @param {string} message - Message à logger
     */
    debugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🎨 [${timestamp}] Canvas de Fond: ${message}`);
    }
};

// Compatibilité globale
window.Grid = window.WidgetEditor.Grid;
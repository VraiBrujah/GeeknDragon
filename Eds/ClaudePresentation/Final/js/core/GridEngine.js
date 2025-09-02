/**
 * 🏗️ GRID_ENGINE.JS - Moteur de Grille Infinie
 * 
 * Rôle : Système de grille infinie avec zoom et positionnement précis
 * Type : Gestionnaire de grille dynamique sans limites de taille
 * Responsabilité : Affichage, navigation, snap, coordonnées, viewport
 * Innovation : Grille vraiment infinie - AUCUNE limite utilisateur
 */
class GridEngine {
    
    constructor(container, eventManager, options = {}) {
        // Rôle : Conteneur DOM où la grille sera rendue
        // Type : HTMLElement (div container)
        // Unité : Sans unité
        // Domaine : Element DOM valide avec dimensions
        // Formule : querySelector ou référence directe
        // Exemple : document.getElementById('grid-container')
        this.container = container;
        
        // Rôle : Gestionnaire d'événements pour communication système
        // Type : EventManager (bus d'événements)
        // Unité : Sans unité
        // Domaine : Instance EventManager valide
        // Formule : Injection de dépendance
        // Exemple : Émet 'grid:viewport-changed' lors de scroll
        this.eventManager = eventManager;
        
        // === CONFIGURATION GRILLE ===
        
        // Rôle : Taille d'une cellule de grille
        // Type : Number (pixels)
        // Unité : pixels (px)
        // Domaine : cellSize ≥ 5px (minimum pour visibilité)
        // Formule : Configuration utilisateur avec défaut 20px
        // Exemple : 20px → grille avec cellules 20x20px
        this.cellSize = options.cellSize || 20;
        
        // Rôle : Facteur de zoom actuel
        // Type : Number (multiplicateur)
        // Unité : Sans unité (ratio)
        // Domaine : 0.1 ≤ zoom ≤ 5.0 (10% à 500%)
        // Formule : 1.0 = 100%, 0.5 = 50%, 2.0 = 200%
        // Exemple : zoom 2.0 → cellules 40px, zoom 0.5 → cellules 10px
        this.zoom = options.zoom || 1.0;
        this.minZoom = options.minZoom || 0.1;
        this.maxZoom = options.maxZoom || 5.0;
        
        // Rôle : Position du viewport dans l'espace grille infini
        // Type : Object {x, y} (coordonnées)
        // Unité : pixels (px)
        // Domaine : -∞ < x,y < +∞ (vraiment infini)
        // Formule : Translation pour navigation dans grille
        // Exemple : {x: -1000, y: -500} → décalé vers haut-gauche
        this.viewportX = options.viewportX || 0;
        this.viewportY = options.viewportY || 0;
        
        // Rôle : Visibilité de la grille de fond
        // Type : Boolean (état d'affichage)
        // Unité : Sans unité
        // Domaine : true (visible) | false (masquée)
        // Formule : Configuration utilisateur
        // Exemple : true → lignes grille visibles, false → fond uni
        this.showGrid = options.showGrid !== false;
        
        // Rôle : Activation du magnétisme à la grille
        // Type : Boolean (comportement snap)
        // Unité : Sans unité
        // Domaine : true (snap actif) | false (positionnement libre)
        // Formule : Configuration utilisateur avec défaut true
        // Exemple : true → widgets alignés sur cellules
        this.snapToGrid = options.snapToGrid !== false;
        
        // Rôle : Couleur de fond de la grille
        // Type : String (couleur CSS)
        // Unité : Sans unité
        // Domaine : Couleur CSS valide
        // Formule : Configuration utilisateur avec défaut blanc
        // Exemple : '#ffffff', '#f8f9fa', 'transparent'
        this.backgroundColor = options.backgroundColor || '#ffffff';
        
        // === ÉLÉMENTS DOM ===
        
        // Rôle : Canvas de la grille (zone de travail)
        // Type : HTMLElement (div canvas)
        // Unité : Sans unité
        // Domaine : Element créé dynamiquement
        // Formule : createElement + appendChild
        // Exemple : <div class="grid-canvas" style="transform: translate(...)">
        this.canvas = null;
        
        // Rôle : Overlay des lignes de grille
        // Type : HTMLElement (div overlay)
        // Unité : Sans unité
        // Domaine : Element avec background-image pour lignes
        // Formule : CSS background-image avec pattern SVG
        // Exemple : Lignes répétées every cellSize pixels
        this.gridOverlay = null;
        
        // === ÉTAT NAVIGATION ===
        
        // Rôle : Flag pour navigation en cours (drag viewport)
        // Type : Boolean (état interaction)
        // Unité : Sans unité
        // Domaine : true (drag actif) | false (statique)
        // Formule : mousedown/mousemove/mouseup tracking
        // Exemple : true pendant drag de la grille
        this.isDragging = false;
        
        // Rôle : Position initiale du drag pour calcul delta
        // Type : Object {x, y} (coordonnées)
        // Unité : pixels (px) - coordonnées écran
        // Domaine : Coordonnées mouse event
        // Formule : {x: event.clientX, y: event.clientY}
        // Exemple : {x: 150, y: 200} au mousedown
        this.dragStartPos = { x: 0, y: 0 };
        this.dragStartViewport = { x: 0, y: 0 };
        
        // === PERFORMANCE ===
        
        // Rôle : Cache des éléments visuels pour optimisation
        // Type : Map<String, Object> (cache)
        // Unité : Sans unité
        // Domaine : Cache avec clés uniques
        // Formule : Map pour O(1) lookup
        // Exemple : 'grid-lines' → {svg: '...', size: 20}
        this.cache = new Map();
        
        // Rôle : Timer pour redraw différé (debounce)
        // Type : Number (timer ID)
        // Unité : millisecondes (ms)
        // Domaine : setTimeout ID ou null
        // Formule : clearTimeout + setTimeout pour debounce
        // Exemple : Attendre fin resize avant recalcul grille
        this.redrawTimer = null;
        this.redrawDelay = 50; // 50ms debounce
        
        // Initialisation
        this.init();
        
        Utils.log('success', 'GridEngine initialisé', {
            cellSize: this.cellSize,
            zoom: this.zoom,
            infinite: true,
            container: this.container.id || 'anonymous'
        });
    }
    
    /**
     * Initialise le moteur de grille
     */
    init() {
        // Création des éléments DOM
        this.createDOMElements();
        
        // Configuration styles
        this.setupStyles();
        
        // Événements d'interaction
        this.setupEventListeners();
        
        // Premier rendu
        this.render();
        
        // Notification initialisation
        this.eventManager.emit('grid:initialized', {
            cellSize: this.cellSize,
            zoom: this.zoom,
            viewport: { x: this.viewportX, y: this.viewportY }
        });
    }
    
    /**
     * Crée les éléments DOM nécessaires
     */
    createDOMElements() {
        // Rôle : Constructeur de structure DOM pour grille infinie
        // Type : Void (effet de bord DOM)
        // Unité : Sans unité
        // Domaine : Éléments DOM correctement hiérarchisés
        // Formule : createElement + appendChild + configuration
        // Exemple : container > canvas > overlay + widgets
        
        // Nettoyage si nécessaire
        this.container.innerHTML = '';
        
        // Canvas principal (zone de travail infinie)
        this.canvas = document.createElement('div');
        this.canvas.className = 'grid-canvas';
        this.canvas.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            transform-origin: 0 0;
            will-change: transform;
        `;
        
        // Overlay grille (lignes de fond)
        this.gridOverlay = document.createElement('div');
        this.gridOverlay.className = 'grid-overlay';
        this.gridOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
        `;
        
        // Conteneur widgets (au-dessus de l'overlay)
        this.widgetsContainer = document.createElement('div');
        this.widgetsContainer.className = 'widgets-container';
        this.widgetsContainer.id = 'widgets-container';
        this.widgetsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;
        
        // Assemblage hiérarchique
        this.canvas.appendChild(this.gridOverlay);
        this.canvas.appendChild(this.widgetsContainer);
        this.container.appendChild(this.canvas);
        
        Utils.log('info', 'Éléments DOM grille créés');
    }
    
    /**
     * Configure les styles CSS de base
     */
    setupStyles() {
        // Rôle : Configurateur de styles pour navigation fluide
        // Type : Void (effet de bord styles)
        // Unité : Sans unité
        // Domaine : Styles optimisés pour performance
        // Formule : CSS avec optimisations GPU et scroll
        // Exemple : transform3d, will-change, overflow
        
        // Styles conteneur principal
        this.container.style.cssText = `
            position: relative;
            overflow: hidden;
            background-color: ${this.backgroundColor};
            cursor: grab;
            user-select: none;
            width: 100%;
            height: 100%;
        `;
        
        // Couleur de fond initial
        this.updateBackgroundColor();
        
        Utils.log('info', 'Styles grille configurés');
    }
    
    /**
     * Configure les événements d'interaction
     */
    setupEventListeners() {
        // === NAVIGATION SOURIS ===
        
        // Drag de la grille pour navigation
        this.container.addEventListener('mousedown', (event) => {
            // Ne pas interférer avec les widgets
            if (event.target !== this.container && 
                event.target !== this.canvas && 
                event.target !== this.gridOverlay) {
                return;
            }
            
            this.isDragging = true;
            this.dragStartPos = { x: event.clientX, y: event.clientY };
            this.dragStartViewport = { x: this.viewportX, y: this.viewportY };
            
            this.container.style.cursor = 'grabbing';
            event.preventDefault();
        });
        
        this.container.addEventListener('mousemove', (event) => {
            if (!this.isDragging) return;
            
            // Rôle : Calculateur de déplacement viewport en temps réel
            // Type : Void (effet de bord viewport)
            // Unité : pixels (px)
            // Domaine : Coordonnées écran → coordonnées grille
            // Formule : viewport = start + (mouse - startMouse) / zoom
            // Exemple : Drag 100px → déplacement viewport ajusté au zoom
            const deltaX = event.clientX - this.dragStartPos.x;
            const deltaY = event.clientY - this.dragStartPos.y;
            
            // Ajustement selon zoom (plus zoomé = déplacement plus précis)
            this.setViewport(
                this.dragStartViewport.x + deltaX / this.zoom,
                this.dragStartViewport.y + deltaY / this.zoom
            );
            
            event.preventDefault();
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.container.style.cursor = 'grab';
            }
        });
        
        // Zoom avec molette
        this.container.addEventListener('wheel', (event) => {
            const rect = this.container.getBoundingClientRect();
            const centerX = event.clientX - rect.left;
            const centerY = event.clientY - rect.top;
            
            // Rôle : Système de zoom centré sur curseur souris
            // Type : Void (effet de bord zoom + viewport)
            // Unité : Sans unité (ratio) + pixels (px)
            // Domaine : Zoom avec conservation point sous curseur
            // Formule : nouveau_zoom * (mouse_pos - viewport) = constant
            // Exemple : Zoom sur point précis → point reste sous curseur
            const zoomDirection = event.deltaY > 0 ? -1 : 1;
            const zoomFactor = 1 + (zoomDirection * 0.1); // 10% par cran
            
            this.zoomAt(centerX, centerY, zoomFactor);
            
            event.preventDefault();
        });
        
        // === ÉVÉNEMENTS SYSTÈME ===
        
        // Redimensionnement conteneur
        this.eventManager.on('system:window-resized', () => {
            this.scheduleRedraw();
        });
        
        // Raccourcis clavier
        this.eventManager.on('system:keydown', (event) => {
            const { key, ctrlKey, shiftKey } = event.data;
            
            switch (key) {
                case '0':
                    if (ctrlKey) {
                        this.resetZoom();
                        event.preventDefault?.();
                    }
                    break;
                    
                case '+':
                case '=':
                    if (ctrlKey) {
                        this.zoomIn();
                        event.preventDefault?.();
                    }
                    break;
                    
                case '-':
                case '_':
                    if (ctrlKey) {
                        this.zoomOut();
                        event.preventDefault?.();
                    }
                    break;
                    
                case 'Home':
                    this.centerView();
                    break;
                    
                case 'g':
                    if (ctrlKey) {
                        this.toggleGrid();
                        event.preventDefault?.();
                    }
                    break;
                    
                case 's':
                    if (ctrlKey && shiftKey) {
                        this.toggleSnap();
                        event.preventDefault?.();
                    }
                    break;
            }
        });
        
        Utils.log('info', 'Événements grille configurés');
    }
    
    /**
     * Programme un redraw différé
     */
    scheduleRedraw() {
        // Rôle : Planificateur de rendu différé pour optimisation
        // Type : Void (effet de bord timer)
        // Unité : millisecondes (ms)
        // Domaine : Timer avec debounce
        // Formule : clearTimeout + setTimeout
        // Exemple : Plusieurs resize rapides → 1 seul redraw final
        if (this.redrawTimer) {
            clearTimeout(this.redrawTimer);
        }
        
        this.redrawTimer = setTimeout(() => {
            this.render();
            this.redrawTimer = null;
        }, this.redrawDelay);
    }
    
    /**
     * Rendu principal de la grille
     */
    render() {
        // Mise à jour transform du canvas
        this.updateCanvasTransform();
        
        // Mise à jour grille de fond
        if (this.showGrid) {
            this.updateGridOverlay();
        } else {
            this.hideGrid();
        }
        
        // Notification rendu
        this.eventManager.emit('grid:rendered', {
            zoom: this.zoom,
            viewport: { x: this.viewportX, y: this.viewportY },
            cellSize: this.getEffectiveCellSize()
        });
    }
    
    /**
     * Met à jour la transformation du canvas
     */
    updateCanvasTransform() {
        // Rôle : Générateur de transformation CSS pour navigation grille
        // Type : Void (effet de bord transform)
        // Unité : pixels (px) et sans unité (scale)
        // Domaine : Transform CSS avec translate + scale
        // Formule : transform = scale(zoom) translate(viewportX, viewportY)
        // Exemple : zoom=2, viewport=(-100,-50) → "scale(2) translate(-100px, -50px)"
        
        const transform = `scale(${this.zoom}) translate(${this.viewportX}px, ${this.viewportY}px)`;
        
        this.canvas.style.transform = transform;
        
        // Force repaint pour éviter les artefacts
        this.canvas.style.willChange = 'transform';
        
        // Notification changement viewport
        this.eventManager.emit('grid:viewport-changed', {
            zoom: this.zoom,
            viewportX: this.viewportX,
            viewportY: this.viewportY,
            transform: transform
        });
    }
    
    /**
     * Met à jour l'overlay de grille
     */
    updateGridOverlay() {
        const effectiveCellSize = this.getEffectiveCellSize();
        
        // Cache pour éviter recalculs
        const cacheKey = `grid-${effectiveCellSize}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            this.gridOverlay.style.backgroundImage = cached.backgroundImage;
            return;
        }
        
        // Rôle : Générateur de pattern SVG pour lignes de grille
        // Type : String (CSS background-image)
        // Unité : pixels (px) pour taille pattern
        // Domaine : SVG pattern répétable
        // Formule : SVG rect avec stroke + background-size
        // Exemple : Lignes grises every 20px avec pattern SVG
        
        // Couleurs des lignes
        const lineColor = 'rgba(0, 0, 0, 0.1)';
        const majorLineColor = 'rgba(0, 0, 0, 0.2)';
        
        // Pattern SVG pour grille
        const svg = `
            <svg width="${effectiveCellSize}" height="${effectiveCellSize}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="${effectiveCellSize}" height="${effectiveCellSize}" patternUnits="userSpaceOnUse">
                        <path d="M ${effectiveCellSize} 0 L 0 0 0 ${effectiveCellSize}" fill="none" stroke="${lineColor}" stroke-width="0.5"/>
                        ${effectiveCellSize >= 100 ? `<path d="M ${effectiveCellSize} 0 L 0 0 0 ${effectiveCellSize}" fill="none" stroke="${majorLineColor}" stroke-width="1"/>` : ''}
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        `;
        
        const encodedSvg = encodeURIComponent(svg);
        const backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;
        
        // Application et cache
        this.gridOverlay.style.backgroundImage = backgroundImage;
        this.gridOverlay.style.backgroundSize = `${effectiveCellSize}px ${effectiveCellSize}px`;
        this.gridOverlay.style.opacity = '1';
        
        // Mise en cache
        this.cache.set(cacheKey, {
            backgroundImage: backgroundImage,
            cellSize: effectiveCellSize
        });
    }
    
    /**
     * Masque la grille
     */
    hideGrid() {
        // Rôle : Désactivateur d'affichage grille
        // Type : Void (effet de bord style)
        // Unité : Sans unité
        // Domaine : Style opacity
        // Formule : opacity = 0
        // Exemple : Fond uni sans lignes de guidage
        this.gridOverlay.style.opacity = '0';
        this.gridOverlay.style.backgroundImage = 'none';
    }
    
    /**
     * Obtient la taille effective des cellules (avec zoom)
     * 
     * @returns {number} Taille en pixels
     */
    getEffectiveCellSize() {
        // Rôle : Calculateur de taille cellule avec zoom appliqué
        // Type : Number (taille affichée)
        // Unité : pixels (px)
        // Domaine : Taille ≥ 1px
        // Formule : cellSize * zoom
        // Exemple : cellSize=20, zoom=2.0 → 40px effectif
        return Math.max(1, Math.round(this.cellSize * this.zoom));
    }
    
    /**
     * Définit le niveau de zoom
     * 
     * @param {number} newZoom - Nouveau niveau de zoom
     * @param {boolean} render - Rendre immédiatement
     */
    setZoom(newZoom, render = true) {
        // Validation limites
        newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));
        
        if (newZoom === this.zoom) return;
        
        // Rôle : Configurateur de niveau de zoom avec validation
        // Type : Void (effet de bord zoom)
        // Unité : Sans unité (ratio)
        // Domaine : minZoom ≤ zoom ≤ maxZoom
        // Formule : Validation limites + mise à jour
        // Exemple : setZoom(2.5) → zoom 250% si dans limites
        const oldZoom = this.zoom;
        this.zoom = newZoom;
        
        if (render) {
            this.render();
        }
        
        Utils.log('info', `Zoom modifié: ${oldZoom.toFixed(2)} → ${this.zoom.toFixed(2)}`);
        
        // Notification changement zoom
        this.eventManager.emit('grid:zoom-changed', {
            oldZoom,
            newZoom: this.zoom,
            percentage: Math.round(this.zoom * 100)
        });
    }
    
    /**
     * Zoom centré sur un point spécifique
     * 
     * @param {number} centerX - Coordonnée X du centre (viewport)
     * @param {number} centerY - Coordonnée Y du centre (viewport)
     * @param {number} zoomFactor - Facteur multiplicatif
     */
    zoomAt(centerX, centerY, zoomFactor) {
        const newZoom = this.zoom * zoomFactor;
        
        // Validation limites
        if (newZoom < this.minZoom || newZoom > this.maxZoom) return;
        
        // Rôle : Calculateur de zoom avec conservation point fixe
        // Type : Void (effet de bord zoom + viewport)
        // Unité : pixels (px) et ratio (zoom)
        // Domaine : Point sous curseur conservé après zoom
        // Formule : newViewport = oldViewport + (center/oldZoom - center/newZoom)
        // Exemple : Zoom sur coin widget → coin reste sous curseur
        
        // Conversion coordonnées écran vers coordonnées grille
        const gridX = (centerX / this.zoom) - this.viewportX;
        const gridY = (centerY / this.zoom) - this.viewportY;
        
        // Nouveau viewport pour conserver le point fixe
        const newViewportX = this.viewportX + (centerX / this.zoom) - (centerX / newZoom);
        const newViewportY = this.viewportY + (centerY / this.zoom) - (centerY / newZoom);
        
        // Application
        this.zoom = newZoom;
        this.viewportX = newViewportX;
        this.viewportY = newViewportY;
        
        this.render();
        
        Utils.log('info', `Zoom centré: ${(this.zoom * 100).toFixed(1)}%`, {
            center: { x: gridX, y: gridY }
        });
    }
    
    /**
     * Zoom avant
     */
    zoomIn() {
        // Rôle : Incrémenter de zoom avec centre container
        // Type : Void (effet de bord zoom)
        // Unité : Sans unité (ratio)
        // Domaine : Zoom centré sur milieu container
        // Formule : zoomAt(center, 1.2) → zoom +20%
        // Exemple : Raccourci Ctrl++ → zoom avant centré
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        this.zoomAt(centerX, centerY, 1.2); // +20%
    }
    
    /**
     * Zoom arrière
     */
    zoomOut() {
        // Rôle : Décrémenter de zoom avec centre container
        // Type : Void (effet de bord zoom)
        // Unité : Sans unité (ratio)
        // Domaine : Zoom centré sur milieu container
        // Formule : zoomAt(center, 0.833) → zoom -20%
        // Exemple : Raccourci Ctrl+- → zoom arrière centré
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        this.zoomAt(centerX, centerY, 1 / 1.2); // -20%
    }
    
    /**
     * Remet le zoom à 100%
     */
    resetZoom() {
        // Rôle : Restaurateur de zoom par défaut
        // Type : Void (effet de bord zoom)
        // Unité : Sans unité (ratio)
        // Domaine : zoom = 1.0 (100%)
        // Formule : setZoom(1.0)
        // Exemple : Raccourci Ctrl+0 → vue normale
        this.setZoom(1.0);
    }
    
    /**
     * Définit la position du viewport
     * 
     * @param {number} x - Position X
     * @param {number} y - Position Y
     */
    setViewport(x, y) {
        // Rôle : Configurateur de position viewport dans grille infinie
        // Type : Void (effet de bord viewport)
        // Unité : pixels (px)
        // Domaine : -∞ < x,y < +∞ (vraiment infini)
        // Formule : this.viewportX = x, this.viewportY = y
        // Exemple : setViewport(-500, 300) → décalé vers bas-gauche
        if (this.viewportX === x && this.viewportY === y) return;
        
        this.viewportX = x;
        this.viewportY = y;
        
        this.updateCanvasTransform();
    }
    
    /**
     * Centre la vue sur l'origine
     */
    centerView() {
        // Rôle : Restaurateur de position origine (0,0)
        // Type : Void (effet de bord viewport)
        // Unité : pixels (px)
        // Domaine : Position centrée sur origine
        // Formule : viewport = (0, 0)
        // Exemple : Raccourci Home → retour au centre
        this.setViewport(0, 0);
        
        Utils.log('info', 'Vue centrée sur origine');
    }
    
    /**
     * Active/désactive l'affichage de la grille
     */
    toggleGrid() {
        // Rôle : Commutateur d'affichage des lignes de grille
        // Type : Void (effet de bord showGrid)
        // Unité : Sans unité
        // Domaine : Boolean toggle
        // Formule : showGrid = !showGrid
        // Exemple : Raccourci Ctrl+G → masquer/afficher lignes
        this.showGrid = !this.showGrid;
        
        this.render();
        
        Utils.log('info', `Grille ${this.showGrid ? 'affichée' : 'masquée'}`);
        
        // Notification
        this.eventManager.emit('grid:visibility-toggled', {
            showGrid: this.showGrid
        });
    }
    
    /**
     * Active/désactive le magnétisme
     */
    toggleSnap() {
        // Rôle : Commutateur de magnétisme à la grille
        // Type : Void (effet de bord snapToGrid)
        // Unité : Sans unité
        // Domaine : Boolean toggle
        // Formule : snapToGrid = !snapToGrid
        // Exemple : Raccourci Ctrl+Shift+S → snap on/off
        this.snapToGrid = !this.snapToGrid;
        
        Utils.log('info', `Magnétisme ${this.snapToGrid ? 'activé' : 'désactivé'}`);
        
        // Notification
        this.eventManager.emit('grid:snap-toggled', {
            snapToGrid: this.snapToGrid
        });
    }
    
    /**
     * Applique le magnétisme à une position
     * 
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @returns {Object} Position snappée {x, y}
     */
    snapPosition(x, y) {
        if (!this.snapToGrid) {
            return { x, y };
        }
        
        // Rôle : Aligneur de position sur grille la plus proche
        // Type : Object {x, y} (position alignée)
        // Unité : pixels (px)
        // Domaine : Coordonnées multiples de cellSize
        // Formule : snap = Math.round(pos / cellSize) * cellSize
        // Exemple : pos=37, cellSize=20 → snap=40 (2*20)
        const snappedX = Math.round(x / this.cellSize) * this.cellSize;
        const snappedY = Math.round(y / this.cellSize) * this.cellSize;
        
        return { x: snappedX, y: snappedY };
    }
    
    /**
     * Convertit coordonnées écran vers coordonnées grille
     * 
     * @param {number} screenX - X écran
     * @param {number} screenY - Y écran
     * @returns {Object} Coordonnées grille {x, y}
     */
    screenToGrid(screenX, screenY) {
        // Rôle : Convertisseur coordonnées écran vers espace grille
        // Type : Object {x, y} (coordonnées grille)
        // Unité : pixels (px) - espace grille
        // Domaine : Coordonnées dans espace grille infini
        // Formule : grid = (screen / zoom) - viewport
        // Exemple : screen(100,50), zoom=2, viewport=(-10,-20) → grid(40,5)
        const rect = this.container.getBoundingClientRect();
        
        const containerX = screenX - rect.left;
        const containerY = screenY - rect.top;
        
        const gridX = (containerX / this.zoom) - this.viewportX;
        const gridY = (containerY / this.zoom) - this.viewportY;
        
        return { x: gridX, y: gridY };
    }
    
    /**
     * Convertit coordonnées grille vers coordonnées écran
     * 
     * @param {number} gridX - X grille
     * @param {number} gridY - Y grille
     * @returns {Object} Coordonnées écran {x, y}
     */
    gridToScreen(gridX, gridY) {
        // Rôle : Convertisseur coordonnées grille vers écran
        // Type : Object {x, y} (coordonnées écran)
        // Unité : pixels (px) - espace écran
        // Domaine : Coordonnées relatives au container
        // Formule : screen = (grid + viewport) * zoom
        // Exemple : grid(40,5), zoom=2, viewport=(-10,-20) → screen(100,50)
        const screenX = (gridX + this.viewportX) * this.zoom;
        const screenY = (gridY + this.viewportY) * this.zoom;
        
        return { x: screenX, y: screenY };
    }
    
    /**
     * Met à jour la couleur de fond
     * 
     * @param {string} color - Nouvelle couleur
     */
    updateBackgroundColor(color = null) {
        if (color) {
            this.backgroundColor = color;
        }
        
        // Rôle : Configurateur de couleur de fond grille
        // Type : Void (effet de bord style)
        // Unité : Sans unité
        // Domaine : Couleur CSS valide
        // Formule : style.backgroundColor = couleur
        // Exemple : updateBackgroundColor('#f8f9fa') → fond gris clair
        this.container.style.backgroundColor = this.backgroundColor;
        
        // Notification
        this.eventManager.emit('grid:background-changed', {
            backgroundColor: this.backgroundColor
        });
    }
    
    /**
     * Obtient les informations sur l'état actuel
     * 
     * @returns {Object} État complet de la grille
     */
    getState() {
        // Rôle : Générateur de rapport d'état complet
        // Type : Object (état complet)
        // Unité : Diverses (pixels, ratios, flags)
        // Domaine : Vue d'ensemble configuration et position
        // Formule : Agrégation de toutes propriétés importantes
        // Exemple : Pour sauvegarde ou debug
        return {
            cellSize: this.cellSize,
            zoom: this.zoom,
            viewport: {
                x: this.viewportX,
                y: this.viewportY
            },
            showGrid: this.showGrid,
            snapToGrid: this.snapToGrid,
            backgroundColor: this.backgroundColor,
            effectiveCellSize: this.getEffectiveCellSize(),
            container: {
                width: this.container.clientWidth,
                height: this.container.clientHeight
            },
            limits: {
                minZoom: this.minZoom,
                maxZoom: this.maxZoom
            }
        };
    }
    
    /**
     * Restaure un état de grille
     * 
     * @param {Object} state - État à restaurer
     */
    setState(state) {
        // Rôle : Restaurateur d'état complet de grille
        // Type : Void (effet de bord configuration)
        // Unité : Diverses selon propriétés
        // Domaine : Configuration valide
        // Formule : Assignation propriétés + validation + rendu
        // Exemple : Après chargement projet → restore vue
        if (state.cellSize) this.cellSize = state.cellSize;
        if (state.zoom) this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, state.zoom));
        if (state.viewport) {
            this.viewportX = state.viewport.x || 0;
            this.viewportY = state.viewport.y || 0;
        }
        if (typeof state.showGrid === 'boolean') this.showGrid = state.showGrid;
        if (typeof state.snapToGrid === 'boolean') this.snapToGrid = state.snapToGrid;
        if (state.backgroundColor) this.backgroundColor = state.backgroundColor;
        
        // Rendu avec nouvel état
        this.updateBackgroundColor();
        this.render();
        
        Utils.log('info', 'État grille restauré', state);
        
        // Notification
        this.eventManager.emit('grid:state-restored', state);
    }
    
    /**
     * Nettoie les ressources
     */
    destroy() {
        // Rôle : Destructeur complet du moteur de grille
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : Libération complète ressources
        // Formule : clear timers + DOM + cache + events
        // Exemple : Avant rechargement ou fermeture
        
        // Nettoyage timer
        if (this.redrawTimer) {
            clearTimeout(this.redrawTimer);
            this.redrawTimer = null;
        }
        
        // Nettoyage cache
        this.cache.clear();
        
        // Nettoyage DOM
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        Utils.log('warn', 'GridEngine détruit');
    }
}

// Export pour utilisation globale
window.GridEngine = GridEngine;
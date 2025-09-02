/**
 * DRAGDROP.JS - Système drag & drop avancé pour widgets
 * VERSION SCRIPT CLASSIQUE - Fonctionne sans serveur
 * Responsabilité : Gestion complète interactions drag & drop
 */

// Namespace global
window.WidgetEditor = window.WidgetEditor || {};

/**
 * Classe DragDrop - Gestion drag & drop widgets et repositionnement
 * API HTML5 Drag & Drop + interactions personnalisées
 */
window.WidgetEditor.DragDrop = class DragDrop {
    /**
     * Constructeur du système drag & drop
     * @param {Editor} editor - Instance éditeur parent
     */
    constructor(editor) {
        // Référence éditeur parent
        this.editor = editor;
        
        // État du drag & drop
        this.state = {
            isDragging: false,
            dragType: null,        // 'widget-from-bank' | 'widget-reposition'
            draggedWidget: null,   // Widget en cours de déplacement
            draggedWidgetType: null, // Type widget depuis banque
            dragOffset: { x: 0, y: 0 }, // Offset souris/widget
            ghostElement: null,    // Élément fantôme pour feedback
            dropZones: [],         // Zones de drop disponibles
            isInitialized: false
        };
        
        // Configuration
        this.config = {
            // Classes CSS pour états visuels
            dragClass: 'dragging',
            dropZoneClass: 'drop-zone-active',
            dragOverClass: 'drag-over',
            
            // Délai avant démarrage drag (ms)
            dragDelay: 150,
            
            // Distance minimale pour démarrage drag
            dragThreshold: 5,
            
            // Opacité élément fantôme
            ghostOpacity: 0.7
        };
        
        // Timers et references
        this.dragStartTimer = null;
        this.startPosition = { x: 0, y: 0 };
        
        this.debugLog('DragDrop créé');
    }
    
    /**
     * Initialisation système drag & drop
     * Configuration événements HTML5 + personnalisés
     */
    async init() {
        try {
            // Configuration drag & drop widgets depuis banque
            this.setupWidgetBankDragDrop();
            
            // Configuration zones de drop principales
            this.setupDropZones();
            
            // Configuration événements génériques
            this.setupGlobalEvents();
            
            // Marquage initialisé
            this.state.isInitialized = true;
            
            this.debugLog('DragDrop initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation DragDrop:', error);
            throw error;
        }
    }
    
    /**
     * Configuration drag & drop depuis banque de widgets
     * Widgets draggables vers grille d'édition
     */
    setupWidgetBankDragDrop() {
        const widgetItems = document.querySelectorAll('.widget-item[draggable="true"]');
        
        widgetItems.forEach(item => {
            // Événement dragstart HTML5
            item.addEventListener('dragstart', (e) => {
                this.handleWidgetDragStart(e, item);
            });
            
            item.addEventListener('dragend', (e) => {
                this.handleWidgetDragEnd(e);
            });
            
            // Feedback visuel pendant drag
            item.addEventListener('drag', () => {
                item.classList.add(this.config.dragClass);
            });
        });
        
        this.debugLog('Drag & drop banque widgets configuré');
    }
    
    /**
     * Configuration zones de drop principales
     * Grille principale + zones spéciales futures
     */
    setupDropZones() {
        // Zone drop principale (grille infinie)
        const mainDropZone = document.getElementById('main-drop-zone');
        const infiniteGrid = document.getElementById('infinite-grid');
        
        if (mainDropZone) {
            this.configureDropZone(mainDropZone);
        }
        
        if (infiniteGrid) {
            this.configureDropZone(infiniteGrid);
        }
        
        this.debugLog('Zones de drop configurées');
    }
    
    /**
     * Configuration d'une zone de drop
     * @param {HTMLElement} element - Élément zone de drop
     */
    configureDropZone(element) {
        // Événements HTML5 drag & drop
        element.addEventListener('dragover', (e) => {
            e.preventDefault(); // Autoriser drop
            this.handleDragOver(e, element);
        });
        
        element.addEventListener('dragenter', (e) => {
            e.preventDefault();
            this.handleDragEnter(e, element);
        });
        
        element.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e, element);
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e, element);
        });
        
        // Ajout à la liste des zones
        this.state.dropZones.push(element);
    }
    
    /**
     * Configuration événements globaux
     * Gestion états et cleanup
     */
    setupGlobalEvents() {
        // Nettoyage si drag se termine en dehors
        document.addEventListener('dragend', () => {
            this.cleanupDragState();
        });
        
        // Empêcher drop par défaut sur document
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * Gestion démarrage drag widget depuis banque
     * @param {DragEvent} e - Événement dragstart
     * @param {HTMLElement} widgetItem - Item widget draggé
     */
    handleWidgetDragStart(e, widgetItem) {
        const widgetType = widgetItem.dataset.widgetType;
        
        if (!widgetType) {
            e.preventDefault();
            return;
        }
        
        // Configuration état drag
        this.state.isDragging = true;
        this.state.dragType = 'widget-from-bank';
        this.state.draggedWidgetType = widgetType;
        
        // Données pour transfert
        e.dataTransfer.setData('text/widget-type', widgetType);
        e.dataTransfer.effectAllowed = 'copy';
        
        // Image drag personnalisée
        this.createDragImage(e, widgetItem);
        
        // Feedback visuel
        widgetItem.classList.add(this.config.dragClass);
        document.body.classList.add('widget-dragging');
        
        // Activation zones de drop
        this.activateDropZones();
        
        this.debugLog(`Drag démarré: widget ${widgetType}`);
    }
    
    /**
     * Gestion fin drag widget depuis banque
     * @param {DragEvent} e - Événement dragend
     */
    handleWidgetDragEnd(e) {
        // Nettoyage état visuel
        const draggedItem = e.target;
        draggedItem.classList.remove(this.config.dragClass);
        document.body.classList.remove('widget-dragging');
        
        // Désactivation zones drop
        this.deactivateDropZones();
        
        // Reset état
        this.cleanupDragState();
        
        this.debugLog('Drag terminé depuis banque');
    }
    
    /**
     * Création image de drag personnalisée
     * @param {DragEvent} e - Événement drag
     * @param {HTMLElement} element - Élément source
     */
    createDragImage(e, element) {
        // Clone de l'élément pour image drag
        const dragImage = element.cloneNode(true);
        
        // Style de l'image fantôme
        dragImage.style.opacity = this.config.ghostOpacity;
        dragImage.style.transform = 'rotate(2deg) scale(1.1)';
        dragImage.style.pointerEvents = 'none';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-9999px';
        dragImage.style.zIndex = '9999';
        
        // Ajout temporaire au DOM
        document.body.appendChild(dragImage);
        
        // Définition comme image de drag
        e.dataTransfer.setDragImage(dragImage, 50, 30);
        
        // Suppression après un délai
        setTimeout(() => {
            if (dragImage.parentNode) {
                dragImage.parentNode.removeChild(dragImage);
            }
        }, 100);
        
        this.state.ghostElement = dragImage;
    }
    
    /**
     * Gestion dragover sur zone de drop
     * @param {DragEvent} e - Événement dragover
     * @param {HTMLElement} dropZone - Zone de drop
     */
    handleDragOver(e, dropZone) {
        // Autorisation drop
        e.dataTransfer.dropEffect = 'copy';
        
        // Feedback visuel continu
        dropZone.classList.add(this.config.dragOverClass);
    }
    
    /**
     * Gestion dragenter sur zone de drop
     * @param {DragEvent} e - Événement dragenter
     * @param {HTMLElement} dropZone - Zone de drop
     */
    handleDragEnter(e, dropZone) {
        dropZone.classList.add(this.config.dragOverClass);
    }
    
    /**
     * Gestion dragleave sur zone de drop
     * @param {DragEvent} e - Événement dragleave
     * @param {HTMLElement} dropZone - Zone de drop
     */
    handleDragLeave(e, dropZone) {
        // Vérification si on sort vraiment de la zone
        const rect = dropZone.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            dropZone.classList.remove(this.config.dragOverClass);
        }
    }
    
    /**
     * Gestion drop sur zone
     * @param {DragEvent} e - Événement drop
     * @param {HTMLElement} dropZone - Zone de drop
     */
    handleDrop(e, dropZone) {
        // Récupération données
        const widgetType = e.dataTransfer.getData('text/widget-type');
        
        if (!widgetType) {
            this.debugLog('Drop sans type widget valide');
            return;
        }
        
        // Calcul position dans la grille
        const gridCoords = this.editor.getState().grid.screenToGrid(e.clientX, e.clientY);
        
        // Accrochage si activé
        const snappedCoords = this.editor.getState().grid.snapToGrid(gridCoords.x, gridCoords.y);
        
        // Création widget à la position
        const widget = this.editor.createWidget(widgetType, e.clientX, e.clientY);
        
        if (widget) {
            // Ajustement position finale avec accrochage
            widget.setPosition(snappedCoords.x, snappedCoords.y);
            
            // Animation d'apparition
            this.animateWidgetAppearance(widget);
            
            this.debugLog(`Widget ${widgetType} créé à (${snappedCoords.x}, ${snappedCoords.y})`);
        }
        
        // Nettoyage visuel
        dropZone.classList.remove(this.config.dragOverClass);
        this.cleanupDragState();
    }
    
    /**
     * Animation d'apparition widget créé
     * @param {Object} widget - Widget nouvellement créé
     */
    animateWidgetAppearance(widget) {
        const element = widget.elements?.container;
        if (!element) return;
        
        // Animation fade-in + scale
        element.style.opacity = '0';
        element.style.transform += ' scale(0.8)';
        
        // Force reflow
        element.offsetHeight;
        
        // Application animation
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = element.style.transform.replace(' scale(0.8)', '');
        
        // Nettoyage après animation
        setTimeout(() => {
            element.style.transition = '';
        }, 300);
    }
    
    /**
     * Démarrage drag repositionnement widget existant
     * @param {MouseEvent} e - Événement mousedown
     * @param {Object} widget - Widget à déplacer
     */
    startWidgetRepositioning(e, widget) {
        // Vérification verrouillage
        if (widget.isLocked()) {
            return;
        }
        
        // Configuration état
        this.state.isDragging = true;
        this.state.dragType = 'widget-reposition';
        this.state.draggedWidget = widget;
        
        // Calcul offset souris/widget
        const widgetPos = widget.getPosition();
        const gridCoords = this.editor.getState().grid.screenToGrid(e.clientX, e.clientY);
        
        this.state.dragOffset = {
            x: gridCoords.x - widgetPos.x,
            y: gridCoords.y - widgetPos.y
        };
        
        // Feedback visuel
        widget.elements.container?.classList.add(this.config.dragClass);
        document.body.style.cursor = 'grabbing';
        
        // Événements mousemove et mouseup
        this.setupRepositionEvents();
        
        this.debugLog(`Repositionnement démarré: ${widget.getId()}`);
    }
    
    /**
     * Configuration événements repositionnement
     * Gestion mousemove/mouseup pour déplacement fluide
     */
    setupRepositionEvents() {
        const handleMouseMove = (e) => {
            this.updateWidgetPosition(e);
        };
        
        const handleMouseUp = (e) => {
            this.endWidgetRepositioning(e);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    /**
     * Mise à jour position widget pendant repositionnement
     * @param {MouseEvent} e - Événement mousemove
     */
    updateWidgetPosition(e) {
        if (this.state.dragType !== 'widget-reposition' || !this.state.draggedWidget) {
            return;
        }
        
        // Calcul nouvelle position
        const gridCoords = this.editor.getState().grid.screenToGrid(e.clientX, e.clientY);
        const newX = gridCoords.x - this.state.dragOffset.x;
        const newY = gridCoords.y - this.state.dragOffset.y;
        
        // Accrochage si activé
        const snappedCoords = this.editor.getState().grid.snapToGrid(newX, newY);
        
        // Application position
        this.state.draggedWidget.setPosition(snappedCoords.x, snappedCoords.y);
    }
    
    /**
     * Fin repositionnement widget
     * @param {MouseEvent} e - Événement mouseup
     */
    endWidgetRepositioning(e) {
        if (this.state.dragType !== 'widget-reposition') {
            return;
        }
        
        const widget = this.state.draggedWidget;
        
        // Nettoyage visuel
        widget.elements.container?.classList.remove(this.config.dragClass);
        document.body.style.cursor = '';
        
        // Sauvegarde nouvelle position
        this.editor.saveState();
        
        // Reset état
        this.cleanupDragState();
        
        this.debugLog(`Repositionnement terminé: ${widget.getId()}`);
    }
    
    /**
     * Activation zones de drop
     * Feedback visuel pendant drag
     */
    activateDropZones() {
        this.state.dropZones.forEach(zone => {
            zone.classList.add(this.config.dropZoneClass);
        });
    }
    
    /**
     * Désactivation zones de drop
     * Nettoyage feedback visuel
     */
    deactivateDropZones() {
        this.state.dropZones.forEach(zone => {
            zone.classList.remove(this.config.dropZoneClass);
            zone.classList.remove(this.config.dragOverClass);
        });
    }
    
    /**
     * Nettoyage complet état drag
     * Reset toutes variables et classes
     */
    cleanupDragState() {
        // Reset état interne
        this.state.isDragging = false;
        this.state.dragType = null;
        this.state.draggedWidget = null;
        this.state.draggedWidgetType = null;
        this.state.dragOffset = { x: 0, y: 0 };
        
        // Nettoyage élément fantôme
        if (this.state.ghostElement && this.state.ghostElement.parentNode) {
            this.state.ghostElement.parentNode.removeChild(this.state.ghostElement);
            this.state.ghostElement = null;
        }
        
        // Nettoyage classes CSS globales
        document.body.classList.remove('widget-dragging');
        document.body.style.cursor = '';
        
        // Désactivation zones drop
        this.deactivateDropZones();
        
        // Clear timers
        if (this.dragStartTimer) {
            clearTimeout(this.dragStartTimer);
            this.dragStartTimer = null;
        }
    }
    
    /**
     * Vérification si drag en cours
     * @returns {boolean} - True si drag actif
     */
    isDragActive() {
        return this.state.isDragging;
    }
    
    /**
     * Récupération type de drag actuel
     * @returns {string|null} - Type drag ou null
     */
    getDragType() {
        return this.state.dragType;
    }
    
    /**
     * Récupération widget en cours de drag
     * @returns {Object|null} - Widget draggé ou null
     */
    getDraggedWidget() {
        return this.state.draggedWidget;
    }
    
    /**
     * Configuration seuil démarrage drag
     * @param {number} threshold - Seuil en pixels
     */
    setDragThreshold(threshold) {
        this.config.dragThreshold = Math.max(0, threshold);
    }
    
    /**
     * Configuration délai démarrage drag
     * @param {number} delay - Délai en millisecondes
     */
    setDragDelay(delay) {
        this.config.dragDelay = Math.max(0, delay);
    }
    
    /**
     * Export état drag & drop
     * @returns {Object} - Configuration sérialisable
     */
    exportConfig() {
        return {
            dragThreshold: this.config.dragThreshold,
            dragDelay: this.config.dragDelay,
            ghostOpacity: this.config.ghostOpacity
        };
    }
    
    /**
     * Import configuration drag & drop
     * @param {Object} config - Configuration à restaurer
     */
    importConfig(config) {
        if (config.dragThreshold !== undefined) {
            this.config.dragThreshold = config.dragThreshold;
        }
        if (config.dragDelay !== undefined) {
            this.config.dragDelay = config.dragDelay;
        }
        if (config.ghostOpacity !== undefined) {
            this.config.ghostOpacity = config.ghostOpacity;
        }
    }
    
    /**
     * Méthodes publiques pour interface externe
     * Démarrage drag widget depuis banque (appelée par Editor)
     */
    startWidgetDrag(e, widgetType) {
        this.state.draggedWidgetType = widgetType;
        e.dataTransfer.setData('text/widget-type', widgetType);
    }
    
    endWidgetDrag(e) {
        this.cleanupDragState();
    }
    
    /**
     * Log de debug spécialisé DragDrop
     * @param {string} message - Message à logger
     */
    debugLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`🖱️ [${timestamp}] DragDrop: ${message}`);
    }
};

// Compatibilité globale
window.DragDrop = window.WidgetEditor.DragDrop;
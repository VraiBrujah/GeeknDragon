/**
 * 🎯 DRAG_DROP_SYSTEM.JS - Système de Drag & Drop Hiérarchique
 * 
 * Rôle : Gestionnaire complet de drag & drop avec hiérarchie infinie
 * Type : Système d'interaction avancé avec nesting et composition
 * Responsabilité : Drag widgets, drop zones, hiérarchie, visual feedback
 * Innovation : Récursion infinie - widgets contenant autres widgets
 */
class DragDropSystem {
    
    constructor(eventManager, gridEngine, options = {}) {
        // Rôle : Gestionnaire d'événements pour communication
        // Type : EventManager (bus d'événements)
        // Unité : Sans unité
        // Domaine : Instance EventManager valide
        // Formule : Injection de dépendance
        // Exemple : Émet 'widget:dropped' après drop réussi
        this.eventManager = eventManager;
        
        // Rôle : Moteur de grille pour coordonnées et snap
        // Type : GridEngine (système de grille)
        // Unité : Sans unité
        // Domaine : Instance GridEngine valide
        // Formule : Injection de dépendance
        // Exemple : Utilise snapPosition() pour alignement
        this.gridEngine = gridEngine;
        
        // === ÉTAT DRAG ACTUEL ===
        
        // Rôle : Flag pour drag en cours
        // Type : Boolean (état drag)
        // Unité : Sans unité
        // Domaine : true (drag actif) | false (inactif)
        // Formule : true pendant mousedown → mousemove → mouseup
        // Exemple : true pendant déplacement widget
        this.isDragging = false;
        
        // Rôle : Élément actuellement draggé
        // Type : HTMLElement (element en drag)
        // Unité : Sans unité
        // Domaine : Element DOM valide ou null
        // Formule : Référence directe élément source
        // Exemple : <div class="widget" data-widget-id="123">
        this.draggedElement = null;
        
        // Rôle : Widget data associé à l'élément draggé
        // Type : Object (données widget)
        // Unité : Sans unité
        // Domaine : Structure widget complète ou null
        // Formule : Récupération via ID depuis storage
        // Exemple : {id: '123', type: 'element-universel', data: {...}}
        this.draggedWidget = null;
        
        // Rôle : Position initiale du drag
        // Type : Object {x, y} (coordonnées)
        // Unité : pixels (px)
        // Domaine : Coordonnées grille
        // Formule : {x: event.clientX, y: event.clientY}
        // Exemple : {x: 150, y: 200} au mousedown
        this.dragStartPos = { x: 0, y: 0 };
        
        // Rôle : Offset de la souris par rapport au coin du widget
        // Type : Object {x, y} (offset)
        // Unité : pixels (px)
        // Domaine : Offset relatif à l'élément
        // Formule : {x: mouseX - elementX, y: mouseY - elementY}
        // Exemple : Clic au centre widget 100x50 → offset {50, 25}
        this.mouseOffset = { x: 0, y: 0 };
        
        // === DROP ZONES ET HIÉRARCHIE ===
        
        // Rôle : Liste des zones de drop actives
        // Type : Array<HTMLElement> (conteneurs)
        // Unité : Sans unité
        // Domaine : Éléments pouvant recevoir drops
        // Formule : Array avec push/splice pour gestion
        // Exemple : [gridContainer, widgetContainer1, widgetContainer2]
        this.dropZones = [];
        
        // Rôle : Zone de drop actuellement survolée
        // Type : HTMLElement (zone active)
        // Unité : Sans unité
        // Domaine : Element dropzone valide ou null
        // Formule : Détection collision pendant mousemove
        // Exemple : <div class="widget-container" data-accepts="all">
        this.currentDropZone = null;
        
        // Rôle : Widget conteneur pour drop hiérarchique
        // Type : Object (widget parent)
        // Unité : Sans unité
        // Domaine : Widget acceptant children ou null
        // Formule : Résolution via dropzone → widget parent
        // Exemple : GrilleComposition accepte widgets enfants
        this.targetParentWidget = null;
        
        // === ÉLÉMENTS VISUELS ===
        
        // Rôle : Clone visuel pour feedback de drag
        // Type : HTMLElement (clone)
        // Unité : Sans unité
        // Domaine : Clone stylé pour preview
        // Formule : element.cloneNode(true) + styles drag
        // Exemple : Version semi-transparente suivant curseur
        this.dragPreview = null;
        
        // Rôle : Indicateur visuel de drop zone
        // Type : HTMLElement (indicateur)
        // Unité : Sans unité
        // Domaine : Overlay avec bordure colorée
        // Formule : createElement avec styles temporaires
        // Exemple : Bordure verte sur zone valide
        this.dropIndicator = null;
        
        // Rôle : Ligne guide pour insertion hiérarchique
        // Type : HTMLElement (guide)
        // Unité : Sans unité
        // Domaine : Ligne montrant position insertion
        // Formule : createElement avec positioning absolu
        // Exemple : Ligne bleue entre widgets pour ordre
        this.insertionGuide = null;
        
        // === CONFIGURATION ===
        
        // Rôle : Distance minimum pour déclencher drag
        // Type : Number (seuil)
        // Unité : pixels (px)
        // Domaine : distance ≥ 0
        // Formule : Configuration utilisateur avec défaut 5px
        // Exemple : 5px → évite drags accidentels sur clics
        this.dragThreshold = options.dragThreshold || 5;
        
        // Rôle : Flag pour drag depuis banque widgets
        // Type : Boolean (mode création)
        // Unité : Sans unité
        // Domaine : true (création) | false (déplacement)
        // Formule : Détection origine drag
        // Exemple : Drag depuis palette → création nouveau widget
        this.isCreatingWidget = false;
        
        // Rôle : Types de widgets acceptés par zones
        // Type : Map<String, Array<String>> (restrictions)
        // Unité : Sans unité
        // Domaine : Nom zone → types autorisés
        // Formule : Configuration déclarative
        // Exemple : 'grille-composition' → ['element-universel', 'button']
        this.dropRestrictions = new Map();
        
        // Initialisation
        this.init();
        
        Utils.log('success', 'DragDropSystem initialisé', {
            dragThreshold: this.dragThreshold,
            supportHierarchy: true,
            infiniteNesting: true
        });
    }
    
    /**
     * Initialise le système de drag & drop
     */
    init() {
        this.setupEventListeners();
        this.createDragElements();
        this.registerDefaultDropZones();
        
        // Notification initialisation
        this.eventManager.emit('dragdrop:initialized');
    }
    
    /**
     * Configure les événements principaux
     */
    setupEventListeners() {
        // === ÉVÉNEMENTS DRAG ===
        
        // Début drag sur widgets existants
        document.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });
        
        // Mouvement pendant drag
        document.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        // Fin drag
        document.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });
        
        // === ÉVÉNEMENTS DEPUIS BANQUE WIDGETS ===
        
        // Drag depuis palette
        this.eventManager.on('widget-bank:drag-start', (event) => {
            this.startWidgetCreation(event.data);
        });
        
        // === PRÉVENTION CONFLITS ===
        
        // Empêche sélection texte pendant drag
        document.addEventListener('selectstart', (event) => {
            if (this.isDragging) {
                event.preventDefault();
            }
        });
        
        // Empêche drag natif navigateur
        document.addEventListener('dragstart', (event) => {
            if (this.isDragging) {
                event.preventDefault();
            }
        });
        
        Utils.log('info', 'Événements drag & drop configurés');
    }
    
    /**
     * Crée les éléments visuels pour le drag
     */
    createDragElements() {
        // Rôle : Constructeur d'éléments UI pour feedback visuel
        // Type : Void (effet de bord DOM)
        // Unité : Sans unité
        // Domaine : Éléments DOM cachés par défaut
        // Formule : createElement + styles + append body
        // Exemple : Preview, indicator, guide créés mais invisibles
        
        // Preview de drag (suit la souris)
        this.dragPreview = document.createElement('div');
        this.dragPreview.className = 'drag-preview';
        this.dragPreview.style.cssText = `
            position: fixed;
            z-index: 10000;
            pointer-events: none;
            opacity: 0.8;
            transform: scale(0.9);
            border: 2px dashed #3498db;
            background: rgba(52, 152, 219, 0.1);
            border-radius: 4px;
            display: none;
        `;
        document.body.appendChild(this.dragPreview);
        
        // Indicateur de drop zone
        this.dropIndicator = document.createElement('div');
        this.dropIndicator.className = 'drop-indicator';
        this.dropIndicator.style.cssText = `
            position: absolute;
            z-index: 9999;
            pointer-events: none;
            border: 3px solid #2ecc71;
            background: rgba(46, 204, 113, 0.1);
            border-radius: 6px;
            display: none;
        `;
        document.body.appendChild(this.dropIndicator);
        
        // Guide d'insertion hiérarchique
        this.insertionGuide = document.createElement('div');
        this.insertionGuide.className = 'insertion-guide';
        this.insertionGuide.style.cssText = `
            position: absolute;
            z-index: 9998;
            pointer-events: none;
            height: 2px;
            background: #e74c3c;
            border-radius: 1px;
            display: none;
            box-shadow: 0 0 4px rgba(231, 76, 60, 0.5);
        `;
        document.body.appendChild(this.insertionGuide);
        
        Utils.log('info', 'Éléments visuels drag & drop créés');
    }
    
    /**
     * Enregistre les zones de drop par défaut
     */
    registerDefaultDropZones() {
        // Zone principale de la grille
        const gridContainer = document.getElementById('widgets-container');
        if (gridContainer) {
            this.registerDropZone(gridContainer, {
                accepts: ['element-universel', 'grille-composition'],
                hierarchy: 'root'
            });
        }
        
        Utils.log('info', 'Zones de drop par défaut enregistrées');
    }
    
    /**
     * Gère l'événement mousedown
     * 
     * @param {MouseEvent} event - Événement souris
     */
    handleMouseDown(event) {
        // Détection si clic sur widget draggable
        const widgetElement = event.target.closest('[data-widget-id]');
        
        if (!widgetElement) return;
        
        // Ignore si clic sur contrôles d'édition
        if (event.target.closest('.widget-controls, .resize-handle, .edit-button')) {
            return;
        }
        
        // Rôle : Initialisateur de session drag sur widget existant
        // Type : Void (effet de bord état drag)
        // Unité : Sans unité
        // Domaine : Préparation drag avec calcul offset
        // Formule : Stockage position + element + offset souris
        // Exemple : mousedown sur widget → préparation pour drag éventuel
        
        this.draggedElement = widgetElement;
        this.dragStartPos = { x: event.clientX, y: event.clientY };
        
        // Calcul offset souris par rapport au widget
        const rect = widgetElement.getBoundingClientRect();
        this.mouseOffset = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        // Récupération données widget
        const widgetId = widgetElement.getAttribute('data-widget-id');
        this.draggedWidget = this.getWidgetById(widgetId);
        
        if (!this.draggedWidget) {
            this.resetDragState();
            return;
        }
        
        // Prévention événements par défaut
        event.preventDefault();
        
        Utils.log('info', `Préparation drag widget: ${this.draggedWidget.type}`, {
            id: widgetId,
            startPos: this.dragStartPos,
            offset: this.mouseOffset
        });
    }
    
    /**
     * Gère l'événement mousemove
     * 
     * @param {MouseEvent} event - Événement souris
     */
    handleMouseMove(event) {
        if (!this.draggedElement && !this.isCreatingWidget) return;
        
        const currentPos = { x: event.clientX, y: event.clientY };
        
        // Vérification seuil de déclenchement
        if (!this.isDragging) {
            const distance = Utils.calculateDistance(this.dragStartPos, currentPos);
            
            if (distance < this.dragThreshold) return;
            
            // Déclenchement du drag
            this.startDrag(currentPos);
        }
        
        // Rôle : Gestionnaire de mouvement pendant drag actif
        // Type : Void (effet de bord position + feedback)
        // Unité : pixels (px)
        // Domaine : Mise à jour position preview + drop detection
        // Formule : Position = mouse - offset, detection collision zones
        // Exemple : Souris bouge → preview suit + détection drop zones
        
        if (this.isDragging) {
            this.updateDragPreview(currentPos);
            this.updateDropZones(currentPos);
            this.updateInsertionGuide(currentPos);
        }
        
        event.preventDefault();
    }
    
    /**
     * Gère l'événement mouseup
     * 
     * @param {MouseEvent} event - Événement souris
     */
    handleMouseUp(event) {
        if (!this.isDragging) {
            this.resetDragState();
            return;
        }
        
        // Rôle : Finalisateur de drag avec drop ou annulation
        // Type : Void (effet de bord drop/cancel)
        // Unité : Sans unité
        // Domaine : Drop réussi ou annulation selon context
        // Formule : Si dropZone valide → drop, sinon → cancel
        // Exemple : mouseup sur zone valide → création/déplacement widget
        
        const dropPos = { x: event.clientX, y: event.clientY };
        
        if (this.currentDropZone) {
            this.performDrop(dropPos);
        } else {
            this.cancelDrag();
        }
        
        this.resetDragState();
        event.preventDefault();
    }
    
    /**
     * Démarre une session de drag
     * 
     * @param {Object} currentPos - Position actuelle {x, y}
     */
    startDrag(currentPos) {
        this.isDragging = true;
        
        // Rôle : Activateur de session drag avec feedback visuel
        // Type : Void (effet de bord UI + état)
        // Unité : Sans unité
        // Domaine : Activation preview + zones + état global
        // Formule : isDragging = true + show preview + activate zones
        // Exemple : Seuil dépassé → drag actif avec preview visible
        
        // Activation du preview visuel
        this.showDragPreview();
        
        // Activation des drop zones
        this.activateDropZones();
        
        // Curseur
        document.body.style.cursor = 'grabbing';
        
        // Notification démarrage
        this.eventManager.emit('dragdrop:drag-started', {
            widget: this.draggedWidget,
            isCreating: this.isCreatingWidget,
            startPos: this.dragStartPos
        });
        
        Utils.log('info', 'Drag démarré', {
            widgetType: this.draggedWidget ? this.draggedWidget.type : 'unknown',
            isCreating: this.isCreatingWidget
        });
    }
    
    /**
     * Démarre la création d'un nouveau widget depuis la banque
     * 
     * @param {Object} widgetData - Données du widget à créer
     */
    startWidgetCreation(widgetData) {
        // Rôle : Initialisateur de création widget depuis palette
        // Type : Void (effet de bord mode création)
        // Unité : Sans unité
        // Domaine : Mode création avec widget template
        // Formule : isCreating = true + template widget
        // Exemple : Drag "Element Universel" depuis palette → mode création
        
        this.isCreatingWidget = true;
        this.draggedWidget = this.createWidgetTemplate(widgetData.type);
        this.dragStartPos = { x: 0, y: 0 };
        this.mouseOffset = { x: 50, y: 25 }; // Centre approximatif
        
        // Le drag sera activé au premier mousemove
        
        Utils.log('info', 'Création widget démarrée', {
            type: widgetData.type,
            template: this.draggedWidget
        });
    }
    
    /**
     * Met à jour le preview de drag
     * 
     * @param {Object} mousePos - Position souris {x, y}
     */
    updateDragPreview(mousePos) {
        if (!this.dragPreview || !this.draggedWidget) return;
        
        // Rôle : Mise à jour position preview suivant souris
        // Type : Void (effet de bord position)
        // Unité : pixels (px)
        // Domaine : Position écran avec offset
        // Formule : preview.left/top = mouse - offset
        // Exemple : Souris (200,100), offset (25,15) → preview (175,85)
        
        const previewX = mousePos.x - this.mouseOffset.x;
        const previewY = mousePos.y - this.mouseOffset.y;
        
        this.dragPreview.style.left = previewX + 'px';
        this.dragPreview.style.top = previewY + 'px';
        
        // Mise à jour contenu si création
        if (this.isCreatingWidget) {
            this.updatePreviewContent();
        }
    }
    
    /**
     * Met à jour la détection des drop zones
     * 
     * @param {Object} mousePos - Position souris {x, y}
     */
    updateDropZones(mousePos) {
        let hoveredZone = null;
        
        // Rôle : Détecteur de collision souris avec zones de drop
        // Type : Void (effet de bord currentDropZone)
        // Unité : pixels (px)
        // Domaine : Zones valides selon restrictions
        // Formule : Itération zones + pointInRect + validation type
        // Exemple : Souris sur grille acceptant widget → zone active
        
        // Parcours des zones de drop
        for (const dropZone of this.dropZones) {
            const rect = dropZone.getBoundingClientRect();
            
            if (Utils.pointInRect(mousePos, {
                x: rect.left,
                y: rect.top,
                width: rect.width,
                height: rect.height
            })) {
                // Vérification restrictions de type
                if (this.canDropInZone(dropZone, this.draggedWidget.type)) {
                    hoveredZone = dropZone;
                    break; // Première zone valide trouvée
                }
            }
        }
        
        // Changement de zone
        if (hoveredZone !== this.currentDropZone) {
            this.setCurrentDropZone(hoveredZone);
        }
    }
    
    /**
     * Met à jour le guide d'insertion hiérarchique
     * 
     * @param {Object} mousePos - Position souris {x, y}
     */
    updateInsertionGuide(mousePos) {
        if (!this.currentDropZone || !this.insertionGuide) return;
        
        // Rôle : Calculateur de position insertion dans hiérarchie
        // Type : Void (effet de bord guide visuel)
        // Unité : pixels (px)
        // Domaine : Position entre widgets existants
        // Formule : Analyse widgets zone + calcul position optimale
        // Exemple : Drag entre widget A et B → ligne guide au milieu
        
        const containerRect = this.currentDropZone.getBoundingClientRect();
        const children = Array.from(this.currentDropZone.children);
        
        if (children.length === 0) {
            // Zone vide - pas de guide nécessaire
            this.hideInsertionGuide();
            return;
        }
        
        // Trouve la position d'insertion optimale
        let insertionIndex = children.length; // Par défaut à la fin
        let insertionY = containerRect.bottom;
        
        for (let i = 0; i < children.length; i++) {
            const childRect = children[i].getBoundingClientRect();
            const childCenterY = childRect.top + (childRect.height / 2);
            
            if (mousePos.y < childCenterY) {
                insertionIndex = i;
                insertionY = childRect.top;
                break;
            }
        }
        
        // Affichage du guide
        this.showInsertionGuide({
            x: containerRect.left,
            y: insertionY,
            width: containerRect.width,
            index: insertionIndex
        });
    }
    
    /**
     * Effectue le drop final
     * 
     * @param {Object} dropPos - Position de drop {x, y}
     */
    performDrop(dropPos) {
        if (!this.currentDropZone || !this.draggedWidget) return;
        
        // Rôle : Exécuteur de drop avec création ou déplacement widget
        // Type : Void (effet de bord widget + DOM)
        // Unité : pixels (px) pour position
        // Domaine : Création/déplacement selon mode
        // Formule : Si création → nouveau widget, sinon → move existing
        // Exemple : Drop Element Universel → nouveau widget à position
        
        // Conversion coordonnées écran → grille
        const gridPos = this.gridEngine.screenToGrid(dropPos.x, dropPos.y);
        
        // Application du snap si activé
        const finalPos = this.gridEngine.snapPosition(gridPos.x, gridPos.y);
        
        if (this.isCreatingWidget) {
            // Création nouveau widget
            this.createWidgetAtPosition(finalPos);
        } else {
            // Déplacement widget existant
            this.moveWidgetToPosition(finalPos);
        }
        
        // Notification drop réussi
        this.eventManager.emit('dragdrop:drop-success', {
            widget: this.draggedWidget,
            position: finalPos,
            dropZone: this.currentDropZone,
            isCreating: this.isCreatingWidget
        });
        
        Utils.log('success', 'Drop effectué', {
            widgetType: this.draggedWidget.type,
            position: finalPos,
            isCreating: this.isCreatingWidget
        });
    }
    
    /**
     * Crée un nouveau widget à la position spécifiée
     * 
     * @param {Object} position - Position {x, y}
     */
    createWidgetAtPosition(position) {
        // Rôle : Créateur de widget avec positionnement précis
        // Type : Void (effet de bord widget + DOM)
        // Unité : pixels (px) pour position
        // Domaine : Widget complet avec position
        // Formule : Template widget + position + ajout DOM + storage
        // Exemple : Template "Element Universel" → widget positionné (100,200)
        
        // Configuration position
        this.draggedWidget.position = {
            x: position.x,
            y: position.y,
            width: this.draggedWidget.defaultWidth || 200,
            height: this.draggedWidget.defaultHeight || 100
        };
        
        // Génération ID unique
        this.draggedWidget.id = Utils.generateId(this.draggedWidget.type);
        
        // Ajout au système
        this.eventManager.emit('widget:create-requested', {
            widget: this.draggedWidget,
            position: position,
            parentId: this.getParentIdFromDropZone(this.currentDropZone)
        });
        
        Utils.log('info', 'Widget créé par drag & drop', {
            id: this.draggedWidget.id,
            type: this.draggedWidget.type,
            position: position
        });
    }
    
    /**
     * Déplace un widget existant vers une nouvelle position
     * 
     * @param {Object} position - Position {x, y}
     */
    moveWidgetToPosition(position) {
        // Rôle : Déplaceur de widget existant avec mise à jour
        // Type : Void (effet de bord position + DOM)
        // Unité : pixels (px) pour position
        // Domaine : Widget existant repositionné
        // Formule : Widget.position = nouvelle + update DOM + storage
        // Exemple : Widget (50,75) → nouvelle position (150,200)
        
        const oldPosition = { ...this.draggedWidget.position };
        
        // Mise à jour position
        this.draggedWidget.position.x = position.x;
        this.draggedWidget.position.y = position.y;
        
        // Notification déplacement
        this.eventManager.emit('widget:move-requested', {
            widget: this.draggedWidget,
            oldPosition: oldPosition,
            newPosition: position,
            parentId: this.getParentIdFromDropZone(this.currentDropZone)
        });
        
        Utils.log('info', 'Widget déplacé par drag & drop', {
            id: this.draggedWidget.id,
            oldPosition: oldPosition,
            newPosition: position
        });
    }
    
    /**
     * Annule le drag en cours
     */
    cancelDrag() {
        // Rôle : Annulateur de drag avec restauration état
        // Type : Void (effet de bord état)
        // Unité : Sans unité
        // Domaine : Restauration état avant drag
        // Formule : Reset position + hide preview + restore curseur
        // Exemple : Drag hors zone valide → annulation + return position
        
        // Notification annulation
        this.eventManager.emit('dragdrop:drag-cancelled', {
            widget: this.draggedWidget,
            isCreating: this.isCreatingWidget
        });
        
        Utils.log('info', 'Drag annulé', {
            widgetType: this.draggedWidget ? this.draggedWidget.type : 'unknown'
        });
    }
    
    /**
     * Affiche le preview de drag
     */
    showDragPreview() {
        if (!this.dragPreview || !this.draggedWidget) return;
        
        // Rôle : Activateur de preview visuel avec contenu
        // Type : Void (effet de bord display)
        // Unité : Sans unité
        // Domaine : Preview visible avec contenu widget
        // Formule : display = block + innerHTML = preview
        // Exemple : Preview Element Universel avec texte exemple
        
        this.dragPreview.style.display = 'block';
        this.updatePreviewContent();
    }
    
    /**
     * Met à jour le contenu du preview
     */
    updatePreviewContent() {
        if (!this.dragPreview || !this.draggedWidget) return;
        
        // Rôle : Générateur de contenu preview selon type widget
        // Type : Void (effet de bord innerHTML)
        // Unité : Sans unité
        // Domaine : HTML représentatif du widget
        // Formule : Switch type widget → HTML approprié
        // Exemple : Element Universel → div avec icône + nom
        
        let previewHTML = '';
        
        switch (this.draggedWidget.type) {
            case 'element-universel':
                previewHTML = `
                    <div style="padding: 10px; text-align: center;">
                        <div style="font-size: 24px;">🌟</div>
                        <div style="font-size: 12px; margin-top: 5px;">Élément Universel</div>
                    </div>
                `;
                break;
                
            case 'grille-composition':
                previewHTML = `
                    <div style="padding: 10px; text-align: center;">
                        <div style="font-size: 24px;">🏗️</div>
                        <div style="font-size: 12px; margin-top: 5px;">Grille Composition</div>
                    </div>
                `;
                break;
                
            default:
                previewHTML = `
                    <div style="padding: 10px; text-align: center;">
                        <div style="font-size: 24px;">🧩</div>
                        <div style="font-size: 12px; margin-top: 5px;">${this.draggedWidget.type}</div>
                    </div>
                `;
        }
        
        this.dragPreview.innerHTML = previewHTML;
        
        // Ajustement taille
        this.dragPreview.style.width = '120px';
        this.dragPreview.style.height = '80px';
    }
    
    /**
     * Masque le preview de drag
     */
    hideDragPreview() {
        if (this.dragPreview) {
            this.dragPreview.style.display = 'none';
        }
    }
    
    /**
     * Active les drop zones
     */
    activateDropZones() {
        // Rôle : Activateur visuel des zones de drop disponibles
        // Type : Void (effet de bord styles)
        // Unité : Sans unité
        // Domaine : Zones compatibles avec widget draggé
        // Formule : Itération zones + validation + classe CSS active
        // Exemple : Widget compatible → zones s'illuminent
        
        this.dropZones.forEach(zone => {
            if (this.canDropInZone(zone, this.draggedWidget.type)) {
                zone.classList.add('drop-zone-active');
                zone.style.outline = '2px dashed #3498db';
                zone.style.outlineOffset = '2px';
            }
        });
    }
    
    /**
     * Désactive les drop zones
     */
    deactivateDropZones() {
        // Rôle : Désactivateur visuel des zones de drop
        // Type : Void (effet de bord styles)
        // Unité : Sans unité
        // Domaine : Suppression highlighting zones
        // Formule : Itération zones + remove classe + reset styles
        // Exemple : Fin drag → zones redeviennent normales
        
        this.dropZones.forEach(zone => {
            zone.classList.remove('drop-zone-active');
            zone.style.outline = '';
            zone.style.outlineOffset = '';
        });
    }
    
    /**
     * Définit la drop zone courante
     * 
     * @param {HTMLElement} zone - Nouvelle zone active
     */
    setCurrentDropZone(zone) {
        // Désactivation zone précédente
        if (this.currentDropZone) {
            this.hideDropIndicator();
        }
        
        // Rôle : Configurateur de zone de drop active
        // Type : Void (effet de bord zone + indicator)
        // Unité : Sans unité
        // Domaine : Zone valide + indicator visuel
        // Formule : currentDropZone = zone + show indicator
        // Exemple : Souris entre dans zone → zone active + indicator
        
        this.currentDropZone = zone;
        this.targetParentWidget = zone ? this.getParentWidgetFromZone(zone) : null;
        
        // Activation nouvelle zone
        if (this.currentDropZone) {
            this.showDropIndicator();
        }
        
        // Notification changement
        this.eventManager.emit('dragdrop:dropzone-changed', {
            zone: this.currentDropZone,
            parentWidget: this.targetParentWidget
        });
    }
    
    /**
     * Affiche l'indicateur de drop
     */
    showDropIndicator() {
        if (!this.dropIndicator || !this.currentDropZone) return;
        
        // Rôle : Afficheur d'indicateur visuel sur zone active
        // Type : Void (effet de bord position + display)
        // Unité : pixels (px) pour dimensions
        // Domaine : Overlay sur zone de drop courante
        // Formule : getBoundingClientRect + position absolute
        // Exemple : Zone 200x100 → indicator vert même taille
        
        const rect = this.currentDropZone.getBoundingClientRect();
        
        this.dropIndicator.style.left = rect.left + 'px';
        this.dropIndicator.style.top = rect.top + 'px';
        this.dropIndicator.style.width = rect.width + 'px';
        this.dropIndicator.style.height = rect.height + 'px';
        this.dropIndicator.style.display = 'block';
    }
    
    /**
     * Masque l'indicateur de drop
     */
    hideDropIndicator() {
        if (this.dropIndicator) {
            this.dropIndicator.style.display = 'none';
        }
    }
    
    /**
     * Affiche le guide d'insertion
     * 
     * @param {Object} guideData - Données du guide {x, y, width, index}
     */
    showInsertionGuide(guideData) {
        if (!this.insertionGuide) return;
        
        // Rôle : Afficheur de ligne guide pour insertion hiérarchique
        // Type : Void (effet de bord position + display)
        // Unité : pixels (px) pour dimensions
        // Domaine : Ligne horizontale entre widgets
        // Formule : Position calculée selon index insertion
        // Exemple : Insertion entre widget 2 et 3 → ligne rouge
        
        this.insertionGuide.style.left = guideData.x + 'px';
        this.insertionGuide.style.top = guideData.y + 'px';
        this.insertionGuide.style.width = guideData.width + 'px';
        this.insertionGuide.style.display = 'block';
        
        // Stockage index pour drop final
        this.insertionIndex = guideData.index;
    }
    
    /**
     * Masque le guide d'insertion
     */
    hideInsertionGuide() {
        if (this.insertionGuide) {
            this.insertionGuide.style.display = 'none';
        }
        this.insertionIndex = -1;
    }
    
    /**
     * Vérifie si un widget peut être droppé dans une zone
     * 
     * @param {HTMLElement} zone - Zone de drop
     * @param {string} widgetType - Type de widget
     * @returns {boolean} true si drop autorisé
     */
    canDropInZone(zone, widgetType) {
        // Rôle : Validateur de compatibilité widget/zone
        // Type : Boolean (autorisation)
        // Unité : Sans unité
        // Domaine : true (compatible) | false (incompatible)
        // Formule : Vérification restrictions + types acceptés
        // Exemple : Element Universel dans grille → true, dans bouton → false
        
        const zoneId = zone.getAttribute('data-drop-zone-id') || 'default';
        const restrictions = this.dropRestrictions.get(zoneId);
        
        if (!restrictions) {
            // Pas de restrictions = accepte tout
            return true;
        }
        
        // Vérification liste des types acceptés
        return restrictions.includes(widgetType) || restrictions.includes('*');
    }
    
    /**
     * Enregistre une nouvelle drop zone
     * 
     * @param {HTMLElement} element - Élément drop zone
     * @param {Object} options - Options de la zone
     */
    registerDropZone(element, options = {}) {
        // Rôle : Enregistreur de zone dans système drop
        // Type : Void (effet de bord dropZones)
        // Unité : Sans unité
        // Domaine : Zone valide avec options
        // Formule : dropZones.push + restrictions.set
        // Exemple : Nouveau widget conteneur → zone accepting children
        
        if (this.dropZones.includes(element)) {
            return; // Déjà enregistrée
        }
        
        // Ajout à la liste
        this.dropZones.push(element);
        
        // Configuration restrictions
        const zoneId = options.zoneId || Utils.generateId('dropzone');
        element.setAttribute('data-drop-zone-id', zoneId);
        
        if (options.accepts) {
            this.dropRestrictions.set(zoneId, options.accepts);
        }
        
        // Attributs pour hiérarchie
        if (options.hierarchy) {
            element.setAttribute('data-hierarchy-level', options.hierarchy);
        }
        
        Utils.log('info', 'Drop zone enregistrée', {
            zoneId,
            accepts: options.accepts,
            hierarchy: options.hierarchy
        });
        
        // Notification
        this.eventManager.emit('dragdrop:dropzone-registered', {
            element,
            zoneId,
            options
        });
    }
    
    /**
     * Supprime une drop zone
     * 
     * @param {HTMLElement} element - Élément à supprimer
     */
    unregisterDropZone(element) {
        // Rôle : Suppresseur de zone du système drop
        // Type : Void (effet de bord dropZones)
        // Unité : Sans unité
        // Domaine : Suppression zone + nettoyage restrictions
        // Formule : dropZones.splice + restrictions.delete
        // Exemple : Widget supprimé → sa drop zone aussi
        
        const index = this.dropZones.indexOf(element);
        if (index === -1) return;
        
        // Suppression de la liste
        this.dropZones.splice(index, 1);
        
        // Nettoyage restrictions
        const zoneId = element.getAttribute('data-drop-zone-id');
        if (zoneId) {
            this.dropRestrictions.delete(zoneId);
        }
        
        // Si c'était la zone courante
        if (this.currentDropZone === element) {
            this.setCurrentDropZone(null);
        }
        
        Utils.log('info', 'Drop zone supprimée', { zoneId });
    }
    
    /**
     * Crée un template de widget pour création
     * 
     * @param {string} widgetType - Type de widget
     * @returns {Object} Template widget
     */
    createWidgetTemplate(widgetType) {
        // Rôle : Générateur de template widget pour création drag
        // Type : Object (widget template)
        // Unité : Sans unité
        // Domaine : Structure widget complète avec defaults
        // Formule : Switch type → template approprié
        // Exemple : 'element-universel' → template avec données par défaut
        
        const templates = {
            'element-universel': {
                type: 'element-universel',
                name: 'Élément Universel',
                defaultWidth: 300,
                defaultHeight: 150,
                data: {
                    imageActive: false,
                    h1Active: true,
                    h2Active: false,
                    pActive: false,
                    h1: {
                        content: 'Nouveau titre',
                        styles: {
                            fontSize: '2rem',
                            color: '#2c3e50',
                            textAlign: 'center'
                        }
                    }
                }
            },
            
            'grille-composition': {
                type: 'grille-composition',
                name: 'Grille Composition',
                defaultWidth: 400,
                defaultHeight: 300,
                data: {
                    mode: 'column',
                    columns: 2,
                    rows: 2,
                    gap: '1rem',
                    children: []
                }
            }
        };
        
        return Utils.deepClone(templates[widgetType] || {
            type: widgetType,
            name: widgetType,
            defaultWidth: 200,
            defaultHeight: 100,
            data: {}
        });
    }
    
    /**
     * Récupère un widget par son ID
     * 
     * @param {string} widgetId - ID du widget
     * @returns {Object|null} Widget ou null
     */
    getWidgetById(widgetId) {
        // TODO: Intégration avec système de stockage widgets
        // Pour l'instant, stub
        return {
            id: widgetId,
            type: 'element-universel',
            position: { x: 0, y: 0, width: 200, height: 100 }
        };
    }
    
    /**
     * Obtient l'ID parent depuis une drop zone
     * 
     * @param {HTMLElement} dropZone - Zone de drop
     * @returns {string|null} ID du parent ou null
     */
    getParentIdFromDropZone(dropZone) {
        // Rôle : Résolveur d'ID parent depuis zone de drop
        // Type : String (ID parent)
        // Unité : Sans unité
        // Domaine : ID widget parent ou 'root'
        // Formule : Remontée DOM + recherche data-widget-id
        // Exemple : Drop zone dans widget → ID du widget parent
        
        if (!dropZone) return null;
        
        // Zone racine
        if (dropZone.id === 'widgets-container') {
            return 'root';
        }
        
        // Recherche widget parent
        const parentWidget = dropZone.closest('[data-widget-id]');
        return parentWidget ? parentWidget.getAttribute('data-widget-id') : 'root';
    }
    
    /**
     * Obtient le widget parent depuis une zone
     * 
     * @param {HTMLElement} zone - Zone de drop
     * @returns {Object|null} Widget parent ou null
     */
    getParentWidgetFromZone(zone) {
        const parentId = this.getParentIdFromDropZone(zone);
        return parentId && parentId !== 'root' ? this.getWidgetById(parentId) : null;
    }
    
    /**
     * Remet à zéro l'état de drag
     */
    resetDragState() {
        // Rôle : Réinitialisateur complet de l'état drag
        // Type : Void (effet de bord état + UI)
        // Unité : Sans unité
        // Domaine : Reset complet vers état initial
        // Formule : Toutes propriétés → valeurs initiales + hide UI
        // Exemple : Fin drag → état propre pour prochain drag
        
        // État drag
        this.isDragging = false;
        this.draggedElement = null;
        this.draggedWidget = null;
        this.isCreatingWidget = false;
        
        // Positions
        this.dragStartPos = { x: 0, y: 0 };
        this.mouseOffset = { x: 0, y: 0 };
        
        // Zones
        this.setCurrentDropZone(null);
        this.targetParentWidget = null;
        
        // UI
        this.hideDragPreview();
        this.hideDropIndicator();
        this.hideInsertionGuide();
        this.deactivateDropZones();
        
        // Curseur
        document.body.style.cursor = '';
    }
    
    /**
     * Obtient l'état actuel du système
     * 
     * @returns {Object} État complet
     */
    getState() {
        return {
            isDragging: this.isDragging,
            isCreating: this.isCreatingWidget,
            draggedWidget: this.draggedWidget,
            currentDropZone: this.currentDropZone?.getAttribute('data-drop-zone-id') || null,
            dropZones: this.dropZones.length,
            restrictions: Object.fromEntries(this.dropRestrictions)
        };
    }
    
    /**
     * Nettoie les ressources du système
     */
    destroy() {
        // Rôle : Destructeur complet du système drag & drop
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : Libération complète ressources
        // Formule : Reset état + remove DOM + clear arrays
        // Exemple : Avant rechargement ou fermeture
        
        // Reset état
        this.resetDragState();
        
        // Nettoyage DOM
        if (this.dragPreview && this.dragPreview.parentNode) {
            this.dragPreview.parentNode.removeChild(this.dragPreview);
        }
        if (this.dropIndicator && this.dropIndicator.parentNode) {
            this.dropIndicator.parentNode.removeChild(this.dropIndicator);
        }
        if (this.insertionGuide && this.insertionGuide.parentNode) {
            this.insertionGuide.parentNode.removeChild(this.insertionGuide);
        }
        
        // Nettoyage données
        this.dropZones = [];
        this.dropRestrictions.clear();
        
        Utils.log('warn', 'DragDropSystem détruit');
    }
}

// Export pour utilisation globale
window.DragDropSystem = DragDropSystem;
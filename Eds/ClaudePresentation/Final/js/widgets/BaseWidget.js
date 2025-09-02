/**
 * 🧩 BASE_WIDGET.JS - Classe de Base Révolutionnaire
 * 
 * Rôle : Classe de base pour tous les widgets du système révolutionnaire
 * Type : Classe abstraite avec interface complète et validation
 * Responsabilité : Structure commune, lifecycle, sérialisation, validation
 * Innovation : Système d'événements intégré + état persistant + hiérarchie
 */
class BaseWidget {
    
    /**
     * Constructeur de la classe de base
     * 
     * @param {string} type - Type du widget
     * @param {Object} config - Configuration initiale
     * @param {EventManager} eventManager - Gestionnaire d'événements
     */
    constructor(type, config = {}, eventManager = null) {
        // Rôle : Identifiant unique du widget dans le système
        // Type : String (UUID généré automatiquement)
        // Unité : Sans unité
        // Domaine : Chaîne alphanumérique unique temporellement
        // Formule : 'widget-' + type + '-' + timestamp + '-' + random(9)
        // Exemple : 'widget-element-universel-1704890400123-k2j9m8n7p'
        this.id = config.id || Utils.generateId(type);
        
        // Rôle : Type de widget pour identification et rendu
        // Type : String (catégorie widget)
        // Unité : Sans unité
        // Domaine : Types définis: element-universel, grille-composition, etc.
        // Formule : Constante définie lors création
        // Exemple : 'element-universel' → widget modulaire universel
        this.type = type;
        
        // Rôle : Nom d'affichage du widget pour interface utilisateur
        // Type : String (nom lisible)
        // Unité : Sans unité
        // Domaine : Texte descriptif français
        // Formule : config.name || nom par défaut basé sur type
        // Exemple : 'Mon Titre Principal' ou 'Grille 2×3'
        this.name = config.name || this.getDefaultName();
        
        // Rôle : Description détaillée pour aide utilisateur
        // Type : String (texte explicatif)
        // Unité : Sans unité
        // Domaine : Texte descriptif français
        // Formule : config.description || description par défaut
        // Exemple : 'Widget universel avec image optionnelle + 3 niveaux texte'
        this.description = config.description || this.getDefaultDescription();
        
        // Rôle : Catégorie pour organisation interface
        // Type : String (catégorie organisationnelle)
        // Unité : Sans unité
        // Domaine : universel, atomique, composition, layout
        // Formule : config.category || catégorie par défaut selon type
        // Exemple : 'universel' → widgets couvrant 90% besoins
        this.category = config.category || this.getDefaultCategory();
        
        // Rôle : Données spécifiques au widget (contenu, config)
        // Type : Object (structure variable selon type)
        // Unité : Sans unité
        // Domaine : Object avec propriétés spécifiques au type
        // Formule : config.data || données par défaut du type
        // Exemple : {imageActive: true, h1: {content: 'Titre', styles: {...}}}
        this.data = config.data || this.getDefaultData();
        
        // Rôle : Styles CSS spécifiques à ce widget
        // Type : Object (propriétés CSS)
        // Unité : Valeurs CSS (px, %, colors, etc.)
        // Domaine : Object avec propriétés CSS valides
        // Formule : config.styles || styles par défaut
        // Exemple : {padding: '1rem', backgroundColor: '#fff', borderRadius: '8px'}
        this.styles = config.styles || this.getDefaultStyles();
        
        // Rôle : Classes CSS à appliquer au widget
        // Type : Array<String> (liste classes CSS)
        // Unité : Sans unité
        // Domaine : Noms de classes CSS valides
        // Formule : config.classes || classes par défaut
        // Exemple : ['widget', 'widget-element-universel', 'editable', 'draggable']
        this.classes = config.classes || this.getDefaultClasses();
        
        // Rôle : Attributs HTML personnalisés
        // Type : Object (attributs HTML)
        // Unité : Sans unité
        // Domaine : Attributs HTML valides
        // Formule : config.attributes || attributs par défaut
        // Exemple : {'data-widget-type': 'element-universel', 'draggable': 'true'}
        this.attributes = config.attributes || this.getDefaultAttributes();
        
        // Rôle : Indicateur si widget éditable dans interface
        // Type : Boolean (capacité d'édition)
        // Unité : Sans unité
        // Domaine : true (modifiable) | false (lecture seule)
        // Formule : config.editable !== false (éditable par défaut)
        // Exemple : true → contrôles édition visibles, false → statique
        this.editable = config.editable !== false;
        
        // Rôle : Indicateur visibilité dans viewer
        // Type : Boolean (visibilité)
        // Unité : Sans unité
        // Domaine : true (affiché) | false (masqué)
        // Formule : config.visible !== false (visible par défaut)
        // Exemple : true → rendu normal, false → display:none
        this.visible = config.visible !== false;
        
        // Rôle : Position et dimensions du widget
        // Type : Object (coordonnées et taille)
        // Unité : pixels (px)
        // Domaine : {x, y, width, height} avec x,y ∈ ℝ, width,height ≥ 0
        // Formule : config.position || position par défaut
        // Exemple : {x: 100, y: 200, width: 300, height: 150}
        this.position = config.position || this.getDefaultPosition();
        
        // Rôle : Hiérarchie et relations parent-enfant
        // Type : Object (structure hiérarchique)
        // Unité : Sans unité
        // Domaine : IDs de widgets avec relations validées
        // Formule : config.hierarchy || structure par défaut
        // Exemple : {parentId: 'widget-123', children: ['widget-456', 'widget-789']}
        this.hierarchy = config.hierarchy || {
            parentId: null,
            children: [],
            index: 0,
            level: 0
        };
        
        // Rôle : État d'interaction utilisateur
        // Type : Object (états UI)
        // Unité : Sans unité
        // Domaine : Flags d'état avec valeurs booléennes
        // Formule : config.state || états par défaut
        // Exemple : {selected: false, hovered: false, editing: false, locked: false}
        this.state = config.state || {
            selected: false,
            hovered: false,
            editing: false,
            locked: false,
            collapsed: false
        };
        
        // Rôle : Métadonnées du widget
        // Type : Object (informations meta)
        // Unité : Sans unité
        // Domaine : Timestamps, version, auteur, historique
        // Formule : Génération automatique avec timestamps
        // Exemple : {created: '2024-01-09T10:00:00Z', version: '1.0.0', author: 'User'}
        this.metadata = {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0',
            author: config.author || 'Éditeur Révolutionnaire',
            ...config.metadata
        };
        
        // Rôle : Référence au gestionnaire d'événements
        // Type : EventManager (bus d'événements)
        // Unité : Sans unité
        // Domaine : Instance EventManager ou null
        // Formule : Injection de dépendance
        // Exemple : Utilisé pour émettre 'widget:modified' après changement
        this.eventManager = eventManager;
        
        // === CACHE ET PERFORMANCE ===
        
        // Rôle : Cache du HTML rendu pour optimisation
        // Type : String (HTML cached)
        // Unité : Sans unité
        // Domaine : HTML complet ou null si invalidé
        // Formule : Cache avec invalidation sur modification
        // Exemple : HTML complexe → cache → réutilisation sans recalcul
        this._cachedHTML = null;
        this._cacheVersion = 0;
        
        // Rôle : Indicateurs de modifications pour optimisation
        // Type : Set<String> (propriétés modifiées)
        // Unité : Sans unité
        // Domaine : Noms de propriétés ayant changé
        // Formule : Set.add() sur modification
        // Exemple : Set(['data', 'styles']) → seules ces parties à re-rendre
        this._dirtyFlags = new Set();
        
        // Initialisation finale
        this.init();
        this.validate();
        
        Utils.log('success', `Widget '${this.type}' créé`, {
            id: this.id,
            name: this.name,
            category: this.category
        });
    }
    
    /**
     * Initialisation post-construction
     * Méthode à surcharger dans classes filles pour init spécifique
     */
    init() {
        // Hook pour initialisation spécialisée
        // Émission événement création
        if (this.eventManager) {
            this.eventManager.emit('widget:created', {
                widget: this,
                id: this.id,
                type: this.type
            });
        }
    }
    
    /**
     * Retourne le nom par défaut selon le type
     * 
     * @returns {string} Nom par défaut
     */
    getDefaultName() {
        // Rôle : Mapping des types vers noms français lisibles
        // Type : Object<String, String> (dictionnaire type → nom)
        // Unité : Sans unité
        // Domaine : Types widgets définis dans système révolutionnaire
        // Formule : Map statique des correspondances
        // Exemple : 'element-universel' → 'Élément Universel'
        const defaultNames = {
            'element-universel': 'Élément Universel',
            'grille-composition': 'Grille Composition',
            'button-atomique': 'Bouton',
            'icone-atomique': 'Icône',
            'badge-atomique': 'Badge',
            'separateur-atomique': 'Séparateur',
            'video-atomique': 'Vidéo'
        };
        
        return defaultNames[this.type] || `Widget ${this.type}`;
    }
    
    /**
     * Retourne la description par défaut
     * 
     * @returns {string} Description par défaut
     */
    getDefaultDescription() {
        const defaultDescriptions = {
            'element-universel': 'Widget modulaire universel : image optionnelle + 3 niveaux de texte (H1/H2/P)',
            'grille-composition': 'Compositeur dynamique avec 3 modes : colonne/ligne/grille 2D',
            'button-atomique': 'Bouton interactif avec actions configurables',
            'icone-atomique': 'Icône avec bibliothèque FontAwesome complète',
            'badge-atomique': 'Badge d\'information avec couleurs et styles',
            'separateur-atomique': 'Séparateur visuel pour organiser le contenu',
            'video-atomique': 'Lecteur vidéo avec contrôles avancés'
        };
        
        return defaultDescriptions[this.type] || `Widget de type ${this.type}`;
    }
    
    /**
     * Retourne la catégorie par défaut
     * 
     * @returns {string} Catégorie par défaut
     */
    getDefaultCategory() {
        const defaultCategories = {
            'element-universel': 'universel',
            'grille-composition': 'universel',
            'button-atomique': 'atomique',
            'icone-atomique': 'atomique',
            'badge-atomique': 'atomique',
            'separateur-atomique': 'atomique',
            'video-atomique': 'atomique'
        };
        
        return defaultCategories[this.type] || 'other';
    }
    
    /**
     * Retourne les données par défaut
     * Méthode abstraite à surcharger dans classes filles
     * 
     * @returns {Object} Données par défaut
     */
    getDefaultData() {
        return {};
    }
    
    /**
     * Retourne les styles par défaut
     * 
     * @returns {Object} Styles CSS par défaut
     */
    getDefaultStyles() {
        return {
            // Layout de base
            display: 'block',
            position: 'absolute',
            
            // Espacement
            margin: '0',
            padding: '0',
            
            // Apparence
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '0',
            
            // Typographie héritée
            fontFamily: 'inherit',
            fontSize: 'inherit',
            color: 'inherit',
            
            // Transitions fluides
            transition: 'all 0.2s ease-in-out'
        };
    }
    
    /**
     * Retourne les classes CSS par défaut
     * 
     * @returns {Array<string>} Classes CSS par défaut
     */
    getDefaultClasses() {
        return [
            'widget',                          // Classe de base
            `widget-${this.type}`,            // Classe spécifique type
            `widget-${this.category}`,        // Classe catégorie
            'draggable',                      // Draggable par défaut
            'selectable',                     // Sélectionnable
            'widget-revolutionary'            // Marqueur système révolutionnaire
        ];
    }
    
    /**
     * Retourne les attributs HTML par défaut
     * 
     * @returns {Object} Attributs HTML par défaut
     */
    getDefaultAttributes() {
        return {
            'data-widget-id': this.id,
            'data-widget-type': this.type,
            'data-widget-category': this.category,
            'draggable': 'false', // Géré par DragDropSystem
            'tabindex': this.editable ? '0' : '-1'
        };
    }
    
    /**
     * Retourne la position par défaut
     * 
     * @returns {Object} Position par défaut
     */
    getDefaultPosition() {
        return {
            x: 0,
            y: 0,
            width: 200,
            height: 100,
            zIndex: 1
        };
    }
    
    /**
     * Valide la configuration du widget
     * 
     * @throws {Error} Si configuration invalide
     */
    validate() {
        // Validation du type
        if (!this.type || typeof this.type !== 'string') {
            throw new Error('Type de widget requis et doit être une chaîne');
        }
        
        // Validation de l'ID
        if (!this.id || typeof this.id !== 'string') {
            throw new Error('ID de widget requis et doit être une chaîne');
        }
        
        // Validation position
        if (!this.position || typeof this.position !== 'object') {
            throw new Error('Position de widget requise et doit être un objet');
        }
        
        const { x, y, width, height } = this.position;
        if (typeof x !== 'number' || typeof y !== 'number') {
            throw new Error('Position x,y doit être numérique');
        }
        
        if (typeof width !== 'number' || width < 0 || typeof height !== 'number' || height < 0) {
            throw new Error('Dimensions width,height doivent être numériques positives');
        }
        
        // Validation hiérarchie
        if (!this.hierarchy || typeof this.hierarchy !== 'object') {
            throw new Error('Hiérarchie de widget requise');
        }
        
        if (!Array.isArray(this.hierarchy.children)) {
            throw new Error('hierarchy.children doit être un tableau');
        }
        
        // Validation données spécifiques
        this.validateData();
        
        Utils.log('info', `Widget '${this.type}' validé avec succès`, {
            id: this.id,
            position: this.position,
            hierarchyLevel: this.hierarchy.level
        });
    }
    
    /**
     * Valide les données spécifiques au widget
     * Méthode abstraite à surcharger dans classes filles
     */
    validateData() {
        // Validation générique
        if (this.data && typeof this.data !== 'object') {
            throw new Error('Les données du widget doivent être un objet');
        }
    }
    
    /**
     * Met à jour les données du widget
     * 
     * @param {Object} newData - Nouvelles données
     * @param {boolean} merge - Fusionner avec existantes (défaut: true)
     */
    updateData(newData, merge = true) {
        if (merge && this.data) {
            // Rôle : Fusionneur intelligent de données avec deep merge
            // Type : Object (données fusionnées)
            // Unité : Sans unité
            // Domaine : Object avec propriétés combinées sans collision
            // Formule : Utils.deepMerge(existantes, nouvelles) → fusion récursive
            // Exemple : {h1: {content: 'ancien'}} + {h1: {styles: {...}}} → fusion complète
            this.data = Utils.deepMerge(this.data, newData);
        } else {
            this.data = newData;
        }
        
        // Invalidation cache
        this.invalidateCache();
        this.markDirty('data');
        
        // Mise à jour timestamp
        this.metadata.modified = new Date().toISOString();
        
        // Validation
        this.validateData();
        
        // Notification
        this.emitChange('data-updated', { newData, merge });
        
        Utils.log('info', `Données widget '${this.id}' mises à jour`, {
            merge,
            keys: Object.keys(newData)
        });
    }
    
    /**
     * Met à jour les styles du widget
     * 
     * @param {Object} newStyles - Nouveaux styles
     * @param {boolean} merge - Fusionner avec existants (défaut: true)
     */
    updateStyles(newStyles, merge = true) {
        if (merge && this.styles) {
            this.styles = { ...this.styles, ...newStyles };
        } else {
            this.styles = newStyles;
        }
        
        this.invalidateCache();
        this.markDirty('styles');
        this.metadata.modified = new Date().toISOString();
        
        this.emitChange('styles-updated', { newStyles, merge });
        
        Utils.log('info', `Styles widget '${this.id}' mis à jour`);
    }
    
    /**
     * Met à jour la position du widget
     * 
     * @param {Object} newPosition - Nouvelle position
     * @param {boolean} merge - Fusionner avec position existante
     */
    updatePosition(newPosition, merge = true) {
        if (merge && this.position) {
            this.position = { ...this.position, ...newPosition };
        } else {
            this.position = newPosition;
        }
        
        // Validation position
        const { x, y, width, height } = this.position;
        if (typeof x !== 'number' || typeof y !== 'number' || 
            typeof width !== 'number' || width < 0 ||
            typeof height !== 'number' || height < 0) {
            throw new Error('Position invalide après mise à jour');
        }
        
        this.invalidateCache();
        this.markDirty('position');
        this.metadata.modified = new Date().toISOString();
        
        this.emitChange('position-updated', { newPosition, merge });
        
        Utils.log('info', `Position widget '${this.id}' mise à jour`, this.position);
    }
    
    /**
     * Met à jour l'état du widget
     * 
     * @param {Object} newState - Nouvel état
     */
    updateState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Certains changements d'état n'invalident pas le cache de contenu
        const cacheInvalidatingStates = ['editing', 'collapsed'];
        const shouldInvalidateCache = Object.keys(newState).some(key => 
            cacheInvalidatingStates.includes(key)
        );
        
        if (shouldInvalidateCache) {
            this.invalidateCache();
        }
        
        this.markDirty('state');
        
        this.emitChange('state-updated', { oldState, newState });
        
        Utils.log('info', `État widget '${this.id}' mis à jour`, {
            changes: Object.keys(newState)
        });
    }
    
    /**
     * Ajoute un widget enfant
     * 
     * @param {string} childId - ID du widget enfant
     * @param {number} index - Index d'insertion (optionnel)
     */
    addChild(childId, index = null) {
        if (!childId || typeof childId !== 'string') {
            throw new Error('ID enfant requis et doit être une chaîne');
        }
        
        if (this.hierarchy.children.includes(childId)) {
            Utils.log('warn', `Enfant '${childId}' déjà présent dans '${this.id}'`);
            return;
        }
        
        // Rôle : Gestionnaire d'ajout hiérarchique avec index
        // Type : Void (effet de bord hierarchy)
        // Unité : Sans unité
        // Domaine : Hiérarchie parent-enfant valide
        // Formule : children.splice(index, 0, childId) ou push
        // Exemple : Ajout widget dans grille à position spécifique
        
        if (index !== null && index >= 0 && index <= this.hierarchy.children.length) {
            this.hierarchy.children.splice(index, 0, childId);
        } else {
            this.hierarchy.children.push(childId);
        }
        
        this.invalidateCache();
        this.markDirty('hierarchy');
        this.metadata.modified = new Date().toISOString();
        
        this.emitChange('child-added', { childId, index: index || this.hierarchy.children.length - 1 });
        
        Utils.log('info', `Enfant '${childId}' ajouté à '${this.id}'`, {
            index: index || this.hierarchy.children.length - 1,
            totalChildren: this.hierarchy.children.length
        });
    }
    
    /**
     * Supprime un widget enfant
     * 
     * @param {string} childId - ID du widget enfant
     */
    removeChild(childId) {
        const index = this.hierarchy.children.indexOf(childId);
        if (index === -1) {
            Utils.log('warn', `Enfant '${childId}' non trouvé dans '${this.id}'`);
            return;
        }
        
        // Rôle : Gestionnaire de suppression hiérarchique
        // Type : Void (effet de bord hierarchy)
        // Unité : Sans unité
        // Domaine : Suppression avec préservation ordre
        // Formule : children.splice(index, 1)
        // Exemple : Suppression widget de grille → réorganisation automatique
        
        this.hierarchy.children.splice(index, 1);
        
        this.invalidateCache();
        this.markDirty('hierarchy');
        this.metadata.modified = new Date().toISOString();
        
        this.emitChange('child-removed', { childId, index });
        
        Utils.log('info', `Enfant '${childId}' supprimé de '${this.id}'`, {
            oldIndex: index,
            remainingChildren: this.hierarchy.children.length
        });
    }
    
    /**
     * Définit le parent du widget
     * 
     * @param {string|null} parentId - ID du parent ou null
     */
    setParent(parentId) {
        const oldParentId = this.hierarchy.parentId;
        this.hierarchy.parentId = parentId;
        
        // Recalcul niveau hiérarchique si nécessaire
        // TODO: Implémenter calcul niveau basé sur parent
        
        this.markDirty('hierarchy');
        this.metadata.modified = new Date().toISOString();
        
        this.emitChange('parent-changed', { oldParentId, newParentId: parentId });
        
        Utils.log('info', `Parent widget '${this.id}' changé`, {
            old: oldParentId,
            new: parentId
        });
    }
    
    /**
     * Génère le HTML du widget pour le viewer
     * Méthode abstraite à surcharger dans classes filles
     * 
     * @param {Object} renderOptions - Options de rendu
     * @returns {string} HTML du widget
     */
    render(renderOptions = {}) {
        throw new Error('La méthode render() doit être implémentée dans la classe fille');
    }
    
    /**
     * Génère le HTML pour l'éditeur avec contrôles
     * 
     * @param {Object} editorOptions - Options d'édition
     * @returns {string} HTML pour l'éditeur
     */
    renderEditor(editorOptions = {}) {
        // Rôle : Générateur HTML éditeur avec contrôles d'édition
        // Type : String (HTML enrichi)
        // Unité : Sans unité
        // Domaine : HTML viewer + contrôles interaction
        // Formule : render() + wrapper contrôles
        // Exemple : Contenu normal + poignées resize + boutons édition
        
        const viewerHTML = this.render(editorOptions);
        
        if (!this.editable) {
            return viewerHTML;
        }
        
        // Wrapper avec contrôles d'édition
        const controlsHTML = this.generateEditorControls(editorOptions);
        
        return `
            <div class="widget-editor-wrapper" data-widget-id="${this.id}">
                ${viewerHTML}
                ${controlsHTML}
            </div>
        `;
    }
    
    /**
     * Génère les contrôles d'édition
     * 
     * @param {Object} options - Options de génération
     * @returns {string} HTML des contrôles
     */
    generateEditorControls(options = {}) {
        // Rôle : Générateur de contrôles d'édition contextuels
        // Type : String (HTML contrôles)
        // Unité : Sans unité
        // Domaine : Contrôles spécifiques au type widget + génériques
        // Formule : Contrôles de base + contrôles spécialisés
        // Exemple : Resize handles + bouton propriétés + actions spécifiques
        
        const showResize = options.showResize !== false;
        const showActions = options.showActions !== false;
        
        let controlsHTML = '';
        
        // Poignées de redimensionnement
        if (showResize && this.canResize()) {
            controlsHTML += `
                <div class="resize-handles">
                    <div class="resize-handle nw" data-direction="nw"></div>
                    <div class="resize-handle n" data-direction="n"></div>
                    <div class="resize-handle ne" data-direction="ne"></div>
                    <div class="resize-handle w" data-direction="w"></div>
                    <div class="resize-handle e" data-direction="e"></div>
                    <div class="resize-handle sw" data-direction="sw"></div>
                    <div class="resize-handle s" data-direction="s"></div>
                    <div class="resize-handle se" data-direction="se"></div>
                </div>
            `;
        }
        
        // Boutons d'action
        if (showActions) {
            controlsHTML += `
                <div class="widget-actions">
                    <button class="widget-action" data-action="properties" title="Propriétés">
                        ⚙️
                    </button>
                    <button class="widget-action" data-action="duplicate" title="Dupliquer">
                        📋
                    </button>
                    <button class="widget-action" data-action="delete" title="Supprimer">
                        🗑️
                    </button>
                </div>
            `;
        }
        
        return controlsHTML;
    }
    
    /**
     * Vérifie si le widget peut être redimensionné
     * 
     * @returns {boolean} true si redimensionnable
     */
    canResize() {
        // Par défaut, tous widgets redimensionnables
        // Peut être surchargé dans classes filles
        return true;
    }
    
    /**
     * Génère les styles CSS inline du widget
     * 
     * @returns {string} CSS inline formaté
     */
    getStylesCSS() {
        if (!this.styles || Object.keys(this.styles).length === 0) {
            return '';
        }
        
        // Rôle : Convertisseur styles objet vers CSS inline
        // Type : String (CSS formaté)
        // Unité : Unités CSS variées selon propriétés
        // Domaine : CSS syntaxiquement correct
        // Formule : Object.entries + camelCase→kebab-case + join
        // Exemple : {fontSize: '16px', marginTop: '10px'} → 'font-size: 16px; margin-top: 10px;'
        
        // Ajout position absolue avec coordonnées
        const positionStyles = {
            left: `${this.position.x}px`,
            top: `${this.position.y}px`,
            width: `${this.position.width}px`,
            height: `${this.position.height}px`,
            zIndex: this.position.zIndex || 1
        };
        
        const allStyles = { ...this.styles, ...positionStyles };
        
        return Utils.stylesToCSS(allStyles);
    }
    
    /**
     * Génère les classes CSS du widget
     * 
     * @returns {string} Classes formatées
     */
    getClassesCSS() {
        if (!this.classes || this.classes.length === 0) {
            return '';
        }
        
        // Ajout classes d'état
        const stateClasses = [];
        if (this.state.selected) stateClasses.push('widget-selected');
        if (this.state.hovered) stateClasses.push('widget-hovered');
        if (this.state.editing) stateClasses.push('widget-editing');
        if (this.state.locked) stateClasses.push('widget-locked');
        if (this.state.collapsed) stateClasses.push('widget-collapsed');
        
        const allClasses = [...this.classes, ...stateClasses];
        
        return allClasses.join(' ');
    }
    
    /**
     * Génère les attributs HTML du widget
     * 
     * @returns {string} Attributs formatés
     */
    getAttributesHTML() {
        const attributes = {
            id: this.id,
            ...this.attributes
        };
        
        // Ajout attributs d'état
        if (this.state.selected) attributes['data-selected'] = 'true';
        if (this.state.locked) attributes['data-locked'] = 'true';
        if (!this.visible) attributes['hidden'] = 'true';
        
        return Object.entries(attributes)
            .map(([attr, value]) => `${attr}="${Utils.escapeHTML(String(value))}"`)
            .join(' ');
    }
    
    /**
     * Clone le widget avec nouvel ID
     * 
     * @param {Object} overrides - Propriétés à surcharger
     * @returns {BaseWidget} Clone du widget
     */
    clone(overrides = {}) {
        // Rôle : Clonage profond avec génération nouvel ID
        // Type : BaseWidget (clone complet)
        // Unité : Sans unité
        // Domaine : Widget identique avec ID unique
        // Formule : deepClone(config) + nouvel ID + overrides
        // Exemple : Duplication widget → clone avec position décalée
        
        const clonedConfig = Utils.deepClone({
            name: `${this.name} (Copie)`,
            description: this.description,
            category: this.category,
            data: this.data,
            styles: this.styles,
            classes: this.classes,
            attributes: this.attributes,
            editable: this.editable,
            visible: this.visible,
            position: {
                ...this.position,
                x: this.position.x + 20,  // Décalage pour distinguer
                y: this.position.y + 20
            },
            hierarchy: {
                parentId: this.hierarchy.parentId,
                children: [], // Clone sans enfants
                index: this.hierarchy.index + 1,
                level: this.hierarchy.level
            },
            state: {
                ...this.state,
                selected: false // Clone pas sélectionné
            },
            metadata: {
                ...this.metadata,
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            },
            ...overrides
        });
        
        // Pas d'ID dans config → nouveau généré automatiquement
        return new this.constructor(this.type, clonedConfig, this.eventManager);
    }
    
    /**
     * Marque une propriété comme modifiée
     * 
     * @param {string} property - Propriété modifiée
     */
    markDirty(property) {
        this._dirtyFlags.add(property);
    }
    
    /**
     * Vérifie si une propriété est modifiée
     * 
     * @param {string} property - Propriété à vérifier
     * @returns {boolean} true si modifiée
     */
    isDirty(property = null) {
        if (property) {
            return this._dirtyFlags.has(property);
        }
        return this._dirtyFlags.size > 0;
    }
    
    /**
     * Nettoie les flags de modification
     * 
     * @param {string} property - Propriété à nettoyer (optionnel)
     */
    clearDirty(property = null) {
        if (property) {
            this._dirtyFlags.delete(property);
        } else {
            this._dirtyFlags.clear();
        }
    }
    
    /**
     * Invalide le cache HTML
     */
    invalidateCache() {
        this._cachedHTML = null;
        this._cacheVersion++;
    }
    
    /**
     * Émet un événement de changement
     * 
     * @param {string} changeType - Type de changement
     * @param {Object} changeData - Données du changement
     */
    emitChange(changeType, changeData = {}) {
        if (!this.eventManager) return;
        
        // Rôle : Émetteur d'événements de modification widget
        // Type : Void (effet de bord événement)
        // Unité : Sans unité
        // Domaine : Événement avec données contextuelles
        // Formule : eventManager.emit avec données widget
        // Exemple : Modification data → 'widget:data-updated' + détails
        
        this.eventManager.emit(`widget:${changeType}`, {
            widget: this,
            widgetId: this.id,
            widgetType: this.type,
            changeType,
            changeData,
            timestamp: Date.now()
        });
        
        // Événement générique de modification
        this.eventManager.emit('widget:modified', {
            widget: this,
            widgetId: this.id,
            changeType,
            changeData
        });
    }
    
    /**
     * Exporte le widget vers JSON
     * 
     * @param {boolean} includeMetadata - Inclure métadonnées (défaut: true)
     * @returns {Object} Représentation JSON
     */
    toJSON(includeMetadata = true) {
        const jsonData = {
            id: this.id,
            type: this.type,
            name: this.name,
            description: this.description,
            category: this.category,
            data: this.data,
            styles: this.styles,
            classes: this.classes,
            attributes: this.attributes,
            editable: this.editable,
            visible: this.visible,
            position: this.position,
            hierarchy: this.hierarchy,
            state: this.state
        };
        
        if (includeMetadata) {
            jsonData.metadata = this.metadata;
        }
        
        return jsonData;
    }
    
    /**
     * Importe un widget depuis JSON
     * 
     * @param {Object} jsonData - Données JSON
     * @param {EventManager} eventManager - Gestionnaire événements
     * @returns {BaseWidget} Widget reconstitué
     */
    static fromJSON(jsonData, eventManager = null) {
        if (!jsonData.type) {
            throw new Error('Type de widget manquant dans données JSON');
        }
        
        // Rôle : Désérialiseur JSON vers instance widget
        // Type : BaseWidget (widget reconstitué)
        // Unité : Sans unité
        // Domaine : Instance complète depuis données sérialisées
        // Formule : new constructor(type, config) avec validation
        // Exemple : JSON sauvegardé → widget fonctionnel restauré
        
        const config = {
            id: jsonData.id,
            name: jsonData.name,
            description: jsonData.description,
            category: jsonData.category,
            data: jsonData.data,
            styles: jsonData.styles,
            classes: jsonData.classes,
            attributes: jsonData.attributes,
            editable: jsonData.editable,
            visible: jsonData.visible,
            position: jsonData.position,
            hierarchy: jsonData.hierarchy,
            state: jsonData.state,
            metadata: jsonData.metadata
        };
        
        // Instanciation via constructeur approprié
        // Note: Nécessite registry des types pour résolution automatique
        return new this(jsonData.type, config, eventManager);
    }
    
    /**
     * Obtient les informations d'état complet
     * 
     * @returns {Object} État complet du widget
     */
    getState() {
        return {
            // Identification
            id: this.id,
            type: this.type,
            name: this.name,
            category: this.category,
            
            // Configuration
            editable: this.editable,
            visible: this.visible,
            
            // Géométrie
            position: { ...this.position },
            
            // Hiérarchie
            hierarchy: {
                ...this.hierarchy,
                childrenCount: this.hierarchy.children.length
            },
            
            // État interaction
            state: { ...this.state },
            
            // Métadonnées
            metadata: { ...this.metadata },
            
            // Performance
            isDirty: this.isDirty(),
            dirtyFlags: Array.from(this._dirtyFlags),
            cacheVersion: this._cacheVersion,
            
            // Validation
            isValid: this.isValid()
        };
    }
    
    /**
     * Vérifie la validité actuelle du widget
     * 
     * @returns {boolean} true si valide
     */
    isValid() {
        try {
            this.validate();
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Nettoie les ressources du widget
     */
    destroy() {
        // Rôle : Destructeur complet du widget
        // Type : Void (effet de bord)
        // Unité : Sans unité
        // Domaine : Libération ressources + notification
        // Formule : Clear cache + emit destroy + reset références
        // Exemple : Suppression widget → nettoyage complet mémoire
        
        // Notification destruction
        this.emitChange('destroyed', { id: this.id });
        
        // Nettoyage cache
        this.invalidateCache();
        this._dirtyFlags.clear();
        
        // Nettoyage hiérarchie
        this.hierarchy.children = [];
        
        Utils.log('warn', `Widget '${this.id}' détruit`);
    }
    
    /**
     * Représentation textuelle pour debug
     * 
     * @returns {string} Informations formatées
     */
    toString() {
        return `Widget[${this.type}](${this.id}): "${this.name}" @(${this.position.x},${this.position.y}) ${this.position.width}×${this.position.height}`;
    }
}

// Export pour utilisation globale
window.BaseWidget = BaseWidget;
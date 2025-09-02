/**
 * 🧱 BASEWIDGET - CLASSE PARENT ATOMIQUE SIMPLIFIÉE
 * 
 * Rôle : Classe parent commune à tous les widgets atomiques
 * Type : Classe abstraite avec fonctionnalités de base réutilisables
 * Unité : Widget = une responsabilité unique et testable
 * Domaine : Base pour WidgetTexte, WidgetImage, etc.
 * Formule : Héritage + Composition = Réutilisation maximale
 * Exemple : BaseWidget → WidgetTexte (contenu texte uniquement)
 */

// Namespace global pour éviter les conflits de noms
window.WidgetEditor = window.WidgetEditor || {};

/**
 * Classe BaseWidget - Fondation commune pour tous les widgets atomiques
 * Architecture SOLID : Single Responsibility, Open/Closed, Liskov Substitution
 */
window.WidgetEditor.BaseWidget = class BaseWidget {
    /**
     * Constructeur de base pour tous les widgets
     * 
     * Rôle : Initialisation des propriétés communes partagées
     * Type : Constructeur abstrait (ne pas instancier directement)
     * Unité : Instance de widget avec ID unique
     * Domaine : Tous les types de widgets héritent de cette base
     * Formule : new Widget(editor, id, options) → instance configurée
     * Exemple : new WidgetTexte(editor, "widget_1", { content: "Hello" })
     * 
     * @param {Object} editor - Référence vers l'éditeur principal
     * @param {string} widgetId - Identifiant unique du widget
     * @param {Object} options - Options de configuration initiale
     */
    constructor(editor, widgetId, options = {}) {
        // === VÉRIFICATION HÉRITAGE ===
        // Empêche l'instanciation directe de BaseWidget (classe abstraite)
        if (this.constructor === BaseWidget) {
            throw new Error('BaseWidget est une classe abstraite - utilisez WidgetTexte, WidgetImage, etc.');
        }
        
        // === RÉFÉRENCES SYSTÈME ===
        // Référence : Lien vers l'éditeur principal pour communication
        // Type : Object (instance Editor)
        // Unité : Instance unique de l'éditeur
        // Domaine : Editor valide et initialisé
        // Exemple : this.editor.selectWidget(this)
        this.editor = editor;
        
        // Identifiant : ID unique pour identification et persistance
        // Type : string (format: "widget_counter_timestamp")
        // Unité : Caractères alphanumériques et underscores
        // Domaine : Unique dans toute l'application
        // Exemple : "widget_1_1703875432123"
        this.id = widgetId;
        
        // === CONFIGURATION WIDGET ===
        // Configuration : Paramètres du widget (position, dimensions, styles)
        // Type : Object avec propriétés imbriquées
        // Unité : Configuration complète et cohérente
        // Domaine : Valeurs valides selon contraintes métier
        // Formule : config = defaults ∪ options (union avec priorité options)
        // Exemple : { position: {x: 100, y: 50}, dimensions: {width: 300} }
        this.config = {
            // Position : Coordonnées absolues dans la grille
            // Type : Object {x: number, y: number}
            // Unité : Pixels depuis origine (0,0) en haut-gauche
            // Domaine : x,y ∈ [-10000, 10000] (limites grille infinie)
            // Exemple : {x: 150, y: 75}
            position: {
                x: options.x || 100,
                y: options.y || 100
            },
            
            // Dimensions : Taille du widget
            // Type : Object {width: number|string, height: number|string}
            // Unité : Pixels ou 'auto' pour hauteur adaptative
            // Domaine : width ∈ [50, 1200], height ∈ [30, ∞] ou 'auto'
            // Exemple : {width: 300, height: 'auto'}
            dimensions: {
                width: options.width || 300,
                height: options.height || 'auto',
                minWidth: 50,
                minHeight: 30,
                maxWidth: 1200
            },
            
            // Styles : Propriétés visuelles CSS
            // Type : Object avec propriétés CSS
            // Unité : Valeurs CSS valides (px, couleurs hex/rgba, etc.)
            // Domaine : Propriétés CSS standards
            // Exemple : {backgroundColor: '#ffffff', borderRadius: 8}
            styles: {
                backgroundColor: options.backgroundColor || 'transparent',
                borderColor: options.borderColor || '#e2e8f0',
                borderWidth: options.borderWidth || 1,
                borderStyle: options.borderStyle || 'solid',
                borderRadius: options.borderRadius || 4,
                padding: options.padding || 16
            },
            
            // États : Propriétés d'état du widget
            // Type : Boolean pour chaque état
            // Unité : true/false
            // Domaine : États mutuellement compatibles
            // Exemple : {isSelected: false, isVisible: true}
            isSelected: false,
            isVisible: options.isVisible !== false,
            isLocked: options.isLocked || false,
            isEditing: false
        };
        
        // === ÉLÉMENTS DOM ===
        // Éléments : Références vers les éléments DOM du widget
        // Type : Object avec propriétés HTMLElement
        // Unité : Éléments DOM créés et référencés
        // Domaine : Éléments valides et attachés au document
        // Exemple : {container: div.widget, contentArea: div.content}
        this.elements = {
            container: null,     // Conteneur principal du widget
            contentArea: null    // Zone de contenu éditable
        };
        
        // === GESTIONNAIRES ÉVÉNEMENTS ===
        // Gestionnaires : Collection des event listeners pour nettoyage
        // Type : Map<string, Array<EventListenerConfig>>
        // Unité : Gestionnaire = {element, event, handler}
        // Domaine : Événements DOM valides
        // Formule : Map permet O(1) pour ajout/suppression
        // Exemple : Map{ 'click' => [{element: div, event: 'click', handler: fn}] }
        this.eventHandlers = new Map();
        
        // === INITIALISATION ===
        // Démarrage automatique de la création DOM et configuration
        this.init();
    }
    
    /**
     * Initialisation du widget - Template Method Pattern
     * 
     * Rôle : Séquence d'initialisation standardisée pour tous les widgets
     * Type : Méthode template avec étapes fixes
     * Unité : Initialisation complète et cohérente
     * Domaine : Toujours réussir ou lever une exception
     * Formule : init() = createDOM() → setupEvents() → applyStyles() → render()
     * Exemple : Appelé automatiquement dans le constructeur
     */
    init() {
        try {
            // Étape 1 : Création de la structure DOM
            this.createDOM();
            
            // Étape 2 : Configuration des événements interactifs
            this.setupEvents();
            
            // Étape 3 : Application des styles CSS
            this.applyStyles();
            
            // Étape 4 : Initialisation du contenu spécifique (à surcharger)
            this.initializeContent();
            
            console.log(`[BaseWidget] Widget initialisé: ${this.id}`);
            
        } catch (error) {
            console.error(`[BaseWidget] Erreur initialisation widget ${this.id}:`, error);
            throw error;
        }
    }
    
    /**
     * Création de la structure DOM de base
     * 
     * Rôle : Créer les éléments DOM communs à tous les widgets
     * Type : Méthode de création DOM standardisée
     * Unité : Structure DOM complète et valide
     * Domaine : Éléments DOM bien formés et accessibles
     * Formule : DOM = container(contentArea) avec attributs métier
     * Exemple : <div class="widget" data-widget-id="123"><div class="content"></div></div>
     */
    createDOM() {
        // === CONTENEUR PRINCIPAL ===
        // Container : Élément racine positionné et dimensionné
        // Type : HTMLDivElement
        // Unité : Element DOM avec classes CSS et attributs métier
        // Domaine : Position absolue dans la grille parente
        // Exemple : <div class="base-widget" style="position: absolute; left: 100px; top: 50px;">
        this.elements.container = document.createElement('div');
        this.elements.container.className = 'base-widget';
        this.elements.container.id = this.id;
        this.elements.container.style.position = 'absolute';
        this.elements.container.style.cursor = 'pointer';
        
        // Attributs métier pour identification et sélection
        this.elements.container.setAttribute('data-widget-type', this.getType());
        this.elements.container.setAttribute('data-widget-id', this.id);
        
        // === ZONE DE CONTENU ===
        // ContentArea : Zone éditable pour le contenu du widget
        // Type : HTMLDivElement
        // Unité : Zone de contenu avec styles de base
        // Domaine : Contenu textuel, images, ou autres éléments spécifiques
        // Exemple : <div class="widget-content" contenteditable="false">Contenu</div>
        this.elements.contentArea = document.createElement('div');
        this.elements.contentArea.className = 'widget-content';
        this.elements.contentArea.style.width = '100%';
        this.elements.contentArea.style.minHeight = '20px';
        this.elements.contentArea.style.outline = 'none';
        
        // === ASSEMBLAGE DOM ===
        // Formule : container.appendChild(contentArea) = hiérarchie parent-enfant
        this.elements.container.appendChild(this.elements.contentArea);
        
        // === DIMENSIONS INITIALES ===
        this.updateDimensions();
    }
    
    /**
     * Configuration des événements de base
     * 
     * Rôle : Ajouter les interactions communes (clic, double-clic, drag)
     * Type : Configuration d'événements DOM standardisée
     * Unité : Ensemble cohérent d'interactions utilisateur
     * Domaine : Événements DOM standards et compatibles navigateurs
     * Formule : Events = Selection + Edition + Drag (comportements additifs)
     * Exemple : Click → select, DoubleClick → edit, MouseDown → drag
     */
    setupEvents() {
        const container = this.elements.container;
        const contentArea = this.elements.contentArea;
        
        // === SÉLECTION WIDGET ===
        // Événement : Clic simple pour sélectionner le widget
        // Type : Event listener 'click'
        // Unité : Sélection unique (désélection des autres)
        // Domaine : Clic dans la zone du widget
        // Formule : click(widget) → select(widget) ∧ deselect(others)
        // Exemple : Clic sur texte → bordure bleue de sélection
        this.addEventHandler(container, 'click', (e) => {
            e.stopPropagation();
            this.setSelected(true);
            this.editor?.selectWidget?.(this);
        });
        
        // === ÉDITION INLINE ===
        // Événement : Double-clic pour démarrer l'édition
        // Type : Event listener 'dblclick'
        // Unité : Basculement en mode édition
        // Domaine : Double-clic sur zone de contenu
        // Formule : dblclick(content) → startEditing() si !isLocked
        // Exemple : Double-clic sur texte → mode édition contenteditable
        this.addEventHandler(contentArea, 'dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.config.isLocked) {
                this.startEditing();
            }
        });
        
        // === DÉPLACEMENT DRAG & DROP ===
        // Événement : MouseDown pour initier le déplacement
        // Type : Event listener 'mousedown'
        // Unité : Démarrage du drag repositionnement
        // Domaine : Clic maintenu sur widget non verrouillé
        // Formule : mousedown(widget) → drag(widget) si !isLocked
        // Exemple : Clic-maintenu sur widget → curseur déplacement + suivi souris
        this.addEventHandler(container, 'mousedown', (e) => {
            if (this.config.isLocked) return;
            
            // Délégation au système drag & drop de l'éditeur
            if (this.editor?.state?.dragDrop) {
                this.editor.state.dragDrop.startWidgetRepositioning(e, this);
            }
        });
    }
    
    /**
     * Application des styles CSS selon la configuration
     * 
     * Rôle : Appliquer visuellement la configuration styles du widget
     * Type : Mapping configuration → styles CSS
     * Unité : Styles visuels cohérents et valides
     * Domaine : Propriétés CSS compatibles navigateurs
     * Formule : CSS = config.styles + config.position + config.dimensions + states
     * Exemple : {borderWidth: 2, borderColor: '#blue'} → style="border: 2px solid #blue"
     */
    applyStyles() {
        const container = this.elements.container;
        const styles = this.config.styles;
        
        // === STYLES VISUELS DE BASE ===
        // Application : Propriétés de fond et bordures
        // Formule : style[property] = config.styles[property]
        container.style.backgroundColor = styles.backgroundColor;
        container.style.border = `${styles.borderWidth}px ${styles.borderStyle} ${styles.borderColor}`;
        container.style.borderRadius = `${styles.borderRadius}px`;
        container.style.padding = `${styles.padding}px`;
        
        // === ÉTAT DE SÉLECTION ===
        // Style conditionnel : Bordure de sélection si widget sélectionné
        // Type : Style conditionnel basé sur état booléen
        // Formule : style = isSelected ? selectedStyle : normalStyle
        // Exemple : isSelected=true → boxShadow='0 0 0 2px blue'
        if (this.config.isSelected) {
            container.classList.add('selected');
            container.style.boxShadow = '0 0 0 2px #60a5fa, 0 0 0 4px rgba(96, 165, 250, 0.3)';
        } else {
            container.classList.remove('selected');
            container.style.boxShadow = 'none';
        }
        
        // === VISIBILITÉ ===
        // Affichage : Contrôle de la visibilité du widget
        // Formule : display = isVisible ? 'block' : 'none'
        container.style.display = this.config.isVisible ? 'block' : 'none';
        
        // === ÉTAT VERROUILLÉ ===
        // Styles verrouillage : Indication visuelle du verrouillage
        // Formule : locked → cursor + opacity pour feedback utilisateur
        if (this.config.isLocked) {
            container.style.cursor = 'not-allowed';
            container.style.opacity = '0.7';
        } else {
            container.style.cursor = 'pointer';
            container.style.opacity = '1';
        }
    }
    
    /**
     * Mise à jour des dimensions et position
     * 
     * Rôle : Appliquer les dimensions et position configurées au DOM
     * Type : Synchronisation configuration → styles DOM
     * Unité : Dimensions et position cohérentes
     * Domaine : Valeurs positives pour dimensions, coordonnées dans limites grille
     * Formule : DOM.style = config.dimensions + config.position
     * Exemple : config{width:300, x:100} → style="width:300px; left:100px"
     */
    updateDimensions() {
        const container = this.elements.container;
        const dimensions = this.config.dimensions;
        
        // === APPLICATION LARGEUR ===
        // Largeur : Toujours en pixels pour contrôle précis
        // Formule : width = isNumber(width) ? width + 'px' : width
        container.style.width = typeof dimensions.width === 'number' ? 
            `${dimensions.width}px` : dimensions.width;
        
        // === APPLICATION HAUTEUR ===
        // Hauteur : Auto-adaptative ou fixe selon configuration
        // Formule : height = (height === 'auto') ? 'auto' : height + 'px'
        if (dimensions.height === 'auto') {
            // Mode auto : Hauteur selon contenu (défini dans classes enfants)
            container.style.height = 'auto';
        } else {
            container.style.height = `${dimensions.height}px`;
        }
        
        // === APPLICATION POSITION ===
        // Position : Coordonnées absolues dans la grille
        // Formule : position = 'absolute' + left + top
        container.style.left = `${this.config.position.x}px`;
        container.style.top = `${this.config.position.y}px`;
    }
    
    // === MÉTHODES ABSTRAITES ===
    // Ces méthodes doivent être surchargées dans les classes enfants
    
    /**
     * Initialisation du contenu spécifique (À SURCHARGER)
     * 
     * Rôle : Initialisation du contenu spécifique au type de widget
     * Type : Méthode abstraite virtuelle
     * Unité : Contenu initialisé selon type (texte, image, etc.)
     * Domaine : Contenu valide selon type de widget
     * Formule : Implémentation spécifique dans chaque classe enfant
     * Exemple : WidgetTexte → rendu Markdown, WidgetImage → chargement image
     */
    initializeContent() {
        // Méthode virtuelle - À implémenter dans les classes enfants
        console.warn(`[BaseWidget] initializeContent() doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Démarrage de l'édition (À SURCHARGER)
     * 
     * Rôle : Basculer en mode édition selon le type de widget
     * Type : Méthode abstraite virtuelle
     * Unité : Mode édition activé et fonctionnel
     * Domaine : Édition appropriée au contenu (texte, propriétés, etc.)
     * Formule : Implémentation spécifique dans chaque classe enfant
     * Exemple : WidgetTexte → contenteditable, WidgetImage → sélecteur fichier
     */
    startEditing() {
        // Méthode virtuelle - À implémenter dans les classes enfants
        console.warn(`[BaseWidget] startEditing() doit être implémentée dans ${this.constructor.name}`);
    }
    
    /**
     * Retour du type de widget (À SURCHARGER)
     * 
     * Rôle : Identifier le type de widget pour sérialisation et affichage
     * Type : Getter de type abstrait
     * Unité : Chaîne identifiant le type
     * Domaine : Types prédéfinis ('text', 'image', 'button', etc.)
     * Formule : return 'typename' dans chaque classe enfant
     * Exemple : WidgetTexte → 'text', WidgetImage → 'image'
     */
    getType() {
        // Méthode abstraite - À implémenter dans les classes enfants
        return 'base'; 
    }
    
    // === INTERFACE PUBLIQUE COMMUNE ===
    
    /**
     * Rendu du widget dans un conteneur parent
     * 
     * Rôle : Ajouter le widget au DOM d'un conteneur parent
     * Type : Méthode d'insertion DOM
     * Unité : Widget visible et interactif dans le parent
     * Domaine : Parent doit être un élément DOM valide
     * Formule : parent.appendChild(widget.container)
     * Exemple : gridElement.appendChild(widgetTexte.container)
     * 
     * @param {HTMLElement} parent - Élément parent où insérer le widget
     */
    render(parent) {
        if (parent && typeof parent.appendChild === 'function') {
            parent.appendChild(this.elements.container);
            console.log(`[BaseWidget] Widget rendu: ${this.id}`);
        } else {
            console.error(`[BaseWidget] Parent invalide pour rendu: ${this.id}`);
        }
    }
    
    /**
     * Définition de l'état de sélection
     * 
     * Rôle : Changer l'état sélectionné et mettre à jour l'affichage
     * Type : Setter d'état avec effet de bord visuel
     * Unité : État de sélection cohérent
     * Domaine : Boolean true/false
     * Formule : setSelected(bool) → config.isSelected = bool → applyStyles()
     * Exemple : setSelected(true) → bordure bleue visible
     * 
     * @param {boolean} selected - Nouvel état sélectionné
     */
    setSelected(selected) {
        this.config.isSelected = selected;
        this.applyStyles();
    }
    
    /**
     * Modification de la position
     * 
     * Rôle : Déplacer le widget vers de nouvelles coordonnées
     * Type : Setter de position avec mise à jour DOM
     * Unité : Position en pixels depuis origine grille
     * Domaine : x,y ∈ [-10000, 10000] (limites grille)
     * Formule : setPosition(x,y) → config.position = {x,y} → updateDimensions()
     * Exemple : setPosition(200, 150) → widget déplacé vers (200px, 150px)
     * 
     * @param {number} x - Nouvelle position X en pixels
     * @param {number} y - Nouvelle position Y en pixels
     */
    setPosition(x, y) {
        this.config.position.x = x;
        this.config.position.y = y;
        this.updateDimensions();
    }
    
    /**
     * Définition de la visibilité
     * 
     * Rôle : Afficher ou masquer le widget
     * Type : Setter de visibilité avec effet DOM
     * Unité : Visibilité cohérente
     * Domaine : Boolean true/false
     * Formule : setVisible(bool) → config.isVisible = bool → applyStyles()
     * Exemple : setVisible(false) → widget masqué (display: none)
     * 
     * @param {boolean} visible - Nouvel état de visibilité
     */
    setVisible(visible) {
        this.config.isVisible = visible;
        this.applyStyles();
    }
    
    /**
     * Définition de l'état verrouillé
     * 
     * Rôle : Verrouiller ou déverrouiller le widget (empêche édition/déplacement)
     * Type : Setter d'état avec feedback visuel
     * Unité : État de verrouillage cohérent
     * Domaine : Boolean true/false
     * Formule : setLocked(bool) → config.isLocked = bool → applyStyles()
     * Exemple : setLocked(true) → curseur interdit + opacité réduite
     * 
     * @param {boolean} locked - Nouvel état verrouillé
     */
    setLocked(locked) {
        this.config.isLocked = locked;
        this.applyStyles();
    }
    
    // === GETTERS POUR COMPATIBILITÉ ===
    
    /**
     * Retourne l'ID unique du widget
     * @returns {string} ID du widget
     */
    getId() {
        return this.id;
    }
    
    /**
     * Retourne la position actuelle
     * @returns {Object} Position {x, y}
     */
    getPosition() {
        return {
            x: this.config.position.x,
            y: this.config.position.y
        };
    }
    
    /**
     * Retourne les dimensions actuelles
     * @returns {Object} Dimensions {width, height}
     */
    getDimensions() {
        return {
            width: this.config.dimensions.width,
            height: this.config.dimensions.height === 'auto' ? 
                (this.elements.container?.offsetHeight || 100) : 
                this.config.dimensions.height
        };
    }
    
    /**
     * Vérifie si le widget est verrouillé
     * @returns {boolean} True si verrouillé
     */
    isLocked() {
        return this.config.isLocked || false;
    }
    
    /**
     * Vérifie si le widget est visible
     * @returns {boolean} True si visible
     */
    isVisible() {
        return this.config.isVisible !== false;
    }
    
    // === GESTION ÉVÉNEMENTS UTILITAIRE ===
    
    /**
     * Ajout d'un gestionnaire d'événement avec tracking
     * 
     * Rôle : Ajouter un événement DOM avec suivi pour nettoyage ultérieur
     * Type : Wrapper addEventListener avec référencement
     * Unité : Event listener tracké et nettoyable
     * Domaine : Événements DOM standards
     * Formule : addEventListener + Map.set(key, handlers[])
     * Exemple : addEventHandler(div, 'click', fn) → div écoute click + trackage
     * 
     * @param {HTMLElement} element - Élément DOM cible
     * @param {string} event - Type d'événement ('click', 'mouseover', etc.)
     * @param {Function} handler - Fonction gestionnaire d'événement
     */
    addEventHandler(element, event, handler) {
        // Ajout de l'événement DOM standard
        element.addEventListener(event, handler);
        
        // === TRACKING POUR NETTOYAGE ===
        // Map tracking : Permet nettoyage lors de la destruction
        // Clé : Combinaison element + event pour unicité
        // Valeur : Array de handlers pour ce même événement
        const key = `${element.className || 'element'}-${event}`;
        if (!this.eventHandlers.has(key)) {
            this.eventHandlers.set(key, []);
        }
        this.eventHandlers.get(key).push({ element, event, handler });
    }
    
    /**
     * Notification de changement pour l'éditeur
     * 
     * Rôle : Informer l'éditeur parent qu'une modification a eu lieu
     * Type : Callback de notification
     * Unité : Notification de changement
     * Domaine : Changements nécessitant sauvegarde/synchronisation
     * Formule : onChange() → editor.onWidgetChanged(this) → save() + sync()
     * Exemple : Modification texte → notification → sauvegarde automatique
     */
    notifyChange() {
        if (this.editor && typeof this.editor.onWidgetChanged === 'function') {
            this.editor.onWidgetChanged(this);
        }
    }
    
    /**
     * Nettoyage complet du widget
     * 
     * Rôle : Libérer toutes les ressources et références avant destruction
     * Type : Destructor pattern pour éviter les fuites mémoire
     * Unité : Widget complètement nettoyé
     * Domaine : Toutes les ressources DOM et événements
     * Formule : removeEventListeners() + removeDOM() + clearReferences()
     * Exemple : Suppression widget → destroy() → nettoyage complet
     */
    destroy() {
        // === NETTOYAGE ÉVÉNEMENTS ===
        // Suppression : Tous les event listeners ajoutés via addEventHandler
        this.eventHandlers.forEach((handlers) => {
            handlers.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventHandlers.clear();
        
        // === SUPPRESSION DOM ===
        // Retrait : Élément du DOM parent
        if (this.elements.container && this.elements.container.parentNode) {
            this.elements.container.parentNode.removeChild(this.elements.container);
        }
        
        // === NETTOYAGE RÉFÉRENCES ===
        this.editor = null;
        this.elements = {};
        
        console.log(`[BaseWidget] Widget détruit: ${this.id}`);
    }
};

// === COMPATIBILITÉ GLOBALE ===
// Export global pour accès direct sans namespace
window.BaseWidget = window.WidgetEditor.BaseWidget;
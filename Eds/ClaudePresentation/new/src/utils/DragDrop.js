/**
 * Utilitaires pour le système de glisser-déposer
 * 
 * Rôle : Gestion des interactions drag & drop dans l'éditeur
 * Type : Module utilitaire pour interactions tactiles/souris
 * Usage : Facilite l'implémentation du drag & drop pour widgets et sections
 */

/**
 * Classe utilitaire pour le drag & drop
 * 
 * Rôle : Abstraction des événements de glisser-déposer
 * Type : Utilitaire de gestion d'événements
 * Usage : Simplifie l'ajout de fonctionnalités drag & drop
 */
class DragDropHelper {
    /**
     * Constructeur du helper drag & drop
     * 
     * Rôle : Initialisation du gestionnaire de drag & drop
     * Type : Constructeur de classe utilitaire
     */
    constructor() {
        // Configuration par défaut
        this.config = {
            dragClass: 'dragging',
            dragOverClass: 'drag-over',
            dropZoneClass: 'drop-zone',
            dragHandle: '.drag-handle'
        };

        // État du drag & drop
        this.dragState = {
            isDragging: false,
            dragElement: null,
            dragData: null,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 }
        };

        // Callbacks
        this.callbacks = {
            onDragStart: null,
            onDragMove: null,
            onDragEnd: null,
            onDrop: null
        };
    }

    /**
     * Active le drag & drop sur un élément
     * 
     * Rôle : Configuration d'un élément comme draggable
     * Type : Méthode de configuration
     * Paramètres : element - Element à rendre draggable, options - Configuration
     * Effet de bord : Ajoute les événements de drag & drop
     */
    makeDraggable(element, options = {}) {
        if (!element) return;

        // Fusion des options
        const config = { ...this.config, ...options };

        // Ajout des attributs
        element.draggable = true;
        element.classList.add('draggable');

        // Événements de drag
        element.addEventListener('dragstart', (e) => this.handleDragStart(e, config));
        element.addEventListener('dragend', (e) => this.handleDragEnd(e, config));

        console.log('🎯 Élément rendu draggable:', element);
    }

    /**
     * Active une zone de drop
     * 
     * Rôle : Configuration d'un élément comme zone de dépôt
     * Type : Méthode de configuration
     * Paramètres : element - Element zone de drop, options - Configuration
     * Effet de bord : Ajoute les événements de réception de drop
     */
    makeDropZone(element, options = {}) {
        if (!element) return;

        // Fusion des options
        const config = { ...this.config, ...options };

        // Ajout de la classe
        element.classList.add(config.dropZoneClass);

        // Événements de drop
        element.addEventListener('dragover', (e) => this.handleDragOver(e, config));
        element.addEventListener('drop', (e) => this.handleDrop(e, config));
        element.addEventListener('dragenter', (e) => this.handleDragEnter(e, config));
        element.addEventListener('dragleave', (e) => this.handleDragLeave(e, config));

        console.log('📥 Zone de drop activée:', element);
    }

    /**
     * Gestionnaire de début de drag
     * 
     * Rôle : Traitement du début d'un glisser-déposer
     * Type : Gestionnaire d'événement
     * Paramètres : e - Événement drag, config - Configuration
     * Effet de bord : Initialise l'état de drag
     */
    handleDragStart(e, config) {
        const element = e.currentTarget;
        
        // Mise à jour de l'état
        this.dragState.isDragging = true;
        this.dragState.dragElement = element;
        this.dragState.startPosition = { x: e.clientX, y: e.clientY };

        // Ajout de la classe CSS
        element.classList.add(config.dragClass);

        // Données de transfer (pour compatibilité navigateurs)
        const dragData = this.extractDragData(element);
        this.dragState.dragData = dragData;
        e.dataTransfer.setData('text/plain', JSON.stringify(dragData));

        // Callback personnalisé
        if (this.callbacks.onDragStart) {
            this.callbacks.onDragStart(element, dragData, e);
        }

        console.log('🎯 Début de drag:', dragData);
    }

    /**
     * Gestionnaire de fin de drag
     * 
     * Rôle : Traitement de la fin d'un glisser-déposer
     * Type : Gestionnaire d'événement
     * Paramètres : e - Événement drag, config - Configuration
     * Effet de bord : Nettoie l'état de drag
     */
    handleDragEnd(e, config) {
        const element = e.currentTarget;
        
        // Nettoyage des classes CSS
        element.classList.remove(config.dragClass);
        document.querySelectorAll(`.${config.dragOverClass}`).forEach(el => {
            el.classList.remove(config.dragOverClass);
        });

        // Callback personnalisé
        if (this.callbacks.onDragEnd) {
            this.callbacks.onDragEnd(element, this.dragState.dragData, e);
        }

        // Réinitialisation de l'état
        this.dragState.isDragging = false;
        this.dragState.dragElement = null;
        this.dragState.dragData = null;

        console.log('🏁 Fin de drag');
    }

    /**
     * Gestionnaire de survol de zone de drop
     * 
     * Rôle : Traitement du survol d'une zone de dépôt
     * Type : Gestionnaire d'événement
     * Paramètres : e - Événement dragover, config - Configuration
     * Effet de bord : Autorise le drop et met à jour l'affichage
     */
    handleDragOver(e, config) {
        e.preventDefault(); // Autoriser le drop
        
        // Mise à jour de la position
        this.dragState.currentPosition = { x: e.clientX, y: e.clientY };

        // Callback personnalisé
        if (this.callbacks.onDragMove) {
            this.callbacks.onDragMove(e.currentTarget, this.dragState.dragData, e);
        }
    }

    /**
     * Gestionnaire d'entrée dans zone de drop
     * 
     * Rôle : Traitement de l'entrée dans une zone de dépôt
     * Type : Gestionnaire d'événement
     * Paramètres : e - Événement dragenter, config - Configuration
     * Effet de bord : Ajoute la classe CSS de survol
     */
    handleDragEnter(e, config) {
        e.preventDefault();
        e.currentTarget.classList.add(config.dragOverClass);
    }

    /**
     * Gestionnaire de sortie de zone de drop
     * 
     * Rôle : Traitement de la sortie d'une zone de dépôt
     * Type : Gestionnaire d'événement
     * Paramètres : e - Événement dragleave, config - Configuration
     * Effet de bord : Supprime la classe CSS de survol
     */
    handleDragLeave(e, config) {
        // Vérifier si on sort vraiment de l'élément (pas juste un enfant)
        if (!e.currentTarget.contains(e.relatedTarget)) {
            e.currentTarget.classList.remove(config.dragOverClass);
        }
    }

    /**
     * Gestionnaire de drop
     * 
     * Rôle : Traitement du dépôt d'un élément
     * Type : Gestionnaire d'événement
     * Paramètres : e - Événement drop, config - Configuration
     * Effet de bord : Exécute l'action de dépôt
     */
    handleDrop(e, config) {
        e.preventDefault();
        
        const dropZone = e.currentTarget;
        
        // Nettoyage des classes CSS
        dropZone.classList.remove(config.dragOverClass);

        // Récupération des données
        let dragData;
        try {
            dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch (error) {
            dragData = this.dragState.dragData;
        }

        // Callback personnalisé
        if (this.callbacks.onDrop) {
            this.callbacks.onDrop(dropZone, dragData, e);
        }

        console.log('📥 Drop effectué:', { dropZone, dragData });
    }

    /**
     * Extrait les données de drag d'un élément
     * 
     * Rôle : Récupération des métadonnées pour le drag & drop
     * Type : Méthode utilitaire
     * Paramètre : element - Élément source
     * Retour : Object - Données de drag
     */
    extractDragData(element) {
        return {
            type: element.dataset.dragType || 'unknown',
            id: element.dataset.dragId || element.id || null,
            sourceIndex: Array.from(element.parentElement?.children || []).indexOf(element),
            metadata: {
                widgetType: element.dataset.widgetType,
                sectionType: element.dataset.sectionType,
                content: element.dataset.dragContent
            }
        };
    }

    /**
     * Configure les callbacks
     * 
     * Rôle : Définition des fonctions de rappel personnalisées
     * Type : Méthode de configuration
     * Paramètre : callbacks - Objet contenant les callbacks
     * Effet de bord : Met à jour les callbacks internes
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
        console.log('🔗 Callbacks drag & drop configurés');
    }

    /**
     * Active le drag & drop sur une collection d'éléments
     * 
     * Rôle : Configuration en lot d'éléments draggable
     * Type : Méthode utilitaire de configuration
     * Paramètres : elements - Collection d'éléments, options - Configuration
     * Effet de bord : Active le drag & drop sur tous les éléments
     */
    makeBatchDraggable(elements, options = {}) {
        const elementsArray = Array.from(elements);
        elementsArray.forEach(element => {
            this.makeDraggable(element, options);
        });
        
        console.log(`🎯 ${elementsArray.length} éléments rendus draggable`);
    }

    /**
     * Active les zones de drop sur une collection
     * 
     * Rôle : Configuration en lot de zones de dépôt
     * Type : Méthode utilitaire de configuration
     * Paramètres : elements - Collection d'éléments, options - Configuration
     * Effet de bord : Active les zones de drop sur tous les éléments
     */
    makeBatchDropZone(elements, options = {}) {
        const elementsArray = Array.from(elements);
        elementsArray.forEach(element => {
            this.makeDropZone(element, options);
        });
        
        console.log(`📥 ${elementsArray.length} zones de drop activées`);
    }
}

// Instance globale pour faciliter l'utilisation
const dragDropHelper = new DragDropHelper();

// Export pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DragDropHelper, dragDropHelper };
} else if (typeof window !== 'undefined') {
    window.DragDropHelper = DragDropHelper;
    window.dragDropHelper = dragDropHelper;
}
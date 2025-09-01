/**
 * Classe représentant un élément hiérarchique dans la présentation
 * 
 * Rôle : Modèle orienté objet pour les éléments de la hiérarchie
 * Type : Classe métier pour gestion d'éléments hiérarchiques
 * Responsabilité : Encapsulation des données et comportements d'un élément hiérarchique
 */
class HierarchyElement {
    /**
     * Constructeur d'élément hiérarchique
     * 
     * Rôle : Initialisation complète d'un élément avec ses propriétés
     * Type : Constructeur de classe métier
     * Paramètres : config - Configuration de l'élément {type, title, width, height, content, parentId}
     * Effet de bord : Crée un élément avec ID unique et propriétés initiales
     */
    constructor(config = {}) {
        // Rôle : Identifiant unique de l'élément hiérarchique
        // Type : String (identifiant unique global)
        // Unité : Sans unité
        // Domaine : String unique dans tout le système
        // Formule : type + timestamp + random pour garantir l'unicité
        // Exemple : 'meta-section-1704890400123-x8k2'
        this.id = config.id || `${config.type || 'element'}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

        // Rôle : Type hiérarchique de l'élément
        // Type : String (niveau dans la hiérarchie)
        // Unité : Sans unité
        // Domaine : 'meta-section' | 'section' | 'sous-section' | 'sous-sous-section' | 'widget'
        // Formule : Contrainte métier selon la hiérarchie définie
        // Exemple : 'meta-section' pour le niveau racine
        this.type = config.type || 'widget';

        // Rôle : Titre affiché de l'élément
        // Type : String (nom utilisateur-friendly)
        // Unité : Sans unité
        // Domaine : Texte libre, recommandé < 50 caractères
        // Formule : Titre par défaut basé sur le type si non fourni
        // Exemple : 'Ma Section Hero', 'Widget de Titre Principal'
        this.title = config.title || this.generateDefaultTitle();

        // Rôle : Largeur CSS de l'élément
        // Type : String (valeur CSS pour largeur)
        // Unité : CSS units (px, %, em, rem, etc.)
        // Domaine : Valeurs CSS valides pour width
        // Formule : Valeur par défaut selon le type d'élément
        // Exemple : '100%', '350px', '25rem', 'auto'
        this.width = config.width || this.getDefaultWidth();

        // Rôle : Hauteur CSS de l'élément
        // Type : String (valeur CSS pour hauteur)
        // Unité : CSS units (px, %, em, rem, etc.)
        // Domaine : Valeurs CSS valides pour height
        // Formule : Valeur par défaut selon le type d'élément
        // Exemple : 'auto', '200px', '100vh', 'min-content'
        this.height = config.height || this.getDefaultHeight();

        // Rôle : Contenu spécifique de l'élément
        // Type : Object (contenu structuré selon le type)
        // Unité : Sans unité
        // Domaine : Object avec propriétés spécifiques au type
        // Formule : Structure par défaut selon le type d'élément
        // Exemple : {text: '...', style: {...}} pour widget texte
        this.content = config.content || this.getDefaultContent();

        // Rôle : Identifiant de l'élément parent dans la hiérarchie
        // Type : String|null (référence vers le parent)
        // Unité : Sans unité
        // Domaine : ID valide d'un élément parent ou null si racine
        // Formule : null pour méta-sections (racine), ID pour autres niveaux
        // Exemple : 'meta-section-1704890400123-x8k2' ou null
        this.parentId = config.parentId || null;

        // Rôle : Collection des éléments enfants
        // Type : Array<HierarchyElement> (éléments enfants)
        // Unité : Sans unité
        // Domaine : Array d'instances HierarchyElement
        // Formule : Tableau vide par défaut, rempli lors d'ajouts d'enfants
        // Exemple : [HierarchyElement, HierarchyElement, ...]
        this.children = [];

        // Rôle : Métadonnées et informations temporelles
        // Type : Object (métadonnées de gestion)
        // Unité : ISO timestamps pour dates
        // Domaine : Object avec propriétés de gestion
        // Formule : Timestamps automatiques pour traçabilité
        // Exemple : {created: '2024-01-10T...', modified: '2024-01-10T...'}
        this.metadata = {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0',
            author: 'User',
            order: config.order || 0
        };

        // Rôle : Propriétés de rendu et d'affichage
        // Type : Object (configuration de rendu)
        // Unité : CSS values et boolean
        // Domaine : Propriétés de style et d'état
        // Formule : Configuration par défaut pour affichage cohérent
        // Exemple : {visible: true, zIndex: 1, className: 'hierarchy-element'}
        this.rendering = {
            visible: config.visible !== undefined ? config.visible : true,
            zIndex: config.zIndex || 1,
            className: `hierarchy-element hierarchy-${this.type}`,
            cssClasses: config.cssClasses || [],
            customCSS: config.customCSS || {}
        };

        console.log(`🧱 HierarchyElement créé: ${this.type} "${this.title}" (${this.id})`);
    }

    /**
     * Génère un titre par défaut basé sur le type
     * 
     * Rôle : Génération automatique de titre lisible
     * Type : Méthode utilitaire de génération
     * Retour : String - Titre par défaut
     */
    generateDefaultTitle() {
        // Rôle : Mapping des types vers des noms utilisateur-friendly
        // Type : Object (correspondances type → nom affiché)
        // Unité : Sans unité
        // Domaine : Noms courts et descriptifs en français
        // Formule : Mapping statique pour cohérence des noms
        // Exemple : {'meta-section': 'Méta-Section', 'widget': 'Widget'}
        const typeNames = {
            'meta-section': 'Méta-Section',
            'section': 'Section',
            'sous-section': 'Sous-Section',
            'sous-sous-section': 'Sous-Sous-Section',
            'widget': 'Widget'
        };

        return typeNames[this.type] || 'Élément';
    }

    /**
     * Retourne la largeur par défaut selon le type
     * 
     * Rôle : Largeur CSS adaptée au type d'élément
     * Type : Méthode de configuration par défaut
     * Retour : String - Valeur CSS de largeur
     */
    getDefaultWidth() {
        // Rôle : Configuration de largeur par défaut selon le type
        // Type : Object (correspondances type → largeur CSS)
        // Unité : CSS units (%, px)
        // Domaine : Largeurs cohérentes pour chaque type d'élément
        // Formule : Largeurs optimales pour chaque niveau hiérarchique
        // Exemple : {'meta-section': '100%', 'widget': 'auto'}
        const defaultWidths = {
            'meta-section': '100%',     // Méta-sections prennent toute la largeur
            'section': '100%',          // Sections prennent toute la largeur de leur parent
            'sous-section': '50%',      // Sous-sections partagent l'espace
            'sous-sous-section': '33.333%', // Sous-sous-sections en colonnes de 3
            'widget': 'auto'            // Widgets s'adaptent à leur contenu
        };

        return defaultWidths[this.type] || 'auto';
    }

    /**
     * Retourne la hauteur par défaut selon le type
     * 
     * Rôle : Hauteur CSS adaptée au type d'élément
     * Type : Méthode de configuration par défaut
     * Retour : String - Valeur CSS de hauteur
     */
    getDefaultHeight() {
        // Rôle : Configuration de hauteur par défaut selon le type
        // Type : Object (correspondances type → hauteur CSS)
        // Unité : CSS units (auto, px, vh)
        // Domaine : Hauteurs cohérentes pour chaque type d'élément
        // Formule : Hauteurs optimales pour chaque niveau hiérarchique
        // Exemple : {'meta-section': 'auto', 'widget': '200px'}
        const defaultHeights = {
            'meta-section': 'auto',     // Méta-sections s'adaptent au contenu
            'section': 'auto',          // Sections s'adaptent au contenu
            'sous-section': 'auto',     // Sous-sections s'adaptent au contenu
            'sous-sous-section': '300px', // Sous-sous-sections ont une hauteur fixe
            'widget': 'auto'            // Widgets s'adaptent à leur contenu
        };

        return defaultHeights[this.type] || 'auto';
    }

    /**
     * Retourne le contenu par défaut selon le type
     * 
     * Rôle : Structure de contenu initiale selon le type
     * Type : Méthode de génération de contenu par défaut
     * Retour : Object - Structure de contenu par défaut
     */
    getDefaultContent() {
        // Rôle : Structures de contenu par défaut selon le type
        // Type : Object (templates de contenu par type)
        // Unité : Sans unité
        // Domaine : Objects avec propriétés spécifiques au type
        // Formule : Templates structurés pour chaque type d'élément
        // Exemple : Widget texte avec texte par défaut et style
        switch (this.type) {
            case 'meta-section':
                return {
                    layout: 'vertical',
                    padding: '2rem',
                    background: 'transparent'
                };
            case 'section':
                return {
                    layout: 'flex',
                    direction: 'column',
                    gap: '1rem',
                    padding: '1.5rem'
                };
            case 'sous-section':
                return {
                    layout: 'grid',
                    columns: 1,
                    gap: '1rem',
                    padding: '1rem'
                };
            case 'sous-sous-section':
                return {
                    layout: 'block',
                    padding: '0.75rem'
                };
            case 'widget':
                return {
                    type: 'text',
                    text: 'Nouveau contenu',
                    style: {
                        fontSize: '1rem',
                        color: '#ffffff'
                    }
                };
            default:
                return {};
        }
    }

    /**
     * Ajoute un élément enfant à cet élément
     * 
     * Rôle : Ajout hiérarchique avec validation des contraintes
     * Type : Méthode de gestion hiérarchique
     * Paramètre : childElement - Instance HierarchyElement à ajouter
     * Retour : boolean - Succès de l'ajout
     * Effet de bord : Modifie le tableau children et met à jour les métadonnées
     */
    addChild(childElement) {
        // Validation du type de l'enfant selon les règles hiérarchiques
        if (!this.canAcceptChild(childElement.type)) {
            console.warn(`⚠️ ${this.type} ne peut pas accepter un enfant de type ${childElement.type}`);
            return false;
        }

        // Définir le parent de l'enfant
        childElement.parentId = this.id;

        // Ajouter à la collection des enfants
        this.children.push(childElement);

        // Mettre à jour les métadonnées
        this.metadata.modified = new Date().toISOString();
        this.metadata.childrenCount = this.children.length;

        console.log(`👶 Enfant ajouté: ${childElement.type} "${childElement.title}" → ${this.type} "${this.title}"`);
        return true;
    }

    /**
     * Supprime un élément enfant par son ID
     * 
     * Rôle : Suppression hiérarchique avec nettoyage
     * Type : Méthode de gestion hiérarchique
     * Paramètre : childId - ID de l'enfant à supprimer
     * Retour : boolean - Succès de la suppression
     * Effet de bord : Modifie le tableau children et met à jour les métadonnées
     */
    removeChild(childId) {
        // Rôle : Index de l'enfant à supprimer dans le tableau
        // Type : Number (index dans le tableau children)
        // Unité : Sans unité (index)
        // Domaine : -1 si non trouvé, ≥0 si trouvé
        // Formule : findIndex avec comparaison d'ID
        // Exemple : 2 pour le 3ème enfant
        const childIndex = this.children.findIndex(child => child.id === childId);

        if (childIndex === -1) {
            console.warn(`⚠️ Enfant avec ID ${childId} non trouvé`);
            return false;
        }

        // Supprimer l'enfant du tableau
        const removedChild = this.children.splice(childIndex, 1)[0];
        removedChild.parentId = null;

        // Mettre à jour les métadonnées
        this.metadata.modified = new Date().toISOString();
        this.metadata.childrenCount = this.children.length;

        console.log(`🗑️ Enfant supprimé: ${removedChild.type} "${removedChild.title}"`);
        return true;
    }

    /**
     * Vérifie si cet élément peut accepter un enfant d'un type donné
     * 
     * Rôle : Validation des règles hiérarchiques
     * Type : Méthode de validation métier
     * Paramètre : childType - Type de l'enfant à valider
     * Retour : boolean - true si le type d'enfant est autorisé
     */
    canAcceptChild(childType) {
        // Rôle : Règles hiérarchiques définissant les enfants autorisés
        // Type : Object (correspondances parent → types enfants autorisés)
        // Unité : Sans unité
        // Domaine : Arrays de types d'éléments autorisés
        // Formule : Règles métier de la hiérarchie à 5 niveaux
        // Exemple : meta-section peut contenir section et widget
        const hierarchyRules = {
            'meta-section': ['section', 'widget'],
            'section': ['sous-section', 'widget'],
            'sous-section': ['sous-sous-section', 'widget'],
            'sous-sous-section': ['widget'],
            'widget': [] // Les widgets ne peuvent pas avoir d'enfants
        };

        const allowedChildren = hierarchyRules[this.type] || [];
        return allowedChildren.includes(childType);
    }

    /**
     * Génère le HTML de cet élément et de ses enfants
     * 
     * Rôle : Rendu HTML récursif de l'élément hiérarchique
     * Type : Méthode de génération de contenu
     * Retour : String - HTML complet de l'élément
     * Effet de bord : Aucun (pure function)
     */
    generateHTML() {
        // Si l'élément n'est pas visible, ne pas générer de HTML
        if (!this.rendering.visible) {
            return '';
        }

        // Rôle : Styles CSS inline pour l'élément
        // Type : String (styles CSS formatés)
        // Unité : CSS units selon les propriétés
        // Domaine : String de styles CSS valides
        // Formule : Concaténation de propriétés CSS avec valeurs
        // Exemple : 'width: 100%; height: auto; padding: 1rem;'
        const styles = [
            `width: ${this.width}`,
            `height: ${this.height}`,
            `z-index: ${this.rendering.zIndex}`,
            ...Object.entries(this.rendering.customCSS).map(([prop, value]) => `${prop}: ${value}`)
        ].join('; ');

        // Génération HTML récursive des enfants
        const childrenHTML = this.children.map(child => child.generateHTML()).join('\n');

        // Rôle : Contenu HTML spécifique selon le type d'élément
        // Type : String (HTML du contenu de l'élément)
        // Unité : Sans unité
        // Domaine : HTML valide selon le type d'élément
        // Formule : HTML personnalisé selon le type et le contenu
        // Exemple : <div> avec texte pour widget, <section> pour section
        const contentHTML = this.generateContentHTML();

        return `
            <div id="${this.id}" 
                 class="${this.rendering.className} ${this.rendering.cssClasses.join(' ')}" 
                 style="${styles}"
                 data-type="${this.type}"
                 data-title="${this.title}">
                ${contentHTML}
                ${childrenHTML}
            </div>
        `.trim();
    }

    /**
     * Génère le HTML du contenu spécifique selon le type
     * 
     * Rôle : Rendu HTML adapté au type d'élément
     * Type : Méthode de génération de contenu spécialisé
     * Retour : String - HTML du contenu interne
     */
    generateContentHTML() {
        switch (this.type) {
            case 'widget':
                if (this.content.type === 'text') {
                    const textStyle = Object.entries(this.content.style || {})
                        .map(([prop, value]) => `${prop}: ${value}`)
                        .join('; ');
                    return `<div class="widget-content text-widget" style="${textStyle}">${this.content.text || ''}</div>`;
                }
                break;
            case 'meta-section':
                return `<div class="meta-section-content" data-layout="${this.content.layout || 'vertical'}"></div>`;
            case 'section':
                return `<div class="section-content" data-layout="${this.content.layout || 'flex'}"></div>`;
            case 'sous-section':
                return `<div class="sous-section-content" data-layout="${this.content.layout || 'grid'}"></div>`;
            case 'sous-sous-section':
                return `<div class="sous-sous-section-content"></div>`;
            default:
                return `<div class="element-content"></div>`;
        }
    }

    /**
     * Met à jour les propriétés de l'élément
     * 
     * Rôle : Modification des propriétés avec validation
     * Type : Méthode de mise à jour d'état
     * Paramètre : updates - Object avec les propriétés à mettre à jour
     * Effet de bord : Modifie les propriétés de l'instance et met à jour les métadonnées
     */
    updateProperties(updates) {
        // Propriétés modifiables en sécurité
        const allowedProperties = ['title', 'width', 'height', 'content', 'visible'];
        
        let hasChanges = false;

        allowedProperties.forEach(prop => {
            if (updates[prop] !== undefined && updates[prop] !== this[prop]) {
                if (prop === 'visible') {
                    this.rendering.visible = updates[prop];
                } else {
                    this[prop] = updates[prop];
                }
                hasChanges = true;
                console.log(`🔄 Propriété mise à jour: ${prop} = ${updates[prop]}`);
            }
        });

        if (hasChanges) {
            this.metadata.modified = new Date().toISOString();
        }

        return hasChanges;
    }

    /**
     * Sérialise l'élément pour sauvegarde/export
     * 
     * Rôle : Conversion en objet simple pour persistance
     * Type : Méthode de sérialisation
     * Retour : Object - Représentation sérialisable de l'élément
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            width: this.width,
            height: this.height,
            content: this.content,
            parentId: this.parentId,
            children: this.children.map(child => child.toJSON()),
            metadata: this.metadata,
            rendering: this.rendering
        };
    }

    /**
     * Crée une instance HierarchyElement depuis un objet sérialisé
     * 
     * Rôle : Désérialisation pour reconstruction d'instance
     * Type : Méthode statique de désérialisation
     * Paramètre : data - Objet sérialisé
     * Retour : HierarchyElement - Instance reconstruite
     */
    static fromJSON(data) {
        // Créer l'élément principal
        const element = new HierarchyElement(data);
        
        // Reconstruire récursivement les enfants
        if (data.children && data.children.length > 0) {
            element.children = data.children.map(childData => HierarchyElement.fromJSON(childData));
        }

        // Restaurer les métadonnées
        if (data.metadata) {
            element.metadata = { ...element.metadata, ...data.metadata };
        }

        // Restaurer les propriétés de rendu
        if (data.rendering) {
            element.rendering = { ...element.rendering, ...data.rendering };
        }

        return element;
    }

    /**
     * Valide l'élément hiérarchique
     * 
     * Rôle : Vérification de la cohérence et validité de l'élément
     * Type : Méthode de validation
     * Retour : Object - Résultat de validation avec isValid et erreurs
     */
    validate() {
        // Rôle : Liste des erreurs de validation
        // Type : Array<String> (messages d'erreur)
        // Unité : Sans unité
        // Domaine : Array possiblement vide si validation réussie
        // Formule : Accumulation des erreurs détectées
        // Exemple : ["Titre manquant", "Type invalide"]
        const errors = [];

        // Validation du titre
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Le titre est obligatoire');
        }

        // Validation du type
        const validTypes = ['meta-section', 'section', 'sous-section', 'sous-sous-section', 'widget'];
        if (!validTypes.includes(this.type)) {
            errors.push(`Type invalide: ${this.type}`);
        }

        // Validation des dimensions
        if (this.width && !this.isValidDimension(this.width)) {
            errors.push(`Largeur invalide: ${this.width}`);
        }

        if (this.height && !this.isValidDimension(this.height)) {
            errors.push(`Hauteur invalide: ${this.height}`);
        }

        // Validation hiérarchique (widgets ne peuvent pas avoir d'enfants)
        if (this.type === 'widget' && this.children.length > 0) {
            errors.push('Les widgets ne peuvent pas avoir d\'enfants');
        }

        // Rôle : Résultat de validation complet
        // Type : Object (résultat de validation)
        // Unité : Sans unité
        // Domaine : {isValid: boolean, errors: Array<String>}
        // Formule : isValid = (errors.length === 0)
        // Exemple : {isValid: true, errors: []} ou {isValid: false, errors: ["..."]}
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Vérifie si une dimension CSS est valide
     * 
     * Rôle : Validation de format de dimension CSS
     * Type : Méthode utilitaire de validation
     * Paramètre : dimension (String) - Dimension à valider
     * Retour : Boolean - true si dimension valide
     */
    isValidDimension(dimension) {
        // Rôle : Vérification du format de dimension
        // Type : RegExp (expression régulière pour CSS)
        // Unité : Pattern pour unités CSS
        // Domaine : px, %, em, rem, vh, vw, auto
        // Formule : Nombre suivi d'unité ou 'auto'
        // Exemple : "100px", "50%", "auto", "2em"
        const dimensionPattern = /^(auto|\d+(?:\.\d+)?(?:px|%|em|rem|vh|vw))$/;
        
        return dimensionPattern.test(dimension);
    }
}

// Export de la classe pour utilisation globale
if (typeof window !== 'undefined') {
    window.HierarchyElement = HierarchyElement;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HierarchyElement;
}
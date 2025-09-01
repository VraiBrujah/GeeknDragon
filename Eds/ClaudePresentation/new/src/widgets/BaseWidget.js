/**
 * Classe de base pour tous les widgets de présentation
 * 
 * Rôle : Définit l'interface et comportements communs des widgets
 * Type : Classe abstraite de base (à hériter, pas instancier directement)
 * Responsabilité : Structure commune, validation, sérialisation des widgets
 */
class BaseWidget {
    /**
     * Constructeur de la classe de base
     * 
     * @param {string} type - Type du widget (text, image, button, etc.)
     * @param {Object} config - Configuration initiale du widget
     */
    constructor(type, config = {}) {
        // Rôle : Identifiant unique du widget dans la présentation
        // Type : String (UUID généré automatiquement)
        // Unité : Sans unité
        // Domaine : Chaîne alphanumérique unique
        // Formule : 'widget-' + type + '-' + timestamp + '-' + random
        // Exemple : 'widget-text-1704890400123-abc'
        this.id = config.id || `widget-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Rôle : Type de widget pour identification et rendu
        // Type : String (catégorie de widget)
        // Unité : Sans unité
        // Domaine : Types définis: text, image, button, video, etc.
        // Formule : Constante définie lors de création
        // Exemple : 'text' → widget de texte éditable
        this.type = type;

        // Rôle : Nom d'affichage du widget pour l'interface utilisateur
        // Type : String (nom lisible)
        // Unité : Sans unité
        // Domaine : Texte descriptif en français
        // Formule : config.name || nom par défaut basé sur type
        // Exemple : 'Titre Principal' ou 'Image de Hero'
        this.name = config.name || this.getDefaultName();

        // Rôle : Description détaillée du widget pour aide utilisateur
        // Type : String (texte explicatif)
        // Unité : Sans unité
        // Domaine : Texte descriptif français
        // Formule : config.description || description par défaut
        // Exemple : 'Widget de texte éditable avec formatage basique'
        this.description = config.description || this.getDefaultDescription();

        // Rôle : Catégorie du widget pour organisation dans l'interface
        // Type : String (catégorie organisationnelle)
        // Unité : Sans unité
        // Domaine : content, media, interaction, layout, etc.
        // Formule : config.category || catégorie par défaut selon type
        // Exemple : 'content' pour texte, 'media' pour image
        this.category = config.category || this.getDefaultCategory();

        // Rôle : Données spécifiques au widget (contenu, styles, etc.)
        // Type : Object (structure variable selon type de widget)
        // Unité : Sans unité
        // Domaine : Object avec propriétés spécifiques au type
        // Formule : config.data || données par défaut du type
        // Exemple : {text: 'Bonjour', fontSize: '16px', color: '#333'}
        this.data = config.data || this.getDefaultData();

        // Rôle : Styles CSS spécifiques à ce widget
        // Type : Object (propriétés CSS)
        // Unité : Valeurs CSS (px, %, colors, etc.)
        // Domaine : Object avec propriétés CSS valides
        // Formule : config.styles || styles par défaut
        // Exemple : {margin: '10px', padding: '5px', backgroundColor: '#fff'}
        this.styles = config.styles || this.getDefaultStyles();

        // Rôle : Classes CSS à appliquer au widget
        // Type : Array<String> (liste de classes CSS)
        // Unité : Sans unité
        // Domaine : Noms de classes CSS valides
        // Formule : config.classes || classes par défaut
        // Exemple : ['editable', 'widget-text', 'animate-on-scroll']
        this.classes = config.classes || this.getDefaultClasses();

        // Rôle : Attributs HTML personnalisés pour le widget
        // Type : Object (attributs HTML)
        // Unité : Sans unité
        // Domaine : Attributs HTML valides
        // Formule : config.attributes || attributs par défaut
        // Exemple : {'data-field': 'hero-title', 'contenteditable': 'true'}
        this.attributes = config.attributes || {};

        // Rôle : Indicateur si le widget est éditable dans l'interface
        // Type : Boolean (capacité d'édition)
        // Unité : Sans unité
        // Domaine : true | false
        // Formule : config.editable !== false (éditable par défaut)
        // Exemple : true → widget modifiable, false → widget statique
        this.editable = config.editable !== false;

        // Rôle : Indicateur si le widget est visible dans le viewer
        // Type : Boolean (visibilité)
        // Unité : Sans unité
        // Domaine : true | false
        // Formule : config.visible !== false (visible par défaut)
        // Exemple : true → affiché, false → masqué
        this.visible = config.visible !== false;

        // Rôle : Position du widget dans son conteneur
        // Type : Object (coordonnées et dimensions)
        // Unité : pixels (px) ou pourcentage (%)
        // Domaine : {x, y, width, height} avec valeurs ≥ 0
        // Formule : config.position || position par défaut
        // Exemple : {x: 10, y: 20, width: 200, height: 50}
        this.position = config.position || {x: 0, y: 0, width: 'auto', height: 'auto'};

        // Rôle : Métadonnées du widget (création, modification, version)
        // Type : Object (informations meta)
        // Unité : Sans unité
        // Domaine : Object avec timestamps et version
        // Formule : Génération automatique avec timestamps
        // Exemple : {created: '2024-01-09T10:00:00Z', modified: '...', version: '1.0'}
        this.metadata = {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0',
            author: 'PresentationEngine',
            ...config.metadata
        };

        // Validation de la configuration
        this.validate();

        console.log(`🧩 Widget '${this.type}' créé: ${this.name} (${this.id})`);
    }

    /**
     * Retourne le nom par défaut du widget selon son type
     * 
     * @returns {string} Nom par défaut
     */
    getDefaultName() {
        // Rôle : Mapping des types vers noms français lisibles
        // Type : Object<String, String> (dictionnaire type → nom)
        // Unité : Sans unité
        // Domaine : Types de widgets définis dans le système
        // Formule : Map statique des correspondances
        // Exemple : 'text' → 'Texte', 'image' → 'Image'
        const defaultNames = {
            'text': 'Texte',
            'title': 'Titre',
            'image': 'Image',
            'button': 'Bouton',
            'video': 'Vidéo',
            'spacer': 'Espacement',
            'divider': 'Séparateur',
            'icon': 'Icône',
            'list': 'Liste',
            'table': 'Tableau',
            'form': 'Formulaire',
            'embed': 'Contenu intégré'
        };

        return defaultNames[this.type] || `Widget ${this.type}`;
    }

    /**
     * Retourne la description par défaut du widget
     * 
     * @returns {string} Description par défaut
     */
    getDefaultDescription() {
        const defaultDescriptions = {
            'text': 'Widget de texte éditable avec formatage de base',
            'title': 'Widget de titre avec styles prédéfinis',
            'image': 'Widget d\'image avec redimensionnement automatique',
            'button': 'Widget de bouton interactif avec actions',
            'video': 'Widget vidéo avec contrôles de lecture',
            'spacer': 'Widget d\'espacement pour mise en page',
            'divider': 'Widget de séparation visuelle entre sections',
            'icon': 'Widget d\'icône avec bibliothèque FontAwesome',
            'list': 'Widget de liste à puces ou numérotée',
            'table': 'Widget de tableau avec édition de cellules',
            'form': 'Widget de formulaire avec validation',
            'embed': 'Widget d\'intégration de contenu externe'
        };

        return defaultDescriptions[this.type] || `Widget de type ${this.type}`;
    }

    /**
     * Retourne la catégorie par défaut du widget
     * 
     * @returns {string} Catégorie par défaut
     */
    getDefaultCategory() {
        const defaultCategories = {
            'text': 'content',
            'title': 'content',
            'image': 'media',
            'button': 'interaction',
            'video': 'media',
            'spacer': 'layout',
            'divider': 'layout',
            'icon': 'content',
            'list': 'content',
            'table': 'content',
            'form': 'interaction',
            'embed': 'media'
        };

        return defaultCategories[this.type] || 'other';
    }

    /**
     * Retourne les données par défaut du widget
     * Méthode abstraite à surcharger dans les classes filles
     * 
     * @returns {Object} Données par défaut
     */
    getDefaultData() {
        return {};
    }

    /**
     * Retourne les styles par défaut du widget
     * 
     * @returns {Object} Styles CSS par défaut
     */
    getDefaultStyles() {
        return {
            display: 'block',
            margin: '0',
            padding: '0'
        };
    }

    /**
     * Retourne les classes CSS par défaut du widget
     * 
     * @returns {Array<string>} Classes CSS par défaut
     */
    getDefaultClasses() {
        return ['widget', `widget-${this.type}`, 'editable'];
    }

    /**
     * Valide la configuration du widget
     * 
     * @throws {Error} Si la configuration est invalide
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

        // Validation des données selon le type
        this.validateData();

        console.log(`✅ Widget '${this.type}' validé avec succès`);
    }

    /**
     * Valide les données spécifiques au widget
     * Méthode abstraite à surcharger dans les classes filles
     */
    validateData() {
        // Validation générique - à surcharger
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
            // Rôle : Fusion des nouvelles données avec les existantes
            // Type : Object (données fusionnées)
            // Unité : Sans unité
            // Domaine : Object avec propriétés combinées
            // Formule : {...existantes, ...nouvelles} → fusion avec priorité nouvelles
            // Exemple : {text: 'ancien', color: 'red'} + {text: 'nouveau'} = {text: 'nouveau', color: 'red'}
            this.data = { ...this.data, ...newData };
        } else {
            // Remplacement complet
            this.data = newData;
        }

        // Mise à jour du timestamp
        this.metadata.modified = new Date().toISOString();

        // Validation des nouvelles données
        this.validateData();

        console.log(`📝 Données du widget '${this.id}' mises à jour`);
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

        this.metadata.modified = new Date().toISOString();
        console.log(`🎨 Styles du widget '${this.id}' mis à jour`);
    }

    /**
     * Met à jour la position du widget
     * 
     * @param {Object} newPosition - Nouvelle position
     */
    updatePosition(newPosition) {
        this.position = { ...this.position, ...newPosition };
        this.metadata.modified = new Date().toISOString();
        console.log(`📍 Position du widget '${this.id}' mise à jour`);
    }

    /**
     * Génère le HTML du widget pour le viewer
     * Méthode abstraite à surcharger dans les classes filles
     * 
     * @param {Object} renderOptions - Options de rendu
     * @returns {string} HTML du widget
     */
    render(renderOptions = {}) {
        throw new Error('La méthode render() doit être implémentée dans la classe fille');
    }

    /**
     * Génère le HTML pour l'éditeur (avec contrôles d'édition)
     * 
     * @param {Object} editorOptions - Options d'édition
     * @returns {string} HTML pour l'éditeur
     */
    renderEditor(editorOptions = {}) {
        // Par défaut, utilise le même rendu que le viewer
        return this.render(editorOptions);
    }

    /**
     * Génère les styles CSS inline du widget
     * 
     * @returns {string} Styles CSS formatés
     */
    getStylesCSS() {
        if (!this.styles || Object.keys(this.styles).length === 0) {
            return '';
        }

        // Rôle : Conversion des styles objet en CSS inline
        // Type : String (CSS formaté)
        // Unité : Unités CSS (px, %, em, etc.)
        // Domaine : CSS syntaxiquement correct
        // Formule : propriété:valeur; pour chaque style
        // Exemple : {color: 'red', fontSize: '16px'} → 'color: red; font-size: 16px;'
        return Object.entries(this.styles)
            .map(([property, value]) => {
                // Conversion camelCase vers kebab-case pour CSS
                const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
                return `${cssProperty}: ${value}`;
            })
            .join('; ') + ';';
    }

    /**
     * Génère les classes CSS du widget
     * 
     * @returns {string} Classes CSS formatées
     */
    getClassesCSS() {
        if (!this.classes || this.classes.length === 0) {
            return '';
        }

        return this.classes.join(' ');
    }

    /**
     * Génère les attributs HTML du widget
     * 
     * @returns {string} Attributs HTML formatés
     */
    getAttributesHTML() {
        const attributes = {
            id: this.id,
            'data-widget-type': this.type,
            'data-widget-id': this.id,
            ...this.attributes
        };

        return Object.entries(attributes)
            .map(([attr, value]) => `${attr}="${value}"`)
            .join(' ');
    }

    /**
     * Clone le widget avec un nouvel ID
     * 
     * @returns {BaseWidget} Clone du widget
     */
    clone() {
        // Rôle : Copie profonde de la configuration du widget
        // Type : Object (configuration clonée)
        // Unité : Sans unité
        // Domaine : Configuration complète sans références partagées
        // Formule : JSON.parse(JSON.stringify(object)) → clonage profond
        // Exemple : Widget original modifié n'affecte pas le clone
        const clonedConfig = JSON.parse(JSON.stringify({
            name: `${this.name} (Copie)`,
            description: this.description,
            category: this.category,
            data: this.data,
            styles: this.styles,
            classes: this.classes,
            attributes: this.attributes,
            editable: this.editable,
            visible: this.visible,
            position: this.position,
            metadata: {
                ...this.metadata,
                created: new Date().toISOString(),
                modified: new Date().toISOString()
            }
        }));

        // Ne pas copier l'ID - un nouveau sera généré
        return new this.constructor(this.type, clonedConfig);
    }

    /**
     * Exporte le widget vers JSON
     * 
     * @returns {Object} Représentation JSON du widget
     */
    toJSON() {
        return {
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
            metadata: this.metadata
        };
    }

    /**
     * Importe un widget depuis JSON
     * 
     * @param {Object} jsonData - Données JSON
     * @returns {BaseWidget} Widget reconstitué
     */
    static fromJSON(jsonData) {
        if (!jsonData.type) {
            throw new Error('Type de widget manquant dans les données JSON');
        }

        // Restauration de l'ID original
        const config = {
            id: jsonData.id,
            ...jsonData
        };

        return new this(jsonData.type, config);
    }

    /**
     * Affiche les informations du widget pour debug
     * 
     * @returns {string} Informations formatées
     */
    toString() {
        return `Widget[${this.type}](${this.id}): ${this.name}`;
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.BaseWidget = BaseWidget;
/**
 * Widget d'image avec gestion de source et redimensionnement
 * 
 * Rôle : Gère l'affichage d'images avec contrôles de taille et source
 * Type : Classe de widget héritant de BaseWidget
 * Responsabilité : Rendu d'image, upload, redimensionnement, optimisation
 */
class ImageWidget extends BaseWidget {
    /**
     * Constructeur du widget d'image
     * 
     * @param {Object} config - Configuration du widget
     */
    constructor(config = {}) {
        // Initialisation avec le type 'image'
        super('image', config);
    }

    /**
     * Retourne les données par défaut pour un widget d'image
     * 
     * @returns {Object} Données par défaut
     */
    getDefaultData() {
        return {
            // Rôle : URL source de l'image à afficher
            // Type : String (URL ou chemin relatif)
            // Unité : Sans unité
            // Domaine : URL valide ou chemin de fichier local
            // Formule : URL absolue ou relative vers ressource image
            // Exemple : './images/logo.png' ou 'https://example.com/image.jpg'
            src: '',

            // Rôle : Texte alternatif pour accessibilité et SEO
            // Type : String (description textuelle)
            // Unité : Sans unité
            // Domaine : Texte descriptif de l'image
            // Formule : Description concise du contenu visuel
            // Exemple : 'Logo de l\'entreprise EDS Québec'
            alt: 'Image de présentation',

            // Rôle : Titre affiché au survol de l'image
            // Type : String (texte de tooltip)
            // Unité : Sans unité
            // Domaine : Texte informatif court
            // Formule : Information complémentaire sur l'image
            // Exemple : 'Cliquez pour voir en grand'
            title: '',

            // Rôle : Mode de redimensionnement de l'image
            // Type : String (mode CSS object-fit)
            // Unité : Sans unité
            // Domaine : 'contain' | 'cover' | 'fill' | 'scale-down' | 'none'
            // Formule : Définit comment l'image s'adapte à son conteneur
            // Exemple : 'cover' → remplit le conteneur en gardant les proportions
            objectFit: 'contain',

            // Rôle : Position de l'image dans son conteneur
            // Type : String (position CSS object-position)
            // Unité : %, px, mots-clés
            // Domaine : Valeurs CSS valides pour object-position
            // Formule : Position x y dans le conteneur
            // Exemple : 'center center', '50% 50%', 'top left'
            objectPosition: 'center center',

            // Rôle : Largeur de l'image en pixels
            // Type : Number (dimensions en pixels)
            // Unité : pixels (px)
            // Domaine : width > 0, généralement ≤ 2000px
            // Formule : Largeur d'affichage souhaitée
            // Exemple : 400 → image affichée sur 400px de large
            width: null,

            // Rôle : Hauteur de l'image en pixels
            // Type : Number (dimensions en pixels)
            // Unité : pixels (px)
            // Domaine : height > 0, généralement ≤ 2000px
            // Formule : Hauteur d'affichage souhaitée
            // Exemple : 300 → image affichée sur 300px de haut
            height: null,

            // Rôle : Indicateur de préservation des proportions
            // Type : Boolean (maintien du ratio)
            // Unité : Sans unité
            // Domaine : true | false
            // Formule : true → garde aspect ratio, false → déformation autorisée
            // Exemple : true → pas de déformation de l'image
            maintainAspectRatio: true,

            // Rôle : Action au clic sur l'image
            // Type : String (type d'action)
            // Unité : Sans unité
            // Domaine : 'none' | 'lightbox' | 'link' | 'zoom'
            // Formule : Comportement interactif de l'image
            // Exemple : 'lightbox' → ouvre en popup agrandie
            clickAction: 'none',

            // Rôle : URL de redirection si clickAction = 'link'
            // Type : String (URL de destination)
            // Unité : Sans unité
            // Domaine : URL valide si clickAction = 'link'
            // Formule : URL absolue ou relative de destination
            // Exemple : 'https://edsquebec.com' ou './page-produit.html'
            linkUrl: '',

            // Rôle : Cible du lien (_blank, _self, etc.)
            // Type : String (attribut target HTML)
            // Unité : Sans unité
            // Domaine : '_blank' | '_self' | '_parent' | '_top'
            // Formule : Définit où ouvrir le lien
            // Exemple : '_blank' → nouvel onglet
            linkTarget: '_self',

            // Rôle : Format d'image préféré pour optimisation
            // Type : String (format MIME)
            // Unité : Sans unité
            // Domaine : 'image/webp' | 'image/jpeg' | 'image/png' | 'auto'
            // Formule : Format optimal selon contexte et support navigateur
            // Exemple : 'image/webp' → format moderne optimisé
            preferredFormat: 'auto',

            // Rôle : Niveau de compression/qualité de l'image
            // Type : Number (niveau de qualité)
            // Unité : pourcentage (%)
            // Domaine : 0 ≤ quality ≤ 100
            // Formule : Équilibre entre taille fichier et qualité visuelle
            // Exemple : 85 → bonne qualité avec compression raisonnable
            quality: 85,

            // Rôle : Chargement paresseux (lazy loading)
            // Type : Boolean (activation du lazy loading)
            // Unité : Sans unité
            // Domaine : true | false
            // Formule : true → charge l'image quand elle devient visible
            // Exemple : true → améliore performance page
            lazyLoad: true,

            // Rôle : Image de placeholder pendant chargement
            // Type : String (URL de l'image temporaire)
            // Unité : Sans unité
            // Domaine : URL d'image légère ou data URI
            // Formule : Image simple affichée en attendant la vraie
            // Exemple : 'data:image/svg+xml;base64,...' → placeholder SVG
            placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGMEYwRjAiLz48cGF0aCBkPSJNNzAgMTMwQzc3IDEzMCA4MyAxMjQgOTAgMTI0UzEwMyAxMzAgMTEwIDEzMEwxNjAgNzBINDBMNzAgMTMwWiIgZmlsbD0iI0QwRDBEMCIvPjxjaXJjbGUgY3g9IjY1IiBjeT0iNjUiIHI9IjE1IiBmaWxsPSIjRDBEMEQwIi8+PC9zdmc+'
        };
    }

    /**
     * Retourne les styles par défaut pour un widget d'image
     * 
     * @returns {Object} Styles CSS par défaut
     */
    getDefaultStyles() {
        return {
            ...super.getDefaultStyles(),
            // Rôle : Largeur du conteneur d'image
            // Type : String (valeur CSS)
            // Unité : %, px, auto, etc.
            // Domaine : Valeurs CSS valides pour width
            // Formule : Taille adaptée au contexte et responsive
            // Exemple : '100%' → prend toute la largeur disponible
            width: '100%',

            // Rôle : Hauteur du conteneur d'image
            // Type : String (valeur CSS)
            // Unité : px, auto, vh, etc.
            // Domaine : Valeurs CSS valides pour height
            // Formule : Hauteur adaptée ou automatique
            // Exemple : 'auto' → hauteur selon proportions image
            height: 'auto',

            // Rôle : Largeur maximum pour responsive design
            // Type : String (valeur CSS)
            // Unité : px, %, vw, etc.
            // Domaine : Valeurs CSS ≥ 0
            // Formule : Limite maximum pour éviter images trop grandes
            // Exemple : '500px' → max 500px même sur grand écran
            maxWidth: '100%',

            // Rôle : Hauteur maximum pour contrôler débordement
            // Type : String (valeur CSS)
            // Unité : px, vh, etc.
            // Domaine : Valeurs CSS ≥ 0
            // Formule : Limite maximum pour mise en page cohérente
            // Exemple : '400px' → max 400px de haut
            maxHeight: 'none',

            // Rôle : Mode d'affichage du conteneur
            // Type : String (valeur CSS display)
            // Unité : Sans unité
            // Domaine : 'block' | 'inline-block' | 'flex' | etc.
            // Formule : Mode d'affichage selon contexte
            // Exemple : 'block' → prend toute la largeur
            display: 'block',

            // Rôle : Espacement interne autour de l'image
            // Type : String (valeur CSS)
            // Unité : px, em, %
            // Domaine : Valeurs ≥ 0
            // Formule : Espacement selon densité interface
            // Exemple : '8px' → marge interne confortable
            padding: '0',

            // Rôle : Espacement externe du widget image
            // Type : String (valeur CSS)
            // Unité : px, em, %
            // Domaine : Valeurs CSS pour margin
            // Formule : Séparation avec autres éléments
            // Exemple : '10px 0' → marge verticale uniquement
            margin: '10px 0',

            // Rôle : Alignement de l'image dans son contexte
            // Type : String (valeur CSS text-align)
            // Unité : Sans unité
            // Domaine : 'left' | 'center' | 'right' | 'justify'
            // Formule : Position horizontale dans le conteneur parent
            // Exemple : 'center' → image centrée
            textAlign: 'center',

            // Rôle : Rayon des coins pour image arrondie
            // Type : String (valeur CSS border-radius)
            // Unité : px, %, em
            // Domaine : Valeurs ≥ 0
            // Formule : Arrondi des angles selon design
            // Exemple : '8px' → coins légèrement arrondis
            borderRadius: '8px',

            // Rôle : Ombre portée de l'image
            // Type : String (valeur CSS box-shadow)
            // Unité : px pour décalages, couleur
            // Domaine : Syntaxe CSS box-shadow valide
            // Formule : x y blur spread couleur
            // Exemple : '0 4px 8px rgba(0,0,0,0.1)' → ombre légère
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',

            // Rôle : Effet de transition pour interactions
            // Type : String (valeur CSS transition)
            // Unité : secondes (s), millisecondes (ms)
            // Domaine : Durée > 0, propriétés CSS valides
            // Formule : propriété durée easing delay
            // Exemple : 'transform 0.3s ease' → transition douce
            transition: 'all 0.3s ease'
        };
    }

    /**
     * Retourne les classes CSS par défaut pour un widget d'image
     * 
     * @returns {Array<string>} Classes CSS par défaut
     */
    getDefaultClasses() {
        return [
            ...super.getDefaultClasses(),
            'image-widget',           // Classe spécifique au widget image
            'responsive-image',       // Classe pour responsive design
            'loading-placeholder'     // Classe pour état de chargement
        ];
    }

    /**
     * Valide les données spécifiques au widget d'image
     */
    validateData() {
        super.validateData();

        // Validation de l'URL source
        if (this.data.src && typeof this.data.src !== 'string') {
            throw new Error('L\'URL source de l\'image doit être une chaîne de caractères');
        }

        // Validation des dimensions
        if (this.data.width !== null && (typeof this.data.width !== 'number' || this.data.width <= 0)) {
            console.warn('⚠️ Largeur invalide, utilisation de la valeur par défaut');
            this.data.width = null;
        }

        if (this.data.height !== null && (typeof this.data.height !== 'number' || this.data.height <= 0)) {
            console.warn('⚠️ Hauteur invalide, utilisation de la valeur par défaut');
            this.data.height = null;
        }

        // Validation du mode object-fit
        const validObjectFitValues = ['contain', 'cover', 'fill', 'scale-down', 'none'];
        if (this.data.objectFit && !validObjectFitValues.includes(this.data.objectFit)) {
            console.warn(`⚠️ Mode object-fit '${this.data.objectFit}' invalide, utilisation de 'contain'`);
            this.data.objectFit = 'contain';
        }

        // Validation de l'action de clic
        const validClickActions = ['none', 'lightbox', 'link', 'zoom'];
        if (this.data.clickAction && !validClickActions.includes(this.data.clickAction)) {
            console.warn(`⚠️ Action de clic '${this.data.clickAction}' invalide, utilisation de 'none'`);
            this.data.clickAction = 'none';
        }

        // Validation de l'URL de lien si nécessaire
        if (this.data.clickAction === 'link' && (!this.data.linkUrl || this.data.linkUrl.trim() === '')) {
            console.warn('⚠️ URL de lien requise pour clickAction = "link"');
            this.data.clickAction = 'none';
        }

        // Validation de la qualité
        if (this.data.quality !== undefined && (typeof this.data.quality !== 'number' || this.data.quality < 0 || this.data.quality > 100)) {
            console.warn('⚠️ Qualité invalide (0-100), utilisation de 85');
            this.data.quality = 85;
        }
    }

    /**
     * Met à jour la source de l'image
     * 
     * @param {string} newSrc - Nouvelle URL source
     * @param {string} newAlt - Nouveau texte alternatif (optionnel)
     */
    updateSource(newSrc, newAlt = null) {
        if (!newSrc || typeof newSrc !== 'string') {
            throw new Error('Une URL source valide est requise');
        }

        const updateData = { src: newSrc };
        if (newAlt !== null) {
            updateData.alt = newAlt;
        }

        this.updateData(updateData);
        
        // Réinitialiser le placeholder si une nouvelle source est définie
        if (newSrc !== this.data.placeholder) {
            this.resetLoadingState();
        }

        console.log(`🖼️ Source image mise à jour: ${newSrc}`);
    }

    /**
     * Met à jour les dimensions de l'image
     * 
     * @param {number|null} width - Nouvelle largeur
     * @param {number|null} height - Nouvelle hauteur
     * @param {boolean} maintainRatio - Maintenir les proportions
     */
    updateDimensions(width, height, maintainRatio = true) {
        if (maintainRatio && width && height && this.data.width && this.data.height) {
            // Rôle : Calcul du ratio d'aspect de l'image originale
            // Type : Number (ratio largeur/hauteur)
            // Unité : Sans unité (ratio)
            // Domaine : ratio > 0
            // Formule : largeurOriginale / hauteurOriginale
            // Exemple : 800/600 = 1.33 → format paysage
            const originalRatio = this.data.width / this.data.height;

            if (width) {
                // Rôle : Calcul de hauteur proportionnelle à partir de largeur
                // Type : Number (hauteur calculée)
                // Unité : pixels (px)
                // Domaine : hauteur > 0
                // Formule : largeur / ratio
                // Exemple : 400px / 1.33 = 300px
                height = Math.round(width / originalRatio);
            } else if (height) {
                // Calcul de largeur proportionnelle à partir de hauteur
                width = Math.round(height * originalRatio);
            }
        }

        const updateData = {};
        if (width !== null) updateData.width = width;
        if (height !== null) updateData.height = height;
        updateData.maintainAspectRatio = maintainRatio;

        this.updateData(updateData);

        // Mise à jour des styles CSS correspondants
        const styleUpdates = {};
        if (width !== null) styleUpdates.width = `${width}px`;
        if (height !== null) styleUpdates.height = `${height}px`;
        
        if (Object.keys(styleUpdates).length > 0) {
            this.updateStyles(styleUpdates);
        }

        console.log(`📐 Dimensions image mises à jour: ${width}x${height}`);
    }

    /**
     * Configure l'action au clic sur l'image
     * 
     * @param {string} action - Type d'action
     * @param {Object} options - Options selon le type d'action
     */
    setClickAction(action, options = {}) {
        const validActions = ['none', 'lightbox', 'link', 'zoom'];
        
        if (!validActions.includes(action)) {
            throw new Error(`Action invalide: ${action}. Actions valides: ${validActions.join(', ')}`);
        }

        const updateData = { clickAction: action };

        // Configuration selon le type d'action
        switch (action) {
            case 'link':
                if (!options.url) {
                    throw new Error('URL requise pour l\'action "link"');
                }
                updateData.linkUrl = options.url;
                updateData.linkTarget = options.target || '_self';
                break;

            case 'lightbox':
                // Options pour lightbox (titre, description, etc.)
                if (options.title) updateData.title = options.title;
                break;

            case 'zoom':
                // Configuration du niveau de zoom
                updateData.zoomLevel = options.zoomLevel || 2;
                break;
        }

        this.updateData(updateData);
        console.log(`🎯 Action de clic configurée: ${action}`);
    }

    /**
     * Optimise l'image selon les paramètres définis
     * 
     * @param {Object} optimizationOptions - Options d'optimisation
     * @returns {Promise<string>} URL de l'image optimisée
     */
    async optimizeImage(optimizationOptions = {}) {
        if (!this.data.src || this.data.src === this.data.placeholder) {
            return this.data.src;
        }

        try {
            // Rôle : Configuration d'optimisation avec valeurs par défaut
            // Type : Object (paramètres d'optimisation)
            // Unité : Diverses selon paramètre
            // Domaine : Paramètres valides selon API d'optimisation
            // Formule : Fusion options par défaut + options utilisateur
            // Exemple : {quality: 85, format: 'webp', width: 800}
            const options = {
                quality: this.data.quality || 85,
                format: this.data.preferredFormat === 'auto' ? this.detectOptimalFormat() : this.data.preferredFormat,
                width: optimizationOptions.width || this.data.width,
                height: optimizationOptions.height || this.data.height,
                ...optimizationOptions
            };

            // Simulation d'optimisation (en production: appel API ou traitement local)
            console.log(`🔄 Optimisation image: ${this.data.src}`, options);
            
            // En production, ici se ferait l'appel à un service d'optimisation
            // ou le traitement local avec Canvas API
            
            return this.data.src; // Retourne l'originale en attendant
        } catch (error) {
            console.warn('⚠️ Erreur optimisation image:', error);
            return this.data.src;
        }
    }

    /**
     * Détecte le format optimal selon le support navigateur
     * 
     * @returns {string} Format d'image optimal
     */
    detectOptimalFormat() {
        // Rôle : Test de support des formats d'image modernes
        // Type : Boolean (support du format)
        // Unité : Sans unité
        // Domaine : true | false selon capacités navigateur
        // Formule : Création d'un canvas pour test de support
        // Exemple : true si WebP supporté, false sinon
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        
        // Test WebP (format moderne le plus supporté)
        const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        if (supportsWebP) {
            return 'image/webp';
        }

        // Fallback selon l'extension de l'image originale
        if (this.data.src.includes('.png')) {
            return 'image/png';
        }

        return 'image/jpeg'; // Format par défaut le plus compatible
    }

    /**
     * Remet à zéro l'état de chargement de l'image
     */
    resetLoadingState() {
        // Ajout de classes pour gérer l'état de chargement
        if (!this.classes.includes('loading-placeholder')) {
            this.classes.push('loading-placeholder');
        }

        // Suppression des classes d'état précédentes
        this.classes = this.classes.filter(cls => 
            !['loaded', 'error', 'loading-complete'].includes(cls)
        );
    }

    /**
     * Gère l'événement de chargement réussi de l'image
     */
    onImageLoad() {
        // Mise à jour des classes d'état
        this.classes = this.classes.filter(cls => cls !== 'loading-placeholder');
        if (!this.classes.includes('loaded')) {
            this.classes.push('loaded');
        }

        console.log(`✅ Image chargée: ${this.data.src}`);
    }

    /**
     * Gère l'événement d'erreur de chargement de l'image
     */
    onImageError() {
        // Mise à jour des classes d'état
        this.classes = this.classes.filter(cls => cls !== 'loading-placeholder');
        if (!this.classes.includes('error')) {
            this.classes.push('error');
        }

        console.warn(`❌ Erreur chargement image: ${this.data.src}`);
    }

    /**
     * Génère le HTML du widget pour le viewer
     * 
     * @param {Object} renderOptions - Options de rendu
     * @returns {string} HTML du widget
     */
    render(renderOptions = {}) {
        const hasImage = this.data.src && this.data.src !== this.data.placeholder;
        const imageSrc = hasImage ? this.data.src : this.data.placeholder;
        
        // Rôle : Classes CSS pour l'état actuel de l'image
        // Type : String (classes séparées par espaces)
        // Unité : Sans unité
        // Domaine : Classes CSS valides
        // Formule : Classes de base + classes d'état + classes conditionnelles
        // Exemple : 'widget image-widget loaded clickable'
        const cssClasses = [
            this.getClassesCSS(),
            hasImage ? 'has-image' : 'placeholder',
            this.data.clickAction !== 'none' ? 'clickable' : '',
            renderOptions.preview ? 'preview-mode' : 'normal-mode'
        ].filter(Boolean).join(' ');

        // Styles inline pour l'image
        const imageStyles = this.buildImageStyles();

        // Attributs de l'image
        const imageAttributes = this.buildImageAttributes(renderOptions);

        // Construction de l'élément image
        let imageElement = `<img ${imageAttributes} style="${imageStyles}" class="widget-image">`;

        // Ajout du container pour action de clic si nécessaire
        if (this.data.clickAction === 'link' && this.data.linkUrl) {
            imageElement = `<a href="${this.data.linkUrl}" target="${this.data.linkTarget}" class="image-link">${imageElement}</a>`;
        } else if (this.data.clickAction === 'lightbox') {
            imageElement = `<div class="image-lightbox-trigger" data-action="lightbox" data-src="${imageSrc}">${imageElement}</div>`;
        } else if (this.data.clickAction === 'zoom') {
            imageElement = `<div class="image-zoom-trigger" data-action="zoom" data-level="${this.data.zoomLevel || 2}">${imageElement}</div>`;
        }

        // Container principal du widget
        return `<div 
            class="${cssClasses}" 
            style="${this.getStylesCSS()}" 
            ${this.getAttributesHTML()}
        >${imageElement}</div>`;
    }

    /**
     * Construit les styles CSS pour l'élément image
     * 
     * @returns {string} Styles CSS formatés
     */
    buildImageStyles() {
        const styles = {
            display: 'block',
            maxWidth: '100%',
            height: 'auto'
        };

        // Application des dimensions spécifiques
        if (this.data.width) {
            styles.width = `${this.data.width}px`;
        }
        if (this.data.height) {
            styles.height = `${this.data.height}px`;
        }

        // Application du mode object-fit
        if (this.data.objectFit && this.data.objectFit !== 'none') {
            styles.objectFit = this.data.objectFit;
            styles.objectPosition = this.data.objectPosition || 'center center';
        }

        // Conversion en CSS inline
        return Object.entries(styles)
            .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ') + ';';
    }

    /**
     * Construit les attributs HTML pour l'élément image
     * 
     * @param {Object} renderOptions - Options de rendu
     * @returns {string} Attributs HTML formatés
     */
    buildImageAttributes(renderOptions) {
        const attributes = {
            src: this.data.src || this.data.placeholder,
            alt: this.data.alt || 'Image de présentation',
            'data-widget-id': this.id
        };

        // Ajout du titre si défini
        if (this.data.title) {
            attributes.title = this.data.title;
        }

        // Ajout du lazy loading si activé
        if (this.data.lazyLoad && !renderOptions.disableLazyLoad) {
            attributes.loading = 'lazy';
        }

        // Ajout des événements de chargement pour gestion d'état
        if (!renderOptions.static) {
            attributes.onload = `window.PresentationEngine?.handleImageLoad('${this.id}')`;
            attributes.onerror = `window.PresentationEngine?.handleImageError('${this.id}')`;
        }

        // Conversion en chaîne d'attributs HTML
        return Object.entries(attributes)
            .map(([attr, value]) => `${attr}="${value}"`)
            .join(' ');
    }

    /**
     * Génère le HTML pour l'éditeur avec contrôles avancés
     * 
     * @param {Object} editorOptions - Options d'édition
     * @returns {string} HTML pour l'éditeur
     */
    renderEditor(editorOptions = {}) {
        const baseHTML = this.render({ ...editorOptions, static: false });

        if (!editorOptions.showControls) {
            return baseHTML;
        }

        const controlsHTML = this.renderControls(editorOptions);

        return `
            <div class="widget-editor-container" data-widget-id="${this.id}">
                ${baseHTML}
                ${controlsHTML}
            </div>
        `;
    }

    /**
     * Génère les contrôles d'édition pour le widget
     * 
     * @param {Object} options - Options des contrôles
     * @returns {string} HTML des contrôles
     */
    renderControls(options = {}) {
        return `
            <div class="image-widget-controls" data-widget-id="${this.id}">
                <div class="control-group source">
                    <label class="control-label">Source de l'image:</label>
                    <div class="control-row">
                        <input type="url" class="control-input" data-action="updateSrc" 
                               value="${this.data.src || ''}" placeholder="URL de l'image">
                        <button type="button" class="control-btn" data-action="uploadImage" title="Télécharger une image">
                            <i class="fas fa-upload"></i>
                        </button>
                    </div>
                </div>

                <div class="control-group alt-text">
                    <label class="control-label">Texte alternatif:</label>
                    <input type="text" class="control-input" data-action="updateAlt" 
                           value="${this.data.alt || ''}" placeholder="Description de l'image">
                </div>

                <div class="control-group dimensions">
                    <label class="control-label">Dimensions:</label>
                    <div class="control-row">
                        <input type="number" class="control-input small" data-action="updateWidth" 
                               value="${this.data.width || ''}" placeholder="Largeur" min="1">
                        <span class="control-separator">×</span>
                        <input type="number" class="control-input small" data-action="updateHeight" 
                               value="${this.data.height || ''}" placeholder="Hauteur" min="1">
                        <label class="control-checkbox">
                            <input type="checkbox" data-action="toggleAspectRatio" 
                                   ${this.data.maintainAspectRatio ? 'checked' : ''}>
                            <span>Maintenir proportions</span>
                        </label>
                    </div>
                </div>

                <div class="control-group fit-mode">
                    <label class="control-label">Mode d'ajustement:</label>
                    <select class="control-select" data-action="updateObjectFit">
                        <option value="contain" ${this.data.objectFit === 'contain' ? 'selected' : ''}>Contenir</option>
                        <option value="cover" ${this.data.objectFit === 'cover' ? 'selected' : ''}>Couvrir</option>
                        <option value="fill" ${this.data.objectFit === 'fill' ? 'selected' : ''}>Étirer</option>
                        <option value="scale-down" ${this.data.objectFit === 'scale-down' ? 'selected' : ''}>Réduire</option>
                        <option value="none" ${this.data.objectFit === 'none' ? 'selected' : ''}>Original</option>
                    </select>
                </div>

                <div class="control-group click-action">
                    <label class="control-label">Action au clic:</label>
                    <select class="control-select" data-action="updateClickAction">
                        <option value="none" ${this.data.clickAction === 'none' ? 'selected' : ''}>Aucune</option>
                        <option value="lightbox" ${this.data.clickAction === 'lightbox' ? 'selected' : ''}>Agrandir</option>
                        <option value="link" ${this.data.clickAction === 'link' ? 'selected' : ''}>Lien</option>
                        <option value="zoom" ${this.data.clickAction === 'zoom' ? 'selected' : ''}>Zoom</option>
                    </select>
                    
                    ${this.data.clickAction === 'link' ? `
                        <input type="url" class="control-input" data-action="updateLinkUrl" 
                               value="${this.data.linkUrl || ''}" placeholder="URL de destination">
                    ` : ''}
                </div>

                <div class="control-group actions">
                    <button type="button" class="control-btn" data-action="optimizeImage" title="Optimiser l'image">
                        <i class="fas fa-magic"></i>
                        Optimiser
                    </button>
                    <button type="button" class="control-btn" data-action="resetImage" title="Réinitialiser">
                        <i class="fas fa-undo"></i>
                        Réinitialiser
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Applique une action d'édition au widget
     * 
     * @param {string} action - Action à appliquer
     * @param {*} value - Valeur de l'action
     */
    applyEditAction(action, value = null) {
        switch (action) {
            case 'updateSrc':
                this.updateSource(value);
                break;
            case 'updateAlt':
                this.updateData({ alt: value });
                break;
            case 'updateWidth':
                this.updateDimensions(parseInt(value) || null, this.data.height, this.data.maintainAspectRatio);
                break;
            case 'updateHeight':
                this.updateDimensions(this.data.width, parseInt(value) || null, this.data.maintainAspectRatio);
                break;
            case 'toggleAspectRatio':
                this.updateData({ maintainAspectRatio: value });
                break;
            case 'updateObjectFit':
                this.updateData({ objectFit: value });
                break;
            case 'updateClickAction':
                this.setClickAction(value);
                break;
            case 'updateLinkUrl':
                this.updateData({ linkUrl: value });
                break;
            case 'uploadImage':
                this.triggerImageUpload();
                break;
            case 'optimizeImage':
                this.optimizeImage();
                break;
            case 'resetImage':
                this.resetToDefaults();
                break;
            default:
                console.warn(`⚠️ Action d'édition inconnue: ${action}`);
        }
    }

    /**
     * Déclenche l'upload d'une nouvelle image
     */
    triggerImageUpload() {
        // Création d'un input file temporaire
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        };
        
        fileInput.click();
    }

    /**
     * Gère l'upload d'un fichier image
     * 
     * @param {File} file - Fichier image à traiter
     */
    async handleImageUpload(file) {
        try {
            // Validation du fichier
            if (!file.type.startsWith('image/')) {
                throw new Error('Le fichier doit être une image');
            }

            // Rôle : Taille maximum autorisée pour upload
            // Type : Number (taille en octets)
            // Unité : octets (bytes)
            // Domaine : 0 < maxSize ≤ 50MB
            // Formule : Limite pour éviter surcharge serveur/client
            // Exemple : 5 * 1024 * 1024 = 5MB maximum
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (file.size > maxSize) {
                throw new Error('L\'image est trop volumineuse (max 5MB)');
            }

            // Conversion en URL de données (base64) pour affichage immédiat
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                this.updateSource(dataUrl, file.name);
                console.log(`📤 Image uploadée: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);
            };

            reader.readAsDataURL(file);

        } catch (error) {
            console.error('❌ Erreur upload image:', error);
            // Notification à l'utilisateur dans l'interface
            if (window.showNotification) {
                window.showNotification(`Erreur: ${error.message}`, 'error');
            }
        }
    }

    /**
     * Remet le widget à ses valeurs par défaut
     */
    resetToDefaults() {
        const defaultData = this.getDefaultData();
        const defaultStyles = this.getDefaultStyles();
        
        this.data = { ...defaultData };
        this.styles = { ...defaultStyles };
        
        this.metadata.modified = new Date().toISOString();
        
        console.log(`🔄 Widget image '${this.id}' réinitialisé`);
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.ImageWidget = ImageWidget;
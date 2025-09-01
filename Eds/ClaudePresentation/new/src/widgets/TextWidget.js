/**
 * Widget de texte éditable avec formatage
 * 
 * Rôle : Gère l'affichage et l'édition de contenu textuel
 * Type : Classe de widget héritant de BaseWidget
 * Responsabilité : Rendu de texte, édition inline, formatage basique
 */
class TextWidget extends BaseWidget {
    /**
     * Constructeur du widget de texte
     * 
     * @param {Object} config - Configuration du widget
     */
    constructor(config = {}) {
        // Initialisation avec le type 'text'
        super('text', config);
    }

    /**
     * Retourne les données par défaut pour un widget de texte
     * 
     * @returns {Object} Données par défaut
     */
    getDefaultData() {
        return {
            // Rôle : Contenu textuel principal du widget
            // Type : String (texte HTML basique)
            // Unité : Sans unité
            // Domaine : Texte valide avec balises HTML autorisées
            // Formule : Texte par défaut configurable
            // Exemple : 'Cliquez pour éditer ce texte'
            text: 'Cliquez pour éditer ce texte',

            // Rôle : Balise HTML pour l'élément conteneur
            // Type : String (nom de balise HTML)
            // Unité : Sans unité
            // Domaine : Balises HTML valides: p, div, span, h1-h6, etc.
            // Formule : Balise sémantique selon le type de contenu
            // Exemple : 'p' pour paragraphe, 'h2' pour titre
            tag: 'p',

            // Rôle : Niveau de formatage autorisé pour l'édition
            // Type : String (niveau de formatage)
            // Unité : Sans unité
            // Domaine : 'basic' | 'rich' | 'none'
            // Formule : Définit quels outils d'édition sont disponibles
            // Exemple : 'basic' → gras/italique, 'rich' → tous les formats
            formatLevel: 'basic',

            // Rôle : Balises HTML autorisées dans le contenu
            // Type : Array<String> (liste de balises)
            // Unité : Sans unité
            // Domaine : Noms de balises HTML valides
            // Formule : Liste restrictive pour sécurité
            // Exemple : ['b', 'i', 'strong', 'em', 'br']
            allowedTags: ['b', 'i', 'strong', 'em', 'u', 'br', 'span'],

            // Rôle : Longueur maximum du texte en caractères
            // Type : Number (limite de caractères)
            // Unité : caractères (nombre)
            // Domaine : 0 < maxLength ≤ 10000
            // Formule : Limite pour éviter surcharge et garder UX fluide
            // Exemple : 1000 → max 1000 caractères
            maxLength: 1000,

            // Rôle : Texte de substitution si le contenu est vide
            // Type : String (texte de fallback)
            // Unité : Sans unité
            // Domaine : Texte descriptif court
            // Formule : Texte d'aide pour l'utilisateur
            // Exemple : 'Aucun contenu disponible'
            placeholder: 'Entrez votre texte ici...'
        };
    }

    /**
     * Retourne les styles par défaut pour un widget de texte
     * 
     * @returns {Object} Styles CSS par défaut
     */
    getDefaultStyles() {
        return {
            ...super.getDefaultStyles(),
            // Rôle : Police de caractères pour le texte
            // Type : String (famille de polices CSS)
            // Unité : Sans unité
            // Domaine : Noms de polices valides avec fallbacks
            // Formule : Police primaire, fallbacks système
            // Exemple : 'Inter, Arial, sans-serif'
            fontFamily: 'Inter, Arial, sans-serif',

            // Rôle : Taille de police du texte
            // Type : String (taille CSS)
            // Unité : pixels (px), em, rem
            // Domaine : Tailles lisibles 10px ≤ fontSize ≤ 72px
            // Formule : Taille selon hiérarchie typographique
            // Exemple : '16px' pour texte, '24px' pour titre
            fontSize: '16px',

            // Rôle : Hauteur de ligne pour espacement vertical
            // Type : String (ratio ou valeur CSS)
            // Unité : Sans unité (ratio) ou px/em
            // Domaine : 1.0 ≤ lineHeight ≤ 3.0
            // Formule : Ratio optimal pour lisibilité = 1.4-1.6
            // Exemple : '1.5' → 150% de la taille de police
            lineHeight: '1.5',

            // Rôle : Couleur du texte principal
            // Type : String (couleur CSS)
            // Unité : Sans unité
            // Domaine : Couleurs valides: hex, rgb, hsl, nommées
            // Formule : Couleur contrastée sur fond pour accessibilité
            // Exemple : '#333333' → gris foncé lisible
            color: '#333333',

            // Rôle : Espacement interne du widget
            // Type : String (valeur CSS)
            // Unité : pixels (px), em, %
            // Domaine : Espacement ≥ 0
            // Formule : Espacement selon densité d'interface
            // Exemple : '8px' → espacement confortable
            padding: '8px',

            // Rôle : Espacement externe du widget
            // Type : String (valeur CSS)
            // Unité : pixels (px), em, %
            // Domaine : Espacement ≥ 0
            // Formule : Séparation avec autres éléments
            // Exemple : '4px 0' → marge verticale seulement
            margin: '4px 0',

            // Rôle : Comportement de retour à la ligne
            // Type : String (propriété CSS word-wrap)
            // Unité : Sans unité
            // Domaine : 'normal' | 'break-word' | 'break-all'
            // Formule : Gestion des mots longs et espaces
            // Exemple : 'break-word' → coupe les mots longs si nécessaire
            wordWrap: 'break-word'
        };
    }

    /**
     * Retourne les classes CSS par défaut pour un widget de texte
     * 
     * @returns {Array<string>} Classes CSS par défaut
     */
    getDefaultClasses() {
        return [
            ...super.getDefaultClasses(),
            'text-widget',        // Classe spécifique au widget texte
            'user-select-text',   // Permet la sélection du texte
            'focus-visible'       // Styles de focus pour accessibilité
        ];
    }

    /**
     * Valide les données spécifiques au widget de texte
     */
    validateData() {
        super.validateData();

        // Validation du contenu texte
        if (this.data.text !== undefined && typeof this.data.text !== 'string') {
            throw new Error('Le contenu texte doit être une chaîne de caractères');
        }

        // Validation de la longueur si définie
        if (this.data.maxLength && this.data.text && this.data.text.length > this.data.maxLength) {
            console.warn(`⚠️ Texte tronqué à ${this.data.maxLength} caractères`);
            this.data.text = this.data.text.substring(0, this.data.maxLength);
        }

        // Validation de la balise HTML
        const allowedTags = ['p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'td', 'th'];
        if (this.data.tag && !allowedTags.includes(this.data.tag)) {
            console.warn(`⚠️ Balise '${this.data.tag}' non autorisée, utilisation de 'p'`);
            this.data.tag = 'p';
        }

        // Validation du niveau de formatage
        const validFormatLevels = ['none', 'basic', 'rich'];
        if (this.data.formatLevel && !validFormatLevels.includes(this.data.formatLevel)) {
            console.warn(`⚠️ Niveau de formatage '${this.data.formatLevel}' invalide, utilisation de 'basic'`);
            this.data.formatLevel = 'basic';
        }
    }

    /**
     * Nettoie le contenu HTML du texte pour sécurité
     * 
     * @param {string} htmlContent - Contenu HTML à nettoyer
     * @returns {string} Contenu HTML nettoyé
     */
    sanitizeHTML(htmlContent) {
        if (!htmlContent || typeof htmlContent !== 'string') {
            return '';
        }

        // Rôle : Création d'un élément temporaire pour parsing HTML sécurisé
        // Type : HTMLElement (élément DOM temporaire)
        // Unité : Sans unité
        // Domaine : Element DOM valide
        // Formule : document.createElement() → élément isolé
        // Exemple : <div> temporaire pour validation HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        // Rôle : Liste des balises autorisées pour ce widget
        // Type : Array<String> (noms de balises)
        // Unité : Sans unité
        // Domaine : Balises HTML sécurisées
        // Formule : this.data.allowedTags || liste par défaut
        // Exemple : ['b', 'i', 'strong'] → seules ces balises gardées
        const allowedTags = this.data.allowedTags || ['b', 'i', 'strong', 'em', 'u', 'br', 'span'];

        // Suppression des balises non autorisées
        const allElements = tempDiv.querySelectorAll('*');
        allElements.forEach(element => {
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                // Remplacement par le contenu textuel uniquement
                element.replaceWith(document.createTextNode(element.textContent));
            }
        });

        return tempDiv.innerHTML;
    }

    /**
     * Met à jour le contenu texte du widget
     * 
     * @param {string} newText - Nouveau contenu texte
     * @param {boolean} sanitize - Nettoyer le HTML (défaut: true)
     */
    updateText(newText, sanitize = true) {
        if (typeof newText !== 'string') {
            throw new Error('Le nouveau texte doit être une chaîne de caractères');
        }

        // Nettoyage du contenu si demandé
        const cleanText = sanitize ? this.sanitizeHTML(newText) : newText;

        // Vérification de la longueur maximum
        let finalText = cleanText;
        if (this.data.maxLength && cleanText.length > this.data.maxLength) {
            finalText = cleanText.substring(0, this.data.maxLength);
            console.warn(`⚠️ Texte tronqué à ${this.data.maxLength} caractères`);
        }

        // Mise à jour des données
        this.updateData({ text: finalText });

        console.log(`📝 Texte du widget '${this.id}' mis à jour (${finalText.length} caractères)`);
    }

    /**
     * Met à jour le formatage du texte
     * 
     * @param {Object} formatting - Options de formatage
     */
    updateFormatting(formatting) {
        const validFormattingOptions = {
            fontSize: (value) => /^\d+(px|em|rem|%)$/.test(value),
            fontWeight: (value) => ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(value),
            fontStyle: (value) => ['normal', 'italic', 'oblique'].includes(value),
            textAlign: (value) => ['left', 'center', 'right', 'justify'].includes(value),
            color: (value) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value) || /^rgb\(/.test(value),
            textDecoration: (value) => ['none', 'underline', 'line-through', 'overline'].includes(value)
        };

        // Rôle : Filtrage et validation des options de formatage
        // Type : Object (styles CSS validés)
        // Unité : Unités CSS appropriées
        // Domaine : Propriétés CSS valides pour texte
        // Formule : Validation avec regex/listes autorisées
        // Exemple : {fontSize: '18px', color: '#red'} → {fontSize: '18px'} (color rejeté)
        const validFormatting = {};
        
        for (const [property, value] of Object.entries(formatting)) {
            if (validFormattingOptions[property] && validFormattingOptions[property](value)) {
                validFormatting[property] = value;
            } else {
                console.warn(`⚠️ Option de formatage invalide: ${property} = ${value}`);
            }
        }

        if (Object.keys(validFormatting).length > 0) {
            this.updateStyles(validFormatting);
            console.log(`🎨 Formatage appliqué au widget '${this.id}':`, validFormatting);
        }
    }

    /**
     * Génère le HTML du widget pour le viewer
     * 
     * @param {Object} renderOptions - Options de rendu
     * @returns {string} HTML du widget
     */
    render(renderOptions = {}) {
        // Gestion du contenu vide
        const content = this.data.text || this.data.placeholder || '';
        const isEmpty = !this.data.text || this.data.text.trim() === '';
        
        // Rôle : Balise HTML pour le rendu du widget
        // Type : String (nom de balise)
        // Unité : Sans unité
        // Domaine : Balises HTML valides
        // Formule : this.data.tag || 'p' (paragraphe par défaut)
        // Exemple : 'h2' pour titre, 'p' pour paragraphe
        const tag = this.data.tag || 'p';

        // Rôle : Classes CSS combinées pour le rendu
        // Type : String (classes séparées par espaces)
        // Unité : Sans unité
        // Domaine : Classes CSS valides
        // Formule : Classes de base + classes conditionnelles
        // Exemple : 'widget text-widget editable empty-content'
        const cssClasses = [
            this.getClassesCSS(),
            isEmpty ? 'empty-content' : 'has-content',
            renderOptions.preview ? 'preview-mode' : 'normal-mode'
        ].filter(Boolean).join(' ');

        // Rôle : Styles CSS inline pour le rendu
        // Type : String (CSS formaté)
        // Unité : Unités CSS appropriées
        // Domaine : CSS syntaxiquement correct
        // Formule : Conversion objet styles → CSS inline
        // Exemple : 'font-size: 16px; color: #333; padding: 8px;'
        const inlineStyles = this.getStylesCSS();

        // Rôle : Attributs HTML pour le rendu
        // Type : String (attributs formatés)
        // Unité : Sans unité
        // Domaine : Attributs HTML valides
        // Formule : Attributs de base + attributs d'édition si éditable
        // Exemple : 'id="widget-123" contenteditable="true" data-field="title"'
        const attributes = [
            this.getAttributesHTML(),
            this.editable && !renderOptions.readonly ? 'contenteditable="true"' : '',
            this.data.maxLength ? `data-max-length="${this.data.maxLength}"` : '',
            isEmpty ? `data-placeholder="${this.data.placeholder}"` : ''
        ].filter(Boolean).join(' ');

        // Génération du HTML final
        return `<${tag} 
            class="${cssClasses}" 
            style="${inlineStyles}" 
            ${attributes}
        >${content}</${tag}>`;
    }

    /**
     * Génère le HTML pour l'éditeur avec contrôles avancés
     * 
     * @param {Object} editorOptions - Options d'édition
     * @returns {string} HTML pour l'éditeur
     */
    renderEditor(editorOptions = {}) {
        // Rendu de base du widget
        const baseHTML = this.render({ ...editorOptions, readonly: false });

        // Si pas de contrôles avancés demandés, retourner le rendu de base
        if (!editorOptions.showControls) {
            return baseHTML;
        }

        // Rôle : Panneau de contrôles d'édition pour le widget texte
        // Type : String (HTML des contrôles)
        // Unité : Sans unité
        // Domaine : HTML valide des outils d'édition
        // Formule : Template HTML avec boutons de formatage
        // Exemple : Boutons gras, italique, couleur, taille
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
        if (this.data.formatLevel === 'none') {
            return ''; // Aucun contrôle si formatage désactivé
        }

        const isBasic = this.data.formatLevel === 'basic';
        
        return `
            <div class="text-widget-controls" data-widget-id="${this.id}">
                <div class="control-group formatting">
                    <button type="button" class="control-btn" data-action="bold" title="Gras">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button type="button" class="control-btn" data-action="italic" title="Italique">
                        <i class="fas fa-italic"></i>
                    </button>
                    ${!isBasic ? `
                        <button type="button" class="control-btn" data-action="underline" title="Souligné">
                            <i class="fas fa-underline"></i>
                        </button>
                        <div class="control-separator"></div>
                        <select class="control-select" data-action="fontSize" title="Taille de police">
                            <option value="12px">12px</option>
                            <option value="14px">14px</option>
                            <option value="16px" selected>16px</option>
                            <option value="18px">18px</option>
                            <option value="20px">20px</option>
                            <option value="24px">24px</option>
                        </select>
                        <input type="color" class="control-color" data-action="color" title="Couleur du texte" value="${this.styles.color || '#333333'}">
                    ` : ''}
                </div>
                <div class="control-group actions">
                    <button type="button" class="control-btn" data-action="clear" title="Effacer le formatage">
                        <i class="fas fa-eraser"></i>
                    </button>
                    <div class="text-info">
                        <span class="char-count">${this.data.text ? this.data.text.length : 0}</span>
                        ${this.data.maxLength ? `/ ${this.data.maxLength}` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Applique une action d'édition au widget
     * 
     * @param {string} action - Action à appliquer
     * @param {*} value - Valeur de l'action (optionnelle)
     */
    applyEditAction(action, value = null) {
        switch (action) {
            case 'bold':
                this.toggleBold();
                break;
            case 'italic':
                this.toggleItalic();
                break;
            case 'underline':
                this.updateStyles({ textDecoration: this.styles.textDecoration === 'underline' ? 'none' : 'underline' });
                break;
            case 'fontSize':
                this.updateStyles({ fontSize: value });
                break;
            case 'color':
                this.updateStyles({ color: value });
                break;
            case 'clear':
                this.clearFormatting();
                break;
            default:
                console.warn(`⚠️ Action d'édition inconnue: ${action}`);
        }
    }

    /**
     * Active/désactive le formatage gras
     */
    toggleBold() {
        const currentWeight = this.styles.fontWeight || 'normal';
        const newWeight = currentWeight === 'bold' || currentWeight === '700' ? 'normal' : 'bold';
        this.updateStyles({ fontWeight: newWeight });
    }

    /**
     * Active/désactive le formatage italique
     */
    toggleItalic() {
        const currentStyle = this.styles.fontStyle || 'normal';
        const newStyle = currentStyle === 'italic' ? 'normal' : 'italic';
        this.updateStyles({ fontStyle: newStyle });
    }

    /**
     * Efface tout le formatage du widget
     */
    clearFormatting() {
        // Rôle : Styles de base à conserver lors du nettoyage
        // Type : Object (styles essentiels)
        // Unité : Unités CSS appropriées
        // Domaine : Styles minimum pour fonctionnement
        // Formule : Styles par défaut sans formatage
        // Exemple : Police, taille de base, couleur neutre
        const baseStyles = {
            fontFamily: this.getDefaultStyles().fontFamily,
            fontSize: this.getDefaultStyles().fontSize,
            lineHeight: this.getDefaultStyles().lineHeight,
            color: this.getDefaultStyles().color,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none'
        };

        this.updateStyles(baseStyles, false); // Remplacement complet
        console.log(`🧹 Formatage effacé pour le widget '${this.id}'`);
    }

    /**
     * Retourne les métadonnées étendues du widget texte
     * 
     * @returns {Object} Métadonnées complètes
     */
    getExtendedMetadata() {
        return {
            ...this.metadata,
            textLength: this.data.text ? this.data.text.length : 0,
            wordCount: this.data.text ? this.data.text.split(/\s+/).filter(word => word.length > 0).length : 0,
            hasFormatting: this.hasCustomFormatting(),
            readingTime: this.estimateReadingTime()
        };
    }

    /**
     * Vérifie si le widget a du formatage personnalisé
     * 
     * @returns {boolean} true si formatage personnalisé présent
     */
    hasCustomFormatting() {
        const defaultStyles = this.getDefaultStyles();
        
        // Comparaison avec les styles par défaut
        const customStyleProperties = ['fontWeight', 'fontStyle', 'textDecoration', 'fontSize', 'color'];
        
        return customStyleProperties.some(property => 
            this.styles[property] && this.styles[property] !== defaultStyles[property]
        );
    }

    /**
     * Estime le temps de lecture du texte
     * 
     * @param {number} wordsPerMinute - Vitesse de lecture (défaut: 200 mots/min)
     * @returns {number} Temps estimé en minutes
     */
    estimateReadingTime(wordsPerMinute = 200) {
        if (!this.data.text) return 0;

        // Rôle : Nombre de mots dans le texte
        // Type : Number (compteur de mots)
        // Unité : mots (nombre)
        // Domaine : wordCount ≥ 0
        // Formule : split par espaces + filter des chaînes vides
        // Exemple : "Bonjour le monde" → 3 mots
        const wordCount = this.data.text.split(/\s+/).filter(word => word.length > 0).length;

        // Rôle : Temps de lecture estimé en minutes
        // Type : Number (durée)
        // Unité : minutes (min)
        // Domaine : readingTime ≥ 0
        // Formule : wordCount / wordsPerMinute
        // Exemple : 400 mots ÷ 200 mots/min = 2 minutes
        const readingTime = Math.ceil(wordCount / wordsPerMinute);

        return Math.max(1, readingTime); // Minimum 1 minute
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.TextWidget = TextWidget;
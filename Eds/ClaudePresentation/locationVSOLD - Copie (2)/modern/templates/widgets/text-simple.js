/**
 * ============================================================================
 * WIDGET TEXTE SIMPLE - Template et Logique COMPLÈTE
 * ============================================================================
 * 
 * Rôle : Widget de texte formaté avec styles visuels avancés
 * Type : Widget contenu - Composant réutilisable pour texte
 * Usage : Utilisé pour ajouter du contenu textuel formaté avec contrôles complets
 */

class TextSimpleWidget {
    constructor() {
        // Configuration : Propriétés du widget texte simple
        this.id = 'text-simple';
        this.name = 'Texte Simple';
        this.category = 'Contenu';
        this.icon = '📝';
        this.description = 'Texte formaté avec styles visuels complets';
        
        // Données par défaut - Configuration complète
        this.defaultData = {
            text: 'Votre texte ici...',
            textType: 'paragraph', // paragraph, title, subtitle, quote, note
            size: 'medium', // small, medium, large, xlarge
            color: 'default', // default, primary, secondary, custom (rétrocompatibilité)
            customColor: '#F8FAFC',
            alignment: 'left', // left, center, right
            isBold: false,
            isItalic: false,
            marginTop: 'medium', // none, small, medium, large
            marginBottom: 'medium',
            // Couleur de texte (nouvelle)
            textColor: 'default',
            customTextColor: '#F8FAFC',
            // Arrière-plan
            hasBackground: false,
            backgroundColor: 'transparent',
            customBackgroundColor: '#1E293B',
            backgroundOpacity: 100,
            // Contour
            hasBorder: false,
            borderColor: 'primary',
            customBorderColor: '#10B981',
            borderWidth: 1,
            borderStyle: 'solid',
            // Coins arrondis
            hasRoundedCorners: false,
            borderRadius: 8,
            // Organisation & Dimensions
            width: 'auto',
            height: 'auto',
            paddingTop: 'medium',
            paddingBottom: 'medium',
            paddingLeft: 'medium',
            paddingRight: 'medium'
        };

        // Presets de styles - Configurations prédéfinies
        this.stylePresets = {
            paragraph: {
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-normal)',
                lineHeight: '1.7',
                fontFamily: 'var(--font-primary)'
            },
            title: {
                fontSize: 'var(--text-3xl)',
                fontWeight: 'var(--font-bold)',
                lineHeight: '1.2',
                fontFamily: 'var(--font-heading)'
            },
            subtitle: {
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                lineHeight: '1.4',
                fontFamily: 'var(--font-primary)'
            },
            quote: {
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                lineHeight: '1.6',
                fontFamily: 'var(--font-primary)',
                fontStyle: 'italic'
            },
            note: {
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-normal)',
                lineHeight: '1.5',
                fontFamily: 'var(--font-primary)'
            }
        };

        // Échelles de taille - Multiplicateurs pour responsive
        this.sizeScale = {
            small: 0.875,
            medium: 1,
            large: 1.25,
            xlarge: 1.5
        };

        // Couleurs prédéfinies - Palette du thème étendue
        this.colorPalette = {
            default: 'var(--text-white)',
            primary: 'var(--accent-green)',
            secondary: 'var(--text-gray)',
            muted: 'var(--text-muted)',
            success: 'var(--success-green)',
            warning: 'var(--warning-orange)',
            danger: 'var(--danger-red)'
        };

        // Espacements - Marges et paddings standardisées
        this.spacings = {
            none: '0',
            small: 'var(--spacing-sm)',
            medium: 'var(--spacing-md)',
            large: 'var(--spacing-lg)'
        };
    }

    /**
     * Rôle : Génération du template HTML avec tous les styles
     * Type : Template rendering - HTML structure avec styles complets
     * Retour : String HTML du widget texte
     */
    render(data = {}) {
        // Fusion des données - Combine defaults et données fournies
        const widgetData = { ...this.defaultData, ...data };
        
        // Génération des styles inline - Style calculé dynamiquement
        const styles = this.generateInlineStyles(widgetData);
        
        // Classe CSS selon le type - Class dynamique
        const typeClass = `text-widget-${widgetData.textType}`;
        
        // Traitement du contenu - Formatage du texte
        const processedText = this.processTextContent(widgetData.text);

        return `
            <div class="text-simple-widget ${typeClass} editable" 
                 data-widget-id="${this.id}"
                 data-field="text-content"
                 style="${styles}">
                ${processedText}
            </div>
        `;
    }

    /**
     * Rôle : Génération des styles inline calculés (Version complète)
     * Type : Style computation - CSS dynamique avec tous les paramètres
     * Retour : String CSS inline
     */
    generateInlineStyles(data) {
        // Style de base selon le type - Preset styles
        const baseStyle = this.stylePresets[data.textType];
        
        // Échelle de taille - Size multiplier
        const sizeMultiplier = this.sizeScale[data.size];
        
        // Couleur de texte (priorité: textColor > color pour compatibilité)
        const finalTextColor = data.textColor === 'custom' ? 
            data.customTextColor : 
            this.colorPalette[data.textColor] || this.colorPalette[data.color] || this.colorPalette.default;

        // Construction du style de base - Style assembly
        const styleRules = [
            `font-size: calc(${baseStyle.fontSize} * ${sizeMultiplier})`,
            `font-weight: ${baseStyle.fontWeight}`,
            `line-height: ${baseStyle.lineHeight}`,
            `font-family: ${baseStyle.fontFamily}`,
            `color: ${finalTextColor}`,
            `text-align: ${data.alignment}`,
            `margin-top: ${this.spacings[data.marginTop]}`,
            `margin-bottom: ${this.spacings[data.marginBottom]}`
        ];

        // Style de police - Ajouts conditionnels
        if (data.isBold && data.textType !== 'title') {
            styleRules.push('font-weight: var(--font-bold)');
        }
        
        if (data.isItalic) {
            styleRules.push('font-style: italic');
        }

        if (baseStyle.fontStyle) {
            styleRules.push(`font-style: ${baseStyle.fontStyle}`);
        }

        // Arrière-plan - Gestion avec transparence
        if (data.hasBackground && data.backgroundColor !== 'transparent') {
            const bgColor = data.backgroundColor === 'custom' ? 
                data.customBackgroundColor : 
                this.colorPalette[data.backgroundColor] || data.backgroundColor;
            
            const opacity = data.backgroundOpacity / 100;
            if (bgColor.startsWith('#')) {
                // Conversion hex vers rgba avec opacité
                const r = parseInt(bgColor.slice(1, 3), 16);
                const g = parseInt(bgColor.slice(3, 5), 16);
                const b = parseInt(bgColor.slice(5, 7), 16);
                styleRules.push(`background-color: rgba(${r}, ${g}, ${b}, ${opacity})`);
            } else {
                styleRules.push(`background-color: ${bgColor}`);
                if (opacity < 1) styleRules.push(`opacity: ${opacity}`);
            }
        }

        // Contour - Style de bordure
        if (data.hasBorder) {
            const borderColor = data.borderColor === 'custom' ? 
                data.customBorderColor : 
                this.colorPalette[data.borderColor] || data.borderColor;
            
            styleRules.push(`border: ${data.borderWidth}px ${data.borderStyle} ${borderColor}`);
        }

        // Coins arrondis - Border radius
        if (data.hasRoundedCorners) {
            styleRules.push(`border-radius: ${data.borderRadius}px`);
        }

        // Padding (organisation) - Espacement interne
        styleRules.push(`padding-top: ${this.spacings[data.paddingTop]}`);
        styleRules.push(`padding-bottom: ${this.spacings[data.paddingBottom]}`);
        styleRules.push(`padding-left: ${this.spacings[data.paddingLeft]}`);
        styleRules.push(`padding-right: ${this.spacings[data.paddingRight]}`);

        // Dimensions (organisation) - Taille du conteneur
        if (data.width !== 'auto') {
            styleRules.push(`width: ${typeof data.width === 'number' ? data.width + 'px' : data.width}`);
        }
        if (data.height !== 'auto') {
            styleRules.push(`height: ${typeof data.height === 'number' ? data.height + 'px' : data.height}`);
        }

        return styleRules.join('; ');
    }

    /**
     * Rôle : Traitement du contenu texte
     * Type : Content processing - Formatage sécurisé
     * Retour : String HTML formaté
     */
    processTextContent(text) {
        // Échappement basique - Sécurité XSS
        const escapedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Conversion des retours à la ligne - Line breaks
        return escapedText.replace(/\n/g, '<br>');
    }

    /**
     * Rôle : Styles CSS du composant (Version étendue)
     * Type : Component styling - CSS classes avec nouveaux styles
     * Retour : String CSS des styles
     */
    getStyles() {
        return `
            .text-simple-widget {
                transition: var(--transition-normal);
                cursor: default;
                word-wrap: break-word;
                hyphens: auto;
                position: relative;
                display: block;
            }

            .text-simple-widget.editable:hover {
                background: rgba(16, 185, 129, 0.05);
                outline: 1px dashed rgba(16, 185, 129, 0.3);
                outline-offset: 4px;
                border-radius: var(--border-radius-sm);
            }

            .text-widget-title {
                background: var(--gradient-green);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .text-widget-quote {
                position: relative;
                padding-left: var(--spacing-lg);
                border-left: 4px solid var(--accent-green);
                background: rgba(16, 185, 129, 0.05);
                padding-top: var(--spacing-sm);
                padding-bottom: var(--spacing-sm);
                padding-right: var(--spacing-md);
                border-radius: var(--border-radius-sm);
            }

            .text-widget-quote:before {
                content: '"';
                position: absolute;
                left: var(--spacing-xs);
                top: -var(--spacing-xs);
                font-size: var(--text-2xl);
                color: var(--accent-green);
                font-weight: var(--font-bold);
            }

            .text-widget-note {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: var(--border-radius-sm);
                padding: var(--spacing-sm) var(--spacing-md);
                position: relative;
            }

            .text-widget-note:before {
                content: 'ℹ️';
                margin-right: var(--spacing-xs);
            }

            /* Responsive - Ajustements mobiles étendus */
            @media (max-width: 768px) {
                .text-widget-title {
                    font-size: var(--text-2xl) !important;
                }
                
                .text-widget-subtitle {
                    font-size: var(--text-lg) !important;
                }
                
                .text-widget-quote {
                    padding-left: var(--spacing-md);
                    margin-left: var(--spacing-sm);
                    margin-right: var(--spacing-sm);
                }

                .text-simple-widget {
                    padding-left: var(--spacing-sm) !important;
                    padding-right: var(--spacing-sm) !important;
                }
            }

            /* Animation d'apparition améliorée */
            .text-simple-widget {
                opacity: 0;
                transform: translateY(10px);
                animation: textAppear 0.6s ease-out forwards;
            }

            @keyframes textAppear {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* États d'interaction améliorés */
            .text-simple-widget:hover {
                transform: translateY(-1px);
            }

            .text-simple-widget:focus {
                outline: 2px solid var(--accent-green);
                outline-offset: 2px;
            }

            /* Support pour les contours personnalisés */
            .text-simple-widget[style*="border"] {
                box-shadow: var(--shadow-sm);
            }

            .text-simple-widget[style*="border"]:hover {
                box-shadow: var(--shadow-md);
            }
        `;
    }

    /**
     * Rôle : Configuration des champs éditables (Version complète)
     * Type : Editor configuration - Interface utilisateur étendue
     * Retour : Array des champs avec toutes les nouvelles options
     */
    getEditableFields() {
        return [
            // Section 1: Contenu
            {
                name: 'text',
                label: 'Texte',
                type: 'textarea',
                placeholder: 'Votre texte ici...',
                rows: 4,
                defaultValue: this.defaultData.text,
                help: 'Saisissez votre texte. Les retours à la ligne sont automatiquement pris en compte.'
            },
            {
                name: 'textType',
                label: 'Type de texte',
                type: 'select',
                options: [
                    { value: 'paragraph', label: '📝 Paragraphe', preview: 'Texte normal' },
                    { value: 'title', label: '🎯 Titre', preview: 'Titre Important' },
                    { value: 'subtitle', label: '📋 Sous-titre', preview: 'Sous-titre' },
                    { value: 'quote', label: '💭 Citation', preview: 'Citation inspirante' },
                    { value: 'note', label: '📝 Note', preview: 'Note informative' }
                ],
                defaultValue: this.defaultData.textType,
                help: 'Choisissez le style prédéfini de votre texte'
            },
            
            // Section 2: Style de texte
            {
                name: 'size',
                label: 'Taille',
                type: 'select',
                options: [
                    { value: 'small', label: 'Petit' },
                    { value: 'medium', label: 'Moyen' },
                    { value: 'large', label: 'Grand' },
                    { value: 'xlarge', label: 'Très grand' }
                ],
                defaultValue: this.defaultData.size,
                help: 'Ajustez la taille du texte'
            },
            {
                name: 'textColor',
                label: 'Couleur du texte',
                type: 'select',
                options: [
                    { value: 'default', label: 'Blanc' },
                    { value: 'primary', label: 'Vert EDS' },
                    { value: 'secondary', label: 'Gris' },
                    { value: 'muted', label: 'Gris clair' },
                    { value: 'success', label: 'Vert succès' },
                    { value: 'warning', label: 'Orange' },
                    { value: 'danger', label: 'Rouge' },
                    { value: 'custom', label: 'Personnalisée' }
                ],
                defaultValue: this.defaultData.textColor,
                help: 'Sélectionnez une couleur prédéfinie ou personnalisée'
            },
            {
                name: 'customTextColor',
                label: 'Couleur personnalisée',
                type: 'color',
                defaultValue: this.defaultData.customTextColor,
                condition: { field: 'textColor', value: 'custom' }
            },
            {
                name: 'alignment',
                label: 'Alignement',
                type: 'select',
                options: [
                    { value: 'left', label: 'Gauche' },
                    { value: 'center', label: 'Centre' },
                    { value: 'right', label: 'Droite' }
                ],
                defaultValue: this.defaultData.alignment,
                help: 'Choisissez l\'alignement du texte'
            },
            {
                name: 'isBold',
                label: 'Texte en gras',
                type: 'checkbox',
                defaultValue: this.defaultData.isBold,
                help: 'Rendre le texte plus épais'
            },
            {
                name: 'isItalic',
                label: 'Texte en italique',
                type: 'checkbox',
                defaultValue: this.defaultData.isItalic,
                help: 'Incliner le texte'
            },
            
            // Section 3: Arrière-plan
            {
                name: 'hasBackground',
                label: 'Ajouter un arrière-plan',
                type: 'checkbox',
                defaultValue: this.defaultData.hasBackground
            },
            {
                name: 'backgroundColor',
                label: 'Couleur de fond',
                type: 'select',
                options: [
                    { value: 'transparent', label: 'Transparent' },
                    { value: 'primary', label: 'Vert EDS' },
                    { value: 'secondary', label: 'Gris' },
                    { value: 'success', label: 'Vert succès' },
                    { value: 'warning', label: 'Orange' },
                    { value: 'danger', label: 'Rouge' },
                    { value: 'custom', label: 'Personnalisée' }
                ],
                defaultValue: this.defaultData.backgroundColor,
                condition: { field: 'hasBackground', value: true }
            },
            {
                name: 'customBackgroundColor',
                label: 'Couleur de fond personnalisée',
                type: 'color',
                defaultValue: this.defaultData.customBackgroundColor,
                condition: { field: 'backgroundColor', value: 'custom' }
            },
            {
                name: 'backgroundOpacity',
                label: 'Transparence du fond (%)',
                type: 'range',
                min: 0,
                max: 100,
                step: 5,
                defaultValue: this.defaultData.backgroundOpacity,
                condition: { field: 'hasBackground', value: true }
            },
            
            // Section 4: Contour
            {
                name: 'hasBorder',
                label: 'Ajouter un contour',
                type: 'checkbox',
                defaultValue: this.defaultData.hasBorder
            },
            {
                name: 'borderColor',
                label: 'Couleur du contour',
                type: 'select',
                options: [
                    { value: 'primary', label: 'Vert EDS' },
                    { value: 'secondary', label: 'Gris' },
                    { value: 'success', label: 'Vert succès' },
                    { value: 'warning', label: 'Orange' },
                    { value: 'danger', label: 'Rouge' },
                    { value: 'custom', label: 'Personnalisée' }
                ],
                defaultValue: this.defaultData.borderColor,
                condition: { field: 'hasBorder', value: true }
            },
            {
                name: 'customBorderColor',
                label: 'Couleur de contour personnalisée',
                type: 'color',
                defaultValue: this.defaultData.customBorderColor,
                condition: { field: 'borderColor', value: 'custom' }
            },
            {
                name: 'borderWidth',
                label: 'Épaisseur du contour (px)',
                type: 'range',
                min: 1,
                max: 10,
                step: 1,
                defaultValue: this.defaultData.borderWidth,
                condition: { field: 'hasBorder', value: true }
            },
            {
                name: 'borderStyle',
                label: 'Style du contour',
                type: 'select',
                options: [
                    { value: 'solid', label: 'Solide' },
                    { value: 'dashed', label: 'Tirets' },
                    { value: 'dotted', label: 'Points' },
                    { value: 'double', label: 'Double' }
                ],
                defaultValue: this.defaultData.borderStyle,
                condition: { field: 'hasBorder', value: true }
            },
            
            // Section 5: Coins arrondis
            {
                name: 'hasRoundedCorners',
                label: 'Coins arrondis',
                type: 'checkbox',
                defaultValue: this.defaultData.hasRoundedCorners
            },
            {
                name: 'borderRadius',
                label: 'Niveau d\'arrondi (px)',
                type: 'range',
                min: 0,
                max: 50,
                step: 2,
                defaultValue: this.defaultData.borderRadius,
                condition: { field: 'hasRoundedCorners', value: true }
            },
            
            // Section 6: Espacement (Organisation)
            {
                name: 'paddingTop',
                label: 'Espacement haut',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun' },
                    { value: 'small', label: 'Petit' },
                    { value: 'medium', label: 'Moyen' },
                    { value: 'large', label: 'Grand' }
                ],
                defaultValue: this.defaultData.paddingTop
            },
            {
                name: 'paddingBottom',
                label: 'Espacement bas',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun' },
                    { value: 'small', label: 'Petit' },
                    { value: 'medium', label: 'Moyen' },
                    { value: 'large', label: 'Grand' }
                ],
                defaultValue: this.defaultData.paddingBottom
            },
            {
                name: 'paddingLeft',
                label: 'Espacement gauche',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun' },
                    { value: 'small', label: 'Petit' },
                    { value: 'medium', label: 'Moyen' },
                    { value: 'large', label: 'Grand' }
                ],
                defaultValue: this.defaultData.paddingLeft
            },
            {
                name: 'paddingRight',
                label: 'Espacement droite',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucun' },
                    { value: 'small', label: 'Petit' },
                    { value: 'medium', label: 'Moyen' },
                    { value: 'large', label: 'Grand' }
                ],
                defaultValue: this.defaultData.paddingRight
            },
            
            // Section 7: Marges
            {
                name: 'marginTop',
                label: 'Marge du haut',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucune' },
                    { value: 'small', label: 'Petite' },
                    { value: 'medium', label: 'Moyenne' },
                    { value: 'large', label: 'Grande' }
                ],
                defaultValue: this.defaultData.marginTop,
                help: 'Espace au-dessus du texte'
            },
            {
                name: 'marginBottom',
                label: 'Marge du bas',
                type: 'select',
                options: [
                    { value: 'none', label: 'Aucune' },
                    { value: 'small', label: 'Petite' },
                    { value: 'medium', label: 'Moyenne' },
                    { value: 'large', label: 'Grande' }
                ],
                defaultValue: this.defaultData.marginBottom,
                help: 'Espace en-dessous du texte'
            }
        ];
    }

    /**
     * Rôle : Comportement interactif du widget
     * Type : Interactive behavior - Événements et animations
     */
    attachBehavior(element, data) {
        // Animation d'apparition retardée - Staggered animation
        setTimeout(() => {
            element.style.animationDelay = '0.1s';
        }, 100);

        // Mise à jour temps réel du contenu - Live preview
        window.addEventListener('textUpdate', (event) => {
            if (event.detail.widgetId === this.id) {
                const newData = { ...data, ...event.detail.data };
                element.outerHTML = this.render(newData);
            }
        });

        // Effet hover subtil - Interaction feedback
        element.addEventListener('mouseenter', () => {
            if (!element.style.transform || element.style.transform === 'none') {
                element.style.transform = 'translateY(-1px)';
            }
        });

        element.addEventListener('mouseleave', () => {
            if (element.style.transform === 'translateY(-1px)') {
                element.style.transform = 'translateY(0)';
            }
        });
    }

    /**
     * Rôle : Validation des données du widget (Version étendue)
     * Type : Data validation - Contrôle complet
     */
    validate(data) {
        const errors = [];

        // Validation texte - Contenu obligatoire
        if (!data.text || data.text.trim() === '') {
            errors.push('Le texte ne peut pas être vide');
        }

        // Validation longueur - Limite raisonnable
        if (data.text && data.text.length > 2000) {
            errors.push('Le texte est trop long (maximum 2000 caractères)');
        }

        // Validation couleur personnalisée - Format hex
        if (data.textColor === 'custom' && data.customTextColor) {
            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexPattern.test(data.customTextColor)) {
                errors.push('La couleur personnalisée doit être au format hexadécimal (#000000)');
            }
        }

        // Validation couleur de fond personnalisée
        if (data.backgroundColor === 'custom' && data.customBackgroundColor) {
            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexPattern.test(data.customBackgroundColor)) {
                errors.push('La couleur de fond personnalisée doit être au format hexadécimal (#000000)');
            }
        }

        // Validation couleur de contour personnalisée
        if (data.borderColor === 'custom' && data.customBorderColor) {
            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexPattern.test(data.customBorderColor)) {
                errors.push('La couleur de contour personnalisée doit être au format hexadécimal (#000000)');
            }
        }

        // Validation des plages numériques
        if (data.backgroundOpacity < 0 || data.backgroundOpacity > 100) {
            errors.push('La transparence doit être comprise entre 0 et 100%');
        }

        if (data.borderWidth < 1 || data.borderWidth > 10) {
            errors.push('L\'épaisseur du contour doit être comprise entre 1 et 10px');
        }

        if (data.borderRadius < 0 || data.borderRadius > 50) {
            errors.push('L\'arrondi doit être compris entre 0 et 50px');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Rôle : Aperçu en mode édition
     * Type : Editor preview - Prévisualisation temps réel
     */
    getPreview(data) {
        const previewData = { ...this.defaultData, ...data };
        return this.render(previewData);
    }

    /**
     * Rôle : Configuration des données pour sauvegarde
     * Type : Data serialization - Export des données optimisé
     */
    serialize(data) {
        // Nettoyer les données pour sauvegarde
        const cleanData = { ...data };
        
        // Supprimer les champs vides ou par défaut pour optimiser
        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === this.defaultData[key]) {
                delete cleanData[key];
            }
        });

        return cleanData;
    }

    /**
     * Rôle : Définition des données nécessaires
     * Type : Data requirements - Définition des champs obligatoires
     */
    setData(data) {
        // Fusionner avec les données par défaut
        this.currentData = { ...this.defaultData, ...data };
        return this.currentData;
    }
}

// Export pour utilisation
export default TextSimpleWidget;
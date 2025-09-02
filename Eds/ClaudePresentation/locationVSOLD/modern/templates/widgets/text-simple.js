/**
 * ============================================================================
 * WIDGET TEXTE SIMPLE - Template et Logique
 * ============================================================================
 * 
 * Rôle : Widget de texte formaté avec styles visuels simples
 * Type : Widget contenu - Composant réutilisable pour texte
 * Usage : Utilisé pour ajouter du contenu textuel formaté dans les sections
 */

class TextSimpleWidget {
    constructor() {
        // Configuration : Propriétés du widget texte simple
        this.id = 'text-simple';
        this.name = 'Texte Simple';
        this.category = 'Contenu';
        this.icon = '📝';
        this.description = 'Texte formaté avec styles visuels';
        
        // Données par défaut - Configuration initiale
        this.defaultData = {
            text: 'Votre texte ici...',
            textType: 'paragraph', // paragraph, title, subtitle, quote, note
            size: 'medium', // small, medium, large, xlarge
            color: 'default', // default, primary, secondary, custom
            customColor: '#F8FAFC',
            alignment: 'left', // left, center, right
            isBold: false,
            isItalic: false,
            marginTop: 'medium', // none, small, medium, large
            marginBottom: 'medium'
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

        // Couleurs prédéfinies - Palette du thème
        this.colorPalette = {
            default: 'var(--text-white)',
            primary: 'var(--accent-green)',
            secondary: 'var(--text-gray)',
            muted: 'var(--text-muted)',
            success: 'var(--success-green)',
            warning: 'var(--warning-orange)',
            danger: 'var(--danger-red)'
        };

        // Espacements - Marges standardisées
        this.spacings = {
            none: '0',
            small: 'var(--spacing-sm)',
            medium: 'var(--spacing-md)',
            large: 'var(--spacing-lg)'
        };
    }

    /**
     * Rôle : Génération du template HTML
     * Type : Template rendering - HTML structure avec styles
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
     * Rôle : Génération des styles inline calculés
     * Type : Style computation - CSS dynamique
     * Retour : String CSS inline
     */
    generateInlineStyles(data) {
        // Style de base selon le type - Preset styles
        const baseStyle = this.stylePresets[data.textType];
        
        // Échelle de taille - Size multiplier
        const sizeMultiplier = this.sizeScale[data.size];
        
        // Couleur finale - Color resolution
        const finalColor = data.color === 'custom' ? 
            data.customColor : 
            this.colorPalette[data.color] || this.colorPalette.default;

        // Construction du style - Style assembly
        const styleRules = [
            `font-size: calc(${baseStyle.fontSize} * ${sizeMultiplier})`,
            `font-weight: ${baseStyle.fontWeight}`,
            `line-height: ${baseStyle.lineHeight}`,
            `font-family: ${baseStyle.fontFamily}`,
            `color: ${finalColor}`,
            `text-align: ${data.alignment}`,
            `margin-top: ${this.spacings[data.marginTop]}`,
            `margin-bottom: ${this.spacings[data.marginBottom]}`
        ];

        // Ajout conditionnel - Style additionnels
        if (data.isBold && data.textType !== 'title') {
            styleRules.push('font-weight: var(--font-bold)');
        }
        
        if (data.isItalic) {
            styleRules.push('font-style: italic');
        }

        if (baseStyle.fontStyle) {
            styleRules.push(`font-style: ${baseStyle.fontStyle}`);
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
     * Rôle : Styles CSS du composant
     * Type : Component styling - CSS classes
     * Retour : String CSS des styles
     */
    getStyles() {
        return `
            .text-simple-widget {
                transition: var(--transition-normal);
                cursor: default;
                word-wrap: break-word;
                hyphens: auto;
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

            /* Responsive - Ajustements mobiles */
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
            }

            /* Animation d'apparition */
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
        `;
    }

    /**
     * Rôle : Configuration des champs éditables
     * Type : Editor configuration - Interface utilisateur
     * Retour : Array des champs avec interface visuelle
     */
    getEditableFields() {
        return [
            // Section 1 : Contenu
            {
                section: 'Contenu',
                fields: [
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
                    }
                ]
            },
            
            // Section 2 : Apparence
            {
                section: 'Apparence',
                fields: [
                    {
                        name: 'size',
                        label: 'Taille',
                        type: 'range',
                        min: 0,
                        max: 3,
                        step: 1,
                        options: [
                            { value: 'small', label: 'Petit' },
                            { value: 'medium', label: 'Moyen' },
                            { value: 'large', label: 'Grand' },
                            { value: 'xlarge', label: 'Très grand' }
                        ],
                        defaultValue: this.defaultData.size,
                        preview: true,
                        help: 'Ajustez la taille du texte'
                    },
                    {
                        name: 'color',
                        label: 'Couleur',
                        type: 'color-palette',
                        palette: [
                            { value: 'default', label: 'Blanc', color: '#F8FAFC' },
                            { value: 'primary', label: 'Vert EDS', color: '#10B981' },
                            { value: 'secondary', label: 'Gris', color: '#CBD5E1' },
                            { value: 'muted', label: 'Gris clair', color: '#94A3B8' },
                            { value: 'success', label: 'Vert succès', color: '#059669' },
                            { value: 'warning', label: 'Orange', color: '#F59E0B' },
                            { value: 'danger', label: 'Rouge', color: '#EF4444' }
                        ],
                        customColor: true,
                        customField: 'customColor',
                        defaultValue: this.defaultData.color,
                        help: 'Sélectionnez une couleur prédéfinie ou personnalisée'
                    },
                    {
                        name: 'alignment',
                        label: 'Alignement',
                        type: 'button-group',
                        options: [
                            { value: 'left', label: '◀', title: 'Aligné à gauche' },
                            { value: 'center', label: '■', title: 'Centré' },
                            { value: 'right', label: '▶', title: 'Aligné à droite' }
                        ],
                        defaultValue: this.defaultData.alignment,
                        help: 'Choisissez l\'alignement du texte'
                    }
                ]
            },

            // Section 3 : Style
            {
                section: 'Style',
                fields: [
                    {
                        name: 'isBold',
                        label: 'Texte en gras',
                        type: 'toggle',
                        icon: '📝',
                        defaultValue: this.defaultData.isBold,
                        help: 'Rendre le texte plus épais'
                    },
                    {
                        name: 'isItalic',
                        label: 'Texte en italique',
                        type: 'toggle',
                        icon: '🌟',
                        defaultValue: this.defaultData.isItalic,
                        help: 'Incliner le texte'
                    }
                ]
            },

            // Section 4 : Espacement
            {
                section: 'Espacement',
                fields: [
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
                ]
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
            element.style.transform = 'translateY(-1px)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translateY(0)';
        });
    }

    /**
     * Rôle : Validation des données du widget
     * Type : Data validation - Contrôle basique
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
        if (data.color === 'custom' && data.customColor) {
            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexPattern.test(data.customColor)) {
                errors.push('La couleur personnalisée doit être au format hexadécimal (#000000)');
            }
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
     * Type : Data serialization - Export des données
     */
    serialize(data) {
        // Nettoyer les données pour sauvegarde
        const cleanData = { ...data };
        
        // Supprimer les champs vides ou par défaut
        Object.keys(cleanData).forEach(key => {
            if (cleanData[key] === this.defaultData[key]) {
                delete cleanData[key];
            }
        });

        return cleanData;
    }
}

// Export pour utilisation
export default TextSimpleWidget;
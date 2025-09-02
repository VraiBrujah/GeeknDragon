/**
 * ============================================================================
 * SECTION HERO - Template et Composition
 * ============================================================================
 * 
 * Rôle : Section hero complète avec titre, description et showcase produit
 * Type : Section template - Composition de widgets
 * Usage : Section d'accueil principale pour présentations
 */

class HeroSection {
    constructor() {
        // Configuration : Propriétés de la section hero
        this.id = 'hero-section';
        this.name = 'Section Hero';
        this.category = 'presentation';
        this.icon = '🚀';
        this.description = 'Section d\'accueil avec titre, description et visuel produit';
        
        // Widgets inclus - Composition modulaire
        this.allowedWidgets = [
            'hero-title',
            'text-simple',
            'logo',
            'pricing-card'
        ];
        
        // Configuration par défaut - Structure de base
        this.defaultConfig = {
            layout: 'two-columns',
            alignment: 'center',
            background: 'gradient',
            spacing: 'large',
            animation: true
        };

        // Widgets par défaut - Contenu initial
        this.defaultWidgets = [
            {
                type: 'hero-title',
                data: {
                    title: 'Li-CUBE PRO™',
                    subtitle: 'LOCATION INTELLIGENTE<br>ZÉRO RISQUE'
                },
                order: 1
            },
            {
                type: 'text-simple',
                data: {
                    text: '<strong>Pourquoi prendre des risques ?</strong> Louez votre Li-CUBE PRO™ et bénéficiez d\'une maintenance complète, d\'un monitoring 24/7 et d\'une garantie totale.'
                },
                order: 2
            },
            {
                type: 'logo',
                data: {
                    imagePath: './images/Li-CUBE PRO.png',
                    altText: 'Li-CUBE PRO™',
                    width: 300,
                    height: 300
                },
                order: 3
            }
        ];
    }

    /**
     * Rôle : Génération du template HTML complet
     * Type : Section rendering - Structure avec widgets
     * Retour : String HTML de la section hero
     */
    render(widgets = [], config = {}) {
        // Fusion configuration - Combine default et personnalisé
        const sectionConfig = { ...this.defaultConfig, ...config };
        
        // Tri des widgets - Ordre d'affichage
        const sortedWidgets = [...widgets].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Classes CSS - Construction selon configuration
        const sectionClass = `hero-section section ${sectionConfig.layout} ${sectionConfig.alignment}`;
        const containerClass = `hero-container container ${sectionConfig.spacing}`;

        // Rendu des widgets - Génération HTML
        const widgetsHtml = sortedWidgets.map(widget => 
            this.renderWidget(widget)
        ).join('');

        return `
            <section class="${sectionClass}" 
                     data-section="hero-section"
                     data-layout="${sectionConfig.layout}"
                     data-animation="${sectionConfig.animation}">
                
                <div class="${containerClass}">
                    <div class="hero-content">
                        <div class="hero-text-column">
                            ${this.renderTextWidgets(sortedWidgets)}
                        </div>
                        
                        <div class="hero-visual-column">
                            ${this.renderVisualWidgets(sortedWidgets)}
                        </div>
                    </div>
                </div>
                
                <!-- Indicateur d'édition pour la section -->
                <div class="section-editor-tools">
                    <button class="section-edit-btn" data-section="hero">
                        <i class="fas fa-edit"></i>
                        Éditer Section
                    </button>
                </div>
            </section>
        `;
    }

    /**
     * Rôle : Rendu des widgets textuels
     * Type : Widget filtering - Widgets de contenu texte
     * Retour : HTML des widgets texte
     */
    renderTextWidgets(widgets) {
        const textWidgets = widgets.filter(w =>
            ['hero-title', 'text-simple'].includes(w.type)
        );

        return textWidgets.map(widget => this.renderWidget(widget)).join('');
    }

    /**
     * Rôle : Rendu des widgets visuels
     * Type : Widget filtering - Widgets graphiques
     * Retour : HTML des widgets visuels
     */
    renderVisualWidgets(widgets) {
        const visualWidgets = widgets.filter(w =>
            ['logo', 'pricing-card'].includes(w.type)
        );

        return visualWidgets.map(widget => this.renderWidget(widget)).join('');
    }

    /**
     * Rôle : Rendu d'un widget individuel
     * Type : Widget rendering - Template de widget
     * Retour : HTML du widget spécifique
     */
    renderWidget(widget) {
        // Import dynamique du widget - Chargement à la demande
        const widgetClass = this.getWidgetClass(widget.type);
        if (!widgetClass) {
            return `<div class="widget-error">Widget "${widget.type}" non trouvé</div>`;
        }

        const widgetInstance = new widgetClass();
        return `
            <div class="widget-container" 
                 data-widget="${widget.type}"
                 data-widget-id="${widget.id || this.generateWidgetId()}">
                ${widgetInstance.render(widget.data)}
            </div>
        `;
    }

    /**
     * Rôle : Styles CSS spécifiques à la section hero
     * Type : Section styling - CSS layout et composants
     * Retour : String CSS de la section
     */
    getStyles() {
        return `
            .hero-section {
                min-height: 100vh;
                display: flex;
                align-items: center;
                background: var(--gradient-hero);
                position: relative;
                overflow: hidden;
                padding: var(--spacing-3xl) 0;
            }

            .hero-section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
                pointer-events: none;
            }

            .hero-container {
                position: relative;
                z-index: 2;
                width: 100%;
            }

            .hero-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: var(--spacing-3xl);
                align-items: center;
                min-height: 80vh;
            }

            .hero-text-column {
                display: flex;
                flex-direction: column;
                gap: var(--spacing-2xl);
                justify-content: center;
            }

            .hero-visual-column {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }

            /* Layouts alternatifs */
            .hero-section.single-column .hero-content {
                grid-template-columns: 1fr;
                text-align: center;
                max-width: 800px;
                margin: 0 auto;
            }

            .hero-section.visual-first .hero-content {
                grid-template-columns: 1fr 1fr;
            }

            .hero-section.visual-first .hero-visual-column {
                order: -1;
            }

            /* Alignements */
            .hero-section.left .hero-text-column {
                text-align: left;
            }

            .hero-section.center .hero-text-column {
                text-align: center;
            }

            .hero-section.right .hero-text-column {
                text-align: right;
            }

            /* Espacements */
            .hero-container.compact {
                padding: var(--spacing-xl) 0;
            }

            .hero-container.large {
                padding: var(--spacing-3xl) 0;
            }

            .hero-container.huge {
                padding: calc(var(--spacing-3xl) * 1.5) 0;
            }

            /* Conteneurs de widgets */
            .widget-container {
                position: relative;
                transition: var(--transition-normal);
            }

            .widget-container:hover {
                transform: translateY(-2px);
            }

            .widget-error {
                background: rgba(239, 68, 68, 0.1);
                color: var(--danger-red);
                border: 1px dashed var(--danger-red);
                border-radius: var(--border-radius);
                padding: var(--spacing-md);
                text-align: center;
                font-family: var(--font-mono);
                font-size: var(--text-sm);
            }

            /* Outils d'édition de section */
            .section-editor-tools {
                position: absolute;
                top: var(--spacing-lg);
                right: var(--spacing-lg);
                z-index: 10;
                opacity: 0;
                transition: var(--transition-normal);
            }

            .hero-section:hover .section-editor-tools {
                opacity: 1;
            }

            .section-edit-btn {
                background: var(--accent-green);
                color: var(--text-white);
                border: none;
                border-radius: var(--border-radius);
                padding: var(--spacing-sm) var(--spacing-md);
                font-size: var(--text-sm);
                font-weight: var(--font-medium);
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: var(--spacing-xs);
                transition: var(--transition-normal);
                backdrop-filter: blur(10px);
            }

            .section-edit-btn:hover {
                background: var(--accent-teal);
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            /* Animations d'entrée */
            .hero-section[data-animation="true"] .widget-container {
                opacity: 0;
                transform: translateY(30px);
                animation: heroWidgetAppear 0.8s ease-out forwards;
            }

            .hero-section[data-animation="true"] .widget-container:nth-child(1) {
                animation-delay: 0.2s;
            }

            .hero-section[data-animation="true"] .widget-container:nth-child(2) {
                animation-delay: 0.4s;
            }

            .hero-section[data-animation="true"] .widget-container:nth-child(3) {
                animation-delay: 0.6s;
            }

            @keyframes heroWidgetAppear {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Responsive - Adaptations mobiles */
            @media (max-width: 1024px) {
                .hero-content {
                    grid-template-columns: 1fr;
                    gap: var(--spacing-2xl);
                    text-align: center;
                }

                .hero-visual-column {
                    order: -1;
                    margin-bottom: var(--spacing-lg);
                }

                .hero-section {
                    min-height: auto;
                    padding: var(--spacing-2xl) 0;
                }
            }

            @media (max-width: 768px) {
                .hero-text-column {
                    gap: var(--spacing-lg);
                }

                .section-editor-tools {
                    position: static;
                    text-align: center;
                    margin-top: var(--spacing-lg);
                    opacity: 1;
                }
            }
        `;
    }

    /**
     * Rôle : Configuration des options de la section
     * Type : Section config - Paramètres éditables
     * Retour : Array des options configurables
     */
    getConfigOptions() {
        return [
            {
                id: 'layout',
                name: 'Disposition',
                type: 'select',
                options: [
                    { value: 'two-columns', label: 'Deux colonnes' },
                    { value: 'single-column', label: 'Une colonne' },
                    { value: 'visual-first', label: 'Visuel en premier' }
                ],
                default: 'two-columns',
                description: 'Organisation des éléments de la section'
            },
            {
                id: 'alignment',
                name: 'Alignement du texte',
                type: 'select',
                options: [
                    { value: 'left', label: 'Gauche' },
                    { value: 'center', label: 'Centré' },
                    { value: 'right', label: 'Droite' }
                ],
                default: 'center',
                description: 'Alignement du contenu textuel'
            },
            {
                id: 'spacing',
                name: 'Espacement',
                type: 'select',
                options: [
                    { value: 'compact', label: 'Compact' },
                    { value: 'large', label: 'Large' },
                    { value: 'huge', label: 'Très large' }
                ],
                default: 'large',
                description: 'Espacement vertical de la section'
            },
            {
                id: 'background',
                name: 'Arrière-plan',
                type: 'select',
                options: [
                    { value: 'gradient', label: 'Dégradé' },
                    { value: 'solid', label: 'Couleur unie' },
                    { value: 'image', label: 'Image' },
                    { value: 'video', label: 'Vidéo' }
                ],
                default: 'gradient',
                description: 'Type d\'arrière-plan de la section'
            },
            {
                id: 'animation',
                name: 'Animations',
                type: 'checkbox',
                default: true,
                description: 'Activer les animations d\'entrée'
            }
        ];
    }

    /**
     * Rôle : Gestion des widgets de la section
     * Type : Widget management - CRUD widgets
     */
    getWidgetManager() {
        return {
            add: (widgetType, data = {}, order = null) => {
                if (!this.allowedWidgets.includes(widgetType)) {
                    throw new Error(`Widget ${widgetType} non autorisé dans cette section`);
                }

                return {
                    id: this.generateWidgetId(),
                    type: widgetType,
                    data: data,
                    order: order || this.getNextOrder()
                };
            },

            remove: (widgets, widgetId) => {
                return widgets.filter(w => w.id !== widgetId);
            },

            update: (widgets, widgetId, newData) => {
                return widgets.map(w => 
                    w.id === widgetId ? { ...w, data: { ...w.data, ...newData } } : w
                );
            },

            reorder: (widgets, draggedId, targetId) => {
                const draggedIndex = widgets.findIndex(w => w.id === draggedId);
                const targetIndex = widgets.findIndex(w => w.id === targetId);
                
                if (draggedIndex === -1 || targetIndex === -1) return widgets;

                const newWidgets = [...widgets];
                const [removed] = newWidgets.splice(draggedIndex, 1);
                newWidgets.splice(targetIndex, 0, removed);

                // Réassigner les ordres
                newWidgets.forEach((widget, index) => {
                    widget.order = index + 1;
                });

                return newWidgets;
            }
        };
    }

    /**
     * Rôle : Utilitaires pour les widgets
     * Type : Widget utilities - Fonctions d'aide
     */
    generateWidgetId() {
        return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    getNextOrder() {
        return Date.now();
    }

    getWidgetClass(widgetType) {
        // Mapping des types vers les classes
        const widgetMap = {
            'hero-title': 'HeroTitleWidget',
            'text-simple': 'TextSimpleWidget',
            'logo': 'LogoWidget',
            'pricing-card': 'PricingCardWidget'
        };

        // Import dynamique (à implémenter selon le système de modules)
        const className = widgetMap[widgetType];
        if (className && window[className]) {
            return window[className];
        }

        return null;
    }

    /**
     * Rôle : Validation de la configuration de section
     * Type : Section validation - Contrôles
     */
    validate(widgets, config) {
        const errors = [];

        // Validation widgets - Types autorisés
        widgets.forEach((widget, index) => {
            if (!this.allowedWidgets.includes(widget.type)) {
                errors.push(`Widget ${widget.type} à l'index ${index} non autorisé dans cette section`);
            }
        });

        // Validation configuration - Options valides
        if (config.layout && !['two-columns', 'single-column', 'visual-first'].includes(config.layout)) {
            errors.push('Layout de section invalide');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Export pour utilisation
export default HeroSection;
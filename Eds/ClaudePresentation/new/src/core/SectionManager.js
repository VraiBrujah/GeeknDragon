/**
 * Gestionnaire centralisé des sections de présentation
 * 
 * Rôle : Gère la création, organisation et rendu des sections de présentation
 * Type : Classe de gestion des sections templates et leur assemblage
 * Responsabilité : Catalogue de sections, génération HTML, templates prédéfinis
 */
class SectionManager {
    constructor() {
        // Rôle : Catalogue des templates de sections disponibles
        // Type : Map<String, Object> (registre des sections templates)
        // Unité : Sans unité
        // Domaine : Paires (nom_section, définition_template)
        // Formule : Map avec clés = types section, valeurs = configurations
        // Exemple : {'hero': {widgets: [...], styles: {...}}, 'pricing': {...}}
        this.sectionTemplates = new Map();

        // Rôle : Cache des instances de sections créées
        // Type : Map<String, Object> (instances de sections)
        // Unité : Sans unité
        // Domaine : Paires (section_id, instance_section)
        // Formule : Cache pour performance et réutilisation
        // Exemple : {'section-hero-123': {id, type, widgets, styles}, ...}
        this.sectionCache = new Map();

        // Rôle : Statistiques d'utilisation des types de sections
        // Type : Map<String, Number> (compteurs d'usage)
        // Unité : Sans unité (nombre d'utilisations)
        // Domaine : Paires (type_section, nb_utilisations)
        // Formule : Incrémentation à chaque création de section
        // Exemple : {'hero': 15, 'pricing': 8, 'contact': 12}
        this.usageStats = new Map();

        // Rôle : Configuration des styles globaux par défaut
        // Type : Object (styles CSS par défaut)
        // Unité : Unités CSS appropriées
        // Domaine : Propriétés CSS valides
        // Formule : Styles de base pour toutes les sections
        // Exemple : {padding: '6rem 2rem', margin: '0 auto', maxWidth: '1400px'}
        this.defaultSectionStyles = {
            padding: '6rem 2rem 4rem',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            minHeight: '100vh'
        };

        // Rôle : Référence au gestionnaire de widgets pour création
        // Type : WidgetManager (référence vers instance)
        // Unité : Sans unité
        // Domaine : Instance valide de WidgetManager
        // Formule : Référence injectée lors de l'initialisation
        // Exemple : Instance du WidgetManager pour créer les widgets des sections
        this.widgetManager = null;

        console.log('📄 SectionManager initialisé');
    }

    /**
     * Initialise le gestionnaire avec référence au WidgetManager
     * 
     * @param {WidgetManager} widgetManager - Instance du gestionnaire de widgets
     */
    init(widgetManager) {
        this.widgetManager = widgetManager;
        console.log('🔗 SectionManager connecté au WidgetManager');
    }

    /**
     * Charge les sections par défaut du système
     * 
     * Rôle : Initialisation du catalogue avec sections de base Li-CUBE PRO
     * Type : Méthode d'initialisation asynchrone
     * Effet de bord : Remplit le registre avec les sections essentielles
     */
    async loadDefaultSections() {
        console.log('🔄 Chargement des sections par défaut...');

        try {
            // Chargement des sections basées sur location.html
            this.loadHeroSection();
            this.loadPricingSection();
            this.loadAdvantagesSection();
            this.loadTechnicalComparisonSection();
            this.loadConclusionSection();
            this.loadContactSection();

            // Sections génériques additionnelles
            this.loadGenericSections();

            console.log(`✅ ${this.sectionTemplates.size} templates de sections chargés`);
        } catch (error) {
            console.error('❌ Erreur chargement sections par défaut:', error);
            throw error;
        }
    }

    /**
     * Charge la section Hero (page d'accueil principale)
     */
    loadHeroSection() {
        const heroTemplate = {
            id: 'hero',
            name: 'Section Hero',
            description: 'Section d\'accueil principale avec titre, sous-titre et image',
            category: 'presentation',
            
            // Rôle : Configuration des styles spécifiques à la section Hero
            // Type : Object (styles CSS)
            // Unité : Unités CSS appropriées
            // Domaine : Propriétés CSS valides pour section d'accueil
            // Formule : Styles optimisés pour impact visuel maximum
            // Exemple : Dégradé de fond, centrage, espacement généreux
            styles: {
                ...this.defaultSectionStyles,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
                position: 'relative',
                overflow: 'hidden'
            },

            // Rôle : Structure des widgets composant la section Hero
            // Type : Array<Object> (définitions de widgets)
            // Unité : Sans unité
            // Domaine : Configurations de widgets valides
            // Formule : Liste ordonnée des composants de la section
            // Exemple : Titre principal + sous-titre + bouton + image
            widgets: [
                {
                    type: 'text',
                    template: 'hero-title',
                    data: {
                        text: 'Li-CUBE PRO™',
                        tag: 'h1'
                    },
                    styles: {
                        fontSize: '4.5rem',
                        fontWeight: '900',
                        color: '#10B981',
                        textAlign: 'center',
                        marginBottom: '2rem'
                    },
                    attributes: {
                        'data-field': 'hero-title'
                    }
                },
                {
                    type: 'text',
                    template: 'hero-subtitle',
                    data: {
                        text: 'LOCATION INTELLIGENTE ZÉRO RISQUE',
                        tag: 'h2'
                    },
                    styles: {
                        fontSize: '2rem',
                        fontWeight: '600',
                        color: '#F8FAFC',
                        textAlign: 'center',
                        marginBottom: '2rem'
                    },
                    attributes: {
                        'data-field': 'hero-subtitle'
                    }
                },
                {
                    type: 'text',
                    template: 'hero-description',
                    data: {
                        text: 'Pourquoi prendre des risques ? Louez votre Li-CUBE PRO™ et laissez EDS gérer tout ! Performance garantie, maintenance incluse, remplacement immédiat en cas de problème.',
                        tag: 'p'
                    },
                    styles: {
                        fontSize: '1.4rem',
                        color: '#CBD5E1',
                        textAlign: 'center',
                        lineHeight: '1.7',
                        marginBottom: '3rem',
                        maxWidth: '800px',
                        margin: '0 auto 3rem'
                    },
                    attributes: {
                        'data-field': 'hero-description'
                    }
                },
                {
                    type: 'button',
                    data: {
                        text: 'ARGUMENTS DE CLOSING - 150-200$/MOIS',
                        action: 'link',
                        href: '#contact',
                        icon: 'fas fa-handshake'
                    },
                    styles: {
                        background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                        color: 'white',
                        padding: '1.2rem 2.5rem',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
                        margin: '0 auto 3rem'
                    },
                    attributes: {
                        'data-field': 'cta-text'
                    }
                },
                {
                    type: 'image',
                    template: 'hero-image',
                    data: {
                        src: './images/Li-CUBE PRO.png',
                        alt: 'Li-CUBE PRO - Batterie lithium intelligente',
                        objectFit: 'contain',
                        width: 500,
                        height: 400
                    },
                    styles: {
                        width: '500px',
                        height: '400px',
                        borderRadius: '24px',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.5)',
                        animation: 'float 6s ease-in-out infinite',
                        border: '3px solid rgba(16, 185, 129, 0.3)'
                    },
                    attributes: {
                        'data-image-field': 'product-image-path'
                    }
                }
            ],

            // Rôle : Layout de la section (organisation spatiale)
            // Type : Object (configuration de mise en page)
            // Unité : Sans unité
            // Domaine : Propriétés de layout CSS Grid/Flexbox
            // Formule : Configuration responsive pour différents écrans
            // Exemple : Grid 2 colonnes sur desktop, 1 colonne sur mobile
            layout: {
                type: 'grid',
                columns: 2,
                gap: '4rem',
                alignItems: 'center',
                responsive: {
                    mobile: {
                        columns: 1,
                        textAlign: 'center'
                    }
                }
            }
        };

        this.sectionTemplates.set('hero', heroTemplate);
        this.usageStats.set('hero', 0);
    }

    /**
     * Charge la section Pricing (tarification)
     */
    loadPricingSection() {
        const pricingTemplate = {
            id: 'pricing',
            name: 'Section Tarifs',
            description: 'Section de tarification avec cartes de prix',
            category: 'commerce',
            
            styles: {
                ...this.defaultSectionStyles,
                background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
            },

            widgets: [
                {
                    type: 'text',
                    template: 'section-title',
                    data: {
                        text: 'TARIFS DE LOCATION TRANSPARENTS',
                        tag: 'h2'
                    },
                    styles: {
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                        '-webkit-background-clip': 'text',
                        '-webkit-text-fill-color': 'transparent'
                    },
                    attributes: {
                        'data-field': 'pricing-title'
                    }
                },
                {
                    type: 'text',
                    data: {
                        text: 'Prix tout inclus, sans surprise. Plus vous louez longtemps, moins vous payez !',
                        tag: 'p'
                    },
                    styles: {
                        fontSize: '1.2rem',
                        color: '#CBD5E1',
                        textAlign: 'center',
                        marginBottom: '3rem'
                    },
                    attributes: {
                        'data-field': 'pricing-subtitle'
                    }
                }
            ],

            layout: {
                type: 'flex',
                direction: 'column',
                alignItems: 'center'
            }
        };

        this.sectionTemplates.set('pricing', pricingTemplate);
        this.usageStats.set('pricing', 0);
    }

    /**
     * Charge la section Advantages (avantages)
     */
    loadAdvantagesSection() {
        const advantagesTemplate = {
            id: 'advantages',
            name: 'Section Avantages',
            description: 'Section présentant les avantages du produit/service',
            category: 'presentation',
            
            styles: {
                ...this.defaultSectionStyles,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
            },

            widgets: [
                {
                    type: 'text',
                    template: 'section-title',
                    data: {
                        text: 'POURQUOI CHOISIR LA LOCATION ?',
                        tag: 'h2'
                    },
                    styles: {
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                        '-webkit-background-clip': 'text',
                        '-webkit-text-fill-color': 'transparent'
                    },
                    attributes: {
                        'data-field': 'advantages-title'
                    }
                }
            ],

            layout: {
                type: 'flex',
                direction: 'column'
            }
        };

        this.sectionTemplates.set('advantages', advantagesTemplate);
        this.usageStats.set('advantages', 0);
    }

    /**
     * Charge la section de comparaison technique
     */
    loadTechnicalComparisonSection() {
        const technicalTemplate = {
            id: 'technical-comparison',
            name: 'Comparaison Technique',
            description: 'Section de comparaison technique détaillée',
            category: 'comparison',
            
            styles: {
                ...this.defaultSectionStyles,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
            },

            widgets: [
                {
                    type: 'text',
                    template: 'section-title',
                    data: {
                        text: 'Li-CUBE PRO™ vs BATTERIES Ni-Cd OBSOLÈTES',
                        tag: 'h2'
                    },
                    styles: {
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                        '-webkit-background-clip': 'text',
                        '-webkit-text-fill-color': 'transparent'
                    },
                    attributes: {
                        'data-field': 'tech-title'
                    }
                }
            ],

            layout: {
                type: 'grid',
                columns: 3,
                gap: '3rem',
                alignItems: 'start'
            }
        };

        this.sectionTemplates.set('technical-comparison', technicalTemplate);
        this.usageStats.set('technical-comparison', 0);
    }

    /**
     * Charge la section de conclusion
     */
    loadConclusionSection() {
        const conclusionTemplate = {
            id: 'conclusion',
            name: 'Section Conclusion',
            description: 'Section de conclusion avec appel à l\'action final',
            category: 'closing',
            
            styles: {
                ...this.defaultSectionStyles,
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #1A202C 100%)',
                textAlign: 'center'
            },

            widgets: [
                {
                    type: 'text',
                    template: 'section-title',
                    data: {
                        text: 'LE CHOIX EST ÉVIDENT',
                        tag: 'h2'
                    },
                    styles: {
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        textAlign: 'center',
                        marginBottom: '3rem',
                        background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                        '-webkit-background-clip': 'text',
                        '-webkit-text-fill-color': 'transparent'
                    },
                    attributes: {
                        'data-field': 'final-title'
                    }
                }
            ],

            layout: {
                type: 'flex',
                direction: 'column',
                alignItems: 'center'
            }
        };

        this.sectionTemplates.set('conclusion', conclusionTemplate);
        this.usageStats.set('conclusion', 0);
    }

    /**
     * Charge la section Contact
     */
    loadContactSection() {
        const contactTemplate = {
            id: 'contact',
            name: 'Section Contact',
            description: 'Section de contact avec informations et formulaire',
            category: 'contact',
            
            styles: {
                ...this.defaultSectionStyles,
                background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                color: 'white',
                textAlign: 'center'
            },

            widgets: [
                {
                    type: 'text',
                    data: {
                        text: 'LOUEZ VOTRE Li-CUBE PRO™ MAINTENANT',
                        tag: 'h2'
                    },
                    styles: {
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '2rem',
                        color: 'white'
                    },
                    attributes: {
                        'data-field': 'contact-title'
                    }
                },
                {
                    type: 'text',
                    data: {
                        text: 'Zéro risque, zéro surprise, performance maximale garantie',
                        tag: 'p'
                    },
                    styles: {
                        fontSize: '1.3rem',
                        marginBottom: '2rem',
                        opacity: '0.95'
                    },
                    attributes: {
                        'data-field': 'contact-subtitle'
                    }
                }
            ],

            layout: {
                type: 'flex',
                direction: 'column',
                alignItems: 'center'
            }
        };

        this.sectionTemplates.set('contact', contactTemplate);
        this.usageStats.set('contact', 0);
    }

    /**
     * Charge des sections génériques additionnelles
     */
    loadGenericSections() {
        // Section générique simple
        const genericSection = {
            id: 'generic',
            name: 'Section Générique',
            description: 'Section vide à personnaliser',
            category: 'generic',
            
            styles: this.defaultSectionStyles,
            widgets: [],
            layout: {
                type: 'flex',
                direction: 'column'
            }
        };

        this.sectionTemplates.set('generic', genericSection);
        this.usageStats.set('generic', 0);
    }

    /**
     * Crée une nouvelle instance de section
     * 
     * @param {string} templateName - Nom du template de section
     * @param {Object} customizations - Personnalisations à appliquer
     * @returns {Object} Instance de section créée
     */
    createSection(templateName, customizations = {}) {
        // Vérification existence du template
        const template = this.sectionTemplates.get(templateName);
        if (!template) {
            throw new Error(`Template de section inconnu: ${templateName}`);
        }

        try {
            // Rôle : Identifiant unique de la nouvelle section
            // Type : String (UUID de section)
            // Unité : Sans unité
            // Domaine : Chaîne alphanumérique unique
            // Formule : 'section-' + template + '-' + timestamp + '-' + random
            // Exemple : 'section-hero-1704890400123-xyz'
            const sectionId = customizations.id || 
                `section-${templateName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Rôle : Configuration complète de la section
            // Type : Object (définition complète de section)
            // Unité : Sans unité
            // Domaine : Configuration fusionnant template + personnalisations
            // Formule : {...template, ...customizations} avec merge profond
            // Exemple : Template hero + couleurs personnalisées
            const section = {
                id: sectionId,
                type: templateName,
                name: customizations.name || template.name,
                description: customizations.description || template.description,
                category: customizations.category || template.category,
                
                // Fusion des styles
                styles: { ...template.styles, ...customizations.styles },
                
                // Configuration du layout
                layout: { ...template.layout, ...customizations.layout },
                
                // Widgets de la section (créés via WidgetManager si disponible)
                widgets: [],
                
                // Métadonnées
                metadata: {
                    templateUsed: templateName,
                    created: new Date().toISOString(),
                    modified: new Date().toISOString(),
                    version: '1.0.0',
                    ...customizations.metadata
                }
            };

            // Création des widgets de la section
            if (this.widgetManager && template.widgets) {
                section.widgets = this.createSectionWidgets(template.widgets, customizations.widgets || []);
            }

            // Ajout au cache
            this.sectionCache.set(sectionId, section);

            // Mise à jour des statistiques
            const currentUsage = this.usageStats.get(templateName) || 0;
            this.usageStats.set(templateName, currentUsage + 1);

            console.log(`📄 Section créée: ${templateName} (${sectionId})`);
            return section;
        } catch (error) {
            console.error(`❌ Erreur création section '${templateName}':`, error);
            throw error;
        }
    }

    /**
     * Crée les widgets d'une section
     * 
     * @param {Array} templateWidgets - Définitions des widgets du template
     * @param {Array} customWidgets - Widgets personnalisés additionnels
     * @returns {Array} Widgets créés
     */
    createSectionWidgets(templateWidgets, customWidgets = []) {
        const widgets = [];

        // Création des widgets du template
        templateWidgets.forEach((widgetDef, index) => {
            try {
                // Recherche de personnalisation pour ce widget
                const customization = customWidgets.find(cw => cw.index === index) || {};
                
                // Configuration finale du widget
                const widgetConfig = {
                    ...widgetDef,
                    data: { ...widgetDef.data, ...customization.data },
                    styles: { ...widgetDef.styles, ...customization.styles },
                    attributes: { ...widgetDef.attributes, ...customization.attributes }
                };

                // Création via WidgetManager
                const widget = this.widgetManager.createWidget(widgetDef.type, widgetConfig);
                widgets.push(widget);
            } catch (error) {
                console.warn(`⚠️ Erreur création widget ${index} de section:`, error);
            }
        });

        // Ajout des widgets personnalisés supplémentaires
        customWidgets.forEach(customWidget => {
            if (customWidget.index === undefined) {
                // Nouveau widget à ajouter
                try {
                    const widget = this.widgetManager.createWidget(customWidget.type, customWidget);
                    widgets.push(widget);
                } catch (error) {
                    console.warn('⚠️ Erreur ajout widget personnalisé:', error);
                }
            }
        });

        return widgets;
    }

    /**
     * Génère le HTML d'une section
     * 
     * @param {Object} section - Instance de section
     * @param {Object} renderOptions - Options de rendu
     * @returns {string} HTML de la section
     */
    renderSection(section, renderOptions = {}) {
        if (!section) {
            throw new Error('Section requise pour rendu');
        }

        try {
            // Rôle : Classes CSS de la section
            // Type : String (classes séparées par espaces)
            // Unité : Sans unité
            // Domaine : Classes CSS valides
            // Formule : Classes de base + type + état + options
            // Exemple : 'section hero-section editable'
            const cssClasses = [
                'section',
                `${section.type}-section`,
                section.metadata?.editable !== false ? 'editable' : '',
                renderOptions.preview ? 'preview-mode' : 'normal-mode'
            ].filter(Boolean).join(' ');

            // Génération des styles CSS inline
            const sectionStyles = Object.entries(section.styles || {})
                .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
                .join('; ');

            // Rendu des widgets de la section
            let widgetsHTML = '';
            if (section.widgets && section.widgets.length > 0) {
                widgetsHTML = section.widgets
                    .map(widget => widget.render(renderOptions))
                    .join('\n');
            }

            // Application du layout si défini
            if (section.layout && section.layout.type === 'grid') {
                widgetsHTML = this.wrapWithGridLayout(widgetsHTML, section.layout);
            } else if (section.layout && section.layout.type === 'flex') {
                widgetsHTML = this.wrapWithFlexLayout(widgetsHTML, section.layout);
            }

            // Génération du HTML final de la section
            return `
                <section 
                    id="${section.id}" 
                    class="${cssClasses}" 
                    style="${sectionStyles}"
                    data-section-type="${section.type}"
                    data-section-id="${section.id}"
                >
                    <div class="container">
                        ${widgetsHTML}
                    </div>
                </section>
            `;
        } catch (error) {
            console.error(`❌ Erreur rendu section '${section.id}':`, error);
            return `<section class="section error-section">
                <div class="container">
                    <p class="error-message">Erreur de rendu de la section</p>
                </div>
            </section>`;
        }
    }

    /**
     * Enveloppe le contenu avec un layout CSS Grid
     * 
     * @param {string} content - Contenu HTML
     * @param {Object} gridConfig - Configuration du grid
     * @returns {string} HTML avec layout grid
     */
    wrapWithGridLayout(content, gridConfig) {
        const gridStyles = [
            'display: grid',
            `grid-template-columns: repeat(${gridConfig.columns || 1}, 1fr)`,
            `gap: ${gridConfig.gap || '1rem'}`,
            gridConfig.alignItems ? `align-items: ${gridConfig.alignItems}` : '',
            gridConfig.justifyContent ? `justify-content: ${gridConfig.justifyContent}` : ''
        ].filter(Boolean).join('; ');

        return `<div class="section-grid-layout" style="${gridStyles}">${content}</div>`;
    }

    /**
     * Enveloppe le contenu avec un layout CSS Flexbox
     * 
     * @param {string} content - Contenu HTML
     * @param {Object} flexConfig - Configuration du flexbox
     * @returns {string} HTML avec layout flexbox
     */
    wrapWithFlexLayout(content, flexConfig) {
        const flexStyles = [
            'display: flex',
            `flex-direction: ${flexConfig.direction || 'column'}`,
            `gap: ${flexConfig.gap || '1rem'}`,
            flexConfig.alignItems ? `align-items: ${flexConfig.alignItems}` : '',
            flexConfig.justifyContent ? `justify-content: ${flexConfig.justifyContent}` : '',
            flexConfig.flexWrap ? `flex-wrap: ${flexConfig.flexWrap}` : ''
        ].filter(Boolean).join('; ');

        return `<div class="section-flex-layout" style="${flexStyles}">${content}</div>`;
    }

    /**
     * Génère le HTML complet d'une présentation
     * 
     * @param {Object} presentation - Présentation à rendre
     * @param {Object} renderOptions - Options de rendu globales
     * @returns {string} HTML complet de la présentation
     */
    generatePresentationHTML(presentation, renderOptions = {}) {
        if (!presentation || !presentation.sections) {
            throw new Error('Présentation avec sections requise');
        }

        try {
            console.log(`🔄 Génération HTML de la présentation: ${presentation.titre}`);

            // En-tête HTML de base
            const htmlHeader = this.generateHTMLHeader(presentation);
            
            // Styles CSS de la présentation
            const presentationStyles = this.generatePresentationStyles(presentation.styles);
            
            // Rendu de toutes les sections
            const sectionsHTML = presentation.sections
                .map(section => this.renderSection(section, renderOptions))
                .join('\n\n');

            // Scripts JavaScript pour interactivité
            const scripts = this.generatePresentationScripts(presentation);

            // Assemblage du HTML complet
            const completeHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    ${htmlHeader}
    <style>
        ${presentationStyles}
    </style>
</head>
<body>
    ${sectionsHTML}
    ${scripts}
</body>
</html>`;

            console.log('✅ HTML de présentation généré avec succès');
            return completeHTML;
        } catch (error) {
            console.error('❌ Erreur génération HTML présentation:', error);
            throw error;
        }
    }

    /**
     * Génère l'en-tête HTML de la présentation
     * 
     * @param {Object} presentation - Présentation
     * @returns {string} En-tête HTML
     */
    generateHTMLHeader(presentation) {
        return `
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${presentation.titre || 'Présentation'}</title>
            <meta name="description" content="${presentation.metadata?.description || 'Présentation générée automatiquement'}">
            
            <!-- Polices -->
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        `;
    }

    /**
     * Génère les styles CSS de la présentation
     * 
     * @param {Object} styles - Styles de la présentation
     * @returns {string} CSS formaté
     */
    generatePresentationStyles(styles = {}) {
        const defaultStyles = `
            :root {
                --primary-dark: ${styles.colors?.primary || '#0F172A'};
                --secondary-dark: ${styles.colors?.secondary || '#1E293B'};
                --accent-green: ${styles.colors?.accent || '#10B981'};
                --text-white: ${styles.colors?.textPrimary || '#F8FAFC'};
                --text-gray: ${styles.colors?.textSecondary || '#CBD5E1'};
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }

            body {
                font-family: ${styles.fonts?.primary || 'Inter, sans-serif'};
                background: linear-gradient(135deg, var(--primary-dark) 0%, var(--secondary-dark) 100%);
                color: var(--text-white);
                line-height: 1.6;
            }

            .container {
                max-width: 1400px;
                margin: 0 auto;
                width: 100%;
                padding: 0 2rem;
            }

            .section {
                position: relative;
                min-height: 100vh;
                display: flex;
                align-items: center;
                padding: 6rem 0;
            }

            @media (max-width: 768px) {
                .section {
                    padding: 4rem 0;
                }
                .container {
                    padding: 0 1rem;
                }
            }
        `;

        return defaultStyles;
    }

    /**
     * Génère les scripts JavaScript de la présentation
     * 
     * @param {Object} presentation - Présentation
     * @returns {string} Scripts JavaScript
     */
    generatePresentationScripts(presentation) {
        return `
            <script>
                console.log('✅ Présentation "${presentation.titre}" chargée');
                
                // Animation au scroll
                const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }
                    });
                }, observerOptions);

                document.querySelectorAll('.section').forEach(section => {
                    section.style.opacity = '0';
                    section.style.transform = 'translateY(30px)';
                    section.style.transition = 'all 0.8s ease';
                    observer.observe(section);
                });

                // Navigation fluide
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    });
                });
            </script>
        `;
    }

    /**
     * Retourne la liste des templates de sections disponibles
     * 
     * @param {string} category - Catégorie à filtrer (optionnelle)
     * @returns {Array<Object>} Liste des templates disponibles
     */
    getAvailableSections(category = null) {
        const availableSections = [];

        for (const [templateName, template] of this.sectionTemplates) {
            const sectionInfo = {
                id: templateName,
                name: template.name,
                description: template.description,
                category: template.category,
                widgetCount: template.widgets ? template.widgets.length : 0,
                usageCount: this.usageStats.get(templateName) || 0
            };

            // Filtrage par catégorie si spécifié
            if (!category || sectionInfo.category === category) {
                availableSections.push(sectionInfo);
            }
        }

        // Tri par popularité puis alphabétique
        return availableSections.sort((a, b) => {
            if (a.usageCount !== b.usageCount) {
                return b.usageCount - a.usageCount;
            }
            return a.name.localeCompare(b.name);
        });
    }

    /**
     * Récupère un template de section
     * 
     * @param {string} templateName - Nom du template
     * @returns {Object|null} Template de section
     */
    getTemplate(templateName) {
        const template = this.sectionTemplates.get(templateName);
        if (!template) {
            console.warn(`⚠️ Template de section '${templateName}' non trouvé`);
            return null;
        }
        return template;
    }

    /**
     * Retourne les statistiques du gestionnaire de sections
     * 
     * @returns {Object} Statistiques complètes
     */
    getStatistics() {
        return {
            availableTemplates: this.sectionTemplates.size,
            cachedSections: this.sectionCache.size,
            totalUsage: Array.from(this.usageStats.values()).reduce((sum, count) => sum + count, 0),
            usageByTemplate: Object.fromEntries(this.usageStats)
        };
    }

    /**
     * Alias pour renderSection - compatibilité avec MainEditor
     * 
     * Rôle : Interface compatible pour génération HTML
     * Type : Méthode utilitaire
     * Paramètres : section - Section à rendre, options - Options de rendu
     * Retour : string - HTML généré de la section
     */
    generateSectionHtml(section, options = {}) {
        return this.renderSection(section, options);
    }

    /**
     * Récupère les sections d'un template spécifique
     * 
     * Rôle : Chargement de sections pré-configurées
     * Type : Méthode de récupération de template
     * Paramètre : templateName - Nom du template (ex: 'li-cube-pro')
     * Retour : Array<Object> - Sections du template
     */
    async getTemplateSection(templateName) {
        try {
            console.log(`📋 Récupération template: ${templateName}`);

            switch (templateName) {
                case 'li-cube-pro':
                    return [
                        await this.createSection('hero', { 
                            name: 'Hero Li-CUBE PRO',
                            title: 'Li-CUBE PRO™' 
                        }),
                        await this.createSection('pricing', { 
                            name: 'Tarification Li-CUBE PRO',
                            title: 'TARIFS TRANSPARENTS' 
                        }),
                        await this.createSection('advantages', { 
                            name: 'Avantages Location',
                            title: 'POURQUOI LA LOCATION ?' 
                        }),
                        await this.createSection('technical-comparison', { 
                            name: 'Comparaison Technique',
                            title: 'COMPARAISON TECHNIQUE' 
                        }),
                        await this.createSection('conclusion', { 
                            name: 'Conclusion',
                            title: 'LE CHOIX ÉVIDENT' 
                        }),
                        await this.createSection('contact', { 
                            name: 'Contact & Location',
                            title: 'CONTACTEZ-NOUS' 
                        })
                    ];

                default:
                    console.warn(`Template inconnu: ${templateName}`);
                    return [await this.createSection('generic', { name: 'Section de base' })];
            }
        } catch (error) {
            console.error(`❌ Erreur récupération template ${templateName}:`, error);
            return [];
        }
    }

    /**
     * Duplique une section existante
     * 
     * Rôle : Création d'une copie d'une section
     * Type : Méthode de duplication
     * Paramètre : section - Section à dupliquer
     * Retour : Promise<Object> - Section dupliquée
     */
    async duplicateSection(section) {
        try {
            console.log(`📄 Duplication de la section: ${section.name || section.id}`);

            // Création d'une copie profonde des données
            const duplicatedSection = JSON.parse(JSON.stringify(section));
            
            // Génération d'un nouvel ID
            duplicatedSection.id = `section-${section.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Mise à jour du nom
            duplicatedSection.name = `${section.name || 'Section'} (copie)`;
            
            // Mise à jour des métadonnées
            duplicatedSection.metadata = {
                ...duplicatedSection.metadata,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                originalId: section.id
            };

            // Duplication des widgets si nécessaire
            if (duplicatedSection.widgets && duplicatedSection.widgets.length > 0) {
                duplicatedSection.widgets = duplicatedSection.widgets.map(widget => {
                    const duplicatedWidget = { ...widget };
                    duplicatedWidget.id = `widget-${widget.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    return duplicatedWidget;
                });
            }

            // Ajout au cache
            this.sectionCache.set(duplicatedSection.id, duplicatedSection);

            console.log(`✅ Section dupliquée: ${duplicatedSection.id}`);
            return duplicatedSection;

        } catch (error) {
            console.error('❌ Erreur duplication section:', error);
            throw error;
        }
    }
}

// Export de la classe pour utilisation dans d'autres modules
window.SectionManager = SectionManager;
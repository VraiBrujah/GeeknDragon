/**
 * ============================================================================
 * PRESENTATION ENGINE - MOTEUR DE PRÉSENTATION MODERNE
 * ============================================================================
 * 
 * Rôle : Système de création de présentations basé sur des widgets modulaires
 * Type : Architecture orientée objet avec encapsulation complète
 * Vision : Éditeur générique pour créer n'importe quelle présentation
 */

class PresentationEngine {
    constructor() {
        // Configuration : Identifiants et stockage
        this.projectId = null;
        this.projectData = {};
        this.widgets = new Map();
        this.sections = new Map();
        this.metaSections = new Map();
        
        // États : Synchronisation et événements
        this.syncEnabled = true;
        this.isInitialized = false;
        this.changeListeners = [];
        
        // Système d'historique pour undo/redo
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.isUndoRedo = false;
        
        // Templates : Définitions des widgets disponibles
        this.widgetTemplates = this.initializeWidgetTemplates();
        
        this.init();
    }

    /**
     * Rôle : Initialisation du moteur de présentation
     * Type : Setup principal - Configuration système
     */
    init() {
        console.log('🚀 Initialisation Presentation Engine');
        this.setupEventListeners();
        this.isInitialized = true;
    }

    /**
     * Rôle : Définition des templates de widgets disponibles
     * Type : Configuration système - Catalogue de widgets
     * Retour : Map des templates organisés par catégorie
     */
    initializeWidgetTemplates() {
        return new Map([
            // WIDGETS DE STRUCTURE PRINCIPALE
            ['navbar', {
                id: 'navbar',
                name: 'Navigation',
                category: 'structure',
                icon: '🧭',
                description: 'Barre de navigation avec logo et menu',
                fields: [
                    { id: 'logo', type: 'image', label: 'Logo', required: false },
                    { id: 'brand_title', type: 'text', label: 'Titre marque', required: true },
                    { id: 'navigation_items', type: 'textarea', label: 'Éléments menu (un par ligne)', required: false }
                ],
                style: {
                    position: 'fixed',
                    top: '0',
                    width: '100%',
                    zIndex: '1000',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    padding: '1rem 2rem',
                    borderBottom: '1px solid rgba(16, 185, 129, 0.2)'
                }
            }],
            
            ['header_spacer', {
                id: 'header_spacer',
                name: 'Espacement Header',
                category: 'structure',
                icon: '📏',
                description: 'Espacement pour compensation navbar fixe',
                fields: [
                    { id: 'height', type: 'number', label: 'Hauteur (px)', required: true, defaultValue: '80' }
                ],
                style: {
                    width: '100%',
                    background: 'transparent',
                    display: 'block'
                }
            }],

            ['header', {
                id: 'header',
                name: 'En-tête Principal',
                category: 'structure',
                icon: '🎯',
                description: 'Section d\'en-tête avec titre et sous-titre',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre principal', required: true },
                    { id: 'subtitle', type: 'text', label: 'Sous-titre', required: false },
                    { id: 'logo', type: 'image', label: 'Logo', required: false }
                ],
                style: {
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: 'white',
                    padding: '4rem 2rem',
                    textAlign: 'center'
                }
            }],
            
            ['hero', {
                id: 'hero',
                name: 'Section Héro',
                category: 'contenu',
                icon: '🌟',
                description: 'Section d\'accroche principale avec CTA',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre accroche', required: true },
                    { id: 'description', type: 'textarea', label: 'Description', required: true },
                    { id: 'cta_text', type: 'text', label: 'Texte bouton CTA', required: false },
                    { id: 'cta_link', type: 'text', label: 'Lien CTA', required: false },
                    { id: 'background_image', type: 'image', label: 'Image de fond', required: false }
                ],
                style: {
                    background: '#f8fafc',
                    padding: '4rem 2rem',
                    textAlign: 'center'
                }
            }],
            
            ['comparison', {
                id: 'comparison',
                name: 'Comparaison Produits',
                category: 'contenu',
                icon: '⚖️',
                description: 'Section de comparaison avec avantages/inconvénients',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre de la comparaison', required: true },
                    { id: 'product_a_name', type: 'text', label: 'Produit A', required: true },
                    { id: 'product_b_name', type: 'text', label: 'Produit B', required: true },
                    { id: 'product_a_image', type: 'image', label: 'Image Produit A', required: false },
                    { id: 'product_b_image', type: 'image', label: 'Image Produit B', required: false }
                ],
                style: {
                    background: 'white',
                    padding: '3rem 2rem'
                },
                subWidgets: ['advantage_list', 'weakness_list']
            }],
            
            ['advantage_list', {
                id: 'advantage_list',
                name: 'Liste d\'Avantages',
                category: 'liste',
                icon: '✅',
                description: 'Liste d\'avantages avec icônes',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre de la liste', required: true }
                ],
                style: {
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '2rem'
                },
                itemTemplate: {
                    fields: [
                        { id: 'emoji', type: 'text', label: 'Emoji', required: false, maxLength: 2 },
                        { id: 'title', type: 'text', label: 'Titre avantage', required: true },
                        { id: 'description', type: 'textarea', label: 'Description', required: false }
                    ]
                }
            }],
            
            ['weakness_list', {
                id: 'weakness_list',
                name: 'Liste de Faiblesses',
                category: 'liste',
                icon: '❌',
                description: 'Liste de faiblesses avec icônes',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre de la liste', required: true }
                ],
                style: {
                    background: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '2rem'
                },
                itemTemplate: {
                    fields: [
                        { id: 'emoji', type: 'text', label: 'Emoji', required: false, maxLength: 2 },
                        { id: 'title', type: 'text', label: 'Titre faiblesse', required: true },
                        { id: 'description', type: 'textarea', label: 'Description', required: false }
                    ]
                }
            }],
            
            ['pricing_table', {
                id: 'pricing_table',
                name: 'Grille Tarifaire',
                category: 'contenu',
                icon: '💰',
                description: 'Tableau de prix avec formules',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre de la grille', required: true },
                    { id: 'description', type: 'textarea', label: 'Description', required: false }
                ],
                style: {
                    background: '#f8fafc',
                    padding: '3rem 2rem'
                },
                itemTemplate: {
                    fields: [
                        { id: 'plan_name', type: 'text', label: 'Nom du plan', required: true },
                        { id: 'price', type: 'text', label: 'Prix', required: true },
                        { id: 'currency', type: 'text', label: 'Devise', required: true, defaultValue: '€' },
                        { id: 'period', type: 'text', label: 'Période', required: false, defaultValue: '/mois' },
                        { id: 'features', type: 'textarea', label: 'Fonctionnalités (une par ligne)', required: false }
                    ]
                }
            }],
            
            ['contact_form', {
                id: 'contact_form',
                name: 'Formulaire de Contact',
                category: 'interaction',
                icon: '📧',
                description: 'Formulaire de contact personnalisable',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre du formulaire', required: true },
                    { id: 'description', type: 'textarea', label: 'Description', required: false },
                    { id: 'submit_text', type: 'text', label: 'Texte bouton envoi', required: false, defaultValue: 'Envoyer' }
                ],
                style: {
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '2rem'
                }
            }],
            
            ['text_block', {
                id: 'text_block',
                name: 'Bloc de Texte',
                category: 'contenu',
                icon: '📝',
                description: 'Bloc de texte riche éditable',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre (optionnel)', required: false },
                    { id: 'content', type: 'rich_text', label: 'Contenu', required: true },
                    { id: 'alignment', type: 'select', label: 'Alignement', options: ['left', 'center', 'right'], defaultValue: 'left' }
                ],
                style: {
                    background: 'transparent',
                    padding: '2rem'
                }
            }],
            
            ['image_gallery', {
                id: 'image_gallery',
                name: 'Galerie d\'Images',
                category: 'media',
                icon: '🖼️',
                description: 'Galerie d\'images avec légendes',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre de la galerie', required: false },
                    { id: 'columns', type: 'select', label: 'Nombre de colonnes', options: ['1', '2', '3', '4'], defaultValue: '3' }
                ],
                style: {
                    background: 'white',
                    padding: '2rem'
                },
                itemTemplate: {
                    fields: [
                        { id: 'image', type: 'image', label: 'Image', required: true },
                        { id: 'caption', type: 'text', label: 'Légende', required: false },
                        { id: 'alt_text', type: 'text', label: 'Texte alternatif', required: false }
                    ]
                }
            }],

            // WIDGETS SPÉCIFIQUES LI-CUBE PRO
            ['licubepro_header', {
                id: 'licubepro_header',
                name: 'Header Li-CUBE PRO',
                category: 'licubepro',
                icon: '🏢',
                description: 'En-tête spécifique Li-CUBE PRO avec slogan',
                fields: [
                    { id: 'main_title', type: 'text', label: 'Titre principal', required: true, defaultValue: 'Li-CUBE PRO™' },
                    { id: 'subtitle', type: 'text', label: 'Sous-titre', required: true, defaultValue: 'Outil Présentation LOCATION' },
                    { id: 'company', type: 'text', label: 'Nom entreprise', required: true, defaultValue: 'EDS Québec' },
                    { id: 'slogan', type: 'text', label: 'Slogan', required: false, defaultValue: 'Arguments de service et tranquillité' }
                ],
                style: {
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    color: '#F8FAFC',
                    padding: '6rem 2rem 4rem',
                    textAlign: 'center',
                    position: 'relative'
                }
            }],

            ['service_card', {
                id: 'service_card',
                name: 'Carte de Service',
                category: 'licubepro',
                icon: '🎴',
                description: 'Carte de service avec icône et description',
                fields: [
                    { id: 'icon', type: 'text', label: 'Icône FontAwesome', required: true, defaultValue: 'fa-cog' },
                    { id: 'title', type: 'text', label: 'Titre du service', required: true },
                    { id: 'description', type: 'textarea', label: 'Description', required: true },
                    { id: 'highlight', type: 'boolean', label: 'Mise en évidence', defaultValue: false }
                ],
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    padding: '2rem',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                }
            }],

            ['service_grid', {
                id: 'service_grid',
                name: 'Grille de Services',
                category: 'licubepro',
                icon: '🎯',
                description: 'Grille de cartes de services Li-CUBE PRO',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre de la section', required: true },
                    { id: 'subtitle', type: 'text', label: 'Sous-titre', required: false },
                    { id: 'columns', type: 'select', label: 'Colonnes', options: ['2', '3', '4'], defaultValue: '3' }
                ],
                style: {
                    background: 'transparent',
                    padding: '4rem 2rem'
                },
                itemTemplate: {
                    fields: [
                        { id: 'icon', type: 'text', label: 'Icône', required: true },
                        { id: 'title', type: 'text', label: 'Titre', required: true },
                        { id: 'description', type: 'textarea', label: 'Description', required: true }
                    ]
                }
            }],

            ['comparison_section', {
                id: 'comparison_section',
                name: 'Section Comparaison',
                category: 'licubepro',
                icon: '⚖️',
                description: 'Section de comparaison avec avant/après',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre principal', required: true },
                    { id: 'before_title', type: 'text', label: 'Titre "Avant"', required: true, defaultValue: 'Sans Li-CUBE PRO' },
                    { id: 'after_title', type: 'text', label: 'Titre "Avec"', required: true, defaultValue: 'Avec Li-CUBE PRO' }
                ],
                style: {
                    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                    padding: '4rem 2rem'
                },
                subWidgets: ['weakness_list', 'advantage_list']
            }],

            ['feature_highlight', {
                id: 'feature_highlight',
                name: 'Fonctionnalité Vedette',
                category: 'licubepro',
                icon: '⭐',
                description: 'Mise en vedette d\'une fonctionnalité clé',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre', required: true },
                    { id: 'description', type: 'rich_text', label: 'Description détaillée', required: true },
                    { id: 'image', type: 'image', label: 'Image illustrative', required: false },
                    { id: 'cta_text', type: 'text', label: 'Texte bouton', required: false },
                    { id: 'cta_link', type: 'text', label: 'Lien bouton', required: false }
                ],
                style: {
                    background: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '20px',
                    padding: '3rem',
                    margin: '2rem 0'
                }
            }],

            ['stats_section', {
                id: 'stats_section',
                name: 'Section Statistiques',
                category: 'licubepro',
                icon: '📊',
                description: 'Section avec statistiques et chiffres clés',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre section', required: true },
                    { id: 'background_type', type: 'select', label: 'Type arrière-plan', options: ['gradient', 'solid', 'transparent'], defaultValue: 'gradient' }
                ],
                style: {
                    background: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
                    padding: '4rem 2rem',
                    textAlign: 'center'
                },
                itemTemplate: {
                    fields: [
                        { id: 'number', type: 'text', label: 'Chiffre', required: true },
                        { id: 'suffix', type: 'text', label: 'Suffixe (%, +, etc.)', required: false },
                        { id: 'label', type: 'text', label: 'Label', required: true },
                        { id: 'description', type: 'text', label: 'Description', required: false }
                    ]
                }
            }],

            ['testimonial_card', {
                id: 'testimonial_card',
                name: 'Témoignage Client',
                category: 'licubepro',
                icon: '💬',
                description: 'Carte témoignage avec citation et auteur',
                fields: [
                    { id: 'quote', type: 'textarea', label: 'Citation', required: true },
                    { id: 'author', type: 'text', label: 'Nom auteur', required: true },
                    { id: 'company', type: 'text', label: 'Entreprise', required: false },
                    { id: 'position', type: 'text', label: 'Poste', required: false },
                    { id: 'avatar', type: 'image', label: 'Photo auteur', required: false },
                    { id: 'rating', type: 'select', label: 'Note', options: ['1', '2', '3', '4', '5'], defaultValue: '5' }
                ],
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    margin: '1rem'
                }
            }],

            ['cta_section', {
                id: 'cta_section',
                name: 'Section Call-to-Action',
                category: 'licubepro',
                icon: '🚀',
                description: 'Section d\'appel à l\'action avec boutons',
                fields: [
                    { id: 'title', type: 'text', label: 'Titre principal', required: true },
                    { id: 'subtitle', type: 'text', label: 'Sous-titre', required: false },
                    { id: 'primary_btn_text', type: 'text', label: 'Texte bouton principal', required: true },
                    { id: 'primary_btn_link', type: 'text', label: 'Lien bouton principal', required: false },
                    { id: 'secondary_btn_text', type: 'text', label: 'Texte bouton secondaire', required: false },
                    { id: 'secondary_btn_link', type: 'text', label: 'Lien bouton secondaire', required: false }
                ],
                style: {
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    color: 'white',
                    padding: '4rem 2rem',
                    textAlign: 'center'
                }
            }],

            ['footer_section', {
                id: 'footer_section',
                name: 'Pied de Page',
                category: 'structure',
                icon: '📄',
                description: 'Pied de page avec informations de contact',
                fields: [
                    { id: 'company_name', type: 'text', label: 'Nom entreprise', required: true },
                    { id: 'address', type: 'textarea', label: 'Adresse', required: false },
                    { id: 'phone', type: 'text', label: 'Téléphone', required: false },
                    { id: 'email', type: 'email', label: 'Email', required: false },
                    { id: 'copyright', type: 'text', label: 'Copyright', required: false }
                ],
                style: {
                    background: '#0F172A',
                    color: '#CBD5E1',
                    padding: '3rem 2rem 2rem',
                    borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                }
            }]
        ]);
    }

    /**
     * Rôle : Création d'un nouveau projet de présentation
     * Type : Factory method - Génération de projet
     */
    createProject(projectName, template = 'blank') {
        const projectId = this.generateProjectId(projectName);
        
        const projectData = {
            id: projectId,
            name: projectName,
            template: template,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            
            // Structure hiérarchique de la présentation
            style: {
                theme: 'modern',
                colors: {
                    primary: '#3b82f6',
                    secondary: '#64748b',
                    accent: '#06b6d4',
                    background: '#ffffff',
                    text: '#1f2937'
                },
                fonts: {
                    primary: 'Inter, sans-serif',
                    heading: 'Inter, sans-serif'
                }
            },
            
            // Meta-sections : niveau le plus haut
            metaSections: [],
            
            // Configuration globale
            settings: {
                responsive: true,
                animations: true,
                darkMode: false
            }
        };
        
        this.projectId = projectId;
        this.projectData = projectData;
        
        // Créer le dossier du projet
        this.createProjectDirectory(projectId);
        
        console.log(`✅ Projet créé: ${projectName} (ID: ${projectId})`);
        return projectId;
    }

    /**
     * Rôle : Obtention des templates prédéfinis
     * Type : Template management - Templates intégrés
     */
    getBuiltInTemplates() {
        return {
            'licubepro-location': {
                id: "licubepro-location",
                name: "Li-CUBE PRO™ - Outil Présentation LOCATION",
                description: "Outil de présentation commerciale Li-CUBE PRO™ LOCATION : Arguments de service et tranquillité pour équipes de vente EDS Québec",
                template: "licubepro-location",
                style: {
                    theme: "licubepro-dark",
                    colors: {
                        primary: "#0F172A",
                        secondary: "#1E293B",
                        accent: "#10B981",
                        accentBlue: "#3B82F6",
                        accentTeal: "#14B8A6",
                        success: "#059669",
                        warning: "#F59E0B",
                        textWhite: "#F8FAFC",
                        textGray: "#CBD5E1",
                        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
                    },
                    fonts: {
                        primary: "'Inter', sans-serif",
                        heading: "'Playfair Display', serif"
                    }
                },
                metaSections: [
                    {
                        id: "meta-navbar",
                        type: "navigation",
                        name: "Navigation",
                        order: 0,
                        sections: [
                            {
                                id: "section-navbar",
                                type: "navigation",
                                order: 0,
                                widgets: [
                                    {
                                        id: "widget-navbar",
                                        type: "navbar",
                                        order: 0,
                                        data: {
                                            logo: "./images/logo edsquebec.png",
                                            brand_title: "Li-CUBE PRO™",
                                            navigation_items: "Accueil\nServices\nProduits\nContact"
                                        },
                                        style: {
                                            position: "fixed",
                                            top: "0",
                                            width: "100%",
                                            zIndex: "1000",
                                            background: "rgba(15, 23, 42, 0.95)",
                                            backdropFilter: "blur(20px)",
                                            padding: "1rem 2rem",
                                            borderBottom: "1px solid rgba(16, 185, 129, 0.2)"
                                        },
                                        items: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "meta-header",
                        type: "header",
                        name: "En-tête Principal",
                        order: 1,
                        sections: [
                            {
                                id: "section-spacer",
                                type: "spacer",
                                order: 0,
                                widgets: [
                                    {
                                        id: "widget-header-spacer",
                                        type: "header_spacer",
                                        order: 0,
                                        data: {
                                            height: "80"
                                        },
                                        style: {},
                                        items: []
                                    }
                                ]
                            },
                            {
                                id: "section-main-header",
                                type: "header",
                                order: 1,
                                widgets: [
                                    {
                                        id: "widget-licubepro-header",
                                        type: "licubepro_header",
                                        order: 0,
                                        data: {
                                            main_title: "Li-CUBE PRO™",
                                            subtitle: "Outil Présentation LOCATION",
                                            company: "EDS Québec",
                                            slogan: "Arguments de service et tranquillité pour équipes de vente"
                                        },
                                        style: {},
                                        items: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "meta-advantages",
                        type: "advantages",
                        name: "Avantages avec Li-CUBE PRO",
                        order: 2,
                        sections: [
                            {
                                id: "section-advantages",
                                type: "list",
                                order: 0,
                                widgets: [
                                    {
                                        id: "widget-advantage-list",
                                        type: "advantage_list",
                                        order: 0,
                                        data: {
                                            title: "Les Avantages de Li-CUBE PRO"
                                        },
                                        style: {},
                                        items: [
                                            {
                                                emoji: "✅",
                                                title: "Automatisation Complète",
                                                description: "Processus entièrement automatisés pour un gain de temps maximal"
                                            },
                                            {
                                                emoji: "📊",
                                                title: "Tableau de Bord Intuitif",
                                                description: "Visualisation en temps réel de tous vos équipements et contrats"
                                            },
                                            {
                                                emoji: "💰",
                                                title: "Transparence Tarifaire",
                                                description: "Tarification claire et transparente sans frais cachés"
                                            },
                                            {
                                                emoji: "⚡",
                                                title: "Réactivité Instantanée",
                                                description: "Support technique et résolution de problèmes en temps réel"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        id: "meta-weaknesses",
                        type: "weaknesses",
                        name: "Problèmes Sans Solution",
                        order: 3,
                        sections: [
                            {
                                id: "section-weaknesses",
                                type: "list",
                                order: 0,
                                widgets: [
                                    {
                                        id: "widget-weakness-list",
                                        type: "weakness_list",
                                        order: 0,
                                        data: {
                                            title: "Défis de la Gestion Traditionnelle"
                                        },
                                        style: {},
                                        items: [
                                            {
                                                emoji: "❌",
                                                title: "Gestion Manuelle Complexe",
                                                description: "Perte de temps avec la paperasse et les processus manuels"
                                            },
                                            {
                                                emoji: "📉",
                                                title: "Manque de Visibilité",
                                                description: "Difficile de suivre l'état et la localisation des équipements"
                                            },
                                            {
                                                emoji: "💸",
                                                title: "Coûts Cachés",
                                                description: "Frais imprévus et surcoûts difficiles à prévoir"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                settings: {
                    responsive: true,
                    animations: true,
                    darkMode: false,
                    preloadImages: true,
                    lazyLoading: true
                }
            }
        };
    }

    /**
     * Rôle : Chargement d'un template prédéfini
     * Type : Template management - Chargement de template
     */
    loadTemplate(templateName) {
        const templates = this.getBuiltInTemplates();
        const template = templates[templateName];
        
        if (!template) {
            console.error(`❌ Template non trouvé: ${templateName}`);
            return null;
        }
        
        return template;
    }

    /**
     * Rôle : Création d'un projet depuis un template
     * Type : Factory method - Génération depuis template
     */
    createProjectFromTemplate(projectName, templateName) {
        console.log(`🎨 Création du projet depuis le template: ${templateName}`);
        
        const templateData = this.loadTemplate(templateName);
        if (!templateData) {
            console.error(`❌ Impossible de charger le template: ${templateName}`);
            return null;
        }
        
        // Générer un nouvel ID et adapter les données
        const projectId = this.generateProjectId(projectName);
        const projectData = {
            ...templateData,
            id: projectId,
            name: projectName,
            created: new Date().toISOString(),
            modified: new Date().toISOString()
        };
        
        this.projectId = projectId;
        this.projectData = projectData;
        
        // Reconstruire la Map des widgets
        this.rebuildWidgetMap();
        
        // Sauvegarder le nouveau projet
        this.saveProject(projectId, projectData);
        
        console.log(`✅ Projet créé depuis template: ${projectName} (${templateName})`);
        return projectData;
    }

    /**
     * Rôle : Génération d'un ID unique pour le projet
     * Type : Utility - Génération d'identifiants
     */
    generateProjectId(projectName) {
        const slug = projectName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const timestamp = Date.now().toString(36);
        return `${slug}-${timestamp}`;
    }

    /**
     * Rôle : Création de la structure de dossier pour un projet
     * Type : File system - Organisation des fichiers
     */
    createProjectDirectory(projectId) {
        const projectPath = `projects/${projectId}`;
        
        // Structure que nous créerons :
        // projects/
        //   └── project-id/
        //       ├── presentation.html (page finale)
        //       ├── data.json (données du projet)
        //       ├── assets/
        //       │   ├── css/
        //       │   │   └── custom.css
        //       │   ├── js/
        //       │   │   └── custom.js
        //       │   └── images/
        //       └── exports/
        
        console.log(`📁 Structure de projet créée: ${projectPath}`);
        return projectPath;
    }

    /**
     * Rôle : Ajout d'une méta-section à la présentation
     * Type : Content management - Ajout de contenu
     */
    addMetaSection(metaSectionType, position = null) {
        // Sauvegarder l'état avant modification
        this.saveToHistory('add_meta_section', `Ajout méta-section ${metaSectionType}`);
        
        const metaSectionId = this.generateUniqueId('meta');
        
        const metaSection = {
            id: metaSectionId,
            type: metaSectionType,
            name: this.getMetaSectionName(metaSectionType),
            order: position || this.projectData.metaSections.length,
            sections: [],
            style: this.getDefaultMetaSectionStyle(metaSectionType)
        };
        
        if (position !== null) {
            this.projectData.metaSections.splice(position, 0, metaSection);
            this.reorderMetaSections();
        } else {
            this.projectData.metaSections.push(metaSection);
        }
        
        this.triggerSync();
        console.log(`✅ Méta-section ajoutée: ${metaSectionType}`);
        return metaSectionId;
    }

    /**
     * Rôle : Ajout d'une section dans une méta-section
     * Type : Content management - Composition hiérarchique
     */
    addSection(metaSectionId, sectionType, position = null) {
        // Sauvegarder l'état avant modification
        this.saveToHistory('add_section', `Ajout section ${sectionType}`);
        
        const metaSection = this.projectData.metaSections.find(ms => ms.id === metaSectionId);
        if (!metaSection) {
            console.error(`❌ Méta-section non trouvée: ${metaSectionId}`);
            return null;
        }
        
        const sectionId = this.generateUniqueId('section');
        
        const section = {
            id: sectionId,
            type: sectionType,
            order: position || metaSection.sections.length,
            widgets: [],
            data: {},
            style: {}
        };
        
        if (position !== null) {
            metaSection.sections.splice(position, 0, section);
            this.reorderSections(metaSectionId);
        } else {
            metaSection.sections.push(section);
        }
        
        this.triggerSync();
        console.log(`✅ Section ajoutée: ${sectionType} dans ${metaSectionId}`);
        return sectionId;
    }

    /**
     * Rôle : Ajout d'un widget dans une section
     * Type : Widget management - Gestion des widgets
     */
    addWidget(sectionId, widgetType, data = {}, position = null) {
        // Sauvegarder l'état avant modification
        this.saveToHistory('add_widget', `Ajout widget ${widgetType}`);
        
        const section = this.findSection(sectionId);
        if (!section) {
            console.error(`❌ Section non trouvée: ${sectionId}`);
            return null;
        }
        
        const widgetId = this.generateUniqueId('widget');
        const template = this.widgetTemplates.get(widgetType);
        
        if (!template) {
            console.error(`❌ Template de widget non trouvé: ${widgetType}`);
            return null;
        }
        
        const widget = {
            id: widgetId,
            type: widgetType,
            order: position || section.widgets.length,
            data: this.initializeWidgetData(template, data),
            style: { ...template.style },
            items: [] // Pour les widgets avec sous-éléments (listes, galleries, etc.)
        };
        
        if (position !== null) {
            section.widgets.splice(position, 0, widget);
            this.reorderWidgets(sectionId);
        } else {
            section.widgets.push(widget);
        }
        
        this.widgets.set(widgetId, widget);
        this.triggerSync();
        
        console.log(`✅ Widget ajouté: ${widgetType} (${widgetId})`);
        return widgetId;
    }

    /**
     * Rôle : Initialisation des données d'un widget avec valeurs par défaut
     * Type : Data initialization - Configuration widget
     */
    initializeWidgetData(template, providedData = {}) {
        const data = {};
        
        template.fields.forEach(field => {
            if (providedData.hasOwnProperty(field.id)) {
                data[field.id] = providedData[field.id];
            } else if (field.defaultValue) {
                data[field.id] = field.defaultValue;
            } else {
                data[field.id] = this.getDefaultValueForType(field.type);
            }
        });
        
        return data;
    }

    /**
     * Rôle : Génération de valeurs par défaut selon le type de champ
     * Type : Utility - Génération de données
     */
    getDefaultValueForType(fieldType) {
        const defaults = {
            'text': '',
            'textarea': '',
            'rich_text': '',
            'image': '',
            'select': '',
            'number': 0,
            'color': '#000000',
            'boolean': false
        };
        
        return defaults[fieldType] || '';
    }

    /**
     * Rôle : Mise à jour des données d'un widget
     * Type : Data management - Modification widget
     */
    updateWidget(widgetId, newData) {
        // Sauvegarder l'état avant modification
        this.saveToHistory('update_widget', `Modification widget ${widgetId}`);
        
        const widget = this.widgets.get(widgetId);
        if (!widget) {
            console.error(`❌ Widget non trouvé: ${widgetId}`);
            return false;
        }
        
        // Fusionner les nouvelles données avec les existantes
        widget.data = { ...widget.data, ...newData };
        
        this.triggerSync();
        console.log(`✅ Widget mis à jour: ${widgetId}`);
        return true;
    }

    /**
     * Rôle : Suppression d'un widget
     * Type : Widget management - Suppression
     */
    removeWidget(widgetId) {
        this.saveToHistory('remove_widget', `Suppression widget ${widgetId}`);
        
        const widget = this.widgets.get(widgetId);
        if (!widget) {
            console.error(`❌ Widget non trouvé: ${widgetId}`);
            return false;
        }
        
        // Trouver et supprimer le widget de sa section parent
        for (const metaSection of this.projectData.metaSections) {
            for (const section of metaSection.sections) {
                const widgetIndex = section.widgets.findIndex(w => w.id === widgetId);
                if (widgetIndex !== -1) {
                    section.widgets.splice(widgetIndex, 1);
                    this.reorderWidgets(section.id);
                    break;
                }
            }
        }
        
        // Supprimer de la Map
        this.widgets.delete(widgetId);
        this.triggerSync();
        
        console.log(`✅ Widget supprimé: ${widgetId}`);
        return true;
    }

    /**
     * Rôle : Suppression d'une section
     * Type : Content management - Suppression
     */
    removeSection(sectionId) {
        this.saveToHistory('remove_section', `Suppression section ${sectionId}`);
        
        for (const metaSection of this.projectData.metaSections) {
            const sectionIndex = metaSection.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex !== -1) {
                const section = metaSection.sections[sectionIndex];
                
                // Supprimer tous les widgets de cette section
                section.widgets.forEach(widget => {
                    this.widgets.delete(widget.id);
                });
                
                // Supprimer la section
                metaSection.sections.splice(sectionIndex, 1);
                this.reorderSections(metaSection.id);
                this.triggerSync();
                
                console.log(`✅ Section supprimée: ${sectionId}`);
                return true;
            }
        }
        
        console.error(`❌ Section non trouvée: ${sectionId}`);
        return false;
    }

    /**
     * Rôle : Suppression d'une méta-section
     * Type : Content management - Suppression
     */
    removeMetaSection(metaSectionId) {
        this.saveToHistory('remove_meta_section', `Suppression méta-section ${metaSectionId}`);
        
        const metaSectionIndex = this.projectData.metaSections.findIndex(ms => ms.id === metaSectionId);
        if (metaSectionIndex === -1) {
            console.error(`❌ Méta-section non trouvée: ${metaSectionId}`);
            return false;
        }
        
        const metaSection = this.projectData.metaSections[metaSectionIndex];
        
        // Supprimer toutes les sections et widgets de cette méta-section
        metaSection.sections.forEach(section => {
            section.widgets.forEach(widget => {
                this.widgets.delete(widget.id);
            });
        });
        
        // Supprimer la méta-section
        this.projectData.metaSections.splice(metaSectionIndex, 1);
        this.reorderMetaSections();
        this.triggerSync();
        
        console.log(`✅ Méta-section supprimée: ${metaSectionId}`);
        return true;
    }

    /**
     * Rôle : Déplacement d'un élément (widget, section, meta-section)
     * Type : Content management - Réorganisation
     */
    moveElement(elementId, elementType, targetIndex) {
        this.saveToHistory('move_element', `Déplacement ${elementType} ${elementId}`);
        
        switch (elementType) {
            case 'widget':
                return this.moveWidget(elementId, targetIndex);
            case 'section':
                return this.moveSection(elementId, targetIndex);
            case 'meta_section':
                return this.moveMetaSection(elementId, targetIndex);
            default:
                console.error(`❌ Type d'élément non reconnu: ${elementType}`);
                return false;
        }
    }

    /**
     * Rôle : Déplacement d'un widget dans sa section
     * Type : Widget management - Réorganisation
     */
    moveWidget(widgetId, newIndex) {
        for (const metaSection of this.projectData.metaSections) {
            for (const section of metaSection.sections) {
                const widgetIndex = section.widgets.findIndex(w => w.id === widgetId);
                if (widgetIndex !== -1) {
                    const widget = section.widgets.splice(widgetIndex, 1)[0];
                    section.widgets.splice(newIndex, 0, widget);
                    this.reorderWidgets(section.id);
                    this.triggerSync();
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Rôle : Déplacement d'une section dans sa méta-section
     * Type : Content management - Réorganisation
     */
    moveSection(sectionId, newIndex) {
        for (const metaSection of this.projectData.metaSections) {
            const sectionIndex = metaSection.sections.findIndex(s => s.id === sectionId);
            if (sectionIndex !== -1) {
                const section = metaSection.sections.splice(sectionIndex, 1)[0];
                metaSection.sections.splice(newIndex, 0, section);
                this.reorderSections(metaSection.id);
                this.triggerSync();
                return true;
            }
        }
        return false;
    }

    /**
     * Rôle : Déplacement d'une méta-section
     * Type : Content management - Réorganisation
     */
    moveMetaSection(metaSectionId, newIndex) {
        const metaSectionIndex = this.projectData.metaSections.findIndex(ms => ms.id === metaSectionId);
        if (metaSectionIndex !== -1) {
            const metaSection = this.projectData.metaSections.splice(metaSectionIndex, 1)[0];
            this.projectData.metaSections.splice(newIndex, 0, metaSection);
            this.reorderMetaSections();
            this.triggerSync();
            return true;
        }
        return false;
    }

    /**
     * Rôle : Sauvegarde de l'état actuel dans l'historique
     * Type : History management - Gestion de l'historique
     */
    saveToHistory(actionType, description) {
        if (this.isUndoRedo) return; // Éviter les sauvegardes pendant undo/redo
        
        // Créer une copie profonde de l'état actuel
        const snapshot = {
            timestamp: new Date().toISOString(),
            actionType: actionType,
            description: description,
            projectData: JSON.parse(JSON.stringify(this.projectData))
        };
        
        // Supprimer l'historique après l'index actuel si on est au milieu
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Ajouter le nouveau snapshot
        this.history.push(snapshot);
        this.historyIndex = this.history.length - 1;
        
        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        console.log(`💾 État sauvegardé: ${actionType} - ${description}`);
    }

    /**
     * Rôle : Annulation de la dernière action (Undo)
     * Type : History management - Navigation historique
     */
    undo() {
        if (this.historyIndex <= 0) {
            console.warn('⚠️ Aucune action à annuler');
            return false;
        }
        
        this.historyIndex--;
        const snapshot = this.history[this.historyIndex];
        
        this.isUndoRedo = true;
        this.restoreFromSnapshot(snapshot);
        this.isUndoRedo = false;
        
        console.log(`↶ Annulation: ${snapshot.actionType} - ${snapshot.description}`);
        return true;
    }

    /**
     * Rôle : Refaire la dernière action annulée (Redo)
     * Type : History management - Navigation historique
     */
    redo() {
        if (this.historyIndex >= this.history.length - 1) {
            console.warn('⚠️ Aucune action à refaire');
            return false;
        }
        
        this.historyIndex++;
        const snapshot = this.history[this.historyIndex];
        
        this.isUndoRedo = true;
        this.restoreFromSnapshot(snapshot);
        this.isUndoRedo = false;
        
        console.log(`↷ Refaire: ${snapshot.actionType} - ${snapshot.description}`);
        return true;
    }

    /**
     * Rôle : Restauration d'un snapshot de l'historique
     * Type : History management - Restauration d'état
     */
    restoreFromSnapshot(snapshot) {
        this.projectData = JSON.parse(JSON.stringify(snapshot.projectData));
        this.rebuildWidgetMap();
        this.triggerSync();
    }

    /**
     * Rôle : Obtenir l'état de l'historique
     * Type : History management - Information historique
     */
    getHistoryState() {
        return {
            canUndo: this.historyIndex > 0,
            canRedo: this.historyIndex < this.history.length - 1,
            currentIndex: this.historyIndex,
            totalStates: this.history.length,
            currentAction: this.history[this.historyIndex]?.actionType || 'initial'
        };
    }

    /**
     * Rôle : Déclenchement de la synchronisation temps réel
     * Type : Event system - Synchronisation
     */
    triggerSync() {
        if (!this.syncEnabled) return;
        
        // Mettre à jour la date de modification
        this.projectData.modified = new Date().toISOString();
        
        // Déclencher tous les listeners
        this.changeListeners.forEach(listener => {
            try {
                listener(this.projectData);
            } catch (error) {
                console.error('❌ Erreur dans listener de synchronisation:', error);
            }
        });
        
        // Sauvegarder en localStorage
        this.saveToLocalStorage();
    }

    /**
     * Sauvegarde un projet dans localStorage
     * @param {string} projectId - Identifiant unique du projet
     * @param {Object} projectData - Données du projet à sauvegarder
     */
    saveProject(projectId, projectData) {
        try {
            const key = `presentation-project-${projectId}`;
            const data = {
                ...projectData,
                lastModified: new Date().toISOString(),
                version: '1.0.0'
            };
            
            // Sauvegarder dans localStorage
            localStorage.setItem(key, JSON.stringify(data));
            
            // Sauvegarder aussi une référence vers le projet actuel
            localStorage.setItem('current-project-id', projectId);
            
            // Déclenche un événement pour synchroniser avec d'autres onglets
            window.dispatchEvent(new CustomEvent('presentationSync', {
                detail: { projectId, data }
            }));
            
            console.log(`💾 Projet sauvegardé: ${projectId}`);
            return data;
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return null;
        }
    }

    /**
     * Génère la structure de dossiers pour un nouveau projet
     * @param {string} projectId - Identifiant unique du projet
     * @returns {Object} Structure des dossiers générés
     */
    generateProjectStructure(projectId) {
        // Structure de base d'un projet de présentation
        const structure = {
            projectId: projectId,
            folders: {
                root: `presentations/${projectId}`,
                assets: `presentations/${projectId}/assets`,
                images: `presentations/${projectId}/assets/images`,
                css: `presentations/${projectId}/assets/css`,
                js: `presentations/${projectId}/assets/js`,
                data: `presentations/${projectId}/data`
            },
            files: {
                index: `presentations/${projectId}/index.html`,
                styles: `presentations/${projectId}/assets/css/styles.css`,
                script: `presentations/${projectId}/assets/js/presentation.js`,
                config: `presentations/${projectId}/data/config.json`,
                content: `presentations/${projectId}/data/content.json`
            }
        };

        return structure;
    }

    /**
     * Crée un nouveau projet avec tous ses fichiers de base
     * @param {string} projectName - Nom du projet
     * @param {Object} options - Options de configuration
     * @returns {Object} Projet créé avec sa structure
     */
    createNewProject(projectName, options = {}) {
        const projectId = projectName.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const timestamp = new Date().toISOString();
        
        // Données du projet par défaut
        const projectData = {
            id: projectId,
            name: projectName,
            description: options.description || '',
            created: timestamp,
            lastModified: timestamp,
            version: '1.0.0',
            settings: {
                theme: options.theme || 'default',
                layout: options.layout || 'standard',
                responsive: true,
                animations: true
            },
            metaSections: [],
            globalStyles: this.getDefaultGlobalStyles(),
            structure: this.generateProjectStructure(projectId)
        };

        // Ajouter une meta-section par défaut
        const defaultMetaSection = {
            id: 'meta-intro',
            name: 'Introduction',
            type: 'introduction',
            order: 0,
            sections: [
                {
                    id: 'section-header',
                    widgetId: 'header',
                    order: 0,
                    data: {
                        title: projectName,
                        subtitle: 'Présentation générée automatiquement'
                    }
                }
            ]
        };
        
        projectData.metaSections.push(defaultMetaSection);
        
        // Sauvegarder le projet
        this.saveProject(projectId, projectData);
        
        return projectData;
    }

    /**
     * Génère les styles CSS par défaut pour un projet
     * @returns {string} Code CSS par défaut
     */
    getDefaultGlobalStyles() {
        return `
        /* Styles globaux de la présentation */
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --text-color: #333;
            --bg-color: #fff;
            --border-radius: 8px;
            --box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--bg-color);
        }

        .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .meta-section {
            margin-bottom: 60px;
            padding: 40px;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
        }

        .section {
            margin-bottom: 40px;
        }

        .widget {
            margin-bottom: 20px;
        }

        /* Widgets styles */
        .widget-header {
            text-align: center;
            padding: 60px 0;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border-radius: var(--border-radius);
        }

        .widget-header h1 {
            font-size: 3rem;
            margin-bottom: 20px;
        }

        .widget-header p {
            font-size: 1.5rem;
            opacity: 0.9;
        }

        .widget-hero {
            background-size: cover;
            background-position: center;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
            border-radius: var(--border-radius);
        }

        .widget-pricing-table {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }

        .price-card {
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: var(--border-radius);
            padding: 30px;
            text-align: center;
            transition: transform 0.3s ease;
        }

        .price-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--box-shadow);
        }

        @media (max-width: 768px) {
            .presentation-container {
                padding: 10px;
            }
            
            .meta-section {
                padding: 20px;
            }
            
            .widget-header h1 {
                font-size: 2rem;
            }
        }
        `;
    }

    /**
     * Rôle : Sauvegarde du projet en localStorage
     * Type : Persistence - Stockage local
     */
    saveToLocalStorage() {
        if (!this.projectId) return;
        
        const key = `presentation-project-${this.projectId}`;
        localStorage.setItem(key, JSON.stringify(this.projectData));
    }

    /**
     * Charge un projet depuis localStorage
     * @param {string} projectId - Identifiant du projet à charger
     * @returns {Object|null} Données du projet ou null si non trouvé
     */
    loadProject(projectId) {
        console.log(`🔍 Tentative de chargement du projet: ${projectId}`);
        
        // Vérifier si le projectId est fourni
        if (!projectId) {
            console.warn('⚠️ Aucun ID de projet fourni');
            return null;
        }
        
        const key = `presentation-project-${projectId}`;
        console.log(`🔑 Recherche de la clé: ${key}`);
        
        // Lister toutes les clés pour débugger
        const allKeys = Object.keys(localStorage).filter(k => k.startsWith('presentation-project-'));
        console.log('📋 Projets disponibles:', allKeys);
        
        const data = localStorage.getItem(key);
        
        if (!data) {
            console.warn(`⚠️ Projet non trouvé: ${projectId}`);
            console.warn(`📋 Projets disponibles: ${allKeys.join(', ')}`);
            return null;
        }
        
        try {
            const projectData = JSON.parse(data);
            
            // Validation des données
            if (!projectData.id || !projectData.name) {
                throw new Error('Données de projet invalides');
            }
            
            this.projectId = projectId;
            this.projectData = projectData;
            
            // Reconstruire la Map des widgets
            this.rebuildWidgetMap();
            
            // Sauvegarder l'ID du projet actuel
            localStorage.setItem('current-project-id', projectId);
            
            console.log(`✅ Projet chargé: ${projectData.name}`);
            console.log(`📊 ${projectData.metaSections?.length || 0} méta-sections`);
            
            return projectData;
        } catch (error) {
            console.error(`❌ Erreur lors du chargement du projet ${projectId}:`, error);
            return null;
        }
    }

    /**
     * Récupère la liste de tous les projets disponibles
     * @returns {Array} Liste des projets avec leurs informations de base
     */
    getAllProjects() {
        const projects = [];
        const keys = Object.keys(localStorage).filter(key => key.startsWith('presentation-project-'));
        
        keys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.id && data.name) {
                    projects.push({
                        id: data.id,
                        name: data.name,
                        created: data.created,
                        lastModified: data.lastModified,
                        metaSectionsCount: data.metaSections?.length || 0
                    });
                }
            } catch (error) {
                console.warn(`⚠️ Projet corrompu ignoré: ${key}`);
            }
        });
        
        // Trier par dernière modification
        projects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        return projects;
    }

    /**
     * Reconstruit la Map des widgets après chargement
     * @private
     */
    rebuildWidgetMap() {
        this.widgets.clear();
        
        this.projectData.metaSections?.forEach(metaSection => {
            metaSection.sections?.forEach(section => {
                section.widgets?.forEach(widget => {
                    this.widgets.set(widget.id, widget);
                });
            });
        });
    }

    /**
     * Rôle : Génération d'ID unique pour les éléments
     * Type : Utility - Génération d'identifiants
     */
    generateUniqueId(prefix = 'item') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Rôle : Recherche d'une section par ID dans toute la hiérarchie
     * Type : Utility - Recherche d'éléments
     */
    findSection(sectionId) {
        for (const metaSection of this.projectData.metaSections) {
            const section = metaSection.sections.find(s => s.id === sectionId);
            if (section) return section;
        }
        return null;
    }

    /**
     * Rôle : Configuration des écouteurs d'événements
     * Type : Event system - Gestion des événements
     */
    setupEventListeners() {
        // Écouteurs pour la synchronisation cross-tab
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('presentation-project-')) {
                console.log('🔄 Synchronisation cross-tab détectée');
                this.handleExternalChange(event);
            }
        });
    }

    /**
     * Rôle : Ajout d'un écouteur de changements
     * Type : Event system - Gestion des callbacks
     */
    addChangeListener(listener) {
        this.changeListeners.push(listener);
    }

    /**
     * Rôle : Génération du HTML final de la présentation
     * Type : Export system - Génération de code
     */
    generateHTML() {
        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.projectData.name}</title>
    <link rel="stylesheet" href="assets/css/presentation.css">
    <style>
        ${this.generateCustomCSS()}
    </style>
</head>
<body>
    ${this.generateBodyHTML()}
    <script src="assets/js/presentation.js"></script>
</body>
</html>`;
        
        return html;
    }

    /**
     * Rôle : Génération du CSS personnalisé
     * Type : Style generation - CSS dynamique
     */
    generateCustomCSS() {
        let css = `:root {\n`;
        
        // Variables CSS pour les couleurs du thème
        Object.entries(this.projectData.style.colors).forEach(([key, value]) => {
            css += `  --color-${key}: ${value};\n`;
        });
        
        css += `}\n\n`;
        
        // Styles pour chaque widget
        this.widgets.forEach((widget, widgetId) => {
            if (widget.style) {
                css += `#${widgetId} {\n`;
                Object.entries(widget.style).forEach(([property, value]) => {
                    const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
                    css += `  ${cssProperty}: ${value};\n`;
                });
                css += `}\n\n`;
            }
        });
        
        return css;
    }

    /**
     * Rôle : Génération du HTML du corps de la présentation
     * Type : HTML generation - Structure DOM
     */
    generateBodyHTML() {
        let html = '<main class="presentation-main">\n';
        
        this.projectData.metaSections.forEach(metaSection => {
            html += `  <div class="meta-section" data-meta-section="${metaSection.id}">\n`;
            
            metaSection.sections.forEach(section => {
                html += `    <section class="content-section" data-section="${section.id}">\n`;
                
                section.widgets.forEach(widget => {
                    html += this.generateWidgetHTML(widget);
                });
                
                html += `    </section>\n`;
            });
            
            html += `  </div>\n`;
        });
        
        html += '</main>\n';
        return html;
    }

    /**
     * Rôle : Génération du HTML d'un widget spécifique
     * Type : Widget rendering - Rendu HTML
     */
    generateWidgetHTML(widget) {
        const template = this.widgetTemplates.get(widget.type);
        if (!template) return '';
        
        let html = `<div id="${widget.id}" class="widget widget-${widget.type}">\n`;
        
        switch (widget.type) {
            case 'header':
                html += this.generateHeaderHTML(widget);
                break;
            case 'hero':
                html += this.generateHeroHTML(widget);
                break;
            case 'advantage_list':
            case 'weakness_list':
                html += this.generateListHTML(widget);
                break;
            case 'pricing_table':
                html += this.generatePricingHTML(widget);
                break;
            case 'text_block':
                html += this.generateTextBlockHTML(widget);
                break;
            default:
                html += this.generateGenericWidgetHTML(widget);
        }
        
        html += `</div>\n`;
        return html;
    }

    /**
     * Rôle : Génération HTML pour widget header
     */
    generateHeaderHTML(widget) {
        const { title, subtitle, logo } = widget.data;
        let html = '';
        
        if (logo) {
            html += `<div class="header-logo"><img src="${logo}" alt="Logo"></div>\n`;
        }
        if (title) {
            html += `<h1 class="header-title">${title}</h1>\n`;
        }
        if (subtitle) {
            html += `<p class="header-subtitle">${subtitle}</p>\n`;
        }
        
        return html;
    }

    /**
     * Rôle : Export du projet complet vers un dossier
     * Type : File system - Export de projet
     */
    exportProject() {
        const projectPath = `projects/${this.projectId}`;
        
        // Génération des fichiers
        const files = {
            'presentation.html': this.generateHTML(),
            'data.json': JSON.stringify(this.projectData, null, 2),
            'assets/css/custom.css': this.generateCustomCSS(),
            'assets/js/custom.js': this.generateCustomJS()
        };
        
        console.log(`📦 Projet exporté vers: ${projectPath}`);
        return files;
    }

    // Méthodes utilitaires pour l'interface
    getMetaSectionName(type) {
        const names = {
            'header': 'En-tête',
            'content': 'Contenu',
            'comparison': 'Comparaison',
            'pricing': 'Tarification',
            'contact': 'Contact',
            'footer': 'Pied de page'
        };
        return names[type] || type;
    }

    getDefaultMetaSectionStyle(type) {
        const styles = {
            'header': { background: 'var(--color-primary)', color: 'white' },
            'content': { background: 'white' },
            'comparison': { background: '#f8fafc' },
            'pricing': { background: '#f1f5f9' },
            'contact': { background: 'var(--color-secondary)', color: 'white' },
            'footer': { background: '#1f2937', color: 'white' }
        };
        return styles[type] || {};
    }

    // Réorganisation des éléments
    reorderMetaSections() {
        this.projectData.metaSections.forEach((metaSection, index) => {
            metaSection.order = index;
        });
        this.triggerSync();
    }

    reorderSections(metaSectionId) {
        const metaSection = this.projectData.metaSections.find(ms => ms.id === metaSectionId);
        if (metaSection) {
            metaSection.sections.forEach((section, index) => {
                section.order = index;
            });
            this.triggerSync();
        }
    }

    reorderWidgets(sectionId) {
        const section = this.findSection(sectionId);
        if (section) {
            section.widgets.forEach((widget, index) => {
                widget.order = index;
            });
            this.triggerSync();
        }
    }
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PresentationEngine;
} else if (typeof window !== 'undefined') {
    window.PresentationEngine = PresentationEngine;
}
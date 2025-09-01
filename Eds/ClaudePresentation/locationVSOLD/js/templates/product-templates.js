/**
 * EDS Product Templates - Bibliothèque de Templates Produits
 * 
 * Rôle : Définir tous les templates de produits disponibles
 * Type : Catalogue modulaire de configurations produits
 * Utilisation : Importé par EDS Framework pour génération dynamique
 * 
 * Structure : Chaque template contient :
 * - Métadonnées produit (nom, type, catégorie)
 * - Configuration de présentation
 * - Textes multilingues
 * - Paramètres visuels spécifiques
 * - Comparaisons concurrentielles optionnelles
 */

(function(window) {
    'use strict';

    /**
     * Template Li-CUBE PRO™
     * 
     * Rôle : Template pour système de géolocalisation véhicules
     * Type : Produit hardware avec mode location prioritaire
     * Langues : Français, Anglais
     * Comparaison : Oui (vs concurrents du marché)
     */
    const LICUBE_PRO_TEMPLATE = {
        // Métadonnées produit
        id: 'licube-pro',
        name: 'Li-CUBE PRO™',
        type: 'hardware',
        category: 'location',
        hasCompetitorComparison: true,
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en'],
        
        // Description produit
        description: {
            fr: 'Système de géolocalisation avancé pour véhicules de location',
            en: 'Advanced GPS tracking system for rental vehicles'
        },
        
        // Configuration visuelle spécifique
        visualConfig: {
            primaryColor: '#10B981',
            secondaryColor: '#14B8A6',
            productImage: './images/Li-CUBE PRO.png',
            logoPath: './images/logo edsquebec.png',
            theme: 'tech-premium'
        },
        
        // Textes multilingues
        content: {
            fr: {
                heroTitle: 'Li-CUBE PRO™',
                heroSubtitle: 'La révolution de la géolocalisation véhicule',
                heroDescription: 'Système de tracking avancé conçu pour optimiser la gestion de vos flottes de véhicules.',
                
                // Section tarification
                pricingTitle: 'Tarifs Location',
                pricingSubtitle: 'Solutions adaptées à tous vos besoins',
                
                // Section avantages
                advantagesTitle: 'Pourquoi choisir Li-CUBE PRO™',
                advantagesSubtitle: 'Technologies de pointe pour professionnels',
                
                // Section contact
                contactTitle: 'Demande de Devis',
                contactSubtitle: 'Obtenez votre offre personnalisée'
            },
            en: {
                heroTitle: 'Li-CUBE PRO™',
                heroSubtitle: 'The vehicle tracking revolution',
                heroDescription: 'Advanced tracking system designed to optimize your vehicle fleet management.',
                
                pricingTitle: 'Rental Pricing',
                pricingSubtitle: 'Solutions tailored to all your needs',
                
                advantagesTitle: 'Why choose Li-CUBE PRO™',
                advantagesSubtitle: 'Cutting-edge technology for professionals',
                
                contactTitle: 'Request Quote',
                contactSubtitle: 'Get your personalized offer'
            }
        },
        
        // Configuration comparaison concurrentielle
        competitorComparison: {
            enabled: true,
            competitorName: 'Concurrent Standard',
            competitorImage: './images/concurrent.png',
            
            // Points de comparaison
            comparisonPoints: {
                fr: {
                    strengths: [
                        { emoji: '🔋', text: 'Autonomie 30 jours' },
                        { emoji: '🛡️', text: 'Étanchéité IP68' },
                        { emoji: '📡', text: 'Double connectivité' },
                        { emoji: '⚡', text: 'Installation 5 min' },
                        { emoji: '🌡️', text: 'Résistance -40°/+85°' },
                        { emoji: '🍃', text: 'Éco-responsable' },
                        { emoji: '🛡️', text: 'Garantie 3 ans' },
                        { emoji: '💰', text: 'Prix compétitif' },
                        { emoji: '🇨🇦', text: 'Fabriqué au Canada' }
                    ],
                    weaknesses: [
                        { emoji: '☠️', text: 'Technologie obsolète' },
                        { emoji: '🔧', text: 'Installation complexe' },
                        { emoji: '⏳', text: 'Temps de réponse lent' },
                        { emoji: '🐌', text: 'Interface dépassée' },
                        { emoji: '📵', text: 'Connectivité limitée' },
                        { emoji: '💸', text: 'Coûts cachés' }
                    ]
                },
                en: {
                    strengths: [
                        { emoji: '🔋', text: '30-day battery life' },
                        { emoji: '🛡️', text: 'IP68 waterproof' },
                        { emoji: '📡', text: 'Dual connectivity' },
                        { emoji: '⚡', text: '5-min installation' },
                        { emoji: '🌡️', text: '-40°/+85° resistance' },
                        { emoji: '🍃', text: 'Eco-friendly' },
                        { emoji: '🛡️', text: '3-year warranty' },
                        { emoji: '💰', text: 'Competitive price' },
                        { emoji: '🇨🇦', text: 'Made in Canada' }
                    ],
                    weaknesses: [
                        { emoji: '☠️', text: 'Obsolete technology' },
                        { emoji: '🔧', text: 'Complex installation' },
                        { emoji: '⏳', text: 'Slow response time' },
                        { emoji: '🐌', text: 'Outdated interface' },
                        { emoji: '📵', text: 'Limited connectivity' },
                        { emoji: '💸', text: 'Hidden costs' }
                    ]
                }
            }
        },
        
        // Configuration sections spécifiques
        sectionsConfig: {
            hero: { enabled: true, order: 1 },
            pricing: { enabled: true, order: 2 },
            advantages: { enabled: true, order: 3 },
            comparison: { enabled: true, order: 4 },
            contact: { enabled: true, order: 5 }
        },
        
        // Configuration modes de présentation
        presentationModes: {
            location: {
                enabled: true,
                pricingType: 'rental',
                ctaText: { fr: 'Demander un Devis', en: 'Request Quote' },
                features: ['calendar-availability', 'deposit-calculator', 'rental-terms']
            },
            vente: {
                enabled: false, // Li-CUBE PRO n'est pas en vente directe
                pricingType: 'sale',
                ctaText: { fr: 'Acheter', en: 'Buy Now' }
            }
        }
    };

    /**
     * Template Geek&Dragon Coins
     * 
     * Rôle : Template pour collection de pièces jeu de rôle
     * Type : Produit collectible avec mode vente prioritaire
     * Langues : Français, Anglais
     * Comparaison : Non (produit unique)
     */
    const GEEKNDRAGON_COINS_TEMPLATE = {
        id: 'geekndragon-coins',
        name: 'Pièces Geek&Dragon',
        type: 'collectible',
        category: 'vente',
        hasCompetitorComparison: false,
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en'],
        
        description: {
            fr: 'Collection authentique de pièces métalliques pour jeux de rôle',
            en: 'Authentic collection of metal coins for role-playing games'
        },
        
        visualConfig: {
            primaryColor: '#D97706', // Couleur or
            secondaryColor: '#92400E',
            productImage: './images/coins-collection.jpg',
            logoPath: './images/geekndragon-logo.png',
            theme: 'medieval-fantasy'
        },
        
        content: {
            fr: {
                heroTitle: 'Pièces Geek&Dragon',
                heroSubtitle: 'L\'immersion tactile ultime',
                heroDescription: 'Découvrez notre collection de pièces métalliques authentiques pour enrichir vos parties de jeu de rôle.',
                
                pricingTitle: 'Collections Disponibles',
                pricingSubtitle: 'Du débutant au maître de jeu',
                
                advantagesTitle: 'Pourquoi nos pièces',
                advantagesSubtitle: 'Qualité et immersion garanties',
                
                contactTitle: 'Commande & Livraison',
                contactSubtitle: 'Recevez votre trésor rapidement'
            },
            en: {
                heroTitle: 'Geek&Dragon Coins',
                heroSubtitle: 'Ultimate tactile immersion',
                heroDescription: 'Discover our collection of authentic metal coins to enrich your role-playing game sessions.',
                
                pricingTitle: 'Available Collections',
                pricingSubtitle: 'From beginner to game master',
                
                advantagesTitle: 'Why our coins',
                advantagesSubtitle: 'Quality and immersion guaranteed',
                
                contactTitle: 'Order & Delivery',
                contactSubtitle: 'Receive your treasure quickly'
            }
        },
        
        sectionsConfig: {
            hero: { enabled: true, order: 1 },
            pricing: { enabled: true, order: 2 },
            advantages: { enabled: true, order: 3 },
            comparison: { enabled: false }, // Pas de comparaison
            contact: { enabled: true, order: 4 }
        },
        
        presentationModes: {
            vente: {
                enabled: true,
                pricingType: 'sale',
                ctaText: { fr: 'Ajouter au Panier', en: 'Add to Cart' },
                features: ['stock-counter', 'shipping-calculator', 'bulk-discounts']
            },
            location: {
                enabled: false // Pièces non disponibles en location
            }
        }
    };

    /**
     * Template Générique
     * 
     * Rôle : Template de base personnalisable pour tout type de produit
     * Type : Modèle universel adaptable
     * Langues : Français, Anglais, Espagnol, Allemand
     * Comparaison : Configurable
     */
    const GENERIC_TEMPLATE = {
        id: 'generic-product',
        name: 'Produit Générique',
        type: 'generic',
        category: 'configurable',
        hasCompetitorComparison: true, // Configurable
        defaultLanguage: 'fr',
        supportedLanguages: ['fr', 'en', 'es', 'de'],
        
        description: {
            fr: 'Template de base personnalisable pour tout type de produit',
            en: 'Customizable base template for any type of product',
            es: 'Plantilla base personalizable para cualquier tipo de producto',
            de: 'Anpassbare Basisvorlage für jede Art von Produkt'
        },
        
        visualConfig: {
            primaryColor: '#6366F1', // Indigo neutre
            secondaryColor: '#4F46E5',
            productImage: './images/placeholder-product.jpg',
            logoPath: './images/logo-placeholder.png',
            theme: 'modern-clean'
        },
        
        content: {
            fr: {
                heroTitle: '[Nom du Produit]',
                heroSubtitle: '[Slogan accrocheur]',
                heroDescription: '[Description détaillée du produit ou service]',
                
                pricingTitle: 'Nos Tarifs',
                pricingSubtitle: 'Solutions adaptées à vos besoins',
                
                advantagesTitle: 'Nos Avantages',
                advantagesSubtitle: 'Pourquoi nous choisir',
                
                contactTitle: 'Nous Contacter',
                contactSubtitle: 'Obtenez plus d\'informations'
            },
            en: {
                heroTitle: '[Product Name]',
                heroSubtitle: '[Catchy Slogan]',
                heroDescription: '[Detailed description of the product or service]',
                
                pricingTitle: 'Our Pricing',
                pricingSubtitle: 'Solutions tailored to your needs',
                
                advantagesTitle: 'Our Advantages',
                advantagesSubtitle: 'Why choose us',
                
                contactTitle: 'Contact Us',
                contactSubtitle: 'Get more information'
            },
            es: {
                heroTitle: '[Nombre del Producto]',
                heroSubtitle: '[Eslogan Atractivo]',
                heroDescription: '[Descripción detallada del producto o servicio]',
                
                pricingTitle: 'Nuestros Precios',
                pricingSubtitle: 'Soluciones adaptadas a sus necesidades',
                
                advantagesTitle: 'Nuestras Ventajas',
                advantagesSubtitle: 'Por qué elegirnos',
                
                contactTitle: 'Contáctanos',
                contactSubtitle: 'Obtén más información'
            },
            de: {
                heroTitle: '[Produktname]',
                heroSubtitle: '[Einprägsamer Slogan]',
                heroDescription: '[Detaillierte Beschreibung des Produkts oder der Dienstleistung]',
                
                pricingTitle: 'Unsere Preise',
                pricingSubtitle: 'Lösungen nach Ihren Bedürfnissen',
                
                advantagesTitle: 'Unsere Vorteile',
                advantagesSubtitle: 'Warum uns wählen',
                
                contactTitle: 'Kontaktieren Sie uns',
                contactSubtitle: 'Weitere Informationen erhalten'
            }
        },
        
        sectionsConfig: {
            hero: { enabled: true, order: 1 },
            pricing: { enabled: true, order: 2 },
            advantages: { enabled: true, order: 3 },
            comparison: { enabled: true, order: 4, configurable: true },
            contact: { enabled: true, order: 5 }
        },
        
        presentationModes: {
            vente: {
                enabled: true,
                pricingType: 'sale',
                ctaText: { 
                    fr: 'Acheter', 
                    en: 'Buy Now', 
                    es: 'Comprar', 
                    de: 'Kaufen' 
                }
            },
            location: {
                enabled: true,
                pricingType: 'rental',
                ctaText: { 
                    fr: 'Louer', 
                    en: 'Rent', 
                    es: 'Alquilar', 
                    de: 'Mieten' 
                }
            },
            service: {
                enabled: true,
                pricingType: 'service',
                ctaText: { 
                    fr: 'Demander', 
                    en: 'Request', 
                    es: 'Solicitar', 
                    de: 'Anfragen' 
                }
            }
        }
    };

    /**
     * Template Software/SaaS
     * 
     * Rôle : Template spécialisé pour produits logiciels
     * Type : Produit numérique avec abonnements
     * Langues : Français, Anglais
     * Comparaison : Oui (vs concurrents SaaS)
     */
    const SOFTWARE_TEMPLATE = {
        id: 'software-saas',
        name: 'Logiciel SaaS',
        type: 'software',
        category: 'service',
        hasCompetitorComparison: true,
        defaultLanguage: 'en',
        supportedLanguages: ['fr', 'en'],
        
        description: {
            fr: 'Solution logicielle en tant que service (SaaS)',
            en: 'Software as a Service (SaaS) solution'
        },
        
        visualConfig: {
            primaryColor: '#8B5CF6', // Violet tech
            secondaryColor: '#7C3AED',
            productImage: './images/software-dashboard.jpg',
            logoPath: './images/software-logo.png',
            theme: 'tech-modern'
        },
        
        content: {
            fr: {
                heroTitle: '[Nom du Logiciel]',
                heroSubtitle: 'La solution qui révolutionne votre travail',
                heroDescription: 'Découvrez notre plateforme SaaS qui transforme votre façon de travailler.',
                
                pricingTitle: 'Plans d\'Abonnement',
                pricingSubtitle: 'Choisissez la formule qui vous convient',
                
                advantagesTitle: 'Fonctionnalités Avancées',
                advantagesSubtitle: 'Tout ce dont vous avez besoin',
                
                contactTitle: 'Essai Gratuit',
                contactSubtitle: 'Testez sans engagement'
            },
            en: {
                heroTitle: '[Software Name]',
                heroSubtitle: 'The solution that revolutionizes your work',
                heroDescription: 'Discover our SaaS platform that transforms the way you work.',
                
                pricingTitle: 'Subscription Plans',
                pricingSubtitle: 'Choose the plan that suits you',
                
                advantagesTitle: 'Advanced Features',
                advantagesSubtitle: 'Everything you need',
                
                contactTitle: 'Free Trial',
                contactSubtitle: 'Test without commitment'
            }
        },
        
        sectionsConfig: {
            hero: { enabled: true, order: 1 },
            pricing: { enabled: true, order: 2 },
            advantages: { enabled: true, order: 3 },
            comparison: { enabled: true, order: 4 },
            contact: { enabled: true, order: 5 }
        },
        
        presentationModes: {
            service: {
                enabled: true,
                pricingType: 'subscription',
                ctaText: { fr: 'Essayer Gratuitement', en: 'Start Free Trial' },
                features: ['free-trial', 'feature-comparison', 'api-access']
            }
        }
    };

    /**
     * Catalogue Principal des Templates
     * 
     * Rôle : Point central d'accès à tous les templates disponibles
     * Type : Index des configurations produits
     */
    const PRODUCT_TEMPLATES_CATALOG = {
        'licube-pro': LICUBE_PRO_TEMPLATE,
        'geekndragon-coins': GEEKNDRAGON_COINS_TEMPLATE,
        'generic-product': GENERIC_TEMPLATE,
        'software-saas': SOFTWARE_TEMPLATE
    };

    /**
     * Métadonnées du Catalogue
     * 
     * Rôle : Informations sur la collection de templates
     * Type : Statistiques et configuration globale
     */
    const CATALOG_METADATA = {
        version: '2.0.0',
        totalTemplates: Object.keys(PRODUCT_TEMPLATES_CATALOG).length,
        lastUpdated: '2025-01-01',
        
        // Statistiques par type
        typeStatistics: {
            hardware: 1,
            collectible: 1,
            software: 1,
            generic: 1
        },
        
        // Langues supportées globalement
        globalLanguages: ['fr', 'en', 'es', 'de'],
        
        // Modes supportés globalement
        globalModes: ['vente', 'location', 'service']
    };

    /**
     * Fonctions utilitaires pour les templates
     */
    const TemplateUtils = {
        /**
         * Récupération d'un template par ID
         * 
         * Args:
         *   templateId (string): Identifiant du template
         * 
         * Returns:
         *   object|null: Configuration du template ou null si non trouvé
         */
        getTemplate(templateId) {
            return PRODUCT_TEMPLATES_CATALOG[templateId] || null;
        },

        /**
         * Liste de tous les templates disponibles
         * 
         * Returns:
         *   array: Liste des templates avec métadonnées
         */
        getAllTemplates() {
            return Object.keys(PRODUCT_TEMPLATES_CATALOG).map(id => ({
                id,
                ...PRODUCT_TEMPLATES_CATALOG[id]
            }));
        },

        /**
         * Filtrage des templates par critères
         * 
         * Args:
         *   filters (object): Critères de filtrage
         * 
         * Returns:
         *   array: Templates correspondant aux critères
         */
        filterTemplates(filters) {
            return this.getAllTemplates().filter(template => {
                if (filters.type && template.type !== filters.type) return false;
                if (filters.category && template.category !== filters.category) return false;
                if (filters.language && !template.supportedLanguages.includes(filters.language)) return false;
                if (filters.hasComparison !== undefined && template.hasCompetitorComparison !== filters.hasComparison) return false;
                
                return true;
            });
        },

        /**
         * Validation d'un template
         * 
         * Args:
         *   template (object): Configuration de template à valider
         * 
         * Returns:
         *   object: Résultat de validation { isValid, errors }
         */
        validateTemplate(template) {
            const errors = [];
            
            // Validation : propriétés requises
            const requiredFields = ['id', 'name', 'type', 'category'];
            requiredFields.forEach(field => {
                if (!template[field]) {
                    errors.push(`Champ requis manquant: ${field}`);
                }
            });
            
            // Validation : langues
            if (!template.supportedLanguages || template.supportedLanguages.length === 0) {
                errors.push('Au moins une langue doit être supportée');
            }
            
            // Validation : contenu multilingue
            if (template.content) {
                template.supportedLanguages.forEach(lang => {
                    if (!template.content[lang]) {
                        errors.push(`Contenu manquant pour la langue: ${lang}`);
                    }
                });
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        }
    };

    // Exposition : API publique dans window
    window.EDSProductTemplates = {
        catalog: PRODUCT_TEMPLATES_CATALOG,
        metadata: CATALOG_METADATA,
        utils: TemplateUtils,
        
        // Templates individuels pour accès direct
        templates: {
            licubePro: LICUBE_PRO_TEMPLATE,
            geekndragonCoins: GEEKNDRAGON_COINS_TEMPLATE,
            generic: GENERIC_TEMPLATE,
            software: SOFTWARE_TEMPLATE
        }
    };

    console.log('📦 Catalogue EDS Product Templates chargé:', CATALOG_METADATA.totalTemplates, 'templates disponibles');

})(window);
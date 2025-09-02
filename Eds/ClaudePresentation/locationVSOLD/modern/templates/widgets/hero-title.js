/**
 * ============================================================================
 * WIDGET HERO TITLE - Template et Logique
 * ============================================================================
 * 
 * Rôle : Widget titre principal pour section hero
 * Type : Widget content - Titre avec gradient et animations
 * Usage : Titre principal de présentation avec effet visuel
 */

class HeroTitleWidget {
    constructor() {
        // Configuration : Propriétés du widget titre hero
        this.id = 'hero-title';
        this.name = 'Titre Hero';
        this.category = 'Contenu';
        this.icon = '✨';
        this.description = 'Titre principal avec gradient et animations';
        
        // Données par défaut - Contenu de base
        this.defaultData = {
            title: 'Li-CUBE PRO™',
            subtitle: 'LOCATION INTELLIGENTE<br>ZÉRO RISQUE',
            highlight: true,
            gradient: 'green',
            animation: 'slide-up'
        };
    }

    /**
     * Rôle : Génération du template HTML
     * Type : Template rendering - Structure HTML avec classes
     * Retour : String HTML du widget titre hero
     */
    render(data = {}) {
        // Fusion des données - Combine defaults et données personnalisées
        const widgetData = { ...this.defaultData, ...data };
        
        // Classes CSS - Construction dynamique selon config
        const titleClass = `hero-title ${widgetData.highlight ? 'hero-highlight' : ''} editable`;
        const subtitleClass = `hero-subtitle editable animate-${widgetData.animation}`;
        const gradientClass = `gradient-${widgetData.gradient}`;

        return `
            <div class="hero-text-content">
                <h1 class="${titleClass} ${gradientClass}" 
                    data-field="hero-title"
                    data-widget="hero-title">
                    ${widgetData.title}
                </h1>
                <div class="${subtitleClass}" 
                     data-field="hero-subtitle">
                    ${widgetData.subtitle}
                </div>
            </div>
        `;
    }

    /**
     * Rôle : Styles CSS spécifiques au hero title
     * Type : Styling - CSS avec animations et gradients
     * Retour : String CSS du widget
     */
    getStyles() {
        return `
            .hero-text-content {
                text-align: center;
                margin-bottom: var(--spacing-2xl);
            }

            .hero-title {
                font-size: clamp(2rem, 8vw, 6rem);
                font-weight: var(--font-black);
                font-family: var(--font-heading);
                line-height: 1.1;
                margin-bottom: var(--spacing-lg);
                position: relative;
            }

            .hero-highlight {
                background: var(--gradient-green);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                background-size: 200% 200%;
                animation: gradient-shift 4s ease-in-out infinite;
            }

            .gradient-green {
                background: var(--gradient-green);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .gradient-blue {
                background: var(--gradient-blue);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .hero-subtitle {
                font-size: clamp(1.25rem, 4vw, 2rem);
                font-weight: var(--font-semibold);
                color: var(--text-gray);
                line-height: 1.3;
                max-width: 800px;
                margin: 0 auto;
                position: relative;
            }

            .animate-slide-up {
                opacity: 0;
                transform: translateY(30px);
                animation: slideUpFade 1s ease-out 0.3s forwards;
            }

            .animate-fade-in {
                opacity: 0;
                animation: fadeInScale 1s ease-out 0.5s forwards;
            }

            @keyframes gradient-shift {
                0%, 100% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
            }

            @keyframes slideUpFade {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes fadeInScale {
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            /* Responsive - Adaptations mobiles */
            @media (max-width: 768px) {
                .hero-title {
                    font-size: clamp(1.5rem, 6vw, 3rem);
                }

                .hero-subtitle {
                    font-size: clamp(1rem, 3vw, 1.5rem);
                }
            }
        `;
    }

    /**
     * Rôle : Configuration des champs éditables
     * Type : Editor config - Définition interface édition
     * Retour : Array des champs configurables
     */
    getEditableFields() {
        return [
            {
                name: 'title',
                label: 'Titre principal',
                type: 'text',
                defaultValue: 'Li-CUBE PRO\u2122'
            },
            {
                name: 'subtitle',
                label: 'Sous-titre',
                type: 'textarea',
                defaultValue: 'LOCATION INTELLIGENTE<br>ZÉRO RISQUE'
            },
            {
                name: 'gradient',
                label: 'Type de gradient',
                type: 'select',
                options: [
                    { value: 'green', label: 'Vert (défaut)' },
                    { value: 'blue', label: 'Bleu' }
                ],
                defaultValue: 'green'
            },
            {
                name: 'animation',
                label: 'Animation d\'entrée',
                type: 'select',
                options: [
                    { value: 'slide-up', label: 'Glissement vers le haut' },
                    { value: 'fade-in', label: 'Apparition en fondu' }
                ],
                defaultValue: 'slide-up'
            }
        ];
    }

    /**
     * Rôle : Comportement interactif du widget
     * Type : Interactive behavior - Gestion des événements
     */
    attachBehavior(element) {
        const title = element.querySelector('.hero-title');
        const subtitle = element.querySelector('.hero-subtitle');

        // Animation de typing - Effet machine à écrire
        if (title) {
            title.addEventListener('mouseenter', () => {
                title.style.transform = 'scale(1.05)';
                title.style.transition = 'transform 0.3s ease';
            });

            title.addEventListener('mouseleave', () => {
                title.style.transform = 'scale(1)';
            });
        }

        // Effet de brillance au scroll
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible');
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (title) observer.observe(title);
        if (subtitle) observer.observe(subtitle);
    }

    /**
     * Rôle : Validation des données saisies
     * Type : Data validation - Contrôles de cohérence
     */
    validate(data) {
        const errors = [];

        // Validation titre - Longueur et contenu
        if (!data.title || data.title.trim() === '') {
            errors.push('Le titre principal est obligatoire');
        } else if (data.title.length > 100) {
            errors.push('Le titre ne peut pas dépasser 100 caractères');
        }

        // Validation sous-titre - HTML basique autorisé
        if (data.subtitle && data.subtitle.length > 300) {
            errors.push('Le sous-titre ne peut pas dépasser 300 caractères');
        }

        // Validation HTML - Seulement balises autorisées
        if (data.subtitle && /<(?!\/?(br|strong|em|b|i)(\s[^>]*)?\/?>)[^>]*>/.test(data.subtitle)) {
            errors.push('Seules les balises br, strong, em, b, i sont autorisées dans le sous-titre');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Rôle : Configuration pour l'éditeur visuel
     * Type : Editor integration - Interface utilisateur
     */
    getEditorConfig() {
        return {
            preview: true,
            inlineEdit: true,
            resizable: false,
            dragHandle: '.hero-title',
            toolbar: [
                'bold', 'italic', 'link', '|', 
                'gradient-selector', 'animation-selector'
            ]
        };
    }
}

// Export pour utilisation
export default HeroTitleWidget;
/**
 * ============================================================================
 * WIDGET LOGO - Template et Logique
 * ============================================================================
 * 
 * Rôle : Widget logo avec gestion d'image et hover effects
 * Type : Widget navigation - Composant réutilisable
 * Usage : Utilisé dans navbar et header sections
 */

class LogoWidget {
    constructor() {
        // Configuration : Propriétés du widget logo
        this.id = 'logo';
        this.name = 'Logo';
        this.category = 'navigation';
        this.icon = '🏢';
        this.description = 'Logo avec image et effets hover';
        
        // Données par défaut - Valeurs de base
        this.defaultData = {
            imagePath: './images/logo edsquebec.png',
            altText: 'Logo EDS Québec',
            width: '50px',
            height: '50px',
            link: '#'
        };
    }

    /**
     * Rôle : Génération du template HTML
     * Type : Template rendering - HTML structure
     * Retour : String HTML du widget logo
     */
    render(data = {}) {
        // Fusion des données - Combine defaults et données fournies
        const widgetData = { ...this.defaultData, ...data };
        
        return `
            <a href="${widgetData.link}" 
               class="nav-logo editable" 
               data-field="logo-path" 
               data-image-field="logo-path"
               style="background-image: url('${widgetData.imagePath}');">
                <span class="sr-only">${widgetData.altText}</span>
            </a>
        `;
    }

    /**
     * Rôle : Styles CSS spécifiques au widget logo
     * Type : Styling - CSS component styles
     * Retour : String CSS du widget
     */
    getStyles() {
        return `
            .nav-logo {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                background: rgba(16, 185, 129, 0.1);
                border: 2px solid rgba(16, 185, 129, 0.3);
                background-size: 80%;
                background-repeat: no-repeat;
                background-position: center;
                transition: var(--transition-normal);
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }

            .nav-logo:hover {
                background-color: rgba(16, 185, 129, 0.2);
                transform: scale(1.05);
                box-shadow: var(--shadow-glow);
            }

            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
    }

    /**
     * Rôle : Configuration des champs éditables
     * Type : Editor config - Définition des champs
     * Retour : Array des champs éditables
     */
    getEditableFields() {
        return [
            {
                id: 'logo-path',
                name: 'Chemin de l\'image',
                type: 'image',
                required: true,
                description: 'Chemin vers l\'image du logo'
            },
            {
                id: 'alt-text',
                name: 'Texte alternatif',
                type: 'text',
                required: true,
                description: 'Description du logo pour l\'accessibilité'
            },
            {
                id: 'link',
                name: 'Lien de destination',
                type: 'url',
                required: false,
                description: 'URL de redirection au clic'
            }
        ];
    }

    /**
     * Rôle : JavaScript interactif du widget
     * Type : Interactive behavior - Événements et animations
     */
    attachBehavior(element) {
        // Gestion du changement d'image en temps réel
        const imageField = element.querySelector('[data-image-field="logo-path"]');
        if (imageField) {
            // Écouter les mises à jour d'image
            window.addEventListener('imageUpdate', (event) => {
                if (event.detail.field === 'logo-path') {
                    imageField.style.backgroundImage = `url('${event.detail.value}')`;
                }
            });
        }

        // Animation au hover - Effet de brillance
        element.addEventListener('mouseenter', () => {
            element.style.filter = 'brightness(1.1)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.filter = 'brightness(1)';
        });
    }

    /**
     * Rôle : Validation des données du widget
     * Type : Data validation - Contrôle de cohérence
     */
    validate(data) {
        const errors = [];

        // Validation image path - Vérification du chemin
        if (!data.imagePath || data.imagePath.trim() === '') {
            errors.push('Le chemin de l\'image est requis');
        }

        // Validation alt text - Accessibilité
        if (!data.altText || data.altText.trim() === '') {
            errors.push('Le texte alternatif est requis pour l\'accessibilité');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Export pour utilisation
export default LogoWidget;
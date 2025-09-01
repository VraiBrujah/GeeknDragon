/**
 * ============================================================================
 * WIDGET PRICING CARD - Template et Logique
 * ============================================================================
 * 
 * Rôle : Widget carte de tarification avec plan, prix et fonctionnalités
 * Type : Widget pricing - Composant de vente
 * Usage : Cartes de prix pour section pricing avec CTA
 */

class PricingCardWidget {
    constructor() {
        // Configuration : Propriétés du widget pricing card
        this.id = 'pricing-card';
        this.name = 'Carte Tarification';
        this.category = 'pricing';
        this.icon = '💰';
        this.description = 'Carte de prix avec plan et fonctionnalités';
        
        // Données par défaut - Plan de base
        this.defaultData = {
            planName: 'ESSENTIEL',
            price: '299',
            currency: '$',
            period: '/mois',
            featured: false,
            ctaText: 'Choisir ce plan',
            ctaLink: '#contact',
            features: [
                'Installation gratuite',
                'Maintenance incluse',
                'Support par email',
                'Jusqu\'à 50 équipements'
            ],
            badge: null
        };
    }

    /**
     * Rôle : Génération du template HTML
     * Type : Template rendering - Structure carte pricing
     * Retour : String HTML du widget pricing card
     */
    render(data = {}) {
        // Fusion des données - Combine defaults et données du plan
        const cardData = { ...this.defaultData, ...data };
        
        // Classes CSS - Construction selon statut featured
        const cardClass = `pricing-card ${cardData.featured ? 'featured' : ''} animate-on-scroll`;
        const badgeHtml = cardData.badge ? `<div class="pricing-badge">${cardData.badge}</div>` : '';
        
        // Génération des fonctionnalités - Liste avec icônes
        const featuresHtml = cardData.features.map(feature => 
            `<li class="pricing-feature">
                <i class="fas fa-check"></i>
                <span>${feature}</span>
            </li>`
        ).join('');

        return `
            <div class="${cardClass}" data-widget="pricing-card">
                ${badgeHtml}
                
                <div class="pricing-header">
                    <h3 class="pricing-plan editable" data-field="plan-name">
                        ${cardData.planName}
                    </h3>
                    
                    <div class="pricing-price">
                        <span class="pricing-currency">${cardData.currency}</span>
                        <span class="pricing-amount editable" data-field="plan-price">
                            ${cardData.price}
                        </span>
                        <span class="pricing-period">${cardData.period}</span>
                    </div>
                </div>
                
                <div class="pricing-body">
                    <ul class="pricing-features">
                        ${featuresHtml}
                    </ul>
                </div>
                
                <div class="pricing-footer">
                    <a href="${cardData.ctaLink}" 
                       class="btn ${cardData.featured ? 'btn-primary' : 'btn-outline'} pricing-cta editable"
                       data-field="plan-cta">
                        ${cardData.ctaText}
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Rôle : Styles CSS spécifiques à la pricing card
     * Type : Styling - CSS avec états et animations
     * Retour : String CSS du widget
     */
    getStyles() {
        return `
            .pricing-card {
                background: var(--bg-card);
                border: 2px solid var(--border-color);
                border-radius: var(--border-radius-lg);
                padding: var(--spacing-2xl);
                text-align: center;
                position: relative;
                transition: var(--transition-normal);
                backdrop-filter: blur(10px);
                overflow: hidden;
            }

            .pricing-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: var(--gradient-green);
                opacity: 0;
                transition: var(--transition-normal);
            }

            .pricing-card:hover {
                border-color: var(--border-hover);
                transform: translateY(-8px);
                box-shadow: var(--shadow-xl);
            }

            .pricing-card:hover::before {
                opacity: 1;
            }

            .pricing-card.featured {
                border-color: var(--accent-green);
                background: rgba(16, 185, 129, 0.05);
                transform: scale(1.05);
                z-index: 10;
            }

            .pricing-card.featured::before {
                opacity: 1;
                height: 6px;
                background: var(--gradient-green);
            }

            .pricing-badge {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: var(--gradient-green);
                color: var(--text-white);
                padding: var(--spacing-xs) var(--spacing-md);
                border-radius: var(--border-radius);
                font-size: var(--text-xs);
                font-weight: var(--font-bold);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .pricing-header {
                margin-bottom: var(--spacing-2xl);
            }

            .pricing-plan {
                font-size: var(--text-xl);
                font-weight: var(--font-bold);
                color: var(--text-white);
                margin-bottom: var(--spacing-lg);
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }

            .pricing-price {
                display: flex;
                align-items: baseline;
                justify-content: center;
                gap: var(--spacing-xs);
                margin-bottom: var(--spacing-lg);
            }

            .pricing-currency {
                font-size: var(--text-2xl);
                font-weight: var(--font-semibold);
                color: var(--accent-green);
            }

            .pricing-amount {
                font-size: var(--text-5xl);
                font-weight: var(--font-black);
                color: var(--text-white);
                line-height: 1;
            }

            .pricing-period {
                font-size: var(--text-lg);
                color: var(--text-muted);
                font-weight: var(--font-medium);
            }

            .pricing-body {
                margin-bottom: var(--spacing-2xl);
            }

            .pricing-features {
                list-style: none;
                padding: 0;
                margin: 0;
                text-align: left;
            }

            .pricing-feature {
                display: flex;
                align-items: center;
                gap: var(--spacing-sm);
                margin-bottom: var(--spacing-sm);
                color: var(--text-gray);
                line-height: 1.5;
            }

            .pricing-feature i {
                color: var(--accent-green);
                font-size: var(--text-sm);
                width: 16px;
                flex-shrink: 0;
            }

            .pricing-footer {
                margin-top: auto;
            }

            .pricing-cta {
                width: 100%;
                padding: var(--spacing-md) var(--spacing-lg);
                font-size: var(--text-base);
                font-weight: var(--font-semibold);
                text-transform: uppercase;
                letter-spacing: 0.05em;
                transition: var(--transition-normal);
            }

            .featured .pricing-cta {
                background: var(--gradient-green);
                box-shadow: var(--shadow-glow);
            }

            .featured .pricing-cta:hover {
                box-shadow: var(--shadow-glow), var(--shadow-xl);
                transform: translateY(-2px);
            }

            /* Animations - Effets d'entrée */
            .pricing-card.animate-on-scroll {
                opacity: 0;
                transform: translateY(50px);
                transition: all 0.6s ease-out;
            }

            .pricing-card.animate-on-scroll.visible {
                opacity: 1;
                transform: translateY(0);
            }

            /* Responsive - Adaptations */
            @media (max-width: 768px) {
                .pricing-card {
                    padding: var(--spacing-xl);
                }

                .pricing-card.featured {
                    transform: none;
                    margin-bottom: var(--spacing-lg);
                }

                .pricing-amount {
                    font-size: var(--text-4xl);
                }
            }
        `;
    }

    /**
     * Rôle : Configuration des champs éditables
     * Type : Editor config - Définition des champs de prix
     * Retour : Array des champs configurables
     */
    getEditableFields() {
        return [
            {
                name: 'planName',
                label: 'Nom du plan',
                type: 'text',
                defaultValue: 'ESSENTIEL'
            },
            {
                name: 'price',
                label: 'Prix',
                type: 'number',
                min: 0,
                max: 9999,
                defaultValue: '299'
            },
            {
                name: 'currency',
                label: 'Devise',
                type: 'select',
                options: [
                    { value: '$', label: 'Dollar ($)' },
                    { value: '€', label: 'Euro (€)' },
                    { value: '£', label: 'Livre (£)' }
                ],
                defaultValue: '$'
            },
            {
                name: 'period',
                label: 'Période',
                type: 'select',
                options: [
                    { value: '/mois', label: 'Par mois' },
                    { value: '/an', label: 'Par an' },
                    { value: '/jour', label: 'Par jour' }
                ],
                defaultValue: '/mois'
            },
            {
                name: 'ctaText',
                label: 'Texte du bouton',
                type: 'text',
                defaultValue: 'Choisir ce plan'
            },
            {
                name: 'ctaLink',
                label: 'Lien du bouton',
                type: 'text',
                defaultValue: '#contact'
            }
        ];
    }

    /**
     * Rôle : Comportement interactif du widget
     * Type : Interactive behavior - Événements et animations
     */
    attachBehavior(element) {
        // Animation au scroll - Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(element);

        // Effet pulse au hover sur prix
        const priceElement = element.querySelector('.pricing-price');
        if (priceElement) {
            priceElement.addEventListener('mouseenter', () => {
                priceElement.style.transform = 'scale(1.05)';
                priceElement.style.transition = 'transform 0.3s ease';
            });

            priceElement.addEventListener('mouseleave', () => {
                priceElement.style.transform = 'scale(1)';
            });
        }

        // Click tracking pour analytics
        const ctaButton = element.querySelector('.pricing-cta');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                // Événement personnalisé pour tracking
                const planName = element.querySelector('[data-field="plan-name"]')?.textContent;
                window.dispatchEvent(new CustomEvent('pricingCardClick', {
                    detail: { plan: planName, element: element }
                }));
            });
        }
    }

    /**
     * Rôle : Validation des données de la carte
     * Type : Data validation - Contrôles de cohérence
     */
    validate(data) {
        const errors = [];

        // Validation nom du plan
        if (!data.planName || data.planName.trim() === '') {
            errors.push('Le nom du plan est obligatoire');
        }

        // Validation prix - Nombre positif
        if (!data.price || isNaN(parseFloat(data.price)) || parseFloat(data.price) < 0) {
            errors.push('Le prix doit être un nombre positif');
        }

        // Validation CTA - Texte bouton
        if (!data.ctaText || data.ctaText.trim() === '') {
            errors.push('Le texte du bouton d\'action est obligatoire');
        }

        // Validation fonctionnalités - Au moins une
        if (!data.features || !Array.isArray(data.features) || data.features.length === 0) {
            errors.push('Au moins une fonctionnalité doit être définie');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Rôle : Gestion des fonctionnalités dynamiques
     * Type : Features management - CRUD fonctionnalités
     */
    getFeaturesManager() {
        return {
            add: (cardElement, feature) => {
                const featuresList = cardElement.querySelector('.pricing-features');
                const featureHtml = `
                    <li class="pricing-feature">
                        <i class="fas fa-check"></i>
                        <span>${feature}</span>
                    </li>
                `;
                featuresList.insertAdjacentHTML('beforeend', featureHtml);
            },
            
            remove: (cardElement, featureIndex) => {
                const features = cardElement.querySelectorAll('.pricing-feature');
                if (features[featureIndex]) {
                    features[featureIndex].remove();
                }
            },
            
            update: (cardElement, featureIndex, newText) => {
                const features = cardElement.querySelectorAll('.pricing-feature span');
                if (features[featureIndex]) {
                    features[featureIndex].textContent = newText;
                }
            }
        };
    }
}

// Export pour utilisation
export default PricingCardWidget;
/**
 * Snipcart Integration - GeeknDragon D&D Theme
 * ============================================
 * Intégration personnalisée avec thème médiéval/fantasy
 */

class GeeknDragonSnipcart {
    constructor() {
        this.apiKey = window.SNIPCART_API_KEY;
        this.isInitialized = false;
        this.customTheme = true;
        
        this.init();
    }

    /**
     * Initialisation principale de Snipcart
     */
    init() {
        // Vérifier que l'API key existe
        if (!this.apiKey) {
            console.error('GeeknDragon: Snipcart API key manquante');
            return;
        }

        // Charger Snipcart avec notre configuration
        this.loadSnipcart();
        
        // Appliquer notre thème personnalisé
        this.initCustomTheme();
        
        // Configurer les event listeners
        this.setupEventListeners();
    }

    /**
     * Chargement du script Snipcart
     */
    loadSnipcart() {
        // Configuration Snipcart
        window.SnipcartSettings = {
            publicApiKey: this.apiKey,
            loadStrategy: 'on-user-interaction',
            modalStyle: 'side', // Sidebar pour mobile-friendly
            currency: 'cad',
            defaultLanguage: 'fr',
            templatesUrl: '/templates/snipcart-templates.html',
            
            // Configuration e-commerce
            addProductBehavior: 'none', // Pas d'auto-ouverture
            
            // Localisation française
            locales: {
                fr: {
                    cart: {
                        item: 'article',
                        items: 'articles',
                        checkout: 'Finaliser ma Commande',
                        continue_shopping: 'Continuer mes Achats',
                        empty_cart_message: 'Votre sac d\'aventurier est vide...',
                        subtotal: 'Sous-total',
                        total: 'Total de votre Trésor'
                    },
                    checkout: {
                        title: 'Finaliser votre Commande Héroïque',
                        step_customer: 'Informations d\'Aventurier',
                        step_shipping: 'Livraison de votre Trésor',
                        step_billing: 'Paiement Sécurisé',
                        step_confirmation: 'Confirmation de Quête'
                    }
                }
            },

            // Callbacks personnalisés
            ready: () => this.onSnipcartReady(),
            cart: {
                opened: () => this.onCartOpened(),
                closed: () => this.onCartClosed(),
                confirmed: (cart) => this.onOrderConfirmed(cart)
            }
        };

        // Injection du script Snipcart
        const script = document.createElement('script');
        script.src = 'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        // Injection du CSS Snipcart de base
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.snipcart.com/themes/v3.4.1/default/snipcart.css';
        document.head.appendChild(link);
    }

    /**
     * Initialisation du thème personnalisé
     */
    initCustomTheme() {
        // Attendre que Snipcart soit prêt
        document.addEventListener('snipcart.ready', () => {
            this.applySnipcartCustomStyles();
            this.initDnDAnimations();
        });
    }

    /**
     * Application des styles D&D personnalisés
     */
    applySnipcartCustomStyles() {
        // Injection du CSS personnalisé
        const customCSS = `
            <style id="gd-snipcart-theme">
            /* =================================== */
            /* SNIPCART THEME D&D - GEEKNDRAGON   */
            /* =================================== */
            
            /* Variables héritées du site */
            .snipcart {
                --gd-primary: #8b4513;
                --gd-primary-dark: #654321;
                --gd-secondary: #d4af37;
                --gd-accent: #ff6b35;
                --gd-mystical: #6a0dad;
                --gd-dragon-red: #dc143c;
                --gd-parchment: #f4e4bc;
                --gd-dark: #0a0a0a;
                --gd-card: rgba(26,26,26,0.95);
            }

            /* Container principal */
            .snipcart-layout {
                font-family: 'Cinzel', serif !important;
                background: linear-gradient(135deg, var(--gd-dark) 0%, #1a1a1a 100%);
                color: var(--gd-parchment);
            }

            /* Header du panier */
            .snipcart-layout__header {
                background: linear-gradient(135deg, var(--gd-primary) 0%, var(--gd-primary-dark) 100%);
                border-bottom: 2px solid var(--gd-secondary);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6);
            }

            .snipcart-layout__header-title {
                font-family: 'Cinzel', serif !important;
                font-weight: 700;
                color: var(--gd-parchment);
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                font-size: 1.8rem;
            }

            /* Boutons */
            .snipcart-button-primary {
                background: linear-gradient(135deg, var(--gd-secondary) 0%, #b8860b 100%) !important;
                color: var(--gd-dark) !important;
                font-family: 'Cinzel', serif !important;
                font-weight: 600;
                border: 2px solid var(--gd-secondary);
                border-radius: 8px;
                padding: 12px 24px;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            }

            .snipcart-button-primary:hover {
                background: linear-gradient(135deg, #b8860b 0%, var(--gd-secondary) 100%) !important;
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.5);
            }

            .snipcart-button-secondary {
                background: transparent !important;
                color: var(--gd-secondary) !important;
                border: 2px solid var(--gd-secondary);
                font-family: 'Cinzel', serif !important;
                font-weight: 500;
                border-radius: 8px;
                padding: 10px 20px;
                transition: all 0.3s ease;
            }

            .snipcart-button-secondary:hover {
                background: rgba(212, 175, 55, 0.1) !important;
                color: var(--gd-parchment) !important;
            }

            /* Produits dans le panier */
            .snipcart-item {
                background: var(--gd-card) !important;
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 12px;
                margin: 12px 0;
                padding: 16px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                transition: all 0.3s ease;
            }

            .snipcart-item:hover {
                border-color: var(--gd-secondary);
                box-shadow: 0 6px 16px rgba(212, 175, 55, 0.2);
            }

            .snipcart-item__name {
                font-family: 'Cinzel', serif !important;
                font-weight: 600;
                color: var(--gd-secondary) !important;
                font-size: 1.1rem;
            }

            .snipcart-item__price,
            .snipcart-item__total-price {
                font-family: 'Cinzel', serif !important;
                font-weight: 700;
                color: var(--gd-secondary);
            }

            /* Total du panier */
            .snipcart-cart-summary {
                background: var(--gd-card) !important;
                border: 2px solid var(--gd-secondary);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }

            .snipcart-cart-summary__title {
                font-family: 'Cinzel', serif !important;
                font-weight: 700;
                color: var(--gd-secondary);
                font-size: 1.3rem;
                text-align: center;
                margin-bottom: 16px;
            }

            .snipcart-cart-summary__total {
                font-family: 'Cinzel', serif !important;
                font-weight: 700;
                color: var(--gd-parchment) !important;
                font-size: 1.5rem;
                text-align: center;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            }

            /* Formulaire de checkout */
            .snipcart-form__field {
                margin-bottom: 20px;
            }

            .snipcart-form__label {
                font-family: 'Cinzel', serif !important;
                font-weight: 500;
                color: var(--gd-parchment);
                margin-bottom: 8px;
                display: block;
            }

            .snipcart-form__input {
                background: rgba(26, 26, 26, 0.8) !important;
                border: 2px solid rgba(212, 175, 55, 0.3) !important;
                color: var(--gd-parchment) !important;
                font-family: 'Cinzel', serif !important;
                border-radius: 8px;
                padding: 12px 16px;
                width: 100%;
                transition: all 0.3s ease;
            }

            .snipcart-form__input:focus {
                border-color: var(--gd-secondary) !important;
                box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
                outline: none;
            }

            /* Messages de succès/erreur avec thème D&D */
            .snipcart-notification--success {
                background: linear-gradient(135deg, #228b22 0%, #32cd32 100%) !important;
                color: white !important;
                border-left: 4px solid #228b22;
            }

            .snipcart-notification--error {
                background: linear-gradient(135deg, #dc143c 0%, #ff4444 100%) !important;
                color: white !important;
                border-left: 4px solid #dc143c;
            }

            /* Loader personnalisé avec thème D&D */
            .snipcart-loading {
                background: radial-gradient(circle, var(--gd-secondary) 0%, #b8860b 100%);
                animation: gdPulse 2s ease-in-out infinite;
            }

            @keyframes gdPulse {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            /* Close button style */
            .snipcart-layout__close {
                color: var(--gd-secondary) !important;
                font-size: 1.5rem;
                transition: all 0.3s ease;
            }

            .snipcart-layout__close:hover {
                color: var(--gd-parchment) !important;
                transform: scale(1.1);
            }

            /* Responsive pour mobile */
            @media (max-width: 768px) {
                .snipcart-layout {
                    font-size: 0.9rem;
                }
                
                .snipcart-button-primary,
                .snipcart-button-secondary {
                    padding: 10px 16px;
                    font-size: 0.9rem;
                }
            }
            </style>
        `;

        // Injection du CSS dans le head
        document.head.insertAdjacentHTML('beforeend', customCSS);
    }

    /**
     * Animations D&D personnalisées
     */
    initDnDAnimations() {
        // Animation d'ouverture du panier (effet parchemin)
        document.addEventListener('snipcart.cart.opened', () => {
            const cart = document.querySelector('#snipcart');
            if (cart) {
                cart.style.animation = 'gdUnrollParchment 0.6s ease-out';
            }
        });

        // Effet sonore (si Howler.js est disponible)
        if (window.Howl) {
            this.initSoundEffects();
        }

        // Injection des keyframes d'animation
        const animationCSS = `
            <style>
            @keyframes gdUnrollParchment {
                0% { 
                    opacity: 0; 
                    transform: scale(0.8) rotateY(90deg);
                }
                50% { 
                    opacity: 0.5; 
                    transform: scale(0.95) rotateY(45deg);
                }
                100% { 
                    opacity: 1; 
                    transform: scale(1) rotateY(0deg);
                }
            }

            @keyframes gdGoldShimmer {
                0%, 100% { 
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 12px rgba(212, 175, 55, 0.3);
                }
                50% { 
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.6);
                }
            }

            .gd-gold-shimmer {
                animation: gdGoldShimmer 3s ease-in-out infinite;
            }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', animationCSS);
    }

    /**
     * Effets sonores D&D (optionnel)
     */
    initSoundEffects() {
        // Son d'ajout au panier (pièce qui tombe)
        const coinSound = new Howl({
            src: ['/sounds/coin-drop.mp3'],
            volume: 0.3
        });

        // Son d'ouverture du panier
        const openCartSound = new Howl({
            src: ['/sounds/scroll-unroll.mp3'],
            volume: 0.2
        });

        document.addEventListener('snipcart.item.added', () => {
            coinSound.play();
        });

        document.addEventListener('snipcart.cart.opened', () => {
            openCartSound.play();
        });
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Event listeners pour les actions Snipcart
        document.addEventListener('snipcart.ready', this.onSnipcartReady.bind(this));
        document.addEventListener('snipcart.item.added', this.onItemAdded.bind(this));
        document.addEventListener('snipcart.cart.opened', this.onCartOpened.bind(this));
        document.addEventListener('snipcart.cart.closed', this.onCartClosed.bind(this));
        document.addEventListener('snipcart.order.completed', this.onOrderCompleted.bind(this));
    }

    /**
     * Callbacks des événements Snipcart
     */
    onSnipcartReady() {
        console.log('🐉 GeeknDragon Snipcart prêt !');
        this.isInitialized = true;
        
        // Personnalisations post-chargement
        this.customizeCheckoutFlow();
    }

    onItemAdded(event) {
        console.log('⚔️ Article ajouté au sac d\'aventurier:', event.detail.item);
        
        // Animation de confirmation
        this.showAddToCartConfirmation(event.detail.item);
    }

    onCartOpened() {
        console.log('📜 Sac d\'aventurier ouvert');
        
        // Analytics tracking
        if (window.gtag) {
            gtag('event', 'cart_opened', {
                'event_category': 'E-commerce',
                'event_label': 'GeeknDragon Cart'
            });
        }
    }

    onCartClosed() {
        console.log('📜 Sac d\'aventurier fermé');
    }

    onOrderCompleted(event) {
        console.log('🎉 Commande complétée:', event.detail);
        
        // Analytics tracking
        if (window.gtag) {
            gtag('event', 'purchase', {
                'transaction_id': event.detail.token,
                'value': event.detail.totalPrice,
                'currency': 'CAD'
            });
        }

        // Redirection vers page de remerciement
        window.location.href = '/merci.html?order=' + event.detail.token;
    }

    /**
     * Personnalisation du flow de checkout
     */
    customizeCheckoutFlow() {
        // Ajouter des classes CSS personnalisées
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList && node.classList.contains('snipcart')) {
                            this.applyDnDClasses(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }

    /**
     * Application des classes D&D
     */
    applyDnDClasses(element) {
        // Ajouter classe pour effet shimmer sur les prix
        const prices = element.querySelectorAll('.snipcart-item__price, .snipcart-cart-summary__total');
        prices.forEach(price => {
            price.classList.add('gd-gold-shimmer');
        });

        // Autres personnalisations DOM si nécessaire
        const titles = element.querySelectorAll('.snipcart-layout__header-title');
        titles.forEach(title => {
            title.textContent = title.textContent.replace('Cart', 'Sac d\'Aventurier');
        });
    }

    /**
     * Confirmation d'ajout au panier avec animation
     */
    showAddToCartConfirmation(item) {
        // Créer notification personnalisée D&D
        const notification = document.createElement('div');
        notification.className = 'gd-cart-notification';
        notification.innerHTML = `
            <div class="gd-notification-content">
                <div class="gd-notification-icon">⚔️</div>
                <div class="gd-notification-text">
                    <strong>${item.name}</strong> ajouté à votre sac d'aventurier !
                </div>
            </div>
        `;

        // Styles inline pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, var(--gd-primary) 0%, var(--gd-primary-dark) 100%);
            color: var(--gd-parchment);
            padding: 16px 20px;
            border: 2px solid var(--gd-secondary);
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
            z-index: 10000;
            font-family: 'Cinzel', serif;
            font-weight: 600;
            min-width: 300px;
            animation: gdSlideIn 0.5s ease-out forwards;
        `;

        document.body.appendChild(notification);

        // Animation de disparition
        setTimeout(() => {
            notification.style.animation = 'gdSlideOut 0.5s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
}

// Initialisation automatique quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    window.geeknDragonCart = new GeeknDragonSnipcart();
});

// Animations pour les notifications
const notificationAnimations = `
<style>
@keyframes gdSlideIn {
    0% { 
        transform: translateX(100%); 
        opacity: 0; 
    }
    100% { 
        transform: translateX(0); 
        opacity: 1; 
    }
}

@keyframes gdSlideOut {
    0% { 
        transform: translateX(0); 
        opacity: 1; 
    }
    100% { 
        transform: translateX(100%); 
        opacity: 0; 
    }
}

.gd-notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.gd-notification-icon {
    font-size: 1.5rem;
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.8));
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationAnimations);
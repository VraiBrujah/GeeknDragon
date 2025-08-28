/**
 * Gestionnaire Principal LocationVS
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation\locationVS
 * 
 * Rôle      : Orchestrateur principal pour la page location.html
 * Type      : Module JavaScript principal
 * Unité     : sans unité (gestionnaire logique)
 * Domaine   : gestion complète des interactions page location
 * Formule   : centralisation = navigation + animations + synchronisation
 * Exemple   : LocationManager.init() démarre tous les sous-systèmes
 */

class LocationManager {
    constructor() {
        // Configuration : identifiants et état du gestionnaire
        this.pageType = 'locationVS';
        this.isInitialized = false;
        this.modules = {};
        
        // Configuration : options de performance
        this.config = {
            animationThreshold: 0.1,        // Seuil d'apparition animations (10% visible)
            scrollDebounce: 16,             // Délai anti-rebond scroll (60fps)
            rootMargin: '0px 0px -50px 0px' // Marge pour intersection observer
        };
    }

    /**
     * Initialisation : démarrage complet du gestionnaire
     */
    init() {
        if (this.isInitialized) {
            return; // Évite double initialisation
        }

        // Démarrage : modules dans ordre optimal
        this.initNavigation();
        this.initAnimations();
        this.initSynchronization();
        this.initSectionReorganization();
        
        this.isInitialized = true;
    }

    /**
     * Navigation : gestion smooth scroll et états actifs
     */
    initNavigation() {
        // Navigation : scroll fluide pour tous les liens internes
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            });
        });

        // Navigation : mise à jour états actifs au scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            // Anti-rebond : évite calculs trop fréquents
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.updateActiveNavigation();
            }, this.config.scrollDebounce);
        });

        this.modules.navigation = { 
            status: 'active',
            anchors: document.querySelectorAll('a[href^="#"]').length
        };
    }

    /**
     * Mise à jour : navigation active selon position scroll
     */
    updateActiveNavigation() {
        const sections = document.querySelectorAll('.section');
        const navItems = document.querySelectorAll('.nav-item');
        
        // Détection : section actuellement visible
        let currentSection = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            // Section considérée active si le haut est proche du viewport
            if (rect.top <= 200 && rect.bottom > 0) {
                currentSection = section.getAttribute('id');
            }
        });
        
        // Application : état actif sur navigation
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('active');
            }
        });
    }

    /**
     * Animations : système d'apparition au scroll optimisé
     */
    initAnimations() {
        // Configuration : observer pour animations
        const observerOptions = {
            threshold: this.config.animationThreshold,
            rootMargin: this.config.rootMargin
        };

        // Observer : détection éléments entrant dans viewport
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    // Arrêt observation : économie performance après animation
                    animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Application : surveillance tous éléments à animer
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });

        this.modules.animations = {
            status: 'active',
            observedElements: animatedElements.length,
            observer: animationObserver
        };
    }

    /**
     * Synchronisation : réception styles dynamiques depuis éditeur
     */
    initSynchronization() {
        let dynamicStyleElement = null;
        
        // Application : CSS dynamique reçu de l'éditeur
        const applyDynamicCSS = (css) => {
            // Suppression : ancien style si existant
            if (dynamicStyleElement) {
                dynamicStyleElement.remove();
            }
            
            // Création : nouvel élément style dynamique
            dynamicStyleElement = document.createElement('style');
            dynamicStyleElement.id = 'dynamic-locationVS-styles';
            dynamicStyleElement.textContent = css;
            document.head.appendChild(dynamicStyleElement);
        };
        
        // Écoute : messages CSS depuis éditeur via localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'locationVS-css-broadcast' && e.newValue) {
                try {
                    const message = JSON.parse(e.newValue);
                    if (message.type === 'LOCATION_CSS_UPDATE') {
                        applyDynamicCSS(message.css);
                    }
                } catch (error) {
                    // Erreur parsing message ignorée silencieusement
                }
            }
        });
        
        // Chargement : styles sauvegardés au démarrage
        const savedCSS = localStorage.getItem('locationVS-dynamic-css');
        if (savedCSS) {
            applyDynamicCSS(savedCSS);
        }

        this.modules.synchronization = {
            status: 'active',
            styleElement: () => dynamicStyleElement,
            applyCSS: applyDynamicCSS
        };
    }

    /**
     * Réorganisation : gestion ordre des sections depuis éditeur
     */
    initSectionReorganization() {
        // Ordre : configuration par défaut des sections
        const getDefaultSectionOrder = () => ({
            'hero': 1,
            'pricing': 2,
            'advantages': 3,
            'technical': 4,
            'contact': 5
        });

        // Lecture : ordre sauvegardé ou défaut
        const getSectionOrder = () => {
            const saved = localStorage.getItem('locationVS-sectionOrder');
            return saved ? JSON.parse(saved) : getDefaultSectionOrder();
        };

        // Application : réorganisation DOM selon ordre configuré
        const applySectionOrder = () => {
            const order = getSectionOrder();
            const sectionsData = [];
            
            // Collecte : sections et spacers associés
            Object.keys(order).forEach(sectionId => {
                const section = document.querySelector(`[data-section-id="${sectionId}"]`);
                if (section) {
                    const spacers = [];
                    let nextEl = section.nextElementSibling;
                    
                    // Récupération : spacers suivant la section
                    while (nextEl && nextEl.classList.contains('section-spacer')) {
                        spacers.push(nextEl);
                        nextEl = nextEl.nextElementSibling;
                    }
                    
                    sectionsData.push({
                        section,
                        spacers,
                        order: order[sectionId]
                    });
                }
            });

            // Tri : par ordre configuré
            sectionsData.sort((a, b) => a.order - b.order);

            // Réinsertion : sections dans nouvel ordre
            const body = document.body;
            let insertAfter = document.querySelector('.header-spacer') || 
                             document.querySelector('nav') ||
                             body.firstChild;

            sectionsData.forEach(({ section, spacers }) => {
                // Insertion : section après point d'ancrage
                body.insertBefore(section, insertAfter.nextSibling);
                insertAfter = section;
                
                // Insertion : spacers après section
                spacers.forEach(spacer => {
                    body.insertBefore(spacer, insertAfter.nextSibling);
                    insertAfter = spacer;
                });
            });
        };

        // Écoute : changements d'ordre depuis éditeur
        window.addEventListener('storage', (e) => {
            if (e.key === 'locationVS-sectionOrder') {
                applySectionOrder();
            }
        });

        // Application : ordre initial au chargement
        applySectionOrder();

        this.modules.sectionReorganization = {
            status: 'active',
            currentOrder: getSectionOrder,
            applyOrder: applySectionOrder
        };
    }

    /**
     * Diagnostic : état de tous les modules
     * @return {Object} - Statut complet du gestionnaire
     */
    getStatus() {
        return {
            pageType: this.pageType,
            isInitialized: this.isInitialized,
            modules: Object.keys(this.modules).reduce((status, moduleKey) => {
                const module = this.modules[moduleKey];
                status[moduleKey] = {
                    status: module.status || 'unknown',
                    ...module
                };
                delete status[moduleKey].status; // Évite duplication
                return status;
            }, {}),
            config: this.config
        };
    }

    /**
     * Arrêt : nettoyage complet des modules
     */
    destroy() {
        // Nettoyage : observers et event listeners
        if (this.modules.animations?.observer) {
            this.modules.animations.observer.disconnect();
        }

        // Reset : état initial
        this.modules = {};
        this.isInitialized = false;
    }
}

// Auto-initialisation : au chargement DOM
document.addEventListener('DOMContentLoaded', () => {
    // Instance globale : accessible depuis console et autres scripts
    window.locationManager = new LocationManager();
    window.locationManager.init();
    
    // Debug : exposition fonction diagnostic
    window.getLocationStatus = () => window.locationManager.getStatus();
});

// Export : pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationManager;
}
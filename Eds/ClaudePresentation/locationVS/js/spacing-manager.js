/**
 * Gestionnaire Espacement Dynamique LocationVS
 * Répertoire de Travail : C:\Users\Brujah\Documents\GitHub\GeeknDragon\Eds\ClaudePresentation\locationVS
 * 
 * Rôle      : Gère les espacements dynamiques entre sections
 * Type      : Module JavaScript pour espacements éditables
 * Unité     : pixels (px) pour hauteurs d'espacement
 * Domaine   : 0px à 500px par espacement configurable
 * Formule   : height_finale = valeur_éditeur || valeur_défaut
 * Exemple   : heroSpacerHeight = 120px depuis localStorage
 */

class SpacingManager {
    constructor() {
        // Configuration : espacements par défaut
        this.defaultSpacings = {
            headerSpacerHeight: 80,           // Espacement après header
            heroPricingSpacerHeight: 0,       // Entre héro et tarifs
            pricingAdvantagesSpacerHeight: 0, // Entre tarifs et avantages
            advantagesComparisonSpacerHeight: 0, // Entre avantages et comparaison
            comparisonContactSpacerHeight: 0  // Entre comparaison et contact
        };

        // État : espacements actuels
        this.currentSpacings = { ...this.defaultSpacings };

        // Configuration : mappings data-field vers classe CSS
        this.spacingMappings = {
            'heroSpacerHeight': '.header-spacer[data-field="heroSpacerHeight"]',
            'hero-pricing-spacer': '.section-spacer[data-field="hero-pricing-spacer"]',
            'pricing-advantages-spacer': '.section-spacer[data-field="pricing-advantages-spacer"]',
            'advantages-comparison-spacer': '.section-spacer[data-field="advantages-comparison-spacer"]',
            'comparison-contact-spacer': '.section-spacer[data-field="comparison-contact-spacer"]'
        };

        this.styleElement = null;
    }

    /**
     * Initialisation : mise en place du système d'espacement dynamique
     */
    init() {
        // Chargement : espacements sauvegardés
        this.loadSpacingsFromStorage();

        // Application : espacements initiaux
        this.applySpacings();

        // Écoute : changements depuis éditeur
        this.setupStorageListener();

        console.log('📏 SpacingManager initialisé avec espacements:', this.currentSpacings);
    }

    /**
     * Chargement : espacements depuis localStorage
     */
    loadSpacingsFromStorage() {
        // Chargement : styles sauvegardés contenant les espacements
        const savedStyles = localStorage.getItem('locationVS-live-styles');
        
        if (savedStyles) {
            try {
                const styles = JSON.parse(savedStyles);
                
                // Mise à jour : espacements depuis données sauvegardées
                if (styles.headerSpacerHeight !== undefined) {
                    this.currentSpacings.headerSpacerHeight = parseInt(styles.headerSpacerHeight) || this.defaultSpacings.headerSpacerHeight;
                }
                if (styles.heroPricingSpacerHeight !== undefined) {
                    this.currentSpacings.heroPricingSpacerHeight = parseInt(styles.heroPricingSpacerHeight) || this.defaultSpacings.heroPricingSpacerHeight;
                }
                if (styles.pricingAdvantagesSpacerHeight !== undefined) {
                    this.currentSpacings.pricingAdvantagesSpacerHeight = parseInt(styles.pricingAdvantagesSpacerHeight) || this.defaultSpacings.pricingAdvantagesSpacerHeight;
                }
                if (styles.advantagesComparisonSpacerHeight !== undefined) {
                    this.currentSpacings.advantagesComparisonSpacerHeight = parseInt(styles.advantagesComparisonSpacerHeight) || this.defaultSpacings.advantagesComparisonSpacerHeight;
                }
                if (styles.comparisonContactSpacerHeight !== undefined) {
                    this.currentSpacings.comparisonContactSpacerHeight = parseInt(styles.comparisonContactSpacerHeight) || this.defaultSpacings.comparisonContactSpacerHeight;
                }

                console.log('📥 Espacements chargés depuis localStorage');
            } catch (error) {
                console.warn('⚠️ Erreur chargement espacements, utilisation valeurs par défaut');
                this.currentSpacings = { ...this.defaultSpacings };
            }
        }
    }

    /**
     * Application : espacements via CSS dynamique
     */
    applySpacings() {
        // Suppression : ancien style d'espacement
        if (this.styleElement) {
            this.styleElement.remove();
        }

        // Création : CSS dynamique pour espacements
        const cssRules = [
            `/* === ESPACEMENTS DYNAMIQUES LOCATIONVS === */`,
            
            // Header spacer
            `.header-spacer[data-field="heroSpacerHeight"] {`,
            `    height: ${this.currentSpacings.headerSpacerHeight}px !important;`,
            `}`,
            
            // Section spacers spécifiques
            `.section-spacer[data-field="hero-pricing-spacer"] {`,
            `    height: ${this.currentSpacings.heroPricingSpacerHeight}px !important;`,
            `}`,
            
            `.section-spacer[data-field="pricing-advantages-spacer"] {`,
            `    height: ${this.currentSpacings.pricingAdvantagesSpacerHeight}px !important;`,
            `}`,
            
            `.section-spacer[data-field="advantages-comparison-spacer"] {`,
            `    height: ${this.currentSpacings.advantagesComparisonSpacerHeight}px !important;`,
            `}`,
            
            `.section-spacer[data-field="comparison-contact-spacer"] {`,
            `    height: ${this.currentSpacings.comparisonContactSpacerHeight}px !important;`,
            `}`,
            
            // Fallback pour section-spacer générique
            `.section-spacer {`,
            `    width: 100%;`,
            `    background: transparent;`,
            `    display: block;`,
            `}`
        ];

        // Injection : CSS dynamique dans le DOM
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'dynamic-spacing-locationVS';
        this.styleElement.textContent = cssRules.join('\n');
        document.head.appendChild(this.styleElement);

        console.log('📐 Espacements appliqués:', this.currentSpacings);
    }

    /**
     * Écoute : changements d'espacements depuis éditeur
     */
    setupStorageListener() {
        // Écoute : modifications localStorage pour espacements
        window.addEventListener('storage', (event) => {
            if (event.key === 'locationVS-live-styles' && event.newValue) {
                try {
                    const newStyles = JSON.parse(event.newValue);
                    let spacingChanged = false;

                    // Vérification : changements d'espacement
                    Object.keys(this.defaultSpacings).forEach(spacingKey => {
                        const styleKey = spacingKey; // correspondance directe
                        if (newStyles[styleKey] !== undefined) {
                            const newValue = parseInt(newStyles[styleKey]) || 0;
                            if (this.currentSpacings[spacingKey] !== newValue) {
                                this.currentSpacings[spacingKey] = newValue;
                                spacingChanged = true;
                            }
                        }
                    });

                    // Réapplication : si espacements modifiés
                    if (spacingChanged) {
                        this.applySpacings();
                        console.log('🔄 Espacements mis à jour depuis éditeur');
                    }
                } catch (error) {
                    console.warn('⚠️ Erreur traitement changement espacement:', error);
                }
            }
        });

        // Écoute : message direct d'espacement
        window.addEventListener('locationVS-spacing-update', (event) => {
            if (event.detail && event.detail.spacings) {
                this.currentSpacings = { ...this.currentSpacings, ...event.detail.spacings };
                this.applySpacings();
                console.log('📏 Espacements mis à jour par événement direct');
            }
        });
    }

    /**
     * Mise à jour : espacement spécifique
     * @param {string} spacingName - Nom de l'espacement à modifier
     * @param {number} value - Nouvelle valeur en pixels
     */
    updateSpacing(spacingName, value) {
        if (this.currentSpacings.hasOwnProperty(spacingName)) {
            this.currentSpacings[spacingName] = parseInt(value) || 0;
            this.applySpacings();
            
            // Sauvegarde : nouvel espacement
            this.saveSpacingsToStorage();
            
            console.log(`📏 Espacement ${spacingName} mis à jour: ${value}px`);
        } else {
            console.warn(`⚠️ Espacement inconnu: ${spacingName}`);
        }
    }

    /**
     * Sauvegarde : espacements vers localStorage
     */
    saveSpacingsToStorage() {
        try {
            // Chargement : styles existants
            const existingStyles = JSON.parse(localStorage.getItem('locationVS-live-styles') || '{}');
            
            // Fusion : espacements avec styles existants
            const updatedStyles = {
                ...existingStyles,
                ...this.currentSpacings
            };
            
            // Sauvegarde : styles mis à jour
            localStorage.setItem('locationVS-live-styles', JSON.stringify(updatedStyles));
            
            console.log('💾 Espacements sauvegardés');
        } catch (error) {
            console.warn('⚠️ Erreur sauvegarde espacements:', error);
        }
    }

    /**
     * Reset : tous les espacements aux valeurs par défaut
     */
    resetSpacings() {
        this.currentSpacings = { ...this.defaultSpacings };
        this.applySpacings();
        this.saveSpacingsToStorage();
        
        console.log('🔄 Espacements reset aux valeurs par défaut');
    }

    /**
     * Diagnostic : état actuel du gestionnaire d'espacement
     * @return {Object} - Informations diagnostic
     */
    getDiagnostic() {
        return {
            currentSpacings: { ...this.currentSpacings },
            defaultSpacings: { ...this.defaultSpacings },
            hasStyleElement: !!this.styleElement,
            styleElementId: this.styleElement?.id || null,
            totalSpacingHeight: Object.values(this.currentSpacings).reduce((sum, height) => sum + height, 0)
        };
    }
}

// Auto-initialisation : au chargement DOM
document.addEventListener('DOMContentLoaded', () => {
    // Instance globale : accessible depuis console et autres scripts
    window.spacingManager = new SpacingManager();
    window.spacingManager.init();
    
    // Debug : exposition fonction diagnostic
    window.getSpacingDiagnostic = () => window.spacingManager.getDiagnostic();
});

// Export : pour utilisation en module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpacingManager;
}
/**
 * =================================================================
 * SYSTÈME DE SLIDERS AMÉLIORÉ - PERSISTANCE LOCALE
 * =================================================================
 * 
 * Rôle : Système de sliders qui maintient les valeurs modifiées
 *        même après relâchement, en utilisant l'état local persistant
 * 
 * Fonctionnalités :
 * - Sliders persistants avec localStorage
 * - Synchronisation avec GlobalsManager
 * - Mise à jour temps réel des éléments liés
 * - Reset et sauvegarde des configurations
 * 
 * Utilisation automatique sur tous les input[type="range"]
 * 
 * @author Claude Code - EDS Québec
 * @version 2.0.0
 * @licence Propriétaire EDS Québec
 */

/**
 * Classe principale pour la gestion des sliders
 */
class SliderSystem {
    constructor(globalsManager) {
        this.globalsManager = globalsManager;
        this.activeSliders = new Map(); // slider element → config
        this.isInitialized = false;
        
        console.log('🎚️  SliderSystem : Module initialisé');
    }

    /**
     * Initialise le système de sliders
     * Scan automatique et configuration des sliders existants
     * 
     * @returns {boolean} Succès de l'initialisation
     */
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️  SliderSystem déjà initialisé');
            return true;
        }

        if (!this.globalsManager?.isInitialized) {
            console.error('❌ GlobalsManager non initialisé, impossible d\'activer les sliders');
            return false;
        }

        try {
            // Scan et configuration automatique des sliders
            this.scanAndConfigureSliders();

            // Configuration des écouteurs globaux
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('✅ SliderSystem : Système activé');
            
            // Event personnalisé pour notifier l'activation
            window.dispatchEvent(new CustomEvent('slider-system-ready', {
                detail: { sliderSystem: this }
            }));

            return true;

        } catch (error) {
            console.error('❌ Erreur activation SliderSystem:', error);
            return false;
        }
    }

    /**
     * Scanne le DOM et configure automatiquement tous les sliders
     */
    scanAndConfigureSliders() {
        const sliders = document.querySelectorAll('input[type="range"]');
        let configuredCount = 0;

        sliders.forEach(slider => {
            if (this.configureSlider(slider)) {
                configuredCount++;
            }
        });

        console.log(`🎚️  ${configuredCount}/${sliders.length} sliders configurés`);
    }

    /**
     * Configure un slider individuel pour la persistance
     * 
     * @param {HTMLInputElement} slider - Élément slider à configurer
     * @returns {boolean} Succès de la configuration
     */
    configureSlider(slider) {
        // Vérifier que c'est un slider valide
        if (!slider || slider.type !== 'range') {
            return false;
        }

        // Détection automatique de la variable liée
        const variablePath = this.detectVariablePath(slider);
        if (!variablePath) {
            console.warn('⚠️  Impossible de détecter la variable pour slider:', slider);
            return false;
        }

        // Configuration du slider
        const config = {
            element: slider,
            variablePath,
            originalValue: parseFloat(slider.value) || 0,
            min: parseFloat(slider.min) || 0,
            max: parseFloat(slider.max) || 100,
            step: parseFloat(slider.step) || 1,
            unit: this.detectUnit(slider),
            formatType: this.detectFormatType(slider, variablePath)
        };

        // Charger la valeur sauvegardée si elle existe
        const savedValue = this.getSavedSliderValue(variablePath);
        if (savedValue !== null) {
            slider.value = savedValue;
            config.originalValue = savedValue;
            
            // Mettre à jour immédiatement la valeur dans le système
            this.globalsManager.setValue(variablePath, savedValue, true);
        }

        // Enregistrer le slider
        this.activeSliders.set(slider, config);

        console.log(`🎚️  Slider configuré: ${variablePath} [${config.min}-${config.max}]`);
        return true;
    }

    /**
     * Détecte automatiquement le chemin de variable pour un slider
     * 
     * @param {HTMLInputElement} slider - Élément slider
     * @returns {string|null} Chemin de la variable ou null
     */
    detectVariablePath(slider) {
        // Méthode 1 : Attribut data-variable explicite
        const explicitPath = slider.getAttribute('data-variable');
        if (explicitPath) {
            return explicitPath;
        }

        // Méthode 2 : Analyser l'ID du slider
        const sliderId = slider.id;
        if (sliderId) {
            // Patterns courants dans les IDs
            const idPatterns = [
                // Ex: slider-licube-weight → licube.weight_kg
                /^slider-licube-weight$/ && 'licube.weight_kg',
                /^slider-licube-cycles$/ && 'licube.cycle_life_at_80dod',
                /^slider-nicd-cycles$/ && 'nicd.cycle_life_typical',
                /^slider-nicd-weight$/ && 'nicd.weight_kg',
                // TCO sliders
                /^slider-licube-price$/ && 'licube.price_cad_max',
                /^slider-nicd-price$/ && 'nicd.price_cad'
            ];

            for (const pattern of idPatterns) {
                if (typeof pattern === 'string') continue; // Résultat du &&
                if (pattern.test && pattern.test(sliderId)) {
                    // Trouver la valeur associée
                    const index = idPatterns.indexOf(pattern);
                    return idPatterns[index + 1]; // La valeur qui suit
                }
            }
        }

        // Méthode 3 : Analyser le contexte DOM (labels, containers)
        const contextPath = this.detectVariableFromContext(slider);
        if (contextPath) {
            return contextPath;
        }

        return null;
    }

    /**
     * Détecte la variable depuis le contexte DOM du slider
     * 
     * @param {HTMLInputElement} slider - Élément slider
     * @returns {string|null} Chemin de la variable détecté
     */
    detectVariableFromContext(slider) {
        // Rechercher dans les éléments proches
        const container = slider.closest('.control-group, .slider-container, .input-group');
        if (!container) return null;

        // Rechercher des éléments liés avec data-pricing-value
        const linkedElements = container.querySelectorAll('[data-pricing-value]');
        if (linkedElements.length === 1) {
            return linkedElements[0].getAttribute('data-pricing-value');
        }

        // Rechercher par texte de label
        const label = container.querySelector('label, .control-label, .slider-label');
        if (label) {
            const labelText = label.textContent?.toLowerCase() || '';
            
            // Mapping texte → variable
            const labelMappings = {
                'poids li-cube': 'licube.weight_kg',
                'poids ni-cd': 'nicd.weight_kg', 
                'cycles li-cube': 'licube.cycle_life_at_80dod',
                'cycles ni-cd': 'nicd.cycle_life_typical',
                'prix li-cube': 'licube.price_cad_max',
                'prix ni-cd': 'nicd.price_cad',
                'énergie li-cube': 'licube.energy_total_wh',
                'énergie ni-cd': 'nicd.energy_total_wh'
            };

            for (const [text, variable] of Object.entries(labelMappings)) {
                if (labelText.includes(text)) {
                    return variable;
                }
            }
        }

        return null;
    }

    /**
     * Détecte l'unité d'un slider
     * 
     * @param {HTMLInputElement} slider - Élément slider
     * @returns {string} Unité détectée
     */
    detectUnit(slider) {
        // Rechercher dans les attributs
        const unit = slider.getAttribute('data-unit');
        if (unit) return unit;

        // Rechercher dans le contexte
        const container = slider.closest('.control-group, .slider-container');
        if (container) {
            const text = container.textContent || '';
            if (text.includes('kg')) return 'kg';
            if (text.includes('cycles')) return 'cycles';
            if (text.includes('$') || text.includes('CAD')) return 'CAD';
            if (text.includes('Wh')) return 'Wh';
            if (text.includes('V')) return 'V';
        }

        return '';
    }

    /**
     * Détecte le type de formatage pour un slider
     * 
     * @param {HTMLInputElement} slider - Élément slider
     * @param {string} variablePath - Chemin de la variable
     * @returns {string} Type de formatage
     */
    detectFormatType(slider, variablePath) {
        if (variablePath.includes('price') || variablePath.includes('total_20_years')) {
            return 'currency';
        }
        if (variablePath.includes('weight_kg')) {
            return 'weight';
        }
        if (variablePath.includes('cycle')) {
            return 'cycles';
        }
        if (variablePath.includes('energy') && variablePath.includes('wh')) {
            return 'energy';
        }
        
        return 'number';
    }

    /**
     * Configure les écouteurs d'événements pour tous les sliders
     */
    setupEventListeners() {
        // Écouteur global pour les nouveaux sliders (delegation)
        document.addEventListener('input', (event) => {
            if (event.target.type === 'range') {
                this.handleSliderInput(event.target, event);
            }
        });

        // Écouteur pour les changements finaux (mouseup, touchend)
        ['mouseup', 'touchend', 'change'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                if (event.target.type === 'range') {
                    this.handleSliderChange(event.target, event);
                }
            });
        });

        console.log('🎚️  Écouteurs d\'événements sliders configurés');
    }

    /**
     * Gère les changements en temps réel d'un slider (pendant le glissement)
     * 
     * @param {HTMLInputElement} slider - Slider modifié
     * @param {Event} event - Événement déclencheur
     */
    handleSliderInput(slider, event) {
        const config = this.activeSliders.get(slider);
        if (!config) {
            // Essayer de configurer automatiquement
            if (!this.configureSlider(slider)) {
                return;
            }
            config = this.activeSliders.get(slider);
        }

        if (!config) return;

        const value = parseFloat(slider.value);
        
        // Mise à jour temps réel dans GlobalsManager (non persistant pendant glissement)
        this.globalsManager.setValue(config.variablePath, value, false);

        // Mise à jour visuelle temps réel
        this.updateSliderDisplay(slider, config, value);
    }

    /**
     * Gère la finalisation d'un changement de slider (relâchement)
     * 
     * @param {HTMLInputElement} slider - Slider modifié
     * @param {Event} event - Événement déclencheur
     */
    handleSliderChange(slider, event) {
        const config = this.activeSliders.get(slider);
        if (!config) return;

        const value = parseFloat(slider.value);
        
        // Sauvegarde persistante de la valeur finale
        this.globalsManager.setValue(config.variablePath, value, true);
        
        // Sauvegarde spécifique slider
        this.saveSliderValue(config.variablePath, value);

        console.log(`🎚️  Slider finalisé: ${config.variablePath} = ${value}`);
    }

    /**
     * Met à jour l'affichage visuel d'un slider
     * 
     * @param {HTMLInputElement} slider - Slider à mettre à jour
     * @param {Object} config - Configuration du slider
     * @param {number} value - Nouvelle valeur
     */
    updateSliderDisplay(slider, config, value) {
        // Rechercher l'affichage de valeur associé
        const container = slider.closest('.control-group, .slider-container');
        if (!container) return;

        const valueDisplay = container.querySelector('.slider-value, .control-value, [data-slider-display]');
        if (valueDisplay) {
            const formattedValue = this.globalsManager.formatValue(value, config.formatType, config.unit);
            valueDisplay.textContent = formattedValue;
        }
    }

    /**
     * Sauvegarde la valeur d'un slider dans localStorage
     * 
     * @param {string} variablePath - Chemin de la variable
     * @param {number} value - Valeur à sauvegarder
     */
    saveSliderValue(variablePath, value) {
        try {
            const sliderValues = JSON.parse(localStorage.getItem('slider-values') || '{}');
            sliderValues[variablePath] = value;
            localStorage.setItem('slider-values', JSON.stringify(sliderValues));
        } catch (error) {
            console.warn('⚠️  Impossible de sauvegarder valeur slider:', error);
        }
    }

    /**
     * Récupère la valeur sauvegardée d'un slider
     * 
     * @param {string} variablePath - Chemin de la variable
     * @returns {number|null} Valeur sauvegardée ou null
     */
    getSavedSliderValue(variablePath) {
        try {
            const sliderValues = JSON.parse(localStorage.getItem('slider-values') || '{}');
            return sliderValues[variablePath] || null;
        } catch (error) {
            console.warn('⚠️  Impossible de lire valeur slider sauvegardée:', error);
            return null;
        }
    }

    /**
     * Remet tous les sliders à leurs valeurs par défaut
     */
    resetAllSliders() {
        let resetCount = 0;
        
        this.activeSliders.forEach((config, slider) => {
            slider.value = config.originalValue;
            this.globalsManager.setValue(config.variablePath, config.originalValue, true);
            this.updateSliderDisplay(slider, config, config.originalValue);
            resetCount++;
        });

        // Nettoyer le localStorage
        localStorage.removeItem('slider-values');
        localStorage.removeItem('pricing-local-modifications');

        console.log(`🎚️  ${resetCount} sliders remis à zéro`);
        
        // Rafraîchir tous les bindings
        this.globalsManager.refreshBinding();
    }

    /**
     * Retourne les statistiques du système
     * 
     * @returns {Object} Statistiques détaillées
     */
    getStats() {
        const savedCount = Object.keys(
            JSON.parse(localStorage.getItem('slider-values') || '{}')
        ).length;

        return {
            isInitialized: this.isInitialized,
            activeSliders: this.activeSliders.size,
            savedValues: savedCount,
            sliders: Array.from(this.activeSliders.values()).map(config => ({
                variable: config.variablePath,
                currentValue: config.element.value,
                range: [config.min, config.max],
                unit: config.unit
            }))
        };
    }
}

/**
 * Fonction d'initialisation globale
 * Lance le système de sliders quand GlobalsManager est prêt
 */
function initializeSliderSystem() {
    window.addEventListener('globals-ready', (event) => {
        const globalsManager = event.detail.manager;
        
        console.log('🎚️  Initialisation SliderSystem...');
        
        const sliderSystem = new SliderSystem(globalsManager);
        const success = sliderSystem.initialize();
        
        if (success) {
            // Disponibilité globale
            window.sliderSystem = sliderSystem;
            console.log('✅ SliderSystem prêt et disponible globalement');
        } else {
            console.error('❌ Échec de l\'activation SliderSystem');
        }
    });
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', initializeSliderSystem);

/**
 * Export pour utilisation moderne
 */
export { SliderSystem };

/**
 * Disponibilité globale pour compatibilité legacy
 */
window.SliderSystem = SliderSystem;
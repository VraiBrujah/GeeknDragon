/**
 * GESTIONNAIRE CENTRALISÉ DES PRIX ET CALCULS - LI-CUBE PRO
 * 
 * Objectif : Éliminer tous les prix hardcodés et centraliser la gestion
 * Utilisation : Tous les fichiers HTML/JS doivent utiliser cette classe UNIQUEMENT
 * 
 * Fonctionnalités :
 * - Chargement automatique de la configuration JSON
 * - Calculs TCO dynamiques pour vente et location
 * - Formatage des prix selon les standards canadiens
 * - Mise à jour automatique de tous les éléments DOM
 * - Support multilingue français/anglais
 * 
 * @author Claude Code
 * @version 2025-v1.0
 * @created 2025-01-23
 */

class PricingManager {
    /**
     * Constructeur du gestionnaire de prix centralisé
     * 
     * Initialise la classe et charge automatiquement la configuration depuis le JSON.
     * Aucun paramètre requis - la configuration est entièrement externalisée.
     */
    constructor() {
        // Configuration chargée depuis le fichier JSON - AUCUN prix hardcodé ici
        this.config = null;
        
        // État de chargement pour éviter les erreurs d'accès prématuré
        this.isLoaded = false;
        
        // Cache des éléments DOM fréquemment mis à jour (optimisation performance)
        this.domCache = new Map();
        
        // Langue par défaut (peut être changée dynamiquement)
        this.currentLanguage = 'fr';
        
        // Chargement automatique de la configuration au démarrage
        this.loadConfig();
    }

    /**
     * Charge la configuration des prix depuis le fichier JSON externe
     * 
     * Cette méthode est asynchrone et charge TOUTE la configuration centralisée.
     * Aucun prix n'est défini en dur dans le code JavaScript.
     * 
     * @returns {Promise<void>} Promise résolue quand la configuration est chargée
     * @throws {Error} Si le fichier de configuration ne peut pas être chargé
     */
    async loadConfig() {
        try {
            // Chargement du fichier de configuration centralisé - SOURCE UNIQUE DE VÉRITÉ
            const response = await fetch('./js/pricing-config.json');
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status} - Impossible de charger la configuration des prix`);
            }
            
            // Parse de la configuration JSON - validation automatique du format
            this.config = await response.json();
            
            // Validation basique de la structure de configuration
            this.validateConfig();
            
            // Marquer comme chargé - autorise l'utilisation des méthodes de calcul
            this.isLoaded = true;
            
            console.log(`✅ Configuration des prix chargée (version: ${this.config._metadata.version})`);
            
        } catch (error) {
            console.error('❌ ERREUR CRITIQUE: Impossible de charger la configuration des prix:', error);
            throw new Error(`Configuration des prix inaccessible: ${error.message}`);
        }
    }

    /**
     * Valide la structure de la configuration chargée
     * 
     * Vérifie que toutes les sections requises sont présentes et correctement formatées.
     * Évite les erreurs d'exécution dues à une configuration malformée.
     * 
     * @throws {Error} Si la configuration est invalide ou incomplète
     */
    validateConfig() {
        const requiredSections = ['modes', 'calculations', 'formulas', 'display_formats'];
        
        for (const section of requiredSections) {
            if (!this.config[section]) {
                throw new Error(`Section manquante dans la configuration: ${section}`);
            }
        }
        
        // Validation des modes (vente et location requis)
        if (!this.config.modes.vente || !this.config.modes.location) {
            throw new Error('Les modes "vente" et "location" sont obligatoires dans la configuration');
        }
    }

    /**
     * Vérifie que la configuration est chargée avant d'exécuter une opération
     * 
     * Méthode utilitaire pour éviter les erreurs d'accès à une configuration non chargée.
     * 
     * @throws {Error} Si la configuration n'est pas encore chargée
     */
    ensureConfigLoaded() {
        if (!this.isLoaded || !this.config) {
            throw new Error('Configuration non chargée. Appelez loadConfig() et attendez sa résolution.');
        }
    }

    /**
     * Récupère une valeur spécifique depuis la configuration
     * 
     * Méthode générique pour accéder aux données de configuration sans accès direct.
     * Utilise un chemin de type "modes.vente.licube.price_base" pour naviguer dans la structure.
     * 
     * @param {string} path - Chemin vers la valeur (ex: "modes.vente.licube.price_base")
     * @returns {any} La valeur trouvée dans la configuration
     * @throws {Error} Si le chemin n'existe pas dans la configuration
     */
    getConfigValue(path) {
        this.ensureConfigLoaded();
        
        const parts = path.split('.');
        let current = this.config;
        
        for (const part of parts) {
            if (current[part] === undefined) {
                throw new Error(`Chemin de configuration invalide: ${path} (arrêt à "${part}")`);
            }
            current = current[part];
        }
        
        return current;
    }

    /**
     * Récupère le prix d'un produit dans un mode spécifique
     * 
     * Interface simplifiée pour accéder aux prix sans connaître la structure interne.
     * 
     * @param {string} mode - Mode de vente ("vente" ou "location")
     * @param {string} product - Produit ("licube" ou "nicd")
     * @param {string} field - Champ du prix (ex: "price_base", "monthly_rate")
     * @returns {number} Le prix demandé
     * 
     * @example
     * // Récupérer le prix de base du Li-CUBE en mode vente
     * const prix = manager.getPrice('vente', 'licube', 'price_base'); // 5000
     */
    getPrice(mode, product, field) {
        return this.getConfigValue(`modes.${mode}.${product}.${field}`);
    }

    /**
     * Calcule le coût total de possession (TCO) dynamiquement
     * 
     * Cette méthode effectue TOUS les calculs basés sur la configuration centralisée.
     * Aucune valeur n'est hardcodée - tout provient du fichier JSON.
     * 
     * @param {string} mode - Mode de calcul ("vente" ou "location")
     * @param {number} units - Nombre d'unités (défaut: 1)
     * @param {number} years - Période d'analyse en années (défaut: 20)
     * @returns {Object} Objet contenant tous les calculs TCO
     * 
     * Structure du retour:
     * {
     *   licube: { initial, maintenance, monitoring, total, annual },
     *   nicd: { initial, maintenance, replacements, total, annual },
     *   savings: { total, percentage, roi_years, payback_months }
     * }
     */
    calculateTCO(mode, units = 1, years = 20) {
        this.ensureConfigLoaded();
        
        const licubeConfig = this.config.modes[mode].licube;
        const nicdConfig = this.config.modes[mode].nicd;
        
        let result = {
            mode: mode,
            units: units,
            years: years,
            licube: {},
            nicd: {},
            savings: {}
        };
        
        if (mode === 'vente') {
            // ====== CALCULS MODE VENTE ======
            
            // Li-CUBE: Coût initial + monitoring optionnel + maintenance
            result.licube.initial = licubeConfig.price_total * units;
            result.licube.monitoring = licubeConfig.monitoring_annual * years * units;
            result.licube.maintenance = licubeConfig.maintenance_annual * years * units; // 0 pour Li-CUBE
            result.licube.total = result.licube.initial + result.licube.monitoring + result.licube.maintenance;
            result.licube.annual = result.licube.total / years;
            
            // Ni-Cd: Coût initial + maintenance + remplacements
            result.nicd.initial = nicdConfig.price_total * units;
            result.nicd.maintenance = nicdConfig.maintenance_annual * years * units;
            
            // Calcul des remplacements Ni-Cd (tous les 6 ans sur 20 ans = 3 remplacements)
            const replacementsCount = Math.floor(years / nicdConfig.replacement_years);
            result.nicd.replacements = nicdConfig.price_total * replacementsCount * units;
            result.nicd.total = result.nicd.initial + result.nicd.maintenance + result.nicd.replacements;
            result.nicd.annual = result.nicd.total / years;
            
        } else if (mode === 'location') {
            // ====== CALCULS MODE LOCATION ======
            
            // Li-CUBE: Coût mensuel × durée (monitoring inclus)
            result.licube.monthly = licubeConfig.monthly_rate * units;
            result.licube.annual = licubeConfig.annual_rate * units;
            result.licube.total = result.licube.annual * years;
            
            // Ni-Cd: Coût mensuel + maintenance
            result.nicd.monthly = nicdConfig.monthly_rate * units;
            result.nicd.annual = nicdConfig.annual_rate * units;
            result.nicd.maintenance = nicdConfig.maintenance_annual * years * units;
            result.nicd.total = (nicdConfig.annual_rate * years * units) + result.nicd.maintenance;
        }
        
        // ====== CALCULS D'ÉCONOMIES (communs aux deux modes) ======
        result.savings.total = result.nicd.total - result.licube.total;
        result.savings.percentage = Math.round((result.savings.total / result.nicd.total) * 100);
        result.savings.annual = result.savings.total / years;
        result.savings.monthly = result.savings.annual / 12;
        
        // ROI et période de retour
        if (mode === 'vente') {
            result.savings.roi_years = result.licube.initial / result.savings.annual;
            result.savings.payback_months = Math.round(result.savings.roi_years * 12);
        } else {
            result.savings.roi_months = Math.round((result.licube.monthly / result.savings.monthly) * 1);
        }
        
        return result;
    }

    /**
     * Formate un prix selon les standards définis dans la configuration
     * 
     * Utilise les règles de formatage définies dans display_formats pour assurer
     * une présentation cohérente dans toute l'application.
     * 
     * @param {number} amount - Montant à formater
     * @param {string} type - Type de formatage ("currency", "percentage", etc.)
     * @returns {string} Prix formaté selon les règles configurées
     * 
     * @example
     * formatPrice(5000, 'currency') // "5 000 $ CAD"
     * formatPrice(79, 'percentage') // "79%"
     */
    formatPrice(amount, type = 'currency') {
        this.ensureConfigLoaded();
        
        const formats = this.config.display_formats;
        
        switch (type) {
            case 'currency':
                const formatted = new Intl.NumberFormat('fr-CA', {
                    style: 'currency',
                    currency: 'CAD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(amount);
                return formatted.replace('$', '$ CAD');
                
            case 'percentage':
                return `${Math.round(amount)}%`;
                
            case 'number':
                return new Intl.NumberFormat('fr-CA').format(amount);
                
            default:
                return amount.toString();
        }
    }

    /**
     * Met à jour tous les éléments DOM avec les prix actuels
     * 
     * Parcourt le DOM à la recherche d'éléments avec des attributs data-pricing-*
     * et les met à jour avec les valeurs de la configuration centralisée.
     * 
     * Attributs supportés:
     * - data-pricing-value="modes.vente.licube.price_base" : Valeur directe
     * - data-pricing-format="currency" : Format d'affichage
     * - data-pricing-calc="tco" : Déclenchement d'un calcul complet
     * 
     * @param {string} mode - Mode à utiliser pour les calculs ("vente" ou "location")
     */
    updateAllDisplays(mode = 'vente') {
        this.ensureConfigLoaded();
        
        // Recherche tous les éléments avec des attributs de pricing
        const pricingElements = document.querySelectorAll('[data-pricing-value], [data-pricing-calc]');
        
        pricingElements.forEach(element => {
            try {
                const pricingValue = element.getAttribute('data-pricing-value');
                const pricingCalc = element.getAttribute('data-pricing-calc');
                const pricingFormat = element.getAttribute('data-pricing-format') || 'currency';
                
                let value;
                
                if (pricingCalc === 'tco') {
                    // Calcul TCO complet
                    const tco = this.calculateTCO(mode);
                    const path = pricingValue.split('.');
                    value = this.getNestedValue(tco, path);
                } else if (pricingValue) {
                    // Valeur directe depuis la configuration
                    value = this.getConfigValue(pricingValue);
                } else {
                    console.warn('Élément pricing sans valeur définie:', element);
                    continue;
                }
                
                // Formatage et affichage
                const formattedValue = this.formatPrice(value, pricingFormat);
                element.textContent = formattedValue;
                
                // Ajout d'une classe pour indiquer la mise à jour
                element.classList.add('pricing-updated');
                
            } catch (error) {
                console.error('Erreur lors de la mise à jour de l\'élément pricing:', element, error);
            }
        });
        
        console.log(`✅ ${pricingElements.length} éléments pricing mis à jour (mode: ${mode})`);
    }

    /**
     * Récupère une valeur imbriquée dans un objet via un chemin de propriétés
     * 
     * Méthode utilitaire pour naviguer dans des objets complexes comme les résultats TCO.
     * 
     * @param {Object} obj - Objet source
     * @param {string[]} path - Tableau des propriétés à traverser
     * @returns {any} La valeur trouvée
     */
    getNestedValue(obj, path) {
        let current = obj;
        for (const prop of path) {
            if (current[prop] === undefined) {
                throw new Error(`Propriété introuvable: ${path.join('.')} (arrêt à "${prop}")`);
            }
            current = current[prop];
        }
        return current;
    }

    /**
     * Met à jour un slider/calculateur avec les valeurs de configuration
     * 
     * Configure les limites, valeurs par défaut et callbacks d'un slider
     * pour qu'il utilise les données centralisées.
     * 
     * @param {HTMLElement} slider - Élément slider à configurer
     * @param {string} mode - Mode de calcul ("vente" ou "location")
     */
    setupSlider(slider, mode) {
        if (!slider) return;
        
        const updateCallback = () => {
            const units = parseInt(slider.value) || 1;
            const tco = this.calculateTCO(mode, units);
            
            // Mise à jour des éléments associés au slider
            this.updateSliderDisplays(slider, tco);
        };
        
        // Configuration initiale
        slider.addEventListener('input', updateCallback);
        slider.addEventListener('change', updateCallback);
        
        // Mise à jour initiale
        updateCallback();
    }

    /**
     * Met à jour les affichages liés à un slider spécifique
     * 
     * @param {HTMLElement} slider - Slider source
     * @param {Object} tco - Résultats des calculs TCO
     */
    updateSliderDisplays(slider, tco) {
        const container = slider.closest('.calculator-container, .slider-container');
        if (!container) return;
        
        // Mise à jour des éléments dans le conteneur du slider
        const displays = container.querySelectorAll('[data-display]');
        displays.forEach(display => {
            const path = display.getAttribute('data-display');
            const format = display.getAttribute('data-format') || 'currency';
            
            try {
                const value = this.getNestedValue(tco, path.split('.'));
                display.textContent = this.formatPrice(value, format);
            } catch (error) {
                console.error('Erreur mise à jour slider display:', error);
            }
        });
    }

    /**
     * Change la langue d'affichage et met à jour tous les textes
     * 
     * @param {string} language - Code langue ("fr" ou "en")
     */
    setLanguage(language) {
        if (this.config.messages[language]) {
            this.currentLanguage = language;
            this.updateLanguageDisplays();
        } else {
            console.warn(`Langue non supportée: ${language}`);
        }
    }

    /**
     * Met à jour tous les textes selon la langue courante
     */
    updateLanguageDisplays() {
        const elements = document.querySelectorAll('[data-text-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-text-key');
            const text = this.getConfigValue(`messages.${this.currentLanguage}.${key}`);
            if (text) {
                element.textContent = text;
            }
        });
    }

    /**
     * Récupère les messages d'avantages pour un mode donné
     * 
     * @param {string} mode - Mode ("vente" ou "location")
     * @returns {string[]} Liste des avantages
     */
    getAdvantages(mode) {
        const key = `${mode}_advantages`;
        return this.getConfigValue(`messages.${this.currentLanguage}.${key}`);
    }
}

// ====== INITIALISATION GLOBALE ======

/**
 * Instance globale du gestionnaire de prix
 * 
 * Cette variable est accessible dans tous les fichiers qui incluent ce script.
 * Elle garantit une source unique de vérité pour tous les prix et calculs.
 * 
 * Usage dans les autres fichiers:
 * ```javascript
 * // Récupérer un prix
 * const prix = window.pricingManager.getPrice('vente', 'licube', 'price_base');
 * 
 * // Calculer TCO
 * const tco = window.pricingManager.calculateTCO('vente', 2, 15);
 * 
 * // Mettre à jour tous les affichages
 * window.pricingManager.updateAllDisplays('location');
 * ```
 */
window.pricingManager = null;

/**
 * Initialisation automatique au chargement du DOM
 * 
 * Crée l'instance globale et charge la configuration dès que le DOM est prêt.
 * Tous les fichiers HTML peuvent ensuite utiliser window.pricingManager directement.
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🔄 Initialisation du gestionnaire de prix centralisé...');
        
        // Création de l'instance globale
        window.pricingManager = new PricingManager();
        
        // Chargement de la configuration (asynchrone)
        await window.pricingManager.loadConfig();
        
        console.log('✅ Gestionnaire de prix initialisé et prêt à l\'utilisation');
        
        // Dispatch d'un événement pour notifier les autres scripts
        const event = new CustomEvent('pricingManagerReady', {
            detail: { manager: window.pricingManager }
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('❌ ÉCHEC de l\'initialisation du gestionnaire de prix:', error);
        
        // Affichage d'un message d'erreur visible pour l'utilisateur
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position:fixed;top:10px;left:10px;right:10px;background:#ff0000;color:white;padding:10px;z-index:9999;text-align:center;font-weight:bold;';
        errorDiv.textContent = '⚠️ ERREUR: Impossible de charger la configuration des prix. Les prix affichés peuvent être incorrects.';
        document.body.prepend(errorDiv);
    }
});

/**
 * Fonction utilitaire pour attendre que le gestionnaire soit prêt
 * 
 * @returns {Promise<PricingManager>} Promise résolue avec l'instance du gestionnaire
 */
window.waitForPricingManager = function() {
    return new Promise((resolve) => {
        if (window.pricingManager && window.pricingManager.isLoaded) {
            resolve(window.pricingManager);
        } else {
            document.addEventListener('pricingManagerReady', function(e) {
                resolve(e.detail.manager);
            }, { once: true });
        }
    });
};
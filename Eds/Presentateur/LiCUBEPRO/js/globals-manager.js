/**
 * =================================================================
 * GESTIONNAIRE DE VARIABLES GLOBALES - SYSTÈME CENTRALISÉ
 * =================================================================
 * 
 * Rôle : Gestionnaire central pour toutes les variables numériques
 *        du système de présentation Li-CUBE PRO™
 * 
 * Fonctionnalités :
 * - Chargement des GLOBALS depuis JSON
 * - Clonage vers state local mutable
 * - Détection automatique mode vente/location
 * - Binding automatique via data-pricing-value
 * - Calculs dynamiques temps réel
 * 
 * Utilisation :
 *   import { GlobalsManager } from './globals-manager.js';
 *   const manager = new GlobalsManager();
 *   await manager.initialize();
 * 
 * @author Claude Code - EDS Québec
 * @version 2.0.0
 * @licence Propriétaire EDS Québec
 */

/**
 * Classe principale de gestion des variables globales
 * Implémente le pattern Singleton pour une instance unique
 */
class GlobalsManager {
    constructor() {
        // Singleton : une seule instance autorisée
        if (GlobalsManager.instance) {
            return GlobalsManager.instance;
        }
        GlobalsManager.instance = this;

        // État interne du gestionnaire
        this.globals = null;          // Constantes globales (read-only)
        this.state = null;            // État local mutable (clonage)
        this.mode = 'vente';          // Mode détecté : 'vente' ou 'location'
        this.isInitialized = false;   // Flag d'initialisation
        this.listeners = new Map();   // Écouteurs de changements

        // Configuration de formatage
        this.formatters = {
            currency: (value, suffix = 'CAD') => `${this.formatNumber(value)} ${suffix}`,
            currency_savings: (value, suffix = 'CAD') => {
                const prefix = value >= 0 ? 'ÉCONOMIES ' : 'SURCOÛT ';
                return `${prefix}${this.formatNumber(Math.abs(value))} ${suffix}`;
            },
            percentage: (value, suffix = '%') => `${this.formatNumber(value, 1)}${suffix}`,
            percentage_savings: (value, suffix = '%') => {
                if (value >= 0) {
                    return `${this.formatNumber(value, 1)}${suffix} ÉCONOMIES`;
                } else {
                    return `${this.formatNumber(Math.abs(value), 1)}${suffix} SURCOÛT`;
                }
            },
            number: (value, precision = 0) => this.formatNumber(value, precision),
            weight: (value) => `${this.formatNumber(value, 0)} kg`,
            weight_reduction: (value) => `(-${this.formatNumber(value, 0)}%)`,
            voltage: (value) => `${this.formatNumber(value, 1)}V`,
            energy: (value) => `${this.formatNumber(value, 0)} Wh`,
            cycles: (value) => `${this.formatNumber(value, 0)} cycles`,
            monthly_fee: (value, suffix = 'CAD/mois') => `${this.formatNumber(value)} ${suffix}`,
            installation_fee: (value, suffix = 'CAD*') => `${this.formatNumber(value)} ${suffix}`
        };

        console.log('📊 GlobalsManager : Instance créée');
    }

    /**
     * Initialise le gestionnaire global
     * Charge GLOBALS.json, détecte le mode, clone l'état local
     * 
     * @returns {Promise<boolean>} Succès de l'initialisation
     */
    async initialize() {
        try {
            console.log('🚀 GlobalsManager : Initialisation...');

            // Étape 1 : Détection du mode (vente/location)
            this.detectMode();

            // Étape 2 : Chargement des GLOBALS depuis JSON
            await this.loadGlobals();

            // Étape 3 : Clonage vers état local mutable
            this.cloneToLocalState();

            // Étape 4 : Mise à jour des calculs dynamiques
            this.updateDynamicCalculations();

            // Étape 5 : Application du binding automatique
            this.applyDataBinding();

            this.isInitialized = true;
            console.log(`✅ GlobalsManager : Initialisé en mode ${this.mode.toUpperCase()}`);
            
            return true;

        } catch (error) {
            console.error('❌ GlobalsManager : Erreur d\'initialisation', error);
            return false;
        }
    }

    /**
     * Détecte automatiquement le mode (vente/location)
     * Basé sur l'URL ou la classe CSS du body
     */
    detectMode() {
        // Méthode 1 : Détection par URL
        const path = window.location.pathname || '';
        if (path.includes('presentations-location') || path.includes('location')) {
            this.mode = 'location';
            console.log('🎯 Mode détecté par URL : LOCATION');
            return;
        }

        // Méthode 2 : Détection par attribut data-mode
        const bodyMode = document.body.getAttribute('data-mode');
        if (bodyMode === 'location') {
            this.mode = 'location';
            console.log('🎯 Mode détecté par attribut : LOCATION');
            return;
        }

        // Méthode 3 : Détection par classe CSS
        if (document.body.classList.contains('mode-location')) {
            this.mode = 'location';
            console.log('🎯 Mode détecté par classe : LOCATION');
            return;
        }

        // Par défaut : mode vente
        this.mode = 'vente';
        console.log('🎯 Mode par défaut : VENTE');
    }

    /**
     * Charge les variables globales depuis globals-data.js
     * Utilise window.GLOBALS_DATA directement (pas de fetch CORS)
     */
    async loadGlobals() {
        // Vérifier si globals-data.js est déjà chargé
        if (window.GLOBALS_DATA) {
            this.globals = window.GLOBALS_DATA;
            console.log('✅ GLOBALS chargé depuis globals-data.js (déjà disponible)');
            return;
        }

        // Attendre le chargement de globals-data.js (max 5 secondes)
        return new Promise((resolve, reject) => {
            const maxAttempts = 50; // 5 secondes (50 × 100ms)
            let attempts = 0;

            const checkData = () => {
                attempts++;
                
                if (window.GLOBALS_DATA) {
                    this.globals = window.GLOBALS_DATA;
                    console.log('✅ GLOBALS chargé depuis globals-data.js après attente');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('❌ Timeout: globals-data.js non chargé après 5 secondes');
                    reject(new Error('❌ Impossible de charger globals-data.js dans les délais'));
                } else {
                    setTimeout(checkData, 100);
                }
            };

            // Écouter aussi l'événement de chargement
            window.addEventListener('globals-data-loaded', () => {
                if (!this.globals && window.GLOBALS_DATA) {
                    this.globals = window.GLOBALS_DATA;
                    console.log('✅ GLOBALS chargé depuis globals-data-loaded event');
                    resolve();
                }
            }, { once: true });

            checkData();
        });
    }

    /**
     * Clone les GLOBALS vers un état local mutable avec modifications persistantes
     * Utilise structuredClone pour un clonage profond + localStorage pour sliders
     */
    cloneToLocalState() {
        if (!this.globals) {
            throw new Error('❌ GLOBALS non chargé, impossible de cloner l\'état');
        }

        // Clonage profond pour éviter les mutations accidentelles
        this.state = structuredClone(this.globals);

        // Appliquer les modifications locales sauvegardées (sliders)
        try {
            const localModifications = JSON.parse(localStorage.getItem('pricing-local-modifications') || '{}');
            let modCount = 0;
            
            Object.entries(localModifications).forEach(([path, value]) => {
                const parts = path.split('.');
                const lastPart = parts.pop();
                let current = this.state;

                // Navigation et application
                for (const part of parts) {
                    if (current[part]) {
                        current = current[part];
                    } else {
                        return; // Chemin invalide, ignorer
                    }
                }

                if (current && typeof current === 'object') {
                    current[lastPart] = value;
                    modCount++;
                }
            });

            if (modCount > 0) {
                console.log(`📋 État local avec ${modCount} modifications persistantes appliquées`);
            } else {
                console.log('📋 État local cloné depuis GLOBALS (aucune modification locale)');
            }
        } catch (error) {
            console.warn('⚠️  Erreur lors du chargement des modifications locales:', error);
            console.log('📋 État local cloné depuis GLOBALS (défaut)');
        }
    }

    /**
     * Met à jour les calculs dynamiques selon le mode actuel
     * Recalcule les pourcentages, économies, ratios
     */
    updateDynamicCalculations() {
        if (!this.state) return;

        const tcoKey = `tco_${this.mode}`;
        const tcoData = this.state.calculations[tcoKey];

        if (tcoData) {
            // Recalcul du pourcentage d'économies
            const licubeTotal = tcoData.licube.total_20_years;
            const nicdTotal = tcoData.nicd.total_20_years;
            
            if (nicdTotal > 0) {
                const savings = nicdTotal - licubeTotal;
                const percentage = (savings / nicdTotal) * 100;
                
                tcoData.savings.total = Math.round(savings);
                tcoData.savings.percentage = Math.round(percentage * 10) / 10; // 1 décimale
                
                console.log(`💰 Calculs mis à jour [${this.mode}] : ${percentage.toFixed(1)}% d'économies`);
            }
        }

        // Mise à jour des ratios de poids
        if (this.state.licube && this.state.nicd) {
            const licubeWeight = this.state.licube.weight_kg;
            const nicdWeight = this.state.nicd.weight_kg;
            
            if (nicdWeight > 0) {
                const reduction = ((nicdWeight - licubeWeight) / nicdWeight) * 100;
                this.state.licube.weight_reduction_percentage = Math.round(reduction);
                
                console.log(`⚖️  Réduction de poids calculée : ${reduction.toFixed(0)}%`);
            }
        }
    }

    /**
     * Applique le binding automatique sur tous les éléments data-pricing-value
     * Parcourt le DOM et met à jour les valeurs
     */
    applyDataBinding() {
        const elements = document.querySelectorAll('[data-pricing-value]');
        console.log(`🔗 Application du binding sur ${elements.length} éléments`);

        elements.forEach((element, index) => {
            try {
                this.bindElement(element);
            } catch (error) {
                console.error(`❌ Erreur binding élément ${index + 1}:`, error, element);
            }
        });
    }

    /**
     * Applique le binding sur un élément spécifique
     * 
     * @param {HTMLElement} element - Élément à lier
     */
    bindElement(element) {
        const variablePath = element.getAttribute('data-pricing-value');
        const formatType = element.getAttribute('data-pricing-format') || 'number';
        const suffix = element.getAttribute('data-pricing-suffix') || '';

        if (!variablePath) return;

        // Récupération de la valeur via le chemin
        const value = this.getValue(variablePath);
        
        if (value !== null && value !== undefined) {
            // Application du formatage
            const formattedValue = this.formatValue(value, formatType, suffix);
            
            // Mise à jour du contenu
            element.textContent = formattedValue;
            
            // Ajout d'une classe CSS pour identification
            element.classList.add('globals-bound');
            
            console.log(`✅ Binding: ${variablePath} = ${formattedValue}`);
        } else {
            console.warn(`⚠️  Valeur non trouvée pour: ${variablePath}`);
            element.classList.add('globals-error');
        }
    }

    /**
     * Récupère une valeur via son chemin dans l'état
     * 
     * @param {string} path - Chemin vers la valeur (ex: "licube.weight_kg")
     * @returns {any} Valeur trouvée ou null
     */
    getValue(path) {
        if (!this.state || !path) return null;

        const parts = path.split('.');
        let current = this.state;

        for (const part of parts) {
            if (current && typeof current === 'object' && part in current) {
                current = current[part];
            } else {
                return null;
            }
        }

        return current;
    }

    /**
     * Met à jour une valeur dans l'état local ET persistante
     * 
     * @param {string} path - Chemin vers la valeur
     * @param {any} value - Nouvelle valeur
     * @param {boolean} persistent - Si true, la valeur persiste après refresh
     * @returns {boolean} Succès de la mise à jour
     */
    setValue(path, value, persistent = true) {
        if (!this.state || !path) return false;

        const parts = path.split('.');
        const lastPart = parts.pop();
        let current = this.state;

        // Navigation jusqu'au parent
        for (const part of parts) {
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {};
            }
            current = current[part];
        }

        // Mise à jour de la valeur dans l'état local
        current[lastPart] = value;

        // Si persistent, sauvegarder dans localStorage pour les sliders
        if (persistent) {
            try {
                const localModifications = JSON.parse(localStorage.getItem('pricing-local-modifications') || '{}');
                localModifications[path] = value;
                localStorage.setItem('pricing-local-modifications', JSON.stringify(localModifications));
            } catch (error) {
                console.warn('⚠️  Impossible de persister la valeur locale:', error);
            }
        }

        // Recalcul des valeurs dépendantes
        this.updateDynamicCalculations();

        // Mise à jour immédiate des éléments DOM
        this.refreshElementsForPath(path);

        // Notification des changements
        this.notifyListeners(path, value);

        console.log(`📝 Valeur mise à jour: ${path} = ${value}${persistent ? ' (persistante)' : ' (temporaire)'}`);
        return true;
    }

    /**
     * Formate une valeur selon le type spécifié
     * 
     * @param {number} value - Valeur à formater
     * @param {string} formatType - Type de formatage
     * @param {string} suffix - Suffixe optionnel
     * @returns {string} Valeur formatée
     */
    formatValue(value, formatType = 'number', suffix = '') {
        if (value === null || value === undefined || isNaN(value)) {
            return '—';
        }

        const formatter = this.formatters[formatType];
        if (formatter) {
            return formatter(value, suffix);
        }

        // Formatage par défaut
        return suffix ? `${this.formatNumber(value)}${suffix}` : this.formatNumber(value);
    }

    /**
     * Formate un nombre avec séparateurs de milliers
     * 
     * @param {number} num - Nombre à formater
     * @param {number} precision - Nombre de décimales
     * @returns {string} Nombre formaté
     */
    formatNumber(num, precision = 0) {
        if (typeof num !== 'number' || isNaN(num)) return '0';
        
        return new Intl.NumberFormat('fr-CA', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }).format(num);
    }

    /**
     * Ajoute un écouteur de changements
     * 
     * @param {string} path - Chemin à surveiller
     * @param {Function} callback - Fonction de rappel
     */
    addListener(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
    }

    /**
     * Supprime un écouteur de changements
     * 
     * @param {string} path - Chemin surveillé
     * @param {Function} callback - Fonction de rappel à supprimer
     */
    removeListener(path, callback) {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.delete(callback);
            if (pathListeners.size === 0) {
                this.listeners.delete(path);
            }
        }
    }

    /**
     * Notifie tous les écouteurs d'un changement
     * 
     * @param {string} path - Chemin modifié
     * @param {any} value - Nouvelle valeur
     */
    notifyListeners(path, value) {
        const pathListeners = this.listeners.get(path);
        if (pathListeners) {
            pathListeners.forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('❌ Erreur dans listener:', error);
                }
            });
        }
    }

    /**
     * Re-applique le binding sur tous les éléments
     * Utile après des modifications d'état
     */
    refreshBinding() {
        this.applyDataBinding();
        console.log('🔄 Binding rafraîchi');
    }

    /**
     * Rafraîchit seulement les éléments liés à un chemin spécifique
     * Optimisé pour les sliders et modifications locales
     * 
     * @param {string} path - Chemin de la variable modifiée
     */
    refreshElementsForPath(path) {
        const elements = document.querySelectorAll(`[data-pricing-value="${path}"]`);
        elements.forEach(element => {
            this.bindElement(element);
        });
        
        if (elements.length > 0) {
            console.log(`🔄 ${elements.length} éléments rafraîchis pour ${path}`);
        }
    }

    /**
     * Retourne des informations de débogage
     * 
     * @returns {Object} État actuel du gestionnaire
     */
    getDebugInfo() {
        return {
            mode: this.mode,
            isInitialized: this.isInitialized,
            hasGlobals: !!this.globals,
            hasState: !!this.state,
            listenersCount: this.listeners.size,
            boundElementsCount: document.querySelectorAll('.globals-bound').length,
            errorElementsCount: document.querySelectorAll('.globals-error').length
        };
    }
}

/**
 * Instance globale unique (Singleton)
 * Exportée pour utilisation dans d'autres modules
 */
const globalsManager = new GlobalsManager();

/**
 * Initialisation automatique au chargement DOM
 * Lance le processus dès que la page est prête
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 DOM prêt, initialisation GlobalsManager...');
    
    const success = await globalsManager.initialize();
    
    if (success) {
        // Dispatch d'un événement personnalisé pour notifier l'initialisation
        window.dispatchEvent(new CustomEvent('globals-ready', {
            detail: { manager: globalsManager }
        }));
        
        console.log('✅ GlobalsManager prêt et disponible globalement');
    } else {
        console.error('❌ Échec de l\'initialisation GlobalsManager');
    }
});

/**
 * Export pour utilisation moderne (ES modules)
 */
export { GlobalsManager, globalsManager };

/**
 * Disponibilité globale pour compatibilité legacy
 */
window.GlobalsManager = GlobalsManager;
window.globalsManager = globalsManager;
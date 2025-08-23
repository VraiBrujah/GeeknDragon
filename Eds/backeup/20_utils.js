/**
 * PRESENTA-AGENT - Utilitaires JavaScript
 * Li-CUBE PRO™ LFP - EDS Québec
 * Fonctions communes et outils pour toutes les pages
 */

// Configuration globale
const PRESENTA_AGENT = {
    version: '1.0.0',
    project: 'Li-CUBE PRO™ LFP',
    client: 'EDS Québec',
    manifestPath: '04_manifest.json',
    debug: false
};

/**
 * Utilitaires de base
 */
const Utils = {
    
    /**
     * Logger avec contrôle du debug
     */
    log: (message, type = 'info', data = null) => {
        if (!PRESENTA_AGENT.debug) return;
        
        const timestamp = new Date().toISOString();
        const prefix = `[PRESENTA-AGENT ${timestamp}]`;
        
        switch (type) {
            case 'error':
                console.error(prefix, message, data);
                break;
            case 'warn':
                console.warn(prefix, message, data);
                break;
            case 'info':
            default:
                console.log(prefix, message, data);
                break;
        }
    },
    
    /**
     * Formatage des nombres avec localisation française
     */
    formatNumber: (number, options = {}) => {
        const defaults = {
            locale: 'fr-CA',
            currency: false,
            decimals: 0
        };
        const config = { ...defaults, ...options };
        
        if (config.currency) {
            return new Intl.NumberFormat(config.locale, {
                style: 'currency',
                currency: 'CAD',
                minimumFractionDigits: config.decimals,
                maximumFractionDigits: config.decimals
            }).format(number);
        }
        
        return new Intl.NumberFormat(config.locale, {
            minimumFractionDigits: config.decimals,
            maximumFractionDigits: config.decimals
        }).format(number);
    },
    
    /**
     * Formatage des pourcentages
     */
    formatPercent: (value, decimals = 1) => {
        return new Intl.NumberFormat('fr-CA', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },
    
    /**
     * Validation d'email
     */
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Validation de téléphone canadien
     */
    isValidPhone: (phone) => {
        const phoneRegex = /^(\+1[-.\s]?)?(\()?[0-9]{3}(\))?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    /**
     * Debounce pour limiter les appels de fonction
     */
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle pour limiter la fréquence d'exécution
     */
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Génération d'ID unique
     */
    generateId: (prefix = 'id') => {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Conversion d'unités communes
     */
    convertUnits: {
        kgToLbs: (kg) => kg * 2.20462,
        lbsToKg: (lbs) => lbs / 2.20462,
        celsiusToFahrenheit: (celsius) => (celsius * 9/5) + 32,
        fahrenheitToCelsius: (fahrenheit) => (fahrenheit - 32) * 5/9,
        mmToInches: (mm) => mm / 25.4,
        inchesToMm: (inches) => inches * 25.4
    }
};

/**
 * Gestionnaire de données manifest
 */
const ManifestManager = {
    data: null,
    loaded: false,
    
    /**
     * Chargement du fichier manifest
     */
    load: async (path = PRESENTA_AGENT.manifestPath) => {
        try {
            Utils.log('Chargement du manifest...', 'info');
            const response = await fetch(path);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            ManifestManager.data = await response.json();
            ManifestManager.loaded = true;
            
            Utils.log('Manifest chargé avec succès', 'info', ManifestManager.data);
            
            // Déclencher l'événement de chargement
            document.dispatchEvent(new CustomEvent('manifestLoaded', {
                detail: ManifestManager.data
            }));
            
            return ManifestManager.data;
            
        } catch (error) {
            Utils.log('Erreur lors du chargement du manifest', 'error', error);
            ManifestManager.loaded = false;
            throw error;
        }
    },
    
    /**
     * Récupération d'une valeur du manifest
     */
    get: (path, defaultValue = null) => {
        if (!ManifestManager.loaded || !ManifestManager.data) {
            Utils.log('Manifest non chargé, tentative de lecture', 'warn');
            return defaultValue;
        }
        
        const keys = path.split('.');
        let value = ManifestManager.data;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
};

/**
 * Calculateur TCO
 */
const TCOCalculator = {
    
    /**
     * Calcul du TCO Li-CUBE PRO LFP
     */
    calculateLFP: (units = 1, period = 20) => {
        const manifest = ManifestManager.get('tco_analysis.lfp', {});
        const initialCost = manifest.initial_cost || 2500;
        const maintenanceAnnual = manifest.maintenance_annual || 0;
        
        const totalCost = (initialCost * units);
        const totalMaintenance = (maintenanceAnnual * units * period);
        
        return {
            initial: totalCost,
            maintenance: totalMaintenance,
            total: totalCost + totalMaintenance,
            costPerYear: (totalCost + totalMaintenance) / period
        };
    },
    
    /**
     * Calcul du TCO Ni-Cd
     */
    calculateNiCd: (units = 1, period = 20, maintenancePerYear = 800) => {
        const manifest = ManifestManager.get('tco_analysis.nicd', {});
        const initialCost = manifest.initial_cost || 3500;
        const replacementCost = manifest.replacement_cost || 3500;
        
        // Remplacements tous les 6-7 ans
        const replacementsNeeded = Math.floor(period / 6);
        
        const totalInitial = initialCost * units;
        const totalMaintenance = maintenancePerYear * units * period;
        const totalReplacements = replacementsNeeded * replacementCost * units;
        const totalCost = totalInitial + totalMaintenance + totalReplacements;
        
        return {
            initial: totalInitial,
            maintenance: totalMaintenance,
            replacements: totalReplacements,
            total: totalCost,
            costPerYear: totalCost / period
        };
    },
    
    /**
     * Comparaison complète
     */
    compare: (units = 1, period = 20, nicdMaintenancePerYear = 800) => {
        const lfp = TCOCalculator.calculateLFP(units, period);
        const nicd = TCOCalculator.calculateNiCd(units, period, nicdMaintenancePerYear);
        
        const savings = nicd.total - lfp.total;
        const savingsPercent = ((savings / nicd.total) * 100);
        
        // Calcul du payback (en mois)
        const monthlySavings = (nicd.costPerYear - lfp.costPerYear) / 12;
        const initialDifference = lfp.initial - nicd.initial;
        const paybackMonths = initialDifference > 0 ? Math.ceil(initialDifference / monthlySavings) : 0;
        
        return {
            lfp,
            nicd,
            savings: {
                absolute: savings,
                percent: savingsPercent,
                paybackMonths: Math.max(paybackMonths, 1)
            }
        };
    }
};

/**
 * Gestionnaire d'animations
 */
const AnimationManager = {
    
    /**
     * Observer pour les animations au scroll
     */
    createScrollObserver: (options = {}) => {
        const defaults = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        const config = { ...defaults, ...options };
        
        return new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    entry.target.classList.remove('animate-out');
                } else {
                    entry.target.classList.remove('animate-in');
                    entry.target.classList.add('animate-out');
                }
            });
        }, config);
    },
    
    /**
     * Animation de compteur
     */
    animateCounter: (element, targetValue, duration = 2000, formatter = null) => {
        const startValue = 0;
        const startTime = Date.now();
        
        const animate = () => {
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = startValue + (targetValue - startValue) * easedProgress;
            
            const displayValue = formatter ? formatter(currentValue) : Math.round(currentValue);
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    },
    
    /**
     * Animation de barre de progression
     */
    animateProgressBar: (element, targetPercent, duration = 1500) => {
        element.style.width = '0%';
        
        setTimeout(() => {
            element.style.transition = `width ${duration}ms ease-out`;
            element.style.width = `${targetPercent}%`;
        }, 100);
    }
};

/**
 * Gestionnaire de formulaires
 */
const FormManager = {
    
    /**
     * Validation d'un formulaire
     */
    validate: (formElement) => {
        const errors = [];
        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const isRequired = input.hasAttribute('required');
            const type = input.type || input.tagName.toLowerCase();
            
            // Validation des champs requis
            if (isRequired && !value) {
                errors.push({
                    field: input.name || input.id,
                    message: 'Ce champ est requis',
                    element: input
                });
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
            
            // Validation spécifique par type
            if (value) {
                switch (type) {
                    case 'email':
                        if (!Utils.isValidEmail(value)) {
                            errors.push({
                                field: input.name || input.id,
                                message: 'Format d\'email invalide',
                                element: input
                            });
                            input.classList.add('error');
                        }
                        break;
                    case 'tel':
                        if (!Utils.isValidPhone(value)) {
                            errors.push({
                                field: input.name || input.id,
                                message: 'Format de téléphone invalide',
                                element: input
                            });
                            input.classList.add('error');
                        }
                        break;
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    },
    
    /**
     * Soumission de formulaire avec validation
     */
    submit: async (formElement, submitUrl, options = {}) => {
        const validation = FormManager.validate(formElement);
        
        if (!validation.isValid) {
            Utils.log('Validation échouée', 'warn', validation.errors);
            return { success: false, errors: validation.errors };
        }
        
        try {
            const formData = new FormData(formElement);
            const jsonData = Object.fromEntries(formData);
            
            const response = await fetch(submitUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: JSON.stringify(jsonData)
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            Utils.log('Formulaire soumis avec succès', 'info', result);
            
            return { success: true, data: result };
            
        } catch (error) {
            Utils.log('Erreur lors de la soumission', 'error', error);
            return { success: false, error: error.message };
        }
    }
};

/**
 * Gestionnaire de thèmes
 */
const ThemeManager = {
    current: 'default',
    
    themes: {
        default: {
            name: 'Défaut',
            primary: '#2E86AB',
            secondary: '#A23B72',
            accent: '#F18F01'
        },
        dark: {
            name: 'Sombre',
            primary: '#1a2332',
            secondary: '#2E86AB',
            accent: '#F18F01'
        },
        corporate: {
            name: 'Corporate',
            primary: '#003366',
            secondary: '#0066CC',
            accent: '#FF6600'
        }
    },
    
    /**
     * Application d'un thème
     */
    apply: (themeName) => {
        const theme = ThemeManager.themes[themeName];
        if (!theme) {
            Utils.log(`Thème '${themeName}' non trouvé`, 'warn');
            return false;
        }
        
        const root = document.documentElement;
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--accent-color', theme.accent);
        
        ThemeManager.current = themeName;
        localStorage.setItem('presenta-agent-theme', themeName);
        
        Utils.log(`Thème '${themeName}' appliqué`, 'info');
        return true;
    },
    
    /**
     * Chargement du thème sauvegardé
     */
    loadSaved: () => {
        const saved = localStorage.getItem('presenta-agent-theme');
        if (saved && ThemeManager.themes[saved]) {
            ThemeManager.apply(saved);
        }
    }
};

/**
 * Gestionnaire d'événements globaux
 */
const EventManager = {
    listeners: new Map(),
    
    /**
     * Ajout d'un écouteur d'événement
     */
    on: (eventName, callback, element = document) => {
        if (!EventManager.listeners.has(eventName)) {
            EventManager.listeners.set(eventName, []);
        }
        
        const listener = { callback, element };
        EventManager.listeners.get(eventName).push(listener);
        
        element.addEventListener(eventName, callback);
        
        return () => {
            element.removeEventListener(eventName, callback);
            const listeners = EventManager.listeners.get(eventName);
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        };
    },
    
    /**
     * Déclenchement d'un événement personnalisé
     */
    emit: (eventName, detail = null, element = document) => {
        const event = new CustomEvent(eventName, { detail });
        element.dispatchEvent(event);
    }
};

/**
 * Utilitaires spécifiques Li-CUBE PRO
 */
const LiCubeUtils = {
    
    /**
     * Calcul de l'amélioration en pourcentage
     */
    calculateImprovement: (oldValue, newValue) => {
        const improvement = ((newValue - oldValue) / oldValue) * 100;
        return {
            percent: improvement,
            isImprovement: improvement > 0,
            formatted: `${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`
        };
    },
    
    /**
     * Conversion des spécifications en format affichable
     */
    formatSpecs: (specs) => {
        const formatted = {};
        
        Object.entries(specs).forEach(([category, values]) => {
            formatted[category] = {};
            Object.entries(values).forEach(([key, value]) => {
                let formattedValue = value;
                
                // Formatage spécifique par type
                if (key.includes('weight') || key.includes('poids')) {
                    formattedValue = `${value} kg`;
                } else if (key.includes('temperature') || key.includes('temp')) {
                    formattedValue = typeof value === 'string' ? value : `${value}°C`;
                } else if (key.includes('voltage') || key.includes('tension')) {
                    formattedValue = `${value}V`;
                } else if (key.includes('capacity') || key.includes('capacite')) {
                    formattedValue = `${value}Ah`;
                } else if (key.includes('efficiency') || key.includes('efficacite')) {
                    formattedValue = `${value}%`;
                }
                
                formatted[category][key] = formattedValue;
            });
        });
        
        return formatted;
    },
    
    /**
     * Génération d'un rapport de comparaison
     */
    generateComparisonReport: (lfpSpecs, nicdSpecs) => {
        const report = [];
        const categories = Object.keys(lfpSpecs);
        
        categories.forEach(category => {
            const lfpValues = lfpSpecs[category];
            const nicdValues = nicdSpecs[category] || {};
            
            Object.keys(lfpValues).forEach(key => {
                if (nicdValues[key]) {
                    const lfpValue = parseFloat(lfpValues[key]);
                    const nicdValue = parseFloat(nicdValues[key]);
                    
                    if (!isNaN(lfpValue) && !isNaN(nicdValue)) {
                        const improvement = LiCubeUtils.calculateImprovement(nicdValue, lfpValue);
                        report.push({
                            category,
                            metric: key,
                            lfp: lfpValues[key],
                            nicd: nicdValues[key],
                            improvement
                        });
                    }
                }
            });
        });
        
        return report;
    }
};

/**
 * Initialisation globale
 */
const init = async () => {
    Utils.log('Initialisation PRESENTA-AGENT', 'info');
    
    // Chargement du thème sauvegardé
    ThemeManager.loadSaved();
    
    // Chargement du manifest
    try {
        await ManifestManager.load();
    } catch (error) {
        Utils.log('Impossible de charger le manifest, continuation sans données', 'warn');
    }
    
    // Configuration du mode debug selon l'URL
    const urlParams = new URLSearchParams(window.location.search);
    PRESENTA_AGENT.debug = urlParams.has('debug');
    
    // Setup des animations au scroll
    const scrollObserver = AnimationManager.createScrollObserver();
    document.querySelectorAll('[data-animate]').forEach(el => {
        scrollObserver.observe(el);
    });
    
    Utils.log('Initialisation terminée', 'info');
};

// Auto-initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export pour utilisation globale
window.PresentaAgent = {
    Utils,
    ManifestManager,
    TCOCalculator,
    AnimationManager,
    FormManager,
    ThemeManager,
    EventManager,
    LiCubeUtils,
    config: PRESENTA_AGENT
};
/**
 * =================================================================
 * REMPLACEUR DE VALEURS HARDCODÉES - OUTIL AUTOMATISÉ  
 * =================================================================
 * 
 * Rôle : Script automatisé pour remplacer tous les chiffres hardcodés
 *        par des variables dynamiques avec binding data-pricing-value
 * 
 * Fonctionnalités :
 * - Détection automatique des chiffres dans le HTML
 * - Mapping vers variables GLOBALS appropriées
 * - Remplacement avec préservation du formatage
 * - Ajout automatique des attributs de binding
 * - Traçabilité complète des changements
 * 
 * Utilisation :
 *   const replacer = new HardcodedReplacer();
 *   replacer.processDocument();
 * 
 * @author Claude Code - EDS Québec  
 * @version 2.0.0
 * @licence Propriétaire EDS Québec
 */

/**
 * Classe principale pour le remplacement des valeurs hardcodées
 * Scanne et remplace automatiquement tous les chiffres détectés
 */
class HardcodedReplacer {
    constructor(globalsManager) {
        this.globalsManager = globalsManager;
        this.replacements = new Map(); // Traçabilité des remplacements
        this.statistics = {
            totalScanned: 0,
            totalReplaced: 0,
            errors: 0,
            duplicatesFound: 0
        };

        // Règles de mapping : valeur hardcodée → variable GLOBALS
        this.mappingRules = this.initializeMappingRules();
        
        // Patterns de détection des chiffres à remplacer
        this.numberPatterns = [
            // Chiffres avec unités courantes
            /(\d+(?:\.\d+)?)\s*(kg|Wh|V|A|°C|mm|ans?|cycles?|h|%)/g,
            // Montants monétaires
            /(\d+(?:[,\s]\d{3})*(?:\.\d{2})?)\s*(CAD|USD|\$)/g,
            // Pourcentages standalone
            /(\d+(?:\.\d+)?)\s*%/g,
            // Nombres simples dans contexte technique
            /(?:≥|≈|~|±)?\s*(\d+(?:\.\d+)?)/g
        ];

        console.log('🔧 HardcodedReplacer : Instance créée');
    }

    /**
     * Initialise les règles de mapping valeur → variable
     * Définit la correspondance entre chiffres détectés et chemins GLOBALS
     * 
     * @returns {Map} Map des règles de correspondance
     */
    initializeMappingRules() {
        const rules = new Map();

        // === RÈGLES LI-CUBE PRO™ ===
        
        // Énergie et capacité
        rules.set('2688', 'licube.energy_total_wh');    // 2688 Wh (corrigé depuis 2520)
        rules.set('2520', 'licube.energy_total_wh');    // Ancienne valeur à corriger
        rules.set('117', 'licube.energy_density_wh_per_kg'); // 117 Wh/kg
        rules.set('105', 'licube.capacity_ah');         // 105 Ah
        rules.set('25.6', 'licube.voltage_nominal_v');  // 25.6V

        // Physique et dimensions
        rules.set('23', 'licube.weight_kg');            // 23 kg
        rules.set('71', 'licube.weight_reduction_percentage'); // -71%
        rules.set('420', 'licube.dimensions_mm.0');     // 420mm (longueur)
        rules.set('240', 'licube.dimensions_mm.1');     // 240mm (largeur) 
        rules.set('155', 'licube.dimensions_mm.2');     // 155mm (hauteur)

        // Performance et durabilité
        rules.set('8000', 'licube.cycle_life_at_80dod'); // ≥8000 cycles
        rules.set('96', 'licube.efficiency_pct');        // 96% efficacité
        rules.set('10', 'licube.warranty_years');        // 10 ans garantie

        // Courants et tensions
        rules.set('105', 'licube.discharge_current_cont_a'); // 105A décharge continue
        rules.set('210', 'licube.discharge_current_peak_10s_a'); // 210A pic 10s
        rules.set('80', 'licube.charge_current_recommended_a'); // 80A charge recommandée
        rules.set('100', 'licube.charge_current_max_a'); // 100A charge max

        // === RÈGLES NI-CD TRADITIONNELLES ===
        
        // Énergie et capacité  
        rules.set('2400', 'nicd.energy_total_wh');      // 2400 Wh
        rules.set('30', 'nicd.energy_density_wh_per_kg'); // ≈30 Wh/kg
        rules.set('100', 'nicd.capacity_ah');           // 100 Ah (si contexte Ni-Cd)
        rules.set('24', 'nicd.voltage_nominal_v');      // 24V (si contexte Ni-Cd)

        // Physique et dimensions
        rules.set('80', 'nicd.weight_kg');              // ~80 kg
        rules.set('600', 'nicd.dimensions_mm.0');       // 600mm (longueur)
        rules.set('500', 'nicd.dimensions_mm.1');       // 500mm (largeur)
        rules.set('300', 'nicd.dimensions_mm.2');       // 300mm (hauteur)

        // Performance et maintenance
        rules.set('1500', 'nicd.cycle_life_typical');   // 1500 cycles (à corriger → 2500)
        rules.set('2500', 'nicd.cycle_life_typical');   // 2500 cycles (valeur correcte)
        rules.set('2', 'nicd.maintenance_visits_per_year'); // 2 visites/an
        rules.set('8', 'nicd.charge_time_hours.0');     // 8-12h (min)
        rules.set('12', 'nicd.charge_time_hours.1');    // 8-12h (max)

        // === RÈGLES CALCULS TCO ===
        
        // Coûts sur 20 ans (dynamiques selon mode)
        rules.set('2500', 'calculations.tco_[MODE].licube.total_20_years');
        rules.set('45000', 'calculations.tco_[MODE].nicd.total_20_years');
        rules.set('42500', 'calculations.tco_[MODE].savings.total');

        // Pourcentages d'économies (calculés dynamiquement)
        rules.set('90', 'calculations.tco_[MODE].savings.percentage');  // Badge vente
        rules.set('95', 'calculations.tco_[MODE].savings.percentage');  // Badge location
        rules.set('94.4', 'calculations.tco_[MODE].savings.percentage'); // Calcul exact

        console.log(`📋 ${rules.size} règles de mapping initialisées`);
        return rules;
    }

    /**
     * Traite un document entier pour remplacer les valeurs hardcodées
     * Point d'entrée principal de la classe
     * 
     * @returns {Object} Statistiques des remplacements effectués
     */
    processDocument() {
        console.log('🚀 Début du traitement document...');

        try {
            // Étape 1 : Traitement des badges d'économies (cas spéciaux)
            this.processSavingsBadges();

            // Étape 2 : Traitement des éléments avec data-pricing-value existants
            this.processExistingPricingElements();

            // Étape 3 : Scan et traitement des valeurs hardcodées restantes
            this.scanAndReplaceHardcodedValues();

            // Étape 4 : Application des corrections validées
            this.applyValidatedCorrections();

            // Étape 5 : Génération du rapport
            this.generateReport();

            console.log('✅ Traitement document terminé avec succès');
            return this.statistics;

        } catch (error) {
            console.error('❌ Erreur durant le traitement document:', error);
            this.statistics.errors++;
            return this.statistics;
        }
    }

    /**
     * Traite spécifiquement les badges d'économies (90%, 95%)
     * Remplace par un calcul dynamique basé sur le mode
     */
    processSavingsBadges() {
        // Sélecteurs pour les badges d'économies
        const badgeSelectors = [
            '.performance-badge',
            '.savings-badge', 
            '.economy-badge',
            '[class*="econom"]',
            '[class*="saving"]'
        ];

        badgeSelectors.forEach(selector => {
            const badges = document.querySelectorAll(selector);
            
            badges.forEach(badge => {
                const text = badge.textContent || badge.innerHTML;
                
                // Détection des patterns de pourcentage d'économies
                const economyPatterns = [
                    /(\d+)\s*%\s*(ÉCONOMIES?|SAVINGS?)/i,
                    /(ÉCONOMIES?|SAVINGS?)\s*(\d+)\s*%/i
                ];

                for (const pattern of economyPatterns) {
                    const match = text.match(pattern);
                    if (match) {
                        const percentage = match[1] || match[2];
                        
                        // Remplacement par binding dynamique
                        const mode = this.globalsManager?.mode || 'vente';
                        const variablePath = `calculations.tco_${mode}.savings.percentage`;
                        
                        badge.setAttribute('data-pricing-value', variablePath);
                        badge.setAttribute('data-pricing-format', 'percentage');
                        badge.innerHTML = text.replace(pattern, 
                            `<span data-pricing-value="${variablePath}" data-pricing-format="number">—</span>% ${match[2] || match[1]}`
                        );

                        this.recordReplacement(percentage + '%', variablePath, badge, 'badge économies');
                        console.log(`🎯 Badge économies: ${percentage}% → dynamique (${mode})`);
                        break;
                    }
                }
            });
        });
    }

    /**
     * Traite les éléments ayant déjà un data-pricing-value
     * Met à jour leur contenu sans modifier les attributs
     */
    processExistingPricingElements() {
        const existingElements = document.querySelectorAll('[data-pricing-value]');
        console.log(`🔗 Traitement de ${existingElements.length} éléments avec data-pricing-value`);

        existingElements.forEach((element, index) => {
            const variablePath = element.getAttribute('data-pricing-value');
            const format = element.getAttribute('data-pricing-format') || 'number';
            
            // Adaptation du chemin pour le mode actuel
            const adaptedPath = this.adaptVariablePathToMode(variablePath);
            
            if (adaptedPath !== variablePath) {
                element.setAttribute('data-pricing-value', adaptedPath);
                console.log(`📝 Path adapté: ${variablePath} → ${adaptedPath}`);
            }

            // Mise à jour du contenu via GlobalsManager
            if (this.globalsManager?.isInitialized) {
                this.globalsManager.bindElement(element);
            }

            this.statistics.totalScanned++;
        });
    }

    /**
     * Scanne le document pour détecter et remplacer les valeurs hardcodées
     * Utilise les patterns de détection et règles de mapping
     */
    scanAndReplaceHardcodedValues() {
        console.log('🔍 Scan des valeurs hardcodées...');

        // Éléments à scanner (exclusion des scripts et styles)
        const textElements = document.querySelectorAll('p, span, div, td, th, li, h1, h2, h3, h4, h5, h6');
        
        textElements.forEach(element => {
            // Ignorer les éléments déjà traités ou spéciaux
            if (this.shouldSkipElement(element)) {
                return;
            }

            const originalText = element.textContent;
            let modifiedText = originalText;
            let hasReplacements = false;

            // Application des patterns de détection
            this.numberPatterns.forEach(pattern => {
                modifiedText = modifiedText.replace(pattern, (match, number, unit) => {
                    const cleanNumber = number.replace(/[,\s]/g, ''); // Nettoyage des séparateurs
                    const variablePath = this.findVariableForValue(cleanNumber, element, unit);

                    if (variablePath) {
                        hasReplacements = true;
                        
                        // Création du span avec binding
                        const bindingSpan = this.createBindingSpan(variablePath, unit);
                        this.recordReplacement(match, variablePath, element, 'scan automatique');
                        
                        return bindingSpan;
                    }

                    return match; // Pas de remplacement trouvé
                });
            });

            // Application des modifications si nécessaire
            if (hasReplacements && modifiedText !== originalText) {
                element.innerHTML = modifiedText;
                element.classList.add('hardcoded-replaced');
                this.statistics.totalReplaced++;
                
                console.log(`✅ Remplacements dans: ${element.tagName}.${element.className}`);
            }

            this.statistics.totalScanned++;
        });
    }

    /**
     * Détermine si un élément doit être ignoré lors du scan
     * 
     * @param {HTMLElement} element - Élément à vérifier
     * @returns {boolean} True si l'élément doit être ignoré
     */
    shouldSkipElement(element) {
        // Classes ou attributs à ignorer
        const skipClasses = ['globals-bound', 'globals-error', 'hardcoded-replaced', 'no-replace'];
        const skipAttributes = ['data-pricing-value', 'contenteditable'];
        
        // Vérification des classes
        if (skipClasses.some(cls => element.classList.contains(cls))) {
            return true;
        }

        // Vérification des attributs
        if (skipAttributes.some(attr => element.hasAttribute(attr))) {
            return true;
        }

        // Ignorer les éléments parents de scripts ou styles
        if (element.closest('script, style, noscript')) {
            return true;
        }

        // Ignorer les éléments CSS (couleurs hex, etc.)
        const text = element.textContent;
        if (/^#[0-9A-Fa-f]{3,8}$/.test(text.trim())) {
            return true;
        }

        return false;
    }

    /**
     * Trouve la variable appropriée pour une valeur numérique
     * 
     * @param {string} value - Valeur numérique à mapper
     * @param {HTMLElement} context - Contexte de l'élément
     * @param {string} unit - Unité associée (optionnelle)
     * @returns {string|null} Chemin de la variable ou null
     */
    findVariableForValue(value, context = null, unit = '') {
        // Recherche directe dans les règles
        let variablePath = this.mappingRules.get(value);

        if (!variablePath) {
            // Recherche contextuelle basée sur l'élément parent
            variablePath = this.findVariableByContext(value, context, unit);
        }

        if (variablePath) {
            // Adaptation du chemin pour le mode actuel
            return this.adaptVariablePathToMode(variablePath);
        }

        return null;
    }

    /**
     * Recherche contextuelle d'une variable basée sur le DOM environnant
     * 
     * @param {string} value - Valeur à mapper
     * @param {HTMLElement} context - Élément contexte
     * @param {string} unit - Unité
     * @returns {string|null} Chemin de la variable trouvée
     */
    findVariableByContext(value, context, unit) {
        if (!context) return null;

        // Analyse du contexte textuel (parents et siblings)
        const contextText = this.getContextualText(context).toLowerCase();
        
        // Règles contextuelles basées sur les mots-clés
        const contextRules = [
            // Li-CUBE PRO™
            { keywords: ['licube', 'lifep04', 'lithium'], prefix: 'licube' },
            { keywords: ['ni-cd', 'nicd', 'nickel'], prefix: 'nicd' },
            { keywords: ['tco', 'cout', 'économie', 'saving'], prefix: 'calculations' },
            
            // Types de mesures
            { keywords: ['poids', 'weight', 'kg'], suffix: 'weight_kg' },
            { keywords: ['cycle', 'durée', 'life'], suffix: 'cycle_life' },
            { keywords: ['énergie', 'energy', 'wh'], suffix: 'energy_total_wh' },
            { keywords: ['densité', 'density'], suffix: 'energy_density_wh_per_kg' },
            { keywords: ['tension', 'voltage', 'volt'], suffix: 'voltage_nominal_v' },
            { keywords: ['capacité', 'capacity', 'ah'], suffix: 'capacity_ah' },
            { keywords: ['dimension', 'taille', 'size', 'mm'], suffix: 'dimensions_mm' }
        ];

        // Application des règles contextuelles
        let bestMatch = null;
        let confidence = 0;

        contextRules.forEach(rule => {
            const matchCount = rule.keywords.filter(keyword => 
                contextText.includes(keyword)
            ).length;

            if (matchCount > confidence) {
                confidence = matchCount;
                
                if (rule.prefix && rule.suffix) {
                    bestMatch = `${rule.prefix}.${rule.suffix}`;
                } else if (rule.prefix) {
                    bestMatch = this.findBestFieldForPrefix(rule.prefix, value, unit);
                } else if (rule.suffix) {
                    bestMatch = this.findBestPrefixForSuffix(rule.suffix, value, contextText);
                }
            }
        });

        return bestMatch;
    }

    /**
     * Extrait le texte contextuel autour d'un élément
     * 
     * @param {HTMLElement} element - Élément de référence
     * @returns {string} Texte contextuel agrégé
     */
    getContextualText(element) {
        let contextText = '';

        // Texte de l'élément parent
        const parent = element.closest('tr, .spec-row, .metric, .card, section');
        if (parent) {
            contextText += parent.textContent + ' ';
        }

        // Texte des éléments siblings
        const siblings = element.parentNode?.children || [];
        for (const sibling of siblings) {
            if (sibling !== element) {
                contextText += sibling.textContent + ' ';
            }
        }

        return contextText;
    }

    /**
     * Adapte le chemin d'une variable au mode actuel (vente/location)
     * 
     * @param {string} path - Chemin de variable
     * @returns {string} Chemin adapté au mode
     */
    adaptVariablePathToMode(path) {
        if (!path || !this.globalsManager) return path;

        const mode = this.globalsManager.mode || 'vente';
        
        // Remplacement du placeholder [MODE]
        return path.replace(/\[MODE\]/g, mode);
    }

    /**
     * Crée un span avec les attributs de binding appropriés
     * 
     * @param {string} variablePath - Chemin de la variable
     * @param {string} unit - Unité (optionnelle)
     * @returns {string} HTML du span généré
     */
    createBindingSpan(variablePath, unit = '') {
        const formatType = this.determineFormatType(variablePath, unit);
        const suffix = unit && !['currency', 'percentage'].includes(formatType) ? unit : '';

        return `<span data-pricing-value="${variablePath}" data-pricing-format="${formatType}"${suffix ? ` data-pricing-suffix="${suffix}"` : ''}>—</span>`;
    }

    /**
     * Détermine le type de formatage approprié
     * 
     * @param {string} path - Chemin de la variable
     * @param {string} unit - Unité
     * @returns {string} Type de formatage
     */
    determineFormatType(path, unit) {
        if (path.includes('savings') && path.includes('percentage')) return 'percentage';
        if (path.includes('total') && path.includes('20_years')) return 'currency';
        if (unit === '%') return 'percentage';
        if (unit === 'CAD' || unit === '$') return 'currency';
        if (unit === 'kg') return 'weight';
        if (unit === 'V') return 'voltage';
        if (unit === 'Wh') return 'energy';
        
        return 'number';
    }

    /**
     * Applique les corrections validées dans les propositions
     * Met à jour les valeurs selon les validations approuvées
     */
    applyValidatedCorrections() {
        console.log('🔧 Application des corrections validées...');

        const corrections = [
            // [A] Énergie totale Li-CUBE PRO™
            {
                from: '2520',
                to: '2688',
                variable: 'licube.energy_total_wh',
                reason: 'Cohérence mathématique 25.6V × 105Ah'
            },
            
            // [B] Durée de vie Ni-Cd  
            {
                from: '1500',
                to: '2500',
                variable: 'nicd.cycle_life_typical',
                reason: 'Alignement sur référence documentaire'
            }
        ];

        corrections.forEach(correction => {
            const elements = document.querySelectorAll(`[data-pricing-value="${correction.variable}"]`);
            
            elements.forEach(element => {
                if (this.globalsManager?.isInitialized) {
                    this.globalsManager.bindElement(element);
                    
                    console.log(`✅ Correction appliquée: ${correction.from} → ${correction.to} (${correction.reason})`);
                    this.recordReplacement(correction.from, correction.variable, element, correction.reason);
                }
            });
        });
    }

    /**
     * Enregistre un remplacement pour la traçabilité
     * 
     * @param {string} oldValue - Ancienne valeur
     * @param {string} variablePath - Chemin de la variable
     * @param {HTMLElement} element - Élément concerné
     * @param {string} method - Méthode de détection
     */
    recordReplacement(oldValue, variablePath, element, method) {
        const replacement = {
            oldValue,
            variablePath,
            element: {
                tagName: element.tagName,
                className: element.className,
                id: element.id
            },
            method,
            timestamp: new Date().toISOString()
        };

        this.replacements.set(`${oldValue}-${Date.now()}`, replacement);
    }

    /**
     * Génère un rapport complet des remplacements effectués
     * 
     * @returns {Object} Rapport détaillé
     */
    generateReport() {
        const report = {
            statistics: { ...this.statistics },
            replacements: Array.from(this.replacements.values()),
            timestamp: new Date().toISOString(),
            mode: this.globalsManager?.mode || 'unknown'
        };

        console.log('📊 Rapport de remplacement généré:', report);
        
        // Stockage local pour consultation
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('hardcoded-replacement-report', JSON.stringify(report));
        }

        return report;
    }

    /**
     * Méthodes utilitaires pour recherche contextuelle avancée
     */

    findBestFieldForPrefix(prefix, value, unit) {
        // À implémenter selon les besoins spécifiques
        return `${prefix}.unknown_field`;
    }

    findBestPrefixForSuffix(suffix, value, contextText) {
        // Détermination du préfixe basée sur le contexte
        if (contextText.includes('licube')) return `licube.${suffix}`;
        if (contextText.includes('nicd')) return `nicd.${suffix}`;
        return `unknown.${suffix}`;
    }
}

/**
 * Fonction d'initialisation globale
 * Lance le processus de remplacement une fois GlobalsManager prêt
 */
function initializeHardcodedReplacer() {
    // Attendre que GlobalsManager soit prêt
    window.addEventListener('globals-ready', (event) => {
        const globalsManager = event.detail.manager;
        
        console.log('🔄 Initialisation HardcodedReplacer...');
        
        const replacer = new HardcodedReplacer(globalsManager);
        const results = replacer.processDocument();
        
        console.log('✅ HardcodedReplacer terminé:', results);
        
        // Event de fin de traitement
        window.dispatchEvent(new CustomEvent('hardcoded-replacement-complete', {
            detail: { results, replacer }
        }));
    });
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', initializeHardcodedReplacer);

/**
 * Export pour utilisation moderne
 */
export { HardcodedReplacer };

/**
 * Disponibilité globale pour compatibilité legacy
 */
window.HardcodedReplacer = HardcodedReplacer;